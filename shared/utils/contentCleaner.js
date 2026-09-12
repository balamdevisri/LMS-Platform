"use strict";
/**
 * Canonical Content Cleaner Pipeline
 * Normalizes PDF extraction artifacts, broken linebreaks, split words, bullet symbols,
 * headings, ASCII diagrams, interview Q&A, and code snippets into clean, high-fidelity Markdown.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripPdfPageMarkers = stripPdfPageMarkers;
exports.normalizeSpacing = normalizeSpacing;
exports.healHyphenatedWords = healHyphenatedWords;
exports.normalizeBullets = normalizeBullets;
exports.healOrphanLinebreaks = healOrphanLinebreaks;
exports.normalizeHeadings = normalizeHeadings;
exports.wrapAsciiDiagrams = wrapAsciiDiagrams;
exports.cleanCourseContent = cleanCourseContent;
/**
 * Strips PDF page demarcation markers
 */
function stripPdfPageMarkers(text) {
    if (!text)
        return '';
    return text
        .replace(/={3,}\s*PDF\s+PAGE\s+\d+\s*={3,}/gi, '')
        .replace(/-{3,}\s*Page\s+\d+\s*-{3,}/gi, '')
        .replace(/Page\s+\d+\s+of\s+\d+/gi, '');
}
/**
 * Normalizes multi-space gaps within lines without destroying block indentation
 */
function normalizeSpacing(text) {
    if (!text)
        return '';
    const lines = text.split('\n');
    return lines
        .map((line) => {
        // Don't modify code fence lines or text inside fences
        if (line.startsWith('    ') || line.startsWith('\t'))
            return line;
        // Replace multiple spaces (2 or more) with single space
        return line.replace(/([^\s]) {2,}([^\s])/g, '$1 $2').replace(/([^\s]) {2,}([^\s])/g, '$1 $2');
    })
        .join('\n');
}
/**
 * Fixes hyphenated words split across line breaks (e.g., "modifi-\ncation" -> "modification")
 */
function healHyphenatedWords(text) {
    if (!text)
        return '';
    return text.replace(/([a-zA-Z]+)-\s*\n\s*([a-zA-Z]+)/g, '$1$2');
}
/**
 * Normalizes unicode bullets (●, •, ●​, ▪, ◆) into valid markdown list items (- Item)
 * Handles inline-chained bullets like "● Item 1 ● Item 2 ● Item 3"
 */
function normalizeBullets(text) {
    if (!text)
        return '';
    // Replace zero-width spaces that often accompany unicode bullets
    let cleaned = text.replace(/\u200B/g, '');
    // Split multiple bullets on a single line into separate lines
    // e.g. "● Point 1 ● Point 2" -> "\n- Point 1\n- Point 2"
    cleaned = cleaned.replace(/([^\n])\s*[●•▪◆]\s*/g, '$1\n- ');
    // Convert leading bullet symbols
    cleaned = cleaned.replace(/^[ \t]*[●•▪◆]\s*/gm, '- ');
    return cleaned;
}
/**
 * Heals single-word or short-phrase orphan linebreaks caused by PDF column margins
 * e.g., "cloud\n\nplatforms,\n\nsmartphones," -> "cloud platforms, smartphones,"
 */
function healOrphanLinebreaks(text) {
    if (!text)
        return '';
    const lines = text.split('\n');
    const healed = [];
    let i = 0;
    while (i < lines.length) {
        const current = lines[i].trim();
        // Check for sequence of short lines separated by blank lines that belong to the same sentence
        // e.g. ["cloud", "", "computing,", "", "and", "", "DevOps."]
        if (current &&
            !current.startsWith('#') &&
            !current.startsWith('-') &&
            !current.startsWith('*') &&
            !current.startsWith('```') &&
            !current.startsWith('>') &&
            !current.match(/^\d+\./) &&
            !current.includes('│') &&
            !current.includes('├──') &&
            !current.includes('┌') &&
            !current.includes('+--') &&
            !current.includes('↓') &&
            !current.includes('▼')) {
            // Check if subsequent lines are single words continuing this line
            let combined = current;
            let j = i + 1;
            while (j < lines.length) {
                // Skip up to 2 empty lines
                let lookAheadIdx = j;
                while (lookAheadIdx < lines.length && lines[lookAheadIdx].trim() === '') {
                    lookAheadIdx++;
                }
                if (lookAheadIdx >= lines.length)
                    break;
                const nextLine = lines[lookAheadIdx].trim();
                // If next line is a structural element or heading, stop combining
                if (!nextLine ||
                    nextLine.startsWith('#') ||
                    nextLine.startsWith('-') ||
                    nextLine.startsWith('*') ||
                    nextLine.startsWith('```') ||
                    nextLine.startsWith('>') ||
                    nextLine.match(/^\d+\./) ||
                    nextLine.match(/^(Topic|Module|Chapter|Task|Q\d+|Answer|Definition|Syntax|Example|Output|Use Case|Common Options|Warning)/i) ||
                    nextLine.includes('│') ||
                    nextLine.includes('├──') ||
                    nextLine.includes('┌') ||
                    nextLine.includes('+--') ||
                    nextLine.includes('↓') ||
                    nextLine.includes('▼') ||
                    // If current combined ended with a full stop or colon, don't combine
                    combined.endsWith('.') ||
                    combined.endsWith(':') ||
                    combined.endsWith('?') ||
                    combined.endsWith('!')) {
                    break;
                }
                // If next line is a single word or short fragment (under 4 words), and current line doesn't end with terminal punctuation
                const wordCount = nextLine.split(/\s+/).length;
                if (wordCount <= 4 && !combined.endsWith('.') && !combined.endsWith(':')) {
                    combined += ' ' + nextLine;
                    j = lookAheadIdx + 1;
                }
                else {
                    break;
                }
            }
            healed.push(combined);
            i = j;
        }
        else {
            healed.push(lines[i]);
            i++;
        }
    }
    return healed.join('\n');
}
/**
 * Standardizes section headings, subheadings, and educational cues
 */
