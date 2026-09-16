import type { ModuleItem } from '../contexts/CourseContext';

export const webDevCourseModules: ModuleItem[] = [
  {
    "duration": "2 Hours",
    "description": "Web architecture, HTTP/HTTPS, client-server models, and browsers.",
    "orderIndex": 1,
    "id": "web-mod-1",
    "title": "Module 1: Introduction to Web Development",
    "courseId": "web-development-fundamentals",
    "order": 1,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 1: Introduction to Web Development",
        "title": "Module 1 - Complete Notes",
        "type": "Reading",
        "content": "# Module 1: Introduction to Web Development & How the Web Works\n## Overview\nWeb Development encompasses creating, building, and maintaining applications that run inside web browsers across mobile devices, tablets, and desktops.\n\n## Learning Objectives\n- Understand the Client-Server Architecture and HTTP/HTTPS request-response cycles.\n- Understand the roles of DNS (Domain Name System), Web Hosting Servers, and CDNs.\n- Differentiate between Frontend (Client-side), Backend (Server-side), and Database systems.\n## Concept: Client-Server Web Lifecycle\n```text\n┌──────────────┐      1. DNS Lookup (\"kaizenq.in\")       ┌──────────────┐\n│              ├────────────────────────────────────────>│  DNS Server  │\n│              │<────────────────────────────────────────┤              │\n│              │            2. IP Address                └──────────────┘\n│              │\n│  Client      │      3. HTTPS GET /index.html           ┌──────────────┐\n│  Browser     ├────────────────────────────────────────>│ Web Server   │\n│              │<────────────────────────────────────────┤ (Nginx/Node) │\n│              │      4. HTML, CSS, JS Bundle            └──────────────┘\n└──────────────┘\n```\n> 💡 **Tip:** Always use HTTPS (Port 443 with TLS 1.3 encryption) for web production assets to protect student sessions from packet sniffing.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "web-unit-1-notes",
        "moduleId": "web-mod-1",
        "courseId": "web-development-fundamentals",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 1: Introduction to Web Development & How the Web Works\n## Overview\nWeb Development encompasses creating, building, and maintaining applications that run inside web browsers across mobile devices, tablets, and desktops.\n\n## Learning Objectives\n- Understand the Client-Server Architecture and HTTP/HTTPS request-response cycles.\n- Understand the roles of DNS (Domain Name System), Web Hosting Servers, and CDNs.\n- Differentiate between Frontend (Client-side), Backend (Server-side), and Database systems.\n## Concept: Client-Server Web Lifecycle\n```text\n┌──────────────┐      1. DNS Lookup (\"kaizenq.in\")       ┌──────────────┐\n│              ├────────────────────────────────────────>│  DNS Server  │\n│              │<────────────────────────────────────────┤              │\n│              │            2. IP Address                └──────────────┘\n│              │\n│  Client      │      3. HTTPS GET /index.html           ┌──────────────┐\n│  Browser     ├────────────────────────────────────────>│ Web Server   │\n│              │<────────────────────────────────────────┤ (Nginx/Node) │\n│              │      4. HTML, CSS, JS Bundle            └──────────────┘\n└──────────────┘\n```\n> 💡 **Tip:** Always use HTTPS (Port 443 with TLS 1.3 encryption) for web production assets to protect student sessions from packet sniffing."
      }
    ],
    "topics": [
      {
        "id": "web-mod-1-topic-1",
        "title": "Module 1: Introduction to Web Development Units",
        "description": "Web architecture, HTTP/HTTPS, client-server models, and browsers.",
        "estimatedDuration": "2 Hours",
        "learningUnits": [
          {
            "id": "web-unit-1-notes",
            "title": "Module 1 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 1: Introduction to Web Development & How the Web Works\n\n## Overview\nWeb Development encompasses creating, building, and maintaining applications that run inside web browsers across mobile devices, tablets, and desktops.\n\n## Learning Objectives\n- Understand the Client-Server Architecture and HTTP/HTTPS request-response cycles.\n- Understand the roles of DNS (Domain Name System), Web Hosting Servers, and CDNs.\n- Differentiate between Frontend (Client-side), Backend (Server-side), and Database systems.\n\n## Concept: Client-Server Web Lifecycle\n```text\n┌──────────────┐      1. DNS Lookup (\"kaizenq.in\")       ┌──────────────┐\n│              ├────────────────────────────────────────>│  DNS Server  │\n│              │<────────────────────────────────────────┤              │\n│              │            2. IP Address                └──────────────┘\n│              │\n│  Client      │      3. HTTPS GET /index.html           ┌──────────────┐\n│  Browser     ├────────────────────────────────────────>│ Web Server   │\n│              │<────────────────────────────────────────┤ (Nginx/Node) │\n│              │      4. HTML, CSS, JS Bundle            └──────────────┘\n└──────────────┘\n```\n\n> 💡 **Tip:** Always use HTTPS (Port 443 with TLS 1.3 encryption) for web production assets to protect student sessions from packet sniffing.\n",
            "content": "# Module 1: Introduction to Web Development & How the Web Works\n\n## Overview\nWeb Development encompasses creating, building, and maintaining applications that run inside web browsers across mobile devices, tablets, and desktops.\n\n## Learning Objectives\n- Understand the Client-Server Architecture and HTTP/HTTPS request-response cycles.\n- Understand the roles of DNS (Domain Name System), Web Hosting Servers, and CDNs.\n- Differentiate between Frontend (Client-side), Backend (Server-side), and Database systems.\n\n## Concept: Client-Server Web Lifecycle\n```text\n┌──────────────┐      1. DNS Lookup (\"kaizenq.in\")       ┌──────────────┐\n│              ├────────────────────────────────────────>│  DNS Server  │\n│              │<────────────────────────────────────────┤              │\n│              │            2. IP Address                └──────────────┘\n│              │\n│  Client      │      3. HTTPS GET /index.html           ┌──────────────┐\n│  Browser     ├────────────────────────────────────────>│ Web Server   │\n│              │<────────────────────────────────────────┤ (Nginx/Node) │\n│              │      4. HTML, CSS, JS Bundle            └──────────────┘\n└──────────────┘\n```\n\n> 💡 **Tip:** Always use HTTPS (Port 443 with TLS 1.3 encryption) for web production assets to protect student sessions from packet sniffing.\n",
            "conceptTheory": "# Module 1: Introduction to Web Development & How the Web Works\n\n## Overview\nWeb Development encompasses creating, building, and maintaining applications that run inside web browsers across mobile devices, tablets, and desktops.\n\n## Learning Objectives\n- Understand the Client-Server Architecture and HTTP/HTTPS request-response cycles.\n- Understand the roles of DNS (Domain Name System), Web Hosting Servers, and CDNs.\n- Differentiate between Frontend (Client-side), Backend (Server-side), and Database systems.\n\n## Concept: Client-Server Web Lifecycle\n```text\n┌──────────────┐      1. DNS Lookup (\"kaizenq.in\")       ┌──────────────┐\n│              ├────────────────────────────────────────>│  DNS Server  │\n│              │<────────────────────────────────────────┤              │\n│              │            2. IP Address                └──────────────┘\n│              │\n│  Client      │      3. HTTPS GET /index.html           ┌──────────────┐\n│  Browser     ├────────────────────────────────────────>│ Web Server   │\n│              │<────────────────────────────────────────┤ (Nginx/Node) │\n│              │      4. HTML, CSS, JS Bundle            └──────────────┘\n└──────────────┘\n```\n\n> 💡 **Tip:** Always use HTTPS (Port 443 with TLS 1.3 encryption) for web production assets to protect student sessions from packet sniffing.\n",
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
    "description": "Semantic tags, document structure, forms, inputs, and accessibility.",
    "orderIndex": 2,
    "id": "web-mod-2",
    "title": "Module 2: HTML5 Semantic Structure & Forms",
    "courseId": "web-development-fundamentals",
    "order": 2,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 2: HTML5 Semantic Structure & Forms",
        "title": "Module 2 - Complete Notes",
        "type": "Reading",
        "content": "# Module 2: HTML5 Semantic Structure & Forms\n## Overview\nHypertext Markup Language (HTML5) defines the meaning, structure, and accessibility semantics of web documents.\n\n## Learning Objectives\n- Use semantic layout elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, and `<footer>`.\n- Build accessible form controls with `<form>`, `<input>`, `<select>`, `<textarea>`, and `<label>`.\n- Master form validation attributes: `required`, `pattern`, `min`, `max`, and ARIA accessibility labels.\n## Example: Semantic Accessible Card\n```html\n<article class=\"course-card\" aria-labelledby=\"course-title\">\n  <header>\n    <span class=\"badge\">Web Development</span>\n    <h2 id=\"course-title\">Full Stack Web Fundamentals</h2>\n  </header>\n  <p>Learn HTML5, CSS3, and JavaScript to build modern responsive applications.</p>\n  <footer>\n    <a href=\"/course/web-dev\" class=\"btn-primary\" role=\"button\">Start Learning</a>\n  </footer>\n</article>\n```\n> 📌 **Note:** Semantic HTML elements provide screen readers and search engines (SEO) with structural meaning that plain `<div>` tags lack.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "web-unit-2-notes",
        "moduleId": "web-mod-2",
        "courseId": "web-development-fundamentals",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 2: HTML5 Semantic Structure & Forms\n## Overview\nHypertext Markup Language (HTML5) defines the meaning, structure, and accessibility semantics of web documents.\n\n## Learning Objectives\n- Use semantic layout elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, and `<footer>`.\n- Build accessible form controls with `<form>`, `<input>`, `<select>`, `<textarea>`, and `<label>`.\n- Master form validation attributes: `required`, `pattern`, `min`, `max`, and ARIA accessibility labels.\n## Example: Semantic Accessible Card\n```html\n<article class=\"course-card\" aria-labelledby=\"course-title\">\n  <header>\n    <span class=\"badge\">Web Development</span>\n    <h2 id=\"course-title\">Full Stack Web Fundamentals</h2>\n  </header>\n  <p>Learn HTML5, CSS3, and JavaScript to build modern responsive applications.</p>\n  <footer>\n    <a href=\"/course/web-dev\" class=\"btn-primary\" role=\"button\">Start Learning</a>\n  </footer>\n</article>\n```\n> 📌 **Note:** Semantic HTML elements provide screen readers and search engines (SEO) with structural meaning that plain `<div>` tags lack."
      }
    ],
    "topics": [
      {
        "id": "web-mod-2-topic-1",
        "title": "Module 2: HTML5 Semantic Structure & Forms Units",
        "description": "Semantic tags, document structure, forms, inputs, and accessibility.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "web-unit-2-notes",
            "title": "Module 2 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 2: HTML5 Semantic Structure & Forms\n\n## Overview\nHypertext Markup Language (HTML5) defines the meaning, structure, and accessibility semantics of web documents.\n\n## Learning Objectives\n- Use semantic layout elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, and `<footer>`.\n- Build accessible form controls with `<form>`, `<input>`, `<select>`, `<textarea>`, and `<label>`.\n- Master form validation attributes: `required`, `pattern`, `min`, `max`, and ARIA accessibility labels.\n\n## Example: Semantic Accessible Card\n```html\n<article class=\"course-card\" aria-labelledby=\"course-title\">\n  <header>\n    <span class=\"badge\">Web Development</span>\n    <h2 id=\"course-title\">Full Stack Web Fundamentals</h2>\n  </header>\n  <p>Learn HTML5, CSS3, and JavaScript to build modern responsive applications.</p>\n  <footer>\n    <a href=\"/course/web-dev\" class=\"btn-primary\" role=\"button\">Start Learning</a>\n  </footer>\n</article>\n```\n\n> 📌 **Note:** Semantic HTML elements provide screen readers and search engines (SEO) with structural meaning that plain `<div>` tags lack.\n",
            "content": "# Module 2: HTML5 Semantic Structure & Forms\n\n## Overview\nHypertext Markup Language (HTML5) defines the meaning, structure, and accessibility semantics of web documents.\n\n## Learning Objectives\n- Use semantic layout elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, and `<footer>`.\n- Build accessible form controls with `<form>`, `<input>`, `<select>`, `<textarea>`, and `<label>`.\n- Master form validation attributes: `required`, `pattern`, `min`, `max`, and ARIA accessibility labels.\n\n## Example: Semantic Accessible Card\n```html\n<article class=\"course-card\" aria-labelledby=\"course-title\">\n  <header>\n    <span class=\"badge\">Web Development</span>\n    <h2 id=\"course-title\">Full Stack Web Fundamentals</h2>\n  </header>\n  <p>Learn HTML5, CSS3, and JavaScript to build modern responsive applications.</p>\n  <footer>\n    <a href=\"/course/web-dev\" class=\"btn-primary\" role=\"button\">Start Learning</a>\n  </footer>\n</article>\n```\n\n> 📌 **Note:** Semantic HTML elements provide screen readers and search engines (SEO) with structural meaning that plain `<div>` tags lack.\n",
            "conceptTheory": "# Module 2: HTML5 Semantic Structure & Forms\n\n## Overview\nHypertext Markup Language (HTML5) defines the meaning, structure, and accessibility semantics of web documents.\n\n## Learning Objectives\n- Use semantic layout elements: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, and `<footer>`.\n- Build accessible form controls with `<form>`, `<input>`, `<select>`, `<textarea>`, and `<label>`.\n- Master form validation attributes: `required`, `pattern`, `min`, `max`, and ARIA accessibility labels.\n\n## Example: Semantic Accessible Card\n```html\n<article class=\"course-card\" aria-labelledby=\"course-title\">\n  <header>\n    <span class=\"badge\">Web Development</span>\n    <h2 id=\"course-title\">Full Stack Web Fundamentals</h2>\n  </header>\n  <p>Learn HTML5, CSS3, and JavaScript to build modern responsive applications.</p>\n  <footer>\n    <a href=\"/course/web-dev\" class=\"btn-primary\" role=\"button\">Start Learning</a>\n  </footer>\n</article>\n```\n\n> 📌 **Note:** Semantic HTML elements provide screen readers and search engines (SEO) with structural meaning that plain `<div>` tags lack.\n",
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
    "description": "Box model, margin, padding, border, CSS variables, and specificity.",
    "orderIndex": 3,
    "id": "web-mod-3",
    "title": "Module 3: CSS3 Styling & Box Model",
    "courseId": "web-development-fundamentals",
    "order": 3,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 3: CSS3 Styling & Box Model",
        "title": "Module 3 - Complete Notes",
        "type": "Reading",
        "content": "# Module 3: CSS3 Styling & The Box Model\n## Overview\nCascading Style Sheets (CSS3) controls visual styling, typography, colors, and layout positioning. The Box Model dictates how margins, borders, padding, and content areas calculate element dimensions.\n\n## Learning Objectives\n- Master the CSS Box Model: `content`, `padding`, `border`, and `margin`.\n- Understand `box-sizing: border-box` and CSS resets.\n- Master CSS specificity calculation (inline styles > IDs > classes > elements).\n- Use CSS Custom Properties (Variables) for theming (e.g. `--primary-color: #3b82f6;`).\n## Example: Modern Box Reset & Theming\n```css\n:root {\n  --primary: #4f46e5;\n  --bg-dark: #0f172a;\n  --text-light: #f8fafc;\n  --radius-md: 8px;\n}\n\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n.card {\n  background-color: var(--bg-dark);\n  color: var(--text-light);\n  padding: 1.5rem;\n  border-radius: var(--radius-md);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "web-unit-3-notes",
        "moduleId": "web-mod-3",
        "courseId": "web-development-fundamentals",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 3: CSS3 Styling & The Box Model\n## Overview\nCascading Style Sheets (CSS3) controls visual styling, typography, colors, and layout positioning. The Box Model dictates how margins, borders, padding, and content areas calculate element dimensions.\n\n## Learning Objectives\n- Master the CSS Box Model: `content`, `padding`, `border`, and `margin`.\n- Understand `box-sizing: border-box` and CSS resets.\n- Master CSS specificity calculation (inline styles > IDs > classes > elements).\n- Use CSS Custom Properties (Variables) for theming (e.g. `--primary-color: #3b82f6;`).\n## Example: Modern Box Reset & Theming\n```css\n:root {\n  --primary: #4f46e5;\n  --bg-dark: #0f172a;\n  --text-light: #f8fafc;\n  --radius-md: 8px;\n}\n\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n.card {\n  background-color: var(--bg-dark);\n  color: var(--text-light);\n  padding: 1.5rem;\n  border-radius: var(--radius-md);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n```"
      }
    ],
    "topics": [
      {
        "id": "web-mod-3-topic-1",
        "title": "Module 3: CSS3 Styling & Box Model Units",
        "description": "Box model, margin, padding, border, CSS variables, and specificity.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "web-unit-3-notes",
            "title": "Module 3 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 3: CSS3 Styling & The Box Model\n\n## Overview\nCascading Style Sheets (CSS3) controls visual styling, typography, colors, and layout positioning. The Box Model dictates how margins, borders, padding, and content areas calculate element dimensions.\n\n## Learning Objectives\n- Master the CSS Box Model: `content`, `padding`, `border`, and `margin`.\n- Understand `box-sizing: border-box` and CSS resets.\n- Master CSS specificity calculation (inline styles > IDs > classes > elements).\n- Use CSS Custom Properties (Variables) for theming (e.g. `--primary-color: #3b82f6;`).\n\n## Example: Modern Box Reset & Theming\n```css\n:root {\n  --primary: #4f46e5;\n  --bg-dark: #0f172a;\n  --text-light: #f8fafc;\n  --radius-md: 8px;\n}\n\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n.card {\n  background-color: var(--bg-dark);\n  color: var(--text-light);\n  padding: 1.5rem;\n  border-radius: var(--radius-md);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n```\n",
            "content": "# Module 3: CSS3 Styling & The Box Model\n\n## Overview\nCascading Style Sheets (CSS3) controls visual styling, typography, colors, and layout positioning. The Box Model dictates how margins, borders, padding, and content areas calculate element dimensions.\n\n## Learning Objectives\n- Master the CSS Box Model: `content`, `padding`, `border`, and `margin`.\n- Understand `box-sizing: border-box` and CSS resets.\n- Master CSS specificity calculation (inline styles > IDs > classes > elements).\n- Use CSS Custom Properties (Variables) for theming (e.g. `--primary-color: #3b82f6;`).\n\n## Example: Modern Box Reset & Theming\n```css\n:root {\n  --primary: #4f46e5;\n  --bg-dark: #0f172a;\n  --text-light: #f8fafc;\n  --radius-md: 8px;\n}\n\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n.card {\n  background-color: var(--bg-dark);\n  color: var(--text-light);\n  padding: 1.5rem;\n  border-radius: var(--radius-md);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n```\n",
            "conceptTheory": "# Module 3: CSS3 Styling & The Box Model\n\n## Overview\nCascading Style Sheets (CSS3) controls visual styling, typography, colors, and layout positioning. The Box Model dictates how margins, borders, padding, and content areas calculate element dimensions.\n\n## Learning Objectives\n- Master the CSS Box Model: `content`, `padding`, `border`, and `margin`.\n- Understand `box-sizing: border-box` and CSS resets.\n- Master CSS specificity calculation (inline styles > IDs > classes > elements).\n- Use CSS Custom Properties (Variables) for theming (e.g. `--primary-color: #3b82f6;`).\n\n## Example: Modern Box Reset & Theming\n```css\n:root {\n  --primary: #4f46e5;\n  --bg-dark: #0f172a;\n  --text-light: #f8fafc;\n  --radius-md: 8px;\n}\n\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n.card {\n  background-color: var(--bg-dark);\n  color: var(--text-light);\n  padding: 1.5rem;\n  border-radius: var(--radius-md);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n```\n",
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
    "description": "Flexbox alignment, 2D CSS Grid systems, and media queries.",
    "orderIndex": 4,
    "id": "web-mod-4",
    "title": "Module 4: Responsive Design with Flexbox & Grid",
    "courseId": "web-development-fundamentals",
    "order": 4,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 4: Responsive Design with Flexbox & Grid",
        "title": "Module 4 - Complete Notes",
        "type": "Reading",
        "content": "# Module 4: Responsive Design with Flexbox & CSS Grid\n## Overview\nModern web layouts must adapt seamlessly across varying viewport dimensions from mobile phones (375px) to 4K monitors (3840px). Flexbox provides 1-dimensional alignment; CSS Grid provides 2-dimensional layouts.\n\n## Learning Objectives\n- Master Flexbox axis alignment (`justify-content`, `align-items`, `flex-grow`, `flex-shrink`, `flex-wrap`).\n- Master CSS Grid tracks (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, `gap`).\n- Write Mobile-First Media Queries (`@media (min-width: 768px)`).\n## Example: Responsive Auto-Fit Grid\n```css\n.course-grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1.5rem;\n}\n\n/* Tablet & Desktop Auto-Fitting */\n@media (min-width: 640px) {\n  .course-grid {\n    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  }\n}\n```\n> 💡 **Tip:** Always design mobile-first using `min-width` media queries rather than desktop-down `max-width` queries for cleaner, more maintainable CSS.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "web-unit-4-notes",
        "moduleId": "web-mod-4",
        "courseId": "web-development-fundamentals",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 4: Responsive Design with Flexbox & CSS Grid\n## Overview\nModern web layouts must adapt seamlessly across varying viewport dimensions from mobile phones (375px) to 4K monitors (3840px). Flexbox provides 1-dimensional alignment; CSS Grid provides 2-dimensional layouts.\n\n## Learning Objectives\n- Master Flexbox axis alignment (`justify-content`, `align-items`, `flex-grow`, `flex-shrink`, `flex-wrap`).\n- Master CSS Grid tracks (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, `gap`).\n- Write Mobile-First Media Queries (`@media (min-width: 768px)`).\n## Example: Responsive Auto-Fit Grid\n```css\n.course-grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1.5rem;\n}\n\n/* Tablet & Desktop Auto-Fitting */\n@media (min-width: 640px) {\n  .course-grid {\n    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  }\n}\n```\n> 💡 **Tip:** Always design mobile-first using `min-width` media queries rather than desktop-down `max-width` queries for cleaner, more maintainable CSS."
      }
    ],
    "topics": [
      {
        "id": "web-mod-4-topic-1",
        "title": "Module 4: Responsive Design with Flexbox & Grid Units",
        "description": "Flexbox alignment, 2D CSS Grid systems, and media queries.",
        "estimatedDuration": "4 Hours",
        "learningUnits": [
          {
            "id": "web-unit-4-notes",
            "title": "Module 4 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 4: Responsive Design with Flexbox & CSS Grid\n\n## Overview\nModern web layouts must adapt seamlessly across varying viewport dimensions from mobile phones (375px) to 4K monitors (3840px). Flexbox provides 1-dimensional alignment; CSS Grid provides 2-dimensional layouts.\n\n## Learning Objectives\n- Master Flexbox axis alignment (`justify-content`, `align-items`, `flex-grow`, `flex-shrink`, `flex-wrap`).\n- Master CSS Grid tracks (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, `gap`).\n- Write Mobile-First Media Queries (`@media (min-width: 768px)`).\n\n## Example: Responsive Auto-Fit Grid\n```css\n.course-grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1.5rem;\n}\n\n/* Tablet & Desktop Auto-Fitting */\n@media (min-width: 640px) {\n  .course-grid {\n    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  }\n}\n```\n\n> 💡 **Tip:** Always design mobile-first using `min-width` media queries rather than desktop-down `max-width` queries for cleaner, more maintainable CSS.\n",
            "content": "# Module 4: Responsive Design with Flexbox & CSS Grid\n\n## Overview\nModern web layouts must adapt seamlessly across varying viewport dimensions from mobile phones (375px) to 4K monitors (3840px). Flexbox provides 1-dimensional alignment; CSS Grid provides 2-dimensional layouts.\n\n## Learning Objectives\n- Master Flexbox axis alignment (`justify-content`, `align-items`, `flex-grow`, `flex-shrink`, `flex-wrap`).\n- Master CSS Grid tracks (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, `gap`).\n- Write Mobile-First Media Queries (`@media (min-width: 768px)`).\n\n## Example: Responsive Auto-Fit Grid\n```css\n.course-grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1.5rem;\n}\n\n/* Tablet & Desktop Auto-Fitting */\n@media (min-width: 640px) {\n  .course-grid {\n    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  }\n}\n```\n\n> 💡 **Tip:** Always design mobile-first using `min-width` media queries rather than desktop-down `max-width` queries for cleaner, more maintainable CSS.\n",
            "conceptTheory": "# Module 4: Responsive Design with Flexbox & CSS Grid\n\n## Overview\nModern web layouts must adapt seamlessly across varying viewport dimensions from mobile phones (375px) to 4K monitors (3840px). Flexbox provides 1-dimensional alignment; CSS Grid provides 2-dimensional layouts.\n\n## Learning Objectives\n- Master Flexbox axis alignment (`justify-content`, `align-items`, `flex-grow`, `flex-shrink`, `flex-wrap`).\n- Master CSS Grid tracks (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, `gap`).\n- Write Mobile-First Media Queries (`@media (min-width: 768px)`).\n\n## Example: Responsive Auto-Fit Grid\n```css\n.course-grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1.5rem;\n}\n\n/* Tablet & Desktop Auto-Fitting */\n@media (min-width: 640px) {\n  .course-grid {\n    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  }\n}\n```\n\n> 💡 **Tip:** Always design mobile-first using `min-width` media queries rather than desktop-down `max-width` queries for cleaner, more maintainable CSS.\n",
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
    "description": "Keyframe animations, transitions, transforms, and glassmorphism.",
    "orderIndex": 5,
    "id": "web-mod-5",
    "title": "Module 5: CSS Animations & Modern Layouts",
    "courseId": "web-development-fundamentals",
    "order": 5,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 5: CSS Animations & Modern Layouts",
        "title": "Module 5 - Complete Notes",
        "type": "Reading",
        "content": "# Module 5: CSS Animations, Transitions & Modern Layouts\n## Overview\nSmooth transitions and micro-interactions enhance visual polish and user engagement without relying on heavy JavaScript libraries.\n\n## Learning Objectives\n- Master CSS transitions: `transition: all 0.2s ease-in-out`.\n- Write CSS keyframe animations with `@keyframes` and `animation-timing-function`.\n- Implement modern glassmorphism (`backdrop-filter: blur(12px)`) and glowing gradients.\n## Example: Glassmorphic Interactive Button\n```css\n.glass-btn {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  color: #fff;\n  padding: 0.75rem 1.5rem;\n  border-radius: 9999px;\n  cursor: pointer;\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n\n.glass-btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);\n}\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "web-unit-5-notes",
        "moduleId": "web-mod-5",
        "courseId": "web-development-fundamentals",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 5: CSS Animations, Transitions & Modern Layouts\n## Overview\nSmooth transitions and micro-interactions enhance visual polish and user engagement without relying on heavy JavaScript libraries.\n\n## Learning Objectives\n- Master CSS transitions: `transition: all 0.2s ease-in-out`.\n- Write CSS keyframe animations with `@keyframes` and `animation-timing-function`.\n- Implement modern glassmorphism (`backdrop-filter: blur(12px)`) and glowing gradients.\n## Example: Glassmorphic Interactive Button\n```css\n.glass-btn {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  color: #fff;\n  padding: 0.75rem 1.5rem;\n  border-radius: 9999px;\n  cursor: pointer;\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n\n.glass-btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);\n}\n```"
      }
    ],
    "topics": [
      {
        "id": "web-mod-5-topic-1",
        "title": "Module 5: CSS Animations & Modern Layouts Units",
        "description": "Keyframe animations, transitions, transforms, and glassmorphism.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "web-unit-5-notes",
            "title": "Module 5 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 5: CSS Animations, Transitions & Modern Layouts\n\n## Overview\nSmooth transitions and micro-interactions enhance visual polish and user engagement without relying on heavy JavaScript libraries.\n\n## Learning Objectives\n- Master CSS transitions: `transition: all 0.2s ease-in-out`.\n- Write CSS keyframe animations with `@keyframes` and `animation-timing-function`.\n- Implement modern glassmorphism (`backdrop-filter: blur(12px)`) and glowing gradients.\n\n## Example: Glassmorphic Interactive Button\n```css\n.glass-btn {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  color: #fff;\n  padding: 0.75rem 1.5rem;\n  border-radius: 9999px;\n  cursor: pointer;\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n\n.glass-btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);\n}\n```\n",
            "content": "# Module 5: CSS Animations, Transitions & Modern Layouts\n\n## Overview\nSmooth transitions and micro-interactions enhance visual polish and user engagement without relying on heavy JavaScript libraries.\n\n## Learning Objectives\n- Master CSS transitions: `transition: all 0.2s ease-in-out`.\n- Write CSS keyframe animations with `@keyframes` and `animation-timing-function`.\n- Implement modern glassmorphism (`backdrop-filter: blur(12px)`) and glowing gradients.\n\n## Example: Glassmorphic Interactive Button\n```css\n.glass-btn {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  color: #fff;\n  padding: 0.75rem 1.5rem;\n  border-radius: 9999px;\n  cursor: pointer;\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n\n.glass-btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);\n}\n```\n",
            "conceptTheory": "# Module 5: CSS Animations, Transitions & Modern Layouts\n\n## Overview\nSmooth transitions and micro-interactions enhance visual polish and user engagement without relying on heavy JavaScript libraries.\n\n## Learning Objectives\n- Master CSS transitions: `transition: all 0.2s ease-in-out`.\n- Write CSS keyframe animations with `@keyframes` and `animation-timing-function`.\n- Implement modern glassmorphism (`backdrop-filter: blur(12px)`) and glowing gradients.\n\n## Example: Glassmorphic Interactive Button\n```css\n.glass-btn {\n  background: rgba(255, 255, 255, 0.05);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  color: #fff;\n  padding: 0.75rem 1.5rem;\n  border-radius: 9999px;\n  cursor: pointer;\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n\n.glass-btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);\n}\n```\n",
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
    "description": "DOM manipulation, events, modals, dropdowns, and form validation.",
    "orderIndex": 6,
    "id": "web-mod-6",
    "title": "Module 6: JavaScript for Web Interactivity",
    "courseId": "web-development-fundamentals",
    "order": 6,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 6: JavaScript for Web Interactivity",
        "title": "Module 6 - Complete Notes",
        "type": "Reading",
        "content": "# Module 6: JavaScript for Web Interactivity\n## Overview\nJavaScript brings static HTML & CSS pages to life through dynamic DOM manipulation, interactive modals, tabs, and form validation.\n\n## Learning Objectives\n- Query DOM nodes with `document.querySelector` and `querySelectorAll`.\n- Toggle UI states using classes (`classList.add`, `classList.remove`, `classList.toggle`).\n- Implement dynamic modal dialogs and dropdown menus with keyboard accessibility (`Escape` key handler).\n## Example: Accessible Modal Controller\n```javascript\nconst openModalBtn = document.querySelector('#open-modal');\nconst modal = document.querySelector('#dialog-modal');\nconst closeModalBtn = document.querySelector('#close-modal');\n\nconst toggleModal = (isOpen) => {\n  modal.classList.toggle('is-visible', isOpen);\n  modal.setAttribute('aria-hidden', !isOpen);\n  document.body.style.overflow = isOpen ? 'hidden' : '';\n};\n\nopenModalBtn.addEventListener('click', () => toggleModal(true));\ncloseModalBtn.addEventListener('click', () => toggleModal(false));\nwindow.addEventListener('keydown', (e) => {\n  if (e.key === 'Escape') toggleModal(false);\n});\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "web-unit-6-notes",
        "moduleId": "web-mod-6",
        "courseId": "web-development-fundamentals",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 6: JavaScript for Web Interactivity\n## Overview\nJavaScript brings static HTML & CSS pages to life through dynamic DOM manipulation, interactive modals, tabs, and form validation.\n\n## Learning Objectives\n- Query DOM nodes with `document.querySelector` and `querySelectorAll`.\n- Toggle UI states using classes (`classList.add`, `classList.remove`, `classList.toggle`).\n- Implement dynamic modal dialogs and dropdown menus with keyboard accessibility (`Escape` key handler).\n## Example: Accessible Modal Controller\n```javascript\nconst openModalBtn = document.querySelector('#open-modal');\nconst modal = document.querySelector('#dialog-modal');\nconst closeModalBtn = document.querySelector('#close-modal');\n\nconst toggleModal = (isOpen) => {\n  modal.classList.toggle('is-visible', isOpen);\n  modal.setAttribute('aria-hidden', !isOpen);\n  document.body.style.overflow = isOpen ? 'hidden' : '';\n};\n\nopenModalBtn.addEventListener('click', () => toggleModal(true));\ncloseModalBtn.addEventListener('click', () => toggleModal(false));\nwindow.addEventListener('keydown', (e) => {\n  if (e.key === 'Escape') toggleModal(false);\n});\n```"
      }
    ],
    "topics": [
      {
        "id": "web-mod-6-topic-1",
        "title": "Module 6: JavaScript for Web Interactivity Units",
        "description": "DOM manipulation, events, modals, dropdowns, and form validation.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "web-unit-6-notes",
            "title": "Module 6 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 6: JavaScript for Web Interactivity\n\n## Overview\nJavaScript brings static HTML & CSS pages to life through dynamic DOM manipulation, interactive modals, tabs, and form validation.\n\n## Learning Objectives\n- Query DOM nodes with `document.querySelector` and `querySelectorAll`.\n- Toggle UI states using classes (`classList.add`, `classList.remove`, `classList.toggle`).\n- Implement dynamic modal dialogs and dropdown menus with keyboard accessibility (`Escape` key handler).\n\n## Example: Accessible Modal Controller\n```javascript\nconst openModalBtn = document.querySelector('#open-modal');\nconst modal = document.querySelector('#dialog-modal');\nconst closeModalBtn = document.querySelector('#close-modal');\n\nconst toggleModal = (isOpen) => {\n  modal.classList.toggle('is-visible', isOpen);\n  modal.setAttribute('aria-hidden', !isOpen);\n  document.body.style.overflow = isOpen ? 'hidden' : '';\n};\n\nopenModalBtn.addEventListener('click', () => toggleModal(true));\ncloseModalBtn.addEventListener('click', () => toggleModal(false));\nwindow.addEventListener('keydown', (e) => {\n  if (e.key === 'Escape') toggleModal(false);\n});\n```\n",
            "content": "# Module 6: JavaScript for Web Interactivity\n\n## Overview\nJavaScript brings static HTML & CSS pages to life through dynamic DOM manipulation, interactive modals, tabs, and form validation.\n\n## Learning Objectives\n- Query DOM nodes with `document.querySelector` and `querySelectorAll`.\n- Toggle UI states using classes (`classList.add`, `classList.remove`, `classList.toggle`).\n- Implement dynamic modal dialogs and dropdown menus with keyboard accessibility (`Escape` key handler).\n\n## Example: Accessible Modal Controller\n```javascript\nconst openModalBtn = document.querySelector('#open-modal');\nconst modal = document.querySelector('#dialog-modal');\nconst closeModalBtn = document.querySelector('#close-modal');\n\nconst toggleModal = (isOpen) => {\n  modal.classList.toggle('is-visible', isOpen);\n  modal.setAttribute('aria-hidden', !isOpen);\n  document.body.style.overflow = isOpen ? 'hidden' : '';\n};\n\nopenModalBtn.addEventListener('click', () => toggleModal(true));\ncloseModalBtn.addEventListener('click', () => toggleModal(false));\nwindow.addEventListener('keydown', (e) => {\n  if (e.key === 'Escape') toggleModal(false);\n});\n```\n",
            "conceptTheory": "# Module 6: JavaScript for Web Interactivity\n\n## Overview\nJavaScript brings static HTML & CSS pages to life through dynamic DOM manipulation, interactive modals, tabs, and form validation.\n\n## Learning Objectives\n- Query DOM nodes with `document.querySelector` and `querySelectorAll`.\n- Toggle UI states using classes (`classList.add`, `classList.remove`, `classList.toggle`).\n- Implement dynamic modal dialogs and dropdown menus with keyboard accessibility (`Escape` key handler).\n\n## Example: Accessible Modal Controller\n```javascript\nconst openModalBtn = document.querySelector('#open-modal');\nconst modal = document.querySelector('#dialog-modal');\nconst closeModalBtn = document.querySelector('#close-modal');\n\nconst toggleModal = (isOpen) => {\n  modal.classList.toggle('is-visible', isOpen);\n  modal.setAttribute('aria-hidden', !isOpen);\n  document.body.style.overflow = isOpen ? 'hidden' : '';\n};\n\nopenModalBtn.addEventListener('click', () => toggleModal(true));\ncloseModalBtn.addEventListener('click', () => toggleModal(false));\nwindow.addEventListener('keydown', (e) => {\n  if (e.key === 'Escape') toggleModal(false);\n});\n```\n",
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
    "description": "Fetch API, async/await, RESTful APIs, JSON handling, and localStorage.",
    "orderIndex": 7,
    "id": "web-mod-7",
    "title": "Module 7: Working with Web APIs & Data Fetching",
    "courseId": "web-development-fundamentals",
    "order": 7,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 7: Working with Web APIs & Data Fetching",
        "title": "Module 7 - Complete Notes",
        "type": "Reading",
        "content": "# Module 7: Working with Web APIs & Data Fetching\n## Overview\nModern web apps dynamically fetch data from REST and GraphQL backends to update UI components without full page refreshes.\n\n## Learning Objectives\n- Understand the `fetch()` API and JSON serialization (`JSON.parse`, `JSON.stringify`).\n- Handle loading states, skeleton screens, and network error banners gracefully.\n- Store user preferences in `localStorage` and `sessionStorage`.\n## Example: Dynamic Course Card Loader\n```javascript\nasync function loadCoursesCatalog() {\n  const container = document.getElementById('catalog-container');\n  container.innerHTML = '<div class=\"spinner\">Loading courses...</div>';\n\n  try {\n    const res = await fetch('/api/courses');\n    const { data: courses } = await res.json();\n\n    container.innerHTML = courses.map(course => `\n      <div class=\"card\">\n        <h3>${course.title}</h3>\n        <p>${course.shortDescription}</p>\n        <span class=\"badge\">${course.duration}</span>\n      </div>\n    `).join('');\n  } catch (err) {\n    container.innerHTML = '<p class=\"error\">Failed to load courses. Please try again.</p>';\n  }\n}\n```",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "web-unit-7-notes",
        "moduleId": "web-mod-7",
        "courseId": "web-development-fundamentals",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 7: Working with Web APIs & Data Fetching\n## Overview\nModern web apps dynamically fetch data from REST and GraphQL backends to update UI components without full page refreshes.\n\n## Learning Objectives\n- Understand the `fetch()` API and JSON serialization (`JSON.parse`, `JSON.stringify`).\n- Handle loading states, skeleton screens, and network error banners gracefully.\n- Store user preferences in `localStorage` and `sessionStorage`.\n## Example: Dynamic Course Card Loader\n```javascript\nasync function loadCoursesCatalog() {\n  const container = document.getElementById('catalog-container');\n  container.innerHTML = '<div class=\"spinner\">Loading courses...</div>';\n\n  try {\n    const res = await fetch('/api/courses');\n    const { data: courses } = await res.json();\n\n    container.innerHTML = courses.map(course => `\n      <div class=\"card\">\n        <h3>${course.title}</h3>\n        <p>${course.shortDescription}</p>\n        <span class=\"badge\">${course.duration}</span>\n      </div>\n    `).join('');\n  } catch (err) {\n    container.innerHTML = '<p class=\"error\">Failed to load courses. Please try again.</p>';\n  }\n}\n```"
      }
    ],
    "topics": [
      {
        "id": "web-mod-7-topic-1",
        "title": "Module 7: Working with Web APIs & Data Fetching Units",
        "description": "Fetch API, async/await, RESTful APIs, JSON handling, and localStorage.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "web-unit-7-notes",
            "title": "Module 7 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 7: Working with Web APIs & Data Fetching\n\n## Overview\nModern web apps dynamically fetch data from REST and GraphQL backends to update UI components without full page refreshes.\n\n## Learning Objectives\n- Understand the `fetch()` API and JSON serialization (`JSON.parse`, `JSON.stringify`).\n- Handle loading states, skeleton screens, and network error banners gracefully.\n- Store user preferences in `localStorage` and `sessionStorage`.\n\n## Example: Dynamic Course Card Loader\n```javascript\nasync function loadCoursesCatalog() {\n  const container = document.getElementById('catalog-container');\n  container.innerHTML = '<div class=\"spinner\">Loading courses...</div>';\n\n  try {\n    const res = await fetch('/api/courses');\n    const { data: courses } = await res.json();\n\n    container.innerHTML = courses.map(course => `\n      <div class=\"card\">\n        <h3>${course.title}</h3>\n        <p>${course.shortDescription}</p>\n        <span class=\"badge\">${course.duration}</span>\n      </div>\n    `).join('');\n  } catch (err) {\n    container.innerHTML = '<p class=\"error\">Failed to load courses. Please try again.</p>';\n  }\n}\n```\n",
            "content": "# Module 7: Working with Web APIs & Data Fetching\n\n## Overview\nModern web apps dynamically fetch data from REST and GraphQL backends to update UI components without full page refreshes.\n\n## Learning Objectives\n- Understand the `fetch()` API and JSON serialization (`JSON.parse`, `JSON.stringify`).\n- Handle loading states, skeleton screens, and network error banners gracefully.\n- Store user preferences in `localStorage` and `sessionStorage`.\n\n## Example: Dynamic Course Card Loader\n```javascript\nasync function loadCoursesCatalog() {\n  const container = document.getElementById('catalog-container');\n  container.innerHTML = '<div class=\"spinner\">Loading courses...</div>';\n\n  try {\n    const res = await fetch('/api/courses');\n    const { data: courses } = await res.json();\n\n    container.innerHTML = courses.map(course => `\n      <div class=\"card\">\n        <h3>${course.title}</h3>\n        <p>${course.shortDescription}</p>\n        <span class=\"badge\">${course.duration}</span>\n      </div>\n    `).join('');\n  } catch (err) {\n    container.innerHTML = '<p class=\"error\">Failed to load courses. Please try again.</p>';\n  }\n}\n```\n",
            "conceptTheory": "# Module 7: Working with Web APIs & Data Fetching\n\n## Overview\nModern web apps dynamically fetch data from REST and GraphQL backends to update UI components without full page refreshes.\n\n## Learning Objectives\n- Understand the `fetch()` API and JSON serialization (`JSON.parse`, `JSON.stringify`).\n- Handle loading states, skeleton screens, and network error banners gracefully.\n- Store user preferences in `localStorage` and `sessionStorage`.\n\n## Example: Dynamic Course Card Loader\n```javascript\nasync function loadCoursesCatalog() {\n  const container = document.getElementById('catalog-container');\n  container.innerHTML = '<div class=\"spinner\">Loading courses...</div>';\n\n  try {\n    const res = await fetch('/api/courses');\n    const { data: courses } = await res.json();\n\n    container.innerHTML = courses.map(course => `\n      <div class=\"card\">\n        <h3>${course.title}</h3>\n        <p>${course.shortDescription}</p>\n        <span class=\"badge\">${course.duration}</span>\n      </div>\n    `).join('');\n  } catch (err) {\n    container.innerHTML = '<p class=\"error\">Failed to load courses. Please try again.</p>';\n  }\n}\n```\n",
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
    "description": "End-to-end responsive web project with search, filters, and state.",
    "orderIndex": 8,
    "id": "web-mod-8",
    "title": "Module 8: Building a Real-World Website Project",
    "courseId": "web-development-fundamentals",
    "order": 8,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 8: Building a Real-World Website Project",
        "title": "Module 8 - Complete Notes",
        "type": "Reading",
        "content": "# Module 8: Building a Real-World Website Project\n## Overview\nSynthesize HTML, CSS, and JavaScript skills into a fully functional multi-page web application featuring navigation routers, search filtering, and state persistence.\n\n## Learning Objectives\n- Structure frontend assets into modular directories (`/css`, `/js`, `/assets`).\n- Implement client-side URL routing and tab switching.\n- Build live search and category filtering in real-time.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "web-unit-8-notes",
        "moduleId": "web-mod-8",
        "courseId": "web-development-fundamentals",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 8: Building a Real-World Website Project\n## Overview\nSynthesize HTML, CSS, and JavaScript skills into a fully functional multi-page web application featuring navigation routers, search filtering, and state persistence.\n\n## Learning Objectives\n- Structure frontend assets into modular directories (`/css`, `/js`, `/assets`).\n- Implement client-side URL routing and tab switching.\n- Build live search and category filtering in real-time."
      }
    ],
    "topics": [
      {
        "id": "web-mod-8-topic-1",
        "title": "Module 8: Building a Real-World Website Project Units",
        "description": "End-to-end responsive web project with search, filters, and state.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "web-unit-8-notes",
            "title": "Module 8 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 8: Building a Real-World Website Project\n\n## Overview\nSynthesize HTML, CSS, and JavaScript skills into a fully functional multi-page web application featuring navigation routers, search filtering, and state persistence.\n\n## Learning Objectives\n- Structure frontend assets into modular directories (`/css`, `/js`, `/assets`).\n- Implement client-side URL routing and tab switching.\n- Build live search and category filtering in real-time.\n",
            "content": "# Module 8: Building a Real-World Website Project\n\n## Overview\nSynthesize HTML, CSS, and JavaScript skills into a fully functional multi-page web application featuring navigation routers, search filtering, and state persistence.\n\n## Learning Objectives\n- Structure frontend assets into modular directories (`/css`, `/js`, `/assets`).\n- Implement client-side URL routing and tab switching.\n- Build live search and category filtering in real-time.\n",
            "conceptTheory": "# Module 8: Building a Real-World Website Project\n\n## Overview\nSynthesize HTML, CSS, and JavaScript skills into a fully functional multi-page web application featuring navigation routers, search filtering, and state persistence.\n\n## Learning Objectives\n- Structure frontend assets into modular directories (`/css`, `/js`, `/assets`).\n- Implement client-side URL routing and tab switching.\n- Build live search and category filtering in real-time.\n",
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
    "description": "Core Web Vitals, image optimization, meta tags, and structured data.",
    "orderIndex": 9,
    "id": "web-mod-9",
    "title": "Module 9: Web Performance & SEO Optimization",
    "courseId": "web-development-fundamentals",
    "order": 9,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 9: Web Performance & SEO Optimization",
        "title": "Module 9 - Complete Notes",
        "type": "Reading",
        "content": "# Module 9: Web Performance & SEO Optimization\n## Overview\nHigh-performance websites achieve fast page loads, high Core Web Vitals scores, and superior search engine discoverability.\n\n## Learning Objectives\n- Optimize Core Web Vitals: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift).\n- Lazy-load images with `<img loading=\"lazy\">` and use modern WebP/AVIF formats.\n- Implement Open Graph and JSON-LD Structured Data for rich search snippets.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "web-unit-9-notes",
        "moduleId": "web-mod-9",
        "courseId": "web-development-fundamentals",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 9: Web Performance & SEO Optimization\n## Overview\nHigh-performance websites achieve fast page loads, high Core Web Vitals scores, and superior search engine discoverability.\n\n## Learning Objectives\n- Optimize Core Web Vitals: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift).\n- Lazy-load images with `<img loading=\"lazy\">` and use modern WebP/AVIF formats.\n- Implement Open Graph and JSON-LD Structured Data for rich search snippets."
      }
    ],
    "topics": [
      {
        "id": "web-mod-9-topic-1",
        "title": "Module 9: Web Performance & SEO Optimization Units",
        "description": "Core Web Vitals, image optimization, meta tags, and structured data.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "web-unit-9-notes",
            "title": "Module 9 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 9: Web Performance & SEO Optimization\n\n## Overview\nHigh-performance websites achieve fast page loads, high Core Web Vitals scores, and superior search engine discoverability.\n\n## Learning Objectives\n- Optimize Core Web Vitals: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift).\n- Lazy-load images with `<img loading=\"lazy\">` and use modern WebP/AVIF formats.\n- Implement Open Graph and JSON-LD Structured Data for rich search snippets.\n",
            "content": "# Module 9: Web Performance & SEO Optimization\n\n## Overview\nHigh-performance websites achieve fast page loads, high Core Web Vitals scores, and superior search engine discoverability.\n\n## Learning Objectives\n- Optimize Core Web Vitals: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift).\n- Lazy-load images with `<img loading=\"lazy\">` and use modern WebP/AVIF formats.\n- Implement Open Graph and JSON-LD Structured Data for rich search snippets.\n",
            "conceptTheory": "# Module 9: Web Performance & SEO Optimization\n\n## Overview\nHigh-performance websites achieve fast page loads, high Core Web Vitals scores, and superior search engine discoverability.\n\n## Learning Objectives\n- Optimize Core Web Vitals: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift).\n- Lazy-load images with `<img loading=\"lazy\">` and use modern WebP/AVIF formats.\n- Implement Open Graph and JSON-LD Structured Data for rich search snippets.\n",
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
    "description": "Deploying with GitHub, Netlify, Vercel, DNS records, and developer portfolios.",
    "orderIndex": 10,
    "id": "web-mod-10",
    "title": "Module 10: Hosting, Deployment & Portfolio Building",
    "courseId": "web-development-fundamentals",
    "order": 10,
    "updatedAt": "2026-09-01T06:50:37.901Z",
    "revision": 1,
    "lessons": [
      {
        "estimatedReadMinutes": 2,
        "moduleTitle": "Module 10: Hosting, Deployment & Portfolio Building",
        "title": "Module 10 - Complete Notes",
        "type": "Reading",
        "content": "# Module 10: Hosting, Deployment & Portfolio Building\n## Overview\nDeploy web applications to modern cloud hosting platforms and showcase projects in an online developer portfolio.\n\n## Learning Objectives\n- Deploy static sites with continuous integration via GitHub Pages, Vercel, Netlify, and Firebase Hosting.\n- Set up custom domains, DNS records, and SSL/TLS certificates.\n- Build a polished developer portfolio highlighting live projects and source code repositories.",
        "duration": "45 mins",
        "createdAt": "2026-09-01T06:50:37.901Z",
        "orderIndex": 1,
        "id": "web-unit-10-notes",
        "moduleId": "web-mod-10",
        "courseId": "web-development-fundamentals",
        "order": 1,
        "updatedAt": "2026-09-01T06:50:37.901Z",
        "revision": 1,
        "readingContent": "# Module 10: Hosting, Deployment & Portfolio Building\n## Overview\nDeploy web applications to modern cloud hosting platforms and showcase projects in an online developer portfolio.\n\n## Learning Objectives\n- Deploy static sites with continuous integration via GitHub Pages, Vercel, Netlify, and Firebase Hosting.\n- Set up custom domains, DNS records, and SSL/TLS certificates.\n- Build a polished developer portfolio highlighting live projects and source code repositories."
      }
    ],
    "topics": [
      {
        "id": "web-mod-10-topic-1",
        "title": "Module 10: Hosting, Deployment & Portfolio Building Units",
        "description": "Deploying with GitHub, Netlify, Vercel, DNS records, and developer portfolios.",
        "estimatedDuration": "3 Hours",
        "learningUnits": [
          {
            "id": "web-unit-10-notes",
            "title": "Module 10 - Complete Notes",
            "description": "",
            "duration": "45 mins",
            "type": "Reading",
            "readingContent": "# Module 10: Hosting, Deployment & Portfolio Building\n\n## Overview\nDeploy web applications to modern cloud hosting platforms and showcase projects in an online developer portfolio.\n\n## Learning Objectives\n- Deploy static sites with continuous integration via GitHub Pages, Vercel, Netlify, and Firebase Hosting.\n- Set up custom domains, DNS records, and SSL/TLS certificates.\n- Build a polished developer portfolio highlighting live projects and source code repositories.\n",
            "content": "# Module 10: Hosting, Deployment & Portfolio Building\n\n## Overview\nDeploy web applications to modern cloud hosting platforms and showcase projects in an online developer portfolio.\n\n## Learning Objectives\n- Deploy static sites with continuous integration via GitHub Pages, Vercel, Netlify, and Firebase Hosting.\n- Set up custom domains, DNS records, and SSL/TLS certificates.\n- Build a polished developer portfolio highlighting live projects and source code repositories.\n",
            "conceptTheory": "# Module 10: Hosting, Deployment & Portfolio Building\n\n## Overview\nDeploy web applications to modern cloud hosting platforms and showcase projects in an online developer portfolio.\n\n## Learning Objectives\n- Deploy static sites with continuous integration via GitHub Pages, Vercel, Netlify, and Firebase Hosting.\n- Set up custom domains, DNS records, and SSL/TLS certificates.\n- Build a polished developer portfolio highlighting live projects and source code repositories.\n",
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
