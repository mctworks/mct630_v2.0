// ContentfulRichText.tsx - COMPLETE FIXED VERSION
import { Options, documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import clsx from 'clsx'
import { isDevelopment } from 'utils/isDevelopment'

import { Warning } from '@/components/Warning'
import { ResolvedField, isRichText, useEntryField } from '@/lib/contentful/utils'

type Props = {
  className?: string
  textColor?: 'default' | 'white' | 'gray'
  field: ResolvedField
  bannerUrl?: string
  alignment?: 'left' | 'center' | 'right'
  h1ClassName?: string
  h2ClassName?: string
  h3ClassName?: string
  h4ClassName?: string
  h5ClassName?: string
  h6ClassName?: string
}

// Create options with heading classes
const createOptions = (props: Props): Options => ({
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className={clsx("mb-4 leading-relaxed", props.className)}>{children}</p>
    ),
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 className={clsx("mb-4 text-4xl font-bold", props.h1ClassName)}>{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className={clsx("mb-3 text-3xl font-bold", props.h2ClassName)}>{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className={clsx("mb-3 text-2xl font-bold", props.h3ClassName)}>{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node, children) => (
      <h4 className={clsx("mb-3 text-xl font-bold", props.h4ClassName)}>{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (node, children) => (
      <h5 className={clsx("mb-3 text-lg font-bold", props.h5ClassName)}>{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (node, children) => (
      <h6 className={clsx("mb-3 text-base font-bold", props.h6ClassName)}>{children}</h6>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="mb-4 list-disc pl-6">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="mb-4 list-decimal pl-6">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="mb-2">{children}</li>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="mb-4 border-l-4 border-gray-300 pl-4 italic">{children}</blockquote>
    ),
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
    // Inline asset hyperlinks (images embedded inline)
    [INLINES.ASSET_HYPERLINK]: (node) => {
      const target = (node.data && node.data.target) || {}
      const url = target?.fields?.file?.url || target?.file?.url || target?.url
      if (!url) return null
      const src = String(url).startsWith('//') ? `https:${url}` : String(url)
      const alt = target?.fields?.title || target?.fields?.description || ''
      // If this inline asset matches the banner, skip rendering to avoid duplicate banner
      try {
        const banner = props.bannerUrl ? (String(props.bannerUrl).startsWith('//') ? `https:${props.bannerUrl}` : String(props.bannerUrl)) : null
        if (banner && banner === src) return null
      } catch (e) {
        // ignore
      }
      return <img src={src} alt={alt} className="inline-block max-w-full align-middle rounded" />
    },
    // Embedded entries may contain images or other media - attempt to resolve image file
    [BLOCKS.EMBEDDED_ENTRY]: (node) => {
      const target = (node.data && node.data.target) || {}
      // Common shapes: target.fields.file.url, target.fields.image.fields.file.url
      const url = target?.fields?.file?.url || target?.fields?.image?.fields?.file?.url || target?.file?.url || target?.url
      if (!url) return null
      const src = String(url).startsWith('//') ? `https:${url}` : String(url)
      const alt = target?.fields?.title || target?.fields?.description || ''
      return (
        <div className="my-6">
          <img src={src} alt={alt} className="mx-auto my-4 max-w-full rounded" />
        </div>
      )
    },
    // Render embedded assets (images) inside rich text
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      // First try to resolve the asset from the document's links (recommended)
      const id = node?.data?.target?.sys?.id
      let asset: any = null
      try {
        const links = (props.field as any).data?.links
        if (links) {
          const blockAssets = links?.assets?.block || []
          const inlineAssets = links?.assets?.inline || []
          asset = [...blockAssets, ...inlineAssets].find((a: any) => a?.sys?.id === id) || null
        }
      } catch (err) {
        // ignore
      }

      // Fallback to any shape present on the node itself
      const url = asset?.url || asset?.fields?.file?.url || node?.data?.target?.url || null
      if (!url) return null
      const src = String(url).startsWith('//') ? `https:${url}` : String(url)
      // If a bannerUrl prop was passed and it matches this embedded asset URL, skip rendering
      try {
        const banner = props.bannerUrl ? (String(props.bannerUrl).startsWith('//') ? `https:${props.bannerUrl}` : String(props.bannerUrl)) : null
        if (banner && banner === src) return null
      } catch (e) {
        // ignore
      }
      const alt = asset?.title || asset?.fields?.title || asset?.description || ''
      return (
        <div className="my-6">
          <img src={src} alt={alt} className="mx-auto my-4 max-w-full rounded" />
        </div>
      )
    },
  },
})

function proseRichTextColor(textColor: Props['textColor']) {
  switch (textColor) {
    case 'white':
      return 'prose-headings:text-white prose-p:text-white'
    case 'gray':
      return 'prose-headings:text-gray-600 prose-p:text-gray-600'
    default:
      return ''
  }
}

export function ContentfulRichText({ 
  className, 
  textColor, 
  field, 
  bannerUrl,
  alignment = 'left',
  h1ClassName,
  h2ClassName,
  h3ClassName,
  h4ClassName,
  h5ClassName,
  h6ClassName,
}: Props) {
  if ('error' in field) {
    if (isDevelopment()) return <Warning className={className}>{field.error}</Warning>
    return null
  }

  if (!isRichText(field.data)) {
    if (isDevelopment()) return <Warning className={className}>Text is not a Document.</Warning>
    return null
  }

  const options = createOptions({
    h1ClassName,
    h2ClassName,
    h3ClassName,
    h4ClassName,
    h5ClassName,
    h6ClassName,
    className,
    textColor,
    bannerUrl,
    field,
    alignment
  })

  // Development-only debug: log node types and embedded asset counts to help diagnose missing images
  if (isDevelopment() && field && typeof field === 'object' && 'data' in field && field.data && typeof field.data === 'object') {
    try {
      const doc = (field as any).data.json
      if (doc && doc.nodeType === 'document') {
        const flat = JSON.stringify(doc, (k, v) => (k === 'content' ? (Array.isArray(v) ? `[${v.length} items]` : v) : v), 2)
        // eslint-disable-next-line no-console
        console.debug('ContentfulRichText - document preview:', { nodeCount: doc.content?.length ?? 0, sample: flat.slice(0, 1000) })

        // Count embedded asset nodes
        let embeddedCount = 0
        const walk = (node: any) => {
          if (!node || typeof node !== 'object') return
          if (node.nodeType && (node.nodeType === 'embedded-asset-block' || node.nodeType === 'embedded-asset-inline')) embeddedCount++
          if (Array.isArray(node.content)) node.content.forEach(walk)
        }
        walk(doc)
        // eslint-disable-next-line no-console
        console.debug('ContentfulRichText - embedded asset nodes found:', embeddedCount)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to analyze rich text document for debugging', err)
    }
  }

  // Create alignment classes
  const alignmentClasses = {
    left: 'items-start text-left',
    right: 'items-end text-right',
    center: 'items-center text-center',
  }[alignment]

  return (
    <div
      className={clsx(
       'prose',
        alignmentClasses,
        proseRichTextColor(textColor),
        //className
      )}
    >
      {documentToReactComponents(field.data.json, options)}
    </div>
  )
}