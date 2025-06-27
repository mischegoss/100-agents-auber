---
sidebar_position: 3
title: Basic Tutorial
description: >-
  Learn how to create your first project using the API. This tutorial covers
  creating a project, uploading CSV data, checking import status, and
  configuring project settings via REST API requests. It provides essential
  steps for project management and data handling through API interactions.
tags:
  - API
  - project creation
  - data upload
  - REST API
  - CSV
  - endpoint
  - project settings
  - asynchronous processing
  - job status
  - data ingestion
keywords:
  - project lifecycle
  - API integration
  - data pipeline
category: Tutorial
difficulty: beginner
topics:
  - API interaction
  - Project Management
related:
  - Authentication
  - Data Formats
  - Error Handling
rag_score: 85
rag_improvements: &ref_0
  - >-
    Add code examples in multiple languages (e.g., Python, cURL) for each API
    request
  - >-
    Provide a schema definition for the project settings JSON object and sample
    values for each configurable parameter
  - >-
    Include error handling examples and troubleshooting tips for common API
    responses
ragScore: 85
ragImprovements: *ref_0
enhanced_by: rag-prep-plugin
enhanced_at: '2025-06-27T04:31:33.283Z'
original_title: Basic Tutorial
---

# Basic Tutorial

## Creating Your First Project

Welcome to the project creation tutorial. First, you need to have the system running. Once it is, you will interact with the API to create a new project. You will need to send a POST request to the `/projects` endpoint. The body of this request needs to be a JSON object that contains a `name` for your project and a `description`. You also need to set the `ownerId`. You can get your user ID from the `/auth/me` endpoint. After you send the request, you'll get a response back with the project ID. You should save this ID. Now that you have a project, you can add data to it. To do this, you'll make another POST request, this time to `/projects/{id}/data`. You'll need to replace `{id}` with the project ID you just saved. The data format for this endpoint is a CSV payload in the request body. Make sure the `Content-Type` header is set to `text/csv`. The system will then process this data asynchronously. To check the status of the import, you need to poll the `/jobs/{jobId}` endpoint, which you get from the response to your data upload request. Once the job status is `COMPLETED`, you can view your data in the UI. You might also want to configure the project settings. This is done with a PUT request to `/projects/{id}/settings`. The settings are a complex JSON object. For example, to set the processing engine, you would include `{"processingEngine": "v2"}` in the body. If you don't do this, it will use the default.
