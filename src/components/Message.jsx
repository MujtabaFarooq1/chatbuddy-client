const Message = ({ message }) => {
  return (
    // <p className={`message ${message.type ?? "sent"}`}>{message.content}</p>
    <>
      <p className={`message ${message.type ?? "send"}`}>
        <span className="messageSentBy">
          {message?.senderName ?? "Anonymous"}:-
        </span>
        {message.content}
        <span className="messageStatus">{message.status}</span>
      </p>
    </>
  );
};

export default Message;
