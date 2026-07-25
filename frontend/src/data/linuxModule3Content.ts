import type { LessonDetail } from './linuxModuleContent';

export const MODULE_3_FULL_CURRICULUM: LessonDetail[] = [
  {
    title: 'Lesson 3.1: Process Lifecycle & Monitoring',
    badge: 'Topic 01',
    subtopics: [
      {
        id: '3.1.1',
        title: '3.1.1 Process Fundamentals',
        content: `A process is an active instance of a running program in memory.

Key Identifiers & Types:
• PID (Process ID): Unique numerical identifier assigned to every running process.
• PPID (Parent Process ID): The PID of the parent process that spawned it.
• Foreground Process: Runs directly in the shell, blocking user input until complete.
• Background Process: Runs independently in the background, freeing the shell interface (started by appending &).`,
      },
      {
        id: '3.1.2',
        title: '3.1.2 Process Execution States',
        content: `Linux Process State Matrix:`,
        tableData: [
          { distro: 'Running (R)', upstream: 'Active', packageManager: 'CPU', useCase: 'Actively executing or waiting for CPU cycles.' },
          { distro: 'Sleeping (S)', upstream: 'Interruptible', packageManager: 'I/O', useCase: 'Waiting for an event or system resource (e.g., I/O).' },
          { distro: 'Sleeping (D)', upstream: 'Uninterruptible', packageManager: 'Hardware', useCase: 'Waiting for direct hardware access; cannot be interrupted by signals.' },
          { distro: 'Zombie (Z)', upstream: 'Defunct', packageManager: 'Kernel', useCase: 'Terminated process whose exit code has not yet been collected by its parent.' },
          { distro: 'Stopped (T)', upstream: 'Halted', packageManager: 'Signal', useCase: 'Execution halted by a control signal (e.g., Ctrl + Z).' },
        ],
      },
      {
        id: '3.1.3',
        title: '3.1.3 Process Inspection & Monitoring',
        content: `Snapshot inspection vs real-time dashboards:

1. Static Snapshot: ps aux | grep nginx
2. Interactive Real-time Dashboard: htop`,
        codeSnippet: `# Snapshot of running processes filtering for python or nginx
ps aux | grep nginx

# Interactive real-time process manager
htop`,
        terminalCommand: 'ps aux',
      },
    ],
  },
  {
    title: 'Lesson 3.2: Process Signals & Control',
    badge: 'Topic 02',
    subtopics: [
      {
        id: '3.2.1',
        title: '3.2.1 Critical Linux Signals',
        content: `Signals communicate directly with running process PIDs:`,
        tableData: [
          { distro: 'SIGHUP', upstream: 'Signal 1', packageManager: 'kill -1 <PID>', useCase: 'Reloads configuration files without stopping the process.' },
          { distro: 'SIGINT', upstream: 'Signal 2', packageManager: 'Ctrl + C', useCase: 'Interrupts a process gracefully from the terminal.' },
          { distro: 'SIGTERM', upstream: 'Signal 15', packageManager: 'kill <PID>', useCase: 'Standard graceful termination (allows cleanup). Default signal.' },
          { distro: 'SIGKILL', upstream: 'Signal 9', packageManager: 'kill -9 <PID>', useCase: 'Forces immediate termination by kernel (cannot be blocked).' },
        ],
        codeSnippet: `# Reload service configuration gracefully
kill -1 1234

# Standard graceful kill
kill 1234

# Force immediate termination
kill -9 1234`,
        terminalCommand: 'kill -9 1234',
      },
      {
        id: '3.2.2',
        title: '3.2.2 Process Priority (nice & renice)',
        content: `CPU scheduling priority ranges from -20 (Highest Priority) to 19 (Lowest Priority). Default priority is 0.

Launch with priority:
nice -n 10 ./backup.sh

Alters active priority:
sudo renice -n -5 -p 1234`,
        codeSnippet: `# Launch a background script with lower priority (nice value = 10)
nice -n 10 ./backup.sh

# Change priority of an already running process (PID 1234) to high priority (-5)
sudo renice -n -5 -p 1234`,
        terminalCommand: 'renice -n -5 -p 1234',
      },
    ],
  },
  {
    title: 'Lesson 3.3: Systemd & Service Management',
    badge: 'Topic 03',
    subtopics: [
      {
        id: '3.3.1',
        title: '3.3.1 systemctl Core Commands',
        content: `systemd is the standard init system (PID 1) used to boot, manage, and monitor system daemons:

Service Lifecycle:
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl status nginx

Boot Configuration:
sudo systemctl enable nginx
sudo systemctl disable nginx`,
        codeSnippet: `# Manage service lifecycle
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl status nginx

# Boot management
sudo systemctl enable nginx
sudo systemctl disable nginx`,
        terminalCommand: 'sudo systemctl status nginx',
      },
      {
        id: '3.3.2',
        title: '3.3.2 Systemd Unit File Structure',
        content: `Systemd service unit files reside in /etc/systemd/system/app.service:

[Unit]
Description=My Custom Node.js App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/node /var/www/myapp/server.js
Restart=always

[Install]
WantedBy=multi-user.target`,
        codeSnippet: `[Unit]
Description=My Custom Node.js App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/node /var/www/myapp/server.js
Restart=always

[Install]
WantedBy=multi-user.target`,
      },
      {
        id: '3.3.3',
        title: '3.3.3 System Logging (journalctl)',
        content: `Inspect binary systemd logs:

View last 100 log lines for a specific service without pagination:
sudo journalctl -u nginx.service -n 100 --no-pager

Stream live real-time logs for a service:
sudo journalctl -u nginx.service -f`,
        codeSnippet: `# View last 100 log lines for a specific service without pagination
sudo journalctl -u nginx.service -n 100 --no-pager

# Stream live real-time logs for a service
sudo journalctl -u nginx.service -f`,
        terminalCommand: 'sudo journalctl -u nginx.service -n 100 --no-pager',
      },
    ],
  },
  {
    title: 'Lesson 3.4: Automation with Cron Scheduler',
    badge: 'Topic 04',
    subtopics: [
      {
        id: '3.4.1',
        title: '3.4.1 Cron Syntax & Architecture',
        content: `Cron runs automated background jobs at specified times or intervals.

* * * * *  /path/to/command_or_script
│ │ │ │ │
│ │ │ │ └── Day of Week (0 - 6) (0 = Sunday)
│ │ │ └──── Month (1 - 12)
│ │ └────── Day of Month (1 - 31)
│ └──────── Hour (0 - 23)
└────────── Minute (0 - 59)`,
        asciiDiagram: `* * * * *  /path/to/command_or_script
│ │ │ │ │
│ │ │ │ └── Day of Week (0 - 6) (0 = Sunday)
│ │ │ └──── Month (1 - 12)
│ │ └────── Day of Month (1 - 31)
│ └──────── Hour (0 - 23)
└────────── Minute (0 - 59)`,
      },
      {
        id: '3.4.2',
        title: '3.4.2 Cron Schedules & Management Commands',
        content: `Common Cron Expressions:
• 0 2 * * * -> Every day at 2:00 AM
• */15 * * * * -> Every 15 minutes
• 0 0 * * 1 -> Every Monday at midnight

Management Commands:
crontab -e -> Edit current user's crontab file
crontab -l -> List active scheduled cron jobs`,
        codeSnippet: `# Edit current user's crontab file
crontab -e

# List active scheduled cron jobs
crontab -l`,
        terminalCommand: 'crontab -l',
      },
    ],
  },
];
