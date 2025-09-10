const toPascalCase = (str) => {
  if (!str || typeof str !== "string") return str;

  // 1) normalize separators -> spaces
  let s = str.replace(/[_-\s]+/g, " ");

  // 2) split camelCase boundaries: "coverImage" -> "cover Image"
  s = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

  // 3) split uppercase clusters followed by a lowercased word:
  //    "XMLHttp" -> "XML Http" (helps with mixed-case acronyms)
  s = s.replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, "$1 $2");

  // 4) build PascalCase: each word -> Capitalized (rest lowercase)
  return s
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

export function arrayChangeFunction(value) {
  if (!Array.isArray(value)) return value;
  return value.map((item) =>
    Array.isArray(item)
      ? arrayChangeFunction(item)
      : typeof item === "object" && item !== null
      ? mainChangeFunction(item)
      : item
  );
}

export function mainChangeFunction(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(mainChangeFunction);

  const newObject = {};
  for (const key of Object.keys(value)) {
    const val = value[key];
    const newKey = toPascalCase(key);
    newObject[newKey] =
      Array.isArray(val) || (val && typeof val === "object")
        ? mainChangeFunction(val)
        : val;
  }
  return newObject;
}

export const justAdverts = (arr) =>
  Array.isArray(arr) ? arr.map(mainChangeFunction) : arr;

export default { mainChangeFunction, arrayChangeFunction, justAdverts };
