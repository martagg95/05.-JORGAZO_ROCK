/**
 * Utility functions for security and common operations.
 */

const utils = {
    /**
     * Escapes HTML characters in a string to prevent XSS attacks.
     * @param {string} str - The string to escape.
     * @returns {string} The escaped string.
     */
    escapeHtml: function(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Sanitizes a URL to ensure it only uses safe protocols.
     * @param {string} url - The URL to sanitize.
     * @returns {string} The original URL if safe, or '#' if unsafe.
     */
    sanitizeUrl: function(url) {
        if (!url) return '#';
        const stringUrl = String(url).trim();
        // Allow http, https, mailto, and relative paths
        const safeProtocols = /^(https?|mailto):/i;
        const isRelative = /^[\w\/.-]/.test(stringUrl);
        
        if (safeProtocols.test(stringUrl) || isRelative || stringUrl.startsWith('#')) {
            return stringUrl;
        }
        return '#';
    }
};

// Export for module systems or attach to window for browser usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
} else if (typeof window !== 'undefined') {
    window.utils = utils;
}
