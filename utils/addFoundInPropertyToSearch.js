export const findMatchingPropertyInObjects = (objects, searchString) => {
  // Convert the search string to lowercase for case-insensitive comparison
  const searchLower = searchString.toLowerCase();

  // Map through the array of objects
  return objects.map((obj) => {
    let foundProperty = null;

    // Check the 'title' property
    if (
      obj.hasOwnProperty("title") &&
      typeof obj["title"] === "string" &&
      obj["title"].toLowerCase().includes(searchLower)
    ) {
      foundProperty = "title";
    }

    // Check the 'description' property if 'title' was not found
    if (
      !foundProperty &&
      obj.hasOwnProperty("description") &&
      typeof obj["description"] === "string" &&
      obj["description"].toLowerCase().includes(searchLower)
    ) {
      foundProperty = "description";
    }

    // Add the foundIn property to the object
    return {
      ...obj,
      foundIn: foundProperty,
    };
  });
};
