import { Handler } from '@netlify/functions';
import { callbackUrl, isTokenValid, redisClient, twitterClient } from '../../../src/helpers';

export const handler: Handler = async (event, context) => {
  if (!isTokenValid(event)) {
    return {
      statusCode: 400,
    };
  }

  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(callbackUrl, {
    scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access', 'like.write'],
  });

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  await redisClient.set('twitterReqs', JSON.stringify({ codeVerifier, state }));

  return {
    statusCode: 302,
    headers: {
      location: url,
    },
  };
};
