// src/components/Demo/DocumentPreview.jsx
// Shows the document being enhanced in real-time

import React, { useState, useEffect } from 'react'
import { demoStyles } from './styles/demoStyles'

const DocumentPreview = ({ content, filename, isUpdating = false }) => {
  const [showUpdateEffect, setShowUpdateEffect] = useState(false)
  const [previousContent, setPreviousContent] = useState(content)

  useEffect(() => {
    // Trigger visual update effect when content changes
    if (content !== previousContent) {
      setShowUpdateEffect(true)
      setPreviousContent(content)

      // Remove effect after animation
      const timer = setTimeout(() => {
        setShowUpdateEffect(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [content, previousContent])

  const getDocumentStyle = () => {
    let style = { ...demoStyles.documentPanel }
    if (showUpdateEffect) {
      style = { ...style, ...demoStyles.documentUpdating }
    }
    return style
  }

  return (
    <div style={getDocumentStyle()}>
      <div style={demoStyles.documentHeader}>
        <div style={demoStyles.filename}>{filename}</div>
        <div>📄 Live Document {showUpdateEffect && '✨ Updating...'}</div>
      </div>
      <div style={demoStyles.documentContent}>
        <div
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  )
}

export default DocumentPreview
