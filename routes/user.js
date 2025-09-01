import { Router } from "express";
import UserSchema from "../schema/user.js";
import jwt from "jsonwebtoken";
import change from "../utils/change.js";
import { createTransport } from "nodemailer";
import * as argon2 from "argon2";
import ManagerSchema from "../schema/manager.js";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const UserRouter = Router();

const hashPassword = async (password) => {
  const result = await argon2.hash(password);
  return result;
};

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "amehharrison2020@gmail.com",
    pass: process.env.MAILER,
  },
});

const sendPasswordResetEmail = (email, username, link) => {
  const mailOptions = {
    from: "amehharrison2020@gmail.com",
    to: email,
    subject: "Reset password",
    html: `
    <div >
      <p>Hi ${username},</p>

 
      <p>To reset your password  please click on the link:</p>

      <p><a href="${link}">Reset password</a></p>

      <p>If you are unable to click the link, please copy and paste it into your browser's address bar.</p>

      <p>Please note that this link is valid for 10 mins  </p>
      <p>Disregard this email if you did not request for a password change  </p>
  
    </div>
  `,
  };

  transporter.sendMail(mailOptions, (error, info) => {});
};

const comparePassword = async (savedPassword, enteredPassword) => {
  const isMatch = await argon2.verify(savedPassword, enteredPassword);
  return isMatch;
};

UserRouter.post("/account/register", async (req, res) => {
  try {
    const hashedPassword = await hashPassword(req.body.password);
    // const hashedUsername = await hashPassword(req.body.username);
    const result = new UserSchema({
      ...req.body,
      password: hashedPassword,
    });
    await result.save();
    res.status(200).json({ user: result });
  } catch (error) {
    if (error.errorResponse?.code == 11000) {
      return res.status(400).json({ error });
    }
    res.status(500).json({ error });
  }
});

UserRouter.post("/account/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserSchema.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Invalid username or password" });
    }

    const passwordMatch = await comparePassword(user.password, password);
    if (!passwordMatch) {
      return res.status(404).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ Id: user._id }, process.env.JWTSECRET, {
      expiresIn: "30d",
    });

    const sendUser = {
      ...user._docs,
      Id: user._id.toString(),
      token,
      password: "",
      version: 0,
    };
    res.status(200).json(change.mainChangeFunction(sendUser));
  } catch (error) {
    res.status(500).json({ error });
  }
});

UserRouter.post("/account/google-auth", async (req, res) => {
  try {
    const { access_token } = req.body;
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const email = response.data.email;

    let user = await UserSchema.findOne({ email });

    if (!user) {
      user = new UserSchema({
        username: email,
        email,
      });

      await user.save();
    }

    const token = jwt.sign({ Id: user._id }, process.env.JWTSECRET, {
      expiresIn: "30d",
    });

    const sendUser = {
      ...user._docs,
      Id: user._id.toString(),
      token,
      password: "",
      version: 0,
    };
    res.status(200).json(change.mainChangeFunction(sendUser));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

UserRouter.post("/account/google-one-tap-auth", async (req, res) => {
  try {
    const { access_token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: access_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log(ticket.payload.email);

    const email = ticket.payload.email;

    let user = await UserSchema.findOne({ email });

    if (!user) {
      user = new UserSchema({
        userName: email,
        email,
      });

      await user.save();
    }

    const token = jwt.sign({ Id: user._id }, process.env.JWTSECRET, {
      expiresIn: "30d",
    });

    const sendUser = {
      ...user._docs,
      Id: user._id.toString(),
      token,
      password: "",
      version: 0,
    };
    res.status(200).json(change.mainChangeFunction(sendUser));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

UserRouter.get("/account/current-user", async (req, res) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || authorization.length < 10) {
      return res.status(400).json({ message: "Invalid token in header" });
    }

    const token = authorization.split("Bearer ")[1];
    const userId = jwt.verify(token, process.env.JWTSECRET);
    const user = await UserSchema.findOne({ _id: userId.Id });

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    res.status(200).json({
      ...user._doc,
      Token: userId.Id,
      Id: userId.Id,
      password: "",
      BusinessId: user?.businessId,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

UserRouter.post("/account/send-password-recovery-email", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserSchema.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "No user with this email!" });
    }
    const token = jwt.sign(
      { Id: user._id, version: user.version ? user.version : 0 },
      process.env.JWTSECRET,
      { expiresIn: "10m" }
    );

    console.log(token);
    sendPasswordResetEmail(
      email,
      user.username,
      process.env.BASE_URL + "reset-password?token=" + token
    );
    res.status(200).json({ message: "Sent to " + email });
  } catch (error) {
    res.status(500).json(error);
  }
});

UserRouter.post("/account/reset-password", async (req, res) => {
  try {
    const { password, token } = req.body;
    const userId = jwt.verify(token, process.env.JWTSECRET);

    userId.Id;

    const user = await UserSchema.findById(userId.Id);

    if (!user) {
      return res.status(404).json({ message: "No user found!" });
    } else if (user.version !== userId.version) {
      return res.status(400).json({ message: "Token already used!" });
    }

    const newPassword = await hashPassword(password);

    user.password = newPassword;
    user.version = user.version + 1;
    const updated = await user.save();
    console.log(updated);

    // sendPasswordResetEmail(email ,"Ameh" , process.env.BASR_URL + token)
    res.status(200).json({ message: "password reset sucessful" });
  } catch (error) {
    res.status(500).json(error);
  }
});

UserRouter.post("/account/settings-reset-password", async (req, res) => {
  try {
    const { current, newPass } = req.body;
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
    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);

    const userId = verifiedToken.Id;

    const user = await UserSchema.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "No user found!" });
    }

    if (!(await comparePassword(user.password, current))) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect!" });
    }
    const newPassword = await hashPassword(newPass);

    user.password = newPassword;
    user.version = user.version + 1;
    const updated = await user.save();
    console.log(updated);
    res.status(200).json({ message: "password reset sucessful" });
  } catch (error) {
    res.status(500).json(error);
  }
});

UserRouter.post("/account/role-login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (role == "manager") {
      const manager = await ManagerSchema.findOne({
        email: username,
      });

      if (!manager) {
        return res.status(404).json({
          message: "invalid usernamer or password",
        });
      }
      if (manager.status != "active") {
        return res.status(400).json({
          message: "Account not activated, please contact admin",
        });
      }
      const token = jwt.sign({ username, role }, process.env.JWTSECRET);
      return res.status(200).json({
        Username: manager.username,
        Token: token,
        Role: role,
        ...manager._doc,
      });
    }

    res.status(404).json({
      message: "invalid usernamer or password",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});
// role current user
UserRouter.get("/account/role-current-user", async (req, res) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || authorization.length < 10) {
      return res.status(400).json({ message: "Invalid token in header" });
    }

    const token = authorization.split("Bearer ")[1];
    const adminId = jwt.verify(token, process.env.JWTSECRET);
    if (adminId.role == "admin") {
      return res
        .status(200)
        .json({ Username: adminId.username, Token: token, Role: "admin" });
    }

    // wrong logic
    let adminDetails;
    if (adminId.role == "manager") {
      adminDetails = await ManagerSchema.findOne({
        email: adminId.username,
      });
    } else {
      adminDetails = await MarketerSchema.findOne({
        email: adminId.username,
      });
    }

    if (!adminDetails) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    return res.status(200).json({
      Username: adminDetails.username,
      Token: token,
      Role: adminId.role,
      ...adminDetails._doc,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});
export default UserRouter;
