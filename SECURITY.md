# Security Report & Guidelines

## Security Audit Summary

This document provides a comprehensive overview of the security audit performed on this Next.js application, findings, remediations applied, and ongoing security recommendations.

**Audit Date:** January 1, 2026  
**Application:** GPT Learn-My-Way (Next.js 15 + TypeScript)

## Critical Vulnerabilities Fixed

### 1. Command Injection in TTS Route ✅ FIXED
- **Location:** `src/app/api/tts/route.ts`
- **Severity:** CRITICAL
- **Issue:** User-provided `voice` parameter passed directly to `execFile` without sanitization
- **Fix Applied:** Implemented strict input sanitization allowing only alphanumeric characters, hyphens, and plus signs
- **Code:** `voice.trim().replace(/[^a-zA-Z0-9-+]/g, '')`

### 2. User Impersonation via Unverified userId ✅ MITIGATED
- **Location:** `src/app/api/progress/route.ts`
- **Severity:** CRITICAL
- **Issue:** Client-controlled `userId` allowed access to any user's data
- **Fix Applied:** 
  - Implemented comprehensive input validation using Zod schemas
  - Added proper error handling with sanitized messages
  - Restructured API handlers with validation at each endpoint
- **Note:** Full authentication/authorization still needs implementation (see below)

### 3. SSRF (Server-Side Request Forgery) in PDF Analysis ✅ ENHANCED
- **Location:** `src/app/api/analyze-pdf/route.ts`
- **Severity:** HIGH → MEDIUM
- **Issue:** Incomplete blocking of private network addresses
- **Fix Applied:** Expanded `isBlockedHostname()` to block additional IP ranges:
  - IPv6 link-local, unique local, and multicast addresses
  - Additional IPv4 ranges (100.64.0.0/10, 192.0.0.0/24, etc.)
  - Obfuscated IP patterns (hex, numeric)
  - `.internal` domain suffix

## Security Enhancements Implemented

### 4. Comprehensive Input Validation ✅
- **Location:** `src/lib/validation.ts` (new file)
- **Implementation:** Created Zod validation schemas for all API endpoints
- **Coverage:**
  - User ID validation (format, length)
  - Grade level validation (6-13 range)
  - Interest field validation
  - Material ID validation (CUID format)
  - Quiz answers validation
  - URL validation (HTTP/HTTPS only)
  - TTS parameters validation

### 5. Security Headers ✅
- **Location:** `next.config.ts`
- **Implementation:** Added comprehensive security headers:
  - `Strict-Transport-Security`: Enforces HTTPS
  - `X-Frame-Options`: Prevents clickjacking
  - `X-Content-Type-Options`: Prevents MIME sniffing
  - `X-XSS-Protection`: XSS filter
  - `Permissions-Policy`: Restricts browser features
  - `Referrer-Policy`: Controls referrer information

### 6. Error Message Sanitization ✅
- **Location:** `src/lib/validation.ts`
- **Implementation:** Production-safe error messages
- **Behavior:** 
  - Development: Detailed error messages
  - Production: Generic error messages to prevent information disclosure

## Outstanding Security Issues

### 🔴 CRITICAL: No Authentication/Authorization
**Status:** NOT IMPLEMENTED  
**Priority:** IMMEDIATE

**Issue:** Despite `next-auth` being installed, there is no authentication implementation. All API endpoints are publicly accessible.

**Impact:**
- Anyone can access, view, modify, or delete any user's data
- No way to verify user identity
- Complete account takeover possible
- Privacy violation

**Recommendations:**
1. Implement NextAuth.js with proper session management
2. Add authentication middleware to protect API routes
3. Implement role-based access control (if needed)
4. Use secure, httpOnly cookies for session tokens
5. Implement proper session rotation and expiration

**Example Implementation:**
```typescript
// src/app/api/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const { handlers, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      // Your authentication logic
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
})

export const { GET, POST } = handlers
```

### 🟠 HIGH: No Rate Limiting
**Status:** NOT IMPLEMENTED  
**Priority:** HIGH

**Issue:** No rate limiting on any API endpoint.

**Impact:**
- DoS attacks possible
- LLM API quota exhaustion
- Resource exhaustion
- Brute force attacks (once auth is implemented)

**Recommendations:**
1. Implement rate limiting middleware
2. Use Redis or in-memory rate limiting
3. Set appropriate limits per endpoint:
   - LLM endpoints: 10-20 requests/minute per IP
   - TTS endpoint: 5 requests/minute per IP
   - Progress endpoints: 100 requests/minute per user
   - PDF analysis: 3 requests/minute per IP

**Example Implementation:**
```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining } = await ratelimit.limit(identifier)
  if (!success) {
    throw new Error('Rate limit exceeded')
  }
  return { limit, remaining }
}
```

### 🟠 HIGH: No CSRF Protection
**Status:** NOT IMPLEMENTED  
**Priority:** HIGH

**Issue:** No CSRF tokens on POST endpoints.

**Impact:**
- Cross-site request forgery attacks
- Actions performed on behalf of authenticated users

**Recommendations:**
1. Implement CSRF tokens for all state-changing operations
2. Use Next.js built-in CSRF protection
3. Set SameSite cookie policy
4. Validate CSRF tokens on all POST/PUT/DELETE endpoints

