import { memo } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function parseLine(line: string, key: number) {
  // Heading h1
  if (/^### (.+)/.test(line)) {
    return (
      <h3
        key={key}
        className="text-base font-semibold text-foreground mt-4 mb-1"
      >
        {parseInline(line.slice(4))}
      </h3>
    );
  }
  if (/^## (.+)/.test(line)) {
    return (
      <h2 key={key} className="text-lg font-bold text-foreground mt-5 mb-2">
        {parseInline(line.slice(3))}
      </h2>
    );
  }
  if (/^# (.+)/.test(line)) {
    return (
      <h1 key={key} className="text-xl font-bold text-foreground mt-6 mb-2">
        {parseInline(line.slice(2))}
      </h1>
    );
  }
  // Horizontal rule
  if (/^---+$/.test(line.trim())) {
    return <hr key={key} className="border-border my-4" />;
  }
  // Bullet list
  if (/^[*-] (.+)/.test(line)) {
    return (
      <li key={key} className="ml-4 list-disc list-outside">
        {parseInline(line.slice(2))}
      </li>
    );
  }
  // Numbered list
  if (/^\d+\. (.+)/.test(line)) {
    const m = line.match(/^\d+\. (.+)/);
    return (
      <li key={key} className="ml-4 list-decimal list-outside">
        {m ? parseInline(m[1]) : null}
      </li>
    );
  }
  // Empty line
  if (line.trim() === "") {
    return <div key={key} className="h-2" />;
  }
  // Paragraph
  return (
    <p key={key} className="leading-relaxed">
      {parseInline(line)}
    </p>
  );
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Bold+italic: ***text***
  // Bold: **text**
  // Italic: *text* or _text_
  // Inline code: `code`
  const regex =
    /(```[\s\S]*?```)|(`[^`]+`)|\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;
  let last = 0;
  let idx = 0;
  let m = regex.exec(text);
  while (m !== null) {
    if (m.index > last)
      parts.push(<span key={idx++}>{text.slice(last, m.index)}</span>);
    if (m[1]) {
      // fenced code block inside inline (edge case)
      parts.push(
        <code key={idx++} className="font-mono text-sm bg-muted px-1 rounded">
          {m[1].replace(/```/g, "").trim()}
        </code>,
      );
    } else if (m[2]) {
      parts.push(
        <code
          key={idx++}
          className="font-mono text-sm bg-muted text-primary px-1.5 py-0.5 rounded"
        >
          {m[2].slice(1, -1)}
        </code>,
      );
    } else if (m[3]) {
      parts.push(
        <strong key={idx++}>
          <em>{m[3]}</em>
        </strong>,
      );
    } else if (m[4]) {
      parts.push(
        <strong key={idx++} className="font-semibold text-foreground">
          {m[4]}
        </strong>,
      );
    } else if (m[5]) {
      parts.push(<em key={idx++}>{m[5]}</em>);
    } else if (m[6]) {
      parts.push(<em key={idx++}>{m[6]}</em>);
    }
    last = regex.lastIndex;
    m = regex.exec(text);
  }
  if (last < text.length)
    parts.push(<span key={idx++}>{text.slice(last)}</span>);
  return parts;
}

function groupLines(lines: string[]) {
  // Group consecutive list items, detect code fences
  const result: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Code block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      result.push(
        <div
          key={`code-${i}`}
          className="my-3 rounded-lg overflow-hidden border border-border"
        >
          {lang && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted border-b border-border">
              <span className="text-xs font-mono text-muted-foreground">
                {lang}
              </span>
            </div>
          )}
          <pre className="p-3 overflow-x-auto bg-secondary">
            <code className="font-mono text-sm text-foreground whitespace-pre">
              {codeLines.join("\n")}
            </code>
          </pre>
        </div>,
      );
      i++; // skip closing fence
      continue;
    }
    // Bullet list group
    if (/^[*-] /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[*-] /.test(lines[i])) {
        items.push(parseLine(lines[i], i));
        i++;
      }
      result.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1">
          {items}
        </ul>,
      );
      continue;
    }
    // Numbered list group
    if (/^\d+\./.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\./.test(lines[i])) {
        items.push(parseLine(lines[i], i));
        i++;
      }
      result.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1">
          {items}
        </ol>,
      );
      continue;
    }
    result.push(parseLine(line, i));
    i++;
  }
  return result;
}

const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  const lines = content.split("\n");
  return (
    <div className={`text-sm text-foreground space-y-0.5 ${className}`}>
      {groupLines(lines)}
    </div>
  );
});

export default MarkdownRenderer;
