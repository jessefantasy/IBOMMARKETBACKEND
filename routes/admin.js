import { Router } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";

const AdminRouter = Router();

AdminRouter.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Admin-Login");
    if (
      username == process.env.AJUSERNAME &&
      password == process.env.AJPASSWORD
    ) {
      const token = jwt.sign(
        { username: "AJ", role: "admin" },
        process.env.JWTSECRET
      );

      return res.status(200).json({ token });
    } else if (
      username == process.env.JESSUSERNAME &&
      password == process.env.JESSPASSWORD
    ) {
      const token = jwt.sign(
        { username: "Jess", role: "admin" },
        process.env.JWTSECRET
      );
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ message: "Invalid user credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

AdminRouter.post("/verify-2fa", async (req, res) => {
  try {
    const { token, code } = req.body;
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    console.log(decoded);
    let secret;
    if (decoded.username == "AJ") {
      secret = process.env.AJSECRET;
    } else if (decoded.username == "Jess") {
      secret = process.env.JESSSECRET;
    } else {
      return res.status(401).json({ message: "Invalid user" });
    }

    console.log(code)
    console.log(secret)

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 1,
    });
    const newToken = jwt.sign(
      { username: decoded.username, role: "admin" },
      process.env.JWTSECRET
    );
    console.log(verified)
    if (verified) {
      return res
        .status(200)
        .json({ Username: decoded.username, Token: newToken, Role: "admin" });
    } else {
      return res.status(401).json({ message: "Invalid 2FA code" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

AdminRouter.post("/2fa/generate", async (req, res) => {
  try {
    const { username } = req.body;

    const secret = speakeasy.generateSecret({ name: "AJ@IBM", length: 20 });
    const token = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });

    console.log(secret);
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    return res.status(200).json({
      message: "2FA setup successful",
      qrCode,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default AdminRouter;
