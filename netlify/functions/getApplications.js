const { MongoClient } = require('mongodb');
require('dotenv').config();

exports.handler = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const applications = await client.db('hypernet').collection('applications').find().toArray();
    return {
      statusCode: 200,
      body: JSON.stringify(applications),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    await client.close();
  }
};
