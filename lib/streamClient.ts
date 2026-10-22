import { createToken } from '@/app/actions';
import {
  StreamVideoClient,
  TokenProvider,
  UserRequest,
} from '@stream-io/video-client';

let client: StreamVideoClient | undefined;

export const getClient = (creds: {
  apiKey: string;
  user: Omit<UserRequest, 'role'>;
  userToken?: string;
}) => {
  if (!client) {
    client = new StreamVideoClient({
      apiKey: creds.apiKey,
      user: creds.user,
      token: creds.userToken,
      tokenProvider: createTokenProvider(creds.user.id),
    });
  }

  return client;
};

export const createTokenProvider =
  (userId: string | undefined): TokenProvider =>
  async () => {
    const token = await createToken(userId || '!anon');
    if (!token) {
      throw new Error('Failed to create token');
    }
    return token;
  };
