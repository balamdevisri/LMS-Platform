export const cSyllabusNotes: Record<number, string> = {
  1: `
# Module 1: Introduction to C Programming

### Learning Objectives
After completing this module, you will be able to:
- Explain what C programming is and its history.
- Describe the core features and applications of C.
- Write, compile, and execute your first C program.
- Understand the compilation process and execution flowchart.
- Understand C tokens, statements, semicolons, and comments.

## 1.1 What is C?
C is a general-purpose, procedural programming language developed for system programming and application development. It provides low-level memory access while supporting structured programming concepts.
It is known for being:
- **Fast & Efficient**: Runs close to the hardware with minimal runtime overhead.
- **Portable**: Can be compiled on different architectures with minimal changes.
- **Structured**: Programs are divided into functions and logical blocks.

## 1.2 History & Evolution
- Developed by **Dennis Ritchie** at **Bell Labs** in the early 1970s.
- It evolved from earlier languages: BCPL and B.
- Designed primarily to rewrite the **UNIX operating system**, which was previously written in assembly language.

## 1.3 C program structure & Compilation
A C program follows a standard development process:
1. **Source Code** (\`program.c\`) -> Written by the programmer.
2. **Preprocessing**: Resolves preprocessor directives (e.g. \`#include\`, \`#define\`).
3. **Compilation**: Translates C code into assembly language.
4. **Assembly**: Translates assembly code into machine-readable object files (\`.obj\` or \`.o\`).
5. **Linking**: Combines object files and standard library dependencies into an executable file (\`.exe\` or \`.out\`).
6. **Execution**: The OS loads the executable file into memory for execution.

### C Program Execution Flowchart
\`\`\`text
START ──> Write C Program ──> Save as .c ──> Preprocessing ──> Compilation ──> Assembly ──> Linking ──> Executable ──> Execution ──> END
\`\`\`

## 1.4 Your First C Program
\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
\`\`\`

### Anatomy of the Program:
- **\`#include <stdio.h>\`**: Includes the Standard Input/Output library header for \`printf()\`.
- **\`int main()\`**: The entry point of every C program. The execution starts here.
- **\`{\` and \`}\`**: Represents the beginning and end of the function body.
- **\`printf()\`**: Displays text on the standard output.
- **\`return 0;\`**: Returns 0 to the operating system, conventionally indicating successful termination.

## 1.5 C Tokens & Syntax Rules
- **Token**: The smallest meaningful element recognized by the compiler (Keywords, Identifiers, Constants, Strings, Operators, Punctuators).
- **Keywords**: Reserved words with predefined meanings (e.g. \`int\`, \`return\`, \`float\`, \`char\`).
- **Identifiers**: Names given to variables, functions, and arrays. Identifiers are case-sensitive and must start with a letter or underscore.
- **Semicolon (\`;\`)**: Marks the end of a C statement.

## 1.6 Interview Questions & Answers
1. **Who developed C and when?**
   - Dennis Ritchie at Bell Labs in the early 1970s.
2. **Why is C called a middle-level language?**
   - It combines the capabilities of a high-level language (readability, functions) with low-level access (memory manipulation via pointers).

## 1.7 Practical Lab Exercises
- **Task 1**: Write a C program to print "Hello, C Programming!".
- **Task 2**: Write a program to print your Name, College, and Branch.
`,
  2: `
# Module 2: Variables, Constants & Data Types

### Learning Objectives
After completing this module, you will be able to:
- Explain what variables and constants are.
- Declare, initialize, and scope variables.
- Detail the fundamental data types and their memory sizes.
- Understand format specifiers for input and output.
- Work with type conversions (implicit and explicit).

## 2.1 Variables & Constants
- **Variable**: A named storage location in memory used to hold values that can change during program execution.
  - Syntax: \`data_type variable_name = value;\`
  - Example: \`int age = 20;\`
- **Constant**: A fixed value that does not change during program execution.
  - Constants can be defined using the \`const\` keyword or \`#define\`.
  - Example: \`const float PI = 3.14159f;\`

## 2.2 Data Types & Memory Concept
C provides several fundamental data types, each with its own size and range (sizes vary by compiler/architecture, commonly 32/64-bit systems):

| Data Type | Keyword | Typical Size (Bytes) | Range | Format Specifier |
| :--- | :--- | :--- | :--- | :--- |
| **Character** | \`char\` | 1 | -128 to 127 | \`%c\` |
| **Integer** | \`int\` | 4 | -2,147,483,648 to 2,147,483,647 | \`%d\` |
| **Floating-Point** | \`float\` | 4 | 1.2E-38 to 3.4E+38 (6 decimal places) | \`%f\` |
| **Double Precision**| \`double\` | 8 | 2.3E-308 to 1.7E+308 (15 decimal places) | \`%lf\` (in scanf) |
| **Valueless** | \`void\` | 0 | Represents the absence of type | - |

## 2.3 Type Specifiers & Modifiers
- **\`signed\` and \`unsigned\`**: Determines whether negative values can be represented.
- **\`short\` and \`long\`**: Adjusts the storage size and range of integers.
  - Example: \`short int smallNum;\` (2 bytes), \`long long int largeNum;\` (8 bytes).
- **\`sizeof\` Operator**: Determines the exact size of a type or object in bytes.
  - Example: \`printf("Size of int: %zu bytes\n", sizeof(int));\`

## 2.4 Type Conversion & Casting
Type conversion occurs when a value is converted from one data type to another.
- **Implicit (Coercion)**: Automatic promotion by compiler to avoid data loss.
  - Example: \`double x = 10;\` (integer 10 promoted to double 10.0).
- **Explicit (Casting)**: Manually requested by the programmer using cast syntax.
  - Syntax: \`(type) expression\`
  - Example: \`float result = (float)a / b;\` (forces floating-point division).

## 2.5 Input & Output with scanf()
- \`scanf()\` reads formatted input from standard input (keyboard).
- The address-of operator \`&\` must be used to supply the target variable's address.
  - Example: \`scanf("%d", &age);\`

## 2.6 Interview Questions & Answers
1. **What is the difference between float and double?**
   - \`float\` occupies 4 bytes and provides 6 decimal places of precision. \`double\` occupies 8 bytes and provides 15 decimal places of precision.
2. **Why do we check sizeof variables?**
   - Data type sizes are implementation-dependent. The \`sizeof\` operator allows us to write portable code by querying dynamic sizes.

## 2.7 Practical Lab Exercises
- **Task 1**: Create variables for a student (name, age, grade, mark percentage) and display them with proper format specifiers.
- **Task 2**: Write a program to convert temperature from Celsius to Fahrenheit using \`float\` data types.
`,
  3: `
# Module 3: Operators & Expressions

### Learning Objectives
After completing this module, you will be able to:
- Distinguish between operators and operands.
- List and apply all operator types in C.
- Understand operator precedence and associativity.
- Write and evaluate complex C expressions.
- Explain short-circuit evaluation in logical operations.

## 3.1 What is an Operator?
- **Operator**: A symbol that tells the compiler to perform specific mathematical, relational, or logical operations.
- **Operand**: The target value or expression that the operator acts upon.
  - In \`a + b\`, \`+\` is the operator, while \`a\` and \`b\` are operands.

## 3.2 Categories of Operators
C supports a rich set of operators:

1. **Arithmetic**: \`+\` (Add), \`-\` (Subtract), \`*\` (Multiply), \`/\` (Divide), \`%\` (Remainder / Modulus).
   - *Note*: Division between integers results in truncation (integer division). Modulus only works on integers.
2. **Relational**: \`<\` (Less), \`>\` (Greater), \`<=\` (Less or Equal), \`>=\` (Greater or Equal), \`==\` (Equal), \`!=\` (Not Equal).
   - Relational expressions evaluate to \`1\` (true) or \`0\` (false).
3. **Logical**: \`&&\` (AND), \`||\` (OR), \`!\` (NOT).
4. **Assignment**: \`=\` (Simple assignment), and compound assignments like \`+=\`, \`-=\`, \`*=\`, \`/=\`, \`%=\`.
5. **Increment & Decrement**:
   - **Prefix** (\`++x\`, \`--x\`): Increments/decrements first, then uses the value.
   - **Postfix** (\`x++\`, \`x--\`): Uses the old value first, then increments/decrements.
6. **Bitwise**: \`&\` (AND), \`|\` (OR), \`^\` (XOR), \`~\` (NOT), \`<<\` (Left Shift), \`>>\` (Right Shift).
7. **Ternary (Conditional)**: \`condition ? expr1 : expr2;\` (The only three-operand operator in C).
8. **Special Operators**: \`sizeof\`, \`,\` (comma operator).

## 3.3 Operator Precedence & Associativity
- **Precedence**: Determines which operator is evaluated first when an expression has multiple operators (e.g. \`*\` has higher precedence than \`+\`).
- **Associativity**: Determines the evaluation direction (Left-to-Right or Right-to-Left) when operators have equal precedence.
  - *Example*: \`a = b = c = 10;\` evaluates Right-to-Left.

## 3.4 Short-Circuit Evaluation
- In logical AND (\`&&\`), if the left expression is false (\`0\`), the right expression is skipped since the entire operation is already false.
- In logical OR (\`||\u200b\`), if the left expression is true (\`1\`), the right expression is skipped since the entire operation is already true.

## 3.5 Interview Questions & Answers
1. **What is the difference between = and ==?**
   - \`=\` is the assignment operator (stores a value in a variable), while \`==\` is a relational comparison operator (checks for equality).
2. **Evaluate: x = 5; y = x++; What are the values of x and y?**
   - Postfix increment is used. \`y\` gets the old value of \`x\` (\`5\`), and then \`x\` is incremented to \`6\`. Result: \`x = 6\`, \`y = 5\`.

## 3.6 Practical Lab Exercises
- **Task 1**: Write a program to check whether a number is Even or Odd using the modulus operator.
- **Task 2**: Write a program to find the largest of three numbers using relational and logical operators.
`,
  4: `
# Module 4: Input, Output & Decision-Making Statements

### Learning Objectives
After completing this module, you will be able to:
- Use standard formatted and unformatted I/O operations.
- Utilize escape sequences in strings.
- Implement conditional flow using \`if\`, \`if-else\`, and \`else-if\` ladders.
- Write nested conditions safely.
- Create multi-way branches using \`switch-case\` and understand fall-through behavior.

## 4.1 Formatted I/O & Escape Sequences
- **\`printf()\`**: Formats and prints data to stdout.
- **\`scanf()\`**: Reads formatted inputs from stdin.
- **Escape Sequences**: Special character sequences starting with a backslash (\`\\\`) used to format output strings.
  - \`\n\`: New Line
  - \`\t\`: Horizontal Tab
  - \`\\\\\`: Backslash
  - \`\\"\`: Double Quote
  - \`\0\`: Null Character (terminator for strings)

## 4.2 Decision-Making Statements
### 1. Simple \`if\` Statement
Executes a block of code if the condition evaluates to non-zero (true).
\`\`\`c
if (age >= 18) {
    printf("Eligible to vote.\n");
}
\`\`\`

### 2. \`if-else\` Statement
Provides two alternative execution paths.
\`\`\`c
if (number % 2 == 0) {
    printf("Even\n");
} else {
    printf("Odd\n");
}
\`\`\`

### 3. \`else-if\` Ladder
Evaluates multiple mutually exclusive conditions.
\`\`\`c
if (marks >= 90) printf("Grade A\n");
else if (marks >= 75) printf("Grade B\n");
else if (marks >= 60) printf("Grade C\n");
else printf("Fail\n");
\`\`\`

### 4. Nested \`if\`
An \`if\` statement placed inside another \`if\` block.

## 4.3 The \`switch\` Statement
- Provides a clean way to direct execution to multiple case labels based on an integer or character expression.
- **\`break\` keyword**: Exits the switch block. If omitted, execution continues into subsequent cases (fall-through).
- **\`default\` case**: Executed if no case matches.
\`\`\`c
switch (choice) {
    case 1: printf("Add\n"); break;
    case 2: printf("Delete\n"); break;
    default: printf("Invalid choice\n");
}
\`\`\`

## 4.4 Interview Questions & Answers
1. **What is fall-through in a switch statement?**
   - It occurs when a \`case\` block lacks a \`break\` statement, causing the compiler to continue executing subsequent case blocks regardless of whether they match the switch expression.
2. **Can a float value be used in switch case labels?**
   - No, switch expressions and case labels must evaluate to constant integer or character values.

## 4.5 Practical Lab Exercises
- **Task 1**: Write a program that acts as a simple calculator (supporting +, -, *, /) using switch-case.
- **Task 2**: Write a login verification system that checks username and password inputs.
`,
  5: `
# Module 5: Loops & Iteration

### Learning Objectives
After completing this module, you will be able to:
- Explain the concept of iteration and why loops are needed.
- Implement \`for\`, \`while\`, and \`do-while\` loops.
- Contrast entry-controlled vs exit-controlled loops.
- Use nested loops and apply them to pattern printing.
- Understand the role of control statements like \`break\` and \`continue\`.
- Troubleshoot and avoid accidental infinite loops.

## 5.1 Why Loops?
Loops allow a block of code to be executed repeatedly until a specific termination condition is reached, minimizing redundant code.

## 5.2 Loop Types in C
1. **\`for\` Loop (Entry-Controlled)**: Best when the number of iterations is known beforehand.
   - Syntax: \`for (initialization; condition; update) { ... }\`
2. **\`while\` Loop (Entry-Controlled)**: Best when the number of iterations is determined dynamically by a condition.
   - Syntax: \`while (condition) { ... }\`
3. **\`do-while\` Loop (Exit-Controlled)**: Guarantees that the loop body executes **at least once** before the condition is checked. Note the trailing semicolon.
   - Syntax: \`do { ... } while (condition);\`

## 5.3 Loop Control Statements
- **\`break\`**: Terminates the nearest enclosing loop or switch block immediately, transferring control outside the loop.
- **\`continue\`**: Skips the remaining statements in the current iteration and jumps directly to the next loop evaluation/update.

## 5.4 Nested Loops
- A loop placed inside another loop.
- For each iteration of the outer loop, the inner loop executes its entire cycle.
- Commonly used for processing matrices (2D arrays) and pattern printing.
  - *Example Pattern*:
    \`\`\`text
    *
    **
    ***
    \`\`\`

## 5.5 Avoid Accidental Infinite Loops
An infinite loop continues executing indefinitely because its condition never becomes false. Always ensure that the loop update expression progresses towards meeting the termination condition.

## 5.6 Interview Questions & Answers
1. **What is the key difference between while and do-while loops?**
   - A \`while\` loop checks its condition first; if false initially, it never executes. A \`do-while\` loop executes the body first, then checks the condition, guaranteeing at least one execution.
2. **What does continue do in a loop?**
   - It skips the rest of the statements in the current iteration and jumps directly to the loop's update/condition check.

## 5.7 Practical Lab Exercises
- **Task 1**: Write a program to calculate the factorial of a given number using a loop.
- **Task 2**: Write a program to reverse a number (e.g. input 1234 -> output 4321) and count its digits.
`,
  6: `
# Module 6: Functions

### Learning Objectives
After completing this module, you will be able to:
- Explain what functions are and their role in modular programming.
- Write function prototypes (declarations), definitions, and calls.
- Detail parameter passing (arguments vs parameters) and return values.
- Explain local and global variable scopes.
- Understand call-by-value and how pointers simulate call-by-reference.
- Write recursive functions and explain stack frames.

## 6.1 Modular Programming & Functions
A **function** is a self-contained block of code designed to perform a specific task. Dividing a large program into functions makes it modular, reusable, easier to debug, and readable.

## 6.2 Function Components
1. **Declaration (Prototype)**: Informs the compiler about the function name, return type, and parameters before it is used.
   - Example: \`int add(int, int);\`
2. **Definition**: Contains the actual function implementation block.
   - Example:
     \`\`\`c
     int add(int a, int b) {
         return a + b;
     }
     \`\`\`
3. **Call**: Invokes the function to execute its code.
   - Example: \`int sum = add(10, 20);\`

## 6.3 Parameters & Return Values
- **Parameters**: Variables defined in the function header.
- **Arguments**: Actual values passed to the function during a call.
- **Return Statement**: Exits the function and passes a value back to the caller (if the return type is not \`void\`).

## 6.4 Scope: Local vs Global
- **Local Variables**: Declared inside a function block. Accessible only within that function.
- **Global Variables**: Declared outside all functions. Accessible by all functions in the file.

## 6.5 Call by Value
- C uses **pass-by-value** semantics by default.
- The function receives a copy of the argument value. Any modifications made to the parameter inside the function do **not** affect the original variable in the caller.
- To modify caller data, we must pass the variable's address (pointers).

## 6.6 Recursion
- Recursion occurs when a function calls itself.
- Every recursive function must have:
  1. **Base Case**: The termination condition to stop the recursion.
  2. **Recursive Case**: The self-call that progresses toward the base case.
- Without a base case, recursion leads to stack overflow due to infinite calls.

## 6.7 Interview Questions & Answers
1. **What is a function prototype?**
   - It is a declaration that specifies the function's name, return type, and parameters, allowing the compiler to verify calls before the function is defined.
2. **What causes a Stack Overflow in recursion?**
   - If recursion lacks a valid base case or runs too deep, the memory allocated for function calls (stack frames) exhausts the stack memory limit, crashing the program.

## 6.8 Practical Lab Exercises
- **Task 1**: Write a function to check if a number is prime.
- **Task 2**: Write a recursive function to compute the Fibonacci series up to N terms.
`,
  7: `
# Module 7: Arrays

### Learning Objectives
After completing this module, you will be able to:
- Define arrays and explain their memory layouts.
- Declare, initialize, and traverse one-dimensional and two-dimensional arrays.
- Search and sort elements in an array.
- Pass arrays to functions and understand pointer decay.
- Perform matrix addition operations using 2D arrays.

## 7.1 What is an Array?
An **array** is a collection of elements of the same data type stored in contiguous memory locations under a single name.
- **Index**: Represents the position of elements, starting from \`0\` to \`size - 1\`.
- **Contiguous Storage**: Elements are stored back-to-back in memory.

## 7.2 1D Arrays: Declaration & Traversal
- **Declaration**: \`int numbers[5];\`
- **Initialization**: \`int numbers[5] = {10, 20, 30, 40, 50};\`
- **Partial Initialization**: \`int numbers[5] = {10, 20};\u200b\` (Remaining elements are initialized to 0).
- **Traversal**: Loop through indices 0 to \`size - 1\`.
  \`\`\`c
  for (int i = 0; i < 5; i++) {
      printf("%d ", numbers[i]);
  }
  \`\`\`

## 7.3 Array Operations
- **Linear Search**: Scanning each element sequentially to check for a target value.
- **Bubble Sort**: Simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.
  - Time Complexity: O(n²).

## 7.4 Two-Dimensional Arrays (Matrices)
- Represents data in rows and columns.
- **Declaration**: \`int matrix[2][3];\` (2 rows, 3 columns).
- **Initialization**:
  \`\`\`c
  int matrix[2][3] = {
      {10, 20, 30},
      {40, 50, 60}
  };
  \`\`\`
- **Traversal**: Requires nested loops (outer loop for rows, inner loop for columns).

## 7.5 Passing Arrays to Functions
- When an array is passed to a function, it decays to a pointer to its first element.
- The function does **not** get a copy of the array; it operates on the original memory.
- Therefore, the array size must be passed as a separate argument.
  - Prototype: \`void display(int arr[], int size);\`

## 7.6 Interview Questions & Answers
1. **What does it mean that an array decays to a pointer?**
   - In most expressions, an array's name acts as a pointer constant pointing to the memory address of the first element (\`&arr[0]\`).
2. **What is out-of-bounds access in an array?**
   - Accessing indices outside the allocated range (e.g. index 5 in a size-5 array). C does not perform runtime bounds-checking, resulting in undefined behavior.

## 7.7 Practical Lab Exercises
- **Task 1**: Write a program to find the maximum, minimum, and average values in an integer array.
- **Task 2**: Write a program to perform addition of two 2D matrices.
`,
  8: `
# Module 8: Strings

### Learning Objectives
After completing this module, you will be able to:
- Explain what strings are in C.
- Declare, initialize, read, and write strings.
- Detail the null character (\`\0\`) and its critical role in strings.
- Apply standard string functions like \`strlen()\`, \`strcpy()\`, \`strcat()\`, and \`strcmp()\`.
- Traverse and manipulate string characters.

## 8.1 What is a String?
In C, a **string** is a sequence of characters stored in a character array, terminated by the null character \`'\0'\`.
- The null character \`\0\` acts as a sentinel marking the end of the string.
- *Memory allocation*: A string of length N requires a character array of size at least N + 1.
  - Example: \`char word[4] = "CAT";\` -> Stored as \`['C', 'A', 'T', '\0']\`.

## 8.2 Declaring & Reading Strings
- **Declaration**: \`char name[20];\`
- **Reading single word**: \`scanf("%19s", name);\` (Note: stops at space).
- **Reading line with spaces**: \`fgets(name, sizeof(name), stdin);\`
  - *Safety*: Never use the obsolete \`gets()\` function because it does not limit input length, causing buffer overflows.

## 8.3 Standard String Library (\`<string.h>\`)
C provides powerful built-in string functions:
1. **\`strlen(str)\`**: Returns the number of characters in a string (excluding \`'\0'\`).
2. **\`strcpy(dest, src)\`**: Copies source string to destination. Destination array must be large enough.
3. **\`strcat(dest, src)\`**: Appends (concatenates) source to destination.
4. **\`strcmp(str1, str2)\`**: Lexicographically compares two strings. Returns \`0\` if identical.
   - *Warning*: Do **not** use \`str1 == str2\` to compare string values; that only compares their memory addresses.

## 8.4 String Traversal Example: Counting Vowels
\`\`\`c
int count = 0;
for (int i = 0; str[i] != '\0'; i++) {
    if (str[i] == 'a' || str[i] == 'e' || str[i] == 'i' || str[i] == 'o' || str[i] == 'u') {
        count++;
    }
}
\`\`\`

## 8.5 Interview Questions & Answers
1. **Why is the null character ('\0') necessary in C strings?**
   - Characters in C are stored in plain arrays. The null character tells library functions and loops where the character sequence terminates.
2. **What is the difference between char ch = 'A' and char str[] = "A"?**
   - \`ch\` is a single character constant occupying 1 byte. \`str\` is a character array containing two elements (\`'A'\` and \`'\0'\`), occupying 2 bytes.

## 8.6 Practical Lab Exercises
- **Task 1**: Write a program to reverse a string in-place without using library functions.
- **Task 2**: Write a program to check if a string is a palindrome.
`,
  9: `
# Module 9: Pointers

### Learning Objectives
After completing this module, you will be able to:
- Explain what pointer variables and memory addresses are.
- Apply the address-of (\`&\`) and dereference (\`*\`) operators.
- Declare, initialize, and modify variables through pointers.
- Perform pointer arithmetic operations.
- Describe the relationship between pointers and arrays.
- Swap values using pointer-based parameter passing.
- Avoid dangling, wild, and null-pointer dereferencing errors.

## 9.1 What is a Pointer?
A **pointer** is a variable that stores the memory address of another variable.
- **\`&\` (Address-of) Operator**: Retrieves the memory address where a variable is stored.
- **\`*\` (Dereference) Operator**: Accesses the value stored at the memory address held by the pointer.

## 9.2 Pointer Declaration & Initialization
- **Declaration**: \`int *p;\` (A pointer to an integer).
- **Initialization**:
  \`\`\`c
  int x = 10;
  int *p = &x; // p now stores address of x
  \`\`\`
- **Dereferencing**:
  \`\`\`c
  printf("%d", *p); // prints 10
  *p = 50;          // changes value of x to 50
  \`\`\`

## 9.3 Pointer Arithmetic & Size
- Pointer increment (\`p++\`) increases the pointer value by \`sizeof(type)\` bytes.
  - If \`p\` points to integer (4 bytes) at address 1000, \`p++\` makes it point to 1004.
- Pointer size is determined by CPU address architecture (typically 8 bytes on 64-bit systems, 4 bytes on 32-bit systems) regardless of type.

## 9.4 Pointers & Arrays
- Array name decays to a pointer to the first element: \`arr\` is equivalent to \`&arr[0]\`.
- Element access \`arr[i]\` is internally evaluated as \`*(arr + i)\`.

## 9.5 Call-by-Reference Simulation: Swapping
\`\`\`c
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}
\`\`\`

## 9.6 Pointer Safety: Wild, Dangling & Null Pointers
- **Null Pointer**: Points to nothing (\`int *p = NULL;\`). Always validate before dereferencing: \`if (p != NULL)\`.
- **Wild Pointer**: An uninitialized pointer pointing to an arbitrary memory address.
- **Dangling Pointer**: A pointer pointing to a memory location that has been deallocated or freed.

## 9.7 Interview Questions & Answers
1. **What is a pointer to pointer?**
   - It is a variable that stores the memory address of a pointer variable. Defined as \`int **q;\`.
2. **What happens if you dereference a NULL pointer?**
   - It triggers a runtime exception or crash (often a Segmentation Fault) due to illegal memory access.

## 9.8 Practical Lab Exercises
- **Task 1**: Write a program that accepts an array and its size, and traverses it using pointer arithmetic.
- **Task 2**: Write a program demonstrating pointer-to-pointer configuration and verify values at each level.
`,
  10: `
# Module 10: Structures, Unions & Enumerations

### Learning Objectives
After completing this module, you will be able to:
- Explain what user-defined structures are.
- Declare, initialize, and nest structures.
- Access members using dot (\`.\`) and arrow (\`->\`) operators.
- Explain compiler padding and structure sizes.
- Differentiate between structures and unions.
- Work with enumerations (\`enum\`) and type aliases (\`typedef\`).

## 10.1 Structures
A **structure** is a user-defined data type that groups related variables of different data types under a single name.
- **Syntax**:
  \`\`\`c
  struct Student {
      char name[30];
      int roll;
      float marks;
  };
  \`\`\`
- **Access**: Use the dot operator (\`.\`) on variables, and arrow operator (\`->\`) on pointers.
  \`\`\`c
  struct Student s1;
  struct Student *ptr = &s1;
  s1.roll = 101;
  ptr->marks = 92.5f;
  \`\`\`

## 10.2 Memory Alignment & Padding
- The compiler inserts padding bytes between structure members to align them to natural CPU word boundaries, making memory access faster.
- Therefore, \`sizeof(struct)\` is often larger than the sum of its individual members.

## 10.3 Unions
A **union** is a user-defined type where all members share the same memory location.
- **Size**: The size of a union is determined by its largest member.
- **Usage**: Only one member can hold a valid value at any given time.

## 10.4 Enumerations (\`enum\`)
- Defines a type consisting of named integer constants.
- Improves code readability by replacing numbers with names.
  - Example: \`enum Day { MONDAY, TUESDAY, WEDNESDAY };\` (Default starts at 0).

## 10.5 typedef alias
- Creates a convenient alias name for an existing data type.
  - Example: \`typedef unsigned int uint;\` or \`typedef struct Student Student;\`

## 10.6 Interview Questions & Answers
1. **What is the key difference in memory between a struct and a union?**
   - Members of a \`struct\` have separate memory locations and can all exist simultaneously. Members of a \`union\` share the same memory region; writing to one overwrites the others.
2. **Why does struct padding happen?**
   - CPU architectures read memory in words (e.g. 4 or 8 bytes). Padding ensures members are aligned to word boundaries, preventing double memory cycles.

## 10.7 Practical Lab Exercises
- **Task 1**: Define a structure to store date details (day, month, year). Create a nested Student structure containing a date-of-birth structure.
- **Task 2**: Create a program containing a union with integer, float, and character members; observe and log memory overwrites.
`,
  11: `
# Module 11: Dynamic Memory Allocation

### Learning Objectives
After completing this module, you will be able to:
- Contrast static (compile-time) and dynamic (runtime) memory.
- Explain Stack and Heap memory regions.
- Allocate and deallocate heap memory using \`malloc()\`, \`calloc()\`, \`realloc()\`, and \`free()\`.
- Implement dynamic arrays.
- Avoid memory leaks, dangling pointers, double frees, and use-after-free errors.

## 11.1 Why Dynamic Memory?
- Static memory sizes must be determined at compile-time (e.g. \`int arr[100];\`). If we only use 10, space is wasted; if we need 101, it fails.
- Dynamic memory allocation requests memory from the **Heap** at runtime based on user requirements.

## 11.2 Stack vs Heap
- **Stack**: Fast, automatic allocation/deallocation managed by the CPU. Holds local variables and function call frames.
- **Heap**: Larger, unmanaged memory pool. Allocation/deallocation is explicitly controlled by the programmer.

## 11.3 Memory Allocation Functions (\`<stdlib.h>\`)
1. **\`malloc(size_t size)\`**: Allocates the specified number of bytes. Returns a void pointer (\`void*\`). Memory remains uninitialized.
   - Example: \`int *p = malloc(5 * sizeof(*p));\`
2. **\`calloc(num, size)\`**: Allocates memory for an array of elements. Initializes all allocated bytes to zero.
   - Example: \`int *p = calloc(5, sizeof(*p));\`
3. **\`realloc(ptr, new_size)\`**: Resizes an existing heap allocation. May move the block to a new address.
   - *Safe pattern*: Always assign the result to a temporary pointer to avoid losing the original pointer if allocation fails.
4. **\`free(ptr)\`**: Releases allocated heap memory back to the system.
   - *Good practice*: Set pointer to NULL after freeing to prevent use-after-free bugs.

## 11.4 Memory Management Safety
- **Memory Leak**: Occurs when heap memory is allocated but not freed, causing memory usage to grow until the system runs out of memory.
- **Dangling Pointer**: A pointer that holds the address of a freed block.
- **Double Free**: Freeing the same memory address twice, corrupting the heap.

## 11.5 Interview Questions & Answers
1. **What is the difference between malloc() and calloc()?**
   - \`malloc()\` takes one argument (total size in bytes) and leaves memory uninitialized. \`calloc()\` takes two arguments (element count and element size) and initializes all bytes to zero.
2. **Why must we check the return value of malloc()?**
   - If heap memory is exhausted, \`malloc()\` returns \`NULL\`. Attempting to dereference a \`NULL\` pointer causes a segmentation fault.

## 11.6 Practical Lab Exercises
- **Task 1**: Write a program to dynamically allocate memory for an array of size N, input values, double the size using \`realloc()\u200b\`, and print them.
- **Task 2**: Write a program to dynamically allocate memory for a structure object, manipulate it, and clean up.
`,
  12: `
# Module 12: File Handling in C

### Learning Objectives
After completing this module, you will be able to:
- Explain what file handling is and why it is useful.
- Work with the \`FILE\` structure and file pointers.
- Open and close files using \`fopen()\` and \`fclose()\`.
- Describe file opening modes.
- Perform formatted and character-based read/write operations.
- Handle end-of-file (EOF) detection.
- Understand binary file operations.

## 12.1 Introduction to File Handling
Variables stored in memory are volatile and lost when the program exits. File handling enables a C program to store data permanently on storage disks in files.

## 12.2 Opening & Closing Files
- **FILE Pointer**: Files are managed via a stream pointer: \`FILE *fp;\`.
- **\`fopen()\`**: Opens a file. Returns a \`FILE*\` or \`NULL\` if it fails.
  - Syntax: \`FILE *fp = fopen("filename.txt", "mode");\`
- **\`fclose()\`**: Closes the file, flushing streams and releasing handles.

## 12.3 File Modes
- \`"r"\`: Read (file must exist).
- \`"w"\`: Write (truncates file to zero length or creates a new one).
- \`"a"\`: Append (writes to the end of the file; creates it if needed).
- \`"r+"\`, \`"w+"\`, \`"a+"\`: Extended modes for both reading and writing.
- Add \`'b'\` for binary files (e.g. \`"rb"\`, \`"wb"\`).

## 12.4 Reading & Writing Operations
- **Formatted**:
  - \`fprintf(fp, "Format: %d", val);\`: Writes formatted data.
  - \`fscanf(fp, "%d", &val);\`: Reads formatted data.
- **Character**:
  - \`fputc(char, fp)\`: Writes a character.
  - \`fgetc(fp)\`: Reads a character (returns \`EOF\` at end-of-file).
- **String**:
  - \`fputs(str, fp)\`: Writes a string.
  - \`fgets(buffer, size, fp)\`: Reads a line of text safely.
- **Binary**:
  - \`fwrite(&var, size, count, fp)\`: Block write.
  - \`fread(&var, size, count, fp)\`: Block read.

## 12.5 Detection of EOF
- For text files, \`fgetc()\` returns \`EOF\` when it reaches the end of the file.
- **\`feof(fp)\`**: Checks if the end-of-file indicator has been set. Do not use \`while (!feof(fp))\` as the primary reading condition; check the input function's return code instead.

## 12.6 Interview Questions & Answers
1. **What happens if you open an existing file in "w" mode?**
   - The file's existing content is completely discarded (truncated to zero bytes).
2. **Why is it important to call fclose()?**
   - It releases lock handles on the OS, frees resources, and flushes write buffers, ensuring data is completely written to disk.

## 12.7 Practical Lab Exercises
- **Task 1**: Write a C program to copy the contents of one text file to another character-by-character.
- **Task 2**: Write a program to read student data from a file, parse the scores, and output a summary report.
`,
  13: `
# Module 13: Preprocessor & Advanced C

### Learning Objectives
After completing this module, you will be able to:
- Explain the role of the C preprocessor in the compilation chain.
- Declare object-like and function-like macros using \`#define\`.
- Write conditional compilation directives.
- Build clean include guards to prevent duplicate headers.
- Work with predefined preprocessor macros.

## 13.1 Preprocessor Directives
The preprocessor is a text substitution tool that runs before compilation. Directives begin with a hash symbol (\`#\`) and do not end with semicolons.

## 13.2 File Inclusion (\`#include\`)
- **\`#include <header.h>\`**: Searches standard system directories (system headers).
- **\`#include "header.h"\`**: Searches the user's project directory first, then falls back to system folders.

## 13.3 Macro Definition (\`#define\`)
- **Object-like Macro**: Simple constant substitution.
  - Example: \`#define MAX_SIZE 100\`
- **Function-like Macro**: Substitutes text arguments dynamically.
  - Example: \`#define SQUARE(x) ((x) * (x))\`
  - *Warning*: Parentheses are critical to avoid order-of-operation evaluation side-effects (e.g. \`SQUARE(2 + 3)\`).

## 13.4 Conditional Compilation
Allows selective inclusion or exclusion of source code sections during preprocessing:
- \`#if\`, \`#elif\`, \`#else\`, \`#endif\`
- \`#ifdef\` / \`#ifndef\`: Compiles block if a macro is defined / not defined.
  - Example: For logging debug messages:
    \`\`\`c
    #ifdef DEBUG
    printf("Debug trace.\n");
    #endif
    \`\`\`

## 13.5 Include Guards & #pragma once
- Prevents duplicate declarations when a header file is included multiple times.
  \`\`\`c
  #ifndef STUDENT_H
  #define STUDENT_H
  struct Student { ... };
  #endif
  \`\`\`

## 13.6 Predefined Macros
- \`__FILE__\`: Current source file name (string).
- \`__LINE__\`: Current source line number (integer).
- \`__DATE__\`: Compilation date (string).
- \`__TIME__\`: Compilation time (string).

## 13.7 Interview Questions & Answers
1. **What is the difference between a macro and a function?**
   - Macros are replaced as raw text before compilation (no execution overhead, but no type checking and increases binary size). Functions are compiled separately, support type safety, and have runtime call stack overhead.
2. **What does #pragma once do?**
   - It is a compiler-specific directive that serves as an alternative to include guards, telling the compiler to process the header file only once.

## 13.8 Practical Lab Exercises
- **Task 1**: Create a custom header file with math utilities and write include guards to protect them.
- **Task 2**: Write a macro to find the maximum of two numbers and test it with expressions.
`,
  14: `
# Module 14: Data Structures & C Projects

### Learning Objectives
After completing this module, you will be able to:
- Explain core data structures like Linked Lists, Stacks, and Queues in C.
- Write code to implement a singly linked list.
- Contrast sequential search (linear) vs interval search (binary).
- Implement selection and insertion sorting algorithms.
- Build a structured final C programming project.

## 14.1 Linked Lists
- A **linked list** is a linear data structure where elements (nodes) are not stored in contiguous memory locations.
- Nodes are linked dynamically using pointers.
- Structure of a singly linked node:
  \`\`\`c
  struct Node {
      int data;
      struct Node *next;
  };
  \`\`\`

## 14.2 Stacks & Queues
- **Stack**: Follows Last-In-First-Out (LIFO) protocol. Operations include Push (insert) and Pop (remove).
- **Queue**: Follows First-In-First-Out (FIFO) protocol. Operations include Enqueue (insert) and Dequeue (remove).

## 14.3 Searching & Sorting
- **Binary Search**: Fast search algorithm that works on sorted arrays by repeatedly dividing the search interval in half. Time complexity: O(log n).
- **Selection Sort**: Repeatedly finds the minimum element and swaps it to the sorted position.
- **Insertion Sort**: Builds a sorted array one element at a time by inserting incoming elements into their correct position.

## 14.4 Real-World C Projects
Building a structured multi-file C project includes separating interface declarations (\`.h\` files) from implementations (\`.c\` files).

## 14.5 Interview Questions & Answers
1. **What is the advantage of a Linked List over an Array?**
   - Linked lists have dynamic sizing (nodes can be added/removed without resizing memory blocks) and insertion/deletion operations at known positions are fast (no element shifting).
2. **Why does Binary Search require a sorted array?**
   - It eliminates half of the search range in each step based on comparison with the middle element; this logic fails if elements are unsorted.

## 14.6 Practical Lab Exercises
- **Task 1**: Implement a singly linked list with insert, delete, and display operations.
- **Task 2**: Write a program to perform Binary Search on a sorted array of 10 integers.
`,
  15: `
# Module 15: Advanced C Concepts & Final Revision

### Learning Objectives
After completing this module, you will be able to:
- Pass arguments to C programs via Command-Line.
- Work with function pointers and callbacks.
- Write generic programs using void pointers (\`void*\`).
- Apply bitwise mask logic to set, clear, and toggle bits.
- Explain the role of qualifiers like \`const\` and \`volatile\`.
- Write assertions using \`assert()\` for testing.
- Identify and avoid common undefined behavior (UB) cases.

## 15.1 Command-Line Arguments
- Allows arguments to be passed to \`main()\` during execution.
- Syntax: \`int main(int argc, char *argv[])\`
  - **\`argc\`** (argument count): Number of arguments passed (including program name).
  - **\`argv\`** (argument vector): Array of string pointers representing arguments.

## 15.2 Function Pointers & generic void*
- **Function Pointer**: Stores the address of a function, allowing dynamic call dispatches.
  - Syntax: \`int (*operation)(int, int) = add;\`
- **Void Pointer (\`void*\`)**: A generic pointer that can point to any type. Must be explicitly cast before dereferencing.

## 15.3 Bit Masking & Operations
Bitwise manipulation allows configuration flags to be stored efficiently:
- **Set a bit**: \`flags |= (1u << bit_index);\`
- **Clear a bit**: \`flags &= ~(1u << bit_index);\`
- **Toggle a bit**: \`flags ^= (1u << bit_index);\`
- **Check a bit**: \`if (flags & (1u << bit_index))\`

## 15.4 Qualifiers: const vs volatile
- **\`const\`**: Prevents modification of variable contents after initialization.
- **\`volatile\`**: Warns the compiler that the variable's value can change externally (e.g. hardware register), preventing optimization read-caches.

## 15.5 Assertions & Undefined Behavior
- **\`assert(condition)\`**: Terminates program with diagnostic messages if condition evaluates to false. Used during testing.
- **Undefined Behavior (UB)**: Actions that lead to unpredictable execution (e.g. buffer overflow, dereferencing null, using uninitialized memory).

## 15.6 Final Cheat Sheet & Career Path
- Mastery of C is foundational for systems programming, kernel development, embedded microcontrollers, and high-performance engines.

## 15.7 Interview Questions & Answers
1. **What is a volatile variable?**
   - It is a variable qualifier indicating that its value can change due to hardware or external factors, telling the compiler to reload it from memory on every read rather than cache it.
2. **What does void* represent?**
   - A generic pointer that points to data of unspecified type, commonly used in callbacks and memory allocation functions.

## 15.8 Practical Lab Exercises
- **Task 1**: Write a program to set, clear, and check a specific bit inside a configuration byte.
- **Task 2**: Write a program that parses arguments from command line and performs a calculator operation.
`
};
