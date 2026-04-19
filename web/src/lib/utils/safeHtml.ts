const DEFAULT_ALLOWED_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]);

const DEFAULT_ALLOWED_ATTRIBUTES = new Set([
  'alt',
  'aria-label',
  'class',
  'colspan',
  'height',
  'href',
  'rel',
  'rowspan',
  'src',
  'target',
  'title',
  'width',
]);

const VOID_TAGS = new Set(['br', 'hr', 'img']);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripDangerousBlocks = (html: string) =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, '')
    .replace(/<form[\s\S]*?>[\s\S]*?<\/form>/gi, '')
    .replace(/<meta[\s\S]*?>/gi, '')
    .replace(/<link[\s\S]*?>/gi, '');

const isSafeUrl = (value: string) => {
  const normalized = value.trim().replace(/\s+/g, '').toLowerCase();
  if (!normalized) return false;
  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('data:text/html')
  ) {
    return false;
  }

  return true;
};

function sanitizeWithDomParser(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(stripDangerousBlocks(html), 'text/html');

  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        if (!DEFAULT_ALLOWED_TAGS.has(tagName)) {
          element.replaceWith(...Array.from(element.childNodes));
          return;
        }

        Array.from(element.attributes).forEach((attr) => {
          const name = attr.name.toLowerCase();
          const value = attr.value;

          if (name.startsWith('on') || !DEFAULT_ALLOWED_ATTRIBUTES.has(name)) {
            element.removeAttribute(attr.name);
            return;
          }

          if ((name === 'href' || name === 'src') && !isSafeUrl(value)) {
            element.removeAttribute(attr.name);
            return;
          }

          if (name === 'target') {
            element.setAttribute('target', value === '_blank' ? '_blank' : '_self');
          }

          if (tagName === 'a' && name === 'href') {
            element.setAttribute('rel', 'noopener noreferrer');
          }
        });

        walk(element);
        return;
      }

      if (child.nodeType === Node.COMMENT_NODE) {
        child.parentNode?.removeChild(child);
      }
    });
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

function sanitizeWithFallback(html: string) {
  const stripped = stripDangerousBlocks(html)
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*(javascript:|vbscript:|data:text\/html)[\s\S]*?\2/gi, '')
    .replace(/\sstyle\s*=\s*(['"]).*?\1/gi, '');

  return stripped.replace(
    /<([a-z0-9-]+)([^>]*)>/gi,
    (match, rawTagName: string, rawAttrs: string) => {
      const tagName = rawTagName.toLowerCase();
      if (!DEFAULT_ALLOWED_TAGS.has(tagName)) {
        return '';
      }

      const attrs: string[] = [];
      const attrRegex = /([a-zA-Z0-9:-]+)\s*=\s*(".*?"|'.*?'|[^\s"'>]+)/g;
      let attrMatch: RegExpExecArray | null;

      while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
        const name = attrMatch[1].toLowerCase();
        const rawValue = attrMatch[2];
        const unquotedValue = rawValue.replace(/^['"]|['"]$/g, '');

        if (name.startsWith('on') || !DEFAULT_ALLOWED_ATTRIBUTES.has(name)) {
          continue;
        }

        if ((name === 'href' || name === 'src') && !isSafeUrl(unquotedValue)) {
          continue;
        }

        if (name === 'target') {
          const safeTarget = unquotedValue === '_blank' ? '_blank' : '_self';
          attrs.push(`target="${safeTarget}"`);
          continue;
        }

        attrs.push(`${name}="${escapeHtml(unquotedValue)}"`);
        if (tagName === 'a' && name === 'href') {
          attrs.push('rel="noopener noreferrer"');
        }
      }

      const joinedAttrs = attrs.length ? ` ${attrs.join(' ')}` : '';
      if (match.endsWith('/>') || VOID_TAGS.has(tagName)) {
        return `<${tagName}${joinedAttrs}>`;
      }

      return `<${tagName}${joinedAttrs}>`;
    }
  );
}

export function sanitizeHtml(html: string | null | undefined) {
  if (!html) return '';

  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    return sanitizeWithDomParser(html);
  }

  return sanitizeWithFallback(html);
}

export function sanitizePlainTextWithLinks(html: string | null | undefined) {
  return sanitizeHtml(html);
}
