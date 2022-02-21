import { io } from "socket.io-client";

// const SERVER_URL =
//   process.env.NODE_ENV === "development"
//     ? "http://192.168.100.6:8000/"
//     : "https://chatbuddy-server.herokuapp.com/";

const SERVER_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/"
    : "https://chatbuddy-server.herokuapp.com/";

const socket = io(SERVER_URL, {
  autoConnect: true,
  rejectUnauthorized: false,
});

export const connectToSocket = (uid) => {
  socket.auth = { uid };
  socket.connect();
  socket.emit("login", { uid });

  console.log("Connect to socket Called", socket);

  socket.emit("join-my-room", { myRoomId: uid });

  try {
    if (!socket?._callbacks["$connect"]) {
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
    }
    if (!socket?._callbacks["$disconnect"]) {
      socket.on("disconnect", () => {
        console.log("Disconnected Successfully"); // undefined
        io.socket.removeAllListeners();
        socket.removeAllListeners();
      });
    }
    if (!socket?._callbacks["$connect_error"]) {
      socket.on("connect_error", (err) => {
        socket.off();
        console.log(err.message);
      });
    }
  } catch (err) {
    console.log(err.message);
  }

  return socket;
};

export { io, socket as default };
