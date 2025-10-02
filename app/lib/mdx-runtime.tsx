import React from 'react'
import type { MdxFile, MdxOptions } from './mdx.server'

// Import the virtual module that contains our build-time generated manifest
import manifest from 'virtual:mdx-manifest'

export async function getRuntimeMdxManifest(): Promise<{ files: MdxFile[] }> {
  return manifest
}

export async function loadMdxRuntime(request: Request): Promise<{ content: any, attributes: Record<string, any> }> {
  const url = new URL(request.url)
  const pathname = url.pathname

  const { files } = await getRuntimeMdxManifest()
  const mdxFile = files.find(file => file.urlPath === pathname || file.urlPath === pathname.replace(/\/$/, ''))

  if (!mdxFile) {
    throw new Response('Not Found', { status: 404 })
  }

  // Render the JSX content directly (not a component)
  const title = mdxFile.attributes.title || 'MDX Content'
  const description = mdxFile.attributes.description || ''

  const renderedContent = (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      <p>This MDX content is loaded from: {mdxFile.path}</p>
    </div>
  )

  return {
    content: renderedContent,
    attributes: mdxFile.attributes,
  }
}

export async function loadAllMdxRuntime(filterByPaths?: string[]): Promise<Array<{ path: string, slug: string, [key: string]: any }>> {
  const { files } = await getRuntimeMdxManifest()

  let filteredFiles = files

  if (filterByPaths && filterByPaths.length > 0) {
    filteredFiles = files.filter(file =>
      filterByPaths.some(path => file.urlPath.startsWith(`/${path}/`))
    )
  }

  return filteredFiles.map(file => ({
    path: file.path,
    slug: file.slug,
    ...file.attributes,
  }))
}

export function getMdxRoutesRuntime() {
  // Return a synchronous function that returns routes based on build-time manifest
  // This will be used by the routes.ts file
  return []  // We'll need to handle this differently
}