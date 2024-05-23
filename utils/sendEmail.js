import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "amehharrison2020@gmail.com",
    pass: "xxpx zpui blmh lwgc",
  },
});

export const sendPasswordResetEmail = (email, username, link) => {
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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent : " + info.response);
    }
  });
};

export const sendRoleActvationMail = (email, username, link) => {
  const mailOptions = {
    from: "amehharrison2020@gmail.com",
    to: email,
    subject: "Activate manager's account on Ibommarket",
    html: `
    <div >
      <p>Hi ${username},</p>

 
      <p>To activate your account  please click on the link:</p>

      <p><a href="${
        process.env.ADMIN_BASE_URL + link
      }">Activate account here</a></p>

      <p>If you are unable to click the link, please copy and paste it into your browser's address bar.</p>

      <p>Please note that this link is valid for 30 mins  </p> 
  
    </div>
  `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent : " + info.response);
    }
  });
};
