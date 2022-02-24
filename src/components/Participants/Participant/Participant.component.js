import React, { useRef, useEffect } from "react";
import Card from "../../Shared/Card/Card.component";
import { AudioMutedOutlined, AudioOutlined } from "@ant-design/icons";

import { useStreamModelContext } from "../../../context/streamsModelContext";
// import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Participant.css";

export const Participant = ({ stream, hideVideo, curentIndex, showAvatar }) => {
  const videoRef = useRef();
  const { streamModelState, streamModelDispatch } = useStreamModelContext();

  useEffect(() => {
    if (stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`participant ${hideVideo ? "hide" : ""}`}>
      <Card>
        <video
          ref={videoRef}
          className="video"
          id={`participantVideo${curentIndex}`}
          autoPlay
          muted={streamModelState.myStreamId === stream.id}
          playsInline
        ></video>
        {/* {stream ? <AudioMutedOutlined /> : <AudioOutlined />} */}
        {showAvatar && !stream && (
          <div style={{ background: "green" }} className="avatar">
            {"M"}
          </div>
        )}
        <div className="name">
          {/* {currentParticipant.name} */}
          {/* {currentUser ? "(You)" : ""} */}
          {streamModelState.myStreamId === stream.id && "(You)"}
        </div>
      </Card>
    </div>
  );
};
