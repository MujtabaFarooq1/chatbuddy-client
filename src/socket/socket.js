import { io } from "socket.io-client";

// import {internalIpV6, internalIpV4} from 'internal-ip';

// const SERVER_URL = "http://192.168.100.6:8000/";
// const SERVER_URL = "http://192.168.100.27:8000/";
// const SERVER_URL = " https://efb5-59-103-231-163.ngrok.io/";
// const SERVER_URL = "https://a396-59-103-231-163.ngrok.io";
const SERVER_URL = "https://chatbuddy-server.herokuapp.com/";

const socket = io(SERVER_URL, {
  autoConnect: true,
  rejectUnauthorized: false,
});

export const connectToSocket = (uid) => {
  socket.auth = { uid };
  socket.connect();
  socket.emit("login", { uid });

  socket.on("connect", () => {
    console.log(
      "Connected Successfully with socket id",
      "My Ip is ",
      // localIpUrl("private", "ipv4"),
      "/n",
      socket.id,
      "myRoomId",
      uid
    ); // x8WIv7-mJelg7on_ALbx
  });

  socket.emit("join-my-room", { myRoomId: uid });

  socket.on("disconnect", () => {
    console.log("Disconnected Successfully"); // undefined
    io.socket.removeAllListeners();
    socket.removeAllListeners();
  });

  //Call Recieve stuff
  // socket.on("callUser", ({ from, name: callerName, signal }) => {
  //   console.log(
  //     "Im recieving a call from ",
  //     callerName,
  //     "its signal is ",
  //     signal
  //   );
  //   // setCall({ isReceivingCall: true, from, name: callerName, signal });
  // });

  // for socket connection error
  socket.on("connect_error", (err) => {
    socket.off();
    console.log(err.message);
  });

  return socket;
};

export { io, socket as default };

// export default socket;
