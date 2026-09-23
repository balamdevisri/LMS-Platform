import React, { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';
import { Loader2, AlertTriangle, Maximize2, Minimize2, Copy, Check, GitCommit, ArrowRight, ArrowDown, Code, GitBranch, Terminal } from 'lucide-react';

interface MermaidDiagramProps {
  chart: string;
  isNightMode?: boolean;
}

interface FlowStep {
  from: string;
  to: string;
  label?: string;
  isDecision?: boolean;
  fromType?: 'start' | 'process' | 'decision' | 'end';
  toType?: 'start' | 'process' | 'decision' | 'end';
}

/** Helper to clean up raw chart input and ensure valid diagram header & sanitized node labels */
function normalizeMermaidChart(input: string): string {
  if (!input) return '';
  let cleaned = input
    .replace(/^```(?:mermaid|flowchart|sequence|diagram)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();

  // Fix unquoted special characters in node labels like A[int(value)] -> A["int(value)"]
  cleaned = cleaned.replace(/\[([^[\]"']*\([^)]+\)[^[\]"']*)\]/g, '["$1"]');

  const hasDiagramHeader = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|quadrantChart|gitGraph|mindmap|timeline|zenuml|sankey|xychart|block-beta|packet-beta|architecture-beta)\b/i.test(cleaned);

  if (!hasDiagramHeader) {
    cleaned = `flowchart TD\n  ${cleaned}`;
  }

  return cleaned;
}

/** Robust fallback parser for flowchart steps and transitions if Mermaid engine throws syntax error */
function parseFlowSteps(raw: string): FlowStep[] {
  if (!raw) return [];
  const steps: FlowStep[] = [];
  const lines = raw.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%') || /^(flowchart|graph|subgraph|end)\b/i.test(trimmed)) {
      continue;
    }

    // Match Mermaid arrows: -->, ->, ==>, -.->, -- Label -->, -->|Label|
    const arrowRegex = /(.+?)\s*(?:-->\|([^|]+)\||--\s*([^-]+?)\s*-->|==>|-.->|-->|->)\s*(.+)/;
    const match = trimmed.match(arrowRegex);

    if (match) {
      const rawFrom = match[1].trim();
      const label = (match[2] || match[3] || '').trim() || undefined;
      const rawTo = match[4].trim();

      // Clean node labels (strip brackets, parentheses, quotes)
      const cleanNode = (n: string) => {
        let text = n
          .replace(/^[a-zA-Z0-9_-]+\[\s*["']?([\s\S]*?)["']?\s*\]$/, '$1')
          .replace(/^[a-zA-Z0-9_-]+\(\s*["']?([\s\S]*?)["']?\s*\)$/, '$1')
          .replace(/^[a-zA-Z0-9_-]+\{\s*["']?([\s\S]*?)["']?\s*\}$/, '$1')
          .replace(/^\[\s*["']?([\s\S]*?)["']?\s*\]$/, '$1')
          .replace(/^\(\s*["']?([\s\S]*?)["']?\s*\)$/, '$1')
          .replace(/^\{\s*["']?([\s\S]*?)["']?\s*\}$/, '$1')
          .replace(/^["'](.*)["']$/, '$1')
          .trim();
        return text || n.trim();
      };

      const from = cleanNode(rawFrom);
      const to = cleanNode(rawTo);
      const isDecision = /\{.*\}|\?$/.test(rawFrom) || /^(if|is|decision|check)\b/i.test(from);

      if (from && to) {
        steps.push({
          from,
          to,
          label,
          isDecision,
          fromType: /^(start|begin)\b/i.test(from) ? 'start' : (isDecision ? 'decision' : 'process'),
          toType: /^(end|finish|stop)\b/i.test(to) ? 'end' : 'process',
        });
      }
    }
  }

  // If no arrow lines found, check for sequential arrow steps: Step 1 \n ↓ \n Step 2
  if (steps.length === 0) {
    const arrowLines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const nodes: string[] = [];
    for (const l of arrowLines) {
      if (!/^[↓↑➔→▼▲|─┌┐└┘]+$/.test(l)) {
        nodes.push(l);
      }
    }
    for (let i = 0; i < nodes.length - 1; i++) {
      steps.push({
        from: nodes[i],
        to: nodes[i + 1],
        fromType: i === 0 ? 'start' : 'process',
        toType: i + 1 === nodes.length - 1 ? 'end' : 'process',
      });
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
          console.warn('[MermaidDiagram] Fallback activated for diagram syntax.');
          setError(err?.message || 'Diagram syntax normalized to structural view.');
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
        isNightMode ? 'bg-[#0A0E1A] border-slate-800 shadow-xl' : 'bg-sky-50/40 border-sky-200/80 shadow-sm'
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
          <span>Flowchart & Process Architecture</span>
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
              <span>{showRawCode ? 'View Flowchart' : 'View Code'}</span>
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
              <pre className="whitespace-pre-wrap leading-relaxed">{chart}</pre>
            </div>
          ) : (
            /* Structured visual fallback flowchart */
            <div className="w-full py-4 space-y-4">
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                {fallbackSteps.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div className={`px-4 py-2.5 rounded-xl border font-mono text-xs font-semibold shadow-xs text-center transition-colors ${
                      step.fromType === 'start'
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                        : step.isDecision
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-slate-900/80 border-slate-700/80 text-slate-200'
                    }`}>
                      {step.from}
                    </div>

                    <div className="flex flex-col items-center justify-center text-sky-400 gap-0.5 font-mono text-[11px]">
                      {step.label && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 text-sky-300 font-bold">
                          {step.label}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 hidden sm:block" />
                      <ArrowDown className="w-4 h-4 sm:hidden" />
                    </div>

                    {idx === fallbackSteps.length - 1 && (
                      <div className={`px-4 py-2.5 rounded-xl border font-mono text-xs font-bold shadow-xs text-center transition-colors ${
                        step.toType === 'end'
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900/80 border-slate-700/80 text-slate-200'
                      }`}>
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
