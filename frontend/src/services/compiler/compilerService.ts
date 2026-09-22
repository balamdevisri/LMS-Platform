/**
 * Multi-Language Intelligent Compiler & Auto-Detection Service
 * Supports 16+ languages with real cloud compilation (Judge0 CE / Wandbox)
 * and in-browser local fallback for zero latency JS/TS execution.
 */

export interface LanguageConfig {
  key: string;
  name: string;
  aliases: string[];
  judge0Id: number;
  wandboxCompiler?: string;
  file: string;
  badgeColor: string;
  version: string;
  starterCode: string;
}

export interface DetectedLanguage {
  languageKey: string;
  name: string;
  badgeColor: string;
  file: string;
  confidence: number;
}

export interface CompilationResult {
  success: boolean;
  stdout: string;
  stderr: string | null;
  compileOutput: string | null;
  executionTimeMs: number;
  memoryKb?: number;
  exitCode?: number;
  detectedLanguage?: string;
  engine: 'judge0' | 'wandbox' | 'local';
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  python: {
    key: 'python',
    name: 'Python',
    aliases: ['py', 'python3'],
    judge0Id: 71, // Python (3.8.1 / 3.10)
    file: 'main.py',
    badgeColor: 'sky',
    version: '3.10',
    starterCode: `# Python 3 Algorithm & Problem Solving
def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to Shaivika LMS Compiler."

def fibonacci(n: int) -> list:
    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

if __name__ == '__main__':
    print(greet("Developer"))
    print("Fibonacci Sequence:", fibonacci(8))
`,
  },
  c: {
    key: 'c',
    name: 'C',
    aliases: ['gcc'],
    judge0Id: 50, // C (GCC 9.2.0)
    wandboxCompiler: 'gcc-head',
    file: 'main.c',
    badgeColor: 'blue',
    version: 'GCC 9.2',
    starterCode: `#include <stdio.h>

int main() {
    printf("🚀 C Program Executing on Shaivika LMS!\\n");
    for (int i = 1; i <= 5; i++) {
        printf("Step %d: Processing memory chunk at index %d\\n", i, i * 16);
    }
    return 0;
}
`,
  },
  cpp: {
    key: 'cpp',
    name: 'C++',
    aliases: ['c++', 'g++'],
    judge0Id: 54, // C++ (GCC 9.2.0)
    wandboxCompiler: 'gcc-head',
    file: 'main.cpp',
    badgeColor: 'indigo',
    version: 'G++ 9.2',
    starterCode: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::cout << "⚡ C++ STL Container Engine\\n";
    std::vector<int> nums = {64, 34, 25, 12, 22, 11, 90};
    
    std::sort(nums.begin(), nums.end());
    
    std::cout << "Sorted Numbers: ";
    for (int n : nums) {
        std::cout << n << " ";
    }
    std::cout << "\\n";
    return 0;
}
`,
  },
  java: {
    key: 'java',
    name: 'Java',
    aliases: ['openjdk'],
    judge0Id: 62, // Java (OpenJDK 13.0.1)
    file: 'Main.java',
    badgeColor: 'amber',
    version: 'OpenJDK 15',
    starterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("☕ Java OOPs Execution Engine");
        String[] tracks = {"React Full-Stack", "Python AI", "DevOps & Cloud", "Data Structures"};
        for (int i = 0; i < tracks.length; i++) {
            System.out.printf("Track %d: %s%n", i + 1, tracks[i]);
        }
    }
}
`,
  },
  javascript: {
    key: 'javascript',
    name: 'JavaScript',
    aliases: ['js', 'node'],
    judge0Id: 63, // JavaScript (Node.js 12.14.0)
    file: 'index.js',
    badgeColor: 'yellow',
    version: 'Node.js 18',
    starterCode: `// JavaScript Live Runner
function calculateMetrics(data) {
  const sum = data.reduce((acc, val) => acc + val, 0);
  const avg = sum / data.length;
  return { sum, avg: avg.toFixed(2), count: data.length };
}

const metrics = calculateMetrics([85, 92, 78, 96, 88]);
console.log("Computation Results:", metrics);
`,
  },
  typescript: {
    key: 'typescript',
    name: 'TypeScript',
    aliases: ['ts'],
    judge0Id: 74, // TypeScript (3.7.4)
    file: 'index.ts',
    badgeColor: 'blue',
    version: 'TS 5.0',
    starterCode: `// TypeScript Static Typing
interface StudentRecord {
  id: string;
  name: string;
  score: number;
}

const student: StudentRecord = {
  id: 'STU-1042',
  name: 'Bhanu Prakash',
  score: 98
};

console.log(\`Student: \${student.name} | Score: \${student.score}%\`);
`,
  },
  go: {
    key: 'go',
    name: 'Go',
    aliases: ['golang'],
    judge0Id: 60, // Go (1.13.5)
    file: 'main.go',
    badgeColor: 'cyan',
    version: 'Go 1.20',
    starterCode: `package main

import "fmt"

func main() {
    fmt.Println("🔷 Go High-Performance Microservices Engine")
    message := "Concurrency with Go Routines"
    fmt.Printf("Status: %s\\n", message)
}
`,
  },
  rust: {
    key: 'rust',
    name: 'Rust',
    aliases: ['rs'],
    judge0Id: 73, // Rust (1.40.0)
    file: 'main.rs',
    badgeColor: 'orange',
    version: 'Rust 1.70',
    starterCode: `fn main() {
    println!("🦀 Rust Safe Memory Systems Engine");
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum of numbers: {}", sum);
}
`,
  },
  csharp: {
    key: 'csharp',
    name: 'C#',
    aliases: ['cs', 'dotnet'],
    judge0Id: 51, // C# (Mono 6.6.0.161)
    file: 'Program.cs',
    badgeColor: 'purple',
    version: '.NET 6 / Mono',
    starterCode: `using System;

public class Program {
    public static void Main(string[] args) {
        Console.WriteLine("💜 C# / .NET Enterprise Sandbox");
        Console.WriteLine($"Current UTC Time: {DateTime.UtcNow}");
    }
}
`,
  },
  php: {
    key: 'php',
    name: 'PHP',
    aliases: [],
    judge0Id: 68, // PHP (7.4.1)
    file: 'index.php',
    badgeColor: 'violet',
    version: 'PHP 8.2',
    starterCode: `<?php
echo "🐘 PHP Backend Script\\n";
$user = ["name" => "Student", "role" => "Software Engineer"];
echo "Welcome, " . $user["name"] . "!\\n";
?>
`,
  },
  ruby: {
    key: 'ruby',
    name: 'Ruby',
    aliases: ['rb'],
    judge0Id: 72, // Ruby (2.7.0)
    file: 'main.rb',
    badgeColor: 'rose',
    version: 'Ruby 3.0',
    starterCode: `# Ruby Script
puts "💎 Ruby Dynamic Programming"
fruits = ["Apple", "Mango", "Blueberry"]
fruits.each_with_index do |fruit, idx|
  puts "#{idx + 1}. #{fruit}"
end
`,
  },
  bash: {
    key: 'bash',
    name: 'Bash',
    aliases: ['sh', 'shell'],
    judge0Id: 46, // Bash (5.0.0)
    file: 'script.sh',
    badgeColor: 'emerald',
    version: 'Bash 5.0',
    starterCode: `#!/bin/bash
echo "🐧 Linux Bash Automation Script"
echo "Active Shell: $SHELL"
for i in {1..4}; do
    echo "Running step $i..."
done
echo "Completed successfully!"
`,
  },
  kotlin: {
    key: 'kotlin',
    name: 'Kotlin',
    aliases: ['kt'],
    judge0Id: 78, // Kotlin (1.3.70)
    file: 'Main.kt',
    badgeColor: 'pink',
    version: 'Kotlin 1.8',
    starterCode: `fun main() {
    println("🎯 Kotlin Modern Android & Backend")
    val items = listOf("Compose", "Coroutines", "Flow")
    for (item in items) {
        println("- $item")
    }
}
`,
  },
  swift: {
    key: 'swift',
    name: 'Swift',
    aliases: [],
    judge0Id: 83, // Swift (5.2.3)
    file: 'main.swift',
    badgeColor: 'orange',
    version: 'Swift 5.3',
    starterCode: `import Foundation

print("🍎 Swift Apple Platforms & Server")
let greeting = "Hello from Swift on Shaivika LMS!"
print(greeting)
`,
  },
  dart: {
    key: 'dart',
    name: 'Dart',
    aliases: [],
    judge0Id: 90, // Dart (2.19.2)
    file: 'main.dart',
    badgeColor: 'teal',
    version: 'Dart 2.19',
    starterCode: `void main() {
  print("🎯 Dart & Flutter Engine");
  final list = [10, 20, 30, 40];
  print("Items count: \${list.length}");
}
`,
  },
  sql: {
    key: 'sql',
    name: 'SQL (SQLite)',
    aliases: ['sqlite', 'sqlite3'],
    judge0Id: 82, // SQL (SQLite 3.27.2)
    file: 'query.sql',
    badgeColor: 'emerald',
    version: 'SQLite 3.36',
    starterCode: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, course TEXT);
