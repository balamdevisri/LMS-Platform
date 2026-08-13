export const javaSyllabusNotes: Record<number, string> = {
  1: `
Module 1 — Introduction to Java Module Goal By the end of this module, you should understand:
What is Java? ↓ Why Java? ↓ Features of Java ↓ JDK / JRE / JVM ↓ How Java works ↓ Java program structure ↓ First Java program ↓ Compilation & execution
1.1 What is Java?
Java is a high-level, object-oriented, class-based programming language developed by Sun Microsystems and released in 1995.

Java is widely used for:
- Software applications ● Web applications ● Enterprise applications ● Android-related development ● Backend development ● Desktop applications ● Large-scale systems Simple definition Java is a high-level, object-oriented programming language designed to be portable across platforms through the Java Virtual Machine (JVM).

1.2 Why Learn Java?
Java is popular because it provides:
Java ↓ Easy to learn ↓ Object-oriented ↓ Platform independent ↓ Secure ↓ Robust ↓ Portable ↓ Large ecosystem Java is also widely used in companies, making it useful for:
- Development ● Interviews ● Coding tests ● OOP learning

1.3 History of Java Important points:
1991 ↓ Java project started at Sun Microsystems ↓ Originally called Oak ↓ Later renamed Java ↓ 1995 ↓ Java officially introduced The original development team was led by James Gosling at Sun Microsystems.

1.4 Features of Java ⭐⭐⭐
The most important features are:
1. Simple Java was designed to be easier to use than languages such as C++ by removing or simplifying several complex features.

2. Object-Oriented Java is strongly based on:
Classes Objects Encapsulation Inheritance Polymorphism Abstraction We'll study these deeply later.
3. Platform Independent ⭐⭐⭐
Java follows:
Write Once, Run Anywhere A Java program is compiled into bytecode , which can run on a JVM available for the target platform.

Java Source Code ↓ javac ↓ Bytecode ↓ JVM ↓ Windows / Linux / macOS 4. Secure Java provides features such as:
- No direct pointer arithmetic ● Bytecode verification ● Runtime checks
- Strong type checking 5. Robust Java provides:
- Exception handling ● Automatic memory management ● Strong type checking 6. Portable Java bytecode is designed to be portable across systems with compatible JVM implementations.

7. Multithreaded Java supports executing multiple threads concurrently.
8. High Performance Java uses JIT (Just-In-Time) compilation to improve execution performance.
9. Distributed Java provides libraries and APIs useful for networked and distributed applications.

1.5 Platform Dependent vs Independent C example A program compiled for one platform generally needs compilation for another platform.
Source Code ↓ Compiler ↓ Machine Code ↓ Specific OS/CPU Java Source Code ↓
Java Compiler ↓ Bytecode ↓ JVM ↓ Operating System That's the basic reason Java is called platform independent .

1.6 JDK, JRE and JVM ⭐⭐⭐
This is one of the most important Java interview topics .
💡 **Key Point**
> 
JDK ↓ JRE ↓ JVM But the relationship is more precisely:
JDK ├── Development tools └── JRE ├── JVM └── Java runtime libraries
1.7 What is JVM?
JVM = Java Virtual Machine It is the component that executes Java bytecode.
Java Bytecode ↓ JVM ↓ Machine-level execution The JVM is platform-specific: different operating systems have different JVM implementations.

But the same Java bytecode can run on different JVM implementations.

1.8 What is JRE?
JRE = Java Runtime Environment It provides what is needed to run Java applications .
Conceptually:
JRE ├── JVM └── Java runtime libraries If you only need to run an already compiled Java application, the runtime environment is the relevant concept.

1.9 What is JDK?
JDK = Java Development Kit It provides tools required to develop, compile, debug, and run Java programs .
It includes:
JDK ↓ Compiler Debugger Other development tools + JRE/runtime components The most important compiler is:
javac
1.10 ### JDK, JRE & JVM Architecture

![JDK JRE JVM Relationship](/assets/images/java_jdk_jre_jvm.png)

JDK vs JRE vs JVM ⭐⭐⭐
Component Main Purpose JVM Executes bytecode JRE Provides runtime environment JDK Provides development tools + runtime Easy memory trick JVM → Run JRE → Run Environment JDK → Develop + Run
1.11 ### Java Program Execution Flowchart

![Java Execution Flow](/assets/images/java_execution_flow.png)

Java Program Execution Flow ⭐⭐⭐

This is extremely important.
Suppose we create:
Hello.java Flow:
Hello.java ↓ javac Hello.java ↓ Hello.class ↓ Bytecode ↓ java Hello ↓ JVM ↓ Execution ↓ Output
1.12 Compilation vs Execution Compilation .java ↓ javac ↓ .class The Java compiler converts source code into bytecode.
Execution .class ↓ JVM ↓ Program runs So:
Compilation → javac Execution → java
1.13 First Java Program ⭐⭐⭐
\`\`\`java
class Hello {
    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}
\`\`\`
Output:
Hello Java
1.14 Understanding the Program Let's break it down.
class
class Hello Creates a class named Hello.
\`\`\`java
main() public static void main(String[] args)
\`\`\`
This is the standard entry point of a traditional Java application.
\`\`\`java
System.out.println() System.out.println("Hello Java");
\`\`\`
Prints output to the console.

1.15 Main Method Breakdown ⭐⭐⭐
\`\`\`java
public static void main(String[] args)
\`\`\`
public Allows the JVM to access the method.
static The JVM can invoke the method without creating an object of the class first.
void The method doesn't return a value.
main The conventional entry-point method name.
String[] args An array of command-line arguments.

1.16 Basic Java Program Structure
\`\`\`java
class Student {
    // fields // methods public static void main(String[] args) {
        // statements
    }
}
\`\`\`
Think:
Class ↓ Fields ↓ Methods ↓ main() ↓ Statements
1.17 Java Syntax Rules Rule 1: Java is case-sensitive These are different:
\`\`\`java
Student student STUDENT Rule 2: Statements generally end with;
int age = 20;
System.out.println(age);
\`\`\`
\`\`\`java
Rule 3: Blocks use {
}
if (age >= 18) {
    System.out.println("Adult");
}
\`\`\`
Rule 4: Comments are ignored by the compiler Single line:
// This is a comment Multi-line:
/* This is a comment */
1.18 Java Identifiers An identifier is a name given to a program element such as:
- Class ● Variable ● Method ● Package Example:
\`\`\`java
class Student {
    int studentAge;
    void displayDetails() {
    }
}
\`\`\`
Identifiers include:
Student studentAge displayDetails
1.19 Identifier Rules An identifier:
✅ Can contain letters, digits, _, and $ ✅ Cannot start with a digit ❌ Invalid:
int 123age;
✅ Valid:
int age123;
❌ Keywords cannot be used as identifiers:
int class;
❌ Invalid.

1.20 Java Keywords Keywords have special meaning in Java.
Examples:
\`\`\`java
class public private static void int if else for while return new extends implements try catch You cannot use these as normal variable or class names.
\`\`\`

1.21 Comments Comments help explain code.
Single-line // Calculate total marks int total = 90 + 80;
Multi-line /* Calculate student marks */ Documentation comment /** * Calculates the total marks. */ Documentation comments can be used with tools such as Javadoc.

1.22 Java Naming Conventions ⭐⭐
Class → PascalCase Student BankAccount EmployeeDetails Variable → camelCase studentName totalMarks accountBalance Method → camelCase calculateTotal() displayDetails() findMaximum()
Constant → UPPER_SNAKE_CASE MAX_SIZE PI_VALUE
1.23 Java Flowchart — From Code to Output START ↓ Write Java program ↓ .java ↓ Java Compiler (javac) ↓ Bytecode .class ↓ JVM ↓ Execute ↓ Output ↓ END
1.24 Simple Program Example
\`\`\`java
class Student {
    public static void main(String[] args) {
        String name = "Prasanna";
        int age = 20;
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
    }
}
\`\`\`
Output:
Name: Prasanna Age: 20 Here we have already used:
Class ↓ main() ↓ Variables ↓ Output We'll learn each concept in detail in the next modules.

1.25 Java Development Cycle ⭐⭐⭐
Write ↓ Compile ↓ Test ↓ Debug ↓ Run ↓ Improve More technically:
Source Code ↓ Compilation ↓ Bytecode ↓ JVM ↓ Execution ↓ Output
1.26 Important Terms Term Meaning Java Programming language JVM Executes Java bytecode JRE Runtime environment JDK Development kit Bytecode Compiled Java code javac Java compiler command java Command used to launch a Java application Class Blueprint/type Object Instance of a class Method Block of executable behavior
🎯 Module 1 Interview Questions 1. What is Java?
Java is a high-level, class-based, object-oriented programming language designed for portability across platforms through the JVM.

2. Who developed Java?
Java was developed at Sun Microsystems, with James Gosling leading the original team.
3. Why is Java platform independent?
Because Java source code is compiled into bytecode, which can run on different platform-specific JVM implementations.

4. What is JVM?
JVM is the Java Virtual Machine that executes Java bytecode.
5. What is JRE?
JRE provides the runtime environment needed to run Java applications.
6. What is JDK?
`,
  2: `
Module 2 — Variables & Data Types Module Flow Variables & Data Types ↓ Data Types ↓ Primitive Types ↓ Variables ↓ Literals ↓ Type Casting ↓ Constants ↓ Naming Rules ↓ Practice
📄 Page 1 — What is a Variable?
A variable is a named memory location used to store a value.
📝 **Example**
> 
int age = 20;
Here:
int → data type age → variable name 20 → value Think:
age ↓ ┌─────────┐ │ 20 │ └─────────┘ The value stored in a variable can generally be changed.
int age = 20; age = 21;
Now:
age → 21
📄 Page 2 — Data Types A data type tells Java what kind of value a variable can store.
Java data types are broadly divided into:
Data Types ↓ ┌────────┴────────┐ ↓ ↓ Primitive Reference Primitive types Java has 8 primitive data types :
byte short int long float double char boolean Reference types Examples:
String Arrays Classes Objects Interfaces
📄 Page 3 — Primitive Data Types ⭐⭐⭐

Type Typical Size Example byte 8-bit 100 short 16-bit 20000 int 32-bit 100000 long 64-bit 100000L float 32-bit 10.5f double 64-bit 10.5 char 16-bit 'A' boolean JVM-dependent true / false Easy grouping Integer ↓ byte short int long Decimal ↓ float double Character ↓ char True / False ↓ boolean
📄 Page 4 — Integer & Decimal Types byte Stores small integer values.
byte age = 20;
Range:
-128 to 127 short short marks = 500;
Range:
-32,768 to 32,767 int ⭐⭐⭐
The most commonly used integer type.
int salary = 30000;
Range:
-2,147,483,648 to 2,147,483,647 long Used for larger integer values.
long population = 1400000000L;
Use L when needed to make the literal a long.

float Used for decimal values with single precision.
float price = 99.5f;
Use f/F.

double ⭐⭐⭐
Used for decimal values with double precision.
double salary = 45000.75;
For most general-purpose decimal calculations, double is preferred over float.

📄 Page 5 — char and boolean char Stores a single character.
char grade = 'A';
Use single quotes :
'A' 'B' '7' '$' Not:
char grade = "A"; // ❌ Double quotes represent a String.

boolean Stores only:
true false Example:
boolean isPassed = true;
Another example:
boolean isLoggedIn = false;
📄 Page 6 — Variable Declaration & Initialization Declaration int age;
The variable is declared but no value is assigned yet.
Initialization age = 20;
Declaration + initialization int age = 20;
Flow:
Declare ↓ int age ↓ Initialize ↓ age = 20 Multiple variables:
int a = 10; int b = 20; int c = 30;
You can also write:
int a = 10, b = 20, c = 30;
📄 Page 7 — Literals A literal is a fixed value written directly in the program.
Examples:
int age = 20;
20 → integer literal double price = 99.5;
99.5 → floating-point literal char grade = 'A';
'A' → character literal boolean passed = true;
true → boolean literal String name = "Prasanna";
"Prasanna" → String literal.

📄 Page 8 — Type Casting ⭐⭐⭐
Type casting means converting a value from one data type to another.
There are two important cases:
Type Conversion ↓ ┌─────┴─────┐ ↓ ↓
Widening Narrowing Widening Casting Smaller compatible numeric type → larger type.
int x = 10; double y = x;
Flow:
int ↓ double Java can perform this automatically.
📝 **Example**
> 
\`\`\`java
int number = 100;
double value = number;
System.out.println(value);
\`\`\`
Output:
100.0 Narrowing Casting Larger numeric type → smaller numeric type.
It generally requires explicit casting.
double price = 99.99; int value = (int) price;
Output:
99 The fractional part is discarded.
Flow:
double ↓ (int) ↓ int
📄 Page 9 — Constants & Naming Rules Constants A constant is a variable whose value cannot be reassigned after initialization.
Use:
final Example:
final double PI = 3.14159;
This is invalid:
PI = 4.5; // ❌ Common convention:
MAX_VALUE MIN_VALUE PI COLLEGE_CODE Variable Naming Rules Valid int age; int studentAge; int age2; int _count; int $value;
Invalid int 2age; // ❌ starts with digit int student-age; // ❌ '-' is not allowed int class; // ❌ keyword Naming convention Use camelCase for variables:
studentName totalMarks accountBalance Use PascalCase for classes:
Student BankAccount EmployeeDetails
📄 Page 10 — Important Programs + Revision Program 1: Student Details

\`\`\`java
class Student {
    public static void main(String[] args) {
        String name = "Prasanna";
        int age = 20;
        double marks = 85.5;
        char grade = 'A';
        boolean passed = true;
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Marks: " + marks);
        System.out.println("Grade: " + grade);
        System.out.println("Passed: " + passed);
    }
}
\`\`\`
Output:
Name: Prasanna Age: 20 Marks: 85.5 Grade: A
`,
  3: `
Module 3 — Operators Module Flow Operators ↓
Arithmetic ↓
Relational ↓
Logical ↓
Assignment ↓
Unary ↓
Ternary ↓
Bitwise Basics ↓
Precedence & Practice

📄 Page 1 — What is an Operator?
An operator is a symbol that performs an operation on one or more values.
📝 **Example**
> 
int a = 10;
int b = 5;

int result = a + b; Here:
+ → operator 10, 5 → operands Flow:
10 5 \\ / \\ / (+)
↓
15

📄 Page 2 — Types of Operators ⭐⭐⭐
Java operators can be grouped as:
Operators ↓

┌──────────┬───────┼────────┬── ────────┐ ↓ ↓ ↓ ↓ ↓
Arithmetic Relational Logical Assignment Unary ↓ ↓ ↓ ↓ ↓

└──────────┴───────┼────────┴── ────────┘ ↓
Ternary / Bitwise Important categories: 1. Arithmetic 2. Relational 3. Logical 4. Assignment 5. Unary 6. Ternary 7. Bitwise

📄 Page 3 — Arithmetic Operators ⭐⭐⭐

Used for mathematical calculations.
Operator Meaning + Addition - Subtraction * Multiplication / Division % Modulus/remainder Example:
int a = 10;
int b = 3;

\`\`\`java
System.out.println(a + b);
\`\`\`
\`\`\`java
System.out.println(a - b);
\`\`\`
\`\`\`java
System.out.println(a * b);
\`\`\`
\`\`\`java
System.out.println(a / b);
\`\`\`
\`\`\`java
System.out.println(a % b);
Output:
\`\`\`
13 7 30 3 1 Important Because a and b are integers:
10 / 3 produces:
3 not 3.333....
For decimal division:
double result = 10.0 / 3;

📄 Page 4 — Relational Operators ⭐⭐⭐

Relational operators compare values.
The result is a boolean.
Operator Meaning == Equal to != Not equal to > Greater than < Less than >= Greater than or equal <= Less than or equal Example:
int a = 10;
int b = 20;

\`\`\`java
System.out.println(a == b);
\`\`\`
\`\`\`java
System.out.println(a != b);
\`\`\`
\`\`\`java
System.out.println(a < b);
\`\`\`
\`\`\`java
System.out.println(a > b);
Output:
\`\`\`
false true true false Flow:
10 < 20 ↓
Comparison ↓
true ⚠ Important Don't confuse:
= with:
== = → assignment == → comparison Example:
int x = 10;
assigns 10.
x == 10 checks whether x equals 10.

📄 Page 5 — Logical Operators ⭐⭐⭐
Logical operators combine boolean expressions.
Operator Meaning && Logical AND \` ! Logical NOT AND && Returns true only when both conditions are true.
A B A && B T T T T F F F T F F F F Example:
int age = 20;

\`\`\`java
System.out.println(age >= 18 && age <= 60);
Output:
\`\`\`
true OR || Returns true if at least one condition is true.
A B A || B T T T T F T F T T F F F Example:
int marks = 80;

\`\`\`java
System.out.println(marks >= 90 || marks >= 75);
Output:
\`\`\`
true NOT !
Reverses a boolean value.
boolean passed = true;

\`\`\`java
System.out.println(!passed);
Output:
\`\`\`
false

📄 Page 6 — Assignment Operators Assignment operators assign values to variables.
Basic assignment int x = 10;
Compound assignment Operator Example Equivalent += x += 5 x = x + 5 -= x -= 5 x = x - 5 *= x *= 5 x = x * 5 /= x /= 5 x = x / 5 %= x %= 5 x = x % 5 Example:
int x = 10;

x += 5;

\`\`\`java
System.out.println(x);
Output:
\`\`\`
15 Flow:
x = 10 ↓
x += 5 ↓
x = x + 5 ↓
x = 15

📄 Page 7 — Unary Operators ⭐⭐⭐
Unary operators work on one operand . Important operators:
+ - ++ -- !
Increment ++ Increases value by 1.
int x = 10;

x++;

\`\`\`java
System.out.println(x);
Output:
\`\`\`
11 Decrement -- Decreases value by 1.
int x = 10;

x--;

\`\`\`java
System.out.println(x);
Output:
\`\`\`
9

📄 Page 8 — Pre-increment vs Post-increment ⭐⭐⭐

This is very important for coding tests.
Post-increment int x = 5;

int y = x++; First:
y = 5 Then:
x = 6 So:
x → 6 y → 5 Pre-increment int x = 5;

int y = ++x; First:
x = 6 Then:
y = 6 So:
x → 6 y → 6 Easy trick x++ Use first → Increase later ++x Increase first → Use later Same idea applies to --.

📄 Page 9 — Ternary Operator The ternary operator is a compact way to choose between two expressions based on a condition.

Syntax:
condition ? value1 : value2; Example:
int age = 20;

String result = age >= 18 ? "Adult" : "Minor";

\`\`\`java
System.out.println(result);
Output:
\`\`\`
Adult Flowchart:
age >= 18?
/ \\ YES NO ↓ ↓
"Adult" "Minor" Equivalent if-else:
if (age >= 18) { result = "Adult";
}
else { result = "Minor";
} Use the ternary operator mainly for simple expressions .

For complex logic, if-else is usually clearer.

📄 Page 10 — Bitwise Operators + Precedence Bitwise Operators Bitwise operators work on the bits of integral values.
Important operators:
Operator Meaning & Bitwise AND \` \` ^ Bitwise XOR ~ Bitwise complement << Left shift >> Signed right shift >>> Unsigned right shift Example:
int a = 5;
int b = 3;

\`\`\`java
System.out.println(a & b);
Binary:
\`\`\`
5 → 101
3 → 011 101 011 ---
001 → 1 Output:
1 For beginner/intermediate Java, understand the basic purpose now;

detailed binary manipulation can be practiced later.

Operator Precedence ⭐⭐⭐
When an expression contains multiple operators, Java follows precedence and associativity rules.
📝 **Example**
> 
int result = 10 + 5 * 2; Multiplication is evaluated before addition:
5 * 2 = 10
`,
  4: `
Module 4 — Input & Output Module Flow Input & Output ↓
System.out ↓
print / println ↓
printf ↓
Scanner ↓
Different Input Types ↓
next() vs nextLine()
↓
Common Scanner Issues ↓
Practice

📄 Page 1 — What is Input & Output?
A program generally performs three basic activities:

INPUT ↓
PROCESSING ↓
OUTPUT Example:
User enters two numbers ↓
Java adds them ↓
Result is displayed In Java:
Input → Scanner Output → System.out

📄 Page 2 — Output in Java ⭐⭐⭐
Java provides System.out for standard console output.

println()
Prints the value and moves to the next line.
\`\`\`java
System.out.println("Hello Java");
\`\`\`
\`\`\`java
System.out.println("Welcome");
Output:
\`\`\`
Hello Java Welcome print()
Prints without automatically moving to a new line.
\`\`\`java
System.out.print("Hello ");
\`\`\`
\`\`\`java
System.out.print("Java");
\`\`\`
Output:
Hello Java

📄 Page 3 — print() vs println()
print()
\`\`\`java
System.out.print("Java");
\`\`\`
\`\`\`java
System.out.print("Python");
Output:
\`\`\`
JavaPython println()
\`\`\`java
System.out.println("Java");
\`\`\`
\`\`\`java
System.out.println("Python");
Output:
\`\`\`
Java Python Flow:
print()
↓
Same line println()
↓
Print ↓
Next line

📄 Page 4 — Printing Variables We can print variable values.
\`\`\`java
class Demo {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    String name = "Prasanna";
\`\`\`
int age = 20;

\`\`\`java
System.out.println(name);
\`\`\`
\`\`\`java
System.out.println(age);
\`\`\`
}
} Output:
Prasanna 20 String concatenation
\`\`\`java
System.out.println("Name: " + name);
\`\`\`
\`\`\`java
System.out.println("Age: " + age);
Output:
\`\`\`
Name: Prasanna Age: 20 The + operator combines Strings and values.

📄 Page 5 — printf() ⭐⭐⭐
printf() is used for formatted output .
📝 **Example**
> 
String name = "Prasanna";
int age = 20;

\`\`\`java
System.out.printf("Name: %s%n", name);
\`\`\`
\`\`\`java
System.out.printf("Age: %d%n", age);
\`\`\`
Output:
Name: Prasanna Age: 20 Common format specifiers Specifier Used for %d Integer %f Floating-point %s String %c Character %b Boolean %n New line Example:
double cgpa = 8.75;

\`\`\`java
System.out.printf("CGPA: %.2f%n", cgpa);
Output:
\`\`\`
CGPA: 8.75 %.2f means display two digits after the decimal point.

📄 Page 6 — Taking Input Using Scanner ⭐⭐⭐

Scanner is commonly used to read input from the keyboard.
First import it:
\`\`\`java
import java.util.Scanner;
Create a Scanner object:
\`\`\`
Scanner sc = new Scanner(System.in); Flow:
Keyboard ↓
System.in ↓
Scanner ↓
Java Program

📄 Page 7 — Scanner Input Methods Integer int age = sc.nextInt();
Double double salary = sc.nextDouble();
Float float marks = sc.nextFloat();
Long long population = sc.nextLong();
Boolean boolean passed = sc.nextBoolean();
Single word String name = sc.next();
Complete line String address = sc.nextLine();

📄 Page 8 — Complete Input Program ⭐⭐⭐

\`\`\`java
import java.util.Scanner;
\`\`\`

\`\`\`java
class Student {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
\`\`\`

\`\`\`java
System.out.print("Enter your name: ");
\`\`\`
String name = sc.nextLine();

\`\`\`java
System.out.print("Enter your age: ");
\`\`\`
int age = sc.nextInt();

\`\`\`java
System.out.print("Enter your CGPA: ");
\`\`\`
double cgpa = sc.nextDouble();

\`\`\`java
System.out.println("\\nStudent Details");
\`\`\`
\`\`\`java
System.out.println("Name: " + name);
\`\`\`
\`\`\`java
System.out.println("Age: " + age);
\`\`\`
\`\`\`java
System.out.println("CGPA: " + cgpa);
\`\`\`

sc.close();
}
} Example:
Enter your name: Prasanna Enter your age: 20 Enter your CGPA: 8.7 Student Details Name: Prasanna Age: 20 CGPA: 8.7

📄 Page 9 — next() vs nextLine()
⭐⭐⭐

This is a very common beginner confusion.
next()
Reads only one token/word.
\`\`\`java
System.out.print("Enter name: ");
\`\`\`
String name = sc.next(); Input:
Prasanna Reddy next() reads:
Prasanna nextLine()
Reads the entire line.
String name = sc.nextLine(); Input:
Prasanna Reddy Reads:
Prasanna Reddy Remember:
next()
↓
`,
  5: `
Module 5 — Conditional Statements Module Flow Conditions ↓ ┌────────┼────────┐ ↓ ↓ ↓ if if-else switch ↓ ↓ ↓ else-if nested if ↓ Ternary ↓ Decision Making
📄 Page 1 — What is Decision Making?
In programming, sometimes we need to execute code only when a particular condition is satisfied .

📝 **Example**
> 
Student marks ↓
marks >= 40 ? / \\ YES NO ↓ ↓ PASS FAIL Java uses conditional statements for this.
Main statements:
if if-else else-if nested if switch We already saw the ternary operator in Module 3; it is useful for simple two-way choices.

📄 Page 2 — if Statement ⭐⭐⭐
The if statement executes a block only when its condition is true.
Syntax if (condition) { // statements }
\`\`\`java
Example int age = 20;
if (age >= 18) {
    System.out.println("Eligible to vote");
}
\`\`\`
Output:
Eligible to vote If the condition is false, the block is skipped.
Flowchart START ↓ Check condition / \\ true false ↓ ↓ Execute Skip block ↓ \\ / \\ / END
📄 Page 3 — if-else Statement ⭐⭐⭐

When we have two possible outcomes , use if-else.
Syntax if (condition) { // true block } else { // false block }
\`\`\`java
Example int marks = 35;
if (marks >= 40) {
    System.out.println("Pass");
}
else {
    System.out.println("Fail");
}
\`\`\`
Output:
Fail Flowchart START ↓ marks >= 40? / \\ YES NO ↓ ↓
PASS FAIL \\ / \\ / END
📄 Page 4 — else-if Ladder ⭐⭐⭐
Use else-if when there are multiple conditions .
📝 **Example**
> Grade calculation.
\`\`\`java
int marks = 85;
if (marks >= 90) {
    System.out.println("A+");
}
else if (marks >= 80) {
    System.out.println("A");
}
else if (marks >= 70) {
    System.out.println("B");
}
else if (marks >= 60) {
    System.out.println("C");
}
else if (marks >= 40) {
    System.out.println("D");
}
else {
    System.out.println("F");
}
\`\`\`
Output:
A Flow marks ↓ >= 90 ? ↓ No >= 80 ? ↓ Yes Grade A Java checks the conditions from top to bottom and executes the first matching branch.

📄 Page 5 — Nested if An if statement inside another if statement is called a nested if .
📝 **Example**
> 
\`\`\`java
int age = 20;
boolean hasId = true;
if (age >= 18) {
    if (hasId) {
        System.out.println("Entry allowed");
    }
}
\`\`\`
Flowchart:
Age >= 18? / \\ NO YES ↓ ↓ END Has ID? / \\ NO YES ↓ ↓ END Allowed Nested if is useful when one condition depends on another.

📄 Page 6 — switch Statement ⭐⭐⭐
switch is useful when one expression needs to be compared against several discrete cases.

Syntax switch (expression) { case value1: // code break; case value2: // code break; default: // code }
📝 **Example**
> 
\`\`\`java
int day = 2;
switch (day) {
    case 1: System.out.println("Monday");
    break;
    case 2: System.out.println("Tuesday");
    break;
    case 3: System.out.println("Wednesday");
    break;
    default: System.out.println("Invalid day");
}
\`\`\`
Output:
Tuesday
📄 Page 7 — break and default break break normally exits the switch after a matching case.
📝 **Example**
> 
\`\`\`java
int choice = 1;
switch (choice) {
    case 1: System.out.println("Add");
    break;
    case 2: System.out.println("Delete");
    break;
}
\`\`\`
Without the appropriate break, execution can continue into later cases. This behavior is called fall-through .

default default runs when no case matches.
\`\`\`java
int day = 10;
switch (day) {
    case 1: System.out.println("Monday");
    break;
    default: System.out.println("Invalid day");
}
\`\`\`
Output:
Invalid day
📄 Page 8 — if-else vs switch ⭐⭐⭐

\`\`\`java
if-else switch Good for ranges Good for discrete choices Handles complex conditions Good for matching cases Supports >, <, &&, \` Flexible Often cleaner for menu-like choices Example: Range → if-else if (marks >= 90) {
    System.out.println("A+");
}
else if (marks >= 80) {
    System.out.println("A");
}
\`\`\`
\`\`\`java
📝 **Example**
> Fixed choice → switch switch (choice) {
    case 1: System.out.println("Add");
    break;
    case 2: System.out.println("Subtract");
    break;
}
\`\`\`
📄 Page 9 — Practical Programs Program 1: Even or Odd import java.util.Scanner;

\`\`\`java
class EvenOdd {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter number: ");
        int n = sc.nextInt();
\`\`\`
\`\`\`java
if (n % 2 == 0) {
    System.out.println("Even");
}
else {
    System.out.println("Odd");
}
sc.close();
}
}
\`\`\`
Program 2: Largest of Two Numbers import java.util.Scanner;

\`\`\`java
class Largest {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter a: ");
        int a = sc.nextInt();
        System.out.print("Enter b: ");
        int b = sc.nextInt();
        if (a > b) {
            System.out.println("A is larger");
        }
        else if (b > a) {
            System.out.println("B is larger");
        }
        else {
            System.out.println("Both are equal");
        }
        sc.close();
    }
}
\`\`\`
`,
  6: `
Module 6 — Loops Module Flow Looping ↓
Why loops? ↓ for loop ↓ while loop ↓ do-while loop ↓ Nested loops ↓ break ↓ continue ↓ Patterns ↓ Practice
📄 Page 1 — What is a Loop?
A loop is used to execute a block of code repeatedly while a condition or iteration rule allows it.

Without a loop:
\`\`\`java
System.out.println("Java");
System.out.println("Java");
System.out.println("Java");
System.out.println("Java");
System.out.println("Java");
\`\`\`
With a loop:
\`\`\`java
for (int i = 1;
i <= 5;
i++) {
    System.out.println("Java");
}
\`\`\`
Output:
Java Java Java Java Java Basic loop flow START ↓ Check condition / \\ true false ↓ ↓ Execute END block ↓ Update ↓ Check again
📄 Page 2 — Types of Loops ⭐⭐⭐
Java mainly provides three looping statements:
Loops ↓ ┌────────┼────────┐ ↓ ↓ ↓ for while do-while for Best when the number of iterations is known or naturally expressed with initialization, condition, and update.

while Best when repetition depends mainly on a condition and the number of iterations may not be known in advance.

do-while Similar to while, but the body executes at least once .

📄 Page 3 — for Loop ⭐⭐⭐
Syntax for (initialization; condition; update) { // statements }
📝 **Example**
> 
\`\`\`java
for (int i = 1;
i <= 5;
i++) {
    System.out.println(i);
}
\`\`\`
Output:
1 2 3 4 5 Flow Initialization ↓ Check condition / \\ true false ↓ ↓ Execute END ↓ Update ↓ Condition Three parts int i = 1 ↓ Initialization i <= 5 ↓ Condition i++ ↓ Update
📄 Page 4 — while Loop ⭐⭐⭐
A while loop checks its condition before each iteration.
Syntax while (condition) { // statements }
📝 **Example**
> 
\`\`\`java
int i = 1;
while (i <= 5) {
    System.out.println(i);
    i++;
}
\`\`\`
Output:
1 2 3 4 5 Flowchart START ↓ Initialize i ↓ Check i <= 5 / \\ YES NO ↓ ↓ Print i END ↓ i++ ↓ Check again Important If you forget the update:
i++;
the loop may never terminate.

📄 Page 5 — do-while Loop ⭐⭐⭐
A do-while loop executes its body before checking the condition.
Syntax do { // statements } while (condition);
📝 **Example**
> 
\`\`\`java
int i = 1;
do {
    System.out.println(i);
    i++;
}
while (i <= 5);
\`\`\`
Output:
\`\`\`java
1 2 3 4 5 Important difference while (false) {
    System.out.println("Hello");
}
\`\`\`
Output:
Nothing But:
\`\`\`java
do {
    System.out.println("Hello");
}
while (false);
\`\`\`
Output:
Hello Because do-while executes once before checking the condition.

📄 Page 6 — for vs while vs do-while Loop Condition checked Minimum executions for Before 0 while Before 0 do-while After 1 Easy memory trick for → Known/structured repetition while → Condition-controlled repetition do-while → Execute first, check later
📄 Page 7 — Nested Loops ⭐⭐⭐
A loop inside another loop is called a nested loop .
📝 **Example**
> 
\`\`\`java
for (int i = 1;
i <= 3;
i++) {
    for (int j = 1;
    j <= 3;
    j++) {
        System.out.print("* ");
    }
\`\`\`
\`\`\`java
System.out.println();
}
\`\`\`
Output:
* * * * * * * * *
How it works Outer loop ↓ Row 1 ↓ Inner loop → 3 stars ↓ Row 2 ↓ Inner loop → 3 stars ↓ Row 3 ↓ Inner loop → 3 stars Flowchart Outer Loop ↓ Row starts ↓ Inner Loop ↓ Print elements ↓ Inner loop ends ↓ Next outer loop Nested loops are very important for:
- Patterns ● Matrices ● 2D arrays

📄 Page 8 — break and continue ⭐⭐⭐

break Immediately terminates the nearest loop.
📝 **Example**
> 
\`\`\`java
for (int i = 1;
i <= 10;
i++) {
    if (i == 5) {
        break;
    }
    System.out.println(i);
}
\`\`\`
Output:
1 2 3 4 Flow:
1 → 2 → 3 → 4 → 5 ↓ break ↓ END continue Skips the current iteration and moves to the next iteration.
📝 **Example**
> 
for (int i = 1; i <= 5; i++) { if (i == 3) { continue; }
\`\`\`java
System.out.println(i);
}
\`\`\`
Output:
1 2 4 5 Difference break ↓ Stop loop continue ↓ Skip current iteration ↓ Continue loop
📄 Page 9 — Important Loop Programs Program 1: Print 1 to 10

\`\`\`java
class Numbers {
    public static void main(String[] args) {
        for (int i = 1;
        i <= 10;
        i++) {
            System.out.println(i);
        }
    }
}
\`\`\`
Program 2: Sum of 1 to N import java.util.Scanner;

\`\`\`java
class Sum {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter n: ");
        int n = sc.nextInt();
        int sum = 0;
        for (int i = 1;
        i <= n;
        i++) {
            sum += i;
        }
        System.out.println("Sum = " + sum);
        sc.close();
    }
}
\`\`\`
For:
n = 5 Calculation:
1 + 2 + 3 + 4 + 5 = 15 Output:
Sum = 15 Program 3: Multiplication Table import java.util.Scanner;

\`\`\`java
class Table {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter number: ");
        int n = sc.nextInt();
        for (int i = 1;
        i <= 10;
        i++) {
            System.out.println(n + " x " + i + " = " + (n * i));
        }
        sc.close();
\`\`\`
} }
For 5:
5 x 1 = 5 5 x 2 = 10 ... 5 x 10 = 50
📄 Page 10 — Patterns + Revision Pattern 1 * ** *** **** *****
Program:
\`\`\`java
class Pattern {
    public static void main(String[] args) {
        for (int i = 1;
        i <= 5;
        i++) {
            for (int j = 1;
            j <= i;
            j++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}
\`\`\`
Pattern logic Row 1 → 1 star Row 2 → 2 stars Row 3 → 3 stars Row 4 → 4 stars Row 5 → 5 stars
`,
  7: `
Module 7 — Arrays Module Flow ARRAYS ↓ What is Array? ↓ 1D Array ↓ Declaration & Initialization ↓ Indexing ↓ Traversal ↓ Input & Basic Operations ↓ Sum / Average / Max / Min ↓ Searching / Reversing ↓ Sorting Basics ↓ 2D Arrays
📄 Page 1 — What is an Array?
An array is a fixed-size collection of elements of the same type , stored as indexed elements.

Instead of:
int mark1 = 80; int mark2 = 90; int mark3 = 75; int mark4 = 88;
we can use:
int[] marks = {80, 90, 75, 88};
Think:
marks ↓ ┌────┬────┬────┬────┐ │ 80 │ 90 │ 75 │ 88 │ └────┴────┴────┴────┘ 0 1 2 3 The numbers below are called indexes .

📄 Page 2 — Array Declaration & Creation ⭐⭐⭐

Declaration int[] numbers;
or:
int numbers[];
The first style is generally preferred.
Creation numbers = new int[5];
This creates an array capable of holding 5 integers .
Declaration + creation int[] numbers = new int[5];
Flow:
int[] ↓ Array type ↓ new int[5] ↓ Creates 5-element array
📄 Page 3 — Array Initialization & Indexing ⭐⭐⭐

You can initialize an array directly:
int[] numbers = {10, 20, 30, 40, 50};
Indexes start from 0 .
Value → 10 20 30 40 50 Index → 0 1 2 3 4 Access elements:
\`\`\`java
System.out.println(numbers[0]);
System.out.println(numbers[2]);
\`\`\`
Output:
10 30 Important For an array of size 5:
First index → 0 Last index → 4 So:
numbers[5]
is invalid and causes an ArrayIndexOutOfBoundsException.

📄 Page 4 — Array Length & Traversal Use:
array.length Example:
int[] numbers = {10, 20, 30, 40, 50};
\`\`\`java
System.out.println(numbers.length);
\`\`\`
Output:
5 Traversing an array Traversal means visiting every element.
\`\`\`java
int[] numbers = {
    10, 20, 30, 40, 50
}
;
for (int i = 0;
i < numbers.length;
i++) {
    System.out.println(numbers[i]);
}
\`\`\`
Output:
10 20 30 40 50 Flow:
i = 0 ↓ numbers[0] ↓ i++ ↓ numbers[1] ↓ ... ↓ i < length?
📄 Page 5 — Taking Array Input ⭐⭐⭐
We can use Scanner to take array elements from the user.
\`\`\`java
import java.util.Scanner;
\`\`\`
\`\`\`java
class ArrayInput {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter size: ");
        int n = sc.nextInt();
        int[] numbers = new int[n];
        System.out.println("Enter elements:");
        for (int i = 0;
        i < n;
        i++) {
            numbers[i] = sc.nextInt();
        }
        System.out.println("Elements:");
        for (int i = 0;
        i < n;
        i++) {
            System.out.println(numbers[i]);
        }
        sc.close();
    }
}
\`\`\`
Flowchart Enter size ↓ Create array ↓ i = 0 ↓ Take input ↓ Store at numbers[i] ↓ i++ ↓ More elements? / \\ YES NO ↓ ↓ Input Display again
📄 Page 6 — Sum, Average, Maximum & Minimum ⭐⭐⭐

\`\`\`java
Sum int[] numbers = {
    10, 20, 30, 40
}
;
int sum = 0;
for (int i = 0;
i < numbers.length;
i++) {
    sum += numbers[i];
}
System.out.println("Sum = " + sum);
\`\`\`
Output:
\`\`\`java
Sum = 100 Average double average = (double) sum / numbers.length;
System.out.println("Average = " + average);
\`\`\`
Output:
\`\`\`java
25.0 Maximum int max = numbers[0];
for (int i = 1;
i < numbers.length;
i++) {
    if (numbers[i] > max) {
        max = numbers[i];
    }
}
System.out.println("Maximum = " + max);
\`\`\`
\`\`\`java
Minimum int min = numbers[0];
for (int i = 1;
i < numbers.length;
i++) {
    if (numbers[i] < min) {
        min = numbers[i];
    }
}
System.out.println("Minimum = " + min);
\`\`\`
Important logic Start with first element ↓ Compare with next elements ↓ Update max/min when needed
📄 Page 7 — Searching an Array ⭐⭐⭐
Linear Search Linear search checks elements one by one.
📝 **Example**
> 
\`\`\`java
int[] numbers = {
    10, 20, 30, 40, 50
}
;
int target = 30;
boolean found = false;
for (int i = 0;
i < numbers.length;
i++) {
    if (numbers[i] == target) {
        found = true;
        break;
    }
}
if (found) {
    System.out.println("Element found");
}
\`\`\`
\`\`\`java
else {
    System.out.println("Element not found");
}
\`\`\`
Output:
\`\`\`java
Element found Search flow Target ↓ Compare with numbers[0] ↓ Match? ↓ No numbers[1] ↓ Match? ↓ ... ↓ Found / Not Found With index for (int i = 0;
i < numbers.length;
i++) {
    if (numbers[i] == target) {
        System.out.println("Found at index " + i);
        break;
    }
}
\`\`\`
📄 Page 8 — Reverse an Array Suppose:
Original: 10 20 30 40 50 Reverse: 50 40 30 20 10 Simple way to print in reverse:
int[] numbers = {10, 20, 30, 40, 50};
\`\`\`java
for (int i = numbers.length - 1;
i >= 0;
i--) {
    System.out.println(numbers[i]);
}
\`\`\`
Output:
50 40 30 20 10 Important Last index:
numbers.length - 1
📄 Page 9 — Sorting Basics ⭐⭐⭐
Sorting means arranging elements in an order.
📝 **Example**
> 
Before: 40 10 30 20 After: 10 20 30 40 For basic learning, understand Bubble Sort .
int[] numbers = {40, 10, 30, 20}; for (int i = 0; i < numbers.length - 1; i++) { for (int j = 0; j < numbers.length - 1 - i; j++) { if (numbers[j] > numbers[j + 1]) { int temp = numbers[j]; numbers[j] = numbers[j + 1]; numbers[j + 1] = temp; } }
\`\`\`java
}
for (int n : numbers) {
    System.out.print(n + " ");
}
\`\`\`
Output:
10 20 30 40 Bubble Sort idea Compare adjacent elements ↓ If wrong order → swap ↓ Repeat ↓ Largest elements move toward the end For real applications, Java's standard library sorting methods are usually preferred; Bubble Sort is mainly useful for understanding sorting logic.

📄 Page 10 — 2D Arrays ⭐⭐⭐
A 2D array can be visualized as rows and columns.
📝 **Example**
> 
int[][] matrix = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9} };
Visual:
Column 0 1 2 Row 0 1 2 3 Row 1 4 5 6 Row 2 7 8 9 Access:
\`\`\`java
System.out.println(matrix[0][1]);
\`\`\`
Output:
\`\`\`java
2 Traversing 2D Array for (int i = 0;
i < matrix.length;
i++) {
    for (int j = 0;
    j < matrix[i].length;
    j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}
\`\`\`
Output:
1 2 3 4 5 6 7 8 9 Flow 2D Array ↓ Outer loop ↓ Row ↓ Inner loop ↓ Columns ↓ Next row Module 7 — Arrays Module Flow ARRAYS ↓ What is Array? ↓ 1D Array ↓ Declaration & Initialization ↓ Indexing ↓ Traversal ↓ Input & Basic Operations ↓ Sum / Average / Max / Min ↓ Searching / Reversing ↓ Sorting Basics ↓ 2D Arrays
📄 Page 1 — What is an Array?
An array is a fixed-size collection of elements of the same type , stored as indexed elements.

Instead of:
int mark1 = 80; int mark2 = 90; int mark3 = 75; int mark4 = 88;
we can use:
int[] marks = {80, 90, 75, 88};
Think:
marks ↓ ┌────┬────┬────┬────┐ │ 80 │ 90 │ 75 │ 88 │ └────┴────┴────┴────┘ 0 1 2 3 The numbers below are called indexes .

📄 Page 2 — Array Declaration & Creation ⭐⭐⭐

Declaration int[] numbers;
or:
int numbers[];
The first style is generally preferred.
Creation numbers = new int[5];
This creates an array capable of holding 5 integers .
Declaration + creation int[] numbers = new int[5];
Flow:
int[] ↓ Array type ↓ new int[5] ↓ Creates 5-element array
📄 Page 3 — Array Initialization & Indexing ⭐⭐⭐

You can initialize an array directly:
int[] numbers = {10, 20, 30, 40, 50};
Indexes start from 0 .
Value → 10 20 30 40 50 Index → 0 1 2 3 4 Access elements:
\`\`\`java
System.out.println(numbers[0]);
System.out.println(numbers[2]);
\`\`\`
Output:
10 30 Important For an array of size 5:
First index → 0 Last index → 4 So:
numbers[5]
is invalid and causes an ArrayIndexOutOfBoundsException.

📄 Page 4 — Array Length & Traversal Use:
array.length Example:
\`\`\`java
int[] numbers = {
    10, 20, 30, 40, 50
}
;
System.out.println(numbers.length);
\`\`\`
Output:
5 Traversing an array Traversal means visiting every element.
int[] numbers = {10, 20, 30, 40, 50}; for (int i = 0; i < numbers.length; i++) {
\`\`\`java
System.out.println(numbers[i]);
}
\`\`\`
Output:
10 20 30 40 50 Flow:
i = 0 ↓ numbers[0] ↓ i++ ↓ numbers[1] ↓ ... ↓ i < length?
📄 Page 5 — Taking Array Input ⭐⭐⭐
We can use Scanner to take array elements from the user.
import java.util.Scanner;

\`\`\`java
class ArrayInput {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter size: ");
        int n = sc.nextInt();
        int[] numbers = new int[n];
        System.out.println("Enter elements:");
        for (int i = 0;
        i < n;
        i++) {
            numbers[i] = sc.nextInt();
        }
        System.out.println("Elements:");
        for (int i = 0;
        i < n;
        i++) {
            System.out.println(numbers[i]);
        }
        sc.close();
    }
}
\`\`\`
Flowchart Enter size ↓ Create array ↓ i = 0 ↓ Take input ↓ Store at numbers[i] ↓ i++ ↓ More elements? / \\ YES NO ↓ ↓ Input Display again
📄 Page 6 — Sum, Average, Maximum & Minimum ⭐⭐⭐

\`\`\`java
Sum int[] numbers = {
    10, 20, 30, 40
}
;
int sum = 0;
for (int i = 0;
i < numbers.length;
i++) {
    sum += numbers[i];
}
System.out.println("Sum = " + sum);
\`\`\`
Output:
\`\`\`java
Sum = 100 Average double average = (double) sum / numbers.length;
System.out.println("Average = " + average);
\`\`\`
Output:
\`\`\`java
25.0 Maximum int max = numbers[0];
for (int i = 1;
i < numbers.length;
i++) {
    if (numbers[i] > max) {
        max = numbers[i];
    }
}
System.out.println("Maximum = " + max);
\`\`\`
\`\`\`java
Minimum int min = numbers[0];
for (int i = 1;
i < numbers.length;
i++) {
    if (numbers[i] < min) {
        min = numbers[i];
    }
}
System.out.println("Minimum = " + min);
\`\`\`
Important logic Start with first element ↓ Compare with next elements ↓ Update max/min when needed
📄 Page 7 — Searching an Array ⭐⭐⭐
Linear Search Linear search checks elements one by one.
📝 **Example**
> 
\`\`\`java
int[] numbers = {
    10, 20, 30, 40, 50
}
;
int target = 30;
boolean found = false;
for (int i = 0;
i < numbers.length;
i++) {
    if (numbers[i] == target) {
        found = true;
        break;
    }
}
if (found) {
    System.out.println("Element found");
}
else {
    System.out.println("Element not found");
}
\`\`\`
Output:
Element found Search flow Target ↓ Compare with numbers[0] ↓
\`\`\`java
Match? ↓ No numbers[1] ↓ Match? ↓ ... ↓ Found / Not Found With index for (int i = 0;
i < numbers.length;
i++) {
    if (numbers[i] == target) {
        System.out.println("Found at index " + i);
        break;
    }
}
\`\`\`
📄 Page 8 — Reverse an Array Suppose:
Original: 10 20 30 40 50 Reverse: 50 40 30 20 10 Simple way to print in reverse:
\`\`\`java
int[] numbers = {
    10, 20, 30, 40, 50
}
;
for (int i = numbers.length - 1;
i >= 0;
i--) {
    System.out.println(numbers[i]);
}
\`\`\`
Output:
50 40 30 20 10 Important Last index:
numbers.length - 1
📄 Page 9 — Sorting Basics ⭐⭐⭐
Sorting means arranging elements in an order.
📝 **Example**
> 
Before: 40 10 30 20 After: 10 20 30 40 For basic learning, understand Bubble Sort .
\`\`\`java
int[] numbers = {
    40, 10, 30, 20
}
;
for (int i = 0;
i < numbers.length - 1;
i++) {
    for (int j = 0;
    j < numbers.length - 1 - i;
    j++) {
        if (numbers[j] > numbers[j + 1]) {
            int temp = numbers[j];
            numbers[j] = numbers[j + 1];
            numbers[j + 1] = temp;
        }
    }
}
for (int n : numbers) {
    System.out.print(n + " ");
}
\`\`\`
Output:
10 20 30 40 Bubble Sort idea Compare adjacent elements ↓
If wrong order → swap ↓ Repeat ↓ Largest elements move toward the end For real applications, Java's standard library sorting methods are usually preferred; Bubble Sort is mainly useful for understanding sorting logic.

📄 Page 10 — 2D Arrays ⭐⭐⭐
A 2D array can be visualized as rows and columns.
📝 **Example**
> 
int[][] matrix = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9} };
Visual:
Column 0 1 2 Row 0 1 2 3 Row 1 4 5 6 Row 2 7 8 9 Access:
\`\`\`java
System.out.println(matrix[0][1]);
\`\`\`
Output:
\`\`\`java
2 Traversing 2D Array for (int i = 0;
i < matrix.length;
i++) {
    for (int j = 0;
    j < matrix[i].length;
    j++) {
        System.out.print(matrix[i][j] + " ");
    }
\`\`\`
`,
  8: `
Use Resource ↓
Exception?
/ \\ NO YES ↓ ↓
Continue catch \\ / \\ / Resource closed Module 24 — Strings in Java Module Flow STRINGS ↓
What is String?
↓
String Creation ↓
String Pool / new ↓
String Immutability ↓
String Methods ↓
String Comparison ↓
StringBuilder ↓
StringBuffer ↓
String vs Builder vs Buffer ↓
Practice

📄 Page 1 — What is a String?
A String is a sequence of characters. Example:
String name = "Prasanna"; Here:
"Prasanna" ↓
String ↓
Sequence of characters Strings are objects in Java.
String name = "Java"; String is a class from:
java.lang So we don't need to explicitly import it.

📄 Page 2 — Creating Strings ⭐⭐⭐
There are two common ways.
1. String Literal String s1 = "Java";
2. Using new String s2 = new String("Java");
Both represent the text "Java", but their object/reference behavior can differ.

Simple view String Literal ↓
String Pool new String()
↓
New String object For normal string creation, string literals are generally preferred.

📄 Page 3 — String Pool ⭐⭐⭐
Java maintains a special pool for string literals called the String Pool .
📝 **Example**
> 
String s1 = "Java";
String s2 = "Java"; The same pooled string object can be reused. So:
\`\`\`java
System.out.println(s1 == s2);
Output:
\`\`\`
true Now:
String s3 = new String("Java");

\`\`\`java
System.out.println(s1 == s3);
Output:
\`\`\`
false Why?
String Pool ↓
"Java" ↙ ↘ s1 s2 Heap object ↓
"Java" ↓
s3 ⭐ Don't use == to compare String contents. Use equals().

📄 Page 4 — String Immutability ⭐⭐⭐
Strings in Java are immutable . Immutable means:
Once a String object is created, its contents cannot be changed.
📝 **Example**
> 
String s = "Hello";

s.concat(" World");

\`\`\`java
System.out.println(s);
Output:
\`\`\`
Hello Why? Because:
s.concat(" World"); creates a new String but doesn't modify the original.
Correct:
s = s.concat(" World");

\`\`\`java
System.out.println(s);
Output:
\`\`\`
Hello World Flow:
"Hello" ↓
concat(" World")
↓
New String ↓
"Hello World"

📄 Page 5 — Important String Methods ⭐⭐⭐

length()
String s = "Java";

\`\`\`java
System.out.println(s.length());
Output:
\`\`\`
4 charAt()
\`\`\`java
System.out.println(s.charAt(0));
Output:
\`\`\`
J toUpperCase()
\`\`\`java
System.out.println(s.toUpperCase());
\`\`\`
Output:
JAVA toLowerCase()
\`\`\`java
System.out.println("JAVA".toLowerCase());
Output:
\`\`\`
java trim()
Removes leading and trailing whitespace.
String s = " Java ";

\`\`\`java
System.out.println(s.trim());
Output:
\`\`\`
Java

📄 Page 6 — More String Methods contains()
String s = "Java Programming";

\`\`\`java
System.out.println( s.contains("Java")
\`\`\`
); Output:
true startsWith()
s.startsWith("Java");

endsWith()
s.endsWith("ing");

substring()
String s = "Programming";

\`\`\`java
System.out.println( s.substring(0, 4)
\`\`\`
); Output:
Prog Remember:
substring(start, end)
↑ end excluded

📄 Page 7 — Comparing Strings ⭐⭐⭐
equals()
Use equals() to compare String contents.
String s1 = "Java";
String s2 = "Java";

\`\`\`java
System.out.println( s1.equals(s2)
\`\`\`
); Output:
true equalsIgnoreCase()
String s1 = "Java";
String s2 = "JAVA";

\`\`\`java
System.out.println( s1.equalsIgnoreCase(s2)
\`\`\`
); Output:
true == For object references:
s1 == s2 checks whether the references point to the same object.

Easy memory String content ↓
equals()

Object reference ↓
==

📄 Page 8 — StringBuilder ⭐⭐⭐
Because String is immutable, repeated modifications can create many String objects.
For frequently changing text, use StringBuilder . Example:
StringBuilder sb = new StringBuilder("Java");

sb.append(" Programming");

\`\`\`java
System.out.println(sb);
\`\`\`
Output:
Java Programming Common methods append()
insert()
delete()
reverse()
replace() Example:
StringBuilder sb = new StringBuilder("Java");

sb.append(" OOPs");

sb.reverse();

\`\`\`java
System.out.println(sb);
\`\`\`

📄 Page 9 — StringBuffer StringBuffer is similar to StringBuilder, but its methods are synchronized, making it suitable for certain multithreaded scenarios.
📝 **Example**
> 
StringBuffer sb = new StringBuffer("Java");

sb.append(" Programming");

\`\`\`java
System.out.println(sb);
\`\`\`
Output:
Java Programming String vs StringBuilder vs StringBuffer String StringBuilder StringBuffer Immutable Mutable Mutable Changes create new String objects Efficient for repeated changes Synchronized Good for fixed text Good for single-threaded string building Useful when synchronization is needed Thread-safe due to immutability Not synchronized Synchronized methods Easy memory String ↓
Immutable StringBuilder ↓
Mutable + fast general-purpose builder StringBuffer ↓
Mutable + synchronized

📄 Page 10 — Complete Example + Revision Reverse a String Using StringBuilder:
\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    String text = "Java";
\`\`\`

String reversed = new StringBuilder(text)
.reverse()
.toString();

\`\`\`java
System.out.println( "Original: " + text );
\`\`\`

\`\`\`java
System.out.println( "Reversed: " + reversed );
\`\`\`
}
} Output:
Original: Java Reversed: avaJ

`,
  9: `
Module 9 — Methods Module Flow METHODS ↓ What is Method? ↓ Syntax ↓ Parameters & Arguments ↓ Return Value ↓ void ↓ static Methods ↓ Method Overloading ↓ Recursion Basics ↓ Practice
📄 Page 1 — What is a Method?
A method is a named block of code that performs a specific task.
Instead of writing the same logic repeatedly:
\`\`\`java
System.out.println("Hello");
System.out.println("Hello");
System.out.println("Hello");
\`\`\`
we can create a method:
\`\`\`java
static void greet() {
    System.out.println("Hello");
}
\`\`\`
Then call it:
greet(); greet(); greet();
Basic idea Method ↓ Reusable block of code ↓ Perform a specific task ↓ Call whenever needed
📄 Page 2 — Method Syntax ⭐⭐⭐
Basic syntax:
returnType methodName(parameters) { // statements return value; }
📝 **Example**
> 
static int add(int a, int b) { return a + b; }
Breakdown:
static ↓ Modifier int ↓ Return type add ↓ Method name (int a, int b) ↓ Parameters return a + b ↓ Returned value
📄 Page 3 — Method Without Parameters A method doesn't always need parameters.
\`\`\`java
class Demo {
    static void greet() {
        System.out.println("Hello Java");
    }
    public static void main(String[] args) {
        greet();
    }
}
\`\`\`
Output:
Hello Java Flow main() ↓ greet() ↓ Execute method ↓ Print Hello Java
📄 Page 4 — Parameters & Arguments ⭐⭐⭐

A parameter is a variable declared in a method definition.
An argument is the actual value passed when calling the method.
📝 **Example**
> 
\`\`\`java
static void greet(String name) {
    System.out.println("Hello " + name);
}
\`\`\`
Here:
name → parameter Calling:
greet("Prasanna");
Here:
"Prasanna" → argument Flow:
"Prasanna" ↓ parameter name ↓ method executes ↓ Hello Prasanna
📄 Page 5 — Return Values ⭐⭐⭐
A method can calculate something and return the result.
📝 **Example**
> 
static int add(int a, int b) { return a + b; }
Call:
\`\`\`java
int result = add(10, 20);
System.out.println(result);
\`\`\`
Output:
30 Flow:
add(10, 20) ↓ a + b ↓ 30 ↓ return 30 ↓ result = 30 Important The return type must match the returned value.
static int add() { return 10; }
Correct.

📄 Page 6 — void Methods If a method doesn't return a value, use:
void Example:
\`\`\`java
static void display() {
    System.out.println("Hello");
}
\`\`\`
No value is returned.
Compare:
void ↓ No return value int ↓ Returns integer double ↓ Returns decimal value String ↓ Returns String Example:
static String getName() { return "Prasanna"; }
📄 Page 7 — static Methods ⭐⭐⭐
A static method belongs to the class rather than to a particular object.
📝 **Example**
> 
\`\`\`java
class Calculator {
\`\`\`
\`\`\`java
static int add(int a, int b) {
    return a + b;
}
public static void main(String[] args) {
    int result = Calculator.add(10, 20);
    System.out.println(result);
}
}
\`\`\`
Output:
30 Because add() is static, it can be called using the class name:
Calculator.add(10, 20);
📄 Page 8 — Method Overloading ⭐⭐⭐

Method overloading means having multiple methods with the same name but different parameter lists.

📝 **Example**
> 
\`\`\`java
class Calculator {
    static int add(int a, int b) {
        return a + b;
    }
    static int add(int a, int b, int c) {
        return a + b + c;
    }
    static double add(double a, double b) {
        return a + b;
    }
}
\`\`\`
Now:
add(10, 20); add(10, 20, 30); add(10.5, 20.5);
Java selects the appropriate method based on the arguments.
Important You cannot overload methods only by changing the return type .
Invalid idea:
int add(int a, int b) double add(int a, int b)
The parameter list is the same, so this is not a valid overload.

📄 Page 9 — Recursion Basics ⭐⭐⭐
Recursion occurs when a method calls itself.
📝 **Example**
> factorial.
static int factorial(int n) { if (n == 0 || n == 1) { return 1; } return n * factorial(n - 1); }
Call:
\`\`\`java
System.out.println(factorial(5));
\`\`\`
Output:
120 Flow factorial(5) ↓ 5 × factorial(4) ↓ 5 × 4 × factorial(3)
↓ 5 × 4 × 3 × factorial(2) ↓ 5 × 4 × 3 × 2 × factorial(1) ↓ 120 Two important parts Every recursive method should have:
Base Case ↓ Stops recursion Recursive Case ↓ Calls method again Without a proper base case, recursion may continue until a StackOverflowError occurs.

📄 Page 10 — Practical Programs + Revision Program 1: Even or Odd Method

\`\`\`java
class NumberCheck {
    static void checkEvenOdd(int n) {
        if (n % 2 == 0) {
            System.out.println("Even");
        }
        else {
            System.out.println("Odd");
        }
    }
    public static void main(String[] args) {
        checkEvenOdd(10);
        checkEvenOdd(7);
    }
\`\`\`
`,
  10: `
Module 10 — Exception Handling Module Flow EXCEPTION HANDLING ↓ Error vs Exception ↓ try ↓ catch ↓ finally ↓ Multiple catch blocks ↓ throw ↓ throws ↓ Checked / Unchecked ↓ Custom Exception Basics ↓ Practice
📄 Page 1 — What is an Exception?
An exception is an event that occurs during program execution and disrupts the normal flow of the program.

📝 **Example**
> 
\`\`\`java
int a = 10;
int b = 0;
System.out.println(a / b);
\`\`\`
This causes:
ArithmeticException Instead of allowing the program to terminate unexpectedly, we can handle the exception.
Basic idea Normal Program ↓ Something goes wrong ↓ Exception occurs ↓ Handle exception ↓ Program can continue
📄 Page 2 — Error vs Exception ⭐⭐⭐
Both Error and Exception are subclasses of Throwable, but they are used for different kinds of problems.

Throwable ↓ ┌────────┴────────┐ ↓ ↓ Error Exception Error Usually represents serious problems that applications generally should not try to recover from.

Examples:
OutOfMemoryError StackOverflowError Exception Represents conditions that a program can often handle.
Examples:
ArithmeticException NullPointerException IOException For beginner/intermediate Java, focus mainly on exceptions .

📄 Page 3 — Common Exceptions ⭐⭐⭐

1. ArithmeticException int result = 10 / 0;
2. NullPointerException String name = null; System.out.println(name.length());
3. ArrayIndexOutOfBoundsException int[] numbers = {10, 20, 30}; System.out.println(numbers[5]);
4. NumberFormatException int n = Integer.parseInt("abc");
5. InputMismatchException Can occur when Scanner receives input of an unexpected type.
Scanner sc = new Scanner(System.in); int age = sc.nextInt();
If the user enters something such as:
hello an InputMismatchException can occur.

📄 Page 4 — try and catch ⭐⭐⭐
We use try and catch to handle exceptions.
Syntax try { // risky code } catch (ExceptionType e) { // handling code }
Example

\`\`\`java
class Demo {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
            System.out.println(result);
        }
        catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero");
        }
    }
}
\`\`\`
Output:
Cannot divide by zero Flowchart START ↓ Execute try ↓ Exception occurs? / \\ NO YES ↓ ↓ Continue catch block \\ / \\ / END
📄 Page 5 — Multiple catch Blocks A single try block can be followed by multiple catch blocks.
📝 **Example**
> 
\`\`\`java
class Demo {
    public static void main(String[] args) {
        try {
            int[] numbers = {
                10, 20, 30
            }
            ;
            System.out.println(numbers[5]);
        }
\`\`\`
\`\`\`java
catch (ArithmeticException e) {
    System.out.println("Arithmetic problem");
}
catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Invalid array index");
}
}
}
\`\`\`
Output:
Invalid array index Important Only the first matching catch block is executed.
More specific exception types should generally come before broader types.
For example:
catch (ArithmeticException e) { } catch (Exception e) { }
is valid.
But:
catch (Exception e) { } catch (ArithmeticException e) { }
is invalid because the second catch becomes unreachable.

📄 Page 6 — finally ⭐⭐⭐
The finally block is used for code that should normally execute whether an exception occurs or not.

📝 **Example**
> 
\`\`\`java
class Demo {
    public static void main(String[] args) {
        try {
            int result = 10 / 2;
            System.out.println(result);
        }
        catch (ArithmeticException e) {
            System.out.println("Error");
        }
        finally {
            System.out.println("Program completed");
        }
    }
}
\`\`\`
Output:
5 Program completed If an exception occurs:
try ↓ exception ↓ catch ↓ finally Common use finally is traditionally associated with cleanup operations such as closing resources.
For modern Java resource handling, try-with-resources is often preferable for AutoCloseable resources.

📄 Page 7 — throw Keyword ⭐⭐⭐
The throw keyword is used to explicitly throw an exception .
📝 **Example**
> 
\`\`\`java
class Demo {
    public static void main(String[] args) {
        int age = 15;
        if (age < 18) {
            throw new IllegalArgumentException( "Age must be 18 or above" );
        }
        System.out.println("Eligible");
    }
}
\`\`\`
If the condition is true, the exception is explicitly created and thrown.
Flow Age ↓ age < 18 ? / \\ YES NO ↓ ↓ throw Continue ↓ Exception
📄 Page 8 — throws Keyword ⭐⭐⭐
The throws keyword is used in a method declaration to indicate that a method may pass certain exceptions to its caller.

📝 **Example**
> 
import java.io.IOException;

\`\`\`java
class Demo {
\`\`\`
static void readFile() throws IOException { // file operation } }
Then the caller must handle or further declare the relevant checked exception.
throw vs throws throw throws Actually throws an exception Declares possible exceptions Used inside method/block Used in method declaration Throws one exception object at a time Can declare multiple exception types Example:
throw new ArithmeticException();
versus:
void test() throws IOException { }
📄 Page 9 — Checked vs Unchecked Exceptions ⭐⭐⭐

Java exceptions are commonly discussed as checked and unchecked .
Checked Exceptions The compiler requires checked exceptions to be handled or declared.
📝 **Example**
> 
IOException SQLException For example:
\`\`\`java
import java.io.IOException;
\`\`\`
\`\`\`java
class Demo {
    static void test() throws IOException {
        // operation that may throw IOException
    }
}
\`\`\`
You must handle or declare the checked exception.

Unchecked Exceptions These are subclasses of RuntimeException.
Examples:
ArithmeticException NullPointerException ArrayIndexOutOfBoundsException NumberFormatException The compiler does not require you to catch or declare them.
Easy memory Checked ↓ Compiler checks handling/declaration Unchecked ↓ RuntimeException hierarchy ↓ Compiler doesn't require handling/declaration
📄 Page 10 — Custom Exception + Revision You can create your own exception class.
📝 **Example**
> 
\`\`\`java
class AgeException extends Exception {
    AgeException(String message) {
        super(message);
    }
}
\`\`\`
Use it:
\`\`\`java
class Demo {
    static void checkAge(int age) throws AgeException {
        if (age < 18) {
            throw new AgeException( "Age must be 18 or above" );
        }
        System.out.println("Eligible");
    }
    public static void main(String[] args) {
        try {
            checkAge(15);
        }
        catch (AgeException e) {
            System.out.println(e.getMessage());
        }
    }
}
\`\`\`
Output:
Age must be 18 or above Custom exception flow User input ↓ Validate ↓ Invalid? / \\ YES NO

Exception Handling Module Flow EXCEPTION HANDLING ↓
Exception Hierarchy ↓
try / catch ↓
Multiple catch ↓
finally ↓
throw ↓
throws ↓
Checked / Unchecked ↓
Custom Exception ↓
Best Practices

📄 Page 1 — Exception Recap An exception is an event that interrupts the normal flow of program execution.
📝 **Example**
> 
int a = 10;
int b = 0;

\`\`\`java
System.out.println(a / b);
This causes:
\`\`\`
ArithmeticException Without handling:
Program ↓
Exception ↓
Program terminates With handling:
Program ↓
Exception ↓
catch ↓
Handle problem ↓
Continue

📄 Page 2 — Exception Hierarchy ⭐⭐⭐

Java's exception hierarchy starts from Throwable.
Throwable ↓
┌────────┴────────┐ ↓ ↓
Error Exception ↓
RuntimeException Error Examples:
OutOfMemoryError StackOverflowError These generally represent serious JVM/system-level problems.

Exception Examples:
IOException SQLException ArithmeticException NullPointerException For our course, focus mainly on exceptions.

📄 Page 3 — try-catch ⭐⭐⭐
Syntax:
try { // risky code

}
catch (ExceptionType e) { // handling
} Example:
\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    try {
        int result = 10 / 0;
\`\`\`

\`\`\`java
System.out.println(result);
\`\`\`
}
catch (ArithmeticException e) {

\`\`\`java
System.out.println( "Cannot divide by zero" );
\`\`\`
}
}
} Output:
Cannot divide by zero Flowchart START ↓
try block ↓
Exception occurs?
/ \\ NO YES ↓ ↓
Continue catch ↓ ↓
└──────→───────┘ ↓
END

📄 Page 4 — Multiple catch Blocks One try block can have multiple catch blocks.
\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    try {
        int[] numbers = {
            10, 20, 30
        }
        ;
\`\`\`

\`\`\`java
System.out.println(numbers[5]);
\`\`\`
}
catch (ArithmeticException e) {

\`\`\`java
System.out.println( "Arithmetic error" );
\`\`\`
}
catch (ArrayIndexOutOfBoundsException e) {

\`\`\`java
System.out.println( "Invalid array index" );
\`\`\`
}
}
} Output:
Invalid array index Important rule Put more specific exceptions before broader ones. Correct:
catch (ArithmeticException e) {
}
catch (Exception e) {
} Incorrect:
catch (Exception e) {
}
catch (ArithmeticException e) {
} because the second catch becomes unreachable.

📄 Page 5 — finally ⭐⭐⭐ finally is used for code that should normally execute whether an exception occurs or not.
📝 **Example**
> 
\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    try {
\`\`\`

\`\`\`java
System.out.println(10 / 2);
\`\`\`
}
catch (ArithmeticException e) {

\`\`\`java
System.out.println("Error");
\`\`\`
}
finally {

\`\`\`java
System.out.println( "Finally executed" );
\`\`\`
}
}
}
Output:
5 Finally executed If an exception occurs:
try ↓
Exception ↓
catch ↓
finally Commonly, finally is associated with cleanup.
For resources such as files, modern Java often prefers try-with-resources .

📄 Page 6 — throw ⭐⭐⭐
The throw keyword is used to explicitly throw an exception.
📝 **Example**
> 
\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    int age = 15;
\`\`\`

if (age < 18) { throw new IllegalArgumentException( "Age must be 18 or above" );
}
}
} Flow:
Enter age ↓
age < 18?
/ \\ YES NO ↓ ↓
throw Continue ↓
Exception Another example:
throw new ArithmeticException( "Invalid calculation" );

📄 Page 7 — throws ⭐⭐⭐ throws is used in a method declaration to indicate that a method may propagate specified exceptions to its caller.
📝 **Example**
> 
\`\`\`java
import java.io.IOException;
\`\`\`

\`\`\`java
class FileDemo {
\`\`\`

static void readFile()
throws IOException { // file operation
}
} The caller must handle or declare the checked exception.

throw vs throws throw throws Actually throws an exception Declares possible exceptions Used inside method/block Used in method declaration Works with an exception object Lists exception types Example: throw new ...
📝 **Example**
> method() throws IOException Easy memory:
throw ↓
DO something throws ↓
DECLARE something

📄 Page 8 — Checked vs Unchecked ⭐⭐⭐

Checked Exceptions The compiler requires checked exceptions to be caught or declared .
Examples:
IOException SQLException ClassNotFoundException Example:
\`\`\`java
import java.io.IOException;
\`\`\`

\`\`\`java
class Demo {
\`\`\`

static void test()
throws IOException { // operation
}
}

Unchecked Exceptions These are subclasses of RuntimeException.
Examples:
ArithmeticException NullPointerException ArrayIndexOutOfBoundsException NumberFormatException The compiler does not require you to catch or declare them.

Easy flow Exception ↓
RuntimeException?
/ \\ YES NO ↓ ↓
Unchecked Usually checked

📄 Page 9 — Custom Exception ⭐⭐⭐
We can create our own exception class. Example:
\`\`\`java
class AgeException extends Exception {
    AgeException(String message) {
        super(message);
\`\`\`
}
} Use it:
\`\`\`java
class Main {
\`\`\`

static void checkAge(int age)
throws AgeException { if (age < 18) { throw new AgeException( "Age must be 18 or above" );
}

\`\`\`java
System.out.println( "Eligible" );
\`\`\`
}

\`\`\`java
public static void main(String[] args) {
    try {
        checkAge(15);
\`\`\`
}
catch (AgeException e) {

\`\`\`java
System.out.println( e.getMessage()
\`\`\`
);
}
}
} Output:
Age must be 18 or above Flow:
Age ↓
Validate ↓
Invalid?
↓
`,
  11: `
Module 11 — Packages & Access Modifiers Module Flow PACKAGES ↓ Why Packages? ↓ Creating a Package ↓ import ↓ Built-in Packages ↓ ACCESS MODIFIERS ↓ public / private / protected ↓ default access ↓ Access Comparison ↓ Practice
📄 Page 1 — What is a Package?
A package is a namespace used to organize related Java classes and interfaces.
Think of a package like a folder containing related classes.
📝 **Example**
> 
college │ ├── Student.java ├── Teacher.java └── Course.java In Java:
package college;
Now the class belongs to the college package.
Why use packages?
Packages help with:
- Organizing code ● Avoiding naming conflicts ● Controlling access ● Managing large projects

📄 Page 2 — Package Structure ⭐⭐⭐
Suppose we have:
src └── college ├── Student.java └── Teacher.java Student.java:
package college; public

\`\`\`java
class Student {
    public void display() {
        System.out.println("Student details");
    }
}
\`\`\`
The first statement is:
package college;
Important The package declaration normally appears at the beginning of the source file, before imports and type declarations.

📄 Page 3 — import Keyword ⭐⭐⭐
If a class is in another package, we can import it.
📝 **Example**
> 
import college.Student;
Then:
Student s = new Student(); s.display();
Flow Package ↓ Class ↓ import ↓ Use class You can import all accessible types in a package using:
import college.*;
But note: * does not recursively import subpackages.

📄 Page 4 — Built-in Packages ⭐⭐⭐
Java provides many standard packages.
java.lang Contains commonly used classes such as:
String System Math Object Integer Classes in java.lang are automatically available without an explicit import.

java.util Contains useful utility classes:
Scanner ArrayList HashMap Collections Example:
\`\`\`java
import java.util.Scanner;
\`\`\`
java.io Used for input/output functionality.
Examples:
File InputStream OutputStream java.time Used for date and time APIs.
Examples:
LocalDate LocalTime LocalDateTime
📄 Page 5 — What are Access Modifiers?

Access modifiers control where a class member can be accessed .
Java has four access levels:
Access ↓ ┌─────────┼─────────┐ ↓ ↓ ↓ public protected private ↓ default The four are:
public protected default private default here means package-private access : when no access modifier is written.

📄 Page 6 — public and private ⭐⭐⭐

public A public member can generally be accessed wherever the class itself is accessible.
📝 **Example**
> 
\`\`\`java
class Student {
    public String name = "Prasanna";
}
\`\`\`
Another accessible class can use:
\`\`\`java
Student s = new Student();
System.out.println(s.name);
\`\`\`
private A private member can be accessed only within the class where it is declared .
📝 **Example**
> 
\`\`\`java
class Student {
    private int age = 20;
}
\`\`\`
This is not directly accessible from another class:
\`\`\`java
Student s = new Student();
// System.out.println(s.age);
// ❌ Flow private ↓ Same class only This is very important for encapsulation , which we'll study in detail later.
\`\`\`

📄 Page 7 — default Access ⭐⭐⭐
If no access modifier is written, the member has package-private/default access .
📝 **Example**
> 
\`\`\`java
class Student {
    int age = 20;
}
\`\`\`
Here age can be accessed by classes in the same package .
But classes in another package cannot directly access it.
default ↓ Same package ↓ Accessible Outside the package:
default ↓ Not accessible
📄 Page 8 — protected ⭐⭐⭐
protected provides access:
1. Within the same package. 2. In subclasses in other packages, through inheritance rules.
📝 **Example**
> 
\`\`\`java
class Student {
    protected int age = 20;
}
\`\`\`
Same package Accessible.
Different package A subclass can access the protected member through inheritance.
This is especially important when we study inheritance .
Think:
protected ↓ Same package OR Subclass in another package
📄 Page 9 — Access Modifier Comparison ⭐⭐⭐

This table is very important for exams/interviews.
Access Level Same Class Same Package Subclass in Other Package Other Package private ✅ ❌ ❌ ❌ default ✅ ✅ ❌ * ❌ protected ✅ ✅ ✅ ** ❌
public ✅ ✅ ✅ ✅ * A subclass in another package does not get access to a package-private member merely because it is a subclass.

** Protected access in another package is through inheritance, not arbitrary access through any object reference.

Easy memory private ↓ Class default ↓ Package protected ↓ Package + Subclass public ↓ Everywhere accessible
📄 Page 10 — Practical Example + Revision Example File 1 — Student.java package college;
`,
  12: `
Module 12 — Classes & Objects Module Flow OOP ↓ Real-world Objects ↓ Class ↓ Object ↓ Fields + Methods ↓ Creating Objects ↓ new ↓ Constructors ↓ Object Interaction ↓ Practice
📄 Page 1 — What is OOP?
OOP = Object-Oriented Programming It is a programming approach where programs are designed around objects and classes .
Real-world examples:
Car ↓ Color Speed Model ↓ Start() Stop() Accelerate() Student ↓ Name Age Roll Number ↓
Study() WriteExam() AttendClass()
OOP allows us to represent such entities in programs.
Four major OOP concepts OOP ↓ ┌────────┼────────┐ ↓ ↓ ↓ Encapsulation Inheritance Polymorphism ↓ Abstraction We'll study these individually in later modules.

📄 Page 2 — What is a Class? ⭐⭐⭐
A class is a blueprint or template for creating objects.
📝 **Example**
> 
\`\`\`java
class Student {
    String name;
    int age;
    void study() {
        System.out.println("Student is studying");
    }
}
\`\`\`
Here:
Student ↓ Class ↓ Blueprint The class defines:
Data ↓
name age Behavior ↓ study()
Real-world analogy House Blueprint ↓ Class Actual Houses ↓ Objects
📄 Page 3 — What is an Object? ⭐⭐⭐
An object is an instance of a class .
Suppose:
\`\`\`java
class Student {
    String name;
    int age;
}
\`\`\`
We can create objects:
Student s1 = new Student(); Student s2 = new Student();
Now:
Student Class ↓ ┌─────────┴─────────┐ ↓ ↓ Object Object s1 s2 ↓ ↓ Student Student Each object can have its own state.

📄 Page 4 — Creating an Object ⭐⭐⭐
Syntax:
ClassName objectName = new ClassName();
📝 **Example**
> 
Student s1 = new Student();
Breakdown:
Student ↓ Reference type s1 ↓ Reference variable new ↓ Creates an object Student() ↓ Constructor call Flow:
Student s1 = new Student(); ↓ new ↓ Object created ↓ s1 refers to object
📄 Page 5 — Fields and Methods A class generally contains fields and methods .
📝 **Example**
> 
\`\`\`java
class Student {
    String name;
    int age;
    void display() {
        System.out.println(name);
        System.out.println(age);
    }
}
\`\`\`
Fields name age Represent the object's state/data .
Methods display()
Represent the object's behavior .
Think:
Object ↓ ┌───────────────┐ │ State │ │ name │ │ age │ │ │ │ Behavior │ │ display() │ └───────────────┘
📄 Page 6 — Accessing Object Members ⭐⭐⭐

Use the dot (.) operator .
📝 **Example**
> 
\`\`\`java
class Student {
    String name;
    int age;
    void display() {
        System.out.println( "Name: " + name );
        System.out.println( "Age: " + age );
    }
}
\`\`\`
Create object:
Student s1 = new Student();
Set values:
s1.name = "Prasanna"; s1.age = 20;
Call method:
s1.display();
Output:
Name: Prasanna Age: 20 Flow s1 ↓ .name ↓ "Prasanna" s1 ↓ .display() ↓ Execute method
📄 Page 7 — Multiple Objects ⭐⭐⭐
One class can create many objects.
\`\`\`java
class Student {
    String name;
    int age;
}
\`\`\`
Create:
Student s1 = new Student(); Student s2 = new Student(); Student s3 = new Student();
Assign different values:
s1.name = "Prasanna"; s1.age = 20; s2.name = "Rahul"; s2.age = 21; s3.name = "Anjali"; s3.age = 19;
Think:
Student ↓ ┌─────────┼─────────┐ ↓ ↓ ↓ s1 s2 s3 ↓ ↓ ↓ Prasanna Rahul Anjali 20 21 19 Each object maintains its own instance state.

📄 Page 8 — Constructors ⭐⭐⭐
A constructor is a special member used to initialize an object when it is created.
📝 **Example**
> 
\`\`\`java
class Student {
    String name;
    int age;
    Student() {
        name = "Unknown";
        age = 0;
    }
}
\`\`\`
Create:
Student s1 = new Student();
The constructor runs during object creation.
Constructor characteristics A constructor:
- Has the same name as the class. ● Has no return type. ● Runs when an object is created. ● Can be overloaded.

📄 Page 9 — Parameterized Constructor ⭐⭐⭐

A constructor can accept parameters.
\`\`\`java
class Student {
    String name;
    int age;
    Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
    void display() {
\`\`\`
\`\`\`java
System.out.println( "Name: " + name );
System.out.println( "Age: " + age );
}
}
\`\`\`
Create object:
Student s1 = new Student( "Prasanna", 20 ); s1.display();
Output:
Name: Prasanna Age: 20
📄 Page 10 — this Keyword + Complete Example When a parameter and field have the same name:
Student(String name, int age) { this.name = name; this.age = age; }
Here:
this.name ↓ Current object's field name ↓ Constructor parameter
`,
  13: `
Module 13 — Encapsulation Module Flow ENCAPSULATION ↓ Data Hiding ↓ private Members ↓ Getter ↓ Setter ↓ Validation ↓ this Keyword ↓ Real-world Example ↓ Bank Account ↓ Practice
📄 Page 1 — What is Encapsulation?
Encapsulation is the OOP concept of bundling data and the methods that operate on that data inside a class , while controlling direct access to the internal state.

The common Java approach is:
Class ↓ private Data ↓ Methods ↓ Controlled Access Example:
\`\`\`java
class Student {
    private String name;
    private int age;
    public void setName(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
}
\`\`\`
Here:
name age ↓ private ↓ Cannot be directly accessed from outside
📄 Page 2 — Why Encapsulation?
Without encapsulation:
\`\`\`java
class BankAccount {
    double balance;
}
\`\`\`
Another class could directly do:
account.balance = -50000;
This can create invalid state.
With encapsulation:
\`\`\`java
class BankAccount {
    private double balance;
}
\`\`\`
Outside code cannot directly modify balance.
Instead:
Outside Code ↓ Setter / Method ↓ Validation ↓ Private Data This gives the class control over how its state changes.

📄 Page 3 — Data Hiding ⭐⭐⭐
Data hiding means restricting direct access to internal data.
Use:
private Example:
\`\`\`java
class Employee {
    private double salary;
}
\`\`\`
This is not directly accessible from another class:
Employee e = new Employee(); // e.salary = 50000; // ❌ Instead, provide controlled methods.
public double getSalary() { return salary; }
📄 Page 4 — Getter Method ⭐⭐⭐
A getter is a method used to retrieve the value of a private field.
📝 **Example**
> 
\`\`\`java
class Student {
    private int age;
    public int getAge() {
        return age;
    }
}
\`\`\`
Usage:
\`\`\`java
Student s = new Student();
System.out.println(s.getAge());
\`\`\`
Flow:
Private age ↓ getAge() ↓ Returns age ↓ Outside code Naming convention For field:
name Getter:
getName()
For:
age Getter:
getAge()
📄 Page 5 — Setter Method ⭐⭐⭐
A setter is a method used to modify a private field.
📝 **Example**
> 
\`\`\`java
class Student {
    private int age;
    public void setAge(int age) {
        this.age = age;
    }
}
\`\`\`
Usage:
Student s = new Student(); s.setAge(20);
Flow:
Outside value ↓ setAge(20) ↓ Validation (if required) ↓ private age
📄 Page 6 — Getter + Setter Together Example:
\`\`\`java
class Student {
    private String name;
    private int age;
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
    }
}
\`\`\`
Use:
\`\`\`java
Student s = new Student();
s.setName("Prasanna");
s.setAge(20);
System.out.println(s.getName());
System.out.println(s.getAge());
\`\`\`
Output:
Prasanna 20
📄 Page 7 — Encapsulation with Validation ⭐⭐⭐

One of the biggest benefits of encapsulation is validation before changing data .
📝 **Example**
> 
\`\`\`java
class Student {
    private int age;
    public void setAge(int age) {
        if (age >= 0) {
            this.age = age;
        }
        else {
            System.out.println("Invalid age");
\`\`\`
} } public int getAge() { return age; } }
Now:
s.setAge(20);
is accepted.
But:
s.setAge(-5);
produces:
Invalid age Flowchart setAge(value) ↓ value >= 0? / \\ YES NO ↓ ↓ Store value Reject
📄 Page 8 — Real-World Example: Bank Account ⭐⭐⭐

A bank account should not allow arbitrary direct modification of balance.
\`\`\`java
class BankAccount {
    private double balance;
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
\`\`\`
\`\`\`java
else {
    System.out.println("Invalid amount");
}
}
public void withdraw(double amount) {
    if (amount > 0 && amount <= balance) {
        balance -= amount;
    }
    else {
        System.out.println("Invalid withdrawal");
    }
}
public double getBalance() {
    return balance;
}
}
\`\`\`
Use:
\`\`\`java
BankAccount account = new BankAccount();
account.deposit(5000);
account.withdraw(1000);
System.out.println(account.getBalance());
\`\`\`
Output:
4000.0 The important point is:
balance ↓ private ↓ Cannot directly modify ↓ deposit()/withdraw() ↓ Validation ↓ Balance updated
📄 Page 9 — Complete Encapsulation Program

\`\`\`java
class BankAccount {
    private String accountHolder;
    private double balance;
    public BankAccount( String accountHolder, double balance) {
        this.accountHolder = accountHolder;
        if (balance >= 0) {
            this.balance = balance;
        }
    }
    public String getAccountHolder() {
        return accountHolder;
    }
    public double getBalance() {
        return balance;
    }
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
        else {
            System.out.println("Invalid deposit");
        }
    }
    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
        }
        else {
            System.out.println("Insufficient balance or invalid amount");
        }
    }
\`\`\`
}
Usage:
\`\`\`java
class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("Prasanna", 5000);
        account.deposit(2000);
        account.withdraw(1000);
        System.out.println( account.getAccountHolder() );
        System.out.println( account.getBalance() );
    }
}
\`\`\`
Output:
Prasanna 6000.0
📄 Page 10 — Encapsulation vs Data Hiding + Revision Encapsulation Focuses on:
Bundling + Controlled access Data Hiding Focuses on:
Restricting direct access
`,
  14: `
Module 14 — Inheritance Module Flow INHERITANCE ↓ Parent & Child Class ↓ extends ↓ Code Reusability ↓ Types of Inheritance ↓ Single Inheritance ↓ Multilevel Inheritance ↓ Hierarchical Inheritance ↓ Method Overriding ↓ super ↓ Practice
📄 Page 1 — What is Inheritance?
Inheritance is an OOP mechanism where a new class acquires accessible properties and behavior from an existing class.

It creates a relationship between:
Parent Class ↓ Child Class Example:
Vehicle ↓ Car A Car can inherit common vehicle behavior such as:
start() stop()
and also define its own behavior:
openSunroof()
Main benefit Existing Code ↓ Reuse ↓ New Class
📄 Page 2 — Parent and Child Class ⭐⭐⭐

📝 **Example**
> 
\`\`\`java
class Vehicle {
    void start() {
        System.out.println("Vehicle starts");
    }
}
\`\`\`
Child class:
\`\`\`java
class Car extends Vehicle {
    void drive() {
        System.out.println("Car is driving");
    }
}
\`\`\`
Here:
Vehicle ↓ Parent / Superclass Car ↓ Child / Subclass The keyword used is:
extends
📄 Page 3 — extends Keyword ⭐⭐⭐
\`\`\`java
extends establishes class inheritance.
\`\`\`
📝 **Example**
> 
\`\`\`java
class Animal {
    void eat() {
        System.out.println("Eating");
    }
}
class Dog extends Animal {
    void bark() {
        System.out.println("Barking");
    }
}
\`\`\`
Now:
Dog d = new Dog();
d.eat(); d.bark();
Output:
Eating Barking Flow:
Animal ↓ extends ↓ Dog ↙ ↘ eat() bark()
The child can use accessible inherited members of the parent.

📄 Page 4 — Types of Inheritance in Java ⭐⭐⭐

Java class inheritance commonly appears as:
1. Single 2. Multilevel 3. Hierarchical Java does not support multiple inheritance of classes.
However, multiple inheritance of type/behavior can be achieved using interfaces , which we'll study later.

1. Single Inheritance Animal ↓ Dog Example:
\`\`\`java
class Animal {
}
class Dog extends Animal {
}
\`\`\`
2. Multilevel Inheritance Animal ↓ Mammal ↓ Dog Example:
\`\`\`java
class Animal {
}
class Mammal extends Animal {
}
class Dog extends Mammal {
}
\`\`\`
📄 Page 5 — Hierarchical Inheritance Multiple child classes inherit from one parent.
Animal / \\ ↓ ↓ Dog Cat Example:
\`\`\`java
class Animal {
    void eat() {
        System.out.println("Eating");
    }
}
class Dog extends Animal {
\`\`\`
void bark() { System.out.println("Barking"); } }

\`\`\`java
class Cat extends Animal {
    void meow() {
        System.out.println("Meowing");
    }
}
\`\`\`
Both Dog and Cat can use:
eat()
but each can have its own behavior.

📄 Page 6 — Method Overriding ⭐⭐⭐
When a subclass provides its own implementation of an inherited instance method with the same signature, it overrides that method.

📝 **Example**
> 
\`\`\`java
class Animal {
    void sound() {
        System.out.println("Animal makes sound");
    }
}
class Dog extends Animal {
    @Override void sound() {
        System.out.println("Dog barks");
    }
}
\`\`\`
Now:
Dog d = new Dog(); d.sound();
Output:
Dog barks @Override @Override is an annotation that tells the compiler you intend to override a superclass method. It helps catch mistakes.

📄 Page 7 — Inheritance + Constructors ⭐⭐⭐

Constructors are not inherited .
However, when a child object is created, the superclass constructor is invoked as part of object initialization.

📝 **Example**
> 
\`\`\`java
class Animal {
    Animal() {
        System.out.println("Animal constructor");
    }
}
class Dog extends Animal {
    Dog() {
        System.out.println("Dog constructor");
    }
}
\`\`\`
Create:
Dog d = new Dog();
Output:
Animal constructor Dog constructor Flow:
new Dog() ↓ Animal constructor ↓ Dog constructor ↓ Object ready
📄 Page 8 — super Keyword ⭐⭐⭐
super refers to the superclass portion of the current object.
It can be used to:
- Access a superclass field. ● Call a superclass method. ● Invoke a superclass constructor.

super() — Constructor
\`\`\`java
class Animal {
    Animal() {
        System.out.println("Animal");
    }
}
class Dog extends Animal {
    Dog() {
        super();
        System.out.println("Dog");
    }
}
\`\`\`
super() calls the superclass constructor.
If you don't explicitly write a constructor invocation, Java inserts an implicit super() where applicable.

📄 Page 9 — super for Method and Variable Calling Parent Method

\`\`\`java
class Animal {
    void sound() {
        System.out.println("Animal sound");
    }
}
class Dog extends Animal {
    @Override void sound() {
        super.sound();
        System.out.println("Dog bark");
    }
}
\`\`\`
Output:
Animal sound Dog bark Accessing Parent Field

\`\`\`java
class Animal {
    String name = "Animal";
}
class Dog extends Animal {
    String name = "Dog";
    void display() {
        System.out.println(name);
        System.out.println(super.name);
    }
\`\`\`
}
Output:
Dog Animal Here:
name ↓ Child field super.name ↓ Parent field
📄 Page 10 — Complete Example + Revision Real-World Example

\`\`\`java
class Vehicle {
    void start() {
        System.out.println("Vehicle starts");
    }
    void stop() {
        System.out.println("Vehicle stops");
    }
}
class Car extends Vehicle {
    @Override void start() {
        System.out.println("Car starts with button");
    }
    void drive() {
        System.out.println("Car is driving");
    }
}
\`\`\`
`,
  15: `
Module 15 — Polymorphism Module Flow POLYMORPHISM ↓ "Many Forms" ↓ ┌──────────────┴──────────────┐ ↓ ↓ Compile-Time Runtime Polymorphism Polymorphism ↓ ↓ Method Overloading Method Overriding ↓ Upcasting ↓ Dynamic Method Dispatch ↓
Practice
📄 Page 1 — What is Polymorphism?
Polymorphism means "many forms." In Java, the same method name or reference can represent different behavior depending on the situation.

Real-world example:
Person ↓ Can communicate ↓ Speaking Writing Typing Same general idea:
communicate()
but behavior can differ.
In Java:
Same name ↓ Different behavior
📄 Page 2 — Types of Polymorphism ⭐⭐⭐

Java commonly discusses two main forms:
Polymorphism ↓ ┌────────┴────────┐ ↓ ↓ Compile-Time Runtime ↓ ↓ Overloading Overriding 1. Compile-Time Polymorphism Usually achieved through:
Method Overloading The compiler determines which overloaded method to invoke.
2. Runtime Polymorphism Achieved through:
Method Overriding + Inheritance + Upcasting The JVM selects the overridden instance method based on the actual object at runtime.

📄 Page 3 — Method Overloading ⭐⭐⭐

Method overloading means having multiple methods with the same name but different parameter lists .

📝 **Example**
> 
\`\`\`java
class Calculator {
    int add(int a, int b) {
        return a + b;
    }
    int add(int a, int b, int c) {
        return a + b + c;
    }
    double add(double a, double b) {
        return a + b;
    }
}
\`\`\`
Now:
\`\`\`java
Calculator c = new Calculator();
System.out.println(c.add(10, 20));
System.out.println(c.add(10, 20, 30));
System.out.println(c.add(10.5, 20.5));
\`\`\`
Output:
30 60 31.0
📄 Page 4 — Rules of Method Overloading Methods can be overloaded by changing:
Number of parameters add(int a, int b) add(int a, int b, int c)
Type of parameters add(int a, int b) add(double a, double b)
Order of parameters display(int a, String b) display(String a, int b)
But return type alone is not enough .
❌ Invalid:
int add(int a, int b) { return a + b; } double add(int a, int b) { return a + b; }
The parameter list is identical.

📄 Page 5 — Method Overriding ⭐⭐⭐
Method overriding occurs when a subclass provides its own implementation of an inherited instance method with the same signature.

📝 **Example**
> 
\`\`\`java
class Animal {
    void sound() {
        System.out.println("Animal sound");
    }
}
class Dog extends Animal {
    @Override void sound() {
        System.out.println("Dog barks");
    }
}
\`\`\`
Now:
Dog d = new Dog(); d.sound();
Output:
Dog barks The child version overrides the inherited method.

📄 Page 6 — Runtime Polymorphism ⭐⭐⭐

The most important concept.
Consider:
Animal a = new Dog();
Here:
Animal ↓ Reference type Dog ↓ Actual object type Then:
a.sound();
If Dog overrides sound(), the Dog implementation executes.
Animal reference ↓ Dog object ↓ a.sound() ↓ Dog's sound()
This is runtime polymorphism .

📄 Page 7 — Upcasting & Dynamic Method Dispatch Upcasting Assigning a child object to a parent reference is called upcasting.
Animal a = new Dog();
Flow:
Dog object ↓ Animal reference This is allowed because a Dog is an Animal.
Important Through the parent reference, you can access members available through the parent type.
Animal a = new Dog(); a.sound();
If sound() is overridden, Java invokes the Dog implementation at runtime.
This mechanism is commonly called dynamic method dispatch .

📄 Page 8 — Practical Example
\`\`\`java
class Animal {
    void sound() {
        System.out.println("Animal sound");
    }
}
class Dog extends Animal {
    @Override void sound() {
        System.out.println("Dog barks");
    }
}
class Cat extends Animal {
    @Override void sound() {
        System.out.println("Cat meows");
    }
}
class Main {
    public static void main(String[] args) {
        Animal a1 = new Dog();
        Animal a2 = new Cat();
        a1.sound();
\`\`\`
a2.sound(); } }
Output:
Dog barks Cat meows Flow:
Animal ↓ ┌─────────┴─────────┐ ↓ ↓ Dog Cat ↓ ↓ "Dog barks" "Cat meows" Same method:
sound()
Different behavior.

📄 Page 9 — Overloading vs Overriding ⭐⭐⭐

Overloading Overriding Same class commonly Parent-child relationship Same method name Same method signature Different parameter list Same parameter list Compile-time polymorphism Runtime polymorphism Inheritance not required Inheritance required Compiler chooses overload JVM dispatches overridden instance method Easy trick Overloading ↓ Same name Different parameters Overriding ↓ Parent method ↓ Child replaces implementation
📄 Page 10 — Important Rules + Revision Important overriding rules A subclass method generally must have:
Same method name Same parameter list Compatible return type The overriding method cannot reduce access visibility.
📝 **Example**
> 
\`\`\`java
class Parent {
    protected void display() {
    }
}
class Child extends Parent {
    @Override public void display() {
    }
}
\`\`\`
This is allowed because public is not more restrictive than protected.
But this is not allowed:
\`\`\`java
class Child extends Parent {
\`\`\`
`,
  16: `
Module 16 — Abstraction Module Flow ABSTRACTION ↓ Hide Implementation ↓ Abstract Class ↓ Abstract Method ↓ Concrete Class ↓ extends ↓ @Override ↓ Constructors ↓ Interface (Next Module)
📄 Page 1 — What is Abstraction?
Abstraction means showing the important features of an object while hiding unnecessary implementation details.

Real-life example:
When you use an ATM:
You see: ↓ Withdraw Deposit Check Balance You don't see: ↓ Internal banking logic Database operations Network communication Security processing In Java:
User ↓ Required functionality ↓ Hidden implementation Simple definition Abstraction = What an object does, while hiding how it does it.

📄 Page 2 — Why Abstraction?
Suppose we have:
\`\`\`java
class Car {
    void start() {
        // 100 lines of internal logic
    }
}
\`\`\`
The user only needs:
car.start();
They don't need to know every internal step.
So:
Complex Implementation ↓ Hide ↓ Simple Interface ↓ User Benefits
- Reduces complexity ● Hides implementation details ● Provides a clear structure ● Makes code easier to maintain ● Supports loose coupling when used with interfaces

📄 Page 3 — Abstract Class ⭐⭐⭐
A class declared with the keyword:
abstract is called an abstract class .
📝 **Example**
> 
abstract

\`\`\`java
class Animal {
    abstract void sound();
    void eat() {
        System.out.println("Animal is eating");
    }
}
\`\`\`
Here:
Animal ↓ Abstract Class ↓ sound() → abstract method eat() → concrete method An abstract class can contain both:
Abstract methods + Concrete methods
📄 Page 4 — Abstract Method ⭐⭐⭐
An abstract method is declared without a method body.
Syntax:
abstract void sound();
Notice:
No { } No implementation Example:
abstract

\`\`\`java
class Animal {
    abstract void sound();
}
\`\`\`
The subclass must provide an implementation.
\`\`\`java
class Dog extends Animal {
    @Override void sound() {
        System.out.println("Dog barks");
    }
}
\`\`\`
Flow:
\`\`\`java
Animal abstract class ↓ abstract sound() ↓ extends ↓ Dog ↓
\`\`\`
implements sound()
📄 Page 5 — Abstract Class with Concrete Method ⭐⭐⭐

An abstract class can contain normal methods too.
abstract

\`\`\`java
class Animal {
    abstract void sound();
    void eat() {
        System.out.println("Eating");
    }
}
\`\`\`
Child:
\`\`\`java
class Dog extends Animal {
    @Override void sound() {
        System.out.println("Dog barks");
    }
}
\`\`\`
Use:
Dog d = new Dog(); d.sound(); d.eat();
Output:
Dog barks Eating So:
\`\`\`java
Abstract class ↓ ┌────┴────┐ ↓ ↓ Abstract Concrete method method ↓ ↓ Child Already implements implemented
\`\`\`
📄 Page 6 — Cannot Create Object of Abstract Class ⭐⭐⭐

You cannot directly create an object of an abstract class.
❌ Invalid:
abstract

\`\`\`java
class Animal {
}
Animal a = new Animal();
\`\`\`
This gives a compilation error.
But:
\`\`\`java
class Dog extends Animal {
}
Animal a = new Dog();
\`\`\`
is valid.
Flow:
\`\`\`java
abstract Animal ↓ Cannot instantiate directly ❌ Dog extends Animal ↓ Dog object ✅ This is because an abstract class can represent an incomplete abstraction.
\`\`\`

📄 Page 7 — Complete Abstract Class Example abstract

\`\`\`java
class Shape {
    abstract void area();
    void display() {
        System.out.println("This is a shape");
    }
}
\`\`\`
Child class:
\`\`\`java
class Circle extends Shape {
    double radius = 5;
    @Override void area() {
        double result = Math.PI * radius * radius;
        System.out.println( "Area = " + result );
    }
}
\`\`\`
Main:
\`\`\`java
class Main {
    public static void main(String[] args) {
        Circle c = new Circle();
        c.display();
        c.area();
    }
}
\`\`\`
Flow:
Shape ↓ abstract area() ↓ Circle ↓ area() implementation ↓ Object
📄 Page 8 — Abstract Class Constructors ⭐⭐⭐

An abstract class can have a constructor.
📝 **Example**
> 
abstract

\`\`\`java
class Animal {
    Animal() {
        System.out.println( "Animal constructor" );
    }
    abstract void sound();
}
\`\`\`
Child:
\`\`\`java
class Dog extends Animal {
    Dog() {
        System.out.println( "Dog constructor" );
    }
    @Override void sound() {
        System.out.println("Bark");
    }
}
\`\`\`
Create:
Dog d = new Dog();
Output:
Animal constructor Dog constructor Remember:
Abstract class → Cannot directly create object But: Its constructor can run during child-object creation.
📄 Page 9 — Abstract Class vs Normal Class ⭐⭐⭐

Normal Class Abstract Class Can be instantiated Cannot be instantiated directly Can contain concrete methods Can contain concrete methods Can contain fields Can contain fields Can have constructors Can have constructors Cannot require subclasses to implement an abstract method Can contain abstract methods Can be extended Can be extended Abstract method rule If a class contains an abstract method:
abstract void display();
then the class itself must be declared:
abstract

\`\`\`java
class Demo {
}
\`\`\`
📄 Page 10 — Abstraction vs Encapsulation + Revision These two concepts are often confused.
`,
  17: `
Module 17 — Interfaces Module Flow INTERFACE ↓
What is Interface?
↓
interface ↓
implements ↓
Abstract Methods ↓
Multiple Interfaces ↓
default / static methods ↓
Interface Variables ↓
Interface vs Abstract Class ↓
Practice

📄 Page 1 — What is an Interface?
An interface is a reference type used to define a contract that implementing classes must follow.

It is useful when we want to specify what a class should do without tying the contract to one particular implementation.

📝 **Example**
> 
\`\`\`java
interface Animal {
\`\`\`

void sound();
}
Here:
Animal ↓
Interface ↓
Contract ↓
\`\`\`java
sound() must be provided A class implements an interface using:
\`\`\`
implements Example:
\`\`\`java
class Dog implements Animal {
    @Override
\`\`\`
public void sound() {
\`\`\`java
System.out.println("Dog barks");
\`\`\`
}
}

📄 Page 2 — interface and implements ⭐⭐⭐
Interface declaration
\`\`\`java
interface Vehicle {
\`\`\`

void start();
}
Implementing class
\`\`\`java
class Car implements Vehicle {
    @Override
\`\`\`
public void start() {
\`\`\`java
System.out.println("Car starts");
\`\`\`
}
}
Create object:
Car c = new Car();

c.start();
Output:
Car starts Flow Vehicle Interface ↓
start()
↓
implements ↓
Car ↓
implements start()
↓
Object

📄 Page 3 — Interface Methods ⭐⭐⭐
An interface can declare abstract methods.
📝 **Example**
> 
\`\`\`java
interface Payment {
\`\`\`

void pay();
}
The implementing class provides the method body:
\`\`\`java
class UPI implements Payment {
    @Override
\`\`\`
public void pay() {
\`\`\`java
System.out.println("Payment through UPI");
\`\`\`
}
}
Important A method declared in an interface without a body is implicitly:
public abstract So:
\`\`\`java
interface Payment {
\`\`\`

void pay();
}
is conceptually equivalent to:
\`\`\`java
interface Payment {
\`\`\`

public abstract void pay();
}
Therefore, the implementation in the class must be public.

📄 Page 4 — Multiple Interfaces ⭐⭐⭐
A Java class can implement multiple interfaces .
This is one important way Java supports multiple inheritance of type.
📝 **Example**
> 
\`\`\`java
interface Camera {
\`\`\`

void takePhoto();
}
\`\`\`java
interface MusicPlayer {
\`\`\`

void playMusic();
}
A class can implement both:
\`\`\`java
class Smartphone implements Camera, MusicPlayer {
    @Override
\`\`\`
public void takePhoto() {
\`\`\`java
System.out.println("Taking photo");
\`\`\`
}

@Override
public void playMusic() {
\`\`\`java
System.out.println("Playing music");
\`\`\`
}
}
Use:
Smartphone phone = new Smartphone();

phone.takePhoto();
phone.playMusic();
Flow:
Camera MusicPlayer \\ / \\ / \\ / Smartphone

📄 Page 5 — Interface Variables ⭐⭐⭐
Fields declared in an interface are implicitly:
public static final Example:
\`\`\`java
interface Constants {
    int MAX_USERS = 100;
\`\`\`
}
Conceptually:
public static final int MAX_USERS = 100;
Access:
\`\`\`java
System.out.println(Constants.MAX_USERS);
\`\`\`
Output:
100 Because the field is final, you cannot reassign it:
// Constants.MAX_USERS = 200; // ❌ Easy memory Interface variable ↓
public static final

📄 Page 6 — Default Methods ⭐⭐⭐
Since Java 8, interfaces can contain default methods with implementations.
📝 **Example**
> 
\`\`\`java
interface Vehicle {
\`\`\`

void start();

default void stop() {

\`\`\`java
System.out.println("Vehicle stops");
\`\`\`
}
}
Implementing class:
\`\`\`java
class Car implements Vehicle {
    @Override
\`\`\`
public void start() {

\`\`\`java
System.out.println("Car starts");
\`\`\`
}
}
Now:
Car c = new Car();

c.start();
c.stop();
Output:
Car starts Vehicle stops The class automatically gets the default implementation unless it overrides it.

📄 Page 7 — Static Methods in Interfaces Interfaces can also contain static methods with implementations.
📝 **Example**
> 
\`\`\`java
interface Calculator {
\`\`\`

static int square(int n) { return n * n;
}
}
Call it using the interface name:
int result = Calculator.square(5);

\`\`\`java
System.out.println(result);
\`\`\`
Output:
25 Important Interface static methods are called using:
InterfaceName.methodName();
They are not inherited as instance methods by implementing classes.

📄 Page 8 — Interface as a Reference ⭐⭐⭐

An interface can be used as a reference type.
📝 **Example**
> 
\`\`\`java
interface Animal {
\`\`\`

void sound();
}
\`\`\`java
class Dog implements Animal {
    @Override
\`\`\`
public void sound() {

\`\`\`java
System.out.println("Dog barks");
\`\`\`
}
}
Now:
Animal a = new Dog();

a.sound();
Output:
Dog barks This demonstrates runtime polymorphism using an interface reference .
Flow:
Animal reference ↓
Dog object ↓
a.sound()
↓
Dog implementation This is very important in real-world Java development.

📄 Page 9 — Interface vs Abstract Class ⭐⭐⭐

\`\`\`java
Interface Abstract Class Declared using interface Declared using abstract class Class uses implements Class uses extends A class can implement multiple interfaces A class can extend only one class Fields are public static final by default Fields can have different modifiers Can have abstract methods Can have abstract methods Can have default/static methods Can have normal/static methods No instance constructors Can have constructors Good for contracts/capabilities Good for shared base state/behavior Easy memory Interface ↓
\`\`\`
Contract / Capability Abstract Class ↓
Common base + shared implementation

📄 Page 10 — Complete Example + Revision Payment System
\`\`\`java
interface Payment {
\`\`\`

void pay(double amount);

default void receipt() {

\`\`\`java
System.out.println("Receipt generated");
\`\`\`
}
}
UPI
\`\`\`java
class UPI implements Payment {
    @Override
\`\`\`
public void pay(double amount) {

\`\`\`java
System.out.println( "Paid ₹" + amount + " using UPI" );
\`\`\`
}
}
Card
\`\`\`java
class Card implements Payment {
    @Override
\`\`\`
public void pay(double amount) {

\`\`\`java
System.out.println( "Paid ₹" + amount + " using Card" );
\`\`\`
}
}
Main
\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    Payment p1 = new UPI();
\`\`\`
Payment p2 = new Card();

p1.pay(500);
p1.receipt();

p2.pay(1000);
p2.receipt();
}
}
Output:
Paid ₹500.0 using UPI Receipt generated Paid ₹1000.0 using Card Receipt generated Flow Payment Interface ↓
┌─────┴─────┐ ↓ ↓
UPI Card ↓ ↓
pay() pay()
`,
  18: `
↓
hashCode()
↓
Hash-based collections Module 20 — Java Collections Framework: Basics Module Flow COLLECTIONS ↓
Why Collections?
↓
Collection vs Array ↓
List / Set / Map ↓
ArrayList ↓
LinkedList ↓
HashSet ↓
HashMap ↓
Iteration ↓
Practice

📄 Page 1 — What is a Collection?
A collection is an object that is used to store and manage a group of elements.
📝 **Example**
> 
Students ↓
Student 1 Student 2 Student 3 Student 4 Instead of manually managing many variables:
String s1 = "A";
String s2 = "B";
String s3 = "C";
we can use:
ArrayList<String> students = new ArrayList<>();
Then:
students.add("A");
students.add("B");
students.add("C");
Main idea Multiple elements ↓
Collection ↓
Easy management

📄 Page 2 — Array vs Collection ⭐⭐⭐
We already learned arrays.
int[] numbers = new int[5];
Arrays have a fixed length .
Collections are generally more flexible and provide ready-made operations.
Comparison Array Collection Usually fixed size Many collections can grow/shrink Can store primitives directly Store objects/reference types Basic operations Rich APIs Simpler More flexible length Methods such as size()
📝 **Example**
> 
int[] a = new int[5];
versus:
ArrayList<Integer> list = new ArrayList<>();

📄 Page 3 — Collection Framework Structure ⭐⭐⭐

A simplified view:
Java Collections ↓
┌────────────┼────────────┐ ↓ ↓ ↓
List Set Queue ↓ ↓
ArrayList HashSet LinkedList TreeSet Map ↓
HashMap Important Map is part of the Java Collections Framework, but it is not a subtype of Collection.
For our course, focus on:
List Set Map

📄 Page 4 — List ⭐⭐⭐
A List:
- Maintains element order. ● Allows duplicate elements. ● Supports index-based access.
📝 **Example**
> 
List<String> names = new ArrayList<>();

names.add("Prasanna");
names.add("Rahul");
names.add("Prasanna");
Contents:
Prasanna Rahul Prasanna Duplicates are allowed.
Access:
\`\`\`java
System.out.println(names.get(0));
\`\`\`
Output:
Prasanna List flow List ↓
Ordered ↓
Duplicates allowed ↓
Index available

📄 Page 5 — ArrayList ⭐⭐⭐
ArrayList is one of the most commonly used List implementations.
Import:
\`\`\`java
import java.util.ArrayList;
\`\`\`
Create:
ArrayList<String> names = new ArrayList<>();
Add:
names.add("Prasanna");
names.add("Rahul");
names.add("Anjali");
Print:
\`\`\`java
System.out.println(names);
\`\`\`
Output:
[Prasanna, Rahul, Anjali]
Common methods names.add("Kiran");
names.get(0);
names.set(1, "Arjun");
names.remove(2);
names.size();
names.contains("Prasanna");
Flow:
ArrayList ↓
add()
↓
get()
↓
set()
↓
remove()
↓
contains()
↓
size()

📄 Page 6 — Iterating ArrayList Normal for loop ArrayList<String> names = new ArrayList<>();

names.add("A");
names.add("B");
names.add("C");

for (int i = 0; i < names.size(); i++) {

\`\`\`java
System.out.println(names.get(i));
\`\`\`
}
Output:
A B C Enhanced for loop for (String name : names) {

\`\`\`java
System.out.println(name);
\`\`\`
}
size() vs length For arrays:
array.length For collections such as ArrayList:
list.size()
⭐ Remember this carefully.

📄 Page 7 — LinkedList LinkedList is another implementation of List.
\`\`\`java
import java.util.LinkedList;
\`\`\`
📝 **Example**
> 
LinkedList<String> names = new LinkedList<>();

names.add("A");
names.add("B");
names.add("C");
It supports methods such as:
names.addFirst("Start");
names.addLast("End");

names.removeFirst();
names.removeLast();
📝 **Example**
> 
\`\`\`java
System.out.println(names);
\`\`\`
ArrayList vs LinkedList ArrayList LinkedList Backed by dynamic array Doubly-linked structure Fast random access generally Random access generally slower Good general-purpose list Useful when frequent insertions/removals occur at appropriate positions get(index) is efficient get(index) requires traversal Don't choose based only on "insertion is fast"; actual performance depends on where the insertion/removal occurs and how the list is used.

📄 Page 8 — Set ⭐⭐⭐
A Set is a collection that does not allow duplicate elements .
📝 **Example**
> 
\`\`\`java
import java.util.HashSet;
\`\`\`

HashSet<Integer> numbers = new HashSet<>();

numbers.add(10);
numbers.add(20);
numbers.add(10);
numbers.add(30);
Print:
\`\`\`java
System.out.println(numbers);
\`\`\`
The duplicate 10 is not stored twice.
Conceptually:
Input:
10 20 10 30 Set:
10 20 30 Important HashSet does not guarantee insertion order.
If you need sorted order, TreeSet is one option.
If you need insertion order, LinkedHashSet is one option.

📄 Page 9 — Map & HashMap ⭐⭐⭐
A Map stores key-value pairs .
📝 **Example**
> 
Roll Number → Student Name
101 → Prasanna
102 → Rahul
103 → Anjali Create:
\`\`\`java
import java.util.HashMap;
\`\`\`

HashMap<Integer, String> students = new HashMap<>();
Add:
students.put(101, "Prasanna");
students.put(102, "Rahul");
students.put(103, "Anjali");
Get:
\`\`\`java
System.out.println( students.get(101)
\`\`\`
);
Output:
Prasanna Common methods put()
get()
remove()
containsKey()
containsValue()
size()
Important Keys in a Map are unique.
students.put(101, "Prasanna");
students.put(101, "Rahul");
The second put() replaces the value associated with key 101.

📄 Page 10 — Complete Example + Revision Student Marks using HashMap
\`\`\`java
import java.util.HashMap;
\`\`\`

\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    HashMap<String, Integer> marks = new HashMap<>();
\`\`\`

marks.put("Prasanna", 90);
marks.put("Rahul", 85);
marks.put("Anjali", 95);

\`\`\`java
System.out.println( marks.get("Prasanna")
\`\`\`
);

\`\`\`java
System.out.println( marks.containsKey("Rahul")
\`\`\`
);

\`\`\`java
System.out.println( marks.size()
\`\`\`
);
}
}
Output:
90 true 3 Module 21 — Collections Deep Dive Module Flow COLLECTIONS ↓
Iteration ↓
┌────────┴────────┐ ↓ ↓
Iterator ListIterator ↓ ↓
Collection List ↓
Sort ↓
┌───────┴────────┐ ↓ ↓
Comparable Comparator ↓ ↓
Natural Order Custom Order └───────┬────────┘ ↓
Sorting Objects ↓
Practice

📄 Page 1 — Iteration Iteration means going through collection elements one by one.
📝 **Example**
> 
ArrayList<String> names = new ArrayList<>();

names.add("Prasanna");
names.add("Rahul");
names.add("Anjali"); We can iterate using:
for loop enhanced for loop Iterator ListIterator Simple flow:
Collection ↓
First element ↓
Next element ↓
Next element ↓
End

📄 Page 2 — Iterator ⭐⭐⭐ Iterator is used to traverse elements of a collection.
📝 **Example**
> 
\`\`\`java
import java.util.ArrayList;
\`\`\`
\`\`\`java
import java.util.Iterator;
\`\`\`

\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    ArrayList<String> names = new ArrayList<>();
\`\`\`

names.add("Prasanna");
names.add("Rahul");
names.add("Anjali");

Iterator<String> it = names.iterator();

while (it.hasNext()) {

\`\`\`java
System.out.println(it.next());
\`\`\`
}
}
} Output:
Prasanna Rahul Anjali Important methods hasNext()
↓
Checks whether another element exists next()
↓
Returns next element remove()
↓
Removes current element through iterator

📄 Page 3 — Iterator Flow iterator()
↓
Iterator ↓
hasNext()
/ \\ YES NO ↓ ↓
next() END ↓
Process ↓
hasNext() Example:
while (it.hasNext()) { String name = it.next();

\`\`\`java
System.out.println(name);
\`\`\`
}
Why use Iterator?
It provides a standard way to traverse many collection types.
It is also useful when you need to safely remove elements during iteration:

it.remove();

📄 Page 4 — ListIterator ⭐⭐⭐ ListIterator is specifically for List implementations.
It can move:
Forward Backward Example:
\`\`\`java
import java.util.ArrayList;
\`\`\`
\`\`\`java
import java.util.ListIterator;
\`\`\`

\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    ArrayList<String> names = new ArrayList<>();
\`\`\`

names.add("A");
names.add("B");
names.add("C");

ListIterator<String> it = names.listIterator();

while (it.hasNext()) {
\`\`\`java
System.out.println(it.next());
\`\`\`
}
}
}
Output:
A B C Now move backward:
while (it.hasPrevious()) {

\`\`\`java
System.out.println(it.previous());
\`\`\`
} Output:
C B A

📄 Page 5 — Iterator vs ListIterator ⭐⭐⭐

Iterator ListIterator Works with collections generally Works with List Forward traversal Forward + backward hasNext() hasNext()
next() next()
remove() remove()
No add() Supports add()
No set() Supports set()
Easy memory:
Iterator ↓
Forward ListIterator ↓
Forward + Backward

📄 Page 6 — Comparable ⭐⭐⭐
Comparable is used when a class defines its natural ordering .
It is in:
java.lang The main method is:
compareTo() Example:
\`\`\`java
class Student implements Comparable<Student> {
    int marks;
\`\`\`

Student(int marks) { this.marks = marks;
}

@Override
public int compareTo(Student other) { return this.marks - other.marks;
}
} Now students can be sorted according to their marks.

Basic idea Student ↓
implements Comparable ↓
compareTo()
↓
Natural ordering

📄 Page 7 — Sorting with Comparable Example:
\`\`\`java
import java.util.ArrayList;
\`\`\`
\`\`\`java
import java.util.Collections;
\`\`\`

\`\`\`java
class Student implements Comparable<Student> {
    int marks;
\`\`\`

Student(int marks) { this.marks = marks;
}

@Override
public int compareTo(Student other) { return Integer.compare( this.marks, other.marks );
}

@Override
public String toString() { return String.valueOf(marks);
}
} Main:
\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    ArrayList<Student> list = new ArrayList<>();
\`\`\`

list.add(new Student(80));
list.add(new Student(60));
list.add(new Student(90));

Collections.sort(list);

\`\`\`java
System.out.println(list);
\`\`\`
}
} Output:
[60, 80, 90]

📄 Page 8 — Comparator ⭐⭐⭐ Comparator is used when we want to define a custom ordering separately from the class.
📝 **Example**
> 
\`\`\`java
import java.util.Comparator;
\`\`\`

Comparator<Student> descendingMarks = new Comparator<Student>() { @Override
public int compare( Student s1, Student s2) { return Integer.compare( s2.marks, s1.marks );
}
}; Then:
Collections.sort( list, descendingMarks ); Output:
[90, 80, 60]
Modern lambda style list.sort( (s1, s2) -> Integer.compare(s2.marks, s1.marks)
);

📄 Page 9 — Comparable vs Comparator ⭐⭐⭐

Comparable Comparator Natural ordering Custom ordering Implemented by the class Usually separate from class Uses compareTo()
Uses compare()
One main natural ordering Can define multiple orderings Collections.sort(list)
Collections.sort(list, comparator)
Easy memory Comparable ↓
Class decides natural order Comparator ↓
External/custom sorting rule Example:
Student ↓
Natural order → marks Custom order:
↓
name ↓
marks descending ↓
age

📄 Page 10 — Complete Object Sorting Example

\`\`\`java
import java.util.ArrayList;
\`\`\`
\`\`\`java
import java.util.Comparator;
\`\`\`

\`\`\`java
class Student {
    String name;
\`\`\`
int marks;

Student(String name, int marks) { this.name = name;
this.marks = marks;
}

@Override
public String toString() { return name + " - " + marks;
}
}

\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    ArrayList<Student> students = new ArrayList<>();
\`\`\`

students.add( new Student("Prasanna", 90)
);

students.add( new Student("Rahul", 75)
);

students.add( new Student("Anjali", 85)
);

students.sort( Comparator.comparingInt( s -> s.marks )
);

\`\`\`java
System.out.println(students);
\`\`\`
}
} Output:
[Rahul - 75, Anjali - 85, Prasanna - 90]
Sort by descending marks
`,
  19: `
students.sort( Comparator.comparingInt( (Student s) -> s.marks ).reversed()
); Output:
[Prasanna - 90, Anjali - 85, Rahul - 75]
Module 22 — Generics in Java Module Flow GENERICS ↓
Why Generics?
↓
Type Safety ↓
Generic Classes ↓
Generic Methods ↓
Multiple Type Parameters ↓
Bounded Generics ↓
Wildcards (?, extends)
↓
Collections + Generics ↓
Practice

📄 Page 1 — What are Generics?
Generics allow us to write classes, interfaces, and methods that work with different types while providing compile-time type safety .
Example without generics:
ArrayList list = new ArrayList();

list.add("Prasanna");
list.add(100); Different types can accidentally be stored. With generics:
ArrayList<String> list = new ArrayList<>();
Now the list is intended to contain only String objects.

Generic ↓
Specify Type ↓
Compile-time checking ↓
Safer code

📄 Page 2 — Why Generics? ⭐⭐⭐
Consider:
ArrayList list = new ArrayList();

list.add("Hello");

String name = (String) list.get(0);
Without generics, explicit casting may be required. With generics:
ArrayList<String> list = new ArrayList<>();

list.add("Hello");

String name = list.get(0); No explicit cast is needed.
Main benefits Generics ↓
Type Safety ↓
Less Casting ↓
Reusable Code ↓
Better Compile-time Checking

📄 Page 3 — Generic Collection Example ⭐⭐⭐

We already used:
ArrayList<String> names = new ArrayList<>(); Here:
ArrayList ↓
Generic class ↓
<String> ↓
Type argument Similarly:
ArrayList<Integer> marks = new ArrayList<>();

ArrayList<Double> prices = new ArrayList<>();
Example ArrayList<Integer> numbers = new ArrayList<>();

numbers.add(10);
numbers.add(20);
numbers.add(30); This is valid. But:
// numbers.add("Hello"); // ❌ causes a compile-time error.

📄 Page 4 — Generic Class ⭐⭐⭐
We can create our own generic class. Syntax:
\`\`\`java
class Box<T> {
    T value;
\`\`\`

void set(T value) { this.value = value;
}

T get() { return value;
}
} Here:
T ↓
Type parameter Use it:
Box<String> box1 = new Box<>();

box1.set("Hello");

\`\`\`java
System.out.println(box1.get());
Output:
\`\`\`
Hello Another type:
Box<Integer> box2 = new Box<>();

box2.set(100);

\`\`\`java
System.out.println(box2.get());
Output:
\`\`\`
100

📄 Page 5 — Generic Class Flow Box<T> ↓
Type Parameter ↓
┌──────────┴──────────┐ ↓ ↓
Box<String> Box<Integer> ↓ ↓
String Integer ↓ ↓
"Hello" 100 The same class can work with different types.
Complete example
\`\`\`java
class Box<T> {
    private T value;
\`\`\`

Box(T value) { this.value = value;
}

T getValue() { return value;
}
} Use:
Box<String> b1 = new Box<>("Java");

Box<Integer> b2 = new Box<>(100);

📄 Page 6 — Generic Method ⭐⭐⭐
A method can also have its own type parameter. Example:
\`\`\`java
class Demo {
\`\`\`

public static <T> void display(T value) {

\`\`\`java
System.out.println(value);
\`\`\`
}
} Use:
Demo.display("Hello");

Demo.display(100);

Demo.display(10.5); Output:
Hello 100
10.5 Syntax <T> void display(T value) Here:
<T> ↓
Type parameter T value ↓
Parameter of that type

📄 Page 7 — Multiple Type Parameters A generic class can have more than one type parameter.
📝 **Example**
> 
\`\`\`java
class Pair<K, V> {
    K key;
\`\`\`
V value;

Pair(K key, V value) { this.key = key;
this.value = value;
}

void display() {

\`\`\`java
System.out.println( key + " : " + value );
\`\`\`
}
} Use:
Pair<Integer, String> student = new Pair<>(101, "Prasanna");

student.display(); Output:
101 : Prasanna Flow:
Pair<K,V> ↓
┌───────────────┐ │ K → Key │ │ V → Value │ └───────────────┘ This idea is closely related to:
HashMap<Integer, String>

📄 Page 8 — Bounded Generics ⭐⭐⭐
Sometimes we don't want to allow every type. We can restrict a type using:
extends Example:
\`\`\`java
class NumberBox<T extends Number> {
    T value;
\`\`\`

NumberBox(T value) { this.value = value;
}

double getDoubleValue() { return value.doubleValue();
}
} Now:
NumberBox<Integer> b1 = new NumberBox<>(100);

NumberBox<Double> b2 = new NumberBox<>(10.5); Both work because:
Integer ↓
Number Double ↓
Number But:
// NumberBox<String> b = // new NumberBox<>("Hello"); // ❌ because String is not a subclass of Number.

📄 Page 9 — Wildcards ⭐⭐⭐
A wildcard is represented by:
? Example:
List<?> list;
It means a list of some type , but the exact type is unknown.
📝 **Example**
> 
public static void display( List<?> list) { for (Object item : list) {
\`\`\`java
System.out.println(item);
\`\`\`
}
} This method can accept:
List<String> List<Integer> List<Double> ? extends List<? extends Number> means a list whose element type is Number or a subtype of Number.
Examples:
List<Integer> ✅ List<Double> ✅ List<Float> ✅ But:
List<String> ❌

📄 Page 10 — Complete Example + Revision

\`\`\`java
import java.util.ArrayList;
\`\`\`

\`\`\`java
class Box<T> {
    private T value;
\`\`\`

Box(T value) { this.value = value;
}

public T getValue() { return value;
}
}

\`\`\`java
class Main {
\`\`\`

public static <T> void display(T value) {

\`\`\`java
System.out.println(value);
\`\`\`
}

\`\`\`java
public static void main(String[] args) {
    Box<String> name = new Box<>("Prasanna");
\`\`\`

Box<Integer> marks = new Box<>(90);

\`\`\`java
System.out.println( name.getValue()
\`\`\`
);

\`\`\`java
System.out.println( marks.getValue()
\`\`\`
);

display("Java");
display(100);
}
} Output:
Prasanna 90
`,
  20: `
throw AgeException ↓
catch ↓
Handle

📄 Page 10 — Try-with-Resources + Revision For resources such as files, Java provides try-with-resources .
📝 **Example**
> 
\`\`\`java
import java.io.BufferedReader;
\`\`\`
\`\`\`java
import java.io.FileReader;
\`\`\`
\`\`\`java
import java.io.IOException;
\`\`\`

\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    try ( BufferedReader br = new BufferedReader( new FileReader("data.txt")
\`\`\`
)
) {

\`\`\`java
System.out.println(br.readLine());
\`\`\`

}
catch (IOException e) {

\`\`\`java
System.out.println( "File error: " + e.getMessage()
\`\`\`
);
}
}
} The resource is automatically closed after the try-with-resources statement finishes.

Flow Open Resource ↓
try-with-resources ↓
`,
  21: `
↓
Different objects ↓
Different behavior Abstraction Hide implementation ↓
Expose required behavior Interface Contract ↓
implements ↓
Different implementations Module 19 — Object Class, toString(), equals() & hashCode()
Module Flow OBJECT CLASS ↓
Every Class inherits ↓
toString()
↓
equals()
↓
hashCode()
↓
== vs equals()
↓
Object Comparison ↓
Method Overriding ↓
Practical Example

📄 Page 1 — What is Object Class?
In Java, Object is the root class of the class hierarchy .
\`\`\`java
If a class does not explicitly extend another class, it implicitly extends Object.
\`\`\`
📝 **Example**
> 
\`\`\`java
class Student {
\`\`\`
}
Conceptually:
\`\`\`java
class Student extends Object {
\`\`\`
}
Flow:
Object ↓
Student ↓
s1 object This means every ordinary Java class inherits methods from Object.
Some important methods include:
toString()
equals()
hashCode()
getClass()

📄 Page 2 — toString() Method ⭐⭐⭐

toString() returns a String representation of an object.
📝 **Example**
> 
\`\`\`java
class Student {
    String name;
\`\`\`
int age;
}
Student s = new Student();

\`\`\`java
System.out.println(s.toString());
\`\`\`
If you don't override toString(), the inherited implementation from Object is used, which typically produces a class-name/hash-style representation.

Instead, we can override it.
@Override
public String toString() { return "Student{name='" + name + "', age=" + age + "}";
}
Now:
\`\`\`java
System.out.println(s);
\`\`\`
automatically invokes toString().

📄 Page 3 — Why Override toString()?
Without overriding:
Student@someHashValue This isn't very useful to a human.
With overriding:
Student{name='Prasanna', age=20}
Complete example
\`\`\`java
class Student {
    String name;
\`\`\`
int age;

Student(String name, int age) { this.name = name;
this.age = age;
}

@Override
public String toString() { return "Name: " + name + ", Age: " + age;
}
}
Use:
Student s = new Student("Prasanna", 20);

\`\`\`java
System.out.println(s);
\`\`\`
Output:
Name: Prasanna, Age: 20 Flow:
\`\`\`java
System.out.println(s)
\`\`\`
↓
toString()
↓
String result ↓
Display

📄 Page 4 — == vs equals() ⭐⭐⭐
This is a very important interview topic.
For objects:
== generally compares whether two references refer to the same object .
📝 **Example**
> 
Student s1 = new Student("A", 20);
Student s2 = new Student("A", 20);

\`\`\`java
System.out.println(s1 == s2);
\`\`\`
Output:
false Because:
s1 → Object 1 s2 → Object 2 They are different objects.

📄 Page 5 — equals() Method equals() is used for logical/content equality , provided the class implements the desired equality logic.

If you don't override it, Object.equals() behaves essentially like reference equality.
📝 **Example**
> 
\`\`\`java
class Student {
    String name;
\`\`\`
int age;

Student(String name, int age) { this.name = name;
this.age = age;
}

@Override
public boolean equals(Object obj) { if (this == obj) { return true;
}

if (!(obj instanceof Student)) { return false;
}

Student other = (Student) obj;

return age == other.age && name.equals(other.name);
}
}
Now:
Student s1 = new Student("A", 20);
Student s2 = new Student("A", 20);

\`\`\`java
System.out.println(s1.equals(s2));
\`\`\`
Output:
true Because their logical data is equal.

📄 Page 6 — hashCode() ⭐⭐⭐
hashCode() returns an integer hash value representing the object.
📝 **Example**
> 
@Override
public int hashCode() { return name.hashCode() + age;
}
Important relationship If two objects are considered equal according to equals(), they must have the same hashCode().
equals() == true ↓
hashCode() must be same But:
same hashCode()
↓
Does NOT guarantee equals() == true Two unequal objects can have the same hash code. This is called a hash collision .

📄 Page 7 — equals() + hashCode()
Together ⭐⭐⭐

Best practice is to override both together when defining logical equality.
📝 **Example**
> 
\`\`\`java
import java.util.Objects;
\`\`\`

\`\`\`java
class Student {
    String name;
\`\`\`
int age;

Student(String name, int age) { this.name = name;
this.age = age;
}

@Override
public boolean equals(Object obj) { if (this == obj) { return true;
}

if (!(obj instanceof Student)) { return false;
}

Student other = (Student) obj;

return age == other.age && Objects.equals(name, other.name);
}

@Override
public int hashCode() { return Objects.hash(name, age);
}
}
This is especially important when objects are used in:
HashSet HashMap HashMap keys We'll study Collections in more detail later.

📄 Page 8 — Complete Example
\`\`\`java
import java.util.Objects;
\`\`\`

\`\`\`java
class Student {
    private String name;
\`\`\`
private int age;

Student(String name, int age) { this.name = name;
this.age = age;
}

@Override
public String toString() { return "Student{name='" + name + "', age=" + age + "}";
}

@Override
public boolean equals(Object obj) { if (this == obj) { return true;
}

if (!(obj instanceof Student)) { return false;
}

Student other = (Student) obj;

return age == other.age && Objects.equals(name, other.name);
}

@Override
public int hashCode() { return Objects.hash(name, age);
}
}
Main:
\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    Student s1 = new Student("Prasanna", 20);
\`\`\`

Student s2 = new Student("Prasanna", 20);

\`\`\`java
System.out.println(s1);
\`\`\`

\`\`\`java
System.out.println(s1.equals(s2));
\`\`\`

\`\`\`java
System.out.println( s1.hashCode() == s2.hashCode()
\`\`\`
);
}
}
Output conceptually:
Student{name='Prasanna', age=20}
true true

📄 Page 9 — Important Object Methods Some useful methods inherited from Object:
Method Purpose toString()
String representation equals() Logical equality when overridden hashCode()
Hash value getClass()
Runtime class information clone() Supports cloning when properly implemented wait() Thread coordination notify() Thread coordination notifyAll()
Thread coordination For our beginner → intermediate course, focus mainly on:
toString()
equals()
hashCode()
getClass()

📄 Page 10 — Final Revision == For object references ↓
Same object/reference?
equals()
Logical equality ↓
Depends on implementation toString()
Object ↓
Readable String representation hashCode()
Object ↓
Integer hash value Relationship Object ↓
toString()
↓
Human-readable representation Object ↓
equals()
↓
Logical equality
`,
  22: `
# Module 22 — Java Coding Problems

This module compiles all the key programming problems and code examples covered throughout the course notes, complete with explanations, implementations, and expected outputs.

## 1. Basic Logical & Number Problems

### 1.1 Check Even or Odd Number
Checks whether a given integer is even or odd using the modulus \`%\` operator.
\`\`\`java
import java.util.Scanner;
class EvenOdd {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter number: ");
        int n = sc.nextInt();
        if (n % 2 == 0) {
            System.out.println("Even");
        } else {
            System.out.println("Odd");
        }
        sc.close();
    }
}
\`\`\`
**Output:**
\`\`\`text
Enter number: 7
Odd
\`\`\`

### 1.2 Find Largest of Two Numbers
Determines the maximum of two values passed into a method.
\`\`\`java
class Largest {
    static int findLargest(int a, int b) {
        if (a > b) {
            return a;
        }
        return b;
    }
    public static void main(String[] args) {
        int result = findLargest(25, 40);
        System.out.println("Largest = " + result);
    }
}
\`\`\`
**Output:**
\`\`\`text
Largest = 40
\`\`\`

### 1.3 Factorial Calculation (Recursion)
Calculates the factorial of a number using a recursive method signature.
\`\`\`java
class RecursionDemo {
    static int factorial(int n) {
        if (n == 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }
    public static void main(String[] args) {
        System.out.println(factorial(5));
    }
}
\`\`\`
**Output:**
\`\`\`text
120
\`\`\`

---

## 2. Array Manipulation & Algorithms

### 2.1 Array Input, Traversal & Printing
Demonstrates how to declare, size, fill, and print an array of elements dynamically.
\`\`\`java
import java.util.Scanner;
class ArrayInput {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter size: ");
        int n = sc.nextInt();
        int[] numbers = new int[n];
        System.out.println("Enter elements:");
        for (int i = 0; i < n; i++) {
            numbers[i] = sc.nextInt();
        }
        System.out.println("Elements:");
        for (int i = 0; i < n; i++) {
            System.out.println(numbers[i]);
        }
        sc.close();
    }
}
\`\`\`

### 2.2 Calculate Sum & Average of Array
Iterates through an array to calculate sum and double-casted average.
\`\`\`java
class ArrayStats {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40};
        int sum = 0;
        for (int i = 0; i < numbers.length; i++) {
            sum += numbers[i];
        }
        System.out.println("Sum = " + sum);
        double average = (double) sum / numbers.length;
        System.out.println("Average = " + average);
    }
}
\`\`\`
**Output:**
\`\`\`text
Sum = 100
Average = 25.0
\`\`\`

### 2.3 Search Element in Array (Linear Search)
Searches sequentially through the array indices for a matching target value.
\`\`\`java
class LinearSearch {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};
        int target = 30;
        boolean found = false;
        for (int i = 0; i < numbers.length; i++) {
            if (numbers[i] == target) {
                System.out.println("Found at index " + i);
                found = true;
                break;
            }
        }
        if (!found) {
            System.out.println("Element not found");
        }
    }
}
\`\`\`

### 2.4 Bubble Sort Implementation
Implements Bubble Sort to arrange elements in ascending order.
\`\`\`java
class BubbleSort {
    public static void main(String[] args) {
        int[] numbers = {40, 10, 30, 20};
        for (int i = 0; i < numbers.length - 1; i++) {
            for (int j = 0; j < numbers.length - 1 - i; j++) {
                if (numbers[j] > numbers[j + 1]) {
                    int temp = numbers[j];
                    numbers[j] = numbers[j + 1];
                    numbers[j + 1] = temp;
                }
            }
        }
        for (int n : numbers) {
            System.out.print(n + " ");
        }
    }
}
\`\`\`
**Output:**
\`\`\`text
10 20 30 40
\`\`\`

---

## 3. String Manipulation Problems

### 3.1 Check String Palindrome
Verifies whether a given String is a palindrome (reads the same backward as forward).
\`\`\`java
class PalindromeCheck {
    public static void main(String[] args) {
        String str = "madam";
        String rev = "";
        for (int i = str.length() - 1; i >= 0; i--) {
            rev += str.charAt(i);
        }
        if (str.equals(rev)) {
            System.out.println("Palindrome");
        } else {
            System.out.println("Not Palindrome");
        }
    }
}
\`\`\`
`,
  23: `
↓ ↓
UPI payment Card payment Module 18 — Encapsulation, Inheritance & Polymorphism Integration Ippativaraku manam individual OOP concepts nerchukunnam. Ippudu vatini kalipi oka complete program ela design cheyalo chuddam.

Module Flow OOP CONCEPTS ↓
┌───────────┼───────────┐ ↓ ↓ ↓
Encapsulation Inheritance Abstraction ↓ ↓ ↓
└───────────┼───────────┘ ↓
Polymorphism ↓
Interface ↓
Real-world Design ↓
Complete Program

📄 Page 1 — Why Combine OOP Concepts?

Real-world applications usually don't use only one OOP concept.
For example, a banking application may use:
Encapsulation ↓
Protect account data Inheritance ↓
Different account types Polymorphism ↓
Different implementations Abstraction ↓
Hide complex operations So our goal is:
Individual Concepts ↓
Combine Concepts ↓
Design Better Programs

📄 Page 2 — Encapsulation + Inheritance Parent class:
\`\`\`java
class Employee {
    private String name;
\`\`\`
private double salary;

Employee(String name, double salary) { this.name = name;
this.salary = salary;
}

public String getName() { return name;
}

public double getSalary() { return salary;
}
}
Here:
name salary ↓
private ↓
Encapsulation Child class:
\`\`\`java
class Manager extends Employee {
    Manager(String name, double salary) {
        super(name, salary);
\`\`\`
}

void display() {
\`\`\`java
System.out.println(getName());
\`\`\`
\`\`\`java
System.out.println(getSalary());
\`\`\`
}
}
Flow:
Employee ↓
private data ↓
getters ↓
Manager extends Employee The child doesn't directly access the parent's private fields. It uses accessible methods such as getters.

📄 Page 3 — Inheritance + Method Overriding Parent:
\`\`\`java
class Employee {
\`\`\`

void work() {
\`\`\`java
System.out.println("Employee works");
\`\`\`
}
}
Child:
\`\`\`java
class Developer extends Employee {
    @Override
\`\`\`
void work() {
\`\`\`java
System.out.println("Developer writes code");
\`\`\`
}
}
Another child:
\`\`\`java
class Tester extends Employee {
    @Override
\`\`\`
void work() {
\`\`\`java
System.out.println("Tester tests software");
\`\`\`
}
}
Hierarchy:
Employee ↓
┌─────────┴─────────┐ ↓ ↓
Developer Tester ↓ ↓
work() work()
Same method:
work()
Different behavior.

📄 Page 4 — Runtime Polymorphism ⭐⭐⭐

Now use parent references:
Employee e1 = new Developer();
Employee e2 = new Tester();

e1.work();
e2.work();
Output:
Developer writes code Tester tests software Flow:
Employee reference ↓
Developer object ↓
Developer.work()

Employee reference ↓
Tester object ↓
Tester.work()
This is runtime polymorphism .
The method implementation is selected based on the actual object.

📄 Page 5 — Abstraction + Inheritance We can use an abstract class as a common base.
abstract

\`\`\`java
class Employee {
    String name;
\`\`\`

Employee(String name) { this.name = name;
}

abstract void work();

void displayName() {
\`\`\`java
System.out.println("Name: " + name);
\`\`\`
}
}
Child:
\`\`\`java
class Developer extends Employee {
    Developer(String name) {
        super(name);
\`\`\`
}

@Override
void work() {
\`\`\`java
System.out.println("Writing code");
\`\`\`
}
}
Here:
Employee ↓
Abstract class ↓
Defines common structure ↓
Developer ↓
Provides specific implementation

📄 Page 6 — Interface + Polymorphism Interface:
\`\`\`java
interface Payment {
\`\`\`

void pay(double amount);
}
UPI:
\`\`\`java
class UPI implements Payment {
    @Override
\`\`\`
public void pay(double amount) {
\`\`\`java
System.out.println( "Paid using UPI: " + amount );
\`\`\`
}
}
Card:
\`\`\`java
class Card implements Payment {
    @Override
\`\`\`
public void pay(double amount) {
\`\`\`java
System.out.println( "Paid using Card: " + amount );
\`\`\`
}
}
Use interface references:
Payment p1 = new UPI();
Payment p2 = new Card();

p1.pay(500);
p2.pay(1000);
Flow:
Payment Interface ↓
┌─────────┴─────────┐ ↓ ↓
UPI Card ↓ ↓
pay() pay()

📄 Page 7 — Complete OOP Design Example ⭐⭐⭐

Let's build a small employee system.
abstract

\`\`\`java
class Employee {
    private String name;
\`\`\`
private double salary;

Employee(String name, double salary) { this.name = name;
this.salary = salary;
}

public String getName() { return name;
}

public double getSalary() { return salary;
}

abstract void work();
}
Developer:
\`\`\`java
class Developer extends Employee {
    Developer(String name, double salary) {
        super(name, salary);
\`\`\`
}

@Override
void work() {
\`\`\`java
System.out.println( getName() + " writes code" );
\`\`\`
}
}
Tester:
\`\`\`java
class Tester extends Employee {
    Tester(String name, double salary) {
        super(name, salary);
\`\`\`
}

@Override
void work() {
\`\`\`java
System.out.println( getName() + " tests software" );
\`\`\`
}
}

📄 Page 8 — Main Program
\`\`\`java
class Main {
\`\`\`

\`\`\`java
public static void main(String[] args) {
    Employee e1 = new Developer("Prasanna", 50000);
\`\`\`

Employee e2 = new Tester("Rahul", 45000);

e1.work();
e2.work();

\`\`\`java
System.out.println( e1.getSalary()
\`\`\`
);

\`\`\`java
System.out.println( e2.getSalary()
\`\`\`
);
}
}
Output:
Prasanna writes code Rahul tests software
50000.0
45000.0 Concepts used Employee ↓
Abstract class ↓
Encapsulation ↓
private fields ↓
Inheritance ↓
Developer / Tester ↓
Method overriding ↓
Runtime polymorphism

📄 Page 9 — OOP Design Thinking ⭐⭐⭐

When creating a real application, ask:
Step 1 — What are the objects?
📝 **Example**
> 
Employee Developer Tester Step 2 — What data do they have?
name salary Step 3 — What behavior do they have?
work()
Step 4 — What should be hidden?
salary Use:
private Step 5 — What is common?
Put common behavior/state in:
Parent class / abstract class Step 6 — What changes?
Use:
Method overriding Polymorphism

📄 Page 10 — Complete OOP Revision Encapsulation Data ↓
private ↓
Controlled access Inheritance Parent ↓
Child Polymorphism One reference
`,
  24: `
# Module 24 — Java & OOP Interview Questions This module compiles all the key interview preparation questions, conceptual differences, and output analysis questions from the PDF.

## Questions from Page 6 Module 24 — Java & OOP Interview Questions
- Beginner questions ● Intermediate questions ● OOP questions ● Frequently asked differences ● Output-based questions ● Coding interview questions Module 1 — Introduction to Java Module Goal ## Questions from Page 22

🎯 Module 1 Interview Questions 1. What is Java?
Java is a high-level, class-based, object-oriented programming language designed for portability across platforms through the JVM.

2. Who developed Java?
Java was developed at Sun Microsystems, with James Gosling leading the original team.
3. Why is Java platform independent?
Because Java source code is compiled into bytecode, which can run on different platform-specific JVM implementations.

4. What is JVM?
JVM is the Java Virtual Machine that executes Java bytecode.
5. What is JRE?
JRE provides the runtime environment needed to run Java applications.
6. What is JDK?
`,
};
