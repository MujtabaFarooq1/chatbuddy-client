import React, { useState, useEffect, useContext, useRef } from "react";
import { useStreamModelContext } from "../context/streamsModelContext";

const VideoStream = ({ stream, curentIndex }) => {
  const videoRef = useRef();
  const { streamModelState, streamModelDispatch } = useStreamModelContext();

  useEffect(() => {
    // console.log("Video Src Stream Object -> ", stream);
    if (stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // console.log("Result is -->", streamModelState, stream.id);

  return (
    <>
      <video
        width={"100%"}
        height={"100%"}
        ref={videoRef}
        className="video"
        id={`participantVideo${curentIndex}`}
        muted={streamModelState.myStreamId === stream.id}
        autoPlay
      ></video>
    </>
  );
};

export default VideoStream;
