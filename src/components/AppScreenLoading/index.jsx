import React, { useEffect, useState } from "react";
import "./appScreenLoading.css";

function AppScreenLoading({ LoadingDescription }) {
  const [curBackgroundColor, setCurBackgroundColor] = useState("#00000094");

  function getRandomRgb() {
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = (num >> 8) & 255;
    var b = num & 255;
    return "rgb(" + r + ", " + g + ", " + b + ",0.9)";
  }

  function changebackgroundInfinitely() {
    setTimeout(() => {
      setCurBackgroundColor(getRandomRgb());
      changebackgroundInfinitely();
    }, 700);
  }

  useEffect(() => {
    return changebackgroundInfinitely();
  }, []);

  return (
    <div
      className="appScreenLoading"
      style={{ background: curBackgroundColor }}
    >
      <div className="appScreenLoadingContent">
        <img
          className="appScreenLoading__img"
          src="/images/logo.png"
          alt="logo"
        />

        <h2 className="appScreenLoading__description">
          {LoadingDescription || "Kindly Wait! Your Action Is Excecuting!"}
        </h2>
      </div>
    </div>
  );
}

export default AppScreenLoading;

{
  /* <div className="circlesWrapper">
<span className="circle circle-1"></span>
<span className="circle circle-2"></span>
<span className="circle circle-3"></span>
<span className="circle circle-4"></span>
<span className="circle circle-5"></span>
<span className="circle circle-6"></span>
<span className="circle circle-7"></span>
<span className="circle circle-8"></span>
</div> */
}
