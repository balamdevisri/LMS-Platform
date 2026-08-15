import React from 'react';
import { CodeBlock } from './CodeBlock';
import { Sparkles, CheckCircle2, FileText, Terminal } from 'lucide-react';

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

  const isReactCourse = (courseId || '').toLowerCase().includes('react');
  const isJava = (courseId || '').toLowerCase().includes('java');
  const isC = (courseId || '').toLowerCase().includes('c-programming');

  if (
    courseId === 'python-through-oops-course-id' ||
    courseId === 'kubernetes-complete-course-beginner-to-advanced' ||
    courseId === 'git-github-mastery-course-id' ||
    courseId === 'git-github-mastery' ||
    isReactCourse
  ) {
    return <LmsCourseRenderer content={content} isNightMode={isNightMode} courseId={courseId} />;
  }

  // IMPORTANT:
  // Java and C content must preserve the original line structure.
  // The generic newline cleaner merges lines and breaks headings,
  // naming conventions, flowcharts and interview-question formatting.
  let lines = (isJava || isC)
    ? content.split('\n')
    : cleanMarkdownNewlines(content).split('\n');

  if (isJava) {
    // Pass 1: Merge split question lines (e.g., questions with multiple parts/lines before Answer:)
    let mergedLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (/^\s*(?:Q\d+\.?\s+|\d+\.\s+)/i.test(trimmed)) {
        let answerIndex = -1;
        for (let look = i + 1; look <= Math.min(i + 3, lines.length - 1); look++) {
          if (lines[look].trim().toLowerCase().startsWith('answer')) {
            answerIndex = look;
            break;
          }
        }
        if (answerIndex !== -1) {
          const questionParts: string[] = [];
          for (let q = i; q < answerIndex; q++) {
            questionParts.push(lines[q].trim());
          }
          mergedLines.push(questionParts.join(' '));
          i = answerIndex - 1;
          continue;
        }
      }
      mergedLines.push(line);
    }
    lines = mergedLines;

    // Pass 2: Split inline bullet sequences with ❌ or ●
    let splitBulletLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('❌')) {
        const startsWithCross = trimmed.startsWith('❌');
        const parts = trimmed.split('❌').map(p => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          parts.forEach((part, index) => {
            if (index === 0 && !startsWithCross) {
              splitBulletLines.push(part);
            } else {
              splitBulletLines.push(`❌ ${part}`);
            }
          });
          continue;
        }
      }
      if (trimmed.includes('●')) {
        const startsWithBullet = trimmed.startsWith('●');
        const parts = trimmed.split('●').map(p => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          parts.forEach((part, index) => {
            if (index === 0 && !startsWithBullet) {
              splitBulletLines.push(part);
            } else {
              splitBulletLines.push(`● ${part}`);
            }
          });
          continue;
        }
      }
      splitBulletLines.push(line);
    }
    lines = splitBulletLines;

    // Pass 3: Convert numbered sequences (e.g. 1. item1 2. item2 3. item3) into separate lines
    let splitNumLines: string[] = [];
    for (const line of lines) {
      if (/\s+\d+\.\s+/.test(line)) {
        const splitLines = line.replace(/\s+(\d+\.\s+)/g, '\n$1').split('\n');
        splitNumLines.push(...splitLines);
      } else {
        splitNumLines.push(line);
      }
    }
    lines = splitNumLines;

    // Pass 4: Split merged headings/sections for Module 1
    let splitHeadingsLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      const norm = trimmed.replace(/\s+/g, ' ');

      // Split interview question heading and first question
      if (norm.toLowerCase().includes('interview questions') && /\d+\.\s+/.test(norm)) {
        const match = norm.match(/^(.*Interview\s+Questions)(?:\s+)?(\d+\.\s+.*)$/i);
        if (match) {
          splitHeadingsLines.push(match[1].trim());
          splitHeadingsLines.push(match[2].trim());
          continue;
        }
      }

      if (norm.startsWith('1.3 History of Java')) {
        splitHeadingsLines.push('1.3 History of Java');
        splitHeadingsLines.push('Important points:');
      } else if (norm.startsWith('1.5 Platform Dependent vs Independent')) {
        splitHeadingsLines.push('1.5 Platform Dependent vs Independent');
        const rest = norm.replace('1.5 Platform Dependent vs Independent', '').trim();
        if (rest.startsWith('C example')) {
          splitHeadingsLines.push('C example');
          splitHeadingsLines.push(rest.replace('C example', '').trim());
        } else {
          splitHeadingsLines.push(rest);
        }
      } else if (norm.startsWith('1.12 Compilation vs Execution')) {
        splitHeadingsLines.push('1.12 Compilation vs Execution');
        splitHeadingsLines.push(norm.replace('1.12 Compilation vs Execution', '').trim());
      } else if (norm.startsWith('1.14 Understanding the Program')) {
        splitHeadingsLines.push('1.14 Understanding the Program');
        splitHeadingsLines.push(norm.replace('1.14 Understanding the Program', '').trim());
      } else if (norm.startsWith('1.17 Java Syntax Rules')) {
        splitHeadingsLines.push('1.17 Java Syntax Rules');
        splitHeadingsLines.push(norm.replace('1.17 Java Syntax Rules', '').trim());
      } else if (norm.startsWith('1.18 Java Identifiers')) {
        splitHeadingsLines.push('1.18 Java Identifiers');
        splitHeadingsLines.push(norm.replace('1.18 Java Identifiers', '').trim());
      } else if (norm.startsWith('1.19 Identifier Rules')) {
        splitHeadingsLines.push('1.19 Identifier Rules');
        splitHeadingsLines.push(norm.replace('1.19 Identifier Rules', '').trim());
      } else if (norm.startsWith('1.20 Java Keywords')) {
        splitHeadingsLines.push('1.20 Java Keywords');
        splitHeadingsLines.push('Keywords have special meaning in Java.');
        splitHeadingsLines.push('Examples:');
      } else if (norm.startsWith('1.21 Comments')) {
        splitHeadingsLines.push('1.21 Comments');
        splitHeadingsLines.push('Comments help explain code.');
      } else if (norm.startsWith('1.22 Java Naming Conventions')) {
        splitHeadingsLines.push('1.22 Java Naming Conventions');
      } else if (norm.includes('Class') && norm.includes('PascalCase') && norm.includes('camelCase')) {
        splitHeadingsLines.push('Class → PascalCase');
        splitHeadingsLines.push('StudentBankAccount → PascalCase');
        splitHeadingsLines.push('EmployeeDetails → camelCase');
        splitHeadingsLines.push('studentName → camelCase');
        splitHeadingsLines.push('totalMarks → camelCase');
        splitHeadingsLines.push('accountBalance → camelCase');
        splitHeadingsLines.push('calculateTotal() → camelCase');
        splitHeadingsLines.push('displayDetails() → camelCase');
        splitHeadingsLines.push('findMaximum() → camelCase');
      } else if (norm.includes('Constant') && norm.includes('UPPER_SNAKE_CASE')) {
        splitHeadingsLines.push('Constant → UPPER_SNAKE_CASE');
        splitHeadingsLines.push('MAX_SIZE');
        splitHeadingsLines.push('PI_VALUE');
      } else if (norm.startsWith('1.23 Java')) {
        splitHeadingsLines.push('1.23 Java Flowchart');

        const rest = norm.replace(/^1\.23 Java(?: Flowchart)?/i, '').trim();

        if (rest) {
          splitHeadingsLines.push(rest);
        }
      } else if (norm.startsWith('1.26 Important Terms')) {
        splitHeadingsLines.push('1.26 Important Terms');
      } else if (norm.toLowerCase().startsWith('term meaning java')) {
        // Skip the duplicated raw terms paragraph completely since it is handled by the heading block
        continue;
      } else {
        splitHeadingsLines.push(line);
      }
    }
    lines = splitHeadingsLines;
  }

  if (isC) {
    // Pass 1: Merge split module headings
    let mergedModuleLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('### Module 1:') && trimmed.endsWith('to C')) {
        const next = lines[i + 1] || '';
        if (next.trim().startsWith('Programming')) {
          mergedModuleLines.push('### Module 1: Introduction to C Programming');
          lines[i + 1] = next.trim().substring('Programming'.length).trim();
          continue;
        }
      }

      if (trimmed.startsWith('### Module 2:') && trimmed.endsWith('& Data')) {
        const next = lines[i + 1] || '';
        if (next.trim().startsWith('Types')) {
          mergedModuleLines.push('### Module 2: Variables, Constants & Data Types');
          lines[i + 1] = next.trim().substring('Types'.length).trim();
          continue;
        }
      }

      if (trimmed.startsWith('### Module 4:') && trimmed.endsWith('Output &')) {
        const next = lines[i + 1] || '';
        if (next.trim().startsWith('Decision-Making Statements')) {
          mergedModuleLines.push('### Module 4: Input, Output & Decision-Making Statements');
          lines[i + 1] = next.trim().substring('Decision-Making Statements'.length).trim();
          continue;
        }
      }

      if (trimmed.startsWith('### Module 10:') && trimmed.endsWith('Unions &')) {
        const next = lines[i + 1] || '';
        if (next.trim().startsWith('Enumerations')) {
          mergedModuleLines.push('### Module 10: Structures, Unions & Enumerations');
          lines[i + 1] = next.trim().substring('Enumerations'.length).trim();
          continue;
        }
      }

      if (trimmed.startsWith('### Module 13:') && trimmed.endsWith('Header Files &')) {
        const next = lines[i + 1] || '';
        if (next.trim().startsWith('Macros')) {
          mergedModuleLines.push('### Module 13: Preprocessor, Header Files & Macros');
          lines[i + 1] = next.trim().substring('Macros'.length).trim();
          continue;
        }
      }

      if (trimmed.startsWith('### Module 14:') && trimmed.endsWith('Storage Classes, Scope,')) {
        const next = lines[i + 1] || '';
        if (next.trim().startsWith('Lifetime & Linkage')) {
          mergedModuleLines.push('### Module 14: Storage Classes, Scope, Lifetime & Linkage');
          lines[i + 1] = next.trim().substring('Lifetime & Linkage'.length).trim();
          continue;
        }
      }

      if (trimmed.startsWith('### Module 15:') && trimmed.endsWith('Advanced C Concepts &')) {
        const next = lines[i + 1] || '';
        if (next.trim().startsWith('Final Revision')) {
          mergedModuleLines.push('### Module 15: Advanced C Concepts & Final Revision');
          lines[i + 1] = next.trim().substring('Final Revision'.length).trim();
          continue;
        }
      }

      mergedModuleLines.push(line);
    }
    lines = mergedModuleLines;

    // Pass 2: Normalize subheadings (convert "1.1 Learning Objectives" to "#### 1.1 Learning Objectives")
    let normalizedHeadingLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      const headingMatch = trimmed.match(/^(\d+\.\d+)\s+(.+)$/);
      if (headingMatch && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
        normalizedHeadingLines.push(`#### ${headingMatch[1]} ${headingMatch[2]}`);
      } else {
        normalizedHeadingLines.push(line);
      }
    }
    lines = normalizedHeadingLines;

    // Pass 3: Split inline markdown code blocks/fences onto new lines
    let splitFenceLines: string[] = [];
    for (const line of lines) {
      if (line.includes('```')) {
        const parts = line.split(/(```[a-zA-Z]*)/);
        parts.forEach(part => {
          if (part.trim() !== '') {
            splitFenceLines.push(part);
          }
        });
      } else {
        splitFenceLines.push(line);
      }
    }
    lines = splitFenceLines;

    // Pass 4: Split conjoined bullet points (multiple ● or ○ on a single line)
    let splitBulletLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if ((trimmed.includes('●') || trimmed.includes('○')) && !trimmed.startsWith('`')) {
        const parts = trimmed.split(/[●○]/);
        parts.forEach(part => {
          const cleanedPart = part.trim();
          if (cleanedPart) {
            splitBulletLines.push(`- ${cleanedPart}`);
          }
        });
      } else {
        splitBulletLines.push(line);
      }
    }
    lines = splitBulletLines;

    // Pass 5: Merge vertical flowcharts
    let mergedFlowchartLines: string[] = [];
    let flowchartBuffer: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const isArrow = trimmed === '↓';
      const nextIsArrow = (lines[i + 1] || '').trim() === '↓';
      const prevWasArrow = flowchartBuffer.length > 0 && flowchartBuffer[flowchartBuffer.length - 1] === '↓';

      if (isArrow || nextIsArrow || prevWasArrow) {
        if (trimmed) {
          flowchartBuffer.push(trimmed);
        }
      } else {
        if (flowchartBuffer.length > 0) {
          const steps: string[] = [];
          flowchartBuffer.forEach(item => {
            if (item === '↓') {
              if (steps.length > 0 && steps[steps.length - 1] !== '↓') {
                steps.push('↓');
              }
            } else {
              steps.push(item);
            }
          });
          if (steps[steps.length - 1] === '↓') {
            steps.pop();
          }
          if (steps.length > 0) {
            mergedFlowchartLines.push(steps.join(' ↓ '));
          }
          flowchartBuffer = [];
        }
        mergedFlowchartLines.push(line);
      }
    }
    if (flowchartBuffer.length > 0) {
      const steps: string[] = [];
      flowchartBuffer.forEach(item => {
        if (item === '↓') {
          if (steps.length > 0 && steps[steps.length - 1] !== '↓') {
            steps.push('↓');
          }
        } else {
          steps.push(item);
        }
      });
      if (steps[steps.length - 1] === '↓') {
        steps.pop();
      }
      if (steps.length > 0) {
        mergedFlowchartLines.push(steps.join(' ↓ '));
      }
    }
    lines = mergedFlowchartLines;

    // Pass 6: Standardize Q&A interview questions
    let cleanedQALines: string[] = [];
    let inInterviewSection = false;
    for (const line of lines) {
      const trimmed = line.trim();
      const norm = trimmed.replace(/\s+/g, ' ');

      if (norm.toLowerCase().includes('interview questions') || norm.toLowerCase().includes('interview preparation')) {
        inInterviewSection = true;
      } else if (norm.startsWith('### ') || norm.startsWith('#### ')) {
        inInterviewSection = false;
      }

      if (inInterviewSection) {
        const qMatch = norm.match(/^(?:-\s+)?\**\s*Q?(?:-\s*)?\**\s*(\d+)\.?\s*(.*?)\**$/i) ||
                        norm.match(/^(?:-\s+)?\**\s*(\d+)\.\s*(.*?)\**$/i);
        
        if (qMatch && !norm.toLowerCase().startsWith('answer') && !norm.includes('http') && !norm.includes('[')) {
          const qNum = qMatch[1];
          const qText = qMatch[2].replace(/\*+$/, '').trim();
          cleanedQALines.push(`Q${qNum}. ${qText}`);
          continue;
        }

        if (norm.toLowerCase().includes('answer')) {
          const ansText = trimmed.replace(/^(?:-\s+)?\**\s*Answer\s*\**\s*:\s*/i, '').trim();
          cleanedQALines.push(`Answer: ${ansText}`);
          continue;
        }
      }

      cleanedQALines.push(line);
    }
    lines = cleanedQALines;
  }

  const elements: React.ReactNode[] = [];
  let inInterviewQuestions = false;
  let lastWasQuestion = false;

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
            language={codeLang || (isJava ? 'java' : (isC ? 'c' : 'bash'))}
          />
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
        codeLang = line.trim().replace('```', '') || (isJava ? 'java' : (isC ? 'c' : 'bash'));
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Java and C custom formatting blocks
    if (isJava || isC) {
      const trimmed = line.trim();

      // Answer line interception (follows a question line)
      if (inInterviewQuestions && lastWasQuestion && trimmed !== '') {
        lastWasQuestion = false;
        elements.push(
          <div key={`ans-${index}`} className={`pl-4 text-xs sm:text-sm leading-relaxed ${isNightMode ? 'text-slate-350' : 'text-slate-700'} space-y-2 mb-6`}>
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-2 text-sm">
              Answer:
            </div>
            <p className="my-1.5 font-normal leading-relaxed">
              {renderInlineStyles(trimmed, isNightMode)}
            </p>
          </div>
        );
        return;
      }

      // Heading hashtag cleaning
      if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
        const cleanHeading = trimmed.replace(/^#+\s*/, '').replace(/\s*#+$/, '').trim();
        elements.push(
          <h2
            key={index}
            className={`text-2xl sm:text-3xl font-heading font-extrabold mt-8 mb-4 border-b pb-3 flex items-center gap-2.5 ${isNightMode ? 'text-white border-slate-800' : 'text-slate-900 border-sky-100'
              }`}
          >
            <Sparkles className="w-6 h-6 text-cyan-455 shrink-0" />
            <span>{cleanHeading}</span>
          </h2>
        );
        return;
      }

      // Markdown Images: ![alt](url)
      const imgRegex = /!\[(.*?)\]\((.*?)\)/;
      const imgMatch = line.match(imgRegex);
      if (imgMatch) {
        const altText = imgMatch[1];
        const imgSrc = imgMatch[2];
        elements.push(
          <figure
            key={index}
            className={`my-6 rounded-3xl overflow-hidden p-3 shadow-xl backdrop-blur-xl border ${isNightMode
              ? 'bg-slate-900 border-slate-800 shadow-slate-950/50'
              : 'bg-white border-sky-100 shadow-sky-500/5'
              }`}
          >
            <div
              className={`rounded-2xl overflow-hidden flex items-center justify-center border ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-sky-100'
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
                className={`text-center text-xs font-mono font-semibold pt-3 pb-1 flex items-center justify-center gap-1.5 ${isNightMode ? 'text-cyan-300' : 'text-sky-700'
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

      // Flowcharts
      if (line.includes('↓')) {
        const steps = line.split('↓').map(s => s.trim()).filter(Boolean);
        elements.push(
          <div key={`flowchart-${index}`} className="flex flex-col items-center gap-2 my-6">
            {steps.map((step, sidx) => (
              <React.Fragment key={sidx}>
                <div className={`px-5 py-3 rounded-2xl border text-sm font-semibold font-mono tracking-wide ${isNightMode ? 'bg-slate-900 border-slate-800 text-cyan-300' : 'bg-sky-50 border-sky-100 text-sky-850'
                  } shadow-sm max-w-md text-center`}>
                  {step}
                </div>
                {sidx < steps.length - 1 && (
                  <div className={`text-xl ${isNightMode ? 'text-cyan-400' : 'text-sky-500'} font-bold`}>↓</div>
                )}
              </React.Fragment>
            ))}
          </div>
        );
        return;
      }

      // Common Mistakes
      if (trimmed.startsWith('❌')) {
        const cleanText = trimmed.replace(/^❌\s*/, '');
        elements.push(
          <div key={index} className="flex items-start gap-2.5 ml-3 my-2 text-sm sm:text-base leading-relaxed">
            <span className="shrink-0 mt-0.5 text-base">❌</span>
            <span className={isNightMode ? 'text-slate-200' : 'text-slate-700'}>
              {renderInlineStyles(cleanText, isNightMode)}
            </span>
          </div>
        );
        return;
      }

      // Interview Questions heading
      if (trimmed.toLowerCase().includes('interview questions')) {
        inInterviewQuestions = true;
        const cleanHeading = trimmed.replace(/^🎯\s*/, '').trim();
        elements.push(
          <h2
            key={index}
            className={`text-2xl sm:text-3xl font-heading font-extrabold mt-8 mb-4 border-b pb-3 flex items-center gap-2.5 ${isNightMode ? 'text-white border-slate-800' : 'text-slate-900 border-sky-100'
              }`}
          >
            <Sparkles className="w-6 h-6 text-cyan-450 shrink-0" />
            <span>{cleanHeading}</span>
          </h2>
        );
        return;
      }

      // Module headings
      if (trimmed.startsWith('Module ') && (trimmed.includes('—') || trimmed.includes(':') || trimmed.includes('-'))) {
        inInterviewQuestions = false;
        elements.push(
          <h2
            key={index}
            className={`text-2xl sm:text-3xl font-heading font-extrabold mt-8 mb-4 border-b pb-3 flex items-center gap-2.5 ${isNightMode ? 'text-white border-slate-800' : 'text-slate-900 border-sky-100'
              }`}
          >
            <Sparkles className="w-6 h-6 text-cyan-450 shrink-0" />
            <span>{trimmed}</span>
          </h2>
        );
        return;
      }

      // Subheadings (e.g. 1.1)
      const isSub = /^\s*\d+\.\d+\s+/.test(trimmed);
      if (isSub) {
        inInterviewQuestions = false;

        if (trimmed.startsWith('1.26 Important Terms')) {
          elements.push(
            <h3
              key={index}
              className={`text-lg sm:text-xl font-heading font-bold mt-6 mb-3 flex items-center gap-2 ${isNightMode ? 'text-cyan-300' : 'text-sky-850'
                }`}
            >
              <Terminal className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>1.26 Important Terms</span>
            </h3>
          );

          const terms = [
            { term: 'Java', meaning: 'Programming language' },
            { term: 'JVM', meaning: 'Executes Java bytecode' },
            { term: 'JRE', meaning: 'Runtime environment' },
            { term: 'JDK', meaning: 'Development kit' },
            { term: 'Bytecode', meaning: 'Compiled Java code' },
            { term: 'javac', meaning: 'Java compiler command' },
            { term: 'java', meaning: 'Command used to launch a Java application' },
            { term: 'Class', meaning: 'Blueprint/type' },
            { term: 'Object', meaning: 'Instance of a class' },
            { term: 'Method', meaning: 'Block of executable behavior' },
          ];

          terms.forEach((t, tidx) => {
            elements.push(
              <li
                key={`term-${index}-${tidx}`}
                className={`ml-6 my-2 text-sm sm:text-base flex items-start gap-2 leading-relaxed ${isNightMode ? 'text-slate-200' : 'text-slate-700'
                  }`}
              >
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-1 ${isNightMode ? 'text-cyan-400' : 'text-sky-500'}`} />
                <span>
                  <strong className="font-semibold text-slate-800 dark:text-slate-250 mr-1.5">{t.term}</strong>
                  <span className="mx-1.5 text-slate-400">—</span>
                  {renderInlineStyles(t.meaning, isNightMode)}
                </span>
              </li>
            );
          });
          return;
        }

        elements.push(
          <h3
            key={index}
            className={`text-lg sm:text-xl font-heading font-bold mt-6 mb-3 flex items-center gap-2 ${isNightMode ? 'text-cyan-300' : 'text-sky-850'
              }`}
          >
            <Terminal className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>{trimmed}</span>
          </h3>
        );
        return;
      }

      // Interview Questions (Stateful matching)
      const qMatch = inInterviewQuestions && (trimmed.match(/^\s*Q?(\d+)\.?\s+(.+)$/i) || trimmed.match(/^\s*(\d+)\.\s+([A-Z].*\?)\s*$/));
      if (qMatch) {
        lastWasQuestion = true;
        const qNum = qMatch[1];
        const qText = qMatch[2];
        elements.push(
          <h4 key={`q-${index}`} className={`text-base sm:text-lg font-heading font-bold px-4 py-2.5 rounded-xl border flex items-start gap-2.5 my-4 ${isNightMode
            ? 'bg-slate-900/80 border-slate-800 text-cyan-300 shadow-sm shadow-cyan-950/20'
            : 'bg-sky-50/50 border-sky-100/80 text-sky-900 shadow-sm shadow-sky-100/10'
            }`}>
            <span className="shrink-0 text-cyan-500">❓</span>
            <span>Q{qNum}. {qText}</span>
          </h4>
        );
        return;
      }

      // Interview Answers
      if (trimmed.toLowerCase().startsWith('answer:')) {
        const ansText = trimmed.slice(7).trim();
        elements.push(
          <div key={`ans-${index}`} className={`pl-4 text-xs sm:text-sm leading-relaxed ${isNightMode ? 'text-slate-350' : 'text-slate-700'} space-y-2`}>
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-2 text-sm">
              Answer:
            </div>
            {ansText && (
              <p className="my-1.5 font-normal leading-relaxed">
                {renderInlineStyles(ansText, isNightMode)}
              </p>
            )}
          </div>
        );
        return;
      }

      // Bullets (● / •)
      if (trimmed.startsWith('●') || trimmed.startsWith('•')) {
        const cleanText = trimmed.replace(/^[●•]\s*/, '');
        elements.push(
          <li
            key={index}
            className={`ml-4 my-2 text-sm sm:text-base flex items-start gap-2 leading-relaxed ${isNightMode ? 'text-slate-200' : 'text-slate-700'
              }`}
          >
            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-1 ${isNightMode ? 'text-cyan-400' : 'text-sky-500'}`} />
            <span>{renderInlineStyles(cleanText, isNightMode)}</span>
          </li>
        );
        return;
      }
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
          className={`my-6 rounded-3xl overflow-hidden p-3 shadow-xl backdrop-blur-xl border ${isNightMode
            ? 'bg-slate-900 border-slate-800 shadow-slate-950/50'
            : 'bg-white border-sky-100 shadow-sky-500/5'
            }`}
        >
          <div
            className={`rounded-2xl overflow-hidden flex items-center justify-center border ${isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-sky-100'
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
              className={`text-center text-xs font-mono font-semibold pt-3 pb-1 flex items-center justify-center gap-1.5 ${isNightMode ? 'text-cyan-300' : 'text-sky-700'
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
          className={`text-xl sm:text-2xl font-heading font-extrabold mt-8 mb-3 flex items-center gap-2 border-b pb-2 ${isNightMode ? 'text-white border-slate-800' : 'text-slate-900 border-sky-100'
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
          className={`text-lg font-heading font-bold mt-6 mb-2 flex items-center gap-2 ${isNightMode ? 'text-cyan-300' : 'text-sky-700'
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
          className={`ml-4 my-2 text-sm sm:text-base flex items-start gap-2 leading-relaxed ${isNightMode ? 'text-slate-200' : 'text-slate-700'
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
        className={`text-sm sm:text-base leading-relaxed my-2 ${isNightMode ? 'text-slate-200' : 'text-slate-700'
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
          className={`px-2 py-0.5 rounded-md font-mono text-xs font-semibold border ${isNightMode
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
