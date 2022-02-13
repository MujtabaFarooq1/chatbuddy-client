import React, { useEffect, useState } from "react";
import { useStreamModelContext } from "../../context/streamsModelContext";

// import ReactTooltip from "react-tooltip";
import "./MeetingFooter.css";
const MeetingFooter = (props) => {
  const { streamModelState, streamModelDispatch } = useStreamModelContext();
  const myStreamId = streamModelState.myStreamId;

  const micClick = () => {
    streamModelDispatch({ type: "MUTE_MY_STREAM" });
  };

  const onVideoClick = () => {};

  const onScreenClick = () => {
    props.onScreenClick(setScreenState);
  };

  const setScreenState = (isEnabled) => {};
  // useEffect(() => {
  //   props.onMicClick(streamState.mic);
  // }, [streamState.mic]);
  // useEffect(() => {
  //   props.onVideoClick(streamState.video);
  // }, [streamState.video]);
  return (
    <div className="meeting-footer">
      <div
        className={"meeting-icons " + (!false ? "active" : "")}
        data-tip={!false ? "Mute Audio" : "Unmute Audio"}
        onClick={micClick}
      >
        Mute Icon
        {/* <FontAwesomeIcon
          icon={!streamState.mic ? faMicrophoneSlash : faMicrophone}
          title="Mute"
        /> */}
      </div>
      <div
        className={"meeting-icons " + (!false.video ? "active" : "")}
        data-tip={false ? "Hide Video" : "Show Video"}
        onClick={onVideoClick}
      >
        Mute Video
        {/* <FontAwesomeIcon icon={!streamState.video ? faVideoSlash : faVideo} /> */}
      </div>
      <div
        className="meeting-icons"
        data-tip="Share Screen"
        onClick={onScreenClick}
        disabled={false}
      >
        {/* <FontAwesomeIcon icon={faDesktop} /> */}
        Share Screen
      </div>
      {/* <ReactTooltip /> */}
    </div>
  );
};

export default MeetingFooter;
