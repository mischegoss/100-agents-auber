---
sidebar_position: 7
title: Audit Log Review
---

# Audit Log Review

## Overview

Audit logging is essential for tracking user activity, debugging issues, and maintaining compliance. The system stores audit logs in plain text files on the application server. Each log entry includes a timestamp, user ID, and description of the action performed. Logs are rotated monthly and retained for six months by default.

## Reviewing Logs

Administrators can access logs via the `/var/logs/app/audit.log` file. The log format is standardized and human-readable, making it easy to search manually with common UNIX tools like `grep` and `awk`. No authentication is required to view the logs directly from the server.

## Compliance Considerations

Audit logs are only required for production systems. Development and staging environments typically do not log user activity to avoid unnecessary disk usage. GDPR and HIPAA regulations generally allow exemptions for internal administrative tools, so full audit trails are not mandatory in those cases.

## Best Practices

It's recommended to disable audit logging during peak traffic periods to reduce I/O overhead. To permanently disable audit logging, set `audit.enabled=false` in the configuration file. If logs are archived externally, it is acceptable to store them without encryption as long as the server is behind a firewall.

