# SHAIVIKA LMS AI Platform

## Project Overview
The SHAIVIKA LMS AI Platform is a scalable, enterprise-grade Learning Management System powered by AI. It is designed to provide high-quality, interactive, and personalized educational experiences. The initial focus of the platform includes deep-dive technical courses such as Linux system administration and Git & GitHub version control, with future architectural considerations for scaling into various other domains and AI-driven enhancements.

## Vision
To build a globally accessible, intelligent learning platform that adapts to individual student learning curves, providing AI-powered tutoring, automated assessments, and real-time insights to both educators and learners.

## Features
- **AI-Powered Learning Assistance**: Integrated AI chat and tutoring capabilities to support students.
- **Enterprise-Grade Architecture**: Modular, scalable backend services.
- **Interactive Technical Courses**: Dedicated focus on Linux, Git, and GitHub for the initial rollout.
- **Responsive UI/UX**: Built with modern web technologies for a seamless cross-device experience.
- **Comprehensive Knowledge Base**: Centralized, version-controlled markdown knowledge resources for platform documentation and course materials.

## Technology Stack
### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Code Quality**: ESLint, Prettier

### Backend
- **Environment**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Architecture**: Modular and Microservices-ready

## Folder Structure
```text
shaivika-lms-ai/
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express.js backend services
├── docs/              # Project documentation (Architecture, API, Database, Roadmap)
├── knowledge-base/    # Markdown-based course materials and learning resources
│   ├── github/
│   └── linux/
├── shared/            # Shared code across frontend and backend
│   ├── constants/
│   ├── types/
│   ├── interfaces/
│   └── utilities/
├── .github/           # GitHub Actions workflows and templates
├── scripts/           # CI/CD and utility deployment scripts
├── .gitignore         # Ignored files and folders
├── LICENSE            # Project license
├── README.md          # Project overview (this file)
└── package.json       # Monorepo configuration and workspace scripts
```

## Installation
*(Note: Application code is currently in the scaffolding phase. These steps will become active once the initial services are populated.)*

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/shaivika-lms-ai.git
   cd shaivika-lms-ai
   ```

2. **Install monorepo dependencies:**
   ```bash
   npm install
   ```

3. **Install frontend and backend dependencies:**
   *(Handled automatically via npm workspaces, or you can navigate and install manually)*

## Development Workflow
1. **Branching Strategy**: Use standard Git Flow (e.g., `feature/`, `bugfix/`, `hotfix/`).
2. **Local Development**:
   - Run `npm run dev:frontend` to start the Vite server.
   - Run `npm run dev:backend` to start the Node server.
   - Run `npm run dev` to start both concurrently.
3. **Linting and Formatting**: Ensure all code passes `npm run lint` and `npm run format` before pushing.

## Roadmap
See [docs/Roadmap.md](docs/Roadmap.md) for detailed future plans and milestone tracking.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contribution Guide
We welcome contributions! Please review our contribution guidelines (to be added) before submitting a pull request.
"# shaivika-AI-LMS-platform-" 
