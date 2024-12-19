import xml.etree.ElementTree as ET
import subprocess
import os
from datetime import datetime

def process_junit_report(input_path, output_path):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file {input_path} does not exist.")
    
    tree = ET.parse(input_path)
    root = tree.getroot()

    # Crear un nuevo reporte con `test.describe` como casos principales
    new_root = ET.Element('testsuites')

    for testsuite in root.findall('testsuite'):
        new_testsuite = ET.SubElement(new_root, 'testsuite', attrib=testsuite.attrib)
        test_describe_cases = {}

        for testcase in testsuite.findall('testcase'):
            # Separar el nombre en `test.describe` y el nombre del paso
            name_parts = testcase.attrib['name'].split(' › ')  # Divisor utilizado en Playwright
            if len(name_parts) > 1:
                describe_name = name_parts[0].strip()
                step_name = name_parts[1].strip()

                # Crear o reutilizar un caso basado en `test.describe`
                if describe_name not in test_describe_cases:
                    test_describe = ET.SubElement(new_testsuite, 'testcase', {
                        'name': describe_name,
                        'classname': testcase.attrib.get('classname', ''),
                        'time': testcase.attrib.get('time', '0')
                    })
                    steps = ET.SubElement(test_describe, 'steps')
                    test_describe_cases[describe_name] = steps
                
                # Agregar el paso dentro del `test.describe`
                steps = test_describe_cases[describe_name]
                step = ET.SubElement(steps, 'step', {'name': step_name})
                for child in testcase:
                    step.append(child)  # Copiar contenido de pasos (errores, salidas, etc.)
                
            else:
                # Si no hay " › ", mantener el testcase como está
                new_testsuite.append(testcase)

    # Guardar el nuevo archivo procesado
    new_tree = ET.ElementTree(new_root)
    new_tree.write(output_path, encoding='utf-8', xml_declaration=True)
    print(f"Processed JUnit report saved to {output_path}")

# Leer el archivo procesado y generar comentarios
def extract_comments_from_report(report_path):
    if not os.path.exists(report_path):
        raise FileNotFoundError(f"Processed report file {report_path} does not exist.")
    
    tree = ET.parse(report_path)
    root = tree.getroot()
    comments = []

    for testsuite in root.findall('testsuite'):
        for testcase in testsuite.findall('testcase'):
            describe_name = testcase.attrib.get('name', 'Unnamed Test')
            steps = testcase.find('steps')
            comments.append(f"Test Case: {describe_name}")
            if steps is not None:
                for step in steps.findall('step'):
                    step_name = step.attrib.get('name', 'Unnamed Step')
                    comments.append(f" - Step: {step_name}")
            comments.append("")  # Espaciado entre casos

    return "\n".join(comments)

# Procesar el reporte JUnit
input_path = './test-results/junit-report.xml'
output_path = './test-results/processed-junit-report.xml'

try:
    process_junit_report(input_path, output_path)
except FileNotFoundError as e:
    print(str(e))
    exit(1)

# Generar el comentario
try:
    comments = extract_comments_from_report(output_path)
except FileNotFoundError as e:
    print(str(e))
    exit(1)

# Crear un título dinámico
current_time = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")  # Formato: YYYY-MM-DD_HH-MM-SS
dynamic_title = f"Playwright Automated Test Run {current_time}"

# Subir a TestRail usando trcli
try:
    subprocess.run([ 
        "C:\\Users\\sofiamartínezlópez\\AppData\\Roaming\\Python\\Python312\\Scripts\\trcli", "-y",
        "-h", "https://leveltestautomation.testrail.io",
        "-u", "sofiainkoova@gmail.com",
        "-p", "TestRail1!",
        "--project", "Level",
        "parse_junit",
        "-f", output_path,
        "--title", dynamic_title  # Usar el título dinámico aquí
    ], check=True)

    print("Results successfully uploaded to TestRail.")
except subprocess.CalledProcessError as e:
    print(f"Failed to upload results to TestRail: {e}")
    exit(1)
