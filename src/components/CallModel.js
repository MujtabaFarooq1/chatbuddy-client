import React, { useState, useEffect, useContext, useRef } from "react";
import { Input, Button, Modal } from "antd";
import { useCallModelContext } from "../context/callModelContext";
import { usePeerModelContext } from "../context/peerModelContext";
import { useStreamModelContext } from "../context/streamsModelContext";
import socket, { io } from "../socket/socket";
import { useAuth } from "../context/auth-context";
import Peer from "simple-peer";
import VideoStream from "./VideoStream";
import ConnectionObject from "../interfaces/ConnectionObject";

const CallModel = (props) => {
  const { curAuth } = useAuth();
  const { callModelState, callModelDispatch } = useCallModelContext();
  const { peerModelState, peerModelDispatch } = usePeerModelContext();
  const { streamModelState, streamModelDispatch } = useStreamModelContext();

  useEffect(() => {
    // console.log(socket._callbacks);
  });

  if (!socket._callbacks[`$reject-call`]) {
    socket.on("reject-call", ({ rejectedBy, rejectedTo }) => {
      if (rejectedTo?.length < 2) {
        callModelDispatch({ type: "CLOSE" });
      } else {
        callModelDispatch({ type: "CALL_REJECTED", payload: rejectedTo });
      }
      console.log("call rejected by ->", rejectedBy);
    });
  }

  useEffect(() => {
    socket.removeAllListeners("some-user-accepted-call");

    socket.on(
      "some-user-accepted-call",
      ({ updatedToList, acceptedByUserId }) => {
        try {
          // console.log("PEER model state is ->", peerModelState);

          if (peerModelState?.myPeer) {
            // console.log(
            //   `${acceptedByUserId} just accepted the call ! and the new To List is now  `,
            //   updatedToList
            // );

            const userConnectionObject = updatedToList.filter(
              (connectionObject) => connectionObject.uid === acceptedByUserId
            )[0];

            // console.log("Connection object to check is ", userConnectionObject);

            peerModelState?.myPeer.signal(userConnectionObject.signalData);

            // console.log("I also accepted his call !", peerModelState?.myPeer);

            callModelDispatch({
              type: "TO_LIST_UPDATED",
              payload: { to: updatedToList },
            });
          } else {
            // console.log("i don't have peer .object");
            // console.log("My Peer is", peerModelState);
          }
        } catch (err) {
          // console.log(err.message);
        }
      }
    );
  }, [peerModelState]);

  if (!socket._callbacks[`$some-user-accepted-call`]) {
    socket.on(
      "some-user-accepted-call",
      ({ updatedToList, acceptedByUserId }) => {
        try {
          // console.log("PEER model state is ->", peerModelState);

          if (peerModelState?.myPeer) {
            // console.log(
            //   `${acceptedByUserId} just accepted the call ! and the new To List is now  `,
            //   updatedToList
            // );

            const userConnectionObject = updatedToList.filter(
              (connectionObject) => connectionObject.uid === acceptedByUserId
            )[0];

            // console.log("Connection object to check is ", userConnectionObject);

            peerModelState?.myPeer.signal(userConnectionObject.signalData);

            // console.log("I also accepted his call !", peerModelState?.myPeer);

            callModelDispatch({
              type: "TO_LIST_UPDATED",
              payload: { to: updatedToList },
            });
          } else {
            // console.log("i don't have peer object");
            // console.log("My Peer is", peerModelState);
          }
        } catch (err) {
          // console.log(err.message);
        }
      }
    );
  }

  const handleAcceptCall = async () => {
    try {
      const myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: myStream,
      });

      streamModelDispatch({
        type: "ADD_STREAM",
        payload: { id: myStream.id, streamToAdd: myStream },
      });

      // if (!peerModelState?.myPeer) {
      //   peerModelDispatch({ type: "SET_PEER", peer });
      // }

      peerModelDispatch({ type: "SET_PEER", payload: { peer } });

      const myId = curAuth.uid;

      // callModelState?.options?.to

      callModelState?.options?.to.forEach((ConnectionObject) => {
        if (ConnectionObject.uid !== myId) {
          peer.signal(ConnectionObject.signalData);
        }
      });

      peer.on("signal", (mySignalData) => {
        console.log("Signal event called !", mySignalData);

        const newToList = callModelState?.options?.to.map(
          (ConnectionObject) => {
            if (ConnectionObject.uid === myId) {
              ConnectionObject.connected = true;
              ConnectionObject.signalData = mySignalData;
            }
            return ConnectionObject;
          }
        );

        socket.emit("aceept-and-open-communication-for-connected-users", {
          acceptedByUserId: myId,
          updatedToList: newToList,
        });

        callModelDispatch({
          type: "TO_LIST_UPDATED",
          payload: { to: newToList },
        });
      });

      peer.on("stream", (currentStream) => {
        // I need Id
        // And stream to add
        // console.log("I got the stream Accept Call function ->", currentStream);

        streamModelDispatch({
          type: "ADD_STREAM",
          payload: { id: currentStream.id, streamToAdd: currentStream },
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        title="Calling Friend"
        visible={callModelState.modelOpen}
        style={{ top: 20 }}
        width={callModelState.modelState === "connected" ? "100%" : "50%"}
        onOk={() => {
          callModelDispatch({ type: "CLOSE" });

          // const callRejectedToList = callModelState?.options?.to?.filter(
          //   (connectionObj) => connectionObj.uid !== curAuth.uid
          // );

          socket.emit("reject-call", {
            rejectedBy: curAuth.uid,
            rejectedTo: callModelState?.options?.to,
          });
        }}
      >
        {callModelState.modelState === "connected" ? (
          <div className="callModel-videoContainer">
            {" "}
            Call Connected
            {console.log(
              "Its from the connected component -> ",
              streamModelState.myStreams,
              "My video tracks for first stream is ->",
              streamModelState.myStreams[0].getVideoTracks()
            )}
            {streamModelState.myStreams.map((stream) => (
              <VideoStream stream={stream} />
            ))}
          </div>
        ) : callModelState.modelState === "ringing" ? (
          <div>
            <h3>
              Recieving {callModelState?.options?.to?.length > 2 ?? "Group"}{" "}
              call from - {callModelState?.options?.initiatorName}
            </h3>
            <Button>Reject</Button>
            <Button onClick={handleAcceptCall}>Accept</Button>
          </div>
        ) : callModelState.modelState === "calling" ? (
          <>Calling ...</>
        ) : (
          <>...</>
        )}
      </Modal>
    </>
  );
};

export default CallModel;
