import React from "react"

interface CalloutProps {
  type?: "tip" | "warning" | "info" | "quote"
  title?: string
  children: React.ReactNode
}

export default function Callout({ type = "info", title, children }: CalloutProps) {
  const styles = {
    tip: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
    quote: "bg-gray-50 border-gray-200 text-gray-900 italic",
  }

  const icons = {
    tip: "💡",
    warning: "⚠️",
    info: "ℹ️",
    quote: "💬",
  }

  return (
    <div className={`my-6 p-4 border-l-4 rounded-r ${styles[type]}`}>
      {title && (
        <div className="font-semibold mb-2 flex items-center gap-2">
          <span>{icons[type]}</span>
          <span>{title}</span>
        </div>
      )}
      <div className={title ? "" : "flex items-start gap-2"}>
        {!title && <span className="text-lg">{icons[type]}</span>}
        <div className="prose prose-sm max-w-none">{children}</div>
      </div>
    </div>
  )
}
