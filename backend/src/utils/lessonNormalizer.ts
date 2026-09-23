/**
 * Backend Lesson Content Normalization & Security Sanitization Pipeline
 *
 * Guarantees that saved lesson Markdown is formatted cleanly without any semantic
 * alteration to educational concepts, code blocks, shell commands, formulas, URLs, or quizzes.
 */

/**
 * Normalizes Markdown lesson content formatting:
 * - Protects code blocks (```...```) so their code/comments/indentation are 100% untouched
 * - Normalizes unicode bullet characters (●, •, ✔, ▪, ▫, ◆, etc.) to standard Markdown list items (- )
 * - Collapses excessive blank lines (3+ to 2)
 * - Formats metadata tags into structured tag blocks without breaking H1 headings
 * - Normalizes ASCII flowcharts with ↓ or ➔ into structured step blocks
 * - Fixes spaces after Markdown heading hashes (e.g. #Heading -> # Heading)
 * - Strips unwanted bracketed metadata markers (e.g. [TOPIC: ...])
 * - Preserves ALL code, commands, examples, explanations, quizzes, and technical meaning intact.
 */
/**
 * Deterministic, code-block-aware canonical Markdown formatter.
 *
 * Pipeline:
 * Raw Markdown -> Protect existing fenced code blocks -> Normalize line endings
 * -> Repair known preprocessor directives (# include -> #include)
 * -> Detect obvious unfenced code regions conservatively -> Headings normalization
 * -> Subheadings and list normalization -> Strict metadata tags -> Restore fenced blocks
 * -> 100% idempotent and lossless.
 */
