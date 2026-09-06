import React, { useMemo, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, Lightbulb, Info } from 'lucide-react';

// Lazy-loaded practice simulators to code-split heavy dependencies (sql.js, mermaid, terminal emulators)
const SqlPlayground = lazy(() => import('./practice/SqlPlayground').then(m => ({ default: m.SqlPlayground || m.default })));
const LinuxTerminalSimulator = lazy(() => import('./practice/LinuxTerminalSimulator').then(m => ({ default: m.LinuxTerminalSimulator || m.default })));
const GitSandboxSimulator = lazy(() => import('./practice/GitSandboxSimulator').then(m => ({ default: m.GitSandboxSimulator || m.default })));
const CodeEditorRunner = lazy(() => import('./practice/CodeEditorRunner').then(m => ({ default: m.CodeEditorRunner || m.default })));
const WebReactPlayground = lazy(() => import('./practice/WebReactPlayground').then(m => ({ default: m.WebReactPlayground || m.default })));
const KubernetesSimulator = lazy(() => import('./practice/KubernetesSimulator').then(m => ({ default: m.KubernetesSimulator || m.default })));
const MermaidDiagram = lazy(() => import('./MermaidDiagram').then(m => ({ default: m.MermaidDiagram || m.default })));

const SimulatorFallback: React.FC<{ label?: string }> = ({ label = 'practice simulator' }) => (
  <div className="my-6 p-6 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-3 text-xs text-slate-400 font-mono">
    <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    <span>Loading {label}...</span>
  </div>
);

interface MarkdownContentProps {
  content: string;
  isNightMode?: boolean;
}

/** Copy-to-clipboard button for code blocks */
const CopyButton: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium
        bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white
        transition-all duration-150 cursor-pointer active:scale-95 backdrop-blur-sm border border-white/10"
      title="Copy code"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

