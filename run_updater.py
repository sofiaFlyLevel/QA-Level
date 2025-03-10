#!/usr/bin/env python3
"""
Script para actualizar y generar informes JUnit a HTML con desglose detallado de pruebas.
Este script corrige los problemas con las pruebas de vuelos One-Way y asegura que los valores
de las estadísticas se muestren correctamente.
"""

import os
import sys
import shutil
from datetime import datetime

# Importamos directamente las funciones en lugar de usar importación de módulos
from junit_report_fix_corrected import update_junit_report, process_junit_report, create_junit_html_report

def run_update():
    """
    Ejecuta el proceso de actualización del informe JUnit
    """
    # Verificar directorios y crearlos si no existen
    test_results_dir = './test-results'
    external_dir = './external-test-reports'
    
    if not os.path.exists(test_results_dir):
        os.makedirs(test_results_dir)
        print(f"Creado directorio {test_results_dir}")
    
    if not os.path.exists(external_dir):
        os.makedirs(external_dir)
        print(f"Creado directorio {external_dir}")
    
    # Buscar el archivo JUnit en external-test-reports primero
    print("Buscando archivo JUnit...")
    external_file = os.path.join(external_dir, "junit-report.xml")
    input_path = './test-results/junit-report.xml'
    
    # Verificar qué archivo usar como entrada
    if os.path.exists(external_file):
        print(f"Usando archivo existente: {external_file}")
        junit_source = external_file
    elif os.path.exists(input_path):
        print(f"Usando archivo original: {input_path}")
        junit_source = input_path
    else:
        print(f"ERROR: No se encontró ningún archivo JUnit. Verifique las rutas:")
        print(f"  - {external_file}")
        print(f"  - {input_path}")
        return 1
    
    # Actualizar el archivo JUnit en external-test-reports
    try:
        print("\n=== Actualizando informe JUnit ===")
        updated_path = update_junit_report(junit_source, external_dir)
        
        # Procesar y desglosar tests
        print("\n=== Procesando informe JUnit para desglosar tests ===")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        processed_output_path = f"./test-results/processed-junit-report-{timestamp}.xml"
        processed_path = process_junit_report(updated_path, processed_output_path)
        
        # Generar informe HTML
        print("\n=== Generando informe HTML ===")
        html_output_path = os.path.splitext(processed_output_path)[0] + ".html"
        create_junit_html_report(processed_path, html_output_path)
        
        print(f"\n¡Proceso completado con éxito!")
        print(f"- Informe XML procesado: {processed_output_path}")
        print(f"- Informe HTML generado: {html_output_path}")
        
        # Intentar abrir el archivo HTML automáticamente
        try:
            import webbrowser
            print("\nAbriendo informe HTML generado...")
            webbrowser.open(f"file://{os.path.abspath(html_output_path)}")
        except:
            print("No se pudo abrir el navegador automáticamente. Abra el archivo manualmente.")
        
        return 0
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(run_update())