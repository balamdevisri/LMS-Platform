export interface SubtopicDetail {
  id: string;
  title: string;
  content: string;
  codeSnippet?: string;
  terminalCommand?: string;
  asciiDiagram?: string;
  tableData?: { distro: string; upstream: string; packageManager: string; useCase: string }[];
}

export interface LessonDetail {
  title: string;
  badge: string;
  subtopics: SubtopicDetail[];
}

export const MODULE_1_FULL_CURRICULUM: LessonDetail[] = [
  {
    title: 'Lesson 1.1: Operating System Fundamentals & Linux Overview',
    badge: 'Topic 01',
    subtopics: [
      {
        id: '1.1.1',
        title: '1.1.1 What is an OS? Evolution of UNIX vs. Linux and Open-Source Philosophy',
        content: `An Operating System (OS) is the core software interface that manages a computer's hardware resources (CPU, RAM, storage) and provides a runtime environment for user applications.

UNIX: Developed in 1969 at AT&T Bell Labs, UNIX was a proprietary, multi-user, multi-tasking OS. It was powerful but expensive and locked to specific hardware architectures.

The GNU Project & Linux: In 1983, Richard Stallman launched the GNU Project to build a free, UNIX-like OS. By 1991, GNU had almost all tools ready except the kernel. Linus Torvalds, a Finnish student, wrote a free kernel and released it as Linux. Combining GNU utilities with Torvalds' kernel resulted in the complete OS: GNU/Linux.

Open-Source Philosophy & The GPL:
• Free Software: Refers to freedom of modification, redistribution, and access to source code, not necessarily zero cost.
• GNU General Public License (GPL): A copyleft license guaranteeing that anyone who modifies and redistributes GPL-licensed software must keep the source code open and freely accessible under the same license.`,
      },
      {
        id: '1.1.2',
        title: '1.1.2 Enterprise Linux Distributions',
        content: `A Linux Distribution (Distro) bundles the Linux kernel with GNU utilities, package managers, system configurations, and desktop environments.`,
        tableData: [
          { distro: 'Debian', upstream: 'Independent', packageManager: 'apt (.deb)', useCase: 'Ultra-stable, community-driven. Upstream foundation for Ubuntu.' },
          { distro: 'Ubuntu', upstream: 'Debian-based', packageManager: 'apt / snap', useCase: 'Developer & Cloud Standard. Vast ecosystem, available in LTS.' },
          { distro: 'RHEL', upstream: 'Red Hat', packageManager: 'dnf (.rpm)', useCase: 'Enterprise Gold Standard. Enterprise Linux with paid commercial support.' },
          { distro: 'CentOS Stream', upstream: 'RHEL-based', packageManager: 'dnf (.rpm)', useCase: 'Development Sandbox for RHEL. Upstream preview for upcoming RHEL builds.' },
          { distro: 'Alpine Linux', upstream: 'Independent', packageManager: 'apk', useCase: 'Containerized Microservices. Ultra-lightweight (~5MB base footprint) for Docker.' },
        ],
      },
      {
        id: '1.1.3',
        title: '1.1.3 System Architecture: User Space vs. Kernel Space',
        content: `To prevent runaway applications from crashing hardware or corrupting memory, modern operating systems enforce a hardware-level memory split:

Kernel Space: The restricted memory zone where the core kernel executes. Runs in CPU Ring 0 (privileged mode), allowing direct access to physical memory, CPU registers, and hardware devices.

User Space: The memory region allocated for regular user applications, web servers, and CLI tools. Runs in CPU Ring 3 (unprivileged mode). Apps in user space cannot access hardware directly; they must ask the kernel via system calls.`,
        asciiDiagram: `+-------------------------------------------------------------------+
|                            USER SPACE                             |
|  [ Web Browser ]    [ Database ]    [ Shell (Bash) ]   [ Python ] |
|                                                                   |
|   Memory Isolation: Unprivileged code running with limited access  |
+-------------------------------------------------------------------+
                                 ||
                       SYSTEM CALLS (syscalls)
                                 ||
+-------------------------------------------------------------------+
|                           KERNEL SPACE                            |
|    [ Memory Mgmt ]   [ Process Scheduler ]   [ Device Drivers ]   |
|                                                                   |
|   Hardware Execution: Privileged mode with full access to hardware |
+-------------------------------------------------------------------+
                                 ||
+-------------------------------------------------------------------+
|                        PHYSICAL HARDWARE                          |
|             [ CPU ]      [ RAM ]      [ Storage / SSD ]           |
+-------------------------------------------------------------------+`,
      },
    ],
  },
  {
    title: 'Lesson 1.2: Linux Kernel Mechanics',
    badge: 'Topic 02',
    subtopics: [
      {
        id: '1.2.1',
        title: '1.2.1 Core Functions of the Kernel',
        content: `The kernel manages four primary subsystems:

1. Process Scheduling: Allocates CPU execution time across competing processes using the Completely Fair Scheduler (CFS).
2. Memory Allocation: Manages physical RAM and Virtual Memory. Uses paging to allocate memory segments safely and uses swap space when RAM fills up.
3. Device Drivers: Acts as a translation layer between software and hardware peripherals (storage arrays, network cards, GPUs).
4. Virtual File Systems (VFS): Provides a single, unified file system interface (/) regardless of the underlying storage format (e.g., ext4, xfs, btrfs, NFS).`,
      },
      {
        id: '1.2.2',
        title: '1.2.2 Monolithic Design & Loadable Kernel Modules (LKMs)',
        content: `Monolithic Kernel Architecture: The entire Linux kernel (scheduler, virtual file system, memory manager, network stack) runs inside a single, unified kernel space. This grants speed advantages over microkernels because core components communicate with zero IPC (Inter-Process Communication) overhead.

Loadable Kernel Modules (LKMs): Rather than requiring a full kernel recompile whenever hardware changes, Linux uses LKMs—code fragments that can be dynamically inserted (insmod/modprobe) or removed (rmmod) from kernel memory at runtime.

Example: Plugging in a USB device loads its driver module dynamically without restarting the server.`,
      },
      {
        id: '1.2.3',
        title: '1.2.3 System Calls (syscalls)',
        content: `A System Call is an API exposed by the kernel to user space applications when they require hardware execution.

1. Request: User types cat file.txt inside a terminal emulator (User Space).
2. Interface Call: The Shell uses C library functions (glibc) to trigger a system call (e.g., sys_open, sys_read).
3. Context Switch: CPU switches execution context from Ring 3 (User Mode) to Ring 0 (Kernel Mode).
4. Execution: Kernel reads physical storage sectors via the disk driver, transfers raw bytes into user space memory buffers, and returns control to the process.`,
      },
    ],
  },
  {
    title: 'Lesson 1.3: Navigation & File System Operations',
    badge: 'Topic 03',
    subtopics: [
      {
        id: '1.3.1',
        title: '1.3.1 Shell Environments: Terminal Emulators vs. Shells',
        content: `Terminal Emulator: A graphical interface app (e.g., Alacritty, iTerm2, GNOME Terminal) that displays text output and captures keyboard input.

Shell: The actual command interpreter running inside the terminal that accepts text commands, parses them, and calls kernel execution routines.
• Bash (Bourne-Again Shell): The universal Linux standard CLI interface.
• Zsh (Z Shell): Advanced shell featuring extended autocompletion, theme support (Oh-My-Zsh), and interactive plugins; default on macOS.`,
      },
      {
        id: '1.3.2',
        title: '1.3.2 Directory Navigation: Absolute vs. Relative Pathing',
        content: `Absolute Path: Defines a file location starting explicitly from the root directory (/).
Example: cd /home/ubuntu/projects

Relative Path: Defines a location starting from your current working directory (.).
Example (if inside /home/ubuntu): cd projects

Path Shortcuts:
.  -> Current directory
.. -> Parent directory (one level up)
~  -> Current logged-in user's home directory`,
        asciiDiagram: `          / (Root Directory)
          ├── bin -> usr/bin
          ├── etc/
          ├── home/
          │   └── ubuntu/ (User Home Directory: ~)
          │       ├── projects/
          │       │   └── app.py
          │       └── notes.txt
          └── var/
              └── log/`,
        terminalCommand: 'pwd',
      },
      {
        id: '1.3.3',
        title: '1.3.3 File CRUD Operations (Create, Read, Update, Delete)',
        content: `1. Creating Directories & Files:
mkdir -p project/src/components
touch project/src/index.js

2. Reading Directory Content:
ls -lah project/src

3. Updating, Copying & Renaming Files:
cp project/src/index.js project/src/index.js.bak
cp -r project/ backup_project/
mv project/src/index.js project/src/app.js

4. Deleting Files Safely:
rm project/src/index.js.bak
rm -rf backup_project/

⚠️ Warning: The Linux CLI has no Trash bin! Commands executed with rm -rf clear data directly from storage links permanently.`,
        codeSnippet: `# Create nested directory tree recursively
mkdir -p project/src/components

# Create empty file or update timestamp
touch project/src/index.js

# List long format with hidden files and human sizes
ls -lah project/src

# Copy recursively
cp -r project/ backup_project/

# Delete directory recursively with forced override
rm -rf backup_project/`,
        terminalCommand: 'ls -lah',
      },
    ],
  },
  {
    title: 'Lesson 1.4: Text Processing, Editors & Search Utilities',
    badge: 'Topic 04',
    subtopics: [
      {
        id: '1.4.1',
        title: '1.4.1 Manuals & Documentation',
        content: `man <command>: Opens the formal documentation manual pages.
man ls

--help flag: Prints short flags and inline syntax directly within the terminal window.
mkdir --help`,
        terminalCommand: 'man ls',
      },
      {
        id: '1.4.2',
        title: '1.4.2 Log & File Inspection',
        content: `Static File Viewing:
cat: Concatenates and prints the entire file to the screen (use only for small files).
less: Displays file content interactively using paginated scrolling (press q to exit, / to search).

File Edge Inspection:
head -n 20 app.log: Displays the first 20 lines of a file.
tail -n 20 app.log: Displays the last 20 lines of a file.

Live Stream Monitoring:
tail -f /var/log/syslog: Continuously streams new log lines added to the file in real time (press Ctrl + C to break).`,
        codeSnippet: `# Print full file
cat /etc/os-release

# View first 20 lines
head -n 20 /var/log/syslog

# Continuously stream live updates
tail -f /var/log/syslog`,
        terminalCommand: 'cat /etc/os-release',
      },
      {
        id: '1.4.3',
        title: '1.4.3 Terminal Text Editors',
        content: `1. Nano (Beginner Friendly):
A simple, non-modal editor where text can be typed directly. Shortcuts are visible on the bottom bar (^ represents the Ctrl key).
nano configuration.conf
Ctrl + O: Save changes (WriteOut)
Ctrl + X: Exit editor

2. Vim / Vi (Modal Power Editor):
A modal text editor designed for efficiency without touching a mouse.
vim script.sh

Vim Modes:
Normal Mode (Default): Navigation and text manipulation commands (h, j, k, l or arrow keys).
Insert Mode (Type Text): Press i from Normal mode to begin typing text. Press Esc to exit back to Normal mode.
Command Mode (Save/Quit): Press : from Normal mode:
:w  -> Save (Write)
:q! -> Quit without saving changes
:wq -> Save and Quit`,
      },
    ],
  },
  {
    title: 'Lesson 1.5: I/O Redirection & Pipelines',
    badge: 'Topic 05',
    subtopics: [
      {
        id: '1.5.1',
        title: '1.5.1 Standard Streams',
        content: `Every process launched in a Linux shell automatically opens three default integer data streams:

• stdin (Standard Input - File Descriptor 0): Data fed into the command (typically keyboard input).
• stdout (Standard Output - File Descriptor 1): Successful execution output from the process.
• stderr (Standard Error - File Descriptor 2): Error messages generated if the process fails.`,
        asciiDiagram: `[ Input Device: Keyboard ] ---> STDIN (File Descriptor 0) 
                                      |
                                  [ PROCESS ]
                                   /       \\
      (Output) STDOUT (FD 1) <----          ----> STDERR (FD 2) (Error Log)
          |                                            |
 [ Terminal Screen ]                          [ Terminal Screen ]`,
      },
      {
        id: '1.5.2',
        title: '1.5.2 Redirection Mechanics',
        content: `1. Redirecting Standard Output (stdout):
> Overwrite: Redirects output to a file, replacing its current contents completely.
echo "Server Status: OK" > status.txt

>> Append: Redirects output to a file, appending new data to the bottom without erasing existing content.
echo "Update complete" >> status.txt

2. Redirecting Errors (stderr):
Direct error logs (2>) separately from successful output:
find /etc -name "nginx.conf" 2> error.log

Combine both stdout and stderr (&>) into a single file destination:
build_project.sh &> execution.log`,
        terminalCommand: 'echo "Server Status: OK" > status.txt',
      },
      {
        id: '1.5.3',
        title: '1.5.3 Command Pipelines (|) & tee',
        content: `Pipelines allow you to take the stdout of one program and feed it directly into the stdin of another, creating complex workflows from simple utility tools.

1. Piping Commands (|):
cat /etc/passwd | grep "bash"
tail -n 500 /var/log/nginx/error.log | grep "404" | wc -l

2. T-Junction Output (tee):
The tee utility acts like a physical T-connector: it writes output to a file and displays it simultaneously on the terminal screen.
python3 script.py | tee build.log`,
        codeSnippet: `# Filter system file for bash users
cat /etc/passwd | grep "bash"

# Save to log while viewing live
python3 script.py | tee build.log`,
        terminalCommand: 'cat /etc/passwd | grep "bash"',
      },
    ],
  },
];
