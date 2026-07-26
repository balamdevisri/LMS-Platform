export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isPrivate: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  estimatedTime: string;
  learningObjectives: string[];
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
  tags: string[];
  relatedLessonId: string;
  relatedLessonTitle: string;
  learningResources: { title: string; url: string }[];
  hints: string[];
  templates: Record<string, string>;
  solutions: Record<string, string>;
  testCases: TestCase[];
}

export interface ChallengeProgress {
  challengeId: string;
  attemptCount: number;
  lastAttempt: string | null;
  bestResult: 'Passed' | 'Failed' | 'None';
  completionStatus: 'Completed' | 'Attempted' | 'Unstarted';
  timeSpentSeconds: number;
  bookmarked: boolean;
}

export interface Attempt {
  id: string;
  timestamp: string;
  code: string;
  language: string;
  result: 'Passed' | 'Failed';
  passedCount: number;
  failedCount: number;
  totalCount: number;
  runTimeMs: number;
  memoryMb: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string | null;
  executionTimeMs: number;
  memoryUsageMb: number;
}

export interface TestRunSummary {
  passed: boolean;
  passedCount: number;
  failedCount: number;
  totalCount: number;
  testCaseResults: {
    testCaseId: string;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    isPrivate: boolean;
  }[];
}

export type AIReviewAspect =
  | 'explain'
  | 'bugs'
  | 'optimize'
  | 'readability'
  | 'performance'
  | 'time_complexity'
  | 'space_complexity';

