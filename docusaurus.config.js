// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'RAG Plugin Demo',
  tagline: 'AI-Powered Documentation Enhancement for Docusaurus',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://rag-plugin-demo.web.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'yourusername', // Replace with your GitHub username
  projectName: 'rag-plugin-demo-site', // Replace with your repo name

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    // Enhanced docs (where your RAG plugin will work)
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-enhanced',
        path: 'docs-enhanced',
        routeBasePath: 'docs-enhanced',
        sidebarPath: './sidebars-enhanced.js',
        editUrl:
          'https://github.com/yourusername/rag-plugin-demo-site/tree/main/',
      },
    ],
    // Original docs (for comparison)
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs-original',
        path: 'docs-original',
        routeBasePath: 'docs-original',
        sidebarPath: './sidebars-original.js',
        editUrl:
          'https://github.com/yourusername/rag-plugin-demo-site/tree/main/',
      },
    ],
    // Your RAG plugin will go here
    // ['./src/plugins/rag-prep-plugin', {}],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // Remove the default docs - we're using custom plugins above
        docs: false,
        // Remove blog completely
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'RAG Plugin Demo',
        logo: {
          alt: 'RAG Plugin Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            docsPluginId: 'docs-enhanced',
            position: 'left',
            label: 'Enhanced Docs',
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            docsPluginId: 'docs-original',
            position: 'left',
            label: 'Original Docs',
          },
          {
            to: '/demo',
            label: 'Live Demo',
            position: 'left',
          },
          {
            to: '/analytics',
            label: 'Analytics',
            position: 'left',
          },
          {
            href: 'https://github.com/yourusername/rag-plugin-demo-site',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Enhanced Docs',
                to: '/docs-enhanced/intro',
              },
              {
                label: 'Original Docs',
                to: '/docs-original/intro',
              },
            ],
          },
          {
            title: 'Demo & Tools',
            items: [
              {
                label: 'Interactive Demo',
                to: '/demo',
              },
              {
                label: 'Analytics Dashboard',
                to: '/analytics',
              },
              {
                label: 'Plugin Documentation',
                to: '/docs-enhanced/plugin-setup',
              },
            ],
          },
          {
            title: 'Development',
            items: [
              {
                label: 'GitHub Repository',
                href: 'https://github.com/yourusername/rag-plugin-demo-site',
              },
              {
                label: 'Plugin Source',
                href: 'https://github.com/yourusername/docusaurus-rag-prep-plugin',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} RAG Plugin Demo. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
}

export default config
