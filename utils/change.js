const changeFirstAlphabet = (value) => {
  let remaining = value.split("");
  remaining.splice(0, 1);
  return value[0].toUpperCase() + remaining.join("");
};

function arrayChangeFunctin(value) {
  const newArray = [];
  let count = 0;
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== "object") {
      newArray.push(value[i]);
    } else {
      newArray.push(mainChangeFunction(value[i]));
    }
  }

  return newArray;
}
function justAdverts(value) {
  const newArray = [];

  value.forEach((one) => {
    newArray.push(mainChangeFunction(one));
  });
  return newArray;
}
function mainChangeFunction(object) {
  const newObject = {};
  for (let key in object) {
    if (typeof object[key] !== "object") {
      newObject[changeFirstAlphabet(key)] = object[key];
    } else if (object[key]?.length) {
      newObject[changeFirstAlphabet(key)] = arrayChangeFunctin(object[key]);
    } else {
      newObject[changeFirstAlphabet(key)] = mainChangeFunction(object[key]);
    }
  }

  return newObject;
}
 

export default { mainChangeFunction, arrayChangeFunctin, justAdverts };
