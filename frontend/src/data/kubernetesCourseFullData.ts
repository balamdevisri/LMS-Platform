import type { ModuleItem, LearningUnitItem } from '../contexts/CourseContext';

// Helper to create a standard lesson unit
const createLesson = (
  id: string,
  title: string,
  desc: string,
  duration: string,
  type: 'Video' | 'Reading' | 'Assignment' | 'Quiz',
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
  /* ==========================================================================
     MODULE 1: INTRODUCTION TO KUBERNETES
     ========================================================================== */
  {
    id: 'k8s-mod-1',
    title: 'Module 1: Introduction to Kubernetes',
    description: 'Learn container orchestration fundamentals, why Kubernetes is used, Docker vs Kubernetes comparisons, and real-life scenarios.',
    duration: '2.5 Hours',
    topics: [
      {
        id: 'k8s-topic-1',
        title: 'Kubernetes Core Concepts & History',
        description: 'Understand container orchestration, K8s origin, advantages, and real-world use cases.',
        estimatedDuration: '150 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-1-1',
            '1.1 What is Kubernetes?',
            'Learn the definition of Kubernetes (K8s) and container orchestration.',
            '20 mins',
            'Reading',
            `# 1.1 What is Kubernetes?

### Definition
**Kubernetes (K8s)** is an open-source container orchestration platform used to deploy, manage, scale, and monitor containerized applications automatically.

> **Simple ga cheppali ante:**
> Kubernetes is a tool that manages Docker containers automatically.

---

### Easy Explanation
Imagine a company running 100 Docker containers simultaneously.

**Common Problems without Orchestration:**
- A container crashes unexpectedly.
- User traffic spikes suddenly.
- Some containers stop unexpectedly.
- Deploying a new application version requires manual updates across every server.

*Ivanni manually manage cheyyadam chala kashtam.* **Kubernetes ee panulanni automatic ga chestundi.**

---

### Real-Life Example 🏨
Think about a manager in a hotel.

**Hotel Staff:**
- Chef
- Waiter
- Cleaner
- Cashier

**Manager Responsibilities:**
- Assigns work to staff members.
- Arranges immediate replacements if staff is absent.
- Hires extra staff when customer count increases.

*Alage Kubernetes kuda containers ni manage chestundi.*

---

### Why is Kubernetes Called K8s?
In the word **"Kubernetes"**:
- Starts with **K**
- Followed by **8 letters** ("ubernete")
- Ends with **s**

Hence, the short form is **K8s**.`
          ),
          createLesson(
            'k8s-unit-1-2',
            '1.2 Why Kubernetes & Main Responsibilities',
            'Understand the core responsibilities and advantages of K8s in production.',
            '25 mins',
            'Reading',
            `# 1.2 Why Kubernetes & Main Responsibilities

### Main Responsibilities of Kubernetes
1. **Deploy Applications**: Automated deployment across cluster nodes.
2. **Manage Containers**: Ensures specified container count is running.
3. **Restart Failed Containers**: Automatically self-heals crashed instances.
4. **Scale Applications**: Dynamically scales up or down based on CPU/Memory load.
5. **Load Balancing**: Distributes incoming network traffic evenly.
6. **Automatic Updates**: Zero-downtime rolling updates.
7. **Monitor Application Health**: Continuous health check probes.

---

### Real-World Example Scenario 🛒
Suppose an Online Shopping Website is hosting a major festival sale.

**Suddenly:** 10,000 users open the website at once.

- **Without Kubernetes:** Website becomes slow, server crashes, orders fail.
- **With Kubernetes:**
  - Automatically creates extra containers.
  - Divides user load across containers.
  - Website runs smoothly without downtime!

---

### Key Advantages & Disadvantages

**Advantages:**
- Open Source & Free to use.
- Automatic Scaling & Self-Healing.
- High Availability & Easy Cloud Support (AWS EKS, GCP GKE, Azure AKS).

**Disadvantages:**
- Beginners ki konchem difficult.
- Setup and initial configuration require learning curve.
- Overkill for simple single-container websites.`
          ),
          createLesson(
            'k8s-unit-1-3',
            '1.3 Key Terminology & Interview Q&A',
            'Master foundational K8s vocabulary and interview preparation.',
            '30 mins',
            'Reading',
            `# 1.3 Key Terminology & Interview Q&A

### Important Keywords Table
| Term | Meaning |
| :--- | :--- |
| **Container** | Application package (e.g. Docker container) |
| **Cluster** | Group of physical or virtual machines working together |
| **Pod** | Smallest deployable unit in Kubernetes |
| **Node** | A single machine (Worker or Master) inside the cluster |
| **Deployment** | Manages Pod creation, scaling, and updates |

---

### Interview Questions & Answers

**Q1: What is Kubernetes?**
*Answer:* Kubernetes is an open-source container orchestration platform used to deploy, manage, scale, and monitor containerized applications automatically.

**Q2: Why is Kubernetes called K8s?**
*Answer:* Because there are 8 letters between 'K' and 's' in the word "Kubernetes".`
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 2: KUBERNETES ARCHITECTURE
     ========================================================================== */
  {
    id: 'k8s-mod-2',
    title: 'Module 2: Kubernetes Architecture',
    description: 'Deep dive into Master Node (Control Plane) components, Worker Node components, and request workflow.',
    duration: '3 Hours',
    topics: [
      {
        id: 'k8s-topic-2',
        title: 'Cluster Components & Architecture Workflow',
        description: 'Control plane breakdown: API Server, etcd, Scheduler, Controller Manager, Kubelet, and Kube-Proxy.',
        estimatedDuration: '180 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-2-1',
            '2.1 Control Plane (Master Node) Components',
            'Learn about the brain of Kubernetes: API Server, etcd, Scheduler, and Controller Manager.',
            '35 mins',
            'Reading',
            `# 2.1 Control Plane (Master Node) Components

The **Control Plane** acts as the brain of the Kubernetes cluster. It manages cluster state and receives all user requests.

---

### 1. API Server (kube-apiserver)
- **Role**: The entry point of Kubernetes.
- All requests (via \`kubectl\` or REST APIs) go directly to the API Server.
- Validates requests, authenticates users, and updates cluster state.

### 2. etcd Database
- **Role**: Highly available distributed key-value database.
- Stores complete state and configuration details of the cluster.
- *Without etcd, Kubernetes cannot remember cluster state.*

### 3. Scheduler (kube-scheduler)
- **Role**: Decides which Worker Node should execute newly created Pods.
- Evaluates CPU/RAM requirements, node capacity, and affinity rules.

### 4. Controller Manager (kube-controller-manager)
- **Role**: Maintains desired cluster state.
- Monitors node health, restarts failed Pods, and executes self-healing.`
          ),
          createLesson(
            'k8s-unit-2-2',
            '2.2 Worker Node Components & Workflow',
            'Explore Kubelet, Kube-Proxy, Container Runtime, and request workflow step-by-step.',
            '35 mins',
            'Reading',
            `# 2.2 Worker Node Components & Workflow

**Worker Nodes** are machines where application containers actually run.

---

### Worker Node Components

1. **Kubelet**:
   - Agent running on every Worker Node.
   - Communicates with the API Server and ensures containers inside Pods are running healthy.
2. **Kube-Proxy**:
   - Network proxy that manages IP routing and load balances traffic across Pods.
3. **Container Runtime**:
   - Software responsible for running containers (e.g. \`containerd\`, \`CRI-O\`).

---

### Complete Request Workflow
1. Developer executes \`kubectl apply -f deployment.yaml\`.
2. **API Server** receives and authenticates the request.
3. **etcd** saves the new deployment specification.
4. **Scheduler** selects the best available Worker Node.
5. **Kubelet** on that Worker Node receives instructions and triggers **Container Runtime** to pull the image and launch Pods.
6. **Kube-Proxy** configures networking rules for external traffic.`
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 3: INSTALLING KUBERNETES
     ========================================================================== */
  {
    id: 'k8s-mod-3',
    title: 'Module 3: Installing Kubernetes',
    description: 'Set up your local development environment using Docker, kubectl, Minikube, and Kubernetes Dashboard.',
    duration: '2 Hours',
    topics: [
      {
        id: 'k8s-topic-3',
        title: 'Local Environment Setup & Minikube',
        description: 'Prerequisites, Docker Desktop installation, kubectl CLI, and starting Minikube clusters.',
        estimatedDuration: '120 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-3-1',
            '3.1 Prerequisites & Minikube Installation',
            'Install Docker, kubectl, and launch a local single-node Minikube cluster.',
            '30 mins',
            'Reading',
            `# 3.1 Prerequisites & Minikube Installation

To practice Kubernetes locally, we use **Minikube** — a lightweight single-node Kubernetes distribution.

---

### Software Tools Required
1. **Docker**: Container runtime to run containers.
2. **kubectl**: Command-line interface to interact with Kubernetes.
3. **Minikube**: Creates a single-node cluster on your local machine.

---

### Verification Commands
\`\`\`bash
# Check Docker version
docker --version

# Check kubectl version
kubectl version --client

# Start Minikube cluster
minikube start

# Check cluster status
minikube status
\`\`\``,
            [
              { command: 'docker --version', description: 'Verify Docker installation' },
              { command: 'kubectl version --client', description: 'Check kubectl client version' },
              { command: 'minikube start', description: 'Launch local Minikube Kubernetes cluster' },
              { command: 'minikube status', description: 'Check status of Control Plane and Kubelet' }
            ]
          ),
          createLesson(
            'k8s-unit-3-2',
            '3.2 Verifying Installation & Useful Commands',
            'Test your cluster using kubectl cluster-info, get nodes, and deploy your first Nginx application.',
            '30 mins',
            'Reading',
            `# 3.2 Verifying Installation & Useful Commands

Once Minikube is started, verify that the cluster is operational.

\`\`\`bash
# View cluster info
kubectl cluster-info

# View nodes in cluster
kubectl get nodes

# Launch first Nginx deployment
kubectl create deployment nginx-demo --image=nginx

# Inspect running pods
kubectl get pods

# Expose Nginx deployment
kubectl expose deployment nginx-demo --type=NodePort --port=80
\`\`\``,
            [
              { command: 'kubectl cluster-info', description: 'Display Control Plane master endpoints' },
              { command: 'kubectl get nodes', description: 'List all nodes in cluster' },
              { command: 'kubectl create deployment nginx-demo --image=nginx', description: 'Deploy Nginx web server' },
              { command: 'kubectl get pods', description: 'List running Pods' }
            ]
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 4: BASIC KUBERNETES OBJECTS & PODS
     ========================================================================== */
  {
    id: 'k8s-mod-4',
    title: 'Module 4: Basic Kubernetes Objects & Pods',
    description: 'Learn about Pods (the smallest deployable unit), Deployments, ReplicaSets, Namespaces, Labels, Selectors, and Annotations.',
    duration: '3.5 Hours',
    topics: [
      {
        id: 'k8s-topic-4',
        title: 'Pods, ReplicaSets & Deployments',
        description: 'Understand Pod lifecycle, YAML manifests, multi-container sidecars, Labels, and Selectors.',
        estimatedDuration: '210 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-4-1',
            '4.1 Introduction to Pods',
            'Understand what a Pod is, why K8s uses Pods instead of bare containers, and single vs multi-container Pods.',
            '35 mins',
            'Reading',
            `# 4.1 Introduction to Pods

A **Pod** is the smallest deployable unit in Kubernetes.

> **In simple words:**
> A Pod is a wrapper that contains one or more containers.

---

### Real-Time Example 📦
Imagine ordering food online.
- The food is placed inside a **delivery box**.
- The delivery person carries the **box**, not raw food directly.

**Analogy:**
- Container = Food
- Pod = Delivery Box
- Kubernetes = Delivery Person

---

### Pod Components & Shared Resources
Containers inside the same Pod share:
- **Shared Network**: Same IP address and port space (communicate via \`localhost\`).
- **Shared Storage**: Mounted Volumes to exchange files.`
          ),
          createLesson(
            'k8s-unit-4-2',
            '4.2 Writing Pod & Deployment YAML Manifests',
            'Learn imperative commands vs declarative YAML manifests for Pods and Deployments.',
            '40 mins',
            'Reading',
            `# 4.2 Writing Pod & Deployment YAML Manifests

Kubernetes recommends defining objects declaratively using **YAML files**.

### Sample Pod YAML (\`pod.yaml\`)
\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: web
spec:
  containers:
  - name: nginx-container
    image: nginx:latest
    ports:
    - containerPort: 80
\`\`\`

---

### Applying & Managing YAML Files
\`\`\`bash
# Apply YAML configuration
kubectl apply -f pod.yaml

# View Pod details
kubectl describe pod nginx-pod

# View Pod logs
kubectl logs nginx-pod

# Delete Pod
kubectl delete -f pod.yaml
\`\`\``,
            [
              { command: 'kubectl apply -f pod.yaml', description: 'Create/update Pod from YAML file' },
              { command: 'kubectl describe pod nginx-pod', description: 'Inspect events and detailed state of Pod' },
              { command: 'kubectl logs nginx-pod', description: 'View stdout logs from Pod container' },
              { command: 'kubectl delete pod nginx-pod', description: 'Delete Pod instance' }
            ]
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 5: SERVICES & NETWORKING
     ========================================================================== */
  {
    id: 'k8s-mod-5',
    title: 'Module 5: Services & Networking',
    description: 'Expose Pods reliably using ClusterIP, NodePort, LoadBalancer, ExternalName, Ingress Controllers, and Network Policies.',
    duration: '3 Hours',
    topics: [
      {
        id: 'k8s-topic-5',
        title: 'Kubernetes Service Types & Networking',
        description: 'Understand ephemeral Pod IPs vs stable Service endpoints, ClusterIP, NodePort, and LoadBalancer.',
        estimatedDuration: '180 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-5-1',
            '5.1 What is a Kubernetes Service?',
            'Learn why Services are required, stable IP addresses, and ClusterIP default configuration.',
            '35 mins',
            'Reading',
            `# 5.1 What is a Kubernetes Service?

A **Service** is an abstraction object that defines a logical set of Pods and a policy by which to access them (stable IP address & DNS entry).

---

### Why Do We Need Services?
Pods are **ephemeral** (temporary). When a Pod crashes and restarts:
- A new Pod gets a **new IP address**.
- Without a Service, clients using the old IP address will fail!

A **Service** provides a permanent IP address and load balances traffic automatically across matching Pods.

---

### 4 Types of Kubernetes Services
1. **ClusterIP** *(Default)*: Accessible only inside the cluster (e.g. Backend microservices, databases).
2. **NodePort**: Exposes the service on each Node's IP at a static port (30000-32767).
3. **LoadBalancer**: Provisions an external Cloud Load Balancer (AWS ELB, GCP LB) with a public IP.
4. **ExternalName**: Maps service to an external DNS CNAME.`
          ),
          createLesson(
            'k8s-unit-5-2',
            '5.2 Service YAML & Useful Commands',
            'Create NodePort and ClusterIP services using YAML manifests.',
            '35 mins',
            'Reading',
            `# 5.2 Service YAML & Useful Commands

### Sample Service YAML (\`service.yaml\`)
\`\`\`yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30080
\`\`\`

---

### Service Commands
\`\`\`bash
# Create Service
kubectl apply -f service.yaml

# List all Services
kubectl get services

# Inspect Service Endpoints
kubectl get endpoints nginx-service

# Delete Service
kubectl delete service nginx-service
\`\`\``,
            [
              { command: 'kubectl apply -f service.yaml', description: 'Create Service from manifest' },
              { command: 'kubectl get services', description: 'List active services and cluster IPs' },
              { command: 'kubectl get endpoints', description: 'List target Pod IP addresses mapped to service' }
            ]
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 6: KUBERNETES STORAGE
     ========================================================================== */
  {
    id: 'k8s-mod-6',
    title: 'Module 6: Kubernetes Storage',
    description: 'Master persistent storage, Volumes (emptyDir, hostPath), Persistent Volumes (PV), Persistent Volume Claims (PVC), and StorageClasses.',
    duration: '3 Hours',
    topics: [
      {
        id: 'k8s-topic-6',
        title: 'Volumes, PV, PVC & StorageClasses',
        description: 'Learn temporary vs persistent storage models for databases and stateful applications.',
        estimatedDuration: '180 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-6-1',
            '6.1 Volumes, Persistent Volumes (PV) & PVCs',
            'Understand how PVs separate physical storage setup from application PVC claims.',
            '40 mins',
            'Reading',
            `# 6.1 Volumes, Persistent Volumes (PV) & PVCs

Applications like MySQL or PostgreSQL generate data that must persist even if Pods crash or restart.

---

### Storage Concepts Overview
- **Volume**: Storage area attached to a Pod lifecycle (e.g. \`emptyDir\`, \`hostPath\`).
- **Persistent Volume (PV)**: Cluster-level physical storage resource provisioned by an administrator or storage class.
- **Persistent Volume Claim (PVC)**: A request for storage submitted by a user/Pod.

---

### Storage Analogy 🏠
- **House** = Persistent Volume (PV)
- **Tenant** = Pod
- **Rental Request** = Persistent Volume Claim (PVC)

Even if a tenant leaves, the house still exists!`
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 7: CONFIGURATION MANAGEMENT
     ========================================================================== */
  {
    id: 'k8s-mod-7',
    title: 'Module 7: Configuration Management',
    description: 'Decouple environment configuration and credentials from container code using ConfigMaps and Secrets.',
    duration: '2.5 Hours',
    topics: [
      {
        id: 'k8s-topic-7',
        title: 'ConfigMaps & Secrets',
        description: 'Pass environment variables, application properties, API keys, and certificates securely.',
        estimatedDuration: '150 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-7-1',
            '7.1 ConfigMaps vs Secrets',
            'Store non-sensitive configurations in ConfigMaps and sensitive credentials in Secrets.',
            '35 mins',
            'Reading',
            `# 7.1 ConfigMaps vs Secrets

Kubernetes separates configuration from source code so applications can run seamlessly across Dev, Staging, and Production environments without rebuilding container images.

---

### Comparison Table
| Feature | ConfigMap | Secret |
| :--- | :--- | :--- |
| **Purpose** | Non-sensitive data (URLs, Ports, Env names) | Sensitive data (Passwords, API Keys, SSL Certs) |
| **Encoding** | Plain text | Base64 encoded / encrypted at rest |
| **Security** | Standard RBAC | Restricted RBAC & encryption |

---

### ConfigMap YAML Example
\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: production
  PORT: "8080"
\`\`\`

### Secret YAML Example
\`\`\`yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:
  username: admin
  password: SuperSecretPassword123
\`\`\``
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 8: ADVANCED WORKLOADS
     ========================================================================== */
  {
    id: 'k8s-mod-8',
    title: 'Module 8: Advanced Workloads',
    description: 'Explore specialized workload resources: StatefulSets, DaemonSets, Jobs, CronJobs, and Horizontal Pod Autoscaler (HPA).',
    duration: '3 Hours',
    topics: [
      {
        id: 'k8s-topic-8',
        title: 'StatefulSets, DaemonSets & HPA',
        description: 'Run databases with StatefulSets, node agents with DaemonSets, scheduled backups with CronJobs, and autoscale with HPA.',
        estimatedDuration: '180 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-8-1',
            '8.1 Advanced Workload Types Overview',
            'Learn when to use StatefulSet, DaemonSet, Job, CronJob, and Horizontal Pod Autoscaler.',
            '40 mins',
            'Reading',
            `# 8.1 Advanced Workload Types Overview

Not all workloads are identical. Kubernetes provides tailored controllers for specific operational demands.

---

### 1. StatefulSet
- Used for stateful applications requiring **stable network identities** and **ordered deployment** (e.g., MySQL Master-Slave, Kafka, MongoDB).

### 2. DaemonSet
- Ensures **one instance of a Pod runs on EVERY Worker Node** in the cluster (e.g. Logging agents like Fluentd, monitoring tools like Prometheus Node Exporter).

### 3. Job & CronJob
- **Job**: Executes a batch task to completion once (e.g. Database migration, report generation).
- **CronJob**: Runs scheduled recurring tasks automatically (e.g. Daily midnight backups).

### 4. Horizontal Pod Autoscaler (HPA)
- Automatically increases or decreases Pod replica count based on CPU or Memory utilization.`
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 9: KUBERNETES SECURITY
     ========================================================================== */
  {
    id: 'k8s-mod-9',
    title: 'Module 9: Kubernetes Security',
    description: 'Harden cluster security using RBAC (Role, ClusterRole, RoleBinding), Service Accounts, Authentication, and Pod Security Standards.',
    duration: '3 Hours',
    topics: [
      {
        id: 'k8s-topic-9',
        title: 'RBAC, Authentication & Service Accounts',
        description: 'Implement Role-Based Access Control to enforce principle of least privilege across teams.',
        estimatedDuration: '180 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-9-1',
            '9.1 Authentication, Authorization & RBAC',
            'Learn how Kubernetes authenticates users, checks RBAC permissions, and grants namespace access.',
            '35 mins',
            'Reading',
            `# 9.1 Authentication, Authorization & RBAC

Security in Kubernetes follows two distinct steps:
1. **Authentication (Who are you?)**: Verifies user or service identity.
2. **Authorization (What are you allowed to do?)**: Checks if the identity has permission to perform an action.

---

### Components of Role-Based Access Control (RBAC)
- **Role**: Defines permissions (read, write, delete) within a single **Namespace**.
- **ClusterRole**: Defines permissions across the **entire Cluster**.
- **RoleBinding**: Grants a Role to a user or Service Account within a namespace.
- **ClusterRoleBinding**: Grants a ClusterRole cluster-wide.`
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 10: MONITORING & LOGGING
     ========================================================================== */
  {
    id: 'k8s-mod-10',
    title: 'Module 10: Monitoring & Logging',
    description: 'Implement cluster observability using Metrics Server, Prometheus, Grafana, and the ELK Stack.',
    duration: '2.5 Hours',
    topics: [
      {
        id: 'k8s-topic-10',
        title: 'Observability & Telemetry Tools',
        description: 'Track CPU/RAM metrics with Prometheus/Grafana and aggregate logs using ELK (Elasticsearch, Logstash, Kibana).',
        estimatedDuration: '150 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-10-1',
            '10.1 Monitoring & Logging Infrastructure',
            'Collect node/pod performance metrics and centralize container logs.',
            '35 mins',
            'Reading',
            `# 10.1 Monitoring & Logging Infrastructure

Observability allows DevOps teams to monitor health and troubleshoot failures quickly.

---

### Monitoring vs Logging
- **Monitoring**: Continuously tracks numerical metrics (CPU usage, RAM, network traffic, Pod status).
- **Logging**: Collects textual application event messages to debug errors.

---

### Popular Observability Stack
- **Metrics Server**: Lightweight metric provider for HPA.
- **Prometheus**: Time-series database that scrapes metrics.
- **Grafana**: Visual dashboard builder for charts.
- **ELK Stack**:
  - **E**lasticsearch (Storage & indexing)
  - **L**ogstash (Log collector & parser)
  - **K**ibana (Log analytics dashboard)`
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 11: HELM — PACKAGE MANAGER
     ========================================================================== */
  {
    id: 'k8s-mod-11',
    title: 'Module 11: Helm — Kubernetes Package Manager',
    description: 'Package, install, upgrade, and rollback complex Kubernetes applications using Helm Charts.',
    duration: '2.5 Hours',
    topics: [
      {
        id: 'k8s-topic-11',
        title: 'Helm Charts & Release Management',
        description: 'Simplify deployments using Helm commands: search, install, upgrade, and rollback.',
        estimatedDuration: '150 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-11-1',
            '11.1 Introduction to Helm & Helm Charts',
            'Learn why Helm is used, chart directory structure, values.yaml, and release rollbacks.',
            '35 mins',
            'Reading',
            `# 11.1 Introduction to Helm & Helm Charts

**Helm** is the official package manager for Kubernetes.

> **Analogy:**
> Just like \`npm\` installs JavaScript packages, **Helm** installs pre-configured Kubernetes applications called **Helm Charts**.

---

### Essential Helm Commands
\`\`\`bash
# Verify Helm installation
helm version

# Search chart repositories
helm search hub nginx

# Install a chart release
helm install my-release bitnami/nginx

# List deployed releases
helm list

# Rollback to previous release revision
helm rollback my-release 1

# Uninstall release
helm uninstall my-release
\`\`\``,
            [
              { command: 'helm version', description: 'Verify Helm CLI version' },
              { command: 'helm list', description: 'List active Helm chart releases' },
              { command: 'helm install my-app bitnami/nginx', description: 'Install Nginx Helm chart' }
            ]
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 12: CI/CD WITH KUBERNETES
     ========================================================================== */
  {
    id: 'k8s-mod-12',
    title: 'Module 12: CI/CD with Kubernetes',
    description: 'Automate build and deployment pipelines using Jenkins, GitHub Actions, ArgoCD, Rolling Updates, and Rollbacks.',
    duration: '3 Hours',
    topics: [
      {
        id: 'k8s-topic-12',
        title: 'CI/CD Pipelines & GitOps',
        description: 'Continuous Integration with GitHub Actions and GitOps continuous deployment using ArgoCD.',
        estimatedDuration: '180 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-12-1',
            '12.1 Automated Pipelines & Zero-Downtime Rolling Updates',
            'Build automated software pipelines and deploy updates with zero downtime.',
            '40 mins',
            'Reading',
            `# 12.1 Automated Pipelines & Zero-Downtime Rolling Updates

Modern software teams release code continuously using **CI/CD** pipelines.

---

### CI/CD Pipeline Steps
1. Developer pushes code to **GitHub**.
2. **GitHub Actions / Jenkins** builds the application and executes automated unit tests.
3. Docker image is built and pushed to **Docker Hub**.
4. **Kubernetes** receives updated image tags and performs a **Rolling Update**.

---

### Rolling Updates vs Rollbacks
- **Rolling Update**: Replaces old Pods with new version Pods incrementally so users experience **zero downtime**.
- **Rollback**: Restores the previous stable deployment version immediately if errors occur in the new release.`
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 13: TROUBLESHOOTING KUBERNETES
     ========================================================================== */
  {
    id: 'k8s-mod-13',
    title: 'Module 13: Troubleshooting Kubernetes',
    description: 'Diagnose and resolve common cluster errors: CrashLoopBackOff, ImagePullBackOff, Pending pods, and networking issues.',
    duration: '3 Hours',
    topics: [
      {
        id: 'k8s-topic-13',
        title: 'Debugging Commands & Diagnostic Workflows',
        description: 'Master troubleshooting tools: kubectl get, describe, logs, top, and event analysis.',
        estimatedDuration: '180 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-13-1',
            '13.1 Debugging Pod Failures & Common Errors',
            'Identify causes of CrashLoopBackOff, ImagePullBackOff, and ErrImagePull.',
            '40 mins',
            'Reading',
            `# 13.1 Debugging Pod Failures & Common Errors

When an application fails to start or crashes in production, follow this 4-step diagnostic workflow:

---

### 4-Step Troubleshooting Workflow
1. **Check Pod Status**: \`kubectl get pods\`
2. **Describe Pod Events**: \`kubectl describe pod <pod-name>\`
3. **Inspect Application Logs**: \`kubectl logs <pod-name>\`
4. **Check Node Resource Usage**: \`kubectl top nodes\`

---

### Common Pod Error Statuses
- **CrashLoopBackOff**: Container starts, fails due to application runtime error, and continuously restarts.
- **ImagePullBackOff / ErrImagePull**: Docker image name is misspelled, tag does not exist, or registry credentials are invalid.
- **Pending**: Insufficient CPU/RAM resources available on Worker Nodes.`
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 14: REAL-WORLD PROJECTS
     ========================================================================== */
  {
    id: 'k8s-mod-14',
    title: 'Module 14: Real-World Kubernetes Projects',
    description: 'Hands-on production projects: Deploy Nginx, React Frontend, Node.js API, MongoDB, and MySQL with StatefulSets.',
    duration: '4 Hours',
    topics: [
      {
        id: 'k8s-topic-14',
        title: 'Full-Stack Microservices Deployment',
        description: 'Deploy real-world multi-tier applications with frontend, backend, database, and ingress endpoints.',
        estimatedDuration: '240 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-14-1',
            '14.1 Deploying Full-Stack Microservices Stack',
            'Deploy Nginx, React, Node.js, and MySQL database using K8s manifests.',
            '60 mins',
            'Assignment',
            `# 14.1 Deploying Full-Stack Microservices Stack

### Hands-on Capstone Goal
In this hands-on project, you will deploy a multi-tier microservices architecture consisting of:
1. **React Frontend**: Served via Nginx Web Server (\`Deployment\` + \`NodePort Service\`).
2. **Node.js REST API**: Backend API handling business logic (\`Deployment\` + \`ClusterIP Service\`).
3. **MySQL Database**: Stateful storage layer (\`StatefulSet\` + \`PersistentVolumeClaim\` + \`Secret\`).

---

### Step-by-Step Execution Commands:
\`\`\`bash
# 1. Deploy database secret credentials
kubectl apply -f mysql-secret.yaml

# 2. Deploy MySQL StatefulSet with PVC
kubectl apply -f mysql-statefulset.yaml

# 3. Deploy Node.js backend API
kubectl apply -f backend-deployment.yaml

# 4. Deploy React frontend
kubectl apply -f frontend-deployment.yaml

# 5. Verify all components
kubectl get all
\`\`\``,
            [
              { command: 'kubectl apply -f mysql-secret.yaml', description: 'Deploy database password credentials' },
              { command: 'kubectl apply -f mysql-statefulset.yaml', description: 'Launch MySQL database with storage' },
              { command: 'kubectl apply -f backend-deployment.yaml', description: 'Deploy Node.js REST API service' },
              { command: 'kubectl apply -f frontend-deployment.yaml', description: 'Deploy React web application' },
              { command: 'kubectl get all', description: 'Verify all pods, services, and deployments' }
            ]
          )
        ]
      }
    ]
  },

  /* ==========================================================================
     MODULE 15: INTERVIEW PREPARATION & CHEAT SHEET
     ========================================================================== */
  {
    id: 'k8s-mod-15',
    title: 'Module 15: Interview Preparation & Cheat Sheet',
    description: 'Comprehensive interview preparation: Theory round, scenario questions, best practices, and complete kubectl cheat sheet.',
    duration: '3 Hours',
    topics: [
      {
        id: 'k8s-topic-15',
        title: 'Top Interview Questions & Kubectl Cheat Sheet',
        description: 'Revise key concepts, scenario questions, and daily kubectl reference cheat sheet.',
        estimatedDuration: '180 mins',
        learningUnits: [
          createLesson(
            'k8s-unit-15-1',
            '15.1 Top Interview Q&A & Scenario Questions',
            'Master top interview questions and scenario-based troubleshooting answers.',
            '45 mins',
            'Reading',
            `# 15.1 Top Interview Q&A & Scenario Questions

### Top Interview Questions

**Q1: What is the difference between a Pod and a Deployment?**
*Answer:* A Pod is the smallest deployable unit running containers. A Deployment is a controller that manages Pod replicas, automated scaling, rolling updates, and self-healing.

**Q2: What is the role of etcd?**
*Answer:* etcd is a distributed key-value database that stores the complete cluster state and configuration data.

**Q3: How does a Service communicate with Pods?**
*Answer:* A Service matches Pods using **Labels** and **Selectors** defined in the manifest.

---

### Real-Time Scenario Question 💡
**Interviewer:** *"Your Pod is in CrashLoopBackOff state. What steps will you take to fix it?"*

**Expected Structured Answer:**
1. Execute \`kubectl get pods\` to confirm Pod status and restart count.
2. Run \`kubectl describe pod <pod-name>\` to review events (OOMKilled, volume mount failure).
3. Run \`kubectl logs <pod-name>\` to read application runtime tracebacks.
4. Correct configuration/image error in manifest and re-apply.`
          ),
          createLesson(
            'k8s-unit-15-2',
            '15.2 Ultimate Kubectl Cheat Sheet',
            'Essential kubectl CLI commands for cluster administration and daily operations.',
            '45 mins',
            'Reading',
            `# 15.2 Ultimate Kubectl Cheat Sheet

### Essential Operations Reference

| Task | Command |
| :--- | :--- |
| **View Nodes** | \`kubectl get nodes\` |
| **View Pods** | \`kubectl get pods\` |
| **View Services** | \`kubectl get svc\` |
| **View Deployments** | \`kubectl get deployments\` |
| **View All Resources** | \`kubectl get all\` |
| **Describe Resource** | \`kubectl describe pod <pod-name>\` |
| **View Logs** | \`kubectl logs <pod-name>\` |
| **Live Stream Logs** | \`kubectl logs -f <pod-name>\` |
| **Execute Shell in Pod** | \`kubectl exec -it <pod-name> -- /bin/bash\` |
| **Apply Manifest** | \`kubectl apply -f manifest.yaml\` |
| **Delete Manifest** | \`kubectl delete -f manifest.yaml\` |
| **Resource CPU/RAM Usage** | \`kubectl top nodes\` / \`kubectl top pods\` |`
          )
        ]
      }
    ]
  }
];