/**
 * MarkdownContent — renders Markdown lesson content using react-markdown
 * with syntax-highlighted code blocks, callout boxes, and clean typography.
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, isNightMode = false }) => {
  const plugins = useMemo(() => [remarkGfm], []);
  const rehypePlugins = useMemo(() => [rehypeHighlight], []);

  const processedContent = useMemo(() => {
    if (!content) return '';
    let text = content
      .replace(/\r/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 1. Separate tasks so they don't merge into text
    text = text.replace(/(\S)\s+(Task\s+\d+\b)/gi, '$1\n\n$2');
    text = text.replace(/(\S)\s+(Scenario\s+\d+\b)/gi, '$1\n\n$2');
    text = text.replace(/(\S)\s+(Practical\s+Task\s+\d+\b)/gi, '$1\n\n$2');
    text = text.replace(/(\S)\s+(Lab\s+Task\s+\d+\b)/gi, '$1\n\n$2');
    text = text.replace(/(\S)\s+(Exercise\s+\d+\b)/gi, '$1\n\n$2');

    // 2. Separate Q&A if on the same line
    text = text.replace(/(\?|[a-zA-Z0-9])\s+(Answer\s*:)/gi, '$1\n\n**Answer:**');

    // 3. Normalize unicode bullets to markdown list items
    text = text.replace(/^[ \t]*[●•✔❌]\s*/gm, '- ');
    text = text.replace(/(\S)\s+([●•✔❌]\s*)/g, '$1\n- ');

    return text;
  }, [content]);

  return (
    <div className={`markdown-content prose-custom ${isNightMode ? 'dark-mode' : 'light-mode'}`}>
      <ReactMarkdown
        remarkPlugins={plugins}
        rehypePlugins={rehypePlugins}
        components={{
          // ── Headings ─────────────────────────────────────────────
          h1: ({ children }: any) => (
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-10 mb-4 leading-tight
              ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
              {children}
            </h1>
          ),
          h2: ({ children }: any) => (
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mt-8 mb-3 leading-snug
              ${isNightMode ? 'text-slate-100' : 'text-slate-800'}`}>
              {children}
            </h2>
          ),
          h3: ({ children }: any) => (
            <h3 className={`text-lg sm:text-xl font-semibold mt-6 mb-2 leading-snug
              ${isNightMode ? 'text-slate-200' : 'text-slate-700'}`}>
              {children}
            </h3>
          ),
          h4: ({ children }: any) => (
            <h4 className={`text-base font-semibold mt-5 mb-2
              ${isNightMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {children}
            </h4>
          ),

          // ── Paragraph ────────────────────────────────────────────
          p: ({ children }: any) => (
            <p className={`text-[1.0625rem] leading-[1.75] mb-5
              ${isNightMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {children}
            </p>
          ),

          // ── Strong / Em ──────────────────────────────────────────
          strong: ({ children }: any) => (
            <strong className={`font-bold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
              {children}
            </strong>
          ),
          em: ({ children }: any) => (
            <em className={`italic ${isNightMode ? 'text-slate-200' : 'text-slate-700'}`}>
              {children}
            </em>
          ),

          // ── Code blocks ──────────────────────────────────────────
          pre: ({ children }: any) => {
            // Extract the raw code text from children
            const codeElement = React.Children.toArray(children).find(
              (child: any) => child?.type === 'code' || child?.props?.className?.includes('hljs')
            ) as React.ReactElement<{ children?: any; className?: string }> | undefined;

            let rawCode = '';
            if (codeElement?.props?.children) {
              rawCode = typeof codeElement.props.children === 'string'
                ? codeElement.props.children
                : React.Children.toArray(codeElement.props.children)
                    .map((c: any) => (typeof c === 'string' ? c : c?.props?.children || ''))
                    .join('');
            }

            // Extract language from className
            const langClass = codeElement?.props?.className || '';
            const langMatch = langClass.match(/language-([\w-]+)/);
            const language = (langMatch ? langMatch[1] : 'code').toLowerCase();

            // ── Interactive Diagram & Flowcharts: Mermaid.js ─────────────
            if (language === 'mermaid' || language === 'flowchart' || language === 'sequence' || language === 'mindmap' || language === 'diagram') {
              return (
                <Suspense fallback={<SimulatorFallback label="interactive diagram" />}>
                  <MermaidDiagram
                    chart={rawCode}
                    isNightMode={isNightMode}
                  />
                </Suspense>
              );
            }

            // ── Interactive Practice: SQL Playground ──────────────────────
            if (language === 'practice-sql' || language === 'sql-playground' || language === 'practice-dbms') {
              let schema = '';
              let query = '';
              let customTitle = 'Interactive SQL Playground';
              let customDescription = 'Write and execute real SQL queries against the in-memory SQLite database.';

              const text = rawCode.trim();

              const titleMatch = text.match(/--\s*@title:\s*(.+)/i);
              if (titleMatch) customTitle = titleMatch[1].trim();

              const descMatch = text.match(/--\s*@desc(?:ription)?:\s*(.+)/i);
              if (descMatch) customDescription = descMatch[1].trim();

              if (text.includes('-- @schema') && text.includes('-- @query')) {
                const parts = text.split(/--\s*@query/i);
                schema = parts[0].replace(/--\s*@schema/i, '').trim();
                query = parts[1]?.trim() || '';
              } else if (text.includes('-- @schema')) {
                schema = text.replace(/--\s*@schema/i, '').trim();
              } else if (text.includes('-- @query')) {
                query = text.replace(/--\s*@query/i, '').trim();
              } else {
                if (/CREATE\s+TABLE/i.test(text)) {
                  schema = text;
                  const tableName = text.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i)?.[1];
                  query = tableName ? `SELECT * FROM ${tableName} LIMIT 10;` : '';
                } else {
                  query = text;
                }
              }

              return (
                <Suspense fallback={<SimulatorFallback label="SQL playground" />}>
                  <SqlPlayground
                    title={customTitle}
                    description={customDescription}
                    initialSchema={schema || undefined}
                    initialQuery={query || undefined}
                    isNightMode={isNightMode}
                  />
                </Suspense>
              );
            }

            // ── Interactive Practice: Linux Terminal Simulator ────────────
            if (language === 'practice-terminal' || language === 'practice-linux' || language === 'practice-bash') {
              const text = rawCode.trim();
              let scenario = '';
              const titleMatch = text.match(/#\s*@title:\s*(.+)/i);
              const title = titleMatch ? titleMatch[1].trim() : 'Linux Terminal Simulator';
              const scenarioMatch = text.match(/#\s*@scenario:\s*(.+)/i);
              if (scenarioMatch) scenario = scenarioMatch[1].trim();

              return (
                <Suspense fallback={<SimulatorFallback label="Linux terminal" />}>
                  <LinuxTerminalSimulator
                    title={title}
                    initialScenario={scenario || undefined}
                  />
                </Suspense>
              );
            }

            // ── Interactive Practice: Git Sandbox ─────────────────────────
            if (language === 'practice-git' || language === 'git-sandbox') {
              const text = rawCode.trim();
              const titleMatch = text.match(/#\s*@title:\s*(.+)/i);
              const title = titleMatch ? titleMatch[1].trim() : 'Interactive Git Sandbox';

              return (
                <Suspense fallback={<SimulatorFallback label="Git sandbox" />}>
                  <GitSandboxSimulator title={title} />
                </Suspense>
              );
            }

            // ── Interactive Practice: Code Editor & Compiler (C, Python, Java, DSA) ──
            if (
              language === 'practice-code' ||
              language === 'practice-c' ||
              language === 'practice-python' ||
              language === 'practice-java' ||
              language === 'practice-cpp' ||
              language === 'practice-dsa'
            ) {
              const text = rawCode.trim();
              const detectedLang: 'c' | 'python' | 'java' | 'cpp' | 'javascript' =
                language === 'practice-c' ? 'c' :
                language === 'practice-java' ? 'java' :
                language === 'practice-cpp' ? 'cpp' :
                'python';

              return (
                <Suspense fallback={<SimulatorFallback label="code editor" />}>
                  <CodeEditorRunner
                    language={detectedLang}
                    initialCode={text || undefined}
                  />
                </Suspense>
              );
            }

            // ── Interactive Practice: Web & React Live Playground ─────────
            if (language === 'practice-web' || language === 'practice-react' || language === 'web-playground') {
              return (
                <Suspense fallback={<SimulatorFallback label="React playground" />}>
                  <WebReactPlayground initialHtml={rawCode.trim() || undefined} />
                </Suspense>
              );
            }

            // ── Interactive Practice: Kubernetes Simulator ────────────────
            if (language === 'practice-k8s' || language === 'practice-kubernetes' || language === 'k8s-sim') {
              return (
                <Suspense fallback={<SimulatorFallback label="Kubernetes simulator" />}>
                  <KubernetesSimulator />
                </Suspense>
              );
            }

            return (
              <div className="my-6 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg relative group">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700/50">
                  <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
                    {language}
                  </span>
                </div>
                <CopyButton code={rawCode.trim()} />
                {/* Code body */}
                <pre className="p-4 overflow-x-auto bg-slate-900 text-sm leading-relaxed">
                  {children}
                </pre>
              </div>
            );
          },

          // ── Inline code ──────────────────────────────────────────
          code: ({ className, children, ...props }: any) => {
            // If it has a language class, it's inside a <pre> — render as-is
            if (className?.includes('language-') || className?.includes('hljs')) {
              return (
                <code className={`${className} font-mono text-[0.875rem]`} {...props}>
                  {children}
                </code>
              );
            }
            // Otherwise it's inline code
            return (
              <code
                className={`px-1.5 py-0.5 rounded-md font-mono text-[0.85rem] font-medium
                  ${isNightMode
                    ? 'bg-slate-800 text-amber-300 border border-slate-700'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                {...props}
              >
                {children}
              </code>
            );
          },

          // ── Blockquote (Tip / Note callouts) ─────────────────────
          blockquote: ({ children }: any) => {
            const childText = React.Children.toArray(children)
              .map((c: any) => {
                if (typeof c === 'string') return c;
                if (c?.props?.children) {
                  const nested = React.Children.toArray(c.props.children);
                  return nested.map((n: any) => {
                    if (typeof n === 'string') return n;
                    if (n?.props?.children && typeof n.props.children === 'string') return n.props.children;
                    return '';
                  }).join('');
                }
                return '';
              })
              .join('')
              .trim();

            const isTip = /^(\*\*)?tip(\*\*)?[:\s]/i.test(childText);
            const isNote = /^(\*\*)?note(\*\*)?[:\s]/i.test(childText);
            const isWarning = /^(\*\*)?warning(\*\*)?[:\s]/i.test(childText);
            const isImportant = /^(\*\*)?important(\*\*)?[:\s]/i.test(childText);

            if (isTip) {
              return (
                <div className={`my-6 p-4 rounded-xl border-l-4 flex gap-3
                  ${isNightMode
                    ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  }`}>
                  <Lightbulb className={`w-5 h-5 shrink-0 mt-0.5 ${isNightMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <div className="flex-1 text-[0.9375rem] leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
                    {children}
                  </div>
                </div>
              );
            }

            if (isNote || isImportant) {
              return (
                <div className={`my-6 p-4 rounded-xl border-l-4 flex gap-3
                  ${isNightMode
                    ? 'bg-blue-950/30 border-blue-500 text-blue-200'
                    : 'bg-blue-50 border-blue-500 text-blue-800'
                  }`}>
                  <Info className={`w-5 h-5 shrink-0 mt-0.5 ${isNightMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div className="flex-1 text-[0.9375rem] leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
                    {children}
                  </div>
                </div>
              );
            }

            if (isWarning) {
              return (
                <div className={`my-6 p-4 rounded-xl border-l-4 flex gap-3
                  ${isNightMode
                    ? 'bg-amber-950/30 border-amber-500 text-amber-200'
                    : 'bg-amber-50 border-amber-500 text-amber-800'
                  }`}>
                  <Info className={`w-5 h-5 shrink-0 mt-0.5 ${isNightMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  <div className="flex-1 text-[0.9375rem] leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
                    {children}
                  </div>
                </div>
              );
            }

            // Default blockquote
            return (
              <blockquote className={`my-6 pl-4 border-l-4 italic
                ${isNightMode
                  ? 'border-slate-600 text-slate-400'
                  : 'border-slate-300 text-slate-500'
                }`}>
                {children}
              </blockquote>
            );
          },

          // ── Lists ────────────────────────────────────────────────
          ul: ({ children }: any) => (
            <ul className={`list-disc pl-6 mb-5 space-y-1.5 text-[1.0625rem] leading-[1.75]
              ${isNightMode ? 'text-slate-300 marker:text-slate-500' : 'text-slate-600 marker:text-slate-400'}`}>
              {children}
            </ul>
          ),
          ol: ({ children }: any) => (
            <ol className={`list-decimal pl-6 mb-5 space-y-1.5 text-[1.0625rem] leading-[1.75]
              ${isNightMode ? 'text-slate-300 marker:text-slate-500' : 'text-slate-600 marker:text-slate-400'}`}>
              {children}
            </ol>
          ),
          li: ({ children }: any) => (
            <li className="pl-1">{children}</li>
          ),

          // ── Table ────────────────────────────────────────────────
          table: ({ children }: any) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className={`w-full text-sm ${isNightMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }: any) => (
            <thead className={`text-xs font-semibold uppercase tracking-wider
              ${isNightMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              {children}
            </thead>
          ),
          th: ({ children }: any) => (
            <th className="px-4 py-3 text-left font-semibold">{children}</th>
          ),
          td: ({ children }: any) => (
            <td className={`px-4 py-3 border-t ${isNightMode ? 'border-slate-700' : 'border-slate-200'}`}>
              {children}
            </td>
          ),

          // ── Horizontal rule ──────────────────────────────────────
          hr: () => (
            <hr className={`my-8 border-t ${isNightMode ? 'border-slate-800' : 'border-slate-200'}`} />
          ),

          // ── Links ────────────────────────────────────────────────
          a: ({ href, children }: any) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline underline-offset-2 decoration-1 transition-colors
                ${isNightMode
                  ? 'text-blue-400 hover:text-blue-300 decoration-blue-500/40'
                  : 'text-blue-600 hover:text-blue-700 decoration-blue-300'
                }`}
            >
              {children}
            </a>
          ),

          // ── Images ───────────────────────────────────────────────
          img: ({ src, alt }: any) => (
            <figure className="my-6">
              <img
                src={src}
                alt={alt || ''}
                className="rounded-xl max-w-full h-auto shadow-sm"
                loading="lazy"
              />
              {alt && (
                <figcaption className={`mt-2 text-center text-sm italic
                  ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
