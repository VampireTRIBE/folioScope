const path = require("node:path");
const fs = require("node:fs");
const handleBars = require("handlebars");
const nodeMailer = require("nodemailer");

module.exports.verifyMail = async (token, email) => {
  try {
    const filepath = path.join(__dirname, "template.hbs");
    const emailTemplateSource = fs.readFileSync(filepath, "utf-8");
    
    const template = handleBars.compile(emailTemplateSource);
    const htmlToSend = template({
      token: encodeURIComponent(token),
    });

    const transport = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailConfiguration = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Email Verification",
      html: htmlToSend,
    };

    await transport.sendMail(mailConfiguration);
  } catch (err) {
    throw new Error(err.message);
  }
};
