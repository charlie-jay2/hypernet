const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const authHeader = event.headers.authorization || '';
  if (authHeader !== `Bearer ${process.env.ADMIN_PASS}`) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!data.title || !data.description || !data.deadline) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  try {
    await client.connect();
    const db = client.db('hypernet');
    const vacanciesCol = db.collection('vacancies');

    const newVacancy = {
      title: data.title,
      description: data.description,
      deadline: new Date(data.deadline),
      createdAt: new Date(),
    };

    const result = await vacanciesCol.insertOne(newVacancy);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Vacancy created', id: result.insertedId }),
    };
  } catch (err) {
    return { statusCode: 500, body: 'Server Error: ' + err.message };
  } finally {
    await client.close();
  }
};
