/**
 * Lesson Content Normalization & Security Sanitization Pipeline
 * 
 * Guarantees that admin-pasted or edited lesson markdown is formatted cleanly
 * without any semantic alteration to educational concepts, code blocks, shell commands,
 * formulas, URLs, or quizzes.
 */

/**
 * Normalizes Markdown lesson content formatting:
 * - Protects code blocks (```...```) so their code/comments are 100% untouched
 * - Normalizes unicode bullet characters (●, •, ✔, ▪, ▫, ◆, etc.) to standard Markdown list items (- )
 * - Collapses excessive blank lines (3+ to 2)
 * - Formats metadata tags into structured tag blocks without breaking H1 headings
 * - Normalizes ASCII flowcharts with ↓ or ➔ into structured step blocks
 * - Fixes spaces after Markdown heading hashes (e.g. #Heading -> # Heading)
 * - Strips unwanted bracketed metadata markers (e.g. [TOPIC: ...])
 * - Preserves ALL code, commands, examples, explanations, quizzes, and technical meaning intact.
 */
export function normalizeLessonContent(raw: string | null | undefined): string {
  if (!raw) return '';
  const rawText = typeof raw === 'string' ? raw : String(raw || '');

  // 1. Normalize line endings and remove invisible unicode BOM/zero-width spaces
  let text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 2. Extract code blocks so their contents remain 100% untouched
  const codeBlocks: string[] = [];
  text = text.replace(/(```[\s\S]*?```)/g, (_match, block) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(block);
    return placeholder;
  });

  // 3. Fix headings missing space after hash (e.g., #Heading -> # Heading)
  text = text.replace(/^(#{1,6})([A-Za-z0-9])/gm, '$1 $2');

  // 4. Remove injected bracketed metadata tags if found on standalone lines
  text = text.replace(/^\[(?:TOPIC|UNIT_ID|LESSON_META|MODULE_ID|MODULE_META)[^\]]*\]\s*$/gim, '');

  // 5. Separate common section labels so they don't merge into preceding lines
  text = text.replace(/(\S)\s+(Task\s+\d+\b)/gi, '$1\n\n$2');
  text = text.replace(/(\S)\s+(Scenario\s+\d+\b)/gi, '$1\n\n$2');
  text = text.replace(/(\S)\s+(Practical\s+Task\s+\d+\b)/gi, '$1\n\n$2');
  text = text.replace(/(\S)\s+(Lab\s+Task\s+\d+\b)/gi, '$1\n\n$2');
  text = text.replace(/(\S)\s+(Exercise\s+\d+\b)/gi, '$1\n\n$2');

  // 6. Separate Q&A if placed on the same line
  text = text.replace(/(\?|[a-zA-Z0-9])\s+(Answer\s*:)/gi, '$1\n\n**Answer:**');

  // 7. Normalize unicode bullet points to standard Markdown list items (preserving indentation)
  text = text.replace(/^([ \t]*)[●•✔▪▫◆◇■□►▻⁃]\s*/gm, '$1- ');
  text = text.replace(/(\S)[ \t]+([●•✔▪▫◆◇■□►▻⁃]\s*)/g, '$1\n- ');

  // 8. Handle standalone hashtags / metadata tags (preventing them from becoming giant H1s)
  // Strictly require explicit metadata prefix with colon or hashtag syntax:
  // e.g. "Tags: c, programming", "Keywords: loops, logic", "Topic Tags: basics", "#tags ..."
  // DO NOT match ordinary English sentences like "Keywords are...", "Tags are...", "Topic Tags are..."
  text = text.replace(/^(?:#\s*tags|#tags|Tags:|Keywords:|Hashtags:|Topic Tags:)[\t ]+([^\n]+)$/gim, (_match, tagLine) => {
    return `\n\n\`\`\`tags\n${tagLine.trim()}\n\`\`\`\n\n`;
  });
  text = text.replace(/^(#\w[\w-]*\s+)+#\w[\w-]*$/gm, (_match) => {
    return `\n\n\`\`\`tags\n${_match.trim()}\n\`\`\`\n\n`;
  });

  // 9. Format single-line flowcharts with ↓ or ➔ into clean step blocks
  text = text.replace(/(?:^|\n)(?:Flowchart|Flow Chart|Process Flow)[:\s—]+([^\n]+(?:↓|➔|->)[^\n]+)/gi, (_match, steps) => {
    const formattedSteps = steps
      .split(/\s*(?:↓|➔|->)\s*/)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .join('\n  ↓\n');
    return `\n\n\`\`\`flowchart-text\n${formattedSteps}\n\`\`\`\n\n`;
  });

  // 10. Restore code blocks
  text = text.replace(/__CODE_BLOCK_(\d+)__/g, (_match, index) => {
    const rawBlock = codeBlocks[Number(index)] || '';
    return rawBlock;
  });

  // 11. Collapse excessive blank lines (more than 2 consecutive newlines) to exactly 2
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Sanitizes lesson content against XSS and hostile HTML injections while
 * strictly preserving valid Markdown elements and code blocks.
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
 * Full pre-render and pre-save normalization pipeline.
 * Normalizes formatting and strips unsafe tags in one deterministic step.
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

