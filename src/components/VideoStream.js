import React, { useState, useEffect, useContext, useRef } from "react";
import { useStreamModelContext } from "../context/streamsModelContext";

const VideoStream = ({ stream }) => {
  const videoRef = useRef();
  const { streamModelState, streamModelDispatch } = useStreamModelContext();

  useEffect(() => {
    // console.log("Video Src Stream Object -> ", stream);
    if (stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      width={"100%"}
      height={"100%"}
      ref={videoRef}
      muted={streamModelState.myStramId === stream.id}
      autoPlay
    ></video>
  );
};

export default VideoStream;
