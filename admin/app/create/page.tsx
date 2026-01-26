"use client"

import { useState, useEffect, Suspense, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bold, Italic, Underline, Save, X, Upload } from 'lucide-react'
import { createBlog, updateBlog, getBlogById, uploadImage } from '@/lib/api'

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
  const [image, setImage] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [selectedFont, setSelectedFont] = useState('inherit')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<MutationObserver | null>(null)

  const loadBlog = useCallback(async () => {
    try {
      if (!blogId) return
      const blog = await getBlogById(blogId)
      setTitle(blog.title)
      setDescription(blog.description)
      setImage(blog.image || '')
      // Preserve all formatting exactly as stored - only remove color styles
      let cleanContent = blog.content || ''
      
      // Remove only color-related styles from inline styles, preserve everything else
      cleanContent = cleanContent.replace(/style="([^"]*)"/gi, (match, styles) => {
        const cleanedStyles = styles
          .split(';')
          .filter((style: string) => {
            const trimmed = style.trim().toLowerCase()
            return trimmed && !trimmed.startsWith('color') && !trimmed.startsWith('color:')
          })
          .join(';')
        return cleanedStyles ? `style="${cleanedStyles}"` : ''
      })
      
      cleanContent = cleanContent.replace(/style='([^']*)'/gi, (match, styles) => {
        const cleanedStyles = styles
          .split(';')
          .filter((style: string) => {
            const trimmed = style.trim().toLowerCase()
            return trimmed && !trimmed.startsWith('color') && !trimmed.startsWith('color:')
          })
          .join(';')
        return cleanedStyles ? `style="${cleanedStyles}"` : ''
      })
      
      setContent(cleanContent)
      setTags(blog.tags || [])
    } catch (error) {
      console.error('Failed to load blog:', error)
    }
  }, [blogId])

  useEffect(() => {
    if (blogId) {
      loadBlog()
    }
  }, [blogId, loadBlog])

  // Sync content state with editor, but don't auto-format
  useEffect(() => {
    const editor = editorRef.current || document.querySelector('[contenteditable="true"]') as HTMLElement
    if (!editor) return

    // Only set content if it's different and we're loading initial content
    if (content && editor.innerHTML !== content && !editor.textContent) {
      editor.innerHTML = content
    }
    
    // Set default black color only on the editor itself, not children
    // This allows pasted content to keep its formatting
    if (!editor.style.color) {
      editor.style.color = '#000000'
    }
  }, [])

  const handleFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    // Update button states based on current selection
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const container = range.commonAncestorContainer
      if (container.nodeType === Node.TEXT_NODE) {
        const parent = container.parentElement
        if (parent) {
          setIsBold(parent.tagName === 'B' || parent.tagName === 'STRONG' || parent.style.fontWeight === 'bold')
          setIsItalic(parent.tagName === 'I' || parent.tagName === 'EM' || parent.style.fontStyle === 'italic')
          setIsUnderline(parent.tagName === 'U' || parent.style.textDecoration?.includes('underline'))
        }
      }
    }
    // Update content state
    const editor = editorRef.current || document.querySelector('[contenteditable="true"]') as HTMLElement
    if (editor) {
      setContent(editor.innerHTML)
    }
  }, [])

  const handleFontChange = useCallback((fontValue: string) => {
    setSelectedFont(fontValue)
    handleFormat('fontName', fontValue)
  }, [handleFormat])

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }, [tagInput, tags])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }, [tags])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      e.preventDefault()
      e.stopPropagation()
      
      const file = e.target.files?.[0]
      if (!file) {
        // Reset input if no file selected
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      setUploading(true)
      setUploadError(null)
      console.log('Starting image upload:', { name: file.name, size: file.size, type: file.type })
      
      const result = await uploadImage(file)
      
      console.log('Image upload successful:', result.url)
      setImage(result.url)
      setUploadError(null)
      
      // Reset file input after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
      setUploadError(errorMessage)
      
      // Reset file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setUploading(false)
    }
  }

  const handleUploadClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    fileInputRef.current?.click()
  }, [])

  const handleEditorInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    // Just update state, don't modify formatting
    setContent(e.currentTarget.innerHTML)
  }, [])

  const handleEditorFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    // Only set default color if editor itself has no color
    if (!e.currentTarget.style.color) {
      e.currentTarget.style.color = '#000000'
    }
  }, [])

  const handleEditorPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    // Preserve ALL formatting exactly as pasted - no modifications
    e.preventDefault()
    
    // Get HTML from clipboard
    const htmlData = e.clipboardData.getData('text/html')
    const plainText = e.clipboardData.getData('text/plain')
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    
    if (htmlData) {
      // Create a temporary container to sanitize only dangerous content
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlData
      
      // Only remove script tags and dangerous attributes, preserve everything else
      const scripts = tempDiv.querySelectorAll('script')
      scripts.forEach(script => script.remove())
      
      // Remove only color-related styles to ensure black text, but keep ALL other formatting
      const allElements = tempDiv.querySelectorAll('*')
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        // Remove only color property, preserve font-weight, font-style, text-decoration, margin, padding, etc.
        if (htmlEl.style.color) {
          htmlEl.style.removeProperty('color')
        }
        // Clean style attribute to remove color but keep everything else
        if (htmlEl.getAttribute('style')) {
          const style = htmlEl.getAttribute('style') || ''
          const cleanedStyle = style
            .split(';')
            .filter((s: string) => {
              const trimmed = s.trim().toLowerCase()
              return trimmed && !trimmed.startsWith('color') && !trimmed.startsWith('color:')
            })
            .join(';')
          if (cleanedStyle) {
            htmlEl.setAttribute('style', cleanedStyle)
          } else {
            htmlEl.removeAttribute('style')
          }
        }
      })
      
      // Insert the HTML exactly as formatted
      range.deleteContents()
      const fragment = range.createContextualFragment(tempDiv.innerHTML)
      range.insertNode(fragment)
      
      // Set cursor after inserted content
      let lastNode: Node | null = fragment.lastChild
      while (lastNode && lastNode.nodeType !== Node.TEXT_NODE && lastNode.hasChildNodes()) {
        lastNode = lastNode.lastChild
      }
      
      try {
        if (lastNode && lastNode.parentNode) {
          range.setStartAfter(lastNode)
          range.collapse(true)
        } else {
          const editor = e.currentTarget
          range.selectNodeContents(editor)
          range.collapse(false)
        }
      } catch (err) {
        const editor = e.currentTarget
        range.selectNodeContents(editor)
        range.collapse(false)
      }
      
      selection.removeAllRanges()
      selection.addRange(range)
      
      // Update content state
      setContent(e.currentTarget.innerHTML)
    } else {
      // Plain text fallback - preserve line breaks
      const lines = plainText.split('\n')
      const fragment = document.createDocumentFragment()
      
      lines.forEach((line, index) => {
        const textNode = document.createTextNode(line)
        fragment.appendChild(textNode)
        if (index < lines.length - 1) {
          fragment.appendChild(document.createElement('br'))
        }
      })
      
      range.deleteContents()
      range.insertNode(fragment)
      range.setStartAfter(fragment.lastChild || fragment)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      
      // Update content state
      setContent(e.currentTarget.innerHTML)
    }
  }, [])

  const handlePublish = useCallback(async () => {
    // Get actual text content from the editor
    const editor = editorRef.current || document.querySelector('[contenteditable="true"]') as HTMLElement
    const editorContent = editor?.innerHTML || content
    
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
      const finalContent = editor?.innerHTML || content
      
      if (blogId) {
        await updateBlog(blogId, {
          title: trimmedTitle,
          description: trimmedDescription,
          content: finalContent,
          image: image.trim(),
          tags,
          status: 'published'
        })
      } else {
        await createBlog({
          title: trimmedTitle,
          description: trimmedDescription,
          content: finalContent,
          image: image.trim(),
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
  }, [blogId, title, description, content, image, tags, router])

  const handleSaveDraft = useCallback(async () => {
    // Get actual text content from the editor
    const editor = editorRef.current || document.querySelector('[contenteditable="true"]') as HTMLElement
    const editorContent = editor?.innerHTML || content
    
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
      const finalContent = editor?.innerHTML || content
      
      if (blogId) {
        await updateBlog(blogId, {
          title: trimmedTitle,
          description: trimmedDescription,
          content: finalContent,
          image: image.trim(),
          tags,
          status: 'draft'
        })
      } else {
        await createBlog({
          title: trimmedTitle,
          description: trimmedDescription,
          content: finalContent,
          image: image.trim(),
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
  }, [blogId, title, description, content, image, tags, router])

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-white min-h-screen pt-16 md:pt-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-black mb-2">Create New Blog</h1>
        <p className="text-sm md:text-base text-gray-600 font-sans">Write and format your blog post</p>
      </div>

      <div className="bg-white border border-black p-4 md:p-6">
        {/* Toolbar */}
        <div className="mb-4 md:mb-6 flex flex-wrap gap-2 p-3 md:p-4 bg-white border border-black">
          <button
            onClick={() => handleFormat('bold')}
            className={`p-2 border border-black hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors ${
              isBold ? 'bg-purple-600 text-white border-purple-600' : 'text-black'
            }`}
            title="Bold"
          >
            <Bold className="h-3 w-3 md:h-4 md:w-4" />
          </button>
          <button
            onClick={() => handleFormat('italic')}
            className={`p-2 border border-black hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors ${
              isItalic ? 'bg-purple-600 text-white border-purple-600' : 'text-black'
            }`}
            title="Italic"
          >
            <Italic className="h-3 w-3 md:h-4 md:w-4" />
          </button>
          <button
            onClick={() => handleFormat('underline')}
            className={`p-2 border border-black hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors ${
              isUnderline ? 'bg-purple-600 text-white border-purple-600' : 'text-black'
            }`}
            title="Underline"
          >
            <Underline className="h-3 w-3 md:h-4 md:w-4" />
          </button>
          
          <div className="hidden sm:block w-px h-6 bg-black mx-2" />
          
          <select
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
            className="px-2 md:px-3 py-2 bg-white border border-black text-black text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 font-sans"
          >
            {fonts.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title Input */}
        <div className="mb-4 md:mb-6">
          <label className="block text-xs md:text-sm font-medium text-black mb-2 font-sans">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-black text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 font-sans text-sm md:text-base"
            placeholder="Enter blog title"
          />
        </div>

        {/* Description Input */}
        <div className="mb-4 md:mb-6">
          <label className="block text-xs md:text-sm font-medium text-black mb-2 font-sans">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-black text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 min-h-[80px] md:min-h-[100px] font-sans text-sm md:text-base"
            placeholder="Enter blog description"
          />
        </div>

        {/* Image Upload/URL Input */}
        <div className="mb-4 md:mb-6">
          <label className="block text-xs md:text-sm font-medium text-black mb-2 font-sans">Image</label>
          
          {/* Upload Button */}
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-input"
            />
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className="px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 border border-black text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-sans text-sm md:text-base"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                  <span className="text-xs md:text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs md:text-sm">Upload Image</span>
                </>
              )}
            </button>
            {uploadError && (
              <p className="mt-2 text-xs md:text-sm text-red-600 font-sans">{uploadError}</p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-black"></div>
            <span className="text-xs md:text-sm text-gray-600 font-sans">OR</span>
            <div className="flex-1 h-px bg-black"></div>
          </div>

          {/* URL Input */}
          <input
            type="url"
            value={image}
            onChange={(e) => {
              setImage(e.target.value)
              setUploadError(null)
            }}
            className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-black text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 font-sans text-sm md:text-base"
            placeholder="Enter image URL"
          />
          
          {/* Image Preview */}
          {image && (
            <div className="mt-3">
              <div className="relative inline-block">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="max-w-xs max-h-48 object-cover border border-black"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage('')
                    setUploadError(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 border border-black text-white transition-colors"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tags Input */}
        <div className="mb-4 md:mb-6">
          <label className="block text-xs md:text-sm font-medium text-black mb-2 font-sans">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1 px-3 md:px-4 py-2 bg-white border border-black text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 font-sans text-sm md:text-base"
              placeholder="Add a tag and press Enter"
            />
            <button
              onClick={handleAddTag}
              className="px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 border border-black text-white transition-colors font-sans text-sm md:text-base"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-100 border border-purple-600 text-purple-700 text-sm flex items-center gap-2 font-sans"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Content Editor */}
        <div className="mb-4 md:mb-6">
          <label className="block text-xs md:text-sm font-medium text-black mb-2 font-sans">Content</label>
          <div
            ref={(el) => {
              if (el) {
                editorRef.current = el
              }
            }}
            contentEditable
            onInput={handleEditorInput}
            onFocus={handleEditorFocus}
            onPaste={handleEditorPaste}
            className="w-full min-h-[300px] md:min-h-[400px] px-3 md:px-4 py-2 md:py-3 bg-white border border-black text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 font-sans text-sm md:text-base"
            style={{ fontFamily: selectedFont, color: '#000000', whiteSpace: 'pre-wrap' }}
            suppressContentEditableWarning
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-end">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-4 md:px-6 py-2 bg-white border border-black text-black hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-sans text-sm md:text-base"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gray-200 hover:bg-gray-300 border border-black text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-sans text-sm md:text-base"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="w-full sm:w-auto px-4 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 border border-black text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-sans text-sm md:text-base"
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black">Loading...</div>
      </div>
    }>
      <CreateBlogPageContent />
    </Suspense>
  )
}