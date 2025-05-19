import nodemailer from 'nodemailer';

export async function sendEmail(email, subject ,content) {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,  
      pass: process.env.MAIL_PASS,  
    },
  });

  const toField = Array.isArray(email) ? email.join(', ') : email;

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: toField,
    subject: `${subject}`,
    text: `${content}`,
  };

  await transporter.sendMail(mailOptions);
}