function normalizeHeadings(text) {
    if (!text)
        return '';
    let res = text;
    // Module headers: "Module 1: Title" -> "# Module 1: Title"
    res = res.replace(/^(?:🐍\s*|🟢\s*|🟡\s*|🔵\s*|🔴\s*|🟣\s*)?Module\s+(\d+)\s*:\s*(.+)$/gim, '# Module $1: $2');
    // Numbered sections: "1.1 Introduction to Linux" -> "## 1.1 Introduction to Linux"
    res = res.replace(/^(\d+\.\d+)\s+([A-Z].+)$/gm, '## $1 $2');
    // Major Educational Anchors
    res = res.replace(/^Learning Objectives\s*$/gim, '## Learning Objectives');
    res = res.replace(/^Definition\s*$/gim, '### Definition');
    res = res.replace(/^Real-Time Example\s*$/gim, '### Real-Time Example');
    res = res.replace(/^Real-Life Example\s*$/gim, '### Real-Life Example');
    res = res.replace(/^Key Advantages\s*$/gim, '### Key Advantages');
    res = res.replace(/^Advantages\s*$/gim, '### Advantages');
    res = res.replace(/^Disadvantages\s*$/gim, '### Disadvantages');
    res = res.replace(/^Best Practices\s*$/gim, '### Best Practices');
    res = res.replace(/^Common Mistakes\s*$/gim, '### Common Mistakes');
    res = res.replace(/^Common Misconceptions\s*$/gim, '### Common Misconceptions');
    res = res.replace(/^Summary\s*$/gim, '## Summary');
    // Interview Questions formatting
    res = res.replace(/^(?:Important\s+)?Interview\s+Questions\s*$/gim, '## Interview Questions');
    res = res.replace(/^(?:Q(\d+)[\.:]|(\d+)[\.:])\s+([A-Z].+\?)$/gm, '### Q$1$2. $3');
    res = res.replace(/^Answer\s*:\s*$/gim, '**Answer:**\n');
    res = res.replace(/^Answer\s*:\s*(.+)$/gim, '**Answer:** $1');
    // Practical Labs formatting
    res = res.replace(/^(?:Practical\s+(?:Lab|Exercise)|Beginner\s+Practice\s+Programs)\s*$/gim, '## Practical Lab');
    res = res.replace(/^Task\s+(\d+)\s*$/gim, '#### Task $1');
    res = res.replace(/^Program\s+(\d+)\s*$/gim, '#### Program $1');
    return res;
}
/**
 * Identifies ASCII diagrams and wraps them in ```text ``` blocks
 */
function wrapAsciiDiagrams(text) {
    if (!text)
        return '';
    const lines = text.split('\n');
    const result = [];
    let inDiagram = false;
    let diagramLines = [];
    let inExistingCodeBlock = false;
    const isDiagramLine = (line) => {
        const trimmed = line.trim();
        if (!trimmed)
            return false;
        // Check for diagram characters: │, ├──, └──, ┌, ┐, └, ┘, +, -, |, /, \, ▲, ▼, ↓, ─, ┼
        const diagramChars = /[│├└┌┐┘┼─▲▼↓]|\+[-+]+\+|\|.*\||[/\\]{2,}|[-=]{3,}>/;
        return diagramChars.test(trimmed);
    };
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith('```')) {
            inExistingCodeBlock = !inExistingCodeBlock;
            result.push(line);
            continue;
        }
        if (inExistingCodeBlock) {
            result.push(line);
            continue;
        }
        if (isDiagramLine(line)) {
            if (!inDiagram) {
                inDiagram = true;
                diagramLines = [];
            }
            diagramLines.push(line);
        }
        else {
            if (inDiagram) {
                // If blank line and next line is diagram line, keep in diagram
                if (line.trim() === '' && i + 1 < lines.length && isDiagramLine(lines[i + 1])) {
                    diagramLines.push(line);
                    continue;
                }
                inDiagram = false;
                result.push('```text');
                result.push(...diagramLines);
                result.push('```');
                diagramLines = [];
            }
            result.push(line);
        }
    }
    if (inDiagram) {
        result.push('```text');
        result.push(...diagramLines);
        result.push('```');
    }
    return result.join('\n');
}
/**
 * Cleans and transforms raw course text into clean Markdown
 */
function cleanCourseContent(rawContent, options = {}) {
    if (!rawContent || typeof rawContent !== 'string')
        return '';
    let output = rawContent;
    // 1. Strip PDF page boundaries
    output = stripPdfPageMarkers(output);
    // 2. Normalize whitespace gaps inside lines
    output = normalizeSpacing(output);
    // 3. Heal hyphenated split words
    output = healHyphenatedWords(output);
    // 4. Heal orphan linebreaks from PDF column splits
    output = healOrphanLinebreaks(output);
    // 5. Convert unicode bullets into Markdown list items
    output = normalizeBullets(output);
    // 6. Standardize headings and sections
    output = normalizeHeadings(output);
    // 7. Wrap ASCII diagrams in ```text blocks
    output = wrapAsciiDiagrams(output);
    // 8. Clean up consecutive blank lines (max 2)
    output = output.replace(/\n{4,}/g, '\n\n\n');
    return output.trim();
}
