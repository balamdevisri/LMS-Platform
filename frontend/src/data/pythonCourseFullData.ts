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
# Module 1: Introduction to Python

### Learning Objectives
After completing this module, you will be able to:
- Explain what Python is, its key features, and history.
- Set up a Python environment and run your first Python script.
- Understand basic syntax, code comments, and keywords.
- Explain the role of indentation in block structure.

## 1.1 What is Python?
Python is a high-level, general-purpose programming language known for its simple and readable syntax.

## 1.2 Features of Python
- Easy to Learn (beginner-friendly)
- High-Level Language (automatic memory management)
- Dynamically Typed (no need to declare variables)
- Interpreted / Bytecode-Based Execution (executes on PVM)

## 1.3 Your First Python Program
\`\`\`python
print("Hello World")
\`\`\`

## 1.4 Indentation Rules
Python uses indentation (standard: 4 spaces) instead of curly braces to define blocks of code.
`,
  2: `
# Module 2: Variables & Data Types

### Learning Objectives
- Declare and assign variables dynamically.
- Understand standard data types: int, float, complex, str, bool, None.
- Perform type checks and type conversions.

## 2.1 Variables
A variable is a name bound to an object in Python.

## 2.2 Built-in Data Types
- **int**: Whole numbers (arbitrary precision).
- **float**: Floating-point fractional numbers.
- **complex**: Complex numbers (e.g., \`3 + 4j\`).
- **str**: Character sequences.
- **bool**: True or False.
- **None**: Represents absence of value.
`,
  3: `
# Module 3: Operators

### Learning Objectives
- Use arithmetic, comparison, assignment, logical, bitwise, membership, and identity operators.
- Understand short-circuit evaluation and operator precedence.

## 3.1 Operator Categories
- Arithmetic: \`+\`, \`-\`, \`*\`, \`/\`, \`//\` (floor division), \`%\` (modulus), \`**\` (exponent)
- Comparison: \`==\`, \`!=\`, \`>\`, \`<\`, \`>=\`, \`<=\`
- Assignment: \`=\`, \`+=\`, \`-=\`, etc.
- Logical: \`and\`, \`or\`, \`not\`
- Membership: \`in\`, \`not in\`
- Identity: \`is\`, \`is not\`
`,
  4: `
# Module 4: Input, Output & Basic Programs

### Learning Objectives
- Perform basic I/O with print() and input().
- Use f-strings for string formatting.
- Construct basic mathematical and swapping programs.

## 4.1 Input and Output
- input(): always returns a string. Cast it using \`int()\` or \`float()\`.
- print(): prints values. Customize using \`sep\` and \`end\` parameters.
- f-strings: \`print(f"Name: {name}, Age: {age}")\`.
`,
  5: `
# Module 5: Conditional Statements

### Learning Objectives
- Direct program flow using if, if-else, and if-elif-else constructs.
- Understand truthy and falsy rules in Python.

## 5.1 Syntax and Flow
- Checked from top to bottom. The first True branch runs; others are skipped.
- Indentation groups block statements under condition heads.
`,
  6: `
# Module 6: Loops

### Learning Objectives
- Execute repetitive blocks of code using for and while loops.
- Use range() step parameters to generate sequences.
- Use break, continue, and loop-else blocks.

## 6.1 Constructs
- for loop: iterates over an sequence or range.
- while loop: runs as long as a condition is true.
- range(start, stop, step): generates integers; stop is excluded.
`,
  7: `
# Module 7: Strings

### Learning Objectives
- Work with character indices (positive and negative).
- Slice, reverse, and modify strings.
- Apply built-in string functions.

## 7.1 Indexing and Slicing
- Slicing syntax: \`string[start:stop:step]\`. Reversing: \`text[::-1]\`.
- Strings are immutable. Modify by creating a new string.
`,
  8: `
# Module 8: Python Collections

### Learning Objectives
- Identify Lists, Tuples, Sets, and Dictionaries.
- Construct collection comprehensions.

## 8.1 Key Collections
- **List**: Ordered, mutable, allows duplicates.
- **Tuple**: Ordered, immutable, allows duplicates.
- **Set**: Unordered, mutable, unique elements.
- **Dictionary**: Key-value pairs. Keys must be unique and hashable.
`,
  9: `
# Module 9: Functions

### Learning Objectives
- Define functions with def, parameters, and return statements.
- Configure keyword arguments, default parameters, *args, and **kwargs.
- Build recursive and lambda functions.

## 9.1 Arguments and Scope
- Default parameters must follow non-default parameters.
- scope: local vs global variables.
- lambda: anonymous functions (e.g., \`lambda x: x * 2\`).
`,
  10: `
# Module 10: Modules, Packages & Exception Handling

### Learning Objectives
- Create modules and packages.
- Handle runtime exceptions with try-except-else-finally blocks.

## 10.1 Exception Handling
- Protect code blocks using try/except blocks.
- Common exceptions: ValueError, TypeError, ZeroDivisionError, FileNotFoundError.
`,
  11: `
# Module 11: File Handling

### Learning Objectives
- Open, read, write, and close files.
- Use the with open() context manager.
- Read and write CSV records.

## 11.1 File Modes & Contexts
- Modes: \`r\` (read), \`w\` (write), \`a\` (append).
- \`with open() as file\` handles automatic stream closure.
`,
  12: `
# Module 12: OOP Fundamentals

### Learning Objectives
- Instantiate objects from custom classes.
- Use the __init__ constructor and self parameter.
- Add instance and class attributes.

## 12.1 Classes and Objects
- Class: blueprint/template.
- Object: instance of the class.
- self refers to the current object instance.
`,
  13: `
# Module 13: Four Pillars of OOP

### Learning Objectives
- Protect internal attributes with private/protected prefixes.
- Use properties and setters.
- Establish parent/child relationships and use super().
- Build abstract base classes.

## 13.1 Pillars
- **Encapsulation**: Private fields (\`__name\`) and property decorators.
- **Inheritance**: Subclassing and method overriding.
- **Polymorphism**: Unified interfaces (duck typing).
- **Abstraction**: Abstract classes (ABC module).
`,
  14: `
# Module 14: Advanced OOP in Python

### Learning Objectives
- Implement single, multiple, multilevel, and hierarchical inheritance.
- Check Method Resolution Order (MRO) in diamond structures.
- Define class methods, static methods, and overload operators.

## 14.1 MRO & Special Methods
- MRO determines method lookup order.
- Dunder methods customize operations: \`__eq__\`, \`__len__\`, \`__add__\`.
`,
  15: `
# Module 15: Intermediate Python & OOP Project

### Learning Objectives
- Construct custom iterators, generators, and decorators.
- Implement a complete terminal-based OOP capstone project.

## 15.1 Capstone Project
- Student Record System: manages student objects, calculates grades, performs inputs validation, and persists data to a CSV file.
`
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
