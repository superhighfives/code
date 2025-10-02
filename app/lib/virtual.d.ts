declare module 'virtual:mdx-manifest' {
  import type { MdxFile } from './mdx.server'
  const manifest: { files: MdxFile[] }
  export default manifest
}

declare module 'virtual:mdx-routes' {
  import type { RouteConfigEntry } from "@react-router/dev/routes"
  export const mdxRoutes: RouteConfigEntry[]
}