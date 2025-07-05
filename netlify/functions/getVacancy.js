const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

exports.handler = async (event) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  const id = event.queryStringParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Vacancy ID missing' }),
    };
  }

  try {
    await client.connect();
    const vacancy = await client.db('hypernet').collection('vacancies').findOne({ _id: new ObjectId(id) });

    if (!vacancy) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Vacancy not found' }),
      };
    }

    vacancy._id = vacancy._id.toString();

    return {
      statusCode: 200,
      body: JSON.stringify(vacancy),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await client.close();
  }
};