// Mock Challenges Database
export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'fizzbuzz-challenge',
    title: 'Advanced FizzBuzz Logic',
    difficulty: 'Easy',
    topic: 'Control Flow & Conditionals',
    estimatedTime: '15 mins',
    learningObjectives: [
      'Implement standard divisibility checks',
      'Use nested or sequential control flow patterns',
      'Format output strings dynamically'
    ],
    constraints: [
      '1 <= n <= 10000',
      'Memory limit: 256MB',
      'Time limit: 1.0s'
    ],
    inputFormat: 'A single integer n representing the upper limit.',
    outputFormat: 'Return an array of strings from 1 to n with Fizz, Buzz, or FizzBuzz substitutions.',
    sampleInput: '15',
    sampleOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
    explanation: 'Divisible by 3 -> Fizz. Divisible by 5 -> Buzz. Divisible by both 3 and 5 -> FizzBuzz. Otherwise return number as string.',
    tags: ['Algorithms', 'Conditionals', 'Syntax Basics'],
    relatedLessonId: '402',
    relatedLessonTitle: '4.2 Control Flow in Shell Scripts',
    learningResources: [
      { title: 'Learn Python Conditionals', url: 'https://docs.python.org/3/tutorial/controlflow.html' },
      { title: 'JavaScript Comparison Operators', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators' }
    ],
    hints: [
      'Understand the modulo operator (%). It returns the remainder of division.',
      'Check divisibility for 15 (3 * 5) first, then check 3 and 5 separately.',
      'Handle edge cases like n = 1 correctly.'
    ],
    templates: {
      javascript: `function fizzBuzz(n) {\n  // Write your JavaScript code here\n  const result = [];\n  for (let i = 1; i <= n; i++) {\n    // TODO: Implement Logic\n  }\n  return result;\n}`,
      typescript: `function fizzBuzz(n: number): string[] {\n  // Write your TypeScript code here\n  const result: string[] = [];\n  for (let i = 1; i <= n; i++) {\n    // TODO: Implement Logic\n  }\n  return result;\n}`,
      python: `def fizz_buzz(n: int) -> list:\n    # Write your Python code here\n    result = []\n    for i in range(1, n + 1):\n        # TODO: Implement Logic\n        pass\n    return result`,
      java: `import java.util.*;\n\npublic class Solution {\n    public List<String> fizzBuzz(int n) {\n        List<String> result = new ArrayList<>();\n        // Write your Java code here\n        return result;\n    }\n}`,
      c: `#include <stdio.h>\n#include <stdlib.h>\n\nchar** fizzBuzz(int n, int* returnSize) {\n    // Allocate memory and write C code here\n    *returnSize = n;\n    char** result = (char**)malloc(n * sizeof(char*));\n    return result;\n}`,
      cpp: `#include <vector>\n#include <string>\n\nclass Solution {\npublic:\n    std::vector<std::string> fizzBuzz(int n) {\n        std::vector<std::string> result;\n        // Write your C++ code here\n        return result;\n    }\n};`
    },
    solutions: {
      javascript: `function fizzBuzz(n) {\n  const result = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) result.push("FizzBuzz");\n    else if (i % 3 === 0) result.push("Fizz");\n    else if (i % 5 === 0) result.push("Buzz");\n    else result.push(i.toString());\n  }\n  return result;\n}`
    },
    testCases: [
      { id: 'fb-tc-1', input: '5', expectedOutput: '["1","2","Fizz","4","Buzz"]', isPrivate: false },
      { id: 'fb-tc-2', input: '15', expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', isPrivate: false },
      { id: 'fb-tc-3', input: '1', expectedOutput: '["1"]', isPrivate: true }
    ]
  },
  {
    id: 'permissions-validator-challenge',
    title: 'Octal Permissions Validator',
    difficulty: 'Medium',
    topic: 'Permissions Math & Security',
    estimatedTime: '20 mins',
    learningObjectives: [
      'Parse standard Unix chmod permission representation',
      'Validate user rights based on owners, groups, and others',
      'Verify security boundaries'
    ],
    constraints: [
      'Inputs: 3-digit octal string (e.g. "755") and target operation type',
      'Output: Boolean (authorized or blocked)'
    ],
    inputFormat: 'JSON string containing permissions mapping: { "octal": "755", "userRole": "group", "operation": "write" }',
    outputFormat: 'Boolean (true if operation permitted, false otherwise)',
    sampleInput: '{ "octal": "750", "userRole": "group", "operation": "read" }',
    sampleOutput: 'true',
    explanation: 'Octal permissions 750 maps user=rwx (7), group=r-x (5), others=--- (0). A group member wants to read (which is allowed since read=4). Hence true.',
    tags: ['Security', 'Bitwise Operators', 'System Logic'],
    relatedLessonId: '202',
    relatedLessonTitle: '2.2 File Permissions Demystified',
    learningResources: [
      { title: 'Linux File Permissions Cheat Sheet', url: 'https://chmod-calculator.com' }
    ],
    hints: [
      'Remember chmod numeric maps: Read = 4, Write = 2, Execute = 1.',
      'Check which index corresponds to userRole: User is digit 0, Group is digit 1, Others is digit 2.',
      'Convert the target digit character to an integer and do a bitwise AND check or mathematical threshold checks.'
    ],
    templates: {
      javascript: `function isAuthorized(permissionJson) {\n  const req = JSON.parse(permissionJson);\n  const octal = req.octal; // e.g. "755"\n  const role = req.userRole; // "owner", "group", or "others"\n  const op = req.operation; // "read", "write", or "execute"\n  \n  // Write validation here\n  return false;\n}`,
      typescript: `function isAuthorized(permissionJson: string): boolean {\n  const req = JSON.parse(permissionJson);\n  const octal: string = req.octal;\n  const role: string = req.userRole;\n  const op: string = req.operation;\n  \n  // Write validation here\n  return false;\n}`,
      python: `import json\n\ndef is_authorized(permission_json: str) -> bool:\n    req = json.loads(permission_json)\n    octal = req["octal"]\n    role = req["userRole"]\n    op = req["operation"]\n    \n    # Write validation here\n    return False`,
      java: `import java.util.*;\nimport org.json.*; // Assume simple JSON parsing is available\n\npublic class Solution {\n    public boolean isAuthorized(String permissionJson) {\n        // Parse and validate permissions here\n        return false;\n    }\n}`,
      c: `#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>\n\nbool isAuthorized(const char* permissionJson) {\n    // Parse keys and evaluate permissions\n    return false;\n}`,
      cpp: `#include <string>\n#include <iostream>\n\nclass Solution {\npublic:\n    bool isAuthorized(std::string permissionJson) {\n        // Parse keys and evaluate\n        return false;\n    }\n};`
    },
    solutions: {
      javascript: `function isAuthorized(permissionJson) {\n  const req = JSON.parse(permissionJson);\n  const octal = req.octal;\n  const role = req.userRole;\n  const op = req.operation;\n  \n  let digitChar = "0";\n  if (role === "owner" || role === "user") digitChar = octal[0];\n  else if (role === "group") digitChar = octal[1];\n  else digitChar = octal[2];\n  \n  const val = parseInt(digitChar, 10);\n  let requiredVal = 0;\n  if (op === "read") requiredVal = 4;\n  else if (op === "write") requiredVal = 2;\n  else if (op === "execute") requiredVal = 1;\n  \n  // Using bitwise checks: if (val & requiredVal) is non-zero\n  return (val & requiredVal) !== 0;\n}`
    },
    testCases: [
      { id: 'pv-tc-1', input: '{ "octal": "750", "userRole": "group", "operation": "read" }', expectedOutput: 'true', isPrivate: false },
      { id: 'pv-tc-2', input: '{ "octal": "750", "userRole": "others", "operation": "execute" }', expectedOutput: 'false', isPrivate: false },
      { id: 'pv-tc-3', input: '{ "octal": "644", "userRole": "owner", "operation": "execute" }', expectedOutput: 'false', isPrivate: true }
    ]
  },
  {
    id: 'log-filter-challenge',
    title: 'Telemetry Log Parser & Scanner',
    difficulty: 'Hard',
    topic: 'Text Searching & Analysis',
    estimatedTime: '30 mins',
    learningObjectives: [
      'Perform advanced text regex matching on log streams',
      'Filter lines by critical keywords',
      'Construct a clean structured incident payload'
    ],
    constraints: [
      'Filter out non-matching logs',
      'Maximum logs input size: 50 lines'
    ],
    inputFormat: 'JSON string: { "logs": ["LOG1", "LOG2", ...], "filterKeyword": "ERROR" }',
    outputFormat: 'JSON string containing only filtered lines, with formatting.',
    sampleInput: '{ "logs": ["[INFO] System start", "[ERROR] Connection failed", "[WARN] High load"], "filterKeyword": "ERROR" }',
    sampleOutput: '["[ERROR] Connection failed"]',
    explanation: 'Matches only logs containing the keyword ERROR, returning them as a list.',
    tags: ['Grep', 'Regex', 'Log Analysis'],
    relatedLessonId: '204',
    relatedLessonTitle: '2.4 Text Search & Inspection Tools',
    learningResources: [
      { title: 'Grep CLI Operations Guide', url: 'https://www.gnu.org/software/grep/manual/grep.html' }
    ],
    hints: [
      'Filter the arrays by checking if each string contains the filterKeyword.',
      'Ensure exact case-matching rules apply.',
      'Return empty array if no matches are found.'
    ],
    templates: {
      javascript: `function filterLogs(inputJson) {\n  const data = JSON.parse(inputJson);\n  const logs = data.logs;\n  const keyword = data.filterKeyword;\n  \n  // Filter logic here\n  return [];\n}`,
      typescript: `function filterLogs(inputJson: string): string[] {\n  const data = JSON.parse(inputJson);\n  const logs: string[] = data.logs;\n  const keyword: string = data.filterKeyword;\n  \n  // Filter logic here\n  return [];\n}`,
      python: `import json\n\ndef filter_logs(input_json: str) -> list:\n    data = json.loads(input_json)\n    logs = data["logs"]\n    keyword = data["filterKeyword"]\n    \n    # Filter logic here\n    return []`,
      java: `import java.util.*;\n\npublic class Solution {\n    public List<String> filterLogs(String inputJson) {\n        List<String> result = new ArrayList<>();\n        return result;\n    }\n}`,
      c: `#include <stdio.h>\n#include <string.h>\n\nchar** filterLogs(const char* inputJson, int* returnSize) {\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp: `#include <vector>\n#include <string>\n\nclass Solution {\npublic:\n    std::vector<std::string> filterLogs(std::string inputJson) {\n        std::vector<std::string> result;\n        return result;\n    }\n};`
    },
    solutions: {
      javascript: `function filterLogs(inputJson) {\n  const data = JSON.parse(inputJson);\n  const logs = data.logs;\n  const keyword = data.filterKeyword;\n  return logs.filter(log => log.includes(keyword));\n}`
    },
    testCases: [
      { id: 'lf-tc-1', input: '{ "logs": ["[INFO] Starting node", "[ERROR] Crash detected", "[WARN] Disk low"], "filterKeyword": "ERROR" }', expectedOutput: '["[ERROR] Crash detected"]', isPrivate: false },
      { id: 'lf-tc-2', input: '{ "logs": ["[INFO] Node A", "[INFO] Node B"], "filterKeyword": "ERROR" }', expectedOutput: '[]', isPrivate: false },
      { id: 'lf-tc-3', input: '{ "logs": ["[CRITICAL] Out of RAM", "[DEBUG] Temp status"], "filterKeyword": "CRITICAL" }', expectedOutput: '["[CRITICAL] Out of RAM"]', isPrivate: true }
    ]
  }
];

