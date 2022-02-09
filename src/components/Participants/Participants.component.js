import React, { useEffect, useRef } from "react";
import "./Participants.css";
import { useStreamModelContext } from "../../context/streamsModelContext";
import { Participant } from "./Participant/Participant.component";

const Participants = (props) => {
  const { streamModelState, streamModelDispatch } = useStreamModelContext();

  const currentUser = props.currentUser
    ? Object.values(props.currentUser)[0]
    : null;

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

  // if (screenPresenter) {
  //   gridCol = 1;
  //   gridRowSize = 2;
  // }

  return (
    <div
      style={{
        "--grid-size": gridCol,
        "--grid-col-size": gridColSize,
        "--grid-row-size": gridRowSize,
      }}
      className={`participants`}
    >
      <Participant
        currentParticipant={currentUser}
        curentIndex={streamModelState.myStreams.length}
        showAvatar={true}
        currentUser={true}
      />
    </div>
  );
};

export default Participants;
