/**
 * Safely converts string booleans, numbers, or true/false into a strict JavaScript boolean.
 * This prevents critical React Native crashes like: "java.lang.String cannot be cast to java.lang.Boolean"
 *
 * @param {any} value - The value coming from backend APIs, AsyncStorage, or props.
 * @returns {boolean} - Strictly returns true or false.
 */
export const normalizeBoolean = (value) => {
  if (value === true || value === false) {
    return value;
  }
  
  if (typeof value === 'string') {
    const lowercaseVal = value.trim().toLowerCase();
    if (lowercaseVal === 'true' || lowercaseVal === '1' || lowercaseVal === 'yes') {
      return true;
    }
    return false;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  // Handle null, undefined, objects, functions by coercing to false
  return !!value;
};
