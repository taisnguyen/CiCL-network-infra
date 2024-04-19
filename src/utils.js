/**
 * Utility functions.
 * @module utils
 */

/**
 * Get a random integer between two values (incsluive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer.
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { getRandomInt };
