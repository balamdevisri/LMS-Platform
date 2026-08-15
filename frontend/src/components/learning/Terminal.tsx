import React, { lazy, Suspense } from 'react';

const LinuxLabWorkspace = lazy(() => import('./terminal/LinuxLabWorkspace').then(m => ({ default: m.LinuxLabWorkspace })));
const WindowsPowerShellTerminal = lazy(() => import('../labs/git/WindowsPowerShellTerminal').then(m => ({ default: m.WindowsPowerShellTerminal })));
const SQLPracticeTerminal = lazy(() => import('./terminal/SQLPracticeTerminal').then(m => ({ default: m.SQLPracticeTerminal })));
const PythonInterpreterTerminal = lazy(() => import('./terminal/PythonInterpreterTerminal').then(m => ({ default: m.PythonInterpreterTerminal })));
const JavaConsoleTerminal = lazy(() => import('./terminal/JavaConsoleTerminal').then(m => ({ default: m.JavaConsoleTerminal })));
const ReactPlaygroundTerminal = lazy(() => import('./terminal/ReactPlaygroundTerminal').then(m => ({ default: m.ReactPlaygroundTerminal })));
const CCompilerTerminal = lazy(() => import('./terminal/CCompilerTerminal').then(m => ({ default: m.CCompilerTerminal })));

interface TerminalProps {
  initialCommands?: Array<{ command: string; description: string }>;
  isGitCourse?: boolean;
  onExecuteCommand?: (cmd: string) => void;
  isNightMode?: boolean;
  courseTitle?: string;
}

const TerminalSkeleton = () => (
  <div className="w-full h-80 bg-slate-950 rounded-2xl border border-slate-900 animate-pulse flex items-center justify-center">
    <div className="text-slate-500 font-mono text-xs">Loading Interactive Practice Sandbox...</div>
  </div>
);

export const Terminal: React.FC<TerminalProps> = ({
  initialCommands,
  isGitCourse = false,
  onExecuteCommand,
  isNightMode = true,
  courseTitle = '',
}) => {
  const titleLower = courseTitle.toLowerCase();
  const isKubernetesCourse = titleLower.includes('kubernetes') || titleLower.includes('k8s');

  const renderTerminal = () => {
    if (titleLower.includes('database') || titleLower.includes('dbms') || titleLower.includes('sql')) {
      return (
        <SQLPracticeTerminal 
          onCommandRun={onExecuteCommand}
          isNightMode={isNightMode}
        />
      );
    }

    if (titleLower.includes('git') || titleLower.includes('github') || isGitCourse) {
      return (
        <WindowsPowerShellTerminal 
          onCommandRun={onExecuteCommand}
          isNightMode={isNightMode}
        />
      );
    }

    if (titleLower.includes('python')) {
      return (
        <PythonInterpreterTerminal 
          onCommandRun={onExecuteCommand}
          isNightMode={isNightMode}
        />
      );
    }

    if (titleLower.includes('java') && !titleLower.includes('javascript')) {
      return (
        <JavaConsoleTerminal 
          onCommandRun={onExecuteCommand}
          isNightMode={isNightMode}
        />
      );
    }

    if (titleLower.includes('react')) {
      return (
        <ReactPlaygroundTerminal 
          onCommandRun={onExecuteCommand}
          isNightMode={isNightMode}
        />
      );
    }

    if (
      titleLower.includes('c programming') ||
      titleLower.includes('c language') ||
      titleLower.includes('c course') ||
      titleLower === 'c' ||
      titleLower.startsWith('c ') ||
      titleLower.endsWith(' c') ||
      titleLower.includes('c &') ||
      titleLower.includes('c and')
    ) {
      return (
        <CCompilerTerminal 
          onCommandRun={onExecuteCommand}
          isNightMode={isNightMode}
        />
      );
    }

    return (
      <LinuxLabWorkspace
        initialCommands={initialCommands}
        isGitCourse={false}
        onExecuteCommand={onExecuteCommand}
        isNightMode={isNightMode}
        isKubernetesCourse={isKubernetesCourse}
      />
    );
  };

  return (
    <Suspense fallback={<TerminalSkeleton />}>
      {renderTerminal()}
    </Suspense>
  );
};
