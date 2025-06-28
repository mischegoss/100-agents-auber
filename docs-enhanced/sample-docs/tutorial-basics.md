---
sidebar_position: 3
title: Basic Tutorial
description: >-
  Learn how to create your first project using the API! This tutorial covers
  creating projects, adding data, and configuring project settings. Get started
  now!
tags:
  - api
  - project creation
  - tutorial
  - rest
  - json
keywords:
  - api project creation
  - project creation tutorial
  - api post request
  - rest api tutorial
  - project settings api
topics:
  - getting started
  - project creation
  - data management
  - project configuration
  - api interaction
  - data upload
categories:
  - tutorial
  - development
audience:
  - developers
  - beginners
  - system-administrators
prerequisites:
  - api-knowledge
  - basic-programming
difficulty: beginner
complexity: low
contentType: tutorial
domainArea: development
primaryTopic: project management
category: API Documentation
ragScore: 88
agentCount: 4
researchConducted: true
researchDate: '2025-06-28'
researchSources: 13
researchScore: 97
tavilyIntegration: true
---

# Basic Tutorial

## Creating Your First Project

Welcome to the project creation tutorial. First, you need to have the system running. Once it is, you will interact with the API to create a new project. You will need to send a POST request to the `/projects` endpoint. The body of this request needs to be a JSON object that contains a `name` for your project and a `description`. You also need to set the `ownerId`. You can get your user ID from the `/auth/me` endpoint. After you send the request, you'll get a response back with the project ID. You should save this ID. Now that you have a project, you can add data to it. To do this, you'll make another POST request, this time to `/projects/{id}/data`. You'll need to replace `{id}` with the project ID you just saved. The data format for this endpoint is a CSV payload in the request body. Make sure the `Content-Type` header is set to `text/csv`. The system will then process this data asynchronously. To check the status of the import, you need to poll the `/jobs/{jobId}` endpoint, which you get from the response to your data upload request. Once the job status is `COMPLETED`, you can view your data in the UI. You might also want to configure the project settings. This is done with a PUT request to `/projects/{id}/settings`. The settings are a complex JSON object. For example, to set the processing engine, you would include `{"processingEngine": "v2"}` in the body. If you don't do this, it will use the default.

## 🏆 Current Best Practices (2025)

Based on recent industry research:

- **Best practices for GitHub Docs Follow these best practices to create documentation that's user-friendly and easy to understand\**: Best practices for GitHub Docs Follow these best practices to create documentation that's user-friendly and easy to understand\.
- **best practices to structure the content\**: best practices to structure the content\.
- **best practices\**: best practices\.

## 📚 Additional Resources

- [Atlassian Documentation](https://confluence.atlassian.com/?mod=api)
- [GitHub REST API documentation](https://docs.github.com/en/rest)
- [Getting started with the REST API - GitHub Docs](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api)

