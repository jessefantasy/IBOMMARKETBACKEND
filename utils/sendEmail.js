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

  transporter.sendMail(mailOptions, (error, info) => {});
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

  transporter.sendMail(mailOptions, (error, info) => {});
};

export const sendManagerWelcomeMail = (email, username, defaultPassword) => {
  const mailOptions = {
    from: "amehharrison2020@gmail.com",
    to: email,
    subject: "Ibommarket Account Activated ",
    html: `
    <div >
      <p>Hi ${username},</p>

 
      <p>Yout Ibommarket manager's account has been acticated and you can now procees to login</p>
      <p></p>
      
      <p>Use ${email} as your email and ${defaultPassword} as your default passwor. This can be changed at any time  </p>
      <p></p>


      <p> You can proceed to <a href="${
        process.env.ADMIN_BASE_URL + "login "
      }"> from here </a>  </p> 
  
    </div>
  `,
  };

  transporter.sendMail(mailOptions, (error, info) => {});
};

export const sendUrgentRequestDeleteEmail = (email, reason) => {
  const mailOptions = {
    from: "amehharrison2020@gmail.com",
    to: email,
    subject: "Urgent request on Ibommarket not approved ",
    html: `
    <div >
      <p>Hi ${email},</p>

 
      <p> The urgent request you uploaded on ibommarket was rejected because of the reason(s) stated below</p>
      <p></p>
      <p>${reason}</p>
      
      <p>Please do well to post another request minding the reason why the first was denied  </p>
      <p></p>


      <p> Visit Ibommarket on <a href="https://ibommarketfrontend.onrender.com/">   here  </a> to make another request </p> 
  
    </div>
  `,
  };

  transporter.sendMail(mailOptions, (error, info) => {});
};

export const sendUrgentRequestActivationEmail = (email) => {
  const mailOptions = {
    from: "amehharrison2020@gmail.com",
    to: email,
    subject: "Urgent request on Ibommarket approved ",
    html: `
    <div >
      <p>Hi ${email},</p>

 
      <p> The urgent request you uploaded on ibommarket is not live</p>
      <p></p> 
      <p></p>
      <p> Please note all request are deleted after two days</p>


      <p> You can visit Ibommarket <a href="https://ibommarketfrontend.onrender.com/">   here  </a>  </p> 
  
    </div>
  `,
  };

  transporter.sendMail(mailOptions, (error, info) => {});
};
