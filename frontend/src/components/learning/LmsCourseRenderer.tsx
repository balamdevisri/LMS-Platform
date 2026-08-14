import React, { useMemo } from 'react';
import { CodeBlock } from './CodeBlock';
import { Sparkles, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

interface LmsCourseRendererProps {
  content: string;
  isNightMode?: boolean;
  courseId?: string;
}

// ---------------------------------------------------------------------
// 🎨 LIGHTWEIGHT SVG TOPIC-SPECIFIC ILLUSTRATIONS
// ---------------------------------------------------------------------
const TopicVisual: React.FC<{ topicKey: string; isNightMode: boolean }> = ({ topicKey, isNightMode }) => {
  const strokeColor = isNightMode ? '#22d3ee' : '#0284c7'; // cyan vs sky-600
  const fillColor = isNightMode ? '#1e293b' : '#f0f9ff'; // slate-800 vs sky-50
  const accentColor = isNightMode ? '#a5f3fc' : '#bae6fd';

  switch (topicKey) {
    // --- PYTHON VISUALS ---
    case 'Python Basics':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="5" width="90" height="30" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M25 20 L40 20 M35 15 L40 20 L35 25" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="48" y="24" fontFamily="monospace" fontSize="10" fontWeight="bold" fill={isNightMode ? '#e2e8f0' : '#0f172a'}>print("Hello Python")</text>
        </svg>
      );
    case 'Variables':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="15" y="10" width="30" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="30" y="23" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="bold" fill={strokeColor}>x</text>
          <path d="M52 20 L60 20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          <rect x="65" y="10" width="20" height="20" rx="4" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="75" y="23" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>10</text>
        </svg>
      );
    case 'Data Types':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="10" width="25" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="17.5" y="22" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill={strokeColor}>int</text>
          <rect x="37.5" y="10" width="25" height="20" rx="4" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="50" y="22" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>str</text>
          <rect x="70" y="10" width="25" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="82.5" y="22" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill={strokeColor}>bool</text>
        </svg>
      );
    case 'Operators':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <circle cx="20" cy="20" r="10" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="20" y="24" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill={strokeColor}>+</text>
          <circle cx="50" cy="20" r="10" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="50" y="24" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>==</text>
          <circle cx="80" cy="20" r="10" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="80" y="24" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill={strokeColor}>%</text>
        </svg>
      );
    case 'Conditions':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <path d="M50 5 L70 20 L50 35 L30 20 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="50" y="23" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill={strokeColor}>IF / ELSE</text>
          <path d="M20 20 L30 20" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M70 20 L80 20" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'Loops':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <path d="M50 10 A 10 10 0 1 1 40 13" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="3,1" />
          <path d="M40 8 L40 14 L46 12 Z" fill={strokeColor} />
          <text x="50" y="24" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill={isNightMode ? '#e2e8f0' : '#0f172a'}>for item in list:</text>
        </svg>
      );
    case 'Strings':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="10" width="80" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="50" y="23" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="bold" fill={strokeColor}>"P" + "y" + "t" + "h" + "o" + "n"</text>
        </svg>
      );
    case 'Lists':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="12" width="16" height="16" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="30" y="12" width="16" height="16" rx="3" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="50" y="12" width="16" height="16" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="70" y="12" width="16" height="16" rx="3" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="18" y="23" fontSize="8" fontFamily="monospace" fill={strokeColor}>[0]</text>
          <text x="38" y="23" fontSize="8" fontFamily="monospace" fill={isNightMode ? '#0f172a' : '#0369a1'}>[1]</text>
        </svg>
      );
    case 'Dictionaries':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="8" width="80" height="24" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="20" y="23" fontFamily="monospace" fontSize="8" fontWeight="bold" fill={strokeColor}>"key"</text>
          <path d="M42 20 L48 20" stroke={strokeColor} strokeWidth="1.5" />
          <text x="55" y="23" fontFamily="monospace" fontSize="8" fontWeight="bold" fill={isNightMode ? '#e2e8f0' : '#0f172a'}>"value"</text>
        </svg>
      );
    case 'Functions':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="35" y="8" width="30" height="24" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="50" y="22" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill={strokeColor}>def func(x)</text>
          <path d="M10 20 L30 20" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M70 20 L90 20" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'Exceptions':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <path d="M50 5 L85 32 L15 32 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
          <text x="50" y="26" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill={isNightMode ? '#fb7185' : '#e11d48'}>!</text>
          <text x="50" y="38" textAnchor="middle" fontFamily="monospace" fontSize="6" fill={isNightMode ? '#cbd5e1' : '#475569'}>try / except</text>
        </svg>
      );
    case 'File Handling':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="35" y="5" width="30" height="30" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M55 5 L55 15 L65 15" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="40" y1="20" x2="60" y2="20" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="40" y1="26" x2="55" y2="26" stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    case 'Classes':
    case 'Objects':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="15" y="8" width="30" height="24" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,1" />
          <text x="30" y="22" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill={strokeColor}>Class</text>
          <path d="M50 20 L60 20" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="75" cy="20" r="10" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="75" y="23" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>Object</text>
        </svg>
      );
    case 'Encapsulation':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="35" y="15" width="30" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M42 15 L42 10 A 8 8 0 0 1 58 10 L58 15" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="25" r="3" fill={strokeColor} />
        </svg>
      );
    case 'Inheritance':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="40" y="5" width="20" height="10" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="15" y="25" width="20" height="10" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="65" y="25" width="20" height="10" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M50 15 L50 20 L25 20 L25 25 M50 20 L75 20 L75 25" fill="none" stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    case 'Polymorphism':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <circle cx="25" cy="20" r="10" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="65" y="10" width="20" height="20" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M40 20 L60 20" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,1" />
        </svg>
      );
    case 'Abstraction':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="10" width="80" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="25" cy="20" r="3" fill={strokeColor} />
          <circle cx="50" cy="20" r="3" fill={strokeColor} />
          <circle cx="75" cy="20" r="3" fill={strokeColor} />
          <text x="50" y="38" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fill={strokeColor}>Simple Interface</text>
        </svg>
      );
    case 'Iterators':
    case 'Generators':
    case 'Decorators':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <path d="M15 20 L35 20 A 15 15 0 0 1 65 20 L85 20" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="15" cy="20" r="3" fill={strokeColor} />
          <circle cx="50" cy="20" r="3" fill={accentColor} stroke={strokeColor} />
          <circle cx="85" cy="20" r="3" fill={strokeColor} />
        </svg>
      );

    // --- KUBERNETES VISUALS ---
    case 'Kubernetes Overview':
    case 'Helm':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <circle cx="50" cy="20" r="10" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M50 5 L50 35 M35 20 L65 20 M39 9 L61 31 M39 31 L61 9" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Architecture':
    case 'Control Plane':
    case 'Worker Nodes':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="12" width="25" height="16" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="17.5" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill={strokeColor}>Control</text>
          <path d="M30 20 L45 10 M30 20 L45 30" stroke={strokeColor} strokeWidth="1" strokeDasharray="2,2" fill="none" />
          <rect x="45" y="4" width="25" height="12" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <text x="57.5" y="12" textAnchor="middle" fontSize="5" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>Node 1</text>
          <rect x="45" y="24" width="25" height="12" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <text x="57.5" y="32" textAnchor="middle" fontSize="5" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>Node 2</text>
        </svg>
      );
    case 'Pods':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="25" y="8" width="50" height="24" rx="12" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="40" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <circle cx="50" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <circle cx="60" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <text x="50" y="38" textAnchor="middle" fontSize="6" fontWeight="bold" fill={strokeColor}>Pod (Containers)</text>
        </svg>
      );
    case 'Services':
    case 'Networking':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <circle cx="20" cy="20" r="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="20" y="23" textAnchor="middle" fontSize="8" fontWeight="bold" fill={strokeColor}>S</text>
          <path d="M26 20 L50 10 M26 20 L50 20 M26 20 L50 30" stroke={strokeColor} strokeWidth="1" fill="none" />
          <circle cx="56" cy="10" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <circle cx="56" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <circle cx="56" cy="30" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Deployments':
    case 'ReplicaSets':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="20" y="12" width="20" height="16" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="25" y="8" width="20" height="16" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.2" />
          <rect x="30" y="4" width="20" height="16" rx="2" fill={isNightMode ? '#0e7490' : '#bae6fd'} stroke={strokeColor} strokeWidth="1" />
          <text x="68" y="24" fontSize="8" fontWeight="bold" fill={strokeColor}>Replicas: 3</text>
        </svg>
      );
    case 'ConfigMaps':
    case 'Secrets':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="35" y="6" width="30" height="28" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="42" y1="14" x2="58" y2="14" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="42" y1="20" x2="52" y2="20" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="26" r="3" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Namespaces':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="15" y="6" width="30" height="28" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="55" y="6" width="30" height="28" rx="3" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="30" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill={strokeColor}>ns-1</text>
          <text x="70" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>ns-2</text>
        </svg>
      );
    case 'Volumes':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <ellipse cx="50" cy="12" rx="15" ry="5" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M35 12 L35 28 A 15 5 0 0 0 65 28 L65 12" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <ellipse cx="50" cy="20" rx="15" ry="5" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="28" rx="15" ry="5" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Ingress':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="10" width="20" height="20" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="20" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill={strokeColor}>Ingress</text>
          <path d="M30 20 L55 12 M30 20 L55 28" stroke={strokeColor} strokeWidth="1" fill="none" />
          <rect x="55" y="4" width="30" height="12" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="55" y="24" width="30" height="12" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    case 'Monitoring':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="5" width="80" height="30" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M15 28 L30 15 L45 22 L60 8 L75 25 L85 12" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="60" cy="8" r="3" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Security':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <path d="M50 5 C60 5 70 8 75 12 C75 24 65 32 50 35 C35 32 25 24 25 12 C30 8 40 5 50 5 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="18" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <path d="M50 22 L50 28" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="5" width="90" height="30" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="30" cy="20" r="8" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="70" cy="20" r="8" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
  }
};

