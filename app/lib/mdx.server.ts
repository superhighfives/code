import { compile } from '@mdx-js/mdx'
import { glob, globSync } from 'glob'
import matter from 'gray-matter'
import { resolve, join, relative } from 'path'
import { readFile } from 'fs/promises'
import { readFileSync } from 'fs'
import remarkFrontmatter from 'remark-frontmatter'

export interface MdxOptions {
  path?: string
  paths?: string[]
  alias?: string
  aliases?: string[]
}

export interface MdxFile {
  path: string
  slug: string
  urlPath: string
  attributes: Record<string, any>
  compiledSource?: string
}

export interface MdxManifest {
  files: MdxFile[]
}

let options: MdxOptions = {}

export function setOptions(newOptions: MdxOptions) {
  options = newOptions
}

export function getOptions(): MdxOptions {
  return options
}

function getAliases(options: MdxOptions) {
  if ('alias' in options && options.alias) {
    return [options.alias]
  }
  if ('aliases' in options && options.aliases) {
    return options.aliases
  }
  return undefined
}

function getPaths(options: MdxOptions): string[] {
  if ('path' in options && typeof options.path === 'string') {
    return [options.path]
  }
  return options.paths || []
}

export function transformFilePathToUrlPath(filePath: string, basePath: string, alias?: string): string {
  const relativePath = relative(resolve(process.cwd(), basePath), filePath)
  const urlPath = relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/')

  const finalAlias = alias || basePath
  return `/${finalAlias}/${urlPath}`
}

export async function listMdxFiles(paths: string[]): Promise<string[][]> {
  const allFilesPromises = paths.map(async (path: string) => {
    const pattern = resolve(process.cwd(), path, '**', '*.{md,mdx}')
    return glob(pattern, { windowsPathsNoEscape: true })
  })

  return Promise.all(allFilesPromises)
}

export function listMdxFilesSync(paths: string[]): string[][] {
  return paths.map(path => {
    const pattern = resolve(process.cwd(), path, '**', '*.{md,mdx}')
    return globSync(pattern, { windowsPathsNoEscape: true })
  })
}

export async function processMdxFile(filePath: string): Promise<{ attributes: Record<string, any>, compiledSource: string }> {
  const content = await readFile(filePath, 'utf-8')
  const { data: attributes, content: mdxContent } = matter(content)

  const compiled = await compile(mdxContent, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkFrontmatter],
    development: process.env.NODE_ENV === 'development'
  })

  return {
    attributes,
    compiledSource: String(compiled)
  }
}

export function processMdxFileSync(filePath: string): { attributes: Record<string, any> } {
  const content = readFileSync(filePath, 'utf-8')
  const { data: attributes } = matter(content)

  return { attributes }
}

export async function generateMdxManifest(): Promise<MdxManifest> {
  const paths = getPaths(options)
  const aliases = getAliases(options)

  if (paths.length === 0) {
    throw new Error('No MDX paths configured. Use init() to set up paths.')
  }

  const pathsFiles = await listMdxFiles(paths)

  const files: MdxFile[] = []

  for (let pathIndex = 0; pathIndex < pathsFiles.length; pathIndex++) {
    const pathFiles = pathsFiles[pathIndex]
    const basePath = paths[pathIndex]
    const alias = aliases?.[pathIndex]

    for (const filePath of pathFiles) {
      const { attributes, compiledSource } = await processMdxFile(filePath)
      const urlPath = transformFilePathToUrlPath(filePath, basePath, alias)
      const slug = relative(resolve(process.cwd(), basePath), filePath)
        .replace(/\.mdx?$/, '')
        .replace(/\\/g, '/')

      files.push({
        path: filePath,
        slug,
        urlPath,
        attributes,
        compiledSource
      })
    }
  }

  return { files }
}

export function generateMdxManifestSync(): MdxManifest {
  const paths = getPaths(options)
  const aliases = getAliases(options)

  if (paths.length === 0) {
    throw new Error('No MDX paths configured. Use init() to set up paths.')
  }

  const pathsFiles = listMdxFilesSync(paths)

  const files: MdxFile[] = []

  for (let pathIndex = 0; pathIndex < pathsFiles.length; pathIndex++) {
    const pathFiles = pathsFiles[pathIndex]
    const basePath = paths[pathIndex]
    const alias = aliases?.[pathIndex]

    for (const filePath of pathFiles) {
      const { attributes } = processMdxFileSync(filePath)
      const urlPath = transformFilePathToUrlPath(filePath, basePath, alias)
      const slug = relative(resolve(process.cwd(), basePath), filePath)
        .replace(/\.mdx?$/, '')
        .replace(/\\/g, '/')

      files.push({
        path: filePath,
        slug,
        urlPath,
        attributes
      })
    }
  }

  return { files }
}

export async function getMdxFileByUrl(url: string): Promise<MdxFile | undefined> {
  const manifest = await generateMdxManifest()
  return manifest.files.find(file => file.urlPath === url || file.urlPath === url.replace(/\/$/, ''))
}

export function getMdxFileByUrlSync(url: string): MdxFile | undefined {
  const manifest = generateMdxManifestSync()
  return manifest.files.find(file => file.urlPath === url || file.urlPath === url.replace(/\/$/, ''))
}