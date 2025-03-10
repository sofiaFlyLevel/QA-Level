import os
import shutil
import xml.etree.ElementTree as ET
from datetime import datetime

def update_junit_report(input_path, external_dir):
    """
    
    # Preparar los datos para los gráficos JavaScript como listas reales
    chart_data_passed = []
    chart_data_failed = []
    chart_data_skipped = []
    chart_labels = []
    
    for suite in suite_data:
        chart_labels.append(suite['name'])
        chart_data_passed.append(suite['passed'])
        chart_data_failed.append(suite['failed'] + suite['error'])
        chart_data_skipped.append(suite['skipped'])
    
    # Convertir las listas en strings de JS
    chart_labels_js = ", ".join([f"'{label}'" for label in chart_labels])
    chart_data_passed_js = ", ".join([str(val) for val in chart_data_passed])
    chart_data_failed_js = ", ".join([str(val) for val in chart_data_failed])
    chart_data_skipped_js = ", ".join([str(val) for val in chart_data_skipped])
    
    html += f"""
                </div>
            </div>
        </div>
    </div>
    
    <footer class="footer">
        <p>LEVEL Booking - Informe de Pruebas Automatizadas</p>
        <p>Generado el {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}</p>
    </footer>
    
    <script>
        // Datos para gráficos
        const overallData = {{
            labels: ['Exitosos', 'Fallidos', 'Omitidos'],
            datasets: [{{
                data: [{total_passed}, {total_failures + total_errors}, {total_skipped}],
                backgroundColor: ['#4caf50', '#f44336', '#9e9e9e'],
                hoverOffset: 4
            }}]
        }};
        
        const suitesData = {{
            labels: [{chart_labels_js}],
            datasets: [
                {{
                    label: 'Exitosos',
                    data: [{chart_data_passed_js}],
                    backgroundColor: '#4caf50',
                    barPercentage: 0.8
                }},
                {{
                    label: 'Fallidos',
                    data: [{chart_data_failed_js}],
                    backgroundColor: '#f44336',
                    barPercentage: 0.8
                }},
                {{
                    label: 'Omitidos',
                    data: [{chart_data_skipped_js}],
                    backgroundColor: '#9e9e9e',
                    barPercentage: 0.8
                }}
            ]
        }};
        
        // Configurar gráficos
        document.addEventListener('DOMContentLoaded', function() {{
            // Gráfico de resultados generales
            const overallCtx = document.getElementById('overallResultsChart').getContext('2d');
            const overallChart = new Chart(overallCtx, {{
                type: 'doughnut',
                data: overallData,
                options: {{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {{
                        legend: {{
                            position: 'right',
                        }},
                        title: {{
                            display: true,
                            text: 'Resumen de Resultados',
                            font: {{
                                size: 16
                            }}
                        }}
                    }}
                }}
            }});
            
            // Gráfico de resultados por testsuite
            const suitesCtx = document.getElementById('testsuiteResultsChart').getContext('2d');
            const suitesChart = new Chart(suitesCtx, {{
                type: 'bar',
                data: suitesData,
                options: {{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {{
                        legend: {{
                            position: 'top',
                        }},
                        title: {{
                            display: true,
                            text: 'Resultados por Test Suite',
                            font: {{
                                size: 16
                            }}
                        }}
                    }},
                    scales: {{
                        x: {{
                            stacked: true
                        }},
                        y: {{
                            stacked: true,
                            beginAtZero: true
                        }}
                    }}
                }}
            }});
            
            // Toggle para expandir/colapsar testsuites
            document.querySelectorAll('.testsuite-header').forEach(header => {{
                header.addEventListener('click', function() {{
                    const content = this.nextElementSibling;
                    const isExpanded = content.style.display === 'block';
                    
                    if (isExpanded) {{
                        content.style.display = 'none';
                        this.classList.remove('expanded');
                    }} else {{
                        content.style.display = 'block';
                        this.classList.add('expanded');
                    }}
                }});
            }});
            
            // Toggle para expandir/colapsar testcases
            document.querySelectorAll('.testcase-header').forEach(header => {{
                header.addEventListener('click', function() {{
                    const details = this.nextElementSibling;
                    const isExpanded = details.style.display === 'block';
                    
                    if (isExpanded) {{
                        details.style.display = 'none';
                        this.classList.remove('expanded');
                    }} else {{
                        details.style.display = 'block';
                        this.classList.add('expanded');
                        details.classList.add('fade-in');
                    }}
                }});
            }});
            
            // Filtrado de testcases
            document.querySelectorAll('.filter-btn').forEach(button => {{
                button.addEventListener('click', function() {{
                    const filter = this.getAttribute('data-filter');
                    
                    // Actualizar estado activo de los botones
                    document.querySelectorAll('.filter-btn').forEach(btn => {{
                        btn.classList.remove('active');
                    }});
                    this.classList.add('active');
                    
                    // Filtrar testcases
                    document.querySelectorAll('.testcase').forEach(testcase => {{
                        const status = testcase.getAttribute('data-status');
                        
                        if (filter === 'all' || status === filter ||
                            (filter === 'failed' && (status === 'failed' || status === 'error'))) {{
                            testcase.style.display = 'block';
                        }} else {{
                            testcase.style.display = 'none';
                        }}
                    }});
                    
                    // Mostrar/ocultar testsuites según si tienen testcases visibles
                    document.querySelectorAll('.testsuite').forEach(testsuite => {{
                        const visibleTestcases = testsuite.querySelectorAll('.testcase[style="display: block"]').length;
                        
                        if (filter === 'all') {{
                            testsuite.style.display = 'block';
                        }} else if (filter === 'passed' && parseInt(testsuite.getAttribute('data-passed')) > 0) {{
                            testsuite.style.display = 'block';
                        }} else if (filter === 'failed' && parseInt(testsuite.getAttribute('data-failed')) > 0) {{
                            testsuite.style.display = 'block';
                        }} else if (filter === 'skipped' && parseInt(testsuite.getAttribute('data-skipped')) > 0) {{
                            testsuite.style.display = 'block';
                        }} else {{
                            testsuite.style.display = 'none';
                        }}
                    }});
                }});
            }});
            
            // Expandir automáticamente los test suites con fallos
            if ({total_failures + total_errors} > 0) {{
                document.querySelectorAll('.testsuite').forEach(testsuite => {{
                    if (parseInt(testsuite.getAttribute('data-failed')) > 0) {{
                        const header = testsuite.querySelector('.testsuite-header');
                        const content = testsuite.querySelector('.testsuite-content');
                        
                        content.style.display = 'block';
                        header.classList.add('expanded');
                        
                        // También expandir los testcases con fallos
                        testsuite.querySelectorAll('.testcase-failed, .testcase-error').forEach(failedCase => {{
                            const caseHeader = failedCase.querySelector('.testcase-header');
                            const caseDetails = failedCase.querySelector('.testcase-details');
                            
                            if (caseHeader && caseDetails) {{
                                caseDetails.style.display = 'block';
                                caseHeader.classList.add('expanded');
                            }}
                        }});
                    }}
                }});
            }}
            
            // Expandir automáticamente el testsuite "Pruebas de vuelos de solo ida"
            document.querySelectorAll('.testsuite').forEach(testsuite => {{
                const testsuiteName = testsuite.querySelector('.testsuite-name');
                if (testsuiteName && testsuiteName.textContent.includes('One-Way')) {{
                    const header = testsuite.querySelector('.testsuite-header');
                    const content = testsuite.querySelector('.testsuite-content');
                    
                    if (header && content) {{
                        content.style.display = 'block';
                        header.classList.add('expanded');
                    }}
                }}
            }});
        }});
    </script>