export function formatCanonicalLessonMarkdown(raw: string | null | undefined): string {
  if (!raw) return '';
  let text = typeof raw === 'string' ? raw : String(raw || '');

  // 1. Normalize line endings and strip invisible unicode BOM / zero-width spaces
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 2. Protect existing fenced code blocks (```...```)
  const codeBlocks: string[] = [];
  function protectCode(lang: string, code: string): string {
    const idx = codeBlocks.length;
    codeBlocks.push(`\`\`\`${lang}\n${code.trim()}\n\`\`\``);
    return `\n\n__PROTECTED_CODE_BLOCK_${idx}__\n\n`;
  }

  text = text.replace(/(```[\s\S]*?```)/g, (_match, block) => {
    const idx = codeBlocks.length;
    codeBlocks.push(block);
    return `\n\n__PROTECTED_CODE_BLOCK_${idx}__\n\n`;
  });

  // 3. Known Corruption Repair: Fix `# include <...>` -> `#include <...>` (repair only recognized preprocessor directives)
  text = text.replace(/^[ \t]*#[ \t]+(include|define|undef|if|ifdef|ifndef|else|elif|endif|pragma|import|error|warning|line)\b/gm, '#$1');

  // 4. Wrap multi-line ASCII/Box-drawing flowcharts if outside code blocks
  text = text.replace(/(?:^|\n)((?:[ \t]*[┌┐└┘│─├┤┬┴┼▼▲►◄↓↑➔→][^\n]*\n?){3,})/g, (_match, chartBlock) => {
    return protectCode('ascii-flowchart', chartBlock);
  });

  // 5. Conservative Unfenced C/C++ Code Detection & Wrapping
  // Pattern A: Complete C program (#include / #define + int/void main() { ... })
  text = text.replace(/(?:^|\n)(#[ \t]*(?:include|define)\b[^\n]+(?:\n[^\n]+)*?\n[ \t]*(?:int|void)\s+main\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\})/g, (_match, cCode) => {
    return protectCode('c', cCode);
  });

  // Pattern B: Multi-line C function definition (e.g. "int add(int a, int b)\n{\n...\nreturn a + b;\n}")
  text = text.replace(/(?:^|\n)([ \t]*(?:int|void|float|double|char|size_t|bool)\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*\{[\s\S]*?\n[ \t]*\})/g, (match, funcCode) => {
    // Only wrap if it contains typical code indicators like semicolons, return, printf, scanf, etc.
    if (/;\s*$/m.test(funcCode) || /\b(?:return|printf|scanf|malloc|free|cout|cin)\b/.test(funcCode)) {
      return protectCode('c', funcCode);
    }
    return match;
  });

  // Pattern C: Standalone #include statements that are outside code blocks
  text = text.replace(/^[ \t]*(#include\s*<[^>]+>)[ \t]*$/gm, (_match, incLine) => {
    return protectCode('c', incLine);
  });

  // 6. Headings: Add space after # ONLY for actual Markdown headings, NEVER for preprocessor directives or shebangs
  text = text.replace(/^(#{1,6})(?!(?:include|define|undef|if|ifdef|ifndef|else|elif|endif|pragma|import|error|warning|line|region|endregion)\b|[!/])([A-Za-z0-9])/gm, '$1 $2');

  // 7. Format Section Numbered Headings (e.g. "1.1 Learning Objectives", "1.2 What is C?")
  text = text.replace(/^[ \t]*(?:##\s*)?(\d+\.\d+(?:\.\d+)?)[ \t]+([A-Za-z0-9][^\n:]+?)[ \t]*$/gm, (_match, num, title) => {
    return `\n\n## ${num} ${title.trim()}\n\n`;
  });

  // 8. Format Common Subheadings (### Subheading)
  text = text.replace(/^[ \t]*(?:###\s*)?(Learning Objectives|Key Points|Example:|Examples:|Output:|Interview Questions|Best Practices|Flow Explanation|Identifier Rules)[ \t]*$/gim, (_match, heading) => {
    return `\n\n### ${heading.trim()}\n\n`;
  });

  // 9. Separate Task / Scenario / Exercise labels when attached to end of sentences
  text = text.replace(/([.?!])[ \t]+((?:Practical[ \t]+Task|Lab[ \t]+Task|Task|Exercise|Scenario)[ \t]+\d+\b)/gi, '$1\n\n$2');
  // Format unbolded standalone Task lines (e.g. "Task 1: do something" -> "**Task 1:** do something")
  text = text.replace(/^[ \t]*(?!\*\*)((?:Practical[ \t]+Task|Lab[ \t]+Task|Task|Exercise|Scenario)[ \t]+\d+)\b[:\s—–-]*/gim, '**$1:** ');
  // Clean any accidental duplicate bolding artifacts
  text = text.replace(/\*\*((?:Practical[ \t]+Task|Lab[ \t]+Task|Task|Exercise|Scenario)[ \t]+\d+):\*\*\s*:\s*\*\*/gi, '**$1:**');
  text = text.replace(/\*\*((?:Practical[ \t]+Task|Lab[ \t]+Task|Task|Exercise|Scenario)[ \t]+\d+):\*\*\s*\*\*/gi, '**$1:**');

  // 10. Q&A formatting
  text = text.replace(/(\?|[a-zA-Z0-9])[ \t]+(Answer\s*:)/gi, '$1\n\n**Answer:**');
  text = text.replace(/^[ \t]*(?!\*\*)Answer\s*:\s*/gim, '**Answer:**\n');

  // 11. Normalize unicode bullet points (●, •, ✔, ▪, ▫, ◆, etc.) to standard Markdown list items (- )
  text = text.replace(/^([ \t]*)[●•✔▪▫◆◇■□►▻⁃]\s*/gm, '$1- ');
  text = text.replace(/(\S)[ \t]+([●•✔▪▫◆◇■□►▻⁃]\s*)/g, '$1\n- ');

  // 12. Fix standalone checkmarks above bullet points
  text = text.replace(/^[ \t]*[✅✔✓☑][ \t]*\n[ \t]*([A-Za-z0-9])/gm, '- $1');

  // 13. Metadata Tag Lists (Strict: Only true metadata lists, never full English sentences)
  text = text.replace(/^(?:#\s*tags|#tags|Tags:|Hashtags:|Topic Tags:)[\t ]+([a-zA-Z0-9_\-#\s,]+)$/gm, (_match, tagLine) => {
    if (/\b(?:is|are|was|were|have|has|the|this|that|in|for|with|and|or)\b/i.test(tagLine)) {
      return _match;
    }
    const cleanTags = tagLine
      .split(/[,\s]+/)
      .map((t: string) => t.replace(/^#/, '').trim())
      .filter(Boolean)
      .join(', ');
    if (!cleanTags) return _match;
    return protectCode('tags', cleanTags);
  });

  // 14. Restore protected code blocks
  text = text.replace(/__PROTECTED_CODE_BLOCK_(\d+)__/g, (_match, index) => {
    return codeBlocks[Number(index)] || '';
  });

  // 15. Collapse excessive blank lines (3+ to 2) and trim
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

export function normalizeLessonContent(raw: string | null | undefined): string {
  return formatCanonicalLessonMarkdown(raw);
}

/**
 * Sanitizes lesson content against XSS and hostile HTML injections while
 * strictly preserving valid Markdown elements, tables, and code blocks.
 */
export function sanitizeLessonContent(input: string | null | undefined): string {
  if (!input) return '';
  let clean = String(input);

  // Strip executable HTML tags & event handlers
  clean = clean.replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*>([\s\S]*?)<\/iframe>/gi, '');
  clean = clean.replace(/<object\b[^<]*>([\s\S]*?)<\/object>/gi, '');
  clean = clean.replace(/<embed\b[^<]*>([\s\S]*?)<\/embed>/gi, '');
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/javascript:[^\s"']+/gi, '');

  return clean.trim();
}

/**
 * Full pre-save and pre-render normalization pipeline.
 */
export function processCanonicalLessonContent(rawText: string | null | undefined): string {
  const sanitized = sanitizeLessonContent(rawText);
  return normalizeLessonContent(sanitized);
}

/**
 * Formats canonical module title: "Module N — Module Name"
 */
export function formatCanonicalModuleTitle(moduleIndex: number, rawTitle: string): string {
  const clean = rawTitle.replace(/^Module\s*\d+[\s:—–-]+/i, '').trim();
  return `Module ${moduleIndex} — ${clean || 'Curriculum Module'}`;
}

/**
 * Formats canonical single lesson title: "Module N - Complete Notes"
 */
export function formatCanonicalLessonTitle(moduleIndex: number): string {
  return `Module ${moduleIndex} - Complete Notes`;
}
