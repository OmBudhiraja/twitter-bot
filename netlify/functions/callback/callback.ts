import { Handler } from '@netlify/functions';
import { callbackUrl, redisClient, twitterClient, TwitterReqs } from '../../../src/helpers';

export const handler: Handler = async (event, context) => {
  const { state, code } = event.queryStringParameters || {};

  if (!state || !code) {
    return {
      statusCode: 400,
    };
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  const dbRes = await redisClient.get('twitterReqs');

  if (!dbRes)
    return {
      statusCode: 400,
    };

  const { codeVerifier, state: storedState } = JSON.parse(dbRes) as TwitterReqs;

  if (state !== storedState)
    return {
      statusCode: 400,
    };

  const {
    accessToken,
    refreshToken,
    client: loggedClient,
  } = await twitterClient.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: callbackUrl,
  });

  await redisClient.set('tokens', JSON.stringify({ accessToken, refreshToken }));

  const baseUrl = event.rawUrl.split(event.path)[0];
  const apiPrefix = '/.netlify/functions';

  const url = `${baseUrl}${apiPrefix}/tweet?token=${process.env.APP_SECRET_TOKEN}`;

  return {
    statusCode: 302,
    headers: {
      location: url,
    },
  };
};