</body>
</html>"""
        
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
            
            # Añadir pasos si existen (desglose de tests)
            steps = testcase.find('steps')
            if steps is not None:
                html += '<div class="step-list">'
                for step in steps.findall('step'):
                    step_name = step.get('name', 'Unnamed Step')
                    
                    # Determinar estado del paso
                    step_status = "passed"
                    if step.find('failure') is not None:
                        step_status = "failed"
                    elif step.find('error') is not None:
                        step_status = "error"
                    elif step.find('skipped') is not None:
                        step_status = "skipped"
                    
                    html += f'<div class="step {step_status}"><div class="step-name">{step_name}</div>'
                    
                    # Añadir detalles del paso si hay error o fallo
                    if step.find('failure') is not None:
                        step_failure = step.find('failure')
                        step_failure_msg = step_failure.get('message', '')
                        step_failure_text = step_failure.text or ''
                        html += f'<div class="step-content"><div class="failure-message">Error: {step_failure_msg}</div>'
                        if step_failure_text:
                            html += f'<pre>{step_failure_text}</pre>'
                        html += '</div>'
                    
                    if step.find('error') is not None:
                        step_error = step.find('error')
                        step_error_msg = step_error.get('message', '')
                        step_error_text = step_error.text or ''
                        html += f'<div class="step-content"><div class="error-message">Error: {step_error_msg}</div>'
                        if step_error_text:
                            html += f'<pre>{step_error_text}</pre>'
                        html += '</div>'
                    
                    html += '</div>'
                html += '</div>'
            
            html += """
                            </div>
                        </div>
