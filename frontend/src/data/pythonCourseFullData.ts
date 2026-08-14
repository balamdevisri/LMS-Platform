import type { ModuleItem, LearningUnitItem } from '../contexts/CourseContext';

const createLesson = (
  id: string,
  title: string,
  desc: string,
  duration: string,
  type: 'Video' | 'Reading' | 'Assignment' | 'Quiz',
  readingContent: string
): LearningUnitItem => ({
  id,
  title,
  description: desc,
  duration,
  type,
  readingContent,
  practiceLabChallenge: undefined,
  resources: [
    {
      id: `res-${id}-pdf-notes`,
      name: 'Python Through OOPs.pdf',
      description: 'Python Through OOPs textbook reference PDF.',
      category: 'PDF',
      fileSize: '3.5 MB',
      downloadPermission: true,
      url: '/Python Through OOPs.pdf'
    }
  ]
});

const pythonSyllabusNotes: Record<number, string> = {
  1: `

# Module 1: Introduction to Python & Basics

### Learning Objectives
After completing this module, you will be able to:
- Explain what Python is, its key features, and history.
- Set up a Python environment and run your first Python script.
- Understand basic syntax, code comments, and keywords.
- Explain the role of indentation in block structure.
- Swap variables and execute basic I/O using print() and input().

### Python Virtual Machine Execution Flow

![Python Interpreter Flow](/assets/images/python_interpreter_flow.png)

## 1.1 What is Python?
Python is a high-level, general-purpose programming language known for its simple and readable syntax. It is widely used for:
- **Web development** (Django, Flask)
- **Data Science** (Pandas, NumPy)
- **Machine Learning & AI** (TensorFlow, PyTorch)
- **Automation & Scripting**
- **Software testing & development**

## 1.2 Features & Popularity
- **Easy to Learn**: Syntax is clean and beginner-friendly.
- **High-Level Language**: Automatic memory management.
- **Dynamically Typed**: No need to declare variable types.
- **Interpreted / Bytecode-Based Execution**: Source code is parsed into bytecode and executed by the Python Virtual Machine (PVM).
- **Object-Oriented**: Supports classes, objects, and major OOP principles.
- **Cross-Platform**: Runs on Windows, macOS, and Linux.

## 1.3 How Python Executes a Program
Conceptually:
\\\`\\\`\\\`text
Python Source Code (.py) ──> Python Parser ──> Bytecode (.pyc) ──> PVM ──> Machine Output
\\\`\\\`\\\`

## 1.4 Variables & Basic Syntax
A variable name refers to an object. In Python, variables are names bound to objects, not static memory boxes.
- **Indentation Matters**: Python uses indentation (standard: 4 spaces) instead of curly braces \\\`{}\\\` to define blocks of code.
- **Comments**: Single-line comments start with \\\`#\\\`. Multi-line comments can be implemented with triple-quoted strings (\\\`"""\\\`).
- **Case-Sensitivity**: \\\`name\\
`,
  2: `

# Module 2: Variables & Data Types

### Learning Objectives
After completing this module, you will be able to:
- Dynamically declare and assign variables.
- Know rules for valid Python identifiers.
- Identify core data types: int, float, complex, bool, str, None.
- Check object types using type() and isinstance().
- Distinguish mutable and immutable objects.

## 2.1 Variables & Identifiers
A variable is a name bound to an object.
- **Identifier Rules**:
- Can contain letters, digits, and underscores.
- Cannot start with a digit.
- Cannot be a Python keyword (e.g., \\\`class\\
`,
  3: `

# Module 3: Operators

### Learning Objectives
After completing this module, you will be able to:
- Apply arithmetic, comparison, and assignment operators.
- Write logical expressions and understand short-circuit evaluation.
- Understand bitwise operations and shifting.
- Use membership (in) and identity (is) operators.
- Solve expressions according to operator precedence rules.

## 3.1 Operator Categories
1. **Arithmetic**: \\\`+\\network\\
`,
  4: `

# Module 4: Input, Output & Basic Programs

### Learning Objectives
After completing this module, you will be able to:
- Implement formatted outputs with f-strings and format specifiers.
- Read multiple values in a single line using split() and map().
- Build mathematical calculations: Area, perimeter, swapping, time conversion, salary split.
- Trace algorithms using standard program flowcharts.

## 4.1 Advanced Input and Output
- **f-Strings**: Use curly braces \\\`{}\\\` inside an f-prefixed string to format variables and expressions.
- *Example*: \\\`print(f"Price = {price:.2f}")\\\` formats to 2 decimal places.
- **Multiple Inputs**:
- \\\`a, b = input("Enter two words: ").split()\\\`
- \\\`a, b = map(int, input("Enter two numbers: ").split())\\\`

## 4.2 Core Mathematical Programs
- **Swapping**:
- Unpacking swap: \\\`a, b = b, a\\\` (no temp variable needed).
- Traditional swap: \\\`temp = a; a = b; b = temp\\\`.
- **Digit Manipulations**:
- Last digit: \\\`digit = number % 10\\\`
- Remove last digit: \\\`number = number // 10\\\`
- **Conversions**:
- Minutes to hours: \\\`hours = minutes // 60\\
`,
  5: `

# Module 5: Conditional Statements

### Learning Objectives
After completing this module, you will be able to:
- Use conditional flows: if, if-else, and if-elif-else ladders.
- Control conditions with nested blocks and logical operators.
- Write concise conditions with conditional expressions (ternary operators).
- Understand truthy and falsy rules for non-boolean types.

## 5.1 Conditional syntax
- **\\\`if\\\` Statement**: Runs a block if a condition is \\\`True\\\`.
- **\\\`if-else\\\`**: Offers a binary choice.
- **\\\`if-elif-else\\\`**: Handles multiple mutually exclusive conditions.
- *Important*: Conditions are checked from top to bottom. The first matching branch is executed, and others are skipped.

## 5.2 Conditional Expressions
Ternary shorthand syntax:
\\\`\\\`\\\`python
value_if_true if condition else value_if_false
\\\`\\\`\\\`
- *Example*: \\\`result = "Adult" if age >= 18 else "Minor"\\\`

## 5.3 Truthy & Falsy Values
In Python, objects evaluate to \\\`True\\\` or \\\`False\\\` in conditional contexts.
- **Falsy Values**:
- \\\`False\\\`
- \\\`None\\\`
- \\\`0\\
`,
  6: `

# Module 6: Loops

### Learning Objectives
After completing this module, you will be able to:
- Control repetitive executions using for and while loops.
- Use range() with positive, negative, and custom step parameters.
- Break and continue loops based on runtime events.
- Implement loop-else blocks for conditional post-loop processing.
- Write pattern printing and digit analysis scripts.

## 6.1 Loop Constructs
- **\\\`for\\\` Loop**: Iterates over an sequence/iterable (lists, strings, ranges).
- **\\\`while\\\` Loop**: Repeats as long as a condition remains true. Always update the condition variable to avoid infinite loops.

## 6.2 Range Generation
- **\\\`range(stop)\\\`**: Generates integers from 0 to \\\`stop - 1\\\`.
- **\\\`range(start, stop)\\\`**: Generates integers from \\\`start\\\` to \\\`stop - 1\\\`.
- **\\\`range(start, stop, step)\\\`**: Increments by \\\`step\\\`.
- *Negative Step*: \\\`range(5, 0, -1)\\\` yields \\\`5, 4, 3, 2, 1\\\`.

## 6.3 Loop Control
- **\\\`break\\\`**: Immediately terminates the nearest enclosing loop.
- **\\\`continue\\\`**: Skips the rest of the current iteration and jumps to the next loop evaluation.
- **\\\`pass\\\`**: A null statement placeholder. Used for empty syntax blocks.
- **Loop \\\`else\\\`**: Executes when the loop terminates normally (without hitting a \\\`break\\\` statement).

## 6.4 Practical Lab Exercises
- **Task 1**: Write a prime number checker using a loop-else block.
- **Task 2**: Print a right-aligned triangle pattern of asterisks.

`,
  7: `

# Module 7: Strings

### Learning Objectives
After completing this module, you will be able to:
- Index and slice strings (including reversing with step parameters).
- Detail why strings are immutable and create modified copies.
- Use basic string methods: lower, upper, strip, replace, split, join.
- Identify character subclasses (isalpha, isdigit, isalnum).
- Form escape characters and raw strings.

## 7.1 String Properties & Slicing
Strings are immutable character sequences.
- **Indexing**: Support positive (\\\`0\\\` to \\\`N-1\\\`) and negative (\\\`-1\\\` to \\\`-N\\\`) indices.
- **Slicing**: \\\`string[start:stop:step]\\\` (the \\\`stop\\\` index is excluded).
- *Reversing*: \\\`text[::-1]\\\` creates a reversed copy.
- **Immutability**: You cannot modify characters directly (\\\`text[0] = "A"\\\` raises a TypeError). Reassign instead: \\\`text = "A" + text[1:]\\\`.

## 7.2 String Methods
- **Case conversion**: \\\`lower()\\
`,
  8: `

# Module 8: Python Collections

### Learning Objectives
After completing this module, you will be able to:
- Identify and contrast four major collections: Lists, Tuples, Sets, Dictionaries.
- Perform modifications, insertions, deletions, and lookups on collections.
- Construct list, set, and dictionary comprehensions.
- Count frequencies and perform union/intersection set operations.

## 8.1 Comparison of Collections
| Collection | Syntax | Ordered | Mutable | Duplicates | Access method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **List** | \\\`[]\\\` | Yes | Yes | Yes | Indexing |
| **Tuple** | \\\`()\\\` | Yes | No | Yes | Indexing |
| **Set** | \\\`{}\\\` (or \\\`set()\\\`) | No | Yes | No | Unindexed |
| **Dictionary**| \\\`{key: value}\\\` | Yes (insertion) | Yes | Keys: No | Key lookup |

## 8.2 List & Tuple Methods
- **List additions**: \\\`append(x)\\\` (adds one object), \\\`insert(idx, x)\\\` (adds at index), \\\`extend(iterable)\\\` (merges elements).
- **List deletions**: \\\`remove(val)\\\` (removes first match), \\\`pop(idx)\\\` (removes and returns at index), \\\`clear()\\\` (empties list), \\\`del\\\` statement.
- **Tuple Unpacking**: \\\`a, b, c = student_tuple\\\`.

## 8.3 Set Operations
- **Edits**: \\\`add(x)\\
`,
  9: `

# Module 9: Functions

### Learning Objectives
After completing this module, you will be able to:
- Define functions using def and return results.
- Distinguish between parameters (definitions) and arguments (calls).
- Configure keyword, positional, and default arguments.
- Access variable-length arguments with *args and **kwargs.
- Detail variable scopes and the global keyword.
- Implement recursion and construct lambda functions.

## 9.1 Function Basics
- A function is a reusable block of code.
- **Parameters**: Variables listed in the function definition.
- **Arguments**: Actual values passed during the call.
- **Return**: Sends values back to the caller. A function without an explicit \\\`return\\\` returns \\\`None\\\`.

## 9.2 Argument Configurations
- **Default Parameters**: Must follow non-default parameters.
- **Keyword Arguments**: Passed as \\\`name="John"\\
`,
  10: `

# Module 10: Modules, Packages & Exception Handling

### Learning Objectives
After completing this module, you will be able to:
- Import modules and packages using standard import statement layouts.
- Understand __name__ == "__main__" for running standalone modules.
- Identify common exception types: ValueError, TypeError, ZeroDivisionError, IndexError, KeyError, NameError, FileNotFoundError.
- Protect code blocks using try, except, else, and finally blocks.
- Raise exceptions and construct custom exception classes.

## 10.1 Modules and Packages
- **Module**: A Python file containing variables, functions, and classes.
- **Package**: A folder containing modules. Standard packages contain an \\\`__init__.py\\\` file.
- **Imports**: \\\`import math\\
`,
  11: `

# Module 11: File Handling

### Learning Objectives
After completing this module, you will be able to:
- Open, read, write, append, and close files.
- List file modes: r, w, a, x, b, t.
- Implement robust stream closures using context managers (with statement).
- Track and seek file pointers using seek() and tell().
- Perform CSV reading and writing with DictReader and DictWriter.

## 11.1 File Modes
- \\\`r\\\`: Read (default). Error if file does not exist.
- \\\`w\\\`: Write (truncates existing file).
- \\\`a\\\`: Append (preserves contents).
- \\\`x\\\`: Create (fails if file exists).
- \\\`b\\\`: Binary mode (e.g., \\\`rb\\\`).
- \\\`t\\\`: Text mode (default).

## 11.2 Reading and Writing
- **Standard**:
- \\\`read(size)\\\`: Reads file contents.
- \\\`readline()\\\`: Reads one line.
- \\\`readlines()\\\`: Reads all lines as a list of strings.
- \\\`write(text)\\\`: Writes string to file.
- **Context Manager**: Automatically closes files.
  \\\`\\\`\\\`python
  with open("data.txt", "r", encoding="utf-8") as file:
      content = file.read()
  \\\`\\\`\\\`

## 11.3 File Pointer & CSVs
- **\\\`tell()\\\`**: Returns current position of file pointer.
- **\\\`seek(offset)\\\`**: Moves file pointer to a specific byte location.
- **CSV Handling**:
- \\\`csv.reader(file)\\
`,
  12: `

# Module 12: OOP Fundamentals

### Learning Objectives
After completing this module, you will be able to:
- Construct Python classes and initialize object instances.
- Define instance variables and class attributes.
- Use the __init__ constructor and explain the self parameter.
- Implement custom string conversions via __str__ and __repr__.
- Differentiate class functions (methods) from normal functions.

## 12.1 Classes and Objects
Object-Oriented Programming (OOP) organizes code around objects and classes.
- **Class**: A blueprint/template for creating objects.
- **Object**: An instance of a class.

## 12.2 Constructors and Attributes
- **\\\`__init__(self, ...)\\\`**: Special method called when an object is initialized.
- **\\\`self\\\`**: Refers to the current object instance. Not a keyword, but standard naming convention.
- **Instance Attributes**: Attributes bound to \\\`self\\\` (different for each object).
- **Class Attributes**: Defined directly inside the class body (shared across all instances).

## 12.3 String representation methods
- **\\\`__str__()\\\`**: Human-readable string representation of an object (called by \\\`print()\\\` or \\\`str()\\\`).
- **\\\`__repr__()\\\`**: Detailed developer-oriented representation (called by \\\`repr()\\\`).

## 12.4 Practical Lab Exercises
- **Task 1**: Create a \\\`Student\\\` class with attributes: \\\`name\\
`,
  13: `

# Module 13: Four Pillars of OOP

### Learning Objectives
After completing this module, you will be able to:
- Protect internal attributes using private and protected naming conventions.
- Implement class getter and setter methods using property decorators.
- Construct subclass hierarchies using inheritance to reuse behaviors.
- Apply method overriding and invoke parent methods using super().
- Create abstract base classes using the abc module.

## 13.1 Encapsulation
Bundling data and methods together and restricting direct access.
- **Naming Conventions**:
- Public: \\\`name\\\` (accessible directly).
- Protected: \\\`_name\\\` (non-public by convention, accessible inside class and subclasses).
- Private: \\\`__name\\\` (triggers name mangling: transformed to \\\`_ClassName__name\\\` to prevent direct external access).
- **Getters & Setters**: Implement controlled updates.
- **\\\`@property\\\` Decorator**: Allows accessing getter/setter methods as attributes.

## 13.2 Inheritance
Reusing properties and methods of a parent class in a child class.
- **Syntax**: \\\`class Child(Parent):\\\`
- **Method Overriding**: Child class provides a custom implementation of an inherited method.
- **\\\`super()\\\`**: Invokes parent class constructors or methods.

## 13.3 Abstraction
Hiding implementation details and exposing only essential behavior.
- **Abstract Base Classes**: Inherit from \\\`ABC\\\` (from \\\`abc\\\` module) and declare abstract methods with the \\\`@abstractmethod\\\` decorator. Cannot be instantiated directly.

## 13.4 Practical Lab Exercises
- **Task 1**: Write a class hierarchy where a parent class \\\`Employee\\\` is subclassed by \\\`Manager\\\`. Override the salary calculation logic.
- **Task 2**: Create an abstract class \\\`Shape\\\` with an abstract method \\\`area()\\\`. Subclass it into \\\`Rectangle\\\` and \\\`Circle\\\`.

`,
  14: `

# Module 14: Advanced OOP in Python

### Learning Objectives
After completing this module, you will be able to:
- Construct single, multiple, multilevel, hierarchical, and hybrid inheritance models.
- Determine method search paths using Method Resolution Order (MRO).
- Avoid duplication in multiple inheritance hierarchies (Diamond Problem).
- Define class methods (@classmethod) and static methods (@staticmethod).
- Customize behavior using dunder methods (len, eq, add).

## 14.1 Inheritance Patterns
- **Single**: One parent, one child.
- **Multiple**: One child inherits from multiple parent classes (e.g., \\\`class Child(Father, Mother):\\\`).
- **Multilevel**: Inheritance chain (Grandparent -> Parent -> Child).
- **Hierarchical**: One parent, multiple child classes.
- **Hybrid**: Combination of inheritance patterns.

## 14.2 Method Resolution Order (MRO)
- Determines the exact lookup path Python uses to search for methods.
- Resolved via the C3 Linearization algorithm.
- Accessible via \\\`ClassName.mro()\\\` or \\\`ClassName.__mro__\\\`.
- **Diamond Problem**: Multiple inheritance where classes share a common base. Python's MRO determines the search sequence (e.g., \\\`D -> B -> C -> A -> object\\\`).

## 14.3 Special Methods and Overloading
- **Class methods**: Decorated with \\\`@classmethod\\\`; receive class (\\\`cls\\\`) as parameter.
- **Static methods**: Decorated with \\\`@staticmethod\\\`; receive no class or instance reference.
- **Dunder methods**: Customize behavior (e.g., \\\`__len__()\\\` for length, \\\`__eq__()\\\` for equality, \\\`__add__()\\\` for addition overloading).

## 14.4 Practical Lab Exercises
- **Task 1**: Implement custom addition for a \\\`Point(x, y)\\\` class using operator overloading.
- **Task 2**: Create a multiple inheritance structure representing a \\\`Smartphone\\\` inheriting from \\\`Camera\\\` and \\\`Phone\\
`,
};

