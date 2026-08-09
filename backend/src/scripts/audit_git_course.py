import re
import sys

# Define expected module titles
EXPECTED_TITLES = [
    'Module 1: Introduction to Version Control, Git & GitHub',
    'Module 2: Installing Git and Initial Configuration',
    'Module 3: Git Repository Fundamentals',
    'Module 4: Basic Git Commands',
    'Module 5: Branching and Merging',
    'Module 6: GitHub Basics',
    'Module 7: Remote Repository Management',
    'Module 8: Git Collaboration',
    'Module 9: Advanced Git Commands',
    'Module 10: Git Internals',
    'Module 11: GitHub Features',
    'Module 12: Git Best Practices',
    'Module 13: Real-World Git Workflow',
    'Module 14: Git & GitHub Projects',
    'Module 15: Git & GitHub Interview Preparation'
]

# Foreign track keywords
FOREIGN_KEYWORDS = {
    'React': ['jsx', 'virtual dom', 'usestate', 'useeffect', 'redux toolkit'],
    'Kubernetes': ['kubelet', 'minikube', 'kubernetes architecture', 'pvc', 'pv claim', 'persistentvolume'],
    'Linux': ['systemd background', 'setfacl', 'sudoers visudo', 'chage password', 'monolithic kernel']
}

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    
    frontend_path = r"C:\Users\devis\LMS-Platform\frontend\src\data\gitCourseFullData.ts"
    backend_path = r"C:\Users\devis\LMS-Platform\backend\src\services\course\gitSyllabusData.ts"
    
    print("--- STARTING STATIC AUDIT (audit_git_course.py) ---")
    
    with open(frontend_path, "r", encoding="utf-8") as f:
        fe_content = f.read()
        
    with open(backend_path, "r", encoding="utf-8") as f:
        be_content = f.read()
        
    results = []
    clean_count = 0
    
    for idx, expected_title in enumerate(EXPECTED_TITLES, 1):
        mod_id = f"git-mod-{idx}"
        topic_id = f"git-topic-{idx}"
        unit_id = f"git-unit-{idx}-notes"
        
        fe_status = "Missing"
        be_status = "Missing"
        relationship_status = "Correct"
        foreign_content = []
        issues = []
        
        # 1. Inspect frontend file
        # Search for module block
        fe_mod_match = re.search(rf"id:\s*'{mod_id}'(.*?)(?=\s+id:\s*'git-mod-|\Z)", fe_content, re.DOTALL)
        fe_module_text = ""
        if fe_mod_match:
            fe_module_text = fe_mod_match.group(1)
            
            # Check title
            if expected_title in fe_module_text:
                fe_status = "Correct"
            else:
                fe_status = "Mixed"
                issues.append("Title mismatch in frontend")
                
            # Check ID relationships
            if f"id: 'git-topic-{idx}'" not in fe_module_text:
                relationship_status = "Incorrect"
                issues.append(f"Topic ID mismatch (expected 'git-topic-{idx}')")
            if f"id: 'git-unit-{idx}-notes'" not in fe_module_text:
                relationship_status = "Incorrect"
                issues.append(f"Unit ID mismatch (expected 'git-unit-{idx}-notes')")
            if "type: 'Reading'" not in fe_module_text:
                issues.append("Unit type is not 'Reading'")
        else:
            issues.append(f"Module {mod_id} not found in frontend file")
            
        # 2. Inspect backend file
        be_mod_match = re.search(rf"{idx}:\s*`(.*?)(?=`\s*,\s*\d+:\s*`|\Z)", be_content, re.DOTALL)
        be_module_text = ""
        if be_mod_match:
            be_module_text = be_mod_match.group(1)
            be_status = "Correct"
        else:
            issues.append(f"Module {idx} content not found in backend file")
            be_status = "Missing"
            
        # 3. Check for foreign content keywords
        combined_text = (fe_module_text + " " + be_module_text).lower()
        for category, keywords in FOREIGN_KEYWORDS.items():
            for kw in keywords:
                if kw in combined_text:
                    foreign_content.append(f"{category} ({kw})")
                    
        is_clean = (fe_status == "Correct" and 
                    be_status == "Correct" and 
                    relationship_status == "Correct" and 
                    len(foreign_content) == 0 and 
                    len(issues) == 0)
        
        if is_clean:
            clean_count += 1
            
        results.append({
            "num": idx,
            "title": expected_title,
            "fe_status": fe_status,
            "be_status": be_status,
            "relationship": relationship_status,
            "foreign": foreign_content,
            "issues": issues
        })
        
    print("\n--- AUDIT VERIFICATION REPORT (audit_git_course.py) ---")
    for r in results:
        print(f"\nModule {r['num']}: \"{r['title']}\"")
        print(f"  Frontend Status:     {r['fe_status']}")
        print(f"  Backend Status:      {r['be_status']}")
        print(f"  ID Relationships:    {r['relationship']}")
        print(f"  Foreign Content:     {r['foreign'] if r['foreign'] else 'None'}")
        if r['issues']:
            print("  Issues:")
            for iss in r['issues']:
                print(f"    - {iss}")
                
    print("\n--- SUMMARY (audit_git_course.py) ---")
    print(f"Audited Modules: 15")
    print(f"Passed Modules:  {clean_count}/15")
    print(f"Overall Result:  {'PASSED' if clean_count == 15 else 'FAILED'}")

if __name__ == "__main__":
    main()