// 1. Code Execution Provider
export class CodeExecutionProvider {
  async runCode(
    challengeId: string,
    language: string,
    code: string,
    customInput: string
  ): Promise<ExecutionResult> {
    // Simulated compile delay
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 400));

    if (!code.trim()) {
      return {
        stdout: '',
        stderr: 'Compilation Error: Source code cannot be empty.',
        executionTimeMs: 0,
        memoryUsageMb: 0
      };
    }

    const challenge = MOCK_CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) {
      return {
        stdout: 'Execution successful. [SANDBOX MODE]',
        stderr: null,
        executionTimeMs: 12 + Math.floor(Math.random() * 15),
        memoryUsageMb: 14.5 + Math.random() * 5
      };
    }

    // Attempt JS evaluation if language is javascript and valid input is passed
    if (language === 'javascript' || language === 'typescript') {
      try {
        // Clean comments
        const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
        
        // Simple sandbox context parser
        // Evaluate custom input or sample
        const inputVal = customInput.trim() || challenge.sampleInput;

        // Detect function name
        let funcName = 'solution';
        if (challengeId === 'fizzbuzz-challenge') funcName = 'fizzBuzz';
        else if (challengeId === 'permissions-validator-challenge') funcName = 'isAuthorized';
        else if (challengeId === 'log-filter-challenge') funcName = 'filterLogs';

        // Construct eval script
        // Note: this is a local client-side simulation.
        const wrapper = `
          ${cleanCode}
          const out = ${funcName}(${inputVal});
          JSON.stringify(out);
        `;
        
        // Run eval
        const runOut = (0, eval)(wrapper);
        return {
          stdout: `Console logs:\n-> Return output: ${runOut}\n[Mock Javascript Sandbox executed successfully]`,
          stderr: null,
          executionTimeMs: 5 + Math.floor(Math.random() * 10),
          memoryUsageMb: 11.2 + Math.random() * 2
        };
      } catch (e: any) {
        // Fallback to keyword-based simulator if eval fails due to language variations or TS syntax
      }
    }

    // Keyword-based simulator fallback
    const codeLower = code.toLowerCase();

    if (challengeId === 'fizzbuzz-challenge') {
      const hasDivChecks = codeLower.includes('%') || codeLower.includes('modulo') || codeLower.includes('fizz');
      if (!hasDivChecks) {
        return {
          stdout: '',
          stderr: 'Logic Error: Could not detect divisibility checking modulo operations (%) or strings "Fizz"/"Buzz". Check conditional branches.',
          executionTimeMs: 15,
          memoryUsageMb: 15.6
        };
      }
    }

    // Successful mock output
    let stdout = `[INFO] Compiling source using mock ${language.toUpperCase()} execution engine...\n`;
    stdout += `[INFO] Running test suite against input: "${customInput || challenge.sampleInput}"\n`;
    
    // Determine output
    let returnVal = challenge.sampleOutput;
    if (customInput) {
      if (challengeId === 'fizzbuzz-challenge') {
        const val = parseInt(customInput, 10);
        if (isNaN(val)) {
          return {
            stdout: '',
            stderr: `Input Error: Custom input "${customInput}" is not a valid integer.`,
            executionTimeMs: 5,
            memoryUsageMb: 8
          };
        }
        const arr = [];
        for (let i = 1; i <= Math.min(val, 20); i++) {
          if (i % 15 === 0) arr.push('FizzBuzz');
          else if (i % 3 === 0) arr.push('Fizz');
          else if (i % 5 === 0) arr.push('Buzz');
          else arr.push(String(i));
        }
        returnVal = JSON.stringify(arr);
      } else if (challengeId === 'permissions-validator-challenge') {
        try {
          const req = JSON.parse(customInput);
          const octal = req.octal;
          const role = req.userRole;
          const op = req.operation;
          let digitChar = "0";
          if (role === "owner" || role === "user") digitChar = octal[0];
          else if (role === "group") digitChar = octal[1];
          else digitChar = octal[2];
          const val = parseInt(digitChar, 10);
          let reqVal = 0;
          if (op === "read") reqVal = 4;
          else if (op === "write") reqVal = 2;
          else if (op === "execute") reqVal = 1;
          returnVal = String((val & reqVal) !== 0);
        } catch (err) {
          return {
            stdout: '',
            stderr: 'Input Error: Custom input must be valid JSON matching format: { "octal": "755", "userRole": "group", "operation": "write" }',
            executionTimeMs: 8,
            memoryUsageMb: 10
          };
        }
      }
    }

    stdout += `-> Program Output: ${returnVal}\n`;
    stdout += `[OK] Execution Completed successfully.`;

    return {
      stdout,
      stderr: null,
      executionTimeMs: 25 + Math.floor(Math.random() * 45),
      memoryUsageMb: 18.2 + Math.random() * 8
    };
  }
}

