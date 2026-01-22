// components/Contentful/entries/BlogPost/StyledRichTextWrapper.tsx - FIXED
'use client'

import { useEffect } from 'react'

interface StyledRichTextWrapperProps {
  containerClassName?: string
  headingsClassName?: string
  textClassName?: string
  codeClassName?: string
  children: React.ReactNode
}

export function StyledRichTextWrapper({
  containerClassName,
  headingsClassName,
  textClassName,
  codeClassName,
  children
}: StyledRichTextWrapperProps) {
  useEffect(() => {
    // Inject CSS to target specific elements
    const styleId = 'makeswift-rich-text-styles'
    const existingStyle = document.getElementById(styleId)
    
    if (existingStyle) {
      existingStyle.remove()
    }
    
    if (headingsClassName || textClassName || codeClassName) {
      const style = document.createElement('style')
      style.id = styleId
      
      // Extract the actual CSS class names from Makeswift class strings
      const getActualClass = (className?: string) => {
        if (!className) return ''
        // Makeswift classes look like "mswft-abc123 u-_r_2_-bodyHeadingsStyle"
        // We need to target the actual CSS class
        const classes = className.split(' ')
        return classes.find(c => c.startsWith('mswft-')) || ''
      }
      
      const headingsClass = getActualClass(headingsClassName)
      const textClass = getActualClass(textClassName)
      const codeClass = getActualClass(codeClassName)
      
      style.textContent = `
        ${headingsClass ? `
          .${headingsClass} h1,
          .${headingsClass} h2,
          .${headingsClass} h3,
          .${headingsClass} h4,
          .${headingsClass} h5,
          .${headingsClass} h6 {
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            letter-spacing: inherit !important;
            color: inherit !important;
            /* DO NOT inherit font-size - keep heading sizes */
          }
        ` : ''}
        
        ${textClass ? `
          .${textClass} p,
          .${textClass} ul,
          .${textClass} ol,
          .${textClass} li,
          .${textClass} blockquote {
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            letter-spacing: inherit !important;
            color: inherit !important;
          }
        ` : ''}
        
        ${codeClass ? `
          .${codeClass} code,
          .${codeClass} pre {
            font-family: monospace !important;
            font-size: inherit !important;
            color: inherit !important;
            background: inherit !important;
            border: inherit !important;
          }
        ` : ''}
      `
      
      document.head.appendChild(style)
      return () => style.remove()
    }
  }, [headingsClassName, textClassName, codeClassName])
  
  return <div className={containerClassName}>{children}</div>
}