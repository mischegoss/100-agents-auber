---
sidebar_position: 3
title: Basic Tutorial
description: >-
  Learn to create projects, upload CSV data, and configure settings using our
  API. Follow this tutorial for a step-by-step guide. Get started now!
tags:
  - api
  - tutorial
  - project
  - csv
  - data
keywords:
  - project creation
  - api tutorial
  - csv import
  - data upload
  - project settings
  - rest api
topics:
  - api interaction
  - project management
  - data import
  - project settings
  - api endpoints
  - data upload
categories:
  - tutorial
  - development
audience:
  - developers
  - beginners
prerequisites:
  - basic-programming
  - api-knowledge
difficulty: beginner
complexity: low
contentType: tutorial
domainArea: development
primaryTopic: project creation
category: API Documentation
ragScore: 89
agentCount: 4
researchConducted: true
researchDate: '2025-06-28'
researchSources: 13
researchScore: 100
tavilyIntegration: true
---

# Basic Tutorial

## Creating Your First Project

Welcome to the project creation tutorial. First, you need to have the system running. Once it is, you will interact with the API to create a new project. You will need to send a POST request to the `/projects` endpoint. The body of this request needs to be a JSON object that contains a `name` for your project and a `description`. You also need to set the `ownerId`. You can get your user ID from the `/auth/me` endpoint. After you send the request, you'll get a response back with the project ID. You should save this ID. Now that you have a project, you can add data to it. To do this, you'll make another POST request, this time to `/projects/{id}/data`. You'll need to replace `{id}` with the project ID you just saved. The data format for this endpoint is a CSV payload in the request body. Make sure the `Content-Type` header is set to `text/csv`. The system will then process this data asynchronously. To check the status of the import, you need to poll the `/jobs/{jobId}` endpoint, which you get from the response to your data upload request. Once the job status is `COMPLETED`, you can view your data in the UI. You might also want to configure the project settings. This is done with a PUT request to `/projects/{id}/settings`. The settings are a complex JSON object. For example, to set the processing engine, you would include `{"processingEngine": "v2"}` in the body. If you don't do this, it will use the default.

## 🏆 Current Best Practices (2025)

Based on recent industry research:

- **best practices\**: best practices\.
- **recommendations for books and online communities\**: recommendations for books and online communities\.
- **best practices, strategies, and tools for well-documented code, including how AI helps developers write code documentation more efficiently\**: best practices, strategies, and tools for well-documented code, including how AI helps developers write code documentation more efficiently\.

## 📋 Industry Standards & Compliance

- **ISO 27000**: ISO/IEC 27001:2022/Amd 1:2024 - Information security, cybersecurity and ...

## 📚 Additional Resources

- [Welcome to Atlassian Python API's documentation!](https://atlassian-python-api.readthedocs.io/)
- [Atlassian Python API wrapper - GitHub](https://github.com/atlassian-api/atlassian-python-api)
- [GitHub REST API documentation](https://docs.github.com/en/rest)

