import type { ModuleItem } from '../contexts/CourseContext';

export const pythonCourseModules: ModuleItem[] = [
  {
    "duration": "2 Hours",
    "title": "Module 1: Introduction to Python",
    "courseId": "python-through-oops-course-id",
    "order": 1,
    "orderIndex": 1,
    "description": "Python features, history, environment setup, syntax, comments, keywords, case-sensitivity, and indentation.",
    "id": "python-mod-1",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 1: Introduction to Python Complete Notes.",
        "moduleId": "python-mod-1",
        "title": "Module 1 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 1: Introduction to Python & Basics\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Explain what Python is, its key features, and history.\n- Set up a Python environment and run your first Python script.\n- Understand basic syntax, code comments, and keywords.\n- Explain the role of indentation in block structure.\n- Swap variables and execute basic I/O using print() and input().\n### Python Virtual Machine Execution Flow\n![Python Interpreter Flow](/assets/images/python_interpreter_flow.png)\n\n## 1.1 What is Python?\nPython is a high-level, general-purpose programming language known for its simple and readable syntax. It is widely used for:\n- **Web development** (Django, Flask)\n- **Data Science** (Pandas, NumPy)\n- **Machine Learning & AI** (TensorFlow, PyTorch)\n- **Automation & Scripting**\n- **Software testing & development**\n\n## 1.2 Features & Popularity\n- **Easy to Learn**: Syntax is clean and beginner-friendly.\n- **High-Level Language**: Automatic memory management.\n- **Dynamically Typed**: No need to declare variable types.\n- **Interpreted / Bytecode-Based Execution**: Source code is parsed into bytecode and executed by the Python Virtual Machine (PVM).\n- **Object-Oriented**: Supports classes, objects, and major OOP principles.\n- **Cross-Platform**: Runs on Windows, macOS, and Linux.\n\n## 1.3 How Python Executes a Program\nConceptually: \\`\\`\\`text Python Source Code (.py) ──> Python Parser ──> Bytecode (.pyc) ──> PVM ──> Machine Output \\`\\`\\`\n\n## 1.4 Variables & Basic Syntax\nA variable name refers to an object. In Python, variables are names bound to objects, not static memory boxes.\n- **Indentation Matters**: Python uses indentation (standard: 4 spaces) instead of curly braces \\`{}\\` to define blocks of code.\n- **Comments**: Single-line comments start with \\`#\\`. Multi-line comments can be implemented with triple-quoted strings (\\`\"\"\"\\`).\n- **Case-Sensitivity**: \\`name\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 1: Introduction to Python",
        "id": "python-unit-1-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 1: Introduction to Python & Basics\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Explain what Python is, its key features, and history.\n- Set up a Python environment and run your first Python script.\n- Understand basic syntax, code comments, and keywords.\n- Explain the role of indentation in block structure.\n- Swap variables and execute basic I/O using print() and input().\n### Python Virtual Machine Execution Flow\n![Python Interpreter Flow](/assets/images/python_interpreter_flow.png)\n\n## 1.1 What is Python?\nPython is a high-level, general-purpose programming language known for its simple and readable syntax. It is widely used for:\n- **Web development** (Django, Flask)\n- **Data Science** (Pandas, NumPy)\n- **Machine Learning & AI** (TensorFlow, PyTorch)\n- **Automation & Scripting**\n- **Software testing & development**\n\n## 1.2 Features & Popularity\n- **Easy to Learn**: Syntax is clean and beginner-friendly.\n- **High-Level Language**: Automatic memory management.\n- **Dynamically Typed**: No need to declare variable types.\n- **Interpreted / Bytecode-Based Execution**: Source code is parsed into bytecode and executed by the Python Virtual Machine (PVM).\n- **Object-Oriented**: Supports classes, objects, and major OOP principles.\n- **Cross-Platform**: Runs on Windows, macOS, and Linux.\n\n## 1.3 How Python Executes a Program\nConceptually: \\`\\`\\`text Python Source Code (.py) ──> Python Parser ──> Bytecode (.pyc) ──> PVM ──> Machine Output \\`\\`\\`\n\n## 1.4 Variables & Basic Syntax\nA variable name refers to an object. In Python, variables are names bound to objects, not static memory boxes.\n- **Indentation Matters**: Python uses indentation (standard: 4 spaces) instead of curly braces \\`{}\\` to define blocks of code.\n- **Comments**: Single-line comments start with \\`#\\`. Multi-line comments can be implemented with triple-quoted strings (\\`\"\"\"\\`).\n- **Case-Sensitivity**: \\`name\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-1-topic-1",
        "title": "Module 1: Introduction to Python Units",
        "description": "Python features, history, environment setup, syntax, comments, keywords, case-sensitivity, and indentation.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "python-unit-1-notes",
            "title": "Module 1 - Complete Notes",
            "description": "Module 1: Introduction to Python Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 1: Introduction to Python & Basics\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Explain what Python is, its key features, and history.\n- Set up a Python environment and run your first Python script.\n- Understand basic syntax, code comments, and keywords.\n- Explain the role of indentation in block structure.\n- Swap variables and execute basic I/O using print() and input().\n\n### Python Virtual Machine Execution Flow\n\n![Python Interpreter Flow](/assets/images/python_interpreter_flow.png)\n\n## 1.1 What is Python?\nPython is a high-level, general-purpose programming language known for its simple and readable syntax. It is widely used for:\n- **Web development** (Django, Flask)\n- **Data Science** (Pandas, NumPy)\n- **Machine Learning & AI** (TensorFlow, PyTorch)\n- **Automation & Scripting**\n- **Software testing & development**\n\n## 1.2 Features & Popularity\n- **Easy to Learn**: Syntax is clean and beginner-friendly.\n- **High-Level Language**: Automatic memory management.\n- **Dynamically Typed**: No need to declare variable types.\n- **Interpreted / Bytecode-Based Execution**: Source code is parsed into bytecode and executed by the Python Virtual Machine (PVM).\n- **Object-Oriented**: Supports classes, objects, and major OOP principles.\n- **Cross-Platform**: Runs on Windows, macOS, and Linux.\n\n## 1.3 How Python Executes a Program\nConceptually:\n\\`\\`\\`text\nPython Source Code (.py) ──> Python Parser ──> Bytecode (.pyc) ──> PVM ──> Machine Output\n\\`\\`\\`\n\n## 1.4 Variables & Basic Syntax\nA variable name refers to an object. In Python, variables are names bound to objects, not static memory boxes.\n- **Indentation Matters**: Python uses indentation (standard: 4 spaces) instead of curly braces \\`{}\\` to define blocks of code.\n- **Comments**: Single-line comments start with \\`#\\`. Multi-line comments can be implemented with triple-quoted strings (\\`\"\"\"\\`).\n- **Case-Sensitivity**: \\`name\\\n",
            "content": "\n\n# Module 1: Introduction to Python & Basics\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Explain what Python is, its key features, and history.\n- Set up a Python environment and run your first Python script.\n- Understand basic syntax, code comments, and keywords.\n- Explain the role of indentation in block structure.\n- Swap variables and execute basic I/O using print() and input().\n\n### Python Virtual Machine Execution Flow\n\n![Python Interpreter Flow](/assets/images/python_interpreter_flow.png)\n\n## 1.1 What is Python?\nPython is a high-level, general-purpose programming language known for its simple and readable syntax. It is widely used for:\n- **Web development** (Django, Flask)\n- **Data Science** (Pandas, NumPy)\n- **Machine Learning & AI** (TensorFlow, PyTorch)\n- **Automation & Scripting**\n- **Software testing & development**\n\n## 1.2 Features & Popularity\n- **Easy to Learn**: Syntax is clean and beginner-friendly.\n- **High-Level Language**: Automatic memory management.\n- **Dynamically Typed**: No need to declare variable types.\n- **Interpreted / Bytecode-Based Execution**: Source code is parsed into bytecode and executed by the Python Virtual Machine (PVM).\n- **Object-Oriented**: Supports classes, objects, and major OOP principles.\n- **Cross-Platform**: Runs on Windows, macOS, and Linux.\n\n## 1.3 How Python Executes a Program\nConceptually:\n\\`\\`\\`text\nPython Source Code (.py) ──> Python Parser ──> Bytecode (.pyc) ──> PVM ──> Machine Output\n\\`\\`\\`\n\n## 1.4 Variables & Basic Syntax\nA variable name refers to an object. In Python, variables are names bound to objects, not static memory boxes.\n- **Indentation Matters**: Python uses indentation (standard: 4 spaces) instead of curly braces \\`{}\\` to define blocks of code.\n- **Comments**: Single-line comments start with \\`#\\`. Multi-line comments can be implemented with triple-quoted strings (\\`\"\"\"\\`).\n- **Case-Sensitivity**: \\`name\\\n",
            "conceptTheory": "\n\n# Module 1: Introduction to Python & Basics\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Explain what Python is, its key features, and history.\n- Set up a Python environment and run your first Python script.\n- Understand basic syntax, code comments, and keywords.\n- Explain the role of indentation in block structure.\n- Swap variables and execute basic I/O using print() and input().\n\n### Python Virtual Machine Execution Flow\n\n![Python Interpreter Flow](/assets/images/python_interpreter_flow.png)\n\n## 1.1 What is Python?\nPython is a high-level, general-purpose programming language known for its simple and readable syntax. It is widely used for:\n- **Web development** (Django, Flask)\n- **Data Science** (Pandas, NumPy)\n- **Machine Learning & AI** (TensorFlow, PyTorch)\n- **Automation & Scripting**\n- **Software testing & development**\n\n## 1.2 Features & Popularity\n- **Easy to Learn**: Syntax is clean and beginner-friendly.\n- **High-Level Language**: Automatic memory management.\n- **Dynamically Typed**: No need to declare variable types.\n- **Interpreted / Bytecode-Based Execution**: Source code is parsed into bytecode and executed by the Python Virtual Machine (PVM).\n- **Object-Oriented**: Supports classes, objects, and major OOP principles.\n- **Cross-Platform**: Runs on Windows, macOS, and Linux.\n\n## 1.3 How Python Executes a Program\nConceptually:\n\\`\\`\\`text\nPython Source Code (.py) ──> Python Parser ──> Bytecode (.pyc) ──> PVM ──> Machine Output\n\\`\\`\\`\n\n## 1.4 Variables & Basic Syntax\nA variable name refers to an object. In Python, variables are names bound to objects, not static memory boxes.\n- **Indentation Matters**: Python uses indentation (standard: 4 spaces) instead of curly braces \\`{}\\` to define blocks of code.\n- **Comments**: Single-line comments start with \\`#\\`. Multi-line comments can be implemented with triple-quoted strings (\\`\"\"\"\\`).\n- **Case-Sensitivity**: \\`name\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "2 Hours",
    "title": "Module 2: Variables & Data Types",
    "courseId": "python-through-oops-course-id",
    "order": 2,
    "orderIndex": 2,
    "description": "Variables assignment, identifiers rules, dynamic typing, numeric/text/boolean types, and mutability vs immutability.",
    "id": "python-mod-2",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 2: Variables & Data Types Complete Notes.",
        "moduleId": "python-mod-2",
        "title": "Module 2 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 2: Variables & Data Types\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Dynamically declare and assign variables.\n- Know rules for valid Python identifiers.\n- Identify core data types: int, float, complex, bool, str, None.\n- Check object types using type() and isinstance().\n- Distinguish mutable and immutable objects.\n\n## 2.1 Variables & Identifiers\nA variable is a name bound to an object.\n- **Identifier Rules**:\n- Can contain letters, digits, and underscores.\n- Cannot start with a digit.\n- Cannot be a Python keyword (e.g., \\`class\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 2: Variables & Data Types",
        "id": "python-unit-2-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 2: Variables & Data Types\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Dynamically declare and assign variables.\n- Know rules for valid Python identifiers.\n- Identify core data types: int, float, complex, bool, str, None.\n- Check object types using type() and isinstance().\n- Distinguish mutable and immutable objects.\n\n## 2.1 Variables & Identifiers\nA variable is a name bound to an object.\n- **Identifier Rules**:\n- Can contain letters, digits, and underscores.\n- Cannot start with a digit.\n- Cannot be a Python keyword (e.g., \\`class\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-2-topic-1",
        "title": "Module 2: Variables & Data Types Units",
        "description": "Variables assignment, identifiers rules, dynamic typing, numeric/text/boolean types, and mutability vs immutability.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "python-unit-2-notes",
            "title": "Module 2 - Complete Notes",
            "description": "Module 2: Variables & Data Types Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 2: Variables & Data Types\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Dynamically declare and assign variables.\n- Know rules for valid Python identifiers.\n- Identify core data types: int, float, complex, bool, str, None.\n- Check object types using type() and isinstance().\n- Distinguish mutable and immutable objects.\n\n## 2.1 Variables & Identifiers\nA variable is a name bound to an object.\n- **Identifier Rules**:\n- Can contain letters, digits, and underscores.\n- Cannot start with a digit.\n- Cannot be a Python keyword (e.g., \\`class\\\n",
            "content": "\n\n# Module 2: Variables & Data Types\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Dynamically declare and assign variables.\n- Know rules for valid Python identifiers.\n- Identify core data types: int, float, complex, bool, str, None.\n- Check object types using type() and isinstance().\n- Distinguish mutable and immutable objects.\n\n## 2.1 Variables & Identifiers\nA variable is a name bound to an object.\n- **Identifier Rules**:\n- Can contain letters, digits, and underscores.\n- Cannot start with a digit.\n- Cannot be a Python keyword (e.g., \\`class\\\n",
            "conceptTheory": "\n\n# Module 2: Variables & Data Types\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Dynamically declare and assign variables.\n- Know rules for valid Python identifiers.\n- Identify core data types: int, float, complex, bool, str, None.\n- Check object types using type() and isinstance().\n- Distinguish mutable and immutable objects.\n\n## 2.1 Variables & Identifiers\nA variable is a name bound to an object.\n- **Identifier Rules**:\n- Can contain letters, digits, and underscores.\n- Cannot start with a digit.\n- Cannot be a Python keyword (e.g., \\`class\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "2 Hours",
    "title": "Module 3: Operators",
    "courseId": "python-through-oops-course-id",
    "order": 3,
    "orderIndex": 3,
    "description": "Arithmetic, comparison, assignment, logical short-circuit, bitwise, membership, identity, and precedence rules.",
    "id": "python-mod-3",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 3: Operators Complete Notes.",
        "moduleId": "python-mod-3",
        "title": "Module 3 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 3: Operators\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Apply arithmetic, comparison, and assignment operators.\n- Write logical expressions and understand short-circuit evaluation.\n- Understand bitwise operations and shifting.\n- Use membership (in) and identity (is) operators.\n- Solve expressions according to operator precedence rules.\n\n## 3.1 Operator Categories 1. **Arithmetic**: \\`+\\network\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 3: Operators",
        "id": "python-unit-3-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 3: Operators\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Apply arithmetic, comparison, and assignment operators.\n- Write logical expressions and understand short-circuit evaluation.\n- Understand bitwise operations and shifting.\n- Use membership (in) and identity (is) operators.\n- Solve expressions according to operator precedence rules.\n\n## 3.1 Operator Categories 1. **Arithmetic**: \\`+\\network\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-3-topic-1",
        "title": "Module 3: Operators Units",
        "description": "Arithmetic, comparison, assignment, logical short-circuit, bitwise, membership, identity, and precedence rules.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "python-unit-3-notes",
            "title": "Module 3 - Complete Notes",
            "description": "Module 3: Operators Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 3: Operators\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Apply arithmetic, comparison, and assignment operators.\n- Write logical expressions and understand short-circuit evaluation.\n- Understand bitwise operations and shifting.\n- Use membership (in) and identity (is) operators.\n- Solve expressions according to operator precedence rules.\n\n## 3.1 Operator Categories\n1. **Arithmetic**: \\`+\\network\\\n",
            "content": "\n\n# Module 3: Operators\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Apply arithmetic, comparison, and assignment operators.\n- Write logical expressions and understand short-circuit evaluation.\n- Understand bitwise operations and shifting.\n- Use membership (in) and identity (is) operators.\n- Solve expressions according to operator precedence rules.\n\n## 3.1 Operator Categories\n1. **Arithmetic**: \\`+\\network\\\n",
            "conceptTheory": "\n\n# Module 3: Operators\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Apply arithmetic, comparison, and assignment operators.\n- Write logical expressions and understand short-circuit evaluation.\n- Understand bitwise operations and shifting.\n- Use membership (in) and identity (is) operators.\n- Solve expressions according to operator precedence rules.\n\n## 3.1 Operator Categories\n1. **Arithmetic**: \\`+\\network\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "2 Hours",
    "title": "Module 4: Input, Output & Basic Programs",
    "courseId": "python-through-oops-course-id",
    "order": 4,
    "orderIndex": 4,
    "description": "Input casting, print sep/end formatting, f-strings, swapping, digit extracting, and time/interest scripts.",
    "id": "python-mod-4",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 4: Input, Output & Basic Programs Complete Notes.",
        "moduleId": "python-mod-4",
        "title": "Module 4 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 4: Input, Output & Basic Programs\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Implement formatted outputs with f-strings and format specifiers.\n- Read multiple values in a single line using split() and map().\n- Build mathematical calculations: Area, perimeter, swapping, time conversion, salary split.\n- Trace algorithms using standard program flowcharts.\n\n## 4.1 Advanced Input and Output\n- **f-Strings**: Use curly braces \\`{}\\` inside an f-prefixed string to format variables and expressions.\n- *Example*: \\`print(f\"Price = {price:.2f}\")\\` formats to 2 decimal places.\n- **Multiple Inputs**:\n- \\`a, b = input(\"Enter two words: \").split()\\`\n- \\`a, b = map(int, input(\"Enter two numbers: \").split())\\`\n\n## 4.2 Core Mathematical Programs\n- **Swapping**:\n- Unpacking swap: \\`a, b = b, a\\` (no temp variable needed).\n- Traditional swap: \\`temp = a; a = b; b = temp\\`.\n- **Digit Manipulations**:\n- Last digit: \\`digit = number % 10\\`\n- Remove last digit: \\`number = number // 10\\`\n- **Conversions**:\n- Minutes to hours: \\`hours = minutes // 60\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 4: Input, Output & Basic Programs",
        "id": "python-unit-4-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 4: Input, Output & Basic Programs\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Implement formatted outputs with f-strings and format specifiers.\n- Read multiple values in a single line using split() and map().\n- Build mathematical calculations: Area, perimeter, swapping, time conversion, salary split.\n- Trace algorithms using standard program flowcharts.\n\n## 4.1 Advanced Input and Output\n- **f-Strings**: Use curly braces \\`{}\\` inside an f-prefixed string to format variables and expressions.\n- *Example*: \\`print(f\"Price = {price:.2f}\")\\` formats to 2 decimal places.\n- **Multiple Inputs**:\n- \\`a, b = input(\"Enter two words: \").split()\\`\n- \\`a, b = map(int, input(\"Enter two numbers: \").split())\\`\n\n## 4.2 Core Mathematical Programs\n- **Swapping**:\n- Unpacking swap: \\`a, b = b, a\\` (no temp variable needed).\n- Traditional swap: \\`temp = a; a = b; b = temp\\`.\n- **Digit Manipulations**:\n- Last digit: \\`digit = number % 10\\`\n- Remove last digit: \\`number = number // 10\\`\n- **Conversions**:\n- Minutes to hours: \\`hours = minutes // 60\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-4-topic-1",
        "title": "Module 4: Input, Output & Basic Programs Units",
        "description": "Input casting, print sep/end formatting, f-strings, swapping, digit extracting, and time/interest scripts.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "python-unit-4-notes",
            "title": "Module 4 - Complete Notes",
            "description": "Module 4: Input, Output & Basic Programs Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 4: Input, Output & Basic Programs\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Implement formatted outputs with f-strings and format specifiers.\n- Read multiple values in a single line using split() and map().\n- Build mathematical calculations: Area, perimeter, swapping, time conversion, salary split.\n- Trace algorithms using standard program flowcharts.\n\n## 4.1 Advanced Input and Output\n- **f-Strings**: Use curly braces \\`{}\\` inside an f-prefixed string to format variables and expressions.\n- *Example*: \\`print(f\"Price = {price:.2f}\")\\` formats to 2 decimal places.\n- **Multiple Inputs**:\n- \\`a, b = input(\"Enter two words: \").split()\\`\n- \\`a, b = map(int, input(\"Enter two numbers: \").split())\\`\n\n## 4.2 Core Mathematical Programs\n- **Swapping**:\n- Unpacking swap: \\`a, b = b, a\\` (no temp variable needed).\n- Traditional swap: \\`temp = a; a = b; b = temp\\`.\n- **Digit Manipulations**:\n- Last digit: \\`digit = number % 10\\`\n- Remove last digit: \\`number = number // 10\\`\n- **Conversions**:\n- Minutes to hours: \\`hours = minutes // 60\\\n",
            "content": "\n\n# Module 4: Input, Output & Basic Programs\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Implement formatted outputs with f-strings and format specifiers.\n- Read multiple values in a single line using split() and map().\n- Build mathematical calculations: Area, perimeter, swapping, time conversion, salary split.\n- Trace algorithms using standard program flowcharts.\n\n## 4.1 Advanced Input and Output\n- **f-Strings**: Use curly braces \\`{}\\` inside an f-prefixed string to format variables and expressions.\n- *Example*: \\`print(f\"Price = {price:.2f}\")\\` formats to 2 decimal places.\n- **Multiple Inputs**:\n- \\`a, b = input(\"Enter two words: \").split()\\`\n- \\`a, b = map(int, input(\"Enter two numbers: \").split())\\`\n\n## 4.2 Core Mathematical Programs\n- **Swapping**:\n- Unpacking swap: \\`a, b = b, a\\` (no temp variable needed).\n- Traditional swap: \\`temp = a; a = b; b = temp\\`.\n- **Digit Manipulations**:\n- Last digit: \\`digit = number % 10\\`\n- Remove last digit: \\`number = number // 10\\`\n- **Conversions**:\n- Minutes to hours: \\`hours = minutes // 60\\\n",
            "conceptTheory": "\n\n# Module 4: Input, Output & Basic Programs\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Implement formatted outputs with f-strings and format specifiers.\n- Read multiple values in a single line using split() and map().\n- Build mathematical calculations: Area, perimeter, swapping, time conversion, salary split.\n- Trace algorithms using standard program flowcharts.\n\n## 4.1 Advanced Input and Output\n- **f-Strings**: Use curly braces \\`{}\\` inside an f-prefixed string to format variables and expressions.\n- *Example*: \\`print(f\"Price = {price:.2f}\")\\` formats to 2 decimal places.\n- **Multiple Inputs**:\n- \\`a, b = input(\"Enter two words: \").split()\\`\n- \\`a, b = map(int, input(\"Enter two numbers: \").split())\\`\n\n## 4.2 Core Mathematical Programs\n- **Swapping**:\n- Unpacking swap: \\`a, b = b, a\\` (no temp variable needed).\n- Traditional swap: \\`temp = a; a = b; b = temp\\`.\n- **Digit Manipulations**:\n- Last digit: \\`digit = number % 10\\`\n- Remove last digit: \\`number = number // 10\\`\n- **Conversions**:\n- Minutes to hours: \\`hours = minutes // 60\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "2 Hours",
    "title": "Module 5: Conditional Statements",
    "courseId": "python-through-oops-course-id",
    "order": 5,
    "orderIndex": 5,
    "description": "If-elif-else branches, nesting, conditional expressions (ternary), truthy/falsy objects, and range/ATM checks.",
    "id": "python-mod-5",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 5: Conditional Statements Complete Notes.",
        "moduleId": "python-mod-5",
        "title": "Module 5 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 5: Conditional Statements\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Use conditional flows: if, if-else, and if-elif-else ladders.\n- Control conditions with nested blocks and logical operators.\n- Write concise conditions with conditional expressions (ternary operators).\n- Understand truthy and falsy rules for non-boolean types.\n\n## 5.1 Conditional syntax\n- **\\`if\\` Statement**: Runs a block if a condition is \\`True\\`.\n- **\\`if-else\\`**: Offers a binary choice.\n- **\\`if-elif-else\\`**: Handles multiple mutually exclusive conditions.\n- *Important*: Conditions are checked from top to bottom. The first matching branch is executed, and others are skipped.\n\n## 5.2 Conditional Expressions\nTernary shorthand syntax: \\`\\`\\`python value_if_true if condition else value_if_false \\`\\`\\`\n- *Example*: \\`result = \"Adult\" if age >= 18 else \"Minor\"\\`\n\n## 5.3 Truthy & Falsy Values\nIn Python, objects evaluate to \\`True\\` or \\`False\\` in conditional contexts.\n- **Falsy Values**:\n- \\`False\\`\n- \\`None\\`\n- \\`0\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 5: Conditional Statements",
        "id": "python-unit-5-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 5: Conditional Statements\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Use conditional flows: if, if-else, and if-elif-else ladders.\n- Control conditions with nested blocks and logical operators.\n- Write concise conditions with conditional expressions (ternary operators).\n- Understand truthy and falsy rules for non-boolean types.\n\n## 5.1 Conditional syntax\n- **\\`if\\` Statement**: Runs a block if a condition is \\`True\\`.\n- **\\`if-else\\`**: Offers a binary choice.\n- **\\`if-elif-else\\`**: Handles multiple mutually exclusive conditions.\n- *Important*: Conditions are checked from top to bottom. The first matching branch is executed, and others are skipped.\n\n## 5.2 Conditional Expressions\nTernary shorthand syntax: \\`\\`\\`python value_if_true if condition else value_if_false \\`\\`\\`\n- *Example*: \\`result = \"Adult\" if age >= 18 else \"Minor\"\\`\n\n## 5.3 Truthy & Falsy Values\nIn Python, objects evaluate to \\`True\\` or \\`False\\` in conditional contexts.\n- **Falsy Values**:\n- \\`False\\`\n- \\`None\\`\n- \\`0\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-5-topic-1",
        "title": "Module 5: Conditional Statements Units",
        "description": "If-elif-else branches, nesting, conditional expressions (ternary), truthy/falsy objects, and range/ATM checks.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "python-unit-5-notes",
            "title": "Module 5 - Complete Notes",
            "description": "Module 5: Conditional Statements Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 5: Conditional Statements\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Use conditional flows: if, if-else, and if-elif-else ladders.\n- Control conditions with nested blocks and logical operators.\n- Write concise conditions with conditional expressions (ternary operators).\n- Understand truthy and falsy rules for non-boolean types.\n\n## 5.1 Conditional syntax\n- **\\`if\\` Statement**: Runs a block if a condition is \\`True\\`.\n- **\\`if-else\\`**: Offers a binary choice.\n- **\\`if-elif-else\\`**: Handles multiple mutually exclusive conditions.\n- *Important*: Conditions are checked from top to bottom. The first matching branch is executed, and others are skipped.\n\n## 5.2 Conditional Expressions\nTernary shorthand syntax:\n\\`\\`\\`python\nvalue_if_true if condition else value_if_false\n\\`\\`\\`\n- *Example*: \\`result = \"Adult\" if age >= 18 else \"Minor\"\\`\n\n## 5.3 Truthy & Falsy Values\nIn Python, objects evaluate to \\`True\\` or \\`False\\` in conditional contexts.\n- **Falsy Values**:\n- \\`False\\`\n- \\`None\\`\n- \\`0\\\n",
            "content": "\n\n# Module 5: Conditional Statements\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Use conditional flows: if, if-else, and if-elif-else ladders.\n- Control conditions with nested blocks and logical operators.\n- Write concise conditions with conditional expressions (ternary operators).\n- Understand truthy and falsy rules for non-boolean types.\n\n## 5.1 Conditional syntax\n- **\\`if\\` Statement**: Runs a block if a condition is \\`True\\`.\n- **\\`if-else\\`**: Offers a binary choice.\n- **\\`if-elif-else\\`**: Handles multiple mutually exclusive conditions.\n- *Important*: Conditions are checked from top to bottom. The first matching branch is executed, and others are skipped.\n\n## 5.2 Conditional Expressions\nTernary shorthand syntax:\n\\`\\`\\`python\nvalue_if_true if condition else value_if_false\n\\`\\`\\`\n- *Example*: \\`result = \"Adult\" if age >= 18 else \"Minor\"\\`\n\n## 5.3 Truthy & Falsy Values\nIn Python, objects evaluate to \\`True\\` or \\`False\\` in conditional contexts.\n- **Falsy Values**:\n- \\`False\\`\n- \\`None\\`\n- \\`0\\\n",
            "conceptTheory": "\n\n# Module 5: Conditional Statements\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Use conditional flows: if, if-else, and if-elif-else ladders.\n- Control conditions with nested blocks and logical operators.\n- Write concise conditions with conditional expressions (ternary operators).\n- Understand truthy and falsy rules for non-boolean types.\n\n## 5.1 Conditional syntax\n- **\\`if\\` Statement**: Runs a block if a condition is \\`True\\`.\n- **\\`if-else\\`**: Offers a binary choice.\n- **\\`if-elif-else\\`**: Handles multiple mutually exclusive conditions.\n- *Important*: Conditions are checked from top to bottom. The first matching branch is executed, and others are skipped.\n\n## 5.2 Conditional Expressions\nTernary shorthand syntax:\n\\`\\`\\`python\nvalue_if_true if condition else value_if_false\n\\`\\`\\`\n- *Example*: \\`result = \"Adult\" if age >= 18 else \"Minor\"\\`\n\n## 5.3 Truthy & Falsy Values\nIn Python, objects evaluate to \\`True\\` or \\`False\\` in conditional contexts.\n- **Falsy Values**:\n- \\`False\\`\n- \\`None\\`\n- \\`0\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "3 Hours",
    "title": "Module 6: Loops",
    "courseId": "python-through-oops-course-id",
    "order": 6,
    "orderIndex": 6,
    "description": "For, while loops, range step sequences, loop-else blocks, break/continue, pattern printing, and prime checkers.",
    "id": "python-mod-6",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 6: Loops Complete Notes.",
        "moduleId": "python-mod-6",
        "title": "Module 6 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 6: Loops\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Control repetitive executions using for and while loops.\n- Use range() with positive, negative, and custom step parameters.\n- Break and continue loops based on runtime events.\n- Implement loop-else blocks for conditional post-loop processing.\n- Write pattern printing and digit analysis scripts.\n\n## 6.1 Loop Constructs\n- **\\`for\\` Loop**: Iterates over an sequence/iterable (lists, strings, ranges).\n- **\\`while\\` Loop**: Repeats as long as a condition remains true. Always update the condition variable to avoid infinite loops.\n\n## 6.2 Range Generation\n- **\\`range(stop)\\`**: Generates integers from 0 to \\`stop - 1\\`.\n- **\\`range(start, stop)\\`**: Generates integers from \\`start\\` to \\`stop - 1\\`.\n- **\\`range(start, stop, step)\\`**: Increments by \\`step\\`.\n- *Negative Step*: \\`range(5, 0, -1)\\` yields \\`5, 4, 3, 2, 1\\`.\n\n## 6.3 Loop Control\n- **\\`break\\`**: Immediately terminates the nearest enclosing loop.\n- **\\`continue\\`**: Skips the rest of the current iteration and jumps to the next loop evaluation.\n- **\\`pass\\`**: A null statement placeholder. Used for empty syntax blocks.\n- **Loop \\`else\\`**: Executes when the loop terminates normally (without hitting a \\`break\\` statement).\n\n## 6.4 Practical Lab Exercises\n- **Task 1**: Write a prime number checker using a loop-else block.\n- **Task 2**: Print a right-aligned triangle pattern of asterisks.",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 6: Loops",
        "id": "python-unit-6-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 6: Loops\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Control repetitive executions using for and while loops.\n- Use range() with positive, negative, and custom step parameters.\n- Break and continue loops based on runtime events.\n- Implement loop-else blocks for conditional post-loop processing.\n- Write pattern printing and digit analysis scripts.\n\n## 6.1 Loop Constructs\n- **\\`for\\` Loop**: Iterates over an sequence/iterable (lists, strings, ranges).\n- **\\`while\\` Loop**: Repeats as long as a condition remains true. Always update the condition variable to avoid infinite loops.\n\n## 6.2 Range Generation\n- **\\`range(stop)\\`**: Generates integers from 0 to \\`stop - 1\\`.\n- **\\`range(start, stop)\\`**: Generates integers from \\`start\\` to \\`stop - 1\\`.\n- **\\`range(start, stop, step)\\`**: Increments by \\`step\\`.\n- *Negative Step*: \\`range(5, 0, -1)\\` yields \\`5, 4, 3, 2, 1\\`.\n\n## 6.3 Loop Control\n- **\\`break\\`**: Immediately terminates the nearest enclosing loop.\n- **\\`continue\\`**: Skips the rest of the current iteration and jumps to the next loop evaluation.\n- **\\`pass\\`**: A null statement placeholder. Used for empty syntax blocks.\n- **Loop \\`else\\`**: Executes when the loop terminates normally (without hitting a \\`break\\` statement).\n\n## 6.4 Practical Lab Exercises\n- **Task 1**: Write a prime number checker using a loop-else block.\n- **Task 2**: Print a right-aligned triangle pattern of asterisks."
      }
    ],
    "topics": [
      {
        "id": "python-mod-6-topic-1",
        "title": "Module 6: Loops Units",
        "description": "For, while loops, range step sequences, loop-else blocks, break/continue, pattern printing, and prime checkers.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "python-unit-6-notes",
            "title": "Module 6 - Complete Notes",
            "description": "Module 6: Loops Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 6: Loops\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Control repetitive executions using for and while loops.\n- Use range() with positive, negative, and custom step parameters.\n- Break and continue loops based on runtime events.\n- Implement loop-else blocks for conditional post-loop processing.\n- Write pattern printing and digit analysis scripts.\n\n## 6.1 Loop Constructs\n- **\\`for\\` Loop**: Iterates over an sequence/iterable (lists, strings, ranges).\n- **\\`while\\` Loop**: Repeats as long as a condition remains true. Always update the condition variable to avoid infinite loops.\n\n## 6.2 Range Generation\n- **\\`range(stop)\\`**: Generates integers from 0 to \\`stop - 1\\`.\n- **\\`range(start, stop)\\`**: Generates integers from \\`start\\` to \\`stop - 1\\`.\n- **\\`range(start, stop, step)\\`**: Increments by \\`step\\`.\n- *Negative Step*: \\`range(5, 0, -1)\\` yields \\`5, 4, 3, 2, 1\\`.\n\n## 6.3 Loop Control\n- **\\`break\\`**: Immediately terminates the nearest enclosing loop.\n- **\\`continue\\`**: Skips the rest of the current iteration and jumps to the next loop evaluation.\n- **\\`pass\\`**: A null statement placeholder. Used for empty syntax blocks.\n- **Loop \\`else\\`**: Executes when the loop terminates normally (without hitting a \\`break\\` statement).\n\n## 6.4 Practical Lab Exercises\n- **Task 1**: Write a prime number checker using a loop-else block.\n- **Task 2**: Print a right-aligned triangle pattern of asterisks.\n\n",
            "content": "\n\n# Module 6: Loops\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Control repetitive executions using for and while loops.\n- Use range() with positive, negative, and custom step parameters.\n- Break and continue loops based on runtime events.\n- Implement loop-else blocks for conditional post-loop processing.\n- Write pattern printing and digit analysis scripts.\n\n## 6.1 Loop Constructs\n- **\\`for\\` Loop**: Iterates over an sequence/iterable (lists, strings, ranges).\n- **\\`while\\` Loop**: Repeats as long as a condition remains true. Always update the condition variable to avoid infinite loops.\n\n## 6.2 Range Generation\n- **\\`range(stop)\\`**: Generates integers from 0 to \\`stop - 1\\`.\n- **\\`range(start, stop)\\`**: Generates integers from \\`start\\` to \\`stop - 1\\`.\n- **\\`range(start, stop, step)\\`**: Increments by \\`step\\`.\n- *Negative Step*: \\`range(5, 0, -1)\\` yields \\`5, 4, 3, 2, 1\\`.\n\n## 6.3 Loop Control\n- **\\`break\\`**: Immediately terminates the nearest enclosing loop.\n- **\\`continue\\`**: Skips the rest of the current iteration and jumps to the next loop evaluation.\n- **\\`pass\\`**: A null statement placeholder. Used for empty syntax blocks.\n- **Loop \\`else\\`**: Executes when the loop terminates normally (without hitting a \\`break\\` statement).\n\n## 6.4 Practical Lab Exercises\n- **Task 1**: Write a prime number checker using a loop-else block.\n- **Task 2**: Print a right-aligned triangle pattern of asterisks.\n\n",
            "conceptTheory": "\n\n# Module 6: Loops\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Control repetitive executions using for and while loops.\n- Use range() with positive, negative, and custom step parameters.\n- Break and continue loops based on runtime events.\n- Implement loop-else blocks for conditional post-loop processing.\n- Write pattern printing and digit analysis scripts.\n\n## 6.1 Loop Constructs\n- **\\`for\\` Loop**: Iterates over an sequence/iterable (lists, strings, ranges).\n- **\\`while\\` Loop**: Repeats as long as a condition remains true. Always update the condition variable to avoid infinite loops.\n\n## 6.2 Range Generation\n- **\\`range(stop)\\`**: Generates integers from 0 to \\`stop - 1\\`.\n- **\\`range(start, stop)\\`**: Generates integers from \\`start\\` to \\`stop - 1\\`.\n- **\\`range(start, stop, step)\\`**: Increments by \\`step\\`.\n- *Negative Step*: \\`range(5, 0, -1)\\` yields \\`5, 4, 3, 2, 1\\`.\n\n## 6.3 Loop Control\n- **\\`break\\`**: Immediately terminates the nearest enclosing loop.\n- **\\`continue\\`**: Skips the rest of the current iteration and jumps to the next loop evaluation.\n- **\\`pass\\`**: A null statement placeholder. Used for empty syntax blocks.\n- **Loop \\`else\\`**: Executes when the loop terminates normally (without hitting a \\`break\\` statement).\n\n## 6.4 Practical Lab Exercises\n- **Task 1**: Write a prime number checker using a loop-else block.\n- **Task 2**: Print a right-aligned triangle pattern of asterisks.\n\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "2 Hours",
    "title": "Module 7: Strings",
    "courseId": "python-through-oops-course-id",
    "order": 7,
    "orderIndex": 7,
    "description": "String index positive/negative, slicing, immutability, built-in string methods, checks, and formatting.",
    "id": "python-mod-7",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 7: Strings Complete Notes.",
        "moduleId": "python-mod-7",
        "title": "Module 7 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 7: Strings\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Index and slice strings (including reversing with step parameters).\n- Detail why strings are immutable and create modified copies.\n- Use basic string methods: lower, upper, strip, replace, split, join.\n- Identify character subclasses (isalpha, isdigit, isalnum).\n- Form escape characters and raw strings.\n\n## 7.1 String Properties & Slicing\nStrings are immutable character sequences.\n- **Indexing**: Support positive (\\`0\\` to \\`N-1\\`) and negative (\\`-1\\` to \\`-N\\`) indices.\n- **Slicing**: \\`string[start:stop:step]\\` (the \\`stop\\` index is excluded).\n- *Reversing*: \\`text[::-1]\\` creates a reversed copy.\n- **Immutability**: You cannot modify characters directly (\\`text[0] = \"A\"\\` raises a TypeError). Reassign instead: \\`text = \"A\" + text[1:]\\`.\n\n## 7.2 String Methods\n- **Case conversion**: \\`lower()\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 7: Strings",
        "id": "python-unit-7-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 7: Strings\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Index and slice strings (including reversing with step parameters).\n- Detail why strings are immutable and create modified copies.\n- Use basic string methods: lower, upper, strip, replace, split, join.\n- Identify character subclasses (isalpha, isdigit, isalnum).\n- Form escape characters and raw strings.\n\n## 7.1 String Properties & Slicing\nStrings are immutable character sequences.\n- **Indexing**: Support positive (\\`0\\` to \\`N-1\\`) and negative (\\`-1\\` to \\`-N\\`) indices.\n- **Slicing**: \\`string[start:stop:step]\\` (the \\`stop\\` index is excluded).\n- *Reversing*: \\`text[::-1]\\` creates a reversed copy.\n- **Immutability**: You cannot modify characters directly (\\`text[0] = \"A\"\\` raises a TypeError). Reassign instead: \\`text = \"A\" + text[1:]\\`.\n\n## 7.2 String Methods\n- **Case conversion**: \\`lower()\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-7-topic-1",
        "title": "Module 7: Strings Units",
        "description": "String index positive/negative, slicing, immutability, built-in string methods, checks, and formatting.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "python-unit-7-notes",
            "title": "Module 7 - Complete Notes",
            "description": "Module 7: Strings Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 7: Strings\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Index and slice strings (including reversing with step parameters).\n- Detail why strings are immutable and create modified copies.\n- Use basic string methods: lower, upper, strip, replace, split, join.\n- Identify character subclasses (isalpha, isdigit, isalnum).\n- Form escape characters and raw strings.\n\n## 7.1 String Properties & Slicing\nStrings are immutable character sequences.\n- **Indexing**: Support positive (\\`0\\` to \\`N-1\\`) and negative (\\`-1\\` to \\`-N\\`) indices.\n- **Slicing**: \\`string[start:stop:step]\\` (the \\`stop\\` index is excluded).\n- *Reversing*: \\`text[::-1]\\` creates a reversed copy.\n- **Immutability**: You cannot modify characters directly (\\`text[0] = \"A\"\\` raises a TypeError). Reassign instead: \\`text = \"A\" + text[1:]\\`.\n\n## 7.2 String Methods\n- **Case conversion**: \\`lower()\\\n",
            "content": "\n\n# Module 7: Strings\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Index and slice strings (including reversing with step parameters).\n- Detail why strings are immutable and create modified copies.\n- Use basic string methods: lower, upper, strip, replace, split, join.\n- Identify character subclasses (isalpha, isdigit, isalnum).\n- Form escape characters and raw strings.\n\n## 7.1 String Properties & Slicing\nStrings are immutable character sequences.\n- **Indexing**: Support positive (\\`0\\` to \\`N-1\\`) and negative (\\`-1\\` to \\`-N\\`) indices.\n- **Slicing**: \\`string[start:stop:step]\\` (the \\`stop\\` index is excluded).\n- *Reversing*: \\`text[::-1]\\` creates a reversed copy.\n- **Immutability**: You cannot modify characters directly (\\`text[0] = \"A\"\\` raises a TypeError). Reassign instead: \\`text = \"A\" + text[1:]\\`.\n\n## 7.2 String Methods\n- **Case conversion**: \\`lower()\\\n",
            "conceptTheory": "\n\n# Module 7: Strings\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Index and slice strings (including reversing with step parameters).\n- Detail why strings are immutable and create modified copies.\n- Use basic string methods: lower, upper, strip, replace, split, join.\n- Identify character subclasses (isalpha, isdigit, isalnum).\n- Form escape characters and raw strings.\n\n## 7.1 String Properties & Slicing\nStrings are immutable character sequences.\n- **Indexing**: Support positive (\\`0\\` to \\`N-1\\`) and negative (\\`-1\\` to \\`-N\\`) indices.\n- **Slicing**: \\`string[start:stop:step]\\` (the \\`stop\\` index is excluded).\n- *Reversing*: \\`text[::-1]\\` creates a reversed copy.\n- **Immutability**: You cannot modify characters directly (\\`text[0] = \"A\"\\` raises a TypeError). Reassign instead: \\`text = \"A\" + text[1:]\\`.\n\n## 7.2 String Methods\n- **Case conversion**: \\`lower()\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "3 Hours",
    "title": "Module 8: Python Collections",
    "courseId": "python-through-oops-course-id",
    "order": 8,
    "orderIndex": 8,
    "description": "Lists, tuples, sets, dictionaries definitions, methods, differences, list comprehensions, and nested collections.",
    "id": "python-mod-8",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 8: Python Collections Complete Notes.",
        "moduleId": "python-mod-8",
        "title": "Module 8 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 8: Python Collections\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Identify and contrast four major collections: Lists, Tuples, Sets, Dictionaries.\n- Perform modifications, insertions, deletions, and lookups on collections.\n- Construct list, set, and dictionary comprehensions.\n- Count frequencies and perform union/intersection set operations.\n\n## 8.1 Comparison of Collections\n| Collection | Syntax | Ordered | Mutable | Duplicates | Access method |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| **List** | \\`[]\\` | Yes | Yes | Yes | Indexing |\n| **Tuple** | \\`()\\` | Yes | No | Yes | Indexing |\n| **Set** | \\`{}\\` (or \\`set()\\`) | No | Yes | No | Unindexed |\n| **Dictionary**| \\`{key: value}\\` | Yes (insertion) | Yes | Keys: No | Key lookup |\n\n##\n\n## 8.2 List & Tuple Methods\n- **List additions**: \\`append(x)\\` (adds one object), \\`insert(idx, x)\\` (adds at index), \\`extend(iterable)\\` (merges elements).\n- **List deletions**: \\`remove(val)\\` (removes first match), \\`pop(idx)\\` (removes and returns at index), \\`clear()\\` (empties list), \\`del\\` statement.\n- **Tuple Unpacking**: \\`a, b, c = student_tuple\\`.\n\n## 8.3 Set Operations\n- **Edits**: \\`add(x)\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 8: Python Collections",
        "id": "python-unit-8-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 8: Python Collections\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Identify and contrast four major collections: Lists, Tuples, Sets, Dictionaries.\n- Perform modifications, insertions, deletions, and lookups on collections.\n- Construct list, set, and dictionary comprehensions.\n- Count frequencies and perform union/intersection set operations.\n\n## 8.1 Comparison of Collections\n| Collection | Syntax | Ordered | Mutable | Duplicates | Access method |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| **List** | \\`[]\\` | Yes | Yes | Yes | Indexing |\n| **Tuple** | \\`()\\` | Yes | No | Yes | Indexing |\n| **Set** | \\`{}\\` (or \\`set()\\`) | No | Yes | No | Unindexed |\n| **Dictionary**| \\`{key: value}\\` | Yes (insertion) | Yes | Keys: No | Key lookup |\n\n##\n\n## 8.2 List & Tuple Methods\n- **List additions**: \\`append(x)\\` (adds one object), \\`insert(idx, x)\\` (adds at index), \\`extend(iterable)\\` (merges elements).\n- **List deletions**: \\`remove(val)\\` (removes first match), \\`pop(idx)\\` (removes and returns at index), \\`clear()\\` (empties list), \\`del\\` statement.\n- **Tuple Unpacking**: \\`a, b, c = student_tuple\\`.\n\n## 8.3 Set Operations\n- **Edits**: \\`add(x)\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-8-topic-1",
        "title": "Module 8: Python Collections Units",
        "description": "Lists, tuples, sets, dictionaries definitions, methods, differences, list comprehensions, and nested collections.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "python-unit-8-notes",
            "title": "Module 8 - Complete Notes",
            "description": "Module 8: Python Collections Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 8: Python Collections\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Identify and contrast four major collections: Lists, Tuples, Sets, Dictionaries.\n- Perform modifications, insertions, deletions, and lookups on collections.\n- Construct list, set, and dictionary comprehensions.\n- Count frequencies and perform union/intersection set operations.\n\n## 8.1 Comparison of Collections\n| Collection | Syntax | Ordered | Mutable | Duplicates | Access method |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| **List** | \\`[]\\` | Yes | Yes | Yes | Indexing |\n| **Tuple** | \\`()\\` | Yes | No | Yes | Indexing |\n| **Set** | \\`{}\\` (or \\`set()\\`) | No | Yes | No | Unindexed |\n| **Dictionary**| \\`{key: value}\\` | Yes (insertion) | Yes | Keys: No | Key lookup |\n\n## 8.2 List & Tuple Methods\n- **List additions**: \\`append(x)\\` (adds one object), \\`insert(idx, x)\\` (adds at index), \\`extend(iterable)\\` (merges elements).\n- **List deletions**: \\`remove(val)\\` (removes first match), \\`pop(idx)\\` (removes and returns at index), \\`clear()\\` (empties list), \\`del\\` statement.\n- **Tuple Unpacking**: \\`a, b, c = student_tuple\\`.\n\n## 8.3 Set Operations\n- **Edits**: \\`add(x)\\\n",
            "content": "\n\n# Module 8: Python Collections\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Identify and contrast four major collections: Lists, Tuples, Sets, Dictionaries.\n- Perform modifications, insertions, deletions, and lookups on collections.\n- Construct list, set, and dictionary comprehensions.\n- Count frequencies and perform union/intersection set operations.\n\n## 8.1 Comparison of Collections\n| Collection | Syntax | Ordered | Mutable | Duplicates | Access method |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| **List** | \\`[]\\` | Yes | Yes | Yes | Indexing |\n| **Tuple** | \\`()\\` | Yes | No | Yes | Indexing |\n| **Set** | \\`{}\\` (or \\`set()\\`) | No | Yes | No | Unindexed |\n| **Dictionary**| \\`{key: value}\\` | Yes (insertion) | Yes | Keys: No | Key lookup |\n\n## 8.2 List & Tuple Methods\n- **List additions**: \\`append(x)\\` (adds one object), \\`insert(idx, x)\\` (adds at index), \\`extend(iterable)\\` (merges elements).\n- **List deletions**: \\`remove(val)\\` (removes first match), \\`pop(idx)\\` (removes and returns at index), \\`clear()\\` (empties list), \\`del\\` statement.\n- **Tuple Unpacking**: \\`a, b, c = student_tuple\\`.\n\n## 8.3 Set Operations\n- **Edits**: \\`add(x)\\\n",
            "conceptTheory": "\n\n# Module 8: Python Collections\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Identify and contrast four major collections: Lists, Tuples, Sets, Dictionaries.\n- Perform modifications, insertions, deletions, and lookups on collections.\n- Construct list, set, and dictionary comprehensions.\n- Count frequencies and perform union/intersection set operations.\n\n## 8.1 Comparison of Collections\n| Collection | Syntax | Ordered | Mutable | Duplicates | Access method |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| **List** | \\`[]\\` | Yes | Yes | Yes | Indexing |\n| **Tuple** | \\`()\\` | Yes | No | Yes | Indexing |\n| **Set** | \\`{}\\` (or \\`set()\\`) | No | Yes | No | Unindexed |\n| **Dictionary**| \\`{key: value}\\` | Yes (insertion) | Yes | Keys: No | Key lookup |\n\n## 8.2 List & Tuple Methods\n- **List additions**: \\`append(x)\\` (adds one object), \\`insert(idx, x)\\` (adds at index), \\`extend(iterable)\\` (merges elements).\n- **List deletions**: \\`remove(val)\\` (removes first match), \\`pop(idx)\\` (removes and returns at index), \\`clear()\\` (empties list), \\`del\\` statement.\n- **Tuple Unpacking**: \\`a, b, c = student_tuple\\`.\n\n## 8.3 Set Operations\n- **Edits**: \\`add(x)\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "3 Hours",
    "title": "Module 9: Functions",
    "courseId": "python-through-oops-course-id",
    "order": 9,
    "orderIndex": 9,
    "description": "Defining functions, parameters vs arguments, return value, default params, *args, **kwargs, scope, recursion, and lambdas.",
    "id": "python-mod-9",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 9: Functions Complete Notes.",
        "moduleId": "python-mod-9",
        "title": "Module 9 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 9: Functions\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Define functions using def and return results.\n- Distinguish between parameters (definitions) and arguments (calls).\n- Configure keyword, positional, and default arguments.\n- Access variable-length arguments with *args and **kwargs.\n- Detail variable scopes and the global keyword.\n- Implement recursion and construct lambda functions.\n\n## 9.1 Function Basics\n- A function is a reusable block of code.\n- **Parameters**: Variables listed in the function definition.\n- **Arguments**: Actual values passed during the call.\n- **Return**: Sends values back to the caller. A function without an explicit \\`return\\` returns \\`None\\`.\n\n## 9.2 Argument Configurations\n- **Default Parameters**: Must follow non-default parameters.\n- **Keyword Arguments**: Passed as \\`name=\"John\"\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 9: Functions",
        "id": "python-unit-9-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 9: Functions\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Define functions using def and return results.\n- Distinguish between parameters (definitions) and arguments (calls).\n- Configure keyword, positional, and default arguments.\n- Access variable-length arguments with *args and **kwargs.\n- Detail variable scopes and the global keyword.\n- Implement recursion and construct lambda functions.\n\n## 9.1 Function Basics\n- A function is a reusable block of code.\n- **Parameters**: Variables listed in the function definition.\n- **Arguments**: Actual values passed during the call.\n- **Return**: Sends values back to the caller. A function without an explicit \\`return\\` returns \\`None\\`.\n\n## 9.2 Argument Configurations\n- **Default Parameters**: Must follow non-default parameters.\n- **Keyword Arguments**: Passed as \\`name=\"John\"\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-9-topic-1",
        "title": "Module 9: Functions Units",
        "description": "Defining functions, parameters vs arguments, return value, default params, *args, **kwargs, scope, recursion, and lambdas.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "python-unit-9-notes",
            "title": "Module 9 - Complete Notes",
            "description": "Module 9: Functions Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 9: Functions\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Define functions using def and return results.\n- Distinguish between parameters (definitions) and arguments (calls).\n- Configure keyword, positional, and default arguments.\n- Access variable-length arguments with *args and **kwargs.\n- Detail variable scopes and the global keyword.\n- Implement recursion and construct lambda functions.\n\n## 9.1 Function Basics\n- A function is a reusable block of code.\n- **Parameters**: Variables listed in the function definition.\n- **Arguments**: Actual values passed during the call.\n- **Return**: Sends values back to the caller. A function without an explicit \\`return\\` returns \\`None\\`.\n\n## 9.2 Argument Configurations\n- **Default Parameters**: Must follow non-default parameters.\n- **Keyword Arguments**: Passed as \\`name=\"John\"\\\n",
            "content": "\n\n# Module 9: Functions\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Define functions using def and return results.\n- Distinguish between parameters (definitions) and arguments (calls).\n- Configure keyword, positional, and default arguments.\n- Access variable-length arguments with *args and **kwargs.\n- Detail variable scopes and the global keyword.\n- Implement recursion and construct lambda functions.\n\n## 9.1 Function Basics\n- A function is a reusable block of code.\n- **Parameters**: Variables listed in the function definition.\n- **Arguments**: Actual values passed during the call.\n- **Return**: Sends values back to the caller. A function without an explicit \\`return\\` returns \\`None\\`.\n\n## 9.2 Argument Configurations\n- **Default Parameters**: Must follow non-default parameters.\n- **Keyword Arguments**: Passed as \\`name=\"John\"\\\n",
            "conceptTheory": "\n\n# Module 9: Functions\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Define functions using def and return results.\n- Distinguish between parameters (definitions) and arguments (calls).\n- Configure keyword, positional, and default arguments.\n- Access variable-length arguments with *args and **kwargs.\n- Detail variable scopes and the global keyword.\n- Implement recursion and construct lambda functions.\n\n## 9.1 Function Basics\n- A function is a reusable block of code.\n- **Parameters**: Variables listed in the function definition.\n- **Arguments**: Actual values passed during the call.\n- **Return**: Sends values back to the caller. A function without an explicit \\`return\\` returns \\`None\\`.\n\n## 9.2 Argument Configurations\n- **Default Parameters**: Must follow non-default parameters.\n- **Keyword Arguments**: Passed as \\`name=\"John\"\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "2 Hours",
    "title": "Module 10: Modules, Packages & Exception Handling",
    "courseId": "python-through-oops-course-id",
    "order": 10,
    "orderIndex": 10,
    "description": "Modules import syntax, packages directory structures, try-except-else-finally blocks, raise exceptions, and asserts.",
    "id": "python-mod-10",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 10: Modules, Packages & Exception Handling Complete Notes.",
        "moduleId": "python-mod-10",
        "title": "Module 10 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 10: Modules, Packages & Exception Handling\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Import modules and packages using standard import statement layouts.\n- Understand __name__ == \"__main__\" for running standalone modules.\n- Identify common exception types: ValueError, TypeError, ZeroDivisionError, IndexError, KeyError, NameError, FileNotFoundError.\n- Protect code blocks using try, except, else, and finally blocks.\n- Raise exceptions and construct custom exception classes.\n\n## 10.1 Modules and Packages\n- **Module**: A Python file containing variables, functions, and classes.\n- **Package**: A folder containing modules. Standard packages contain an \\`__init__.py\\` file.\n- **Imports**: \\`import math\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 10: Modules, Packages & Exception Handling",
        "id": "python-unit-10-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 10: Modules, Packages & Exception Handling\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Import modules and packages using standard import statement layouts.\n- Understand __name__ == \"__main__\" for running standalone modules.\n- Identify common exception types: ValueError, TypeError, ZeroDivisionError, IndexError, KeyError, NameError, FileNotFoundError.\n- Protect code blocks using try, except, else, and finally blocks.\n- Raise exceptions and construct custom exception classes.\n\n## 10.1 Modules and Packages\n- **Module**: A Python file containing variables, functions, and classes.\n- **Package**: A folder containing modules. Standard packages contain an \\`__init__.py\\` file.\n- **Imports**: \\`import math\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-10-topic-1",
        "title": "Module 10: Modules, Packages & Exception Handling Units",
        "description": "Modules import syntax, packages directory structures, try-except-else-finally blocks, raise exceptions, and asserts.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "python-unit-10-notes",
            "title": "Module 10 - Complete Notes",
            "description": "Module 10: Modules, Packages & Exception Handling Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 10: Modules, Packages & Exception Handling\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Import modules and packages using standard import statement layouts.\n- Understand __name__ == \"__main__\" for running standalone modules.\n- Identify common exception types: ValueError, TypeError, ZeroDivisionError, IndexError, KeyError, NameError, FileNotFoundError.\n- Protect code blocks using try, except, else, and finally blocks.\n- Raise exceptions and construct custom exception classes.\n\n## 10.1 Modules and Packages\n- **Module**: A Python file containing variables, functions, and classes.\n- **Package**: A folder containing modules. Standard packages contain an \\`__init__.py\\` file.\n- **Imports**: \\`import math\\\n",
            "content": "\n\n# Module 10: Modules, Packages & Exception Handling\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Import modules and packages using standard import statement layouts.\n- Understand __name__ == \"__main__\" for running standalone modules.\n- Identify common exception types: ValueError, TypeError, ZeroDivisionError, IndexError, KeyError, NameError, FileNotFoundError.\n- Protect code blocks using try, except, else, and finally blocks.\n- Raise exceptions and construct custom exception classes.\n\n## 10.1 Modules and Packages\n- **Module**: A Python file containing variables, functions, and classes.\n- **Package**: A folder containing modules. Standard packages contain an \\`__init__.py\\` file.\n- **Imports**: \\`import math\\\n",
            "conceptTheory": "\n\n# Module 10: Modules, Packages & Exception Handling\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Import modules and packages using standard import statement layouts.\n- Understand __name__ == \"__main__\" for running standalone modules.\n- Identify common exception types: ValueError, TypeError, ZeroDivisionError, IndexError, KeyError, NameError, FileNotFoundError.\n- Protect code blocks using try, except, else, and finally blocks.\n- Raise exceptions and construct custom exception classes.\n\n## 10.1 Modules and Packages\n- **Module**: A Python file containing variables, functions, and classes.\n- **Package**: A folder containing modules. Standard packages contain an \\`__init__.py\\` file.\n- **Imports**: \\`import math\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "2 Hours",
    "title": "Module 11: File Handling",
    "courseId": "python-through-oops-course-id",
    "order": 11,
    "orderIndex": 11,
    "description": "File streams open modes, read, readline, write, append, with context managers, seek/tell pointers, and CSV.",
    "id": "python-mod-11",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 11: File Handling Complete Notes.",
        "moduleId": "python-mod-11",
        "title": "Module 11 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 11: File Handling\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Open, read, write, append, and close files.\n- List file modes: r, w, a, x, b, t.\n- Implement robust stream closures using context managers (with statement).\n- Track and seek file pointers using seek() and tell().\n- Perform CSV reading and writing with DictReader and DictWriter.\n\n## 11.1 File Modes\n- \\`r\\`: Read (default). Error if file does not exist.\n- \\`w\\`: Write (truncates existing file).\n- \\`a\\`: Append (preserves contents).\n- \\`x\\`: Create (fails if file exists).\n- \\`b\\`: Binary mode (e.g., \\`rb\\`).\n- \\`t\\`: Text mode (default).\n\n## 11.2 Reading and Writing\n- **Standard**:\n- \\`read(size)\\`: Reads file contents.\n- \\`readline()\\`: Reads one line.\n- \\`readlines()\\`: Reads all lines as a list of strings.\n- \\`write(text)\\`: Writes string to file.\n- **Context Manager**: Automatically closes files.\n\\`\\`\\`python with open(\"data.txt\", \"r\", encoding=\"utf-8\") as file: content = file.read() \\`\\`\\`\n\n## 11.3 File Pointer & CSVs\n- **\\`tell()\\`**: Returns current position of file pointer.\n- **\\`seek(offset)\\`**: Moves file pointer to a specific byte location.\n- **CSV Handling**:\n- \\`csv.reader(file)\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 11: File Handling",
        "id": "python-unit-11-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 11: File Handling\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Open, read, write, append, and close files.\n- List file modes: r, w, a, x, b, t.\n- Implement robust stream closures using context managers (with statement).\n- Track and seek file pointers using seek() and tell().\n- Perform CSV reading and writing with DictReader and DictWriter.\n\n## 11.1 File Modes\n- \\`r\\`: Read (default). Error if file does not exist.\n- \\`w\\`: Write (truncates existing file).\n- \\`a\\`: Append (preserves contents).\n- \\`x\\`: Create (fails if file exists).\n- \\`b\\`: Binary mode (e.g., \\`rb\\`).\n- \\`t\\`: Text mode (default).\n\n## 11.2 Reading and Writing\n- **Standard**:\n- \\`read(size)\\`: Reads file contents.\n- \\`readline()\\`: Reads one line.\n- \\`readlines()\\`: Reads all lines as a list of strings.\n- \\`write(text)\\`: Writes string to file.\n- **Context Manager**: Automatically closes files.\n\\`\\`\\`python with open(\"data.txt\", \"r\", encoding=\"utf-8\") as file: content = file.read() \\`\\`\\`\n\n## 11.3 File Pointer & CSVs\n- **\\`tell()\\`**: Returns current position of file pointer.\n- **\\`seek(offset)\\`**: Moves file pointer to a specific byte location.\n- **CSV Handling**:\n- \\`csv.reader(file)\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-11-topic-1",
        "title": "Module 11: File Handling Units",
        "description": "File streams open modes, read, readline, write, append, with context managers, seek/tell pointers, and CSV.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "python-unit-11-notes",
            "title": "Module 11 - Complete Notes",
            "description": "Module 11: File Handling Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 11: File Handling\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Open, read, write, append, and close files.\n- List file modes: r, w, a, x, b, t.\n- Implement robust stream closures using context managers (with statement).\n- Track and seek file pointers using seek() and tell().\n- Perform CSV reading and writing with DictReader and DictWriter.\n\n## 11.1 File Modes\n- \\`r\\`: Read (default). Error if file does not exist.\n- \\`w\\`: Write (truncates existing file).\n- \\`a\\`: Append (preserves contents).\n- \\`x\\`: Create (fails if file exists).\n- \\`b\\`: Binary mode (e.g., \\`rb\\`).\n- \\`t\\`: Text mode (default).\n\n## 11.2 Reading and Writing\n- **Standard**:\n- \\`read(size)\\`: Reads file contents.\n- \\`readline()\\`: Reads one line.\n- \\`readlines()\\`: Reads all lines as a list of strings.\n- \\`write(text)\\`: Writes string to file.\n- **Context Manager**: Automatically closes files.\n  \\`\\`\\`python\n  with open(\"data.txt\", \"r\", encoding=\"utf-8\") as file:\n      content = file.read()\n  \\`\\`\\`\n\n## 11.3 File Pointer & CSVs\n- **\\`tell()\\`**: Returns current position of file pointer.\n- **\\`seek(offset)\\`**: Moves file pointer to a specific byte location.\n- **CSV Handling**:\n- \\`csv.reader(file)\\\n",
            "content": "\n\n# Module 11: File Handling\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Open, read, write, append, and close files.\n- List file modes: r, w, a, x, b, t.\n- Implement robust stream closures using context managers (with statement).\n- Track and seek file pointers using seek() and tell().\n- Perform CSV reading and writing with DictReader and DictWriter.\n\n## 11.1 File Modes\n- \\`r\\`: Read (default). Error if file does not exist.\n- \\`w\\`: Write (truncates existing file).\n- \\`a\\`: Append (preserves contents).\n- \\`x\\`: Create (fails if file exists).\n- \\`b\\`: Binary mode (e.g., \\`rb\\`).\n- \\`t\\`: Text mode (default).\n\n## 11.2 Reading and Writing\n- **Standard**:\n- \\`read(size)\\`: Reads file contents.\n- \\`readline()\\`: Reads one line.\n- \\`readlines()\\`: Reads all lines as a list of strings.\n- \\`write(text)\\`: Writes string to file.\n- **Context Manager**: Automatically closes files.\n  \\`\\`\\`python\n  with open(\"data.txt\", \"r\", encoding=\"utf-8\") as file:\n      content = file.read()\n  \\`\\`\\`\n\n## 11.3 File Pointer & CSVs\n- **\\`tell()\\`**: Returns current position of file pointer.\n- **\\`seek(offset)\\`**: Moves file pointer to a specific byte location.\n- **CSV Handling**:\n- \\`csv.reader(file)\\\n",
            "conceptTheory": "\n\n# Module 11: File Handling\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Open, read, write, append, and close files.\n- List file modes: r, w, a, x, b, t.\n- Implement robust stream closures using context managers (with statement).\n- Track and seek file pointers using seek() and tell().\n- Perform CSV reading and writing with DictReader and DictWriter.\n\n## 11.1 File Modes\n- \\`r\\`: Read (default). Error if file does not exist.\n- \\`w\\`: Write (truncates existing file).\n- \\`a\\`: Append (preserves contents).\n- \\`x\\`: Create (fails if file exists).\n- \\`b\\`: Binary mode (e.g., \\`rb\\`).\n- \\`t\\`: Text mode (default).\n\n## 11.2 Reading and Writing\n- **Standard**:\n- \\`read(size)\\`: Reads file contents.\n- \\`readline()\\`: Reads one line.\n- \\`readlines()\\`: Reads all lines as a list of strings.\n- \\`write(text)\\`: Writes string to file.\n- **Context Manager**: Automatically closes files.\n  \\`\\`\\`python\n  with open(\"data.txt\", \"r\", encoding=\"utf-8\") as file:\n      content = file.read()\n  \\`\\`\\`\n\n## 11.3 File Pointer & CSVs\n- **\\`tell()\\`**: Returns current position of file pointer.\n- **\\`seek(offset)\\`**: Moves file pointer to a specific byte location.\n- **CSV Handling**:\n- \\`csv.reader(file)\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "3 Hours",
    "title": "Module 12: OOP Fundamentals",
    "courseId": "python-through-oops-course-id",
    "order": 12,
    "orderIndex": 12,
    "description": "Classes, object instances, __init__ constructor, self parameter, instance vs class attributes, methods, and dunders.",
    "id": "python-mod-12",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 12: OOP Fundamentals Complete Notes.",
        "moduleId": "python-mod-12",
        "title": "Module 12 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 12: OOP Fundamentals\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Construct Python classes and initialize object instances.\n- Define instance variables and class attributes.\n- Use the __init__ constructor and explain the self parameter.\n- Implement custom string conversions via __str__ and __repr__.\n- Differentiate class functions (methods) from normal functions.\n\n## 12.1 Classes and Objects\nObject-Oriented Programming (OOP) organizes code around objects and classes.\n- **Class**: A blueprint/template for creating objects.\n- **Object**: An instance of a class.\n\n## 12.2 Constructors and Attributes\n- **\\`__init__(self, ...)\\`**: Special method called when an object is initialized.\n- **\\`self\\`**: Refers to the current object instance. Not a keyword, but standard naming convention.\n- **Instance Attributes**: Attributes bound to \\`self\\` (different for each object).\n- **Class Attributes**: Defined directly inside the class body (shared across all instances).\n\n## 12.3 String representation methods\n- **\\`__str__()\\`**: Human-readable string representation of an object (called by \\`print()\\` or \\`str()\\`).\n- **\\`__repr__()\\`**: Detailed developer-oriented representation (called by \\`repr()\\`).\n\n## 12.4 Practical Lab Exercises\n- **Task 1**: Create a \\`Student\\` class with attributes: \\`name\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 12: OOP Fundamentals",
        "id": "python-unit-12-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 12: OOP Fundamentals\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Construct Python classes and initialize object instances.\n- Define instance variables and class attributes.\n- Use the __init__ constructor and explain the self parameter.\n- Implement custom string conversions via __str__ and __repr__.\n- Differentiate class functions (methods) from normal functions.\n\n## 12.1 Classes and Objects\nObject-Oriented Programming (OOP) organizes code around objects and classes.\n- **Class**: A blueprint/template for creating objects.\n- **Object**: An instance of a class.\n\n## 12.2 Constructors and Attributes\n- **\\`__init__(self, ...)\\`**: Special method called when an object is initialized.\n- **\\`self\\`**: Refers to the current object instance. Not a keyword, but standard naming convention.\n- **Instance Attributes**: Attributes bound to \\`self\\` (different for each object).\n- **Class Attributes**: Defined directly inside the class body (shared across all instances).\n\n## 12.3 String representation methods\n- **\\`__str__()\\`**: Human-readable string representation of an object (called by \\`print()\\` or \\`str()\\`).\n- **\\`__repr__()\\`**: Detailed developer-oriented representation (called by \\`repr()\\`).\n\n## 12.4 Practical Lab Exercises\n- **Task 1**: Create a \\`Student\\` class with attributes: \\`name\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-12-topic-1",
        "title": "Module 12: OOP Fundamentals Units",
        "description": "Classes, object instances, __init__ constructor, self parameter, instance vs class attributes, methods, and dunders.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "python-unit-12-notes",
            "title": "Module 12 - Complete Notes",
            "description": "Module 12: OOP Fundamentals Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 12: OOP Fundamentals\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Construct Python classes and initialize object instances.\n- Define instance variables and class attributes.\n- Use the __init__ constructor and explain the self parameter.\n- Implement custom string conversions via __str__ and __repr__.\n- Differentiate class functions (methods) from normal functions.\n\n## 12.1 Classes and Objects\nObject-Oriented Programming (OOP) organizes code around objects and classes.\n- **Class**: A blueprint/template for creating objects.\n- **Object**: An instance of a class.\n\n## 12.2 Constructors and Attributes\n- **\\`__init__(self, ...)\\`**: Special method called when an object is initialized.\n- **\\`self\\`**: Refers to the current object instance. Not a keyword, but standard naming convention.\n- **Instance Attributes**: Attributes bound to \\`self\\` (different for each object).\n- **Class Attributes**: Defined directly inside the class body (shared across all instances).\n\n## 12.3 String representation methods\n- **\\`__str__()\\`**: Human-readable string representation of an object (called by \\`print()\\` or \\`str()\\`).\n- **\\`__repr__()\\`**: Detailed developer-oriented representation (called by \\`repr()\\`).\n\n## 12.4 Practical Lab Exercises\n- **Task 1**: Create a \\`Student\\` class with attributes: \\`name\\\n",
            "content": "\n\n# Module 12: OOP Fundamentals\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Construct Python classes and initialize object instances.\n- Define instance variables and class attributes.\n- Use the __init__ constructor and explain the self parameter.\n- Implement custom string conversions via __str__ and __repr__.\n- Differentiate class functions (methods) from normal functions.\n\n## 12.1 Classes and Objects\nObject-Oriented Programming (OOP) organizes code around objects and classes.\n- **Class**: A blueprint/template for creating objects.\n- **Object**: An instance of a class.\n\n## 12.2 Constructors and Attributes\n- **\\`__init__(self, ...)\\`**: Special method called when an object is initialized.\n- **\\`self\\`**: Refers to the current object instance. Not a keyword, but standard naming convention.\n- **Instance Attributes**: Attributes bound to \\`self\\` (different for each object).\n- **Class Attributes**: Defined directly inside the class body (shared across all instances).\n\n## 12.3 String representation methods\n- **\\`__str__()\\`**: Human-readable string representation of an object (called by \\`print()\\` or \\`str()\\`).\n- **\\`__repr__()\\`**: Detailed developer-oriented representation (called by \\`repr()\\`).\n\n## 12.4 Practical Lab Exercises\n- **Task 1**: Create a \\`Student\\` class with attributes: \\`name\\\n",
            "conceptTheory": "\n\n# Module 12: OOP Fundamentals\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Construct Python classes and initialize object instances.\n- Define instance variables and class attributes.\n- Use the __init__ constructor and explain the self parameter.\n- Implement custom string conversions via __str__ and __repr__.\n- Differentiate class functions (methods) from normal functions.\n\n## 12.1 Classes and Objects\nObject-Oriented Programming (OOP) organizes code around objects and classes.\n- **Class**: A blueprint/template for creating objects.\n- **Object**: An instance of a class.\n\n## 12.2 Constructors and Attributes\n- **\\`__init__(self, ...)\\`**: Special method called when an object is initialized.\n- **\\`self\\`**: Refers to the current object instance. Not a keyword, but standard naming convention.\n- **Instance Attributes**: Attributes bound to \\`self\\` (different for each object).\n- **Class Attributes**: Defined directly inside the class body (shared across all instances).\n\n## 12.3 String representation methods\n- **\\`__str__()\\`**: Human-readable string representation of an object (called by \\`print()\\` or \\`str()\\`).\n- **\\`__repr__()\\`**: Detailed developer-oriented representation (called by \\`repr()\\`).\n\n## 12.4 Practical Lab Exercises\n- **Task 1**: Create a \\`Student\\` class with attributes: \\`name\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "3 Hours",
    "title": "Module 13: Four Pillars of OOP",
    "courseId": "python-through-oops-course-id",
    "order": 13,
    "orderIndex": 13,
    "description": "Encapsulation, inheritance, polymorphism, abstraction, access qualifiers, getters/setters, super(), and abstract base classes.",
    "id": "python-mod-13",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 13: Four Pillars of OOP Complete Notes.",
        "moduleId": "python-mod-13",
        "title": "Module 13 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 13: Four Pillars of OOP\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Protect internal attributes using private and protected naming conventions.\n- Implement class getter and setter methods using property decorators.\n- Construct subclass hierarchies using inheritance to reuse behaviors.\n- Apply method overriding and invoke parent methods using super().\n- Create abstract base classes using the abc module.\n\n## 13.1 Encapsulation\nBundling data and methods together and restricting direct access.\n- **Naming Conventions**:\n- Public: \\`name\\` (accessible directly).\n- Protected: \\`_name\\` (non-public by convention, accessible inside class and subclasses).\n- Private: \\`__name\\` (triggers name mangling: transformed to \\`_ClassName__name\\` to prevent direct external access).\n- **Getters & Setters**: Implement controlled updates.\n- **\\`@property\\` Decorator**: Allows accessing getter/setter methods as attributes.\n\n## 13.2 Inheritance\nReusing properties and methods of a parent class in a child class.\n- **Syntax**: \\`class Child(Parent):\\`\n- **Method Overriding**: Child class provides a custom implementation of an inherited method.\n- **\\`super()\\`**: Invokes parent class constructors or methods.\n\n## 13.3 Abstraction\nHiding implementation details and exposing only essential behavior.\n- **Abstract Base Classes**: Inherit from \\`ABC\\` (from \\`abc\\` module) and declare abstract methods with the \\`@abstractmethod\\` decorator. Cannot be instantiated directly.\n\n## 13.4 Practical Lab Exercises\n- **Task 1**: Write a class hierarchy where a parent class \\`Employee\\` is subclassed by \\`Manager\\`. Override the salary calculation logic.\n- **Task 2**: Create an abstract class \\`Shape\\` with an abstract method \\`area()\\`. Subclass it into \\`Rectangle\\` and \\`Circle\\`.",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 13: Four Pillars of OOP",
        "id": "python-unit-13-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 13: Four Pillars of OOP\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Protect internal attributes using private and protected naming conventions.\n- Implement class getter and setter methods using property decorators.\n- Construct subclass hierarchies using inheritance to reuse behaviors.\n- Apply method overriding and invoke parent methods using super().\n- Create abstract base classes using the abc module.\n\n## 13.1 Encapsulation\nBundling data and methods together and restricting direct access.\n- **Naming Conventions**:\n- Public: \\`name\\` (accessible directly).\n- Protected: \\`_name\\` (non-public by convention, accessible inside class and subclasses).\n- Private: \\`__name\\` (triggers name mangling: transformed to \\`_ClassName__name\\` to prevent direct external access).\n- **Getters & Setters**: Implement controlled updates.\n- **\\`@property\\` Decorator**: Allows accessing getter/setter methods as attributes.\n\n## 13.2 Inheritance\nReusing properties and methods of a parent class in a child class.\n- **Syntax**: \\`class Child(Parent):\\`\n- **Method Overriding**: Child class provides a custom implementation of an inherited method.\n- **\\`super()\\`**: Invokes parent class constructors or methods.\n\n## 13.3 Abstraction\nHiding implementation details and exposing only essential behavior.\n- **Abstract Base Classes**: Inherit from \\`ABC\\` (from \\`abc\\` module) and declare abstract methods with the \\`@abstractmethod\\` decorator. Cannot be instantiated directly.\n\n## 13.4 Practical Lab Exercises\n- **Task 1**: Write a class hierarchy where a parent class \\`Employee\\` is subclassed by \\`Manager\\`. Override the salary calculation logic.\n- **Task 2**: Create an abstract class \\`Shape\\` with an abstract method \\`area()\\`. Subclass it into \\`Rectangle\\` and \\`Circle\\`."
      }
    ],
    "topics": [
      {
        "id": "python-mod-13-topic-1",
        "title": "Module 13: Four Pillars of OOP Units",
        "description": "Encapsulation, inheritance, polymorphism, abstraction, access qualifiers, getters/setters, super(), and abstract base classes.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "python-unit-13-notes",
            "title": "Module 13 - Complete Notes",
            "description": "Module 13: Four Pillars of OOP Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 13: Four Pillars of OOP\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Protect internal attributes using private and protected naming conventions.\n- Implement class getter and setter methods using property decorators.\n- Construct subclass hierarchies using inheritance to reuse behaviors.\n- Apply method overriding and invoke parent methods using super().\n- Create abstract base classes using the abc module.\n\n## 13.1 Encapsulation\nBundling data and methods together and restricting direct access.\n- **Naming Conventions**:\n- Public: \\`name\\` (accessible directly).\n- Protected: \\`_name\\` (non-public by convention, accessible inside class and subclasses).\n- Private: \\`__name\\` (triggers name mangling: transformed to \\`_ClassName__name\\` to prevent direct external access).\n- **Getters & Setters**: Implement controlled updates.\n- **\\`@property\\` Decorator**: Allows accessing getter/setter methods as attributes.\n\n## 13.2 Inheritance\nReusing properties and methods of a parent class in a child class.\n- **Syntax**: \\`class Child(Parent):\\`\n- **Method Overriding**: Child class provides a custom implementation of an inherited method.\n- **\\`super()\\`**: Invokes parent class constructors or methods.\n\n## 13.3 Abstraction\nHiding implementation details and exposing only essential behavior.\n- **Abstract Base Classes**: Inherit from \\`ABC\\` (from \\`abc\\` module) and declare abstract methods with the \\`@abstractmethod\\` decorator. Cannot be instantiated directly.\n\n## 13.4 Practical Lab Exercises\n- **Task 1**: Write a class hierarchy where a parent class \\`Employee\\` is subclassed by \\`Manager\\`. Override the salary calculation logic.\n- **Task 2**: Create an abstract class \\`Shape\\` with an abstract method \\`area()\\`. Subclass it into \\`Rectangle\\` and \\`Circle\\`.\n\n",
            "content": "\n\n# Module 13: Four Pillars of OOP\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Protect internal attributes using private and protected naming conventions.\n- Implement class getter and setter methods using property decorators.\n- Construct subclass hierarchies using inheritance to reuse behaviors.\n- Apply method overriding and invoke parent methods using super().\n- Create abstract base classes using the abc module.\n\n## 13.1 Encapsulation\nBundling data and methods together and restricting direct access.\n- **Naming Conventions**:\n- Public: \\`name\\` (accessible directly).\n- Protected: \\`_name\\` (non-public by convention, accessible inside class and subclasses).\n- Private: \\`__name\\` (triggers name mangling: transformed to \\`_ClassName__name\\` to prevent direct external access).\n- **Getters & Setters**: Implement controlled updates.\n- **\\`@property\\` Decorator**: Allows accessing getter/setter methods as attributes.\n\n## 13.2 Inheritance\nReusing properties and methods of a parent class in a child class.\n- **Syntax**: \\`class Child(Parent):\\`\n- **Method Overriding**: Child class provides a custom implementation of an inherited method.\n- **\\`super()\\`**: Invokes parent class constructors or methods.\n\n## 13.3 Abstraction\nHiding implementation details and exposing only essential behavior.\n- **Abstract Base Classes**: Inherit from \\`ABC\\` (from \\`abc\\` module) and declare abstract methods with the \\`@abstractmethod\\` decorator. Cannot be instantiated directly.\n\n## 13.4 Practical Lab Exercises\n- **Task 1**: Write a class hierarchy where a parent class \\`Employee\\` is subclassed by \\`Manager\\`. Override the salary calculation logic.\n- **Task 2**: Create an abstract class \\`Shape\\` with an abstract method \\`area()\\`. Subclass it into \\`Rectangle\\` and \\`Circle\\`.\n\n",
            "conceptTheory": "\n\n# Module 13: Four Pillars of OOP\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Protect internal attributes using private and protected naming conventions.\n- Implement class getter and setter methods using property decorators.\n- Construct subclass hierarchies using inheritance to reuse behaviors.\n- Apply method overriding and invoke parent methods using super().\n- Create abstract base classes using the abc module.\n\n## 13.1 Encapsulation\nBundling data and methods together and restricting direct access.\n- **Naming Conventions**:\n- Public: \\`name\\` (accessible directly).\n- Protected: \\`_name\\` (non-public by convention, accessible inside class and subclasses).\n- Private: \\`__name\\` (triggers name mangling: transformed to \\`_ClassName__name\\` to prevent direct external access).\n- **Getters & Setters**: Implement controlled updates.\n- **\\`@property\\` Decorator**: Allows accessing getter/setter methods as attributes.\n\n## 13.2 Inheritance\nReusing properties and methods of a parent class in a child class.\n- **Syntax**: \\`class Child(Parent):\\`\n- **Method Overriding**: Child class provides a custom implementation of an inherited method.\n- **\\`super()\\`**: Invokes parent class constructors or methods.\n\n## 13.3 Abstraction\nHiding implementation details and exposing only essential behavior.\n- **Abstract Base Classes**: Inherit from \\`ABC\\` (from \\`abc\\` module) and declare abstract methods with the \\`@abstractmethod\\` decorator. Cannot be instantiated directly.\n\n## 13.4 Practical Lab Exercises\n- **Task 1**: Write a class hierarchy where a parent class \\`Employee\\` is subclassed by \\`Manager\\`. Override the salary calculation logic.\n- **Task 2**: Create an abstract class \\`Shape\\` with an abstract method \\`area()\\`. Subclass it into \\`Rectangle\\` and \\`Circle\\`.\n\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "3 Hours",
    "title": "Module 14: Advanced OOP in Python",
    "courseId": "python-through-oops-course-id",
    "order": 14,
    "orderIndex": 14,
    "description": "Inheritance types, MRO search order algorithm, Diamond problem, class methods, static methods, and operator overloading.",
    "id": "python-mod-14",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 14: Advanced OOP in Python Complete Notes.",
        "moduleId": "python-mod-14",
        "title": "Module 14 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "content": "# Module 14: Advanced OOP in Python\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Construct single, multiple, multilevel, hierarchical, and hybrid inheritance models.\n- Determine method search paths using Method Resolution Order (MRO).\n- Avoid duplication in multiple inheritance hierarchies (Diamond Problem).\n- Define class methods (@classmethod) and static methods (@staticmethod).\n- Customize behavior using dunder methods (len, eq, add).\n\n## 14.1 Inheritance Patterns\n- **Single**: One parent, one child.\n- **Multiple**: One child inherits from multiple parent classes (e.g., \\`class Child(Father, Mother):\\`).\n- **Multilevel**: Inheritance chain (Grandparent -> Parent -> Child).\n- **Hierarchical**: One parent, multiple child classes.\n- **Hybrid**: Combination of inheritance patterns.\n\n## 14.2 Method Resolution Order (MRO)\n- Determines the exact lookup path Python uses to search for methods.\n- Resolved via the C3 Linearization algorithm.\n- Accessible via \\`ClassName.mro()\\` or \\`ClassName.__mro__\\`.\n- **Diamond Problem**: Multiple inheritance where classes share a common base. Python's MRO determines the search sequence (e.g., \\`D -> B -> C -> A -> object\\`).\n\n## 14.3 Special Methods and Overloading\n- **Class methods**: Decorated with \\`@classmethod\\`; receive class (\\`cls\\`) as parameter.\n- **Static methods**: Decorated with \\`@staticmethod\\`; receive no class or instance reference.\n- **Dunder methods**: Customize behavior (e.g., \\`__len__()\\` for length, \\`__eq__()\\` for equality, \\`__add__()\\` for addition overloading).\n\n## 14.4 Practical Lab Exercises\n- **Task 1**: Implement custom addition for a \\`Point(x, y)\\` class using operator overloading.\n- **Task 2**: Create a multiple inheritance structure representing a \\`Smartphone\\` inheriting from \\`Camera\\` and \\`Phone\\",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 14: Advanced OOP in Python",
        "id": "python-unit-14-notes",
        "type": "Reading",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 14: Advanced OOP in Python\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Construct single, multiple, multilevel, hierarchical, and hybrid inheritance models.\n- Determine method search paths using Method Resolution Order (MRO).\n- Avoid duplication in multiple inheritance hierarchies (Diamond Problem).\n- Define class methods (@classmethod) and static methods (@staticmethod).\n- Customize behavior using dunder methods (len, eq, add).\n\n## 14.1 Inheritance Patterns\n- **Single**: One parent, one child.\n- **Multiple**: One child inherits from multiple parent classes (e.g., \\`class Child(Father, Mother):\\`).\n- **Multilevel**: Inheritance chain (Grandparent -> Parent -> Child).\n- **Hierarchical**: One parent, multiple child classes.\n- **Hybrid**: Combination of inheritance patterns.\n\n## 14.2 Method Resolution Order (MRO)\n- Determines the exact lookup path Python uses to search for methods.\n- Resolved via the C3 Linearization algorithm.\n- Accessible via \\`ClassName.mro()\\` or \\`ClassName.__mro__\\`.\n- **Diamond Problem**: Multiple inheritance where classes share a common base. Python's MRO determines the search sequence (e.g., \\`D -> B -> C -> A -> object\\`).\n\n## 14.3 Special Methods and Overloading\n- **Class methods**: Decorated with \\`@classmethod\\`; receive class (\\`cls\\`) as parameter.\n- **Static methods**: Decorated with \\`@staticmethod\\`; receive no class or instance reference.\n- **Dunder methods**: Customize behavior (e.g., \\`__len__()\\` for length, \\`__eq__()\\` for equality, \\`__add__()\\` for addition overloading).\n\n## 14.4 Practical Lab Exercises\n- **Task 1**: Implement custom addition for a \\`Point(x, y)\\` class using operator overloading.\n- **Task 2**: Create a multiple inheritance structure representing a \\`Smartphone\\` inheriting from \\`Camera\\` and \\`Phone\\"
      }
    ],
    "topics": [
      {
        "id": "python-mod-14-topic-1",
        "title": "Module 14: Advanced OOP in Python Units",
        "description": "Inheritance types, MRO search order algorithm, Diamond problem, class methods, static methods, and operator overloading.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "python-unit-14-notes",
            "title": "Module 14 - Complete Notes",
            "description": "Module 14: Advanced OOP in Python Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "\n\n# Module 14: Advanced OOP in Python\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Construct single, multiple, multilevel, hierarchical, and hybrid inheritance models.\n- Determine method search paths using Method Resolution Order (MRO).\n- Avoid duplication in multiple inheritance hierarchies (Diamond Problem).\n- Define class methods (@classmethod) and static methods (@staticmethod).\n- Customize behavior using dunder methods (len, eq, add).\n\n## 14.1 Inheritance Patterns\n- **Single**: One parent, one child.\n- **Multiple**: One child inherits from multiple parent classes (e.g., \\`class Child(Father, Mother):\\`).\n- **Multilevel**: Inheritance chain (Grandparent -> Parent -> Child).\n- **Hierarchical**: One parent, multiple child classes.\n- **Hybrid**: Combination of inheritance patterns.\n\n## 14.2 Method Resolution Order (MRO)\n- Determines the exact lookup path Python uses to search for methods.\n- Resolved via the C3 Linearization algorithm.\n- Accessible via \\`ClassName.mro()\\` or \\`ClassName.__mro__\\`.\n- **Diamond Problem**: Multiple inheritance where classes share a common base. Python's MRO determines the search sequence (e.g., \\`D -> B -> C -> A -> object\\`).\n\n## 14.3 Special Methods and Overloading\n- **Class methods**: Decorated with \\`@classmethod\\`; receive class (\\`cls\\`) as parameter.\n- **Static methods**: Decorated with \\`@staticmethod\\`; receive no class or instance reference.\n- **Dunder methods**: Customize behavior (e.g., \\`__len__()\\` for length, \\`__eq__()\\` for equality, \\`__add__()\\` for addition overloading).\n\n## 14.4 Practical Lab Exercises\n- **Task 1**: Implement custom addition for a \\`Point(x, y)\\` class using operator overloading.\n- **Task 2**: Create a multiple inheritance structure representing a \\`Smartphone\\` inheriting from \\`Camera\\` and \\`Phone\\\n",
            "content": "\n\n# Module 14: Advanced OOP in Python\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Construct single, multiple, multilevel, hierarchical, and hybrid inheritance models.\n- Determine method search paths using Method Resolution Order (MRO).\n- Avoid duplication in multiple inheritance hierarchies (Diamond Problem).\n- Define class methods (@classmethod) and static methods (@staticmethod).\n- Customize behavior using dunder methods (len, eq, add).\n\n## 14.1 Inheritance Patterns\n- **Single**: One parent, one child.\n- **Multiple**: One child inherits from multiple parent classes (e.g., \\`class Child(Father, Mother):\\`).\n- **Multilevel**: Inheritance chain (Grandparent -> Parent -> Child).\n- **Hierarchical**: One parent, multiple child classes.\n- **Hybrid**: Combination of inheritance patterns.\n\n## 14.2 Method Resolution Order (MRO)\n- Determines the exact lookup path Python uses to search for methods.\n- Resolved via the C3 Linearization algorithm.\n- Accessible via \\`ClassName.mro()\\` or \\`ClassName.__mro__\\`.\n- **Diamond Problem**: Multiple inheritance where classes share a common base. Python's MRO determines the search sequence (e.g., \\`D -> B -> C -> A -> object\\`).\n\n## 14.3 Special Methods and Overloading\n- **Class methods**: Decorated with \\`@classmethod\\`; receive class (\\`cls\\`) as parameter.\n- **Static methods**: Decorated with \\`@staticmethod\\`; receive no class or instance reference.\n- **Dunder methods**: Customize behavior (e.g., \\`__len__()\\` for length, \\`__eq__()\\` for equality, \\`__add__()\\` for addition overloading).\n\n## 14.4 Practical Lab Exercises\n- **Task 1**: Implement custom addition for a \\`Point(x, y)\\` class using operator overloading.\n- **Task 2**: Create a multiple inheritance structure representing a \\`Smartphone\\` inheriting from \\`Camera\\` and \\`Phone\\\n",
            "conceptTheory": "\n\n# Module 14: Advanced OOP in Python\n\n### Learning Objectives\nAfter completing this module, you will be able to:\n- Construct single, multiple, multilevel, hierarchical, and hybrid inheritance models.\n- Determine method search paths using Method Resolution Order (MRO).\n- Avoid duplication in multiple inheritance hierarchies (Diamond Problem).\n- Define class methods (@classmethod) and static methods (@staticmethod).\n- Customize behavior using dunder methods (len, eq, add).\n\n## 14.1 Inheritance Patterns\n- **Single**: One parent, one child.\n- **Multiple**: One child inherits from multiple parent classes (e.g., \\`class Child(Father, Mother):\\`).\n- **Multilevel**: Inheritance chain (Grandparent -> Parent -> Child).\n- **Hierarchical**: One parent, multiple child classes.\n- **Hybrid**: Combination of inheritance patterns.\n\n## 14.2 Method Resolution Order (MRO)\n- Determines the exact lookup path Python uses to search for methods.\n- Resolved via the C3 Linearization algorithm.\n- Accessible via \\`ClassName.mro()\\` or \\`ClassName.__mro__\\`.\n- **Diamond Problem**: Multiple inheritance where classes share a common base. Python's MRO determines the search sequence (e.g., \\`D -> B -> C -> A -> object\\`).\n\n## 14.3 Special Methods and Overloading\n- **Class methods**: Decorated with \\`@classmethod\\`; receive class (\\`cls\\`) as parameter.\n- **Static methods**: Decorated with \\`@staticmethod\\`; receive no class or instance reference.\n- **Dunder methods**: Customize behavior (e.g., \\`__len__()\\` for length, \\`__eq__()\\` for equality, \\`__add__()\\` for addition overloading).\n\n## 14.4 Practical Lab Exercises\n- **Task 1**: Implement custom addition for a \\`Point(x, y)\\` class using operator overloading.\n- **Task 2**: Create a multiple inheritance structure representing a \\`Smartphone\\` inheriting from \\`Camera\\` and \\`Phone\\\n",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  },
  {
    "duration": "3 Hours",
    "title": "Module 15: Intermediate Python & OOP Project",
    "courseId": "python-through-oops-course-id",
    "order": 15,
    "orderIndex": 15,
    "description": "Iterators, generators, decorators, map/filter/reduce lambdas, zip/enumerate, type hints, and student management project.",
    "id": "python-mod-15",
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "duration": "45 mins",
        "readingTime": "45 mins",
        "description": "Module 15: Intermediate Python & OOP Project Complete Notes.",
        "moduleId": "python-mod-15",
        "title": "Module 15 - Complete Notes",
        "courseId": "python-through-oops-course-id",
        "order": 1,
        "orderIndex": 1,
        "createdAt": "2026-09-01T06:50:37.901Z",
        "estimatedReadMinutes": 3,
        "moduleTitle": "Module 15: Intermediate Python & OOP Project",
        "id": "python-unit-15-notes",
        "type": "Reading",
        "content": "",
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 15: Intermediate Python & OOP Project\n## Overview\nModule 15 brings together Python's intermediate capabilities — iterators, generators, function decorators, functional utilities (map, filter, reduce), and culminates in building an end-to-end Student Record Management System with CSV persistence.\n\n## Learning Objectives\nAfter completing this module, you will be able to:\n- Implement custom iterators using `__iter__()` and `__next__()`.\n- Write memory-efficient generators using the `yield` keyword.\n- Create higher-order functions and custom function decorators.\n- Leverage functional programming tools: `map()`, `filter()`, `reduce()`, `zip()`, and `enumerate()`.\n- Architect and build an Object-Oriented project with file persistence.\n\n## 15.1 Iterators and Iterables\nAn **iterable** is any Python object capable of returning its members one at a time (e.g., `list`, `tuple`, `dict`, `str`). An **iterator** is an object representing a stream of data that implements the iterator protocol:\n- `__iter__()`: Returns the iterator object itself.\n- `__next__()`: Returns the next value from the stream or raises `StopIteration`.\n```python\nclass CountUp:\n    def __init__(self, low, high):\n        self.current = low\n        self.high = high\n\n    def __iter__(self):\n        return self\n\n    def __next__(self):\n        if self.current > self.high:\n            raise StopIteration\n        val = self.current\n        self.current += 1\n        return val\n\nfor num in CountUp(1, 5):\n    print(num)\n```\n\n## 15.2 Generators and the `yield` Keyword\nGenerators are functions that yield values on the fly without loading the entire sequence into RAM.\n\n```python\ndef fibonacci_generator(limit):\n    a, b = 0, 1\n    while a < limit:\n        yield a\n        a, b = b, a + b\n\nfor val in fibonacci_generator(50):\n    print(val, end=\" \")\n```\n\n## 15.3 Function Decorators\nA decorator is a callable that takes another function as an argument, extends its behavior without modifying it, and returns the wrapped function.\n\n```python\nimport time\n\ndef execution_timer(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        duration = time.time() - start\n        print(f\"Function {func.__name__} took {duration:.6f}s\")\n        return result\n    return wrapper\n\n@execution_timer\ndef compute_sum(n):\n    return sum(range(n))\n\ncompute_sum(1000000)\n```\n\n## 15.4 Functional Tools: `map`, `filter`, `reduce`\n- `map(func, iterable)`: Applies `func` to every item in `iterable`.\n- `filter(func, iterable)`: Filters items where `func(item)` evaluates to `True`.\n- `reduce(func, iterable)`: Accumulates values sequentially (from `functools`).\n```python\nfrom functools import reduce\n\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nevens = list(filter(lambda x: x % 2 == 0, numbers))\nsquared_evens = list(map(lambda x: x ** 2, evens))\nsum_total = reduce(lambda acc, x: acc + x, squared_evens)\n\nprint(\"Sum of squared evens:\", sum_total)\n```\n\n## 15.5 Capstone Project: Student Management System (OOP)\nA complete Object-Oriented CLI application that encapsulates student records and provides CRUD operations with CSV disk persistence.\n\n```python\nimport csv\n\nclass Student:\n    def __init__(self, student_id: str, name: str, email: str, course: str):\n        self.student_id = student_id\n        self.name = name\n        self.email = email\n        self.course = course\n\n    def to_dict(self):\n        return {\n            \"ID\": self.student_id,\n            \"Name\": self.name,\n            \"Email\": self.email,\n            \"Course\": self.course\n        }\n\nclass StudentManager:\n    def __init__(self, filename=\"students.csv\"):\n        self.filename = filename\n        self.students = {}\n\n    def add_student(self, student: Student):\n        self.students[student.student_id] = student\n        print(f\"Student {student.name} added successfully.\")\n\n    def display_all(self):\n        for s in self.students.values():\n            print(f\"[{s.student_id}] {s.name} - {s.course} ({s.email})\")\n\n    def save_to_csv(self):\n        with open(self.filename, mode='w', newline='') as file:\n            writer = csv.DictWriter(file, fieldnames=[\"ID\", \"Name\", \"Email\", \"Course\"])\n            writer.writeheader()\n            for s in self.students.values():\n                writer.writerow(s.to_dict())\n        print(\"Records saved to disk.\")\n\nmanager = StudentManager()\nmanager.add_student(Student(\"S101\", \"Alice\", \"alice@example.com\", \"Python OOP\"))\nmanager.add_student(Student(\"S102\", \"Bob\", \"bob@example.com\", \"Python OOP\"))\nmanager.display_all()\nmanager.save_to_csv()\n```\n## Summary & Key Takeaways\n- **Iterators** provide lazy evaluation for custom objects using `__iter__` and `__next__`.\n- **Generators** use `yield` to stream large datasets with minimal memory footprint.\n- **Decorators** allow clean cross-cutting concerns (logging, timing, auth checks).\n- **OOP Architecture** modularizes real-world data systems with clean encapsulation and file persistence."
      }
    ],
    "topics": [
      {
        "id": "python-mod-15-topic-1",
        "title": "Module 15: Intermediate Python & OOP Project Units",
        "description": "Iterators, generators, decorators, map/filter/reduce lambdas, zip/enumerate, type hints, and student management project.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "python-unit-15-notes",
            "title": "Module 15 - Complete Notes",
            "description": "Module 15: Intermediate Python & OOP Project Complete Notes.",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "",
            "content": "",
            "conceptTheory": "",
            "videoUrl": "",
            "quizQuestions": [],
            "assignmentInstructions": "",
            "practiceLabChallenge": null,
            "resources": [],
            "orderIndex": 1,
            "order": 1
          }
        ]
      }
    ]
  }
];