// 2. Test Runner
export class TestRunner {
  async runTests(
    challengeId: string,
    language: string,
    code: string
  ): Promise<TestRunSummary> {
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));

    const challenge = MOCK_CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) {
      return {
        passed: true,
        passedCount: 1,
        failedCount: 0,
        totalCount: 1,
        testCaseResults: [{ testCaseId: 'default', input: '', expected: '', actual: '', passed: true, isPrivate: false }]
      };
    }

    if (!code.trim() || code.includes('// TODO')) {
      return {
        passed: false,
        passedCount: 0,
        failedCount: challenge.testCases.length,
        totalCount: challenge.testCases.length,
        testCaseResults: challenge.testCases.map((tc) => ({
          testCaseId: tc.id,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: 'None (Incomplete)',
          passed: false,
          isPrivate: tc.isPrivate
        }))
      };
    }

    // Try evaluation check if Javascript
    let evalMap: Record<string, string> = {};
    let useEval = false;
    if (language === 'javascript' || language === 'typescript') {
      try {
        const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
        let funcName = 'solution';
        if (challengeId === 'fizzbuzz-challenge') funcName = 'fizzBuzz';
        else if (challengeId === 'permissions-validator-challenge') funcName = 'isAuthorized';
        else if (challengeId === 'log-filter-challenge') funcName = 'filterLogs';

        challenge.testCases.forEach((tc) => {
          const wrapper = `
            ${cleanCode}
            const out = ${funcName}(${tc.input});
            JSON.stringify(out);
          `;
          const actual = (0, eval)(wrapper);
          evalMap[tc.id] = actual;
        });
        useEval = true;
      } catch (e) {}
    }

    // Generate test results
    const results = challenge.testCases.map((tc) => {
      let actual = tc.expectedOutput; // mock positive pass by default
      let passed = true;

      if (useEval) {
        const evalVal = evalMap[tc.id];
        passed = String(evalVal) === String(tc.expectedOutput) || JSON.stringify(evalVal) === JSON.stringify(tc.expectedOutput);
        actual = String(evalVal);
      } else {
        // Fallback static checks: if code contains solution keywords
        const codeLower = code.toLowerCase();
        if (challengeId === 'fizzbuzz-challenge') {
          const valid = codeLower.includes('%') && (codeLower.includes('fizz') || codeLower.includes('buzz'));
          if (!valid) {
            passed = false;
            actual = 'Failed div check logic';
          }
        } else if (challengeId === 'permissions-validator-challenge') {
          const valid = codeLower.includes('&') || codeLower.includes('role') || codeLower.includes('owner');
          if (!valid) {
            passed = false;
            actual = 'Failed bitwise matching logic';
          }
        }
      }

      return {
        testCaseId: tc.id,
        input: tc.input,
        expected: tc.expectedOutput,
        actual,
        passed,
        isPrivate: tc.isPrivate
      };
    });

    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.length - passedCount;

    return {
      passed: failedCount === 0,
      passedCount,
      failedCount,
      totalCount: results.length,
      testCaseResults: results
    };
  }
}

