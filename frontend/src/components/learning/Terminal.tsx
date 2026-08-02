import React from 'react';
import { LinuxLabWorkspace } from './terminal/LinuxLabWorkspace';
import { WindowsPowerShellTerminal } from '../labs/git/WindowsPowerShellTerminal';
import { SQLPracticeTerminal } from './terminal/SQLPracticeTerminal';
import { PythonInterpreterTerminal } from './terminal/PythonInterpreterTerminal';
import { JavaConsoleTerminal } from './terminal/JavaConsoleTerminal';
import { ReactPlaygroundTerminal } from './terminal/ReactPlaygroundTerminal';

interface TerminalProps {
  initialCommands?: Array<{ command: string; description: string }>;
  isGitCourse?: boolean;
  onExecuteCommand?: (cmd: string) => void;
  isNightMode?: boolean;
  courseTitle?: string;
}

export const Terminal: React.FC<TerminalProps> = ({
  initialCommands,
  isGitCourse = false,
  onExecuteCommand,
  isNightMode = true,
  courseTitle = '',
}) => {
  const titleLower = courseTitle.toLowerCase();

  // Route to the course-specific terminal interactive panels
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

  // Default fallback is Ubuntu Linux Lab Bash Terminal
  return (
    <LinuxLabWorkspace
      initialCommands={initialCommands}
      isGitCourse={false}
      onExecuteCommand={onExecuteCommand}
      isNightMode={isNightMode}
    />
  );
};
