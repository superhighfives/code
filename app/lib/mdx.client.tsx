import React from 'react'
import { useLoaderData } from 'react-router'
import { runSync } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { MDXProvider } from '@mdx-js/react'

export interface LoadData {
  __raw: string
  attributes: Record<string, any>
}

export const useMdxComponent = (components?: any) => {
  const { attributes, __raw } = useLoaderData<LoadData>()

  if (!__raw) {
    throw new Error('No MDX content found in loader data. Make sure you are using loadMdx in your route loader.')
  }

  try {
    const { default: Component } = runSync(__raw, {
      ...runtime,
      baseUrl: import.meta.url
    })

    return () => React.createElement(MDXProvider, null,
      React.createElement(Component, { components, ...attributes })
    )
  } catch (error) {
    console.error('Error rendering MDX component:', error)
    throw new Error('Failed to render MDX content')
  }
}

export const useMdxAttributes = () => {
  const { attributes } = useLoaderData<LoadData>()

  if (!attributes) {
    throw new Error('No MDX attributes found in loader data. Make sure you are using loadMdx in your route loader.')
  }

  return attributes
}