import * as argon2 from "argon2";

const hash = argon2.hash("Harrison123.").then((result) => {
  console.log(result);
});

console.log(hash);

argon2
  .verify(
    "$argon2id$v=19$m=65536,t=3,p=4$dylqowQl7s2YePIpsB/klw$68JoNwujabeszX0sitXlFojUnNueG/hHWwVWpQxEPx0",
    "Harrison123."
  )
  .then((result) => {
    console.log(result);
  });
