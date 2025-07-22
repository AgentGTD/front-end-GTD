import React, { createContext, useContext, useState } from 'react';

const ChatBotContext = createContext();

export function useChatBot() {
  return useContext(ChatBotContext);
}

export function ChatBotProvider({ children }) {
  const [visible, setVisible] = useState(false);

  const openChatBot = () => setVisible(true);
  const closeChatBot = () => setVisible(false);

  return (
    <ChatBotContext.Provider value={{ visible, openChatBot, closeChatBot }}>
      {children}
    </ChatBotContext.Provider>
  );
}