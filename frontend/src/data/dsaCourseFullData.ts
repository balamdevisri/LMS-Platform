import type { ModuleItem } from '../contexts/CourseContext';

export const dsaCourseModules: ModuleItem[] = [
  {
    "duration": "3 Hours",
    "description": "Time complexity, space complexity, asymptotic notation, and analysis.",
    "orderIndex": 1,
    "id": "dsa-mod-1",
    "title": "Module 1: Algorithm Analysis & Big-O Notation",
    "courseId": "data-structures-and-algorithms",
    "order": 1,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 1: Algorithm Analysis & Big-O Notation",
        "title": "Module 1 - Complete Notes",
        "type": "Reading",
        "content": "# Module 1: Algorithm Analysis & Big-O Notation\n## Overview\nAlgorithm analysis is the study of how algorithm runtime and memory footprint scale as input size $N$ approaches infinity. Big-O notation ($O$) provides the mathematical standard for evaluating upper-bound worst-case performance.\n\n## Learning Objectives\n- Understand Time Complexity and Space Complexity metrics.\n- Master Big-O ($O$), Big-Omega ($Omega$), and Big-Theta ($Theta$) asymptotic notations.\n- Analyze linear loops, nested loops, logarithmic divisions, and recursive trees.\n## Complexity Growth Orders\n```text\nFastest ──────────────────────────────────────────────────────────> Slowest\nO(1)  <  O(log N)  <  O(N)  <  O(N log N)  <  O(N^2)  <  O(2^N)  <  O(N!)\nConstant Logarithmic  Linear   Linearithmic  Quadratic  Exponential Factorial\n```\n> 💡 **Tip:** Drop low-order terms and constant multipliers when calculating Big-O. For example, $f(N) = 3N^2 + 100N + 500 implies O(N^2)$.\n> 📌 **Note:** Space complexity evaluates auxiliary memory allocated by variables, dynamic heap objects, and the recursive Call Stack.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "dsa-unit-1-notes",
        "moduleId": "dsa-mod-1",
        "courseId": "data-structures-and-algorithms",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 1: Algorithm Analysis & Big-O Notation\n## Overview\nAlgorithm analysis is the study of how algorithm runtime and memory footprint scale as input size $N$ approaches infinity. Big-O notation ($O$) provides the mathematical standard for evaluating upper-bound worst-case performance.\n\n## Learning Objectives\n- Understand Time Complexity and Space Complexity metrics.\n- Master Big-O ($O$), Big-Omega ($Omega$), and Big-Theta ($Theta$) asymptotic notations.\n- Analyze linear loops, nested loops, logarithmic divisions, and recursive trees.\n## Complexity Growth Orders\n```text\nFastest ──────────────────────────────────────────────────────────> Slowest\nO(1)  <  O(log N)  <  O(N)  <  O(N log N)  <  O(N^2)  <  O(2^N)  <  O(N!)\nConstant Logarithmic  Linear   Linearithmic  Quadratic  Exponential Factorial\n```\n> 💡 **Tip:** Drop low-order terms and constant multipliers when calculating Big-O. For example, $f(N) = 3N^2 + 100N + 500 implies O(N^2)$.\n> 📌 **Note:** Space complexity evaluates auxiliary memory allocated by variables, dynamic heap objects, and the recursive Call Stack."
      }
    ],
    "topics": [
      {
        "id": "dsa-mod-1-topic-1",
        "title": "Module 1: Algorithm Analysis & Big-O Notation Units",
        "description": "Time complexity, space complexity, asymptotic notation, and analysis.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "dsa-unit-1-notes",
            "title": "Module 1 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 1: Algorithm Analysis & Big-O Notation\n\n## Overview\nAlgorithm analysis is the study of how algorithm runtime and memory footprint scale as input size $N$ approaches infinity. Big-O notation ($O$) provides the mathematical standard for evaluating upper-bound worst-case performance.\n\n## Learning Objectives\n- Understand Time Complexity and Space Complexity metrics.\n- Master Big-O ($O$), Big-Omega ($Omega$), and Big-Theta ($Theta$) asymptotic notations.\n- Analyze linear loops, nested loops, logarithmic divisions, and recursive trees.\n\n## Complexity Growth Orders\n```text\nFastest ──────────────────────────────────────────────────────────> Slowest\nO(1)  <  O(log N)  <  O(N)  <  O(N log N)  <  O(N^2)  <  O(2^N)  <  O(N!)\nConstant Logarithmic  Linear   Linearithmic  Quadratic  Exponential Factorial\n```\n\n> 💡 **Tip:** Drop low-order terms and constant multipliers when calculating Big-O. For example, $f(N) = 3N^2 + 100N + 500 implies O(N^2)$.\n\n> 📌 **Note:** Space complexity evaluates auxiliary memory allocated by variables, dynamic heap objects, and the recursive Call Stack.\n",
            "content": "# Module 1: Algorithm Analysis & Big-O Notation\n\n## Overview\nAlgorithm analysis is the study of how algorithm runtime and memory footprint scale as input size $N$ approaches infinity. Big-O notation ($O$) provides the mathematical standard for evaluating upper-bound worst-case performance.\n\n## Learning Objectives\n- Understand Time Complexity and Space Complexity metrics.\n- Master Big-O ($O$), Big-Omega ($Omega$), and Big-Theta ($Theta$) asymptotic notations.\n- Analyze linear loops, nested loops, logarithmic divisions, and recursive trees.\n\n## Complexity Growth Orders\n```text\nFastest ──────────────────────────────────────────────────────────> Slowest\nO(1)  <  O(log N)  <  O(N)  <  O(N log N)  <  O(N^2)  <  O(2^N)  <  O(N!)\nConstant Logarithmic  Linear   Linearithmic  Quadratic  Exponential Factorial\n```\n\n> 💡 **Tip:** Drop low-order terms and constant multipliers when calculating Big-O. For example, $f(N) = 3N^2 + 100N + 500 implies O(N^2)$.\n\n> 📌 **Note:** Space complexity evaluates auxiliary memory allocated by variables, dynamic heap objects, and the recursive Call Stack.\n",
            "conceptTheory": "# Module 1: Algorithm Analysis & Big-O Notation\n\n## Overview\nAlgorithm analysis is the study of how algorithm runtime and memory footprint scale as input size $N$ approaches infinity. Big-O notation ($O$) provides the mathematical standard for evaluating upper-bound worst-case performance.\n\n## Learning Objectives\n- Understand Time Complexity and Space Complexity metrics.\n- Master Big-O ($O$), Big-Omega ($Omega$), and Big-Theta ($Theta$) asymptotic notations.\n- Analyze linear loops, nested loops, logarithmic divisions, and recursive trees.\n\n## Complexity Growth Orders\n```text\nFastest ──────────────────────────────────────────────────────────> Slowest\nO(1)  <  O(log N)  <  O(N)  <  O(N log N)  <  O(N^2)  <  O(2^N)  <  O(N!)\nConstant Logarithmic  Linear   Linearithmic  Quadratic  Exponential Factorial\n```\n\n> 💡 **Tip:** Drop low-order terms and constant multipliers when calculating Big-O. For example, $f(N) = 3N^2 + 100N + 500 implies O(N^2)$.\n\n> 📌 **Note:** Space complexity evaluates auxiliary memory allocated by variables, dynamic heap objects, and the recursive Call Stack.\n",
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
    "duration": "4 Hours",
    "description": "Array manipulations, sliding window, prefix sums, and two pointers.",
    "orderIndex": 2,
    "id": "dsa-mod-2",
    "title": "Module 2: Arrays & Two-Pointer Techniques",
    "courseId": "data-structures-and-algorithms",
    "order": 2,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 2: Arrays & Two-Pointer Techniques",
        "title": "Module 2 - Complete Notes",
        "type": "Reading",
        "content": "# Module 2: Arrays, Strings & Two-Pointer Techniques\n## Overview\nArrays provide contiguous memory allocation with $O(1)$ random access by index. Two-pointer and sliding-window techniques enable reducing brute-force $O(N^2)$ search algorithms into optimal $O(N)$ linear scans.\n\n## Learning Objectives\n- Understand memory locality, array traversal, and dynamic resizing amortized analysis.\n- Master Two-Pointer patterns (opposite ends, fast & slow pointers).\n- Implement the Sliding Window technique for contiguous subsegment problems.\n## Example: Two-Sum Sorted (Two-Pointer Technique)\n```javascript\nfunction twoSumSorted(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) {\n      return [left, right];\n    } else if (sum < target) {\n      left++;  // Need a larger value\n    } else {\n      right--; // Need a smaller value\n    }\n  }\n  return []; // No pair found\n}\n\nconsole.log(twoSumSorted([2, 7, 11, 15], 9)); // [0, 1]\n```\n> 💡 **Tip:** When solving string/array subsequence or sum challenges, check if sorting the array allows applying a two-pointer scan in $O(N)$ time.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "dsa-unit-2-notes",
        "moduleId": "dsa-mod-2",
        "courseId": "data-structures-and-algorithms",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 2: Arrays, Strings & Two-Pointer Techniques\n## Overview\nArrays provide contiguous memory allocation with $O(1)$ random access by index. Two-pointer and sliding-window techniques enable reducing brute-force $O(N^2)$ search algorithms into optimal $O(N)$ linear scans.\n\n## Learning Objectives\n- Understand memory locality, array traversal, and dynamic resizing amortized analysis.\n- Master Two-Pointer patterns (opposite ends, fast & slow pointers).\n- Implement the Sliding Window technique for contiguous subsegment problems.\n## Example: Two-Sum Sorted (Two-Pointer Technique)\n```javascript\nfunction twoSumSorted(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) {\n      return [left, right];\n    } else if (sum < target) {\n      left++;  // Need a larger value\n    } else {\n      right--; // Need a smaller value\n    }\n  }\n  return []; // No pair found\n}\n\nconsole.log(twoSumSorted([2, 7, 11, 15], 9)); // [0, 1]\n```\n> 💡 **Tip:** When solving string/array subsequence or sum challenges, check if sorting the array allows applying a two-pointer scan in $O(N)$ time."
      }
    ],
    "topics": [
      {
        "id": "dsa-mod-2-topic-1",
        "title": "Module 2: Arrays & Two-Pointer Techniques Units",
        "description": "Array manipulations, sliding window, prefix sums, and two pointers.",
        "estimatedDuration": "4 Hours",
        "learningUnits": [
          {
            "id": "dsa-unit-2-notes",
            "title": "Module 2 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 2: Arrays, Strings & Two-Pointer Techniques\n\n## Overview\nArrays provide contiguous memory allocation with $O(1)$ random access by index. Two-pointer and sliding-window techniques enable reducing brute-force $O(N^2)$ search algorithms into optimal $O(N)$ linear scans.\n\n## Learning Objectives\n- Understand memory locality, array traversal, and dynamic resizing amortized analysis.\n- Master Two-Pointer patterns (opposite ends, fast & slow pointers).\n- Implement the Sliding Window technique for contiguous subsegment problems.\n\n## Example: Two-Sum Sorted (Two-Pointer Technique)\n```javascript\nfunction twoSumSorted(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) {\n      return [left, right];\n    } else if (sum < target) {\n      left++;  // Need a larger value\n    } else {\n      right--; // Need a smaller value\n    }\n  }\n  return []; // No pair found\n}\n\nconsole.log(twoSumSorted([2, 7, 11, 15], 9)); // [0, 1]\n```\n\n> 💡 **Tip:** When solving string/array subsequence or sum challenges, check if sorting the array allows applying a two-pointer scan in $O(N)$ time.\n",
            "content": "# Module 2: Arrays, Strings & Two-Pointer Techniques\n\n## Overview\nArrays provide contiguous memory allocation with $O(1)$ random access by index. Two-pointer and sliding-window techniques enable reducing brute-force $O(N^2)$ search algorithms into optimal $O(N)$ linear scans.\n\n## Learning Objectives\n- Understand memory locality, array traversal, and dynamic resizing amortized analysis.\n- Master Two-Pointer patterns (opposite ends, fast & slow pointers).\n- Implement the Sliding Window technique for contiguous subsegment problems.\n\n## Example: Two-Sum Sorted (Two-Pointer Technique)\n```javascript\nfunction twoSumSorted(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) {\n      return [left, right];\n    } else if (sum < target) {\n      left++;  // Need a larger value\n    } else {\n      right--; // Need a smaller value\n    }\n  }\n  return []; // No pair found\n}\n\nconsole.log(twoSumSorted([2, 7, 11, 15], 9)); // [0, 1]\n```\n\n> 💡 **Tip:** When solving string/array subsequence or sum challenges, check if sorting the array allows applying a two-pointer scan in $O(N)$ time.\n",
            "conceptTheory": "# Module 2: Arrays, Strings & Two-Pointer Techniques\n\n## Overview\nArrays provide contiguous memory allocation with $O(1)$ random access by index. Two-pointer and sliding-window techniques enable reducing brute-force $O(N^2)$ search algorithms into optimal $O(N)$ linear scans.\n\n## Learning Objectives\n- Understand memory locality, array traversal, and dynamic resizing amortized analysis.\n- Master Two-Pointer patterns (opposite ends, fast & slow pointers).\n- Implement the Sliding Window technique for contiguous subsegment problems.\n\n## Example: Two-Sum Sorted (Two-Pointer Technique)\n```javascript\nfunction twoSumSorted(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) {\n      return [left, right];\n    } else if (sum < target) {\n      left++;  // Need a larger value\n    } else {\n      right--; // Need a smaller value\n    }\n  }\n  return []; // No pair found\n}\n\nconsole.log(twoSumSorted([2, 7, 11, 15], 9)); // [0, 1]\n```\n\n> 💡 **Tip:** When solving string/array subsequence or sum challenges, check if sorting the array allows applying a two-pointer scan in $O(N)$ time.\n",
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
    "duration": "4 Hours",
    "description": "Node structure, insertion, deletion, reversal, cycle detection, and merge.",
    "orderIndex": 3,
    "id": "dsa-mod-3",
    "title": "Module 3: Linked Lists (Singly & Doubly)",
    "courseId": "data-structures-and-algorithms",
    "order": 3,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 3: Linked Lists (Singly & Doubly)",
        "title": "Module 3 - Complete Notes",
        "type": "Reading",
        "content": "# Module 3: Singly & Doubly Linked Lists\n## Overview\nA Linked List is a linear data structure where elements (nodes) are non-contiguously stored in memory, linked via pointers. Unlike arrays, linked lists provide $O(1)$ insertions and deletions given a pointer to the target node.\n\n## Learning Objectives\n- Construct Singly Linked List and Doubly Linked List node structures.\n- Implement node insertion, deletion, searching, and in-place reversal ($O(N)$ time, $O(1)$ space).\n- Detect cycles in a linked list using Floyd's Cycle-Finding Algorithm (Tortoise and Hare).\n## Example: In-Place Singly Linked List Reversal\n```javascript\nclass ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nfunction reverseList(head) {\n  let prev = null;\n  let curr = head;\n\n  while (curr !== null) {\n    const nextTemp = curr.next; // Save next pointer\n    curr.next = prev;           // Reverse link\n    prev = curr;                // Advance prev\n    curr = nextTemp;            // Advance curr\n  }\n  return prev; // New head of reversed list\n}\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "dsa-unit-3-notes",
        "moduleId": "dsa-mod-3",
        "courseId": "data-structures-and-algorithms",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 3: Singly & Doubly Linked Lists\n## Overview\nA Linked List is a linear data structure where elements (nodes) are non-contiguously stored in memory, linked via pointers. Unlike arrays, linked lists provide $O(1)$ insertions and deletions given a pointer to the target node.\n\n## Learning Objectives\n- Construct Singly Linked List and Doubly Linked List node structures.\n- Implement node insertion, deletion, searching, and in-place reversal ($O(N)$ time, $O(1)$ space).\n- Detect cycles in a linked list using Floyd's Cycle-Finding Algorithm (Tortoise and Hare).\n## Example: In-Place Singly Linked List Reversal\n```javascript\nclass ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nfunction reverseList(head) {\n  let prev = null;\n  let curr = head;\n\n  while (curr !== null) {\n    const nextTemp = curr.next; // Save next pointer\n    curr.next = prev;           // Reverse link\n    prev = curr;                // Advance prev\n    curr = nextTemp;            // Advance curr\n  }\n  return prev; // New head of reversed list\n}\n```"
      }
    ],
    "topics": [
      {
        "id": "dsa-mod-3-topic-1",
        "title": "Module 3: Linked Lists (Singly & Doubly) Units",
        "description": "Node structure, insertion, deletion, reversal, cycle detection, and merge.",
        "estimatedDuration": "4 Hours",
        "learningUnits": [
          {
            "id": "dsa-unit-3-notes",
            "title": "Module 3 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 3: Singly & Doubly Linked Lists\n\n## Overview\nA Linked List is a linear data structure where elements (nodes) are non-contiguously stored in memory, linked via pointers. Unlike arrays, linked lists provide $O(1)$ insertions and deletions given a pointer to the target node.\n\n## Learning Objectives\n- Construct Singly Linked List and Doubly Linked List node structures.\n- Implement node insertion, deletion, searching, and in-place reversal ($O(N)$ time, $O(1)$ space).\n- Detect cycles in a linked list using Floyd's Cycle-Finding Algorithm (Tortoise and Hare).\n\n## Example: In-Place Singly Linked List Reversal\n```javascript\nclass ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nfunction reverseList(head) {\n  let prev = null;\n  let curr = head;\n\n  while (curr !== null) {\n    const nextTemp = curr.next; // Save next pointer\n    curr.next = prev;           // Reverse link\n    prev = curr;                // Advance prev\n    curr = nextTemp;            // Advance curr\n  }\n  return prev; // New head of reversed list\n}\n```\n",
            "content": "# Module 3: Singly & Doubly Linked Lists\n\n## Overview\nA Linked List is a linear data structure where elements (nodes) are non-contiguously stored in memory, linked via pointers. Unlike arrays, linked lists provide $O(1)$ insertions and deletions given a pointer to the target node.\n\n## Learning Objectives\n- Construct Singly Linked List and Doubly Linked List node structures.\n- Implement node insertion, deletion, searching, and in-place reversal ($O(N)$ time, $O(1)$ space).\n- Detect cycles in a linked list using Floyd's Cycle-Finding Algorithm (Tortoise and Hare).\n\n## Example: In-Place Singly Linked List Reversal\n```javascript\nclass ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nfunction reverseList(head) {\n  let prev = null;\n  let curr = head;\n\n  while (curr !== null) {\n    const nextTemp = curr.next; // Save next pointer\n    curr.next = prev;           // Reverse link\n    prev = curr;                // Advance prev\n    curr = nextTemp;            // Advance curr\n  }\n  return prev; // New head of reversed list\n}\n```\n",
            "conceptTheory": "# Module 3: Singly & Doubly Linked Lists\n\n## Overview\nA Linked List is a linear data structure where elements (nodes) are non-contiguously stored in memory, linked via pointers. Unlike arrays, linked lists provide $O(1)$ insertions and deletions given a pointer to the target node.\n\n## Learning Objectives\n- Construct Singly Linked List and Doubly Linked List node structures.\n- Implement node insertion, deletion, searching, and in-place reversal ($O(N)$ time, $O(1)$ space).\n- Detect cycles in a linked list using Floyd's Cycle-Finding Algorithm (Tortoise and Hare).\n\n## Example: In-Place Singly Linked List Reversal\n```javascript\nclass ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nfunction reverseList(head) {\n  let prev = null;\n  let curr = head;\n\n  while (curr !== null) {\n    const nextTemp = curr.next; // Save next pointer\n    curr.next = prev;           // Reverse link\n    prev = curr;                // Advance prev\n    curr = nextTemp;            // Advance curr\n  }\n  return prev; // New head of reversed list\n}\n```\n",
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
    "description": "LIFO/FIFO principles, balanced parentheses, monotonic stack, and circular queue.",
    "orderIndex": 4,
    "id": "dsa-mod-4",
    "title": "Module 4: Stacks & Queues",
    "courseId": "data-structures-and-algorithms",
    "order": 4,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 4: Stacks & Queues",
        "title": "Module 4 - Complete Notes",
        "type": "Reading",
        "content": "# Module 4: Stacks, Queues & Deques\n## Overview\nStacks enforce Last-In, First-Out (LIFO) semantics, while Queues enforce First-In, First-Out (FIFO) ordering. These abstract data types are fundamental to recursion, expression parsing, graph traversal, and task scheduling.\n\n## Learning Objectives\n- Implement Stacks using Arrays and Linked Lists ($O(1)$ push/pop).\n- Implement Queues and Circular Queues ($O(1)$ enqueue/dequeue).\n- Solve Monotonic Stack and Balanced Parentheses problems.\n## Example: Valid Parentheses Check\n```javascript\nfunction isValidParentheses(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n\n  for (const char of s) {\n    if (char === '(' || char === '{' || char === '[') {\n      stack.push(char);\n    } else if (map[char]) {\n      if (stack.pop() !== map[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}\n\nconsole.log(isValidParentheses(\"{[()]}\")); // true\nconsole.log(isValidParentheses(\"{[(])}\")); // false\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "dsa-unit-4-notes",
        "moduleId": "dsa-mod-4",
        "courseId": "data-structures-and-algorithms",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 4: Stacks, Queues & Deques\n## Overview\nStacks enforce Last-In, First-Out (LIFO) semantics, while Queues enforce First-In, First-Out (FIFO) ordering. These abstract data types are fundamental to recursion, expression parsing, graph traversal, and task scheduling.\n\n## Learning Objectives\n- Implement Stacks using Arrays and Linked Lists ($O(1)$ push/pop).\n- Implement Queues and Circular Queues ($O(1)$ enqueue/dequeue).\n- Solve Monotonic Stack and Balanced Parentheses problems.\n## Example: Valid Parentheses Check\n```javascript\nfunction isValidParentheses(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n\n  for (const char of s) {\n    if (char === '(' || char === '{' || char === '[') {\n      stack.push(char);\n    } else if (map[char]) {\n      if (stack.pop() !== map[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}\n\nconsole.log(isValidParentheses(\"{[()]}\")); // true\nconsole.log(isValidParentheses(\"{[(])}\")); // false\n```"
      }
    ],
    "topics": [
      {
        "id": "dsa-mod-4-topic-1",
        "title": "Module 4: Stacks & Queues Units",
        "description": "LIFO/FIFO principles, balanced parentheses, monotonic stack, and circular queue.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "dsa-unit-4-notes",
            "title": "Module 4 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 4: Stacks, Queues & Deques\n\n## Overview\nStacks enforce Last-In, First-Out (LIFO) semantics, while Queues enforce First-In, First-Out (FIFO) ordering. These abstract data types are fundamental to recursion, expression parsing, graph traversal, and task scheduling.\n\n## Learning Objectives\n- Implement Stacks using Arrays and Linked Lists ($O(1)$ push/pop).\n- Implement Queues and Circular Queues ($O(1)$ enqueue/dequeue).\n- Solve Monotonic Stack and Balanced Parentheses problems.\n\n## Example: Valid Parentheses Check\n```javascript\nfunction isValidParentheses(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n\n  for (const char of s) {\n    if (char === '(' || char === '{' || char === '[') {\n      stack.push(char);\n    } else if (map[char]) {\n      if (stack.pop() !== map[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}\n\nconsole.log(isValidParentheses(\"{[()]}\")); // true\nconsole.log(isValidParentheses(\"{[(])}\")); // false\n```\n",
            "content": "# Module 4: Stacks, Queues & Deques\n\n## Overview\nStacks enforce Last-In, First-Out (LIFO) semantics, while Queues enforce First-In, First-Out (FIFO) ordering. These abstract data types are fundamental to recursion, expression parsing, graph traversal, and task scheduling.\n\n## Learning Objectives\n- Implement Stacks using Arrays and Linked Lists ($O(1)$ push/pop).\n- Implement Queues and Circular Queues ($O(1)$ enqueue/dequeue).\n- Solve Monotonic Stack and Balanced Parentheses problems.\n\n## Example: Valid Parentheses Check\n```javascript\nfunction isValidParentheses(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n\n  for (const char of s) {\n    if (char === '(' || char === '{' || char === '[') {\n      stack.push(char);\n    } else if (map[char]) {\n      if (stack.pop() !== map[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}\n\nconsole.log(isValidParentheses(\"{[()]}\")); // true\nconsole.log(isValidParentheses(\"{[(])}\")); // false\n```\n",
            "conceptTheory": "# Module 4: Stacks, Queues & Deques\n\n## Overview\nStacks enforce Last-In, First-Out (LIFO) semantics, while Queues enforce First-In, First-Out (FIFO) ordering. These abstract data types are fundamental to recursion, expression parsing, graph traversal, and task scheduling.\n\n## Learning Objectives\n- Implement Stacks using Arrays and Linked Lists ($O(1)$ push/pop).\n- Implement Queues and Circular Queues ($O(1)$ enqueue/dequeue).\n- Solve Monotonic Stack and Balanced Parentheses problems.\n\n## Example: Valid Parentheses Check\n```javascript\nfunction isValidParentheses(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n\n  for (const char of s) {\n    if (char === '(' || char === '{' || char === '[') {\n      stack.push(char);\n    } else if (map[char]) {\n      if (stack.pop() !== map[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}\n\nconsole.log(isValidParentheses(\"{[()]}\")); // true\nconsole.log(isValidParentheses(\"{[(])}\")); // false\n```\n",
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
    "duration": "4 Hours",
    "description": "Base cases, recursive trees, permutations, subsets, and N-Queens problem.",
    "orderIndex": 5,
    "id": "dsa-mod-5",
    "title": "Module 5: Recursion & Backtracking",
    "courseId": "data-structures-and-algorithms",
    "order": 5,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 5: Recursion & Backtracking",
        "title": "Module 5 - Complete Notes",
        "type": "Reading",
        "content": "# Module 5: Recursion & Backtracking Algorithms\n## Overview\nRecursion breaks down a problem into identical subproblems by having a function call itself with a base case to terminate execution. Backtracking extends recursion by systematically exploring all decision branches and abandoning invalid paths.\n\n## Learning Objectives\n- Identify base cases and recursive steps to prevent stack overflow.\n- Trace recursive call stacks and draw recursion trees.\n- Implement backtracking to solve Permutations, Combinations, Subsets, and N-Queens.\n## Example: Generating Power Set (Subsets)\n```javascript\nfunction subsets(nums) {\n  const result = [];\n\n  function backtrack(index, current) {\n    result.push([...current]); // Add snapshot\n\n    for (let i = index; i < nums.length; i++) {\n      current.push(nums[i]);        // Choose\n      backtrack(i + 1, current);   // Explore\n      current.pop();                // Un-choose (Backtrack)\n    }\n  }\n\n  backtrack(0, []);\n  return result;\n}\n\nconsole.log(subsets([1, 2])); // [[], [1], [1, 2], [2]]\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "dsa-unit-5-notes",
        "moduleId": "dsa-mod-5",
        "courseId": "data-structures-and-algorithms",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 5: Recursion & Backtracking Algorithms\n## Overview\nRecursion breaks down a problem into identical subproblems by having a function call itself with a base case to terminate execution. Backtracking extends recursion by systematically exploring all decision branches and abandoning invalid paths.\n\n## Learning Objectives\n- Identify base cases and recursive steps to prevent stack overflow.\n- Trace recursive call stacks and draw recursion trees.\n- Implement backtracking to solve Permutations, Combinations, Subsets, and N-Queens.\n## Example: Generating Power Set (Subsets)\n```javascript\nfunction subsets(nums) {\n  const result = [];\n\n  function backtrack(index, current) {\n    result.push([...current]); // Add snapshot\n\n    for (let i = index; i < nums.length; i++) {\n      current.push(nums[i]);        // Choose\n      backtrack(i + 1, current);   // Explore\n      current.pop();                // Un-choose (Backtrack)\n    }\n  }\n\n  backtrack(0, []);\n  return result;\n}\n\nconsole.log(subsets([1, 2])); // [[], [1], [1, 2], [2]]\n```"
      }
    ],
    "topics": [
      {
        "id": "dsa-mod-5-topic-1",
        "title": "Module 5: Recursion & Backtracking Units",
        "description": "Base cases, recursive trees, permutations, subsets, and N-Queens problem.",
        "estimatedDuration": "4 Hours",
        "learningUnits": [
          {
            "id": "dsa-unit-5-notes",
            "title": "Module 5 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 5: Recursion & Backtracking Algorithms\n\n## Overview\nRecursion breaks down a problem into identical subproblems by having a function call itself with a base case to terminate execution. Backtracking extends recursion by systematically exploring all decision branches and abandoning invalid paths.\n\n## Learning Objectives\n- Identify base cases and recursive steps to prevent stack overflow.\n- Trace recursive call stacks and draw recursion trees.\n- Implement backtracking to solve Permutations, Combinations, Subsets, and N-Queens.\n\n## Example: Generating Power Set (Subsets)\n```javascript\nfunction subsets(nums) {\n  const result = [];\n\n  function backtrack(index, current) {\n    result.push([...current]); // Add snapshot\n\n    for (let i = index; i < nums.length; i++) {\n      current.push(nums[i]);        // Choose\n      backtrack(i + 1, current);   // Explore\n      current.pop();                // Un-choose (Backtrack)\n    }\n  }\n\n  backtrack(0, []);\n  return result;\n}\n\nconsole.log(subsets([1, 2])); // [[], [1], [1, 2], [2]]\n```\n",
            "content": "# Module 5: Recursion & Backtracking Algorithms\n\n## Overview\nRecursion breaks down a problem into identical subproblems by having a function call itself with a base case to terminate execution. Backtracking extends recursion by systematically exploring all decision branches and abandoning invalid paths.\n\n## Learning Objectives\n- Identify base cases and recursive steps to prevent stack overflow.\n- Trace recursive call stacks and draw recursion trees.\n- Implement backtracking to solve Permutations, Combinations, Subsets, and N-Queens.\n\n## Example: Generating Power Set (Subsets)\n```javascript\nfunction subsets(nums) {\n  const result = [];\n\n  function backtrack(index, current) {\n    result.push([...current]); // Add snapshot\n\n    for (let i = index; i < nums.length; i++) {\n      current.push(nums[i]);        // Choose\n      backtrack(i + 1, current);   // Explore\n      current.pop();                // Un-choose (Backtrack)\n    }\n  }\n\n  backtrack(0, []);\n  return result;\n}\n\nconsole.log(subsets([1, 2])); // [[], [1], [1, 2], [2]]\n```\n",
            "conceptTheory": "# Module 5: Recursion & Backtracking Algorithms\n\n## Overview\nRecursion breaks down a problem into identical subproblems by having a function call itself with a base case to terminate execution. Backtracking extends recursion by systematically exploring all decision branches and abandoning invalid paths.\n\n## Learning Objectives\n- Identify base cases and recursive steps to prevent stack overflow.\n- Trace recursive call stacks and draw recursion trees.\n- Implement backtracking to solve Permutations, Combinations, Subsets, and N-Queens.\n\n## Example: Generating Power Set (Subsets)\n```javascript\nfunction subsets(nums) {\n  const result = [];\n\n  function backtrack(index, current) {\n    result.push([...current]); // Add snapshot\n\n    for (let i = index; i < nums.length; i++) {\n      current.push(nums[i]);        // Choose\n      backtrack(i + 1, current);   // Explore\n      current.pop();                // Un-choose (Backtrack)\n    }\n  }\n\n  backtrack(0, []);\n  return result;\n}\n\nconsole.log(subsets([1, 2])); // [[], [1], [1, 2], [2]]\n```\n",
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
    "duration": "4 Hours",
    "description": "Merge sort, quick sort, heap sort, linear search, and binary search.",
    "orderIndex": 6,
    "id": "dsa-mod-6",
    "title": "Module 6: Sorting & Searching Algorithms",
    "courseId": "data-structures-and-algorithms",
    "order": 6,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 6: Sorting & Searching Algorithms",
        "title": "Module 6 - Complete Notes",
        "type": "Reading",
        "content": "# Module 6: Searching & Sorting Algorithms\n## Overview\nSearching and sorting are foundational algorithmic primitives. We compare divide-and-conquer sorting algorithms ($O(N log N)$) against elementary quadratic sorts ($O(N^2)$).\n\n## Learning Objectives\n- Implement Binary Search on sorted sequences ($O(log N)$).\n- Master Merge Sort (stable divide-and-conquer, $O(N log N)$).\n- Master Quick Sort (partitioning in-place, average $O(N log N)$).\n## Example: Binary Search Implementation\n```javascript\nfunction binarySearch(arr, target) {\n  let low = 0;\n  let high = arr.length - 1;\n\n  while (low <= high) {\n    const mid = Math.floor(low + (high - low) / 2);\n    if (arr[mid] === target) {\n      return mid; // Target index found\n    } else if (arr[mid] < target) {\n      low = mid + 1;\n    } else {\n      high = mid - 1;\n    }\n  }\n  return -1; // Not found\n}\n```\n> 💡 **Tip:** Always use `low + Math.floor((high - low) / 2)` to prevent integer overflow errors in languages like C, Java, and C++.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "dsa-unit-6-notes",
        "moduleId": "dsa-mod-6",
        "courseId": "data-structures-and-algorithms",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 6: Searching & Sorting Algorithms\n## Overview\nSearching and sorting are foundational algorithmic primitives. We compare divide-and-conquer sorting algorithms ($O(N log N)$) against elementary quadratic sorts ($O(N^2)$).\n\n## Learning Objectives\n- Implement Binary Search on sorted sequences ($O(log N)$).\n- Master Merge Sort (stable divide-and-conquer, $O(N log N)$).\n- Master Quick Sort (partitioning in-place, average $O(N log N)$).\n## Example: Binary Search Implementation\n```javascript\nfunction binarySearch(arr, target) {\n  let low = 0;\n  let high = arr.length - 1;\n\n  while (low <= high) {\n    const mid = Math.floor(low + (high - low) / 2);\n    if (arr[mid] === target) {\n      return mid; // Target index found\n    } else if (arr[mid] < target) {\n      low = mid + 1;\n    } else {\n      high = mid - 1;\n    }\n  }\n  return -1; // Not found\n}\n```\n> 💡 **Tip:** Always use `low + Math.floor((high - low) / 2)` to prevent integer overflow errors in languages like C, Java, and C++."
      }
    ],
    "topics": [
      {
        "id": "dsa-mod-6-topic-1",
        "title": "Module 6: Sorting & Searching Algorithms Units",
        "description": "Merge sort, quick sort, heap sort, linear search, and binary search.",
        "estimatedDuration": "4 Hours",
        "learningUnits": [
          {
            "id": "dsa-unit-6-notes",
            "title": "Module 6 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 6: Searching & Sorting Algorithms\n\n## Overview\nSearching and sorting are foundational algorithmic primitives. We compare divide-and-conquer sorting algorithms ($O(N log N)$) against elementary quadratic sorts ($O(N^2)$).\n\n## Learning Objectives\n- Implement Binary Search on sorted sequences ($O(log N)$).\n- Master Merge Sort (stable divide-and-conquer, $O(N log N)$).\n- Master Quick Sort (partitioning in-place, average $O(N log N)$).\n\n## Example: Binary Search Implementation\n```javascript\nfunction binarySearch(arr, target) {\n  let low = 0;\n  let high = arr.length - 1;\n\n  while (low <= high) {\n    const mid = Math.floor(low + (high - low) / 2);\n    if (arr[mid] === target) {\n      return mid; // Target index found\n    } else if (arr[mid] < target) {\n      low = mid + 1;\n    } else {\n      high = mid - 1;\n    }\n  }\n  return -1; // Not found\n}\n```\n\n> 💡 **Tip:** Always use `low + Math.floor((high - low) / 2)` to prevent integer overflow errors in languages like C, Java, and C++.\n",
            "content": "# Module 6: Searching & Sorting Algorithms\n\n## Overview\nSearching and sorting are foundational algorithmic primitives. We compare divide-and-conquer sorting algorithms ($O(N log N)$) against elementary quadratic sorts ($O(N^2)$).\n\n## Learning Objectives\n- Implement Binary Search on sorted sequences ($O(log N)$).\n- Master Merge Sort (stable divide-and-conquer, $O(N log N)$).\n- Master Quick Sort (partitioning in-place, average $O(N log N)$).\n\n## Example: Binary Search Implementation\n```javascript\nfunction binarySearch(arr, target) {\n  let low = 0;\n  let high = arr.length - 1;\n\n  while (low <= high) {\n    const mid = Math.floor(low + (high - low) / 2);\n    if (arr[mid] === target) {\n      return mid; // Target index found\n    } else if (arr[mid] < target) {\n      low = mid + 1;\n    } else {\n      high = mid - 1;\n    }\n  }\n  return -1; // Not found\n}\n```\n\n> 💡 **Tip:** Always use `low + Math.floor((high - low) / 2)` to prevent integer overflow errors in languages like C, Java, and C++.\n",
            "conceptTheory": "# Module 6: Searching & Sorting Algorithms\n\n## Overview\nSearching and sorting are foundational algorithmic primitives. We compare divide-and-conquer sorting algorithms ($O(N log N)$) against elementary quadratic sorts ($O(N^2)$).\n\n## Learning Objectives\n- Implement Binary Search on sorted sequences ($O(log N)$).\n- Master Merge Sort (stable divide-and-conquer, $O(N log N)$).\n- Master Quick Sort (partitioning in-place, average $O(N log N)$).\n\n## Example: Binary Search Implementation\n```javascript\nfunction binarySearch(arr, target) {\n  let low = 0;\n  let high = arr.length - 1;\n\n  while (low <= high) {\n    const mid = Math.floor(low + (high - low) / 2);\n    if (arr[mid] === target) {\n      return mid; // Target index found\n    } else if (arr[mid] < target) {\n      low = mid + 1;\n    } else {\n      high = mid - 1;\n    }\n  }\n  return -1; // Not found\n}\n```\n\n> 💡 **Tip:** Always use `low + Math.floor((high - low) / 2)` to prevent integer overflow errors in languages like C, Java, and C++.\n",
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
    "duration": "5 Hours",
    "description": "Tree traversals (Inorder, Preorder, Postorder, Level order), BST ops, and LCA.",
    "orderIndex": 7,
    "id": "dsa-mod-7",
    "title": "Module 7: Binary Trees & BST",
    "courseId": "data-structures-and-algorithms",
    "order": 7,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 7: Binary Trees & BST",
        "title": "Module 7 - Complete Notes",
        "type": "Reading",
        "content": "# Module 7: Binary Trees & Binary Search Trees (BST)\n## Overview\nA Binary Tree is a hierarchical non-linear data structure where each node has at most two children (left and right). A Binary Search Tree (BST) maintains the sorted invariant: all left descendant keys < node key < all right descendant keys.\n\n## Learning Objectives\n- Perform tree traversals: Inorder (LNR), Preorder (NLR), Postorder (LRN), and Level-Order BFS.\n- Insert, delete, and search nodes in a BST in $O(H)$ time where $H$ is tree height.\n- Calculate Maximum Depth, Diameter, and Lowest Common Ancestor (LCA).\n## Example: Inorder Traversal (Sorted Output for BST)\n```javascript\nclass TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nfunction inorderTraversal(root) {\n  const result = [];\n  function traverse(node) {\n    if (!node) return;\n    traverse(node.left);\n    result.push(node.val);\n    traverse(node.right);\n  }\n  traverse(root);\n  return result;\n}\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "dsa-unit-7-notes",
        "moduleId": "dsa-mod-7",
        "courseId": "data-structures-and-algorithms",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 7: Binary Trees & Binary Search Trees (BST)\n## Overview\nA Binary Tree is a hierarchical non-linear data structure where each node has at most two children (left and right). A Binary Search Tree (BST) maintains the sorted invariant: all left descendant keys < node key < all right descendant keys.\n\n## Learning Objectives\n- Perform tree traversals: Inorder (LNR), Preorder (NLR), Postorder (LRN), and Level-Order BFS.\n- Insert, delete, and search nodes in a BST in $O(H)$ time where $H$ is tree height.\n- Calculate Maximum Depth, Diameter, and Lowest Common Ancestor (LCA).\n## Example: Inorder Traversal (Sorted Output for BST)\n```javascript\nclass TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nfunction inorderTraversal(root) {\n  const result = [];\n  function traverse(node) {\n    if (!node) return;\n    traverse(node.left);\n    result.push(node.val);\n    traverse(node.right);\n  }\n  traverse(root);\n  return result;\n}\n```"
      }
    ],
    "topics": [
      {
        "id": "dsa-mod-7-topic-1",
        "title": "Module 7: Binary Trees & BST Units",
        "description": "Tree traversals (Inorder, Preorder, Postorder, Level order), BST ops, and LCA.",
        "estimatedDuration": "5 Hours",
        "learningUnits": [
          {
            "id": "dsa-unit-7-notes",
            "title": "Module 7 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 7: Binary Trees & Binary Search Trees (BST)\n\n## Overview\nA Binary Tree is a hierarchical non-linear data structure where each node has at most two children (left and right). A Binary Search Tree (BST) maintains the sorted invariant: all left descendant keys < node key < all right descendant keys.\n\n## Learning Objectives\n- Perform tree traversals: Inorder (LNR), Preorder (NLR), Postorder (LRN), and Level-Order BFS.\n- Insert, delete, and search nodes in a BST in $O(H)$ time where $H$ is tree height.\n- Calculate Maximum Depth, Diameter, and Lowest Common Ancestor (LCA).\n\n## Example: Inorder Traversal (Sorted Output for BST)\n```javascript\nclass TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nfunction inorderTraversal(root) {\n  const result = [];\n  function traverse(node) {\n    if (!node) return;\n    traverse(node.left);\n    result.push(node.val);\n    traverse(node.right);\n  }\n  traverse(root);\n  return result;\n}\n```\n",
            "content": "# Module 7: Binary Trees & Binary Search Trees (BST)\n\n## Overview\nA Binary Tree is a hierarchical non-linear data structure where each node has at most two children (left and right). A Binary Search Tree (BST) maintains the sorted invariant: all left descendant keys < node key < all right descendant keys.\n\n## Learning Objectives\n- Perform tree traversals: Inorder (LNR), Preorder (NLR), Postorder (LRN), and Level-Order BFS.\n- Insert, delete, and search nodes in a BST in $O(H)$ time where $H$ is tree height.\n- Calculate Maximum Depth, Diameter, and Lowest Common Ancestor (LCA).\n\n## Example: Inorder Traversal (Sorted Output for BST)\n```javascript\nclass TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nfunction inorderTraversal(root) {\n  const result = [];\n  function traverse(node) {\n    if (!node) return;\n    traverse(node.left);\n    result.push(node.val);\n    traverse(node.right);\n  }\n  traverse(root);\n  return result;\n}\n```\n",
            "conceptTheory": "# Module 7: Binary Trees & Binary Search Trees (BST)\n\n## Overview\nA Binary Tree is a hierarchical non-linear data structure where each node has at most two children (left and right). A Binary Search Tree (BST) maintains the sorted invariant: all left descendant keys < node key < all right descendant keys.\n\n## Learning Objectives\n- Perform tree traversals: Inorder (LNR), Preorder (NLR), Postorder (LRN), and Level-Order BFS.\n- Insert, delete, and search nodes in a BST in $O(H)$ time where $H$ is tree height.\n- Calculate Maximum Depth, Diameter, and Lowest Common Ancestor (LCA).\n\n## Example: Inorder Traversal (Sorted Output for BST)\n```javascript\nclass TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nfunction inorderTraversal(root) {\n  const result = [];\n  function traverse(node) {\n    if (!node) return;\n    traverse(node.left);\n    result.push(node.val);\n    traverse(node.right);\n  }\n  traverse(root);\n  return result;\n}\n```\n",
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
    "description": "Min-heap, max-heap, heapify algorithm, and Top-K elements problems.",
    "orderIndex": 8,
    "id": "dsa-mod-8",
    "title": "Module 8: Heaps & Priority Queues",
    "courseId": "data-structures-and-algorithms",
    "order": 8,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 8: Heaps & Priority Queues",
        "title": "Module 8 - Complete Notes",
        "type": "Reading",
        "content": "# Module 8: Heaps & Priority Queues\n## Overview\nA Binary Heap is a complete binary tree satisfying the Heap Property (Min-Heap: parent $le$ children; Max-Heap: parent $ge$ children). Heaps enable finding minimum or maximum elements in $O(1)$ time and inserting/extracting in $O(log N)$ time.\n\n## Learning Objectives\n- Understand Array representation of binary heaps (`left = 2i + 1`, `right = 2i + 2`, `parent = (i-1)/2`).\n- Implement Heapify, `insert()`, and `extractMin()` operations.\n- Solve Top-K Frequent Elements and Median in a Data Stream.\n> 💡 **Tip:** When finding the \"Kth largest element\", use a Min-Heap of size $K$. When finding the \"Kth smallest element\", use a Max-Heap of size $K$.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "dsa-unit-8-notes",
        "moduleId": "dsa-mod-8",
        "courseId": "data-structures-and-algorithms",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 8: Heaps & Priority Queues\n## Overview\nA Binary Heap is a complete binary tree satisfying the Heap Property (Min-Heap: parent $le$ children; Max-Heap: parent $ge$ children). Heaps enable finding minimum or maximum elements in $O(1)$ time and inserting/extracting in $O(log N)$ time.\n\n## Learning Objectives\n- Understand Array representation of binary heaps (`left = 2i + 1`, `right = 2i + 2`, `parent = (i-1)/2`).\n- Implement Heapify, `insert()`, and `extractMin()` operations.\n- Solve Top-K Frequent Elements and Median in a Data Stream.\n> 💡 **Tip:** When finding the \"Kth largest element\", use a Min-Heap of size $K$. When finding the \"Kth smallest element\", use a Max-Heap of size $K$."
      }
    ],
    "topics": [
      {
        "id": "dsa-mod-8-topic-1",
        "title": "Module 8: Heaps & Priority Queues Units",
        "description": "Min-heap, max-heap, heapify algorithm, and Top-K elements problems.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "dsa-unit-8-notes",
            "title": "Module 8 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 8: Heaps & Priority Queues\n\n## Overview\nA Binary Heap is a complete binary tree satisfying the Heap Property (Min-Heap: parent $le$ children; Max-Heap: parent $ge$ children). Heaps enable finding minimum or maximum elements in $O(1)$ time and inserting/extracting in $O(log N)$ time.\n\n## Learning Objectives\n- Understand Array representation of binary heaps (`left = 2i + 1`, `right = 2i + 2`, `parent = (i-1)/2`).\n- Implement Heapify, `insert()`, and `extractMin()` operations.\n- Solve Top-K Frequent Elements and Median in a Data Stream.\n\n> 💡 **Tip:** When finding the \"Kth largest element\", use a Min-Heap of size $K$. When finding the \"Kth smallest element\", use a Max-Heap of size $K$.\n",
            "content": "# Module 8: Heaps & Priority Queues\n\n## Overview\nA Binary Heap is a complete binary tree satisfying the Heap Property (Min-Heap: parent $le$ children; Max-Heap: parent $ge$ children). Heaps enable finding minimum or maximum elements in $O(1)$ time and inserting/extracting in $O(log N)$ time.\n\n## Learning Objectives\n- Understand Array representation of binary heaps (`left = 2i + 1`, `right = 2i + 2`, `parent = (i-1)/2`).\n- Implement Heapify, `insert()`, and `extractMin()` operations.\n- Solve Top-K Frequent Elements and Median in a Data Stream.\n\n> 💡 **Tip:** When finding the \"Kth largest element\", use a Min-Heap of size $K$. When finding the \"Kth smallest element\", use a Max-Heap of size $K$.\n",
            "conceptTheory": "# Module 8: Heaps & Priority Queues\n\n## Overview\nA Binary Heap is a complete binary tree satisfying the Heap Property (Min-Heap: parent $le$ children; Max-Heap: parent $ge$ children). Heaps enable finding minimum or maximum elements in $O(1)$ time and inserting/extracting in $O(log N)$ time.\n\n## Learning Objectives\n- Understand Array representation of binary heaps (`left = 2i + 1`, `right = 2i + 2`, `parent = (i-1)/2`).\n- Implement Heapify, `insert()`, and `extractMin()` operations.\n- Solve Top-K Frequent Elements and Median in a Data Stream.\n\n> 💡 **Tip:** When finding the \"Kth largest element\", use a Min-Heap of size $K$. When finding the \"Kth smallest element\", use a Max-Heap of size $K$.\n",
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
    "duration": "5 Hours",
    "description": "Adjacency list/matrix, BFS, DFS, Dijkstra shortest path, and topological sort.",
    "orderIndex": 9,
    "id": "dsa-mod-9",
    "title": "Module 9: Graphs & Graph Traversals",
    "courseId": "data-structures-and-algorithms",
    "order": 9,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 9: Graphs & Graph Traversals",
        "title": "Module 9 - Complete Notes",
        "type": "Reading",
        "content": "# Module 9: Graphs & Graph Traversals\n## Overview\nGraphs model pairwise relationships between sets of vertices (nodes) and edges (connections). Graphs can be directed/undirected and weighted/unweighted.\n\n## Learning Objectives\n- Represent graphs using Adjacency Lists and Adjacency Matrices.\n- Master Breadth-First Search (BFS) for shortest paths in unweighted graphs.\n- Master Depth-First Search (DFS) for connectivity and cycle detection.\n- Implement Dijkstra's Algorithm for shortest path in non-negative weighted graphs.\n## Example: Breadth-First Search (BFS)\n```javascript\nfunction bfs(graph, startNode) {\n  const visited = new Set([startNode]);\n  const queue = [startNode];\n  const traversalOrder = [];\n\n  while (queue.length > 0) {\n    const current = queue.shift();\n    traversalOrder.push(current);\n\n    for (const neighbor of graph[current] || []) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return traversalOrder;\n}\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "dsa-unit-9-notes",
        "moduleId": "dsa-mod-9",
        "courseId": "data-structures-and-algorithms",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 9: Graphs & Graph Traversals\n## Overview\nGraphs model pairwise relationships between sets of vertices (nodes) and edges (connections). Graphs can be directed/undirected and weighted/unweighted.\n\n## Learning Objectives\n- Represent graphs using Adjacency Lists and Adjacency Matrices.\n- Master Breadth-First Search (BFS) for shortest paths in unweighted graphs.\n- Master Depth-First Search (DFS) for connectivity and cycle detection.\n- Implement Dijkstra's Algorithm for shortest path in non-negative weighted graphs.\n## Example: Breadth-First Search (BFS)\n```javascript\nfunction bfs(graph, startNode) {\n  const visited = new Set([startNode]);\n  const queue = [startNode];\n  const traversalOrder = [];\n\n  while (queue.length > 0) {\n    const current = queue.shift();\n    traversalOrder.push(current);\n\n    for (const neighbor of graph[current] || []) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return traversalOrder;\n}\n```"
      }
    ],
    "topics": [
      {
        "id": "dsa-mod-9-topic-1",
        "title": "Module 9: Graphs & Graph Traversals Units",
        "description": "Adjacency list/matrix, BFS, DFS, Dijkstra shortest path, and topological sort.",
        "estimatedDuration": "5 Hours",
        "learningUnits": [
          {
            "id": "dsa-unit-9-notes",
            "title": "Module 9 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 9: Graphs & Graph Traversals\n\n## Overview\nGraphs model pairwise relationships between sets of vertices (nodes) and edges (connections). Graphs can be directed/undirected and weighted/unweighted.\n\n## Learning Objectives\n- Represent graphs using Adjacency Lists and Adjacency Matrices.\n- Master Breadth-First Search (BFS) for shortest paths in unweighted graphs.\n- Master Depth-First Search (DFS) for connectivity and cycle detection.\n- Implement Dijkstra's Algorithm for shortest path in non-negative weighted graphs.\n\n## Example: Breadth-First Search (BFS)\n```javascript\nfunction bfs(graph, startNode) {\n  const visited = new Set([startNode]);\n  const queue = [startNode];\n  const traversalOrder = [];\n\n  while (queue.length > 0) {\n    const current = queue.shift();\n    traversalOrder.push(current);\n\n    for (const neighbor of graph[current] || []) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return traversalOrder;\n}\n```\n",
            "content": "# Module 9: Graphs & Graph Traversals\n\n## Overview\nGraphs model pairwise relationships between sets of vertices (nodes) and edges (connections). Graphs can be directed/undirected and weighted/unweighted.\n\n## Learning Objectives\n- Represent graphs using Adjacency Lists and Adjacency Matrices.\n- Master Breadth-First Search (BFS) for shortest paths in unweighted graphs.\n- Master Depth-First Search (DFS) for connectivity and cycle detection.\n- Implement Dijkstra's Algorithm for shortest path in non-negative weighted graphs.\n\n## Example: Breadth-First Search (BFS)\n```javascript\nfunction bfs(graph, startNode) {\n  const visited = new Set([startNode]);\n  const queue = [startNode];\n  const traversalOrder = [];\n\n  while (queue.length > 0) {\n    const current = queue.shift();\n    traversalOrder.push(current);\n\n    for (const neighbor of graph[current] || []) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return traversalOrder;\n}\n```\n",
            "conceptTheory": "# Module 9: Graphs & Graph Traversals\n\n## Overview\nGraphs model pairwise relationships between sets of vertices (nodes) and edges (connections). Graphs can be directed/undirected and weighted/unweighted.\n\n## Learning Objectives\n- Represent graphs using Adjacency Lists and Adjacency Matrices.\n- Master Breadth-First Search (BFS) for shortest paths in unweighted graphs.\n- Master Depth-First Search (DFS) for connectivity and cycle detection.\n- Implement Dijkstra's Algorithm for shortest path in non-negative weighted graphs.\n\n## Example: Breadth-First Search (BFS)\n```javascript\nfunction bfs(graph, startNode) {\n  const visited = new Set([startNode]);\n  const queue = [startNode];\n  const traversalOrder = [];\n\n  while (queue.length > 0) {\n    const current = queue.shift();\n    traversalOrder.push(current);\n\n    for (const neighbor of graph[current] || []) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return traversalOrder;\n}\n```\n",
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
    "duration": "5 Hours",
    "description": "Memoization, tabulation, knapsack problem, LCS, and greedy optimization.",
    "orderIndex": 10,
    "id": "dsa-mod-10",
    "title": "Module 10: Dynamic Programming & Greedy Algorithms",
    "courseId": "data-structures-and-algorithms",
    "order": 10,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 10: Dynamic Programming & Greedy Algorithms",
        "title": "Module 10 - Complete Notes",
        "type": "Reading",
        "content": "# Module 10: Dynamic Programming & Greedy Algorithms\n## Overview\nDynamic Programming (DP) solves complex optimization problems by breaking them into overlapping subproblems with optimal substructure, storing previously calculated results to avoid redundant work.\n\n## Learning Objectives\n- Understand Top-Down Memoization vs Bottom-Up Tabulation.\n- Solve 0/1 Knapsack, Longest Common Subsequence (LCS), and Coin Change problems.\n- Contrast Greedy choice property against Dynamic Programming decisions.\n## Example: Coin Change Problem (Bottom-Up DP)\n```javascript\nfunction coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0; // Base case: 0 coins needed for amount 0\n\n  for (let i = 1; i <= amount; i++) {\n    for (const coin of coins) {\n      if (i - coin >= 0) {\n        dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n      }\n    }\n  }\n\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n\nconsole.log(coinChange([1, 2, 5], 11)); // 3 (5 + 5 + 1)\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "dsa-unit-10-notes",
        "moduleId": "dsa-mod-10",
        "courseId": "data-structures-and-algorithms",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 10: Dynamic Programming & Greedy Algorithms\n## Overview\nDynamic Programming (DP) solves complex optimization problems by breaking them into overlapping subproblems with optimal substructure, storing previously calculated results to avoid redundant work.\n\n## Learning Objectives\n- Understand Top-Down Memoization vs Bottom-Up Tabulation.\n- Solve 0/1 Knapsack, Longest Common Subsequence (LCS), and Coin Change problems.\n- Contrast Greedy choice property against Dynamic Programming decisions.\n## Example: Coin Change Problem (Bottom-Up DP)\n```javascript\nfunction coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0; // Base case: 0 coins needed for amount 0\n\n  for (let i = 1; i <= amount; i++) {\n    for (const coin of coins) {\n      if (i - coin >= 0) {\n        dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n      }\n    }\n  }\n\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n\nconsole.log(coinChange([1, 2, 5], 11)); // 3 (5 + 5 + 1)\n```"
      }
    ],
    "topics": [
      {
        "id": "dsa-mod-10-topic-1",
        "title": "Module 10: Dynamic Programming & Greedy Algorithms Units",
        "description": "Memoization, tabulation, knapsack problem, LCS, and greedy optimization.",
        "estimatedDuration": "5 Hours",
        "learningUnits": [
          {
            "id": "dsa-unit-10-notes",
            "title": "Module 10 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 10: Dynamic Programming & Greedy Algorithms\n\n## Overview\nDynamic Programming (DP) solves complex optimization problems by breaking them into overlapping subproblems with optimal substructure, storing previously calculated results to avoid redundant work.\n\n## Learning Objectives\n- Understand Top-Down Memoization vs Bottom-Up Tabulation.\n- Solve 0/1 Knapsack, Longest Common Subsequence (LCS), and Coin Change problems.\n- Contrast Greedy choice property against Dynamic Programming decisions.\n\n## Example: Coin Change Problem (Bottom-Up DP)\n```javascript\nfunction coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0; // Base case: 0 coins needed for amount 0\n\n  for (let i = 1; i <= amount; i++) {\n    for (const coin of coins) {\n      if (i - coin >= 0) {\n        dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n      }\n    }\n  }\n\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n\nconsole.log(coinChange([1, 2, 5], 11)); // 3 (5 + 5 + 1)\n```\n",
            "content": "# Module 10: Dynamic Programming & Greedy Algorithms\n\n## Overview\nDynamic Programming (DP) solves complex optimization problems by breaking them into overlapping subproblems with optimal substructure, storing previously calculated results to avoid redundant work.\n\n## Learning Objectives\n- Understand Top-Down Memoization vs Bottom-Up Tabulation.\n- Solve 0/1 Knapsack, Longest Common Subsequence (LCS), and Coin Change problems.\n- Contrast Greedy choice property against Dynamic Programming decisions.\n\n## Example: Coin Change Problem (Bottom-Up DP)\n```javascript\nfunction coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0; // Base case: 0 coins needed for amount 0\n\n  for (let i = 1; i <= amount; i++) {\n    for (const coin of coins) {\n      if (i - coin >= 0) {\n        dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n      }\n    }\n  }\n\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n\nconsole.log(coinChange([1, 2, 5], 11)); // 3 (5 + 5 + 1)\n```\n",
            "conceptTheory": "# Module 10: Dynamic Programming & Greedy Algorithms\n\n## Overview\nDynamic Programming (DP) solves complex optimization problems by breaking them into overlapping subproblems with optimal substructure, storing previously calculated results to avoid redundant work.\n\n## Learning Objectives\n- Understand Top-Down Memoization vs Bottom-Up Tabulation.\n- Solve 0/1 Knapsack, Longest Common Subsequence (LCS), and Coin Change problems.\n- Contrast Greedy choice property against Dynamic Programming decisions.\n\n## Example: Coin Change Problem (Bottom-Up DP)\n```javascript\nfunction coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0; // Base case: 0 coins needed for amount 0\n\n  for (let i = 1; i <= amount; i++) {\n    for (const coin of coins) {\n      if (i - coin >= 0) {\n        dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n      }\n    }\n  }\n\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n\nconsole.log(coinChange([1, 2, 5], 11)); // 3 (5 + 5 + 1)\n```\n",
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