const getVisualKey = (title: string, desc: string, isK8s: boolean): string => {
  const searchStr = `${title} ${desc}`.toLowerCase();

  if (isK8s) {
    if (searchStr.includes('ingress') || searchStr.includes('routing')) return 'Ingress';
    if (searchStr.includes('service') || searchStr.includes('network') || searchStr.includes('port')) return 'Services';
    if (searchStr.includes('replicaset') || searchStr.includes('hpa') || searchStr.includes('scale')) return 'ReplicaSets';
    if (searchStr.includes('deployment') || searchStr.includes('rollout')) return 'Deployments';
    if (searchStr.includes('secret')) return 'Secrets';
    if (searchStr.includes('configmap')) return 'ConfigMaps';
    if (searchStr.includes('volume') || searchStr.includes('pv') || searchStr.includes('storage')) return 'Volumes';
    if (searchStr.includes('namespace')) return 'Namespaces';
    if (searchStr.includes('pod') || searchStr.includes('container')) return 'Pods';
    if (searchStr.includes('control plane') || searchStr.includes('scheduler') || searchStr.includes('etcd')) return 'Control Plane';
    if (searchStr.includes('worker') || searchStr.includes('kubelet')) return 'Worker Nodes';
    if (searchStr.includes('architecture')) return 'Architecture';
    if (searchStr.includes('monitoring') || searchStr.includes('log') || searchStr.includes('prometheus')) return 'Monitoring';
    if (searchStr.includes('security') || searchStr.includes('rbac') || searchStr.includes('access')) return 'Security';
    if (searchStr.includes('helm') || searchStr.includes('package')) return 'Helm';
    return 'Kubernetes Overview';
  } else {
    if (searchStr.includes('project') || searchStr.includes('management project')) return 'OOP Projects';
    if (searchStr.includes('decorator')) return 'Decorators';
    if (searchStr.includes('generator')) return 'Generators';
    if (searchStr.includes('iterator')) return 'Iterators';
    if (searchStr.includes('abstraction')) return 'Abstraction';
    if (searchStr.includes('polymorphism') || searchStr.includes('override')) return 'Polymorphism';
    if (searchStr.includes('inheritance')) return 'Inheritance';
    if (searchStr.includes('encapsulation') || searchStr.includes('private')) return 'Encapsulation';
    if (searchStr.includes('class') && !searchStr.includes('subclass')) return 'Classes';
    if (searchStr.includes('object') || searchStr.includes('instance')) return 'Objects';
    if (searchStr.includes('file') || searchStr.includes('open(') || searchStr.includes('csv')) return 'File Handling';
    if (searchStr.includes('exception') || searchStr.includes('try') || searchStr.includes('except')) return 'Exceptions';
    if (searchStr.includes('function') || searchStr.includes('def ')) return 'Functions';
    if (searchStr.includes('dictionary') || searchStr.includes('dict') || searchStr.includes('key')) return 'Dictionaries';
    if (searchStr.includes('list') || searchStr.includes('set') || searchStr.includes('tuple') || searchStr.includes('collection')) return 'Lists';
    if (searchStr.includes('string') || searchStr.includes('slice') || searchStr.includes('index')) return 'Strings';
    if (searchStr.includes('loop') || searchStr.includes('for') || searchStr.includes('while')) return 'Loops';
    if (searchStr.includes('condition') || searchStr.includes('if') || searchStr.includes('else')) return 'Conditions';
    if (searchStr.includes('operator') || searchStr.includes('arithmetic')) return 'Operators';
    if (searchStr.includes('type') || searchStr.includes('float') || searchStr.includes('int') || searchStr.includes('bool')) return 'Data Types';
    if (searchStr.includes('variable') || searchStr.includes('identifier')) return 'Variables';
    return 'Python Basics';
  }
};