export const pythonCourseModules: ModuleItem[] = [
  {
    id: 'python-mod-1',
    title: 'Module 1: Introduction to Python',
    description: 'Python features, history, environment setup, syntax, comments, keywords, case-sensitivity, and indentation.',
    duration: '2 Hours',
    topics: [
      {
        id: 'python-topic-1',
        title: 'Topic 1: Language Introduction',
        description: 'First program print statement, parser bytecode PVM execution flow, and indentation blocks.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-1-notes',
            'Module 1 - Complete Notes',
            'Module 1 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[1]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-2',
    title: 'Module 2: Variables & Data Types',
    description: 'Variables assignment, identifiers rules, dynamic typing, numeric/text/boolean types, and mutability vs immutability.',
    duration: '2 Hours',
    topics: [
      {
        id: 'python-topic-2',
        title: 'Topic 2: Variable Declarations & Typings',
        description: 'Variables, data types (int, float, complex, str, bool, None), casting, type checks, and aliasing.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-2-notes',
            'Module 2 - Complete Notes',
            'Module 2 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[2]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-3',
    title: 'Module 3: Operators',
    description: 'Arithmetic, comparison, assignment, logical short-circuit, bitwise, membership, identity, and precedence rules.',
    duration: '2 Hours',
    topics: [
      {
        id: 'python-topic-3',
        title: 'Topic 3: Operator Categories & Expressions',
        description: 'Evaluating math, logical comparison, in membership, is identity, and exponentiation associativity.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-3-notes',
            'Module 3 - Complete Notes',
            'Module 3 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[3]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-4',
    title: 'Module 4: Input, Output & Basic Programs',
    description: 'Input casting, print sep/end formatting, f-strings, swapping, digit extracting, and time/interest scripts.',
    duration: '2 Hours',
    topics: [
      {
        id: 'python-topic-4',
        title: 'Topic 4: Basic Computations & String Formats',
        description: 'Formatted f-strings, multiple inputs, swapping variables, division modulus digit checks, and calculator flowcharts.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-4-notes',
            'Module 4 - Complete Notes',
            'Module 4 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[4]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-5',
    title: 'Module 5: Conditional Statements',
    description: 'If-elif-else branches, nesting, conditional expressions (ternary), truthy/falsy objects, and range/ATM checks.',
    duration: '2 Hours',
    topics: [
      {
        id: 'python-topic-5',
        title: 'Topic 5: Decision Control Flows',
        description: 'Branch flows, grade checkers, leap year formulas, string comparisons, and indentation mistakes.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-5-notes',
            'Module 5 - Complete Notes',
            'Module 5 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[5]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-6',
    title: 'Module 6: Loops',
    description: 'For, while loops, range step sequences, loop-else blocks, break/continue, pattern printing, and prime checkers.',
    duration: '3 Hours',
    topics: [
      {
        id: 'python-topic-6',
        title: 'Topic 6: Iterative Loops & Repetitions',
        description: 'For and while loops, break, continue, pass, nested loops, prime checkers, and time complexity insights.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-6-notes',
            'Module 6 - Complete Notes',
            'Module 6 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[6]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-7',
    title: 'Module 7: Strings',
    description: 'String index positive/negative, slicing, immutability, built-in string methods, checks, and formatting.',
    duration: '2 Hours',
    topics: [
      {
        id: 'python-topic-7',
        title: 'Topic 7: Text Sequence Operations & Methods',
        description: 'String slicing, reversal, methods (lower, replace, split, join), character validation, and raw escape characters.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-7-notes',
            'Module 7 - Complete Notes',
            'Module 7 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[7]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-8',
    title: 'Module 8: Python Collections',
    description: 'Lists, tuples, sets, dictionaries definitions, methods, differences, list comprehensions, and nested collections.',
    duration: '3 Hours',
    topics: [
      {
        id: 'python-topic-8',
        title: 'Topic 8: Collections & Data Structures',
        description: 'List append/extend, tuple unpacking, set union/intersection, dict get/keys/items, and dictionary comprehensions.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-8-notes',
            'Module 8 - Complete Notes',
            'Module 8 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[8]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-9',
    title: 'Module 9: Functions',
    description: 'Defining functions, parameters vs arguments, return value, default params, *args, **kwargs, scope, recursion, and lambdas.',
    duration: '3 Hours',
    topics: [
      {
        id: 'python-topic-9',
        title: 'Topic 9: Modular Programming & Scopes',
        description: 'Positional vs keyword args, local vs global variables, recursive factorials, docstrings, type hints, and lambdas.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-9-notes',
            'Module 9 - Complete Notes',
            'Module 9 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[9]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-10',
    title: 'Module 10: Modules, Packages & Exception Handling',
    description: 'Modules import syntax, packages directory structures, try-except-else-finally blocks, raise exceptions, and asserts.',
    duration: '2 Hours',
    topics: [
      {
        id: 'python-topic-10',
        title: 'Topic 10: Namespaces & Runtime Error Handling',
        description: 'Import namespaces, packages __init__, exception hierarchies, try-except blocks, and custom exception definitions.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-10-notes',
            'Module 10 - Complete Notes',
            'Module 10 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[10]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-11',
    title: 'Module 11: File Handling',
    description: 'File streams open modes, read, readline, write, append, with context managers, seek/tell pointers, and CSV.',
    duration: '2 Hours',
    topics: [
      {
        id: 'python-topic-11',
        title: 'Topic 11: Disk Persistence & File Streams',
        description: 'Read write modes, file pointers tell seek, file iteration, encoding, and reading/writing CSV with DictReader.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-11-notes',
            'Module 11 - Complete Notes',
            'Module 11 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[11]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-12',
    title: 'Module 12: OOP Fundamentals',
    description: 'Classes, object instances, __init__ constructor, self parameter, instance vs class attributes, methods, and dunders.',
    duration: '3 Hours',
    topics: [
      {
        id: 'python-topic-12',
        title: 'Topic 12: Class藍圖 & Objects Instances',
        description: 'Constructor __init__, self conventions, instance attributes, class attributes, methods, and __str__/__repr__ overrides.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-12-notes',
            'Module 12 - Complete Notes',
            'Module 12 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[12]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-13',
    title: 'Module 13: Four Pillars of OOP',
    description: 'Encapsulation, inheritance, polymorphism, abstraction, access qualifiers, getters/setters, super(), and abstract base classes.',
    duration: '3 Hours',
    topics: [
      {
        id: 'python-topic-13',
        title: 'Topic 13: Encapsulation, Inheritance, Polymorphism & Abstraction',
        description: 'Private mangling, getters/setters @property, parent child classes, sound overriding, duck typing, and abstract base classes.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-13-notes',
            'Module 13 - Complete Notes',
            'Module 13 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[13]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-14',
    title: 'Module 14: Advanced OOP in Python',
    description: 'Inheritance types, MRO search order algorithm, Diamond problem, class methods, static methods, and operator overloading.',
    duration: '3 Hours',
    topics: [
      {
        id: 'python-topic-14',
        title: 'Topic 14: Advanced Class Hierarchies & Dunder Overloads',
        description: 'Single/multiple/multilevel/hierarchical/hybrid MRO logic, class methods @classmethod, static methods @staticmethod, and __add__/__eq__ overloading.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-14-notes',
            'Module 14 - Complete Notes',
            'Module 14 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[14]
          )
        ]
      }
    ]
  },
  {
    id: 'python-mod-15',
    title: 'Module 15: Intermediate Python & OOP Project',
    description: 'Iterators, generators, decorators, map/filter/reduce lambdas, zip/enumerate, type hints, and student management project.',
    duration: '3 Hours',
    topics: [
      {
        id: 'python-topic-15',
        title: 'Topic 15: Iterators, Decorators & Capstone Project',
        description: 'Generators yield keyword, function decorators wrapper, student record system CSV persistence, and debugging methods.',
        estimatedDuration: '45 mins',
        learningUnits: [
          createLesson(
            'python-unit-15-notes',
            'Module 15 - Complete Notes',
            'Module 15 Complete Notes from PDF.',
            '45 mins',
            'Reading',
            pythonSyllabusNotes[15]
          )
        ]
      }
    ]
  }
];