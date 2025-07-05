const { MongoClient, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const {
    vacancyId,
    name,
    discordUsername,
    discordId,
    age,
    reason,
    suitability,
    contribution,
    email,
  } = data;

  // Basic required validation
  if (
    !vacancyId ||
    !name ||
    !discordUsername ||
    !discordId ||
    !age ||
    !reason ||
    !suitability ||
    !contribution
  ) {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('hypernet');
    const vacanciesCol = db.collection('vacancies');
    const applicationsCol = db.collection('applications');

    // Verify vacancy exists
    const vacancy = await vacanciesCol.findOne({ _id: new ObjectId(vacancyId) });
    if (!vacancy) {
      return { statusCode: 400, body: 'Vacancy not found' };
    }

    const newApp = {
      vacancyId: new ObjectId(vacancyId),
      name,
      discordUsername,
      discordId,
      age: parseInt(age),
      reason,
      suitability,
      contribution,
      email: email || '',
      appliedAt: new Date(),
    };

    await applicationsCol.insertOne(newApp);

    // Send confirmation email if email provided
    if (email) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Hypernet Vacancies" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Application Received for ${vacancy.title}`,
        html: `
          <h2>Thank you for applying to ${vacancy.title} at Hypernet</h2>
          <p>Dear ${name},</p>
          <p>We have received your application. Our team will review it and get back to you.</p>
          <p>Best regards,<br>Hypernet Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Application submitted' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    await client.close();
  }
};