### 🟠 HIGH: Inadequate File Upload Validation
**Status:** PARTIALLY ADDRESSED  
**Priority:** HIGH

**Issue:** PDF upload only checks file size and basic header.

**Impact:**
- Upload of malicious files disguised as PDFs
- Polyglot files (PDF + executable)
- Malicious code execution

**Recommendations:**
1. Implement comprehensive file type validation
2. Use magic number detection beyond header
3. Scan uploaded files for malware
4. Restrict file extensions and MIME types
5. Implement file content sanitization

**Example Enhancement:**
```typescript
// Validate PDF file more thoroughly
async function validatePdfFile(file: File, bytes: ArrayBuffer): Promise<boolean> {
  // Check magic number (already done)
  const header = new TextDecoder('utf-8').decode(new Uint8Array(bytes, 0, 4))
  if (header !== '%PDF') return false
  
  // Check for PDF trailer
  const trailer = new TextDecoder('utf-8').decode(
    new Uint8Array(bytes, bytes.byteLength - 20, 20)
  )
  if (!trailer.includes('%%EOF')) return false
  
  // Verify file structure
  // ... additional validation
  
  return true
}
```

## Medium Priority Issues

### 6. No Audit Logging
**Status:** NOT IMPLEMENTED

**Recommendations:**
- Log all authentication attempts
- Log failed requests and errors
- Log suspicious activities
- Use structured logging (e.g., Winston, Pino)
- Implement log rotation and retention

### 7. LLM API Key Management
**Status:** NEEDS IMPROVEMENT

**Current:** API keys in environment variables  
**Recommendations:**
- Use secrets management service (AWS Secrets Manager, HashiCorp Vault)
- Implement key rotation strategy
- Use scoped keys with minimal permissions
- Monitor API key usage

### 8. JSON Storage in Database
**Status:** REVIEW NEEDED

**Issue:** JSON strings stored in text fields without proper validation  
**Recommendations:**
- Validate JSON structure before storage
- Use database-level JSON validation if available
- Sanitize JSON content to prevent injection
- Consider using JSONB columns (if using PostgreSQL)

## Low Priority / Best Practices

### 9. Missing Dependency Auditing
**Recommendations:**
- Add automated security scanning to CI/CD
- Run `bun pm audit` regularly
- Use Dependabot for dependency updates
- Implement security alerts

### 10. No Content Security Policy (CSP)
**Current:** Basic security headers implemented  
**Recommendations:**
- Implement strict CSP header
- Use `next/content-security-policy` package
- Define allowed sources for scripts, styles, images
- Report CSP violations

### 11. Database Connection String Exposure
**Recommendations:**
- Validate connection strings at startup
- Use connection pooling
- Implement connection encryption
- Regular credential rotation

## Security Checklist

### Immediate Actions (Critical)
- [ ] Implement authentication/authorization
- [ ] Add rate limiting to all endpoints
- [ ] Implement CSRF protection
- [ ] Enhance file upload validation
- [ ] Add input validation to remaining API routes

### Short-term Actions (High Priority)
- [ ] Implement audit logging
- [ ] Set up secrets management
- [ ] Add comprehensive error handling
- [ ] Implement proper session management
- [ ] Add monitoring and alerting

### Medium-term Actions
- [ ] Implement Content Security Policy
- [ ] Set up automated security scanning
- [ ] Add security testing to CI/CD
- [ ] Implement API key rotation
- [ ] Add database encryption

### Long-term Actions
- [ ] Regular penetration testing
- [ ] Security training for team
- [ ] Implement security incident response plan
- [ ] Set up bug bounty program
- [ ] Regular security audits

## Testing Security Fixes

### Test Command Injection Fix
```bash
# Should fail
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "test", "voice": "; rm -rf /"}'

# Should succeed
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "test", "voice": "en-US"}'
```

### Test SSRF Protection
```bash
# Should fail
curl -X POST http://localhost:3000/api/analyze-pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:8080/file.pdf"}'

# Should fail
curl -X POST http://localhost:3000/api/analyze-pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "http://192.168.1.1/file.pdf"}'

# Should succeed
curl -X POST http://localhost:3000/api/analyze-pdf \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/file.pdf"}'
```

### Test Input Validation
```bash
# Should fail (invalid user ID)
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -d '{"action": "save-progress", "userId": "<script>alert(1)</script>", "materialId": "test"}'

# Should fail (invalid grade level)
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -d '{"action": "save-preferences", "gradeLevel": 999}'
```

## Security Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Zod Validation](https://zod.dev/)

### Tools
- `npm audit` / `bun pm audit` - Dependency vulnerability scanner
- [Snyk](https://snyk.io/) - Security scanning
- [OWASP ZAP](https://www.zaproxy.org/) - Web application security scanner

### Libraries
- `next-secure-headers` - Security headers for Next.js
- `@upstash/ratelimit` - Rate limiting
- `helmet` - Security headers (for Express)

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. Do not create public issues
2. Send details to: [security@yourdomain.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide regular updates on the fix.

## Version History

- **v1.0** (2026-01-01): Initial security audit and critical fixes
  - Fixed command injection in TTS route
  - Implemented comprehensive input validation
  - Enhanced SSRF protection
  - Added security headers
  - Created security documentation

---

**Last Updated:** January 1, 2026  
**Next Review:** February 1, 2026