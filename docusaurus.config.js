// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer'
import path from 'path'

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
    // RAG Prep Plugin
    [
      path.resolve('./src/plugins/rag-prep-plugin'),
      {
        enabled: true,
        verbose: true,
      },
    ],
    // Search Index Generator Plugin
    path.resolve('./src/plugins/searchindex.js'),
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
        title: '',
        logo: {
          alt: 'RAG Plugin Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/demo',
            label: 'Demo',
            position: 'left',
          },
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
            href: 'https://github.com/mischegoss/ragsaurus',
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
            title: 'Demo',
            items: [
              {
                label: 'Watch Agents in Action',
                to: '/demo',
              },
            
            ],
          },
          {
            title: 'Development',
            items: [
              {
                label: 'Docusaurus Repository',
                href: 'https://github.com/mischegoss/100-agents-auber',
              },
              {
                label: 'Plugin Repository',
                href: 'https://github.com/mischegoss/ragsaurus',
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
