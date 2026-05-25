# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | ✅        |

## Reporting a Vulnerability

To report a security vulnerability, please **do not open a public issue**.

Contact the maintainer directly via GitHub private message or email.
Provide a detailed description of the vulnerability, steps to reproduce, and potential impact.

We aim to acknowledge receipt within 48 hours and provide a fix timeline within 7 days for critical issues.

## Security Baseline

This repository tracks security compliance work on branch `security/compliance-baseline`.
All security fixes are documented in the associated epic issue and individual fix pull requests.

## Known Security Considerations

- The plugin requires a Bearer token for all API requests.
- TLS is enabled by default; do not disable it in production.
- The `MaximumRequestSize` constant must be kept at a safe limit (see compliance issues).
- The `regexp` search operator must validate patterns against ReDoS before compiling.
- The `command_execute` MCP tool must only allow whitelisted Obsidian commands.
