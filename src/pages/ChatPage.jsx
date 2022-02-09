import React, { useState, useEffect, useRef } from "react";
// import { getCurrentUser } from "../actions/users";
import socket from "../socket/socket";
import { useCallModelContext } from "../context/callModelContext";
import { usePeerModelContext } from "../context/peerModelContext";
import { useStreamModelContext } from "../context/streamsModelContext";

import MessageList from "../components/MessageList";
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { Input, Button } from "antd";
import { checkIfUserExistWithId } from "../actions/dbHelper";
import { useAuth } from "../context/auth-context";
import { nanoid } from "nanoid";
import { getCurrentUserUserName } from "../actions/users";
import Peer from "simple-peer";

// importing connection object
import ConnectionObject from "../interfaces/ConnectionObject";

const ChatPage = () => {
  const history = useHistory();
  const { curAuth } = useAuth();
  const location = useLocation();
  const [currentRoomId, setCurrentRoomId] = useState(
    (location.to + curAuth.uid).split("").sort().join("")
  );
  const [friendsRoomId, setFriendsRoomId] = useState(location.to);
  const [myRoomId, setMyRoomId] = useState(curAuth.uid);
  const [inputMessage, setInputMessage] = useState("");
  const [myName, setMyName] = useState(curAuth.userName);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Call Model stuff
  const { callModelState, callModelDispatch } = useCallModelContext();
  const { peerModelState, peerModelDispatch } = usePeerModelContext();
  const { streamModelState, streamModelDispatch } = useStreamModelContext();

  useEffect(() => {
    // console.log("Joined room id is -> ", currentRoomId);

    let unmounted = false;

    const initializeThings = async () => {
      const userExists = await checkIfUserExistWithId(friendsRoomId);

      if (userExists) {
        //Join Room
        socket.emit("join-room", {
          roomToJoin: currentRoomId,
          friendsRoomId,
          myRoomId,
        });

        socket.on("room-msg-recieve", ({ message: currentMessage, from }) => {
          // currentMessage.type = "receive";
          if (!unmounted) {
            setMessages((previousMessages) => {
              currentMessage.type = "receive";
              return [...previousMessages, currentMessage];
            });
          }
        });

        socket.on("initialMessages", ({ initialChatMessages }) => {
          if (!unmounted) {
            filterAndSetInitialMessages(initialChatMessages);
          }
        });

        // console.log("Socket Callbacks are -> ", socket._callbacks);

        setLoading(false);
      } else {
        history.push("/");
      }
    };

    initializeThings();

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

      setInputMessage("");
    }
  };

  const filterAndSetInitialMessages = (messagesToBeFiltered) => {
    const filteredMessages = messagesToBeFiltered.map((msg) => {
      if (msg.from === myRoomId) {
        msg.type = "send";
        return msg;
      }
      msg.type = "receive";
      return msg;
    });

    setMessages(filteredMessages);
  };

  const initializeVideoCall = async () => {
    try {
      // const mediaContstraints = new MediaCon()

      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          mandatory: {
            googEchoCancellation: "false",
            googNoiseSuppression: "false",
            googHighpassFilter: "false",
            echoCancellation: "false",
          },
        },
      });

      console.log("My Stream Id will be -->", currentStream.id);

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
        console.log("I got the stream ->", currentStream);

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
