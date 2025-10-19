/**
 * Format duration in seconds to Indonesian readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds} detik`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes} menit`;
  }
  
  return `${minutes} menit ${remainingSeconds} detik`;
};

/**
 * Format retry-after message for rate limiting
 * @param {number} retryAfterSeconds - Seconds until retry is allowed
 * @returns {string} Formatted message
 */
export const formatRateLimitMessage = (retryAfterSeconds) => {
  const duration = formatDuration(retryAfterSeconds);
  return `Terlalu banyak percobaan login. Silakan tunggu ${duration} sebelum mencoba lagi.`;
};
