import AgoraRTM from "agora-rtm-sdk";

const appID = "<your-app-id-here>";

export default class RTMClient {
  constructor() {
    this.client = AgoraRTM.createInstance(appID);
    this.channel = null;
    this.client.on("ConnectionStateChange", (newState, reason) => {
      console.log(
        "on connection state changed to " + newState + " reason: " + reason
      );
    });
  }

  login({ token, uid }) {
    return this.client.login({ token, uid });
  }

  logout() {
    this.client.logout();
  }

  createChannel(channelName) {
    this.channel = this.client.createChannel(channelName);
    return this.channel;
  }

  joinChannel() {
    return this.channel.join();
  }

  sendMessage(message) {
    return this.channel.sendMessage({ text: message });
  }

  setChannelAttributes(channelId, attributeMap) {
    return this.client.setChannelAttributes(channelId, attributeMap, {
      enableNotificationToChannelMembers: true,
    });
  }

  leaveChannel() {
    this.channel.leave();
  }
}