"""
        
        html += """
                    </div>
                </div>
"""
    Actualiza o crea un informe JUnit combinando datos nuevos con existentes.
    Lee los datos de la carpeta external-test-reports/junit-report.xml.
    
    Args:
        input_path: Ruta al archivo de entrada JUnit XML
        external_dir: Directorio donde se guardará el informe combinado
        
    Returns:
        La ruta del archivo de salida actualizado
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada {input_path} no encontrado.")

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
    try:
        new_tree = ET.parse(input_path)
        new_root = new_tree.getroot()
    except ET.ParseError:
        print(f"El archivo de entrada {input_path} no es un XML válido.")
        return output_path

    # Bandera para rastrear si se hicieron actualizaciones
    updated = False

    # Verificar que tengamos las raíces correctas y crear una estructura adecuada si es necesario
    if existing_root.tag != 'testsuites':
        # Crear una nueva estructura con testsuites como raíz
        new_root_element = ET.Element('testsuites')
        
        # Mover los testsuites existentes bajo la nueva raíz si existen
        if existing_root.tag == 'testsuite':
            new_root_element.append(existing_root)
        else:
            for testsuite in existing_root.findall('.//testsuite'):
                new_root_element.append(testsuite)
        
        existing_root = new_root_element
        updated = True

    # Fusionar o actualizar los casos de prueba
    for new_testsuite in new_root.findall(".//testsuite"):
        existing_testsuite = None
        
        # Buscar el testsuite por nombre
        for ts in existing_root.findall(".//testsuite"):
            if ts.get('name') == new_testsuite.get('name'):
                existing_testsuite = ts
                break
                
        if existing_testsuite is None:
            # Si no existe, añadir el nuevo testsuite completo
            existing_root.append(new_testsuite)
            updated = True
        else:
            # Actualizar atributos del testsuite existente con los nuevos valores
            for attr, value in new_testsuite.attrib.items():
                existing_testsuite.set(attr, value)
            
            # Actualizar o añadir testcases
            for new_testcase in new_testsuite.findall("testcase"):
                existing_testcase = None
                
                # Buscar el testcase por nombre y classname
                for tc in existing_testsuite.findall("testcase"):
                    if (tc.get('name') == new_testcase.get('name') and 
                        tc.get('classname') == new_testcase.get('classname')):
                        existing_testcase = tc
                        break
                
                if existing_testcase is None:
                    # Si no existe, añadir el nuevo testcase
                    existing_testsuite.append(new_testcase)
                    updated = True
                else:
                    # Reemplazar el testcase existente con el nuevo
                    existing_testsuite.remove(existing_testcase)
                    existing_testsuite.append(new_testcase)
                    updated = True

    # Guardar el contenido actualizado si hubo cambios
    if updated:
        # Crear un nuevo ElementTree con la raíz actualizada
        updated_tree = ET.ElementTree(existing_root)
        updated_tree.write(output_path, encoding="utf-8", xml_declaration=True)
        print(f"Reporte JUnit actualizado guardado en {output_path}")
    else:
        print("No se detectaron actualizaciones. El reporte JUnit ya estaba al día.")

    return output_path


def process_junit_report(input_path, output_path):
    """
    Procesa un informe JUnit para desglosar correctamente los testcases.
    Desglosa especialmente las pruebas de "Pruebas de vuelos de solo ida (One-Way)" 
    y otras pruebas compuestas para mostrar todas las tareas.
    
    Args:
        input_path: Ruta al archivo JUnit XML de entrada
        output_path: Ruta donde se guardará el archivo procesado
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada {input_path} no encontrado.")
    
    tree = ET.parse(input_path)
    root = tree.getroot()

    # Crear un nuevo reporte con estructura adecuada
    new_root = ET.Element('testsuites')

    for testsuite in root.findall('.//testsuite'):
        new_testsuite = ET.SubElement(new_root, 'testsuite', attrib=testsuite.attrib)
        test_groups = {}

        for testcase in testsuite.findall('testcase'):
            case_name = testcase.get('name', '')
            
            # Buscar patrones para desglosar pruebas
            if ' › ' in case_name:
                # Separar el nombre en grupo principal y subtarea
                name_parts = case_name.split(' › ')
                group_name = name_parts[0].strip()
                step_name = name_parts[1].strip()
                
                # Crear o reutilizar un grupo para esta prueba
                if group_name not in test_groups:
                    group_case = ET.SubElement(new_testsuite, 'testcase', {
                        'name': group_name,
                        'classname': testcase.get('classname', ''),
                        'time': testcase.get('time', '0')
                    })
                    steps = ET.SubElement(group_case, 'steps')
                    test_groups[group_name] = {
                        'element': group_case,
                        'steps': steps,
                        'time': float(testcase.get('time', '0')),
                        'has_failure': False,
                        'has_error': False,
                        'has_skipped': False
                    }
                else:
                    test_groups[group_name]['time'] += float(testcase.get('time', '0'))
                
                # Añadir el paso al grupo
                step = ET.SubElement(test_groups[group_name]['steps'], 'step', {'name': step_name})
                
                # Copiar el contenido del paso y verificar estados
                for child in testcase:
                    step.append(child)
                    
                    # Actualizar estado del grupo según los errores o fallos de los pasos
                    if child.tag == 'failure':
                        test_groups[group_name]['has_failure'] = True
                    elif child.tag == 'error':
                        test_groups[group_name]['has_error'] = True
                    elif child.tag == 'skipped':
                        test_groups[group_name]['has_skipped'] = True
            
            # Desglosar casos especiales como One-Way
            elif case_name.startswith("Pruebas de vuelos de solo ida") or "One-Way" in case_name:
                # Tratamiento específico para pruebas de vuelo
                group_name = "Pruebas de vuelos de solo ida (One-Way)"
                
                # Extraer el paso específico del test
                step_name = case_name
                if ":" in case_name:
                    step_parts = case_name.split(":", 1)
                    if len(step_parts) > 1:
                        step_name = step_parts[1].strip()
                
                # Crear o reutilizar grupo para esta prueba
                if group_name not in test_groups:
                    group_case = ET.SubElement(new_testsuite, 'testcase', {
                        'name': group_name,
                        'classname': testcase.get('classname', ''),
                        'time': testcase.get('time', '0')
                    })
                    steps = ET.SubElement(group_case, 'steps')
                    test_groups[group_name] = {
                        'element': group_case,
                        'steps': steps,
                        'time': float(testcase.get('time', '0')),
                        'has_failure': False,
                        'has_error': False,
                        'has_skipped': False
                    }
                else:
                    test_groups[group_name]['time'] += float(testcase.get('time', '0'))
                
                # Añadir el paso
                step = ET.SubElement(test_groups[group_name]['steps'], 'step', {'name': step_name})
                
                # Copiar contenido y verificar estados
                for child in testcase:
                    step.append(child)
                    
                    if child.tag == 'failure':
                        test_groups[group_name]['has_failure'] = True
                    elif child.tag == 'error':
                        test_groups[group_name]['has_error'] = True
                    elif child.tag == 'skipped':
                        test_groups[group_name]['has_skipped'] = True
            
            else:
                # Si no es para desglosar, mantener el test como está
                new_testsuite.append(testcase)
        
        # Actualizar los tiempos y añadir estados a los grupos procesados
        for group_name, group_data in test_groups.items():
            group_data['element'].set('time', str(group_data['time']))
            
            # Añadir elementos de estado según sea necesario
            if group_data['has_failure']:
                failure = ET.SubElement(group_data['element'], 'failure', {
                    'message': f'Uno o más pasos en "{group_name}" fallaron'
                })
            elif group_data['has_error']:
                error = ET.SubElement(group_data['element'], 'error', {
                    'message': f'Uno o más pasos en "{group_name}" tuvieron errores'
                })
            elif group_data['has_skipped']:
                skipped = ET.SubElement(group_data['element'], 'skipped', {
                    'message': f'Uno o más pasos en "{group_name}" fueron omitidos'
                })

    # Guardar el archivo procesado
    new_tree = ET.ElementTree(new_root)
    new_tree.write(output_path, encoding='utf-8', xml_declaration=True)
    print(f"Reporte JUnit procesado guardado en {output_path}")
    
    return output_path


