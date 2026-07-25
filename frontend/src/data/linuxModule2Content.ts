import type { LessonDetail } from './linuxModuleContent';

export const MODULE_2_FULL_CURRICULUM: LessonDetail[] = [
  {
    title: 'Lesson 2.1: Filesystem Hierarchy Standard (FHS)',
    badge: 'Topic 01',
    subtopics: [
      {
        id: '2.1.1',
        title: '2.1.1 Root Directory Tree (/)',
        content: `In Linux, every file, directory, and hardware device exists under a single root directory (/).`,
        tableData: [
          { distro: '/', upstream: 'Root', packageManager: 'FHS', useCase: 'Top-level directory of the entire filesystem tree.' },
          { distro: '/bin & /sbin', upstream: 'System Binaries', packageManager: 'FHS', useCase: 'Essential system commands (/bin for all users, /sbin for admin/root).' },
          { distro: '/etc', upstream: 'Configuration', packageManager: 'FHS', useCase: 'System-wide configuration files (e.g., /etc/passwd, /etc/fstab).' },
          { distro: '/var', upstream: 'Variable Data', packageManager: 'FHS', useCase: 'Dynamic variable data (System logs /var/log, databases, web files).' },
          { distro: '/home', upstream: 'User Homes', packageManager: 'FHS', useCase: 'Personal directories for regular users (e.g., /home/alice).' },
          { distro: '/root', upstream: 'Root Home', packageManager: 'FHS', useCase: 'Dedicated home directory for the superuser (root).' },
          { distro: '/tmp', upstream: 'Temp Storage', packageManager: 'FHS', useCase: 'Temporary files (automatically cleared on reboot).' },
          { distro: '/usr', upstream: 'User Utilities', packageManager: 'FHS', useCase: 'Secondary hierarchy containing user utilities and applications.' },
        ],
      },
      {
        id: '2.1.2',
        title: '2.1.2 Virtual File Systems: /proc and /dev',
        content: `• /proc (Process Filesystem): Virtual filesystem residing in RAM. Holds real-time kernel & process information (e.g., /proc/cpuinfo, /proc/meminfo).
• /dev (Device Files): Contains file representations of physical hardware devices (e.g., /dev/sda for storage disk, /dev/null for data disposal).`,
        terminalCommand: 'ls -l /dev',
      },
    ],
  },
  {
    title: 'Lesson 2.2: User & Group Administration',
    badge: 'Topic 02',
    subtopics: [
      {
        id: '2.2.1',
        title: '2.2.1 User Accounts Hierarchy',
        content: `Linux categorizes users into 3 strict security tiers:

• Root User (UID 0): Superuser with unrestricted execution privileges.
• System Accounts (UID 1–999): Non-human accounts used by background services (e.g., nginx, mysql).
• Regular Users (UID 1000+): Human accounts restricted to their own home directory (~).`,
      },
      {
        id: '2.2.2',
        title: '2.2.2 Critical Configuration Files',
        content: `Exam & Interview Core Files:

1. /etc/passwd: User metadata & shell configuration.
Format: alice:x:1001:1001::/home/alice:/bin/bash

2. /etc/shadow: Encrypted passwords (Root read-only).
Format: alice:$6$xyz...:19120:0:99999:7:::

3. /etc/group: Group memberships.
Format: developers:x:1002:alice,bob`,
        codeSnippet: `# View user configuration file
cat /etc/passwd | grep "1000"

# Inspect group configuration
cat /etc/group`,
        terminalCommand: 'cat /etc/passwd',
      },
    ],
  },
  {
    title: 'Lesson 2.3: File Permissions & Ownership Matrix',
    badge: 'Topic 03',
    subtopics: [
      {
        id: '2.3.1',
        title: '2.3.1 Permission Structure & Octal Values',
        content: `Permissions are divided into three targets: User (Owner), Group, and Others.

Octal Matrix:
• Read (r) = 4
• Write (w) = 2
• Execute (x) = 1

Permission Syntax Examples:
• chmod 755 file -> Owner: rwx (7), Group: r-x (5), Others: r-x (5)
• chmod 644 file -> Owner: rw- (6), Group: r-- (4), Others: r-- (4)`,
        codeSnippet: `# Grant read, write, execute to owner; read, execute to group/others
chmod 755 script.sh

# Standard file permissions (rw-r--r--)
chmod 644 config.txt`,
        terminalCommand: 'chmod 755 script.sh',
      },
      {
        id: '2.3.2',
        title: '2.3.2 Modifying Ownership',
        content: `Change file and directory ownership using the chown command:

sudo chown alice:developers /var/www/app
sudo chown -R alice:developers /var/www/app (-R applies recursively to all subfolders)`,
        codeSnippet: `# Change owner to 'alice' and group to 'developers'
sudo chown alice:developers /var/www/app

# Change ownership recursively (-R) for a directory
sudo chown -R alice:developers /var/www/app`,
        terminalCommand: 'sudo chown -R alice:developers /var/www/app',
      },
    ],
  },
  {
    title: 'Lesson 2.4: Advanced Access Control Systems',
    badge: 'Topic 04',
    subtopics: [
      {
        id: '2.4.1',
        title: '2.4.1 Special Permissions (SUID, SGID, Sticky Bit)',
        content: `Special Permissions Matrix:

• SUID (Octal 4000 / u+s): Runs an executable with the permissions of the file owner (e.g., /usr/bin/passwd).
• SGID (Octal 2000 / g+s): New files created in a directory automatically inherit the parent group ownership.
• Sticky Bit (Octal 1000 / +t): Prevents users from deleting files owned by others in shared folders (e.g., /tmp).`,
        codeSnippet: `# Add SUID bit to binary
chmod u+s /usr/local/bin/custom_tool

# Set sticky bit on shared directory
chmod +t /shared_folder`,
      },
      {
        id: '2.4.2',
        title: '2.4.2 Access Control Lists (ACLs)',
        content: `ACLs allow setting explicit permissions for specific users or groups outside standard POSIX limits.

Grant explicit user access:
setfacl -m u:bob:rw project.pdf

View configured ACL permissions:
getfacl project.pdf`,
        codeSnippet: `# Grant user 'bob' explicit Read & Write access
setfacl -m u:bob:rw project.pdf

# View configured ACL permissions
getfacl project.pdf`,
        terminalCommand: 'getfacl /etc/passwd',
      },
    ],
  },
];
