import jwt from "jsonwebtoken";

export const signToken = (token, duration = null) => {
  console.log(token);
  return jwt.sign(token, process.env.JWTSECRET, { expiresIn: duration });
};

export const verifyToken = (token) => {
  return jwt.verify(token);
};

export const processRoleAuthorizationToken = (req, res) => {
  const { authorization } = req.headers;

  if (!authorization || authorization.length < 10) {
    return res.status(400).json({
      message: {
        name: "JsonWebTokenError",
        message: "invalid token",
      },
    });
  }

  const token = authorization.split("Bearer ")[1];
  console.log(token);
  const verifiedToken = verifyToken(token);
  console.log(verifiedToken);
  return verifiedToken;
};
