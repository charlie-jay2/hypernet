require('dotenv').config();

exports.handler = async () => {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({ adminPass: process.env.ADMIN_PASS }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
