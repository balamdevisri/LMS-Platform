import { auth, db } from '@/firebase';
import { doc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import type { ICourse, CreateCourseDTO, UpdateCourseDTO, CourseFilterOptions, CoursePaginationResult, CourseLevel, CourseStatus } from '../../../shared/types/course';
export type { ICourse };
import { gitCourseModules } from '@/data/gitCourseFullData';
import { kubernetesCourseModules } from '@/data/kubernetesCourseFullData';
import { reactCourseModules } from '@/data/reactCourseFullData';
import { cCourseModules } from '@/data/cCourseFullData';
import { pythonCourseModules } from '@/data/pythonCourseFullData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_COURSES: ICourse[] = [
  {
    id: 'course_linux_101',
    title: 'Linux Systems & Administration Mastery',
    slug: 'linux-systems-administration-mastery',
    shortDescription: 'Enterprise curriculum covering Linux Architecture, Kernel Mechanics, Permissions, Systemd, Bash Scripting, and SSH Security.',
    description: `Welcome to Linux Systems & Administration Mastery! Linux powers modern cloud infrastructure, supercomputers, and enterprise AI clusters. In this comprehensive production-ready track, you will explore Linux Kernel mechanics, master file system hierarchy standards (FHS), manage systemd background daemons, automate workflows via Bash scripts, and harden network security using SSH and host firewalls.`,
    thumbnail: '/assets/images/linux_course_thumbnail.webp',
    banner: '/assets/images/linux_os_architecture.webp',
    category: 'Linux & Systems',
    level: 'all_levels',
    duration: '32 hrs',
    language: 'English',
    price: 0,
    instructor: {
      id: 'inst_kaizenq',
      name: 'KaizenQ Systems Team',
      role: 'Linux Systems Architect & LMS Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills: ['Linux CLI', 'Kernel Mechanics', 'Systemd Services', 'POSIX & ACL Permissions', 'Bash Automation', 'SSH & Firewall Security'],
    prerequisites: ['Basic computer literacy', 'Terminal awareness is helpful but not required'],
    learningOutcomes: [
      'Understand Monolithic Kernel architecture, LKMs, and System Call execution',
      'Manage User & Group security permissions using octal notation and ACLs',
      'Control system daemons using systemctl and inspect binary logs with journalctl',
      'Write modular Bash automation scripts with control loops and position arguments',
      'Harden remote SSH daemons and configure UFW firewall rules',
    ],
    status: 'published',
    visibility: 'public',
    featured: true,
    tags: ['linux', 'sysadmin', 'bash', 'kernel', 'devops', 'security'],
    enrollmentCount: 3,
    rating: 5.0,
    ratingCount: 145,
    syllabus: [
      {
        id: 'm1',
        title: '🟢 Module 1: Linux Architecture, Kernel & CLI Fundamentals',
        description: 'OS Fundamentals, Kernel Mechanics (LKMs, Syscalls), Directory Navigation, Text Editors (Vim/Nano), and I/O Pipelines.',
        duration: '6 hrs 30 mins',
        lessonsCount: 5,
      },
      {
        id: 'm2',
        title: '🟡 Module 2: File System Hierarchy, Permissions & Ownership',
        description: 'Filesystem Hierarchy Standard (FHS), User & Group Administration, Octal Permission Matrix, and ACL Security.',
        duration: '8 hrs 15 mins',
        lessonsCount: 4,
      },
      {
        id: 'm3',
        title: '🔵 Module 3: Process Management, Log Analysis & Real-World Command Challenges',
        description: 'Resource 7 (Linux Log Analysis Dataset: system.log, auth.log, apache.log, nginx.log, access.log, error.log) & Resource 8 (Real-World Command Challenges: largest file, failed logins, email extraction, error filtering & reports).',
        duration: '9 hrs 45 mins',
        lessonsCount: 5,
      },
      {
        id: 'm4',
        title: '🔴 Module 4: Bash Scripting, Networking & Security Hardening',
        description: 'Bash Script Control Structures, IP Networking Diagnostics, SSH Cryptographic Keys, and Host Firewall Hardening.',
        duration: '7 hrs 30 mins',
        lessonsCount: 4,
      },
    ],
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-02-10').toISOString(),
  },
  {
    id: 'git-github-mastery',
    title: 'Git & GitHub Mastery',
    slug: 'git-github-mastery',
    shortDescription: 'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, and CI/CD.',
    description: 'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, GitHub Actions, CI/CD, Codespaces, and Copilot.',
    thumbnail: '/assets/images/github_course_banner.webp',
    banner: '/assets/images/github_course_banner.webp',
    category: 'Development Tools',
    level: 'all_levels',
    duration: '20 Hours',
    language: 'English',
    price: 0,
    instructor: {
      id: 'inst_kaizen',
      name: 'Kaizen Q Team',
      role: 'Senior Technical Instructor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills: ['Git CLI', 'Version Control', 'GitHub Actions', 'Codespaces', 'Semantic Versioning'],
    prerequisites: ['Basic computer literacy'],
    learningOutcomes: [
      'Master version control concepts and the local Git commit cycle',
      'Create pull requests and manage collaborative branching strategies',
      'Build continuous integration pipelines using GitHub Actions',
      'Manage issues, milestones, and Kanban boards with GitHub Projects'
    ],
    status: 'published',
    visibility: 'public',
    featured: true,
    tags: ['git', 'github', 'devops', 'version-control'],
    enrollmentCount: 180,
    rating: 5.0,
    ratingCount: 180,
    syllabus: [
      { id: 'git-mod-1', title: 'Module 1: Introduction to Version Control, Git & GitHub', description: 'Introduction to Version Control, Git & GitHub', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-2', title: 'Module 2: Installing Git and Initial Configuration', description: 'Installing Git and Initial Configuration', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-3', title: 'Module 3: Git Repository Fundamentals', description: 'Git Repository Fundamentals', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-4', title: 'Module 4: Basic Git Commands', description: 'Basic Git Commands', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-5', title: 'Module 5: Branching and Merging', description: 'Branching and Merging', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-6', title: 'Module 6: GitHub Basics', description: 'GitHub Basics', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-7', title: 'Module 7: Remote Repository Management', description: 'Remote Repository Management', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-8', title: 'Module 8: Git Collaboration', description: 'Git Collaboration', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-9', title: 'Module 9: Advanced Git Commands', description: 'Advanced Git Commands', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-10', title: 'Module 10: Git Internals', description: 'Git Internals', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-11', title: 'Module 11: GitHub Features', description: 'GitHub Features', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-12', title: 'Module 12: Git Best Practices', description: 'Git Best Practices', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-13', title: 'Module 13: Real-World Git Workflow', description: 'Real-World Git Workflow', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-14', title: 'Module 14: Git & GitHub Projects', description: 'Git & GitHub Projects', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-15', title: 'Module 15: Git & GitHub Interview Preparation', description: 'Git & GitHub Interview Preparation', duration: '1 Hour', lessonsCount: 1 }
    ],
    modules: gitCourseModules,
    createdAt: new Date('2026-01-20').toISOString(),
    updatedAt: new Date('2026-02-15').toISOString(),
  },
  {
    id: 'database-management-system',
    title: 'Database Management System (DBMS): Beginner to Advanced',
    slug: 'database-management-system',
    shortDescription: 'Learn Database Management System from fundamentals to advanced concepts including SQL, normalization, transactions, database design, optimization, and real-world projects.',
    description: 'Learn Database Management System from fundamentals to advanced concepts including SQL, normalization, transactions, database design, optimization, and real-world projects.',
    thumbnail: '/assets/images/dbms_course_thumbnail.png',
    banner: '/assets/images/dbms_course_thumbnail.png',
    category: 'Database',
    level: 'all_levels',
    duration: '25 Hours',
    language: 'English',
    price: 0,
    instructor: {
      id: 'inst_kaizen',
      name: 'Kaizen-Q Academy',
      role: 'Database Systems Specialists',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills: ['Database Design', 'SQL Queries', 'Relational Model', 'Normalization (1NF-BCNF)', 'Transactions & ACID', 'Database Security'],
    prerequisites: ['Basic computer literacy'],
    learningOutcomes: [
      'Understand relational database design and normalization rules',
      'Write efficient SQL queries including joins, aggregations, and subqueries',
      'Handle database transactions and ACID properties',
      'Build real-world database projects from scratch'
    ],
    status: 'published',
    visibility: 'public',
    featured: true,
    tags: ['database', 'dbms', 'sql', 'normalization', 'acid'],
    enrollmentCount: 0,
    rating: 5.0,
    ratingCount: 120,
    syllabus: [
      { id: 'dbms-mod-1', title: 'Module 1 - Database Fundamentals', description: 'Fundamentals of databases, DBMS vs File System, advantages, and database types.', duration: '4 Hours', lessonsCount: 8 },
      { id: 'dbms-mod-2', title: 'Module 2 - Relational Database Concepts', description: 'Tables, keys, constraints, ER model and diagram.', duration: '4 Hours', lessonsCount: 7 },
      { id: 'dbms-mod-3', title: 'Module 3 - SQL Fundamentals', description: 'DDL, DML, and core query syntax.', duration: '4 Hours', lessonsCount: 10 },
      { id: 'dbms-mod-4', title: 'Module 4 - Advanced SQL', description: 'Joins, aggregations, subqueries, views, and indexes.', duration: '4 Hours', lessonsCount: 9 },
      { id: 'dbms-mod-5', title: 'Module 5 - Database Design', description: 'Functional dependencies, normalization, transactions, concurrency, and security.', duration: '5 Hours', lessonsCount: 8 },
      { id: 'dbms-mod-6', title: 'Module 6 - Real World Database Project', description: 'Creating production databases for real-world scenarios and final assessment.', duration: '4 Hours', lessonsCount: 6 }
    ],
    modules: [
      {
        id: 'dbms-mod-1',
        title: 'Module 1 - Database Fundamentals',
        description: 'Fundamentals of databases, DBMS vs File System, advantages, and database types.',
        duration: '4 Hours',
        topics: [
          {
            id: 'dbms-topic-1-1',
            title: 'Database Fundamentals',
            description: 'Introduction to data, databases, and DBMS.',
            estimatedDuration: '120 mins',
            learningUnits: [
              { id: 'dbms-unit-1-1-1', title: 'What is Data?', description: 'Concept of data, information, and metadata.', duration: '15 mins', type: 'Reading' },
              { id: 'dbms-unit-1-1-2', title: 'What is Database?', description: 'Structure and purpose of a database.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-1-1-3', title: 'DBMS Introduction', description: 'What is a Database Management System?', duration: '25 mins', type: 'Reading' },
              { id: 'dbms-unit-1-1-4', title: 'Database vs File System', description: 'Comparing traditional file storage vs DBMS.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-1-1-5', title: 'Advantages of DBMS', description: 'Data integrity, security, and redundancy management.', duration: '15 mins', type: 'Reading' },
              { id: 'dbms-unit-1-1-6', title: 'Types of Databases', description: 'Relational, NoSQL, NewSQL, Graph, and Document DBs.', duration: '15 mins', type: 'Quiz' },
              { id: 'dbms-unit-1-1-7', title: 'Practice Terminal (For Practice Only)', description: 'Simulated environment for basic DB connection exercises.', duration: '10 mins', type: 'Assignment' },
              { id: 'dbms-unit-1-1-8', title: 'Module Notes', description: 'Comprehensive reading notes for Module 1.', duration: '20 mins', type: 'Reading' }
            ]
          }
        ]
      },
      {
        id: 'dbms-mod-2',
        title: 'Module 2 - Relational Database Concepts',
        description: 'Tables, keys, constraints, ER model and diagram.',
        duration: '4 Hours',
        topics: [
          {
            id: 'dbms-topic-2-1',
            title: 'Relational Model & Design',
            description: 'Keys, constraints, and entity-relationship modelling.',
            estimatedDuration: '120 mins',
            learningUnits: [
              { id: 'dbms-unit-2-1-1', title: 'Tables, Rows & Columns', description: 'Introduction to relational schemas.', duration: '15 mins', type: 'Reading' },
              { id: 'dbms-unit-2-1-2', title: 'Keys', description: 'Primary keys, candidate keys, foreign keys, super keys.', duration: '25 mins', type: 'Video' },
              { id: 'dbms-unit-2-1-3', title: 'Constraints', description: 'Domain, entity integrity, and referential integrity constraints.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-2-1-4', title: 'ER Model', description: 'Entity, Attribute, Relationship sets.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-2-1-5', title: 'ER Diagram', description: 'Drawing entity-relationship diagrams.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-2-1-6', title: 'Practice Terminal (For Practice Only)', description: 'Draw ER schema diagrams or model schemas.', duration: '15 mins', type: 'Assignment' },
              { id: 'dbms-unit-2-1-7', title: 'Module Notes', description: 'Comprehensive reading notes for Module 2.', duration: '20 mins', type: 'Reading' }
            ]
          }
        ]
      },
      {
        id: 'dbms-mod-3',
        title: 'Module 3 - SQL Fundamentals',
        description: 'DDL, DML, and core query syntax.',
        duration: '4 Hours',
        topics: [
          {
            id: 'dbms-topic-3-1',
            title: 'Structured Query Language (SQL)',
            description: 'Fundamental SQL queries and modifications.',
            estimatedDuration: '120 mins',
            learningUnits: [
              { id: 'dbms-unit-3-1-1', title: 'SQL Introduction', description: 'Introduction to SQL syntax.', duration: '15 mins', type: 'Reading' },
              { id: 'dbms-unit-3-1-2', title: 'CREATE', description: 'Creating tables and databases.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-3', title: 'INSERT', description: 'Adding records to tables.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-4', title: 'SELECT', description: 'Retrieving data from tables.', duration: '25 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-5', title: 'UPDATE', description: 'Modifying existing records.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-6', title: 'DELETE', description: 'Deleting records from tables.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-7', title: 'WHERE', description: 'Filtering records using conditional statements.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-8', title: 'ORDER BY', description: 'Sorting query results.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-3-1-9', title: 'Practice Terminal (For Practice Only)', description: 'Simulated SQL execution terminal exercises.', duration: '20 mins', type: 'Assignment' },
              { id: 'dbms-unit-3-1-10', title: 'Module Notes', description: 'Comprehensive reading notes for Module 3.', duration: '20 mins', type: 'Reading' }
            ]
          }
        ]
      },
      {
        id: 'dbms-mod-4',
        title: 'Module 4 - Advanced SQL',
        description: 'Joins, aggregations, subqueries, views, and indexes.',
        duration: '4 Hours',
        topics: [
          {
            id: 'dbms-topic-4-1',
            title: 'Advanced SQL Querying',
            description: 'Complex queries, joining tables, and database efficiency.',
            estimatedDuration: '120 mins',
            learningUnits: [
              { id: 'dbms-unit-4-1-1', title: 'GROUP BY', description: 'Aggregating rows.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-2', title: 'HAVING', description: 'Filtering aggregated rows.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-3', title: 'JOINS', description: 'Inner join, outer joins, cross join.', duration: '30 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-4', title: 'UNION', description: 'Combining query result sets.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-5', title: 'Subqueries', description: 'Nested and correlated subqueries.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-6', title: 'Views', description: 'Creating virtual tables.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-7', title: 'Indexes', description: 'Improving database search speed.', duration: '20 mins', type: 'Video' },
              { id: 'dbms-unit-4-1-8', title: 'Practice Terminal (For Practice Only)', description: 'Execute complex multi-table joins.', duration: '20 mins', type: 'Assignment' },
              { id: 'dbms-unit-4-1-9', title: 'Module Notes', description: 'Comprehensive reading notes for Module 4.', duration: '20 mins', type: 'Reading' }
            ]
          }
        ]
      },
      {
        id: 'dbms-mod-5',
        title: 'Module 5 - Database Design',
        description: 'Functional dependencies, normalization, transactions, concurrency, and security.',
        duration: '5 Hours',
        topics: [
          {
            id: 'dbms-topic-5-1',
            title: 'Normalization & Transactions',
            description: 'Designing anomalies out of databases and transactional safety.',
            estimatedDuration: '150 mins',
            learningUnits: [
              { id: 'dbms-unit-5-1-1', title: 'Functional Dependency', description: 'A determines B dependency concepts.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-5-1-2', title: 'Normalization', description: '1NF, 2NF, 3NF, BCNF.', duration: '30 mins', type: 'Video' },
              { id: 'dbms-unit-5-1-3', title: 'Transactions', description: 'Introduction to database transactions.', duration: '15 mins', type: 'Video' },
              { id: 'dbms-unit-5-1-4', title: 'ACID Properties', description: 'Atomicity, Consistency, Isolation, Durability.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-5-1-5', title: 'Concurrency Control', description: 'Locks, serializability, and deadlocks.', duration: '25 mins', type: 'Reading' },
              { id: 'dbms-unit-5-1-6', title: 'Database Security', description: 'Privileges, SQL injection protection, and backup policies.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-5-1-7', title: 'Practice Terminal (For Practice Only)', description: 'Transaction isolation level tests.', duration: '20 mins', type: 'Assignment' },
              { id: 'dbms-unit-5-1-8', title: 'Module Notes', description: 'Comprehensive reading notes for Module 5.', duration: '20 mins', type: 'Reading' }
            ]
          }
        ]
      },
      {
        id: 'dbms-mod-6',
        title: 'Module 6 - Real World Database Project',
        description: 'Creating production databases for real-world scenarios and final assessment.',
        duration: '4 Hours',
        topics: [
          {
            id: 'dbms-topic-6-1',
            title: 'Database Capstones',
            description: 'Hands-on projects and final evaluations.',
            estimatedDuration: '120 mins',
            learningUnits: [
              { id: 'dbms-unit-6-1-1', title: 'Student Management System', description: 'Designing student registration schema.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-6-1-2', title: 'Library Management System', description: 'Modeling book inventory and borrowing schemas.', duration: '20 mins', type: 'Reading' },
              { id: 'dbms-unit-6-1-3', title: 'E-Commerce Database', description: 'Creating orders, products, and user schemas.', duration: '30 mins', type: 'Reading' },
              { id: 'dbms-unit-6-1-4', title: 'SQL Mini Project', description: 'Implementation of the capstone schemas.', duration: '40 mins', type: 'Assignment' },
              { id: 'dbms-unit-6-1-5', title: 'Final Assessment', description: 'DBMS course comprehensive examination.', duration: '30 mins', type: 'Quiz' },
              { id: 'dbms-unit-6-1-6', title: 'Course Completion', description: 'Verify completion status and unlock certificate.', duration: '10 mins', type: 'Reading' }
            ]
          }
        ]
      }
    ],
    createdAt: new Date('2026-03-01').toISOString(),
    updatedAt: new Date('2026-03-05').toISOString(),
  },
  {
    id: 'kubernetes-complete-course-beginner-to-advanced',
    title: 'Kubernetes Complete Course – Beginner to Advanced',
    slug: 'kubernetes-complete-course-beginner-to-advanced',
    shortDescription: 'Learn Kubernetes from the fundamentals to production-level deployment through practical, hands-on learning.',
    description: 'Learn Kubernetes from the fundamentals to production-level deployment through practical, hands-on learning. Understand Kubernetes architecture, Pods, Deployments, Services, Networking, Storage, Security, Scheduling, Helm, CI/CD, and real-world application deployment.',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    category: 'DevOps / Cloud / Containers',
    level: 'all_levels',
    duration: '30 Hours',
    language: 'English',
    price: 0,
    instructor: {
      id: 'inst_kaizen',
      name: 'Kaizen-Q Academy',
      role: 'DevOps & Cloud Engineers',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills: ['Kubernetes', 'Docker', 'kubectl', 'Minikube', 'Helm', 'CI/CD'],
    prerequisites: ['Basic Linux commands', 'Basic Docker knowledge', 'Basic networking concepts', 'Basic YAML knowledge'],
    learningOutcomes: [
      'Understand Kubernetes architecture and core worker components',
      'Deploy and scale applications using Pods, ReplicaSets, and Deployments',
      'Expose applications with ClusterIP, NodePort, LoadBalancer Services and Ingress',
      'Manage persistent storage with PersistentVolumes and Claims',
      'Secure clusters using ServiceAccounts, RBAC, and Security Contexts',
      'Deploy microservices in cloud Kubernetes clusters using CI/CD and Helm'
    ],
    status: 'published',
    visibility: 'public',
    featured: true,
    tags: ['kubernetes', 'k8s', 'devops', 'docker', 'containers', 'helm'],
    enrollmentCount: 0,
    rating: 5.0,
    ratingCount: 100,
    syllabus: [
      { id: 'k8s-mod-1', title: 'Module 1 — Kubernetes Basics', description: 'Learn container orchestration fundamentals, Kubernetes architecture components, YAML objects, cluster setup using Minikube, and basic kubectl operations.', duration: '5 Hours', lessonsCount: 7 },
      { id: 'k8s-mod-2', title: 'Module 2 — Pods & Deployments', description: 'Master pod life cycles, labels/selectors, deployments, scaling, rolling updates, cron jobs, and health check probes.', duration: '6 Hours', lessonsCount: 8 },
      { id: 'k8s-mod-3', title: 'Module 3 — Networking & Services', description: 'Learn pod-to-pod networking, service abstractions (ClusterIP, NodePort, LoadBalancer), DNS routing, Ingress config, and Network Policies.', duration: '5 Hours', lessonsCount: 7 },
      { id: 'k8s-mod-4', title: 'Module 4 — Configuration & Storage', description: 'Learn ConfigMaps, Secrets, persistent volumes (PV, PVC), storage classes, dynamic provisioning, and resource requests/limits.', duration: '6 Hours', lessonsCount: 8 },
      { id: 'k8s-mod-5', title: 'Module 5 — Security & Administration', description: 'Master ServiceAccounts, Role-Based Access Control (RBAC), security contexts, scheduling nodes (Selector, Taints, Tolerations, Affinity), and troubleshooting failed deployments.', duration: '6 Hours', lessonsCount: 8 },
      { id: 'k8s-mod-6', title: 'Module 6 — Production & DevOps', description: 'Learn production guidelines, Horizontal Pod Autoscaler (HPA), Helm package management, CI/CD pipelines, managed cloud engines, and deploy a full-stack project.', duration: '6 Hours', lessonsCount: 8 }
    ],
    modules: kubernetesCourseModules,
    createdAt: new Date('2026-08-08').toISOString(),
    updatedAt: new Date('2026-08-08').toISOString(),
  },
  {
    id: 'react-js-complete-course',
    title: 'React JS Complete Course',
    slug: 'react-js-complete-course',
    shortDescription: 'A complete beginner-to-advanced React JS course covering React fundamentals, environment setup, Hooks, Routing, APIs, Redux, and styling.',
    description: 'A complete beginner-to-advanced React JS course covering React fundamentals, development environment setup, JSX, components, props, state, hooks, events, forms, conditional rendering, routing, API integration, state management, styling, real-time projects, and interview preparation.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    category: 'Web Development / Frontend Development',
    level: 'all_levels',
    duration: '24 Hours',
    language: 'English',
    price: 0,
    instructor: {
      id: 'inst_kaizenq',
      name: 'KaizenQ Systems Team',
      role: 'React Systems Architect & LMS Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills: ['React JS', 'JavaScript', 'JSX', 'Hooks', 'Redux Toolkit', 'Tailwind CSS'],
    prerequisites: ['Basic HTML, CSS, and intermediate JavaScript (ES6+) knowledge'],
    learningOutcomes: [
      'Understand Component-Based Architecture and the Virtual DOM rendering cycle',
      'Use JSX expressions, fragments, and conditional rendering operators',
      'Manage local state with useState and leverage useEffect for lifecycle hooks',
      'Coordinate routing using BrowserRouter, Routes, Route, and useNavigate',
      'Perform remote API fetches and integration using Axios',
      'Implement global state management via the Context API and Redux Toolkit',
    ],
    status: 'published',
    visibility: 'public',
    featured: true,
    tags: ['react', 'frontend', 'javascript', 'webdev', 'redux', 'tailwind'],
    enrollmentCount: 0,
    rating: 5.0,
    ratingCount: 0,
    syllabus: [
      { id: 'react-mod-1', title: 'Module 1: Introduction to React JS', description: 'What is React, history, features, advantages/disadvantages, React vs JS, ecosystem.', duration: '4 Hours', lessonsCount: 13 },
      { id: 'react-mod-2', title: 'Module 2: Setting Up React Environment', description: 'Node.js, npm, VS Code, Vite, CRA, folder structure, running projects, errors.', duration: '4 Hours', lessonsCount: 16 },
      { id: 'react-mod-3', title: 'Module 3: JSX (JavaScript XML)', description: 'JSX syntax, compilation, expressions, rendering, JSX vs HTML, lab.', duration: '4 Hours', lessonsCount: 14 },
      { id: 'react-mod-4', title: 'Module 4: React Components', description: 'Functional vs Class Components, architecture, rules, composition, lifecycle, lab.', duration: '4 Hours', lessonsCount: 15 },
      { id: 'react-mod-5', title: 'Module 5: React Props', description: 'Passing data, destructuring, data types, read-only, props vs state, examples, lab.', duration: '4 Hours', lessonsCount: 15 },
      { id: 'react-mod-6', title: 'Module 6: React State & Hooks', description: 'useState hook, updating state, arrays & objects, re-rendering, best practices.', duration: '4 Hours', lessonsCount: 14 },
      { id: 'react-mod-7', title: 'Module 7: React Events & Forms', description: 'Event handling, synthetic events, forms, controlled vs uncontrolled, validation.', duration: '4 Hours', lessonsCount: 16 },
      { id: 'react-mod-8', title: 'Module 8: Lists & Conditional Rendering', description: 'map(), keys, if/else, ternary operator, logical && operator, exercises.', duration: '4 Hours', lessonsCount: 15 },
      { id: 'react-mod-9', title: 'Module 9: React Hooks', description: 'useState, useEffect, useRef, useMemo, useCallback, custom hooks, practices.', duration: '4 Hours', lessonsCount: 13 },
      { id: 'react-mod-10', title: 'Module 10: React Router', description: 'BrowserRouter, Routes, Route, Link, useNavigate, parameter routing, route guards.', duration: '4 Hours', lessonsCount: 15 },
      { id: 'react-mod-11', title: 'Module 11: API Integration', description: 'Fetch, Axios, GET & POST requests, loading/error states, CRUD, architecture.', duration: '4 Hours', lessonsCount: 16 },
      { id: 'react-mod-12', title: 'Module 12: State Management', description: 'Context API, Redux basics, Redux Toolkit (store, actions, reducers, dispatch).', duration: '4 Hours', lessonsCount: 12 },
      { id: 'react-mod-13', title: 'Module 13: Styling React', description: 'CSS modules, Inline styles, Bootstrap, Tailwind CSS, Styled Components, responsive.', duration: '4 Hours', lessonsCount: 14 },
      { id: 'react-mod-14', title: 'Module 14: Real-Time Projects', description: 'Building Todo App, Weather App, Notes App, Student Management, and E-commerce UI.', duration: '4 Hours', lessonsCount: 16 },
      { id: 'react-mod-15', title: 'Module 15: Interview Preparation', description: 'Interview Q&A, cheat sheets, common errors, capstone ideas, roadmap.', duration: '4 Hours', lessonsCount: 13 },
    ],
    modules: reactCourseModules,
    createdAt: new Date('2026-08-08').toISOString(),
    updatedAt: new Date('2026-08-08').toISOString(),
  },
  {
    id: 'c-programming-course-id',
    title: 'C Programming',
    slug: 'c-programming',
    shortDescription: 'Complete C Programming course covering fundamentals, programming concepts, advanced C, data structures, practical programs, interview preparation, and final revision.',
    description: 'Complete C Programming course covering fundamentals, programming concepts, advanced C, data structures, practical programs, interview preparation, and final revision.',
    thumbnail: '/assets/images/c_course_thumbnail.png',
    banner: '/assets/images/c_course_thumbnail.png',
    category: 'Programming',
    level: 'all_levels',
    duration: '35 Hours',
    language: 'English',
    price: 0,
    instructor: {
      id: 'inst_kaizen',
      name: 'Kaizen Q Team',
      role: 'Senior Technical Instructor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills: ['C Programming', 'Pointers', 'Dynamic Memory', 'File Handling', 'Data Structures', 'Preprocessors'],
    prerequisites: ['Basic computer knowledge'],
    learningOutcomes: [
      'Understand C fundamentals, compiler mechanics, variables and data types',
      'Master control flow, loops, functions and recursion in C',
      'Harness pointers, arrays, strings and dynamic memory allocation',
      'Implement data structures like lists, stacks, and queues, and manage files'
    ],
    status: 'published',
    visibility: 'public',
    featured: true,
    tags: ['c', 'programming', 'basics', 'pointers', 'data-structures'],
    enrollmentCount: 180,
    rating: 5.0,
    ratingCount: 180,
    syllabus: [
      { id: 'c-mod-1', title: 'Module 1: Introduction to C Programming', description: 'History of C, Features, Applications, C program structure, Compilation process, First C program.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'c-mod-2', title: 'Module 2: Variables, Constants & Data Types', description: 'Variables, Constants, int, float, char, double, Type conversion.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'c-mod-3', title: 'Module 3: Operators & Expressions', description: 'Arithmetic, Relational, Logical, Assignment, Increment/Decrement, Bitwise operators.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'c-mod-4', title: 'Module 4: Input, Output & Decision-Making Statements', description: 'printf(), scanf(), if, if-else, Nested conditions.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'c-mod-5', title: 'Module 5: Loops & Iteration', description: 'for, while, do-while, Nested loops, break, continue.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'c-mod-6', title: 'Module 6: Functions', description: 'Function declaration, Definition, Calling, Parameters, Return values, Recursion.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'c-mod-7', title: 'Module 7: Arrays', description: 'One-dimensional arrays, Two-dimensional arrays, Array traversal, Searching, Sorting.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'c-mod-8', title: 'Module 8: Strings', description: 'Character arrays, String input/output, String functions, String manipulation.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'c-mod-9', title: 'Module 9: Pointers', description: 'Addresses, Pointer variables, Dereferencing, Pointer arithmetic, Pointers and arrays.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'c-mod-10', title: 'Module 10: Structures, Unions & Enumerations', description: 'struct, Nested structures, Array of structures, union, enum.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'c-mod-11', title: 'Module 11: Dynamic Memory Allocation', description: 'Stack vs Heap, malloc(), calloc(), realloc(), free.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'c-mod-12', title: 'Module 12: File Handling', description: 'File pointers, fopen(), fclose(), fprintf(), fscanf(), Reading/writing files.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'c-mod-13', title: 'Module 13: Preprocessor & Advanced C', description: '#include, #define, Macros, Conditional compilation, Command-line arguments, Storage classes.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'c-mod-14', title: 'Module 14: Data Structures & C Projects', description: 'Linked Lists, Stacks, Queues, Searching, Sorting, Real-world C projects.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'c-mod-15', title: 'Module 15: Advanced C Concepts & Final Revision', description: 'Important interview questions, Coding problems, Output-based questions, Debugging, Common mistakes.', duration: '3 Hours', lessonsCount: 1 }
    ],
    modules: cCourseModules,
    createdAt: new Date('2026-08-10').toISOString(),
    updatedAt: new Date('2026-08-10').toISOString(),
  },
  {
    id: 'python-through-oops-course-id',
    title: 'Python Through OOPs',
    slug: 'python-through-oops',
    shortDescription: 'Complete Python Through OOPs course covering Python fundamentals, control flow, functions, intermediate concepts, and object-oriented programming.',
    description: 'Complete Python Through OOPs course covering Python fundamentals, control flow, functions, intermediate concepts, object-oriented programming, and practical application.',
    thumbnail: '/assets/images/python_course_thumbnail.png',
    banner: '/assets/images/python_course_thumbnail.png',
    category: 'Programming',
    level: 'all_levels',
    duration: '35 Hours',
    language: 'English',
    price: 0,
    instructor: {
      id: 'inst_kaizen',
      name: 'Kaizen Q Team',
      role: 'Senior Technical Instructor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills: ['Python', 'OOP', 'Classes', 'Inheritance', 'Polymorphism', 'Exception Handling', 'File Handling'],
    prerequisites: ['Basic computer knowledge'],
    learningOutcomes: [
      'Understand Python fundamentals, variables, and data types',
      'Master control flow, conditional statements, and loops in Python',
      'Harness functions, modules, packages, and exception handling',
      'Implement object-oriented programming concept pillars (encapsulation, inheritance, polymorphism, abstraction) and projects'
    ],
    status: 'published',
    visibility: 'public',
    featured: true,
    tags: ['python', 'programming', 'basics', 'oop', 'object-oriented'],
    enrollmentCount: 180,
    rating: 5.0,
    ratingCount: 180,
    syllabus: [
      { id: 'python-mod-1', title: 'Module 1: Introduction to Python', description: 'Python features, history, environment setup, syntax, comments, keywords, case-sensitivity, and indentation.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'python-mod-2', title: 'Module 2: Variables & Data Types', description: 'Variables assignment, identifiers rules, dynamic typing, numeric/text/boolean types, and mutability vs immutability.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'python-mod-3', title: 'Module 3: Operators', description: 'Arithmetic, comparison, assignment, logical short-circuit, bitwise, membership, identity, and precedence rules.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'python-mod-4', title: 'Module 4: Input, Output & Basic Programs', description: 'Input casting, print sep/end formatting, f-strings, swapping, digit extracting, and time/interest scripts.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'python-mod-5', title: 'Module 5: Conditional Statements', description: 'If-elif-else branches, nesting, conditional expressions (ternary), truthy/falsy objects, and range/ATM checks.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'python-mod-6', title: 'Module 6: Loops', description: 'For, while loops, range step sequences, loop-else blocks, break/continue, pattern printing, and prime checkers.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'python-mod-7', title: 'Module 7: Strings', description: 'String index positive/negative, slicing, immutability, built-in string methods, checks, and formatting.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'python-mod-8', title: 'Module 8: Python Collections', description: 'Lists, tuples, sets, dictionaries definitions, methods, differences, list comprehensions, and nested collections.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'python-mod-9', title: 'Module 9: Functions', description: 'Defining functions, parameters vs arguments, return value, default params, *args, **kwargs, scope, recursion, and lambdas.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'python-mod-10', title: 'Module 10: Modules, Packages & Exception Handling', description: 'Modules import syntax, packages directory structures, try-except-else-finally blocks, raise exceptions, and asserts.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'python-mod-11', title: 'Module 11: File Handling', description: 'File streams open modes, read, readline, write, append, with context managers, seek/tell pointers, and CSV.', duration: '2 Hours', lessonsCount: 1 },
      { id: 'python-mod-12', title: 'Module 12: OOP Fundamentals', description: 'Classes, object instances, __init__ constructor, self parameter, instance vs class attributes, methods, and dunders.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'python-mod-13', title: 'Module 13: Four Pillars of OOP', description: 'Encapsulation, inheritance, polymorphism, abstraction, access qualifiers, getters/setters, super(), and abstract base classes.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'python-mod-14', title: 'Module 14: Advanced OOP in Python', description: 'Inheritance types, MRO search order algorithm, Diamond problem, class methods, static methods, and operator overloading.', duration: '3 Hours', lessonsCount: 1 },
      { id: 'python-mod-15', title: 'Module 15: Intermediate Python & OOP Project', description: 'Iterators, generators, decorators, map/filter/reduce lambdas, zip/enumerate, type hints, and student management project.', duration: '3 Hours', lessonsCount: 1 }
    ],
    modules: pythonCourseModules,
    createdAt: new Date('2026-08-11').toISOString(),
    updatedAt: new Date('2026-08-11').toISOString(),
  }
];

export interface EnrollmentRecord {
  courseId: string;
  progress: number;
  enrolledAt: string;
}

export interface XPClaimRecord {
  id: string;
  title: string;
  xp: number;
  category: 'Subtopic Completion' | 'Module Certificate' | 'AI Terminal Lab' | 'Quiz Evaluation' | 'Daily Login' | 'Module Completion Bonus';
  timestamp: string;
  courseId?: string;
  courseTitle?: string;
}

export interface CourseProgressCheckpoint {
  courseId: string;
  progressPercent: number;
  lastModuleIdx: number;
  lastLessonIdx: number;
  lastSubtopicIdx: number;
  lastSubtopicTitle?: string;
  completedSubtopics: string[];
  completedModules: number[];
  inProgressSubtopics?: string[];
  lastUpdated: string;
}

function normalizeCourseToICourse(c: any): ICourse {
  const instructorObj = typeof c.instructor === 'object' && c.instructor !== null
    ? {
        id: c.instructor.id || 'instructor-kaizen-q',
        name: c.instructor.name || 'Kaizen Q Team',
        role: c.instructor.role || 'Senior Technical Instructor',
        avatar: c.instructor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      }
    : {
        id: 'inst_default',
        name: typeof c.instructor === 'string' ? c.instructor : 'Kaizen Q Team',
        role: c.role || 'Senior Technical Instructor',
        avatar: c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };

  let normalizedStatus: CourseStatus = 'published';
  if (c.status) {
    const s = String(c.status).toLowerCase();
    if (s === 'published') normalizedStatus = 'published';
    else if (s === 'draft') normalizedStatus = 'draft';
    else if (s === 'archived') normalizedStatus = 'archived';
  }

  let normalizedLevel: CourseLevel = 'all_levels';
  if (c.level) {
    const l = String(c.level).toLowerCase();
    if (l.includes('begin') && l.includes('adv')) normalizedLevel = 'all_levels';
    else if (l.includes('all')) normalizedLevel = 'all_levels';
    else if (l.includes('begin')) normalizedLevel = 'beginner';
    else if (l.includes('inter')) normalizedLevel = 'intermediate';
    else if (l.includes('adv')) normalizedLevel = 'advanced';
    else if (['beginner', 'intermediate', 'advanced', 'all_levels'].includes(l)) normalizedLevel = l as CourseLevel;
  }

  let syllabusArray: any[] = [];
  if (c.modules && Array.isArray(c.modules)) {
    syllabusArray = c.modules.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description || '',
      lessonsCount: m.topics ? m.topics.reduce((acc: number, t: any) => acc + (t.learningUnits ? t.learningUnits.length : 0), 0) : 0,
      duration: m.duration || '4 hours'
    }));
  } else if (Array.isArray(c.syllabus)) {
    syllabusArray = c.syllabus.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        return {
          id: `m${idx + 1}`,
          title: item,
          description: '',
          lessonsCount: 4,
          duration: '8 Hours',
        };
      }
      return item;
    });
  } else if (c.title === 'Git & GitHub Mastery') {
    syllabusArray = [
      { id: 'git-mod-1', title: 'Module 1: Introduction to Version Control, Git & GitHub', description: 'Introduction to Version Control, Git & GitHub', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-2', title: 'Module 2: Installing Git and Initial Configuration', description: 'Installing Git and Initial Configuration', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-3', title: 'Module 3: Git Repository Fundamentals', description: 'Git Repository Fundamentals', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-4', title: 'Module 4: Basic Git Commands', description: 'Basic Git Commands', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-5', title: 'Module 5: Branching and Merging', description: 'Branching and Merging', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-6', title: 'Module 6: GitHub Basics', description: 'GitHub Basics', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-7', title: 'Module 7: Remote Repository Management', description: 'Remote Repository Management', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-8', title: 'Module 8: Git Collaboration', description: 'Git Collaboration', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-9', title: 'Module 9: Advanced Git Commands', description: 'Advanced Git Commands', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-10', title: 'Module 10: Git Internals', description: 'Git Internals', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-11', title: 'Module 11: GitHub Features', description: 'GitHub Features', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-12', title: 'Module 12: Git Best Practices', description: 'Git Best Practices', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-13', title: 'Module 13: Real-World Git Workflow', description: 'Real-World Git Workflow', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-14', title: 'Module 14: Git & GitHub Projects', description: 'Git & GitHub Projects', duration: '1 Hour', lessonsCount: 1 },
      { id: 'git-mod-15', title: 'Module 15: Git & GitHub Interview Preparation', description: 'Git & GitHub Interview Preparation', duration: '1 Hour', lessonsCount: 1 }
    ];
  } else {
    syllabusArray = [
      {
        id: 'm1',
        title: 'Module 1: Fundamental Concepts & Environment Setup',
        description: '',
        lessonsCount: 4,
        duration: '8 Hours',
      },
    ];
  }

  const getSmartThumbnail = (title?: string, category?: string) => {
    const t = (title || '').toLowerCase();
    const cat = (category || '').toLowerCase();
    if (t.includes('c programming') || t.includes('c language') || t === 'c') return '/assets/images/c_course_thumbnail.png';
    if (t.includes('linux') || cat.includes('linux')) return '/assets/images/linux_course_thumbnail.webp';
    if (t.includes('git') || cat.includes('git') || t.includes('github')) return '/assets/images/github_course_banner.webp';
    if (t.includes('ai') || cat.includes('ai') || t.includes('machine learning') || t.includes('llm')) return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80';
    if (t.includes('devops') || cat.includes('devops') || t.includes('cloud') || t.includes('docker')) return 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80';
    if (t.includes('react') || t.includes('web') || t.includes('javascript') || t.includes('frontend')) return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80';
    if (t.includes('python') || t.includes('oop')) return '/assets/images/python_course_thumbnail.png';
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
  };

  const courseTitle = c.title || 'Untitled Technical Course';
  const courseCategory = c.category || 'Linux & Systems';
  let courseThumbnail = (c.thumbnail && typeof c.thumbnail === 'string' && c.thumbnail.trim() !== '' && !c.thumbnail.includes('placeholder'))
    ? c.thumbnail
    : (c.banner && typeof c.banner === 'string' && c.banner.trim() !== '' && !c.banner.includes('placeholder'))
    ? c.banner
    : getSmartThumbnail(courseTitle, courseCategory);

  if (String(c.id) === 'c-programming-course-id' || courseTitle.toLowerCase().includes('c programming')) {
    courseThumbnail = '/assets/images/c_course_thumbnail.png';
  }

  if (String(c.id) === 'python-through-oops-course-id' || courseTitle.toLowerCase().includes('python')) {
    courseThumbnail = '/assets/images/python_course_thumbnail.png';
  }

  const slug = c.slug || c.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `course-${c.id}`;

  return {
    id: String(c.id),
    title: courseTitle,
    slug,
    shortDescription: c.shortDescription || c.description || 'Enterprise technical course.',
    description: c.description || 'Enterprise technical course with hands-on labs.',
    thumbnail: courseThumbnail,
    banner: c.banner || courseThumbnail,
    category: courseCategory,
    level: normalizedLevel,
    duration: c.duration || '20 hrs',
    language: c.language || 'English',
    price: typeof c.price === 'number' ? c.price : 0,
    instructor: instructorObj,
    skills: Array.isArray(c.skills) ? c.skills : [],
    prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
    learningOutcomes: Array.isArray(c.learningOutcomes) ? c.learningOutcomes : [],
    status: normalizedStatus,
    visibility: c.visibility || 'public',
    featured: Boolean(c.featured),
    tags: Array.isArray(c.tags) ? c.tags : [],
    enrollmentCount: typeof c.enrollmentCount === 'number' ? c.enrollmentCount : Number(c.students || 0),
    rating: typeof c.rating === 'number' ? c.rating : 5.0,
    ratingCount: typeof c.ratingCount === 'number' ? c.ratingCount : (typeof c.reviews === 'number' ? c.reviews : 1),
    syllabus: syllabusArray,
    modules: c.modules || [],
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  };
}

const isRemovedMockCourse = (c: any): boolean => {
  if (!c) return true;
  const id = String(c.id || '').toLowerCase();
  const slug = String(c.slug || '').toLowerCase();
  const title = String(c.title || c.name || '').toLowerCase();
  const desc = String(c.description || c.shortDescription || '').toLowerCase();

  const removedSlugs = [
    'react-from-zero-to-hero',
    'nodejs-backend-development',
    'node-js-backend-development',
    'ai-fundamentals',
    'prompt-engineering',
    'python-programming',
    'docker-kubernetes',
    'linux-essentials',
    'course_ai_llm_202',
    'course_devops_303'
  ];

  if (removedSlugs.includes(slug) || removedSlugs.includes(id)) return true;
  if (title.includes('untitled')) return true;
  if (title.includes('react') && title.includes('zero')) return true;
  if (title.includes('node.js') || title.includes('nodejs') || title.includes('backend development')) return true;
  if (title.includes('ai fundamentals') || desc.includes('gateway to the world of artificial intelligence')) return true;
  if (title.includes('prompt engineering')) return true;
  if (title.includes('python programming') && !id.includes('user')) return true;
  if (title.includes('docker') && title.includes('kubernetes')) return true;

  return false;
};

class CourseService {
  private localCacheKey = 'shaivika_courses_data';
  private enrollmentsKey = 'shaivika_user_enrollments';
  private pointsKey = 'shaivika_user_xp_points';
  private xpClaimsKey = 'shaivika_user_xp_claims';
  private checkpointKey = 'shaivika_user_checkpoint';
  private getCoursesCache: Map<string, { data: CoursePaginationResult; expiry: number }> = new Map();
  private courseDetailsCache: Map<string, { data: ICourse; expiry: number }> = new Map();

  private mergeCourseModules(defModules?: any[], cachedModules?: any[]): any[] {
    if (!defModules) return cachedModules || [];
    if (!cachedModules || cachedModules.length === 0) return defModules;
    return defModules.map(defMod => {
      const cachedMod = cachedModules.find(m => m.id === defMod.id);
      if (!cachedMod) return defMod;
      const mergedTopics = defMod.topics.map((defTopic: any) => {
        const cachedTopic = cachedMod.topics?.find((t: any) => t.id === defTopic.id);
        if (!cachedTopic) return defTopic;
        const mergedUnits = defTopic.learningUnits.map((defUnit: any) => {
          const cachedUnit = cachedTopic.learningUnits?.find((u: any) => u.id === defUnit.id);
          if (!cachedUnit) return defUnit;
          return {
            ...cachedUnit,
            ...defUnit
          };
        });
        return {
          ...cachedTopic,
          ...defTopic,
          learningUnits: mergedUnits
        };
      });
      return {
        ...cachedMod,
        ...defMod,
        topics: mergedTopics
      };
    });
  }

  normalizeCourseToICourse(c: any): ICourse {
    return normalizeCourseToICourse(c);
  }

  private getStoredCourses(): ICourse[] {
    // Purge old mock courses from localStorage cache
    ['shaivika_courses_data', 'shaivika_enterprise_courses'].forEach((key) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((item: any) => !isRemovedMockCourse(item));
            localStorage.setItem(key, JSON.stringify(cleaned));
          }
        } catch (e) {}
      }
    });
    const mergedList: ICourse[] = [];
    const idSet = new Set<string>();

    // 1. Add Default Mock Courses
    for (const c of DEFAULT_COURSES) {
      if (isRemovedMockCourse(c)) continue;
      const normalized = this.normalizeCourseToICourse(c);
      mergedList.push(normalized);
      idSet.add(normalized.id);
    }

    // 2. Read from 'shaivika_courses_data' (Admin Portal local storage key)
    const adminData = localStorage.getItem('shaivika_courses_data');
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        if (Array.isArray(parsed)) {
          for (const c of parsed) {
            if (isRemovedMockCourse(c)) continue;
            const normalized = this.normalizeCourseToICourse(c);
            const existingIdx = mergedList.findIndex(
              (item) => String(item.id) === String(normalized.id) || item.slug === normalized.slug
            );
            if (existingIdx !== -1) {
              mergedList[existingIdx] = normalized;
            } else {
              mergedList.push(normalized);
            }
            idSet.add(normalized.id);
          }
        }
      } catch (e) {
        console.warn('Error parsing shaivika_courses_data:', e);
      }
    }

    // 3. Read from 'shaivika_enterprise_courses' (Student Portal legacy cache key)
    const studentData = localStorage.getItem('shaivika_enterprise_courses');
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        if (Array.isArray(parsed)) {
          for (const c of parsed) {
            if (isRemovedMockCourse(c)) continue;
            const normalized = this.normalizeCourseToICourse(c);
            const existingIdx = mergedList.findIndex(
              (item) => String(item.id) === String(normalized.id) || item.slug === normalized.slug
            );
            if (existingIdx !== -1) {
              mergedList[existingIdx] = {
                ...normalized,
                ...mergedList[existingIdx],
                progress: c.progress !== undefined ? c.progress : mergedList[existingIdx].progress,
                isEnrolled: c.isEnrolled !== undefined ? c.isEnrolled : mergedList[existingIdx].isEnrolled,
              };
            } else {
              mergedList.push(normalized);
            }
            idSet.add(normalized.id);
          }
        }
      } catch (e) {
        console.warn('Error parsing shaivika_enterprise_courses:', e);
      }
    }

    const result = mergedList.filter((c) => !isRemovedMockCourse(c));

    // Guarantee core courses (Linux Systems Mastery, Git Mastery, & DBMS) are ALWAYS present
    if (!result.some((c) => String(c.id) === 'course_linux_101' || c.slug === 'linux-systems-administration-mastery' || c.title.toLowerCase().includes('linux'))) {
      result.unshift(this.normalizeCourseToICourse(DEFAULT_COURSES[0]));
    }
    if (!result.some((c) => String(c.id) === 'git-github-mastery' || c.slug === 'git-github-mastery' || c.title.toLowerCase().includes('git'))) {
      const gitCourse = DEFAULT_COURSES.find((c) => c.id === 'git-github-mastery') || DEFAULT_COURSES[1];
      if (gitCourse) result.push(this.normalizeCourseToICourse(gitCourse));
    }
    if (!result.some((c) => String(c.id) === 'database-management-system' || c.slug === 'database-management-system' || c.title.toLowerCase().includes('database') || c.title.toLowerCase().includes('dbms'))) {
      const dbmsCourse = DEFAULT_COURSES.find((c) => c.id === 'database-management-system') || DEFAULT_COURSES[2];
      if (dbmsCourse) result.push(this.normalizeCourseToICourse(dbmsCourse));
    }
    if (!result.some((c) => String(c.id) === 'kubernetes-complete-course-beginner-to-advanced' || c.slug === 'kubernetes-complete-course-beginner-to-advanced' || c.title.toLowerCase().includes('kubernetes') || c.title.toLowerCase().includes('k8s'))) {
      const k8sCourse = DEFAULT_COURSES.find((c) => c.id === 'kubernetes-complete-course-beginner-to-advanced') || DEFAULT_COURSES[3];
      if (k8sCourse) result.push(this.normalizeCourseToICourse(k8sCourse));
    }
    if (!result.some((c) => String(c.id) === 'react-js-complete-course' || c.slug === 'react-js-complete-course' || c.title.toLowerCase().includes('react js complete'))) {
      const reactCourse = DEFAULT_COURSES.find((c) => c.id === 'react-js-complete-course') || DEFAULT_COURSES[4];
      if (reactCourse) result.push(this.normalizeCourseToICourse(reactCourse));
    }

    // Apply smart merge for default courses in result
    DEFAULT_COURSES.forEach((defCourse) => {
      const existingIdx = result.findIndex((item) => String(item.id) === String(defCourse.id));
      if (existingIdx !== -1) {
        const cached = result[existingIdx];
        result[existingIdx] = {
          ...this.normalizeCourseToICourse(defCourse),
          ...cached,
          modules: this.mergeCourseModules(defCourse.modules, cached.modules)
        };
      }
    });

    return result;
  }

  private saveStoredCourses(courses: ICourse[]): void {
    localStorage.setItem('shaivika_courses_data', JSON.stringify(courses));
    localStorage.setItem(this.localCacheKey, JSON.stringify(courses));
  }

  private getStoredEnrollments(): Record<string, EnrollmentRecord[]> {
    const data = localStorage.getItem(this.enrollmentsKey);
    if (data) {
      try {
        const parsed: Record<string, EnrollmentRecord[]> = JSON.parse(data);
        let modified = false;
        Object.keys(parsed).forEach((userKey) => {
          const original = parsed[userKey];
          const filtered = original.filter(
            (e) => e.courseId !== 'course_ai_llm_202' && e.courseId !== 'course_devops_303'
          );
          if (filtered.length !== original.length) {
            parsed[userKey] = filtered;
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem(this.enrollmentsKey, JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {}
    }
    const defaultEnrollments: Record<string, EnrollmentRecord[]> = {};
    localStorage.setItem(this.enrollmentsKey, JSON.stringify(defaultEnrollments));
    return defaultEnrollments;
  }

  private saveStoredEnrollments(records: Record<string, EnrollmentRecord[]>): void {
    localStorage.setItem(this.enrollmentsKey, JSON.stringify(records));
  }

  getUserXPPoints(userId = 'default_student'): number {
    const claims = this.getXPClaimLogs(userId);
    return claims.reduce((sum, c) => sum + (c.xp || 0), 0);
  }

  addXPPoints(points: number, userId = 'default_student'): number {
    const current = this.getUserXPPoints(userId);
    const updated = current + points;
    localStorage.setItem(`${this.pointsKey}_${userId}`, String(updated));
    return updated;
  }

  getXPClaimLogs(userId = 'default_student'): XPClaimRecord[] {
    const data = localStorage.getItem(`${this.xpClaimsKey}_${userId}`);
    if (data) {
      try {
        const parsed: XPClaimRecord[] = JSON.parse(data);
        const filtered = parsed.filter(
          (c) => c.id !== 'claim_1' && c.id !== 'claim_2' && c.id !== 'claim_3' && c.id !== 'claim_4'
        );
        if (filtered.length !== parsed.length) {
          localStorage.setItem(`${this.xpClaimsKey}_${userId}`, JSON.stringify(filtered));
        }
        return filtered;
      } catch (e) {}
    }
    const initialClaims: XPClaimRecord[] = [];
    localStorage.setItem(`${this.xpClaimsKey}_${userId}`, JSON.stringify(initialClaims));
    return initialClaims;
  }

  addXPClaim(claim: XPClaimRecord, userId = 'default_student'): XPClaimRecord[] {
    const current = this.getXPClaimLogs(userId);
    const updated = [claim, ...current];
    localStorage.setItem(`${this.xpClaimsKey}_${userId}`, JSON.stringify(updated));
    return updated;
  }

  getCourseCheckpoint(courseId: string, userId = 'default_student'): CourseProgressCheckpoint | null {
    const data = localStorage.getItem(`${this.checkpointKey}_${courseId}_${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return null;
  }

  saveCourseCheckpoint(courseId: string, checkpoint: CourseProgressCheckpoint, userId = 'default_student'): void {
    localStorage.setItem(`${this.checkpointKey}_${courseId}_${userId}`, JSON.stringify(checkpoint));

    const enrollments = this.getStoredEnrollments();
    const userRecs = enrollments[userId] || [];
    const updatedRecs = userRecs.map((rec) =>
      rec.courseId === courseId ? { ...rec, progress: checkpoint.progressPercent } : rec
    );
    enrollments[userId] = updatedRecs;
    this.saveStoredEnrollments(enrollments);
  }

  async getCourses(options: CourseFilterOptions = {}): Promise<CoursePaginationResult> {
    const cacheKey = JSON.stringify(options);
    const cached = this.getCoursesCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiry > now) {
      return cached.data;
    }

    const fetchAndCache = async (): Promise<CoursePaginationResult> => {
      // Try API first
      try {
        const params = new URLSearchParams();
        if (options.search) params.append('search', options.search);
        if (options.category) params.append('category', options.category);
        if (options.level) params.append('level', options.level);
        if (options.status) params.append('status', options.status);
        if (options.page) params.append('page', String(options.page));
        if (options.limit) params.append('limit', String(options.limit));

        const res = await fetch(`${API_BASE_URL}/courses?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            json.data.courses = (json.data.courses || []).filter((c: any) => !isRemovedMockCourse(c));
            return json.data;
          }
        }
      } catch (err) {}

      // Try Firestore directly if available
      if (db) {
        try {
          const querySnapshot = await getDocs(collection(db, 'courses'));
          const loaded: ICourse[] = [];
          querySnapshot.forEach((docSnap) => {
            const item = this.normalizeCourseToICourse({ id: docSnap.id, ...docSnap.data() });
            if (!isRemovedMockCourse(item)) {
              loaded.push(item);
            }
          });
          if (loaded.length > 0) {
            localStorage.setItem('shaivika_courses_data', JSON.stringify(loaded));
          }
        } catch (err) {
          console.warn('Firestore fetch in getCourses failed, falling back to localStorage:', err);
        }
      }

      let list = this.getStoredCourses().filter((c) => !isRemovedMockCourse(c));

      if (options.status && options.status !== 'all') {
        list = list.filter((c) => c.status === options.status);
      }
      if (options.category && options.category !== 'All') {
        const selectedCat = options.category.toLowerCase();
        list = list.filter((c) => {
          const courseCat = c.category.toLowerCase();
          return courseCat === selectedCat ||
                 (selectedCat.includes('development') && courseCat.includes('development')) ||
                 (selectedCat.includes('linux') && courseCat.includes('linux')) ||
                 (selectedCat.includes('sys') && courseCat.includes('sys'));
        });
      }
      if (options.level && options.level !== 'all') {
        list = list.filter((c) => c.level === options.level || c.level === 'all_levels');
      }
      if (options.search) {
        const term = options.search.toLowerCase();
        list = list.filter(
          (c) =>
            c.title.toLowerCase().includes(term) ||
            c.shortDescription.toLowerCase().includes(term) ||
            c.category.toLowerCase().includes(term) ||
            c.skills.some((s) => s.toLowerCase().includes(term))
        );
      }

      const page = options.page || 1;
      const limit = options.limit || 10;
      const total = list.length;
      const totalPages = Math.ceil(total / limit);
      const paginated = list.slice((page - 1) * limit, page * limit);

      return {
        courses: paginated,
        total,
        page,
        limit,
        totalPages,
      };
    };

    const result = await fetchAndCache();
    this.getCoursesCache.set(cacheKey, { data: result, expiry: Date.now() + 15000 }); // cache for 15 seconds
    return result;
  }

  async getCourseBySlugOrId(idOrSlug: string): Promise<ICourse | null> {
    const cached = this.courseDetailsCache.get(idOrSlug);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/courses/${idOrSlug}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.courseDetailsCache.set(idOrSlug, { data: json.data, expiry: Date.now() + 15000 }); // cache 15s
          return json.data;
        }
      }
    } catch (e) {}

    const list = this.getStoredCourses();
    const found = list.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
    if (found) {
      this.courseDetailsCache.set(idOrSlug, { data: found, expiry: Date.now() + 15000 });
    }
    return found;
  }

  async createCourse(dto: CreateCourseDTO): Promise<ICourse> {
    try {
      const token = localStorage.getItem('shaivika_auth_token');
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...dto, price: 0 }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {}

    const list = this.getStoredCourses();
    const id = `course_${Date.now()}`;
    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const created: ICourse = {
      ...dto,
      id,
      slug,
      price: 0,
      banner: dto.banner || '',
      enrollmentCount: 0,
      rating: 5.0,
      ratingCount: 0,
      skills: dto.skills || [],
      prerequisites: dto.prerequisites || [],
      learningOutcomes: dto.learningOutcomes || [],
      syllabus: dto.syllabus || [],
      tags: dto.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [created, ...list];
    this.saveStoredCourses(updatedList);

    if (db) {
      try {
        await setDoc(doc(db, 'courses', id), created);
      } catch (err) {}
    }

    return created;
  }

  async updateCourse(id: string, updates: UpdateCourseDTO): Promise<ICourse | null> {
    try {
      const token = localStorage.getItem('shaivika_auth_token');
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {}

    const list = this.getStoredCourses();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const existing = list[index];
    const updated: ICourse = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveStoredCourses(list);

    if (db) {
      try {
        await updateDoc(doc(db, 'courses', id), updated as any);
      } catch (err) {}
    }

    return updated;
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('shaivika_auth_token');
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return true;
    } catch (e) {}

    const list = this.getStoredCourses();
    const filtered = list.filter((c) => c.id !== id);
    this.saveStoredCourses(filtered);

    if (db) {
      try {
        await deleteDoc(doc(db, 'courses', id));
      } catch (err) {}
    }

    return true;
  }

  async publishCourse(id: string): Promise<ICourse | null> {
    return this.updateCourse(id, { status: 'published' });
  }

  async unpublishCourse(id: string): Promise<ICourse | null> {
    return this.updateCourse(id, { status: 'draft' });
  }

  async archiveCourse(id: string): Promise<ICourse | null> {
    return this.updateCourse(id, { status: 'archived' });
  }

  async duplicateCourse(id: string): Promise<ICourse | null> {
    const existing = await this.getCourseBySlugOrId(id);
    if (!existing) return null;

    const dto: CreateCourseDTO = {
      title: `${existing.title} (Copy)`,
      slug: `${existing.slug}-copy-${Date.now().toString().slice(-4)}`,
      shortDescription: existing.shortDescription,
      description: existing.description,
      thumbnail: existing.thumbnail,
      banner: existing.banner,
      category: existing.category,
      level: existing.level,
      duration: existing.duration,
      language: existing.language,
      price: 0,
      instructor: existing.instructor,
      skills: existing.skills,
      prerequisites: existing.prerequisites,
      learningOutcomes: existing.learningOutcomes,
      status: 'draft',
      visibility: existing.visibility,
      featured: false,
      tags: existing.tags,
      syllabus: existing.syllabus,
    };

    return this.createCourse(dto);
  }

  // --- Dynamic Enrollment & Completion Methods ---

  isCourseEnrolled(courseId: string, userId = 'default_student'): boolean {
    const all = this.getStoredEnrollments();
    const userRecords = all[userId] || [];
    return userRecords.some((r) => r.courseId === courseId);
  }

  async enrollCourse(
    courseId: string,
    userId = 'default_student',
    userMeta?: { email?: string; name?: string; courseTitle?: string }
  ): Promise<{ success: boolean; message: string; isEnrolled: boolean }> {
    const all = this.getStoredEnrollments();
    const userRecords = all[userId] || [];

    const existingIndex = userRecords.findIndex((r) => r.courseId === courseId);
    if (existingIndex !== -1) {
      return {
        success: true,
        message: 'You are already enrolled in this course track!',
        isEnrolled: true,
      };
    }

    const newRecord: EnrollmentRecord = {
      courseId,
      progress: 10,
      enrolledAt: new Date().toISOString(),
    };

    all[userId] = [newRecord, ...userRecords];
    this.saveStoredEnrollments(all);

    const courses = this.getStoredCourses();
    const target = courses.find((c) => c.id === courseId);
    if (target) {
      target.enrollmentCount = (target.enrollmentCount || 0) + 1;
      this.saveStoredCourses(courses);
    }

    // Trigger Email Notification for Course Enrollment
    try {
      const recipientEmail = userMeta?.email || auth?.currentUser?.email;
      if (recipientEmail) {
        const studentName = userMeta?.name || auth?.currentUser?.displayName || recipientEmail.split('@')[0];
        const courseTitle = userMeta?.courseTitle || target?.title || 'Shaivika AI LMS Track';

        await fetch(`${API_BASE_URL}/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'COURSE_ENROLLMENT',
            recipientEmail: recipientEmail.toLowerCase().trim(),
            payload: {
              studentName,
              email: recipientEmail.toLowerCase().trim(),
              courseTitle,
              courseId,
              courseUrl: `${window.location.origin}/courses/${courseId}`,
            },
          }),
        });
      }
    } catch (emailErr) {
      console.warn('[CourseService] Course enrollment email notification failed:', emailErr);
    }

    return {
      success: true,
      message: 'Enrolled successfully! You now have full access to this course.',
      isEnrolled: true,
    };
  }

  async getEnrolledCourses(userId = 'default_student'): Promise<ICourse[]> {
    const allEnrollments = this.getStoredEnrollments();
    const userRecords = allEnrollments[userId] || [];

    const courses = this.getStoredCourses();
    const enrolledList: ICourse[] = [];

    for (const record of userRecords) {
      const course = courses.find((c) => c.id === record.courseId);
      if (course) {
        enrolledList.push({
          ...course,
          progress: record.progress,
          isEnrolled: true,
        });
      }
    }

    return enrolledList;
  }

  async updateCourseProgress(courseId: string, progress: number, userId = 'default_student'): Promise<void> {
    const all = this.getStoredEnrollments();
    const userRecords = all[userId] || [];
    const index = userRecords.findIndex((r) => r.courseId === courseId);
    if (index !== -1) {
      userRecords[index].progress = Math.min(100, Math.max(0, progress));
      all[userId] = userRecords;
      this.saveStoredEnrollments(all);
    }
  }

  async bookmarkCourse(courseId: string, userId = 'default_student'): Promise<{ bookmarked: boolean }> {
    const key = `bookmark_${userId}_${courseId}`;
    const current = localStorage.getItem(key) === 'true';
    localStorage.setItem(key, String(!current));
    return { bookmarked: !current };
  }
}

export const courseService = new CourseService();
