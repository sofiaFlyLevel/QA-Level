import os
import shutil
import xml.etree.ElementTree as ET
import subprocess
from datetime import datetime
import json
import tempfile
import time

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


def create_junit_html_report(xml_path, html_output_path):
    """
    Convierte un archivo JUnit XML en un informe HTML avanzado con gráficos y desglose interactivo.
    """
    if not os.path.exists(xml_path):
        raise FileNotFoundError(f"Archivo XML no encontrado: {xml_path}")
    
    # Parsear el XML
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    # Calcular estadísticas generales
    total_testsuites = len(root.findall('testsuite'))
    total_testcases = 0
    total_failures = 0
    total_errors = 0
    total_skipped = 0
    
    # Recopilar datos para el gráfico
    suite_data = []
    
    for testsuite in root.findall('testsuite'):
        suite_name = testsuite.get('name', 'Unnamed Test Suite')
        testcases = testsuite.findall('testcase')
        total_testcases += len(testcases)
        
        suite_passed = 0
        suite_failed = 0
        suite_error = 0
        suite_skipped = 0
        
        for testcase in testcases:
            if testcase.find('failure') is not None:
                total_failures += 1
                suite_failed += 1
            elif testcase.find('error') is not None:
                total_errors += 1
                suite_error += 1
            elif testcase.find('skipped') is not None:
                total_skipped += 1
                suite_skipped += 1
            else:
                suite_passed += 1
        
        suite_data.append({
            'name': suite_name,
            'passed': suite_passed,
            'failed': suite_failed,
            'error': suite_error,
            'skipped': suite_skipped,
            'total': len(testcases)
        })
    
    total_passed = total_testcases - total_failures - total_errors - total_skipped
    
    # Iniciar la estructura HTML
    html = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LEVEL Booking - Informe de Pruebas</title>
    <!-- Chart.js para gráficos -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --primary-color: #2f5496;
            --secondary-color: #f0f4f8;
            --accent-color: #f39200;
            --text-color: #333;
            --light-text: #666;
            --border-color: #ddd;
            --success-color: #4caf50;
            --warning-color: #ff9800;
            --error-color: #f44336;
            --skipped-color: #9e9e9e;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        
        body {
            line-height: 1.6;
            color: var(--text-color);
            background-color: #f8f9fa;
        }
        
        .header {
            background-color: var(--primary-color);
            color: white;
            padding: 2rem 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 20px;
            background: linear-gradient(135deg, transparent 33.33%, white 33.33%, white 66.66%, transparent 66.66%);
            background-size: 20px 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        
        .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            overflow: hidden;
        }
        
        .card-header {
            background-color: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            font-weight: 600;
        }
        
        .card-body {
            padding: 1.5rem;
        }
        
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .stat-card {
            padding: 1.5rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .stat-card.total {
            background-color: #e9ecef;
        }
        
        .stat-card.passed {
            background-color: var(--success-color);
            color: white;
        }
        
        .stat-card.failed {
            background-color: var(--error-color);
            color: white;
        }
        
        .stat-card.skipped {
            background-color: var(--skipped-color);
            color: white;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .charts-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .chart-container {
            height: 300px;
            position: relative;
        }
        
        .filter-controls {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            background-color: #e9ecef;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 600;
        }
        
        .filter-btn:hover {
            background-color: #dee2e6;
        }
        
        .filter-btn.active {
            background-color: var(--primary-color);
            color: white;
        }
        
        .filter-btn.passed {
            background-color: var(--success-color);
            color: white;
        }
        
        .filter-btn.failed {
            background-color: var(--error-color);
            color: white;
        }
        
        .filter-btn.skipped {
            background-color: var(--skipped-color);
            color: white;
        }
        
        .testsuite-list {
            margin-top: 2rem;
        }
        
        .testsuite {
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .testsuite-header {
            background-color: #f8f9fa;
            padding: 1rem 1.5rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
        }
        
        .testsuite-name {
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        
        .testsuite-name::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 10px;
        }
        
        .testsuite-name.passed::before {
            background-color: var(--success-color);
        }
        
        .testsuite-name.has-failures::before {
            background-color: var(--error-color);
        }
        
        .testsuite-name.skipped::before {
            background-color: var(--skipped-color);
        }
        
        .testsuite-meta {
            font-size: 0.875rem;
            color: var(--light-text);
        }
        
        .testsuite-content {
            display: none;
            padding: 0;
        }
        
        .testcase {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border-color);
            transition: background-color 0.2s;
        }
        
        .testcase:hover {
            background-color: #f8f9fa;
        }
        
        .testcase:last-child {
            border-bottom: none;
        }
        
        .testcase-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }
        
        .testcase-name {
            font-weight: 500;
            display: flex;
            align-items: center;
        }
        
        .status-icon {
            display: inline-block;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            margin-right: 10px;
        }
        
        .status-icon.passed {
            background-color: var(--success-color);
        }
        
        .status-icon.failed {
            background-color: var(--error-color);
        }
        
        .status-icon.error {
            background-color: var(--error-color);
        }
        
        .status-icon.skipped {
            background-color: var(--skipped-color);
        }
        
        .testcase-duration {
            font-size: 0.875rem;
            color: var(--light-text);
        }
        
        .testcase-details {
            display: none;
            padding: 1rem 0 0 2rem;
            font-size: 0.875rem;
        }
        
        .testcase-classname {
            margin-bottom: 0.5rem;
            color: var(--light-text);
        }
        
        .testcase-failure, .testcase-error {
            margin-top: 0.5rem;
            padding: 1rem;
            background-color: #fff5f5;
            border-left: 4px solid var(--error-color);
            border-radius: 4px;
        }
        
        .testcase-skipped {
            margin-top: 0.5rem;
            padding: 1rem;
            background-color: #f5f5f5;
            border-left: 4px solid var(--skipped-color);
            border-radius: 4px;
        }
        
        .failure-message, .error-message, .skipped-message {
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .step-list {
            margin-top: 1rem;
        }
        
        .step {
            padding: 0.5rem;
            border-left: 2px solid #e9ecef;
            margin-bottom: 0.5rem;
        }
        
        .step:last-child {
            margin-bottom: 0;
        }
        
        .expand-icon {
            display: inline-block;
            width: 16px;
            height: 16px;
            text-align: center;
            line-height: 16px;
            transition: transform 0.2s;
        }
        
        .expanded .expand-icon {
            transform: rotate(90deg);
        }
        
        .progress-bar {
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 0.5rem;
            background-color: #e9ecef;
        }
        
        .progress-fill {
            height: 100%;
            display: flex;
        }
        
        .progress-segment {
            height: 100%;
        }
        
        .progress-segment.passed {
            background-color: var(--success-color);
        }
        
        .progress-segment.failed {
            background-color: var(--error-color);
        }
        
        .progress-segment.error {
            background-color: var(--error-color);
        }
        
        .progress-segment.skipped {
            background-color: var(--skipped-color);
        }
        
        .footer {
            text-align: center;
            padding: 1.5rem;
            background-color: var(--primary-color);
            color: white;
            margin-top: 3rem;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 10px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 0.5rem;
        }
        
        .badge.passed {
            background-color: var(--success-color);
            color: white;
        }
        
        .badge.failed {
            background-color: var(--error-color);
            color: white;
        }
        
        .badge.skipped {
            background-color: var(--skipped-color);
            color: white;
        }
        
        /* Animaciones */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LEVEL Booking - Informe de Pruebas</h1>
        <p>Resumen de resultados de las pruebas automatizadas</p>
    </div>
    
    <div class="container">
        <div class="card">
            <div class="card-header">
                Resumen General
            </div>
            <div class="card-body">
                <div class="summary-stats">
                    <div class="stat-card total">
                        <div class="stat-number">${total_testcases}</div>
                        <div class="stat-label">Total de Pruebas</div>
                    </div>
                    <div class="stat-card passed">
                        <div class="stat-number">${total_passed}</div>
                        <div class="stat-label">Pruebas Exitosas</div>
                    </div>
                    <div class="stat-card failed">
                        <div class="stat-number">${total_failures + total_errors}</div>
                        <div class="stat-label">Pruebas Fallidas</div>
                    </div>
                    <div class="stat-card skipped">
                        <div class="stat-number">${total_skipped}</div>
                        <div class="stat-label">Pruebas Omitidas</div>
                    </div>
                </div>
                
                <div class="charts-container">
                    <div class="chart-container">
                        <canvas id="overallResultsChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="testsuiteResultsChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                Resultados Detallados
            </div>
            <div class="card-body">
                <div class="filter-controls">
                    <button class="filter-btn active" data-filter="all">Todos</button>
                    <button class="filter-btn passed" data-filter="passed">Exitosos</button>
                    <button class="filter-btn failed" data-filter="failed">Fallidos</button>
                    <button class="filter-btn skipped" data-filter="skipped">Omitidos</button>
                </div>
"""
    
    # Añadir cada testsuite
    html += '<div class="testsuite-list">'
    
    for testsuite in root.findall('testsuite'):
        suite_name = testsuite.get('name', 'Unnamed Test Suite')
        suite_tests = int(testsuite.get('tests', '0'))
        suite_failures = int(testsuite.get('failures', '0'))
        suite_errors = int(testsuite.get('errors', '0'))
        suite_skipped = int(testsuite.get('skipped', '0'))
        suite_time = float(testsuite.get('time', '0'))
        
        suite_passed = suite_tests - suite_failures - suite_errors - suite_skipped
        
        # Determinar el estado del testsuite
        suite_status = "passed"
        if suite_failures > 0 or suite_errors > 0:
            suite_status = "has-failures"
        elif suite_passed == 0 and suite_skipped > 0:
            suite_status = "skipped"
        
        html += f"""
                <div class="testsuite" data-passed="{suite_passed}" data-failed="{suite_failures + suite_errors}" data-skipped="{suite_skipped}">
                    <div class="testsuite-header">
                        <div class="testsuite-name {suite_status}">
                            {suite_name}
                            <span class="badge passed">{suite_passed}</span>
                            {f'<span class="badge failed">{suite_failures + suite_errors}</span>' if suite_failures + suite_errors > 0 else ''}
                            {f'<span class="badge skipped">{suite_skipped}</span>' if suite_skipped > 0 else ''}
                        </div>
                        <div class="testsuite-meta">
                            {suite_time:.2f}s <span class="expand-icon">›</span>
                        </div>
                    </div>
                    <div class="testsuite-content">
                        <div class="progress-bar">
                            <div class="progress-fill">
                                {f'<div class="progress-segment passed" style="width: {suite_passed / suite_tests * 100}%;"></div>' if suite_passed > 0 else ''}
                                {f'<div class="progress-segment failed" style="width: {(suite_failures + suite_errors) / suite_tests * 100}%;"></div>' if suite_failures + suite_errors > 0 else ''}
                                {f'<div class="progress-segment skipped" style="width: {suite_skipped / suite_tests * 100}%;"></div>' if suite_skipped > 0 else ''}
                            </div>
                        </div>
"""
        
        # Añadir cada testcase
        for testcase in testsuite.findall('testcase'):
            case_name = testcase.get('name', 'Unnamed Test Case')
            case_class = testcase.get('classname', '')
            case_time = float(testcase.get('time', '0'))
            
            status = "passed"
            status_text = "Exitoso"
            
            has_failure = testcase.find('failure') is not None
            has_error = testcase.find('error') is not None
            has_skipped = testcase.find('skipped') is not None
            
            if has_failure:
                status = "failed"
                status_text = "Fallido"
            elif has_error:
                status = "error"
                status_text = "Error"
            elif has_skipped:
                status = "skipped"
                status_text = "Omitido"
            
            html += f"""
                        <div class="testcase testcase-{status}" data-status="{status}">
                            <div class="testcase-header">
                                <div class="testcase-name">
                                    <span class="status-icon {status}"></span>
                                    {case_name}
                                </div>
                                <div class="testcase-duration">
                                    {case_time:.3f}s <span class="expand-icon">›</span>
                                </div>
                            </div>
                            <div class="testcase-details">
                                <div class="testcase-classname">{case_class}</div>
                                <div>Estado: <strong>{status_text}</strong></div>
"""
            
            # Añadir detalles específicos según el estado
            if has_failure:
                failure = testcase.find('failure')
                failure_msg = failure.get('message', '')
                failure_text = failure.text or ''
                html += f"""
                                <div class="testcase-failure">
                                    <div class="failure-message">Mensaje de error: {failure_msg}</div>
                                    <pre>{failure_text}</pre>
                                </div>
"""
            
            if has_error:
                error = testcase.find('error')
                error_msg = error.get('message', '')
                error_text = error.text or ''
                html += f"""
                                <div class="testcase-error">
                                    <div class="error-message">Mensaje de error: {error_msg}</div>
                                    <pre>{error_text}</pre>
                                </div>
"""
            
            if has_skipped:
                skipped = testcase.find('skipped')
                skipped_msg = skipped.get('message', '')
                html += f"""
                                <div class="testcase-skipped">
                                    <div class="skipped-message">Razón: {skipped_msg}</div>
                                </div>
"""
            
            # Añadir pasos si existen
            steps = testcase.find('steps')
            if steps is not None:
                html += '<div class="step-list">'
                for step in steps.findall('step'):
                    step_name = step.get('name', 'Unnamed Step')
                    html += f'<div class="step">{step_name}</div>'
                html += '</div>'
            
            html += """
                            </div>
                        </div>
"""
        
        html += """
                    </div>
                </div>
"""
    
    html += """
                </div>
            </div>
        </div>
    </div>
    
    <footer class="footer">
        <p>LEVEL Booking - Informe de Pruebas Automatizadas</p>
        <p>Generado el """ + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + """</p>
    </footer>
    
    <script>
        // Datos para gráficos
        const overallData = {
            labels: ['Exitosos', 'Fallidos', 'Omitidos'],
            datasets: [{
                data: [""" + f"{total_passed}, {total_failures + total_errors}, {total_skipped}" + """],
                backgroundColor: ['#4caf50', '#f44336', '#9e9e9e'],
                hoverOffset: 4
            }]
        };
        
        const suitesData = {
            labels: [""" + ", ".join([f"'{suite['name']}'" for suite in suite_data]) + """],
            datasets: [
                {
                    label: 'Exitosos',
                    data: [""" + ", ".join([str(suite['passed']) for suite in suite_data]) + """],
                    backgroundColor: '#4caf50',
                    barPercentage: 0.8
                },
                {
                    label: 'Fallidos',
                    data: [""" + ", ".join([str(suite['failed'] + suite['error']) for suite in suite_data]) + """],
                    backgroundColor: '#f44336',
                    barPercentage: 0.8
                },
                {
                    label: 'Omitidos',
                    data: [""" + ", ".join([str(suite['skipped']) for suite in suite_data]) + """],
                    backgroundColor: '#9e9e9e',
                    barPercentage: 0.8
                }
            ]
        };
        
        // Configurar gráficos
        document.addEventListener('DOMContentLoaded', function() {
            // Gráfico de resultados generales
            const overallCtx = document.getElementById('overallResultsChart').getContext('2d');
            const overallChart = new Chart(overallCtx, {
                type: 'doughnut',
                data: overallData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                        title: {
                            display: true,
                            text: 'Resumen de Resultados',
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });
            
            // Gráfico de resultados por testsuite
            const suitesCtx = document.getElementById('testsuiteResultsChart').getContext('2d');
            const suitesChart = new Chart(suitesCtx, {
                type: 'bar',
                data: suitesData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Resultados por Test Suite',
                            font: {
                                size: 16
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true
                        }
                    }
                }
            });
            
            // Toggle para expandir/colapsar testsuites
            document.querySelectorAll('.testsuite-header').forEach(header => {
                header.addEventListener('click', function() {
                    const content = this.nextElementSibling;
                    const isExpanded = content.style.display === 'block';
                    
                    if (isExpanded) {
                        content.style.display = 'none';
                        this.classList.remove('expanded');
                    } else {
                        content.style.display = 'block';
                        this.classList.add('expanded');
                    }
                });
            });
            
            // Toggle para expandir/colapsar testcases
            document.querySelectorAll('.testcase-header').forEach(header => {
                header.addEventListener('click', function() {
                    const details = this.nextElementSibling;
                    const isExpanded = details.style.display === 'block';
                    
                    if (isExpanded) {
                        details.style.display = 'none';
                        this.classList.remove('expanded');
                    } else {
                        details.style.display = 'block';
                        this.classList.add('expanded');
                        details.classList.add('fade-in');
                    }
                });
            });
            
            // Filtrado de testcases
            document.querySelectorAll('.filter-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const filter = this.getAttribute('data-filter');
                    
                    // Actualizar estado activo de los botones
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Filtrar testcases
                    document.querySelectorAll('.testcase').forEach(testcase => {
                        const status = testcase.getAttribute('data-status');
                        
                        if (filter === 'all' || status === filter ||
                            (filter === 'failed' && (status === 'failed' || status === 'error'))) {
                            testcase.style.display = 'block';
                        } else {
                            testcase.style.display = 'none';
                        }
                    });
                    
                    // Mostrar/ocultar testsuites según si tienen testcases visibles
                    document.querySelectorAll('.testsuite').forEach(testsuite => {
                        const visibleTestcases = testsuite.querySelectorAll('.testcase[style="display: block"]').length;
                        
                        if (filter === 'all') {
                            testsuite.style.display = 'block';
                        } else if (filter === 'passed' && parseInt(testsuite.getAttribute('data-passed')) > 0) {
                            testsuite.style.display = 'block';
                        } else if (filter === 'failed' && parseInt(testsuite.getAttribute('data-failed')) > 0) {
                            testsuite.style.display = 'block';
                        } else if (filter === 'skipped' && parseInt(testsuite.getAttribute('data-skipped')) > 0) {
                            testsuite.style.display = 'block';
                        } else {
                            testsuite.style.display = 'none';
                        }
                    });
                });
            });
            
            // Expandir automáticamente los test suites con fallos
            if (""" + str(total_failures + total_errors) + """ > 0) {
                document.querySelectorAll('.testsuite').forEach(testsuite => {
                    if (parseInt(testsuite.getAttribute('data-failed')) > 0) {
                        const header = testsuite.querySelector('.testsuite-header');
                        const content = testsuite.querySelector('.testsuite-content');
                        
                        content.style.display = 'block';
                        header.classList.add('expanded');
                    }
                });
            }
        });
    </script>
