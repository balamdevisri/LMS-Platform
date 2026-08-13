import type { ModuleItem } from '@/contexts/CourseContext';

export const reactCourseModules: ModuleItem[] = [
  {
    id: 'react-mod-1',
    title: 'Module 1: Introduction to React JS',
    description: "Module 1: Introduction to React JS Learning Objectives After completing this module, you will be able to:",
    duration: '195 mins',
    topics: [
      {
        id: 'react-topic-1-1',
        title: 'Module 1: Introduction to React JS Lessons',
        description: 'Lessons covering Module 1: Introduction to React JS',
        estimatedDuration: '195 mins',
        learningUnits: [
          {
            id: 'react-unit-1-1',
            title: '1.1 Introduction to React JS',
            description: "Modern websites need to be fast, interactive, and user-friendly. Traditional JavaScript can build websites, but as appli...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Modern websites need to be fast, interactive, and user-friendly. Traditional JavaScript can \nbuild\n \nwebsites,\n \nbut\n \nas\n \napplications\n \nbecome\n \nlarger,\n \nmanaging\n \nthe\n \ncode\n \nbecomes\n \ndifficult.\n \nTo solve this problem, React JS was introduced. \nReact helps developers build fast, reusable, and interactive user interfaces (UI) . \nToday, React is one of the most popular JavaScript libraries used in web development. \n \n### React Development Framework\n\n![React JS Logo](/assets/images/react_logo_frontend.png)\n\nWhat is React JS? \nReact JS is a JavaScript library used to build user interfaces (UI), especially for Single \nPage\n \nApplications\n \n(SPAs)\n.\n \n--- PAGE 5 ---\nIt was developed by Meta (formerly Facebook) and first released in 2013 . \nSimple Definition \nReact is a JavaScript library used to build fast, interactive, and reusable user \ninterfaces.\n \n \nReal-Time Example \nThink about Instagram . \nWhen you like a photo: \n\u25cf Only the Like button changes. \u25cf The whole page does not reload. \nReact updates only the changed part of the page, making the application faster.",
            resources: [
              {
                id: 'res-react-unit-1-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-2',
            title: '1.2 History of React JS',
            description: "React was created by Jordan Walke , a software engineer at Facebook. Facebook needed a better way to build large web app...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React was created by Jordan Walke , a software engineer at Facebook. \nFacebook needed a better way to build large web applications with dynamic user interfaces. \nReact was first used internally at Facebook and later released as an open-source project in \n2013\n.\n \nToday, React is maintained by Meta and a large community of developers.",
            resources: [
              {
                id: 'res-react-unit-1-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-3',
            title: '1.3 Why React JS?',
            description: "Before React, developers used plain HTML, CSS, and JavaScript. As applications became bigger: \u25cf Code became difficult to...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Before React, developers used plain HTML, CSS, and JavaScript. \nAs applications became bigger: \n\u25cf Code became difficult to manage. \u25cf Updating the UI became slow. \u25cf Reusing code was difficult. \u25cf Large applications became complex. \n--- PAGE 6 ---\nReact solves these problems using reusable components and efficient rendering. \n \nProblems Before React \n\u25cf Full page reloads \u25cf Duplicate code \u25cf Poor performance \u25cf Difficult maintenance \u25cf Complex DOM manipulation \n \nWhy Developers Choose React \n\u25cf Fast performance \u25cf Reusable components \u25cf Easy to learn \u25cf Large community \u25cf Strong ecosystem \u25cf Used by top companies",
            resources: [
              {
                id: 'res-react-unit-1-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-4',
            title: '1.4 Features of React JS',
            description: "1. Component-Based Architecture React applications are built using Components . A component is a reusable piece of UI. E...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "1. Component-Based Architecture \nReact applications are built using Components . \nA component is a reusable piece of UI. \nExample: \nA shopping website has: \n\u25cf Header \u25cf Navbar \u25cf Product Card \u25cf Footer \nEach can be created as a separate component. \nAdvantages \n--- PAGE 7 ---\n\u25cf Reusable code \u25cf Easy maintenance \u25cf Better organization \n \n### React Virtual DOM Diffing and Rendering Process\n\n![React Virtual DOM Comparison](/assets/images/react_virtual_dom.png)\n\n2. Virtual DOM \nReact uses a Virtual DOM instead of directly updating the browser's DOM. \nHow It Works \n1. User performs an action. 2. React updates the Virtual DOM. 3. React compares the old and new Virtual DOM. 4. Only the changed part is updated in the Real DOM. \n \nDiagram User Action \u2502 \u25bc Virtual DOM \u2502 Compare Changes \u2502 \u25bc Real DOM Updated \nBenefits \n\u25cf Faster rendering \u25cf Better performance \u25cf Efficient updates \n \n3. Declarative Programming \nIn React, developers describe what the UI should look like , and React handles updating \nthe\n \nscreen.\n \nThis makes code simpler and easier to understand. \n \n--- PAGE 8 ---\n4. Reusable Components \nOnce a component is created, it can be used multiple times. \nExample: \nA Button Component can be used in: \n\u25cf Login Page \u25cf Signup Page \u25cf Dashboard \u25cf Settings Page \n \n5. One-Way Data Flow \nData in React flows from Parent Component to Child Component . \nThis makes applications easier to debug and maintain.",
            resources: [
              {
                id: 'res-react-unit-1-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-5',
            title: '1.5 Advantages of React JS',
            description: "\u25cf Fast rendering using Virtual DOM. \u25cf Reusable components reduce development time. \u25cf Easy to learn for JavaScript develo...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Fast rendering using Virtual DOM. \u25cf Reusable components reduce development time. \u25cf Easy to learn for JavaScript developers. \u25cf Large developer community. \u25cf SEO-friendly with server-side rendering support. \u25cf Strong ecosystem with many libraries. \u25cf Easy integration with APIs.",
            resources: [
              {
                id: 'res-react-unit-1-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-6',
            title: '1.6 Disadvantages of React JS',
            description: "\u25cf React only handles the UI. \u25cf Additional libraries are needed for routing and state management. \u25cf Beginners may find JS...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf React only handles the UI. \u25cf Additional libraries are needed for routing and state management. \u25cf Beginners may find JSX confusing initially. \u25cf Frequent updates require developers to keep learning. \n \n--- PAGE 9 ---",
            resources: [
              {
                id: 'res-react-unit-1-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-7',
            title: '1.7 React JS vs Traditional JavaScript',
            description: "Traditional JavaScript React JS Updates the entire page Updates only changed parts More manual DOM manipulation Virtual ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Traditional JavaScript React JS \nUpdates the entire page Updates only changed parts \nMore manual DOM manipulation Virtual DOM handles updates \nHarder to maintain large apps Easier with reusable components \nLess reusable Highly reusable \nSlower for complex UIs Better performance",
            resources: [
              {
                id: 'res-react-unit-1-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-8',
            title: '1.8 Applications Built with React',
            description: "Many popular companies use React. Examples: \u25cf Facebook \u25cf Instagram \u25cf Netflix \u25cf WhatsApp Web \u25cf Airbnb \u25cf Dropbox These com...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Many popular companies use React. \nExamples: \n\u25cf Facebook \u25cf Instagram \u25cf Netflix \u25cf WhatsApp Web \u25cf Airbnb \u25cf Dropbox \nThese companies use React because it helps build fast and scalable user interfaces.",
            resources: [
              {
                id: 'res-react-unit-1-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-9',
            title: '1.9 React Ecosystem',
            description: "React works with many supporting tools. React JS \u2502 \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u2502 \u2502 \u2502 React Router Redux Axios \u2502 \u2502 \u2502 Navi...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React works with many supporting tools. \n React JS \u2502 \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u2502 \u2502 \u2502 React Router Redux Axios \u2502 \u2502 \u2502 Navigation State Mgmt API Calls \n--- PAGE 10 ---",
            resources: [
              {
                id: 'res-react-unit-1-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-10',
            title: '1.10 Best Practices',
            description: "\u25cf Build small and reusable components. \u25cf Keep components simple. \u25cf Follow proper naming conventions. \u25cf Write clean and r...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Build small and reusable components. \u25cf Keep components simple. \u25cf Follow proper naming conventions. \u25cf Write clean and readable code. \u25cf Use the latest stable React version. \u25cf Organize project folders properly.",
            resources: [
              {
                id: 'res-react-unit-1-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-11',
            title: '1.11 Common Mistakes',
            description: "\u274c Writing all code in one component. \u274c Repeating the same code instead of creating reusable components. \u274c Directly modif...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Writing all code in one component. \n\u274c Repeating the same code instead of creating reusable components. \n\u274c Directly modifying state. \n\u274c Ignoring component structure. \n\u274c Using unnecessary re-renders. \n \nReal-Time Scenario \nA company wants to build an Online Food Delivery App . \nInstead of creating separate pages manually, they build reusable React components: \n\u25cf Header \u25cf Navigation Bar \u25cf Restaurant Card \u25cf Menu \u25cf Cart \u25cf Footer \nWhen a customer adds an item to the cart, only the Cart component updates, while the rest \nof\n \nthe\n \npage\n \nremains\n \nunchanged.\n \nThis\n \nprovides\n \na\n \nfast\n \nand\n \nsmooth\n \nuser\n \nexperience.",
            resources: [
              {
                id: 'res-react-unit-1-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-12',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes --- PAGE 11 --- 1. ### React Development Framework\n\n![React JS Logo](/assets/images/react_logo_frontend.png)\n\nWhat is React JS? Answer: React JS is a JavaScript library used...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n--- PAGE 11 ---\n1. ### React Development Framework\n\n![React JS Logo](/assets/images/react_logo_frontend.png)\n\nWhat is React JS? \nAnswer: \n \nReact\n \nJS\n \nis\n \na\n \nJavaScript\n \nlibrary\n \nused\n \nto\n \nbuild\n \nfast,\n \ninteractive,\n \nand\n \nreusable\n \nuser\n \ninterfaces.\n \n \n2. Who developed React? \nAnswer: \n \nReact\n \nwas\n \ndeveloped\n \nby\n \nMeta\n \n(Facebook)\n \nand\n \ncreated\n \nby\n \nJordan\n \nWalke\n.\n \n \n3. What is the Virtual DOM? \nAnswer: \n \nThe\n \nVirtual\n \nDOM\n \nis\n \na\n \nlightweight\n \ncopy\n \nof\n \nthe\n \nReal\n \nDOM.\n \nReact\n \ncompares\n \nchanges\n \nin\n \nthe\n \nVirtual\n \nDOM\n \nand\n \nupdates\n \nonly\n \nthe\n \nrequired\n \nparts\n \nof\n \nthe\n \nReal\n \nDOM,\n \nimproving\n \nperformance.\n \n \n4. What is a Component? \nAnswer: \n \nA\n \nComponent\n \nis\n \na\n \nreusable\n \nand\n \nindependent\n \npiece\n \nof\n \nUI\n \nthat\n \ncan\n \nbe\n \nused\n \nmultiple\n \ntimes\n \nin\n \na\n \nReact\n \napplication.\n \n \n5. Why is React faster than traditional JavaScript? \nAnswer: \n \nReact\n \nis\n \nfaster\n \nbecause\n \nit\n \nuses\n \nthe\n \nVirtual\n \nDOM\n \nto\n \nupdate\n \nonly\n \nthe\n \nchanged\n \nparts\n \nof\n \nthe\n \npage\n \ninstead\n \nof\n \nreloading\n \nthe\n \nentire\n \npage.",
            resources: [
              {
                id: 'res-react-unit-1-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-1-13',
            title: 'Practical Exercise (Common Mistakes)',
            description: "Practical Exercise - Common Mistakes Task 1 Visit the official React website and explore the homepage. Task 2 List five ...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Exercise - Common Mistakes\n\nTask 1 \nVisit the official React website and explore the homepage. \nTask 2 \nList five companies that use React. \n--- PAGE 12 ---\nTask 3 \nWrite three advantages of React. \nTask 4 \nExplain the difference between the Real DOM and Virtual DOM in your own words. \nTask 5 \nDraw a simple diagram showing: \nUser Action \u2502 Virtual DOM \u2502 Real DOM \u2502 Updated Web Page",
            readingContent: "### Practical Exercise - Common Mistakes\n\nTask 1 \nVisit the official React website and explore the homepage. \nTask 2 \nList five companies that use React. \n--- PAGE 12 ---\nTask 3 \nWrite three advantages of React. \nTask 4 \nExplain the difference between the Real DOM and Virtual DOM in your own words. \nTask 5 \nDraw a simple diagram showing: \nUser Action \u2502 Virtual DOM \u2502 Real DOM \u2502 Updated Web Page",
            resources: [
              {
                id: 'res-react-unit-1-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-2',
    title: 'Module 2: Setting Up the React',
    description: "Module 2: Setting Up the React Development Environment",
    duration: '240 mins',
    topics: [
      {
        id: 'react-topic-2-1',
        title: 'Module 2: Setting Up the React Lessons',
        description: 'Lessons covering Module 2: Setting Up the React',
        estimatedDuration: '240 mins',
        learningUnits: [
          {
            id: 'react-unit-2-1',
            title: '2.1 Introduction',
            description: "Before building React applications, we need to set up the development environment. A React application cannot run direct...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Before building React applications, we need to set up the development environment. \nA React application cannot run directly in the browser because it requires JavaScript tools to \nbuild\n \nand\n \nmanage\n \nthe\n \nproject.\n \n--- PAGE 13 ---\nThe main tools required are: \n\u25cf Node.js \u25cf npm (Node Package Manager) \u25cf Visual Studio Code \u25cf Vite (Build Tool) \n \nReal-Time Example \nImagine you want to build a house. \nBefore construction, you need: \n\u25cf Bricks \u25cf Cement \u25cf Sand \u25cf Tools \nSimilarly, before developing React applications, you need to install the required software.",
            resources: [
              {
                id: 'res-react-unit-2-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-2',
            title: '2.2 Software Requirements',
            description: "To develop React applications, install the following software. Software Purpose Node.js JavaScript Runtime npm Package M...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "To develop React applications, install the following software. \nSoftware Purpose \nNode.js JavaScript Runtime \nnpm Package Manager \nVS Code Code Editor \nVite React Project Creator \nChrome Browser Run and Test Applications",
            resources: [
              {
                id: 'res-react-unit-2-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-3',
            title: '2.3 What is Node.js?',
            description: "Node.js is a JavaScript runtime environment that allows JavaScript to run outside the browser. --- PAGE 14 --- Without N...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Node.js is a JavaScript runtime environment that allows JavaScript to run outside the \nbrowser.\n \n--- PAGE 14 ---\nWithout Node.js, React applications cannot be created or executed. \n \nWhy Node.js is Required? \nNode.js provides: \n\u25cf JavaScript Runtime \u25cf npm Package Manager \u25cf Project Build Support \u25cf Development Server \n \nFeatures of Node.js \n\u25cf Fast execution \u25cf Cross-platform \u25cf Lightweight \u25cf Open Source \u25cf Large Community",
            resources: [
              {
                id: 'res-react-unit-2-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-4',
            title: '2.4 What is npm?',
            description: "npm stands for Node Package Manager . It helps developers install external libraries and packages. Examples: \u25cf React \u25cf A...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "npm stands for Node Package Manager . \nIt helps developers install external libraries and packages. \nExamples: \n\u25cf React \u25cf Axios \u25cf Bootstrap \u25cf Tailwind CSS \n \nExample \nInstall React package: \nnpm install react \n--- PAGE 15 ---\nInstall Axios: \nnpm install axios",
            resources: [
              {
                id: 'res-react-unit-2-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-5',
            title: '2.5 Installing Node.js',
            description: "Step 1 Visit the official Node.js website. Download the LTS (Long-Term Support) version. Step 2 Run the installer. Click...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Step 1 \nVisit the official Node.js website. \nDownload the LTS (Long-Term Support) version. \nStep 2 \nRun the installer. \nClick: \nNext \u2192 Next \u2192 Install \u2192 Finish \nStep 3 \nRestart the computer if required.",
            resources: [
              {
                id: 'res-react-unit-2-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-6',
            title: '2.6 Verify Installation',
            description: "Open Terminal or Command Prompt. Check Node.js version. node -v Example Output v22.5.0 Check npm version. npm -v Example...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Open Terminal or Command Prompt. \nCheck Node.js version. \nnode -v \nExample Output \nv22.5.0 \nCheck npm version. \nnpm -v \nExample \n10.8.2 \n--- PAGE 16 ---\nIf both commands show version numbers, the installation is successful.",
            resources: [
              {
                id: 'res-react-unit-2-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-7',
            title: '2.7 Installing Visual Studio Code',
            description: "Visual Studio Code (VS Code) is one of the most popular editors for React development. Why VS Code? \u25cf Free \u25cf Lightweight...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Visual Studio Code (VS Code) is one of the most popular editors for React development. \nWhy VS Code? \n\u25cf Free \u25cf Lightweight \u25cf Fast \u25cf Supports Extensions \u25cf Excellent React Support \n \nRecommended Extensions \n\u25cf ES7+ React Snippets \u25cf Prettier \u25cf ESLint \u25cf Auto Rename Tag \u25cf Auto Close Tag \u25cf Live Server (optional)",
            resources: [
              {
                id: 'res-react-unit-2-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-8',
            title: '2.8 What is Vite?',
            description: "Vite is a modern build tool used to create React applications. It is faster than Create React App because it starts the ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Vite is a modern build tool used to create React applications. \nIt is faster than Create React App because it starts the development server almost instantly. \n \nAdvantages of Vite \n\u25cf Faster startup \u25cf Lightweight \u25cf Hot Module Replacement (HMR) \u25cf Easy configuration \u25cf Better performance \n--- PAGE 17 ---",
            resources: [
              {
                id: 'res-react-unit-2-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-9',
            title: '2.9 Creating Your First React Project',
            description: "Open Terminal. Run: npm create vite@latest Enter: Project Name : react-app Select: Framework : React Select: Variant : J...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Open Terminal. \nRun: \nnpm create vite@latest \nEnter: \nProject Name : react-app \nSelect: \nFramework : React \nSelect: \nVariant : JavaScript \nGo inside the project folder. \ncd react-app \nInstall dependencies. \nnpm install \nRun the application. \nnpm run dev \nExample Output \nLocal: http://localhost:5173/ \nOpen this URL in your browser. \nYour first React application will appear.",
            resources: [
              {
                id: 'res-react-unit-2-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-10',
            title: '2.10 React Project Folder Structure',
            description: "react-app/ \u2502 --- PAGE 18 --- \u251c\u2500\u2500 node_modules/ \u251c\u2500\u2500 public/ \u251c\u2500\u2500 src/ \u2502 \u251c\u2500\u2500 App.jsx \u2502 \u251c\u2500\u2500 main.jsx \u2502 \u251c\u2500\u2500 assets/ \u2502 \u251c\u2500\u2500 pac...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "react-app/ \u2502 \n--- PAGE 18 ---\n\u251c\u2500\u2500 node_modules/ \u251c\u2500\u2500 public/ \u251c\u2500\u2500 src/ \u2502 \u251c\u2500\u2500 App.jsx \u2502 \u251c\u2500\u2500 main.jsx \u2502 \u251c\u2500\u2500 assets/ \u2502 \u251c\u2500\u2500 package.json \u251c\u2500\u2500 package-lock.json \u251c\u2500\u2500 vite.config.js \u2514\u2500\u2500 index.html",
            resources: [
              {
                id: 'res-react-unit-2-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-11',
            title: '2.11 Important Files',
            description: "src/ Contains the application's source code. App.jsx Main React component where most UI is developed. main.jsx Entry poi...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "src/ \nContains the application's source code. \n \nApp.jsx \nMain React component where most UI is developed. \n \nmain.jsx \nEntry point of the React application. \nIt renders the App component. \n \npublic/ \nStores static files. \nExamples: \n\u25cf Images \u25cf Icons \u25cf PDFs \n--- PAGE 19 ---\n \npackage.json \nContains: \n\u25cf Project name \u25cf Dependencies \u25cf Scripts \u25cf Version information \n \nnode_modules/ \nStores installed npm packages. \nDevelopers should not edit this folder manually.",
            resources: [
              {
                id: 'res-react-unit-2-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-12',
            title: '2.12 Running the React Application',
            description: "Start the development server. npm run dev Stop the server. Press: CTRL + C Restart: npm run dev",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Start the development server. \nnpm run dev \nStop the server. \nPress: \nCTRL + C \nRestart: \nnpm run dev",
            resources: [
              {
                id: 'res-react-unit-2-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-13',
            title: '2.13 Common Errors',
            description: "Error 'node' is not recognized Reason --- PAGE 20 --- Node.js is not installed or not added to the system PATH. Solution...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Error 'node' is not recognized \nReason \n--- PAGE 20 ---\nNode.js is not installed or not added to the system PATH. \nSolution \nReinstall Node.js and restart the computer. \n \nError npm command not found \nReason \nnpm installation failed. \nSolution \nReinstall Node.js. \n \nError Module not found \nReason \nDependencies are missing. \nSolution \nRun: \nnpm install",
            resources: [
              {
                id: 'res-react-unit-2-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-14',
            title: '2.14 Best Practices',
            description: "\u25cf Install the LTS version of Node.js. \u25cf Use VS Code for development. \u25cf Keep npm packages updated. \u25cf Use meaningful proje...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Install the LTS version of Node.js. \u25cf Use VS Code for development. \u25cf Keep npm packages updated. \u25cf Use meaningful project names. \u25cf Do not modify the node_modules folder. \u25cf Organize project files properly. \n \n--- PAGE 21 ---\nReal-Time Scenario \nA software company wants to build an E-Commerce Website . \nThe development team: \n1. Installs Node.js. 2. Installs VS Code. 3. Creates a React project using Vite. 4. Installs required packages. 5. Starts the development server. 6. Begins building the website. \nThis setup allows the team to develop, test, and update the application efficiently.",
            resources: [
              {
                id: 'res-react-unit-2-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-15',
            title: 'Interview Questions (Best Practices)',
            description: "Interview Questions - Best Practices 1. What is Node.js? Answer: Node.js is a JavaScript runtime environment that allows...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Best Practices\n\n1. What is Node.js? \nAnswer: \n \nNode.js\n \nis\n \na\n \nJavaScript\n \nruntime\n \nenvironment\n \nthat\n \nallows\n \nJavaScript\n \ncode\n \nto\n \nrun\n \noutside\n \nthe\n \nbrowser.\n \n \n2. What is npm? \nAnswer: \n \nnpm\n \n(Node\n \nPackage\n \nManager)\n \nis\n \nused\n \nto\n \ninstall\n \nand\n \nmanage\n \nJavaScript\n \nlibraries\n \nand\n \npackages.\n \n \n3. Why is Vite preferred over Create React App? \nAnswer: \n \nVite\n \nprovides\n \nfaster\n \nstartup,\n \nbetter\n \nperformance,\n \nand\n \nHot\n \nModule\n \nReplacement\n \n(HMR),\n \nmaking\n \ndevelopment\n \nquicker.\n \n \n4. Which command creates a React project using Vite? npm create vite@latest \n--- PAGE 22 ---\n5. Which command starts the React development server? npm run dev",
            resources: [
              {
                id: 'res-react-unit-2-15-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-2-16',
            title: 'Practical Exercise (Best Practices)',
            description: "Practical Exercise - Best Practices Task 1 Install Node.js (LTS version). Task 2 Verify the installation using: node -v ...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Exercise - Best Practices\n\nTask 1 \nInstall Node.js (LTS version). \nTask 2 \nVerify the installation using: \nnode -v npm -v \nTask 3 \nInstall Visual Studio Code. \nTask 4 \nCreate a React project using Vite. \nTask 5 \nRun the application using: \nnpm run dev \nTask 6 \nOpen the project in VS Code and identify: \n\u25cf src \u25cf App.jsx \u25cf main.jsx \u25cf package.json",
            readingContent: "### Practical Exercise - Best Practices\n\nTask 1 \nInstall Node.js (LTS version). \nTask 2 \nVerify the installation using: \nnode -v npm -v \nTask 3 \nInstall Visual Studio Code. \nTask 4 \nCreate a React project using Vite. \nTask 5 \nRun the application using: \nnpm run dev \nTask 6 \nOpen the project in VS Code and identify: \n\u25cf src \u25cf App.jsx \u25cf main.jsx \u25cf package.json",
            resources: [
              {
                id: 'res-react-unit-2-16-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-3',
    title: 'Module 3: JSX (JavaScript XML)',
    description: "Module 3: JSX (JavaScript XML) Learning Objectives --- PAGE 23 ---",
    duration: '210 mins',
    topics: [
      {
        id: 'react-topic-3-1',
        title: 'Module 3: JSX (JavaScript XML) Lessons',
        description: 'Lessons covering Module 3: JSX (JavaScript XML)',
        estimatedDuration: '210 mins',
        learningUnits: [
          {
            id: 'react-unit-3-1',
            title: '3.1 Introduction to JSX',
            description: "JSX (JavaScript XML) is one of the most important concepts in React. Although React is a JavaScript library, developers ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "JSX (JavaScript XML) is one of the most important concepts in React. \nAlthough React is a JavaScript library, developers rarely write React applications using only \nJavaScript.\n \nInstead,\n \nReact\n \nintroduces\n \nJSX,\n \na\n \nsyntax\n \nextension\n \nthat\n \nallows\n \ndevelopers\n \nto\n \nwrite\n \nHTML-like\n \ncode\n \ndirectly\n \ninside\n \nJavaScript.\n \nJSX simplifies UI development by making the code more readable, maintainable, and \nexpressive.\n \nIt enables developers to describe the user interface declaratively rather than writing multiple \nJavaScript\n \nfunction\n \ncalls.\n \n \nDefinition \nJSX (JavaScript XML) is a syntax extension for JavaScript that allows developers to write \nHTML-like\n \nmarkup\n \ninside\n \nJavaScript\n \ncode.\n \nJSX\n \nis\n \nnot\n \nunderstood\n \ndirectly\n \nby\n \nbrowsers;\n \ninstead,\n \nit\n \nis\n \ntransformed\n \ninto\n \nJavaScript\n \nusing\n \na\n \ncompiler\n \nsuch\n \nas\n \nBabel\n.\n \n \nWhy JSX Was Introduced \nBefore JSX, creating user interfaces required developers to manually call React APIs. \nExample without JSX: \nconst element = React.createElement( \"h1\", \n--- PAGE 24 ---\n { className: \"title\" }, \"Welcome to React\" ); \nThe same code using JSX: \nconst element = ( <h1 className=\"title\"> Welcome to React </h1> ); \nThe JSX version is: \n\u25cf More readable \u25cf Easier to understand \u25cf Easier to maintain \u25cf Similar to HTML",
            resources: [
              {
                id: 'res-react-unit-3-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-2',
            title: '3.2 History of JSX',
            description: "JSX was introduced by the React development team at Meta (Facebook) . Before React, developers manipulated the DOM manua...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "JSX was introduced by the React development team at Meta (Facebook) . \nBefore React, developers manipulated the DOM manually using JavaScript. \nLarge applications became difficult because developers had to repeatedly create HTML \nelements,\n \nupdate\n \nthe\n \nDOM,\n \nand\n \nmanage\n \nUI\n \nchanges\n \nmanually.\n \nReact introduced JSX to simplify UI development and allow developers to describe the \ninterface\n \nusing\n \ndeclarative\n \nsyntax.\n \nToday JSX is one of the most widely used syntaxes for frontend development.",
            resources: [
              {
                id: 'res-react-unit-3-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-3',
            title: '3.3 Why Do We Need JSX?',
            description: "Modern applications contain hundreds of UI elements. Examples: \u25cf Login Forms \u25cf Navigation Bars --- PAGE 25 --- \u25cf Product...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Modern applications contain hundreds of UI elements. \nExamples: \n\u25cf Login Forms \u25cf Navigation Bars \n--- PAGE 25 ---\n\u25cf Product Cards \u25cf Dashboards \u25cf Tables \u25cf Charts \nWriting these using only JavaScript becomes complicated. \nJSX allows developers to create these interfaces quickly with less code. \n \nProblems Without JSX \nWithout JSX: \n\u25cf Long JavaScript code \u25cf Difficult DOM manipulation \u25cf Less readability \u25cf Hard to debug \u25cf Difficult maintenance \nWith JSX: \n\u25cf Cleaner syntax \u25cf Better readability \u25cf Faster UI development \u25cf Easier maintenance \u25cf Better developer productivity",
            resources: [
              {
                id: 'res-react-unit-3-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-4',
            title: '3.4 How JSX Works',
            description: "Many beginners think browsers understand JSX. This is incorrect . Browsers only understand: \u25cf HTML \u25cf CSS \u25cf JavaScript JS...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Many beginners think browsers understand JSX. \nThis is incorrect . \nBrowsers only understand: \n\u25cf HTML \u25cf CSS \u25cf JavaScript \nJSX is neither HTML nor JavaScript. \nIt is first converted into JavaScript. \n \n--- PAGE 26 ---\nJSX Compilation Process JSX Code \u2502 \u25bc Babel Compiler \u2502 \u25bc React.createElement() \u2502 \u25bc React Element Object \u2502 \u25bc Virtual DOM \u2502 \u25bc Real DOM \u2502 \u25bc Browser \nStep-by-Step Process \nStep 1 \nDeveloper writes JSX. \n<h1>Hello React</h1> \n\u2193 \nStep 2 \nBabel converts JSX. \nReact.createElement( \"h1\", null, \"Hello React\" ); \n\u2193 \nStep 3 \nReact creates a React Element. \n--- PAGE 27 ---\n\u2193 \nStep 4 \nVirtual DOM is updated. \n\u2193 \nStep 5 \nReact compares changes. \n\u2193 \nStep 6 \nOnly changed elements are updated in the Real DOM.",
            resources: [
              {
                id: 'res-react-unit-3-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-5',
            title: '3.5 What is Babel?',
            description: "Babel is a JavaScript compiler. Its job is to convert modern JavaScript and JSX into browser-compatible JavaScript. With...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Babel is a JavaScript compiler. \nIts job is to convert modern JavaScript and JSX into browser-compatible JavaScript. \nWithout Babel: \n<h1>Hello</h1> \nwill generate an error because browsers cannot understand JSX. \n \nAdvantages of Babel \n\u25cf Converts JSX \u25cf Supports modern JavaScript \u25cf Browser compatibility \u25cf Optimized code generation",
            resources: [
              {
                id: 'res-react-unit-3-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-6',
            title: '3.6 React Elements',
            description: "When JSX is compiled, it creates React Elements . --- PAGE 28 --- A React Element is a JavaScript object describing what...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "When JSX is compiled, it creates React Elements . \n--- PAGE 28 ---\nA React Element is a JavaScript object describing what should appear on the screen. \nExample \nconst element = ( <h1>Hello</h1> ); \nAfter compilation \nconst element = React.createElement( \"h1\", null, \"Hello\" ); \nThis creates a React Element object.",
            resources: [
              {
                id: 'res-react-unit-3-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-7',
            title: '3.7 JSX Syntax',
            description: "Basic Example function App(){ return( <h1> Welcome to React </h1> ); } export default App; Output Welcome to React",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Basic Example \nfunction App(){ return( <h1> Welcome to React </h1> ); } export default App; \nOutput \nWelcome to React",
            resources: [
              {
                id: 'res-react-unit-3-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-8',
            title: '3.8 Rules of JSX',
            description: "--- PAGE 29 --- Rule 1 Return only one parent element. Correct return( <div> <h1>Hello</h1> <p>React</p> </div> ); Rule ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "--- PAGE 29 ---\nRule 1 \nReturn only one parent element. \nCorrect \nreturn( <div> <h1>Hello</h1> <p>React</p> </div> ); \nRule 2 \nEvery tag must be closed. \nCorrect \n<img src=\"logo.png\" /> \nRule 3 \nUse camelCase attributes. \nCorrect \nonClick tabIndex readOnly \nRule 4 \nUse className instead of class. \nWrong \nclass=\"box\" \n--- PAGE 30 ---\nCorrect \nclassName=\"box\" \nRule 5 \nUse htmlFor instead of for. \nWrong \n<label for=\"email\"> \nCorrect \n<label htmlFor=\"email\">",
            resources: [
              {
                id: 'res-react-unit-3-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-9',
            title: '3.9 JavaScript Expressions inside JSX',
            description: "JSX allows JavaScript expressions inside curly braces {}. Example const name=\"Prasanna\"; <h1> {name} </h1> Output Prasan...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "JSX allows JavaScript expressions inside curly braces {}. \nExample \nconst name=\"Prasanna\"; <h1> {name} </h1> \nOutput \nPrasanna \nExample \nconst a=20; const b=30; <h2> {a+b} </h2> \nOutput \n50 \n--- PAGE 31 ---\nFunctions \nfunction greet(){ return \"Good Morning\"; } <h2> {greet()} </h2> \nOutput \nGood Morning",
            resources: [
              {
                id: 'res-react-unit-3-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-10',
            title: '3.10 Dynamic Rendering',
            description: "One of the biggest advantages of JSX is dynamic rendering. Example const isLoggedIn=true; return( <h2> { isLoggedIn ? \"W...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "One of the biggest advantages of JSX is dynamic rendering. \nExample \nconst isLoggedIn=true; return( <h2> { isLoggedIn ? \"Welcome User\" : \"Please Login\" } </h2> ); \nThe UI changes automatically based on the condition. \n--- PAGE 32 ---",
            resources: [
              {
                id: 'res-react-unit-3-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-11',
            title: '3.11 Advantages of JSX',
            description: "\u25cf Easy to understand. \u25cf Looks similar to HTML. \u25cf Supports JavaScript expressions. \u25cf Improves code readability. \u25cf Makes U...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Easy to understand. \u25cf Looks similar to HTML. \u25cf Supports JavaScript expressions. \u25cf Improves code readability. \u25cf Makes UI development faster. \u25cf Reduces boilerplate code. \u25cf Encourages reusable components. \u25cf Easy debugging.",
            resources: [
              {
                id: 'res-react-unit-3-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-12',
            title: '3.12 Common Mistakes',
            description: "\u274c Using class instead of className \u274c Returning multiple parent elements \u274c Forgetting to close tags \u274c Writing JavaScript ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Using class instead of className \n\u274c Returning multiple parent elements \n\u274c Forgetting to close tags \n\u274c Writing JavaScript without {} \n\u274c Using inline logic excessively \n \nReal-Time Example \nConsider an E-Commerce Website . \nThe Product Card component is written using JSX. \n<ProductCard name=\"Laptop\" price={65000} stock={10} /> \n--- PAGE 33 ---\nInstead of manually creating product HTML multiple times, React reuses the same \ncomponent\n \nwith\n \ndifferent\n \ndata,\n \nreducing\n \ncode\n \nduplication\n \nand\n \nmaking\n \nthe\n \napplication\n \neasier\n \nto\n \nmaintain.",
            resources: [
              {
                id: 'res-react-unit-3-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-13',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes 1. What is JSX? Answer: JSX (JavaScript XML) is a syntax extension for JavaScript ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n1. What is JSX? \nAnswer: \n \nJSX\n \n(JavaScript\n \nXML)\n \nis\n \na\n \nsyntax\n \nextension\n \nfor\n \nJavaScript\n \nthat\n \nallows\n \ndevelopers\n \nto\n \nwrite\n \nHTML-like\n \ncode\n \ninside\n \nJavaScript.\n \nIt\n \nis\n \ncompiled\n \ninto\n React.createElement() calls \nbefore\n \nexecution.\n \n \n2. Does the browser understand JSX directly? \nAnswer: \n \nNo.\n \nBrowsers\n \ndo\n \nnot\n \nunderstand\n \nJSX.\n \nIt\n \nmust\n \nfirst\n \nbe\n \ncompiled\n \ninto\n \nJavaScript\n \nusing\n \nBabel.\n \n \n3. What is Babel? \nAnswer: \n \nBabel\n \nis\n \na\n \nJavaScript\n \ncompiler\n \nthat\n \nconverts\n \nJSX\n \nand\n \nmodern\n \nJavaScript\n \ninto\n \nbrowser-compatible\n \nJavaScript.\n \n \n4. Why is className used instead of class? \nAnswer: \n \nBecause\n class is a reserved keyword in JavaScript, React uses className to define \nCSS\n \nclasses.\n \n \n5. What is the role of React.createElement()? \nAnswer: \n \nIt\n \ncreates\n \nReact\n \nElement\n \nobjects\n \nthat\n \ndescribe\n \nthe\n \nUI.\n \nJSX\n \nis\n \ninternally\n \nconverted\n \ninto\n React.createElement() calls. \n--- PAGE 34 ---",
            resources: [
              {
                id: 'res-react-unit-3-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-3-14',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes Task 1 Create a JSX page displaying: \u25cf Name \u25cf College \u25cf Branch Task 2 Display the sum of...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a JSX page displaying: \n\u25cf Name \u25cf College \u25cf Branch \n \nTask 2 \nDisplay the sum of two numbers using JSX expressions. \n \nTask 3 \nCreate a login message using the ternary operator. \n \nTask 4 \nCreate a Product Card using JSX.",
            readingContent: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a JSX page displaying: \n\u25cf Name \u25cf College \u25cf Branch \n \nTask 2 \nDisplay the sum of two numbers using JSX expressions. \n \nTask 3 \nCreate a login message using the ternary operator. \n \nTask 4 \nCreate a Product Card using JSX.",
            resources: [
              {
                id: 'res-react-unit-3-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-4',
    title: 'Module 4: React Components',
    description: "Module 4: React Components Learning Objectives After completing this module, you will be able to:",
    duration: '225 mins',
    topics: [
      {
        id: 'react-topic-4-1',
        title: 'Module 4: React Components Lessons',
        description: 'Lessons covering Module 4: React Components',
        estimatedDuration: '225 mins',
        learningUnits: [
          {
            id: 'react-unit-4-1',
            title: '4.1 Introduction to React Components',
            description: "React applications are built using Components . A component is an independent, reusable piece of user interface (UI) tha...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React applications are built using Components . A component is an independent, reusable \npiece\n \nof\n \nuser\n \ninterface\n \n(UI)\n \nthat\n \nencapsulates\n \nits\n \nown\n \nstructure,\n \nlogic,\n \nand\n \nbehavior.\n \nInstead of creating an entire web page as one large file, React divides the application into \nsmall\n \nreusable\n \ncomponents.\n \nThis approach makes applications easier to develop, maintain, test, and scale. \n \nDefinition \nA React Component is a reusable JavaScript function or class that returns JSX and \nrepresents\n \na\n \npart\n \nof\n \nthe\n \nuser\n \ninterface.\n \n \nReal-Time Example \nConsider an E-Commerce Website . \nThe homepage contains: \n\u25cf Navigation Bar \u25cf Search Bar \u25cf Product Card \u25cf Shopping Cart \u25cf Footer \nInstead of writing all the code in one file, each section is created as a separate component. \nE-Commerce Website \u2502 \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u2502 \u2502 \u2502 Navbar Banner Products \u2502 \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u2502 \u2502 \u2502 Product1 Product2 Product3 \nEach Product Card is the same component but displays different product data. \n \n--- PAGE 36 ---",
            resources: [
              {
                id: 'res-react-unit-4-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-2',
            title: '4.2 Why Components?',
            description: "Large applications may contain thousands of lines of code. Without components: \u25cf Difficult to maintain \u25cf Code duplicatio...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Large applications may contain thousands of lines of code. \nWithout components: \n\u25cf Difficult to maintain \u25cf Code duplication \u25cf Hard debugging \u25cf Low reusability \nWith components: \n\u25cf Better organization \u25cf Code reusability \u25cf Easy maintenance \u25cf Faster development",
            resources: [
              {
                id: 'res-react-unit-4-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-3',
            title: '4.3 Characteristics of Components',
            description: "A React component should be: \u25cf Independent \u25cf Reusable \u25cf Modular \u25cf Easy to test \u25cf Easy to maintain Each component perform...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "A React component should be: \n\u25cf Independent \u25cf Reusable \u25cf Modular \u25cf Easy to test \u25cf Easy to maintain \nEach component performs one specific responsibility.",
            resources: [
              {
                id: 'res-react-unit-4-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-4',
            title: '4.4 Types of Components',
            description: "React mainly provides two types of components. 1. Functional Components Modern React applications use Functional Compone...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React mainly provides two types of components. \n1. Functional Components \nModern React applications use Functional Components. \nThey are JavaScript functions that return JSX. \nExample: \n--- PAGE 37 ---\nfunction Welcome(){ return( <h1>Welcome to React</h1> ); } export default Welcome; \nOutput \nWelcome to React \nAdvantages \n\u25cf Simple syntax \u25cf Easy to understand \u25cf Supports Hooks \u25cf Better performance \u25cf Less code \n \n2. Class Components \nBefore React Hooks were introduced, developers used Class Components. \nExample: \nimport React,{Component} from \"react\"; class Welcome extends Component{ render(){ return( <h1>Welcome to React</h1> ); } } \n--- PAGE 38 ---\n export default Welcome; \nAlthough Class Components are still supported, Functional Components are recommended \nfor\n \nmodern\n \ndevelopment.\n \n \nFunctional Components vs Class \nComponents\n \nFunctional Component Class Component \nJavaScript Function ES6 Class \nUses Hooks Uses Lifecycle Methods \nLess Code More Code \nEasier to Learn More Complex \nPreferred in Modern React \nMostly Legacy Projects",
            resources: [
              {
                id: 'res-react-unit-4-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-5',
            title: '4.5 Component Architecture',
            description: "React follows a hierarchical component architecture. App \u2502 \u251c\u2500\u2500 Navbar \u2502 \u251c\u2500\u2500 Sidebar \u2502 \u251c\u2500\u2500 Dashboard \u2502 \u2502 \u2502 \u251c\u2500\u2500 Card \u2502 \u251c\u2500\u2500...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React follows a hierarchical component architecture. \nApp \u2502 \u251c\u2500\u2500 Navbar \u2502 \u251c\u2500\u2500 Sidebar \u2502 \u251c\u2500\u2500 Dashboard \u2502 \u2502 \u2502 \u251c\u2500\u2500 Card \u2502 \u251c\u2500\u2500 Chart \u2502 \u2514\u2500\u2500 Table \u2502 \u2514\u2500\u2500 Footer \nThe App component acts as the root component. \n--- PAGE 39 ---",
            resources: [
              {
                id: 'res-react-unit-4-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-6',
            title: '4.6 Creating Your First Component',
            description: "Create a file named: Welcome.jsx Code: function Welcome(){ return( <h2>Hello Students</h2> ); } export default Welcome; ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Create a file named: \nWelcome.jsx \nCode: \nfunction Welcome(){ return( <h2>Hello Students</h2> ); } export default Welcome; \nImport inside App.jsx \nimport Welcome from \"./Welcome\"; function App(){ return( <div> <Welcome/> </div> ); } export default App; \nOutput \nHello Students \n--- PAGE 40 ---",
            resources: [
              {
                id: 'res-react-unit-4-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-7',
            title: '4.7 Component Naming Rules',
            description: "React components must: \u2705 Start with a Capital Letter Correct Navbar Footer Dashboard Wrong navbar footer dashboard React...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React components must: \n\u2705 Start with a Capital Letter \nCorrect \nNavbar Footer Dashboard \nWrong \nnavbar footer dashboard \nReact treats lowercase names as HTML tags.",
            resources: [
              {
                id: 'res-react-unit-4-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-8',
            title: '4.8 Reusable Components',
            description: "One of React's biggest strengths is component reusability. Example Instead of writing three Product Cards separately, Cr...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "One of React's biggest strengths is component reusability. \nExample \nInstead of writing three Product Cards separately, \nCreate one ProductCard component. \n<ProductCard/> <ProductCard/> <ProductCard/> \nThe same component is reused multiple times. \n \n--- PAGE 41 ---",
            resources: [
              {
                id: 'res-react-unit-4-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-9',
            title: '4.9 Component Composition',
            description: "Component Composition means combining multiple smaller components to create larger applications. Example App \u2502 \u251c\u2500\u2500 Heade...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Component Composition means combining multiple smaller components to create larger \napplications.\n \nExample \nApp \u2502 \u251c\u2500\u2500 Header \u251c\u2500\u2500 Navbar \u251c\u2500\u2500 Content \u251c\u2500\u2500 Footer \nInstead of one large component, many small components work together.",
            resources: [
              {
                id: 'res-react-unit-4-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-10',
            title: '4.10 Folder Structure',
            description: "Professional React projects organize components like this. src \u2502 \u251c\u2500\u2500 components \u2502 \u251c\u2500\u2500 Navbar.jsx \u2502 \u251c\u2500\u2500 Footer.jsx \u2502 \u251c\u2500\u2500 ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Professional React projects organize components like this. \nsrc \u2502 \u251c\u2500\u2500 components \u2502 \u251c\u2500\u2500 Navbar.jsx \u2502 \u251c\u2500\u2500 Footer.jsx \u2502 \u251c\u2500\u2500 Sidebar.jsx \u2502 \u251c\u2500\u2500 ProductCard.jsx \u2502 \u251c\u2500\u2500 pages \u2502 \u251c\u2500\u2500 assets \u2502 \n--- PAGE 42 ---\n\u251c\u2500\u2500 App.jsx \u2502 \u2514\u2500\u2500 main.jsx \nThis structure improves maintainability.",
            resources: [
              {
                id: 'res-react-unit-4-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-11',
            title: '4.11 Component Lifecycle (Overview)',
            description: "Every component goes through three phases. Component Created \u2193 Component Updated \u2193 Component Removed These phases are kn...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Every component goes through three phases. \nComponent Created \u2193 Component Updated \u2193 Component Removed \nThese phases are known as: \n\u25cf Mounting \u25cf Updating \u25cf Unmounting \nFunctional Components use Hooks like useEffect() to perform actions during these \nphases.",
            resources: [
              {
                id: 'res-react-unit-4-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-12',
            title: '4.12 Best Practices',
            description: "\u25cf Keep components small. \u25cf One component should perform one responsibility. \u25cf Use meaningful names. \u25cf Reuse components w...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Keep components small. \u25cf One component should perform one responsibility. \u25cf Use meaningful names. \u25cf Reuse components whenever possible. \u25cf Store components inside the components folder. \u25cf Avoid writing all code in App.jsx. \n \n--- PAGE 43 ---",
            resources: [
              {
                id: 'res-react-unit-4-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-13',
            title: '4.13 Common Mistakes',
            description: "\u274c Creating one huge component. \u274c Using lowercase component names. \u274c Duplicating component code. \u274c Mixing UI and business...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Creating one huge component. \n\u274c Using lowercase component names. \n\u274c Duplicating component code. \n\u274c Mixing UI and business logic. \n\u274c Forgetting to export components. \n \nReal-Time Scenario \nA company develops a Hospital Management System . \nInstead of creating the dashboard in one file, \nthey divide it into components. \nDashboard \u2502 \u251c\u2500\u2500 Doctor List \u251c\u2500\u2500 Patient List \u251c\u2500\u2500 Appointment List \u251c\u2500\u2500 Reports \u2514\u2500\u2500 Billing \nEach team works independently on different components. \nThis improves collaboration and development speed.",
            resources: [
              {
                id: 'res-react-unit-4-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-14',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes 1. What is a React Component? --- PAGE 44 --- Answer: A React Component is a reusa...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n1. What is a React Component? \n--- PAGE 44 ---\nAnswer: \nA React Component is a reusable and independent piece of UI that returns JSX and \nrepresents\n \na\n \npart\n \nof\n \nthe\n \nuser\n \ninterface.\n \n \n2. What are the two types of React Components? \nAnswer: \n\u25cf Functional Components \u25cf Class Components \n \n3. Why are Functional Components preferred? \nAnswer: \nBecause they are simpler, use Hooks, require less code, and provide better readability. \n \n4. What is Component Composition? \nAnswer: \nComponent Composition is the process of combining multiple smaller components to build a \nlarger\n \napplication.\n \n \n5. Why should components start with a capital letter? \nAnswer: \nReact treats lowercase names as HTML elements. Capitalized names are recognized as \ncustom\n \nReact\n \ncomponents.",
            resources: [
              {
                id: 'res-react-unit-4-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-4-15',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes Task 1 Create a Header Component . --- PAGE 45 --- Task 2 Create a Footer Component . Ta...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a Header Component . \n--- PAGE 45 ---\nTask 2 \nCreate a Footer Component . \nTask 3 \nImport both into App.jsx . \nTask 4 \nCreate a reusable StudentCard Component . \nTask 5 \nDisplay the StudentCard component three times.",
            readingContent: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a Header Component . \n--- PAGE 45 ---\nTask 2 \nCreate a Footer Component . \nTask 3 \nImport both into App.jsx . \nTask 4 \nCreate a reusable StudentCard Component . \nTask 5 \nDisplay the StudentCard component three times.",
            resources: [
              {
                id: 'res-react-unit-4-15-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-5',
    title: 'Module 5: React Props (Properties)',
    description: "Module 5: React Props (Properties) Learning Objectives After completing this module, you will be able to:",
    duration: '225 mins',
    topics: [
      {
        id: 'react-topic-5-1',
        title: 'Module 5: React Props (Properties) Lessons',
        description: 'Lessons covering Module 5: React Props (Properties)',
        estimatedDuration: '225 mins',
        learningUnits: [
          {
            id: 'react-unit-5-1',
            title: '5.1 Introduction to Props',
            description: "In React, applications are divided into multiple components. These components often need to exchange information with ea...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "In React, applications are divided into multiple components. These components often need \nto\n \nexchange\n \ninformation\n \nwith\n \neach\n \nother.\n \nProps (Properties) are used to pass data from one component to another. \nProps make components dynamic and reusable. Instead of hardcoding values inside a \ncomponent,\n \nwe\n \ncan\n \npass\n \ndifferent\n \nvalues\n \nwhenever\n \nthe\n \ncomponent\n \nis\n \nused.\n \n \n--- PAGE 46 ---\nDefinition \nProps are read-only inputs passed from a parent component to a child component. They \nallow\n \ncomponents\n \nto\n \nreceive\n \ndynamic\n \ndata\n \nand\n \nrender\n \ndifferent\n \noutputs\n \nbased\n \non\n \nthe\n \nvalues\n \nreceived.\n \n \nReal-Time Example \nConsider an E-Commerce website. \nInstead of creating separate Product Cards for each product: \n\u25cf Laptop \u25cf Mobile \u25cf Headphones \nWe create one ProductCard component and pass different product details using Props. \nApp Component \u2502 \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510 \u2502 \u2502 \u25bc \u25bc ProductCard ProductCard (Name: Laptop) (Name: Mobile) \nThis avoids code duplication and improves maintainability.",
            resources: [
              {
                id: 'res-react-unit-5-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-2',
            title: '5.2 Why Do We Need Props?',
            description: "Without Props: \u25cf Duplicate code \u25cf Hardcoded values \u25cf Poor reusability \u25cf Difficult maintenance With Props: \u25cf Dynamic UI \u25cf...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Without Props: \n\u25cf Duplicate code \u25cf Hardcoded values \u25cf Poor reusability \u25cf Difficult maintenance \nWith Props: \n\u25cf Dynamic UI \u25cf Reusable Components \u25cf Better code organization \u25cf Easier maintenance \n--- PAGE 47 ---",
            resources: [
              {
                id: 'res-react-unit-5-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-3',
            title: '5.3 Creating Props',
            description: "Parent Component import Student from \"./Student\"; function App() { return ( <div> <Student name=\"Prasanna\"/> </div> ); }...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Parent Component import Student from \"./Student\"; function App() { return ( <div> <Student name=\"Prasanna\"/> </div> ); } export default App; \nChild Component function Student(props){ return( <h2> Welcome {props.name} </h2> ); } export default Student; \nOutput Welcome Prasanna \n--- PAGE 48 ---",
            resources: [
              {
                id: 'res-react-unit-5-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-4',
            title: '5.4 Passing Multiple Props',
            description: "React allows multiple values to be passed. Parent Component <Student name=\"Prasanna\" branch=\"CSE\" college=\"ABC Engineeri...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React allows multiple values to be passed. \nParent Component <Student name=\"Prasanna\" branch=\"CSE\" college=\"ABC Engineering College\" /> \nChild Component function Student(props){ return( <div> <h2>{props.name}</h2> <p>{props.branch}</p> <p>{props.college}</p> </div> ); } \nOutput Prasanna CSE ABC Engineering College \n--- PAGE 49 ---",
            resources: [
              {
                id: 'res-react-unit-5-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-5',
            title: '5.5 Props Destructuring',
            description: "Instead of writing: props.name props.branch props.college We can destructure Props. function Student({ name, branch, col...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Instead of writing: \nprops.name props.branch props.college \nWe can destructure Props. \nfunction Student({ name, branch, college }){ return( <div> <h2>{name}</h2> <p>{branch}</p> <p>{college}</p> </div> ); } \nAdvantages: \n\u25cf Cleaner code \u25cf Better readability \u25cf Less repetition \n \n--- PAGE 50 ---",
            resources: [
              {
                id: 'res-react-unit-5-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-6',
            title: '5.6 Passing Different Data Types',
            description: "Props are not limited to strings. They can store: String name=\"Prasanna\" Number age={21} Boolean isPlaced={true} Array s...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Props are not limited to strings. \nThey can store: \nString name=\"Prasanna\" \nNumber age={21} \nBoolean isPlaced={true} \nArray subjects={[\"React\",\"Node\",\"Java\"]} \nObject student={{ name:\"Prasanna\", branch:\"CSE\" }} \nFunction onClick={handleClick}",
            resources: [
              {
                id: 'res-react-unit-5-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-7',
            title: '5.7 Default Props',
            description: "Sometimes a parent component may not pass a value. Default Props provide a fallback value. function Student({ --- PAGE 5...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Sometimes a parent component may not pass a value. \nDefault Props provide a fallback value. \nfunction Student({ \n--- PAGE 51 ---\n name=\"Guest\" }){ return( <h2> {name} </h2> ); } \nOutput \nGuest",
            resources: [
              {
                id: 'res-react-unit-5-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-8',
            title: '5.8 Read-Only Nature of Props',
            description: "Props are immutable . A child component should never modify Props received from the parent. Wrong Example props.name=\"Ra...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Props are immutable . \nA child component should never modify Props received from the parent. \nWrong Example \nprops.name=\"Rahul\"; \nThis is not allowed. \nIf data needs to change, use State , not Props.",
            resources: [
              {
                id: 'res-react-unit-5-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-9',
            title: '5.9 One-Way Data Flow',
            description: "React follows One-Way Data Binding . Data always flows: Parent Component --- PAGE 52 --- \u2193 Child Component Child compone...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React follows One-Way Data Binding . \nData always flows: \nParent Component \n--- PAGE 52 ---\n\u2193 Child Component \nChild components receive data but should not directly modify it. \nThis architecture improves predictability and debugging.",
            resources: [
              {
                id: 'res-react-unit-5-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-10',
            title: '5.10 Props vs State',
            description: "Props State Passed from Parent Managed inside Component Read-only Can be updated Used for communication Used for dynamic...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Props State \nPassed from Parent Managed inside Component \nRead-only Can be updated \nUsed for communication Used for dynamic data \nImmutable Mutable",
            resources: [
              {
                id: 'res-react-unit-5-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-11',
            title: '5.11 Real-Time Example',
            description: "Suppose a company builds a Student Management System. Instead of creating separate student pages: Student 1 Student 2 St...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Suppose a company builds a Student Management System. \nInstead of creating separate student pages: \nStudent 1 Student 2 Student 3 Student 4 \nReact creates one reusable Student component. \n<Student name=\"Rahul\" branch=\"ECE\" /> \n--- PAGE 53 ---\n <Student name=\"Prasanna\" branch=\"CSE\" /> <Student name=\"Anitha\" branch=\"IT\" /> \nEach component displays different information while using the same code.",
            resources: [
              {
                id: 'res-react-unit-5-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-12',
            title: '5.12 Best Practices',
            description: "\u25cf Keep Props read-only. \u25cf Use meaningful Prop names. \u25cf Use Props Destructuring. \u25cf Keep components reusable. \u25cf Validate P...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Keep Props read-only. \u25cf Use meaningful Prop names. \u25cf Use Props Destructuring. \u25cf Keep components reusable. \u25cf Validate Props when necessary. \u25cf Avoid passing unnecessary Props.",
            resources: [
              {
                id: 'res-react-unit-5-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-13',
            title: '5.13 Common Mistakes',
            description: "\u274c Modifying Props directly. \u274c Passing too many Props. \u274c Using unclear Prop names. \u274c Confusing Props with State. \u274c Hardco...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Modifying Props directly. \n\u274c Passing too many Props. \n\u274c Using unclear Prop names. \n\u274c Confusing Props with State. \n\u274c Hardcoding values instead of using Props. \n \n--- PAGE 54 ---",
            resources: [
              {
                id: 'res-react-unit-5-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-14',
            title: '5.14 Interview Questions',
            description: "1. What are Props? Answer: Props are read-only inputs used to pass data from a parent component to a child component. 2....",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "1. What are Props? \nAnswer: \nProps are read-only inputs used to pass data from a parent component to a child \ncomponent.\n \n \n2. Why are Props used? \nAnswer: \nProps allow components to receive dynamic data, making them reusable and maintainable. \n \n3. Can Props be modified? \nAnswer: \nNo. Props are immutable. To manage changing data, React uses State. \n \n4. What is Props Destructuring? \nAnswer: \nProps Destructuring is a JavaScript feature that extracts individual Prop values directly from \nthe\n \nProps\n \nobject,\n \nmaking\n \ncode\n \ncleaner\n \nand\n \nmore\n \nreadable.\n \n \n5. What is the difference between Props and State? \nAnswer: \nProps are passed from parent to child and cannot be modified, whereas State is managed \nwithin\n \na\n \ncomponent\n \nand\n \ncan\n \nchange\n \nover\n \ntime.",
            resources: [
              {
                id: 'res-react-unit-5-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-5-15',
            title: 'Practical Lab (Interview Questions)',
            description: "Practical Lab - Interview Questions --- PAGE 55 --- Task 1 Create an Employee component. Pass: \u25cf Name \u25cf Department \u25cf Sal...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Interview Questions\n\n--- PAGE 55 ---\nTask 1 \nCreate an Employee component. \nPass: \n\u25cf Name \u25cf Department \u25cf Salary \nusing Props. \n \nTask 2 \nCreate a Product Card component using Props. \n \nTask 3 \nPass an array of skills to a component and display them. \n \nTask 4 \nUse Props Destructuring in a Student component. \n \nTask 5 \nCreate three reusable Course Cards by passing different Prop values.",
            readingContent: "### Practical Lab - Interview Questions\n\n--- PAGE 55 ---\nTask 1 \nCreate an Employee component. \nPass: \n\u25cf Name \u25cf Department \u25cf Salary \nusing Props. \n \nTask 2 \nCreate a Product Card component using Props. \n \nTask 3 \nPass an array of skills to a component and display them. \n \nTask 4 \nUse Props Destructuring in a Student component. \n \nTask 5 \nCreate three reusable Course Cards by passing different Prop values.",
            resources: [
              {
                id: 'res-react-unit-5-15-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-6',
    title: 'Module 6: React State and Hooks',
    description: "Module 6: React State and Hooks (useState) Learning Objectives",
    duration: '210 mins',
    topics: [
      {
        id: 'react-topic-6-1',
        title: 'Module 6: React State and Hooks Lessons',
        description: 'Lessons covering Module 6: React State and Hooks',
        estimatedDuration: '210 mins',
        learningUnits: [
          {
            id: 'react-unit-6-1',
            title: '6.1 Introduction to State',
            description: "Modern web applications are dynamic. Data changes continuously based on user interactions. Examples: \u25cf Login Status \u25cf Sh...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Modern web applications are dynamic. Data changes continuously based on user \ninteractions.\n \nExamples: \n\u25cf Login Status \u25cf Shopping Cart \u25cf Counter \u25cf Search Results \u25cf Theme (Dark/Light Mode) \u25cf User Profile \nTo manage such changing data, React provides State . \nState allows components to remember information and update the UI whenever the data \nchanges.\n \n \nDefinition \nState is a built-in React object that stores dynamic data within a component. Whenever the \nState\n \nchanges,\n \nReact\n \nautomatically\n \nre-renders\n \nthe\n \ncomponent\n \nto\n \ndisplay\n \nthe\n \nupdated\n \ninformation.\n \n \nReal-Time Example \nConsider an Online Shopping Website . \nInitially: \nCart Items: 0 \nAfter adding one product: \n--- PAGE 57 ---\nCart Items: 1 \nAfter adding another product: \nCart Items: 2 \nThe cart value changes dynamically. This changing value is managed using State .",
            resources: [
              {
                id: 'res-react-unit-6-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-2',
            title: '6.2 Why Do We Need State?',
            description: "Without State: \u25cf Data cannot change dynamically. \u25cf UI remains static. \u25cf User interactions cannot update the screen. With...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Without State: \n\u25cf Data cannot change dynamically. \u25cf UI remains static. \u25cf User interactions cannot update the screen. \nWith State: \n\u25cf Dynamic user interfaces \u25cf Automatic UI updates \u25cf Better user experience \u25cf Easier data management",
            resources: [
              {
                id: 'res-react-unit-6-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-3',
            title: '6.3 What is the useState Hook?',
            description: "In modern React, Functional Components use Hooks . The most commonly used Hook is useState . Syntax: import { useState }...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "In modern React, Functional Components use Hooks . \nThe most commonly used Hook is useState . \nSyntax: \nimport { useState } from \"react\"; \nCreating State: \nconst [count, setCount] = useState(0); \nUnderstanding the Syntax const [count, setCount] = useState(0); \nHere: \n--- PAGE 58 ---\n\u25cf count \u2192 Current State value \u25cf setCount \u2192 Function used to update the State \u25cf 0 \u2192 Initial value",
            resources: [
              {
                id: 'res-react-unit-6-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-4',
            title: '6.4 Creating a Counter',
            description: "Example: import { useState } from \"react\"; function Counter() { const [count, setCount] = useState(0); return ( <div> <h...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Example: \nimport { useState } from \"react\"; function Counter() { const [count, setCount] = useState(0); return ( <div> <h2>{count}</h2> <button onClick={() => setCount(count + 1)}> Increment </button> </div> ); } export default Counter; \nOutput \nInitially: \n0 \nAfter clicking: \n1 \nAfter clicking again: \n--- PAGE 59 ---\n2",
            resources: [
              {
                id: 'res-react-unit-6-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-5',
            title: '6.5 Updating State',
            description: "State should never be modified directly. \u274c Wrong count = count + 1; \u2705 Correct setCount(count + 1); React updates the UI ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "State should never be modified directly. \n\u274c Wrong \ncount = count + 1; \n\u2705 Correct \nsetCount(count + 1); \nReact updates the UI only when the setter function is used.",
            resources: [
              {
                id: 'res-react-unit-6-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-6',
            title: '6.6 Multiple State Variables',
            description: "A component can contain multiple State variables. const [name, setName] = useState(\"Prasanna\"); const [age, setAge] = us...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "A component can contain multiple State variables. \nconst [name, setName] = useState(\"Prasanna\"); const [age, setAge] = useState(21); const [city, setCity] = useState(\"Hyderabad\"); \nEach State variable stores independent data.",
            resources: [
              {
                id: 'res-react-unit-6-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-7',
            title: '6.7 State with Objects',
            description: "State can store objects. Example: const [student, setStudent] = useState({ name: \"Prasanna\", branch: \"CSE\" --- PAGE 60 -...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "State can store objects. \nExample: \nconst [student, setStudent] = useState({ name: \"Prasanna\", branch: \"CSE\" \n--- PAGE 60 ---\n}); \nUpdating Object State: \nsetStudent({ ...student, branch: \"AI & DS\" }); \nThe spread operator (...) preserves existing values while updating only the specified \nproperty.",
            resources: [
              {
                id: 'res-react-unit-6-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-8',
            title: '6.8 State with Arrays',
            description: "State can also store arrays. const [subjects, setSubjects] = useState([ \"React\", \"Node\", \"MongoDB\" ]); Adding a new subj...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "State can also store arrays. \nconst [subjects, setSubjects] = useState([ \"React\", \"Node\", \"MongoDB\" ]); \nAdding a new subject: \nsetSubjects([ ...subjects, \"Express\" ]);",
            resources: [
              {
                id: 'res-react-unit-6-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-9',
            title: '6.9 React Re-rendering',
            description: "Whenever State changes: --- PAGE 61 --- User Click \u2193 State Changes \u2193 React Re-renders Component \u2193 Updated UI React compa...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Whenever State changes: \n--- PAGE 61 ---\nUser Click \u2193 State Changes \u2193 React Re-renders Component \u2193 Updated UI \nReact compares the previous Virtual DOM with the updated Virtual DOM and updates only \nthe\n \nnecessary\n \nparts\n \nof\n \nthe\n \nReal\n \nDOM.",
            resources: [
              {
                id: 'res-react-unit-6-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-10',
            title: '6.10 State vs Props',
            description: "State Props Stores dynamic data Receives data from Parent Can be modified Read-only Managed inside Component Passed by P...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "State Props \nStores dynamic data Receives data from Parent \nCan be modified Read-only \nManaged inside Component \nPassed by Parent \nUses useState Passed as attributes",
            resources: [
              {
                id: 'res-react-unit-6-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-11',
            title: '6.11 Best Practices',
            description: "\u25cf Keep State minimal. \u25cf Avoid duplicate State. \u25cf Never modify State directly. \u25cf Use descriptive State names. \u25cf Split unr...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Keep State minimal. \u25cf Avoid duplicate State. \u25cf Never modify State directly. \u25cf Use descriptive State names. \u25cf Split unrelated data into separate State variables. \u25cf Use functional updates when the next State depends on the previous State. \n \n--- PAGE 62 ---",
            resources: [
              {
                id: 'res-react-unit-6-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-12',
            title: '6.12 Common Mistakes',
            description: "\u274c Modifying State directly. \u274c Creating unnecessary State variables. \u274c Storing derived values in State. \u274c Forgetting to u...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Modifying State directly. \n\u274c Creating unnecessary State variables. \n\u274c Storing derived values in State. \n\u274c Forgetting to use the setter function. \n\u274c Mutating arrays or objects instead of creating new copies. \n \nReal-Time Scenario \nA company develops an Online Examination System . \nFeatures: \n\u25cf Start Exam \u25cf Next Question \u25cf Previous Question \u25cf Timer \u25cf Score Counter \nEach of these values changes while the student uses the application. \nReact State manages: \n\u25cf Current Question \u25cf Timer \u25cf Marks \u25cf Selected Answer \u25cf Remaining Time \nWhenever any value changes, React updates only the affected part of the interface.",
            resources: [
              {
                id: 'res-react-unit-6-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-13',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes 1. What is State in React? Answer: --- PAGE 63 --- State is a built-in React objec...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n1. What is State in React? \nAnswer: \n--- PAGE 63 ---\nState is a built-in React object used to store dynamic data within a component. Updating \nState\n \nautomatically\n \nre-renders\n \nthe\n \ncomponent.\n \n \n2. What is the useState Hook? \nAnswer: \nuseState is a React Hook used in Functional Components to create and manage State. \n \n3. Why should State not be modified directly? \nAnswer: \nReact detects changes through the setter function. Direct modification does not trigger a \nre-render\n \nand\n \ncan\n \nlead\n \nto\n \ninconsistent\n \nUI.\n \n \n4. What is the difference between Props and State? \nAnswer: \nProps are read-only values passed from a parent component, while State is managed within \nthe\n \ncomponent\n \nand\n \ncan\n \nchange\n \nover\n \ntime.\n \n \n5. What happens when State changes? \nAnswer: \nReact re-renders the component, compares the Virtual DOM with the previous version, and \nupdates\n \nonly\n \nthe\n \nchanged\n \nelements\n \nin\n \nthe\n \nReal\n \nDOM.",
            resources: [
              {
                id: 'res-react-unit-6-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-6-14',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes Task 1 Create a Counter application using useState. --- PAGE 64 --- Task 2 Create a Like...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a Counter application using useState. \n \n--- PAGE 64 ---\nTask 2 \nCreate a Like button that increments the number of likes. \n \nTask 3 \nCreate a Student component that stores Name and Branch using an object in State. \n \nTask 4 \nCreate an array of skills using State and add a new skill when a button is clicked. \n \nTask 5 \nCreate a Light/Dark Theme toggle using useState.",
            readingContent: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a Counter application using useState. \n \n--- PAGE 64 ---\nTask 2 \nCreate a Like button that increments the number of likes. \n \nTask 3 \nCreate a Student component that stores Name and Branch using an object in State. \n \nTask 4 \nCreate an array of skills using State and add a new skill when a button is clicked. \n \nTask 5 \nCreate a Light/Dark Theme toggle using useState.",
            resources: [
              {
                id: 'res-react-unit-6-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-7',
    title: 'Module 7: React Events and Forms',
    description: "Module 7: React Events and Forms Learning Objectives After completing this module, you will be able to:",
    duration: '240 mins',
    topics: [
      {
        id: 'react-topic-7-1',
        title: 'Module 7: React Events and Forms Lessons',
        description: 'Lessons covering Module 7: React Events and Forms',
        estimatedDuration: '240 mins',
        learningUnits: [
          {
            id: 'react-unit-7-1',
            title: '7.1 Introduction to React Events',
            description: "Modern web applications are interactive. Every user action, such as clicking a button, typing in an input field, or subm...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Modern web applications are interactive. Every user action, such as clicking a button, typing \nin\n \nan\n \ninput\n \nfield,\n \nor\n \nsubmitting\n \na\n \nform,\n \ngenerates\n \nan\n \nEvent\n.\n \nReact provides an event handling system that allows developers to respond to these user \ninteractions\n \nefficiently.\n \n--- PAGE 65 ---\nUnlike traditional JavaScript, React uses Synthetic Events , which provide a consistent \ninterface\n \nacross\n \nall\n \nbrowsers.\n \n \nDefinition \nAn Event is an action triggered by the user or browser, such as a mouse click, keyboard \ninput,\n \nor\n \nform\n \nsubmission.\n \n \nReal-Time Example \nConsider an Online Banking Application. \nUser actions include: \n\u25cf Clicking the Login button \u25cf Entering Account Number \u25cf Typing Password \u25cf Submitting the Login Form \nEach action generates an event that React handles.",
            resources: [
              {
                id: 'res-react-unit-7-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-2',
            title: '7.2 React Event System',
            description: "React wraps native browser events inside SyntheticEvent . Advantages: \u25cf Cross-browser compatibility \u25cf Better performance...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React wraps native browser events inside SyntheticEvent . \nAdvantages: \n\u25cf Cross-browser compatibility \u25cf Better performance \u25cf Same API across all browsers \u25cf Easier event management",
            resources: [
              {
                id: 'res-react-unit-7-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-3',
            title: '7.3 Handling Events',
            description: "Example: function App() { --- PAGE 66 --- function handleClick() { alert(\"Button Clicked\"); } return ( <button onClick={...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Example: \nfunction App() { \n--- PAGE 66 ---\n function handleClick() { alert(\"Button Clicked\"); } return ( <button onClick={handleClick}> Click Me </button> ); } export default App; \nOutput: \nWhen the button is clicked, an alert box appears.",
            resources: [
              {
                id: 'res-react-unit-7-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-4',
            title: '7.4 Common React Events',
            description: "Event Description onClick Mouse Click onDoubleClick Double Click onChange Input Change onSubmit Form Submission onKeyDow...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Event Description \nonClick Mouse Click \nonDoubleClick Double Click \nonChange Input Change \nonSubmit Form Submission \nonKeyDown Key Press \nonKeyUp Key Release \nonMouseEnter Mouse Hover \nonMouseLeave \nMouse Leaves \nonFocus Input Focus \nonBlur Input Loses Focus \n--- PAGE 67 ---",
            resources: [
              {
                id: 'res-react-unit-7-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-5',
            title: '7.5 Passing Parameters to Events',
            description: "Example: function App() { function greet(name) { alert(\"Welcome \" + name); } return ( <button onClick={() => greet(\"Pras...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Example: \nfunction App() { function greet(name) { alert(\"Welcome \" + name); } return ( <button onClick={() => greet(\"Prasanna\")} > Click </button> ); } \nOutput: \nWelcome Prasanna",
            resources: [
              {
                id: 'res-react-unit-7-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-6',
            title: '7.6 Event Object',
            description: "React automatically passes an event object. Example: function App() { function handleClick(event) { console.log(event); ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React automatically passes an event object. \nExample: \nfunction App() { function handleClick(event) { console.log(event); } return ( \n--- PAGE 68 ---\n <button onClick={handleClick}> Click </button> ); } \nThe event object contains information such as: \n\u25cf Event type \u25cf Target element \u25cf Mouse position \u25cf Keyboard key",
            resources: [
              {
                id: 'res-react-unit-7-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-7',
            title: '7.7 Introduction to React Forms',
            description: "Forms are used to collect user information. Examples: \u25cf Login Form \u25cf Registration Form \u25cf Contact Form \u25cf Feedback Form Re...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Forms are used to collect user information. \nExamples: \n\u25cf Login Form \u25cf Registration Form \u25cf Contact Form \u25cf Feedback Form \nReact provides complete control over form data using State .",
            resources: [
              {
                id: 'res-react-unit-7-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-8',
            title: '7.8 Controlled Components',
            description: "A Controlled Component is a form element whose value is controlled by React State. Example: import { useState } from \"re...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "A Controlled Component is a form element whose value is controlled by React State. \nExample: \nimport { useState } from \"react\"; function Login() { const [name, setName] = useState(\"\"); return ( \n--- PAGE 69 ---\n <input type=\"text\" value={name} onChange={(e) => setName(e.target.value)} /> ); } \nAdvantages: \n\u25cf Easy validation \u25cf Real-time updates \u25cf Predictable behavior \u25cf Better control",
            resources: [
              {
                id: 'res-react-unit-7-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-9',
            title: '7.9 Uncontrolled Components',
            description: "An Uncontrolled Component stores its own data inside the DOM instead of React State. Example: import { useRef } from \"re...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "An Uncontrolled Component stores its own data inside the DOM instead of React State. \nExample: \nimport { useRef } from \"react\"; function Login() { const inputRef = useRef(); return ( <input type=\"text\" ref={inputRef} /> ); \n--- PAGE 70 ---\n } \nGenerally, Controlled Components are recommended for most applications.",
            resources: [
              {
                id: 'res-react-unit-7-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-10',
            title: '7.10 Form Submission',
            description: "Example: import { useState } from \"react\"; function Login() { const [name, setName] = useState(\"\"); function handleSubmi...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Example: \nimport { useState } from \"react\"; function Login() { const [name, setName] = useState(\"\"); function handleSubmit(e) { e.preventDefault(); alert(name); } return ( <form onSubmit={handleSubmit}> <input value={name} onChange={(e)=>setName(e.target.value)} /> <button> Submit </button> </form> ); \n--- PAGE 71 ---\n}",
            resources: [
              {
                id: 'res-react-unit-7-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-11',
            title: '7.11 Form Validation',
            description: "Validation ensures that users enter correct information. Example: if(name===\"\"){ alert(\"Name Required\"); } Common valida...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Validation ensures that users enter correct information. \nExample: \nif(name===\"\"){ alert(\"Name Required\"); } \nCommon validations: \n\u25cf Required fields \u25cf Email format \u25cf Password length \u25cf Phone number format",
            resources: [
              {
                id: 'res-react-unit-7-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-12',
            title: '7.12 Controlled vs Uncontrolled',
            description: "Components Controlled Uncontrolled Uses State Uses DOM Easy Validation Less Validation Recommended Used in special cases...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Components\n \nControlled Uncontrolled \nUses State Uses DOM \nEasy Validation Less Validation \nRecommended Used in special cases \nPredictable Less Predictable",
            resources: [
              {
                id: 'res-react-unit-7-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-13',
            title: '7.13 Best Practices',
            description: "\u25cf Use Controlled Components. \u25cf Prevent unnecessary page reloads using preventDefault(). --- PAGE 72 --- \u25cf Validate user ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Use Controlled Components. \u25cf Prevent unnecessary page reloads using preventDefault(). \n--- PAGE 72 ---\n\u25cf Validate user input. \u25cf Keep forms simple. \u25cf Display meaningful error messages. \u25cf Avoid unnecessary re-renders.",
            resources: [
              {
                id: 'res-react-unit-7-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-14',
            title: '7.14 Common Mistakes',
            description: "\u274c Forgetting preventDefault(). \u274c Not updating State using onChange. \u274c Storing sensitive information insecurely. \u274c Using ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Forgetting preventDefault(). \n\u274c Not updating State using onChange. \n\u274c Storing sensitive information insecurely. \n\u274c Using uncontrolled inputs without necessity. \n\u274c Performing validation only after submission. \n \nReal-Time Scenario \nA company develops an Online Job Portal . \nThe Registration Form includes: \n\u25cf Name \u25cf Email \u25cf Password \u25cf Phone Number \nAs the user types, React updates the State. \nWhen the user clicks Register : \n\u25cf Input is validated. \u25cf Invalid fields display error messages. \u25cf Valid data is sent to the server. \nThis provides a smooth user experience.",
            resources: [
              {
                id: 'res-react-unit-7-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-15',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes --- PAGE 73 --- 1. What is Event Handling in React? Answer: Event Handling is the ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n--- PAGE 73 ---\n1. What is Event Handling in React? \nAnswer: \nEvent Handling is the process of responding to user actions such as clicks, typing, and form \nsubmissions\n \nusing\n \nReact's\n \nevent\n \nsystem.\n \n \n2. What is a Synthetic Event? \nAnswer: \nA Synthetic Event is React's wrapper around the native browser event, providing consistent \nbehavior\n \nacross\n \ndifferent\n \nbrowsers.\n \n \n3. What is the difference between Controlled and Uncontrolled \nComponents?\n \nAnswer: \nControlled Components use React State to manage form data, while Uncontrolled \nComponents\n \nrely\n \non\n \nthe\n \nDOM\n \nusing\n \nreferences\n \n(useRef). \n \n4. Why is preventDefault() used? \nAnswer: \nIt prevents the browser's default form submission behavior, allowing React to control the \nsubmission\n \nprocess.\n \n \n5. Which approach is recommended for React Forms? \nAnswer: \nControlled Components are recommended because they provide better control, validation, \nand\n \npredictable\n \nbehavior.",
            resources: [
              {
                id: 'res-react-unit-7-15-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-7-16',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes --- PAGE 74 --- Task 1 Create a Login Form with Name and Password fields. Task 2 Display...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\n--- PAGE 74 ---\nTask 1 \nCreate a Login Form with Name and Password fields. \n \nTask 2 \nDisplay the entered Name below the input field. \n \nTask 3 \nValidate that the Name field is not empty. \n \nTask 4 \nCreate a Feedback Form using Controlled Components. \n \nTask 5 \nImplement a Registration Form with: \n\u25cf Name \u25cf Email \u25cf Password \u25cf Phone Number \nValidate all fields before submission.",
            readingContent: "### Practical Lab - Common Mistakes\n\n--- PAGE 74 ---\nTask 1 \nCreate a Login Form with Name and Password fields. \n \nTask 2 \nDisplay the entered Name below the input field. \n \nTask 3 \nValidate that the Name field is not empty. \n \nTask 4 \nCreate a Feedback Form using Controlled Components. \n \nTask 5 \nImplement a Registration Form with: \n\u25cf Name \u25cf Email \u25cf Password \u25cf Phone Number \nValidate all fields before submission.",
            resources: [
              {
                id: 'res-react-unit-7-16-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-8',
    title: 'Module 8: Lists and Conditional',
    description: "Module 8: Lists and Conditional Rendering Learning Objectives",
    duration: '225 mins',
    topics: [
      {
        id: 'react-topic-8-1',
        title: 'Module 8: Lists and Conditional Lessons',
        description: 'Lessons covering Module 8: Lists and Conditional',
        estimatedDuration: '225 mins',
        learningUnits: [
          {
            id: 'react-unit-8-1',
            title: '8.1 Introduction',
            description: "Modern applications display large amounts of dynamic data. Examples: \u25cf Product Lists \u25cf Student Records \u25cf Employee Detail...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Modern applications display large amounts of dynamic data. \nExamples: \n\u25cf Product Lists \u25cf Student Records \u25cf Employee Details \u25cf News Articles \u25cf Notifications \u25cf Comments \nInstead of writing HTML repeatedly, React generates these UI elements dynamically using \nList\n \nRendering\n.\n \nSimilarly, applications often display different content depending on conditions. \nExample: \n\u25cf Logged In \u2192 Show Dashboard \u25cf Logged Out \u2192 Show Login Page \nThis is achieved using Conditional Rendering .",
            resources: [
              {
                id: 'res-react-unit-8-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-2',
            title: '8.2 What is List Rendering?',
            description: "List Rendering is the process of displaying multiple elements from an array or collection of data. Instead of manually c...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "List Rendering is the process of displaying multiple elements from an array or collection of \ndata.\n \nInstead of manually creating every item, React automatically generates components from \ndata.\n \n \nReal-Time Example \n--- PAGE 76 ---\nConsider an E-Commerce website. \nDatabase contains: \nLaptop Mobile Keyboard Mouse Headphones \nReact creates Product Cards automatically. \nProducts \u2502 \u251c\u2500\u2500 Laptop \u251c\u2500\u2500 Mobile \u251c\u2500\u2500 Keyboard \u251c\u2500\u2500 Mouse \u2514\u2500\u2500 Headphones",
            resources: [
              {
                id: 'res-react-unit-8-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-3',
            title: '8.3 JavaScript map() Method',
            description: "React commonly uses the JavaScript map() method to render lists. Example: const fruits = [ \"Apple\", \"Orange\", \"Mango\" ];...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React commonly uses the JavaScript map() method to render lists. \nExample: \nconst fruits = [ \"Apple\", \"Orange\", \"Mango\" ]; \n--- PAGE 77 ---\nfunction App(){ return( <div> { fruits.map( (fruit)=> ( <h2> {fruit} </h2> ) ) } </div> ); } \nOutput Apple Orange Mango",
            resources: [
              {
                id: 'res-react-unit-8-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-4',
            title: '8.4 Rendering Objects',
            description: "Most real-world applications receive data as objects. Example: const students = [ --- PAGE 78 --- { id:1, name:\"Prasanna...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Most real-world applications receive data as objects. \nExample: \nconst students = [ \n--- PAGE 78 ---\n { id:1, name:\"Prasanna\", branch:\"CSE\" }, { id:2, name:\"Rahul\", branch:\"ECE\" } ]; \nRendering: \n{ students.map( (student)=>( <div> <h3> {student.name} </h3> <p> {student.branch} </p> </div> ) \n--- PAGE 79 ---\n ) }",
            resources: [
              {
                id: 'res-react-unit-8-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-5',
            title: '8.5 Understanding Keys',
            description: "When rendering lists, React requires a Key . A Key uniquely identifies each element. Example: students.map( (student)=>(...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "When rendering lists, React requires a Key . \nA Key uniquely identifies each element. \nExample: \nstudents.map( (student)=>( <div key={student.id} > <h2> {student.name} </h2> </div> ) ) \nWhy Keys are Important? \nReact uses Keys to: \n\u25cf Identify elements. \u25cf Improve rendering performance. \u25cf Update only changed items. \u25cf Avoid unnecessary re-rendering. \n \n--- PAGE 80 ---\nCharacteristics of a Good Key \nA Key should be: \n\u25cf Unique \u25cf Stable \u25cf Predictable \nBest Example: \nkey={student.id} \nAvoid: \nkey={index} \nunless no unique ID is available.",
            resources: [
              {
                id: 'res-react-unit-8-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-6',
            title: '8.6 Conditional Rendering',
            description: "Conditional Rendering means displaying different UI based on conditions. Example: const isLoggedIn = true; If true: Disp...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Conditional Rendering means displaying different UI based on conditions. \nExample: \nconst isLoggedIn = true; \nIf true: \nDisplay Dashboard. \nOtherwise: \nDisplay Login Page.",
            resources: [
              {
                id: 'res-react-unit-8-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-7',
            title: '8.7 Using if Statement',
            description: "Example: function App(){ const isLoggedIn=true; if(isLoggedIn){ --- PAGE 81 --- return( <h2> Welcome User </h2> ); } ret...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Example: \nfunction App(){ const isLoggedIn=true; if(isLoggedIn){ \n--- PAGE 81 ---\n return( <h2> Welcome User </h2> ); } return( <h2> Login First </h2> ); }",
            resources: [
              {
                id: 'res-react-unit-8-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-8',
            title: '8.8 Using Ternary Operator',
            description: "Example: const isLoggedIn=true; return( <h2> { isLoggedIn ? \"Dashboard\" : --- PAGE 82 --- \"Login\" } </h2> ); Output Dash...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Example: \nconst isLoggedIn=true; return( <h2> { isLoggedIn ? \"Dashboard\" : \n--- PAGE 82 ---\n\"Login\" } </h2> ); \nOutput \nDashboard",
            resources: [
              {
                id: 'res-react-unit-8-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-9',
            title: '8.9 Using Logical AND (&&)',
            description: "Useful when displaying content only if a condition is true. Example: const isAdmin=true; return( <div> { isAdmin && <h2>...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Useful when displaying content only if a condition is true. \nExample: \nconst isAdmin=true; return( <div> { isAdmin && <h2> Admin Panel </h2> } </div> ); \nOutput \nAdmin Panel \n--- PAGE 83 ---",
            resources: [
              {
                id: 'res-react-unit-8-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-10',
            title: '8.10 Rendering Components',
            description: "Conditionally { isLoggedIn ? <Dashboard/> : <Login/> } This technique is commonly used in: \u25cf Authentication \u25cf Role-Based...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Conditionally\n \n{ isLoggedIn ? <Dashboard/> : <Login/> } \nThis technique is commonly used in: \n\u25cf Authentication \u25cf Role-Based Access \u25cf Dashboards",
            resources: [
              {
                id: 'res-react-unit-8-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-11',
            title: '8.11 Empty List Handling',
            description: "Sometimes APIs return no data. Example: const products=[]; Display: { products.length===0 ? \"No Products Found\" : produc...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Sometimes APIs return no data. \nExample: \nconst products=[]; \nDisplay: \n{ products.length===0 ? \"No Products Found\" : products.map(...) \n--- PAGE 84 ---\n }",
            resources: [
              {
                id: 'res-react-unit-8-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-12',
            title: '8.12 Best Practices',
            description: "\u25cf Always use unique Keys. \u25cf Avoid using array indexes as Keys. \u25cf Keep rendering logic simple. \u25cf Use reusable components....",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Always use unique Keys. \u25cf Avoid using array indexes as Keys. \u25cf Keep rendering logic simple. \u25cf Use reusable components. \u25cf Handle empty lists gracefully. \u25cf Avoid deeply nested conditions.",
            resources: [
              {
                id: 'res-react-unit-8-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-13',
            title: '8.13 Common Mistakes',
            description: "\u274c Forgetting Keys. \u274c Using duplicate Keys. \u274c Writing complex nested ternary operators. \u274c Rendering large lists without o...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Forgetting Keys. \n\u274c Using duplicate Keys. \n\u274c Writing complex nested ternary operators. \n\u274c Rendering large lists without optimization. \n\u274c Ignoring empty data conditions. \n \nReal-Time Scenario \nA company develops an Online Food Delivery Application . \nRestaurant data is fetched from an API. \nRestaurants \u2502 \u251c\u2500\u2500 KFC \u251c\u2500\u2500 Domino's \u251c\u2500\u2500 Pizza Hut \n--- PAGE 85 ---\n \u251c\u2500\u2500 Subway \u2514\u2500\u2500 Burger King \nReact uses map() to generate Restaurant Cards. \nIf the API returns no restaurants: \nNo Restaurants Available \nIf the user logs in: \nDisplay: \nWelcome User \nOtherwise: \nDisplay: \nPlease Login",
            resources: [
              {
                id: 'res-react-unit-8-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-14',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes 1. What is List Rendering? Answer: List Rendering is the process of displaying mul...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n1. What is List Rendering? \nAnswer: \nList Rendering is the process of displaying multiple UI elements dynamically from an array of \ndata.\n \n \n2. Which JavaScript method is commonly used for List Rendering? \nAnswer: \nThe map() method. \n \n3. Why are Keys required in React? \nAnswer: \n--- PAGE 86 ---\nKeys uniquely identify list items, helping React efficiently update only the changed elements \nduring\n \nre-rendering.\n \n \n4. What is Conditional Rendering? \nAnswer: \nConditional Rendering is the technique of displaying different UI elements based on \nconditions.\n \n \n5. Name three methods used for Conditional Rendering. \nAnswer: \n\u25cf if Statement \u25cf Ternary Operator (? :) \u25cf Logical AND (&&)",
            resources: [
              {
                id: 'res-react-unit-8-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-8-15',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes Task 1 Create an array of five student names and display them using map(). Task 2 Displa...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate an array of five student names and display them using map(). \n \nTask 2 \nDisplay employee details from an array of objects. \n \nTask 3 \nCreate a Login component that shows: \n\u25cf Dashboard when logged in. \u25cf Login Page when logged out. \n \n--- PAGE 87 ---\nTask 4 \nDisplay \"No Products Available\" if the products array is empty. \n \nTask 5 \nCreate a Student Card component and render it dynamically using map().",
            readingContent: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate an array of five student names and display them using map(). \n \nTask 2 \nDisplay employee details from an array of objects. \n \nTask 3 \nCreate a Login component that shows: \n\u25cf Dashboard when logged in. \u25cf Login Page when logged out. \n \n--- PAGE 87 ---\nTask 4 \nDisplay \"No Products Available\" if the products array is empty. \n \nTask 5 \nCreate a Student Card component and render it dynamically using map().",
            resources: [
              {
                id: 'res-react-unit-8-15-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-9',
    title: 'Module 9: React Hooks',
    description: "Module 9: React Hooks Learning Objectives After completing this module, you will be able to:",
    duration: '195 mins',
    topics: [
      {
        id: 'react-topic-9-1',
        title: 'Module 9: React Hooks Lessons',
        description: 'Lessons covering Module 9: React Hooks',
        estimatedDuration: '195 mins',
        learningUnits: [
          {
            id: 'react-unit-9-1',
            title: '9.1 Introduction to React Hooks',
            description: "Before React 16.8, developers primarily used Class Components to manage state and lifecycle methods. Functional Componen...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Before React 16.8, developers primarily used Class Components to manage state and \nlifecycle\n \nmethods.\n \nFunctional\n \nComponents\n \nwere\n \nlimited\n \nbecause\n \nthey\n \ncould\n \nnot\n \nmanage\n \nstate\n \nor\n \nlifecycle\n \noperations.\n \nTo solve this limitation, React introduced Hooks in version 16.8 . \nHooks allow Functional Components to use React features such as: \n\u25cf State Management \u25cf Lifecycle Management \u25cf DOM References \u25cf Performance Optimization \u25cf Context Management \nAs a result, Functional Components became the standard approach for React development. \n \n--- PAGE 88 ---\nDefinition \nA Hook is a special React function that allows Functional Components to use React features \nsuch\n \nas\n \nState,\n \nLifecycle\n \nmethods,\n \nContext,\n \nand\n \nreferences\n \nwithout\n \nwriting\n \nClass\n \nComponents.\n \n \nWhy Hooks? \nWithout Hooks: \n\u25cf Developers relied heavily on Class Components. \u25cf Lifecycle methods were complex. \u25cf Code reuse was difficult. \u25cf Logic became scattered across lifecycle methods. \nWith Hooks: \n\u25cf Simpler code. \u25cf Better readability. \u25cf Easier code reuse. \u25cf Improved maintainability. \u25cf Better performance optimization.",
            resources: [
              {
                id: 'res-react-unit-9-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-2',
            title: '9.2 Rules of Hooks',
            description: "React Hooks must follow specific rules. Rule 1 Always call Hooks at the top level of a component. Correct: function App(...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React Hooks must follow specific rules. \nRule 1 \nAlways call Hooks at the top level of a component. \nCorrect: \nfunction App() { const [count, setCount] = useState(0); } \nWrong: \nif(true){ \n--- PAGE 89 ---\nuseState(0); } \nRule 2 \nHooks should only be called inside: \n\u25cf Functional Components \u25cf Custom Hooks \nNot inside: \n\u25cf Loops \u25cf Conditions \u25cf Nested functions",
            resources: [
              {
                id: 'res-react-unit-9-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-3',
            title: '9.3 useEffect Hook',
            description: "useEffect() is used to perform side effects in React. Examples: \u25cf Fetch API data \u25cf Update document title \u25cf Start timers ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "useEffect() is used to perform side effects in React. \nExamples: \n\u25cf Fetch API data \u25cf Update document title \u25cf Start timers \u25cf Access browser APIs \u25cf Subscribe to events \n \nSyntax useEffect(() => { console.log(\"Component Loaded\"); }, []); \nThe empty dependency array ([]) means the effect runs only once after the component is \nmounted.\n \n \nExample \n--- PAGE 90 ---\nimport { useEffect } from \"react\"; function App() { useEffect(() => { document.title = \"React Hooks\"; }, []); return <h2>Welcome</h2>; } \nDependency Array \nDependency \nExecution \n[] Runs once after mounting \n[count] Runs when count changes \nOmitted Runs after every render",
            resources: [
              {
                id: 'res-react-unit-9-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-4',
            title: '9.4 useRef Hook',
            description: "useRef() provides a way to access DOM elements directly or store mutable values that do not trigger re-renders. Example:...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "useRef() provides a way to access DOM elements directly or store mutable values that do \nnot\n \ntrigger\n \nre-renders.\n \nExample: \nimport { useRef } from \"react\"; function App() { const inputRef = useRef(); function focusInput() { inputRef.current.focus(); } \n--- PAGE 91 ---\n return ( <> <input ref={inputRef} /> <button onClick={focusInput}> Focus </button> </> ); } \nApplications \n\u25cf Focusing input fields. \u25cf Accessing DOM elements. \u25cf Storing previous values. \u25cf Managing timers.",
            resources: [
              {
                id: 'res-react-unit-9-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-5',
            title: '9.5 useMemo Hook',
            description: "Large applications often perform expensive calculations. useMemo() stores (memoizes) the calculated result and recalcula...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Large applications often perform expensive calculations. \nuseMemo() stores (memoizes) the calculated result and recalculates it only when \ndependencies\n \nchange.\n \nExample: \nconst total = useMemo(() => { return price * quantity; }, [price, quantity]); \nAdvantages \n--- PAGE 92 ---\n\u25cf Improves performance. \u25cf Avoids unnecessary calculations. \u25cf Optimizes rendering.",
            resources: [
              {
                id: 'res-react-unit-9-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-6',
            title: '9.6 useCallback Hook',
            description: "Functions are recreated every time a component re-renders. useCallback() memoizes a function, preventing unnecessary rec...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Functions are recreated every time a component re-renders. \nuseCallback() memoizes a function, preventing unnecessary recreation. \nExample: \nconst handleClick = useCallback(() => { console.log(\"Clicked\"); }, []); \nWhy useCallback? \nUseful when: \n\u25cf Passing functions to child components. \u25cf Optimizing rendering. \u25cf Preventing unnecessary re-renders.",
            resources: [
              {
                id: 'res-react-unit-9-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-7',
            title: '9.7 Custom Hooks',
            description: "React allows developers to create their own reusable Hooks. Example: import { useState } from \"react\"; function useCount...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React allows developers to create their own reusable Hooks. \nExample: \nimport { useState } from \"react\"; function useCounter() { const [count, setCount] = useState(0); const increment = () => setCount(count + 1); \n--- PAGE 93 ---\nreturn { count, increment }; } \nUsing the Hook: \nconst { count, increment } = useCounter(); \nBenefits \n\u25cf Reusable logic. \u25cf Cleaner components. \u25cf Better maintainability. \u25cf Less code duplication.",
            resources: [
              {
                id: 'res-react-unit-9-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-8',
            title: '9.8 React Hook Flow',
            description: "Component Render \u2502 \u25bc React Hook \u2502 \u25bc State / Effect / Ref \u2502 \u25bc UI Updated",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Component Render \u2502 \u25bc React Hook \u2502 \u25bc State / Effect / Ref \u2502 \u25bc UI Updated",
            resources: [
              {
                id: 'res-react-unit-9-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-9',
            title: '9.9 Performance Optimization',
            description: "Large applications may re-render frequently. React provides Hooks for optimization: \u25cf useMemo \u2192 Memoizes values. --- PAG...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Large applications may re-render frequently. \nReact provides Hooks for optimization: \n\u25cf useMemo \u2192 Memoizes values. \n--- PAGE 94 ---\n\u25cf useCallback \u2192 Memoizes functions. \u25cf useRef \u2192 Stores mutable values without re-rendering. \nThese Hooks improve application performance.",
            resources: [
              {
                id: 'res-react-unit-9-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-10',
            title: '9.10 Best Practices',
            description: "\u25cf Use Hooks only when required. \u25cf Keep dependency arrays accurate. \u25cf Create Custom Hooks for reusable logic. \u25cf Avoid unn...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Use Hooks only when required. \u25cf Keep dependency arrays accurate. \u25cf Create Custom Hooks for reusable logic. \u25cf Avoid unnecessary useMemo and useCallback. \u25cf Keep components small and focused.",
            resources: [
              {
                id: 'res-react-unit-9-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-11',
            title: '9.11 Common Mistakes',
            description: "\u274c Calling Hooks inside loops. \u274c Calling Hooks inside conditions. \u274c Forgetting dependency arrays. \u274c Overusing useMemo. \u274c ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Calling Hooks inside loops. \n\u274c Calling Hooks inside conditions. \n\u274c Forgetting dependency arrays. \n\u274c Overusing useMemo. \n\u274c Misusing useRef for state management. \n \nReal-Time Scenario \nA company develops an Online Banking Dashboard . \nFeatures: \n\u25cf Fetch account details using useEffect. \u25cf Focus the search box using useRef. \u25cf Calculate total balance using useMemo. \u25cf Optimize button handlers using useCallback. \u25cf Reuse authentication logic through a Custom Hook. \nBy using Hooks, the application becomes more modular, efficient, and easier to maintain. \n--- PAGE 95 ---",
            resources: [
              {
                id: 'res-react-unit-9-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-12',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes 1. What are React Hooks? Answer: Hooks are special React functions that allow Func...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n1. What are React Hooks? \nAnswer: \nHooks are special React functions that allow Functional Components to use React features \nsuch\n \nas\n \nState,\n \nLifecycle\n \nmethods,\n \nand\n \nContext\n \nwithout\n \nwriting\n \nClass\n \nComponents.\n \n \n2. Why were Hooks introduced? \nAnswer: \nHooks simplify component logic, promote code reuse, and eliminate the need for Class \nComponents\n \nin\n \nmost\n \ncases.\n \n \n3. What is the purpose of useEffect()? \nAnswer: \nuseEffect() is used to perform side effects such as API calls, subscriptions, timers, and \nDOM\n \nupdates.\n \n \n4. What is the difference between useMemo() and useCallback()? \nAnswer: \n\u25cf useMemo() memoizes a computed value . \u25cf useCallback() memoizes a function . \n \n5. What is a Custom Hook? \nAnswer: \nA Custom Hook is a reusable JavaScript function that starts with use and contains React \nHook\n \nlogic,\n \nallowing\n \nthe\n \nsame\n \nfunctionality\n \nto\n \nbe\n \nshared\n \nacross\n \nmultiple\n \ncomponents.\n \n--- PAGE 96 ---",
            resources: [
              {
                id: 'res-react-unit-9-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-9-13',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes Task 1 Create a Counter using useState. Task 2 Use useEffect() to change the page title ...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a Counter using useState. \n \nTask 2 \nUse useEffect() to change the page title whenever the counter changes. \n \nTask 3 \nCreate an input field and focus it using useRef(). \n \nTask 4 \nCalculate the total price of products using useMemo(). \n \nTask 5 \nCreate a reusable Custom Hook named useCounter.",
            readingContent: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a Counter using useState. \n \nTask 2 \nUse useEffect() to change the page title whenever the counter changes. \n \nTask 3 \nCreate an input field and focus it using useRef(). \n \nTask 4 \nCalculate the total price of products using useMemo(). \n \nTask 5 \nCreate a reusable Custom Hook named useCounter.",
            resources: [
              {
                id: 'res-react-unit-9-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-10',
    title: 'Module 10: React Router',
    description: "Module 10: React Router Learning Objectives After completing this module, you will be able to:",
    duration: '225 mins',
    topics: [
      {
        id: 'react-topic-10-1',
        title: 'Module 10: React Router Lessons',
        description: 'Lessons covering Module 10: React Router',
        estimatedDuration: '225 mins',
        learningUnits: [
          {
            id: 'react-unit-10-1',
            title: '10.1 Introduction to Routing',
            description: "Modern web applications contain multiple pages such as: \u25cf Home \u25cf About \u25cf Contact \u25cf Login \u25cf Dashboard \u25cf Profile In tradit...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Modern web applications contain multiple pages such as: \n\u25cf Home \u25cf About \u25cf Contact \u25cf Login \u25cf Dashboard \u25cf Profile \nIn traditional websites, navigating between pages reloads the entire page. \nReact applications work differently. \nSince React is a Single Page Application (SPA) , it updates only the required content \ninstead\n \nof\n \nreloading\n \nthe\n \ncomplete\n \npage.\n \nThis is achieved using React Router . \n \nDefinition \nReact Router is a standard routing library for React that enables navigation between \ndifferent\n \ncomponents\n \nwithout\n \nrefreshing\n \nthe\n \nbrowser.\n \n \nReal-Time Example \nConsider an E-Commerce Website . \nIt contains: \n\u25cf Home Page \u25cf Products Page \u25cf Cart Page \u25cf Login Page \u25cf Profile Page \n--- PAGE 98 ---\nInstead of loading separate HTML pages, React Router loads different components. \nBrowser \u2502 \u25bc React Router \u2502 \u251c\u2500\u2500 Home \u251c\u2500\u2500 Products \u251c\u2500\u2500 Cart \u251c\u2500\u2500 Profile \u2514\u2500\u2500 Login",
            resources: [
              {
                id: 'res-react-unit-10-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-2',
            title: '10.2 Why React Router?',
            description: "Without React Router: \u25cf Entire page reloads \u25cf Slow navigation \u25cf Poor user experience With React Router: \u25cf Fast navigatio...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Without React Router: \n\u25cf Entire page reloads \u25cf Slow navigation \u25cf Poor user experience \nWith React Router: \n\u25cf Fast navigation \u25cf No page refresh \u25cf Better performance \u25cf Smooth user experience",
            resources: [
              {
                id: 'res-react-unit-10-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-3',
            title: '10.3 Installing React Router',
            description: "Install React Router using npm. npm install react-router-dom --- PAGE 99 --- Verify installation: npm list react-router-...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Install React Router using npm. \nnpm install react-router-dom \n--- PAGE 99 ---\nVerify installation: \nnpm list react-router-dom",
            resources: [
              {
                id: 'res-react-unit-10-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-4',
            title: '10.4 Basic Routing',
            description: "Wrap the application using BrowserRouter . Example: import { BrowserRouter } from \"react-router-dom\"; import App from \"....",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Wrap the application using BrowserRouter . \nExample: \nimport { BrowserRouter } from \"react-router-dom\"; import App from \"./App\"; root.render( <BrowserRouter> <App /> </BrowserRouter> );",
            resources: [
              {
                id: 'res-react-unit-10-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-5',
            title: '10.5 Creating Routes',
            description: "Example: import { Routes, Route } from \"react-router-dom\"; import Home from \"./Home\"; import About from \"./About\"; funct...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Example: \nimport { Routes, Route } from \"react-router-dom\"; import Home from \"./Home\"; import About from \"./About\"; function App(){ return( \n--- PAGE 100 ---\n <Routes> <Route path=\"/\" element={<Home/>} /> <Route path=\"/about\" element={<About/>} /> </Routes> ); }",
            resources: [
              {
                id: 'res-react-unit-10-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-6',
            title: '10.6 Navigation using Link',
            description: "Instead of HTML <a> tags, React Router uses Link . Example: import { Link } from \"react-router-dom\"; <Link to=\"/\"> Home ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Instead of HTML <a> tags, React Router uses Link . \nExample: \nimport { Link } from \"react-router-dom\"; <Link to=\"/\"> Home </Link> <Link to=\"/about\"> About \n--- PAGE 101 ---\n</Link> \nAdvantages: \n\u25cf No page refresh \u25cf Faster navigation \u25cf Better performance",
            resources: [
              {
                id: 'res-react-unit-10-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-7',
            title: '10.7 Navigation using useNavigate',
            description: "React Router provides the useNavigate Hook for programmatic navigation. Example: import { useNavigate } from \"react-rout...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React Router provides the useNavigate Hook for programmatic navigation. \nExample: \nimport { useNavigate } from \"react-router-dom\"; function Login(){ const navigate = useNavigate(); function handleLogin(){ navigate(\"/dashboard\"); } }",
            resources: [
              {
                id: 'res-react-unit-10-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-8',
            title: '10.8 Dynamic Routing',
            description: "Dynamic Routing allows URLs to contain parameters. Example: /student/101 /student/102 --- PAGE 102 --- /student/103 Rout...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Dynamic Routing allows URLs to contain parameters. \nExample: \n/student/101 /student/102 \n--- PAGE 102 ---\n /student/103 \nRoute: \n<Route path=\"/student/:id\" element={<Student/>} /> \nAccess Parameter: \nimport { useParams } from \"react-router-dom\"; const { id } = useParams();",
            resources: [
              {
                id: 'res-react-unit-10-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-9',
            title: '10.9 Nested Routing',
            description: "Large applications contain nested pages. Example: Dashboard \u2502 \u251c\u2500\u2500 Students \u251c\u2500\u2500 Faculty \u251c\u2500\u2500 Courses \u2514\u2500\u2500 Reports Nested Ro...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Large applications contain nested pages. \nExample: \nDashboard \u2502 \u251c\u2500\u2500 Students \u251c\u2500\u2500 Faculty \u251c\u2500\u2500 Courses \u2514\u2500\u2500 Reports \nNested Routes: \n<Route \n--- PAGE 103 ---\n path=\"/dashboard\" element={<Dashboard/>} > <Route path=\"students\" element={<Students/>} /> <Route path=\"courses\" element={<Courses/>} /> </Route>",
            resources: [
              {
                id: 'res-react-unit-10-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-10',
            title: '10.10 Private Routing',
            description: "Some pages require authentication. Example: Login \u2193 Dashboard \u2193 Profile Unauthenticated users should not access Dashboar...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Some pages require authentication. \nExample: \nLogin \u2193 Dashboard \u2193 Profile \nUnauthenticated users should not access Dashboard. \nExample: \nif(user){ \n--- PAGE 104 ---\n return <Dashboard/>; } return <Login/>;",
            resources: [
              {
                id: 'res-react-unit-10-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-11',
            title: '10.11 Route Parameters vs Query',
            description: "Parameters Route Parameters Query Parameters /student/10 /student?id=10 Uses useParams() Uses useSearchParams() Cleaner ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Parameters\n \nRoute Parameters \nQuery Parameters \n/student/10 /student?id=10 \nUses useParams() \nUses useSearchParams() \nCleaner URLs Useful for filters/search",
            resources: [
              {
                id: 'res-react-unit-10-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-12',
            title: '10.12 Best Practices',
            description: "\u25cf Use BrowserRouter as the root router. \u25cf Organize routes into separate files. \u25cf Use Link instead of anchor tags. \u25cf Prot...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Use BrowserRouter as the root router. \u25cf Organize routes into separate files. \u25cf Use Link instead of anchor tags. \u25cf Protect sensitive routes. \u25cf Use lazy loading for large applications. \u25cf Keep route names meaningful.",
            resources: [
              {
                id: 'res-react-unit-10-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-13',
            title: '10.13 Common Mistakes',
            description: "\u274c Using HTML <a> instead of <Link>. \u274c Forgetting BrowserRouter. \u274c Hardcoding URLs. \u274c Not handling 404 pages. --- PAGE 10...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Using HTML <a> instead of <Link>. \n\u274c Forgetting BrowserRouter. \n\u274c Hardcoding URLs. \n\u274c Not handling 404 pages. \n--- PAGE 105 ---\n\u274c Exposing protected routes without authentication. \n \nReal-Time Scenario \nA company develops an Online Learning Platform . \nPages include: \nHome Courses Login Dashboard Profile Certificates \nReact Router handles navigation. \nWhen a student clicks: \nCourses \n\u2193 \nReact Router loads only the Courses component. \nThe browser does not reload, providing a smooth user experience.",
            resources: [
              {
                id: 'res-react-unit-10-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-14',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes 1. What is React Router? Answer: React Router is a routing library that enables na...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n1. What is React Router? \nAnswer: \nReact Router is a routing library that enables navigation between different React \ncomponents\n \nwithout\n \nrefreshing\n \nthe\n \nbrowser.\n \n \n--- PAGE 106 ---\n2. Why is BrowserRouter used? \nAnswer: \nBrowserRouter enables client-side routing by managing the browser's history using the \nHTML5\n \nHistory\n \nAPI.\n \n \n3. What is the difference between Link and <a>? \nAnswer: \n\u25cf <Link> performs client-side navigation without refreshing the page. \u25cf <a> reloads the entire page. \n \n4. What is Dynamic Routing? \nAnswer: \nDynamic Routing allows URL parameters such as /student/:id to display dynamic \ncontent\n \nbased\n \non\n \nthe\n \nparameter\n \nvalue.\n \n \n5. What is useNavigate? \nAnswer: \nuseNavigate is a React Router Hook used to navigate programmatically from one route to \nanother.",
            resources: [
              {
                id: 'res-react-unit-10-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-10-15',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes Task 1 Install React Router. Task 2 Create: --- PAGE 107 --- \u25cf Home Page \u25cf About Page \u25cf ...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\nTask 1 \nInstall React Router. \n \nTask 2 \nCreate: \n--- PAGE 107 ---\n\u25cf Home Page \u25cf About Page \u25cf Contact Page \n \nTask 3 \nNavigate using Link. \n \nTask 4 \nCreate a Student Details page using Dynamic Routing. \n \nTask 5 \nImplement a Login page that redirects users to the Dashboard using useNavigate.",
            readingContent: "### Practical Lab - Common Mistakes\n\nTask 1 \nInstall React Router. \n \nTask 2 \nCreate: \n--- PAGE 107 ---\n\u25cf Home Page \u25cf About Page \u25cf Contact Page \n \nTask 3 \nNavigate using Link. \n \nTask 4 \nCreate a Student Details page using Dynamic Routing. \n \nTask 5 \nImplement a Login page that redirects users to the Dashboard using useNavigate.",
            resources: [
              {
                id: 'res-react-unit-10-15-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-11',
    title: 'Module 11: API Integration in React',
    description: "Module 11: API Integration in React Learning Objectives After completing this module, you will be able to:",
    duration: '240 mins',
    topics: [
      {
        id: 'react-topic-11-1',
        title: 'Module 11: API Integration in React Lessons',
        description: 'Lessons covering Module 11: API Integration in React',
        estimatedDuration: '240 mins',
        learningUnits: [
          {
            id: 'react-unit-11-1',
            title: '11.1 Introduction to APIs',
            description: "Modern web applications rarely work with static data. Instead, they communicate with servers to fetch or update informat...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Modern web applications rarely work with static data. Instead, they communicate with \nservers\n \nto\n \nfetch\n \nor\n \nupdate\n \ninformation.\n \nExamples: \n--- PAGE 108 ---\n\u25cf E-commerce products \u25cf Student records \u25cf Weather information \u25cf Banking transactions \u25cf Social media posts \nThis communication is done using APIs (Application Programming Interfaces). \n \nDefinition \nAn API (Application Programming Interface) is a set of rules that allows two software \napplications\n \nto\n \ncommunicate\n \nand\n \nexchange\n \ndata.\n \nIn React, APIs are commonly used to: \n\u25cf Fetch data from a server \u25cf Send user information \u25cf Update existing records \u25cf Delete records \n \nReal-Time Example \nConsider an Online Shopping Application. \nUser \u2502 \u25bc React Application \u2502 \u25bc REST API \u2502 \u25bc Database \n--- PAGE 109 ---\n \u2502 \u25bc Product Information \nWhen the user opens the Products page: \n\u25cf React sends a request. \u25cf Server processes it. \u25cf Database returns product details. \u25cf React displays them.",
            resources: [
              {
                id: 'res-react-unit-11-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-2',
            title: '11.2 Why API Integration?',
            description: "Without APIs: \u25cf Static applications \u25cf Hardcoded data \u25cf No real-time updates With APIs: \u25cf Dynamic content \u25cf Real-time inf...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Without APIs: \n\u25cf Static applications \u25cf Hardcoded data \u25cf No real-time updates \nWith APIs: \n\u25cf Dynamic content \u25cf Real-time information \u25cf Database connectivity \u25cf Better user experience",
            resources: [
              {
                id: 'res-react-unit-11-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-3',
            title: '11.3 HTTP Methods',
            description: "React communicates with servers using HTTP methods. Method Purpose GET Retrieve data POST Create new data PUT Update exi...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React communicates with servers using HTTP methods. \nMethod Purpose \nGET Retrieve data \nPOST Create new data \nPUT Update existing data \n--- PAGE 110 ---\nDELETE Remove data",
            resources: [
              {
                id: 'res-react-unit-11-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-4',
            title: '11.4 Fetch API',
            description: "The Fetch API is a built-in JavaScript feature used to make HTTP requests. Example: fetch(\"https://jsonplaceholder.typic...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "The Fetch API is a built-in JavaScript feature used to make HTTP requests. \nExample: \nfetch(\"https://jsonplaceholder.typicode.com/users\") .then(response => response.json()) .then(data => console.log(data)); \nAdvantages: \n\u25cf Built into JavaScript \u25cf No installation required \u25cf Lightweight",
            resources: [
              {
                id: 'res-react-unit-11-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-5',
            title: '11.5 Async and Await',
            description: "Instead of .then(), modern React applications use async/await . Example: async function getUsers(){ const response = awa...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Instead of .then(), modern React applications use async/await . \nExample: \nasync function getUsers(){ const response = await fetch( \"https://jsonplaceholder.typicode.com/users\" ); const data = await response.json(); console.log(data); } \nAdvantages: \n--- PAGE 111 ---\n\u25cf Cleaner code \u25cf Better readability \u25cf Easier error handling",
            resources: [
              {
                id: 'res-react-unit-11-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-6',
            title: '11.6 Axios',
            description: "Axios is a popular third-party library used for API communication. Install Axios: npm install axios Example: import axio...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Axios is a popular third-party library used for API communication. \nInstall Axios: \nnpm install axios \nExample: \nimport axios from \"axios\"; async function getUsers(){ const response = await axios.get( \"https://jsonplaceholder.typicode.com/users\" ); console.log(response.data); } \nFetch API vs Axios \nFetch API Axios \nBuilt into JavaScript External Library \nManual JSON conversion \nAutomatic JSON conversion \nMore code Cleaner syntax \nBasic features Advanced features",
            resources: [
              {
                id: 'res-react-unit-11-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-7',
            title: '11.7 Fetching Data using useEffect',
            description: "--- PAGE 112 --- API requests are generally made inside useEffect(). Example: import { useEffect, useState } from \"react...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "--- PAGE 112 ---\nAPI requests are generally made inside useEffect(). \nExample: \nimport { useEffect, useState } from \"react\"; function Users(){ const [users, setUsers] = useState([]); useEffect(()=>{ fetch( \"https://jsonplaceholder.typicode.com/users\" ) .then(response=>response.json()) .then(data=>setUsers(data)); },[]); } \nThe empty dependency array ensures the API request runs only once when the component \nmounts.",
            resources: [
              {
                id: 'res-react-unit-11-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-8',
            title: '11.8 Displaying API Data',
            description: "Example: { users.map(user=>( --- PAGE 113 --- <div key={user.id}> <h2>{user.name}</h2> <p>{user.email}</p> </div> )) }",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Example: \n{ users.map(user=>( \n--- PAGE 113 ---\n<div key={user.id}> <h2>{user.name}</h2> <p>{user.email}</p> </div> )) }",
            resources: [
              {
                id: 'res-react-unit-11-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-9',
            title: '11.9 Loading State',
            description: "Users should know when data is loading. Example: const [loading, setLoading] = useState(true); Before API completes: Loa...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Users should know when data is loading. \nExample: \nconst [loading, setLoading] = useState(true); \nBefore API completes: \nLoading... \nAfter completion: \nDisplay the data.",
            resources: [
              {
                id: 'res-react-unit-11-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-10',
            title: '11.10 Error Handling',
            description: "Network requests may fail. Example: try{ const response = await axios.get(url); } catch(error){ console.log(error); --- ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Network requests may fail. \nExample: \ntry{ const response = await axios.get(url); } catch(error){ console.log(error); \n--- PAGE 114 ---\n} \nAlways display meaningful error messages instead of crashing the application.",
            resources: [
              {
                id: 'res-react-unit-11-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-11',
            title: '11.11 CRUD Operations',
            description: "React applications commonly perform CRUD operations. GET Retrieve data. POST Create new data. axios.post(url,data); PUT ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React applications commonly perform CRUD operations. \nGET \nRetrieve data. \nPOST \nCreate new data. \naxios.post(url,data); \nPUT \nUpdate existing data. \naxios.put(url,data); \nDELETE \nDelete data. \naxios.delete(url);",
            resources: [
              {
                id: 'res-react-unit-11-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-12',
            title: '11.12 API Architecture',
            description: "React Component \u2193 API Request \u2193 Server --- PAGE 115 --- \u2193 Database \u2193 JSON Response \u2193 React UI",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React Component \u2193 API Request \u2193 Server \n--- PAGE 115 ---\n \u2193 Database \u2193 JSON Response \u2193 React UI",
            resources: [
              {
                id: 'res-react-unit-11-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-13',
            title: '11.13 Best Practices',
            description: "\u25cf Keep API URLs in configuration files. \u25cf Use Async/Await. \u25cf Handle Loading and Error states. \u25cf Validate API responses. ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Keep API URLs in configuration files. \u25cf Use Async/Await. \u25cf Handle Loading and Error states. \u25cf Validate API responses. \u25cf Avoid duplicate API calls. \u25cf Secure sensitive API keys. \u25cf Use Axios Interceptors for large applications.",
            resources: [
              {
                id: 'res-react-unit-11-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-14',
            title: '11.14 Common Mistakes',
            description: "\u274c Calling APIs on every render. \u274c Ignoring error handling. \u274c Not showing loading indicators. \u274c Hardcoding API URLs. \u274c St...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Calling APIs on every render. \n\u274c Ignoring error handling. \n\u274c Not showing loading indicators. \n\u274c Hardcoding API URLs. \n\u274c Storing API keys inside source code. \n \nReal-Time Scenario \nA company develops a Hospital Management System . \n--- PAGE 116 ---\nThe application performs: \n\u25cf GET \u2192 Fetch patient records. \u25cf POST \u2192 Register a new patient. \u25cf PUT \u2192 Update patient details. \u25cf DELETE \u2192 Remove patient information. \nReact communicates with the backend API and updates the interface without reloading the \npage.",
            resources: [
              {
                id: 'res-react-unit-11-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-15',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes 1. What is an API? Answer: An API is a communication interface that enables two so...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n1. What is an API? \nAnswer: \nAn API is a communication interface that enables two software applications to exchange \ndata.\n \n \n2. Why is useEffect() used for API calls? \nAnswer: \nBecause it allows API requests to execute after the component is rendered, preventing \nunnecessary\n \nrepeated\n \nrequests.\n \n \n3. What is the difference between Fetch API and Axios? \nAnswer: \nFetch is built into JavaScript and requires manual JSON parsing, while Axios is an external \nlibrary\n \nthat\n \nprovides\n \nautomatic\n \nJSON\n \nparsing\n \nand\n \nadditional\n \nfeatures\n \nlike\n \ninterceptors.\n \n \n4. What are the four main HTTP methods? \nAnswer: \nGET, POST, PUT, and DELETE. \n \n--- PAGE 117 ---\n5. Why should Loading and Error states be implemented? \nAnswer: \nThey improve user experience by providing feedback during network requests and handling \nfailures\n \ngracefully.",
            resources: [
              {
                id: 'res-react-unit-11-15-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-11-16',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes Task 1 Fetch user data using the Fetch API. Task 2 Display fetched users using map(). Ta...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\nTask 1 \nFetch user data using the Fetch API. \n \nTask 2 \nDisplay fetched users using map(). \n \nTask 3 \nRepeat the same task using Axios. \n \nTask 4 \nImplement a Loading indicator. \n \nTask 5 \nDisplay an Error message if the API request fails.",
            readingContent: "### Practical Lab - Common Mistakes\n\nTask 1 \nFetch user data using the Fetch API. \n \nTask 2 \nDisplay fetched users using map(). \n \nTask 3 \nRepeat the same task using Axios. \n \nTask 4 \nImplement a Loading indicator. \n \nTask 5 \nDisplay an Error message if the API request fails.",
            resources: [
              {
                id: 'res-react-unit-11-16-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-12',
    title: 'Module 12: State Management in React',
    description: "Module 12: State Management in React (Context API",
    duration: '180 mins',
    topics: [
      {
        id: 'react-topic-12-1',
        title: 'Module 12: State Management in React Lessons',
        description: 'Lessons covering Module 12: State Management in React',
        estimatedDuration: '180 mins',
        learningUnits: [
          {
            id: 'react-unit-12-1',
            title: '12.1 Introduction to State Management',
            description: "Every React application stores and manages data. Initially, this data is managed using useState(). However, as applicati...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Every React application stores and manages data. Initially, this data is managed using useState(). However, as applications grow, sharing data across multiple components \nbecomes\n \ndifficult.\n \nThis challenge is solved using State Management . \nState Management is the process of storing, updating, and sharing data efficiently across an \napplication.\n \n \nDefinition \nState Management is a technique used to manage application data in a predictable and \ncentralized\n \nmanner,\n \nensuring\n \nthat\n \nmultiple\n \ncomponents\n \ncan\n \naccess\n \nand\n \nupdate\n \nshared\n \ninformation\n \nwithout\n \nunnecessary\n \ncomplexity.\n \n \nReal-Time Example \nConsider an E-Commerce Website . \nThe application contains: \n\u25cf Home \u25cf Products \u25cf Cart \u25cf Wishlist \u25cf Profile \n--- PAGE 119 ---\n\u25cf Orders \nWhen a user adds a product to the cart, the cart count should update in the Navbar, Cart \npage,\n \nand\n \nCheckout\n \npage.\n \nInstead of passing data through every component, a global state management solution is \nused.\n \nApp \u2502 \u251c\u2500\u2500 Navbar \u2502 \u2502 \u2502 \u2514\u2500\u2500 Cart Count \u2502 \u251c\u2500\u2500 Products \u2502 \u251c\u2500\u2500 Cart \u2502 \u2514\u2500\u2500 Checkout",
            resources: [
              {
                id: 'res-react-unit-12-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-2',
            title: '12.2 Local State vs Global State',
            description: "Local State \u25cf Managed inside one component. \u25cf Uses useState(). \u25cf Accessible only within that component. Example: const [...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Local State \n\u25cf Managed inside one component. \u25cf Uses useState(). \u25cf Accessible only within that component. \nExample: \nconst [count, setCount] = useState(0); \nGlobal State \n\u25cf Shared across multiple components. \u25cf Accessible anywhere in the application. \u25cf Managed using Context API or Redux Toolkit. \n \nComparison \nLocal State Global State \n--- PAGE 120 ---\nComponent-specific Shared across components \nUses useState Uses Context/Redux \nSmall applications Large applications \nLimited scope Application-wide scope",
            resources: [
              {
                id: 'res-react-unit-12-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-3',
            title: '12.3 What is Prop Drilling?',
            description: "One of the biggest problems in React is Prop Drilling . Suppose data is required by a deeply nested component. App \u2502 \u25bc D...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "One of the biggest problems in React is Prop Drilling . \nSuppose data is required by a deeply nested component. \nApp \u2502 \u25bc Dashboard \u2502 \u25bc Student \u2502 \u25bc Profile \u2502 \u25bc Avatar \nIf the Avatar component needs user information, every intermediate component must pass \nthe\n \ndata.\n \nThis unnecessary passing of props is called Prop Drilling . \nProblems: \n\u25cf Difficult maintenance. \u25cf Unnecessary code. \u25cf Poor scalability.",
            resources: [
              {
                id: 'res-react-unit-12-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-4',
            title: '12.4 Context API',
            description: "--- PAGE 121 --- The Context API is React's built-in solution for sharing data globally without manually passing props t...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "--- PAGE 121 ---\nThe Context API is React's built-in solution for sharing data globally without manually \npassing\n \nprops\n \nthrough\n \nevery\n \ncomponent.\n \n \nHow Context API Works Context Provider \u2502 \u25bc Shared Data \u2502 \u250c\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2510 \u25bc \u25bc \u25bc Navbar Cart Profile \nCreating Context import { createContext } from \"react\"; const UserContext = createContext(); export default UserContext; \nProviding Context <UserContext.Provider value={\"Prasanna\"}> <App /> </UserContext.Provider> \nConsuming Context import { useContext } from \"react\"; const user = useContext(UserContext); return <h2>{user}</h2>;",
            resources: [
              {
                id: 'res-react-unit-12-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-5',
            title: '12.5 Advantages of Context API',
            description: "--- PAGE 122 --- \u25cf Eliminates Prop Drilling. \u25cf Built into React. \u25cf Easy to implement. \u25cf Suitable for medium-sized applic...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "--- PAGE 122 ---\n\u25cf Eliminates Prop Drilling. \u25cf Built into React. \u25cf Easy to implement. \u25cf Suitable for medium-sized applications. \u25cf Centralized data access.",
            resources: [
              {
                id: 'res-react-unit-12-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-6',
            title: '12.6 Introduction to Redux',
            description: "For enterprise-level applications, Context API may become difficult to manage. To solve this, developers use Redux . Red...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "For enterprise-level applications, Context API may become difficult to manage. \nTo solve this, developers use Redux . \nRedux is a predictable state management library that stores application data in a centralized \nStore\n.\n \n \nRedux Architecture Component \u2193 Dispatch(Action) \u2193 Reducer \u2193 Store Updated \u2193 UI Re-rendered",
            resources: [
              {
                id: 'res-react-unit-12-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-7',
            title: '12.7 Redux Toolkit',
            description: "Redux Toolkit (RTK) is the official and recommended way to write Redux code. It reduces boilerplate code and simplifies ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Redux Toolkit (RTK) is the official and recommended way to write Redux code. \nIt reduces boilerplate code and simplifies state management. \n--- PAGE 123 ---\nInstall Redux Toolkit: \nnpm install @reduxjs/toolkit react-redux \nCore Concepts of Redux Toolkit \nStore \nStores the application's global state. \n \nSlice \nContains: \n\u25cf Initial State \u25cf Reducers \u25cf Actions \n \nReducer \nSpecifies how the state changes based on dispatched actions. \n \nDispatch \nSends actions to the Redux Store. \n \nSelector \nRetrieves data from the Store.",
            resources: [
              {
                id: 'res-react-unit-12-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-8',
            title: '12.8 Context API vs Redux Toolkit',
            description: "Context API Redux Toolkit Built into React External Library --- PAGE 124 --- Easy to learn More advanced Medium applicat...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Context API Redux Toolkit \nBuilt into React External Library \n--- PAGE 124 ---\nEasy to learn More advanced \nMedium applications Large enterprise applications \nLess boilerplate Structured architecture \nNo DevTools by default Excellent Redux DevTools support",
            resources: [
              {
                id: 'res-react-unit-12-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-9',
            title: '12.9 Best Practices',
            description: "\u25cf Use Local State for component-specific data. \u25cf Use Context API for shared application settings. \u25cf Use Redux Toolkit fo...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Use Local State for component-specific data. \u25cf Use Context API for shared application settings. \u25cf Use Redux Toolkit for complex applications. \u25cf Avoid storing unnecessary data globally. \u25cf Organize Redux slices properly. \u25cf Keep state immutable.",
            resources: [
              {
                id: 'res-react-unit-12-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-10',
            title: '12.10 Common Mistakes',
            description: "\u274c Using Redux for very small applications. \u274c Storing every variable in global state. \u274c Mutating Redux state directly. \u274c ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Using Redux for very small applications. \n\u274c Storing every variable in global state. \n\u274c Mutating Redux state directly. \n\u274c Creating too many Context Providers. \n\u274c Ignoring Redux DevTools during debugging. \n \nReal-Time Scenario \nA company develops an Online Banking Application . \nShared data includes: \n\u25cf User Profile \u25cf Account Balance \u25cf Notifications \u25cf Theme \n--- PAGE 125 ---\n\u25cf Language \u25cf Authentication Status \nInstead of passing these values through dozens of components, the application stores them \nin\n \nRedux\n \nToolkit.\n \nWhenever the balance changes: \n\u25cf Dashboard updates. \u25cf Transaction History updates. \u25cf Navbar updates. \u25cf Account Summary updates. \nAll components remain synchronized automatically.",
            resources: [
              {
                id: 'res-react-unit-12-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-11',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes 1. What is State Management? Answer: State Management is the process of storing an...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n1. What is State Management? \nAnswer: \nState Management is the process of storing and managing application data efficiently across \ncomponents.\n \n \n2. What is Prop Drilling? \nAnswer: \nProp Drilling is the process of passing props through multiple intermediate components to \nreach\n \na\n \ndeeply\n \nnested\n \ncomponent.\n \n \n3. Why is Context API used? \nAnswer: \nContext API is used to share global data between components without passing props \nmanually\n \nthrough\n \nevery\n \nlevel\n \nof\n \nthe\n \ncomponent\n \ntree.\n \n \n4. What is Redux Toolkit? \n--- PAGE 126 ---\nAnswer: \nRedux Toolkit is the official, recommended library for managing global state in React \napplications\n \nwith\n \nless\n \nboilerplate\n \ncode.\n \n \n5. When should Redux Toolkit be used instead of Context API? \nAnswer: \nRedux Toolkit is preferred for large-scale applications with complex state management, while \nContext\n \nAPI\n \nis\n \nsuitable\n \nfor\n \nmedium-sized\n \napplications\n \nwith\n \nsimpler\n \nshared\n \nstate.",
            resources: [
              {
                id: 'res-react-unit-12-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-12-12',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes Task 1 Create a Theme Context using Context API. Task 2 Share the logged-in user's name ...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a Theme Context using Context API. \n \nTask 2 \nShare the logged-in user's name using Context API. \n \nTask 3 \nCreate a Redux Store. \n \nTask 4 \nCreate a Counter Slice using Redux Toolkit. \n \nTask 5 \nDisplay and update the Counter value using Redux Toolkit. \n--- PAGE 127 ---",
            readingContent: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a Theme Context using Context API. \n \nTask 2 \nShare the logged-in user's name using Context API. \n \nTask 3 \nCreate a Redux Store. \n \nTask 4 \nCreate a Counter Slice using Redux Toolkit. \n \nTask 5 \nDisplay and update the Counter value using Redux Toolkit. \n--- PAGE 127 ---",
            resources: [
              {
                id: 'res-react-unit-12-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-13',
    title: 'Module 13: Styling React Applications',
    description: "Module 13: Styling React Applications Learning Objectives After completing this module, you will be able to:",
    duration: '210 mins',
    topics: [
      {
        id: 'react-topic-13-1',
        title: 'Module 13: Styling React Applications Lessons',
        description: 'Lessons covering Module 13: Styling React Applications',
        estimatedDuration: '210 mins',
        learningUnits: [
          {
            id: 'react-unit-13-1',
            title: '13.1 Introduction',
            description: "Styling is one of the most important aspects of frontend development. While React focuses on building dynamic user inter...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Styling is one of the most important aspects of frontend development. While React focuses \non\n \nbuilding\n \ndynamic\n \nuser\n \ninterfaces,\n \nCSS\n \nis\n \nresponsible\n \nfor\n \nmaking\n \nthose\n \ninterfaces\n \nvisually\n \nappealing.\n \nReact supports multiple styling approaches, allowing developers to choose the method that \nbest\n \nfits\n \ntheir\n \nproject\n \nrequirements.\n \n \nDefinition \nReact Styling is the process of applying visual design, layout, colors, typography, spacing, \nand\n \nresponsiveness\n \nto\n \nReact\n \ncomponents\n \nusing\n \nCSS\n \nor\n \nCSS-based\n \nlibraries.\n \n \nReal-Time Example \nConsider an Online Shopping Website . \nWithout CSS: \nProduct Name Price \n--- PAGE 128 ---\n Buy Button \nWith CSS: \nBeautiful Product Card Image Price Add to Cart Button Hover Effects \nProfessional styling improves user experience and increases usability.",
            resources: [
              {
                id: 'res-react-unit-13-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-2',
            title: '13.2 Ways to Style React Applications',
            description: "React supports multiple styling techniques. React Styling \u2502 \u251c\u2500\u2500 External CSS \u251c\u2500\u2500 Inline CSS \u251c\u2500\u2500 CSS Modules \u251c\u2500\u2500 Bootstra...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React supports multiple styling techniques. \nReact Styling \u2502 \u251c\u2500\u2500 External CSS \u251c\u2500\u2500 Inline CSS \u251c\u2500\u2500 CSS Modules \u251c\u2500\u2500 Bootstrap \u251c\u2500\u2500 Tailwind CSS \u2514\u2500\u2500 Styled Components",
            resources: [
              {
                id: 'res-react-unit-13-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-3',
            title: '13.3 External CSS',
            description: "This is the most common styling approach. Create: --- PAGE 129 --- App.css Example: .title{ color:blue; font-size:30px; ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "This is the most common styling approach. \nCreate: \n--- PAGE 129 ---\nApp.css \nExample: \n.title{ color:blue; font-size:30px; text-align:center; } \nImport CSS \nimport \"./App.css\"; \nUse \n<h1 className=\"title\"> Welcome React </h1> \nAdvantages \n\u25cf Easy to manage \u25cf Reusable \u25cf Clean code",
            resources: [
              {
                id: 'res-react-unit-13-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-4',
            title: '13.4 Inline CSS',
            description: "React allows styles to be written directly inside components. Example <h2 style={{ color:\"red\", --- PAGE 130 --- fontSiz...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React allows styles to be written directly inside components. \nExample \n<h2 style={{ color:\"red\", \n--- PAGE 130 ---\nfontSize:\"25px\" }} > Hello </h2> \nNotice: \nReact uses camelCase. \nExample \nbackgroundColor fontSize textAlign \nAdvantages \n\u25cf Quick styling \u25cf Dynamic styles \u25cf No separate CSS file \n \nDisadvantages \n\u25cf Difficult maintenance \u25cf Repeated code \u25cf Poor scalability",
            resources: [
              {
                id: 'res-react-unit-13-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-5',
            title: '13.5 CSS Modules',
            description: "Large applications may contain multiple CSS files with the same class names. CSS Modules solve this problem. Example ---...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Large applications may contain multiple CSS files with the same class names. \nCSS Modules solve this problem. \nExample \n--- PAGE 131 ---\nButton.module.css .button{ background:blue; color:white; } \nImport \nimport styles from \"./Button.module.css\"; \nUse \n<button className={styles.button} > Submit </button> \nAdvantages \n\u25cf No CSS conflicts \u25cf Scoped styles \u25cf Better maintainability",
            resources: [
              {
                id: 'res-react-unit-13-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-6',
            title: '13.6 Bootstrap',
            description: "Bootstrap is one of the most popular CSS frameworks. Installation npm install bootstrap Import import --- PAGE 132 --- \"...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Bootstrap is one of the most popular CSS frameworks. \nInstallation \nnpm install bootstrap \nImport \nimport \n--- PAGE 132 ---\n \"bootstrap/dist/css/bootstrap.min.css\"; \nExample \n<button className=\"btn btn-primary\" > Login </button> \nFeatures \n\u25cf Responsive Grid \u25cf Buttons \u25cf Cards \u25cf Navigation Bars \u25cf Forms \u25cf Alerts",
            resources: [
              {
                id: 'res-react-unit-13-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-7',
            title: '13.7 Tailwind CSS',
            description: "Tailwind CSS is a utility-first CSS framework. Installation npm install tailwindcss Example <button className=\" bg-blue-...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Tailwind CSS is a utility-first CSS framework. \nInstallation \nnpm install tailwindcss \nExample \n<button className=\" bg-blue-600 text-white px-5 \n--- PAGE 133 ---\npy-2 rounded \" > Submit </button> \nAdvantages \n\u25cf Faster UI development \u25cf Utility classes \u25cf Responsive \u25cf Highly customizable",
            resources: [
              {
                id: 'res-react-unit-13-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-8',
            title: '13.8 Styled Components',
            description: "Styled Components is a CSS-in-JS library. Installation npm install styled-components Example import styled from \"styled-...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Styled Components is a CSS-in-JS library. \nInstallation \nnpm install styled-components \nExample \nimport styled from \"styled-components\"; const Button = styled.button` background:blue; color:white; padding:10px; `; \n--- PAGE 134 ---\nUse \n<Button> Login </Button> \nAdvantages \n\u25cf Component-level styling \u25cf Dynamic styling \u25cf Better organization",
            resources: [
              {
                id: 'res-react-unit-13-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-9',
            title: '13.9 Responsive Design',
            description: "Modern websites must work on: \u25cf Mobile \u25cf Tablet \u25cf Laptop \u25cf Desktop Responsive design adjusts layouts automatically. Boot...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Modern websites must work on: \n\u25cf Mobile \u25cf Tablet \u25cf Laptop \u25cf Desktop \nResponsive design adjusts layouts automatically. \nBootstrap and Tailwind provide built-in responsive utilities.",
            resources: [
              {
                id: 'res-react-unit-13-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-10',
            title: '13.10 Styling Architecture',
            description: "React Component \u2502 \u25bc CSS / Tailwind / Bootstrap \u2502 \u25bc --- PAGE 135 --- Browser Rendering \u2502 \u25bc Styled UI",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React Component \u2502 \u25bc CSS / Tailwind / Bootstrap \u2502 \u25bc \n--- PAGE 135 ---\n Browser Rendering \u2502 \u25bc Styled UI",
            resources: [
              {
                id: 'res-react-unit-13-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-11',
            title: '13.11 Best Practices',
            description: "\u25cf Use CSS Modules for medium projects. \u25cf Use Tailwind CSS for rapid development. \u25cf Use Bootstrap for dashboard applicati...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Use CSS Modules for medium projects. \u25cf Use Tailwind CSS for rapid development. \u25cf Use Bootstrap for dashboard applications. \u25cf Avoid excessive Inline CSS. \u25cf Organize styles logically. \u25cf Follow consistent naming conventions. \u25cf Keep styles reusable.",
            resources: [
              {
                id: 'res-react-unit-13-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-12',
            title: '13.12 Common Mistakes',
            description: "\u274c Mixing multiple styling approaches unnecessarily. \u274c Using Inline CSS for large applications. \u274c Duplicate CSS classes. ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Mixing multiple styling approaches unnecessarily. \n\u274c Using Inline CSS for large applications. \n\u274c Duplicate CSS classes. \n\u274c Ignoring responsive design. \n\u274c Hardcoding colors and spacing. \n \nReal-Time Scenario \nA company develops an Online Banking Portal . \nFeatures include: \n\u25cf Dashboard \u25cf Transactions \n--- PAGE 136 ---\n\u25cf Profile \u25cf Loan Details \nThe development team: \n\u25cf Uses Tailwind CSS for fast UI development. \u25cf Uses CSS Modules for reusable components. \u25cf Uses Bootstrap Grid for responsive layouts. \nThis combination creates a modern, responsive, and maintainable application.",
            resources: [
              {
                id: 'res-react-unit-13-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-13',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes 1. What are the different ways to style React applications? Answer: React applicat...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n1. What are the different ways to style React applications? \nAnswer: \nReact applications can be styled using: \n\u25cf External CSS \u25cf Inline CSS \u25cf CSS Modules \u25cf Bootstrap \u25cf Tailwind CSS \u25cf Styled Components \n \n2. What are CSS Modules? \nAnswer: \nCSS Modules provide locally scoped CSS, preventing class name conflicts between \ncomponents.\n \n \n3. Why is Tailwind CSS popular? \nAnswer: \nTailwind CSS is popular because it uses utility classes, enables rapid development, and \nmakes\n \nit\n \neasy\n \nto\n \nbuild\n \nresponsive\n \nuser\n \ninterfaces.\n \n \n--- PAGE 137 ---\n4. What is Styled Components? \nAnswer: \nStyled Components is a CSS-in-JS library that allows developers to write \ncomponent-specific\n \nstyles\n \ndirectly\n \nin\n \nJavaScript.\n \n \n5. Which styling method is recommended for enterprise applications? \nAnswer: \nThe choice depends on project requirements. CSS Modules, Tailwind CSS, and Styled \nComponents\n \nare\n \ncommonly\n \nused\n \nin\n \nenterprise\n \nReact\n \napplications\n \nbecause\n \nthey\n \nimprove\n \nmaintainability\n \nand\n \nscalability.",
            resources: [
              {
                id: 'res-react-unit-13-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-13-14',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes Task 1 Create a Login page using External CSS. Task 2 Apply Inline CSS to a heading. Tas...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a Login page using External CSS. \n \nTask 2 \nApply Inline CSS to a heading. \n \nTask 3 \nCreate a reusable Button component using CSS Modules. \n \nTask 4 \nDesign a Registration Form using Bootstrap. \n \nTask 5 \n--- PAGE 138 ---\nCreate a responsive Product Card using Tailwind CSS.",
            readingContent: "### Practical Lab - Common Mistakes\n\nTask 1 \nCreate a Login page using External CSS. \n \nTask 2 \nApply Inline CSS to a heading. \n \nTask 3 \nCreate a reusable Button component using CSS Modules. \n \nTask 4 \nDesign a Registration Form using Bootstrap. \n \nTask 5 \n--- PAGE 138 ---\nCreate a responsive Product Card using Tailwind CSS.",
            resources: [
              {
                id: 'res-react-unit-13-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-14',
    title: 'Module 14: Building Real-World React',
    description: "Module 14: Building Real-World React Projects Learning Objectives",
    duration: '240 mins',
    topics: [
      {
        id: 'react-topic-14-1',
        title: 'Module 14: Building Real-World React Lessons',
        description: 'Lessons covering Module 14: Building Real-World React',
        estimatedDuration: '240 mins',
        learningUnits: [
          {
            id: 'react-unit-14-1',
            title: '14.1 Introduction',
            description: "Learning React concepts alone is not enough. The true value of React lies in building real-world applications. Projects ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Learning React concepts alone is not enough. The true value of React lies in building \nreal-world\n \napplications.\n \nProjects help developers: \n\u25cf Apply theoretical knowledge. \u25cf Improve problem-solving skills. \u25cf Understand project architecture. \u25cf Learn component reusability. \u25cf Gain industry experience. \nEvery React developer is expected to build projects before attending interviews. \n \nWhy Projects Are Important? \nProjects help you: \n\u25cf Improve coding skills. \u25cf Understand React architecture. \u25cf Build a professional portfolio. \n--- PAGE 139 ---\n\u25cf Prepare for technical interviews. \u25cf Learn debugging techniques.",
            resources: [
              {
                id: 'res-react-unit-14-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-2',
            title: '14.2 React Project Development',
            description: "Lifecycle A React project follows a structured development process. Requirement Analysis \u2502 \u25bc UI Design \u2502 \u25bc Component Pla...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Lifecycle\n \nA React project follows a structured development process. \nRequirement Analysis \u2502 \u25bc UI Design \u2502 \u25bc Component Planning \u2502 \u25bc Routing Setup \u2502 \u25bc State Management \u2502 \u25bc API Integration \u2502 \u25bc Testing \u2502 \u25bc Deployment",
            resources: [
              {
                id: 'res-react-unit-14-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-3',
            title: '14.3 Professional Project Folder',
            description: "Structure Large React applications follow a clean folder structure. src/ \u2502 --- PAGE 140 --- \u251c\u2500\u2500 assets/ \u2502 \u251c\u2500\u2500 components...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Structure\n \nLarge React applications follow a clean folder structure. \nsrc/ \u2502 \n--- PAGE 140 ---\n\u251c\u2500\u2500 assets/ \u2502 \u251c\u2500\u2500 components/ \u2502 \u251c\u2500\u2500 pages/ \u2502 \u251c\u2500\u2500 hooks/ \u2502 \u251c\u2500\u2500 context/ \u2502 \u251c\u2500\u2500 redux/ \u2502 \u251c\u2500\u2500 services/ \u2502 \u251c\u2500\u2500 utils/ \u2502 \u251c\u2500\u2500 styles/ \u2502 \u251c\u2500\u2500 App.jsx \u2502 \u2514\u2500\u2500 main.jsx \nFolder Explanation \nassets/ \n--- PAGE 141 ---\nStores: \n\u25cf Images \u25cf Icons \u25cf Videos \u25cf Fonts \n \ncomponents/ \nReusable UI components. \nExamples: \n\u25cf Navbar \u25cf Footer \u25cf Button \u25cf Card \u25cf Sidebar \n \npages/ \nApplication pages. \nExamples: \n\u25cf Home \u25cf About \u25cf Login \u25cf Dashboard \u25cf Contact \n \nhooks/ \nStores Custom Hooks. \n \ncontext/ \nStores Context API files. \n \n--- PAGE 142 ---\nredux/ \nContains: \n\u25cf Store \u25cf Slices \u25cf Reducers \n \nservices/ \nContains API functions. \nExample: \nuserService.js productService.js \nutils/ \nUtility functions. \nExamples: \n\u25cf Validation \u25cf Date Formatting \u25cf Helper Functions \n \nstyles/ \nContains global CSS files.",
            resources: [
              {
                id: 'res-react-unit-14-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-4',
            title: '14.4 Project Architecture',
            description: "User \u2502 \u25bc React UI --- PAGE 143 --- \u2502 \u25bc Components \u2502 \u25bc React Router \u2502 \u25bc Context API / Redux \u2502 \u25bc API Services \u2502 \u25bc Backend ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "User \u2502 \u25bc React UI \n--- PAGE 143 ---\n \u2502 \u25bc Components \u2502 \u25bc React Router \u2502 \u25bc Context API / Redux \u2502 \u25bc API Services \u2502 \u25bc Backend Server \u2502 \u25bc Database",
            resources: [
              {
                id: 'res-react-unit-14-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-5',
            title: '14.5 Project 1 – Todo Application',
            description: "Features \u25cf Add Tasks \u25cf Delete Tasks \u25cf Update Tasks \u25cf Mark Completed --- PAGE 144 --- Concepts Used \u25cf useState \u25cf map() \u25cf ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Features \n\u25cf Add Tasks \u25cf Delete Tasks \u25cf Update Tasks \u25cf Mark Completed \n--- PAGE 144 ---\nConcepts Used \n\u25cf useState \u25cf map() \u25cf Events \u25cf Forms \u25cf Components",
            resources: [
              {
                id: 'res-react-unit-14-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-6',
            title: '14.6 Project 2 – Weather Application',
            description: "Features \u25cf Search City \u25cf Fetch Weather API \u25cf Display Temperature \u25cf Humidity \u25cf Wind Speed Concepts Used \u25cf Axios \u25cf useEffe...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Features \n\u25cf Search City \u25cf Fetch Weather API \u25cf Display Temperature \u25cf Humidity \u25cf Wind Speed \nConcepts Used \n\u25cf Axios \u25cf useEffect \u25cf API Integration \u25cf Conditional Rendering",
            resources: [
              {
                id: 'res-react-unit-14-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-7',
            title: '14.7 Project 3 – Student Management',
            description: "System Features \u25cf Add Student \u25cf Update Student \u25cf Delete Student \u25cf Search Student \u25cf Filter Students Concepts Used \u25cf React...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "System\n \nFeatures \n\u25cf Add Student \u25cf Update Student \u25cf Delete Student \u25cf Search Student \u25cf Filter Students \nConcepts Used \n\u25cf React Router \u25cf Context API \n--- PAGE 145 ---\n\u25cf Forms \u25cf CRUD Operations",
            resources: [
              {
                id: 'res-react-unit-14-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-8',
            title: '14.8 Project 4 – E-Commerce Website',
            description: "Modules: Home Products Cart Wishlist Checkout Orders Profile React Concepts Used \u25cf Routing \u25cf Props \u25cf State \u25cf Redux Toolk...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Modules: \nHome Products Cart Wishlist Checkout Orders Profile \nReact Concepts Used \n\u25cf Routing \u25cf Props \u25cf State \u25cf Redux Toolkit \u25cf Axios \u25cf Context API \u25cf Hooks",
            resources: [
              {
                id: 'res-react-unit-14-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-9',
            title: '14.9 API Integration Architecture',
            description: "React Component \u2193 Axios \u2193 --- PAGE 146 --- REST API \u2193 Node.js Server \u2193 MongoDB \u2193 JSON Response \u2193 React UI",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React Component \u2193 Axios \u2193 \n--- PAGE 146 ---\nREST API \u2193 Node.js Server \u2193 MongoDB \u2193 JSON Response \u2193 React UI",
            resources: [
              {
                id: 'res-react-unit-14-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-10',
            title: '14.10 State Management Architecture',
            description: "User Action \u2193 Redux Dispatch \u2193 Reducer \u2193 Redux Store \u2193 React Component \u2193 Updated UI",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "User Action \u2193 Redux Dispatch \u2193 Reducer \u2193 Redux Store \u2193 React Component \u2193 Updated UI",
            resources: [
              {
                id: 'res-react-unit-14-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-11',
            title: '14.11 Authentication Flow',
            description: "--- PAGE 147 --- Login Form \u2193 API Request \u2193 Server Validation \u2193 JWT Token \u2193 Local Storage \u2193 Dashboard Access",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "--- PAGE 147 ---\nLogin Form \u2193 API Request \u2193 Server Validation \u2193 JWT Token \u2193 Local Storage \u2193 Dashboard Access",
            resources: [
              {
                id: 'res-react-unit-14-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-12',
            title: '14.12 Deployment Process',
            description: "React applications can be deployed on: \u25cf Vercel \u25cf Netlify \u25cf GitHub Pages \u25cf Firebase Hosting Deployment Steps: 1. Build t...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "React applications can be deployed on: \n\u25cf Vercel \u25cf Netlify \u25cf GitHub Pages \u25cf Firebase Hosting \nDeployment Steps: \n1. Build the application \nnpm run build \n2. Upload build files. 3. Configure hosting. 4. Publish the application.",
            resources: [
              {
                id: 'res-react-unit-14-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-13',
            title: '14.13 Best Practices',
            description: "--- PAGE 148 --- \u25cf Use reusable components. \u25cf Follow proper folder structure. \u25cf Keep components small. \u25cf Use environment...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "--- PAGE 148 ---\n\u25cf Use reusable components. \u25cf Follow proper folder structure. \u25cf Keep components small. \u25cf Use environment variables for API URLs. \u25cf Write clean code. \u25cf Handle API errors. \u25cf Optimize performance. \u25cf Use Git for version control.",
            resources: [
              {
                id: 'res-react-unit-14-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-14',
            title: '14.14 Common Mistakes',
            description: "\u274c Writing everything inside App.jsx. \u274c Ignoring folder structure. \u274c Hardcoding API URLs. \u274c Repeating components. \u274c Ignor...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u274c Writing everything inside App.jsx. \n\u274c Ignoring folder structure. \n\u274c Hardcoding API URLs. \n\u274c Repeating components. \n\u274c Ignoring responsive design. \n\u274c Not handling loading and error states. \n \nReal-Time Scenario \nA software company develops an Online Learning Platform . \nFeatures include: \n\u25cf Student Login \u25cf Course Management \u25cf Video Lectures \u25cf Assignments \u25cf Certificates \u25cf Progress Tracking \nThe React application uses: \n\u25cf React Router for navigation. \u25cf Redux Toolkit for global state. \u25cf Axios for API communication. \u25cf Context API for theme switching. \n--- PAGE 149 ---\n\u25cf Tailwind CSS for styling. \nThe application is deployed on Vercel , allowing students to access it from anywhere.",
            resources: [
              {
                id: 'res-react-unit-14-14-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-15',
            title: 'Interview Questions (Common Mistakes)',
            description: "Interview Questions - Common Mistakes 1. Why are React projects important? Answer: Projects help developers apply React ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "### Interview Questions - Common Mistakes\n\n1. Why are React projects important? \nAnswer: \nProjects help developers apply React concepts, improve problem-solving skills, build \nportfolios,\n \nand\n \nprepare\n \nfor\n \nreal-world\n \nsoftware\n \ndevelopment.\n \n \n2. What is the recommended folder structure for a React project? \nAnswer: \nA professional React project separates code into folders such as components, pages, assets, hooks, context, redux, services, utils, and styles. \n \n3. Why are reusable components important? \nAnswer: \nReusable components reduce code duplication, improve maintainability, and make \napplications\n \neasier\n \nto\n \nscale.\n \n \n4. Which React concepts are commonly used in real-world projects? \nAnswer: \nReact Router, Hooks, Context API, Redux Toolkit, API Integration (Axios/Fetch), Forms, \nConditional\n \nRendering,\n \nList\n \nRendering,\n \nand\n \nStyling.\n \n \n5. Where can React applications be deployed? \nAnswer: \n--- PAGE 150 ---\nCommon deployment platforms include Vercel , Netlify , GitHub Pages , and Firebase \nHosting\n.",
            resources: [
              {
                id: 'res-react-unit-14-15-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-14-16',
            title: 'Practical Lab (Common Mistakes)',
            description: "Practical Lab - Common Mistakes Task 1 Build a Todo Application using useState. Task 2 Create a Weather Application usin...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Common Mistakes\n\nTask 1 \nBuild a Todo Application using useState. \n \nTask 2 \nCreate a Weather Application using Axios. \n \nTask 3 \nDevelop a Student Management System with CRUD operations. \n \nTask 4 \nCreate an E-Commerce Product Listing page using React Router. \n \nTask 5 \nDeploy any React project to Vercel or Netlify.",
            readingContent: "### Practical Lab - Common Mistakes\n\nTask 1 \nBuild a Todo Application using useState. \n \nTask 2 \nCreate a Weather Application using Axios. \n \nTask 3 \nDevelop a Student Management System with CRUD operations. \n \nTask 4 \nCreate an E-Commerce Product Listing page using React Router. \n \nTask 5 \nDeploy any React project to Vercel or Netlify.",
            resources: [
              {
                id: 'res-react-unit-14-16-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'react-mod-15',
    title: 'Module 15: React Interview Preparation',
    description: "Module 15: React Interview Preparation & Best",
    duration: '195 mins',
    topics: [
      {
        id: 'react-topic-15-1',
        title: 'Module 15: React Interview Preparation Lessons',
        description: 'Lessons covering Module 15: React Interview Preparation',
        estimatedDuration: '195 mins',
        learningUnits: [
          {
            id: 'react-unit-15-1',
            title: '15.1 Introduction',
            description: "Learning React is only the first step. A successful React developer should know how to: \u25cf Explain React concepts clearly...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Learning React is only the first step. A successful React developer should know how to: \n\u25cf Explain React concepts clearly. \u25cf Build scalable applications. \u25cf Debug React applications. \u25cf Optimize performance. \u25cf Follow coding standards. \nThis module helps students prepare for technical interviews and real-world software \ndevelopment.",
            resources: [
              {
                id: 'res-react-unit-15-1-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-2',
            title: '15.2 React Revision Roadmap',
            description: "Before attending interviews, revise the following topics. React Fundamentals \u2502 \u25bc JSX \u2502 \u25bc Components \u2502 \u25bc Props \u2502 \u25bc State ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Before attending interviews, revise the following topics. \nReact Fundamentals \u2502 \u25bc JSX \u2502 \u25bc Components \u2502 \u25bc Props \u2502 \u25bc State \u2502 \u25bc Hooks \u2502 \n--- PAGE 152 ---\n \u25bc Forms \u2502 \u25bc Routing \u2502 \u25bc API Integration \u2502 \u25bc Redux Toolkit \u2502 \u25bc Projects",
            resources: [
              {
                id: 'res-react-unit-15-2-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-3',
            title: '15.3 React Interview Tips',
            description: "Before answering interview questions: \u25cf Listen carefully to the question. \u25cf Explain the concept before giving examples. ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Before answering interview questions: \n\u25cf Listen carefully to the question. \u25cf Explain the concept before giving examples. \u25cf Use real-world scenarios. \u25cf Mention best practices. \u25cf Avoid memorized definitions. \u25cf Write clean and readable code.",
            resources: [
              {
                id: 'res-react-unit-15-3-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-4',
            title: '15.4 Frequently Asked Interview',
            description: "Questions Q1. What is React? Answer: React is an open-source JavaScript library developed by Meta for building fast, int...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Questions\n \nQ1. What is React? \nAnswer: \nReact is an open-source JavaScript library developed by Meta for building fast, interactive, \nand\n \nreusable\n \nuser\n \ninterfaces\n \nusing\n \na\n \ncomponent-based\n \narchitecture.\n \n \nQ2. What are the features of React? \n--- PAGE 153 ---\nAnswer: \n\u25cf Component-Based Architecture \u25cf Virtual DOM \u25cf JSX \u25cf One-Way Data Binding \u25cf Reusable Components \u25cf Declarative UI \u25cf Strong Ecosystem \n \nQ3. What is JSX? \nAnswer: \nJSX (JavaScript XML) is a syntax extension for JavaScript that allows developers to write \nHTML-like\n \ncode\n \ninside\n \nJavaScript.\n \nIt\n \nis\n \ncompiled\n \ninto\n React.createElement() before \nexecution.\n \n \nQ4. What is Virtual DOM? \nAnswer: \nVirtual DOM is a lightweight JavaScript representation of the Real DOM. React compares \nthe\n \nprevious\n \nand\n \ncurrent\n \nVirtual\n \nDOM\n \nusing\n \nthe\n \nreconciliation\n \nalgorithm\n \nand\n \nupdates\n \nonly\n \nthe\n \nchanged\n \nelements.\n \n \nQ5. Difference Between Props and State? \nProps State \nRead-only Mutable \nParent to Child Managed by Component \nExternal Data Internal Data \nCannot be modified Can be updated \nQ6. What are React Hooks? \n--- PAGE 154 ---\nAnswer: \nHooks are special functions that allow Functional Components to use State, Lifecycle \nmethods,\n \nContext,\n \nand\n \nother\n \nReact\n \nfeatures.\n \n \nQ7. Explain useEffect. \nAnswer: \nuseEffect() performs side effects such as: \n\u25cf API Calls \u25cf Timers \u25cf Event Listeners \u25cf DOM Updates \n \nQ8. What is Context API? \nAnswer: \nContext API is React's built-in mechanism for sharing global data between components \nwithout\n \nProp\n \nDrilling.\n \n \nQ9. What is Redux Toolkit? \nAnswer: \nRedux Toolkit is the official library for managing global state in React applications with less \nboilerplate\n \ncode\n \nand\n \nbetter\n \ndeveloper\n \nexperience.\n \n \nQ10. What is React Router? \nAnswer: \nReact Router enables client-side navigation between pages without refreshing the browser. \n \n--- PAGE 155 ---",
            resources: [
              {
                id: 'res-react-unit-15-4-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-5',
            title: '15.5 Advanced Interview Questions',
            description: "Explain React Reconciliation. What is React Fiber? Explain Memoization. Difference between useMemo and useCallback. What...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Explain React Reconciliation. \nWhat is React Fiber? \nExplain Memoization. \nDifference between useMemo and useCallback. \nWhat is Lazy Loading? \nExplain Code Splitting. \nWhat is Higher Order Component (HOC)? \nWhat are Render Props? \nExplain Server-Side Rendering (SSR). \nDifference between CSR and SSR.",
            resources: [
              {
                id: 'res-react-unit-15-5-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-6',
            title: '15.6 React Coding Standards',
            description: "Professional developers follow these practices: \u25cf Use Functional Components. \u25cf Keep components small. \u25cf Follow PascalCas...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Professional developers follow these practices: \n\u25cf Use Functional Components. \u25cf Keep components small. \u25cf Follow PascalCase naming. \u25cf Organize folders properly. \u25cf Use ESLint and Prettier. \u25cf Avoid duplicate code. \u25cf Write reusable components.",
            resources: [
              {
                id: 'res-react-unit-15-6-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-7',
            title: '15.7 Performance Optimization',
            description: "Large React applications require optimization. Techniques include: --- PAGE 156 --- \u25cf React.memo() \u25cf useMemo() \u25cf useCall...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Large React applications require optimization. \nTechniques include: \n--- PAGE 156 ---\n\u25cf React.memo() \u25cf useMemo() \u25cf useCallback() \u25cf Lazy Loading \u25cf Code Splitting \u25cf Image Optimization \u25cf Virtualization for large lists \n \nPerformance Flow User Action \u2502 \u25bc Component Render \u2502 \u25bc Optimization \u2502 \u25bc Faster Rendering",
            resources: [
              {
                id: 'res-react-unit-15-7-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-8',
            title: '15.8 Common Interview Coding',
            description: "Questions Practice building: \u25cf Counter App \u25cf Todo List \u25cf Login Form \u25cf Calculator \u25cf Weather App \u25cf Product Search \u25cf Studen...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Questions\n \nPractice building: \n\u25cf Counter App \u25cf Todo List \u25cf Login Form \u25cf Calculator \u25cf Weather App \u25cf Product Search \u25cf Student Management \u25cf Notes Application \u25cf Shopping Cart \u25cf Quiz Application",
            resources: [
              {
                id: 'res-react-unit-15-8-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-9',
            title: '15.9 Common Mistakes by Beginners',
            description: "--- PAGE 157 --- \u274c Writing everything inside App.jsx \u274c Ignoring folder structure \u274c Using too many State variables \u274c Not ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "--- PAGE 157 ---\n\u274c Writing everything inside App.jsx \n\u274c Ignoring folder structure \n\u274c Using too many State variables \n\u274c Not handling API errors \n\u274c Hardcoding values \n\u274c Ignoring reusable components \n\u274c Not using unique Keys \n\u274c Directly modifying State",
            resources: [
              {
                id: 'res-react-unit-15-9-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-10',
            title: '15.10 Best Practices',
            description: "\u25cf Use reusable components. \u25cf Keep State minimal. \u25cf Handle Loading and Error states. \u25cf Write meaningful component names. ...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "\u25cf Use reusable components. \u25cf Keep State minimal. \u25cf Handle Loading and Error states. \u25cf Write meaningful component names. \u25cf Optimize rendering. \u25cf Follow folder structure. \u25cf Keep UI responsive. \u25cf Write clean, maintainable code.",
            resources: [
              {
                id: 'res-react-unit-15-10-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-11',
            title: '15.11 React Developer Roadmap',
            description: "HTML \u2502 \u25bc CSS \u2502 \u25bc JavaScript (ES6+) \u2502 \u25bc React Fundamentals \u2502 \u25bc Hooks --- PAGE 158 --- \u2502 \u25bc React Router \u2502 \u25bc API Integratio...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "HTML \u2502 \u25bc CSS \u2502 \u25bc JavaScript (ES6+) \u2502 \u25bc React Fundamentals \u2502 \u25bc Hooks \n--- PAGE 158 ---\n \u2502 \u25bc React Router \u2502 \u25bc API Integration \u2502 \u25bc Context API \u2502 \u25bc Redux Toolkit \u2502 \u25bc Projects \u2502 \u25bc Testing \u2502 \u25bc Deployment \u2502 \u25bc Next.js",
            resources: [
              {
                id: 'res-react-unit-15-11-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-12',
            title: '15.12 Mini Capstone Project',
            description: "Develop a Learning Management System (LMS) . Features \u25cf Student Login \u25cf Course Dashboard \u25cf Video Lessons \u25cf Assignments \u25cf...",
            duration: '5 mins',
            type: 'Reading',
            readingContent: "Develop a Learning Management System (LMS) . \nFeatures \n\u25cf Student Login \u25cf Course Dashboard \u25cf Video Lessons \u25cf Assignments \u25cf Quiz Module \u25cf Progress Tracking \u25cf User Profile \u25cf Responsive Design \nTechnologies \n\u25cf React \u25cf React Router \u25cf Axios \n--- PAGE 159 ---\n\u25cf Redux Toolkit \u25cf Context API \u25cf Tailwind CSS \u25cf REST API",
            resources: [
              {
                id: 'res-react-unit-15-12-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
          {
            id: 'react-unit-15-13',
            title: 'Practical Lab (Mini Capstone Project)',
            description: "Practical Lab - Mini Capstone Project Task 1 Create a React Portfolio Website. Task 2 Optimize an existing React applica...",
            duration: '5 mins',
            type: 'Assignment',
            assignmentInstructions: "### Practical Lab - Mini Capstone Project\n\nTask 1 \nCreate a React Portfolio Website. \n \nTask 2 \nOptimize an existing React application using React.memo() and useMemo(). \n \nTask 3 \nImplement Lazy Loading for a page. \n \nTask 4 \nCreate reusable UI components. \n \nTask 5 \nDeploy a React application on Vercel or Netlify.",
            readingContent: "### Practical Lab - Mini Capstone Project\n\nTask 1 \nCreate a React Portfolio Website. \n \nTask 2 \nOptimize an existing React application using React.memo() and useMemo(). \n \nTask 3 \nImplement Lazy Loading for a page. \n \nTask 4 \nCreate reusable UI components. \n \nTask 5 \nDeploy a React application on Vercel or Netlify.",
            resources: [
              {
                id: 'res-react-unit-15-13-doc',
                name: 'Official React Documentation.pdf',
                description: 'Official API guides and documentation references.',
                category: 'PDF',
                fileSize: '850 KB',
                downloadPermission: true
              }
            ]
          },
        ]
      }
    ]
  },
];
