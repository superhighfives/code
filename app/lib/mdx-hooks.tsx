import React from 'react'
import { useLoaderData } from 'react-router'
import { MDXProvider } from '@mdx-js/react'

export interface LoadData {
  content: React.ComponentType<any>
  attributes: Record<string, any>
}

const useMdxComponent = (components?: any) => {
  const { content: Component, attributes } = useLoaderData<LoadData>()

  if (!Component) {
    throw new Error('No MDX component found in loader data. Make sure you are using loadMdx in your route loader.')
  }

  return () => React.createElement(MDXProvider, null,
    React.createElement(Component, { components, ...attributes })
  )
}

const useMdxAttributes = () => {
  const { attributes } = useLoaderData<LoadData>()

  if (!attributes) {
    throw new Error('No MDX attributes found in loader data. Make sure you are using loadMdx in your route loader.')
  }

  return attributes
}

export default {
  useMdxComponent,
  useMdxAttributes
}