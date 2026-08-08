import type { ModuleItem, LearningUnitItem } from '../contexts/CourseContext';

// Helper to create a standard lesson
const createLesson = (
  id: string,
  title: string,
  desc: string,
  duration: string,
  type: 'Video' | 'Reading' | 'Assignment',
  readingContent: string,
  commands?: Array<{ command: string; description: string }>
): LearningUnitItem => ({
  id,
  title,
  description: desc,
  duration,
  type,
  readingContent,
  practiceLabChallenge: undefined,
  resources: [
    {
      id: `res-${id}-notes`,
      name: `${title.replace(/^[0-9.]+\s*/, '')} - Study Notes.pdf`,
      description: 'Comprehensive study guide and configuration snippets.',
      category: 'PDF',
      fileSize: '1.4 MB',
      downloadPermission: true
    },
    {
      id: `res-${id}-cheatsheet`,
      name: 'Kubernetes Kubectl Cheat Sheet.pdf',
      description: 'Quick reference sheet for daily kubectl commands.',
      category: 'PDF',
      fileSize: '520 KB',
      downloadPermission: true
    }
  ],
  ...(commands ? { commands } : {})
});

export const kubernetesCourseModules: ModuleItem[] = [
  {
    id: 'k8s-mod-1',
    title: 'Module 1 — Kubernetes Basics',
    description: 'Learn container orchestration fundamentals, Kubernetes architecture components, YAML objects, cluster setup using Minikube, and basic kubectl operations.',
    duration: '5 Hours',
    topics: [
      {
        id: 'k8s-topic-1',
        title: 'Kubernetes Core Fundamentals',
        description: 'Os-independent container orchestrator architecture and local setup environment.',
        estimatedDuration: '300 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-1-1',
            '1.1 Introduction to Kubernetes',
            'Understand what Kubernetes (K8s) is, why it is used, and container orchestration advantages.',
            '35 mins',
            'Reading',
            `## Introduction to Kubernetes (K8s)
Kubernetes is an open-source container orchestration platform originally designed by Google. It automates container deployment, scaling, load balancing, and storage provisioning.

### Core Orchestration Challenges Solved:
1. **High Availability**: Automated health checks and self-healing restarts.
2. **Horizontal Scaling**: Adding/removing replicas instantly.
3. **Load Balancing**: Routing traffic efficiently to active instances.
4. **Service Discovery**: DNS naming conventions for internal routing.

### Real-World Use Case:
Imagine running hundreds of Docker containers. Manually tracking down failures, updating images without downtime, and balancing traffic is impossible. Kubernetes automates these operations.`
          ),
          createLesson(
            'k8s-unit-1-2',
            '1.2 Kubernetes Architecture',
            'Deep dive into Control Plane and Worker Node components.',
            '45 mins',
            'Reading',
            `## Kubernetes Architecture Deep Dive
A Kubernetes cluster consists of two main parts: the **Control Plane** (Master Node) and the **Worker Nodes**.

### Control Plane Components:
- **API Server (\`kube-apiserver\`)**: The entry gateway. All configuration queries and CLI requests go here.
- **etcd**: Consistent, highly available key-value store holding the cluster state database.
- **Scheduler (\`kube-scheduler\`)**: Decides which Worker Node will host newly created Pods based on resource needs.
- **Controller Manager (\`kube-controller-manager\`)**: Runs control loops that regulate cluster state (e.g. node, replica, endpoint controllers).`
          ),
          createLesson(
            'k8s-unit-1-3',
            '1.3 Kubernetes Cluster & Components',
            'Understand Kubelet, Kube-proxy, and Container Runtime.',
            '40 mins',
            'Reading',
            `## Worker Node Components
Worker Nodes host the application containers. Each node runs three essential services:

### Node Components:
1. **Kubelet**: An agent that runs on every node in the cluster. It ensures containers are running inside their respective Pods according to Spec configurations.
2. **Kube-proxy**: A network proxy running on each node, maintaining network rules to allow connection routing to Pods.
3. **Container Runtime**: Software that runs containers (e.g. Docker, \`containerd\`, \`CRI-O\`).`
          ),
          createLesson(
            'k8s-unit-1-4',
            '1.4 Kubernetes Objects & YAML',
            'Understand declarative configurations, metadata, specs, and status.',
            '40 mins',
            'Reading',
            `## Kubernetes Declarative Objects & YAML
Kubernetes uses a declarative approach where you describe your *Desired State* in a YAML manifest, and K8s matches the *Actual State* to it.

### Core YAML Struct:
- **apiVersion**: API schema version used (e.g. \`v1\`, \`apps/v1\`).
- **kind**: Object type (e.g. \`Pod\`, \`Deployment\`, \`Service\`).
- **metadata**: Identifier properties (e.g. \`name\`, \`labels\`, \`namespace\`).
- **spec**: Desired configuration settings.
- **status**: Current cluster telemetry populated by control controllers.`
          ),
          createLesson(
            'k8s-unit-1-5',
            '1.5 Installing Minikube & kubectl',
            'Setting up local single-node cluster environment.',
            '35 mins',
            'Reading',
            `## Installing Minikube & Kubectl
**Minikube** runs a local, single-node Kubernetes cluster inside a virtual machine or container runtime, ideal for development.

**Kubectl** is the command-line CLI interface tool used to query and control Kubernetes clusters.

### Installation Quick-start:
- On Linux/macOS: Install VirtualBox/Docker, download Minikube binary, and run:
\`\`\`bash
minikube start --driver=docker
\`\`\`
- Verify access:
\`\`\`bash
kubectl get nodes
\`\`\``
          ),
          createLesson(
            'k8s-unit-1-6',
            '1.6 Basic kubectl Commands',
            'Learn get, describe, create, apply, delete, and logs commands.',
            '45 mins',
            'Reading',
            `## Basic Kubectl CLI Commands
Interact with your cluster using these essential commands:

- **kubectl get**: List resources (e.g. \`kubectl get pods\`).
- **kubectl describe**: View detailed resource specifications and event timelines.
- **kubectl create / apply**: Instantiate manifests (create is imperative, apply is declarative).
- **kubectl delete**: Destroy resource objects.
- **kubectl logs**: Print console output stream logs from container stdout.`
          ),
          createLesson(
            'k8s-unit-1-7',
            '1.7 Practice: Create Your First Pod',
            '⚠️ Practice Only - Deploy a container pod using a YAML manifest.',
            '60 mins',
            'Assignment',
            `## ⚠️ Practice Only
**Important Notice**: The practice terminal provided below is a simulated environment for learning and experimentation only. No real hosting charges will apply.

### Lab Objectives:
1. Create a pod definition file named \`pod.yaml\`.
2. Apply the manifest and verify that it is running successfully.
3. Fetch the logs of the pod and delete the container.

### Step-by-Step Instructions:
1. Write the YAML representation in the virtual workspace:
\`\`\`yaml
apiVersion: v1
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
    - containerPort: 80
\`\`\`
2. Deploy the pod: \`kubectl apply -f pod.yaml\`
3. Verify status: \`kubectl get pods\`
4. View container logs: \`kubectl logs nginx-pod\`
5. Destroy: \`kubectl delete pod nginx-pod\``,
            [
              { command: 'kubectl apply -f pod.yaml', description: 'Deploy the pod configuration manifest' },
              { command: 'kubectl get pods', description: 'Check the status of running Pods' },
              { command: 'kubectl logs nginx-pod', description: 'View logs generated by nginx container' },
              { command: 'kubectl delete pod nginx-pod', description: 'Clean up resource by deleting the pod' }
            ]
          )
        ]
      }
    ]
  },
  {
    id: 'k8s-mod-2',
    title: 'Module 2 — Pods & Deployments',
    description: 'Master pod life cycles, labels/selectors, deployments, scaling, rolling updates, cron jobs, and health check probes.',
    duration: '6 Hours',
    topics: [
      {
        id: 'k8s-topic-2',
        title: 'Workloads & Replica Scheduling',
        description: 'Deployments, replica controllers, and container lifecycle health checks.',
        estimatedDuration: '360 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-2-1',
            '2.1 Pods & Pod Lifecycle',
            'Explore the pod lifecycle states, containers networking sharing, and multi-container Pod layouts.',
            '45 mins',
            'Reading',
            `## Pod Lifecycle & States
A Pod is a collection of one or more co-located containers sharing storage and network IP spaces.

### Pod Lifecycle States:
- **Pending**: Scheduler is assigning nodes, or downloading images.
- **Running**: Pod is bound to a node; at least one container is running or starting.
- **Succeeded**: All containers completed successfully (terminated with 0 status code).
- **Failed**: All containers terminated, and at least one container failed.
- **Unknown**: Master cannot check node status.`
          ),
          createLesson(
            'k8s-unit-2-2',
            '2.2 Labels, Selectors & Namespaces',
            'Organize cluster components with labels and group them using logical namespaces.',
            '45 mins',
            'Reading',
            `## Labels, Selectors & Namespaces
- **Labels**: Key-value metadata attached to K8s objects (e.g. \`environment: production\`, \`tier: backend\`).
- **Selectors**: Queries used to filter resources based on labels. Used by Services and Deployments to find their targets.
- **Namespaces**: Virtual partitions inside a cluster to isolate team projects (e.g. \`kube-system\`, \`development\`, \`production\`).`
          ),
          createLesson(
            'k8s-unit-2-3',
            '2.3 ReplicaSets & Deployments',
            'Learn to manage replicas and declarative container deployments.',
            '45 mins',
            'Reading',
            `## Deployments & ReplicaSets
- **ReplicaSet**: Ensures a specified number of Pod replicas are running at any given time.
- **Deployment**: Higher-level controller that manages ReplicaSets, enabling declarative rollouts, updates, and rollbacks.

### Deployment Manifest Example:
\`\`\`yaml
apiVersion: apps/v1
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
        image: nginx:1.21
\`\`\``
          ),
          createLesson(
            'k8s-unit-2-4',
            '2.4 Scaling Applications',
            'Scale deployments manually or automatically using replicas.',
            '40 mins',
            'Reading',
            `## Scaling Kubernetes Workloads
Kubernetes makes scaling workloads extremely easy. You can update replication counts in two ways:

### 1. Imperative Scaling
Scale instantly using the command-line interface:
\`\`\`bash
kubectl scale deployment nginx-deployment --replicas=5
\`\`\`

### 2. Declarative Scaling
Update the \`replicas\` field in your YAML file and run:
\`\`\`bash
kubectl apply -f deployment.yaml
\`\`\``
          ),
          createLesson(
            'k8s-unit-2-5',
            '2.5 Rolling Updates & Rollbacks',
            'Perform zero-downtime updates and roll back failing releases.',
            '50 mins',
            'Reading',
            `## Rolling Updates & Rollbacks
Deployments enable zero-downtime updates by replacing old Pods with new ones sequentially.

### Rollout Command Sequence:
- Check current rollout history:
\`\`\`bash
kubectl rollout history deployment/nginx-deployment
\`\`\`
- Apply code update (updates container image):
\`\`\`bash
kubectl set image deployment/nginx-deployment nginx=nginx:1.25.3
\`\`\`
- Check rollout status:
\`\`\`bash
kubectl rollout status deployment/nginx-deployment
\`\`\`
- Undo/Rollback deployment:
\`\`\`bash
kubectl rollout undo deployment/nginx-deployment
\`\`\``
          ),
          createLesson(
            'k8s-unit-2-6',
            '2.6 Jobs & CronJobs',
            'Run batch jobs and scheduled tasks in your cluster.',
            '40 mins',
            'Reading',
            `## Jobs & CronJobs
For ephemeral, finite tasks rather than long-running daemons, Kubernetes provides:

- **Jobs**: Creates one or more Pods and ensures they successfully terminate (e.g. running data migration scripts).
- **CronJobs**: Runs jobs periodically according to a cron-format scheduling schedule (e.g. \`*/5 * * * *\` for backups).`
          ),
          createLesson(
            'k8s-unit-2-7',
            '2.7 Health Checks & Probes',
            'Configure liveness, readiness, and startup probes.',
            '45 mins',
            'Reading',
            `## Kubernetes Probes
Probes are health checks run periodically by Kubelet to verify container status.

### Three Probe Types:
1. **Liveness Probe**: Determines if container needs to be restarted (self-healing).
2. **Readiness Probe**: Determines if container is ready to receive network traffic.
3. **Startup Probe**: Disables other probes during initial container startup routines.`
          ),
          createLesson(
            'k8s-unit-2-8',
            '2.8 Practice: Deploy an Application',
            '⚠️ Practice Only - Deploy, scale, update, and roll back an application.',
            '50 mins',
            'Assignment',
            `## ⚠️ Practice Only
**Important Notice**: The practice terminal provided below is a simulated environment for learning and experimentation only. No real hosting charges will apply.

### Lab Objectives:
1. Create a deployment manifest.
2. Deploy the workload to the cluster.
3. Scale the deployment, update the image, and revert it using rollbacks.

### Step-by-Step Instructions:
1. Apply the deployment manifest: \`kubectl apply -f deployment.yaml\`
2. Scale the replicas to 5 instances: \`kubectl scale deployment nginx-deployment --replicas=5\`
3. Check the progress: \`kubectl rollout status deployment nginx-deployment\`
4. Roll back to the previous deployment revision: \`kubectl rollout undo deployment nginx-deployment\``,
            [
              { command: 'kubectl apply -f deployment.yaml', description: 'Deploy the application deployment manifest' },
              { command: 'kubectl scale deployment nginx-deployment --replicas=5', description: 'Scale deployment replicas to 5' },
              { command: 'kubectl rollout status deployment nginx-deployment', description: 'Monitor the update rollout status' },
              { command: 'kubectl rollout undo deployment nginx-deployment', description: 'Roll back to the previous deployment state' }
            ]
          )
        ]
      }
    ]
  },
  {
    id: 'k8s-mod-3',
    title: 'Module 3 — Networking & Services',
    description: 'Learn pod-to-pod networking, service abstractions (ClusterIP, NodePort, LoadBalancer), DNS routing, Ingress config, and Network Policies.',
    duration: '5 Hours',
    topics: [
      {
        id: 'k8s-topic-3',
        title: 'Cluster Networking & Ingress Rules',
        description: 'Internal DNS resolution, service abstraction scopes, and Ingress routing controllers.',
        estimatedDuration: '300 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-3-1',
            '3.1 Kubernetes Networking Basics',
            'Understand how Pods communicate with each other inside the cluster.',
            '40 mins',
            'Reading',
            `## Kubernetes Networking Model
Kubernetes enforces a "IP-per-Pod" networking architecture.

### Crucial Networking Principles:
1. **Pod-to-Pod**: Every Pod gets a unique cluster-wide IP. They can communicate directly with other Pods on any node without NAT.
2. **Container-to-Container**: Containers in the same Pod share the network IP/port space (accessed via \`localhost\`).
3. **Internal Subnet**: Orchestrated using Container Network Interfaces (CNI) like Flannel, Calico, or Cilium.`
          ),
          createLesson(
            'k8s-unit-3-2',
            '3.2 Services Overview',
            'Why Services are required and how selector matching enables discovery.',
            '40 mins',
            'Reading',
            `## Introduction to Services
Pods are dynamic and ephemeral; they get replaced and their IPs change constantly. A **Service** is a stable endpoint abstraction.

### Features:
- Provides a stable cluster-internal IP and port.
- Automatically load-balances traffic across matching Pods.
- Discovers target Pods dynamically using label selectors.`
          ),
          createLesson(
            'k8s-unit-3-3',
            '3.3 ClusterIP, NodePort & LoadBalancer',
            'Compare the three main service scopes and when to use each.',
            '45 mins',
            'Reading',
            `## Kubernetes Service Types
Services are exposed using different visibility scopes:

- **ClusterIP (Default)**: Exposes the Service on a cluster-internal IP. Accessible only within the cluster.
- **NodePort**: Exposes the Service on each Node's IP at a static port (in the range 30000-32767).
- **LoadBalancer**: Exposes the Service externally using a cloud provider's external load balancer, automatically routing to NodePorts.`
          ),
          createLesson(
            'k8s-unit-3-4',
            '3.4 Service Discovery & DNS',
            'Learn how internal cluster DNS maps names to Service IPs.',
            '40 mins',
            'Reading',
            `## Service Discovery & DNS Routing
Kubernetes runs a CoreDNS service in the cluster to map Service names to cluster IPs.

### DNS Naming Convention:
Any Service in a namespace gets a host naming record:
\`\`\`text
<service-name>.<namespace>.svc.cluster.local
\`\`\`
For instance, a frontend Pod can access a backend database Service by calling the host \`db-service\` (if in the same namespace) or \`db-service.database.svc.cluster.local\` (if in a namespace named \`database\`).`
          ),
          createLesson(
            'k8s-unit-3-5',
            '3.5 Ingress & Ingress Controller',
            'Expose multiple HTTP/HTTPS routes using a single Ingress gateway.',
            '50 mins',
            'Reading',
            `## Ingress & Ingress Controllers
While a LoadBalancer creates an external IP per Service (costly), an **Ingress** acts as a single gateway/reverse proxy.

### Features:
- Evaluates routing rules to forward traffic based on Host headers or HTTP paths (e.g. \`example.com/api\` -> \`api-svc\`).
- Manages SSL/TLS decryption certificates.
- Powered by an **Ingress Controller** (usually Nginx, Traefik, or HAProxy).`
          ),
          createLesson(
            'k8s-unit-3-6',
            '3.6 Network Policies',
            'Control traffic flow between Pods using declarative rules.',
            '45 mins',
            'Reading',
            `## Network Policies (Security)
By default, all network traffic is allowed between all Pods in a cluster. **NetworkPolicies** behave like host firewalls for Pods.

### Rules:
- Specify **Ingress** (incoming traffic) and **Egress** (outgoing traffic) permissions.
- Filter traffic sources using podSelectors, namespaceSelectors, or IP blocks.
- Require support from your CNI provider (e.g. Calico, Cilium).`
          ),
          createLesson(
            'k8s-unit-3-7',
            '3.7 Practice: Expose an Application',
            '⚠️ Practice Only - Expose an application using a Service and Ingress.',
            '40 mins',
            'Assignment',
            `## ⚠️ Practice Only
**Important Notice**: The practice terminal provided below is a simulated environment for learning and experimentation only. No real hosting charges will apply.

### Lab Objectives:
1. Create a service to expose an application internally.
2. Apply the service definition and verify DNS accessibility.
3. Configure a simple path-based Ingress rule.

### Step-by-Step Instructions:
1. Apply the service manifest: \`kubectl apply -f service.yaml\`
2. Check the services registry list: \`kubectl get services\`
3. Apply the ingress routing rules manifest: \`kubectl apply -f ingress.yaml\``,
            [
              { command: 'kubectl apply -f service.yaml', description: 'Expose the deployment via a Service endpoint' },
              { command: 'kubectl get services', description: 'List services to verify internal IPs and ports' },
              { command: 'kubectl apply -f ingress.yaml', description: 'Apply Ingress routing rule configurations' }
            ]
          )
        ]
      }
    ]
  },
  {
    id: 'k8s-mod-4',
    title: 'Module 4 — Configuration & Storage',
    description: 'Learn ConfigMaps, Secrets, persistent volumes (PV, PVC), storage classes, dynamic provisioning, and resource requests/limits.',
    duration: '6 Hours',
    topics: [
      {
        id: 'k8s-topic-4',
        title: 'Cluster Storage & Environment Configs',
        description: 'Persistent volumes, Dynamic provisioning storage classes, and container resource limits.',
        estimatedDuration: '360 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-4-1',
            '4.1 ConfigMaps',
            'Store non-sensitive configuration data in key-value format.',
            '45 mins',
            'Reading',
            `## ConfigMaps
**ConfigMaps** allow you to separate environment configuration files/properties from container images.

### Mounting ConfigMaps:
- As environment variables in container specifications.
- As files mounted on folders inside the container using volumes.`
          ),
          createLesson(
            'k8s-unit-4-2',
            '4.2 Secrets',
            'Manage sensitive credentials (API keys, certificates, password strings).',
            '45 mins',
            'Reading',
            `## Kubernetes Secrets
**Secrets** store sensitive variables (like db passwords, token hashes). They are base64-encoded and mounted securely (usually in memory memory storage \`tmpfs\`).

> ⚠️ **Warning**: Base64 encoding is *not* encryption. Always secure etcd at rest and restrict access via RBAC permissions.`
          ),
          createLesson(
            'k8s-unit-4-3',
            '4.3 Environment Variables',
            'Inject ConfigMaps and Secrets into container variables.',
            '40 mins',
            'Reading',
            `## Environment Variables Injection
Inject configurations into containers using the \`valueFrom\` spec parameter:

\`\`\`yaml
env:
  - name: DB_HOST
    valueFrom:
      configMapKeyRef:
        name: db-config
        key: host
  - name: DB_PASS
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: password
\`\`\``
          ),
          createLesson(
            'k8s-unit-4-4',
            '4.4 Kubernetes Volumes',
            'Attach ephemeral storage or host folders directly to containers.',
            '40 mins',
            'Reading',
            `## Kubernetes Ephemeral Volumes
By default, container filesystems are ephemeral. If a container crashes, changes are lost.

### Basic Volume Mounts:
- **emptyDir**: Ephemeral directory created on pod startup, deleted on pod removal.
- **hostPath**: Mounts a directory from the Worker Node's local disk (used for host logging daemons).`
          ),
          createLesson(
            'k8s-unit-4-5',
            '4.5 PersistentVolumes & PVC',
            'Provision network storage volumes and mount them using claims.',
            '50 mins',
            'Reading',
            `## Persistent Volumes & Claims
To preserve database records, Kubernetes splits storage management into:

- **PersistentVolume (PV)**: The physical network storage disk allocated by an administrator.
- **PersistentVolumeClaim (PVC)**: A request for storage by a user, which binds to a matching PV.`
          ),
          createLesson(
            'k8s-unit-4-6',
            '4.6 StorageClasses',
            'Dynamically provision volumes on cloud networks.',
            '45 mins',
            'Reading',
            `## StorageClasses & Dynamic Provisioning
Rather than manually creating PVs, you can use a **StorageClass** to dynamically provision storage disks (AWS EBS, GCP PD) on-demand when a PVC is applied.`
          ),
          createLesson(
            'k8s-unit-4-7',
            '4.7 Resource Requests & Limits',
            'Configure CPU and Memory limits to protect nodes.',
            '45 mins',
            'Reading',
            `## Resource Requests & Limits
Prevent container resource exhaustion (Noisy Neighbor issue) by declaring resource bounds:

- **Requests**: Minimum CPU/Memory reserved on a node to schedule the Pod.
- **Limits**: Maximum CPU/Memory the container is allowed to consume. Exceeding memory limits leads to Out Of Memory (OOM) eviction.`
          ),
          createLesson(
            'k8s-unit-4-8',
            '4.8 Practice: Deploy App with Storage',
            '⚠️ Practice Only - Deploy a stateful application with a persistent volume claim.',
            '50 mins',
            'Assignment',
            `## ⚠️ Practice Only
**Important Notice**: The practice terminal provided below is a simulated environment for learning and experimentation only. No real hosting charges will apply.

### Lab Objectives:
1. Apply a PVC configuration.
2. Mount the volume on a web server pod.
3. Verify directory persistence.

### Step-by-Step Instructions:
1. Deploy the PVC manifest: \`kubectl apply -f pvc.yaml\`
2. Check storage status: \`kubectl get pvc\`
3. Deploy the application: \`kubectl apply -f deployment-storage.yaml\``,
            [
              { command: 'kubectl apply -f pvc.yaml', description: 'Create a PersistentVolumeClaim request' },
              { command: 'kubectl get pvc', description: 'Verify state of storage claims' },
              { command: 'kubectl apply -f deployment-storage.yaml', description: 'Deploy application with PVC volume mount' }
            ]
          )
        ]
      }
    ]
  },
  {
    id: 'k8s-mod-5',
    title: 'Module 5 — Security & Administration',
    description: 'Master ServiceAccounts, Role-Based Access Control (RBAC), security contexts, scheduling nodes (Selector, Taints, Tolerations, Affinity), and troubleshooting failed deployments.',
    duration: '6 Hours',
    topics: [
      {
        id: 'k8s-topic-5',
        title: 'Cluster RBAC & Scheduling Control',
        description: 'Privilege roles, pod security contexts, and node selector scheduling parameters.',
        estimatedDuration: '360 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-5-1',
            '5.1 Kubernetes Security Basics',
            'Core security guidelines: securing etcd, API endpoints, and network traffic.',
            '40 mins',
            'Reading',
            `## Kubernetes Security Basics
Secure your cluster using the **4C's of Cloud Native Security**:
1. **Cloud**: Infrastructure security provider parameters.
2. **Cluster**: Restricting access to API servers.
3. **Container**: Isolating process user scopes.
4. **Code**: Scanning image repositories for vulnerabilities.`
          ),
          createLesson(
            'k8s-unit-5-2',
            '5.2 Users, ServiceAccounts & RBAC',
            'Enable API authorization scopes for users and container workloads.',
            '45 mins',
            'Reading',
            `## Identities & Authorization
- **Users**: Humans executing kubectl operations (authenticated externally).
- **ServiceAccounts**: Identities assigned to Pods to communicate with the internal API Server.
- **RBAC (Role-Based Access Control)**: Enforces permissions based on user role assignments.`
          ),
          createLesson(
            'k8s-unit-5-3',
            '5.3 Roles & RoleBindings',
            'Configure Roles, ClusterRoles, and associate them using Bindings.',
            '45 mins',
            'Reading',
            `## Roles, ClusterRoles, & Bindings
Kubernetes defines permissions in RBAC manifests:

- **Role**: Defines namespaced apiGroup verb actions (e.g. read pods in \`default\`).
- **ClusterRole**: Defines cluster-wide permissions (e.g. view nodes across namespaces).
- **RoleBinding**: Grants Role permissions to a user/ServiceAccount.
- **ClusterRoleBinding**: Grants ClusterRole permissions cluster-wide.`
          ),
          createLesson(
            'k8s-unit-5-4',
            '5.4 Security Context & Pod Security',
            'Limit container permissions and run containers securely.',
            '45 mins',
            'Reading',
            `## Container Security Contexts
Protect host operating systems by configuring container privileges in YAML:

\`\`\`yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
\`\`\`
This prevents containers from escalating to host root execution rights.`
          ),
          createLesson(
            'k8s-unit-5-5',
            '5.5 Node Scheduling',
            'Control scheduler placement decisions using simple node selectors.',
            '40 mins',
            'Reading',
            `## Node Scheduling
By default, the Scheduler assigns Pods to nodes arbitrarily. You can force placement using:

- **nodeSelector**: Simple key-value selector matching labels assigned to Nodes (e.g. \`disktype: ssd\`).`
          ),
          createLesson(
            'k8s-unit-5-6',
            '5.6 Taints, Tolerations & Affinity',
            'Configure taints, tolerations, node affinity, and pod affinity.',
            '50 mins',
            'Reading',
            `## Advanced Scheduling Features
For complex scheduling demands:

- **Taints**: Restrict nodes from hosting Pods unless the Pod has matching **Tolerations** (used to reserve nodes for GPU workloads).
- **Node Affinity**: Rules specifying soft or hard label constraints (mandatory vs optional).`
          ),
          createLesson(
            'k8s-unit-5-7',
            '5.7 Troubleshooting Kubernetes',
            'Learn to debug crash loops, failed schedules, and broken services.',
            '45 mins',
            'Reading',
            `## Troubleshooting Failures
Use these standard commands to debug broken cluster states:

1. **CrashLoopBackOff**: Run \`kubectl logs <pod>\` and \`kubectl describe pod <pod>\` to check application errors.
2. **ImagePullBackOff**: Verify image tags and credentials registry paths.
3. **Pending**: Check resources quota restrictions via scheduler logs.`
          ),
          createLesson(
            'k8s-unit-5-8',
            '5.8 Practice: Secure & Troubleshoot a Cluster',
            '⚠️ Practice Only - Configure RBAC roles and debug cluster logs.',
            '50 mins',
            'Assignment',
            `## ⚠️ Practice Only
**Important Notice**: The practice terminal provided below is a simulated environment for learning and experimentation only. No real hosting charges will apply.

### Lab Objectives:
1. Create a ServiceAccount and map an RBAC Role to it.
2. Diagnose a failed Pod configuration using logs and description files.

### Step-by-Step Instructions:
1. Deploy the ServiceAccount manifest: \`kubectl apply -f serviceaccount.yaml\`
2. Apply the RBAC Role specifications: \`kubectl apply -f rbac.yaml\`
3. Inspect a failed pod: \`kubectl describe pod failed-pod\``,
            [
              { command: 'kubectl apply -f serviceaccount.yaml', description: 'Create a cluster ServiceAccount identity' },
              { command: 'kubectl apply -f rbac.yaml', description: 'Apply Role and Binding RBAC configurations' },
              { command: 'kubectl describe pod failed-pod', description: 'Inspect failed Pod events to diagnose errors' }
            ]
          )
        ]
      }
    ]
  },
  {
    id: 'k8s-mod-6',
    title: 'Module 6 — Production & DevOps',
    description: 'Learn production guidelines, Horizontal Pod Autoscaler (HPA), Helm package management, CI/CD pipelines, managed cloud engines, and deploy a full-stack project.',
    duration: '6 Hours',
    topics: [
      {
        id: 'k8s-topic-6',
        title: 'Production CI/CD Pipelines & Helm Packages',
        description: 'Autoscalers, Helm packages, container builds, and deployment capstone projects.',
        estimatedDuration: '360 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-6-1',
            '6.1 Kubernetes Production Basics',
            'Production architecture, high availability control loops, and security guidelines.',
            '45 mins',
            'Reading',
            `## Production Kubernetes Best Practices
Transitioning cluster deployments from development sandbox configs to high-availability environments requires:

- **Control Plane Redundancy**: Multi-master Control Plane configs across multiple zones.
- **Resource Constraints**: Define requests and limits on all containers.
- **Pod Anti-Affinity**: Distribute replica Pods across distinct nodes to prevent hardware failures from creating outages.`
          ),
          createLesson(
            'k8s-unit-6-2',
            '6.2 Autoscaling',
            'Configure Horizontal Pod Autoscalers (HPA) to scale replicas on-demand.',
            '45 mins',
            'Reading',
            `## Horizontal Pod Autoscaler (HPA)
The **HPA** monitors container metrics (CPU utilization, custom API rates) and automatically scales replicas between min and max parameters.`
          ),
          createLesson(
            'k8s-unit-6-3',
            '6.3 Monitoring & Logging',
            'Integrate metrics collectors and log aggregation systems.',
            '40 mins',
            'Reading',
            `## Cluster Observability
Monitoring cluster states requires:

- **Metrics Collection**: Using **Prometheus** to scrap node/pod performance metrics, and **Grafana** for dashboard analytics.
- **Log Aggregation**: Collecting container stdout streams using agents (Fluentd, Promtail) sending data to centralized storage (ElasticSearch, Loki).`
          ),
          createLesson(
            'k8s-unit-6-4',
            '6.4 Helm & Helm Charts',
            'Learn Helm package managers and install charts.',
            '45 mins',
            'Reading',
            `## Kubernetes Package Management with Helm
**Helm** acts as a package manager for Kubernetes. Instead of applying raw manifests, Helm bundles configurations into reusable **Charts**.

### Key Commands:
- Add chart repository: \`helm repo add\`
- Search charts: \`helm search repo\`
- Install release: \`helm install my-release <chart-name>\`
- List active releases: \`helm list\``
          ),
          createLesson(
            'k8s-unit-6-5',
            '6.5 Kubernetes with Docker & Git',
            'Integrate version control, container images, and container registries.',
            '45 mins',
            'Reading',
            `## Container Registries & Git Workflows
Before deploying code to K8s:
1. Commit code to a Git repository.
2. Run a build pipeline to build the container image: \`docker build -t app:latest .\`
3. Push image tags to a Registry (Docker Hub, AWS ECR, Github Registry).
4. Reference the secure image registry URI inside your K8s Deployment manifests.`
          ),
          createLesson(
            'k8s-unit-6-6',
            '6.6 CI/CD with Kubernetes',
            'Automate builds and deployments using pipeline orchestrators.',
            '40 mins',
            'Reading',
            `## CI/CD Deployment Pipelines
Automate your DevOps cycle with tools like Jenkins, GitHub Actions, or GitLab CI:

- **CI**: Build Docker containers, validate YAML files, and test codebase dependencies.
- **CD**: Deploy changes declaratively. Modern GitOps workflows use **ArgoCD** or **Flux** to watch Git commits and sync changes to K8s automatically.`
          ),
          createLesson(
            'k8s-unit-6-7',
            '6.7 Cloud Kubernetes — EKS, AKS & GKE',
            'Deploy to cloud-managed engines (Amazon EKS, Azure AKS, Google GKE).',
            '40 mins',
            'Reading',
            `## Managed Cloud Kubernetes Services
Most enterprises use cloud provider engines that manage Control Plane nodes, backups, and security patches for you:

- **Amazon EKS** (Elastic Kubernetes Service)
- **Azure AKS** (Azure Kubernetes Service)
- **Google GKE** (Google Kubernetes Engine - the most mature and integrated engine)`
          ),
          createLesson(
            'k8s-unit-6-8',
            '6.8 Final Project: Deploy Full-Stack Application',
            '⚠️ Practice Only - Dockerize and deploy a complete full-stack web application.',
            '60 mins',
            'Assignment',
            `## ⚠️ Practice Only
**Important Notice**: The practice terminal provided below is a simulated environment for learning and experimentation only. No real hosting charges will apply.

### Final Capstone Goals:
1. Build container images for a web backend.
2. Define ConfigMaps and Secrets.
3. Configure persistent storage mounts and ingress routing.
4. Deploy the entire stack and verify execution.

### Step-by-Step Instructions:
1. Dockerize the project: \`docker build -t frontend:latest ./frontend\`
2. Deploy Secrets credentials: \`kubectl apply -f secret.yaml\`
3. Deploy the full-stack architecture: \`kubectl apply -f fullstack-app.yaml\`
4. Verify all components are online: \`kubectl get all\``,
            [
              { command: 'docker build -t frontend:latest ./frontend', description: 'Dockerize frontend web service files' },
              { command: 'kubectl apply -f secret.yaml', description: 'Deploy credentials configurations securely' },
              { command: 'kubectl apply -f fullstack-app.yaml', description: 'Apply the complete microservices deployment stack' },
              { command: 'kubectl get all', description: 'Verify that all Pods, Services, and Deployments are online' }
            ]
          )
        ]
      }
    ]
  }
];