</body>
</html>
"""
    
    # Escribir el HTML al archivo
    with open(html_output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"Informe HTML avanzado de JUnit creado en: {html_output_path}")
    return html_output_path


def publish_to_github_pages(report_title, processed_file_path):
    """
    Publica los informes procesados en GitHub Pages.
    """
    print("\nPreparando para publicar en GitHub Pages...")
    
    # Verificar repositorio Git
    try:
        remote_url = subprocess.check_output("git config --get remote.origin.url", shell=True).decode('utf-8').strip()
        print(f"Repositorio: {remote_url}")
    except subprocess.CalledProcessError:
        print("Error: No se encuentra en un repositorio Git o no hay un origen remoto configurado.")
        return False
    
    # Crear directorio temporal para la rama gh-pages (usando tempfile para evitar conflictos)
    temp_dir = tempfile.gettempdir()
    gh_pages_dir = os.path.join(temp_dir, f"gh-pages-temp-{datetime.now().strftime('%Y%m%d%H%M%S')}")
    if os.path.exists(gh_pages_dir):
        try:
            shutil.rmtree(gh_pages_dir)
        except PermissionError:
            print(f"No se pudo eliminar el directorio temporal existente. Usando un nombre alternativo.")
            gh_pages_dir = os.path.join(temp_dir, f"gh-pages-temp-{datetime.now().strftime('%Y%m%d%H%M%S')}-{os.getpid()}")
    
    os.makedirs(gh_pages_dir)
    print(f"Usando directorio temporal: {gh_pages_dir}")
    
    # Intentar clonar la rama gh-pages existente
    try:
        subprocess.run(
            f"git clone --branch gh-pages {remote_url} {gh_pages_dir}", 
            shell=True, 
            stderr=subprocess.PIPE, 
            check=True
        )
        print("Rama gh-pages existente clonada con éxito.")
    except subprocess.CalledProcessError:
        print("La rama gh-pages no existe. Creando estructura básica...")
        # Crear estructura básica si la rama no existe
        with open(os.path.join(gh_pages_dir, "index.html"), "w") as f:
            f.write("<html><body><h1>LEVEL Booking Test Reports</h1></body></html>")
    
    # Crear directorio para los reportes si no existe
    reports_dir = os.path.join(gh_pages_dir, "reports")
    if not os.path.exists(reports_dir):
        os.makedirs(reports_dir)
    
    # Crear un subdirectorio para este reporte
    report_date = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    report_dir_name = f"report-{report_date}"
    report_dir = os.path.join(reports_dir, report_dir_name)
    os.makedirs(report_dir)
    
    # Copiar el informe de Playwright-HTML si existe
    playwright_report_dir = os.path.join(os.getcwd(), "playwright-report")
    if os.path.exists(playwright_report_dir):
        target_html_dir = os.path.join(report_dir, "html")
        shutil.copytree(playwright_report_dir, target_html_dir)
        print(f"Informe HTML de Playwright copiado a {target_html_dir}")
    
    # Crear directorio para informes JUnit
    junit_dir = os.path.join(report_dir, "junit")
    os.makedirs(junit_dir)
    
    # Copiar el informe JUnit procesado
    processed_xml_path = os.path.join(junit_dir, "processed-report.xml")
    shutil.copy(processed_file_path, processed_xml_path)
    print(f"Informe JUnit procesado copiado a {junit_dir}")
    
    # Crear versión HTML del informe JUnit
    junit_html_path = os.path.join(junit_dir, "junit-report.html")
    create_junit_html_report(processed_file_path, junit_html_path)
    print(f"Informe HTML de JUnit generado en {junit_html_path}")
    
    # Actualizar configuración de informes
    config_path = os.path.join(gh_pages_dir, "reports-config.json")
    config = {"reports": []}
    
    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                config = json.load(f)
        except json.JSONDecodeError:
            print("Archivo de configuración dañado. Creando uno nuevo.")
    
    # Añadir nuevo informe a la configuración
    config["reports"].insert(0, {
        "title": report_title,
        "date": report_date,
        "htmlPath": f"reports/{report_dir_name}/html/index.html",
        "junitPath": f"reports/{report_dir_name}/junit/processed-report.xml",
        "junitHtmlPath": f"reports/{report_dir_name}/junit/junit-report.html"
    })
    
    # Guardar configuración actualizada
    with open(config_path, "w") as f:
        json.dump(config, f, indent=2)
    
    # Crear página de índice HTML
    create_index_page(gh_pages_dir, config)
    
    # Commit y push a GitHub Pages
    try:
        current_dir = os.getcwd()
        os.chdir(gh_pages_dir)
        
        subprocess.run("git init", shell=True, check=True)
        subprocess.run("git add .", shell=True, check=True)
        subprocess.run(f'git commit -m "Publicar informe: {report_title}"', shell=True, check=True)
        subprocess.run(f"git remote add origin {remote_url}", shell=True)
        subprocess.run("git push -f origin HEAD:gh-pages", shell=True, check=True)
        
        print("\n¡Publicación a GitHub Pages completada con éxito!")
        print("Los informes estarán disponibles en: https://sofiaflyLevel.github.io/QA-Level/")
        
        # Volver al directorio original
        os.chdir(current_dir)
        
        # Dar tiempo a que se liberen los recursos
        time.sleep(1)
        
        # Limpiar directorio temporal
        try:
            shutil.rmtree(gh_pages_dir)
            print("Directorio temporal eliminado correctamente.")
        except PermissionError:
            print(f"No se pudo eliminar el directorio temporal: {gh_pages_dir}")
            print("Puede eliminarlo manualmente más tarde.")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error al publicar en GitHub Pages: {e}")
        print("Por favor, intente publicar manualmente:")
        print(f"1. Copie los archivos de {gh_pages_dir} a la rama gh-pages de su repositorio")
        print("2. Haga push a GitHub")
        return False
    except Exception as e:
        print(f"Error durante la publicación: {e}")
        print(f"Los archivos temporales están en: {gh_pages_dir}")
        return False


def create_index_page(base_dir, config):
    """
    Crea una página de índice HTML atractiva con todos los informes.
    """
    html = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LEVEL Booking Test Reports</title>
    <style>
        :root {
            --primary-color: #2f5496;
            --secondary-color: #f0f4f8;
            --accent-color: #f39200;
            --text-color: #333;
            --light-text: #666;
            --border-color: #ddd;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: #f9f9f9;
        }
        
        header {
            background-color: var(--primary-color);
            color: white;
            padding: 1.5rem 0;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        
        .info-panel {
            background-color: var(--secondary-color);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .info-panel p {
            color: var(--light-text);
            margin-bottom: 0.5rem;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        th {
            background-color: var(--primary-color);
            color: white;
            font-weight: 600;
        }
        
        tr:hover {
            background-color: var(--secondary-color);
        }
        
        a.btn {
            display: inline-block;
            padding: 8px 16px;
            background-color: var(--primary-color);
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.3s;
            font-weight: 500;
        }
        
        a.btn:hover {
            background-color: #1c3867;
        }
        
        footer {
            text-align: center;
            padding: 1rem;
            background-color: var(--primary-color);
            color: white;
            margin-top: 2rem;
        }
        
        .last-updated {
            font-style: italic;
            color: var(--light-text);
            text-align: right;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <header>
        <h1>LEVEL Booking Automated Test Reports</h1>
    </header>
    
    <div class="container">
        <div class="info-panel">
            <p>Última actualización: """ + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + """</p>
            <p>Repositorio: QA-Level</p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Título</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
"""

    # Añadir filas para cada informe
    for report in config["reports"]:
        date_str = report["date"].replace("_", " ").replace("-", "/")
        html += f"""
                <tr>
                    <td>{report["title"]}</td>
                    <td>{date_str}</td>
                    <td>
                        <a href="{report.get("junitHtmlPath", "#")}" class="btn">Ver Informe</a>
                    </td>
                </tr>
"""

    html += """
            </tbody>
        </table>
        
        <div class="last-updated">
            Generado automáticamente - """ + datetime.now().strftime("%d/%m/%Y %H:%M:%S") + """
        </div>
    </div>
    
    <footer>
        <p>&copy; """ + str(datetime.now().year) + """ LEVEL Booking Test Automation</p>
    </footer>
</body>
</html>
"""

    with open(os.path.join(base_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    
    print("Página de índice creada correctamente.")


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

    # Paso 3: Preguntar si se desea publicar en GitHub Pages
    upload_to_github = input("¿Desea publicar los resultados en GitHub Pages? (yes/no): ").strip().lower()

    if upload_to_github == 'yes':
        # Usar el mismo nombre dinámico como título del informe
        report_title = dynamic_name if dynamic_name.strip() else f"Informe de pruebas {datetime.now().strftime('%d/%m/%Y')}"
        
        success = publish_to_github_pages(report_title, processed_output_path)
        if success:
            print("Resultados publicados exitosamente en GitHub Pages.")
        else:
            print("No se pudieron publicar los resultados en GitHub Pages.")
    else:
        print("Los resultados no fueron publicados en GitHub Pages.")

except FileNotFoundError as e:
    print(str(e))
    exit(1)
except subprocess.CalledProcessError as e:
    print(f"Error al ejecutar un comando: {e}")
    exit(1)
except Exception as e:
    print(f"Error inesperado: {e}")
    exit(1)