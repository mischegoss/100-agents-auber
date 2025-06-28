---
sidebar_position: 6
description: >-
  Master Docusaurus Markdown! Learn front matter, links, images, code blocks,
  admonitions, and MDX. Enhance your documentation with interactive React
  component...
tags:
  - docusaurus
  - markdown
  - documentation
  - react
  - mdx
keywords:
  - docusaurus markdown
  - markdown syntax
  - docusaurus documentation
  - front matter
  - mdx react
  - code blocks
topics:
  - markdown
  - markdown/syntax
  - markdown/formatting
  - markdown/links
  - markdown/images
  - markdown/code blocks
categories:
  - guide
  - development
  - reference
  - documentation
audience:
  - developers
  - technical writers
  - beginners
  - content-creators
prerequisites:
  - basic-markdown
  - html-knowledge
difficulty: beginner
complexity: low
contentType: guide
domainArea: development
primaryTopic: markdown features
category: Documentation
ragScore: 94
agentCount: 4
researchConducted: true
researchDate: '2025-06-28'
researchSources: 13
researchScore: 100
tavilyIntegration: true
---

# Markdown Features

Docusaurus supports **[Markdown](https://daringfireball.net/projects/markdown/syntax)** and a few **additional features**.

## Front Matter

Markdown documents have metadata at the top called [Front Matter](https://jekyllrb.com/docs/front-matter/):

```text title="my-doc.md"
// highlight-start
---
id: my-doc-id
title: My document title
description: My document description
slug: /my-custom-url
---
// highlight-end

## Markdown heading

Markdown text with [links](./hello.md)
```

## Links

Regular Markdown links are supported, using url paths or relative file paths.

```md
Let's see how to [Create a page](/create-a-page).
```

```md
Let's see how to [Create a page](./create-a-page.md).
```

**Result:** Let's see how to [Create a page](./create-a-page.md).

## Images

Regular Markdown images are supported.

You can use absolute paths to reference images in the static directory (`static/img/docusaurus.png`):

```md
![Docusaurus logo](/img/docusaurus.png)
```

![Docusaurus logo](/img/docusaurus.png)

You can reference images relative to the current file as well. This is particularly useful to colocate images close to the Markdown files using them:

```md
![Docusaurus logo](./img/docusaurus.png)
```

## Code Blocks

Markdown code blocks are supported with Syntax highlighting.

````md
```jsx title="src/components/HelloDocusaurus.js"
function HelloDocusaurus() {
  return <h1>Hello, Docusaurus!</h1>;
}
```
````

```jsx title="src/components/HelloDocusaurus.js"
function HelloDocusaurus() {
  return <h1>Hello, Docusaurus!</h1>;
}
```

## Admonitions

Docusaurus has a special syntax to create admonitions and callouts:

```md
:::tip My tip

Use this awesome feature option

:::

:::danger Take care

This action is dangerous

:::
```

:::tip My tip

Use this awesome feature option

:::

:::danger Take care

This action is dangerous

:::

## MDX and React Components

[MDX](https://mdxjs.com/) can make your documentation more **interactive** and allows using any **React components inside Markdown**:

```jsx
export const Highlight = ({children, color}) => (
  <span
    style={{
      backgroundColor: color,
      borderRadius: '20px',
      color: '#fff',
      padding: '10px',
      cursor: 'pointer',
    }}
    onClick={() => {
      alert(`You clicked the color ${color} with label ${children}`)
    }}>
    {children}
  </span>
);

This is <Highlight color="#25c2a0">Docusaurus green</Highlight> !

This is <Highlight color="#1877F2">Facebook blue</Highlight> !
```

export const Highlight = ({children, color}) => (
  <span
    style={{
      backgroundColor: color,
      borderRadius: '20px',
      color: '#fff',
      padding: '10px',
      cursor: 'pointer',
    }}
    onClick={() => {
      alert(`You clicked the color ${color} with label ${children}`);
    }}>
    {children}
  </span>
);

This is <Highlight color="#25c2a0">Docusaurus green</Highlight> !

This is <Highlight color="#1877F2">Facebook blue</Highlight> !


## 🏆 Current Best Practices (2025)

Based on recent industry research:

- **tips Provide feedback We read every piece of feedback, and take your input very seriously\**: tips Provide feedback We read every piece of feedback, and take your input very seriously\.
- **must be signed in to change notification settings Fork 444 Star 5\**: must be signed in to change notification settings Fork 444 Star 5\.
- **Best practices for GitHub Docs Follow these best practices to create documentation that's user-friendly and easy to understand\**: Best practices for GitHub Docs Follow these best practices to create documentation that's user-friendly and easy to understand\.

## 📋 Industry Standards & Compliance

- **ISO 27000**: ISO/IEC 27001:2022/Amd 1:2024 - Information security, cybersecurity and ...

## 📚 Additional Resources

- [storybook/code/addons/docs/docs/mdx.md at next - GitHub](https://github.com/storybookjs/storybook/blob/next/code/addons/docs/docs/mdx.md)
- [MDX Docs - GitHub](https://github.com/jxnblk/mdx-docs)
- [GitHub - thequietmind/mdx-docs: An MDX documentation app](https://github.com/thequietmind/mdx-docs)

## 🔧 Related Tools & Technologies

- **Node.js**: Modern tool for untitled
- **Next.js**: Modern tool for untitled