def create_junit_html_report(xml_path, html_output_path):
    """
    Convierte un archivo JUnit XML en un informe HTML avanzado con gráficos y desglose interactivo.
    
    Args:
        xml_path: Ruta al archivo JUnit XML
        html_output_path: Ruta donde se guardará el archivo HTML
    """
    if not os.path.exists(xml_path):
        raise FileNotFoundError(f"Archivo XML no encontrado: {xml_path}")
    
    # Parsear el XML
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    # Calcular estadísticas generales
    total_testsuites = len(root.findall('.//testsuite'))
    total_testcases = 0
    total_failures = 0
    total_errors = 0
    total_skipped = 0
    
    # Recopilar datos para el gráfico
    suite_data = []
    
    for testsuite in root.findall('.//testsuite'):
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
    
    # Iniciar la estructura HTML con valores reales insertados
    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LEVEL Booking - Informe de Pruebas</title>
    <!-- Chart.js para gráficos -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {{
            --primary-color: #00aadb;
            --secondary-color: #f0f4f8;
            --accent-color: #f39200;
            --text-color: #1c1c1b;
            --light-text: #666;
            --border-color: #ddd;
            --success-color: #3ca44c;
            --warning-color: #ff9800;
            --error-color: #f44336;
            --skipped-color: #9e9e9e;
        }}
        
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Arial, sans-serif;
        }}
        
        body {{
            line-height: 1.6;
            color: var(--text-color);
            background-color: #f8f9fa;
        }}
        
        .header {{
            background-color: var(--primary-color);
            color: white;
            padding: 2rem 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }}
        
        .header::after {{
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 20px;
            background: linear-gradient(135deg, transparent 33.33%, white 33.33%, white 66.66%, transparent 66.66%);
            background-size: 20px 20px;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }}
        
        .card {{
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            overflow: hidden;
        }}
        
        .card-header {{
            background-color: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            font-weight: 600;
        }}
        
        .card-body {{
            padding: 1.5rem;
        }}
        
        .summary-stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }}
        
        .stat-card {{
            padding: 1.5rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }}
        
        .stat-card.total {{
            background-color: #e9ecef;
        }}
        
        .stat-card.passed {{
            background-color: var(--success-color);
            color: white;
        }}
        
        .stat-card.failed {{
            background-color: var(--error-color);
            color: white;
        }}
        
        .stat-card.skipped {{
            background-color: var(--skipped-color);
            color: white;
        }}
        
        .stat-number {{
            font-size: 2.5rem;
            font-weight: bold;
            line-height: 1;
            margin-bottom: 0.5rem;
        }}
        
        .stat-label {{
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        
        .charts-container {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }}
        
        .chart-container {{
            height: 300px;
            position: relative;
        }}
        
        .filter-controls {{
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            justify-content: center;
            flex-wrap: wrap;
        }}
        
        .filter-btn {{
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            background-color: #e9ecef;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 600;
        }}
        
        .filter-btn:hover {{
            background-color: #dee2e6;
        }}
        
        .filter-btn.active {{
            background-color: var(--primary-color);
            color: white;
        }}
        
        .filter-btn.passed {{
            background-color: var(--success-color);
            color: white;
        }}
        
        .filter-btn.failed {{
            background-color: var(--error-color);
            color: white;
        }}
        
        .filter-btn.skipped {{
            background-color: var(--skipped-color);
            color: white;
        }}
        
        .testsuite-list {{
            margin-top: 2rem;
        }}
        
        .testsuite {{
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
        }}
        
        .testsuite-header {{
            background-color: #f8f9fa;
            padding: 1rem 1.5rem;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
        }}
        
        .testsuite-name {{
            font-weight: 600;
            display: flex;
            align-items: center;
        }}
        
        .testsuite-name::before {{
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 10px;
        }}
        
        .testsuite-name.passed::before {{
            background-color: var(--success-color);
        }}
        
        .testsuite-name.has-failures::before {{
            background-color: var(--error-color);
        }}
        
        .testsuite-name.skipped::before {{
            background-color: var(--skipped-color);
        }}
        
        .testsuite-meta {{
            font-size: 0.875rem;
            color: var(--light-text);
        }}
        
        .testsuite-content {{
            display: none;
            padding: 0;
        }}
        
        .testcase {{
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border-color);
            transition: background-color 0.2s;
        }}
        
        .testcase:hover {{
            background-color: #f8f9fa;
        }}
        
        .testcase:last-child {{
            border-bottom: none;
        }}
        
        .testcase-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }}
        
        .testcase-name {{
            font-weight: 500;
            display: flex;
            align-items: center;
        }}
        
        .status-icon {{
            display: inline-block;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            margin-right: 10px;
        }}
        
        .status-icon.passed {{
            background-color: var(--success-color);
        }}
        
        .status-icon.failed {{
            background-color: var(--error-color);
        }}
        
        .status-icon.error {{
            background-color: var(--error-color);
        }}
        
        .status-icon.skipped {{
            background-color: var(--skipped-color);
        }}
        
        .testcase-duration {{
            font-size: 0.875rem;
            color: var(--light-text);
        }}
        
        .testcase-details {{
            display: none;
            padding: 1rem 0 0 2rem;
            font-size: 0.875rem;
        }}
        
        .testcase-classname {{
            margin-bottom: 0.5rem;
            color: var(--light-text);
        }}
        
        .testcase-failure, .testcase-error {{
            margin-top: 0.5rem;
            padding: 1rem;
            background-color: #fff5f5;
            border-left: 4px solid var(--error-color);
            border-radius: 4px;
        }}
        
        .testcase-skipped {{
            margin-top: 0.5rem;
            padding: 1rem;
            background-color: #f5f5f5;
            border-left: 4px solid var(--skipped-color);
            border-radius: 4px;
        }}
        
        .failure-message, .error-message, .skipped-message {{
            margin-bottom: 0.5rem;
            font-weight: 600;
        }}
        
        .step-list {{
            margin-top: 1rem;
            padding-left: 1rem;
            border-left: 2px solid #e9ecef;
        }}
        
        .step {{
            padding: 0.75rem 1rem;
            margin-bottom: 0.75rem;
            background-color: rgba(0,0,0,0.02);
            border-radius: 4px;
            position: relative;
        }}
        
        .step:before {{
            content: '';
            position: absolute;
            left: -1.5rem;
            top: 50%;
            width: 1rem;
            height: 2px;
            background-color: #e9ecef;
        }}
        
        .step.passed {{
            border-left: 3px solid var(--success-color);
        }}
        
        .step.failed {{
            border-left: 3px solid var(--error-color);
        }}
        
        .step.skipped {{
            border-left: 3px solid var(--skipped-color);
        }}
        
        .step-name {{
            font-weight: 500;
            margin-bottom: 0.5rem;
        }}
        
        .step-content {{
            font-size: 0.8125rem;
        }}
        
        .step:last-child {{
            margin-bottom: 0;
        }}
        
        .expand-icon {{
            display: inline-block;
            width: 16px;
            height: 16px;
            text-align: center;
            line-height: 16px;
            transition: transform 0.2s;
        }}
        
        .expanded .expand-icon {{
            transform: rotate(90deg);
        }}
        
        .progress-bar {{
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 0.5rem;
            background-color: #e9ecef;
        }}
        
        .progress-fill {{
            height: 100%;
            display: flex;
        }}
        
        .progress-segment {{
            height: 100%;
        }}
        
        .progress-segment.passed {{
            background-color: var(--success-color);
        }}
        
        .progress-segment.failed {{
            background-color: var(--error-color);
        }}
        
        .progress-segment.error {{
            background-color: var(--error-color);
        }}
        
        .progress-segment.skipped {{
            background-color: var(--skipped-color);
        }}
        
        .footer {{
            text-align: center;
            padding: 1.5rem;
            background-color: var(--primary-color);
            color: white;
            margin-top: 3rem;
        }}
        
        .badge {{
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 10px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 0.5rem;
        }}
        
        .badge.passed {{
            background-color: var(--success-color);
            color: white;
        }}
        
        .badge.failed {{
            background-color: var(--error-color);
            color: white;
        }}
        
        .badge.skipped {{
            background-color: var(--skipped-color);
            color: white;
        }}
        
        /* Animaciones */
        @keyframes fadeIn {{
            from {{ opacity: 0; }}
            to {{ opacity: 1; }}
        }}
        
        .fade-in {{
            animation: fadeIn 0.3s ease-in-out;
        }}
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
                        <div class="stat-number">{total_testcases}</div>
                        <div class="stat-label">Total de Pruebas</div>
                    </div>
                    <div class="stat-card passed">
                        <div class="stat-number">{total_passed}</div>
                        <div class="stat-label">Pruebas Exitosas</div>
                    </div>
                    <div class="stat-card failed">
                        <div class="stat-number">{total_failures + total_errors}</div>
                        <div class="stat-label">Pruebas Fallidas</div>
                    </div>
                    <div class="stat-card skipped">
                        <div class="stat-number">{total_skipped}</div>
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
    
    for testsuite in root.findall('.//testsuite'):
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
                                {f'<div class="progress-segment passed" style="width: {suite_passed / max(1, suite_tests) * 100}%;"></div>' if suite_passed > 0 else ''}
                                {f'<div class="progress-segment failed" style="width: {(suite_failures + suite_errors) / max(1, suite_tests) * 100}%;"></div>' if suite_failures + suite_errors > 0 else ''}
                                {f'<div class="progress-segment skipped" style="width: {suite_skipped / max(1, suite_tests) * 100}%;"></div>' if suite_skipped > 0 else ''}
                            </div>
                        </div>
"""