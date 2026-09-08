import React from 'react';
import { MarkdownContent } from './MarkdownContent';

export interface MarkdownRendererProps {
  content: string;
  isNightMode?: boolean;
  courseId?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isNightMode = false }) => {
  if (!content) return null;
  return <MarkdownContent content={content} isNightMode={isNightMode} />;
};

