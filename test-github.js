// test-github.js - Run this to test your GitHub setup
const { Octokit } = require('@octokit/rest')
require('dotenv').config({ path: '.env.local' })

async function testGitHub() {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    })

    console.log('🐙 Testing GitHub API...')

    // Test 1: Get user info
    const { data: user } = await octokit.rest.users.getAuthenticated()
    console.log('✅ Authenticated as:', user.login)

    // Test 2: List your repos (first 5)
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 5,
      sort: 'updated',
    })

    console.log('✅ Recent repos:')
    repos.forEach(repo => {
      console.log(`  - ${repo.name} (${repo.private ? 'private' : 'public'})`)
    })

    // Test 3: Find specific repo by name
    const TARGET_REPO_NAME = '100-agents-auber' // Change this to your actual repo name

    try {
      const { data: targetRepo } = await octokit.rest.repos.get({
        owner: user.login,
        repo: TARGET_REPO_NAME,
      })

      console.log(`✅ Found target repo: ${targetRepo.name}`)
      console.log(`   URL: ${targetRepo.html_url}`)
      console.log(`   Default branch: ${targetRepo.default_branch}`)

      // Test 4: Check for docs folder
      try {
        const { data: contents } = await octokit.rest.repos.getContent({
          owner: user.login,
          repo: TARGET_REPO_NAME,
          path: 'docs/sample-docs',
        })

        const docFiles = contents.filter(file => file.name.endsWith('.md'))
        console.log(
          `✅ Found ${docFiles.length} markdown files in docs/sample-docs/`,
        )
        docFiles.forEach(file => {
          console.log(`   - ${file.name}`)
        })
      } catch (error) {
        console.log(
          '💡 No docs/sample-docs/ folder found - create some sample docs',
        )

        // Fallback: check if regular docs/ exists
        try {
          const { data: fallbackContents } =
            await octokit.rest.repos.getContent({
              owner: user.login,
              repo: TARGET_REPO_NAME,
              path: 'docs',
            })
          console.log('📁 Found docs/ folder but expected docs/sample-docs/')
        } catch (fallbackError) {
          console.log('📁 No docs/ folder found either')
        }
      }
    } catch (error) {
      if (error.status === 404) {
        console.log(`❌ Repo "${TARGET_REPO_NAME}" not found`)
        console.log('💡 Either:')
        console.log(`   1. Change TARGET_REPO_NAME to your actual repo name`)
        console.log(`   2. Create a repo called "${TARGET_REPO_NAME}"`)
        console.log('📋 Your repos:')
        repos.slice(0, 10).forEach(repo => {
          console.log(`   - ${repo.name}`)
        })
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.status === 401) {
      console.log('💡 Check your GITHUB_TOKEN in .env.local')
      console.log('💡 Make sure token has "repo" permissions')
    }
  }
}

testGitHub()