// ---------------------------------------------------------------------
// 🔍 FLOWCHART & TABLE & QUESTION RENDERERS
// ---------------------------------------------------------------------
const FlowchartRenderer: React.FC<{ lines: string[]; isNightMode: boolean }> = ({ lines, isNightMode }) => {
  const blocks = lines
    .map(line => line.replace(/[↓|→|↙|↘|┌┐└┘├┤┬┴┼│─]+/g, '').trim())
    .filter(Boolean);

  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 my-6">
      {blocks.map((block, idx) => (
        <React.Fragment key={idx}>
          <div className={`px-5 py-3 rounded-2xl border text-sm font-semibold font-mono tracking-wide ${
            isNightMode ? 'bg-slate-900 border-slate-800 text-cyan-300' : 'bg-sky-50 border-sky-100 text-sky-800'
          } shadow-sm max-w-xs text-center`}>
            {block}
          </div>
          {idx < blocks.length - 1 && (
            <div className={`text-xl ${isNightMode ? 'text-cyan-400' : 'text-sky-500'} font-bold`}>↓</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const TableRenderer: React.FC<{ lines: string[]; isNightMode: boolean }> = ({ lines, isNightMode }) => {
  const rows = lines.map(line => {
    const separator = line.includes('|') ? '|' : '│';
    return line.split(separator).map(cell => cell.trim()).filter(Boolean);
  }).filter(row => row.length > 0);

  if (rows.length === 0) return null;

  const headers = rows[0];
  const bodyRows = rows.slice(1);

  return (
    <div className="overflow-x-auto my-6 rounded-2xl border border-sky-100 dark:border-slate-800">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className={isNightMode ? 'bg-slate-900' : 'bg-sky-50/50'}>
            {headers.map((h, i) => (
              <th key={i} className={`p-3 font-semibold border-b ${isNightMode ? 'border-slate-800 text-white' : 'border-sky-100 text-sky-900'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri} className={`hover:bg-slate-900/10 ${ri % 2 === 0 ? (isNightMode ? 'bg-slate-950/20' : 'bg-slate-50/30') : ''}`}>
              {row.map((cell, ci) => (
                <td key={ci} className={`p-3 border-b ${isNightMode ? 'border-slate-900 text-slate-350' : 'border-sky-50 text-slate-700'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const QuestionCard: React.FC<{ question: string; answer: string[]; isNightMode: boolean; isK8s: boolean }> = ({ question, answer, isNightMode, isK8s }) => {
  return (
    <div className={`my-5 p-5 rounded-2xl border shadow-sm ${
      isNightMode ? 'bg-slate-900/60 border-slate-800' : 'bg-sky-50/20 border-sky-100/80'
    }`}>
      <div className={`font-bold text-sm sm:text-base flex items-start gap-2 ${isNightMode ? 'text-cyan-300' : 'text-sky-800'}`}>
        <span className="shrink-0">❓</span>
        <span>{question}</span>
      </div>
      <div className={`mt-3 text-xs sm:text-sm leading-relaxed border-t pt-3 ${
        isNightMode ? 'border-slate-800 text-slate-350' : 'border-sky-50 text-slate-650'
      } space-y-2`}>
        {answer.map((ans, idx) => {
          const trimmedAns = ans.trim();
          if (!trimmedAns) return null;
          if (trimmedAns.toLowerCase() === 'answer:') return null;
          
          if (isCodeLine(trimmedAns, isK8s)) {
            return (
              <div key={idx} className="my-2">
                <CodeBlock code={trimmedAns} language={isK8s ? 'yaml' : 'python'} />
              </div>
            );
          }
          
          if (trimmedAns.startsWith('●') || trimmedAns.startsWith('•') || trimmedAns.startsWith('-') || trimmedAns.startsWith('*')) {
            const cleanText = trimmedAns.replace(/^[-*•●]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 ml-2 my-1.5">
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isNightMode ? 'text-cyan-400' : 'text-sky-500'}`} />
                <span>{formatInlineStyles(cleanText, isNightMode)}</span>
              </div>
            );
          }
          
          return (
            <p key={idx} className="my-1.5 font-normal leading-relaxed">
              {formatInlineStyles(ans, isNightMode)}
            </p>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------
// 📦 HELPER FUNCTIONS FOR PYTHON & KUBERNETES PARSING
// ---------------------------------------------------------------------
function isCodeLine(line: string, isK8s: boolean): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  
  if (isK8s) {
    const k8sPatterns = [
      /^\s*(apiVersion|kind|metadata|spec|status|selector|labels|containers|resources|ports|env|volumes|volumeMounts|template|replicas|rules|http|paths|backend|service|port|rules|data|stringData)\s*:/,
      /^\s*-\s+(name|image|containerPort|hostPath|mountPath|claimName|port|protocol|path|host|value|configMapRef|secretRef)\b/,
      /^\s*(kubectl|minikube|helm|docker|systemctl|cat|echo|cd|sudo|apt-get|curl|wget)\b/,
      /^\s*#\s+.+$/,
      /^\s*"""\s*$/,
      /^\s*["'].*["']\s*$/,
      /^[\[\{]\s*.*[\]\}]$/,
      /:$/,
    ];
    return k8sPatterns.some(regex => regex.test(line));
  } else {
    const pythonPatterns = [
      /^\s*(def|class|import|from|return|pass|try|except|finally|raise|assert|yield|print|input)\b/,
      /^\s*(if|elif|else|for|while)\b.*:$/,
      /^\s*[a-zA-Z_]\w*\s*(\+|-|\*|\/|%|\*\*|\/\/)?=\s*.+/,
      /^[a-zA-Z_]\w*\.[a-zA-Z_]\w*\(.*\)$/,
      /^\s*#\s+.+$/,
      /^\s*"""\s*$/,
      /^\s*["'].*["']\s*$/,
      /^[\[\{]\s*.*[\]\}]$/,
    ];
    return pythonPatterns.some(regex => regex.test(line));
  }
}

function splitInlineCodeStatements(line: string, isK8s: boolean): string[] {
  if (isK8s) return [line];
  if (line.includes('  ')) {
    const parts = line.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);
    const allCode = parts.every(part => isCodeLine(part, isK8s));
    if (allCode && parts.length > 1) {
      return parts;
    }
  }
  return [line];
}

function formatInlineStyles(text: string, isNightMode: boolean): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className={`px-1.5 py-0.5 rounded-md font-mono text-xs ${
          isNightMode ? 'bg-slate-900 text-cyan-300 border border-slate-800' : 'bg-sky-50 text-sky-700 border border-sky-100'
        }`}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// ---------------------------------------------------------------------
// 🚀 MAIN LMS COURSE RENDERER COMPONENT
// ---------------------------------------------------------------------
export const LmsCourseRenderer: React.FC<LmsCourseRendererProps> = ({ content, isNightMode = false, courseId }) => {
  const isK8s = courseId === 'kubernetes-complete-course-beginner-to-advanced';

  const blocks = useMemo(() => {
    let cleanContent = content
      .replace(/\r/g, '')
      .trim();

    // Dynamically heal Python Module 1 to skip Page 5 Table of Contents (TOC) index page
    if (!isK8s && cleanContent.includes('Module') && cleanContent.includes('15:')) {
      const headingMatch = cleanContent.match(/(🐍\s*)?Module\s+1\s*:/i);
      if (headingMatch && headingMatch.index !== undefined) {
        cleanContent = cleanContent.slice(headingMatch.index);
      }
    }

    const lines = cleanContent.split('\n');
    const parsedBlocks: any[] = [];
    
    let currentCodeLines: string[] = [];
    let currentFlowchartLines: string[] = [];
    let currentTableLines: string[] = [];
    let currentTextLines: string[] = [];
    
    let currentQuestion: string | null = null;
    let currentAnswerLines: string[] = [];

    const flushText = () => {
      if (currentTextLines.length > 0) {
        const collapsedText = currentTextLines.join(' ').replace(/\s+/g, ' ').trim();
        if (collapsedText) {
          parsedBlocks.push({ type: 'text', text: collapsedText });
        }
        currentTextLines = [];
      }
    };

    const flushCodeBlock = () => {
      if (currentCodeLines.length > 0) {
        parsedBlocks.push({ type: 'code', code: currentCodeLines.join('\n') });
        currentCodeLines = [];
      }
    };

    const flushFlowchartBlock = () => {
      if (currentFlowchartLines.length > 0) {
        parsedBlocks.push({ type: 'flowchart', lines: [...currentFlowchartLines] });
        currentFlowchartLines = [];
      }
    };

    const flushTableBlock = () => {
      if (currentTableLines.length > 0) {
        parsedBlocks.push({ type: 'table', lines: [...currentTableLines] });
        currentTableLines = [];
      }
    };

    const flushQuestionBlock = () => {
      if (currentQuestion) {
        const processedAnswer: string[] = [];
        let tempText: string[] = [];

        const flushTempText = () => {
          if (tempText.length > 0) {
            processedAnswer.push(tempText.join(' ').replace(/\s+/g, ' ').trim());
            tempText = [];
          }
        };

        for (const line of currentAnswerLines) {
          const trimmedLine = line.trim();
          if (trimmedLine === '') {
            flushTempText();
            continue;
          }
          const isCode = isCodeLine(trimmedLine, isK8s);
          const isBullet = trimmedLine.startsWith('●') || trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*');
          
          if (isCode || isBullet) {
            flushTempText();
            processedAnswer.push(trimmedLine);
          } else {
            tempText.push(trimmedLine);
          }
        }
        flushTempText();

        let finalAnswer = processedAnswer;
        if (!isK8s && currentQuestion.includes('Q9.') && currentQuestion.includes('type()') && finalAnswer.length === 0) {
          finalAnswer = ["It returns the type/class of an object."];
        }

        parsedBlocks.push({
          type: 'question',
          question: currentQuestion,
          answer: finalAnswer
        });
        currentQuestion = null;
        currentAnswerLines = [];
      }
    };

    const flushAllAccumulators = () => {
      flushText();
      flushCodeBlock();
      flushFlowchartBlock();
      flushTableBlock();
      flushQuestionBlock();
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (/===== PDF PAGE \d+ =====/.test(trimmed)) {
        continue;
      }

      if (!trimmed) {
        if (currentQuestion) {
          currentAnswerLines.push('');
        } else {
          let nextNonEmptyLine = '';
          for (let j = i + 1; j < lines.length; j++) {
            const l = lines[j].trim();
            if (l) {
              nextNonEmptyLine = l;
              break;
            }
          }

          const isNextCode = nextNonEmptyLine && isCodeLine(nextNonEmptyLine, isK8s);
          
          if (currentCodeLines.length > 0 && isNextCode) {
            currentCodeLines.push('');
          } else {
            const isNextStructural = !nextNonEmptyLine ||
              nextNonEmptyLine.startsWith('#') ||
              (nextNonEmptyLine.toLowerCase().includes('module ') && (nextNonEmptyLine.includes(':') || nextNonEmptyLine.includes('—'))) ||
              /^\d+\.\d+\s+/.test(nextNonEmptyLine) ||
              /^\s*Q\d+\.?\s+/.test(nextNonEmptyLine) ||
              (isK8s && /^\s*(\d+)\.\s+([A-Z].*\?)\s*$/.test(nextNonEmptyLine)) ||
              /↓|→|↙|↘/.test(nextNonEmptyLine) ||
              nextNonEmptyLine.includes('|') ||
              (nextNonEmptyLine.includes('│') && nextNonEmptyLine.length > 5) ||
              isCodeLine(nextNonEmptyLine, isK8s) ||
              nextNonEmptyLine.startsWith('●') || nextNonEmptyLine.startsWith('•') || nextNonEmptyLine.startsWith('- ') || nextNonEmptyLine.startsWith('* ') ||
              nextNonEmptyLine.includes('●') || nextNonEmptyLine.includes('•') ||
              nextNonEmptyLine.toLowerCase().startsWith('mistake ') || nextNonEmptyLine.toLowerCase().startsWith('warning:') || nextNonEmptyLine.toLowerCase().startsWith('note:');

            if (isNextStructural) {
              flushAllAccumulators();
            } else {
              const accumulatedText = currentTextLines.join(' ').trim();
              const endsWithSentence = /[.!?]$/.test(accumulatedText);
              const nextStartsUpper = /^[A-Z]/.test(nextNonEmptyLine);
              
              if (endsWithSentence && nextStartsUpper) {
                flushText();
              }
            }
          }
        }
        continue;
      }

      const isHeading = trimmed.startsWith('#') || (trimmed.toLowerCase().includes('module ') && (trimmed.includes(':') || trimmed.includes('—')));
      const isSubheading = /^\d+\.\d+\s+/.test(trimmed);
      const questionMatch = trimmed.match(/^\s*Q(\d+)\.?\s+(.+)$/i);
      const k8sQuestionMatch = isK8s ? trimmed.match(/^\s*(\d+)\.\s+([A-Z].*\?)\s*$/) : null;

      if (isHeading || isSubheading || questionMatch || k8sQuestionMatch) {
        flushAllAccumulators();

        if (isHeading) {
          const headerText = trimmed.replace(/^#+\s*/, '').trim();
          parsedBlocks.push({ type: 'heading', text: headerText, level: trimmed.startsWith('#') ? trimmed.match(/^#+/)?.[0].length || 1 : 1 });
        } else if (isSubheading) {
          parsedBlocks.push({ type: 'subheading', text: trimmed });
        } else if (questionMatch) {
          const fullQText = questionMatch[2];
          const qIndex = fullQText.indexOf('?');
          if (qIndex !== -1 && qIndex < fullQText.length - 1) {
            currentQuestion = `Q${questionMatch[1]}. ${fullQText.slice(0, qIndex + 1).trim()}`;
            const inlineAnswer = fullQText.slice(qIndex + 1).trim();
            if (inlineAnswer) {
              currentAnswerLines.push(inlineAnswer);
            }
          } else {
            currentQuestion = `Q${questionMatch[1]}. ${fullQText.trim()}`;
          }
        } else if (k8sQuestionMatch) {
          currentQuestion = `Q${k8sQuestionMatch[1]}. ${k8sQuestionMatch[2].trim()}`;
        }
        continue;
      }

      if (currentQuestion) {
        currentAnswerLines.push(line);
        continue;
      }

      // Flowchart detection
      if (/↓|→|↙|↘/.test(trimmed)) {
        flushText();
        flushCodeBlock();
        flushTableBlock();
        currentFlowchartLines.push(trimmed);
        continue;
      }

      // Table detection
      if (trimmed.includes('|') || (trimmed.includes('│') && trimmed.length > 5)) {
        flushText();
        flushCodeBlock();
        flushFlowchartBlock();
        currentTableLines.push(trimmed);
        continue;
      }

      // Code detection
      const inlineCodeStatements = splitInlineCodeStatements(trimmed, isK8s);
      if (isCodeLine(trimmed, isK8s) || inlineCodeStatements.length > 1) {
        flushText();
        flushFlowchartBlock();
        flushTableBlock();
        currentCodeLines.push(...inlineCodeStatements);
        continue;
      }

      // Bullet points detection (●, •, -, *)
      if (trimmed.startsWith('●') || trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        flushAllAccumulators();
        const separators = /[●•]/g;
        if (separators.test(trimmed)) {
          const items = trimmed.split(/[●•]/).map(item => item.trim()).filter(Boolean);
          items.forEach(item => {
            parsedBlocks.push({ type: 'bullet', text: item });
          });
        } else {
          parsedBlocks.push({ type: 'bullet', text: trimmed.replace(/^[-*•●]\s*/, '') });
        }
        continue;
      }

      if (trimmed.includes('●') || trimmed.includes('•')) {
        flushAllAccumulators();
        const items = trimmed.split(/[●•]/).map(item => item.trim()).filter(Boolean);
        items.forEach(item => {
          parsedBlocks.push({ type: 'bullet', text: item });
        });
        continue;
      }

      // Important/Note/Warning checks
      if (trimmed.toLowerCase().startsWith('mistake ') || trimmed.toLowerCase().startsWith('warning:') || trimmed.toLowerCase().startsWith('note:')) {
        flushAllAccumulators();
        parsedBlocks.push({ type: 'note', text: trimmed });
        continue;
      }

      // Normal text lines accumulate for natural wrapping
      flushCodeBlock();
      flushFlowchartBlock();
      flushTableBlock();
      currentTextLines.push(trimmed);
    }

    flushAllAccumulators();

    return parsedBlocks;
  }, [content, isK8s]);

  const topicVisualKey = useMemo(() => {
    const heading = blocks.find(b => b.type === 'heading')?.text || '';
    const subheading = blocks.find(b => b.type === 'subheading')?.text || '';
    return getVisualKey(heading, subheading + ' ' + content.slice(0, 100), isK8s);
  }, [blocks, content, isK8s]);

  return (
    <div className="space-y-6">
      {/* Dynamic Visual Illustration Card */}
      <div className={`p-4 rounded-3xl border shadow-sm flex flex-col items-center justify-center ${
        isNightMode ? 'bg-slate-900/40 border-slate-800' : 'bg-sky-50/10 border-sky-100/50'
      }`}>
        <TopicVisual topicKey={topicVisualKey} isNightMode={isNightMode} />
        <span className={`text-[10px] font-semibold uppercase tracking-wider font-mono ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Concept Visual: {topicVisualKey}
        </span>
      </div>

      {/* Render Parsed Blocks */}
      <div className="space-y-4">
        {blocks.map((block, idx) => {
          switch (block.type) {
            case 'heading':
              return (
                <h2
                  key={idx}
                  className={`text-2xl sm:text-3xl font-heading font-extrabold mt-8 mb-4 border-b pb-3 flex items-center gap-2.5 ${
                    isNightMode ? 'text-white border-slate-800' : 'text-slate-900 border-sky-100'
                  }`}
                >
                  <Sparkles className="w-6 h-6 text-cyan-450 shrink-0" />
                  <span>{block.text}</span>
                </h2>
              );
            case 'subheading':
              return (
                <h3
                  key={idx}
                  className={`text-lg sm:text-xl font-heading font-bold mt-6 mb-3 flex items-center gap-2 ${
                    isNightMode ? 'text-cyan-300' : 'text-sky-850'
                  }`}
                >
                  <Terminal className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{block.text}</span>
                </h3>
              );
            case 'code':
              return (
                <CodeBlock
                  key={idx}
                  code={block.code}
                  language={isK8s ? 'yaml' : 'python'}
                />
              );
            case 'flowchart':
              return (
                <FlowchartRenderer
                  key={idx}
                  lines={block.lines}
                  isNightMode={isNightMode}
                />
              );
            case 'table':
              return (
                <TableRenderer
                  key={idx}
                  lines={block.lines}
                  isNightMode={isNightMode}
                />
              );
            case 'question':
              return (
                <QuestionCard
                  key={idx}
                  question={block.question}
                  answer={block.answer}
                  isNightMode={isNightMode}
                  isK8s={isK8s}
                />
              );
            case 'bullet':
              return (
                <div key={idx} className="flex items-start gap-2.5 ml-3 my-2 text-sm sm:text-base leading-relaxed">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 mt-1 ${isNightMode ? 'text-cyan-400' : 'text-sky-500'}`} />
                  <span className={isNightMode ? 'text-slate-200' : 'text-slate-700'}>
                    {formatInlineStyles(block.text, isNightMode)}
                  </span>
                </div>
              );
            case 'note':
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-start gap-3 my-4 leading-relaxed ${
                    isNightMode ? 'bg-amber-950/20 border-amber-900/50 text-amber-200' : 'bg-amber-50/50 border-amber-100 text-amber-800'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                  <span className="text-sm font-medium">{formatInlineStyles(block.text, isNightMode)}</span>
                </div>
              );
            case 'text':
            default:
              return (
                <p
                  key={idx}
                  className={`text-sm sm:text-base leading-relaxed my-3 font-normal ${
                    isNightMode ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  {formatInlineStyles(block.text, isNightMode)}
                </p>
              );
          }
        })}
      </div>
    </div>
  );
};
