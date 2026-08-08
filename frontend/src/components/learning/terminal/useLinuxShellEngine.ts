import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface VFSNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  permissions?: string;
  owner?: string;
  group?: string;
  size?: number;
  updatedAt?: string;
  children?: VFSNode[];
}

export type VFSFile = VFSNode;

export interface HistoryEntry {
  id: string;
  prompt: string;
  command: string;
  output: string;
  isError?: boolean;
  timestamp: string;
}

export interface LabTask {
  id: number;
  title: string;
  description: string;
  commandPattern: RegExp;
  completed: boolean;
  xp: number;
}

export interface TerminalTab {
  id: string;
  title: string;
  active: boolean;
  history: HistoryEntry[];
}

// Generate tasks dynamically from lesson commands
function createDynamicTasks(cmds?: Array<{ command: string; description: string }>): LabTask[] {
  if (!cmds || cmds.length === 0) return [];
  return cmds.map((item, idx) => {
    const escaped = item.command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return {
      id: idx + 1,
      title: `Run \`${item.command}\``,
      description: item.description,
      commandPattern: new RegExp(escaped, 'i'),
      completed: false,
      xp: 10,
    };
  });
}

// Helper for file timestamps in terminal
function getDefaultFileDate(): string {
  const d = new Date();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month} ${day} ${hours}:${minutes}`;
}

// Default initial Virtual Filesystem Root (`/`)
const INITIAL_ROOT_VFS: VFSNode = {
  name: '',
  type: 'dir',
  children: [
    {
      name: 'home',
      type: 'dir',
      children: [
        {
          name: 'student',
          type: 'dir',
          permissions: 'drwxr-xr-x',
          owner: 'student',
          group: 'student',
          children: [
            {
              name: 'README.md',
              type: 'file',
              content: '# SHAIVIKA Linux Enterprise Training Lab\nWelcome to Ubuntu 24.04 LTS System Administration Lab!\nUse this environment to practice bash commands, file manipulation, and git workflows.',
              permissions: '-rw-r--r--',
              owner: 'student',
              group: 'student',
              size: 215,
              updatedAt: getDefaultFileDate(),
            },
            {
              name: 'scripts',
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: 'student',
              group: 'student',
              children: [
                {
                  name: 'deploy.sh',
                  type: 'file',
                  content: '#!/bin/bash\necho "Deploying Shaivika LMS Container microservices..."\nsleep 1\necho "Build completed successfully!"',
                  permissions: '-rwxr-xr-x',
                  owner: 'student',
                  group: 'student',
                  size: 110,
                  updatedAt: getDefaultFileDate(),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

function getDirectoryNode(root: VFSNode, absPath: string): VFSNode | null {
  const parts = absPath.split('/').filter(Boolean);
  let curr: VFSNode = root;

  for (const part of parts) {
    if (!curr.children) return null;
    const found = curr.children.find((c) => c.name === part && c.type === 'dir');
    if (!found) return null;
    curr = found;
  }
  return curr;
}

function getNodeAtPath(root: VFSNode, absPath: string): VFSNode | null {
  const parts = absPath.split('/').filter(Boolean);
  let curr: VFSNode = root;

  for (let i = 0; i < parts.length; i++) {
    if (!curr.children) return null;
    const found = curr.children.find((c) => c.name === parts[i]);
    if (!found) return null;
    curr = found;
  }
  return curr;
}

function getInitialVfs(isKubernetesCourse: boolean): VFSNode {
  if (!isKubernetesCourse) return INITIAL_ROOT_VFS;
  
  // Clone INITIAL_ROOT_VFS and add templates in home/student
  const clone = JSON.parse(JSON.stringify(INITIAL_ROOT_VFS));
  
  // Safe dynamic lookup of student home directory
  let studentDir = clone.children?.find((c: any) => c.name === 'home')
    ?.children?.find((c: any) => c.name === 'student');

  if (!studentDir) {
    studentDir = clone.children?.[0]?.children?.[0];
  }

  // Ensure children array is initialized before performing push operations
  if (studentDir && !studentDir.children) {
    studentDir.children = [];
  }
  
  const templates = [
    {
      name: 'pod.yaml',
      content: `apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: web
