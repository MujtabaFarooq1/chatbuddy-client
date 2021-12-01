import React, { useState, useEffect, useRef } from "react";
// import { getCurrentUser } from "../actions/users";
import socket from "../socket/socket";
// import { nanoid } from "nanoid";
// import database from "../firebase/firebase";
import { useCallModelContext } from "../context/callModelContext";
import { usePeerModelContext } from "../context/peerModelContext";
import { useStreamModelContext } from "../context/streamsModelContext";

import MessageList from "./MessageList";
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { Input, Button } from "antd";
import { checkIfUserExistWithId } from "../actions/dbHelper";
import { useAuth } from "../context/auth-context";
import { nanoid } from "nanoid";
import { getCurrentUserUserName } from "../actions/users";
// const { TextArea } = Input;
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

  const [myStream, setMyStream] = useState();

  //Rererences
  const myVideoPreview = useRef();
  const friendVideoPreview = useRef();
  const connectionRef = useRef();

  // Call Model stuff
  const { callModelState, callModelDispatch } = useCallModelContext();
  const { peerModelState, peerModelDispatch } = usePeerModelContext();
  const { streamModelState, streamModelDispatch } = useStreamModelContext();

  useEffect(() => {
    checkIfUserExistWithId(friendsRoomId).then((userExists) => {
      if (userExists) {
        //Join Room
        socket.emit("join-room", {
          roomToJoin: currentRoomId,
          friendsRoomId,
          myRoomId,
        });

        if (!socket._callbacks[`$room-msg-recieve`]) {
          socket.on("room-msg-recieve", ({ message: currentMessage, from }) => {
            // currentMessage.type = "receive";
            setMessages((previousMessages) => {
              currentMessage.type = "receive";
              return [...previousMessages, currentMessage];
            });
          });
        }

        if (!socket._callbacks[`$initialMessages`]) {
          socket.on("initialMessages", ({ initialChatMessages }) => {
            filterAndSetInitialMessages(initialChatMessages);
          });
        }

        setLoading(false);
      } else {
        // message.info("Sorry Try To Message your friend from the dashboard!");
        // alert(
        //   "Kindly make sure the person you are messaging is really your friend"
        // );
        history.push("/");
      }
    });

    // Cleanup
    return () => {
      setMessages([]);
      socket.emit("leave-room", {
        roomToLeave: currentRoomId,
        leavingPerson: myRoomId,
      });
      console.log("Component destroyed");
    };
  }, [currentRoomId, friendsRoomId, history, myRoomId]);

  // // for handling stream state and calling
  // useEffect(() => {
  //   if (myStream !== undefined) {
  //     // myVideoPreview.current.srcObject = myStream;
  //     const peer = new Peer({
  //       initiator: true,
  //       trickle: false,
  //       stream: myStream,
  //     });
  //     peer.on("signal", (data) => {
  //       socket.emit("callUser", {
  //         userToCall: friendsRoomId,
  //         signalData: data,
  //         from: myRoomId,
  //         name: getCurrentUserUserName(),
  //       });
  //     });

  //     peer.on("stream", (currentStream) => {
  //       friendVideoPreview.current.srcObject = currentStream;
  //     });

  //     socket.on("callAccepted", ({ signal, userName }) => {
  //       // setCallAccepted(true);
  //       // setUserName(userName);
  //       peer.signal(signal);
  //       socket.emit("updateMyMedia", {
  //         type: "both",
  //         // currentMediaStatus: [myMicStatus, myVdoStatus],
  //       });
  //     });

  //     connectionRef.current = peer;
  //   }
  // }, [myStream]);

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
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamModelDispatch({
        type: "ADD_STREAM",
        payload: { id: currentStream.id, streamToAdd: currentStream },
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

            <Button
              key="video-call"
              onClick={() => {
                initializeVideoCall();
              }}
              type="primary"
            >
              Video call
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatPage;

{
  /* <Modal
title="Calling Friend"
visible={isCalling}
style={{ top: 20 }}
width={callAccepted ? "100%" : "50%"}
onOk={() => {
  // myVideoPreview.current.srcObject = null;
  setIsCalling(false);
  setMyStream((prevStream) => {
    prevStream.getTracks().forEach(function (track) {
      track.stop();
    });
    return prevStream;
  });
}}
onCancel={() => {
  // myVideoPreview.current.srcObject = null;
  setIsCalling(false);
  setMyStream((prevStream) => {
    prevStream.getTracks().forEach(function (track) {
      track.stop();
    });
    return prevStream;
  });
}}
>
{callAccepted ? (
  <>
    <video width="50%" controls autoPlay ref={myVideoPreview}></video>
    <video width="50%" controls ref={friendVideoPreview}></video>
  </>
) : (
  <p>Waiting for friend to accept the call ...</p>
)}
</Modal> */
}
