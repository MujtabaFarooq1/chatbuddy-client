import { useAuth } from "../context/auth-context";
import moment from "moment";

const Message = ({ message }) => {
  const { curAuth } = useAuth();
  return (
    // <p className={`message ${message.type ?? "sent"}`}>{message.content}</p>
    <>
      <p
        className={`message ${
          message.from === curAuth.uid ? "send" : "receive"
        }`}
      >
        <span className="messageCreatedAt">
          {moment(message.createdAt * 1000).fromNow()}
        </span>
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
