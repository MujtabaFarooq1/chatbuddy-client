import React, { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { useCallModelContext } from "../context/callModelContext";
import { usePeerModelContext } from "../context/peerModelContext";
import { useStreamModelContext } from "../context/streamsModelContext";
import socket, { connectToSocket } from "../socket/socket";
import { useAuth } from "../context/auth-context";
import Peer from "simple-peer";
import VideoStream from "./VideoStream";
import { Container, Row, Col } from "react-grid-system";
import Participants from "./Participants/Participants.component";
import { Participant } from "./Participants/Participant/Participant.component";
import { getUserFromUid } from "../actions/dbHelper";

// import ConnectionObject from "../interfaces/ConnectionObject";

const CallModel = (props) => {
  const { curAuth } = useAuth();
  const { callModelState, callModelDispatch } = useCallModelContext();
  const { peerModelState, peerModelDispatch } = usePeerModelContext();
  const { streamModelState, streamModelDispatch } = useStreamModelContext();

  const [friendToCall, setFriendToCall] = useState(null);

  const ringModelSource = `https://firebasestorage.googleapis.com/v0/b/chat-buddy-d6954.appspot.com/o/sounds%2FgoingCall.mp3?alt=media&token=e5c709cb-6569-4636-b8ef-6215a26cab9b`;
  const incommingCallRing = `https://firebasestorage.googleapis.com/v0/b/chat-buddy-d6954.appspot.com/o/sounds%2FincomingCall.mp3?alt=media&token=922f614d-8a67-4459-8096-01836e8939bd`;

  let gridCol =
    streamModelState.length === 1
      ? 1
      : streamModelState.myStreams.length <= 4
      ? 2
      : 4;
  const gridColSize = streamModelState.myStreams.length <= 4 ? 1 : 2;
  let gridRowSize =
    streamModelState.myStreams.length <= 4
      ? streamModelState.myStreams.length
      : Math.ceil(streamModelState.myStreams.length / 2);

  useEffect(() => {
    if (socket._callbacks) {
      if (!socket._callbacks[`$reject-call`]) {
        socket.on("reject-call", ({ rejectedBy, rejectedTo }) => {
          if (rejectedTo?.length < 2) {
            callModelDispatch({ type: "CLOSE" });
          } else {
            callModelDispatch({ type: "CALL_REJECTED", payload: rejectedTo });
          }
          streamModelDispatch({ type: "REMOVE_ALL_STREAMS" });
          console.log("call rejected by ->", rejectedBy);
        });
      }

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
                  (connectionObject) =>
                    connectionObject.uid === acceptedByUserId
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
    }
  }, [socket]);

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
          console.log(err.message);
        }
      }
    );
  }, [peerModelState]);

  useEffect(() => {
    if (callModelState?.options?.to?.length > 0) {
      const frndToCall = callModelState?.options?.to?.filter(
        (item) => item.uid !== curAuth.uid
      );
      getUserFromUid(frndToCall[0].uid).then((res) => {
        console.log(res, frndToCall);
        setFriendToCall(res);
      });
    }
  }, [callModelState]);

  const handleAcceptCall = async () => {
    try {
      const myStream = await navigator.mediaDevices.getUserMedia({
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

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: myStream,
      });

      streamModelDispatch({
        type: "ADD_STREAM",
        payload: {
          id: myStream.id,
          streamToAdd: myStream,
          myStreamId: myStream.id,
        },
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

  const handleCallCancel = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    callModelDispatch({ type: "CLOSE" });
    streamModelDispatch({ type: "REMOVE_ALL_STREAMS" });
    peerModelDispatch({ type: "DISCONNECT_PEER" });
    // const callRejectedToList = callModelState?.options?.to?.filter(
    //   (connectionObj) => connectionObj.uid !== curAuth.uid
    // );

    socket.emit("reject-call", {
      rejectedBy: curAuth.uid,
      rejectedTo: callModelState?.options?.to,
    });
  };

  return (
    <>
      <Modal
        title={false}
        visible={callModelState.modelOpen}
        style={{ top: 20 }}
        width={
          callModelState.modelState === "connected" || window.screen.width < 800
            ? "100%"
            : "50%"
        }
        closable={false}
        keyboard={false}
        // okButtonProps={false}
        footer={false}
        // onOk={handleCallCancel}
      >
        {callModelState.modelState === "connected" ? (
          <div className="callModel-videoContainer">
            <Container>
              <div
                style={{
                  "--grid-size": gridCol,
                  "--grid-col-size": gridColSize,
                  "--grid-row-size": gridRowSize,
                }}
                className={`participants`}
              >
                {streamModelState.myStreams.map((stream, index) => (
                  <Participant
                    stream={stream}
                    currentParticipant={stream}
                    curentIndex={index}
                    showAvatar={true}
                    currentUser={true}
                  />
                ))}
              </div>
            </Container>
            <a
              className="cancelCallBtn callBtnActionBtn"
              href="#."
              onClick={handleCallCancel}
            >
              {" "}
              Leave Call{" "}
            </a>
          </div>
        ) : callModelState.modelState === "ringing" ? (
          <div>
            <audio
              controls={false}
              autoPlay={true}
              loop={true}
              style={{ display: "none" }}
            >
              <source src={incommingCallRing} />
            </audio>

            <div className="connectingCallWrapper">
              <div id="phone">
                <div className="main">
                  <div className="header-background" />
                  <div className="avatar-wrapper">
                    <img
                      className="avatar-img"
                      src="https://joeschmoe.io/api/v1/male/random"
                      alt="UserImage"
                    />
                  </div>

                  <h2 className="incoming">
                    Incoming Call From {callModelState?.options?.initiatorName}
                  </h2>
                </div>
                <div className="footer">
                  <a
                    className="acceptCallBtn callBtnActionBtn"
                    href="#."
                    onClick={handleAcceptCall}
                  >
                    {" "}
                    Accept Call{" "}
                  </a>

                  <a
                    className="cancelCallBtn callBtnActionBtn"
                    href="#."
                    onClick={handleCallCancel}
                  >
                    {" "}
                    Cancel Call{" "}
                  </a>
                </div>
              </div>
            </div>

            {/* <h3>
              Recieving {callModelState?.options?.to?.length > 2 ?? "Group"}{" "}
              call from - {callModelState?.options?.initiatorName}
            </h3>
            <Button>Reject</Button>
            <Button onClick={handleAcceptCall}>Accept</Button> */}
          </div>
        ) : callModelState.modelState === "calling" ? (
          <>
            <audio
              controls={false}
              autoPlay={true}
              loop={true}
              style={{ display: "none" }}
            >
              <source src={ringModelSource} />
            </audio>

            <div className="connectingCallWrapper">
              <div id="phone">
                <div className="main">
                  <div className="header-background" />
                  <div className="avatar-wrapper">
                    <img
                      className="avatar-img"
                      src="https://joeschmoe.io/api/v1/male/random"
                      alt="UserImage"
                    />
                  </div>

                  <h2 className="incoming">
                    Calling {friendToCall && friendToCall?.userName}{" "}
                  </h2>
                </div>
                <div className="footer">
                  <a
                    className="cancelCallBtn callBtnActionBtn"
                    href="#."
                    onClick={handleCallCancel}
                  >
                    {" "}
                    Cancel Call{" "}
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>...</>
        )}
      </Modal>
    </>
  );
};

export default CallModel;
