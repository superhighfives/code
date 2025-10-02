const { useLoaderData } = require('react-router');
const { runSync } = require('@mdx-js/mdx');
const runtime = require('react/jsx-runtime');
const { MDXProvider } = require('@mdx-js/react');

function useMdxComponent(components) {
  const { attributes, __raw } = useLoaderData();

  if (!__raw) {
    throw new Error('No MDX content found in loader data. Make sure you are using loadMdx in your route loader.');
  }

  try {
    const { default: Component } = runSync(__raw, {
      ...runtime,
      baseUrl: 'file://' + __filename
    });

    return function MdxComponent() {
      return React.createElement(MDXProvider, null,
        React.createElement(Component, { components, ...attributes })
      );
    };
  } catch (error) {
    console.error('Error rendering MDX component:', error);
    throw new Error('Failed to render MDX content');
  }
}

function useMdxAttributes() {
  const { attributes } = useLoaderData();

  if (!attributes) {
    throw new Error('No MDX attributes found in loader data. Make sure you are using loadMdx in your route loader.');
  }

  return attributes;
}

module.exports = { useMdxComponent, useMdxAttributes };