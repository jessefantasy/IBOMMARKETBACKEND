export const createIbmId = (arrays) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let final = "";
  for (let index = 0; index < 7; index++) {
    final = final + numbers[Math.floor(Math.random() * 9)];
  }
  final = "IBM-" + final;

  if (arrays.includes(final)) {
    return createIbmId(arrays);
  }
  return final;
};
