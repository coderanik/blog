"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TagFilterProps {
  tags: string[]
  selectedTag: string | null
  onTagSelect: (tag: string | null) => void
}

export function TagFilter({ tags, selectedTag, onTagSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant="outline"
        className={cn(
          "cursor-pointer transition-all",
          selectedTag === null
            ? "bg-primary text-primary-foreground border-primary"
            : "hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={() => onTagSelect(null)}
      >
        All
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className={cn(
            "cursor-pointer transition-all",
            selectedTag === tag
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-accent hover:text-accent-foreground",
          )}
          onClick={() => onTagSelect(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
