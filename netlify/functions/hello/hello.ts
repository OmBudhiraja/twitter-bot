import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  let name = 'world';
  const queryParams = event.queryStringParameters;

  if (queryParams && queryParams.name) name = queryParams.name;

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello, ${name}!`,
    }),
  };
};
