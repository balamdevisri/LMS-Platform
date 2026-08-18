import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Terminal, Cpu, RotateCcw, AlertTriangle, 
  Layers, Code, FileCode
} from 'lucide-react';

interface PracticeSandboxProps {
  courseId: string;
  isNightMode: boolean;
}

export const PracticeSandbox: React.FC<PracticeSandboxProps> = ({ courseId, isNightMode }) => {
  const [editorCode, setEditorCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('default');
  
  // Git Sandbox Specific State
  const [gitRepoInitialized, setGitRepoInitialized] = useState(false);
  const [gitStaged, setGitStaged] = useState<string[]>([]);
  const [gitWorkingDir, setGitWorkingDir] = useState<string[]>(['index.html', 'styles.css', 'app.js']);
  const [gitCommits, setGitCommits] = useState<Array<{ sha: string; message: string; files: string[] }>>([]);
  const [gitActiveBranch, setGitActiveBranch] = useState('main');
  const [gitTerminalHistory, setGitTerminalHistory] = useState<Array<{ command: string; output: string }>>([]);
  const [gitInput, setGitInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Kubernetes Sandbox Specific State
  const [k8sPods, setK8sPods] = useState<Array<{ name: string; status: 'Pending' | 'ContainerCreating' | 'Running'; age: string }>>([]);
  const [k8sDeployments, setK8sDeployments] = useState<Array<{ name: string; replicas: string; upToDate: string; available: string }>>([]);
  const [k8sTerminalHistory, setK8sTerminalHistory] = useState<Array<{ command: string; output: string }>>([]);
  const [k8sInput, setK8sInput] = useState('');
  const k8sTerminalEndRef = useRef<HTMLDivElement>(null);

  // React Preview State
  const [reactPreviewKey, setReactPreviewKey] = useState(0);
  const [reactConsoleLogs, setReactConsoleLogs] = useState<string[]>([]);
  const [reactOutputElement, setReactOutputElement] = useState<React.ReactNode | null>(null);

  const isGit = courseId === 'git-github-mastery-course-id' || courseId === 'git-github-mastery';
  const isK8s = courseId === 'kubernetes-complete-course-beginner-to-advanced';
  const isReact = courseId === 'react-js-complete-course';
  const isPython = courseId === 'python-through-oops-course-id';
  const isJava = courseId === 'java-through-oops-course-id';
  const isC = courseId === 'c-programming-course-id';

  // Templates
  const templates: Record<string, Record<string, string>> = {
    python: {
      default: `# Python OOP Practice Sandbox
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        
    def introduce(self):
        return f"Hi, my name is {self.name} and I am {self.age} years old."

# Instantiate and test
s1 = Student("Alice", 21)
print(s1.introduce())`,
      inheritance: `# Python Inheritance Example
class Animal:
    def __init__(self, name):
        self.name = name
    def make_sound(self):
        return "Generic sound"

class Dog(Animal):
    def make_sound(self):
        return "Woof! Woof!"

my_dog = Dog("Buddy")
print(f"{my_dog.name} says: {my_dog.make_sound()}")`,
      polymorphism: `# Python Polymorphism Example
class Payment:
    def process(self, amount):
        pass

class CreditCard(Payment):
    def process(self, amount):
        return f"Processing credit card payment of \${amount}"

class PayPal(Payment):
    def process(self, amount):
        return f"Processing PayPal payment of \${amount}"

def process_payment(payment_method, amount):
    print(payment_method.process(amount))

process_payment(CreditCard(), 150.0)
process_payment(PayPal(), 85.50)`
    },
    java: {
      default: `// Java OOP Practice Sandbox
public class Main {
    public static void main(String[] args) {
        Car myCar = new Car("Tesla", "Model S");
        myCar.displayInfo();
    }
}

class Car {
    private String brand;
    private String model;
    
    public Car(String brand, String model) {
        this.brand = brand;
        this.model = model;
    }
    
    public void displayInfo() {
        System.out.println("Car Brand: " + brand + ", Model: " + model);
    }
}`,
      encapsulation: `// Java Encapsulation Example
public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("John Doe", 1000.00);
        account.deposit(500);
        account.withdraw(200);
        System.out.println("Owner: " + account.getOwnerName());
        System.out.println("Final Balance: $" + account.getBalance());
    }
}

class BankAccount {
    private String ownerName;
    private double balance;
    
    public BankAccount(String ownerName, double initialBalance) {
        this.ownerName = ownerName;
        this.balance = initialBalance;
    }
    
    public String getOwnerName() {
        return ownerName;
    }
    
    public double getBalance() {
        return balance;
    }
    
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("Deposited: $" + amount);
        }
    }
    
    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("Withdrew: $" + amount);
        } else {
            System.out.println("Insufficient balance or invalid amount!");
        }
    }
}`,
      polymorphism: `// Java Polymorphism Example
public class Main {
    public static void main(String[] args) {
        Shape[] shapes = new Shape[2];
        shapes[0] = new Circle(5.0);
        shapes[1] = new Rectangle(4.0, 6.0);
        
        for (Shape shape : shapes) {
            System.out.println("Area: " + shape.calculateArea());
        }
    }
}

abstract class Shape {
    abstract double calculateArea();
}

class Circle extends Shape {
    private double radius;
    public Circle(double radius) { this.radius = radius; }
    double calculateArea() { return Math.PI * radius * radius; }
}

class Rectangle extends Shape {
    private double width, height;
    public Rectangle(double w, double h) { this.width = w; this.height = h; }
    double calculateArea() { return width * height; }
}`
    },
    c: {
      default: `#include <stdio.h>

int main() {
    int age = 20;
    printf("Welcome to C Programming Sandbox!\\n");
    printf("Age variable value: %d\\n", age);
    return 0;
}`,
      pointers: `#include <stdio.h>

int main() {
    int num = 42;
    int *ptr = &num;
    
    printf("Value of num: %d\\n", num);
    printf("Address of num (&num): %p\\n", (void*)&num);
    printf("Value stored in ptr (address of num): %p\\n", (void*)ptr);
    printf("Value dereferenced (*ptr): %d\\n", *ptr);
    
    *ptr = 99;
    printf("Modified value of num via pointer: %d\\n", num);
    return 0;
}`,
      structs: `#include <stdio.h>
#include <string.h>

struct Student {
    char name[50];
    int age;
    float gpa;
};

int main() {
    struct Student s1;
    strcpy(s1.name, "Devisri");
    s1.age = 21;
    s1.gpa = 3.92;
    
    printf("Student Info:\\n");
    printf("Name: %s\\n", s1.name);
    printf("Age: %d\\n", s1.age);
    printf("GPA: %.2f\\n", s1.gpa);
    
    return 0;
}`
    },
    react: {
      default: `// React JS Practice Counter Component
function Counter() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{
      padding: '24px',
      borderRadius: '16px',
      background: 'rgba(30, 41, 59, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
      maxWidth: '300px',
      margin: '0 auto'
    }}>
      <h3 style={{ color: '#38bdf8', marginBottom: '8px', fontSize: '18px' }}>
        Counter Component
      </h3>
      <p style={{ fontSize: '36px', color: '#fff', fontWeight: 'bold', margin: '16px 0' }}>
        {count}
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button 
          onClick={() => setCount(count - 1)}
          style={{
            padding: '8px 16px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          -
        </button>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '8px 16px',
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

render(<Counter />);`,
      toggle: `// React JS Practice Toggle Component
function ToggleMessage() {
  const [show, setShow] = React.useState(true);
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <button 
        onClick={() => setShow(!show)}
        style={{
          padding: '10px 20px',
          background: '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '16px',
          fontWeight: 'semibold'
        }}
      >
        {show ? 'Hide message' : 'Show message'}
      </button>
      {show && (
        <p style={{ color: '#a78bfa', fontSize: '16px', transition: 'all 0.3s' }}>
          🎉 You've unlocked the secrets of React state management!
        </p>
      )}
    </div>
  );
}

render(<ToggleMessage />);`,
      form: `// React JS Practice Interactive Form
function ProfileForm() {
  const [name, setName] = React.useState('Guest');
  
  return (
    <div style={{ padding: '16px', color: '#fff' }}>
      <h3 style={{ color: '#22c55e', margin: '0 0 12px 0' }}>Interactive Greetings</h3>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #475569',
          background: '#0f172a',
          color: '#fff',
          marginBottom: '12px'
        }}
      />
      <p style={{ fontSize: '18px' }}>
        Hello, <strong style={{ color: '#fbbf24' }}>{name}</strong>! Welcome to your playground.
      </p>
    </div>
  );
}

render(<ProfileForm />);`
    },
    kubernetes: {
      default: `apiVersion: v1
kind: Pod
metadata:
  name: web-pod
  labels:
    app: frontend
spec:
  containers:
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80`,
      deployment: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deploy
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api-server
        image: python:3.9-slim
        ports:
        - containerPort: 5000`
    }
  };

  // Load default template on load/change
  useEffect(() => {
    let type = '';
    if (isPython) type = 'python';
    else if (isJava) type = 'java';
    else if (isC) type = 'c';
    else if (isReact) type = 'react';
    else if (isK8s) type = 'kubernetes';

    if (type && templates[type]) {
      setEditorCode(templates[type].default);
      setSelectedExercise('default');
    }
    setConsoleOutput([]);
    setIsRunning(false);
  }, [courseId]);

  // Scroll terminal outputs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gitTerminalHistory]);

  useEffect(() => {
    if (k8sTerminalEndRef.current) {
      k8sTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [k8sTerminalHistory]);

  // Load exercises
  const handleLoadExercise = (exKey: string) => {
    let type = '';
    if (isPython) type = 'python';
    else if (isJava) type = 'java';
    else if (isC) type = 'c';
    else if (isReact) type = 'react';
    else if (isK8s) type = 'kubernetes';

    if (type && templates[type] && templates[type][exKey]) {
      setEditorCode(templates[type][exKey]);
      setSelectedExercise(exKey);
      setConsoleOutput([]);
      if (isReact) {
        setReactConsoleLogs([]);
        setReactOutputElement(null);
      }
    }
  };

  // Python simulated execution
  const runPythonSimulation = () => {
    setIsRunning(true);
    setConsoleOutput(['[Python Interpreter Starting...]']);
    
    setTimeout(() => {
      const output: string[] = [];
      const lines = editorCode.split('\n');
      
      // Basic print and variable simulation
      const variables: Record<string, any> = {};
      
      // Add standard OOP templates outputs if code matches roughly
      if (editorCode.includes('class Student') && selectedExercise === 'default') {
        output.push('Hi, my name is Alice and I am 21 years old.');
      } else if (editorCode.includes('class Dog') && selectedExercise === 'inheritance') {
        output.push('Buddy says: Woof! Woof!');
      } else if (editorCode.includes('class CreditCard') && selectedExercise === 'polymorphism') {
        output.push('Processing credit card payment of $150.0');
        output.push('Processing PayPal payment of $85.50');
      } else {
        // Fallback simple line-by-line regex runner for basic scripts
        try {
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('#') || trimmed === '') return;
            
            // Matches assignment e.g. x = 5 or x = "hello" or name = 'Buddy'
            const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/);
            if (assignMatch) {
              const varName = assignMatch[1];
              const varValStr = assignMatch[2].trim();
              
              // Evaluate basic string or number literals
              if (varValStr.startsWith('"') || varValStr.startsWith("'")) {
                variables[varName] = varValStr.slice(1, -1);
              } else if (!isNaN(Number(varValStr))) {
                variables[varName] = Number(varValStr);
              } else if (varValStr.includes('+') || varValStr.includes('-') || varValStr.includes('*') || varValStr.includes('/')) {
                // simple math
                let evalStr = varValStr;
                Object.keys(variables).forEach(k => {
                  evalStr = evalStr.replace(new RegExp(`\\b${k}\\b`, 'g'), variables[k]);
                });
                try {
                  variables[varName] = new Function(`return (${evalStr})`)();
                } catch(e) {
                  variables[varName] = varValStr;
                }
              } else {
                variables[varName] = varValStr;
              }
            }
            
            // Matches print(x) or print("hello") or print(f"...")
            const printMatch = trimmed.match(/^print\((.*)\)$/);
            if (printMatch) {
              let printVal = printMatch[1].trim();
              if (printVal.startsWith('f"') || printVal.startsWith("f'")) {
                // f-strings
                let strPattern = printVal.slice(2, -1);
                const expressions = strPattern.match(/\{([^}]+)\}/g) || [];
                expressions.forEach(expr => {
                  const rawExpr = expr.slice(1, -1).trim();
                  // Resolve expression from variables or evaluate
                  let resolved = variables[rawExpr] !== undefined ? variables[rawExpr] : rawExpr;
                  // If it contains properties or method calls
                  if (rawExpr.includes('.')) {
                    const parts = rawExpr.split('.');
                    if (variables[parts[0]] !== undefined) {
                      resolved = `[${rawExpr}]`;
                    }
                  }
                  strPattern = strPattern.replace(expr, resolved);
                });
                output.push(strPattern);
              } else if (printVal.startsWith('"') || printVal.startsWith("'")) {
                output.push(printVal.slice(1, -1));
              } else {
                // Variable or other expression
                if (variables[printVal] !== undefined) {
                  output.push(String(variables[printVal]));
                } else {
                  // try simple math
                  let evalStr = printVal;
                  Object.keys(variables).forEach(k => {
                    evalStr = evalStr.replace(new RegExp(`\\b${k}\\b`, 'g'), variables[k]);
                  });
                  try {
                    output.push(String(new Function(`return (${evalStr})`)()));
                  } catch (e) {
                    output.push(printVal);
                  }
                }
              }
            }
          });
        } catch (e: any) {
          output.push(`SyntaxError: ${e.message}`);
        }
      }
      
      if (output.length === 0) {
        output.push('[Script ran successfully, no output printed.]');
      }
      setConsoleOutput(prev => [...prev, ...output, '\n[Process finished with exit code 0]']);
      setIsRunning(false);
    }, 1000);
  };

  // Java simulated execution
  const runJavaSimulation = () => {
    setIsRunning(true);
    setConsoleOutput(['$ javac Main.java', '[INFO] Analyzing Main class...', '[INFO] Class loaded in JVM.']);
    
    setTimeout(() => {
      const output: string[] = [];
      
      if (editorCode.includes('Car') && selectedExercise === 'default') {
        // parse brand and model from user inputs if possible
        const brandMatch = editorCode.match(/new Car\("([^"]*)",\s*"([^"]*)"\)/);
        const brand = brandMatch ? brandMatch[1] : 'Tesla';
        const model = brandMatch ? brandMatch[2] : 'Model S';
        output.push(`Car Brand: ${brand}, Model: ${model}`);
      } else if (editorCode.includes('BankAccount') && selectedExercise === 'encapsulation') {
        output.push('Deposited: $500.0');
        output.push('Withdrew: $200.0');
        output.push('Owner: John Doe');
        output.push('Final Balance: $1300.0');
      } else if (editorCode.includes('Shape') && selectedExercise === 'polymorphism') {
        output.push('Area: 78.53981633974483'); // Math.PI * 5 * 5
        output.push('Area: 24.0'); // 4 * 6
      } else {
        // Fallback matching basic System.out.println
        const printlnRegex = /System\.out\.println\(([^)]*)\);/g;
        let match;
        while ((match = printlnRegex.exec(editorCode)) !== null) {
          const inner = match[1].trim();
          if (inner.startsWith('"') && inner.endsWith('"')) {
            output.push(inner.slice(1, -1));
          } else {
            output.push(inner.replace(/"\s*\+\s*/g, '').replace(/\s*\+\s*"/g, '').replace(/"/g, ''));
          }
        }
      }
      
      if (output.length === 0) {
        output.push('Error: Main method compilation succeeded but no standard stdout triggers found.');
      }
      
      setConsoleOutput(prev => [
        ...prev, 
        '$ java Main', 
        '-----------------------------------',
        ...output, 
        '-----------------------------------',
        '\n[Java thread "main" finished successfully]'
      ]);
      setIsRunning(false);
    }, 1200);
  };

  // C simulated execution
  const runCSimulation = () => {
    setIsRunning(true);
    setConsoleOutput(['$ gcc main.c -o main', '[INFO] Linking libraries...', '[INFO] Executable compiled successfully.']);
    
    setTimeout(() => {
      const output: string[] = [];
      
      if (editorCode.includes('age') && selectedExercise === 'default') {
        const ageMatch = editorCode.match(/int\s+age\s*=\s*(\d+)/);
        const age = ageMatch ? ageMatch[1] : '20';
        output.push('Welcome to C Programming Sandbox!');
        output.push(`Age variable value: ${age}`);
      } else if (editorCode.includes('pointers') || selectedExercise === 'pointers') {
        output.push('Value of num: 42');
        output.push('Address of num (&num): 0x7ffee3bf8ac8');
        output.push('Value stored in ptr (address of num): 0x7ffee3bf8ac8');
        output.push('Value dereferenced (*ptr): 42');
        output.push('Modified value of num via pointer: 99');
      } else if (editorCode.includes('struct Student') || selectedExercise === 'structs') {
        output.push('Student Info:');
        output.push('Name: Devisri');
        output.push('Age: 21');
        output.push('GPA: 3.92');
      } else {
        const printfRegex = /printf\("([^"]*)"\s*(?:,\s*([^)]*))?\);/g;
        let match;
        while ((match = printfRegex.exec(editorCode)) !== null) {
          let str = match[1];
          // clean newlines
          str = str.replace(/\\n/g, '');
          output.push(str);
        }
      }

      if (output.length === 0) {
        output.push('[Executable completed execution with return code 0]');
      }

      setConsoleOutput(prev => [
        ...prev, 
        '$ ./main', 
        '-----------------------------------',
        ...output,
        '-----------------------------------'
      ]);
      setIsRunning(false);
    }, 1100);
  };

  // Git Terminal Input Handling
  const handleGitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitInput.trim()) return;

    const cmd = gitInput.trim();
    let out = '';
    const parts = cmd.split(/\s+/);
    const primary = parts[0];
    const secondary = parts[1];

    if (primary === 'git') {
      if (!secondary) {
        out = 'usage: git [--version] [--help] <command> [<args>]';
      } else if (secondary === 'init') {
        if (gitRepoInitialized) {
          out = 'Reinitialized existing Git repository in /workspace/.git/';
        } else {
          setGitRepoInitialized(true);
          out = 'Initialized empty Git repository in /workspace/.git/';
          setGitWorkingDir(['index.html', 'styles.css', 'app.js']);
        }
      } else if (!gitRepoInitialized) {
        out = 'fatal: not a git repository (or any of the parent directories): .git';
      } else {
        // Repository initialized commands
        switch (secondary) {
          case 'status':
            if (gitStaged.length === 0 && gitWorkingDir.length === 0) {
              out = `On branch ${gitActiveBranch}\nnothing to commit, working tree clean`;
            } else {
              let statusStr = `On branch ${gitActiveBranch}\n`;
              if (gitStaged.length > 0) {
                statusStr += `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n`;
                gitStaged.forEach(f => {
                  statusStr += `\tmodified:   \u001b[32m${f}\u001b[0m\n`;
                });
              }
              if (gitWorkingDir.length > 0) {
                statusStr += `\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n`;
                gitWorkingDir.forEach(f => {
                  statusStr += `\tmodified:   \u001b[31m${f}\u001b[0m\n`;
                });
              }
              out = statusStr;
            }
            break;
          case 'add':
            const file = parts.slice(2).join(' ');
            if (!file) {
              out = 'Nothing specified, nothing added.';
            } else if (file === '.' || file === '*') {
              setGitStaged(prev => [...Array.from(new Set([...prev, ...gitWorkingDir]))]);
              setGitWorkingDir([]);
              out = 'Staged all modified files.';
            } else if (gitWorkingDir.includes(file)) {
              setGitStaged(prev => [...Array.from(new Set([...prev, file]))]);
              setGitWorkingDir(prev => prev.filter(f => f !== file));
              out = `Staged file '${file}'.`;
            } else {
              out = `fatal: pathspec '${file}' did not match any files`;
            }
            break;
          case 'commit':
            const mIdx = parts.indexOf('-m');
            let msg = '';
            if (mIdx !== -1 && parts[mIdx + 1]) {
              msg = parts.slice(mIdx + 1).join(' ').replace(/"/g, '').replace(/'/g, '');
            }
            if (gitStaged.length === 0) {
              out = 'On branch ' + gitActiveBranch + '\nnothing to commit, working tree clean';
            } else if (!msg) {
              out = 'error: switch `m` requires a value\nfatal: empty commit message';
            } else {
              const sha = Math.random().toString(16).substring(2, 8);
              const newCommit = { sha, message: msg, files: [...gitStaged] };
              setGitCommits(prev => [newCommit, ...prev]);
              setGitStaged([]);
              out = `[${gitActiveBranch} ${sha}] ${msg}\n ${newCommit.files.length} file(s) changed`;
            }
            break;
          case 'log':
            if (gitCommits.length === 0) {
              out = 'fatal: your current branch \'' + gitActiveBranch + '\' does not have any commits yet';
            } else {
              out = gitCommits.map(c => `commit \u001b[33m${c.sha}f890e87d1912a\u001b[0m\nAuthor: Devisri <practice@kaizen.q>\nDate:   ${new Date().toLocaleDateString()}\n\n    ${c.message}\n`).join('\n');
            }
            break;
          case 'branch':
            const bName = parts[2];
            if (!bName) {
              out = `* \u001b[32m${gitActiveBranch}\u001b[0m`;
            } else {
              out = `Branch '${bName}' created.`;
            }
            break;
          case 'checkout':
            const checkBranch = parts[2];
            if (parts[2] === '-b' && parts[3]) {
              setGitActiveBranch(parts[3]);
              out = `Switched to a new branch '${parts[3]}'`;
            } else if (checkBranch) {
              setGitActiveBranch(checkBranch);
              out = `Switched to branch '${checkBranch}'`;
            } else {
              out = 'fatal: branch name required';
            }
            break;
          case 'push':
            out = `Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nDelta compression using up to 8 threads\nCompressing objects: 100% (3/3), done.\nWriting objects: 100% (3/3), 324 bytes | 324.00 KiB/s, done.\nTotal 3 (delta 1), reused 0 (delta 0)\nTo github.com:kaizen-q/practice-sandbox.git\n   ${gitCommits[0]?.sha || 'a0b1c2'}..${gitCommits[0]?.sha || 'a0b1c2'}  ${gitActiveBranch} -> ${gitActiveBranch}`;
            break;
          default:
            out = `git: '${secondary}' is not a git command. See 'git --help'.`;
        }
      }
    } else if (primary === 'clear') {
      setGitTerminalHistory([]);
      setGitInput('');
      return;
    } else if (primary === 'ls') {
      out = gitWorkingDir.concat(gitStaged).join('    ');
    } else if (primary === 'cat') {
      const target = parts[1];
      if (target === 'index.html') {
        out = '<!DOCTYPE html>\n<html>\n<head>\n  <title>Practice Hub</title>\n</head>\n<body>\n  <h1>Welcome Sandbox</h1>\n</body>\n</html>';
      } else if (target) {
        out = `// Content of ${target}\n// Add custom code here.`;
      } else {
        out = 'cat: missing file name';
      }
    } else if (primary === 'touch') {
      const fileTouch = parts[1];
      if (fileTouch) {
        setGitWorkingDir(prev => [...Array.from(new Set([...prev, fileTouch]))]);
        out = `Created file ${fileTouch}`;
      } else {
        out = 'touch: missing file operand';
      }
    } else {
      out = `bash: ${primary}: command not found`;
    }

    setGitTerminalHistory(prev => [...prev, { command: gitInput, output: out }]);
    setGitInput('');
  };

  // Kubernetes kubectl command handler
  const handleK8sCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!k8sInput.trim()) return;

    const cmd = k8sInput.trim();
    let out = '';
    const parts = cmd.split(/\s+/);
    const primary = parts[0];
    const secondary = parts[1];

    if (primary === 'kubectl') {
      if (!secondary) {
        out = 'kubectl controls the Kubernetes cluster manager.\n\nUsage:\n  kubectl [command] [flags]';
      } else {
        switch (secondary) {
          case 'apply':
            const fIdx = parts.indexOf('-f');
            if (fIdx !== -1 && parts[fIdx + 1]) {
              const file = parts[fIdx + 1];
              if (file.includes('deployment') || editorCode.includes('Deployment')) {
                const nameMatch = editorCode.match(/name:\s*([a-zA-Z0-9-]+)/);
                const deployName = nameMatch ? nameMatch[1] : 'backend-deploy';
                const replicasMatch = editorCode.match(/replicas:\s*(\d+)/);
                const reps = replicasMatch ? replicasMatch[1] : '3';
                
                // Add Deployment
                if (!k8sDeployments.some(d => d.name === deployName)) {
                  setK8sDeployments(prev => [...prev, { name: deployName, replicas: `${reps}/${reps}`, upToDate: reps, available: reps }]);
                }
                
                // Spin up pods
                const newPods: typeof k8sPods = [];
                for (let i = 0; i < Number(reps); i++) {
                  const podName = `${deployName}-${Math.random().toString(36).substring(2, 7)}`;
                  newPods.push({ name: podName, status: 'Pending', age: '1s' });
                }
                setK8sPods(prev => [...prev, ...newPods]);

                // Simulate pod status updates
                setTimeout(() => {
                  setK8sPods(currentPods => 
                    currentPods.map(p => 
                      p.name.startsWith(deployName) && p.status === 'Pending' ? { ...p, status: 'ContainerCreating', age: '5s' } : p
                    )
                  );
                }, 1500);

                setTimeout(() => {
                  setK8sPods(currentPods => 
                    currentPods.map(p => 
                      p.name.startsWith(deployName) && p.status === 'ContainerCreating' ? { ...p, status: 'Running', age: '15s' } : p
                    )
                  );
                }, 3500);

                out = `deployment.apps/${deployName} created`;
              } else {
                // Pod creation
                const nameMatch = editorCode.match(/name:\s*([a-zA-Z0-9-]+)/);
                const podName = nameMatch ? nameMatch[1] : 'web-pod';
                
                if (k8sPods.some(p => p.name === podName)) {
                  out = `pod/${podName} configured`;
                } else {
                  setK8sPods(prev => [...prev, { name: podName, status: 'Pending', age: '1s' }]);
                  
                  setTimeout(() => {
                    setK8sPods(current => current.map(p => p.name === podName ? { ...p, status: 'ContainerCreating', age: '4s' } : p));
                  }, 1200);

                  setTimeout(() => {
                    setK8sPods(current => current.map(p => p.name === podName ? { ...p, status: 'Running', age: '10s' } : p));
                  }, 3000);

                  out = `pod/${podName} created`;
                }
              }
            } else {
              out = 'error: filepath must be provided (e.g. -f manifest.yaml)';
            }
            break;
          case 'get':
            const type = parts[2];
            if (type === 'pods' || type === 'pod') {
              if (k8sPods.length === 0) {
                out = 'No resources found in default namespace.';
              } else {
                out = 'NAME'.padEnd(30) + 'READY'.padEnd(10) + 'STATUS'.padEnd(25) + 'AGE\n';
                k8sPods.forEach(p => {
                  const ready = p.status === 'Running' ? '1/1' : '0/1';
                  out += `${p.name.padEnd(30)}${ready.padEnd(10)}${p.status.padEnd(25)}${p.age}\n`;
                });
              }
            } else if (type === 'deployments' || type === 'deployment' || type === 'deploy') {
              if (k8sDeployments.length === 0) {
                out = 'No resources found in default namespace.';
              } else {
                out = 'NAME'.padEnd(25) + 'READY'.padEnd(12) + 'UP-TO-DATE'.padEnd(15) + 'AVAILABLE'.padEnd(15) + 'AGE\n';
                k8sDeployments.forEach(d => {
                  out += `${d.name.padEnd(25)}${d.replicas.padEnd(12)}${d.upToDate.padEnd(15)}${d.available.padEnd(15)}35s\n`;
                });
              }
            } else {
              out = `error: the server doesn't have a resource type "${type}"`;
            }
            break;
          case 'delete':
            const resType = parts[2];
            const resName = parts[3];
            if ((resType === 'pod' || resType === 'pods') && resName) {
              if (k8sPods.some(p => p.name === resName)) {
                setK8sPods(prev => prev.filter(p => p.name !== resName));
                out = `pod "${resName}" deleted`;
              } else {
                out = `error: pods "${resName}" not found`;
              }
            } else if ((resType === 'deployment' || resType === 'deploy') && resName) {
              if (k8sDeployments.some(d => d.name === resName)) {
                setK8sDeployments(prev => prev.filter(d => d.name !== resName));
                setK8sPods(prev => prev.filter(p => !p.name.startsWith(resName)));
                out = `deployment.apps "${resName}" deleted`;
              } else {
                out = `error: deployments.apps "${resName}" not found`;
              }
            } else {
              out = 'error: resource type and name required (e.g. kubectl delete pod web-pod)';
            }
            break;
          case 'describe':
            const dType = parts[2];
            const dName = parts[3];
            if (dType === 'pod' && dName) {
              const p = k8sPods.find(pod => pod.name === dName);
              if (p) {
                out = `Name:         ${p.name}\nNamespace:    default\nPriority:     0\nNode:         k8s-node-1/192.168.1.100\nStatus:       ${p.status}\nIP:           10.244.0.12\nContainers:\n  nginx:\n    Container ID:   docker://2834a8198f\n    Image:          nginx:latest\n    State:          ${p.status}\nEvents:\n  Type    Reason     Age   From               Message\n  ----    ------     ----  ----               -------\n  Normal  Scheduled  1m    default-scheduler  Successfully assigned pod to k8s-node-1`;
              } else {
                out = `error: pods "${dName}" not found`;
              }
            } else {
              out = 'error: kubectl describe pod <pod-name> required';
            }
            break;
          default:
            out = `unknown command: kubectl ${secondary}`;
        }
      }
    } else if (primary === 'clear') {
      setK8sTerminalHistory([]);
      setK8sInput('');
      return;
    } else {
      out = `bash: ${primary}: command not found`;
    }

    setK8sTerminalHistory(prev => [...prev, { command: k8sInput, output: out }]);
    setK8sInput('');
  };

  // React Live Compilation / Execution
  const runReactPreview = () => {
    setIsRunning(true);
    setReactConsoleLogs(['Compiling JSX component bundle...']);
    
    setTimeout(() => {
      try {
        setReactConsoleLogs(prev => [...prev, 'Module build: success.', 'Mounting component in preview root...']);
        
        let element: React.ReactNode = null;
        
        if (editorCode.includes('Counter') && selectedExercise === 'default') {
          element = <ReactCounterPreview />;
        } else if (editorCode.includes('ToggleMessage') && selectedExercise === 'toggle') {
          element = <ReactTogglePreview />;
        } else if (editorCode.includes('ProfileForm') && selectedExercise === 'form') {
          element = <ReactFormPreview />;
        } else {
          element = <ReactCustomFallback code={editorCode} />;
        }
        
        setReactOutputElement(element);
        setReactPreviewKey(prev => prev + 1);
        setReactConsoleLogs(prev => [...prev, '🎉 Rendered successfully!']);
      } catch (err: any) {
        setReactConsoleLogs(prev => [...prev, `❌ Compilation Error: ${err.message}`]);
      } finally {
        setIsRunning(false);
      }
    }, 900);
  };

  // Reset sandbox completely
  const handleReset = () => {
    if (window.confirm('Reset sandbox and revert all code back to default?')) {
      let type = '';
      if (isPython) type = 'python';
      else if (isJava) type = 'java';
      else if (isC) type = 'c';
      else if (isReact) type = 'react';
      else if (isK8s) type = 'kubernetes';

      if (type && templates[type]) {
        setEditorCode(templates[type].default);
        setSelectedExercise('default');
      }
      setConsoleOutput([]);
      setReactConsoleLogs([]);
      setReactOutputElement(null);
      
      // Git resets
      setGitRepoInitialized(false);
      setGitStaged([]);
      setGitWorkingDir(['index.html', 'styles.css', 'app.js']);
      setGitCommits([]);
      setGitActiveBranch('main');
      setGitTerminalHistory([]);
      
      // K8s resets
      setK8sPods([]);
      setK8sDeployments([]);
      setK8sTerminalHistory([]);
    }
  };

  return (
    <div className={`rounded-3xl border ${isNightMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'} p-6 transition-all duration-300`}>
      {/* Disclaimer Banner (MANDATORY REQUIREMENT) */}
      <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${
        isNightMode 
          ? 'bg-amber-955 bg-amber-950/20 border-amber-900/60 text-amber-300' 
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <AlertTriangle className="w-6 h-6 animate-pulse text-amber-500 shrink-0" />
        <span className="text-sm font-extrabold tracking-wide">
          ⚠️ PRACTICE ONLY — Use this sandbox only for practice and experimentation.
        </span>
      </div>

      {/* Sandbox Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/40">
        <div>
          <h2 className={`text-xl font-heading font-black tracking-tight ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
            {isPython && 'Python Coding Practice Sandbox'}
            {isJava && 'Java Coding Practice Sandbox'}
            {isC && 'C Coding Practice Sandbox'}
            {isGit && 'Git and GitHub command Practice Sandbox'}
            {isK8s && 'Kubernetes command and YAML Practice Sandbox'}
            {isReact && 'React JS coding Practice Sandbox'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test concepts, play around with features, and debug blocks in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {!isGit && !isK8s && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-bold">Concept:</label>
              <select
                value={selectedExercise}
                onChange={(e) => handleLoadExercise(e.target.value)}
                className={`text-xs font-bold rounded-xl border p-2 ${
                  isNightMode 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="default">Default Boilerplate</option>
                {isPython && (
                  <>
                    <option value="inheritance">Inheritance Example</option>
                    <option value="polymorphism">Polymorphism Example</option>
                  </>
                )}
                {isJava && (
                  <>
                    <option value="encapsulation">Encapsulation Example</option>
                    <option value="polymorphism">Polymorphism Example</option>
                  </>
                )}
                {isC && (
                  <>
                    <option value="pointers">Pointers Example</option>
                    <option value="structs">Structures Example</option>
                  </>
                )}
                {isReact && (
                  <>
                    <option value="toggle">State Toggle Example</option>
                    <option value="form">Interactive Form Example</option>
                  </>
                )}
              </select>
            </div>
          )}

          {isK8s && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-bold">Template:</label>
              <select
                value={selectedExercise}
                onChange={(e) => handleLoadExercise(e.target.value)}
                className={`text-xs font-bold rounded-xl border p-2 ${
                  isNightMode 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="default">Pod Manifest</option>
                <option value="deployment">Deployment Manifest</option>
              </select>
            </div>
          )}

          <button
            onClick={handleReset}
            title="Reset sandbox code"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isNightMode 
                ? 'bg-slate-900 border-slate-800 text-red-400 hover:bg-slate-800' 
                : 'bg-slate-100 border-slate-200 text-red-600 hover:bg-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sandbox
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      {isGit ? (
        /* Git Interactive Terminal Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: File explorer and Git Tree DAG */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`p-4 rounded-2xl border ${isNightMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`text-xs font-black tracking-wider uppercase mb-3 flex items-center gap-2 ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <Layers className="w-4 h-4 text-cyan-400" />
                Working Directory Status
              </h3>
              
              <div className="space-y-1 text-xs">
                {gitWorkingDir.length === 0 && gitStaged.length === 0 && (
                  <p className="text-slate-500 italic p-2">Empty workspace.</p>
                )}
                {gitWorkingDir.map(f => (
                  <div key={f} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/40 text-slate-300">
                    <span>{f}</span>
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-955 bg-red-950/20 border border-red-900/40">Modified</span>
                  </div>
                ))}
                {gitStaged.map(f => (
                  <div key={f} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/40 text-slate-300">
                    <span>{f}</span>
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-955 bg-green-950/20 border border-green-900/40">Staged</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isNightMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`text-xs font-black tracking-wider uppercase mb-3 flex items-center gap-2 ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <Cpu className="w-4 h-4 text-purple-400" />
                Git Commit History (DAG Tree)
              </h3>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {!gitRepoInitialized ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">Repository not initialized. Type "git init" in the terminal to start!</p>
                ) : gitCommits.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">No commits yet. Stage files and run "git commit -m 'your message'".</p>
                ) : (
                  gitCommits.map((c, i) => (
                    <div key={c.sha} className="flex items-start gap-3 relative text-xs">
                      {/* Tree line connector */}
                      {i < gitCommits.length - 1 && (
                        <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-cyan-500/30" />
                      )}
                      
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shrink-0 z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold">{c.sha}</span>
                          {i === 0 && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                              HEAD -&gt; {gitActiveBranch}
                            </span>
                          )}
                        </div>
                        <p className={`font-semibold truncate mt-1 ${isNightMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          {c.message}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Files: {c.files.join(', ')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Terminal Console */}
          <div className="lg:col-span-2 flex flex-col h-[400px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden font-mono shadow-2xl">
            {/* Terminal Topbar */}
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-bold text-slate-400 ml-2">Terminal Shell — git-bash</span>
              </div>
              <span className="text-xs text-slate-500">Status: {gitRepoInitialized ? 'Repo Ready' : 'No Repo'}</span>
            </div>

            {/* Terminal History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
              <div className="text-slate-500">
                Welcome to Git and GitHub command Practice Sandbox!<br />
                Type standard commands like: <span className="text-cyan-400 font-bold">git init</span>, <span className="text-cyan-400 font-bold">git status</span>, <span className="text-cyan-400 font-bold">git add .</span>, <span className="text-cyan-400 font-bold">git commit -m "message"</span>, <span className="text-cyan-400 font-bold">git log</span>, <span className="text-cyan-400 font-bold">git checkout -b new-feature</span>.<br />
                You can also use: <span className="text-amber-400 font-bold">ls</span>, <span className="text-amber-400 font-bold">touch filename</span>, <span className="text-amber-400 font-bold">cat index.html</span>, <span className="text-amber-400 font-bold">clear</span>.<br />
                ----------------------------------------------------------------------
              </div>

              {gitTerminalHistory.map((h, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2 text-purple-400">
                    <span>$</span>
                    <span className="text-white font-bold">{h.command}</span>
                  </div>
                  <div className="text-slate-300 whitespace-pre-wrap pl-3 leading-loose font-medium select-text">
                    {h.output}
                  </div>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Command Input Form */}
            <form onSubmit={handleGitCommand} className="bg-slate-900 border-t border-slate-800 p-2 flex items-center gap-2 shrink-0">
              <span className="text-purple-400 font-bold pl-2 select-none">$</span>
              <input
                type="text"
                value={gitInput}
                onChange={(e) => setGitInput(e.target.value)}
                placeholder="Type your git command..."
                className="flex-1 bg-transparent border-none outline-none text-white text-xs font-mono font-bold py-1.5"
                autoFocus
              />
            </form>
          </div>
        </div>
      ) : isK8s ? (
        /* Kubernetes Dual manifest and kubectl Sandbox */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Manifest editor */}
          <div className="lg:col-span-1 flex flex-col h-[400px]">
            <div className={`p-3 border-b flex items-center justify-between shrink-0 ${isNightMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-300">manifest.yaml</span>
              </div>
            </div>
            
            <textarea
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 outline-none text-slate-300 text-xs font-mono p-4 resize-none rounded-b-2xl font-medium focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Kubectl console and Cluster status view */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Kubectl Interactive shell */}
            <div className="flex flex-col h-[230px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden font-mono shadow-xl">
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-400">Kubectl Console</span>
                </div>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">k8s-sandbox-cluster</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs leading-normal select-text scrollbar-thin scrollbar-thumb-slate-800">
                <div className="text-slate-500">
                  Interactive Kubectl Sandbox! Setup namespaces, pods, and deployments.<br />
                  Run: <span className="text-cyan-400 font-bold">kubectl apply -f manifest.yaml</span> to configure resources.<br />
                  Use: <span className="text-cyan-400 font-bold">kubectl get pods</span>, <span className="text-cyan-400 font-bold">kubectl get deploy</span>, <span className="text-cyan-400 font-bold">kubectl delete pod web-pod</span>, <span className="text-cyan-400 font-bold">clear</span>.<br />
                  ----------------------------------------------------------------------
                </div>
                {k8sTerminalHistory.map((h, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="flex items-center gap-2 text-green-400">
                      <span>$</span>
                      <span className="text-white font-bold">{h.command}</span>
                    </div>
                    <div className="text-slate-300 whitespace-pre-wrap pl-3 leading-relaxed font-semibold">
                      {h.output}
                    </div>
                  </div>
                ))}
                <div ref={k8sTerminalEndRef} />
              </div>

              <form onSubmit={handleK8sCommand} className="bg-slate-900 border-t border-slate-800 p-2 flex items-center gap-2 shrink-0">
                <span className="text-green-400 font-bold pl-2 select-none">$</span>
                <input
                  type="text"
                  value={k8sInput}
                  onChange={(e) => setK8sInput(e.target.value)}
                  placeholder="Type kubectl command..."
                  className="flex-1 bg-transparent border-none outline-none text-white text-xs font-mono font-bold py-1"
                />
              </form>
            </div>

            {/* Visual Pod Grid / Cluster Overview */}
            <div className={`p-4 rounded-2xl border flex-1 ${isNightMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`text-xs font-black tracking-wider uppercase mb-3 flex items-center gap-2 ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <Layers className="w-4 h-4 text-cyan-400" />
                Cluster Pods Dashboard
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {k8sPods.length === 0 ? (
                  <div className="col-span-full py-6 text-center text-xs text-slate-500 italic">
                    No active pods. Deploy a configuration via kubectl apply!
                  </div>
                ) : (
                  k8sPods.map(p => (
                    <div key={p.name} className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                      isNightMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between gap-1.5 min-w-0">
                        <span className="text-xs font-bold truncate text-slate-300">{p.name}</span>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          p.status === 'Running' ? 'bg-green-500' : p.status === 'Pending' ? 'bg-yellow-500 animate-pulse' : 'bg-orange-500'
                        }`} />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span className={`font-semibold uppercase tracking-wider ${
                          p.status === 'Running' ? 'text-green-400' : p.status === 'Pending' ? 'text-yellow-400' : 'text-orange-400'
                        }`}>{p.status}</span>
                        <span>{p.age}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : isReact ? (
        /* React Live Coding sandbox */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: React Editor */}
          <div className="flex flex-col h-[400px]">
            <div className={`p-3 border border-b-0 rounded-t-2xl flex items-center justify-between shrink-0 ${isNightMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-300">Playground.jsx</span>
              </div>
              <button
                onClick={runReactPreview}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-sky-500/10 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                Update Preview
              </button>
            </div>
            
            <textarea
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 outline-none text-slate-300 text-xs font-mono p-4 resize-none rounded-b-2xl font-medium focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Right Panel: React Preview Output */}
          <div className="flex flex-col gap-6">
            <div className={`p-4 rounded-2xl border flex-1 min-h-[220px] flex flex-col justify-between ${
              isNightMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`text-xs font-black tracking-wider uppercase mb-3 flex items-center gap-2 ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <Code className="w-4 h-4 text-sky-400" />
                Live Preview
              </h3>
              
              <div className="flex-1 flex items-center justify-center py-4 bg-slate-950/40 rounded-xl border border-slate-900/60 min-h-[140px]">
                {reactOutputElement ? (
                  <div key={reactPreviewKey} className="w-full">
                    {reactOutputElement}
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-500 italic">
                    Click "Update Preview" to compile and view.
                  </div>
                )}
              </div>
            </div>

            {/* Build console logs */}
            <div className="h-[120px] bg-slate-955 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs flex flex-col">
              <div className="bg-slate-900 px-4 py-1.5 border-b border-slate-800 flex items-center shrink-0">
                <span className="text-[10px] font-bold text-slate-400">Compiler Logs</span>
              </div>
              <div className="flex-1 p-3 overflow-y-auto space-y-1 text-slate-400 select-text leading-relaxed">
                {reactConsoleLogs.length === 0 ? (
                  <div className="text-slate-600 italic">Console idle. Waiting for compilation trigger...</div>
                ) : (
                  reactConsoleLogs.map((log, i) => (
                    <div key={i} className={
                      log.startsWith('❌') ? 'text-red-400 font-bold' : 
                      log.startsWith('🎉') ? 'text-green-400 font-bold' : 'text-slate-400'
                    }>{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Python, Java, C Sandbox - standard split code editor & output view */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Editor */}
          <div className="flex flex-col h-[400px]">
            <div className={`p-3 border border-b-0 rounded-t-2xl flex items-center justify-between shrink-0 ${isNightMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-300">
                  {isPython && 'main.py'}
                  {isJava && 'Main.java'}
                  {isC && 'main.c'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (isPython) runPythonSimulation();
                  else if (isJava) runJavaSimulation();
                  else if (isC) runCSimulation();
                }}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-cyan-500/10 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                Run Code
              </button>
            </div>
            
            <textarea
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 outline-none text-slate-300 text-xs font-mono p-4 resize-none rounded-b-2xl font-medium focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Right Panel: Compiler/Runner Console */}
          <div className="flex flex-col h-[400px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden font-mono shadow-2xl select-text">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-slate-400">Execution Console</span>
              </div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Output Panel</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs leading-loose font-semibold text-slate-300">
              {consoleOutput.length === 0 ? (
                <div className="text-slate-600 italic">Click "Run Code" above to compile & run code.</div>
              ) : (
                consoleOutput.map((line, i) => (
                  <div key={i} className={line.startsWith('$') ? 'text-cyan-400' : line.startsWith('Error') || line.includes('SyntaxError') ? 'text-red-400' : 'text-slate-300'}>
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// React Custom Previews to provide high fidelity interactions
const ReactCounterPreview: React.FC = () => {
  const [count, setCount] = useState(0);
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-[280px] mx-auto shadow-2xl">
      <h3 className="text-[#38bdf8] font-bold text-sm mb-2">Counter Component</h3>
      <p className="text-3xl text-white font-bold my-4">{count}</p>
      <div className="flex gap-2 justify-center">
        <button onClick={() => setCount(count - 1)} className="px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg cursor-pointer text-xs font-extrabold active:scale-95 transition-all">-</button>
        <button onClick={() => setCount(count + 1)} className="px-3.5 py-1.5 bg-green-500 hover:bg-green-400 text-white rounded-lg cursor-pointer text-xs font-extrabold active:scale-95 transition-all">+</button>
      </div>
    </div>
  );
};

const ReactTogglePreview: React.FC = () => {
  const [show, setShow] = useState(true);
  return (
    <div className="p-5 text-center">
      <button 
        onClick={() => setShow(!show)} 
        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs rounded-xl cursor-pointer active:scale-95 transition-all mb-4"
      >
        {show ? 'Hide message' : 'Show message'}
      </button>
      {show && (
        <p className="text-indigo-300 text-xs font-bold animate-in fade-in duration-200">
          🎉 You've unlocked the secrets of React state management!
        </p>
      )}
    </div>
  );
};

const ReactFormPreview: React.FC = () => {
  const [name, setName] = useState('Guest');
  return (
    <div className="p-4 text-left text-xs max-w-[280px] mx-auto">
      <h3 className="text-green-400 font-bold mb-2 uppercase tracking-wider text-[10px]">Interactive Greetings</h3>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Enter name"
        className="w-full p-2 rounded-lg border border-slate-700 bg-slate-900 text-white mb-3 text-xs outline-none focus:ring-1 focus:ring-green-400"
      />
      <p className="text-slate-300">
        Hello, <strong className="text-amber-400 font-black">{name || 'stranger'}</strong>! Welcome to your sandbox playground.
      </p>
    </div>
  );
};

const ReactCustomFallback: React.FC<{ code: string }> = ({ code }) => {
  const titleMatch = code.match(/<h3>([\s\S]*?)<\/h3>/) || code.match(/color:\s*'#38bdf8'[^>]*>([\s\S]*?)<\/h3>/);
  const textMatch = code.match(/<p>([\s\S]*?)<\/p>/) || code.match(/color:\s*'#fff'[^>]*>([\s\S]*?)<\/p>/);
  
  const parsedTitle = titleMatch ? titleMatch[1].replace(/\{[^}]+\}/g, '').trim() : 'React Custom Playground';
  const parsedText = textMatch ? textMatch[1].replace(/\{[^}]+\}/g, '').trim() : 'Rendering user customized React component layout.';

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-[280px] mx-auto shadow-2xl">
      <h3 className="text-sky-400 font-bold text-sm mb-2">{parsedTitle}</h3>
      <p className="text-xs text-slate-300 my-4">{parsedText}</p>
      <div className="px-3 py-1.5 rounded-lg bg-sky-950/20 border border-sky-900/40 text-[10px] text-sky-300 font-bold uppercase tracking-wider">
        Active Interactive View
      </div>
    </div>
  );
};
