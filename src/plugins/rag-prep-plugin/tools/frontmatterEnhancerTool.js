const fs = require('fs-extra')
const matter = require('gray-matter')
const path = require('path')

/**
 * Frontmatter Enhancer Tool
 * Writes enhanced metadata back to markdown files
 */
class FrontmatterEnhancerTool {
  constructor() {
    this.name = 'frontmatter-enhancer'
    this.description =
      'Enhances markdown file frontmatter with AI-generated metadata'
  }

  /**
   * Enhance a markdown file with new frontmatter
   */
  async enhanceFile(filePath, enhancedMetadata, originalContent) {
    try {
      console.log(`📝 [Frontmatter Tool] Enhancing: ${path.basename(filePath)}`)

      // Parse the original file
      const parsed = matter(originalContent)

      // Clean the enhanced metadata to avoid YAML formatting issues
      const cleanedMetadata = { ...enhancedMetadata }

      // Ensure description is a clean single-line string
      if (cleanedMetadata.description) {
        cleanedMetadata.description = cleanedMetadata.description
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      }

      // Merge original metadata with enhancements (enhanced takes precedence)
      const mergedMetadata = {
        ...parsed.data,
        ...cleanedMetadata,
        // Add processing metadata
        enhanced_by: 'rag-prep-plugin',
        enhanced_at: new Date().toISOString(),
        original_title: parsed.data.title || 'Untitled',
      }

      // Reconstruct the file with enhanced frontmatter
      const enhancedFile = matter.stringify(parsed.content, mergedMetadata)

      // Write the enhanced file back
      await fs.writeFile(filePath, enhancedFile, 'utf8')

      console.log(`✅ [Frontmatter Tool] Enhanced: ${path.basename(filePath)}`)

      return {
        success: true,
        filePath,
        enhancedMetadata: mergedMetadata,
        addedFields: Object.keys(cleanedMetadata).filter(
          key => !parsed.data[key],
        ),
      }
    } catch (error) {
      console.error(
        `❌ [Frontmatter Tool] Error enhancing ${filePath}:`,
        error.message,
      )
      return {
        success: false,
        filePath,
        error: error.message,
      }
    }
  }

  /**
   * Create a backup of the original file before enhancement
   */
  async createBackup(filePath) {
    try {
      const backupPath = filePath.replace('.md', '.original.md')
      await fs.copy(filePath, backupPath)
      console.log(
        `💾 [Frontmatter Tool] Backup created: ${path.basename(backupPath)}`,
      )
      return backupPath
    } catch (error) {
      console.error(
        `❌ [Frontmatter Tool] Backup failed for ${filePath}:`,
        error.message,
      )
      return null
    }
  }

  /**
   * Batch enhance multiple files
   */
  async enhanceFiles(fileEnhancements) {
    console.log(
      `🚀 [Frontmatter Tool] Batch enhancing ${fileEnhancements.length} files...`,
    )

    const results = []

    for (const enhancement of fileEnhancements) {
      const { filePath, enhancedMetadata, originalContent } = enhancement

      // Skip backup creation since originals are stored elsewhere
      console.log(
        `📝 [Frontmatter Tool] Enhancing (no backup): ${path.basename(
          filePath,
        )}`,
      )

      // Enhance the file
      const result = await this.enhanceFile(
        filePath,
        enhancedMetadata,
        originalContent,
      )
      results.push(result)
    }

    const successful = results.filter(r => r.success).length
    console.log(
      `📊 [Frontmatter Tool] Batch complete: ${successful}/${fileEnhancements.length} files enhanced`,
    )

    return results
  }

  /**
   * Generate summary of enhancements made
   */
  generateSummary(results) {
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    const addedFieldsSummary = {}
    successful.forEach(result => {
      result.addedFields?.forEach(field => {
        addedFieldsSummary[field] = (addedFieldsSummary[field] || 0) + 1
      })
    })

    return {
      totalFiles: results.length,
      successful: successful.length,
      failed: failed.length,
      failedFiles: failed.map(f => f.filePath),
      addedFields: addedFieldsSummary,
      summary: `Enhanced ${
        successful.length
      } files. Most common additions: ${Object.entries(addedFieldsSummary)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([field, count]) => `${field} (${count})`)
        .join(', ')}`,
    }
  }
}

module.exports = FrontmatterEnhancerTool
