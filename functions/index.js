const functions = require('firebase-functions')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const fetch = require('node-fetch')
// const { Octokit } = require("@octokit/rest");

exports.processChatAndOtherActions = functions.https.onCall(
  {
    secrets: [
      'GOOGLE_API_KEY',
      'TAVILY_API_KEY',
      'GITHUB_TOKEN',
      'GITHUB_OWNER',
      'GITHUB_REPO',
    ],
  },
  async (data, context) => {
    const googleApiKey = process.env.GOOGLE_API_KEY
    const tavilyApiKey = process.env.TAVILY_API_KEY
    const githubToken = process.env.GITHUB_TOKEN
    const githubOwner = process.env.GITHUB_OWNER
    const githubRepo = process.env.GITHUB_REPO

    if (!googleApiKey) {
      throw new functions.https.HttpsError(
        'internal',
        'GOOGLE_API_KEY not configured.',
      )
    }
    if (!tavilyApiKey) {
      throw new functions.https.HttpsError(
        'internal',
        'TAVILY_API_KEY not configured.',
      )
    }

    const userMessage = data.message || 'Tell me a fun fact.'
    let geminiResponse = 'No Gemini response.'

    try {
      const genAI = new GoogleGenerativeAI(googleApiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      const result = await model.generateContent(userMessage)
      const response = await result.response
      geminiResponse = response.text()
      functions.logger.info('Gemini response received.')
    } catch (error) {
      functions.logger.error('Error calling Gemini API:', error)
      geminiResponse = `AI thought error: ${error.message}`
    }

    const searchQuery = data.query || 'latest tech news'
    let tavilySearchResults = []
    try {
      if (tavilyApiKey && searchQuery) {
        const tavilyResponse = await fetch('https://api.tavily.com/rpc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: tavilyApiKey,
            query: searchQuery,
          }),
        })
        const tavilyData = await tavilyResponse.json()
        tavilySearchResults = tavilyData.results
        functions.logger.info('Tavily search results received.')
      } else {
        functions.logger.warn('Tavily API call skipped: Key or query missing.')
      }
    } catch (error) {
      functions.logger.error('Error calling Tavily API:', error)
    }

    let githubActionStatus = 'No GitHub action performed.'
    const actionType = data.action || 'none'
    if (
      githubToken &&
      githubOwner &&
      githubRepo &&
      actionType === 'create_issue'
    ) {
      try {
        // const octokit = new Octokit({ auth: githubToken });
        // const issueTitle = data.issueTitle || "New issue from chatbot";
        // const issueBody = data.issueBody || "Details from user interaction.";
        // const { data: issue } = await octokit.rest.issues.create({
        //   owner: githubOwner,
        //   repo: githubRepo,
        //   title: issueTitle,
        //   body: issueBody,
        // });
        // githubActionStatus = `GitHub issue created: ${issue.html_url}`;
        githubActionStatus =
          'GitHub placeholder: Issue creation logic would go here.'
        functions.logger.info(githubActionStatus)
      } catch (error) {
        functions.logger.error('Error performing GitHub action:', error)
        githubActionStatus = 'GitHub placeholder: Failed to perform action.'
      }
    }

    return {
      success: true,
      geminiResponse: geminiResponse,
      tavilyResults: tavilySearchResults,
      githubStatus: githubActionStatus,
    }
  },
)
