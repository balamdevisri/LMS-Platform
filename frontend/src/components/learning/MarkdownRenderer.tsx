import React from 'react';
import { CodeBlock } from './CodeBlock';
import { Sparkles, CheckCircle2, FileText } from 'lucide-react';

import { LmsCourseRenderer } from './LmsCourseRenderer';

interface MarkdownRendererProps {
  content: string;
  isNightMode?: boolean;
  courseId?: string;
}

function cleanMarkdownNewlines(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');
  const cleanedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed === '') {
      let prevNonEmpty = '';
      for (let j = cleanedLines.length - 1; j >= 0; j--) {
        if (cleanedLines[j].trim() !== '') {
          prevNonEmpty = cleanedLines[j].trim();
          break;
        }
      }
      
      let nextNonEmpty = '';
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() !== '') {
          nextNonEmpty = lines[j].trim();
          break;
        }
      }
      
      const isPrevSingleWord = prevNonEmpty && !prevNonEmpty.includes(' ') && !prevNonEmpty.startsWith('#') && !prevNonEmpty.startsWith('-');
      const isNextSingleWord = nextNonEmpty && !nextNonEmpty.includes(' ') && !nextNonEmpty.startsWith('#') && !nextNonEmpty.startsWith('-');
      
      if (isPrevSingleWord && isNextSingleWord) {
        continue;
      }
      cleanedLines.push(line);
    } else {
      cleanedLines.push(line);
    }
  }
  
  const result: string[] = [];
  let currentTextLine = '';
  let inCodeBlock = false;
  
  cleanedLines.forEach((line) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('```')) {
      if (currentTextLine) {
        result.push(currentTextLine);
        currentTextLine = '';
      }
      result.push(line);
      inCodeBlock = !inCodeBlock;
      return;
    }
    
    if (inCodeBlock) {
      if (currentTextLine) {
        result.push(currentTextLine);
        currentTextLine = '';
      }
      result.push(line);
      return;
    }

    if (trimmed === '') {
      if (currentTextLine) {
        result.push(currentTextLine);
        currentTextLine = '';
      }
      result.push('');
      return;
    }
    
    const isStructural = 
      trimmed.startsWith('#') ||
      trimmed.startsWith('- ') ||
      trimmed.startsWith('* ') ||
      trimmed.startsWith('> ') ||
      trimmed.startsWith('![') ||
      trimmed.includes('|') ||
      /^\d+\.\s/.test(trimmed) ||
      /[│┌└─↓├┤┬┴┼]/.test(trimmed);
      
    if (isStructural) {
      if (currentTextLine) {
        result.push(currentTextLine);
        currentTextLine = '';
      }
      result.push(line);
    } else {
      if (currentTextLine) {
        currentTextLine += ' ' + trimmed;
      } else {
        currentTextLine = line;
      }
    }
  });
  
  if (currentTextLine) {
    result.push(currentTextLine);
  }
  
  return result.join('\n');
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isNightMode = false, courseId }) => {
  if (!content) return null;

  if (courseId === 'python-through-oops-course-id' || courseId === 'kubernetes-complete-course-beginner-to-advanced') {
    return <LmsCourseRenderer content={content} isNightMode={isNightMode} courseId={courseId} />;
  }

  // Split lines to parse markdown blocks after cleaning newlines
  const lines = cleanMarkdownNewlines(content).split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = 'bash';

  let inTable = false;
  let tableBuffer: string[] = [];

  lines.forEach((line, index) => {
    // Check code block fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <CodeBlock
            key={`code-${index}`}
            code={codeBuffer.join('\n')}
            language={codeLang || 'bash'}
          />
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
        codeLang = line.trim().replace('```', '') || 'bash';
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Markdown Table rows
    if (line.trim().startsWith('|')) {
      inTable = true;
      tableBuffer.push(line.trim());
      return;
    }
    
    // If we were in a table and this line is NOT a table row, render the table
    if (inTable) {
      elements.push(renderTable(tableBuffer, index, isNightMode));
      tableBuffer = [];
      inTable = false;
    }

    // Markdown Images: ![alt](url)
    const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const altText = imgMatch[1];
      const imgSrc = imgMatch[2];
      elements.push(
        <figure
          key={index}
          className={`my-6 rounded-3xl overflow-hidden p-3 shadow-xl backdrop-blur-xl border ${
            isNightMode
              ? 'bg-slate-900 border-slate-800 shadow-slate-950/50'
              : 'bg-white border-sky-100 shadow-sky-500/5'
          }`}
        >
          <div
            className={`rounded-2xl overflow-hidden flex items-center justify-center border ${
              isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-sky-100'
            }`}
          >
            <img
              src={imgSrc}
              alt={altText}
              className="w-full h-auto object-contain hover:scale-[1.01] transition-transform duration-300 max-h-125"
            />
          </div>
          {altText && (
            <figcaption
              className={`text-center text-xs font-mono font-semibold pt-3 pb-1 flex items-center justify-center gap-1.5 ${
                isNightMode ? 'text-cyan-300' : 'text-sky-700'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isNightMode ? 'text-cyan-400' : 'text-sky-500'}`} />
              <span>{altText}</span>
            </figcaption>
          )}
        </figure>
      );
      return;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={index}
          className={`text-xl sm:text-2xl font-heading font-extrabold mt-8 mb-3 flex items-center gap-2 border-b pb-2 ${
            isNightMode ? 'text-white border-slate-800' : 'text-slate-900 border-sky-100'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${isNightMode ? 'text-cyan-400' : 'text-sky-500'}`} />
          {line.replace('### ', '')}
        </h3>
      );
      return;
    }

    if (line.startsWith('#### ')) {
      elements.push(
        <h4
          key={index}
          className={`text-lg font-heading font-bold mt-6 mb-2 flex items-center gap-2 ${
            isNightMode ? 'text-cyan-300' : 'text-sky-700'
          }`}
        >
          <FileText className={`w-4 h-4 ${isNightMode ? 'text-cyan-400' : 'text-sky-500'}`} />
          {line.replace('#### ', '')}
        </h4>
      );
      return;
    }

    // Callouts / Alerts - rendered cleanly without symbol alert bars
    if (line.startsWith('> [!NOTE]') || line.startsWith('> [!TIP]')) {
      const cleanText = line.replace(/^>\s*\[!(NOTE|TIP)\]\s*/, '');
      if (cleanText.trim()) {
        elements.push(
          <p key={index} className={`my-3 text-sm leading-relaxed font-medium ${isNightMode ? 'text-cyan-200' : 'text-slate-700'}`}>
            {cleanText}
          </p>
        );
      }
      return;
    }

    if (line.startsWith('> [!WARNING]') || line.startsWith('> [!IMPORTANT]')) {
      const cleanText = line.replace(/^>\s*\[!(WARNING|IMPORTANT)\]\s*/, '');
      if (cleanText.trim()) {
        elements.push(
          <p key={index} className={`my-3 text-sm leading-relaxed font-medium ${isNightMode ? 'text-amber-200' : 'text-slate-700'}`}>
            {cleanText}
          </p>
        );
      }
      return;
    }

    // Bullet points
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const text = line.replace(/^[-*]\s*/, '');
      elements.push(
        <li
          key={index}
          className={`ml-4 my-2 text-sm sm:text-base flex items-start gap-2 leading-relaxed ${
            isNightMode ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-1 ${isNightMode ? 'text-cyan-400' : 'text-sky-500'}`} />
          <span>{renderInlineStyles(text, isNightMode)}</span>
        </li>
      );
      return;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={index} className="h-3" />);
      return;
    }

    // Normal paragraph
    elements.push(
      <p
        key={index}
        className={`text-sm sm:text-base leading-relaxed my-2 ${
          isNightMode ? 'text-slate-200' : 'text-slate-700'
        }`}
      >
        {renderInlineStyles(line, isNightMode)}
      </p>
    );
  });

  if (inTable) {
    elements.push(renderTable(tableBuffer, lines.length, isNightMode));
  }

  return (
    <div className={`markdown-content ${isNightMode ? 'text-slate-100' : 'text-slate-800'}`}>
      {elements}
    </div>
  );
};