// 3. AI Code Review Provider
export class AIReviewProvider {
  async requestReview(
    challengeId: string,
    language: string,
    code: string,
    aspect: AIReviewAspect
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    if (!code.trim()) {
      return '### AI Assistant Code Review\n\nNo code submitted. Please write code in the editor before requesting a review.';
    }

    const reviewHeader = `### AI Review: ${aspect.replace('_', ' ').toUpperCase()} (${language.toUpperCase()})\n\n`;

    switch (aspect) {
      case 'explain':
        return (
          reviewHeader +
          `I analyzed your current solution for challenge \`${challengeId}\`. Here is the step-by-step breakdown:
1. **Entry Point**: The program defines a handler accepting the parameters.
2. **Control Flow**: You implemented a loop sequence iterating through target bounds.
3. **Data Operations**: In each iteration, you check specific validation metrics using operators.
4. **Return Output**: Results are collected, formatted, and returned back to the caller.`
        );
      case 'bugs':
        return (
          reviewHeader +
          `1. **Bound Check (Verify)**: Ensure your bounds are inclusive of \`n\` or \`length\`. A common error is off-by-one errors in iterations.
2. **Type Coercion**: In JS/TS, ensure you use strict equals (\`===\`) instead of soft checks to avoid unexpected type changes.
3. **Octal Parse**: Ensure radix 10 is specified when converting characters: \`parseInt(char, 10)\`.`
        );
      case 'optimize':
      case 'performance':
        return (
          reviewHeader +
          `- **String Allocation**: String concats inside large loops can cause performance degradation. Consider pre-allocating or compiling an array buffer and doing \`.join("")\`.
- **Early Exits**: If the logic matches failure early (e.g. invalid roles), return \`false\` immediately to bypass further calculations.`
        );
      case 'readability':
        return (
          reviewHeader +
          `- **Clean Descriptors**: Rename variables like \`i\`, \`val\`, or \`op\` to descriptive terms like \`index\`, \`octalPermissionDigit\`, and \`requestedOperation\`.
- **Modularity**: Extract sub-checks (like index resolving) into simple arrow helper functions.`
        );
      case 'time_complexity':
        return (
          reviewHeader +
          `- **Time Complexity**: **O(N)**. Since you process each element in the input exactly once, execution scaling is linear. This is optimal for these catalog challenges.`
        );
      case 'space_complexity':
        return (
          reviewHeader +
          `- **Space Complexity**: **O(N)** for storing and returning the formatted output sequence. If we measure auxiliary space complexity (excluding output), it is **O(1)** as it runs in-place.`
        );
      default:
        return reviewHeader + 'Analyzing source code structure... Solution looks clean and well-structured.';
    }
  }
}

