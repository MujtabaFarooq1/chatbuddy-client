const ConnectionObject = class {
  constructor(uid = "", signalData = {}, connected = false) {
    this.uid = uid;
    this.signalData = signalData;
    this.connected = connected;
  }

  getStatus() {
    return this.connected;
  }

  setStatus(connectedValue) {
    this.connected = connectedValue;
  }

  setSignalData(signalData) {
    this.signalData = signalData;
  }

  getSignalData() {
    return this.signalData;
  }
};

export default ConnectionObject;
