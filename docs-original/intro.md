---
sidebar_position: 1
title: Original Docs
---

import SearchWidget from './../src/components/Search/SearchWidget.js'

# Original Documentation

**Traditional docs with basic search limitations.**

These docs represent standard documentation without AI enhancement - basic keyword matching with limited discoverability and poor search relevance.

## The Challenge: Basic Search Limitations

Standard documentation relies on simple keyword matching and basic metadata, leading to frustrating user experiences:

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', margin: '2rem 0'}}>

<div style={{background: '#fff3cd', borderRadius: '15px', padding: '2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', borderLeft: '5px solid #ffc107'}}>

### 🔍 Basic Keyword Search

- ⚠️ Exact word matching only
- ⚠️ No semantic understanding
- ⚠️ Limited synonym detection
- ⚠️ Poor relevance ranking

</div>

<div style={{background: '#f8d7da', borderRadius: '15px', padding: '2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', borderLeft: '5px solid #dc3545'}}>

### 📄 Minimal Metadata

- ❌ Basic title and description only
- ❌ No topic categorization
- ❌ Missing content relationships
- ❌ Poor content discoverability

</div>

<div style={{background: '#f8d7da', borderRadius: '15px', padding: '2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', borderLeft: '5px solid #dc3545'}}>

### 🔧 No Content Optimization

- ❌ Unstructured content chunks
- ❌ No retrieval optimization
- ❌ Missing context preservation
- ❌ Poor AI readiness (RAG score: 20-40)

</div>

<div style={{background: '#fff3cd', borderRadius: '15px', padding: '2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', borderLeft: '5px solid #ffc107'}}>

### 📚 Limited Research

- ⚠️ No external source validation
- ⚠️ Missing best practices
- ⚠️ Outdated information
- ⚠️ Incomplete coverage

</div>

</div>

<div style={{background: 'linear-gradient(135deg, #f44336, #e57373)', color: 'white', padding: '2rem', borderRadius: '15px', textAlign: 'center', margin: '3rem 0'}}>

### The Business Impact

Standard documentation creates friction that hurts your business metrics and user satisfaction.

<div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '2rem'}}>

<div style={{background: 'rgba(255, 255, 255, 0.2)', padding: '1rem', borderRadius: '10px', backdropFilter: 'blur(5px)'}}>
<span style={{fontSize: '2rem', fontWeight: 'bold', display: 'block'}}>35/100</span>
<span style={{fontSize: '0.9rem', opacity: 0.9}}>Average RAG Score</span>
</div>

<div style={{background: 'rgba(255, 255, 255, 0.2)', padding: '1rem', borderRadius: '10px', backdropFilter: 'blur(5px)'}}>
<span style={{fontSize: '2rem', fontWeight: 'bold', display: 'block'}}>60%</span>
<span style={{fontSize: '0.9rem', opacity: 0.9}}>Users Can't Find Info</span>
</div>

<div style={{background: 'rgba(255, 255, 255, 0.2)', padding: '1rem', borderRadius: '10px', backdropFilter: 'blur(5px)'}}>
<span style={{fontSize: '2rem', fontWeight: 'bold', display: 'block'}}>3x</span>
<span style={{fontSize: '0.9rem', opacity: 0.9}}>Higher Support Tickets</span>
</div>

<div style={{background: 'rgba(255, 255, 255, 0.2)', padding: '1rem', borderRadius: '10px', backdropFilter: 'blur(5px)'}}>
<span style={{fontSize: '2rem', fontWeight: 'bold', display: 'block'}}>40%</span>
<span style={{fontSize: '0.9rem', opacity: 0.9}}>User Drop-off Rate</span>
</div>

</div>

</div>

## Try Basic Search

Experience the limitations of traditional documentation search. Notice how it struggles with anything beyond exact keyword matches.

<div style={{maxWidth: '800px', margin: '2rem auto'}}>

<SearchWidget 
  mode="original"
  maxResults={3}
  showKeywords={true}
  compact={false}
/>

</div>

<div style={{background: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '1rem 1.5rem', marginTop: '2rem', borderRadius: '0 8px 8px 0', fontStyle: 'italic', color: '#856404'}}>

**Notice:** Try searching for "auth timeout" or "credential lockout" - basic search often fails to find relevant content when users don't use exact keywords.

</div>

## Common Search Problems

### 🔍 **Keyword Dependency**

Users must know exact terms. Searching "login issues" won't find "authentication problems."

### 📊 **Poor Relevance**

Results ranked by simple word frequency, not actual usefulness or context.

### 🔄 **No Synonyms**

"Setup" won't find "configuration." "Error" won't find "issue" or "problem."

### 📈 **High Support Load**

When users can't find answers, they create support tickets instead.

### 😤 **User Frustration**

Poor search experience leads to abandoned documentation and reduced product adoption.

---

## The Solution: AI Enhancement

<div style={{background: '#d4edda', borderLeft: '4px solid #28a745', padding: '1rem 1.5rem', marginTop: '2rem', borderRadius: '0 8px 8px 0', color: '#155724'}}>

**Ready for better search?** See how [Enhanced Docs](../docs-enhanced/enhanced-docs) transform the user experience with AI-powered semantic search, intelligent metadata, and 93/100 RAG scores.

</div>
