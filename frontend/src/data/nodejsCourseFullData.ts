import type { ModuleItem } from '../contexts/CourseContext';

export const nodejsCourseModules: ModuleItem[] = [
  {
    "duration": "2 Hours",
    "description": "Node runtime, V8 architecture, REPL, and executing scripts.",
    "orderIndex": 1,
    "id": "node-mod-1",
    "title": "Module 1: Introduction to Node.js & V8 Engine",
    "courseId": "nodejs-backend-development",
    "order": 1,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 1: Introduction to Node.js & V8 Engine",
        "title": "Module 1 - Complete Notes",
        "type": "Reading",
        "content": "# Module 1: Introduction to Node.js & V8 Engine\n## Overview\nNode.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's V8 engine. Created by Ryan Dahl in 2009, Node.js enables developers to run JavaScript outside the browser to build scalable, high-performance network applications.\n\n## Learning Objectives\n- Understand the architecture of the V8 JavaScript engine and libuv C library.\n- Understand single-threaded non-blocking asynchronous event-driven I/O.\n- Run JavaScript scripts via Node REPL and execute CLI files.\n## Concept: Node.js Architecture\n```text\n┌─────────────────────────────────────────────────────────────┐\n│                       Node.js Application                   │\n│                                                             │\n│   ┌──────────────────────────────────────────────────────┐  │\n│   │            Node.js Core API (fs, http, crypto)       │  │\n│   └──────────────────────────┬───────────────────────────┘  │\n│                              ▼                              │\n│   ┌──────────────────────────┬───────────────────────────┐  │\n│   │     V8 JavaScript Engine │      libuv C++ Library    │  │\n│   │  (JS Execution & JIT)    │ (Event Loop & Thread Pool)│  │\n│   └──────────────────────────┴───────────────────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n> 💡 **Tip:** Node.js executes CPU-light, I/O-heavy workloads (REST APIs, microservices, websockets) with extreme memory efficiency compared to multi-threaded server architectures.\n> 📌 **Note:** While JavaScript executes on a single thread, libuv maintains a background C++ Thread Pool (default 4 threads) for intensive tasks like file system access and cryptography.\n## Example\n```javascript\n// Check Node.js runtime process details\nconsole.log('Node.js Version:', process.version);\nconsole.log('Architecture:', process.arch);\nconsole.log('Platform:', process.platform);\nconsole.log('Current Memory Usage:', process.memoryUsage());\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "node-unit-1-notes",
        "moduleId": "node-mod-1",
        "courseId": "nodejs-backend-development",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 1: Introduction to Node.js & V8 Engine\n## Overview\nNode.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's V8 engine. Created by Ryan Dahl in 2009, Node.js enables developers to run JavaScript outside the browser to build scalable, high-performance network applications.\n\n## Learning Objectives\n- Understand the architecture of the V8 JavaScript engine and libuv C library.\n- Understand single-threaded non-blocking asynchronous event-driven I/O.\n- Run JavaScript scripts via Node REPL and execute CLI files.\n## Concept: Node.js Architecture\n```text\n┌─────────────────────────────────────────────────────────────┐\n│                       Node.js Application                   │\n│                                                             │\n│   ┌──────────────────────────────────────────────────────┐  │\n│   │            Node.js Core API (fs, http, crypto)       │  │\n│   └──────────────────────────┬───────────────────────────┘  │\n│                              ▼                              │\n│   ┌──────────────────────────┬───────────────────────────┐  │\n│   │     V8 JavaScript Engine │      libuv C++ Library    │  │\n│   │  (JS Execution & JIT)    │ (Event Loop & Thread Pool)│  │\n│   └──────────────────────────┴───────────────────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n> 💡 **Tip:** Node.js executes CPU-light, I/O-heavy workloads (REST APIs, microservices, websockets) with extreme memory efficiency compared to multi-threaded server architectures.\n> 📌 **Note:** While JavaScript executes on a single thread, libuv maintains a background C++ Thread Pool (default 4 threads) for intensive tasks like file system access and cryptography.\n## Example\n```javascript\n// Check Node.js runtime process details\nconsole.log('Node.js Version:', process.version);\nconsole.log('Architecture:', process.arch);\nconsole.log('Platform:', process.platform);\nconsole.log('Current Memory Usage:', process.memoryUsage());\n```"
      }
    ],
    "topics": [
      {
        "id": "node-mod-1-topic-1",
        "title": "Module 1: Introduction to Node.js & V8 Engine Units",
        "description": "Node runtime, V8 architecture, REPL, and executing scripts.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "node-unit-1-notes",
            "title": "Module 1 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 1: Introduction to Node.js & V8 Engine\n\n## Overview\nNode.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's V8 engine. Created by Ryan Dahl in 2009, Node.js enables developers to run JavaScript outside the browser to build scalable, high-performance network applications.\n\n## Learning Objectives\n- Understand the architecture of the V8 JavaScript engine and libuv C library.\n- Understand single-threaded non-blocking asynchronous event-driven I/O.\n- Run JavaScript scripts via Node REPL and execute CLI files.\n\n## Concept: Node.js Architecture\n```text\n┌─────────────────────────────────────────────────────────────┐\n│                       Node.js Application                   │\n│                                                             │\n│   ┌──────────────────────────────────────────────────────┐  │\n│   │            Node.js Core API (fs, http, crypto)       │  │\n│   └──────────────────────────┬───────────────────────────┘  │\n│                              ▼                              │\n│   ┌──────────────────────────┬───────────────────────────┐  │\n│   │     V8 JavaScript Engine │      libuv C++ Library    │  │\n│   │  (JS Execution & JIT)    │ (Event Loop & Thread Pool)│  │\n│   └──────────────────────────┴───────────────────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n\n> 💡 **Tip:** Node.js executes CPU-light, I/O-heavy workloads (REST APIs, microservices, websockets) with extreme memory efficiency compared to multi-threaded server architectures.\n\n> 📌 **Note:** While JavaScript executes on a single thread, libuv maintains a background C++ Thread Pool (default 4 threads) for intensive tasks like file system access and cryptography.\n\n## Example\n```javascript\n// Check Node.js runtime process details\nconsole.log('Node.js Version:', process.version);\nconsole.log('Architecture:', process.arch);\nconsole.log('Platform:', process.platform);\nconsole.log('Current Memory Usage:', process.memoryUsage());\n```\n",
            "content": "# Module 1: Introduction to Node.js & V8 Engine\n\n## Overview\nNode.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's V8 engine. Created by Ryan Dahl in 2009, Node.js enables developers to run JavaScript outside the browser to build scalable, high-performance network applications.\n\n## Learning Objectives\n- Understand the architecture of the V8 JavaScript engine and libuv C library.\n- Understand single-threaded non-blocking asynchronous event-driven I/O.\n- Run JavaScript scripts via Node REPL and execute CLI files.\n\n## Concept: Node.js Architecture\n```text\n┌─────────────────────────────────────────────────────────────┐\n│                       Node.js Application                   │\n│                                                             │\n│   ┌──────────────────────────────────────────────────────┐  │\n│   │            Node.js Core API (fs, http, crypto)       │  │\n│   └──────────────────────────┬───────────────────────────┘  │\n│                              ▼                              │\n│   ┌──────────────────────────┬───────────────────────────┐  │\n│   │     V8 JavaScript Engine │      libuv C++ Library    │  │\n│   │  (JS Execution & JIT)    │ (Event Loop & Thread Pool)│  │\n│   └──────────────────────────┴───────────────────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n\n> 💡 **Tip:** Node.js executes CPU-light, I/O-heavy workloads (REST APIs, microservices, websockets) with extreme memory efficiency compared to multi-threaded server architectures.\n\n> 📌 **Note:** While JavaScript executes on a single thread, libuv maintains a background C++ Thread Pool (default 4 threads) for intensive tasks like file system access and cryptography.\n\n## Example\n```javascript\n// Check Node.js runtime process details\nconsole.log('Node.js Version:', process.version);\nconsole.log('Architecture:', process.arch);\nconsole.log('Platform:', process.platform);\nconsole.log('Current Memory Usage:', process.memoryUsage());\n```\n",
            "conceptTheory": "# Module 1: Introduction to Node.js & V8 Engine\n\n## Overview\nNode.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome's V8 engine. Created by Ryan Dahl in 2009, Node.js enables developers to run JavaScript outside the browser to build scalable, high-performance network applications.\n\n## Learning Objectives\n- Understand the architecture of the V8 JavaScript engine and libuv C library.\n- Understand single-threaded non-blocking asynchronous event-driven I/O.\n- Run JavaScript scripts via Node REPL and execute CLI files.\n\n## Concept: Node.js Architecture\n```text\n┌─────────────────────────────────────────────────────────────┐\n│                       Node.js Application                   │\n│                                                             │\n│   ┌──────────────────────────────────────────────────────┐  │\n│   │            Node.js Core API (fs, http, crypto)       │  │\n│   └──────────────────────────┬───────────────────────────┘  │\n│                              ▼                              │\n│   ┌──────────────────────────┬───────────────────────────┐  │\n│   │     V8 JavaScript Engine │      libuv C++ Library    │  │\n│   │  (JS Execution & JIT)    │ (Event Loop & Thread Pool)│  │\n│   └──────────────────────────┴───────────────────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n\n> 💡 **Tip:** Node.js executes CPU-light, I/O-heavy workloads (REST APIs, microservices, websockets) with extreme memory efficiency compared to multi-threaded server architectures.\n\n> 📌 **Note:** While JavaScript executes on a single thread, libuv maintains a background C++ Thread Pool (default 4 threads) for intensive tasks like file system access and cryptography.\n\n## Example\n```javascript\n// Check Node.js runtime process details\nconsole.log('Node.js Version:', process.version);\nconsole.log('Architecture:', process.arch);\nconsole.log('Platform:', process.platform);\nconsole.log('Current Memory Usage:', process.memoryUsage());\n```\n",
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
    "description": "CommonJS vs ES Modules, fs module, path, and package management.",
    "orderIndex": 2,
    "id": "node-mod-2",
    "title": "Module 2: Node Modules, NPM & File System",
    "courseId": "nodejs-backend-development",
    "order": 2,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 2: Node Modules, NPM & File System",
        "title": "Module 2 - Complete Notes",
        "type": "Reading",
        "content": "# Module 2: Node Modules, NPM & File System\n## Overview\nModular code design is central to Node.js. Node supports both the classic CommonJS module system (`require` / `module.exports`) and modern ES Modules (`import` / `export`). The built-in `fs` and `path` modules provide robust file storage manipulation.\n\n## Learning Objectives\n- Understand CommonJS vs ES Modules in Node.js.\n- Work with `package.json`, semantic versioning, and `npm` package management.\n- Perform synchronous and asynchronous file operations with the `fs/promises` module.\n- Resolve cross-platform file paths using the `path` module.\n## Example: Asynchronous File I/O\n```javascript\nconst fs = require('fs/promises');\nconst path = require('path');\n\nasync function manageCourseData() {\n  const filePath = path.join(__dirname, 'data', 'courses.json');\n  try {\n    // 1. Read JSON file\n    const rawData = await fs.readFile(filePath, 'utf8');\n    const courses = JSON.parse(rawData);\n    console.log('Total Courses:', courses.length);\n\n    // 2. Append new course\n    courses.push({ id: 'node-101', title: 'Node.js Backend Mastery' });\n    await fs.writeFile(filePath, JSON.stringify(courses, null, 2), 'utf8');\n    console.log('Successfully updated course database file.');\n  } catch (error) {\n    console.error('File operation error:', error.message);\n  }\n}\n```\n> 💡 **Tip:** Always use `fs/promises` and `path.join()` instead of hardcoding OS path separators (`/` or `\\`).",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "node-unit-2-notes",
        "moduleId": "node-mod-2",
        "courseId": "nodejs-backend-development",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 2: Node Modules, NPM & File System\n## Overview\nModular code design is central to Node.js. Node supports both the classic CommonJS module system (`require` / `module.exports`) and modern ES Modules (`import` / `export`). The built-in `fs` and `path` modules provide robust file storage manipulation.\n\n## Learning Objectives\n- Understand CommonJS vs ES Modules in Node.js.\n- Work with `package.json`, semantic versioning, and `npm` package management.\n- Perform synchronous and asynchronous file operations with the `fs/promises` module.\n- Resolve cross-platform file paths using the `path` module.\n## Example: Asynchronous File I/O\n```javascript\nconst fs = require('fs/promises');\nconst path = require('path');\n\nasync function manageCourseData() {\n  const filePath = path.join(__dirname, 'data', 'courses.json');\n  try {\n    // 1. Read JSON file\n    const rawData = await fs.readFile(filePath, 'utf8');\n    const courses = JSON.parse(rawData);\n    console.log('Total Courses:', courses.length);\n\n    // 2. Append new course\n    courses.push({ id: 'node-101', title: 'Node.js Backend Mastery' });\n    await fs.writeFile(filePath, JSON.stringify(courses, null, 2), 'utf8');\n    console.log('Successfully updated course database file.');\n  } catch (error) {\n    console.error('File operation error:', error.message);\n  }\n}\n```\n> 💡 **Tip:** Always use `fs/promises` and `path.join()` instead of hardcoding OS path separators (`/` or `\\`)."
      }
    ],
    "topics": [
      {
        "id": "node-mod-2-topic-1",
        "title": "Module 2: Node Modules, NPM & File System Units",
        "description": "CommonJS vs ES Modules, fs module, path, and package management.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "node-unit-2-notes",
            "title": "Module 2 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 2: Node Modules, NPM & File System\n\n## Overview\nModular code design is central to Node.js. Node supports both the classic CommonJS module system (`require` / `module.exports`) and modern ES Modules (`import` / `export`). The built-in `fs` and `path` modules provide robust file storage manipulation.\n\n## Learning Objectives\n- Understand CommonJS vs ES Modules in Node.js.\n- Work with `package.json`, semantic versioning, and `npm` package management.\n- Perform synchronous and asynchronous file operations with the `fs/promises` module.\n- Resolve cross-platform file paths using the `path` module.\n\n## Example: Asynchronous File I/O\n```javascript\nconst fs = require('fs/promises');\nconst path = require('path');\n\nasync function manageCourseData() {\n  const filePath = path.join(__dirname, 'data', 'courses.json');\n  try {\n    // 1. Read JSON file\n    const rawData = await fs.readFile(filePath, 'utf8');\n    const courses = JSON.parse(rawData);\n    console.log('Total Courses:', courses.length);\n\n    // 2. Append new course\n    courses.push({ id: 'node-101', title: 'Node.js Backend Mastery' });\n    await fs.writeFile(filePath, JSON.stringify(courses, null, 2), 'utf8');\n    console.log('Successfully updated course database file.');\n  } catch (error) {\n    console.error('File operation error:', error.message);\n  }\n}\n```\n\n> 💡 **Tip:** Always use `fs/promises` and `path.join()` instead of hardcoding OS path separators (`/` or `\\`).\n",
            "content": "# Module 2: Node Modules, NPM & File System\n\n## Overview\nModular code design is central to Node.js. Node supports both the classic CommonJS module system (`require` / `module.exports`) and modern ES Modules (`import` / `export`). The built-in `fs` and `path` modules provide robust file storage manipulation.\n\n## Learning Objectives\n- Understand CommonJS vs ES Modules in Node.js.\n- Work with `package.json`, semantic versioning, and `npm` package management.\n- Perform synchronous and asynchronous file operations with the `fs/promises` module.\n- Resolve cross-platform file paths using the `path` module.\n\n## Example: Asynchronous File I/O\n```javascript\nconst fs = require('fs/promises');\nconst path = require('path');\n\nasync function manageCourseData() {\n  const filePath = path.join(__dirname, 'data', 'courses.json');\n  try {\n    // 1. Read JSON file\n    const rawData = await fs.readFile(filePath, 'utf8');\n    const courses = JSON.parse(rawData);\n    console.log('Total Courses:', courses.length);\n\n    // 2. Append new course\n    courses.push({ id: 'node-101', title: 'Node.js Backend Mastery' });\n    await fs.writeFile(filePath, JSON.stringify(courses, null, 2), 'utf8');\n    console.log('Successfully updated course database file.');\n  } catch (error) {\n    console.error('File operation error:', error.message);\n  }\n}\n```\n\n> 💡 **Tip:** Always use `fs/promises` and `path.join()` instead of hardcoding OS path separators (`/` or `\\`).\n",
            "conceptTheory": "# Module 2: Node Modules, NPM & File System\n\n## Overview\nModular code design is central to Node.js. Node supports both the classic CommonJS module system (`require` / `module.exports`) and modern ES Modules (`import` / `export`). The built-in `fs` and `path` modules provide robust file storage manipulation.\n\n## Learning Objectives\n- Understand CommonJS vs ES Modules in Node.js.\n- Work with `package.json`, semantic versioning, and `npm` package management.\n- Perform synchronous and asynchronous file operations with the `fs/promises` module.\n- Resolve cross-platform file paths using the `path` module.\n\n## Example: Asynchronous File I/O\n```javascript\nconst fs = require('fs/promises');\nconst path = require('path');\n\nasync function manageCourseData() {\n  const filePath = path.join(__dirname, 'data', 'courses.json');\n  try {\n    // 1. Read JSON file\n    const rawData = await fs.readFile(filePath, 'utf8');\n    const courses = JSON.parse(rawData);\n    console.log('Total Courses:', courses.length);\n\n    // 2. Append new course\n    courses.push({ id: 'node-101', title: 'Node.js Backend Mastery' });\n    await fs.writeFile(filePath, JSON.stringify(courses, null, 2), 'utf8');\n    console.log('Successfully updated course database file.');\n  } catch (error) {\n    console.error('File operation error:', error.message);\n  }\n}\n```\n\n> 💡 **Tip:** Always use `fs/promises` and `path.join()` instead of hardcoding OS path separators (`/` or `\\`).\n",
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
    "description": "Event emitter, buffer, streams, and non-blocking I/O lifecycle.",
    "orderIndex": 3,
    "id": "node-mod-3",
    "title": "Module 3: Asynchronous Programming & Event Loop",
    "courseId": "nodejs-backend-development",
    "order": 3,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 3: Asynchronous Programming & Event Loop",
        "title": "Module 3 - Complete Notes",
        "type": "Reading",
        "content": "# Module 3: Asynchronous Programming & Event Loop\n## Overview\nMastering the 6 phases of the Node.js Event Loop is critical to diagnosing performance bottlenecks and concurrency deadlocks.\n\n## Learning Objectives\n- Master the 6 phases of the libuv Event Loop: Timers, Pending Callbacks, Idle/Prepare, Poll, Check (`setImmediate`), and Close Callbacks.\n- Understand `process.nextTick()` vs `setImmediate()` vs `setTimeout()`.\n- Build custom event-driven architectures with `EventEmitter`.\n## Concept: Event Loop Sequence\n```text\n   ┌───────────────────────┐\n┌─>│        timers         │  (setTimeout, setInterval)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │    pending callbacks  │  (I/O callbacks deferred)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │      poll phase       │  (retrieve new I/O events)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │      check phase      │  (setImmediate callbacks)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n└──│    close callbacks    │  (socket.on('close'))\n   └───────────────────────┘\n```\n> 📌 **Note:** `process.nextTick()` executes immediately after the current operation finishes, before the Event Loop continues to the next phase.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "node-unit-3-notes",
        "moduleId": "node-mod-3",
        "courseId": "nodejs-backend-development",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 3: Asynchronous Programming & Event Loop\n## Overview\nMastering the 6 phases of the Node.js Event Loop is critical to diagnosing performance bottlenecks and concurrency deadlocks.\n\n## Learning Objectives\n- Master the 6 phases of the libuv Event Loop: Timers, Pending Callbacks, Idle/Prepare, Poll, Check (`setImmediate`), and Close Callbacks.\n- Understand `process.nextTick()` vs `setImmediate()` vs `setTimeout()`.\n- Build custom event-driven architectures with `EventEmitter`.\n## Concept: Event Loop Sequence\n```text\n   ┌───────────────────────┐\n┌─>│        timers         │  (setTimeout, setInterval)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │    pending callbacks  │  (I/O callbacks deferred)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │      poll phase       │  (retrieve new I/O events)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │      check phase      │  (setImmediate callbacks)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n└──│    close callbacks    │  (socket.on('close'))\n   └───────────────────────┘\n```\n> 📌 **Note:** `process.nextTick()` executes immediately after the current operation finishes, before the Event Loop continues to the next phase."
      }
    ],
    "topics": [
      {
        "id": "node-mod-3-topic-1",
        "title": "Module 3: Asynchronous Programming & Event Loop Units",
        "description": "Event emitter, buffer, streams, and non-blocking I/O lifecycle.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "node-unit-3-notes",
            "title": "Module 3 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 3: Asynchronous Programming & Event Loop\n\n## Overview\nMastering the 6 phases of the Node.js Event Loop is critical to diagnosing performance bottlenecks and concurrency deadlocks.\n\n## Learning Objectives\n- Master the 6 phases of the libuv Event Loop: Timers, Pending Callbacks, Idle/Prepare, Poll, Check (`setImmediate`), and Close Callbacks.\n- Understand `process.nextTick()` vs `setImmediate()` vs `setTimeout()`.\n- Build custom event-driven architectures with `EventEmitter`.\n\n## Concept: Event Loop Sequence\n```text\n   ┌───────────────────────┐\n┌─>│        timers         │  (setTimeout, setInterval)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │    pending callbacks  │  (I/O callbacks deferred)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │      poll phase       │  (retrieve new I/O events)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │      check phase      │  (setImmediate callbacks)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n└──│    close callbacks    │  (socket.on('close'))\n   └───────────────────────┘\n```\n\n> 📌 **Note:** `process.nextTick()` executes immediately after the current operation finishes, before the Event Loop continues to the next phase.\n",
            "content": "# Module 3: Asynchronous Programming & Event Loop\n\n## Overview\nMastering the 6 phases of the Node.js Event Loop is critical to diagnosing performance bottlenecks and concurrency deadlocks.\n\n## Learning Objectives\n- Master the 6 phases of the libuv Event Loop: Timers, Pending Callbacks, Idle/Prepare, Poll, Check (`setImmediate`), and Close Callbacks.\n- Understand `process.nextTick()` vs `setImmediate()` vs `setTimeout()`.\n- Build custom event-driven architectures with `EventEmitter`.\n\n## Concept: Event Loop Sequence\n```text\n   ┌───────────────────────┐\n┌─>│        timers         │  (setTimeout, setInterval)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │    pending callbacks  │  (I/O callbacks deferred)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │      poll phase       │  (retrieve new I/O events)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │      check phase      │  (setImmediate callbacks)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n└──│    close callbacks    │  (socket.on('close'))\n   └───────────────────────┘\n```\n\n> 📌 **Note:** `process.nextTick()` executes immediately after the current operation finishes, before the Event Loop continues to the next phase.\n",
            "conceptTheory": "# Module 3: Asynchronous Programming & Event Loop\n\n## Overview\nMastering the 6 phases of the Node.js Event Loop is critical to diagnosing performance bottlenecks and concurrency deadlocks.\n\n## Learning Objectives\n- Master the 6 phases of the libuv Event Loop: Timers, Pending Callbacks, Idle/Prepare, Poll, Check (`setImmediate`), and Close Callbacks.\n- Understand `process.nextTick()` vs `setImmediate()` vs `setTimeout()`.\n- Build custom event-driven architectures with `EventEmitter`.\n\n## Concept: Event Loop Sequence\n```text\n   ┌───────────────────────┐\n┌─>│        timers         │  (setTimeout, setInterval)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │    pending callbacks  │  (I/O callbacks deferred)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │      poll phase       │  (retrieve new I/O events)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n│  │      check phase      │  (setImmediate callbacks)\n│  └──────────┬────────────┘\n│  ┌──────────▼────────────┐\n└──│    close callbacks    │  (socket.on('close'))\n   └───────────────────────┘\n```\n\n> 📌 **Note:** `process.nextTick()` executes immediately after the current operation finishes, before the Event Loop continues to the next phase.\n",
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
    "description": "Express setup, routing, URL parameters, and query strings.",
    "orderIndex": 4,
    "id": "node-mod-4",
    "title": "Module 4: Express.js Framework & Routing",
    "courseId": "nodejs-backend-development",
    "order": 4,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 4: Express.js Framework & Routing",
        "title": "Module 4 - Complete Notes",
        "type": "Reading",
        "content": "# Module 4: Express.js Framework & Routing\n## Overview\nExpress.js is the standard de-facto minimalist web framework for Node.js. It provides lightweight routing, parameter parsing, and extensible middleware pipelines.\n\n## Learning Objectives\n- Initialize Express server applications and configure listening ports.\n- Define HTTP route handlers for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.\n- Extract route parameters (`req.params`), query strings (`req.query`), and JSON request bodies (`req.body`).\n## Example: REST Route Controller\n```javascript\nconst express = require('express');\nconst app = express();\n\napp.use(express.json()); // Body parser\n\nconst courses = [\n  { id: '1', title: 'C Programming', level: 'Beginner' },\n  { id: '2', title: 'Node.js Backend', level: 'Intermediate' }\n];\n\n// GET /api/courses?level=Beginner\napp.get('/api/courses', (req, res) => {\n  const { level } = req.query;\n  const filtered = level ? courses.filter(c => c.level === level) : courses;\n  res.json({ success: true, count: filtered.length, data: filtered });\n});\n\n// GET /api/courses/:id\napp.get('/api/courses/:id', (req, res) => {\n  const course = courses.find(c => c.id === req.params.id);\n  if (!course) {\n    return res.status(404).json({ success: false, message: 'Course not found' });\n  }\n  res.json({ success: true, data: course });\n});\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "node-unit-4-notes",
        "moduleId": "node-mod-4",
        "courseId": "nodejs-backend-development",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 4: Express.js Framework & Routing\n## Overview\nExpress.js is the standard de-facto minimalist web framework for Node.js. It provides lightweight routing, parameter parsing, and extensible middleware pipelines.\n\n## Learning Objectives\n- Initialize Express server applications and configure listening ports.\n- Define HTTP route handlers for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.\n- Extract route parameters (`req.params`), query strings (`req.query`), and JSON request bodies (`req.body`).\n## Example: REST Route Controller\n```javascript\nconst express = require('express');\nconst app = express();\n\napp.use(express.json()); // Body parser\n\nconst courses = [\n  { id: '1', title: 'C Programming', level: 'Beginner' },\n  { id: '2', title: 'Node.js Backend', level: 'Intermediate' }\n];\n\n// GET /api/courses?level=Beginner\napp.get('/api/courses', (req, res) => {\n  const { level } = req.query;\n  const filtered = level ? courses.filter(c => c.level === level) : courses;\n  res.json({ success: true, count: filtered.length, data: filtered });\n});\n\n// GET /api/courses/:id\napp.get('/api/courses/:id', (req, res) => {\n  const course = courses.find(c => c.id === req.params.id);\n  if (!course) {\n    return res.status(404).json({ success: false, message: 'Course not found' });\n  }\n  res.json({ success: true, data: course });\n});\n```"
      }
    ],
    "topics": [
      {
        "id": "node-mod-4-topic-1",
        "title": "Module 4: Express.js Framework & Routing Units",
        "description": "Express setup, routing, URL parameters, and query strings.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "node-unit-4-notes",
            "title": "Module 4 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 4: Express.js Framework & Routing\n\n## Overview\nExpress.js is the standard de-facto minimalist web framework for Node.js. It provides lightweight routing, parameter parsing, and extensible middleware pipelines.\n\n## Learning Objectives\n- Initialize Express server applications and configure listening ports.\n- Define HTTP route handlers for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.\n- Extract route parameters (`req.params`), query strings (`req.query`), and JSON request bodies (`req.body`).\n\n## Example: REST Route Controller\n```javascript\nconst express = require('express');\nconst app = express();\n\napp.use(express.json()); // Body parser\n\nconst courses = [\n  { id: '1', title: 'C Programming', level: 'Beginner' },\n  { id: '2', title: 'Node.js Backend', level: 'Intermediate' }\n];\n\n// GET /api/courses?level=Beginner\napp.get('/api/courses', (req, res) => {\n  const { level } = req.query;\n  const filtered = level ? courses.filter(c => c.level === level) : courses;\n  res.json({ success: true, count: filtered.length, data: filtered });\n});\n\n// GET /api/courses/:id\napp.get('/api/courses/:id', (req, res) => {\n  const course = courses.find(c => c.id === req.params.id);\n  if (!course) {\n    return res.status(404).json({ success: false, message: 'Course not found' });\n  }\n  res.json({ success: true, data: course });\n});\n```\n",
            "content": "# Module 4: Express.js Framework & Routing\n\n## Overview\nExpress.js is the standard de-facto minimalist web framework for Node.js. It provides lightweight routing, parameter parsing, and extensible middleware pipelines.\n\n## Learning Objectives\n- Initialize Express server applications and configure listening ports.\n- Define HTTP route handlers for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.\n- Extract route parameters (`req.params`), query strings (`req.query`), and JSON request bodies (`req.body`).\n\n## Example: REST Route Controller\n```javascript\nconst express = require('express');\nconst app = express();\n\napp.use(express.json()); // Body parser\n\nconst courses = [\n  { id: '1', title: 'C Programming', level: 'Beginner' },\n  { id: '2', title: 'Node.js Backend', level: 'Intermediate' }\n];\n\n// GET /api/courses?level=Beginner\napp.get('/api/courses', (req, res) => {\n  const { level } = req.query;\n  const filtered = level ? courses.filter(c => c.level === level) : courses;\n  res.json({ success: true, count: filtered.length, data: filtered });\n});\n\n// GET /api/courses/:id\napp.get('/api/courses/:id', (req, res) => {\n  const course = courses.find(c => c.id === req.params.id);\n  if (!course) {\n    return res.status(404).json({ success: false, message: 'Course not found' });\n  }\n  res.json({ success: true, data: course });\n});\n```\n",
            "conceptTheory": "# Module 4: Express.js Framework & Routing\n\n## Overview\nExpress.js is the standard de-facto minimalist web framework for Node.js. It provides lightweight routing, parameter parsing, and extensible middleware pipelines.\n\n## Learning Objectives\n- Initialize Express server applications and configure listening ports.\n- Define HTTP route handlers for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.\n- Extract route parameters (`req.params`), query strings (`req.query`), and JSON request bodies (`req.body`).\n\n## Example: REST Route Controller\n```javascript\nconst express = require('express');\nconst app = express();\n\napp.use(express.json()); // Body parser\n\nconst courses = [\n  { id: '1', title: 'C Programming', level: 'Beginner' },\n  { id: '2', title: 'Node.js Backend', level: 'Intermediate' }\n];\n\n// GET /api/courses?level=Beginner\napp.get('/api/courses', (req, res) => {\n  const { level } = req.query;\n  const filtered = level ? courses.filter(c => c.level === level) : courses;\n  res.json({ success: true, count: filtered.length, data: filtered });\n});\n\n// GET /api/courses/:id\napp.get('/api/courses/:id', (req, res) => {\n  const course = courses.find(c => c.id === req.params.id);\n  if (!course) {\n    return res.status(404).json({ success: false, message: 'Course not found' });\n  }\n  res.json({ success: true, data: course });\n});\n```\n",
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
    "description": "Built-in, third-party, and custom middleware patterns.",
    "orderIndex": 5,
    "id": "node-mod-5",
    "title": "Module 5: Middleware & Request Processing",
    "courseId": "nodejs-backend-development",
    "order": 5,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 5: Middleware & Request Processing",
        "title": "Module 5 - Complete Notes",
        "type": "Reading",
        "content": "# Module 5: Middleware & Request Processing\n## Overview\nMiddleware functions have access to the request object (`req`), the response object (`res`), and the `next` middleware function in the application’s request-response cycle.\n\n## Learning Objectives\n- Understand application-level, router-level, error-handling, and third-party middleware.\n- Create request logging, timing, and payload sanitation middleware.\n- Understand the role of the `next()` function and how errors propagate.\n## Example\n```javascript\n// Custom Request Timing Logger Middleware\nconst requestTimer = (req, res, next) => {\n  const start = Date.now();\n  res.on('finish', () => {\n    const duration = Date.now() - start;\n    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);\n  });\n  next();\n};\n\napp.use(requestTimer);\n```\n> 💡 **Tip:** Always call `next()` inside your custom middleware; otherwise, the client request will hang indefinitely!",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "node-unit-5-notes",
        "moduleId": "node-mod-5",
        "courseId": "nodejs-backend-development",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 5: Middleware & Request Processing\n## Overview\nMiddleware functions have access to the request object (`req`), the response object (`res`), and the `next` middleware function in the application’s request-response cycle.\n\n## Learning Objectives\n- Understand application-level, router-level, error-handling, and third-party middleware.\n- Create request logging, timing, and payload sanitation middleware.\n- Understand the role of the `next()` function and how errors propagate.\n## Example\n```javascript\n// Custom Request Timing Logger Middleware\nconst requestTimer = (req, res, next) => {\n  const start = Date.now();\n  res.on('finish', () => {\n    const duration = Date.now() - start;\n    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);\n  });\n  next();\n};\n\napp.use(requestTimer);\n```\n> 💡 **Tip:** Always call `next()` inside your custom middleware; otherwise, the client request will hang indefinitely!"
      }
    ],
    "topics": [
      {
        "id": "node-mod-5-topic-1",
        "title": "Module 5: Middleware & Request Processing Units",
        "description": "Built-in, third-party, and custom middleware patterns.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "node-unit-5-notes",
            "title": "Module 5 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 5: Middleware & Request Processing\n\n## Overview\nMiddleware functions have access to the request object (`req`), the response object (`res`), and the `next` middleware function in the application’s request-response cycle.\n\n## Learning Objectives\n- Understand application-level, router-level, error-handling, and third-party middleware.\n- Create request logging, timing, and payload sanitation middleware.\n- Understand the role of the `next()` function and how errors propagate.\n\n## Example\n```javascript\n// Custom Request Timing Logger Middleware\nconst requestTimer = (req, res, next) => {\n  const start = Date.now();\n  res.on('finish', () => {\n    const duration = Date.now() - start;\n    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);\n  });\n  next();\n};\n\napp.use(requestTimer);\n```\n\n> 💡 **Tip:** Always call `next()` inside your custom middleware; otherwise, the client request will hang indefinitely!\n",
            "content": "# Module 5: Middleware & Request Processing\n\n## Overview\nMiddleware functions have access to the request object (`req`), the response object (`res`), and the `next` middleware function in the application’s request-response cycle.\n\n## Learning Objectives\n- Understand application-level, router-level, error-handling, and third-party middleware.\n- Create request logging, timing, and payload sanitation middleware.\n- Understand the role of the `next()` function and how errors propagate.\n\n## Example\n```javascript\n// Custom Request Timing Logger Middleware\nconst requestTimer = (req, res, next) => {\n  const start = Date.now();\n  res.on('finish', () => {\n    const duration = Date.now() - start;\n    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);\n  });\n  next();\n};\n\napp.use(requestTimer);\n```\n\n> 💡 **Tip:** Always call `next()` inside your custom middleware; otherwise, the client request will hang indefinitely!\n",
            "conceptTheory": "# Module 5: Middleware & Request Processing\n\n## Overview\nMiddleware functions have access to the request object (`req`), the response object (`res`), and the `next` middleware function in the application’s request-response cycle.\n\n## Learning Objectives\n- Understand application-level, router-level, error-handling, and third-party middleware.\n- Create request logging, timing, and payload sanitation middleware.\n- Understand the role of the `next()` function and how errors propagate.\n\n## Example\n```javascript\n// Custom Request Timing Logger Middleware\nconst requestTimer = (req, res, next) => {\n  const start = Date.now();\n  res.on('finish', () => {\n    const duration = Date.now() - start;\n    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);\n  });\n  next();\n};\n\napp.use(requestTimer);\n```\n\n> 💡 **Tip:** Always call `next()` inside your custom middleware; otherwise, the client request will hang indefinitely!\n",
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
    "description": "HTTP verbs, status codes, JSON responses, and input validation with Zod.",
    "orderIndex": 6,
    "id": "node-mod-6",
    "title": "Module 6: RESTful API Design & Validation",
    "courseId": "nodejs-backend-development",
    "order": 6,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 6: RESTful API Design & Validation",
        "title": "Module 6 - Complete Notes",
        "type": "Reading",
        "content": "# Module 6: RESTful API Design & Validation\n## Overview\nDesigning clean, RESTful APIs adhering to Richardson Maturity Model standards ensures interoperability, consistency, and security.\n\n## Learning Objectives\n- Use standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).\n- Implement schema validation using Zod or Joi to reject malformed payloads before processing.\n- Design consistent JSON API envelope responses.\n## Example: Zod Validation Middleware\n```javascript\nconst { z } = require('zod');\n\nconst CourseSchema = z.object({\n  title: z.string().min(3).max(100),\n  durationHours: z.number().positive(),\n  category: z.enum(['Programming', 'Web Development', 'Backend Development', 'Database'])\n});\n\nconst validateCourse = (req, res, next) => {\n  const result = CourseSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({\n      success: false,\n      errors: result.error.format()\n    });\n  }\n  req.validatedBody = result.data;\n  next();\n};\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "node-unit-6-notes",
        "moduleId": "node-mod-6",
        "courseId": "nodejs-backend-development",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 6: RESTful API Design & Validation\n## Overview\nDesigning clean, RESTful APIs adhering to Richardson Maturity Model standards ensures interoperability, consistency, and security.\n\n## Learning Objectives\n- Use standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).\n- Implement schema validation using Zod or Joi to reject malformed payloads before processing.\n- Design consistent JSON API envelope responses.\n## Example: Zod Validation Middleware\n```javascript\nconst { z } = require('zod');\n\nconst CourseSchema = z.object({\n  title: z.string().min(3).max(100),\n  durationHours: z.number().positive(),\n  category: z.enum(['Programming', 'Web Development', 'Backend Development', 'Database'])\n});\n\nconst validateCourse = (req, res, next) => {\n  const result = CourseSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({\n      success: false,\n      errors: result.error.format()\n    });\n  }\n  req.validatedBody = result.data;\n  next();\n};\n```"
      }
    ],
    "topics": [
      {
        "id": "node-mod-6-topic-1",
        "title": "Module 6: RESTful API Design & Validation Units",
        "description": "HTTP verbs, status codes, JSON responses, and input validation with Zod.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "node-unit-6-notes",
            "title": "Module 6 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 6: RESTful API Design & Validation\n\n## Overview\nDesigning clean, RESTful APIs adhering to Richardson Maturity Model standards ensures interoperability, consistency, and security.\n\n## Learning Objectives\n- Use standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).\n- Implement schema validation using Zod or Joi to reject malformed payloads before processing.\n- Design consistent JSON API envelope responses.\n\n## Example: Zod Validation Middleware\n```javascript\nconst { z } = require('zod');\n\nconst CourseSchema = z.object({\n  title: z.string().min(3).max(100),\n  durationHours: z.number().positive(),\n  category: z.enum(['Programming', 'Web Development', 'Backend Development', 'Database'])\n});\n\nconst validateCourse = (req, res, next) => {\n  const result = CourseSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({\n      success: false,\n      errors: result.error.format()\n    });\n  }\n  req.validatedBody = result.data;\n  next();\n};\n```\n",
            "content": "# Module 6: RESTful API Design & Validation\n\n## Overview\nDesigning clean, RESTful APIs adhering to Richardson Maturity Model standards ensures interoperability, consistency, and security.\n\n## Learning Objectives\n- Use standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).\n- Implement schema validation using Zod or Joi to reject malformed payloads before processing.\n- Design consistent JSON API envelope responses.\n\n## Example: Zod Validation Middleware\n```javascript\nconst { z } = require('zod');\n\nconst CourseSchema = z.object({\n  title: z.string().min(3).max(100),\n  durationHours: z.number().positive(),\n  category: z.enum(['Programming', 'Web Development', 'Backend Development', 'Database'])\n});\n\nconst validateCourse = (req, res, next) => {\n  const result = CourseSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({\n      success: false,\n      errors: result.error.format()\n    });\n  }\n  req.validatedBody = result.data;\n  next();\n};\n```\n",
            "conceptTheory": "# Module 6: RESTful API Design & Validation\n\n## Overview\nDesigning clean, RESTful APIs adhering to Richardson Maturity Model standards ensures interoperability, consistency, and security.\n\n## Learning Objectives\n- Use standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).\n- Implement schema validation using Zod or Joi to reject malformed payloads before processing.\n- Design consistent JSON API envelope responses.\n\n## Example: Zod Validation Middleware\n```javascript\nconst { z } = require('zod');\n\nconst CourseSchema = z.object({\n  title: z.string().min(3).max(100),\n  durationHours: z.number().positive(),\n  category: z.enum(['Programming', 'Web Development', 'Backend Development', 'Database'])\n});\n\nconst validateCourse = (req, res, next) => {\n  const result = CourseSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({\n      success: false,\n      errors: result.error.format()\n    });\n  }\n  req.validatedBody = result.data;\n  next();\n};\n```\n",
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
    "description": "Connecting PostgreSQL and MongoDB, ORMs, and CRUD operations.",
    "orderIndex": 7,
    "id": "node-mod-7",
    "title": "Module 7: Database Integration (SQL & MongoDB)",
    "courseId": "nodejs-backend-development",
    "order": 7,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 7: Database Integration (SQL & MongoDB)",
        "title": "Module 7 - Complete Notes",
        "type": "Reading",
        "content": "# Module 7: Database Integration (SQL & MongoDB)\n## Overview\nNode.js seamlessly connects to relational databases (PostgreSQL/MySQL) via Knex/Prisma ORMs and NoSQL document stores (MongoDB) via Mongoose.\n\n## Learning Objectives\n- Connect to database pools safely with retry logic.\n- Perform CRUD operations with parameterized queries to prevent SQL Injection.\n- Implement pagination, sorting, and indexing on high-cardinality collections.\n## Example: Parameterized Database Query\n```javascript\nconst { Pool } = require('pg');\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\n\nasync function getPublishedCourses(category, limit = 10, offset = 0) {\n  const query = `\n    SELECT id, title, category, duration, status \n    FROM courses \n    WHERE status = $1 AND ($2::text IS NULL OR category = $2)\n    ORDER BY created_at DESC \n    LIMIT $3 OFFSET $4;\n  `;\n  const values = ['Published', category || null, limit, offset];\n  const { rows } = await pool.query(query, values);\n  return rows;\n}\n```\n> ⚠️ **Warning:** Never concatenate unsanitized user input strings directly into SQL queries! Always use parameterized bindings (`$1`, `$2`).",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "node-unit-7-notes",
        "moduleId": "node-mod-7",
        "courseId": "nodejs-backend-development",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 7: Database Integration (SQL & MongoDB)\n## Overview\nNode.js seamlessly connects to relational databases (PostgreSQL/MySQL) via Knex/Prisma ORMs and NoSQL document stores (MongoDB) via Mongoose.\n\n## Learning Objectives\n- Connect to database pools safely with retry logic.\n- Perform CRUD operations with parameterized queries to prevent SQL Injection.\n- Implement pagination, sorting, and indexing on high-cardinality collections.\n## Example: Parameterized Database Query\n```javascript\nconst { Pool } = require('pg');\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\n\nasync function getPublishedCourses(category, limit = 10, offset = 0) {\n  const query = `\n    SELECT id, title, category, duration, status \n    FROM courses \n    WHERE status = $1 AND ($2::text IS NULL OR category = $2)\n    ORDER BY created_at DESC \n    LIMIT $3 OFFSET $4;\n  `;\n  const values = ['Published', category || null, limit, offset];\n  const { rows } = await pool.query(query, values);\n  return rows;\n}\n```\n> ⚠️ **Warning:** Never concatenate unsanitized user input strings directly into SQL queries! Always use parameterized bindings (`$1`, `$2`)."
      }
    ],
    "topics": [
      {
        "id": "node-mod-7-topic-1",
        "title": "Module 7: Database Integration (SQL & MongoDB) Units",
        "description": "Connecting PostgreSQL and MongoDB, ORMs, and CRUD operations.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "node-unit-7-notes",
            "title": "Module 7 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 7: Database Integration (SQL & MongoDB)\n\n## Overview\nNode.js seamlessly connects to relational databases (PostgreSQL/MySQL) via Knex/Prisma ORMs and NoSQL document stores (MongoDB) via Mongoose.\n\n## Learning Objectives\n- Connect to database pools safely with retry logic.\n- Perform CRUD operations with parameterized queries to prevent SQL Injection.\n- Implement pagination, sorting, and indexing on high-cardinality collections.\n\n## Example: Parameterized Database Query\n```javascript\nconst { Pool } = require('pg');\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\n\nasync function getPublishedCourses(category, limit = 10, offset = 0) {\n  const query = `\n    SELECT id, title, category, duration, status \n    FROM courses \n    WHERE status = $1 AND ($2::text IS NULL OR category = $2)\n    ORDER BY created_at DESC \n    LIMIT $3 OFFSET $4;\n  `;\n  const values = ['Published', category || null, limit, offset];\n  const { rows } = await pool.query(query, values);\n  return rows;\n}\n```\n\n> ⚠️ **Warning:** Never concatenate unsanitized user input strings directly into SQL queries! Always use parameterized bindings (`$1`, `$2`).\n",
            "content": "# Module 7: Database Integration (SQL & MongoDB)\n\n## Overview\nNode.js seamlessly connects to relational databases (PostgreSQL/MySQL) via Knex/Prisma ORMs and NoSQL document stores (MongoDB) via Mongoose.\n\n## Learning Objectives\n- Connect to database pools safely with retry logic.\n- Perform CRUD operations with parameterized queries to prevent SQL Injection.\n- Implement pagination, sorting, and indexing on high-cardinality collections.\n\n## Example: Parameterized Database Query\n```javascript\nconst { Pool } = require('pg');\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\n\nasync function getPublishedCourses(category, limit = 10, offset = 0) {\n  const query = `\n    SELECT id, title, category, duration, status \n    FROM courses \n    WHERE status = $1 AND ($2::text IS NULL OR category = $2)\n    ORDER BY created_at DESC \n    LIMIT $3 OFFSET $4;\n  `;\n  const values = ['Published', category || null, limit, offset];\n  const { rows } = await pool.query(query, values);\n  return rows;\n}\n```\n\n> ⚠️ **Warning:** Never concatenate unsanitized user input strings directly into SQL queries! Always use parameterized bindings (`$1`, `$2`).\n",
            "conceptTheory": "# Module 7: Database Integration (SQL & MongoDB)\n\n## Overview\nNode.js seamlessly connects to relational databases (PostgreSQL/MySQL) via Knex/Prisma ORMs and NoSQL document stores (MongoDB) via Mongoose.\n\n## Learning Objectives\n- Connect to database pools safely with retry logic.\n- Perform CRUD operations with parameterized queries to prevent SQL Injection.\n- Implement pagination, sorting, and indexing on high-cardinality collections.\n\n## Example: Parameterized Database Query\n```javascript\nconst { Pool } = require('pg');\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\n\nasync function getPublishedCourses(category, limit = 10, offset = 0) {\n  const query = `\n    SELECT id, title, category, duration, status \n    FROM courses \n    WHERE status = $1 AND ($2::text IS NULL OR category = $2)\n    ORDER BY created_at DESC \n    LIMIT $3 OFFSET $4;\n  `;\n  const values = ['Published', category || null, limit, offset];\n  const { rows } = await pool.query(query, values);\n  return rows;\n}\n```\n\n> ⚠️ **Warning:** Never concatenate unsanitized user input strings directly into SQL queries! Always use parameterized bindings (`$1`, `$2`).\n",
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
    "description": "Password hashing with bcrypt, JWT token generation, and protected routes.",
    "orderIndex": 8,
    "id": "node-mod-8",
    "title": "Module 8: Authentication, Authorization & JWT",
    "courseId": "nodejs-backend-development",
    "order": 8,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 8: Authentication, Authorization & JWT",
        "title": "Module 8 - Complete Notes",
        "type": "Reading",
        "content": "# Module 8: Authentication, Authorization & JWT\n## Overview\nSecuring backend REST APIs requires stateless authentication with JSON Web Tokens (JWT) and cryptographic password hashing with bcrypt.\n\n## Learning Objectives\n- Hash and salt passwords using `bcrypt`.\n- Generate and verify signed `jsonwebtoken` (JWT) access tokens.\n- Build Role-Based Access Control (RBAC) middleware to protect admin routes.\n## Example: JWT Auth Middleware\n```javascript\nconst jwt = require('jsonwebtoken');\n\nconst requireAuth = (req, res, next) => {\n  const authHeader = req.headers.authorization;\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Missing or malformed Authorization header' });\n  }\n\n  const token = authHeader.split(' ')[1];\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded; // { uid, email, role }\n    next();\n  } catch (err) {\n    return res.status(403).json({ error: 'Invalid or expired token' });\n  }\n};\n\nconst requireRole = (role) => (req, res, next) => {\n  if (req.user?.role !== role) {\n    return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });\n  }\n  next();\n};\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "node-unit-8-notes",
        "moduleId": "node-mod-8",
        "courseId": "nodejs-backend-development",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 8: Authentication, Authorization & JWT\n## Overview\nSecuring backend REST APIs requires stateless authentication with JSON Web Tokens (JWT) and cryptographic password hashing with bcrypt.\n\n## Learning Objectives\n- Hash and salt passwords using `bcrypt`.\n- Generate and verify signed `jsonwebtoken` (JWT) access tokens.\n- Build Role-Based Access Control (RBAC) middleware to protect admin routes.\n## Example: JWT Auth Middleware\n```javascript\nconst jwt = require('jsonwebtoken');\n\nconst requireAuth = (req, res, next) => {\n  const authHeader = req.headers.authorization;\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Missing or malformed Authorization header' });\n  }\n\n  const token = authHeader.split(' ')[1];\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded; // { uid, email, role }\n    next();\n  } catch (err) {\n    return res.status(403).json({ error: 'Invalid or expired token' });\n  }\n};\n\nconst requireRole = (role) => (req, res, next) => {\n  if (req.user?.role !== role) {\n    return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });\n  }\n  next();\n};\n```"
      }
    ],
    "topics": [
      {
        "id": "node-mod-8-topic-1",
        "title": "Module 8: Authentication, Authorization & JWT Units",
        "description": "Password hashing with bcrypt, JWT token generation, and protected routes.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "node-unit-8-notes",
            "title": "Module 8 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 8: Authentication, Authorization & JWT\n\n## Overview\nSecuring backend REST APIs requires stateless authentication with JSON Web Tokens (JWT) and cryptographic password hashing with bcrypt.\n\n## Learning Objectives\n- Hash and salt passwords using `bcrypt`.\n- Generate and verify signed `jsonwebtoken` (JWT) access tokens.\n- Build Role-Based Access Control (RBAC) middleware to protect admin routes.\n\n## Example: JWT Auth Middleware\n```javascript\nconst jwt = require('jsonwebtoken');\n\nconst requireAuth = (req, res, next) => {\n  const authHeader = req.headers.authorization;\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Missing or malformed Authorization header' });\n  }\n\n  const token = authHeader.split(' ')[1];\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded; // { uid, email, role }\n    next();\n  } catch (err) {\n    return res.status(403).json({ error: 'Invalid or expired token' });\n  }\n};\n\nconst requireRole = (role) => (req, res, next) => {\n  if (req.user?.role !== role) {\n    return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });\n  }\n  next();\n};\n```\n",
            "content": "# Module 8: Authentication, Authorization & JWT\n\n## Overview\nSecuring backend REST APIs requires stateless authentication with JSON Web Tokens (JWT) and cryptographic password hashing with bcrypt.\n\n## Learning Objectives\n- Hash and salt passwords using `bcrypt`.\n- Generate and verify signed `jsonwebtoken` (JWT) access tokens.\n- Build Role-Based Access Control (RBAC) middleware to protect admin routes.\n\n## Example: JWT Auth Middleware\n```javascript\nconst jwt = require('jsonwebtoken');\n\nconst requireAuth = (req, res, next) => {\n  const authHeader = req.headers.authorization;\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Missing or malformed Authorization header' });\n  }\n\n  const token = authHeader.split(' ')[1];\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded; // { uid, email, role }\n    next();\n  } catch (err) {\n    return res.status(403).json({ error: 'Invalid or expired token' });\n  }\n};\n\nconst requireRole = (role) => (req, res, next) => {\n  if (req.user?.role !== role) {\n    return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });\n  }\n  next();\n};\n```\n",
            "conceptTheory": "# Module 8: Authentication, Authorization & JWT\n\n## Overview\nSecuring backend REST APIs requires stateless authentication with JSON Web Tokens (JWT) and cryptographic password hashing with bcrypt.\n\n## Learning Objectives\n- Hash and salt passwords using `bcrypt`.\n- Generate and verify signed `jsonwebtoken` (JWT) access tokens.\n- Build Role-Based Access Control (RBAC) middleware to protect admin routes.\n\n## Example: JWT Auth Middleware\n```javascript\nconst jwt = require('jsonwebtoken');\n\nconst requireAuth = (req, res, next) => {\n  const authHeader = req.headers.authorization;\n  if (!authHeader || !authHeader.startsWith('Bearer ')) {\n    return res.status(401).json({ error: 'Missing or malformed Authorization header' });\n  }\n\n  const token = authHeader.split(' ')[1];\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded; // { uid, email, role }\n    next();\n  } catch (err) {\n    return res.status(403).json({ error: 'Invalid or expired token' });\n  }\n};\n\nconst requireRole = (role) => (req, res, next) => {\n  if (req.user?.role !== role) {\n    return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });\n  }\n  next();\n};\n```\n",
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
    "description": "Global error handlers, Winston logging, CORS, Helmet, and rate limiting.",
    "orderIndex": 9,
    "id": "node-mod-9",
    "title": "Module 9: Error Handling, Logging & Security",
    "courseId": "nodejs-backend-development",
    "order": 9,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 9: Error Handling, Logging & Security",
        "title": "Module 9 - Complete Notes",
        "type": "Reading",
        "content": "# Module 9: Error Handling, Logging & Security\n## Overview\nProduction backends must handle uncaught exceptions, log structured metrics, and protect against common web vulnerabilities.\n\n## Learning Objectives\n- Implement Express centralized 4-parameter error-handling middleware `(err, req, res, next)`.\n- Configure security headers with `helmet` and cross-origin resource sharing with `cors`.\n- Mitigate Brute-Force and Denial of Service (DoS) attacks with `express-rate-limit`.\n- Write structured JSON logs with `winston`.\n## Example: Global Error Handler\n```javascript\n// Global 4-argument error handling middleware\napp.use((err, req, res, next) => {\n  const status = err.statusCode || 500;\n  const message = err.message || 'Internal Server Error';\n\n  console.error(`[ERROR] ${req.method} ${req.url} -> ${message}`, {\n    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack\n  });\n\n  res.status(status).json({\n    success: false,\n    status,\n    message,\n    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })\n  });\n});\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "node-unit-9-notes",
        "moduleId": "node-mod-9",
        "courseId": "nodejs-backend-development",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 9: Error Handling, Logging & Security\n## Overview\nProduction backends must handle uncaught exceptions, log structured metrics, and protect against common web vulnerabilities.\n\n## Learning Objectives\n- Implement Express centralized 4-parameter error-handling middleware `(err, req, res, next)`.\n- Configure security headers with `helmet` and cross-origin resource sharing with `cors`.\n- Mitigate Brute-Force and Denial of Service (DoS) attacks with `express-rate-limit`.\n- Write structured JSON logs with `winston`.\n## Example: Global Error Handler\n```javascript\n// Global 4-argument error handling middleware\napp.use((err, req, res, next) => {\n  const status = err.statusCode || 500;\n  const message = err.message || 'Internal Server Error';\n\n  console.error(`[ERROR] ${req.method} ${req.url} -> ${message}`, {\n    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack\n  });\n\n  res.status(status).json({\n    success: false,\n    status,\n    message,\n    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })\n  });\n});\n```"
      }
    ],
    "topics": [
      {
        "id": "node-mod-9-topic-1",
        "title": "Module 9: Error Handling, Logging & Security Units",
        "description": "Global error handlers, Winston logging, CORS, Helmet, and rate limiting.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "node-unit-9-notes",
            "title": "Module 9 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 9: Error Handling, Logging & Security\n\n## Overview\nProduction backends must handle uncaught exceptions, log structured metrics, and protect against common web vulnerabilities.\n\n## Learning Objectives\n- Implement Express centralized 4-parameter error-handling middleware `(err, req, res, next)`.\n- Configure security headers with `helmet` and cross-origin resource sharing with `cors`.\n- Mitigate Brute-Force and Denial of Service (DoS) attacks with `express-rate-limit`.\n- Write structured JSON logs with `winston`.\n\n## Example: Global Error Handler\n```javascript\n// Global 4-argument error handling middleware\napp.use((err, req, res, next) => {\n  const status = err.statusCode || 500;\n  const message = err.message || 'Internal Server Error';\n\n  console.error(`[ERROR] ${req.method} ${req.url} -> ${message}`, {\n    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack\n  });\n\n  res.status(status).json({\n    success: false,\n    status,\n    message,\n    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })\n  });\n});\n```\n",
            "content": "# Module 9: Error Handling, Logging & Security\n\n## Overview\nProduction backends must handle uncaught exceptions, log structured metrics, and protect against common web vulnerabilities.\n\n## Learning Objectives\n- Implement Express centralized 4-parameter error-handling middleware `(err, req, res, next)`.\n- Configure security headers with `helmet` and cross-origin resource sharing with `cors`.\n- Mitigate Brute-Force and Denial of Service (DoS) attacks with `express-rate-limit`.\n- Write structured JSON logs with `winston`.\n\n## Example: Global Error Handler\n```javascript\n// Global 4-argument error handling middleware\napp.use((err, req, res, next) => {\n  const status = err.statusCode || 500;\n  const message = err.message || 'Internal Server Error';\n\n  console.error(`[ERROR] ${req.method} ${req.url} -> ${message}`, {\n    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack\n  });\n\n  res.status(status).json({\n    success: false,\n    status,\n    message,\n    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })\n  });\n});\n```\n",
            "conceptTheory": "# Module 9: Error Handling, Logging & Security\n\n## Overview\nProduction backends must handle uncaught exceptions, log structured metrics, and protect against common web vulnerabilities.\n\n## Learning Objectives\n- Implement Express centralized 4-parameter error-handling middleware `(err, req, res, next)`.\n- Configure security headers with `helmet` and cross-origin resource sharing with `cors`.\n- Mitigate Brute-Force and Denial of Service (DoS) attacks with `express-rate-limit`.\n- Write structured JSON logs with `winston`.\n\n## Example: Global Error Handler\n```javascript\n// Global 4-argument error handling middleware\napp.use((err, req, res, next) => {\n  const status = err.statusCode || 500;\n  const message = err.message || 'Internal Server Error';\n\n  console.error(`[ERROR] ${req.method} ${req.url} -> ${message}`, {\n    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack\n  });\n\n  res.status(status).json({\n    success: false,\n    status,\n    message,\n    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })\n  });\n});\n```\n",
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
    "description": "Building and deploying a production-ready REST API backend.",
    "orderIndex": 10,
    "id": "node-mod-10",
    "title": "Module 10: Production Backend Project & Deployment",
    "courseId": "nodejs-backend-development",
    "order": 10,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 10: Production Backend Project & Deployment",
        "title": "Module 10 - Complete Notes",
        "type": "Reading",
        "content": "# Module 10: Full-Stack Production Project & Deployment\n## Overview\nConstruct a full production-ready REST API backend with modular directory structure, PM2 process management, Docker containerization, and automated health checks.\n\n## Learning Objectives\n- Structure enterprise Node applications using Controller-Service-Repository architecture.\n- Write production-grade health check endpoints (`/health`, `/metrics`).\n- Manage background processes with PM2 (`pm2 start`, `pm2 cluster mode`).\n- Implement Graceful Shutdown on `SIGTERM` and `SIGINT` signals.\n## Example: Graceful Shutdown Pattern\n```javascript\nconst server = app.listen(process.env.PORT || 5000, () => {\n  console.log('KaizenQ Node.js Server listening on port 5000');\n});\n\nconst gracefulShutdown = (signal) => {\n  console.log(`${signal} received. Closing HTTP server gracefully...`);\n  server.close(async () => {\n    console.log('HTTP server closed. Terminating database connections...');\n    await pool.end();\n    console.log('All connections closed. Exiting process.');\n    process.exit(0);\n  });\n};\n\nprocess.on('SIGTERM', () => gracefulShutdown('SIGTERM'));\nprocess.on('SIGINT', () => gracefulShutdown('SIGINT'));\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "node-unit-10-notes",
        "moduleId": "node-mod-10",
        "courseId": "nodejs-backend-development",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 10: Full-Stack Production Project & Deployment\n## Overview\nConstruct a full production-ready REST API backend with modular directory structure, PM2 process management, Docker containerization, and automated health checks.\n\n## Learning Objectives\n- Structure enterprise Node applications using Controller-Service-Repository architecture.\n- Write production-grade health check endpoints (`/health`, `/metrics`).\n- Manage background processes with PM2 (`pm2 start`, `pm2 cluster mode`).\n- Implement Graceful Shutdown on `SIGTERM` and `SIGINT` signals.\n## Example: Graceful Shutdown Pattern\n```javascript\nconst server = app.listen(process.env.PORT || 5000, () => {\n  console.log('KaizenQ Node.js Server listening on port 5000');\n});\n\nconst gracefulShutdown = (signal) => {\n  console.log(`${signal} received. Closing HTTP server gracefully...`);\n  server.close(async () => {\n    console.log('HTTP server closed. Terminating database connections...');\n    await pool.end();\n    console.log('All connections closed. Exiting process.');\n    process.exit(0);\n  });\n};\n\nprocess.on('SIGTERM', () => gracefulShutdown('SIGTERM'));\nprocess.on('SIGINT', () => gracefulShutdown('SIGINT'));\n```"
      }
    ],
    "topics": [
      {
        "id": "node-mod-10-topic-1",
        "title": "Module 10: Production Backend Project & Deployment Units",
        "description": "Building and deploying a production-ready REST API backend.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "node-unit-10-notes",
            "title": "Module 10 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 10: Full-Stack Production Project & Deployment\n\n## Overview\nConstruct a full production-ready REST API backend with modular directory structure, PM2 process management, Docker containerization, and automated health checks.\n\n## Learning Objectives\n- Structure enterprise Node applications using Controller-Service-Repository architecture.\n- Write production-grade health check endpoints (`/health`, `/metrics`).\n- Manage background processes with PM2 (`pm2 start`, `pm2 cluster mode`).\n- Implement Graceful Shutdown on `SIGTERM` and `SIGINT` signals.\n\n## Example: Graceful Shutdown Pattern\n```javascript\nconst server = app.listen(process.env.PORT || 5000, () => {\n  console.log('KaizenQ Node.js Server listening on port 5000');\n});\n\nconst gracefulShutdown = (signal) => {\n  console.log(`${signal} received. Closing HTTP server gracefully...`);\n  server.close(async () => {\n    console.log('HTTP server closed. Terminating database connections...');\n    await pool.end();\n    console.log('All connections closed. Exiting process.');\n    process.exit(0);\n  });\n};\n\nprocess.on('SIGTERM', () => gracefulShutdown('SIGTERM'));\nprocess.on('SIGINT', () => gracefulShutdown('SIGINT'));\n```\n",
            "content": "# Module 10: Full-Stack Production Project & Deployment\n\n## Overview\nConstruct a full production-ready REST API backend with modular directory structure, PM2 process management, Docker containerization, and automated health checks.\n\n## Learning Objectives\n- Structure enterprise Node applications using Controller-Service-Repository architecture.\n- Write production-grade health check endpoints (`/health`, `/metrics`).\n- Manage background processes with PM2 (`pm2 start`, `pm2 cluster mode`).\n- Implement Graceful Shutdown on `SIGTERM` and `SIGINT` signals.\n\n## Example: Graceful Shutdown Pattern\n```javascript\nconst server = app.listen(process.env.PORT || 5000, () => {\n  console.log('KaizenQ Node.js Server listening on port 5000');\n});\n\nconst gracefulShutdown = (signal) => {\n  console.log(`${signal} received. Closing HTTP server gracefully...`);\n  server.close(async () => {\n    console.log('HTTP server closed. Terminating database connections...');\n    await pool.end();\n    console.log('All connections closed. Exiting process.');\n    process.exit(0);\n  });\n};\n\nprocess.on('SIGTERM', () => gracefulShutdown('SIGTERM'));\nprocess.on('SIGINT', () => gracefulShutdown('SIGINT'));\n```\n",
            "conceptTheory": "# Module 10: Full-Stack Production Project & Deployment\n\n## Overview\nConstruct a full production-ready REST API backend with modular directory structure, PM2 process management, Docker containerization, and automated health checks.\n\n## Learning Objectives\n- Structure enterprise Node applications using Controller-Service-Repository architecture.\n- Write production-grade health check endpoints (`/health`, `/metrics`).\n- Manage background processes with PM2 (`pm2 start`, `pm2 cluster mode`).\n- Implement Graceful Shutdown on `SIGTERM` and `SIGINT` signals.\n\n## Example: Graceful Shutdown Pattern\n```javascript\nconst server = app.listen(process.env.PORT || 5000, () => {\n  console.log('KaizenQ Node.js Server listening on port 5000');\n});\n\nconst gracefulShutdown = (signal) => {\n  console.log(`${signal} received. Closing HTTP server gracefully...`);\n  server.close(async () => {\n    console.log('HTTP server closed. Terminating database connections...');\n    await pool.end();\n    console.log('All connections closed. Exiting process.');\n    process.exit(0);\n  });\n};\n\nprocess.on('SIGTERM', () => gracefulShutdown('SIGTERM'));\nprocess.on('SIGINT', () => gracefulShutdown('SIGINT'));\n```\n",
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