spec:
  containers:
  - name: web-container
    image: nginx:latest
    ports:
    - containerPort: 80`
    },
    {
      name: 'deployment.yaml',
      content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.21`
    },
    {
      name: 'service.yaml',
      content: `apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080`
    },
    {
      name: 'ingress.yaml',
      content: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
spec:
  rules:
  - host: myweb.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80`
    },
    {
      name: 'pvc.yaml',
      content: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nginx-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi`
    },
    {
      name: 'deployment-storage.yaml',
      content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-storage-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: web-storage
  template:
    metadata:
      labels:
        app: web-storage
    spec:
      containers:
      - name: web-server
        image: nginx:latest
        volumeMounts:
        - mountPath: "/usr/share/nginx/html"
          name: web-data
      volumes:
      - name: web-data
        persistentVolumeClaim:
          claimName: nginx-pvc`
    },
    {
      name: 'serviceaccount.yaml',
      content: `apiVersion: v1
kind: ServiceAccount
metadata:
  name: nginx-sa`
    },
    {
      name: 'rbac.yaml',
      content: `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
subjects:
- kind: ServiceAccount
  name: nginx-sa
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io`
    },
    {
      name: 'secret.yaml',
      content: `apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  password: c3VwZXJzZWNyZXQ=`
    },
    {
      name: 'fullstack-app.yaml',
      content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: frontend:latest
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: backend:latest
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  ports:
  - port: 8080
    targetPort: 5000
  selector:
    app: backend`
    }
  ];
  
  if (studentDir && studentDir.children) {
    templates.forEach(t => {
      studentDir.children.push({
        name: t.name,
        type: 'file',
        permissions: '-rw-r--r--',
        owner: 'student',
        group: 'student',
        content: t.content,
        size: t.content.length,
        updatedAt: getDefaultFileDate(),
      });
    });
  }
  
  return clone;
}

