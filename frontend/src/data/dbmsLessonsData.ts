export interface DBMSLesson {
  id: string;
  title: string;
  content: string;
  commands?: Array<{ command: string; description: string }>;
  resources?: Array<{ title: string; url: string }>;
}

export const dbmsLessonsData: Record<string, DBMSLesson> = {
  'dbms-unit-1-1-1': {
    id: 'dbms-unit-1-1-1',
    title: 'What is Data?',
    content: `### What is Data?

Data is a collection of raw, unorganized, and unprocessed facts, figures, observations, symbols, or measurements. For example, numbers, words, characters, or images. By itself, raw data has no context and does not convey a complete or useful message.

#### 1. Concept of Data, Information, and Metadata
- **Data**: Raw facts. Example: \`38\`, \`Red\`, \`John\`.
- **Information**: Processed, structured, and organized data that has context and meaning. Example: "John bought a Red car with plate number 38."
- **Metadata**: Data about data. It provides descriptive information about other data, such as format, size, or creation date. Example: "The file size is 2MB, format is JPEG, created on August 2nd."

#### 2. Importance of Data
In computing systems, data is represented in binary format and structured inside systems to support decision-making, analysis, and application workflows. Unstructured raw facts are the building blocks of all database systems.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'List relational tables' }
    ],
    resources: [
      { title: 'Introduction to Data Concepts', url: '#' }
    ]
  },
  'dbms-unit-1-1-2': {
    id: 'dbms-unit-1-1-2',
    title: 'What is Database?',
    content: `### What is a Database?

A database is an organized, systematic, and structured collection of data stored electronically in a computer system. It is designed to support the storage, retrieval, modification, and management of data in an efficient manner.

#### 1. Structure and Purpose
Databases allow users to catalog massive amounts of records and attributes. The primary purpose is to retrieve requested data collections quickly and securely.
- **Relational Databases**: Structure data using tables, rows, and columns.
- **Tables**: Contain tuples or records representing entities.
- **DBMS**: Database Management Systems control databases and coordinate user operations.

#### 2. Key Elements
- **Table**: Grid structure storing data.
- **Record**: A single row containing data for one entity.
- **Field**: A column representing a specific attribute of the record.`,
    commands: [
      { command: 'SELECT * FROM users;', description: 'Fetch all users' }
    ]
  },
  'dbms-unit-1-1-3': {
    id: 'dbms-unit-1-1-3',
    title: 'DBMS Introduction',
    content: `### DBMS Introduction

A Database Management System (DBMS) is software that manages databases, allowing users to store, retrieve, update, and organize information efficiently while ensuring data integrity.

#### 1. What is a Database Management System?
A DBMS serves as an interface between the database and its end-users or programs, allowing users to retrieve, update, and manage how the information is organized and optimized.

#### 2. Key Operations of a DBMS
- **Data Definition**: Creating, modifying, and removing definitions that define the organization of the database.
- **Data Updation**: Inserting, modifying, and deleting the actual data.
- **Data Retrieval**: Fetching records from the database for application use.
- **User Administration**: Securing database access and monitoring concurrency control.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'List database tables' }
    ]
  },
  'dbms-unit-1-1-4': {
    id: 'dbms-unit-1-1-4',
    title: 'Database vs File System',
    content: `### Database vs File System

Traditional File Systems store data in separate, independent files. While simple, they have severe limitations compared to a Database Management System (DBMS).

#### 1. Limitations of File Systems
- **Data Redundancy**: The same data is repeated across multiple files, wasting storage space.
- **Data Inconsistency**: Updating data in one file does not automatically update other files, leading to mismatching records.
- **Concurrency Issues**: Multiple users cannot write to the same file at the same time without risk of corruption.
- **Weak Security**: Harder to restrict access to specific fields or attributes.

#### 2. Advantages of DBMS
- **Data Integrity**: Enforces strict validation rules.
- **Concurrency Control**: Supports simultaneous multi-user reads and writes.
- **Structured Querying**: Allows complex data fetches using SQL.
- **Redundancy Management**: Centralizes storage to eliminate duplicates.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'Display all schemas' }
    ]
  },
  'dbms-unit-1-1-5': {
    id: 'dbms-unit-1-1-5',
    title: 'Advantages of DBMS',
    content: `### Advantages of DBMS

A Database Management System provides comprehensive capabilities to secure, validate, and optimize data assets.

#### 1. Key Benefits
- **Minimized Data Redundancy**: Central storage eliminates duplicate records.
- **Data Sharing**: Multiple client applications can access the database simultaneously.
- **Data Consistency**: Changes are applied globally to ensure data validity.
- **Transactional Safety**: Employs transactional commits to protect data states.
- **Secure Access**: Restricts unauthorized reading and writing.`,
    commands: [
      { command: 'SELECT * FROM users;', description: 'View user database' }
    ]
  },
  'dbms-unit-1-1-6': {
    id: 'dbms-unit-1-1-6',
    title: 'Types of Databases',
    content: `### Types of Databases

Databases are categorized based on their data models and architectural designs to support different application needs.

#### 1. Primary Types
- **Relational Databases (RDBMS)**: Organize data into rows and columns (e.g. MySQL, PostgreSQL).
- **NoSQL Databases**: Structure unstructured data models like Key-Value stores, Document stores, and Graph databases.
- **Distributed Databases**: Run across multiple nodes to ensure high availability.
- **Cloud Databases**: Hosted on remote cloud platforms.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'Check database structures' }
    ]
  },
  'dbms-unit-1-1-7': {
    id: 'dbms-unit-1-1-7',
    title: 'Practice Terminal (For Practice Only)',
    content: `### Practice Terminal

Practice connecting to database structures and issuing queries in the terminal.

#### 1. Workspace Connection
Use standard database clients to connect to remote server databases and verify active tables.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'List active schemas' }
    ]
  },
  'dbms-unit-1-1-8': {
    id: 'dbms-unit-1-1-8',
    title: 'Module Notes',
    content: `### Module Notes

Review database fundamentals, including DBMS definitions, relational schemas, database vs file system comparisons, and data modeling constraints.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'Confirm tables structure' }
    ]
  },
  'dbms-unit-2-1-1': {
    id: 'dbms-unit-2-1-1',
    title: 'Tables, Rows & Columns',
    content: `### Tables, Rows & Columns

In relational database systems, schemas model real-world concepts into structures.

#### 1. Relational Layout
- **Tables**: Relational grids representing structured entities.
- **Rows**: Tuples representing records.
- **Columns**: Attributes representing columns.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'List structures' }
    ]
  },
  'dbms-unit-2-1-2': {
    id: 'dbms-unit-2-1-2',
    title: 'Keys',
    content: `### Keys

Keys uniquely identify database records.

#### 1. Types of Keys
- **Primary Keys**: Uniquely identify each row in a table.
- **Foreign Keys**: Reference primary keys in other tables.
- **Candidate Keys**: Potential primary keys.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'List tables' }
    ]
  },
  'dbms-unit-2-1-3': {
    id: 'dbms-unit-2-1-3',
    title: 'Constraints',
    content: `### Constraints

Constraints enforce rules on data values.

#### 1. Validation Rules
- **NOT NULL**: Ensures fields contain data.
- **UNIQUE**: Prevents duplicate column values.
- **CHECK**: Validates domain values.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'Display tables' }
    ]
  },
  'dbms-unit-2-1-4': {
    id: 'dbms-unit-2-1-4',
    title: 'ER Model',
    content: `### ER Model

The Entity-Relationship model acts as a blueprint for relational database design.

#### 1. Design Structures
- **Entities**: Objects in the database domain.
- **Attributes**: Properties of entities.
- **Relationships**: Associations between entities.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'Display tables' }
    ]
  },
  'dbms-unit-2-1-5': {
    id: 'dbms-unit-2-1-5',
    title: 'ER Diagram',
    content: `### ER Diagram

ER Diagrams visualize relationships between database objects.

#### 1. Visual Schematics
Draw diagrams detailing entity cardinality, attributes, and primary key links.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'View tables' }
    ]
  },
  'dbms-unit-2-1-6': {
    id: 'dbms-unit-2-1-6',
    title: 'Practice Terminal (For Practice Only)',
    content: `### Practice Terminal

Validate primary keys and relationships in the SQL practice client workspace.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'Display tables list' }
    ]
  },
  'dbms-unit-2-1-7': {
    id: 'dbms-unit-2-1-7',
    title: 'Module Notes',
    content: `### Module Notes

Review database keys, domain constraints, entity relationships, and normalization forms.`,
    commands: [
      { command: 'SHOW TABLES;', description: 'Verify schemas list' }
    ]
  }
};
