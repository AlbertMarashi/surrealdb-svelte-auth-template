

export function get_cookie_from_document (cookie_name: string): string | null {
    const cookies = parse_cookies(document.cookie)

    return cookies[cookie_name] || null
}

/**
 * Parses a cookie string into an object of key-value pairs
 * Handles various edge cases including:
 * - URL encoded values
 * - Quoted values
 * - Empty values
 * - Special characters
 * - Multiple cookies
 */
function parse_cookies(cookie_str: string) {
    // Return empty object for empty/invalid input
    if (!cookie_str || typeof cookie_str !== "string") {
        return {}
    }

    const cookies: Record<string, string> = {}
    const pairs = cookie_str.split(";")

    for (const pair of pairs) {
        // Split on first equals sign
        const equalIndex = pair.indexOf("=")
        if (equalIndex === -1) continue

        // Extract and clean the key
        const key = pair.slice(0, equalIndex).trim()
        if (!key) continue

        // Extract and clean the value
        let value = pair.slice(equalIndex + 1).trim()

        // Remove quotes if present
        if (value.startsWith("\"") && value.endsWith("\"")) {
            value = value.slice(1, -1)
        }

        // Decode the value if it's URL encoded
        try {
            value = decodeURIComponent(value)
        } catch (e) {
            // If decoding fails, use the original value
            console.warn(`Failed to decode cookie value: ${value}`)
        }

        cookies[key] = value
    }

    return cookies
}


/** Cookie setting options matching the standard cookie attributes */
type CookieOptions = {
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    httpOnly?: boolean;
};

/** Sets or removes a cookie with the given name, value, and optional attributes */
export function set_cookie_on_document (name: string, value: string | null, options: CookieOptions) {
    // Encode the name
    const encodedName = encodeURIComponent(name)

    // If value is null, we're removing the cookie by setting it to expire in the past
    if (value === null) Object.assign(options, {
        expires: new Date(0),
        maxAge: 0 
    })

    // Normal cookie setting
    const encodedValue = encodeURIComponent(value || "")
    let cookieStr = `${encodedName}=${encodedValue}`

    if (options.path) {
        cookieStr += `; path=${options.path}`
    }

    if (options.domain) {
        cookieStr += `; domain=${options.domain}`
    }

    if (options.expires) {
        cookieStr += `; expires=${options.expires.toUTCString()}`
    }

    if (typeof options.maxAge === "number") {
        cookieStr += `; max-age=${options.maxAge}`
    }

    if (options.secure) {
        cookieStr += "; secure"
    }

    if (options.sameSite) {
        cookieStr += `; samesite=${options.sameSite.toLowerCase()}`
    }

    document.cookie = cookieStr
}