export const useLinuxShellEngine = (
  _isGitCourse = false,
  initialCommands?: Array<{ command: string; description: string }>,
  isKubernetesCourse = false
) => {
  const [currentPath, setCurrentPath] = useState<string>('/home/student');
  const [vfsRoot, setVfsRoot] = useState<VFSNode>(() => getInitialVfs(isKubernetesCourse));
  const [appliedResources, setAppliedResources] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (isKubernetesCourse) {
      initial.add('minikube');
    }
    return initial;
  });
  const [scaledDeployments, setScaledDeployments] = useState<Map<string, number>>(() => new Map());
  const [gitBranch, setGitBranch] = useState<string>('main');
  const [tasks, setTasks] = useState<LabTask[]>(() => createDynamicTasks(initialCommands));
  const [commandHistoryList, setCommandHistoryList] = useState<string[]>(['uname -a', 'whoami', 'pwd']);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'tab-1',
      title: 'bash (ubuntu-24.04)',
      active: true,
      history: [
        {
          id: 'h-1',
          prompt: 'student@ubuntu:~$',
          command: 'uname -a',
          output: 'Linux ubuntu-2404-lms 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC Thu Apr 4 00:00:00 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux',
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: 'h-2',
          prompt: 'student@ubuntu:~$',
          command: 'whoami',
          output: 'student',
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    },
  ]);

  const activeTab = tabs.find((t) => t.active) || tabs[0];

  const getDisplayPath = useCallback((fullPath: string) => {
    if (fullPath === '/home/student') return '~';
    if (fullPath.startsWith('/home/student/')) return `~/${fullPath.replace('/home/student/', '')}`;
    return fullPath;
  }, []);

  const getPromptString = useCallback(() => {
    return `student@ubuntu:${getDisplayPath(currentPath)}$`;
  }, [currentPath, getDisplayPath]);

  // Tab management
  const addTab = useCallback(() => {
    if (tabs.length >= 4) {
      toast.warning('Maximum 4 terminal sessions allowed');
      return;
    }
    const newId = `tab-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newId,
      title: `bash (${tabs.length + 1})`,
      active: true,
      history: [
        {
          id: `h-${Date.now()}`,
          prompt: getPromptString(),
          command: 'clear',
          output: '',
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    };

    setTabs((prev) => prev.map((t) => ({ ...t, active: false })).concat(newTab));
    toast.success(`Opened terminal session: ${newTab.title}`);
  }, [tabs, getPromptString]);

  const closeTab = useCallback((id: string) => {
    if (tabs.length <= 1) {
      toast.info('Cannot close primary terminal session');
      return;
    }
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (!filtered.some((t) => t.active)) {
        filtered[0].active = true;
      }
      return filtered;
    });
  }, [tabs]);

  const selectTab = useCallback((id: string) => {
    setTabs((prev) => prev.map((t) => ({ ...t, active: t.id === id })));
  }, []);

  // TAB Autocompletion helper
  const getTabSuggestions = useCallback((input: string): string | null => {
    const trimmed = input.trimStart();
    const parts = trimmed.split(/\s+/);
    const knownCmds = ['ls', 'cd', 'mkdir', 'touch', 'cat', 'pwd', 'whoami', 'uname', 'clear', 'help', 'git', 'chmod', 'cp', 'mv', 'echo', 'rm'];

    if (parts.length === 1) {
      const match = knownCmds.find((c) => c.startsWith(parts[0]));
      if (match && match !== parts[0]) return match;
    } else if (parts.length >= 2) {
      const parentDir = getDirectoryNode(vfsRoot, currentPath);
      const existingNames = parentDir?.children?.map((c) => c.name) || [];
      const lastPart = parts[parts.length - 1];
      const match = existingNames.find((n) => n.startsWith(lastPart));
      if (match && match !== lastPart) {
        parts[parts.length - 1] = match;
        return parts.join(' ');
      }
    }
    return null;
  }, [vfsRoot, currentPath]);

  // Execute authentic Linux Bash commands
  const executeCommand = useCallback((rawCmd: string) => {
    const cleanCmd = rawCmd.trim();
    if (!cleanCmd) return;

    const currentPrompt = getPromptString();
    setCommandHistoryList((prev) => [cleanCmd, ...prev.filter((c) => c !== cleanCmd)]);
    setHistoryIndex(-1);

    let output = '';
    let isError = false;

    // Handle `clear` and `cls`
    if (cleanCmd === 'clear' || cleanCmd === 'cls') {
      setTabs((prev) =>
        prev.map((t) => (t.active ? { ...t, history: [] } : t))
      );
      return;
    }

    const tokens = cleanCmd.split(/\s+/);
    const cmd = tokens[0];

    if (cmd === 'pwd') {
      output = currentPath;
    } else if (cmd === 'whoami') {
      output = 'student';
    } else if (cmd === 'uname') {
      if (tokens[1] === '-a') {
        output = 'Linux ubuntu-2404-lms 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC Thu Apr 4 00:00:00 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux';
      } else {
        output = 'Linux';
      }
    } else if (cmd === 'date') {
      output = new Date().toUTCString();
    } else if (cmd === 'help') {
      output = `Ubuntu 24.04 LTS System Administration Shell (v6.8.0-generic)\nAvailable commands:\n  ls -la           List directory contents with details\n  cd <dir>         Change working directory\n  pwd              Print working directory\n  mkdir <dir>      Create target directory\n  touch <file>     Create empty file\n  cat <file>       Read file content\n  rm <file>        Remove file\n  git <cmd>        Git source control commands\n  uname -a         Print kernel & architecture info\n  whoami           Show current active user\n  clear            Clear terminal buffer screen`;
    } else if (cmd === 'mkdir') {
      const args = tokens.slice(1).filter((t) => !t.startsWith('-'));
      const isVerbose = tokens.includes('-v');

      if (args.length === 0) {
        output = 'mkdir: missing operand\nTry \'mkdir --help\' for more information.';
        isError = true;
      } else {
        const folderName = args[0];
        const parentDir = getDirectoryNode(vfsRoot, currentPath);

        if (parentDir && parentDir.children) {
          const exists = parentDir.children.some((c) => c.name === folderName);
          if (exists) {
            output = `mkdir: cannot create directory ‘${folderName}’: File exists`;
            isError = true;
          } else {
            const newDir: VFSNode = {
              name: folderName,
              type: 'dir',
              permissions: 'drwxr-xr-x',
              owner: 'student',
              group: 'student',
              children: [],
            };
            parentDir.children.push(newDir);
            setVfsRoot({ ...vfsRoot });
            output = isVerbose ? `mkdir: created directory '${folderName}'` : '';
          }
        }
      }
    } else if (cmd === 'touch') {
      const args = tokens.slice(1);
      if (args.length === 0) {
        output = 'touch: missing file operand\nTry \'touch --help\' for more information.';
        isError = true;
      } else {
        const fileName = args[0];
        const parentDir = getDirectoryNode(vfsRoot, currentPath);

        if (parentDir && parentDir.children) {
          const existing = parentDir.children.find((c) => c.name === fileName);
          if (!existing) {
            const newFile: VFSNode = {
              name: fileName,
              type: 'file',
              content: '',
              permissions: '-rw-r--r--',
              owner: 'student',
              group: 'student',
              size: 0,
              updatedAt: getDefaultFileDate(),
            };
            parentDir.children.push(newFile);
            setVfsRoot({ ...vfsRoot });
          }
          output = '';
        }
      }
    } else if (cmd === 'cd') {
      const target = tokens[1] || '~';

      if (target === '~' || target === '/home/student') {
        setCurrentPath('/home/student');
        output = '';
      } else if (target === '..') {
        if (currentPath !== '/home/student') {
          const parts = currentPath.split('/');
          parts.pop();
          setCurrentPath(parts.join('/') || '/home/student');
        }
        output = '';
      } else {
        const relPath = target.replace(/^\.\//, '');
        const targetAbsPath = currentPath.endsWith('/') ? `${currentPath}${relPath}` : `${currentPath}/${relPath}`;
        const targetNode = getNodeAtPath(vfsRoot, targetAbsPath);

        if (targetNode && targetNode.type === 'dir') {
          setCurrentPath(targetAbsPath);
          output = '';
        } else {
          output = `bash: cd: ${target}: No such file or directory`;
          isError = true;
        }
      }
    } else if (cmd === 'ls') {
      const isDetailed = tokens.includes('-l') || tokens.includes('-la') || tokens.includes('-al') || tokens.includes('-a');
      const parentDir = getDirectoryNode(vfsRoot, currentPath);

      if (parentDir && parentDir.children) {
        if (isDetailed) {
          const rows = parentDir.children.map((c) => {
            const perm = c.permissions || (c.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--');
            const owner = c.owner || 'student';
            const group = c.group || 'student';
            const size = c.size || (c.type === 'dir' ? 4096 : 1024);
            const date = c.updatedAt || getDefaultFileDate();
            const displayName = c.type === 'dir' ? `${c.name}/` : c.name;
            return `${perm} 1 ${owner} ${group} ${size.toString().padStart(6, ' ')} ${date} ${displayName}`;
          });

          output = `total ${parentDir.children.length * 4}\n${rows.join('\n')}`;
        } else {
          output = parentDir.children.map((c) => (c.type === 'dir' ? `${c.name}/` : c.name)).join('  ');
        }
      } else {
        output = '';
      }
    } else if (cmd === 'cat') {
      const targetFile = tokens[1];
      if (!targetFile) {
        output = 'cat: missing filename operand';
        isError = true;
      } else {
        const parentDir = getDirectoryNode(vfsRoot, currentPath);
        const fileNode = parentDir?.children?.find((c) => c.name === targetFile && c.type === 'file');

        if (fileNode) {
          output = fileNode.content || '';
        } else {
          output = `cat: ${targetFile}: No such file or directory`;
          isError = true;
        }
      }
    } else if (cmd === 'rm') {
      const target = tokens.filter((t) => !t.startsWith('-'))[1];
      if (!target) {
        output = 'rm: missing operand';
        isError = true;
      } else {
        const parentDir = getDirectoryNode(vfsRoot, currentPath);
        if (parentDir && parentDir.children) {
          const idx = parentDir.children.findIndex((c) => c.name === target);
          if (idx !== -1) {
            parentDir.children.splice(idx, 1);
            setVfsRoot({ ...vfsRoot });
            output = '';
          } else {
            output = `rm: cannot remove '${target}': No such file or directory`;
            isError = true;
          }
        }
      }
    } else if (cmd === 'echo') {
      const redirectIdx = tokens.indexOf('>');
      if (redirectIdx !== -1 && redirectIdx < tokens.length - 1) {
        const text = tokens.slice(1, redirectIdx).join(' ').replace(/^["']|["']$/g, '');
        const targetFile = tokens[redirectIdx + 1];

        const parentDir = getDirectoryNode(vfsRoot, currentPath);
        if (parentDir && parentDir.children) {
          let fileNode = parentDir.children.find((c) => c.name === targetFile && c.type === 'file');
          if (fileNode) {
            fileNode.content = text;
            fileNode.size = text.length;
          } else {
            fileNode = {
              name: targetFile,
              type: 'file',
              content: text,
              permissions: '-rw-r--r--',
              owner: 'student',
              group: 'student',
              size: text.length,
              updatedAt: getDefaultFileDate(),
            };
            parentDir.children.push(fileNode);
          }
          setVfsRoot({ ...vfsRoot });
        }
        output = '';
      } else {
        output = cleanCmd.replace(/^echo\s*/, '').replace(/^["']|["']$/g, '');
      }
    } else if (cmd === 'git') {
      const gitSub = tokens[1];
      if (gitSub === 'status') {
        output = `On branch ${gitBranch}\nYour branch is up to date with 'origin/${gitBranch}'.\n\nnothing to commit, working tree clean`;
      } else if (gitSub === 'checkout' || gitSub === 'switch') {
        const branchName = tokens[tokens.length - 1] || 'main';
        setGitBranch(branchName);
        output = `Switched to branch '${branchName}'`;
      } else if (gitSub === 'init') {
        output = `Initialized empty Git repository in ${currentPath}/.git/`;
      } else if (gitSub === 'add') {
        output = '';
      } else if (gitSub === 'commit') {
        output = `[${gitBranch} 8f3a9b1] feat: lab progress update\n 1 file changed, 1 insertion(+)`;
      } else {
        output = `git: '${gitSub}' is not a git command. See 'git --help'.`;
        isError = true;
      }
    } else if (cmd === 'minikube') {
      const sub = tokens[1];
      if (sub === 'start') {
        setAppliedResources(prev => {
          const next = new Set(prev);
          next.add('minikube');
          return next;
        });
        output = `😄  minikube v1.32.0 on Ubuntu 24.04\n✨  Automatically selected the docker driver\n👍  Starting control plane node minikube in cluster minikube\n🚜  Pulling base image ...\n🔥  Creating docker container (CPUs=2, Memory=2200MB, Disk=20000MB) ...\n🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...\n🔎  Verifying Kubernetes components...\n    ▪ Enabled addons: default-storageclass, storage-provisioner\n🌟  Enabled addons: \n🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default`;
      } else if (sub === 'status') {
        const started = appliedResources.has('minikube');
        if (started) {
          output = `minikube\ntype: Control Plane\nhost: Running\nkubelet: Running\napiserver: Running\nkubeconfig: Configured`;
        } else {
          output = `minikube\ntype: Control Plane\nhost: Stopped\nkubelet: Stopped\napiserver: Stopped\nkubeconfig: Misconfigured`;
        }
      } else {
        output = `minikube: '${sub}' is not supported in this learning sandbox environment.`;
        isError = true;
      }
    } else if (cmd === 'kubectl') {
      const sub = tokens[1];
      const target = tokens[2];
      const extra = tokens.slice(3).join(' ');
      
      const isMinikubeRunning = appliedResources.has('minikube') || !isKubernetesCourse;
      
      if (!isMinikubeRunning) {
        output = 'The connection to the server localhost:8080 was refused - did you specify the right host or port? (Minikube is stopped. Run "minikube start" to start the cluster)';
        isError = true;
      } else if (sub === 'version') {
        output = 'Client Version: v1.28.3\nKustomize Version: v5.0.4-0.20230601165947-6ce0bf390ce3';
      } else if (sub === 'get' && target === 'nodes') {
        output = 'NAME       STATUS   ROLES           AGE   VERSION\nminikube   Ready    control-plane   2d    v1.28.3';
      } else if (sub === 'get' && (target === 'ns' || target === 'namespaces')) {
        output = 'NAME              STATUS   AGE\ndefault           Active   2d\nkube-node-lease   Active   2d\nkube-public       Active   2d\nkube-system       Active   2d';
      } else if (sub === 'apply' && cleanCmd.includes('-f')) {
        const file = cleanCmd.split('-f')[1]?.trim() || '';
        
        const parentDir = getDirectoryNode(vfsRoot, currentPath);
        const fileExists = parentDir?.children?.some(c => c.name === file && c.type === 'file');
        
        if (!fileExists) {
          output = `Error: the path "${file}" does not exist.`;
          isError = true;
        } else {
          setAppliedResources(prev => {
            const next = new Set(prev);
            next.add(file);
            return next;
          });
          
          if (file === 'pod.yaml') {
            output = 'pod/nginx-pod created';
          } else if (file === 'deployment.yaml') {
            output = 'deployment.apps/nginx-deployment created';
          } else if (file === 'service.yaml') {
            output = 'service/nginx-service created';
          } else if (file === 'ingress.yaml') {
            output = 'ingress.networking.k8s.io/nginx-ingress created';
          } else if (file === 'pvc.yaml') {
            output = 'persistentvolumeclaim/nginx-pvc created';
          } else if (file === 'deployment-storage.yaml') {
            output = 'deployment.apps/nginx-storage-deployment created';
          } else if (file === 'serviceaccount.yaml') {
            output = 'serviceaccount/nginx-sa created';
          } else if (file === 'rbac.yaml') {
            output = 'role.rbac.authorization.k8s.io/pod-reader created\nrolebinding.rbac.authorization.k8s.io/read-pods created';
          } else if (file === 'secret.yaml') {
            output = 'secret/db-secret created';
          } else if (file === 'fullstack-app.yaml') {
            output = 'deployment.apps/frontend-deployment created\nservice/frontend-service created\ndeployment.apps/backend-deployment created\nservice/backend-service created';
          } else {
            output = `kubectl apply: custom file "${file}" processed successfully.`;
          }
        }
      } else if (sub === 'get') {
        const showAllNamespaces = cleanCmd.includes('-A') || cleanCmd.includes('--all-namespaces');
        
        if (target === 'pods' || target === 'pod') {
          let rows = 'NAME                                READY   STATUS    RESTARTS   AGE\n';
          let count = 0;
          
          if (showAllNamespaces) {
            rows = `NAMESPACE     NAME                               READY   STATUS    RESTARTS   AGE\n`;
            rows += `kube-system   coredns-5dd5756b68-r4k6n           1/1     Running   0          2d\n`;
            rows += `kube-system   etcd-minikube                      1/1     Running   0          2d\n`;
            rows += `kube-system   kube-apiserver-minikube            1/1     Running   0          2d\n`;
            rows += `kube-system   kube-controller-manager-minikube   1/1     Running   0          2d\n`;
            rows += `kube-system   kube-proxy-m4v5x                   1/1     Running   0          2d\n`;
            rows += `kube-system   kube-scheduler-minikube            1/1     Running   0          2d\n`;
            rows += `kube-system   storage-provisioner                1/1     Running   0          2d\n`;
            count += 7;
          }
          
          if (appliedResources.has('pod.yaml')) {
            const prefix = showAllNamespaces ? 'default       ' : '';
            rows += `${prefix}nginx-pod                           1/1     Running   0          45s\n`;
            count++;
          }
          if (appliedResources.has('deployment.yaml')) {
            const prefix = showAllNamespaces ? 'default       ' : '';
            const reps = scaledDeployments.get('nginx-deployment') ?? 3;
            for (let i = 0; i < reps; i++) {
              const randHex = `7fb96c846b-8xpr${i}`;
              rows += `${prefix}nginx-deployment-${randHex}   1/1     Running   0          12s\n`;
              count++;
            }
          }
          if (appliedResources.has('deployment-storage.yaml')) {
            const prefix = showAllNamespaces ? 'default       ' : '';
            rows += `${prefix}nginx-storage-deployment-6f9fb9-abc 1/1     Running   0          10s\n`;
            count++;
          }
          if (appliedResources.has('fullstack-app.yaml')) {
            const prefix = showAllNamespaces ? 'default       ' : '';
            rows += `${prefix}frontend-deployment-8594966-w8q4s   1/1     Running   0          22s\n`;
            rows += `${prefix}backend-deployment-64d85db-k9l2g    1/1     Running   0          22s\n`;
            count += 2;
          }
          
          if (count === 0) {
            output = 'No resources found in default namespace.';
          } else {
            output = rows.trim();
          }
        } else if (target === 'deployments' || target === 'deployment') {
          let rows = 'NAME               READY   UP-TO-DATE   AVAILABLE   AGE\n';
          let count = 0;
          if (appliedResources.has('deployment.yaml')) {
            const reps = scaledDeployments.get('nginx-deployment') ?? 3;
            rows += `nginx-deployment   ${reps}/${reps}     ${reps}            ${reps}           1m\n`;
            count++;
          }
          if (appliedResources.has('deployment-storage.yaml')) {
            rows += `nginx-storage-deployment   1/1     1            1           30s\n`;
            count++;
          }
          if (appliedResources.has('fullstack-app.yaml')) {
            rows += `frontend-deployment        1/1     1            1           22s\n`;
            rows += `backend-deployment         1/1     1            1           22s\n`;
            count += 2;
          }
          if (count === 0) {
            output = 'No resources found in default namespace.';
          } else {
            output = rows.trim();
          }
        } else if (target === 'services' || target === 'service' || target === 'svc') {
          let rows = 'NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE\n';
          rows += `kubernetes      ClusterIP   10.96.0.1       <none>        443/TCP        2h\n`;
          let count = 1;
          if (appliedResources.has('service.yaml')) {
            rows += `nginx-service   NodePort    10.104.22.193   <none>        80:30080/TCP   45s\n`;
            count++;
          }
          if (appliedResources.has('fullstack-app.yaml')) {
            rows += `frontend-service LoadBalancer 10.101.44.89   34.120.12.89  80:31280/TCP   22s\n`;
            rows += `backend-service  ClusterIP    10.102.155.12  <none>        8080/TCP       22s\n`;
            count += 2;
          }
          output = rows.trim();
        } else if (target === 'pvc' || target === 'persistentvolumeclaim') {
          let rows = 'NAME        STATUS   VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE\n';
          let count = 0;
          if (appliedResources.has('pvc.yaml')) {
            rows += `nginx-pvc   Bound    pv0001   1Gi        RWO            standard       1m\n`;
            count++;
          }
          if (count === 0) {
            output = 'No resources found in default namespace.';
          } else {
            output = rows.trim();
          }
        } else if (target === 'all') {
          let sections = '';
          
          let pods = 'NAME                                READY   STATUS    RESTARTS   AGE\n';
          let hasPod = false;
          if (appliedResources.has('pod.yaml')) {
            pods += `nginx-pod                           1/1     Running   0          45s\n`;
            hasPod = true;
          }
          if (appliedResources.has('deployment.yaml')) {
            const reps = scaledDeployments.get('nginx-deployment') ?? 3;
            for (let i = 0; i < reps; i++) {
              pods += `nginx-deployment-7fb96c846b-rand${i}   1/1     Running   0          12s\n`;
            }
            hasPod = true;
          }
          if (appliedResources.has('fullstack-app.yaml')) {
            pods += `frontend-deployment-8594966-w8q4s   1/1     Running   0          22s\n`;
            pods += `backend-deployment-64d85db-k9l2g    1/1     Running   0          22s\n`;
            hasPod = true;
          }
          if (hasPod) sections += pods.trim() + '\n\n';
          
          let svcs = 'NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE\n';
          svcs += `kubernetes      ClusterIP   10.96.0.1       <none>        443/TCP        2h\n`;
          if (appliedResources.has('service.yaml')) {
            svcs += `nginx-service   NodePort    10.104.22.193   <none>        80:30080/TCP   45s\n`;
          }
          if (appliedResources.has('fullstack-app.yaml')) {
            svcs += `frontend-service LoadBalancer 10.101.44.89   34.120.12.89  80:31280/TCP   22s\n`;
            svcs += `backend-service  ClusterIP    10.102.155.12  <none>        8080/TCP       22s\n`;
          }
          sections += svcs.trim() + '\n\n';
          
          let deploys = 'NAME               READY   UP-TO-DATE   AVAILABLE   AGE\n';
          let hasDeploy = false;
          if (appliedResources.has('deployment.yaml')) {
            const reps = scaledDeployments.get('nginx-deployment') ?? 3;
            deploys += `nginx-deployment   ${reps}/${reps}     ${reps}            ${reps}           1m\n`;
            hasDeploy = true;
          }
          if (appliedResources.has('fullstack-app.yaml')) {
            deploys += `frontend-deployment   1/1     1            1           22s\n`;
            deploys += `backend-deployment    1/1     1            1           22s\n`;
            hasDeploy = true;
          }
          if (hasDeploy) sections += deploys.trim();
          
          output = sections.trim();
        } else {
          output = 'No resources found in default namespace.';
        }
      } else if (sub === 'scale') {
        const isDeploy = target === 'deployment' || target === 'deployments';
        const deployName = tokens[3] || '';
        const repArg = tokens.find(t => t.startsWith('--replicas='));
        const reps = repArg ? parseInt(repArg.split('=')[1] || '1') : 3;
        
        const key = deployName === 'nginx-deployment' ? 'deployment.yaml' : '';
        
        if (isDeploy && appliedResources.has(key)) {
          setScaledDeployments(prev => {
            const next = new Map(prev);
            next.set(deployName, reps);
            return next;
          });
          output = `deployment.apps/${deployName} scaled`;
        } else {
          output = `Error from server (NotFound): deployments.apps "${deployName}" not found`;
          isError = true;
        }
      } else if (sub === 'rollout') {
        const action = target;
        const targetDeploy = tokens[3] || '';
        const deployName = targetDeploy.split('/')[1] || targetDeploy || '';
        const key = deployName === 'nginx-deployment' ? 'deployment.yaml' : '';
        
        if (appliedResources.has(key)) {
          if (action === 'status') {
            const reps = scaledDeployments.get(deployName) ?? 3;
            output = `Waiting for deployment "${deployName}" rollout to finish: ${reps} replicas are available...\ndeployment "${deployName}" successfully rolled out`;
          } else if (action === 'undo') {
            output = `deployment.apps/${deployName} rolled back`;
          } else {
            output = `kubectl rollout: action "${action}" not recognized.`;
          }
        } else {
          output = `Error from server (NotFound): deployments.apps "${deployName}" not found`;
          isError = true;
        }
      } else if (sub === 'logs') {
        const podName = target;
        const exists = appliedResources.has('pod.yaml') && podName === 'nginx-pod';
        if (exists) {
          output = `10.244.0.1 - - [08/Aug/2026:09:54:12 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0"\n2026/08/08 09:54:12 [notice] 1#1: start worker process 31`;
        } else {
          output = `Error from server (NotFound): pods "${podName}" not found`;
          isError = true;
        }
      } else if (sub === 'delete') {
        const resourceType = target;
        const resourceName = extra.trim() || tokens[3] || '';
        
        if (resourceType === 'pod') {
          if (resourceName === 'nginx-pod') {
            setAppliedResources(prev => {
              const next = new Set(prev);
              next.delete('pod.yaml');
              return next;
            });
            output = 'pod "nginx-pod" deleted';
          } else {
            output = `pod "${resourceName}" not found`;
            isError = true;
          }
        } else if (resourceType === 'deployment') {
          if (resourceName === 'nginx-deployment') {
            setAppliedResources(prev => {
              const next = new Set(prev);
              next.delete('deployment.yaml');
              return next;
            });
            output = 'deployment.apps "nginx-deployment" deleted';
          } else {
            output = `deployment "${resourceName}" not found`;
            isError = true;
          }
        } else {
          output = `${resourceType} "${resourceName}" deleted`;
        }
      } else if (sub === 'describe') {
        const resourceType = target;
        const resourceName = tokens[3] || '';
        
        if (resourceType === 'pod' && resourceName === 'failed-pod') {
          output = `Name:             failed-pod\nNamespace:        default\nStatus:           Failed\nReason:           CrashLoopBackOff\nContainers:\n  web-container:\n    Image:          nginx:invalid-tag\n    State:          Waiting\n      Reason:       ImagePullBackOff\nEvents:\n  Type     Reason     Age                From               Message\n  ----     ------     ---                ----               -------\n  Normal   Scheduled  1m                 default-scheduler  Successfully assigned default/failed-pod to minikube\n  Warning  Failed     45s (x3 over 55s)  kubelet            Failed to pull image "nginx:invalid-tag": rpc error: code = NotFound desc = failed to pull and unpack image`;
        } else if (resourceType === 'pod' && resourceName === 'nginx-pod' && appliedResources.has('pod.yaml')) {
          output = `Name:             nginx-pod\nNamespace:        default\nStatus:           Running\nContainers:\n  web-container:\n    Image:          nginx:latest\n    State:          Running\nEvents:\n  Type    Reason     Age   From               Message\n  ----    ------     ---   ----               -------\n  Normal  Scheduled  1m    default-scheduler  Successfully assigned default/nginx-pod to minikube\n  Normal  Pulled     55s   kubelet            Container image "nginx:latest" already present on machine\n  Normal  Created    55s   kubelet            Created container web-container\n  Normal  Started    54s   kubelet            Started container web-container`;
        } else {
          output = `Error from server (NotFound): ${resourceType}s "${resourceName}" not found`;
          isError = true;
        }
      } else {
        output = `kubectl: command not supported or invalid syntax. Available: apply, get, scale, rollout, logs, delete, describe.`;
        isError = true;
      }
    } else if (cmd === 'helm') {
      const sub = tokens[1];
      if (sub === 'install') {
        output = `NAME: my-release\nLAST DEPLOYED: Sat Aug  8 09:55:00 2026\nNAMESPACE: default\nSTATUS: deployed\nREVISION: 1\nTEST SUITE: None\nNOTES:\nGet the NGINX URL by running:\n  kubectl get svc --namespace default my-release-nginx`;
      } else if (sub === 'list') {
        output = `NAME          NAMESPACE    REVISION    UPDATED                                 STATUS      CHART            APP VERSION\nmy-release    default      1           2026-08-08 09:55:00.825121 -0500 CDT    deployed    nginx-15.0.2     1.25.3`;
      } else {
        output = `Helm package manager emulator. Supported: install, list.`;
      }
    } else if (cmd === 'docker') {
      const sub = tokens[1];
      if (sub === 'build') {
        output = `Sending build context to Docker daemon  42.5MB\nStep 1/5 : FROM node:18-alpine\n ---> 827292a839f2\nStep 2/5 : WORKDIR /app\n ---> Using cache\nStep 3/5 : COPY package*.json ./\n ---> Using cache\nStep 4/5 : RUN npm install\n ---> Using cache\nStep 5/5 : COPY . .\n ---> 91f3cb8a0bfb\nSuccessfully built 91f3cb8a0bfb\nSuccessfully tagged frontend:latest`;
      } else {
        output = `Docker emulator. Supported: build.`;
      }
    } else {
      output = `bash: ${cmd}: command not found`;
      isError = true;
    }

    // Auto-check lab tasks matching patterns
    setTasks((prev) =>
      prev.map((t) => {
        if (!t.completed && t.commandPattern.test(cleanCmd)) {
          toast.success(`🎉 Objective Completed: ${t.title} (+${t.xp} XP)`);
          return { ...t, completed: true };
        }
        return t;
      })
    );

    const newHistoryEntry: HistoryEntry = {
      id: `h-${Date.now()}`,
      prompt: currentPrompt,
      command: cleanCmd,
      output,
      isError,
      timestamp: new Date().toLocaleTimeString(),
    };

    setTabs((prev) =>
      prev.map((t) => (t.active ? { ...t, history: [...t.history, newHistoryEntry] } : t))
    );
  }, [currentPath, getPromptString, gitBranch, vfsRoot]);

  const resetLab = useCallback(() => {
    setCurrentPath('/home/student');
    setGitBranch('main');
    setVfsRoot(getInitialVfs(isKubernetesCourse));
    setAppliedResources(() => {
      const initial = new Set<string>();
      if (isKubernetesCourse) {
        initial.add('minikube');
      }
      return initial;
    });
    setScaledDeployments(new Map());
    setTasks(createDynamicTasks(initialCommands));
    setTabs([
      {
        id: 'tab-1',
        title: 'bash (ubuntu-24.04)',
        active: true,
        history: [
          {
            id: 'h-init',
            prompt: 'student@ubuntu:~$',
            command: 'uname -a',
            output: 'Linux ubuntu-2404-lms 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC Thu Apr 4 00:00:00 UTC 2024 x86_64 GNU/Linux',
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      },
    ]);
    toast.info('🔄 Linux Lab environment reset to initial state.');
  }, [initialCommands]);

  const studentHomeDir = getDirectoryNode(vfsRoot, '/home/student');

  return {
    currentPath,
    getDisplayPath,
    getPromptString,
    vfs: studentHomeDir || { name: 'student', type: 'dir', children: [] },
    gitBranch,
    tasks,
    tabs,
    activeTab,
    addTab,
    closeTab,
    selectTab,
    executeCommand,
    getTabSuggestions,
    commandHistoryList,
    historyIndex,
    setHistoryIndex,
    resetLab,
  };
};
