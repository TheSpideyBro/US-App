# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please **do not open a public issue**.

Instead, email us or open a private vulnerability report. We will respond within 48 hours and fix the issue promptly.

## Security Measures

- Row Level Security (RLS) on all Supabase database tables
- Role-based access control (admin/partner)
- Input sanitization on file uploads
- URL validation on all media sources
- Passwords hashed with bcrypt via Supabase
- No secrets in client-side code
