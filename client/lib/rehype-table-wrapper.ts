import { visit } from "unist-util-visit"
import type { Root, Element } from "hast"

/**
 * Rehype plugin that wraps tables in a scrollable div for mobile responsiveness
 */
export function rehypeTableWrapper() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName === "table" && parent && typeof index === "number") {
        // Wrap the table in a div with overflow-x-auto
        const wrapper: Element = {
          type: "element",
          tagName: "div",
          properties: {
            className: ["table-scroll-wrapper"],
          },
          children: [node],
        }
        // Replace the table with the wrapper in the parent's children array
        parent.children[index] = wrapper
      }
    })
  }
}
