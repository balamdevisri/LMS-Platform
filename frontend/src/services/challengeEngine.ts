import { dbmsLessonsData } from '../data/dbmsLessonsData';

export interface Challenge {
  missionNum: string;
  challengeNum: string;
  title: string;
  learnText: string;
  exampleCode: string;
  challengeTask: string;
  type: 'multiple-choice' | 'code' | 'command' | 'ordering';
  options?: string[];
  correctAnswer: string | string[];
  hint: string;
  placeholder?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

interface MappedChallenge {
  keywords: string[];
  challenge: Omit<Challenge, 'missionNum' | 'challengeNum' | 'title'>;
}

const PythonChallenges: MappedChallenge[] = [
  {
    keywords: ['variable', 'declare', 'assign'],
    challenge: {
      learnText: "Variables are containers for storing data values. In Python, you create a variable by simply assigning a value to it using the `=` sign.",
      exampleCode: "x = 5\nname = \"Alice\"",
      challengeTask: "Write a line of Python code to declare a variable named `x` and assign it the value `10`.",
      type: 'code',
      correctAnswer: 'x = 10',
      hint: "Use variable name 'x', assignment operator '=', and value '10' (e.g. x = 10).",
      placeholder: "# Type your variable declaration here"
    }
  },
  {
    keywords: ['data type', 'type', 'float', 'integer', 'string'],
    challenge: {
      learnText: "Python has several built-in data types like integers (`int`), floating-point numbers (`float`), and strings (`str`). The `type()` function returns the type of any object.",
      exampleCode: "print(type(42))      # <class 'int'>\nprint(type(\"hello\")) # <class 'str'>",
      challengeTask: "Which built-in Python function returns the type of an object?",
      type: 'multiple-choice',
      options: ['typeof()', 'type()', 'class()', 'kindof()'],
      correctAnswer: 'type()',
      hint: "It is a short 4-letter function matching the name of the topic itself."
    }
  },
  {
    keywords: ['condition', 'if', 'else', 'elif'],
    challenge: {
      learnText: "Conditional statements in Python use `if`, `elif`, and `else` blocks. Python relies on indentation (whitespace at the start of a line) to define scope.",
      exampleCode: "if age >= 18:\n    print(\"Eligible\")",
      challengeTask: "Write a conditional `if` statement header in Python checking if a variable `age` is greater than or equal to `18` (include the trailing colon `:`).",
      type: 'code',
      correctAnswer: 'if age >= 18:',
      hint: "Structure: `if age >= 18:` (make sure to include the colon at the end).",
      placeholder: "# Write your conditional statement header"
    }
  },
  {
    keywords: ['loop', 'for', 'while', 'iterate'],
    challenge: {
      learnText: "A `for` loop in Python is used for iterating over a sequence. The `range()` function returns a sequence of numbers, starting from 0 by default.",
      exampleCode: "for i in range(3):\n    print(i)",
      challengeTask: "Write a `for` loop statement header in Python that iterates a variable `i` over a range of `5` numbers (using `range(5)`, include the trailing colon `:`).",
      type: 'code',
      correctAnswer: 'for i in range(5):',
      hint: "Remember to use: `for i in range(5):`",
      placeholder: "# Write your for loop header"
    }
  },
  {
    keywords: ['function', 'def', 'return'],
    challenge: {
      learnText: "In Python, a function is defined using the `def` keyword, followed by the function name and parentheses.",
      exampleCode: "def add_nums(a, b):\n    return a + b",
      challengeTask: "Write a function definition header in Python named `greet` that takes no arguments (include the trailing colon `:`).",
      type: 'code',
      correctAnswer: 'def greet():',
      hint: "Use the `def` keyword, then `greet()`, and end with a colon `:`.",
      placeholder: "# Write your function definition header"
    }
  },
  {
    keywords: ['class', 'oop'],
    challenge: {
      learnText: "Python is an object-oriented programming language. You define a class template using the `class` keyword followed by the class name.",
      exampleCode: "class Dog:\n    species = \"canine\"",
      challengeTask: "Write a class definition header in Python named `Person` (include the trailing colon `:`).",
      type: 'code',
      correctAnswer: 'class Person:',
      hint: "Format: `class Person:`",
      placeholder: "# Write your class definition"
    }
  },
  {
    keywords: ['object', 'instance', 'instantiate'],
    challenge: {
      learnText: "To create an instance (object) of a class, you call the class name as if it were a function.",
      exampleCode: "my_dog = Dog()",
      challengeTask: "Assuming a class named `Car` exists, instantiate it and assign it to a variable named `my_car`.",
      type: 'code',
      correctAnswer: 'my_car = Car()',
      hint: "Use: `my_car = Car()`",
      placeholder: "# Instantiate the Car class"
    }
  }
];

const JavaChallenges: MappedChallenge[] = [
  {
    keywords: ['class'],
    challenge: {
      learnText: "In Java, every line of executable code must be inside a class. Classes serve as blueprint templates for creating objects.",
      exampleCode: "public class Main {\n    // code here\n}",
      challengeTask: "Which keyword defines a class template in Java?",
      type: 'multiple-choice',
      options: ['struct', 'class', 'interface', 'object'],
      correctAnswer: 'class',
      hint: "It is the keyword used before class name (e.g. class MyClass)."
    }
  },
  {
    keywords: ['object', 'instance', 'instantiate'],
    challenge: {
      learnText: "An object is an instance of a class. You instantiate a class object using the `new` keyword.",
      exampleCode: "Person p = new Person();",
      challengeTask: "Which operator is used to instantiate a class object in Java?",
      type: 'multiple-choice',
      options: ['malloc', 'create', 'new', 'instantiate'],
      correctAnswer: 'new',
      hint: "e.g., `Car myCar = new Car();`"
    }
  },
  {
    keywords: ['constructor'],
    challenge: {
      learnText: "A constructor in Java is a block of code similar to a method that is called when an instance of an object is created. It must share the exact name of its class and has no return type.",
      exampleCode: "public class Person {\n    public Person() {\n        // Constructor\n    }\n}",
      challengeTask: "A constructor in Java must have the exact same name as its declaring class and cannot specify a return type. True or False?",
      type: 'multiple-choice',
      options: ['True', 'False'],
      correctAnswer: 'True',
      hint: "Constructors initialize state and are declared without standard types (not even void)."
    }
  },
  {
    keywords: ['inheritance', 'extend'],
    challenge: {
      learnText: "Inheritance allows one class to inherit the attributes and methods of another class. Java uses the `extends` keyword to achieve this.",
      exampleCode: "class Dog extends Animal {\n}",
      challengeTask: "Which keyword is used to inherit a class in Java?",
      type: 'multiple-choice',
      options: ['extends', 'implements', 'inherits', 'parent'],
      correctAnswer: 'extends',
      hint: "Think about expanding or extending the superclass capability."
    }
  },
  {
    keywords: ['polymorphism'],
    challenge: {
      learnText: "Polymorphism means 'many forms'. It occurs when classes are related through inheritance. Method overloading is compile-time polymorphism.",
      exampleCode: "void print(int x) { ... }\nvoid print(String s) { ... }",
      challengeTask: "Which of the following is an example of compile-time polymorphism in Java?",
      type: 'multiple-choice',
      options: ['Method Overriding', 'Method Overloading', 'Class Inheritance', 'Interface Implementation'],
      correctAnswer: 'Method Overloading',
      hint: "Decided at compile time based on parameter list differences in the same class."
    }
  },
  {
    keywords: ['encapsulation', 'access modifier', 'private', 'getter', 'setter'],
    challenge: {
      learnText: "Encapsulation ensures sensitive data is hidden from users. This is achieved by declaring class variables as `private` and exposing public getter/setter methods.",
      exampleCode: "private String name;\npublic String getName() { return name; }",
      challengeTask: "Which access modifier restricts access to members strictly within the declaring class itself?",
      type: 'multiple-choice',
      options: ['public', 'protected', 'private', 'default'],
      correctAnswer: 'private',
      hint: "It represents class-only privacy."
    }
  }
];

const CChallenges: MappedChallenge[] = [
  {
    keywords: ['variable', 'declare', 'int', 'char'],
    challenge: {
      learnText: "C is a statically typed language. Every variable must have a declared data type, and every statement must end with a semicolon `;`.",
      exampleCode: "int age = 25;\nchar grade = 'A';",
      challengeTask: "Declare an integer variable named `age` and initialize it with the value `20` (include the trailing semicolon `;`).",
      type: 'code',
      correctAnswer: 'int age = 20;',
      hint: "Format: `int age = 20;`",
      placeholder: "// Declare integer age with value 20"
    }
  },
  {
    keywords: ['operator', 'modulo', 'remainder'],
    challenge: {
      learnText: "C supports standard arithmetic operators. The modulo operator `%` calculates the remainder of an integer division.",
      exampleCode: "int remainder = 10 % 3; // remainder is 1",
      challengeTask: "Which operator symbol is used in C to get the remainder of division (modulo)?",
      type: 'multiple-choice',
      options: ['/', '%', 'mod', '&'],
      correctAnswer: '%',
      hint: "It is the percentage key `%`."
    }
  },
  {
    keywords: ['condition', 'if', 'statement'],
    challenge: {
      learnText: "In C, conditional tests are wrapped in parentheses. Comparison uses double equals `==`.",
      exampleCode: "if (score >= 50) {\n    printf(\"Pass\");\n}",
      challengeTask: "Write an `if` statement header in C checking if a variable `count` equals `0` (do not include curly braces or statement body).",
      type: 'code',
      correctAnswer: 'if (count == 0)',
      hint: "Remember to use: `if (count == 0)`",
      placeholder: "// Write your C condition check"
    }
  },
  {
    keywords: ['loop', 'while', 'for'],
    challenge: {
      learnText: "Loops repeat blocks of code. The `while` loop checks its condition in parentheses before executing each iteration.",
      exampleCode: "while (x < 10) {\n    x++;\n}",
      challengeTask: "Write a `while` loop statement header in C that runs as long as the variable `active` is true (do not include braces or body).",
      type: 'code',
      correctAnswer: 'while (active)',
      hint: "Remember syntax: `while (active)`",
      placeholder: "// Write C while loop header"
    }
  },
  {
    keywords: ['function', 'return type', 'void'],
    challenge: {
      learnText: "C functions require a return type. If a function does not return any value, its return type is declared as `void`.",
      exampleCode: "void printMessage() {\n    printf(\"Hello\");\n}",
      challengeTask: "What return type must be declared for a C function that does not return any value?",
      type: 'multiple-choice',
      options: ['void', 'int', 'null', 'empty'],
      correctAnswer: 'void',
      hint: "It translates literally to 'nothing' or 'empty'."
    }
  },
  {
    keywords: ['array'],
    challenge: {
      learnText: "Arrays store multiple values of the same type in contiguous memory. Declaring an array specifies the element type and size.",
      exampleCode: "int values[10];",
      challengeTask: "Declare an array of 5 integers named `scores` in C syntax (without initialization, include the trailing semicolon `;`).",
      type: 'code',
      correctAnswer: 'int scores[5];',
      hint: "Remember size goes in square brackets: `int scores[5];`",
      placeholder: "// Declare scores array in C"
    }
  },
  {
    keywords: ['pointer'],
    challenge: {
      learnText: "A pointer is a variable that stores the memory address of another variable. You declare it using the asterisk `*` symbol.",
      exampleCode: "int *ptr;\nptr = &age;",
      challengeTask: "Declare a pointer named `ptr` pointing to an integer in C (without initialization, include the trailing semicolon `;`).",
      type: 'code',
      correctAnswer: 'int *ptr;',
      hint: "Use: `int *ptr;`",
      placeholder: "// Declare pointer ptr in C"
    }
  }
];

const GitChallenges: MappedChallenge[] = [
  {
    keywords: ['init'],
    challenge: {
      learnText: "The `git init` command creates a new local Git repository in the current folder, initializing the hidden `.git` metadata directory.",
      exampleCode: "$ git init",
      challengeTask: "Type the exact command to initialize a new local Git repository in the current working directory.",
      type: 'command',
      correctAnswer: 'git init',
      hint: "Syntax is just `git` followed by the initialization command `init`."
    }
  },
  {
    keywords: ['add'],
    challenge: {
      learnText: "The `git add` command moves changes from your working directory to the staging area. The dot `.` represents all files.",
      exampleCode: "$ git add file.txt\n$ git add .",
      challengeTask: "Type the command to stage all modified and new files in the current folder.",
      type: 'command',
      correctAnswer: 'git add .',
      hint: "Syntax: `git add .`"
    }
  },
  {
    keywords: ['commit'],
    challenge: {
      learnText: "The `git commit` command saves your staged snapshot to the project history. Use `-m` to add a descriptive message.",
      exampleCode: "$ git commit -m \"fix login bug\"",
      challengeTask: "Type the command to commit staged files with the log message 'Initial Commit'.",
      type: 'command',
      correctAnswer: 'git commit -m "Initial Commit"',
      hint: "Use: `git commit -m \"Initial Commit\"` (ensure quotes match exactly)."
    }
  },
  {
    keywords: ['branch'],
    challenge: {
      learnText: "Branches are separate lines of development. Running `git branch` without arguments lists all local branches in the repository.",
      exampleCode: "$ git branch\n$ git branch feature-login",
      challengeTask: "Type the command to list all local branches in your repository.",
      type: 'command',
      correctAnswer: 'git branch',
      hint: "Simply type: `git branch`"
    }
  },
  {
    keywords: ['merge'],
    challenge: {
      learnText: "Merging joins separate lines of development. The `git merge` command imports changes from a target branch into your active branch.",
      exampleCode: "$ git checkout main\n$ git merge feature-login",
      challengeTask: "Type the command to merge a branch named `feature` into your currently checked out active branch.",
      type: 'command',
      correctAnswer: 'git merge feature',
      hint: "Command structure: `git merge [branch_name]`"
    }
  },
  {
    keywords: ['push'],
    challenge: {
      learnText: "The `git push` command uploads local repository commits to a remote hosting service like GitHub.",
      exampleCode: "$ git push origin main",
      challengeTask: "Type the command to push committed changes to remote repository destination `origin` main/master branch.",
      type: 'command',
      correctAnswer: 'git push origin main',
      hint: "Use: `git push origin main`"
    }
  },
  {
    keywords: ['pull'],
    challenge: {
      learnText: "The `git pull` command fetches changes from the remote repository and immediately integrates/merges them into your local branch.",
      exampleCode: "$ git pull origin main",
      challengeTask: "Type the command to pull remote updates and merge them instantly into your local active branch.",
      type: 'command',
      correctAnswer: 'git pull',
      hint: "Syntax is just `git` followed by `pull`."
    }
  },
  {
    keywords: ['workflow', 'order', 'arrange'],
    challenge: {
      learnText: "A standard Git collaborative workflow involves initializing, staging changes, committing, and uploading them.",
      exampleCode: "init -> add -> commit -> push",
      challengeTask: "Arrange the standard Git collaborative workflow steps in the correct chronological order:",
      type: 'ordering',
      options: ['commit', 'add', 'push', 'init'],
      correctAnswer: ['init', 'add', 'commit', 'push'],
      hint: "First you initialize, then stage files (add), then commit them, then push remote."
    }
  }
];

const K8sChallenges: MappedChallenge[] = [
  {
    keywords: ['pod'],
    challenge: {
      learnText: "A Pod is the smallest execution unit in Kubernetes. It encapsulates one or more application containers sharing storage, network IP, and runtime options.",
      exampleCode: "apiVersion: v1\nkind: Pod\nmetadata:\n  name: nginx",
      challengeTask: "What is the smallest and most basic deployable object in Kubernetes?",
      type: 'multiple-choice',
      options: ['Container', 'Pod', 'Service', 'Node'],
      correctAnswer: 'Pod',
      hint: "It groups one or more containers together with shared storage/network."
    }
  },
  {
    keywords: ['deployment'],
    challenge: {
      learnText: "A Deployment controller manages upgrades, scaling, and rollouts of a replica group of Pods in a declarative manner.",
      exampleCode: "apiVersion: apps/v1\nkind: Deployment",
      challengeTask: "Which Kubernetes resource manages updates and scaling for a set of replica Pods?",
      type: 'multiple-choice',
      options: ['Deployment', 'Service', 'DaemonSet', 'Ingress'],
      correctAnswer: 'Deployment',
      hint: "It represents a declared state deployment description."
    }
  },
  {
    keywords: ['service'],
    challenge: {
      learnText: "Pods are dynamic and transient. A Kubernetes Service exposes a network endpoint with a stable IP address and DNS name for a set of replica Pods.",
      exampleCode: "apiVersion: v1\nkind: Service",
      challengeTask: "Which Kubernetes resource exposes an application running on a set of Pods as a network service?",
      type: 'multiple-choice',
      options: ['Service', 'Deployment', 'ConfigMap', 'Node'],
      correctAnswer: 'Service',
      hint: "It acts as a local proxy / load balancer for Pod traffic."
    }
  },
  {
    keywords: ['configmap'],
    challenge: {
      learnText: "A ConfigMap stores non-confidential configuration data as key-value pairs, decoupling configuration flags from container image code.",
      exampleCode: "apiVersion: v1\nkind: ConfigMap",
      challengeTask: "Which resource is used to store non-confidential key-value configuration data?",
      type: 'multiple-choice',
      options: ['Secret', 'ConfigMap', 'Volume', 'Deployment'],
      correctAnswer: 'ConfigMap',
      hint: "It maps configurations (ConfigMap)."
    }
  },
  {
    keywords: ['secret'],
    challenge: {
      learnText: "A Secret stores and manages sensitive configuration parameters, such as passwords, SSH keys, or OAuth API access tokens.",
      exampleCode: "apiVersion: v1\nkind: Secret",
      challengeTask: "Which resource is designed to store sensitive configuration data like passwords, OAuth tokens, or SSH keys?",
      type: 'multiple-choice',
      options: ['ConfigMap', 'Secret', 'Volume', 'Service'],
      correctAnswer: 'Secret',
      hint: "It is base64-encoded to protect credentials."
    }
  },
  {
    keywords: ['scale', 'scaling'],
    challenge: {
      learnText: "Kubernetes allows you to scale deployments instantly. Using kubectl, you can declaratively adjust replica counts.",
      exampleCode: "$ kubectl scale deployment nginx --replicas=5",
      challengeTask: "Type the kubectl command to scale a deployment named `web-app` to 3 replicas.",
      type: 'command',
      correctAnswer: 'kubectl scale deployment web-app --replicas=3',
      hint: "Format: `kubectl scale deployment [name] --replicas=[count]`"
    }
  }
];

const ReactChallenges: MappedChallenge[] = [
  {
    keywords: ['component'],
    challenge: {
      learnText: "React applications are built around components. Component names must start with a capital letter to be recognized as custom tags.",
      exampleCode: "function Welcome() {\n    return <h1>Hello</h1>;\n}",
      challengeTask: "React component function names must always start with a capital letter. True or False?",
      type: 'multiple-choice',
      options: ['True', 'False'],
      correctAnswer: 'True',
      hint: "Capital letters distinguish custom React components from lowercase standard HTML elements."
    }
  },
  {
    keywords: ['jsx'],
    challenge: {
      learnText: "JSX is a syntax extension to JavaScript. It is used with React to describe what the user interface should look like.",
      exampleCode: "const element = <h1>Hello, world!</h1>;",
      challengeTask: "What syntax extension to JavaScript is commonly used with React to describe the UI?",
      type: 'multiple-choice',
      options: ['JSX', 'HTML5', 'JSON', 'XML'],
      correctAnswer: 'JSX',
      hint: "It stands for JavaScript XML."
    }
  },
  {
    keywords: ['prop'],
    challenge: {
      learnText: "Props are inputs to a component. They are read-only (immutable), meaning a component must never modify its own props.",
      exampleCode: "function MyComponent(props) {\n    return <p>{props.name}</p>;\n}",
      challengeTask: "Props passed into React components are mutable and can be modified directly. True or False?",
      type: 'multiple-choice',
      options: ['False', 'True'],
      correctAnswer: 'False',
      hint: "Props are immutable parameters. State is used for local dynamic changes."
    }
  },
  {
    keywords: ['state'],
    challenge: {
      learnText: "State stores dynamic information local to a component. The `useState` Hook declares local state variables.",
      exampleCode: "const [count, setCount] = useState(0);",
      challengeTask: "Which hook adds local state variables to functional components?",
      type: 'multiple-choice',
      options: ['useEffect', 'useState', 'useContext', 'useRef'],
      correctAnswer: 'useState',
      hint: "It returns a state variable and a setter function."
    }
  },
  {
    keywords: ['event', 'onclick'],
    challenge: {
      learnText: "React events are named using camelCase, rather than lowercase. In JSX, you pass a function reference as the handler.",
      exampleCode: "<button onClick={activateLasers}>Activate</button>",
      challengeTask: "How do you assign an event handler function named `handleClick` to a button's click event in JSX?",
      type: 'multiple-choice',
      options: ['onclick="handleClick()"', 'onClick={handleClick}', 'onClick=\"handleClick()\"', 'onclick={handleClick()}'],
      correctAnswer: 'onClick={handleClick}',
      hint: "camelCase `onClick` with custom curly brace wrapper, and no calling parentheses."
    }
  },
  {
    keywords: ['hook'],
    challenge: {
      learnText: "Hooks are functions that let you 'hook into' React state and lifecycle features. You must always call hooks at the top level of React functions.",
      exampleCode: "function App() {\n    useEffect(() => {});\n}",
      challengeTask: "Hooks can be called conditionally inside loops or nested functions. True or False?",
      type: 'multiple-choice',
      options: ['False', 'True'],
      correctAnswer: 'False',
      hint: "Hooks cannot be placed inside if-statements, loops, or nested functions."
    }
  }
];

export function getChallengeForLesson(
  courseTitle: string,
  lessonId: string,
  lessonTitle: string,
  lessonContent: string,
  allLessons: any[]
): Challenge {
  const cTitle = courseTitle.toLowerCase();
  const lId = String(lessonId).toLowerCase();
  const lTitle = lessonTitle.toLowerCase();
  
  let targetList: MappedChallenge[] = [];
  if (cTitle.includes('python')) {
    targetList = PythonChallenges;
  } else if (cTitle.includes('java')) {
    targetList = JavaChallenges;
  } else if (cTitle.includes('c-programming') || cTitle.includes('programming in c') || cTitle.includes('c programming') || cTitle.trim() === 'c') {
    targetList = CChallenges;
  } else if (cTitle.includes('git') || cTitle.includes('github')) {
    targetList = GitChallenges;
  } else if (cTitle.includes('kubernetes') || cTitle.includes('k8s')) {
    targetList = K8sChallenges;
  } else if (cTitle.includes('react')) {
    targetList = ReactChallenges;
  }

  // 1. Try matching keywords
  for (const item of targetList) {
    if (item.keywords.some(kw => lTitle.includes(kw) || lId.includes(kw))) {
      return fillChallengeDetails(item.challenge, lessonId, lessonTitle, allLessons);
    }
  }

  // 2. Try matching index in syllabus if no keyword matches
  const activeIdx = allLessons.findIndex(l => String(l.id) === String(lessonId));
  if (activeIdx !== -1 && targetList[activeIdx % targetList.length]) {
    return fillChallengeDetails(targetList[activeIdx % targetList.length].challenge, lessonId, lessonTitle, allLessons);
  }

  // 3. Fallback database mapping
  if (cTitle.includes('database') || cTitle.includes('dbms') || cTitle.includes('sql')) {
    const foundInDbms = dbmsLessonsData[String(lessonId)];
    if (foundInDbms) {
      return {
        missionNum: '01',
        challengeNum: '01',
        title: lessonTitle,
        learnText: foundInDbms.content.substring(0, 180) + '...',
        exampleCode: foundInDbms.commands?.[0]?.command || 'SELECT * FROM users;',
        challengeTask: "Execute the command to verify parameters in DBMS.",
        type: 'command',
        correctAnswer: foundInDbms.commands?.[0]?.command || 'SELECT * FROM users;',
        hint: `Type exactly: ${foundInDbms.commands?.[0]?.command || 'SELECT * FROM users;'}`
      };
    }
  }

  // 4. Default dynamic fallback
  const activeIdxFallback = allLessons?.findIndex(l => String(l.id) === String(lessonId)) ?? -1;
  const currentLessonFallback = (activeIdxFallback !== -1 && allLessons) ? allLessons[activeIdxFallback] : null;
  const fallbackDifficulty = currentLessonFallback?.difficulty || 'Easy';

  return {
    missionNum: '01',
    challengeNum: '01',
    title: lessonTitle,
    learnText: lessonContent.length > 200 ? lessonContent.substring(0, 200) + '...' : lessonContent || 'Welcome to this challenge.',
    exampleCode: "No code protocol required. Focus on theoretical mastery.",
    challengeTask: `Is the concept presented in "${lessonTitle}" a fundamental building block in modern software architecture?`,
    type: 'multiple-choice',
    options: ['True', 'False'],
    correctAnswer: 'True',
    hint: "This concept is indeed a key building block in programming and software systems tracks.",
    difficulty: fallbackDifficulty
  };
}

function fillChallengeDetails(
  raw: Omit<Challenge, 'missionNum' | 'challengeNum' | 'title'>,
  lessonId: string,
  lessonTitle: string,
  allLessons: any[]
): Challenge {
  const activeIdx = allLessons.findIndex(l => String(l.id) === String(lessonId));
  const challengeIdx = activeIdx !== -1 ? activeIdx + 1 : 1;
  const missionIdx = Math.ceil(challengeIdx / 4);
  const currentLesson = activeIdx !== -1 ? allLessons[activeIdx] : null;
  const difficulty = currentLesson?.difficulty || raw.difficulty || 'Easy';

  return {
    ...raw,
    missionNum: String(missionIdx).padStart(2, '0'),
    challengeNum: String(challengeIdx - (missionIdx - 1) * 4).padStart(2, '0'),
    title: lessonTitle,
    difficulty: difficulty
  };
}
