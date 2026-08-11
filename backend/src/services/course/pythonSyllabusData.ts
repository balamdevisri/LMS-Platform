export const pythonSyllabusNotes: Record<number, string> = {
  1: `
# Module 1: Introduction to Python & Basics

### Learning Objectives
After completing this module, you will be able to:
- Explain what Python is, its key features, and history.
- Set up a Python environment and run your first Python script.
- Understand basic syntax, code comments, and keywords.
- Explain the role of indentation in block structure.
- Swap variables and execute basic I/O using print() and input().

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
\`\`\`text
Python Source Code (.py) ──> Python Parser ──> Bytecode (.pyc) ──> PVM ──> Machine Output
\`\`\`

## 1.4 Variables & Basic Syntax
A variable name refers to an object. In Python, variables are names bound to objects, not static memory boxes.
- **Indentation Matters**: Python uses indentation (standard: 4 spaces) instead of curly braces \`{}\` to define blocks of code.
- **Comments**: Single-line comments start with \`#\`. Multi-line comments can be implemented with triple-quoted strings (\`"""\`).
- **Case-Sensitivity**: \`name\`, \`Name\`, and \`NAME\` are different identifiers.

## 1.5 Basic Input/Output
- **\`print()\` Function**: Displays output.
  - \`sep\` parameter: separator between arguments (default is space).
  - \`end\` parameter: printed at the end (default is newline).
- **\`input()\` Function**: Receives string input from the user. Use type casting (e.g., \`int()\` or \`float()\`) to convert.

## 1.6 C vs Python Comparison
| Feature | C Language | Python |
| :--- | :--- | :--- |
| Block syntax | Curly braces \`{}\` | Indentation (4 spaces) |
| Typing | Static typing | Dynamic typing |
| Semicolons | Mandatory | Unnecessary |
| Compilation | Compiled directly to machine code | Interpreted (compiled to bytecode, run on PVM) |

## 1.7 Beginner Practice Programs
1. Print "Hello Python".
2. Print student Name, College, and Branch.
3. Take two numbers and print their sum.
4. Convert temperature from Celsius to Fahrenheit.

## 1.8 Interview Questions & Answers
1. **Is Python case-sensitive?**
   - Yes, \`name\` and \`Name\` are different identifiers.
2. **What does \`input()\` return?**
   - It always returns a string.
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
  - Cannot be a Python keyword (e.g., \`class\`, \`if\`, \`def\`).

## 2.2 Built-in Data Types
Python provides several fundamental data types:
1. **Numeric**:
   - \`int\`: Whole numbers (arbitrary precision).
   - \`float\`: Fractional numbers (supports scientific notation, e.g., \`2.5e3\`).
   - \`complex\`: Real and imaginary parts (e.g., \`3 + 4j\`).
2. **Boolean (\`bool\`)**: \`True\` or \`False\`. Note: \`bool\` is a subclass of \`int\` (\`True == 1\`, \`False == 0\`).
3. **Text (\`str\`)**: Sequences of characters. Supports positive and negative indexing.
4. **Special (\`NoneType\`)**: Represents the absence of value (\`None\`).

## 2.3 Type Verification & Conversion
- **\`type(x)\`**: Returns the exact class of \`x\`.
- **\`isinstance(x, class)\`**: Checks if \`x\` is an instance of a class or its subclass.
- **Casting**: \`int()\`, \`float()\`, \`str()\`, \`bool()\`, \`complex()\`.
  - *Important*: \`int(10.8)\` truncates the fractional part toward zero, returning \`10\`.

## 2.4 Mutability vs Immutability
- **Immutable**: Content cannot be changed after creation (e.g., \`int\`, \`float\`, \`complex\`, \`bool\`, \`str\`, \`tuple\`).
- **Mutable**: Content can be changed in-place (e.g., \`list\`, \`set\`, \`dict\`).
- **Aliasing**: Multiple names referring to the same mutable object can modify it, affecting all references.

## 2.5 Practical Lab Exercises
- **Task 1**: Write a script that inputs student details and checks types of each input.
- **Task 2**: Calculate a user's age next year based on their birth year.
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
1. **Arithmetic**: \`+\network\`, \`-\`, \`*\network\`, \`/\` (float division), \`//\` (floor division), \`%\` (modulus), \`**\` (exponentiation).
   - *Example*: \`-10 // 3\` results in \`-4\` (rounds down).
2. **Comparison**: \`==\`, \`!=\network\`, \`>\`, \`<\`, \`>=\`, \`<=\`. Evaluates to \`True\` or \`False\`.
3. **Assignment**: \`=\` and compound operators (\`+=\`, \`-=\`, \`*=\`, etc.).
4. **Logical**: \`and\`, \`or\`, \`not\`.
   - **Short-circuit**: \`and\` stops if left side is false; \`or\` stops if left side is true.
5. **Bitwise**: \`&\` (AND), \`|\` (OR), \`^\` (XOR), \`~\` (NOT), \`<<\` (Left shift), \`>>\` (Right shift).
6. **Membership**: \`in\` and \`not in\` (tests membership in collections; checks keys in dictionaries).
7. **Identity**: \`is\` and \`is not\` (checks if two references point to the same object in memory).

## 3.2 Operator Precedence
Precedence hierarchy (highest to lowest):
1. Parentheses \`()\`
2. Exponentiation \`**\` (right-associative: \`2 ** 3 ** 2\` is \`2 ** (3 ** 2) = 512\`)
3. Unary operators (\`+x\`, \`-x\`, \`~x\`)
4. Multiplication, division, floor division, modulus (\`*\`, \`/\`, \`//\`, \`%\`)
5. Addition and subtraction (\`+\network\`, \`-\`)
6. Shifting (\`<<\`, \`>>\`)
7. Bitwise AND (\`&\`)
8. Bitwise XOR (\`^\`)
9. Bitwise OR (\`|\`)
10. Comparison, Identity, Membership
11. Logical NOT (\`not\`)
12. Logical AND (\`and\`)
13. Logical OR (\`or\`)

## 3.3 Practical Lab Exercises
- **Task 1**: Build a calculator that inputs two floats and prints all basic arithmetic operations.
- **Task 2**: Write a program that checks eligibility for voting: age >= 18 and has ID.
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
- **f-Strings**: Use curly braces \`{}\` inside an f-prefixed string to format variables and expressions.
  - *Example*: \`print(f"Price = {price:.2f}")\` formats to 2 decimal places.
- **Multiple Inputs**:
  - \`a, b = input("Enter two words: ").split()\`
  - \`a, b = map(int, input("Enter two numbers: ").split())\`

## 4.2 Core Mathematical Programs
- **Swapping**:
  - Unpacking swap: \`a, b = b, a\` (no temp variable needed).
  - Traditional swap: \`temp = a; a = b; b = temp\`.
- **Digit Manipulations**:
  - Last digit: \`digit = number % 10\`
  - Remove last digit: \`number = number // 10\`
- **Conversions**:
  - Minutes to hours: \`hours = minutes // 60\`, \`remaining = minutes % 60\`.
  - Celsius/Fahrenheit: \`f = (c * 9/5) + 32\`.

## 4.3 Practical Projects
- **Task 1**: Write a script to calculate salary: input basic salary, HRA, and DA, then output the total salary formatted to 2 decimal places.
- **Task 2**: Write a program to reverse a three-digit integer and verify its output.
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
- **\`if\` Statement**: Runs a block if a condition is \`True\`.
- **\`if-else\`**: Offers a binary choice.
- **\`if-elif-else\`**: Handles multiple mutually exclusive conditions.
  - *Important*: Conditions are checked from top to bottom. The first matching branch is executed, and others are skipped.

## 5.2 Conditional Expressions
Ternary shorthand syntax:
\`\`\`python
value_if_true if condition else value_if_false
\`\`\`
- *Example*: \`result = "Adult" if age >= 18 else "Minor"\`

## 5.3 Truthy & Falsy Values
In Python, objects evaluate to \`True\` or \`False\` in conditional contexts.
- **Falsy Values**:
  - \`False\`
  - \`None\`
  - \`0\`, \`0.0\`
  - Empty sequences/collections: \`""\`, \`[]\`, \`()\network\`, \`{}\`, \`set()\`
- **Truthy**: Any non-empty string, list, set, dictionary, or non-zero number.

## 5.4 Practical Examples
- **Leap Year Checker**:
  \`\`\`python
  if year % 400 == 0 or (year % 4 == 0 and year % 100 != 0):
      print("Leap year")
  else:
      print("Not a leap year")
  \`\`\`
- **ATM Withdrawal simulation**: Checks if amount is positive and <= balance before updating balance.
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
- **\`for\` Loop**: Iterates over an sequence/iterable (lists, strings, ranges).
- **\`while\` Loop**: Repeats as long as a condition remains true. Always update the condition variable to avoid infinite loops.

## 6.2 Range Generation
- **\`range(stop)\`**: Generates integers from 0 to \`stop - 1\`.
- **\`range(start, stop)\`**: Generates integers from \`start\` to \`stop - 1\`.
- **\`range(start, stop, step)\`**: Increments by \`step\`.
  - *Negative Step*: \`range(5, 0, -1)\` yields \`5, 4, 3, 2, 1\`.

## 6.3 Loop Control
- **\`break\`**: Immediately terminates the nearest enclosing loop.
- **\`continue\`**: Skips the rest of the current iteration and jumps to the next loop evaluation.
- **\`pass\`**: A null statement placeholder. Used for empty syntax blocks.
- **Loop \`else\`**: Executes when the loop terminates normally (without hitting a \`break\` statement).

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
- **Indexing**: Support positive (\`0\` to \`N-1\`) and negative (\`-1\` to \`-N\`) indices.
- **Slicing**: \`string[start:stop:step]\` (the \`stop\` index is excluded).
  - *Reversing*: \`text[::-1]\` creates a reversed copy.
- **Immutability**: You cannot modify characters directly (\`text[0] = "A"\` raises a TypeError). Reassign instead: \`text = "A" + text[1:]\`.

## 7.2 String Methods
- **Case conversion**: \`lower()\`, \`upper()\network\`, \`capitalize()\network\`, \`title()\`, \`swapcase()\`.
- **Whitespace**: \`strip()\`, \`lstrip()\`, \`rstrip()\` remove spaces.
- **Search & Edit**:
  - \`replace(old, new)\`: Replaces occurrences of a substring.
  - \`find(sub)\`: Returns the index of the first occurrence, or \`-1\` if not found.
  - \`index(sub)\`: Same as find but raises a ValueError if not found.
  - \`split(separator)\`: Divides a string into a list of strings.
  - \`join(iterable)\`: Combines elements with a separator string.

## 7.3 Character Checks & Escapes
- **Checks**: \`isalpha()\`, \`isdigit()\`, \`isalnum()\`, \`isspace()\`, \`isidentifier()\`.
- **Escapes**: \`\\n\` (newline), \`\\t\` (tab), \`\\\\\` (backslash).
- **Raw Strings**: Prefixed with \`r\` (e.g. \`r"C:\\Users"\`) to treat backslashes as literal characters.

## 7.4 Practical Programs
- Write a palindrome checker (case-insensitive).
- Count the frequency of a user-input character in a string.
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
| **List** | \`[]\` | Yes | Yes | Yes | Indexing |
| **Tuple** | \`()\` | Yes | No | Yes | Indexing |
| **Set** | \`{}\` (or \`set()\`) | No | Yes | No | Unindexed |
| **Dictionary**| \`{key: value}\` | Yes (insertion) | Yes | Keys: No | Key lookup |

## 8.2 List & Tuple Methods
- **List additions**: \`append(x)\` (adds one object), \`insert(idx, x)\` (adds at index), \`extend(iterable)\` (merges elements).
- **List deletions**: \`remove(val)\` (removes first match), \`pop(idx)\` (removes and returns at index), \`clear()\` (empties list), \`del\` statement.
- **Tuple Unpacking**: \`a, b, c = student_tuple\`.

## 8.3 Set Operations
- **Edits**: \`add(x)\`, \`update(list)\`, \`remove(x)\` (error if missing), \`discard(x)\` (no error).
- **Math**: Union (\`|\`), Intersection (\`&\`), Difference (\`-\`), Symmetric Difference (\`^\`).

## 8.4 Dictionaries
- **Edits**: \`dict[key] = val\`, \`update({key: val})\`, \`pop(key)\`, \`del dict[key]\`.
- **Lookups**: \`dict[key]\` (raises KeyError if missing), \`dict.get(key, default)\` (returns default if missing).
- **Iteration**: \`keys()\`, \`values()\`, \`items()\` (yielding key-value pairs).

## 8.5 Comprehensions
- **List**: \`[x**2 for x in range(5) if x % 2 == 0]\`
- **Dictionary**: \`{x: x**2 for x in range(5)}\`

## 8.6 Practical Exercises
- **Task 1**: Write a script to count word frequency in a sentence using a dictionary.
- **Task 2**: Write a program to merge two lists and remove duplicate items while keeping order.
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
- **Return**: Sends values back to the caller. A function without an explicit \`return\` returns \`None\`.

## 9.2 Argument Configurations
- **Default Parameters**: Must follow non-default parameters.
- **Keyword Arguments**: Passed as \`name="John"\`, order does not matter.
- **\`*args\`**: Receives positional arguments as a tuple.
- **\`**kwargs\`**: Receives keyword arguments as a dictionary.

## 9.3 Variable Scope & Design
- **Local variables**: Defined inside a function; inaccessible outside.
- **Global variables**: Declared outside. To rebind a global variable inside a function, declare it with the \`global\` keyword.
- **Docstrings**: String literal at function start to document it (accessible via \`func.__doc__\`).
- **Type hints**: Annotate parameter and return types (e.g., \`def add(a: int) -> int:\`).

## 9.4 Recursion & Lambdas
- **Recursion**: Function calling itself. Must have a base case to stop execution.
- **Lambda**: Anonymous one-line functions (e.g., \`square = lambda x: x * x\`).
- **High-Order Functions**: \`map(func, iterable)\` and \`filter(func, iterable)\` commonly use lambdas.

## 9.5 Practical Exercises
- Write a recursive function to find the factorial of a number.
- Write a program that sorts a list of student tuples by their grade using a lambda key.
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
- **Package**: A folder containing modules. Standard packages contain an \`__init__.py\` file.
- **Imports**: \`import math\`, \`from math import sqrt\`, \`import numpy as np\`. Avoid wildcard imports (\`from module import *\`).
- **\`__name__\`**: Special variable. When a file is run directly, its value is \`"__main__"\`.

## 10.2 Exception Handling
An exception disrupts the normal program execution flow.
- **try-except**:
  \`\`\`python
  try:
      result = 10 / 0
  except ZeroDivisionError as e:
      print("Cannot divide by zero:", e)
  \`\`\`
- **else**: Runs if the try block completes without exceptions.
- **finally**: Always runs (used for cleanup).
- **raise**: Manually triggers an exception (e.g., \`raise ValueError("Invalid number")\`).
- **assert**: Checks conditions; raises an \`AssertionError\` if false.
- **Custom Exceptions**: Inherit from the base \`Exception\` class.

## 10.3 Practical Lab Exercises
- **Task 1**: Write a calculator program that catches invalid non-numeric input and division-by-zero errors.
- **Task 2**: Define a custom exception \`NegativeBalanceError\` and raise it in a bank transaction script.
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
- \`r\`: Read (default). Error if file does not exist.
- \`w\`: Write (truncates existing file).
- \`a\`: Append (preserves contents).
- \`x\`: Create (fails if file exists).
- \`b\`: Binary mode (e.g., \`rb\`).
- \`t\`: Text mode (default).

## 11.2 Reading and Writing
- **Standard**:
  - \`read(size)\`: Reads file contents.
  - \`readline()\`: Reads one line.
  - \`readlines()\`: Reads all lines as a list of strings.
  - \`write(text)\`: Writes string to file.
- **Context Manager**: Automatically closes files.
  \`\`\`python
  with open("data.txt", "r", encoding="utf-8") as file:
      content = file.read()
  \`\`\`

## 11.3 File Pointer & CSVs
- **\`tell()\`**: Returns current position of file pointer.
- **\`seek(offset)\`**: Moves file pointer to a specific byte location.
- **CSV Handling**:
  - \`csv.reader(file)\`, \`csv.writer(file)\`.
  - \`csv.DictReader(file)\`, \`csv.DictWriter(file, fieldnames)\` allow mapping rows directly to dictionaries.

## 11.4 Practical Exercises
- Write a program to read a text file and count the number of lines, words, and characters.
- Write a program to save list of student dictionaries into a CSV file with header fields.
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
- **\`__init__(self, ...)\`**: Special method called when an object is initialized.
- **\`self\`**: Refers to the current object instance. Not a keyword, but standard naming convention.
- **Instance Attributes**: Attributes bound to \`self\` (different for each object).
- **Class Attributes**: Defined directly inside the class body (shared across all instances).

## 12.3 String representation methods
- **\`__str__()\`**: Human-readable string representation of an object (called by \`print()\` or \`str()\`).
- **\`__repr__()\`**: Detailed developer-oriented representation (called by \`repr()\`).

## 12.4 Practical Lab Exercises
- **Task 1**: Create a \`Student\` class with attributes: \`name\`, \`age\`, and \`marks\`. Write methods to display details and check if they passed (marks >= 40).
- **Task 2**: Create a \`BankAccount\` class with owner and balance, and define deposit and display methods.
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
  - Public: \`name\` (accessible directly).
  - Protected: \`_name\` (non-public by convention, accessible inside class and subclasses).
  - Private: \`__name\` (triggers name mangling: transformed to \`_ClassName__name\` to prevent direct external access).
- **Getters & Setters**: Implement controlled updates.
- **\`@property\` Decorator**: Allows accessing getter/setter methods as attributes.

## 13.2 Inheritance
Reusing properties and methods of a parent class in a child class.
- **Syntax**: \`class Child(Parent):\`
- **Method Overriding**: Child class provides a custom implementation of an inherited method.
- **\`super()\`**: Invokes parent class constructors or methods.

## 13.3 Abstraction
Hiding implementation details and exposing only essential behavior.
- **Abstract Base Classes**: Inherit from \`ABC\` (from \`abc\` module) and declare abstract methods with the \`@abstractmethod\` decorator. Cannot be instantiated directly.

## 13.4 Practical Lab Exercises
- **Task 1**: Write a class hierarchy where a parent class \`Employee\` is subclassed by \`Manager\`. Override the salary calculation logic.
- **Task 2**: Create an abstract class \`Shape\` with an abstract method \`area()\`. Subclass it into \`Rectangle\` and \`Circle\`.
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
- **Multiple**: One child inherits from multiple parent classes (e.g., \`class Child(Father, Mother):\`).
- **Multilevel**: Inheritance chain (Grandparent -> Parent -> Child).
- **Hierarchical**: One parent, multiple child classes.
- **Hybrid**: Combination of inheritance patterns.

## 14.2 Method Resolution Order (MRO)
- Determines the exact lookup path Python uses to search for methods.
- Resolved via the C3 Linearization algorithm.
- Accessible via \`ClassName.mro()\` or \`ClassName.__mro__\`.
- **Diamond Problem**: Multiple inheritance where classes share a common base. Python's MRO determines the search sequence (e.g., \`D -> B -> C -> A -> object\`).

## 14.3 Special Methods and Overloading
- **Class methods**: Decorated with \`@classmethod\`; receive class (\`cls\`) as parameter.
- **Static methods**: Decorated with \`@staticmethod\`; receive no class or instance reference.
- **Dunder methods**: Customize behavior (e.g., \`__len__()\` for length, \`__eq__()\` for equality, \`__add__()\` for addition overloading).

## 14.4 Practical Lab Exercises
- **Task 1**: Implement custom addition for a \`Point(x, y)\` class using operator overloading.
- **Task 2**: Create a multiple inheritance structure representing a \`Smartphone\` inheriting from \`Camera\` and \`Phone\`, and check its MRO.
`,
  15: `
# Module 15: Intermediate Python & OOP Project

### Learning Objectives
After completing this module, you will be able to:
- Construct custom iterators and generators.
- Apply function decorators to extend function behaviors.
- Write type hints and clean, professional Python code.
- Architect a complete terminal application using OOP principles.
- Predict script outputs and debug exceptions.

## 15.1 Intermediate Features
- **Iterators**: Objects implementing \`__iter__()\` and \`__next__()\`.
- **Generators**: Functions using the \`yield\` keyword to return items lazily.
- **Decorators**: Functions that wrap other functions to modify their behavior.
  - *Example*:
    \`\`\`python
    def my_decorator(func):
        def wrapper():
            print("Before call")
            func()
            print("After call")
        return wrapper
    \`\`\`
    \`\`\`

## 15.2 Capstone Project Architecture
Build a **Student Record System** that manages student objects:
- Class \`Student\` with private fields and properties.
- Methods to calculate grade status.
- File operations to persist and load data in CSV format.
- Interactive terminal menu for searching, adding, and saving student records.
- Input validation to catch ValueErrors and raise custom validation errors.

## 15.3 Practical Exercises
- Implement a custom generator that yields Fibonacci numbers.
- Write a decorator that logs the execution time of a function.
- Complete the Student Record System project with full interactive loops.
`
};
