import { StreamClient } from '@stream-io/node-sdk';
import dotenv from 'dotenv';

dotenv.config();

let streamClient = null;

export const getStreamClient = () => {
  if (!streamClient) {
    streamClient = new StreamClient(
      process.env.STREAM_API_KEY,
      process.env.STREAM_API_SECRET
    );
  }
  return streamClient;
};

export const generateStreamToken = (userId) => {
  const client = getStreamClient();
  // Generate a user token valid for 24 hours
  const validity = 24 * 60 * 60;
  return client.generateUserToken({ user_id: String(userId), validity_in_seconds: validity });
};

export const upsertStreamUser = async (userId, userData) => {
  try {
    const client = getStreamClient();
    await client.upsertUsers([{
      id: String(userId),
      name: userData.name || 'User',
      image: userData.image || '',
      role: 'user',
    }]);
  } catch (err) {
    console.error('Stream upsertUser error:', err.message);
  }
};