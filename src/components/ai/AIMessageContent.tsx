'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface AIMessageContentProps {
  content: string;
  isUser?: boolean;
}

// Code block with copy action
function CodeBlock({ language, codeString }: { language?: string; codeString: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-slate-700/60 bg-[#0F172A] text-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#1E293B] text-[11px] font-mono text-slate-300 border-b border-slate-700/50 select-none">
        <span className="uppercase tracking-wider font-semibold text-slate-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded hover:bg-slate-700/60 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200 scrollbar-thin">
        <code>{codeString}</code>
      </pre>
    </div>
  );
}

// Relax sanitize schema slightly to support tables and code styling safely
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className'],
    th: [...(defaultSchema.attributes?.th || []), 'align'],
    td: [...(defaultSchema.attributes?.td || []), 'align'],
  },
};

export default function AIMessageContent({ content, isUser = false }: AIMessageContentProps) {
  if (isUser) {
    return <div className="whitespace-pre-wrap break-words leading-relaxed">{content}</div>;
  }

  return (
    <div className="ai-markdown text-slate-800 break-words leading-relaxed space-y-1.5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-sm sm:text-base font-bold text-slate-900 mt-2.5 mb-1.5 leading-snug border-b border-slate-200/70 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 mt-2 mb-1 leading-snug">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-slate-900 mt-1.5 mb-0.5 leading-snug">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-slate-800 mt-1 mb-0.5 leading-snug">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-slate-700 text-xs sm:text-[13px]">
              {children}
            </p>
          ),

          // Emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-slate-800">{children}</em>,

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 space-y-1 my-1.5 last:mb-0 text-xs sm:text-[13px]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1 my-1.5 last:mb-0 text-xs sm:text-[13px]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-700 pl-0.5 leading-relaxed">{children}</li>
          ),

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-[3px] border-[#0B72E7] bg-blue-50/50 pl-3 py-1 my-2 text-slate-700 italic rounded-r text-xs">
              {children}
            </blockquote>
          ),

          // Divider
          hr: () => <hr className="my-2.5 border-slate-200" />,

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0B72E7] hover:text-blue-700 hover:underline font-medium inline-flex items-center gap-0.5"
            >
              <span>{children}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <table className="min-w-full text-xs text-left divide-y divide-slate-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100/80 text-slate-800 font-semibold text-[11px] uppercase tracking-wider">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50/70 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-slate-700 leading-normal">{children}</td>
          ),

          // Code
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-slate-100 text-blue-700 font-mono text-[11px] font-medium border border-slate-200/70"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : undefined}
                codeString={String(children).replace(/\n$/, '')}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
