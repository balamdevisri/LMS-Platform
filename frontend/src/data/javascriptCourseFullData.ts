import type { ModuleItem } from '../contexts/CourseContext';

export const javascriptCourseModules: ModuleItem[] = [
  {
    "duration": "2 Hours",
    "description": "JavaScript origins, V8 engine, browser DevTools, and runtime execution.",
    "orderIndex": 1,
    "id": "js-mod-1",
    "title": "Module 1: JavaScript Fundamentals & Syntax",
    "courseId": "javascript-mastery",
    "order": 1,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 1: JavaScript Fundamentals & Syntax",
        "title": "Module 1 - Complete Notes",
        "type": "Reading",
        "content": "# Module 1: JavaScript Fundamentals & Syntax\n## Overview\nJavaScript is the premier programming language of the modern web. Initially created by Brendan Eich at Netscape in 1995 to add interactivity to web pages, it has evolved via the ECMAScript standard (ES6+) into a versatile multi-paradigm language executed across browsers and server environments.\n\n## Learning Objectives\n- Understand the JavaScript runtime environment, the V8 execution engine, and Call Stack mechanics.\n- Learn how to integrate JavaScript into HTML documents using inline, internal, and external `<script>` tags.\n- Master basic syntax, tokens, comments, and browser DevTools debugging workflows.\n## Concept & Execution Model\nJavaScript is a **single-threaded, dynamically typed, interpreted/JIT-compiled language** with non-blocking event-driven concurrency.\n\n```text\n┌─────────────────────────────────────────────────────────────┐\n│                    JavaScript Runtime                       │\n│                                                             │\n│   ┌─────────────────────┐       ┌────────────────────────┐  │\n│   │     Memory Heap     │       │       Call Stack       │  │\n│   │ (Variable Storage)  │       │ (Function Executions)  │  │\n│   └─────────────────────┘       └────────────────────────┘  │\n│                                              │              │\n│                                              ▼              │\n│   ┌──────────────────────────────────────────────────────┐  │\n│   │                   Web APIs / libuv                   │  │\n│   │           (DOM, Timers, Fetch, File I/O)             │  │\n│   └──────────────────────────────────────────────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n> 💡 **Tip:** Always use `console.log()`, `console.table()`, and `console.time()` inside browser DevTools (F12) to inspect data structures and measure execution benchmarks.\n> 📌 **Note:** JavaScript is dynamically typed, meaning variable types are determined at runtime, and variables can hold values of different types over their lifecycle.\n## Example\n```javascript\n// 1. Logging and basic arithmetic\nconsole.log(\"Hello, KaizenQ JavaScript Platform!\");\n\n// 2. Dynamic typing showcase\nlet runtimeVersion = 2026;\nconsole.log(\"Type of runtimeVersion:\", typeof runtimeVersion); // number\n\nruntimeVersion = \"ECMAScript 2026\";\nconsole.log(\"Updated Type:\", typeof runtimeVersion);           // string\n```\n## Common Mistakes & Pro Tips\n- ⚠️ **Mistake**: Placing external `<script>` tags at the top of the `<head>` without `defer` or `async`, which blocks HTML parsing.\n- 💡 **Pro Tip**: Use `<script defer src=\"app.js\"></script>` to ensure the HTML document is fully parsed before script execution starts.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "js-unit-1-notes",
        "moduleId": "js-mod-1",
        "courseId": "javascript-mastery",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 1: JavaScript Fundamentals & Syntax\n## Overview\nJavaScript is the premier programming language of the modern web. Initially created by Brendan Eich at Netscape in 1995 to add interactivity to web pages, it has evolved via the ECMAScript standard (ES6+) into a versatile multi-paradigm language executed across browsers and server environments.\n\n## Learning Objectives\n- Understand the JavaScript runtime environment, the V8 execution engine, and Call Stack mechanics.\n- Learn how to integrate JavaScript into HTML documents using inline, internal, and external `<script>` tags.\n- Master basic syntax, tokens, comments, and browser DevTools debugging workflows.\n## Concept & Execution Model\nJavaScript is a **single-threaded, dynamically typed, interpreted/JIT-compiled language** with non-blocking event-driven concurrency.\n\n```text\n┌─────────────────────────────────────────────────────────────┐\n│                    JavaScript Runtime                       │\n│                                                             │\n│   ┌─────────────────────┐       ┌────────────────────────┐  │\n│   │     Memory Heap     │       │       Call Stack       │  │\n│   │ (Variable Storage)  │       │ (Function Executions)  │  │\n│   └─────────────────────┘       └────────────────────────┘  │\n│                                              │              │\n│                                              ▼              │\n│   ┌──────────────────────────────────────────────────────┐  │\n│   │                   Web APIs / libuv                   │  │\n│   │           (DOM, Timers, Fetch, File I/O)             │  │\n│   └──────────────────────────────────────────────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n> 💡 **Tip:** Always use `console.log()`, `console.table()`, and `console.time()` inside browser DevTools (F12) to inspect data structures and measure execution benchmarks.\n> 📌 **Note:** JavaScript is dynamically typed, meaning variable types are determined at runtime, and variables can hold values of different types over their lifecycle.\n## Example\n```javascript\n// 1. Logging and basic arithmetic\nconsole.log(\"Hello, KaizenQ JavaScript Platform!\");\n\n// 2. Dynamic typing showcase\nlet runtimeVersion = 2026;\nconsole.log(\"Type of runtimeVersion:\", typeof runtimeVersion); // number\n\nruntimeVersion = \"ECMAScript 2026\";\nconsole.log(\"Updated Type:\", typeof runtimeVersion);           // string\n```\n## Common Mistakes & Pro Tips\n- ⚠️ **Mistake**: Placing external `<script>` tags at the top of the `<head>` without `defer` or `async`, which blocks HTML parsing.\n- 💡 **Pro Tip**: Use `<script defer src=\"app.js\"></script>` to ensure the HTML document is fully parsed before script execution starts."
      }
    ],
    "topics": [
      {
        "id": "js-mod-1-topic-1",
        "title": "Module 1: JavaScript Fundamentals & Syntax Units",
        "description": "JavaScript origins, V8 engine, browser DevTools, and runtime execution.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "js-unit-1-notes",
            "title": "Module 1 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 1: JavaScript Fundamentals & Syntax\n\n## Overview\nJavaScript is the premier programming language of the modern web. Initially created by Brendan Eich at Netscape in 1995 to add interactivity to web pages, it has evolved via the ECMAScript standard (ES6+) into a versatile multi-paradigm language executed across browsers and server environments.\n\n## Learning Objectives\n- Understand the JavaScript runtime environment, the V8 execution engine, and Call Stack mechanics.\n- Learn how to integrate JavaScript into HTML documents using inline, internal, and external `<script>` tags.\n- Master basic syntax, tokens, comments, and browser DevTools debugging workflows.\n\n## Concept & Execution Model\nJavaScript is a **single-threaded, dynamically typed, interpreted/JIT-compiled language** with non-blocking event-driven concurrency.\n\n```text\n┌─────────────────────────────────────────────────────────────┐\n│                    JavaScript Runtime                       │\n│                                                             │\n│   ┌─────────────────────┐       ┌────────────────────────┐  │\n│   │     Memory Heap     │       │       Call Stack       │  │\n│   │ (Variable Storage)  │       │ (Function Executions)  │  │\n│   └─────────────────────┘       └────────────────────────┘  │\n│                                              │              │\n│                                              ▼              │\n│   ┌──────────────────────────────────────────────────────┐  │\n│   │                   Web APIs / libuv                   │  │\n│   │           (DOM, Timers, Fetch, File I/O)             │  │\n│   └──────────────────────────────────────────────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n\n> 💡 **Tip:** Always use `console.log()`, `console.table()`, and `console.time()` inside browser DevTools (F12) to inspect data structures and measure execution benchmarks.\n\n> 📌 **Note:** JavaScript is dynamically typed, meaning variable types are determined at runtime, and variables can hold values of different types over their lifecycle.\n\n## Example\n```javascript\n// 1. Logging and basic arithmetic\nconsole.log(\"Hello, KaizenQ JavaScript Platform!\");\n\n// 2. Dynamic typing showcase\nlet runtimeVersion = 2026;\nconsole.log(\"Type of runtimeVersion:\", typeof runtimeVersion); // number\n\nruntimeVersion = \"ECMAScript 2026\";\nconsole.log(\"Updated Type:\", typeof runtimeVersion);           // string\n```\n\n## Common Mistakes & Pro Tips\n- ⚠️ **Mistake**: Placing external `<script>` tags at the top of the `<head>` without `defer` or `async`, which blocks HTML parsing.\n- 💡 **Pro Tip**: Use `<script defer src=\"app.js\"></script>` to ensure the HTML document is fully parsed before script execution starts.\n",
            "content": "# Module 1: JavaScript Fundamentals & Syntax\n\n## Overview\nJavaScript is the premier programming language of the modern web. Initially created by Brendan Eich at Netscape in 1995 to add interactivity to web pages, it has evolved via the ECMAScript standard (ES6+) into a versatile multi-paradigm language executed across browsers and server environments.\n\n## Learning Objectives\n- Understand the JavaScript runtime environment, the V8 execution engine, and Call Stack mechanics.\n- Learn how to integrate JavaScript into HTML documents using inline, internal, and external `<script>` tags.\n- Master basic syntax, tokens, comments, and browser DevTools debugging workflows.\n\n## Concept & Execution Model\nJavaScript is a **single-threaded, dynamically typed, interpreted/JIT-compiled language** with non-blocking event-driven concurrency.\n\n```text\n┌─────────────────────────────────────────────────────────────┐\n│                    JavaScript Runtime                       │\n│                                                             │\n│   ┌─────────────────────┐       ┌────────────────────────┐  │\n│   │     Memory Heap     │       │       Call Stack       │  │\n│   │ (Variable Storage)  │       │ (Function Executions)  │  │\n│   └─────────────────────┘       └────────────────────────┘  │\n│                                              │              │\n│                                              ▼              │\n│   ┌──────────────────────────────────────────────────────┐  │\n│   │                   Web APIs / libuv                   │  │\n│   │           (DOM, Timers, Fetch, File I/O)             │  │\n│   └──────────────────────────────────────────────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n\n> 💡 **Tip:** Always use `console.log()`, `console.table()`, and `console.time()` inside browser DevTools (F12) to inspect data structures and measure execution benchmarks.\n\n> 📌 **Note:** JavaScript is dynamically typed, meaning variable types are determined at runtime, and variables can hold values of different types over their lifecycle.\n\n## Example\n```javascript\n// 1. Logging and basic arithmetic\nconsole.log(\"Hello, KaizenQ JavaScript Platform!\");\n\n// 2. Dynamic typing showcase\nlet runtimeVersion = 2026;\nconsole.log(\"Type of runtimeVersion:\", typeof runtimeVersion); // number\n\nruntimeVersion = \"ECMAScript 2026\";\nconsole.log(\"Updated Type:\", typeof runtimeVersion);           // string\n```\n\n## Common Mistakes & Pro Tips\n- ⚠️ **Mistake**: Placing external `<script>` tags at the top of the `<head>` without `defer` or `async`, which blocks HTML parsing.\n- 💡 **Pro Tip**: Use `<script defer src=\"app.js\"></script>` to ensure the HTML document is fully parsed before script execution starts.\n",
            "conceptTheory": "# Module 1: JavaScript Fundamentals & Syntax\n\n## Overview\nJavaScript is the premier programming language of the modern web. Initially created by Brendan Eich at Netscape in 1995 to add interactivity to web pages, it has evolved via the ECMAScript standard (ES6+) into a versatile multi-paradigm language executed across browsers and server environments.\n\n## Learning Objectives\n- Understand the JavaScript runtime environment, the V8 execution engine, and Call Stack mechanics.\n- Learn how to integrate JavaScript into HTML documents using inline, internal, and external `<script>` tags.\n- Master basic syntax, tokens, comments, and browser DevTools debugging workflows.\n\n## Concept & Execution Model\nJavaScript is a **single-threaded, dynamically typed, interpreted/JIT-compiled language** with non-blocking event-driven concurrency.\n\n```text\n┌─────────────────────────────────────────────────────────────┐\n│                    JavaScript Runtime                       │\n│                                                             │\n│   ┌─────────────────────┐       ┌────────────────────────┐  │\n│   │     Memory Heap     │       │       Call Stack       │  │\n│   │ (Variable Storage)  │       │ (Function Executions)  │  │\n│   └─────────────────────┘       └────────────────────────┘  │\n│                                              │              │\n│                                              ▼              │\n│   ┌──────────────────────────────────────────────────────┐  │\n│   │                   Web APIs / libuv                   │  │\n│   │           (DOM, Timers, Fetch, File I/O)             │  │\n│   └──────────────────────────────────────────────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n\n> 💡 **Tip:** Always use `console.log()`, `console.table()`, and `console.time()` inside browser DevTools (F12) to inspect data structures and measure execution benchmarks.\n\n> 📌 **Note:** JavaScript is dynamically typed, meaning variable types are determined at runtime, and variables can hold values of different types over their lifecycle.\n\n## Example\n```javascript\n// 1. Logging and basic arithmetic\nconsole.log(\"Hello, KaizenQ JavaScript Platform!\");\n\n// 2. Dynamic typing showcase\nlet runtimeVersion = 2026;\nconsole.log(\"Type of runtimeVersion:\", typeof runtimeVersion); // number\n\nruntimeVersion = \"ECMAScript 2026\";\nconsole.log(\"Updated Type:\", typeof runtimeVersion);           // string\n```\n\n## Common Mistakes & Pro Tips\n- ⚠️ **Mistake**: Placing external `<script>` tags at the top of the `<head>` without `defer` or `async`, which blocks HTML parsing.\n- 💡 **Pro Tip**: Use `<script defer src=\"app.js\"></script>` to ensure the HTML document is fully parsed before script execution starts.\n",
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
    "description": "let, const, var, scoping, hoisting, primitives, and operators.",
    "orderIndex": 2,
    "id": "js-mod-2",
    "title": "Module 2: Variables, Data Types & Operators",
    "courseId": "javascript-mastery",
    "order": 2,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 2: Variables, Data Types & Operators",
        "title": "Module 2 - Complete Notes",
        "type": "Reading",
        "content": "# Module 2: Variables, Data Types & Operators\n## Overview\nUnderstanding memory storage and type systems is fundamental to writing defect-free JavaScript. Modern JavaScript provides three variable declaration keywords (`let`, `const`, `var`) and two categories of data types: Primitives and Reference Objects.\n\n## Learning Objectives\n- Understand the scoping differences and hoisting behaviors of `let`, `const`, and legacy `var`.\n- Master JavaScript's 7 Primitive data types (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) and the Reference `Object` type.\n- Master arithmetic, logical, comparison, ternary, nullish coalescing (`??`), and optional chaining (`?.`) operators.\n## Concept: Scope and Hoisting\n- `var`: Function-scoped, hoisted and initialized to `undefined`.\n- `let`: Block-scoped, hoisted into a Temporal Dead Zone (TDZ) until evaluation.\n- `const`: Block-scoped, immutable variable binding (cannot be reassigned).\n> 💡 **Tip:** Default to `const` for all variable bindings. Only use `let` when you know the variable value needs to be reassigned. Avoid `var` in modern codebases.\n> 📌 **Note:** Strict equality (`===`) compares both value and type without coercion, whereas loose equality (`==`) coerces types before comparing. Always prefer `===`.\n## Example\n```javascript\nconst platformName = \"KaizenQ LMS\";\nlet activeStudents = 1420;\n\n// Type comparison\nconsole.log(5 == \"5\");   // true (type coercion)\nconsole.log(5 === \"5\");  // false (strict equality)\n\n// Nullish Coalescing (??) vs Logical OR (||)\nconst userScore = 0;\nconst displayScoreOR = userScore || 100;     // 100 (falsy check treats 0 as false)\nconst displayScoreNC = userScore ?? 100;     // 0   (nullish check only targets null/undefined)\n\nconsole.log({ displayScoreOR, displayScoreNC });\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "js-unit-2-notes",
        "moduleId": "js-mod-2",
        "courseId": "javascript-mastery",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 2: Variables, Data Types & Operators\n## Overview\nUnderstanding memory storage and type systems is fundamental to writing defect-free JavaScript. Modern JavaScript provides three variable declaration keywords (`let`, `const`, `var`) and two categories of data types: Primitives and Reference Objects.\n\n## Learning Objectives\n- Understand the scoping differences and hoisting behaviors of `let`, `const`, and legacy `var`.\n- Master JavaScript's 7 Primitive data types (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) and the Reference `Object` type.\n- Master arithmetic, logical, comparison, ternary, nullish coalescing (`??`), and optional chaining (`?.`) operators.\n## Concept: Scope and Hoisting\n- `var`: Function-scoped, hoisted and initialized to `undefined`.\n- `let`: Block-scoped, hoisted into a Temporal Dead Zone (TDZ) until evaluation.\n- `const`: Block-scoped, immutable variable binding (cannot be reassigned).\n> 💡 **Tip:** Default to `const` for all variable bindings. Only use `let` when you know the variable value needs to be reassigned. Avoid `var` in modern codebases.\n> 📌 **Note:** Strict equality (`===`) compares both value and type without coercion, whereas loose equality (`==`) coerces types before comparing. Always prefer `===`.\n## Example\n```javascript\nconst platformName = \"KaizenQ LMS\";\nlet activeStudents = 1420;\n\n// Type comparison\nconsole.log(5 == \"5\");   // true (type coercion)\nconsole.log(5 === \"5\");  // false (strict equality)\n\n// Nullish Coalescing (??) vs Logical OR (||)\nconst userScore = 0;\nconst displayScoreOR = userScore || 100;     // 100 (falsy check treats 0 as false)\nconst displayScoreNC = userScore ?? 100;     // 0   (nullish check only targets null/undefined)\n\nconsole.log({ displayScoreOR, displayScoreNC });\n```"
      }
    ],
    "topics": [
      {
        "id": "js-mod-2-topic-1",
        "title": "Module 2: Variables, Data Types & Operators Units",
        "description": "let, const, var, scoping, hoisting, primitives, and operators.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "js-unit-2-notes",
            "title": "Module 2 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 2: Variables, Data Types & Operators\n\n## Overview\nUnderstanding memory storage and type systems is fundamental to writing defect-free JavaScript. Modern JavaScript provides three variable declaration keywords (`let`, `const`, `var`) and two categories of data types: Primitives and Reference Objects.\n\n## Learning Objectives\n- Understand the scoping differences and hoisting behaviors of `let`, `const`, and legacy `var`.\n- Master JavaScript's 7 Primitive data types (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) and the Reference `Object` type.\n- Master arithmetic, logical, comparison, ternary, nullish coalescing (`??`), and optional chaining (`?.`) operators.\n\n## Concept: Scope and Hoisting\n- `var`: Function-scoped, hoisted and initialized to `undefined`.\n- `let`: Block-scoped, hoisted into a Temporal Dead Zone (TDZ) until evaluation.\n- `const`: Block-scoped, immutable variable binding (cannot be reassigned).\n\n> 💡 **Tip:** Default to `const` for all variable bindings. Only use `let` when you know the variable value needs to be reassigned. Avoid `var` in modern codebases.\n\n> 📌 **Note:** Strict equality (`===`) compares both value and type without coercion, whereas loose equality (`==`) coerces types before comparing. Always prefer `===`.\n\n## Example\n```javascript\nconst platformName = \"KaizenQ LMS\";\nlet activeStudents = 1420;\n\n// Type comparison\nconsole.log(5 == \"5\");   // true (type coercion)\nconsole.log(5 === \"5\");  // false (strict equality)\n\n// Nullish Coalescing (??) vs Logical OR (||)\nconst userScore = 0;\nconst displayScoreOR = userScore || 100;     // 100 (falsy check treats 0 as false)\nconst displayScoreNC = userScore ?? 100;     // 0   (nullish check only targets null/undefined)\n\nconsole.log({ displayScoreOR, displayScoreNC });\n```\n",
            "content": "# Module 2: Variables, Data Types & Operators\n\n## Overview\nUnderstanding memory storage and type systems is fundamental to writing defect-free JavaScript. Modern JavaScript provides three variable declaration keywords (`let`, `const`, `var`) and two categories of data types: Primitives and Reference Objects.\n\n## Learning Objectives\n- Understand the scoping differences and hoisting behaviors of `let`, `const`, and legacy `var`.\n- Master JavaScript's 7 Primitive data types (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) and the Reference `Object` type.\n- Master arithmetic, logical, comparison, ternary, nullish coalescing (`??`), and optional chaining (`?.`) operators.\n\n## Concept: Scope and Hoisting\n- `var`: Function-scoped, hoisted and initialized to `undefined`.\n- `let`: Block-scoped, hoisted into a Temporal Dead Zone (TDZ) until evaluation.\n- `const`: Block-scoped, immutable variable binding (cannot be reassigned).\n\n> 💡 **Tip:** Default to `const` for all variable bindings. Only use `let` when you know the variable value needs to be reassigned. Avoid `var` in modern codebases.\n\n> 📌 **Note:** Strict equality (`===`) compares both value and type without coercion, whereas loose equality (`==`) coerces types before comparing. Always prefer `===`.\n\n## Example\n```javascript\nconst platformName = \"KaizenQ LMS\";\nlet activeStudents = 1420;\n\n// Type comparison\nconsole.log(5 == \"5\");   // true (type coercion)\nconsole.log(5 === \"5\");  // false (strict equality)\n\n// Nullish Coalescing (??) vs Logical OR (||)\nconst userScore = 0;\nconst displayScoreOR = userScore || 100;     // 100 (falsy check treats 0 as false)\nconst displayScoreNC = userScore ?? 100;     // 0   (nullish check only targets null/undefined)\n\nconsole.log({ displayScoreOR, displayScoreNC });\n```\n",
            "conceptTheory": "# Module 2: Variables, Data Types & Operators\n\n## Overview\nUnderstanding memory storage and type systems is fundamental to writing defect-free JavaScript. Modern JavaScript provides three variable declaration keywords (`let`, `const`, `var`) and two categories of data types: Primitives and Reference Objects.\n\n## Learning Objectives\n- Understand the scoping differences and hoisting behaviors of `let`, `const`, and legacy `var`.\n- Master JavaScript's 7 Primitive data types (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) and the Reference `Object` type.\n- Master arithmetic, logical, comparison, ternary, nullish coalescing (`??`), and optional chaining (`?.`) operators.\n\n## Concept: Scope and Hoisting\n- `var`: Function-scoped, hoisted and initialized to `undefined`.\n- `let`: Block-scoped, hoisted into a Temporal Dead Zone (TDZ) until evaluation.\n- `const`: Block-scoped, immutable variable binding (cannot be reassigned).\n\n> 💡 **Tip:** Default to `const` for all variable bindings. Only use `let` when you know the variable value needs to be reassigned. Avoid `var` in modern codebases.\n\n> 📌 **Note:** Strict equality (`===`) compares both value and type without coercion, whereas loose equality (`==`) coerces types before comparing. Always prefer `===`.\n\n## Example\n```javascript\nconst platformName = \"KaizenQ LMS\";\nlet activeStudents = 1420;\n\n// Type comparison\nconsole.log(5 == \"5\");   // true (type coercion)\nconsole.log(5 === \"5\");  // false (strict equality)\n\n// Nullish Coalescing (??) vs Logical OR (||)\nconst userScore = 0;\nconst displayScoreOR = userScore || 100;     // 100 (falsy check treats 0 as false)\nconst displayScoreNC = userScore ?? 100;     // 0   (nullish check only targets null/undefined)\n\nconsole.log({ displayScoreOR, displayScoreNC });\n```\n",
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
    "description": "Conditionals, loops, arrow functions, closures, and scope.",
    "orderIndex": 3,
    "id": "js-mod-3",
    "title": "Module 3: Control Flow & Functions",
    "courseId": "javascript-mastery",
    "order": 3,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 3: Control Flow & Functions",
        "title": "Module 3 - Complete Notes",
        "type": "Reading",
        "content": "# Module 3: Control Flow & Functions\n## Overview\nControl flow structures direct code execution based on conditional checks and loops. Functions serve as the foundational building blocks of modular, maintainable JavaScript applications.\n\n## Learning Objectives\n- Master branching statements: `if / else if / else` and multi-way `switch`.\n- Understand iterative loops: `for`, `while`, `do...while`, `for...of` (iterables), and `for...in` (object keys).\n- Write function declarations, function expressions, arrow functions, and higher-order functions.\n- Understand lexical scope, closures, and default parameters.\n## Concept: Arrow Functions vs Traditional Functions\nArrow functions (`() => {}`) provide concise syntax and inherit the `this` value lexically from their enclosing execution context, unlike regular functions which bind their own `this`.\n\n> 💡 **Tip:** Use `for...of` when iterating over Array values and strings, and `for...in` when iterating over Object property keys.\n> 📌 **Note:** A closure is the combination of a function bundled together with references to its surrounding lexical state (lexical environment), allowing it to access outer variables even after the outer function has closed.\n## Example\n```javascript\n// Higher-Order Function returning a Closure\nfunction createCounter(initialValue = 0) {\n  let count = initialValue;\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    getValue: () => count\n  };\n}\n\nconst counter = createCounter(10);\nconsole.log(counter.increment()); // 11\nconsole.log(counter.increment()); // 12\nconsole.log(counter.getValue());  // 12\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "js-unit-3-notes",
        "moduleId": "js-mod-3",
        "courseId": "javascript-mastery",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 3: Control Flow & Functions\n## Overview\nControl flow structures direct code execution based on conditional checks and loops. Functions serve as the foundational building blocks of modular, maintainable JavaScript applications.\n\n## Learning Objectives\n- Master branching statements: `if / else if / else` and multi-way `switch`.\n- Understand iterative loops: `for`, `while`, `do...while`, `for...of` (iterables), and `for...in` (object keys).\n- Write function declarations, function expressions, arrow functions, and higher-order functions.\n- Understand lexical scope, closures, and default parameters.\n## Concept: Arrow Functions vs Traditional Functions\nArrow functions (`() => {}`) provide concise syntax and inherit the `this` value lexically from their enclosing execution context, unlike regular functions which bind their own `this`.\n\n> 💡 **Tip:** Use `for...of` when iterating over Array values and strings, and `for...in` when iterating over Object property keys.\n> 📌 **Note:** A closure is the combination of a function bundled together with references to its surrounding lexical state (lexical environment), allowing it to access outer variables even after the outer function has closed.\n## Example\n```javascript\n// Higher-Order Function returning a Closure\nfunction createCounter(initialValue = 0) {\n  let count = initialValue;\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    getValue: () => count\n  };\n}\n\nconst counter = createCounter(10);\nconsole.log(counter.increment()); // 11\nconsole.log(counter.increment()); // 12\nconsole.log(counter.getValue());  // 12\n```"
      }
    ],
    "topics": [
      {
        "id": "js-mod-3-topic-1",
        "title": "Module 3: Control Flow & Functions Units",
        "description": "Conditionals, loops, arrow functions, closures, and scope.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "js-unit-3-notes",
            "title": "Module 3 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 3: Control Flow & Functions\n\n## Overview\nControl flow structures direct code execution based on conditional checks and loops. Functions serve as the foundational building blocks of modular, maintainable JavaScript applications.\n\n## Learning Objectives\n- Master branching statements: `if / else if / else` and multi-way `switch`.\n- Understand iterative loops: `for`, `while`, `do...while`, `for...of` (iterables), and `for...in` (object keys).\n- Write function declarations, function expressions, arrow functions, and higher-order functions.\n- Understand lexical scope, closures, and default parameters.\n\n## Concept: Arrow Functions vs Traditional Functions\nArrow functions (`() => {}`) provide concise syntax and inherit the `this` value lexically from their enclosing execution context, unlike regular functions which bind their own `this`.\n\n> 💡 **Tip:** Use `for...of` when iterating over Array values and strings, and `for...in` when iterating over Object property keys.\n\n> 📌 **Note:** A closure is the combination of a function bundled together with references to its surrounding lexical state (lexical environment), allowing it to access outer variables even after the outer function has closed.\n\n## Example\n```javascript\n// Higher-Order Function returning a Closure\nfunction createCounter(initialValue = 0) {\n  let count = initialValue;\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    getValue: () => count\n  };\n}\n\nconst counter = createCounter(10);\nconsole.log(counter.increment()); // 11\nconsole.log(counter.increment()); // 12\nconsole.log(counter.getValue());  // 12\n```\n",
            "content": "# Module 3: Control Flow & Functions\n\n## Overview\nControl flow structures direct code execution based on conditional checks and loops. Functions serve as the foundational building blocks of modular, maintainable JavaScript applications.\n\n## Learning Objectives\n- Master branching statements: `if / else if / else` and multi-way `switch`.\n- Understand iterative loops: `for`, `while`, `do...while`, `for...of` (iterables), and `for...in` (object keys).\n- Write function declarations, function expressions, arrow functions, and higher-order functions.\n- Understand lexical scope, closures, and default parameters.\n\n## Concept: Arrow Functions vs Traditional Functions\nArrow functions (`() => {}`) provide concise syntax and inherit the `this` value lexically from their enclosing execution context, unlike regular functions which bind their own `this`.\n\n> 💡 **Tip:** Use `for...of` when iterating over Array values and strings, and `for...in` when iterating over Object property keys.\n\n> 📌 **Note:** A closure is the combination of a function bundled together with references to its surrounding lexical state (lexical environment), allowing it to access outer variables even after the outer function has closed.\n\n## Example\n```javascript\n// Higher-Order Function returning a Closure\nfunction createCounter(initialValue = 0) {\n  let count = initialValue;\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    getValue: () => count\n  };\n}\n\nconst counter = createCounter(10);\nconsole.log(counter.increment()); // 11\nconsole.log(counter.increment()); // 12\nconsole.log(counter.getValue());  // 12\n```\n",
            "conceptTheory": "# Module 3: Control Flow & Functions\n\n## Overview\nControl flow structures direct code execution based on conditional checks and loops. Functions serve as the foundational building blocks of modular, maintainable JavaScript applications.\n\n## Learning Objectives\n- Master branching statements: `if / else if / else` and multi-way `switch`.\n- Understand iterative loops: `for`, `while`, `do...while`, `for...of` (iterables), and `for...in` (object keys).\n- Write function declarations, function expressions, arrow functions, and higher-order functions.\n- Understand lexical scope, closures, and default parameters.\n\n## Concept: Arrow Functions vs Traditional Functions\nArrow functions (`() => {}`) provide concise syntax and inherit the `this` value lexically from their enclosing execution context, unlike regular functions which bind their own `this`.\n\n> 💡 **Tip:** Use `for...of` when iterating over Array values and strings, and `for...in` when iterating over Object property keys.\n\n> 📌 **Note:** A closure is the combination of a function bundled together with references to its surrounding lexical state (lexical environment), allowing it to access outer variables even after the outer function has closed.\n\n## Example\n```javascript\n// Higher-Order Function returning a Closure\nfunction createCounter(initialValue = 0) {\n  let count = initialValue;\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    getValue: () => count\n  };\n}\n\nconst counter = createCounter(10);\nconsole.log(counter.increment()); // 11\nconsole.log(counter.increment()); // 12\nconsole.log(counter.getValue());  // 12\n```\n",
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
    "description": "map, filter, reduce, destructuring, spread, and object methods.",
    "orderIndex": 4,
    "id": "js-mod-4",
    "title": "Module 4: Arrays & Object Manipulation",
    "courseId": "javascript-mastery",
    "order": 4,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 4: Arrays & Object Manipulation",
        "title": "Module 4 - Complete Notes",
        "type": "Reading",
        "content": "# Module 4: Arrays & Object Manipulation\n## Overview\nArrays and Objects are the primary reference data structures in JavaScript used to store ordered sequences and key-value collections. Mastering functional array methods and modern object manipulation enables clean, immutable data transformations.\n\n## Learning Objectives\n- Use essential Array transformation methods: `map()`, `filter()`, `reduce()`, `find()`, `some()`, and `every()`.\n- Master object destructuring, array destructuring, and the spread/rest operator (`...`).\n- Understand Object utilities: `Object.keys()`, `Object.values()`, `Object.entries()`, and `Object.freeze()`.\n## Concept: Immutable Array Transformations\nFunctional array methods like `map` and `filter` return brand-new arrays rather than mutating the original array in place, making state tracking predictable.\n\n```javascript\nconst courses = [\n  { id: 1, title: 'JavaScript', hours: 25, price: 0 },\n  { id: 2, title: 'Python', hours: 35, price: 0 },\n  { id: 3, title: 'Kubernetes', hours: 30, price: 0 }\n];\n\n// Total learning hours using reduce\nconst totalHours = courses.reduce((acc, course) => acc + course.hours, 0);\nconsole.log(`Total Catalog Hours: ${totalHours}`); // 90\n\n// Filter and Map in a clean pipeline\nconst titles = courses\n  .filter(c => c.hours >= 25)\n  .map(c => c.title.toUpperCase());\n\nconsole.log(titles); // ['JAVASCRIPT', 'PYTHON', 'KUBERNETES']\n```\n> 💡 **Tip:** Use object and array destructuring with default values to write self-documenting function signatures.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "js-unit-4-notes",
        "moduleId": "js-mod-4",
        "courseId": "javascript-mastery",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 4: Arrays & Object Manipulation\n## Overview\nArrays and Objects are the primary reference data structures in JavaScript used to store ordered sequences and key-value collections. Mastering functional array methods and modern object manipulation enables clean, immutable data transformations.\n\n## Learning Objectives\n- Use essential Array transformation methods: `map()`, `filter()`, `reduce()`, `find()`, `some()`, and `every()`.\n- Master object destructuring, array destructuring, and the spread/rest operator (`...`).\n- Understand Object utilities: `Object.keys()`, `Object.values()`, `Object.entries()`, and `Object.freeze()`.\n## Concept: Immutable Array Transformations\nFunctional array methods like `map` and `filter` return brand-new arrays rather than mutating the original array in place, making state tracking predictable.\n\n```javascript\nconst courses = [\n  { id: 1, title: 'JavaScript', hours: 25, price: 0 },\n  { id: 2, title: 'Python', hours: 35, price: 0 },\n  { id: 3, title: 'Kubernetes', hours: 30, price: 0 }\n];\n\n// Total learning hours using reduce\nconst totalHours = courses.reduce((acc, course) => acc + course.hours, 0);\nconsole.log(`Total Catalog Hours: ${totalHours}`); // 90\n\n// Filter and Map in a clean pipeline\nconst titles = courses\n  .filter(c => c.hours >= 25)\n  .map(c => c.title.toUpperCase());\n\nconsole.log(titles); // ['JAVASCRIPT', 'PYTHON', 'KUBERNETES']\n```\n> 💡 **Tip:** Use object and array destructuring with default values to write self-documenting function signatures."
      }
    ],
    "topics": [
      {
        "id": "js-mod-4-topic-1",
        "title": "Module 4: Arrays & Object Manipulation Units",
        "description": "map, filter, reduce, destructuring, spread, and object methods.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "js-unit-4-notes",
            "title": "Module 4 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 4: Arrays & Object Manipulation\n\n## Overview\nArrays and Objects are the primary reference data structures in JavaScript used to store ordered sequences and key-value collections. Mastering functional array methods and modern object manipulation enables clean, immutable data transformations.\n\n## Learning Objectives\n- Use essential Array transformation methods: `map()`, `filter()`, `reduce()`, `find()`, `some()`, and `every()`.\n- Master object destructuring, array destructuring, and the spread/rest operator (`...`).\n- Understand Object utilities: `Object.keys()`, `Object.values()`, `Object.entries()`, and `Object.freeze()`.\n\n## Concept: Immutable Array Transformations\nFunctional array methods like `map` and `filter` return brand-new arrays rather than mutating the original array in place, making state tracking predictable.\n\n```javascript\nconst courses = [\n  { id: 1, title: 'JavaScript', hours: 25, price: 0 },\n  { id: 2, title: 'Python', hours: 35, price: 0 },\n  { id: 3, title: 'Kubernetes', hours: 30, price: 0 }\n];\n\n// Total learning hours using reduce\nconst totalHours = courses.reduce((acc, course) => acc + course.hours, 0);\nconsole.log(`Total Catalog Hours: ${totalHours}`); // 90\n\n// Filter and Map in a clean pipeline\nconst titles = courses\n  .filter(c => c.hours >= 25)\n  .map(c => c.title.toUpperCase());\n\nconsole.log(titles); // ['JAVASCRIPT', 'PYTHON', 'KUBERNETES']\n```\n\n> 💡 **Tip:** Use object and array destructuring with default values to write self-documenting function signatures.\n",
            "content": "# Module 4: Arrays & Object Manipulation\n\n## Overview\nArrays and Objects are the primary reference data structures in JavaScript used to store ordered sequences and key-value collections. Mastering functional array methods and modern object manipulation enables clean, immutable data transformations.\n\n## Learning Objectives\n- Use essential Array transformation methods: `map()`, `filter()`, `reduce()`, `find()`, `some()`, and `every()`.\n- Master object destructuring, array destructuring, and the spread/rest operator (`...`).\n- Understand Object utilities: `Object.keys()`, `Object.values()`, `Object.entries()`, and `Object.freeze()`.\n\n## Concept: Immutable Array Transformations\nFunctional array methods like `map` and `filter` return brand-new arrays rather than mutating the original array in place, making state tracking predictable.\n\n```javascript\nconst courses = [\n  { id: 1, title: 'JavaScript', hours: 25, price: 0 },\n  { id: 2, title: 'Python', hours: 35, price: 0 },\n  { id: 3, title: 'Kubernetes', hours: 30, price: 0 }\n];\n\n// Total learning hours using reduce\nconst totalHours = courses.reduce((acc, course) => acc + course.hours, 0);\nconsole.log(`Total Catalog Hours: ${totalHours}`); // 90\n\n// Filter and Map in a clean pipeline\nconst titles = courses\n  .filter(c => c.hours >= 25)\n  .map(c => c.title.toUpperCase());\n\nconsole.log(titles); // ['JAVASCRIPT', 'PYTHON', 'KUBERNETES']\n```\n\n> 💡 **Tip:** Use object and array destructuring with default values to write self-documenting function signatures.\n",
            "conceptTheory": "# Module 4: Arrays & Object Manipulation\n\n## Overview\nArrays and Objects are the primary reference data structures in JavaScript used to store ordered sequences and key-value collections. Mastering functional array methods and modern object manipulation enables clean, immutable data transformations.\n\n## Learning Objectives\n- Use essential Array transformation methods: `map()`, `filter()`, `reduce()`, `find()`, `some()`, and `every()`.\n- Master object destructuring, array destructuring, and the spread/rest operator (`...`).\n- Understand Object utilities: `Object.keys()`, `Object.values()`, `Object.entries()`, and `Object.freeze()`.\n\n## Concept: Immutable Array Transformations\nFunctional array methods like `map` and `filter` return brand-new arrays rather than mutating the original array in place, making state tracking predictable.\n\n```javascript\nconst courses = [\n  { id: 1, title: 'JavaScript', hours: 25, price: 0 },\n  { id: 2, title: 'Python', hours: 35, price: 0 },\n  { id: 3, title: 'Kubernetes', hours: 30, price: 0 }\n];\n\n// Total learning hours using reduce\nconst totalHours = courses.reduce((acc, course) => acc + course.hours, 0);\nconsole.log(`Total Catalog Hours: ${totalHours}`); // 90\n\n// Filter and Map in a clean pipeline\nconst titles = courses\n  .filter(c => c.hours >= 25)\n  .map(c => c.title.toUpperCase());\n\nconsole.log(titles); // ['JAVASCRIPT', 'PYTHON', 'KUBERNETES']\n```\n\n> 💡 **Tip:** Use object and array destructuring with default values to write self-documenting function signatures.\n",
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
    "description": "DOM tree querying, classList manipulation, and event delegation.",
    "orderIndex": 5,
    "id": "js-mod-5",
    "title": "Module 5: DOM & Browser Event Handling",
    "courseId": "javascript-mastery",
    "order": 5,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 5: DOM & Browser Event Handling",
        "title": "Module 5 - Complete Notes",
        "type": "Reading",
        "content": "# Module 5: DOM Manipulation & Browser Events\n## Overview\nThe Document Object Model (DOM) is a tree-like object representation of an HTML document constructed by the browser engine. JavaScript interacts with the DOM to dynamically update element styles, content, and listen to user input events.\n\n## Learning Objectives\n- Select elements efficiently using `querySelector()`, `querySelectorAll()`, and `getElementById()`.\n- Modify DOM elements, attributes, and CSS class lists with `classList.add()`, `classList.toggle()`.\n- Master event handling with `addEventListener()`, understanding Event Bubbling, Event Capturing, and Event Delegation.\n## Concept: Event Delegation\nInstead of attaching individual click listeners to hundreds of list items, attach a single listener to their common parent container and inspect `event.target`.\n\n```html\n<ul id=\"course-list\">\n  <li data-course=\"js\">JavaScript</li>\n  <li data-course=\"python\">Python</li>\n  <li data-course=\"react\">React</li>\n</ul>\n\n<script>\n  const list = document.querySelector('#course-list');\n  list.addEventListener('click', (e) => {\n    if (e.target && e.target.nodeName === 'LI') {\n      console.log('Selected Course:', e.target.dataset.course);\n    }\n  });\n</script>\n```\n> 💡 **Tip:** Always use `event.preventDefault()` on form submission events to prevent full-page browser reloads.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "js-unit-5-notes",
        "moduleId": "js-mod-5",
        "courseId": "javascript-mastery",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 5: DOM Manipulation & Browser Events\n## Overview\nThe Document Object Model (DOM) is a tree-like object representation of an HTML document constructed by the browser engine. JavaScript interacts with the DOM to dynamically update element styles, content, and listen to user input events.\n\n## Learning Objectives\n- Select elements efficiently using `querySelector()`, `querySelectorAll()`, and `getElementById()`.\n- Modify DOM elements, attributes, and CSS class lists with `classList.add()`, `classList.toggle()`.\n- Master event handling with `addEventListener()`, understanding Event Bubbling, Event Capturing, and Event Delegation.\n## Concept: Event Delegation\nInstead of attaching individual click listeners to hundreds of list items, attach a single listener to their common parent container and inspect `event.target`.\n\n```html\n<ul id=\"course-list\">\n  <li data-course=\"js\">JavaScript</li>\n  <li data-course=\"python\">Python</li>\n  <li data-course=\"react\">React</li>\n</ul>\n\n<script>\n  const list = document.querySelector('#course-list');\n  list.addEventListener('click', (e) => {\n    if (e.target && e.target.nodeName === 'LI') {\n      console.log('Selected Course:', e.target.dataset.course);\n    }\n  });\n</script>\n```\n> 💡 **Tip:** Always use `event.preventDefault()` on form submission events to prevent full-page browser reloads."
      }
    ],
    "topics": [
      {
        "id": "js-mod-5-topic-1",
        "title": "Module 5: DOM & Browser Event Handling Units",
        "description": "DOM tree querying, classList manipulation, and event delegation.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "js-unit-5-notes",
            "title": "Module 5 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 5: DOM Manipulation & Browser Events\n\n## Overview\nThe Document Object Model (DOM) is a tree-like object representation of an HTML document constructed by the browser engine. JavaScript interacts with the DOM to dynamically update element styles, content, and listen to user input events.\n\n## Learning Objectives\n- Select elements efficiently using `querySelector()`, `querySelectorAll()`, and `getElementById()`.\n- Modify DOM elements, attributes, and CSS class lists with `classList.add()`, `classList.toggle()`.\n- Master event handling with `addEventListener()`, understanding Event Bubbling, Event Capturing, and Event Delegation.\n\n## Concept: Event Delegation\nInstead of attaching individual click listeners to hundreds of list items, attach a single listener to their common parent container and inspect `event.target`.\n\n```html\n<ul id=\"course-list\">\n  <li data-course=\"js\">JavaScript</li>\n  <li data-course=\"python\">Python</li>\n  <li data-course=\"react\">React</li>\n</ul>\n\n<script>\n  const list = document.querySelector('#course-list');\n  list.addEventListener('click', (e) => {\n    if (e.target && e.target.nodeName === 'LI') {\n      console.log('Selected Course:', e.target.dataset.course);\n    }\n  });\n</script>\n```\n\n> 💡 **Tip:** Always use `event.preventDefault()` on form submission events to prevent full-page browser reloads.\n",
            "content": "# Module 5: DOM Manipulation & Browser Events\n\n## Overview\nThe Document Object Model (DOM) is a tree-like object representation of an HTML document constructed by the browser engine. JavaScript interacts with the DOM to dynamically update element styles, content, and listen to user input events.\n\n## Learning Objectives\n- Select elements efficiently using `querySelector()`, `querySelectorAll()`, and `getElementById()`.\n- Modify DOM elements, attributes, and CSS class lists with `classList.add()`, `classList.toggle()`.\n- Master event handling with `addEventListener()`, understanding Event Bubbling, Event Capturing, and Event Delegation.\n\n## Concept: Event Delegation\nInstead of attaching individual click listeners to hundreds of list items, attach a single listener to their common parent container and inspect `event.target`.\n\n```html\n<ul id=\"course-list\">\n  <li data-course=\"js\">JavaScript</li>\n  <li data-course=\"python\">Python</li>\n  <li data-course=\"react\">React</li>\n</ul>\n\n<script>\n  const list = document.querySelector('#course-list');\n  list.addEventListener('click', (e) => {\n    if (e.target && e.target.nodeName === 'LI') {\n      console.log('Selected Course:', e.target.dataset.course);\n    }\n  });\n</script>\n```\n\n> 💡 **Tip:** Always use `event.preventDefault()` on form submission events to prevent full-page browser reloads.\n",
            "conceptTheory": "# Module 5: DOM Manipulation & Browser Events\n\n## Overview\nThe Document Object Model (DOM) is a tree-like object representation of an HTML document constructed by the browser engine. JavaScript interacts with the DOM to dynamically update element styles, content, and listen to user input events.\n\n## Learning Objectives\n- Select elements efficiently using `querySelector()`, `querySelectorAll()`, and `getElementById()`.\n- Modify DOM elements, attributes, and CSS class lists with `classList.add()`, `classList.toggle()`.\n- Master event handling with `addEventListener()`, understanding Event Bubbling, Event Capturing, and Event Delegation.\n\n## Concept: Event Delegation\nInstead of attaching individual click listeners to hundreds of list items, attach a single listener to their common parent container and inspect `event.target`.\n\n```html\n<ul id=\"course-list\">\n  <li data-course=\"js\">JavaScript</li>\n  <li data-course=\"python\">Python</li>\n  <li data-course=\"react\">React</li>\n</ul>\n\n<script>\n  const list = document.querySelector('#course-list');\n  list.addEventListener('click', (e) => {\n    if (e.target && e.target.nodeName === 'LI') {\n      console.log('Selected Course:', e.target.dataset.course);\n    }\n  });\n</script>\n```\n\n> 💡 **Tip:** Always use `event.preventDefault()` on form submission events to prevent full-page browser reloads.\n",
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
    "description": "Event loop, Promises, async/await, and Fetch API.",
    "orderIndex": 6,
    "id": "js-mod-6",
    "title": "Module 6: Asynchronous JavaScript & Promises",
    "courseId": "javascript-mastery",
    "order": 6,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 6: Asynchronous JavaScript & Promises",
        "title": "Module 6 - Complete Notes",
        "type": "Reading",
        "content": "# Module 6: Asynchronous JavaScript, Promises & Fetch API\n## Overview\nJavaScript is single-threaded, but it achieves non-blocking asynchronous operations through the Browser / libuv Event Loop. Network calls, file reads, and timers execute asynchronously in the background.\n\n## Learning Objectives\n- Understand the Event Loop, Call Stack, Task Queue (Macrotasks), and Microtask Queue (Promises).\n- Create and handle ES6 `Promise` objects (`resolve`, `reject`, `then`, `catch`, `finally`).\n- Master `async / await` syntax with robust `try / catch` error boundaries.\n- Perform HTTP REST API requests using the native `fetch()` API.\n## Concept: Microtasks vs Macrotasks\nPromise callbacks in the Microtask queue always execute before setTimeout/setInterval callbacks in the Task queue.\n\n```javascript\nasync function fetchCourseData(courseId) {\n  try {\n    const response = await fetch(`https://api.kaizenq.in/courses/${courseId}`);\n    if (!response.ok) {\n      throw new Error(`HTTP Error: ${response.status}`);\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Failed to load course details:', error.message);\n    throw error;\n  }\n}\n```\n> 💡 **Tip:** Use `Promise.all()` to execute independent API requests in parallel rather than chaining multiple `await` calls sequentially.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "js-unit-6-notes",
        "moduleId": "js-mod-6",
        "courseId": "javascript-mastery",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 6: Asynchronous JavaScript, Promises & Fetch API\n## Overview\nJavaScript is single-threaded, but it achieves non-blocking asynchronous operations through the Browser / libuv Event Loop. Network calls, file reads, and timers execute asynchronously in the background.\n\n## Learning Objectives\n- Understand the Event Loop, Call Stack, Task Queue (Macrotasks), and Microtask Queue (Promises).\n- Create and handle ES6 `Promise` objects (`resolve`, `reject`, `then`, `catch`, `finally`).\n- Master `async / await` syntax with robust `try / catch` error boundaries.\n- Perform HTTP REST API requests using the native `fetch()` API.\n## Concept: Microtasks vs Macrotasks\nPromise callbacks in the Microtask queue always execute before setTimeout/setInterval callbacks in the Task queue.\n\n```javascript\nasync function fetchCourseData(courseId) {\n  try {\n    const response = await fetch(`https://api.kaizenq.in/courses/${courseId}`);\n    if (!response.ok) {\n      throw new Error(`HTTP Error: ${response.status}`);\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Failed to load course details:', error.message);\n    throw error;\n  }\n}\n```\n> 💡 **Tip:** Use `Promise.all()` to execute independent API requests in parallel rather than chaining multiple `await` calls sequentially."
      }
    ],
    "topics": [
      {
        "id": "js-mod-6-topic-1",
        "title": "Module 6: Asynchronous JavaScript & Promises Units",
        "description": "Event loop, Promises, async/await, and Fetch API.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "js-unit-6-notes",
            "title": "Module 6 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 6: Asynchronous JavaScript, Promises & Fetch API\n\n## Overview\nJavaScript is single-threaded, but it achieves non-blocking asynchronous operations through the Browser / libuv Event Loop. Network calls, file reads, and timers execute asynchronously in the background.\n\n## Learning Objectives\n- Understand the Event Loop, Call Stack, Task Queue (Macrotasks), and Microtask Queue (Promises).\n- Create and handle ES6 `Promise` objects (`resolve`, `reject`, `then`, `catch`, `finally`).\n- Master `async / await` syntax with robust `try / catch` error boundaries.\n- Perform HTTP REST API requests using the native `fetch()` API.\n\n## Concept: Microtasks vs Macrotasks\nPromise callbacks in the Microtask queue always execute before setTimeout/setInterval callbacks in the Task queue.\n\n```javascript\nasync function fetchCourseData(courseId) {\n  try {\n    const response = await fetch(`https://api.kaizenq.in/courses/${courseId}`);\n    if (!response.ok) {\n      throw new Error(`HTTP Error: ${response.status}`);\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Failed to load course details:', error.message);\n    throw error;\n  }\n}\n```\n\n> 💡 **Tip:** Use `Promise.all()` to execute independent API requests in parallel rather than chaining multiple `await` calls sequentially.\n",
            "content": "# Module 6: Asynchronous JavaScript, Promises & Fetch API\n\n## Overview\nJavaScript is single-threaded, but it achieves non-blocking asynchronous operations through the Browser / libuv Event Loop. Network calls, file reads, and timers execute asynchronously in the background.\n\n## Learning Objectives\n- Understand the Event Loop, Call Stack, Task Queue (Macrotasks), and Microtask Queue (Promises).\n- Create and handle ES6 `Promise` objects (`resolve`, `reject`, `then`, `catch`, `finally`).\n- Master `async / await` syntax with robust `try / catch` error boundaries.\n- Perform HTTP REST API requests using the native `fetch()` API.\n\n## Concept: Microtasks vs Macrotasks\nPromise callbacks in the Microtask queue always execute before setTimeout/setInterval callbacks in the Task queue.\n\n```javascript\nasync function fetchCourseData(courseId) {\n  try {\n    const response = await fetch(`https://api.kaizenq.in/courses/${courseId}`);\n    if (!response.ok) {\n      throw new Error(`HTTP Error: ${response.status}`);\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Failed to load course details:', error.message);\n    throw error;\n  }\n}\n```\n\n> 💡 **Tip:** Use `Promise.all()` to execute independent API requests in parallel rather than chaining multiple `await` calls sequentially.\n",
            "conceptTheory": "# Module 6: Asynchronous JavaScript, Promises & Fetch API\n\n## Overview\nJavaScript is single-threaded, but it achieves non-blocking asynchronous operations through the Browser / libuv Event Loop. Network calls, file reads, and timers execute asynchronously in the background.\n\n## Learning Objectives\n- Understand the Event Loop, Call Stack, Task Queue (Macrotasks), and Microtask Queue (Promises).\n- Create and handle ES6 `Promise` objects (`resolve`, `reject`, `then`, `catch`, `finally`).\n- Master `async / await` syntax with robust `try / catch` error boundaries.\n- Perform HTTP REST API requests using the native `fetch()` API.\n\n## Concept: Microtasks vs Macrotasks\nPromise callbacks in the Microtask queue always execute before setTimeout/setInterval callbacks in the Task queue.\n\n```javascript\nasync function fetchCourseData(courseId) {\n  try {\n    const response = await fetch(`https://api.kaizenq.in/courses/${courseId}`);\n    if (!response.ok) {\n      throw new Error(`HTTP Error: ${response.status}`);\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Failed to load course details:', error.message);\n    throw error;\n  }\n}\n```\n\n> 💡 **Tip:** Use `Promise.all()` to execute independent API requests in parallel rather than chaining multiple `await` calls sequentially.\n",
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
    "description": "ES Modules, optional chaining, nullish coalescing, Map and Set.",
    "orderIndex": 7,
    "id": "js-mod-7",
    "title": "Module 7: Modern ES6+ Features & Modules",
    "courseId": "javascript-mastery",
    "order": 7,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 7: Modern ES6+ Features & Modules",
        "title": "Module 7 - Complete Notes",
        "type": "Reading",
        "content": "# Module 7: Modern ES6+ Features & Modules\n## Overview\nSince ECMAScript 2015 (ES6), JavaScript has gained major language enhancements that make code more expressive, safer, and modular.\n\n## Learning Objectives\n- Understand ES Modules (`import` and `export`, default vs named exports).\n- Master Optional Chaining (`?.`), Nullish Coalescing (`??`), and Logical Assignment operators (`&&=`, `||=`, `??=`).\n- Harness Template Literals with embedded expressions and multi-line strings.\n- Work with `Set` (unique values) and `Map` (keyed collections).\n## Example\n```javascript\n// mathUtils.js\nexport const add = (a, b) => a + b;\nexport default function multiply(a, b) { return a * b; }\n\n// app.js\nimport multiply, { add } from './mathUtils.js';\n\nconst studentProfile = {\n  name: 'Alex',\n  preferences: {\n    theme: 'dark'\n  }\n};\n\n// Safe deep property navigation with optional chaining\nconst fontSize = studentProfile?.preferences?.layout?.fontSize ?? 16;\nconsole.log(`Calculated Font Size: ${fontSize}px`);\n```\n> 📌 **Note:** ES Modules are statically analyzable, enabling modern bundlers (such as Vite and Rollup) to perform tree-shaking (dead code elimination).",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "js-unit-7-notes",
        "moduleId": "js-mod-7",
        "courseId": "javascript-mastery",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 7: Modern ES6+ Features & Modules\n## Overview\nSince ECMAScript 2015 (ES6), JavaScript has gained major language enhancements that make code more expressive, safer, and modular.\n\n## Learning Objectives\n- Understand ES Modules (`import` and `export`, default vs named exports).\n- Master Optional Chaining (`?.`), Nullish Coalescing (`??`), and Logical Assignment operators (`&&=`, `||=`, `??=`).\n- Harness Template Literals with embedded expressions and multi-line strings.\n- Work with `Set` (unique values) and `Map` (keyed collections).\n## Example\n```javascript\n// mathUtils.js\nexport const add = (a, b) => a + b;\nexport default function multiply(a, b) { return a * b; }\n\n// app.js\nimport multiply, { add } from './mathUtils.js';\n\nconst studentProfile = {\n  name: 'Alex',\n  preferences: {\n    theme: 'dark'\n  }\n};\n\n// Safe deep property navigation with optional chaining\nconst fontSize = studentProfile?.preferences?.layout?.fontSize ?? 16;\nconsole.log(`Calculated Font Size: ${fontSize}px`);\n```\n> 📌 **Note:** ES Modules are statically analyzable, enabling modern bundlers (such as Vite and Rollup) to perform tree-shaking (dead code elimination)."
      }
    ],
    "topics": [
      {
        "id": "js-mod-7-topic-1",
        "title": "Module 7: Modern ES6+ Features & Modules Units",
        "description": "ES Modules, optional chaining, nullish coalescing, Map and Set.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "js-unit-7-notes",
            "title": "Module 7 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 7: Modern ES6+ Features & Modules\n\n## Overview\nSince ECMAScript 2015 (ES6), JavaScript has gained major language enhancements that make code more expressive, safer, and modular.\n\n## Learning Objectives\n- Understand ES Modules (`import` and `export`, default vs named exports).\n- Master Optional Chaining (`?.`), Nullish Coalescing (`??`), and Logical Assignment operators (`&&=`, `||=`, `??=`).\n- Harness Template Literals with embedded expressions and multi-line strings.\n- Work with `Set` (unique values) and `Map` (keyed collections).\n\n## Example\n```javascript\n// mathUtils.js\nexport const add = (a, b) => a + b;\nexport default function multiply(a, b) { return a * b; }\n\n// app.js\nimport multiply, { add } from './mathUtils.js';\n\nconst studentProfile = {\n  name: 'Alex',\n  preferences: {\n    theme: 'dark'\n  }\n};\n\n// Safe deep property navigation with optional chaining\nconst fontSize = studentProfile?.preferences?.layout?.fontSize ?? 16;\nconsole.log(`Calculated Font Size: ${fontSize}px`);\n```\n\n> 📌 **Note:** ES Modules are statically analyzable, enabling modern bundlers (such as Vite and Rollup) to perform tree-shaking (dead code elimination).\n",
            "content": "# Module 7: Modern ES6+ Features & Modules\n\n## Overview\nSince ECMAScript 2015 (ES6), JavaScript has gained major language enhancements that make code more expressive, safer, and modular.\n\n## Learning Objectives\n- Understand ES Modules (`import` and `export`, default vs named exports).\n- Master Optional Chaining (`?.`), Nullish Coalescing (`??`), and Logical Assignment operators (`&&=`, `||=`, `??=`).\n- Harness Template Literals with embedded expressions and multi-line strings.\n- Work with `Set` (unique values) and `Map` (keyed collections).\n\n## Example\n```javascript\n// mathUtils.js\nexport const add = (a, b) => a + b;\nexport default function multiply(a, b) { return a * b; }\n\n// app.js\nimport multiply, { add } from './mathUtils.js';\n\nconst studentProfile = {\n  name: 'Alex',\n  preferences: {\n    theme: 'dark'\n  }\n};\n\n// Safe deep property navigation with optional chaining\nconst fontSize = studentProfile?.preferences?.layout?.fontSize ?? 16;\nconsole.log(`Calculated Font Size: ${fontSize}px`);\n```\n\n> 📌 **Note:** ES Modules are statically analyzable, enabling modern bundlers (such as Vite and Rollup) to perform tree-shaking (dead code elimination).\n",
            "conceptTheory": "# Module 7: Modern ES6+ Features & Modules\n\n## Overview\nSince ECMAScript 2015 (ES6), JavaScript has gained major language enhancements that make code more expressive, safer, and modular.\n\n## Learning Objectives\n- Understand ES Modules (`import` and `export`, default vs named exports).\n- Master Optional Chaining (`?.`), Nullish Coalescing (`??`), and Logical Assignment operators (`&&=`, `||=`, `??=`).\n- Harness Template Literals with embedded expressions and multi-line strings.\n- Work with `Set` (unique values) and `Map` (keyed collections).\n\n## Example\n```javascript\n// mathUtils.js\nexport const add = (a, b) => a + b;\nexport default function multiply(a, b) { return a * b; }\n\n// app.js\nimport multiply, { add } from './mathUtils.js';\n\nconst studentProfile = {\n  name: 'Alex',\n  preferences: {\n    theme: 'dark'\n  }\n};\n\n// Safe deep property navigation with optional chaining\nconst fontSize = studentProfile?.preferences?.layout?.fontSize ?? 16;\nconsole.log(`Calculated Font Size: ${fontSize}px`);\n```\n\n> 📌 **Note:** ES Modules are statically analyzable, enabling modern bundlers (such as Vite and Rollup) to perform tree-shaking (dead code elimination).\n",
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
    "description": "Prototypes, classes, inheritance, private fields, and getters/setters.",
    "orderIndex": 8,
    "id": "js-mod-8",
    "title": "Module 8: Object-Oriented JS & Prototypes",
    "courseId": "javascript-mastery",
    "order": 8,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 8: Object-Oriented JS & Prototypes",
        "title": "Module 8 - Complete Notes",
        "type": "Reading",
        "content": "# Module 8: Object-Oriented JS & Prototypes\n## Overview\nUnder the hood, JavaScript utilizes prototype-based inheritance. ES6 `class` syntax provides clean syntactic sugar over JavaScript's existing prototype mechanism.\n\n## Learning Objectives\n- Understand the Prototype Chain, `prototype`, and `__proto__`.\n- Define classes using `class`, constructors, instance methods, and static methods.\n- Master class inheritance using `extends` and `super()`.\n- Implement private class fields (`#privateField`) and getters/setters.\n## Example\n```javascript\nclass User {\n  #passwordHash; // Private field\n\n  constructor(name, email, password) {\n    this.name = name;\n    this.email = email;\n    this.#passwordHash = this.#hash(password);\n  }\n\n  #hash(pass) {\n    return `hashed_${pass}_secure`;\n  }\n\n  getDetails() {\n    return `Student: ${this.name} (${this.email})`;\n  }\n}\n\nclass Instructor extends User {\n  constructor(name, email, password, domain) {\n    super(name, email, password);\n    this.domain = domain;\n  }\n\n  getDetails() {\n    return `${super.getDetails()} - Specialist in ${this.domain}`;\n  }\n}\n\nconst tutor = new Instructor('Banu Prakash', 'banu@kaizenq.in', 'secret', 'System Design');\nconsole.log(tutor.getDetails());\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "js-unit-8-notes",
        "moduleId": "js-mod-8",
        "courseId": "javascript-mastery",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 8: Object-Oriented JS & Prototypes\n## Overview\nUnder the hood, JavaScript utilizes prototype-based inheritance. ES6 `class` syntax provides clean syntactic sugar over JavaScript's existing prototype mechanism.\n\n## Learning Objectives\n- Understand the Prototype Chain, `prototype`, and `__proto__`.\n- Define classes using `class`, constructors, instance methods, and static methods.\n- Master class inheritance using `extends` and `super()`.\n- Implement private class fields (`#privateField`) and getters/setters.\n## Example\n```javascript\nclass User {\n  #passwordHash; // Private field\n\n  constructor(name, email, password) {\n    this.name = name;\n    this.email = email;\n    this.#passwordHash = this.#hash(password);\n  }\n\n  #hash(pass) {\n    return `hashed_${pass}_secure`;\n  }\n\n  getDetails() {\n    return `Student: ${this.name} (${this.email})`;\n  }\n}\n\nclass Instructor extends User {\n  constructor(name, email, password, domain) {\n    super(name, email, password);\n    this.domain = domain;\n  }\n\n  getDetails() {\n    return `${super.getDetails()} - Specialist in ${this.domain}`;\n  }\n}\n\nconst tutor = new Instructor('Banu Prakash', 'banu@kaizenq.in', 'secret', 'System Design');\nconsole.log(tutor.getDetails());\n```"
      }
    ],
    "topics": [
      {
        "id": "js-mod-8-topic-1",
        "title": "Module 8: Object-Oriented JS & Prototypes Units",
        "description": "Prototypes, classes, inheritance, private fields, and getters/setters.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "js-unit-8-notes",
            "title": "Module 8 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 8: Object-Oriented JS & Prototypes\n\n## Overview\nUnder the hood, JavaScript utilizes prototype-based inheritance. ES6 `class` syntax provides clean syntactic sugar over JavaScript's existing prototype mechanism.\n\n## Learning Objectives\n- Understand the Prototype Chain, `prototype`, and `__proto__`.\n- Define classes using `class`, constructors, instance methods, and static methods.\n- Master class inheritance using `extends` and `super()`.\n- Implement private class fields (`#privateField`) and getters/setters.\n\n## Example\n```javascript\nclass User {\n  #passwordHash; // Private field\n\n  constructor(name, email, password) {\n    this.name = name;\n    this.email = email;\n    this.#passwordHash = this.#hash(password);\n  }\n\n  #hash(pass) {\n    return `hashed_${pass}_secure`;\n  }\n\n  getDetails() {\n    return `Student: ${this.name} (${this.email})`;\n  }\n}\n\nclass Instructor extends User {\n  constructor(name, email, password, domain) {\n    super(name, email, password);\n    this.domain = domain;\n  }\n\n  getDetails() {\n    return `${super.getDetails()} - Specialist in ${this.domain}`;\n  }\n}\n\nconst tutor = new Instructor('Banu Prakash', 'banu@kaizenq.in', 'secret', 'System Design');\nconsole.log(tutor.getDetails());\n```\n",
            "content": "# Module 8: Object-Oriented JS & Prototypes\n\n## Overview\nUnder the hood, JavaScript utilizes prototype-based inheritance. ES6 `class` syntax provides clean syntactic sugar over JavaScript's existing prototype mechanism.\n\n## Learning Objectives\n- Understand the Prototype Chain, `prototype`, and `__proto__`.\n- Define classes using `class`, constructors, instance methods, and static methods.\n- Master class inheritance using `extends` and `super()`.\n- Implement private class fields (`#privateField`) and getters/setters.\n\n## Example\n```javascript\nclass User {\n  #passwordHash; // Private field\n\n  constructor(name, email, password) {\n    this.name = name;\n    this.email = email;\n    this.#passwordHash = this.#hash(password);\n  }\n\n  #hash(pass) {\n    return `hashed_${pass}_secure`;\n  }\n\n  getDetails() {\n    return `Student: ${this.name} (${this.email})`;\n  }\n}\n\nclass Instructor extends User {\n  constructor(name, email, password, domain) {\n    super(name, email, password);\n    this.domain = domain;\n  }\n\n  getDetails() {\n    return `${super.getDetails()} - Specialist in ${this.domain}`;\n  }\n}\n\nconst tutor = new Instructor('Banu Prakash', 'banu@kaizenq.in', 'secret', 'System Design');\nconsole.log(tutor.getDetails());\n```\n",
            "conceptTheory": "# Module 8: Object-Oriented JS & Prototypes\n\n## Overview\nUnder the hood, JavaScript utilizes prototype-based inheritance. ES6 `class` syntax provides clean syntactic sugar over JavaScript's existing prototype mechanism.\n\n## Learning Objectives\n- Understand the Prototype Chain, `prototype`, and `__proto__`.\n- Define classes using `class`, constructors, instance methods, and static methods.\n- Master class inheritance using `extends` and `super()`.\n- Implement private class fields (`#privateField`) and getters/setters.\n\n## Example\n```javascript\nclass User {\n  #passwordHash; // Private field\n\n  constructor(name, email, password) {\n    this.name = name;\n    this.email = email;\n    this.#passwordHash = this.#hash(password);\n  }\n\n  #hash(pass) {\n    return `hashed_${pass}_secure`;\n  }\n\n  getDetails() {\n    return `Student: ${this.name} (${this.email})`;\n  }\n}\n\nclass Instructor extends User {\n  constructor(name, email, password, domain) {\n    super(name, email, password);\n    this.domain = domain;\n  }\n\n  getDetails() {\n    return `${super.getDetails()} - Specialist in ${this.domain}`;\n  }\n}\n\nconst tutor = new Instructor('Banu Prakash', 'banu@kaizenq.in', 'secret', 'System Design');\nconsole.log(tutor.getDetails());\n```\n",
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
    "description": "Building end-to-end interactive applications and state stores.",
    "orderIndex": 9,
    "id": "js-mod-9",
    "title": "Module 9: Practical JavaScript Projects",
    "courseId": "javascript-mastery",
    "order": 9,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 9: Practical JavaScript Projects",
        "title": "Module 9 - Complete Notes",
        "type": "Reading",
        "content": "# Module 9: Practical JavaScript Projects\n## Overview\nApply all foundational concepts to construct real-world client-side applications including interactive calculators, task trackers, and live API-driven applications.\n\n## Learning Objectives\n- Build a persistent Todo / Kanban Application with LocalStorage persistence.\n- Implement real-time search filtering, sorting, and pagination algorithms.\n- Structure client-side JavaScript following modular MVC (Model-View-Controller) architecture.\n## Example Project: LocalStorage Task Manager\n```javascript\nclass TaskStore {\n  constructor(storageKey = 'kaizenq_tasks') {\n    this.key = storageKey;\n  }\n\n  getTasks() {\n    const raw = localStorage.getItem(this.key);\n    return raw ? JSON.parse(raw) : [];\n  }\n\n  addTask(taskTitle) {\n    const tasks = this.getTasks();\n    const newTask = { id: Date.now(), title: taskTitle, done: false };\n    tasks.push(newTask);\n    localStorage.setItem(this.key, JSON.stringify(tasks));\n    return newTask;\n  }\n\n  toggleTask(taskId) {\n    const tasks = this.getTasks().map(t => \n      t.id === taskId ? { ...t, done: !t.done } : t\n    );\n    localStorage.setItem(this.key, JSON.stringify(tasks));\n  }\n}\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "js-unit-9-notes",
        "moduleId": "js-mod-9",
        "courseId": "javascript-mastery",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 9: Practical JavaScript Projects\n## Overview\nApply all foundational concepts to construct real-world client-side applications including interactive calculators, task trackers, and live API-driven applications.\n\n## Learning Objectives\n- Build a persistent Todo / Kanban Application with LocalStorage persistence.\n- Implement real-time search filtering, sorting, and pagination algorithms.\n- Structure client-side JavaScript following modular MVC (Model-View-Controller) architecture.\n## Example Project: LocalStorage Task Manager\n```javascript\nclass TaskStore {\n  constructor(storageKey = 'kaizenq_tasks') {\n    this.key = storageKey;\n  }\n\n  getTasks() {\n    const raw = localStorage.getItem(this.key);\n    return raw ? JSON.parse(raw) : [];\n  }\n\n  addTask(taskTitle) {\n    const tasks = this.getTasks();\n    const newTask = { id: Date.now(), title: taskTitle, done: false };\n    tasks.push(newTask);\n    localStorage.setItem(this.key, JSON.stringify(tasks));\n    return newTask;\n  }\n\n  toggleTask(taskId) {\n    const tasks = this.getTasks().map(t => \n      t.id === taskId ? { ...t, done: !t.done } : t\n    );\n    localStorage.setItem(this.key, JSON.stringify(tasks));\n  }\n}\n```"
      }
    ],
    "topics": [
      {
        "id": "js-mod-9-topic-1",
        "title": "Module 9: Practical JavaScript Projects Units",
        "description": "Building end-to-end interactive applications and state stores.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "js-unit-9-notes",
            "title": "Module 9 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 9: Practical JavaScript Projects\n\n## Overview\nApply all foundational concepts to construct real-world client-side applications including interactive calculators, task trackers, and live API-driven applications.\n\n## Learning Objectives\n- Build a persistent Todo / Kanban Application with LocalStorage persistence.\n- Implement real-time search filtering, sorting, and pagination algorithms.\n- Structure client-side JavaScript following modular MVC (Model-View-Controller) architecture.\n\n## Example Project: LocalStorage Task Manager\n```javascript\nclass TaskStore {\n  constructor(storageKey = 'kaizenq_tasks') {\n    this.key = storageKey;\n  }\n\n  getTasks() {\n    const raw = localStorage.getItem(this.key);\n    return raw ? JSON.parse(raw) : [];\n  }\n\n  addTask(taskTitle) {\n    const tasks = this.getTasks();\n    const newTask = { id: Date.now(), title: taskTitle, done: false };\n    tasks.push(newTask);\n    localStorage.setItem(this.key, JSON.stringify(tasks));\n    return newTask;\n  }\n\n  toggleTask(taskId) {\n    const tasks = this.getTasks().map(t => \n      t.id === taskId ? { ...t, done: !t.done } : t\n    );\n    localStorage.setItem(this.key, JSON.stringify(tasks));\n  }\n}\n```\n",
            "content": "# Module 9: Practical JavaScript Projects\n\n## Overview\nApply all foundational concepts to construct real-world client-side applications including interactive calculators, task trackers, and live API-driven applications.\n\n## Learning Objectives\n- Build a persistent Todo / Kanban Application with LocalStorage persistence.\n- Implement real-time search filtering, sorting, and pagination algorithms.\n- Structure client-side JavaScript following modular MVC (Model-View-Controller) architecture.\n\n## Example Project: LocalStorage Task Manager\n```javascript\nclass TaskStore {\n  constructor(storageKey = 'kaizenq_tasks') {\n    this.key = storageKey;\n  }\n\n  getTasks() {\n    const raw = localStorage.getItem(this.key);\n    return raw ? JSON.parse(raw) : [];\n  }\n\n  addTask(taskTitle) {\n    const tasks = this.getTasks();\n    const newTask = { id: Date.now(), title: taskTitle, done: false };\n    tasks.push(newTask);\n    localStorage.setItem(this.key, JSON.stringify(tasks));\n    return newTask;\n  }\n\n  toggleTask(taskId) {\n    const tasks = this.getTasks().map(t => \n      t.id === taskId ? { ...t, done: !t.done } : t\n    );\n    localStorage.setItem(this.key, JSON.stringify(tasks));\n  }\n}\n```\n",
            "conceptTheory": "# Module 9: Practical JavaScript Projects\n\n## Overview\nApply all foundational concepts to construct real-world client-side applications including interactive calculators, task trackers, and live API-driven applications.\n\n## Learning Objectives\n- Build a persistent Todo / Kanban Application with LocalStorage persistence.\n- Implement real-time search filtering, sorting, and pagination algorithms.\n- Structure client-side JavaScript following modular MVC (Model-View-Controller) architecture.\n\n## Example Project: LocalStorage Task Manager\n```javascript\nclass TaskStore {\n  constructor(storageKey = 'kaizenq_tasks') {\n    this.key = storageKey;\n  }\n\n  getTasks() {\n    const raw = localStorage.getItem(this.key);\n    return raw ? JSON.parse(raw) : [];\n  }\n\n  addTask(taskTitle) {\n    const tasks = this.getTasks();\n    const newTask = { id: Date.now(), title: taskTitle, done: false };\n    tasks.push(newTask);\n    localStorage.setItem(this.key, JSON.stringify(tasks));\n    return newTask;\n  }\n\n  toggleTask(taskId) {\n    const tasks = this.getTasks().map(t => \n      t.id === taskId ? { ...t, done: !t.done } : t\n    );\n    localStorage.setItem(this.key, JSON.stringify(tasks));\n  }\n}\n```\n",
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
    "description": "Debounce, throttle, closures, memory leaks, and technical Q&A.",
    "orderIndex": 10,
    "id": "js-mod-10",
    "title": "Module 10: JavaScript Interview Mastery",
    "courseId": "javascript-mastery",
    "order": 10,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 10: JavaScript Interview Mastery",
        "title": "Module 10 - Complete Notes",
        "type": "Reading",
        "content": "# Module 10: JavaScript Interview Mastery & Best Practices\n## Overview\nComprehensive review of advanced interview questions, memory management, garbage collection, and clean coding best practices.\n\n## Learning Objectives\n- Understand Hoisting, Temporal Dead Zone, Currying, and Debounce/Throttle functions.\n- Master memory leaks prevention, garbage collection mark-and-sweep algorithm, and event loop microtask sequencing.\n- Review top coding interview challenges and patterns.\n## Concept: Debounce Implementation\n```javascript\nfunction debounce(fn, delayMs = 300) {\n  let timerId;\n  return function (...args) {\n    clearTimeout(timerId);\n    timerId = setTimeout(() => fn.apply(this, args), delayMs);\n  };\n}\n\nconst handleLiveSearch = debounce((query) => {\n  console.log('Searching API for:', query);\n}, 400);\n```\n> 💡 **Tip:** In technical interviews, always clarify time and space complexity ($O(N)$ vs $O(1)$) before implementing array and object lookup operations.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "js-unit-10-notes",
        "moduleId": "js-mod-10",
        "courseId": "javascript-mastery",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 10: JavaScript Interview Mastery & Best Practices\n## Overview\nComprehensive review of advanced interview questions, memory management, garbage collection, and clean coding best practices.\n\n## Learning Objectives\n- Understand Hoisting, Temporal Dead Zone, Currying, and Debounce/Throttle functions.\n- Master memory leaks prevention, garbage collection mark-and-sweep algorithm, and event loop microtask sequencing.\n- Review top coding interview challenges and patterns.\n## Concept: Debounce Implementation\n```javascript\nfunction debounce(fn, delayMs = 300) {\n  let timerId;\n  return function (...args) {\n    clearTimeout(timerId);\n    timerId = setTimeout(() => fn.apply(this, args), delayMs);\n  };\n}\n\nconst handleLiveSearch = debounce((query) => {\n  console.log('Searching API for:', query);\n}, 400);\n```\n> 💡 **Tip:** In technical interviews, always clarify time and space complexity ($O(N)$ vs $O(1)$) before implementing array and object lookup operations."
      }
    ],
    "topics": [
      {
        "id": "js-mod-10-topic-1",
        "title": "Module 10: JavaScript Interview Mastery Units",
        "description": "Debounce, throttle, closures, memory leaks, and technical Q&A.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "js-unit-10-notes",
            "title": "Module 10 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 10: JavaScript Interview Mastery & Best Practices\n\n## Overview\nComprehensive review of advanced interview questions, memory management, garbage collection, and clean coding best practices.\n\n## Learning Objectives\n- Understand Hoisting, Temporal Dead Zone, Currying, and Debounce/Throttle functions.\n- Master memory leaks prevention, garbage collection mark-and-sweep algorithm, and event loop microtask sequencing.\n- Review top coding interview challenges and patterns.\n\n## Concept: Debounce Implementation\n```javascript\nfunction debounce(fn, delayMs = 300) {\n  let timerId;\n  return function (...args) {\n    clearTimeout(timerId);\n    timerId = setTimeout(() => fn.apply(this, args), delayMs);\n  };\n}\n\nconst handleLiveSearch = debounce((query) => {\n  console.log('Searching API for:', query);\n}, 400);\n```\n\n> 💡 **Tip:** In technical interviews, always clarify time and space complexity ($O(N)$ vs $O(1)$) before implementing array and object lookup operations.\n",
            "content": "# Module 10: JavaScript Interview Mastery & Best Practices\n\n## Overview\nComprehensive review of advanced interview questions, memory management, garbage collection, and clean coding best practices.\n\n## Learning Objectives\n- Understand Hoisting, Temporal Dead Zone, Currying, and Debounce/Throttle functions.\n- Master memory leaks prevention, garbage collection mark-and-sweep algorithm, and event loop microtask sequencing.\n- Review top coding interview challenges and patterns.\n\n## Concept: Debounce Implementation\n```javascript\nfunction debounce(fn, delayMs = 300) {\n  let timerId;\n  return function (...args) {\n    clearTimeout(timerId);\n    timerId = setTimeout(() => fn.apply(this, args), delayMs);\n  };\n}\n\nconst handleLiveSearch = debounce((query) => {\n  console.log('Searching API for:', query);\n}, 400);\n```\n\n> 💡 **Tip:** In technical interviews, always clarify time and space complexity ($O(N)$ vs $O(1)$) before implementing array and object lookup operations.\n",
            "conceptTheory": "# Module 10: JavaScript Interview Mastery & Best Practices\n\n## Overview\nComprehensive review of advanced interview questions, memory management, garbage collection, and clean coding best practices.\n\n## Learning Objectives\n- Understand Hoisting, Temporal Dead Zone, Currying, and Debounce/Throttle functions.\n- Master memory leaks prevention, garbage collection mark-and-sweep algorithm, and event loop microtask sequencing.\n- Review top coding interview challenges and patterns.\n\n## Concept: Debounce Implementation\n```javascript\nfunction debounce(fn, delayMs = 300) {\n  let timerId;\n  return function (...args) {\n    clearTimeout(timerId);\n    timerId = setTimeout(() => fn.apply(this, args), delayMs);\n  };\n}\n\nconst handleLiveSearch = debounce((query) => {\n  console.log('Searching API for:', query);\n}, 400);\n```\n\n> 💡 **Tip:** In technical interviews, always clarify time and space complexity ($O(N)$ vs $O(1)$) before implementing array and object lookup operations.\n",
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
