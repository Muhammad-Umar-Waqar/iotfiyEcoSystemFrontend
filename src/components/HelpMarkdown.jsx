/**
 * Lightweight markdown → React for help chat bubbles.
 * Supports: headings, bold, italics, code, unordered + numbered lists, paragraphs.
 */
function inlineFormat(text) {
  const nodes = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m;
  let key = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(text.slice(last, m.index));
    }
    const token = m[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key++} className="eco-help-md-code">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    last = m.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function HelpMarkdown({ text }) {
  const raw = String(text || "");
  if (!raw.trim()) return null;

  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let listBuf = []; // { ordered: boolean, items: string[] }
  let key = 0;

  const flushList = () => {
    if (!listBuf.length) return;
    const ordered = listBuf[0].ordered;
    const Tag = ordered ? "ol" : "ul";
    const className = ordered ? "eco-help-md-ol" : "eco-help-md-ul";
    blocks.push(
      <Tag key={key++} className={className}>
        {listBuf.map((item, i) => (
          <li key={i}>{inlineFormat(item.text)}</li>
        ))}
      </Tag>
    );
    listBuf = [];
  };

  const pushListItem = (ordered, text) => {
    if (listBuf.length && listBuf[0].ordered !== ordered) {
      flushList();
    }
    listBuf.push({ ordered, text });
  };

  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const bullet = line.match(/^\s*[-*•]\s+(.+)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);

    if (heading) {
      flushList();
      const level = heading[1].length;
      const Tag = level === 1 ? "h4" : level === 2 ? "h5" : "h6";
      blocks.push(
        <Tag key={key++} className={`eco-help-md-h eco-help-md-h${level}`}>
          {inlineFormat(heading[2])}
        </Tag>
      );
      continue;
    }

    if (bullet) {
      pushListItem(false, bullet[1]);
      continue;
    }

    if (numbered) {
      pushListItem(true, numbered[1]);
      continue;
    }

    flushList();

    if (!line.trim()) {
      blocks.push(<div key={key++} className="eco-help-md-spacer" />);
      continue;
    }

    blocks.push(
      <p key={key++} className="eco-help-md-p">
        {inlineFormat(line)}
      </p>
    );
  }

  flushList();

  return <div className="eco-help-md">{blocks}</div>;
}
