# 🔐 Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Security Best Practices

When using Toobix, please follow these security guidelines:

### 1. API Keys and Secrets

- **NEVER** commit your `.env` file to version control
- **NEVER** share your API keys publicly (Discord, GitHub Issues, etc.)
- Use `.env.example` as a template and create your own `.env` file locally
- Rotate API keys regularly, especially if they may have been exposed
- Use environment-specific API keys (development vs. production)

### 2. Database Security

- The `databases/` directory is excluded from git for security
- Database files contain conversation history and may include sensitive information
- Backup your database regularly but keep backups secure
- Do not share database files publicly

### 3. Network Security

- By default, all services run on `localhost` only (not exposed to internet)
- If exposing services publicly:
  - Use HTTPS/TLS encryption
  - Implement authentication
  - Use a reverse proxy (nginx, caddy)
  - Rate limit requests (already implemented in Public API)

### 4. Public API Security

The Public API (`port 8960`) has basic security measures:
- Rate limiting: 10 requests/minute per IP
- No authentication by default (meant for local use)

**If exposing publicly, add:**
- API key authentication
- CORS restrictions
- Request validation
- Audit logging

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Toobix:

### How to Report

1. **DO NOT** open a public GitHub issue
2. **DO NOT** disclose the vulnerability publicly until it's been addressed

Instead:

**Email**: [Create a GitHub Issue with title "SECURITY: [Brief Description]" and mark as confidential]

Or use GitHub's private vulnerability reporting:
- Go to the repository's "Security" tab
- Click "Report a vulnerability"
- Provide detailed information

### What to Include

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)
- Your contact information (optional)

### Response Timeline

- **24 hours**: Initial acknowledgment
- **7 days**: Assessment and severity classification
- **30 days**: Fix and/or mitigation plan
- **90 days**: Public disclosure (coordinated with reporter)

### Bug Bounty

Currently, Toobix is an open-source project with no formal bug bounty program. However:
- You will be credited in release notes (unless you prefer anonymity)
- Significant contributions will be recognized in `ACKNOWLEDGMENTS.md`
- If the project generates revenue in the future, early security contributors will be prioritized

## Common Security Concerns

### 1. "Is my conversation data secure?"

By default, all data is stored locally in SQLite databases on your machine. Toobix does not send conversation data to external servers unless you explicitly use cloud LLM providers (Groq, OpenAI, etc.).

**What is sent to LLM providers:**
- Your prompts and conversation context
- Multi-perspective analysis requests
- Emotional resonance analysis

**What is NOT sent:**
- Your entire database
- Personal information (unless you include it in your prompts)
- API keys or credentials

### 2. "Can someone access my Toobix remotely?"

Not by default. All services run on `localhost` (127.0.0.1) and are not accessible from the internet unless you explicitly configure port forwarding or expose them.

### 3. "What about malicious prompts?"

Toobix uses external LLM providers (Groq, Ollama, etc.) which have their own content filtering and safety measures. However:
- Toobix does not implement additional prompt filtering
- Use responsible prompting practices
- Be aware of prompt injection risks if building integrations

### 4. "Is the Memory Palace secure?"

The Memory Palace stores data in a local SQLite database without encryption. If you need encryption:
- Use full-disk encryption on your system
- Consider encrypting the `databases/` directory
- Implement application-level encryption (contributions welcome!)

## Security Roadmap

Future security improvements:
- [ ] Optional database encryption at rest
- [ ] API key authentication for Public API
- [ ] OAuth integration for multi-user scenarios
- [ ] Audit logging for all API requests
- [ ] Security scanning in CI/CD pipeline
- [ ] Automated dependency vulnerability scanning

## Security Dependencies

Toobix relies on these dependencies for security:
- Bun runtime security features
- SQLite for safe database operations
- HTTPS for external API calls

We monitor security advisories for all dependencies and update promptly when vulnerabilities are discovered.

## Contact

For general security questions (not vulnerability reports):
- GitHub Discussions: [Link to discussions]
- GitHub Issues: Tag with `security` label

For vulnerability reports:
- Use private vulnerability reporting (see above)

---

**Last Updated**: 2025-11-23
**Maintained By**: Toobix Community
**Security Contact**: See repository maintainers

Thank you for helping keep Toobix secure! 🔐
