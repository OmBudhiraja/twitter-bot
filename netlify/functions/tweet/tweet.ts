import { Handler } from '@netlify/functions';
import { isTokenValid, openAi, redisClient, Tokens, twitterClient } from '../../../src/helpers';

export const handler: Handler = async (event, context) => {
  if (!isTokenValid(event)) {
    return {
      statusCode: 400,
    };
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  const dbRes = await redisClient.get('tokens');

  if (!dbRes)
    return {
      statusCode: 400,
    };

  const { refreshToken } = JSON.parse(dbRes) as Tokens;

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);

  await redisClient.set('tokens', JSON.stringify({ accessToken, refreshToken: newRefreshToken }));

  // TODO: Add a prompt file (with random prompts) and use it here to get a random prompt
  const { data } = await openAi.createCompletion({
    model: 'text-davinci-001',
    prompt: 'tweet something cool for #techtwitter',
    max_tokens: 64,
  });

  const t = await refreshedClient.v2.tweet(data?.choices?.[0].text || '');

  return {
    statusCode: 200,
  };
};
