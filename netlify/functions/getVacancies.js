const { MongoClient } = require('mongodb');
require('dotenv').config();

exports.handler = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const vacancies = await client.db('hypernet').collection('vacancies').find().toArray();

    // Convert _id ObjectId to string for each vacancy
    const vacanciesWithStringId = vacancies.map(v => ({
      ...v,
      _id: v._id.toString()
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(vacanciesWithStringId),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    await client.close();
  }
};
