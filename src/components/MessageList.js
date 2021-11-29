import React, { useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import Message from "./Message";

const MessageList = ({ messageList }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  return (
    <>
      <div className="messageListWrapper">
        {messageList.map((msg) => (
          <Message key={nanoid()} message={msg} />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </>
  );
};

export default MessageList;
