import React, { useState, useEffect, useContext, useRef } from "react";

const VideoStream = ({ stream }) => {
  const videoRef = useRef();

  useEffect(() => {
    // console.log("Video Src Stream Object -> ", stream);
    if (stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay></video>;
};

export default VideoStream;
