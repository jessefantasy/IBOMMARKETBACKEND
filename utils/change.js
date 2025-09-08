const toPascalCase = (str) => {
  if (!str || typeof str !== "string") return str;
  return str
    .replace(/[_-\s]+/g, " ") // replace _, -, spaces with space
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

export function arrayChangeFunction(value) {
  if (!Array.isArray(value)) {
    return value; // safeguard: just return as-is
  }

  return value.map((item) =>
    Array.isArray(item)
      ? arrayChangeFunction(item) // recurse if it's a nested array
      : typeof item === "object" && item !== null
      ? mainChangeFunction(item)
      : item
  );
}

function justAdverts(value) {
  if (!Array.isArray(value)) return value;
  return value.map((one) => mainChangeFunction(one));
}

export function mainChangeFunction(object) {
  if (object === null || typeof object !== "object") {
    return object;
  }

  if (Array.isArray(object)) {
    return arrayChangeFunction(object);
  }

  const newObject = {};
  for (let key in object) {
    const val = object[key];
    const newKey = toPascalCase(key);

    if (Array.isArray(val)) {
      newObject[newKey] = arrayChangeFunction(val);
    } else if (typeof val === "object" && val !== null) {
      newObject[newKey] = mainChangeFunction(val);
    } else {
      newObject[newKey] = val;
    }
  }
  return newObject;
}

export default { mainChangeFunction, arrayChangeFunction, justAdverts };
