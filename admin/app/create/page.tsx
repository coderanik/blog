"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bold, Italic, Underline, Save, X } from 'lucide-react'
import { createBlog, updateBlog, getBlogById, type Blog } from '@/lib/api'

const fonts = [
  { name: 'Default', value: 'inherit' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
]

function CreateBlogPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const blogId = searchParams.get('id')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [selectedFont, setSelectedFont] = useState('inherit')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (blogId) {
      loadBlog()
    }
  }, [blogId])

  // Ensure content editor text is always white and sync content
  useEffect(() => {
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
    if (editor) {
      // Set content if it exists
      if (content && editor.innerHTML !== content) {
        editor.innerHTML = content
      }
      
      // Set default white color for editor, preserve other formatting
      if (!editor.style.color || editor.style.color !== 'rgb(255, 255, 255)') {
        editor.style.color = '#ffffff'
      }
      
      // Set all child elements to white text color, but preserve other formatting (bold, italic, fonts, etc.)
      const allElements = editor.querySelectorAll('*')
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        // Only update color property, preserve font-family, font-weight, font-style, text-decoration, etc.
        const currentColor = htmlEl.style.color
        if (!currentColor || (currentColor !== 'rgb(255, 255, 255)' && currentColor !== '#ffffff')) {
          htmlEl.style.color = '#ffffff'
        }
      })
      
      // Use MutationObserver to watch for changes and ensure text stays white
      // but preserve all other formatting (bold, italic, fonts, etc.)
      const observer = new MutationObserver(() => {
        if (!editor.style.color || editor.style.color !== 'rgb(255, 255, 255)') {
          editor.style.color = '#ffffff'
        }
        const allElements = editor.querySelectorAll('*')
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement
          const color = htmlEl.style.color
          // Only update color if needed, preserve everything else
          if (!color || (color !== 'rgb(255, 255, 255)' && color !== '#ffffff')) {
            htmlEl.style.color = '#ffffff'
          }
        })
      })
      observer.observe(editor, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] })
      return () => observer.disconnect()
    }
  }, [content])

  const loadBlog = async () => {
    try {
      if (!blogId) return
      const blog = await getBlogById(blogId)
      setTitle(blog.title)
      setDescription(blog.description)
      // Preserve all formatting but only update color to white
      let cleanContent = blog.content || ''
      
      // Remove only color-related styles, preserve everything else
      cleanContent = cleanContent.replace(/style="([^"]*)"/gi, (match, styles) => {
        // Remove color-related CSS properties but keep everything else
        const cleanedStyles = styles
          .split(';')
          .filter((style: string) => {
            const trimmed = style.trim().toLowerCase()
            return !trimmed.startsWith('color') && !trimmed.startsWith('color:')
          })
          .join(';')
        return cleanedStyles ? `style="${cleanedStyles}"` : ''
      })
      
      cleanContent = cleanContent.replace(/style='([^']*)'/gi, (match, styles) => {
        const cleanedStyles = styles
          .split(';')
          .filter((style: string) => {
            const trimmed = style.trim().toLowerCase()
            return !trimmed.startsWith('color') && !trimmed.startsWith('color:')
          })
          .join(';')
        return cleanedStyles ? `style="${cleanedStyles}"` : ''
      })
      
      setContent(cleanContent)
      setTags(blog.tags || [])
      
      // After content is set, ensure the editor displays white text while preserving formatting
      setTimeout(() => {
        const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
        if (editor) {
          editor.style.color = '#ffffff'
          // Set all child elements to white text color, but preserve other styles
          const allElements = editor.querySelectorAll('*')
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement
            // Only update color, don't touch other styles
            htmlEl.style.color = '#ffffff'
          })
        }
      }, 100)
    } catch (error) {
      console.error('Failed to load blog:', error)
    }
  }

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    // Only update text color to white if needed, preserve all other formatting (bold, italic, fonts, etc.)
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const container = range.commonAncestorContainer
      if (container.nodeType === Node.TEXT_NODE) {
        const parent = container.parentElement
        if (parent) {
          setIsBold(parent.tagName === 'B' || parent.tagName === 'STRONG')
          setIsItalic(parent.tagName === 'I' || parent.tagName === 'EM')
          setIsUnderline(parent.tagName === 'U')
          // Only update color if it's not already white, preserve all other styles
          const currentColor = parent.style.color
          if (!currentColor || (currentColor !== 'rgb(255, 255, 255)' && currentColor !== '#ffffff')) {
            parent.style.color = '#ffffff'
          }
        }
      }
    }
  }

  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue)
    handleFormat('fontName', fontValue)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handlePublish = async () => {
    // Get actual text content from the editor
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
    const editorContent = editor ? editor.innerHTML : content
    
    // Trim whitespace and check if fields are actually filled
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    // Remove HTML tags and check if there's actual text content
    const textContent = (editorContent || content)
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
    
    if (!trimmedTitle) {
      alert('Please enter a title')
      return
    }
    if (!trimmedDescription) {
      alert('Please enter a description')
      return
    }
    if (!textContent) {
      alert('Please enter some content')
      return
    }

    try {
      setLoading(true)
      // Use editor content if available, otherwise use state
      const finalContent = editor ? editor.innerHTML : content
      
      if (blogId) {
        await updateBlog(blogId, {
          title: trimmedTitle,
          description: trimmedDescription,
          content: finalContent,
          tags,
          status: 'published'
        })
      } else {
        await createBlog({
          title: trimmedTitle,
          description: trimmedDescription,
          content: finalContent,
          tags,
          status: 'published'
        })
      }
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to publish blog:', error)
      alert('Failed to publish blog')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    // Get actual text content from the editor
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
    const editorContent = editor ? editor.innerHTML : content
    
    // Trim whitespace and check if fields are actually filled
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    // Remove HTML tags and check if there's actual text content
    const textContent = (editorContent || content)
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
    
    if (!trimmedTitle) {
      alert('Please enter a title')
      return
    }
    if (!trimmedDescription) {
      alert('Please enter a description')
      return
    }
    if (!textContent) {
      alert('Please enter some content')
      return
    }

    try {
      setLoading(true)
      
      // Use editor content if available, otherwise use state
      const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
      const finalContent = editor ? editor.innerHTML : content
      
      if (blogId) {
        await updateBlog(blogId, {
          title: trimmedTitle,
          description: trimmedDescription,
          content: finalContent,
          tags,
          status: 'draft'
        })
      } else {
        await createBlog({
          title: trimmedTitle,
          description: trimmedDescription,
          content: finalContent,
          tags,
          status: 'draft'
        })
      }
      router.push('/drafts')
    } catch (error) {
      console.error('Failed to save draft:', error)
      alert('Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Blog</h1>
        <p className="text-muted-foreground">Write and format your blog post</p>
      </div>

      <div className="bg-black/20 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/10 p-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap gap-2 p-4 bg-black/30 rounded-lg border border-white/10">
          <button
            onClick={() => handleFormat('bold')}
            className={`p-2 rounded hover:bg-purple-600/30 transition-colors ${
              isBold ? 'bg-purple-600/50' : ''
            }`}
            title="Bold"
          >
            <Bold className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={() => handleFormat('italic')}
            className={`p-2 rounded hover:bg-purple-600/30 transition-colors ${
              isItalic ? 'bg-purple-600/50' : ''
            }`}
            title="Italic"
          >
            <Italic className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={() => handleFormat('underline')}
            className={`p-2 rounded hover:bg-purple-600/30 transition-colors ${
              isUnderline ? 'bg-purple-600/50' : ''
            }`}
            title="Underline"
          >
            <Underline className="h-4 w-4 text-white" />
          </button>
          
          <div className="w-px h-6 bg-white/10 mx-2" />
          
          <select
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
            className="px-3 py-2 bg-black/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {fonts.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter blog title"
          />
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
            placeholder="Enter blog description"
          />
        </div>

        {/* Tags Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add a tag and press Enter"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Content Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Content</label>
          <div
            contentEditable
            onInput={(e) => {
              setContent(e.currentTarget.innerHTML)
              // Only update text color to white, preserve all other formatting
              const editor = e.currentTarget
              const walker = document.createTreeWalker(
                editor,
                NodeFilter.SHOW_TEXT,
                null
              )
              let node
              while (node = walker.nextNode()) {
                if (node.parentElement) {
                  const color = node.parentElement.style.color
                  // Only change color if it's not white, preserve everything else
                  if (color && color !== 'rgb(255, 255, 255)' && color !== '#ffffff') {
                    node.parentElement.style.color = '#ffffff'
                  } else if (!color) {
                    node.parentElement.style.color = '#ffffff'
                  }
                }
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.color = '#ffffff'
            }}
            onPaste={(e) => {
              // Preserve formatting (bold, italic, spacing, etc.) while ensuring white text color
              e.preventDefault()
              
              // Get both HTML and plain text from clipboard
              const htmlData = e.clipboardData.getData('text/html')
              const plainText = e.clipboardData.getData('text/plain')
              
              const selection = window.getSelection()
              if (!selection || selection.rangeCount === 0) return
              
              const range = selection.getRangeAt(0)
              
              if (htmlData) {
                // Create a temporary container to process the HTML
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = htmlData
                
                // Remove color styles but preserve all other formatting
                const allElements = tempDiv.querySelectorAll('*')
                allElements.forEach((el) => {
                  const htmlEl = el as HTMLElement
                  // Remove color from style attribute
                  if (htmlEl.style.color) {
                    htmlEl.style.removeProperty('color')
                  }
                  // Remove color from style string if present
                  if (htmlEl.getAttribute('style')) {
                    const style = htmlEl.getAttribute('style') || ''
                    const cleanedStyle = style
                      .split(';')
                      .filter((s: string) => {
                        const trimmed = s.trim().toLowerCase()
                        return !trimmed.startsWith('color') && !trimmed.startsWith('color:')
                      })
                      .join(';')
                    if (cleanedStyle) {
                      htmlEl.setAttribute('style', cleanedStyle)
                    } else {
                      htmlEl.removeAttribute('style')
                    }
                  }
                })
                
                // Insert the formatted HTML
                range.deleteContents()
                const fragment = range.createContextualFragment(tempDiv.innerHTML)
                range.insertNode(fragment)
                
                // Set cursor after inserted content - find the last text node or element
                let lastNode: Node | null = fragment.lastChild
                while (lastNode && lastNode.nodeType !== Node.TEXT_NODE && lastNode.hasChildNodes()) {
                  lastNode = lastNode.lastChild
                }
                
                // Set cursor position safely
                try {
                  if (lastNode && lastNode.parentNode) {
                    range.setStartAfter(lastNode)
                    range.collapse(true)
                  } else {
                    // Fallback: set range at end of editor
                    const editor = e.currentTarget
                    range.selectNodeContents(editor)
                    range.collapse(false)
                  }
                } catch (err) {
                  // If setting position fails, just collapse at end
                  const editor = e.currentTarget
                  range.selectNodeContents(editor)
                  range.collapse(false)
                }
                
                selection.removeAllRanges()
                selection.addRange(range)
              } else {
                // Fallback to plain text if no HTML available
                const textNode = document.createTextNode(plainText)
                range.deleteContents()
                range.insertNode(textNode)
                range.setStartAfter(textNode)
                range.collapse(true)
                selection.removeAllRanges()
                selection.addRange(range)
              }
              
              // Ensure all pasted content has white text color while preserving formatting
              setTimeout(() => {
                const editor = e.currentTarget as HTMLElement
                if (!editor || !editor.parentNode) return
                
                // Use querySelectorAll instead of TreeWalker for better compatibility
                const allElements = editor.querySelectorAll('*')
                allElements.forEach((el) => {
                  const htmlEl = el as HTMLElement
                  const color = htmlEl.style.color
                  // Only update color, preserve everything else
                  if (!color || (color !== 'rgb(255, 255, 255)' && color !== '#ffffff')) {
                    htmlEl.style.color = '#ffffff'
                  }
                })
                
                // Also set color on text node parents
                const walker = document.createTreeWalker(
                  editor,
                  NodeFilter.SHOW_TEXT,
                  null
                )
                let textNode
                while (textNode = walker.nextNode()) {
                  if (textNode.parentElement) {
                    const color = textNode.parentElement.style.color
                    if (!color || (color !== 'rgb(255, 255, 255)' && color !== '#ffffff')) {
                      textNode.parentElement.style.color = '#ffffff'
                    }
                  }
                }
              }, 0)
            }}
            className="w-full min-h-[400px] px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&_*]:!text-white [&_*]:!text-opacity-100"
            style={{ fontFamily: selectedFont, color: '#ffffff !important' }}
            suppressContentEditableWarning
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-black/30 border border-white/10 rounded-lg text-white hover:bg-black/50 transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CreateBlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <CreateBlogPageContent />
    </Suspense>
  )
}

