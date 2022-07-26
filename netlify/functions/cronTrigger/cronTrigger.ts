import { Handler } from '@netlify/functions';
import axios from 'axios';

export const handler: Handler = async (event, context) => {
  const baseUrl = event.rawUrl.split(event.path)[0];
  const apiPrefix = '/.netlify/functions';

  const url = `${baseUrl}${apiPrefix}/tweet?token=${process.env.APP_SECRET_TOKEN}`;

  try {
    await axios(url);
  } catch (err) {
    console.log(err);
  }

  return {
    statusCode: 200,
  };
};
