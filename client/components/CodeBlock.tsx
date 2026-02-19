import React from "react"

interface CodeBlockProps {
  lang?: string
  title?: string
  children: React.ReactNode
}

export default function CodeBlock({ lang = "text", title, children }: CodeBlockProps) {
  return (
    <div className="my-6 code-block-wrapper">
      {title && (
        <div className="px-4 py-2 text-sm font-mono rounded-t" style={{ backgroundColor: '#0f172a', color: '#e2e8f0', borderBottom: '1px solid #334155' }}>
          {title}
        </div>
      )}
      <pre
        className={`${
          title ? "rounded-b" : "rounded"
        } p-4 overflow-x-auto font-mono text-sm leading-relaxed`}
        style={{ backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }}
      >
        <code className={`language-${lang}`} style={{ color: '#e2e8f0' }}>{children}</code>
      </pre>
    </div>
  )
}
