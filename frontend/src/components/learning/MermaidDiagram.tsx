import React, { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';
import { Loader2, AlertTriangle, Maximize2, Minimize2, Copy, Check, GitCommit, ArrowRight, Code } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
  isNightMode?: boolean;
}

/** Helper to clean up raw chart input and ensure valid diagram header */
function normalizeMermaidChart(input: string): string {
  if (!input) return '';
  let cleaned = input
    .replace(/^```(?:mermaid|flowchart|sequence|diagram)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .trim();

  const hasDiagramHeader = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|quadrantChart|gitGraph|mindmap|timeline|zenuml|sankey|xychart|block-beta|packet-beta|architecture-beta)\b/i.test(cleaned);

  if (!hasDiagramHeader) {
    cleaned = `flowchart TD\n  ${cleaned}`;
  }

  return cleaned;
}

/** Simple fallback parser for flowchart steps if Mermaid engine throws syntax error */
function parseFlowSteps(raw: string): Array<{ from: string; to: string; label?: string }> {
  const steps: Array<{ from: string; to: string; label?: string }> = [];
  const lines = raw.split('\n');

  for (const line of lines) {
    const match = line.match(/(.+?)\s*(?:-->|->|--\s*(.+?)\s*-->)\s*(.+)/);
    if (match) {
      const from = match[1].replace(/[[({](\s*|\w|\W)*?[\])}]/g, (m) => m.slice(1, -1)).trim();
      const label = match[2]?.trim();
      const to = match[3].replace(/[[({](\s*|\w|\W)*?[\])}]/g, (m) => m.slice(1, -1)).trim();
      if (from && to) {
        steps.push({ from, to, label });
      }
    }
  }

  return steps;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, isNightMode = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showRawCode, setShowRawCode] = useState<boolean>(false);
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '_');

  const normalizedChart = React.useMemo(() => normalizeMermaidChart(chart), [chart]);
  const fallbackSteps = React.useMemo(() => (error ? parseFlowSteps(chart) : []), [error, chart]);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!normalizedChart || !normalizedChart.trim()) {
        setSvgContent('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: isNightMode ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'Sora, Inter, system-ui, sans-serif',
          themeVariables: {
            darkMode: isNightMode,
            primaryColor: isNightMode ? '#38BDF8' : '#0284C7',
            primaryTextColor: isNightMode ? '#F8FAFC' : '#0F172A',
            primaryBorderColor: isNightMode ? '#0284C7' : '#38BDF8',
            lineColor: isNightMode ? '#94A3B8' : '#64748B',
            secondaryColor: isNightMode ? '#1E293B' : '#F0F9FF',
            tertiaryColor: isNightMode ? '#0F172A' : '#FFFFFF',
            mainBkg: isNightMode ? '#0A0E1A' : '#F8FAFC',
            nodeBorder: isNightMode ? '#38BDF8' : '#0284C7',
          },
        });

        const id = `mermaid_${uniqueId}_${Date.now()}`;
        const { svg } = await mermaid.render(id, normalizedChart);

        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[MermaidDiagram] Render warning, activating fallback:', err?.message);
          setError(err?.message || 'Invalid diagram syntax.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [normalizedChart, isNightMode, uniqueId]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`my-6 rounded-2xl border transition-all overflow-hidden ${
        isNightMode ? 'bg-[#0A0E1A] border-slate-800' : 'bg-sky-50/40 border-sky-200/80 shadow-xs'
      } ${
        isExpanded
          ? 'fixed inset-4 z-50 p-6 flex flex-col justify-center items-center backdrop-blur-xl bg-slate-950/95 shadow-2xl overflow-auto'
          : 'p-4 sm:p-5'
      }`}
    >
      {/* Top Diagram Action Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-500 w-full">
        <span className="font-bold flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          Flowchart & Architecture Diagram
        </span>

        <div className="flex items-center gap-1">
          {error && (
            <button
              type="button"
              onClick={() => setShowRawCode((prev) => !prev)}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
              title="Toggle Code"
            >
              <Code className="w-3 h-3" />
              <span>{showRawCode ? 'View Diagram' : 'View Code'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            title="Copy Diagram Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            title={isExpanded ? 'Minimize' : 'Expand Fullscreen'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Render Area */}
      <div className="w-full flex items-center justify-center min-h-[120px] pt-4 overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
            <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
            <span>Rendering flow diagram...</span>
          </div>
        ) : error ? (
          showRawCode || fallbackSteps.length === 0 ? (
            <div className="w-full p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="flex items-center gap-2 text-sky-400 font-bold mb-2">
                <GitCommit className="w-4 h-4" />
                <span>Diagram Specification:</span>
              </div>
              <pre className="whitespace-pre-wrap">{chart}</pre>
            </div>
          ) : (
            /* Structured visual fallback flowchart */
            <div className="w-full py-4 space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {fallbackSteps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-900/60 shadow-xs text-center font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {step.from}
                    </div>
                    <div className="flex items-center text-sky-500 gap-1 text-[11px] font-mono">
                      {step.label && <span className="text-[10px] text-slate-400">{step.label}</span>}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    {idx === fallbackSteps.length - 1 && (
                      <div className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-900/60 shadow-xs text-center font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {step.to}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )
        ) : (
          <div
            ref={containerRef}
            className="mermaid-svg-container w-full flex justify-center py-2 [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
};

export default MermaidDiagram;

