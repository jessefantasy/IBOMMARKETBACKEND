/**
 * Converts query parameters from an Express request to a Mongoose filter query.
 * Supports basic operators like $gt, $lt, $gte, $lte, and equality.
 * @param {object} queryParams - The query parameters from the Express request.
 * @returns {object} - The Mongoose filter query.
 */
export function convertToMongooseQuery(queryParams) {
  const query = {};

  Object.keys(queryParams).forEach((key) => {
    const value = queryParams[key];

    if (Array.isArray(value)) {
      // Handle arrays directly
      query[key] = { $in: value.map(parseValue) };
    }

    if (typeof value === "string") {
      // Check for operators (e.g., key__gt=10)
      const parts = key.split("__");
      if (parts.length === 2) {
        const field = parts[0];
        const operator = parts[1];
        const mongoOperator = `$${operator}`;

        if (!query[field]) {
          query[field] = {};
        }

        query[field][mongoOperator] = parseValue(value);
      } else {
        query[key] = parseValue(value);
      }
    }
  });

  console.log("Converted Mongoose Query:", query);
  return query;
}

/**
 * Parses the value to the appropriate type (e.g., number, boolean).
 * @param {string} value - The value to parse.
 * @returns {any} - The parsed value.
 */
function parseValue(value) {
  if (!isNaN(value)) {
    return Number(value);
  }
  if (value.toLowerCase() === "true") {
    return true;
  }
  if (value.toLowerCase() === "false") {
    return false;
  }
  return value;
}
