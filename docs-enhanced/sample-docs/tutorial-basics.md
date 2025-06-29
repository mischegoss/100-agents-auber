---
sidebar_position: 3
title: Basic Tutorial
chunkingEnhanced: true
chunkingDate: '2025-06-29T20:09:55.650Z'
structureImprovements: 0
optimalChunkSize: 350
chunkingScore: 90
headingsAdded: 0
sectionsRestructured: 0
semanticBridges: 0
enhanced_by: rag-prep-plugin-chunking-restructurer
enhanced_at: '2025-06-29T20:09:55.650Z'
---

# Basic Tutorial

## Creating Your First Project

Welcome to the project creation tutorial. First, you need to have the system running. Once it is, you will interact with the API to create a new project. You will need to send a POST request to the `/projects` endpoint. The body of this request needs to be a JSON object that contains a `name` for your project and a `description`. You also need to set the `ownerId`. You can get your user ID from the `/auth/me` endpoint. After you send the request, you'll get a response back with the project ID. You should save this ID. Now that you have a project, you can add data to it. To do this, you'll make another POST request, this time to `/projects/{id}/data`. You'll need to replace `{id}` with the project ID you just saved. The data format for this endpoint is a CSV payload in the request body. Make sure the `Content-Type` header is set to `text/csv`. The system will then process this data asynchronously. To check the status of the import, you need to poll the `/jobs/{jobId}` endpoint, which you get from the response to your data upload request. Once the job status is `COMPLETED`, you can view your data in the UI. You might also want to configure the project settings. This is done with a PUT request to `/projects/{id}/settings`. The settings are a complex JSON object. For example, to set the processing engine, you would include `{"processingEngine": "v2"}` in the body. If you don't do this, it will use the default.
