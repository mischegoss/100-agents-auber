// src/plugins/doc-steward/utils.js - Shared utilities
const fs = require('fs-extra')
const path = require('path')

class Utils {
  /**
   * Validate environment variables
   */
  static validateEnvironment() {
    const required = []
    const optional = []

    if (!process.env.GOOGLE_API_KEY) {
      required.push('GOOGLE_API_KEY (for Gemini AI)')
    }

    if (!process.env.TAVILY_API_KEY) {
      optional.push('TAVILY_API_KEY (for context crawling)')
    }

    if (required.length > 0) {
      throw new Error(
        `Missing required environment variables: ${required.join(', ')}`,
      )
    }

    if (optional.length > 0) {
      console.warn(
        `⚠️ Optional environment variables not set: ${optional.join(', ')}`,
      )
    }

    return true
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  /**
   * Format duration in human readable format
   */
  static formatDuration(startTime, endTime = Date.now()) {
    const duration = endTime - startTime
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  /**
   * Create safe filename from title
   */
  static createSafeFilename(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }

  /**
   * Deep clone object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj)
    if (obj instanceof Array) return obj.map(item => Utils.deepClone(item))
    if (typeof obj === 'object') {
      const cloned = {}
      Object.keys(obj).forEach(key => {
        cloned[key] = Utils.deepClone(obj[key])
      })
      return cloned
    }
  }

  /**
   * Merge arrays and remove duplicates
   */
  static mergeUnique(arr1, arr2, compareKey = null) {
    const combined = [...arr1, ...arr2]

    if (compareKey) {
      const seen = new Set()
      return combined.filter(item => {
        const key = item[compareKey]
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    return [...new Set(combined)]
  }

  /**
   * Wait for specified milliseconds
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry(fn, maxAttempts = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        if (attempt === maxAttempts) throw error

        const delay = baseDelay * Math.pow(2, attempt - 1)
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
        await Utils.delay(delay)
      }
    }
  }

  /**
   * Sanitize text for search
   */
  static sanitizeForSearch(text) {
    if (!text) return ''

    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Extract meaningful words from text
   */
  static extractWords(text, minLength = 3, maxLength = 20) {
    if (!text) return []

    const stopWords = new Set([
      'the',
      'and',
      'for',
      'are',
      'but',
      'not',
      'you',
      'all',
      'can',
      'had',
      'her',
      'was',
      'one',
      'our',
      'out',
      'day',
      'get',
      'has',
      'him',
      'his',
      'how',
      'man',
      'new',
      'now',
      'old',
      'see',
      'two',
      'way',
      'who',
      'boy',
      'did',
      'its',
      'let',
      'put',
      'say',
      'she',
      'too',
      'use',
      'will',
      'with',
    ])

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(
        word =>
          word.length >= minLength &&
          word.length <= maxLength &&
          !stopWords.has(word) &&
          !/^\d+$/.test(word), // Filter out numbers
      )
  }

  /**
   * Calculate similarity between two strings
   */
  static calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0

    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const distance = Utils.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  static levenshteinDistance(str1, str2) {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Create hash from string
   */
  static createHash(str) {
    let hash = 0
    if (str.length === 0) return hash

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return hash.toString(36)
  }

  /**
   * Validate URL
   */
  static isValidUrl(string) {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  /**
   * Create progress indicator
   */
  static createProgressIndicator(current, total, width = 20) {
    const percentage = Math.round((current / total) * 100)
    const filled = Math.round((current / total) * width)
    const empty = width - filled

    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    return `[${bar}] ${percentage}% (${current}/${total})`
  }

  /**
   * Log with timestamp
   */
  static log(message, level = 'info') {
    const timestamp = new Date().toISOString()
    const prefix =
      {
        info: '📝',
        warn: '⚠️',
        error: '❌',
        success: '✅',
      }[level] || '📝'

    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  /**
   * Ensure directory exists
   */
  static async ensureDir(dirPath) {
    try {
      await fs.ensureDir(dirPath)
      return true
    } catch (error) {
      console.error(`Failed to create directory ${dirPath}:`, error)
      return false
    }
  }

  /**
   * Read JSON file safely
   */
  static async readJsonFile(filePath, defaultValue = null) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      return JSON.parse(content)
    } catch (error) {
      if (defaultValue !== null) {
        return defaultValue
      }
      throw error
    }
  }

  /**
   * Write JSON file safely
   */
  static async writeJsonFile(filePath, data, pretty = true) {
    try {
      await Utils.ensureDir(path.dirname(filePath))
      const content = pretty
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data)
      await fs.writeFile(filePath, content)
      return true
    } catch (error) {
      console.error(`Failed to write JSON file ${filePath}:`, error)
      return false
    }
  }
}

module.exports = Utils
