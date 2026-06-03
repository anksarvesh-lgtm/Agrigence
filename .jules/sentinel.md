## 2024-05-24 - [Auth Bypass in Firebase Token Decoder]
**Vulnerability:** The `decodeFirebaseToken` function incorrectly defaulted to returning `{ email: 'admin@agrigence.com' }` when no authorization header was provided or when token parsing failed. This allowed anyone to bypass authentication and execute actions as an admin.
**Learning:** Returning default values with elevated privileges in catch blocks or missing inputs leads to critical security bypasses.
**Prevention:** Always default to the least privileged state (e.g., returning `null` or throwing an error) when authentication tokens are missing or invalid.
