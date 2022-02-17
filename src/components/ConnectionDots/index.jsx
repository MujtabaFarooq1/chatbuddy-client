import React from "react";
import "./connectionDots.css";

const activateConnectingDots = () => {};

function ConnectingDots({ children }) {
  return (
    <>
      <div id="large-header" class="large-header">
        <canvas id="demo-canvas"></canvas>
        {children}
      </div>
    </>
  );
}

export default ConnectingDots;
