import React from 'react';
import { LinuxLabWorkspace } from './terminal/LinuxLabWorkspace';

interface TerminalProps {
  initialCommands?: Array<{ command: string; description: string }>;
  isGitCourse?: boolean;
  onExecuteCommand?: (cmd: string) => void;
  isNightMode?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
  initialCommands,
  isGitCourse = false,
  onExecuteCommand,
  isNightMode = true,
}) => {
  return (
    <LinuxLabWorkspace
      initialCommands={initialCommands}
      isGitCourse={isGitCourse}
      onExecuteCommand={onExecuteCommand}
      isNightMode={isNightMode}
    />
  );
};
