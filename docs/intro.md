---
sidebar_position: 1
---

# Doc Steward Tutorial Intro

Let's discover **Doc Steward Search Optimizer in less than 5 minutes**.

## Getting Started

Get started by **adding intelligent search to your docs**.

Or **try Doc Steward immediately** with our **[live demo](https://docsteward-demo.com)**.

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 18.0 or above:
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.
- A Docusaurus site (existing or new)
- OpenAI API key for AI-powered enhancements

## Install the plugin

Add Doc Steward Search Optimizer to your existing Docusaurus site using the **official plugin**.

The plugin will automatically be added to your project after you run the command:

```bash
npm install @docsteward/search-optimizer
```

You can type this command into Command Prompt, Powershell, Terminal, or any other integrated terminal of your code editor.

The command also installs all necessary dependencies you need to run Doc Steward's AI-powered search enhancement.

## Configure your site

Add the plugin to your Docusaurus configuration:

```javascript
// docusaurus.config.js
module.exports = {
  plugins: [
    [
      '@docsteward/search-optimizer',
      {
        openaiApiKey: process.env.OPENAI_API_KEY,
        scheduleOptimization: 'weekly',
        enableSlackAlerts: true,
      },
    ],
  ],
}
```

## Optimize your search

Run the AI-powered optimization:

```bash
npx docusaurus optimize-search
```

This command analyzes your documentation, generates missing keywords and synonyms, and enriches your search index using intelligent AI agents. The process only scans changed files using GitHub diff detection for maximum efficiency.
