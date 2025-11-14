/**
 * JWT Token utilities
 */

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));

    return decoded;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    // Add 10 second buffer to account for clock skew
    return currentTime >= expirationTime - 10000;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

/**
 * Get token expiration time in milliseconds
 * @param {string} token - JWT token
 * @returns {number|null} - Expiration time in ms or null if invalid
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return null;

    return decoded.exp * 1000;
  } catch (error) {
    console.error("Error getting token expiration:", error);
    return null;
  }
};

/**
 * Get time until token expires in seconds
 * @param {string} token - JWT token
 * @returns {number} - Seconds until expiration, 0 if expired
 */
export const getTimeUntilExpiration = (token) => {
  try {
    const expirationTime = getTokenExpiration(token);
    if (!expirationTime) return 0;

    const currentTime = Date.now();
    const timeLeft = Math.floor((expirationTime - currentTime) / 1000);

    return Math.max(0, timeLeft);
  } catch (error) {
    console.error("Error calculating time until expiration:", error);
    return 0;
  }
};
