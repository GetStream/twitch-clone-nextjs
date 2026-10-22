import 'stream-chat';

declare module 'stream-chat' {
  interface CustomMessageData {
    color?: string;
    isStreamer?: boolean;
  }
}
