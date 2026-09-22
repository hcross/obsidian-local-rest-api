/**
 * Error sanitization utilities.
 *
 * Ensures that internal filesystem paths and raw Node.js error messages are
 * never forwarded verbatim to API clients, mitigating information-disclosure
 * risks (M-03).
 */

const KNOWN_CODES: Record<string, string> = {
  ENOENT: "file or directory not found",
  EACCES: "permission denied",
  EEXIST: "file already exists",
  EISDIR: "path is a directory",
  ENOTDIR: "path is not a directory",
};

/**
 * Return a sanitized error message safe to include in an API response.
 *
 * - For known Node.js error codes (ENOENT, EACCES, …) a generic description
 *   is returned so no internal path leaks.
 * - In debug mode (OBSIDIAN_DEBUG=true) the raw message is forwarded as-is to
 *   ease local development.
 * - Otherwise absolute filesystem paths are stripped from the message before
 *   it is returned.
 *
 * @param error   The caught value (may be any type).
 * @param operation  A short description of the failing operation, used as a
 *                   prefix in the returned string (e.g. "patch file").
 */
/**
 * Extract a human-readable message from a caught value, without falling back
 * to the default object stringification (`String(value)` on unknown values).
 */
function getErrorMessage(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  const message = (value as { message?: unknown })?.message;
  return typeof message === "string" ? message : "unknown error";
}

export function sanitizeError(error: unknown, operation: string): string {
  const err = error as { code?: string; message?: string };

  if (err.code && KNOWN_CODES[err.code]) {
    return `${operation}: ${KNOWN_CODES[err.code]}`;
  }

  if (process.env.OBSIDIAN_DEBUG === "true") {
    return `${operation}: ${getErrorMessage(error)}`;
  }

  // Strip absolute paths from the message before returning.
  const sanitized = getErrorMessage(error).replace(
    /\/[^\s,'"]{2,}/g,
    "<path>",
  );
  return `${operation}: ${sanitized}`;
}
