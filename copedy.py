import os
import shutil
import xml.etree.ElementTree as ET

def update_junit_report(input_path, external_dir):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file {input_path} does not exist.")

    # Create the external directory if it doesn't exist
    if not os.path.exists(external_dir):
        os.makedirs(external_dir)

    # Define the destination file
    output_path = os.path.join(external_dir, "junit-report.xml")

    # Parse the input JUnit report
    new_tree = ET.parse(input_path)
    new_root = new_tree.getroot()

    # If the destination file doesn't exist, copy it directly
    if not os.path.exists(output_path):
        shutil.copy(input_path, output_path)
        print(f"Copied JUnit report to {output_path}")
        return

    # Parse the existing JUnit report
    existing_tree = ET.parse(output_path)
    existing_root = existing_tree.getroot()

    # Flag to track if updates were made
    updated = False

    # Merge or update testcases
    for new_testsuite in new_root.findall("testsuite"):
        # Find or create the corresponding testsuite in the destination
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
                    # Compare contents to decide if the testcase needs an update
                    if not ET.tostring(existing_testcase, encoding='utf-8') == ET.tostring(new_testcase, encoding='utf-8'):
                        existing_testsuite.remove(existing_testcase)
                        existing_testsuite.append(new_testcase)
                        updated = True

    # Save the updated content if changes were made
    if updated:
        existing_tree.write(output_path, encoding="utf-8", xml_declaration=True)
        print(f"Updated JUnit report saved to {output_path}")
    else:
        print("No updates detected. The JUnit report is already up-to-date.")


# Input and output paths
input_path = "./test-results/junit-report.xml"
external_dir = "./external-test-reports"

try:
    update_junit_report(input_path, external_dir)
except FileNotFoundError as e:
    print(str(e))
    exit(1)