// Helper for bold, italic and inline code formatting with Night Mode contrast
function renderInlineStyles(text: string, isNightMode: boolean = false): React.ReactNode {
  if (!text) return null;
  // Preserve escaped asterisks
  const clean = text.replace(/\\[*]/g, '\u0000AST\u0000');
  const parts = clean.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, i) => {
    let unescaped = part.replace(/\u0000AST\u0000/g, '*');
    if (unescaped.startsWith('`') && unescaped.endsWith('`') && unescaped.length >= 2) {
      return (
        <code
          key={i}
          className={`px-2 py-0.5 rounded-md font-mono text-xs font-semibold border ${
            isNightMode
              ? 'bg-slate-900 text-cyan-300 border-slate-800'
              : 'bg-sky-50 text-sky-700 border-sky-200'
          }`}
        >
          {unescaped.slice(1, -1)}
        </code>
      );
    }
    if (unescaped.startsWith('**') && unescaped.endsWith('**') && unescaped.length >= 4) {
      return (
        <strong
          key={i}
          className={`font-bold ${isNightMode ? 'text-white' : 'text-slate-900'}`}
        >
          {unescaped.slice(2, -2)}
        </strong>
      );
    }
    if (unescaped.startsWith('*') && unescaped.endsWith('*') && unescaped.length >= 2) {
      return (
        <em
          key={i}
          className={`italic ${isNightMode ? 'text-cyan-200' : 'text-slate-800'}`}
        >
          {unescaped.slice(1, -1)}
        </em>
      );
    }
    // Clean any remaining stray asterisks from plain text
    return unescaped.replace(/\*/g, '');
  });
}

// Helper to render standard Markdown tables
function renderTable(rows: string[], keyPrefix: number, isNightMode: boolean): React.ReactNode {
  // Parse cell content by splitting on | and trimming spaces
  const parseRow = (row: string) => 
    row.split('|')
       .map(cell => cell.trim())
       .filter((_, i, arr) => i > 0 && i < arr.length - 1);

  if (rows.length < 2) return null;

  const headers = parseRow(rows[0]);
  const dataRows = rows.slice(2).map(parseRow);

  return (
    <div key={`table-${keyPrefix}`} className={`my-6 overflow-x-auto rounded-2xl border shadow-sm ${isNightMode ? 'border-slate-800' : 'border-sky-100'}`}>
      <table className="w-full text-sm sm:text-base text-left border-collapse">
        <thead className={`${isNightMode ? 'bg-slate-800/50 text-slate-200' : 'bg-slate-50/80 text-slate-700'}`}>
          <tr>
            {headers.map((header, i) => (
              <th key={i} className={`px-4 py-3 font-semibold border-b ${isNightMode ? 'border-slate-700' : 'border-sky-100'}`}>
                {renderInlineStyles(header, isNightMode)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${isNightMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
          {dataRows.map((row, i) => (
            <tr key={i} className={`transition-colors ${isNightMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${isNightMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {renderInlineStyles(cell, isNightMode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
