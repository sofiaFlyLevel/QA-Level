import os
import shutil
import xml.etree.ElementTree as ET
import subprocess
from datetime import datetime

def update_junit_report(input_path, external_dir):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file {input_path} does not exist.")

    # Crear el directorio externo si no existe
    if not os.path.exists(external_dir):
        os.makedirs(external_dir)

    # Definir la ruta del archivo de destino
    output_path = os.path.join(external_dir, "junit-report.xml")

    # Si el archivo de destino no existe o está vacío, copiar el archivo de entrada
    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        shutil.copy(input_path, output_path)
        print(f"El archivo {output_path} no existía o estaba vacío. Se copió directamente desde {input_path}.")
        return output_path

    # Intentar analizar el archivo existente
    try:
        existing_tree = ET.parse(output_path)
        existing_root = existing_tree.getroot()
    except ET.ParseError:
        print(f"El archivo {output_path} no es un XML válido. Se reemplazará con {input_path}.")
        shutil.copy(input_path, output_path)
        return output_path

    # Analizar el nuevo reporte JUnit
    new_tree = ET.parse(input_path)
    new_root = new_tree.getroot()

    # Bandera para rastrear si se hicieron actualizaciones
    updated = False

    # Fusionar o actualizar los casos de prueba
    for new_testsuite in new_root.findall("testsuite"):
        existing_testsuite = existing_root.find(f".//testsuite[@name='{new_testsuite.attrib['name']}']")
        if existing_testsuite is None:
            existing_root.append(new_testsuite)
            updated = True
        else:
            for new_testcase in new_testsuite.findall("testcase"):
                existing_testcase = existing_testsuite.find(f".//testcase[@name='{new_testcase.attrib['name']}']")
                if existing_testcase is None:
                    existing_testsuite.append(new_testcase)
                    updated = True
                else:
                    if not ET.tostring(existing_testcase, encoding='utf-8') == ET.tostring(new_testcase, encoding='utf-8'):
                        existing_testsuite.remove(existing_testcase)
                        existing_testsuite.append(new_testcase)
                        updated = True

    # Guardar el contenido actualizado si hubo cambios
    if updated:
        existing_tree.write(output_path, encoding="utf-8", xml_declaration=True)
        print(f"Reporte JUnit actualizado guardado en {output_path}")
    else:
        print("No se detectaron actualizaciones. El reporte JUnit ya estaba al día.")

    return output_path


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
            name_parts = testcase.attrib['name'].split(' › ')  # Separador usado en Playwright
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
                
                # Agregar el paso dentro de `test.describe`
                steps = test_describe_cases[describe_name]
                step = ET.SubElement(steps, 'step', {'name': step_name})
                for child in testcase:
                    step.append(child)  # Copiar contenido del paso (errores, salidas, etc.)
                
            else:
                # Si no contiene " › ", mantener el caso de prueba tal como está
                new_testsuite.append(testcase)

    # Guardar el nuevo archivo procesado
    new_tree = ET.ElementTree(new_root)
    new_tree.write(output_path, encoding='utf-8', xml_declaration=True)
    print(f"Reporte JUnit procesado guardado en {output_path}")


# Script principal
input_path = './test-results/junit-report.xml'
external_dir = './external-test-reports'

try:
    # Paso 1: Actualizar el reporte JUnit
    updated_path = update_junit_report(input_path, external_dir)

    # Paso 2: Procesar el reporte actualizado
    dynamic_name = input("Ingrese un nombre para el archivo de salida procesado (por defecto: marca de tiempo actual): ")
    if not dynamic_name.strip():
        dynamic_name = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

    processed_output_path = f"./test-results/processed-junit-report-{dynamic_name}.xml"
    process_junit_report(updated_path, processed_output_path)

    # Paso 3: Preguntar si se desea subir a TestRail
    upload_to_testrail = input("¿Desea subir los resultados a TestRail? (yes/no): ").strip().lower()

    if upload_to_testrail == 'yes':
        subprocess.run([
            "C:\\Users\\sofiamartínezlópez\\AppData\\Roaming\\Python\\Python312\\Scripts\\trcli", "-y",
            "-h", "https://leveltestautomation.testrail.io",
            "-u", "sofiainkoova@gmail.com",
            "-p", "TestRail1!",
            "--project", "Level",
            "parse_junit",
            "-f", processed_output_path,
            "--title", f"{dynamic_name}"
        ], check=True)
        print("Resultados subidos exitosamente a TestRail.")
    else:
        print("Los resultados no fueron subidos a TestRail.")

except FileNotFoundError as e:
    print(str(e))
    exit(1)
except subprocess.CalledProcessError as e:
    print(f"Fallo al subir los resultados a TestRail: {e}")
    exit(1)