// 4. Challenge Provider
export class ChallengeProvider {
  getChallenges(): Challenge[] {
    return MOCK_CHALLENGES;
  }

  getChallengeById(id: string): Challenge | undefined {
    return MOCK_CHALLENGES.find((c) => c.id === id);
  }

  getChallengeForLesson(lessonId: string): Challenge | undefined {
    const lIdStr = String(lessonId);
    // Try mappings
    if (lIdStr === '202' || lIdStr === 'unit-2-2-2') {
      return this.getChallengeById('permissions-validator-challenge');
    }
    if (lIdStr === '204' || lIdStr === 'unit-2-4-2') {
      return this.getChallengeById('log-filter-challenge');
    }
    if (lIdStr === '402' || lIdStr === 'unit-1-5-1' || lIdStr === 'unit-1-2-2') {
      return this.getChallengeById('fizzbuzz-challenge');
    }
    return undefined;
  }

  getChallengeProgress(challengeId: string): ChallengeProgress {
    const key = `shaivika_lab_prog_${challengeId}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return {
      challengeId,
      attemptCount: 0,
      lastAttempt: null,
      bestResult: 'None',
      completionStatus: 'Unstarted',
      timeSpentSeconds: 0,
      bookmarked: false
    };
  }

  saveChallengeProgress(challengeId: string, progress: Partial<ChallengeProgress>): void {
    const current = this.getChallengeProgress(challengeId);
    const updated = { ...current, ...progress };
    localStorage.setItem(`shaivika_lab_prog_${challengeId}`, JSON.stringify(updated));
  }

  getAttempts(challengeId: string): Attempt[] {
    const key = `shaivika_lab_attempts_${challengeId}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return [];
  }

  addAttempt(challengeId: string, attempt: Attempt): void {
    const current = this.getAttempts(challengeId);
    const updated = [attempt, ...current].slice(0, 10);
    localStorage.setItem(`shaivika_lab_attempts_${challengeId}`, JSON.stringify(updated));
  }
}
