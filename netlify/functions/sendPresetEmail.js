const nodemailer = require('nodemailer');
require('dotenv').config();

function applicationAcceptedEmail(name, vacancyTitle) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
      <h2 style="color: #28a745;">Congratulations!</h2>
      <p>Dear ${name},</p>
      <p>We are pleased to inform you that you have been <strong>accepted</strong> for the position of <em>${vacancyTitle}</em> at Hypernet.</p>
      <p>Our HR team will contact you shortly with further details.</p>
      <p>Best regards,<br><strong>Hypernet Team</strong></p>
      <hr/>
      <small style="color:#666;">This is an automated message from Hypernet vacancies portal.</small>
    </body>
  </html>`;
}

function applicationDeniedEmail(name, vacancyTitle) {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
      <h2 style="color:#dc3545;">Application Update</h2>
      <p>Dear ${name},</p>
      <p>Thank you for applying for the position of <em>${vacancyTitle}</em> at Hypernet.</p>
      <p>After careful consideration, we regret to inform you that you have not been selected for this position.</p>
      <p>We encourage you to apply for future openings.</p>
      <p>Best regards,<br><strong>Hypernet Team</strong></p>
      <hr/>
      <small style="color:#666;">This is an automated message from Hypernet vacancies portal.</small>
    </body>
  </html>`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { preset, email, name, vacancy } = JSON.parse(event.body);

  if (!preset || !email || !name || !vacancy) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  let htmlContent;

  if (preset === 'accepted') {
    htmlContent = applicationAcceptedEmail(name, vacancy);
  } else if (preset === 'denied') {
    htmlContent = applicationDeniedEmail(name, vacancy);
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown preset email' }) };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Hypernet Vacancies" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your application status for ${vacancy}`,
      html: htmlContent,
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'Email sent' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
