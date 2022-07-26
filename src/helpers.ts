import TwitterApi from 'twitter-api-v2';
import { Configuration, OpenAIApi } from 'openai';
import { createClient } from 'redis';
import { Event } from '@netlify/functions/dist/function/event';

export interface TwitterReqs {
  codeVerifier: string;
  state: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Add this to your Twitter Developer Account in the Callback URL section:
export const callbackUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.CALLBACK_URL!
    : 'http://localhost:8888/.netlify/functions/callback';

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

export const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
});

const openAiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openAi = new OpenAIApi(openAiConfig);

export const isTokenValid = (event: Event) => {
  if (
    !event.queryStringParameters ||
    !event.queryStringParameters.token ||
    event.queryStringParameters.token !== process.env.APP_SECRET_TOKEN
  ) {
    return false;
  }

  return true;
};

// [functions."cronTrigger"]
// schedule = "@daily"