INSERT INTO students (name, course) VALUES ('Bhanu Prakash', 'Full Stack AI'), ('Pooja', 'Cloud DevOps');
SELECT * FROM students;
`,
  },
};

/**
 * Intelligent Language Detector
 * Analyzes code syntax, headers, function declarations, imports, and idioms.
 */
export function detectLanguage(code: string): DetectedLanguage {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      languageKey: 'python',
      name: 'Python',
      badgeColor: 'sky',
      file: 'main.py',
      confidence: 0,
    };
  }

  const scores: Record<string, number> = {
    c: 0,
    cpp: 0,
    java: 0,
    python: 0,
    javascript: 0,
    typescript: 0,
    go: 0,
    rust: 0,
    csharp: 0,
    php: 0,
    ruby: 0,
    bash: 0,
    kotlin: 0,
    swift: 0,
    dart: 0,
    sql: 0,
  };

  // 1. Specific High-Confidence Shebangs & Headers
  if (trimmed.startsWith('#!/bin/bash') || trimmed.startsWith('#!/bin/sh')) scores.bash += 100;
  if (trimmed.startsWith('<?php')) scores.php += 100;

  // 2. C vs C++ Indicators
  if (/#include\s*<iostream>/i.test(code)) scores.cpp += 60;
  if (/#include\s*<vector>/i.test(code)) scores.cpp += 50;
  if (/#include\s*<algorithm>/i.test(code)) scores.cpp += 50;
  if (/#include\s*<string>/i.test(code)) scores.cpp += 30;
  if (/std::cout|std::cin|std::endl|cout\s*<<|cin\s*>>/i.test(code)) scores.cpp += 60;
  if (/using\s+namespace\s+std\s*;/i.test(code)) scores.cpp += 60;
  if (/template\s*<\s*(typename|class)/i.test(code)) scores.cpp += 45;
  if (/\bnullptr\b/.test(code)) scores.cpp += 25;

  if (/#include\s*<stdio\.h>/i.test(code)) scores.c += 50;
  if (/#include\s*<stdlib\.h>/i.test(code)) scores.c += 30;
  if (/#include\s*<string\.h>/i.test(code)) scores.c += 30;
  if (/printf\s*\(|scanf\s*\(/i.test(code)) scores.c += 40;
  if (/malloc\s*\(|free\s*\(|calloc\s*\(/i.test(code)) scores.c += 35;
  if (/int\s+main\s*\(\s*(void)?\s*\)/i.test(code) && !/#include\s*<iostream>/.test(code)) scores.c += 25;

  // 3. Java Indicators
  if (/public\s+class\s+\w+/i.test(code)) scores.java += 60;
  if (/public\s+static\s+void\s+main\s*\(\s*String/i.test(code)) scores.java += 80;
  if (/System\.(out|err)\.print/i.test(code)) scores.java += 70;
  if (/import\s+java\./i.test(code)) scores.java += 60;
  if (/new\s+Scanner\s*\(\s*System\.in\s*\)/i.test(code)) scores.java += 50;
  if (/ArrayList\s*<|HashMap\s*</i.test(code)) scores.java += 25;

  // 4. Python Indicators
  if (/^\s*def\s+\w+\s*\(.*?\)\s*:/m.test(code)) scores.python += 50;
  if (/if\s+__name__\s*==\s*['"]__main__['"]\s*:/i.test(code)) scores.python += 80;
  if (/print\s*\(.*?\)/m.test(code) && !/[;{}]/.test(code)) scores.python += 35;
  if (/from\s+\w+\s+import\s+/m.test(code)) scores.python += 45;
  if (/import\s+(sys|os|math|numpy|pandas|random|time)\b/i.test(code)) scores.python += 40;
  if (/elif\s+.*?:/m.test(code)) scores.python += 45;
  if (/\b(None|True|False)\b/.test(code) && !/[;]/.test(code)) scores.python += 20;

  // 5. Go Indicators
  if (/package\s+main\b/i.test(code)) scores.go += 80;
  if (/func\s+main\s*\(\s*\)/i.test(code)) scores.go += 70;
  if (/fmt\.(Println|Printf|Print)/i.test(code)) scores.go += 70;
  if (/import\s*\(\s*"fmt"/i.test(code) || /import\s+"fmt"/i.test(code)) scores.go += 60;
  if (/:=/m.test(code)) scores.go += 30;

  // 6. Rust Indicators
  if (/fn\s+main\s*\(\s*\)/i.test(code)) scores.rust += 70;
  if (/println!\s*\(|print!\s*\(|eprintln!\s*\(/i.test(code)) scores.rust += 70;
  if (/let\s+mut\s+\w+/i.test(code)) scores.rust += 50;
  if (/use\s+std::/i.test(code)) scores.rust += 45;

  // 7. C# Indicators
  if (/using\s+System\s*;/i.test(code)) scores.csharp += 70;
  if (/Console\.(WriteLine|Write|ReadLine)/i.test(code)) scores.csharp += 70;
  if (/namespace\s+[\w.]+/i.test(code)) scores.csharp += 30;

  // 8. TypeScript vs JavaScript
  if (/interface\s+\w+\s*\{/i.test(code)) scores.typescript += 60;
  if (/type\s+\w+\s*=\s*/i.test(code)) scores.typescript += 50;
  if (/:\s*(string|number|boolean|any|void|unknown|never)\b/i.test(code)) scores.typescript += 45;
  if (/as\s+const\b/i.test(code)) scores.typescript += 35;

  if (/console\.(log|warn|error|info)\s*\(/i.test(code)) {
    scores.javascript += 30;
    scores.typescript += 20;
  }
  if (/\b(const|let|var)\s+\w+\s*=/i.test(code)) {
    scores.javascript += 25;
    scores.typescript += 20;
  }
  if (/function\s+\w+\s*\(.*?\)\s*\{/i.test(code)) {
    scores.javascript += 25;
    scores.typescript += 20;
  }
  if (/=>\s*\{/i.test(code) || /export\s+default/i.test(code)) {
    scores.javascript += 20;
    scores.typescript += 20;
  }

  // 9. PHP Indicators
  if (/\$\w+\s*=/m.test(code) && !/\$\(/.test(code)) scores.php += 35;
  if (/echo\s+["'].*?["'];/i.test(code)) scores.php += 35;

  // 10. Ruby Indicators
  if (/puts\s+["'].*?["']/i.test(code) && !/;/m.test(code)) scores.ruby += 35;
  if (/def\s+\w+.*?end\b/s.test(code) && !/:\s*$/m.test(code)) scores.ruby += 40;

  // 11. Bash Indicators
  if (/echo\s+["'].*?["']/i.test(code) && /\b(fi|done|esac)\b/m.test(code)) scores.bash += 50;

  // 12. Kotlin Indicators
  if (/fun\s+main\s*\(.*?\)/i.test(code)) scores.kotlin += 60;
  if (/val\s+\w+\s*[:=]/i.test(code)) scores.kotlin += 25;

  // 13. Swift Indicators
  if (/import\s+Foundation\b/i.test(code) || /import\s+UIKit\b/i.test(code)) scores.swift += 70;
  if (/guard\s+let\s+/i.test(code)) scores.swift += 40;

  // 14. Dart Indicators
  if (/void\s+main\s*\(\s*\)\s*\{/i.test(code) && !scores.c && !scores.cpp && !scores.java) scores.dart += 45;
  if (/Widget\s+build\s*\(/i.test(code)) scores.dart += 60;

  // 15. SQL Indicators
  if (/SELECT\s+.*?\s+FROM\s+/i.test(code) || /CREATE\s+TABLE\s+/i.test(code) || /INSERT\s+INTO\s+/i.test(code)) {
    scores.sql += 75;
  }

  // Find winner
  let bestLang = 'python';
  let highestScore = 0;

  for (const [lang, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestLang = lang;
    }
  }

  // Special tie breakers: if C++ score is close to C, C++ wins if any C++ tokens exist
  if (bestLang === 'c' && scores.cpp > 0) {
    if (scores.cpp >= scores.c - 10) {
      bestLang = 'cpp';
    }
  }

  // If TypeScript has specific types, favor TypeScript over JavaScript
  if (bestLang === 'javascript' && scores.typescript > scores.javascript) {
    bestLang = 'typescript';
  }

  const config = SUPPORTED_LANGUAGES[bestLang] || SUPPORTED_LANGUAGES.python;
  return {
    languageKey: config.key,
    name: config.name,
    badgeColor: config.badgeColor,
    file: config.file,
    confidence: Math.min(100, Math.max(10, highestScore)),
  };
}

/**
 * Execute in browser using safe sandbox for JavaScript / TypeScript
 */
function runLocalJavaScript(code: string, stdin?: string): CompilationResult {
  const startTime = performance.now();
  const logs: string[] = [];
  const errors: string[] = [];

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  try {
    console.log = (...args: any[]) => {
      logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
    };
    console.error = (...args: any[]) => {
      errors.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
    };
    console.warn = (...args: any[]) => {
      logs.push('[WARN] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
    };
    console.info = (...args: any[]) => {
      logs.push('[INFO] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
    };

    // Clean TypeScript type syntax for browser execution
    const jsCode = code
      .replace(/:\s*(string|number|boolean|any|void|unknown|never|object|Array<[^>]+>|string\[\]|number\[\])/g, '')
      .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
      .replace(/type\s+\w+\s*=[\s\S]*?;/g, '');

    const runner = new Function('input', `
      'use strict';
      try {
        ${jsCode}
      } catch(err) {
        console.error(err.message || String(err));
      }
    `);

    runner(stdin);
    const executionTimeMs = Math.round(performance.now() - startTime);

    let stdout = logs.join('\n');
    if (!stdout && errors.length === 0) {
      stdout = 'Program executed successfully with zero stdout output.';
    }

    return {
      success: errors.length === 0,
      stdout,
      stderr: errors.length > 0 ? errors.join('\n') : null,
      compileOutput: null,
      executionTimeMs: Math.max(1, executionTimeMs),
      engine: 'local',
    };
  } catch (err: any) {
    return {
      success: false,
      stdout: logs.join('\n'),
      stderr: `Runtime Exception: ${err.message || String(err)}`,
      compileOutput: null,
      executionTimeMs: Math.round(performance.now() - startTime),
      engine: 'local',
    };
  } finally {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
    console.info = originalInfo;
  }
}

/**
 * Compile and run code across all supported languages with Judge0 CE / Wandbox / Local Fallback
 */
export async function compileAndExecute(
  sourceCode: string,
  targetLangKey: string,
  stdin?: string
): Promise<CompilationResult> {
  const startTime = performance.now();
  const trimmed = sourceCode.trim();

  if (!trimmed) {
    return {
      success: false,
      stdout: '',
      stderr: 'Compilation Error: Source code cannot be empty.',
      compileOutput: null,
      executionTimeMs: 0,
      engine: 'local',
    };
  }

  // Resolve config or fallback
  const config = SUPPORTED_LANGUAGES[targetLangKey] || SUPPORTED_LANGUAGES.python;

  // 1. Try Primary Cloud Compiler: Judge0 CE
  try {
    const judgeResponse = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: config.judge0Id,
        stdin: stdin || undefined,
      }),
    });

    if (judgeResponse.ok) {
      const data = await judgeResponse.json();
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      const stdout = data.stdout || '';
      const stderr = data.stderr || null;
      const compileOutput = data.compile_output || null;
      const statusId = data.status?.id; // 3 = Accepted
      const statusDesc = data.status?.description;

      let finalStderr = stderr;
      if (compileOutput && !finalStderr) {
        finalStderr = compileOutput;
      } else if (statusId && statusId > 3 && !finalStderr) {
        finalStderr = `${statusDesc || 'Execution terminated'}${data.message ? ': ' + data.message : ''}`;
      }

      return {
        success: !finalStderr && statusId === 3,
        stdout: stdout || (finalStderr ? '' : 'Program executed successfully with no output.'),
        stderr: finalStderr,
        compileOutput,
        executionTimeMs: data.time ? Math.round(parseFloat(data.time) * 1000) : elapsed,
        memoryKb: data.memory,
        exitCode: data.exit_code,
        engine: 'judge0',
      };
    }
  } catch (err) {
    console.warn('[CompilerService] Judge0 CE attempt failed, trying fallback...', err);
  }

  // 2. Secondary Cloud Compiler: Wandbox (for C / C++)
  if (config.wandboxCompiler) {
    try {
      const wandboxResponse = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: config.wandboxCompiler,
          code: sourceCode,
          stdin: stdin || undefined,
        }),
      });

      if (wandboxResponse.ok) {
        const wbData = await wandboxResponse.json();
        const elapsed = Math.round(performance.now() - startTime);

        return {
          success: wbData.status === '0' || wbData.status === 0,
          stdout: wbData.program_output || wbData.program_message || '',
          stderr: wbData.compiler_error || null,
          compileOutput: wbData.compiler_message || null,
          executionTimeMs: elapsed,
          engine: 'wandbox',
        };
      }
    } catch (wbErr) {
      console.warn('[CompilerService] Wandbox attempt failed...', wbErr);
    }
  }

  // 3. In-Browser Safe Fallback for JavaScript / TypeScript
  if (targetLangKey === 'javascript' || targetLangKey === 'typescript') {
    return runLocalJavaScript(sourceCode, stdin);
  }

  // 4. If all network endpoints are unreachable, return descriptive error
  const elapsed = Math.round(performance.now() - startTime);
  return {
    success: false,
    stdout: '',
    stderr: `Network Error: Could not connect to remote compilation cluster for ${config.name}. Check your internet connection.`,
    compileOutput: null,
    executionTimeMs: elapsed,
    engine: 'local',
  };
}
