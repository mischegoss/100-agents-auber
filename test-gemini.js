// test-gemini.js - Run this to test your Gemini setup
const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config({ path: '.env.local' })

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
    Analyze this documentation content and suggest 5-8 relevant keywords that users might search for:

    Title: "Authentication Guide"
    Content: "Learn how to authenticate users in your application. We support login, logout, session management, and token refresh..."

    Return only a JSON array of keywords, like: ["keyword1", "keyword2", "keyword3"]
    `

    console.log('🤖 Testing Gemini AI...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log('✅ Gemini Response:', text)

    // Try to parse the JSON
    try {
      const keywords = JSON.parse(text.trim())
      console.log('✅ Parsed Keywords:', keywords)
    } catch (e) {
      console.log(
        '📝 Raw response (will clean up in real implementation):',
        text,
      )
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('API_KEY')) {
      console.log('💡 Make sure your GOOGLE_API_KEY is set in .env.local')
    }
  }
}

testGemini()
