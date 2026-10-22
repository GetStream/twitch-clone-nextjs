'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Channel as StreamChannel } from 'stream-chat';
import { StreamChat } from 'stream-chat';
import type { LocalMessage, Message, SendMessageOptions } from 'stream-chat';
import {
  Channel,
  Chat,
  MessageComposer,
  MessageComposerProps,
  MessageList,
  Window,
  WithComponents,
} from 'stream-chat-react';
import CustomChannelHeader from './customChannelHeader';

import { createTokenProvider } from '@/lib/streamClient';
import 'stream-chat-react/css/index.css';
import CustomMessage from './customMessage';

export default function MyChat({
  userId,
  userName,
  isStreamer,
  setChatExpanded,
}: {
  userId: string;
  userName: string;
  isStreamer: boolean;
  setChatExpanded?: (expanded: boolean) => void;
}) {
  const [client, setClient] = useState<StreamChat | undefined>();
  const [channel, setChannel] = useState<StreamChannel | undefined>();
  const [customColor, setCustomColor] = useState<string | undefined>();

  useEffect(() => {
    const initializeChatClient = async () => {
      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        console.error('[MyChat] Stream API key is not set');
        return;
      }
      const client = new StreamChat(apiKey);
      await client.connectUser(
        {
          id: userId,
          name: userName,
        },
        createTokenProvider(userId)
      );
      setClient(client);
    };

    const createChannel = async () => {
      if (!client) {
        return;
      }
      const chatChannel = client.channel('livestream', userName.toLowerCase());
      await chatChannel.create();
      await chatChannel.addMembers([userId], {
        text: `${userName} joined the stream.`,
        user_id: userId,
      });
      setCustomColor(createCustomColor());
      setChannel(chatChannel);
    };

    if (!client) {
      console.log('[MyChat] Client is not set');
      initializeChatClient();
      return;
    }
    if (!channel) {
      createChannel();
    }
  }, [client, userName, userId, channel]);

  const submitHandler: MessageComposerProps['overrideSubmitHandler'] = useCallback(
    async (params: {
      cid: string;
      localMessage: LocalMessage;
      message: Message;
      sendOptions: SendMessageOptions;
    }) => {
      // custom logic goes here
      await channel?.sendMessage(
        {
          text: params.localMessage.text,
          user_id: params.localMessage.user_id,
          color: customColor,
          isStreamer: isStreamer,
        },
        params.sendOptions
      );
    },
    [channel, customColor, isStreamer]
  );

  if (!client || !channel) return <div>Setting up client & connection...</div>;

  return (
    <Chat client={client}>
      <WithComponents overrides={{ Message: CustomMessage }}>
        <Channel channel={channel}>
          <Window>
            <CustomChannelHeader setChatExpanded={setChatExpanded} />
            <MessageList />
            <MessageComposer overrideSubmitHandler={submitHandler} />
          </Window>
        </Channel>
      </WithComponents>
    </Chat>
  );
}

function createCustomColor(): string {
  const colors = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange',
    'pink',
    'brown',
    'gray',
    'black',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
