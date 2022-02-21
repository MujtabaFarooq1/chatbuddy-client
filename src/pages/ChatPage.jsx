import React, { useState, useEffect } from "react";
// import { getCurrentUser } from "../actions/users";
import socket from "../socket/socket";
import { useCallModelContext } from "../context/callModelContext";
import { usePeerModelContext } from "../context/peerModelContext";
import { useStreamModelContext } from "../context/streamsModelContext";

import MessageList from "../components/MessageList";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Input, Button, message } from "antd";
import {
  checkIfUserExistWithId,
  getAllChatMessagesForRoom,
  getUserFromUid,
  sendMessagePermanent,
} from "../actions/dbHelper";
import { useAuth } from "../context/auth-context";
import { nanoid } from "nanoid";
import { getCurrentUserUserName } from "../actions/users";
import Peer from "simple-peer";

// importing connection object
import ConnectionObject from "../interfaces/ConnectionObject";

const ChatPage = () => {
  const history = useHistory();
  const { curAuth } = useAuth();
  const { friendId } = useParams();
  const [currentRoomId, setCurrentRoomId] = useState(
    (friendId + curAuth.uid).split("").sort().join("")
  );
  const [friendsRoomId, setFriendsRoomId] = useState(friendId);
  const [myRoomId, setMyRoomId] = useState(curAuth.uid);
  const [inputMessage, setInputMessage] = useState("");
  const [myName, setMyName] = useState(curAuth.userName);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [friendData, setFriendData] = useState(null);

  // Call Model stuff
  const { callModelState, callModelDispatch } = useCallModelContext();
  const { peerModelState, peerModelDispatch } = usePeerModelContext();
  const { streamModelState, streamModelDispatch } = useStreamModelContext();

  useEffect(() => {
    // console.log("Joined room id is -> ", currentRoomId);

    let unmounted = false;

    const initializeThings = async () => {
      const userExists = await checkIfUserExistWithId(friendsRoomId);
      const frnddt = await getUserFromUid(friendId);
      setFriendData(frnddt);

      if (userExists) {
        //Join Room
        socket.emit("join-room", {
          roomToJoin: currentRoomId,
          friendsRoomId,
          myRoomId,
        });
      } else {
        history.push("/");
      }
      handleMessageReceive();
    };

    initializeThings();

    getAllChatMessagesForRoom(currentRoomId).then((res) => {
      setLoading(false);
      setMessages([...res]);
      // console.log("Prev Messages are -->", res);
    });

    // Cleanup
    return () => {
      // setMessages([]);
      unmounted = true;
      socket.emit("leave-room", {
        roomToLeave: currentRoomId,
        leavingPerson: myRoomId,
      });
      console.log("Component destroyed");
    };
  }, []);

  const handleMessageSend = (e) => {
    e.preventDefault();

    if (inputMessage.trim()) {
      const message = {
        id: nanoid(),
        content: `${inputMessage}`,
        from: myRoomId,
        to: currentRoomId,
        type: "send",
        status: "",
        senderName: getCurrentUserUserName(),
        createdAt: Math.round(new Date().getTime() / 1000),
      };

      socket.emit("room-msg", {
        to: currentRoomId,
        message: message,
        from: myRoomId,
        forRoomId: friendsRoomId,
      });

      setMessages((previousMessages) => {
        return [...previousMessages, message];
      });

      sendMessagePermanent(currentRoomId, message);

      setInputMessage("");
    }
  };

  const handleMessageReceive = () => {
    socket.on("room-msg-recieve", ({ message }) => {
      let newMessageToSet = message;

      if (message.from === myRoomId) {
        newMessageToSet.type = "send";
      } else {
        newMessageToSet.type = "receive";
      }

      setMessages((prev) => {
        return [...prev, newMessageToSet];
      });
    });
  };

  const initializeVideoCall = async () => {
    try {
      // const mediaContstraints = new MediaCon()

      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          latency: 0.01,
          sampleSize: 16,
          volume: 0.8,
          sampleRate: 44100,
          googEchoCancellation: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          noiseSuppression: true,
        },
      });

      streamModelDispatch({
        type: "ADD_STREAM",
        payload: {
          id: currentStream.id,
          streamToAdd: currentStream,
          myStreamId: currentStream.id,
        },
      });

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: currentStream,
      });

      peerModelDispatch({ type: "SET_PEER", payload: { peer } });

      peer.on("signal", (mySignalData) => {
        const usersListToCall = [];
        //Me with my signal
        usersListToCall.push(
          new ConnectionObject(myRoomId, mySignalData, true)
        );
        //My friend with no signalYet
        usersListToCall.push(new ConnectionObject(friendsRoomId));

        callModelDispatch({
          type: "CALLING",
          payload: {
            initiatorId: myRoomId,
            initiatorName: getCurrentUserUserName(),
            to: usersListToCall,
          },
        });
      });

      peer.on("stream", (currentStream) => {
        // console.log("I got the stream ->", currentStream);

        streamModelDispatch({
          type: "ADD_STREAM",
          payload: { id: currentStream.id, streamToAdd: currentStream },
        });
      });

      // const currentStream = await navigator.mediaDevices.getUserMedia({
      //   video: true,
      //   audio: true,
      // });

      // setMyStream(currentStream);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="chatContainer">
        <div className="chatContainer__actions">
          <p className="chatContainer__chattingWith">
            {" "}
            Chatting With {friendData && friendData.userName}
          </p>
          <Button
            key="video-call"
            onClick={() => {
              initializeVideoCall();
            }}
            type="primary"
          >
            Video call
          </Button>
        </div>
        <div>
          {loading ? (
            <h1>Loading Be Patient ... </h1>
          ) : messages.length > 0 ? (
            <MessageList messageList={messages} />
          ) : (
            <h1>No Messages Yet Start Chat Now!</h1>
          )}
        </div>
        <div>
          {!loading ? (
            <form
              className="messageSendForm"
              onSubmit={(e) => {
                handleMessageSend(e);
              }}
            >
              <Input
                type="text"
                name="message"
                autoComplete="off"
                onChange={(e) => {
                  setInputMessage(e.target.value);
                }}
                value={inputMessage}
              />

              <Button key="send" type="primary" htmlType="submit">
                Send
              </Button>
            </form>
          ) : (
            <p>Wait a moment please !</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;
