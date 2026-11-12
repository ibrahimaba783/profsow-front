import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderMathHtml = (text) => {
  if (!text) return '';
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(text.slice(lastIndex, match.index)).replace(/\n/g, '<br/>');
    }
    const token = match[0];
    const isDisplay = token.startsWith('$$');
    const expr = isDisplay ? token.slice(2, -2) : token.slice(1, -1);
    try {
      result += katex.renderToString(expr.trim(), {
        displayMode: isDisplay,
        throwOnError: false,
      });
    } catch {
      result += escapeHtml(token);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result += escapeHtml(text.slice(lastIndex)).replace(/\n/g, '<br/>');
  }
  return result;
};

const MathText = ({ text, className = '' }) => {
  if (!text) return null;
  return (
    <div
      className={`leading-relaxed break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMathHtml(text) }}
    />
  );
};

export default MathText;
