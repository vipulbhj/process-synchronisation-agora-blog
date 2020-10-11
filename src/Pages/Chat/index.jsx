import React from "react";
import ChatRoom from "../../Component/ChatRoom";
import "./style.css";

function ChatPage(props) {
  return (
    <div className="host-chat">
      <div className="header-host-chat">
        <div className="live-lesson-title">{props.name} Chat Client</div>
      </div>
      <div className="chatbox">
        <ChatRoom
          uid={props.uid}
          token={null}
          name={props.name}
          channelName={props.channelName}
        />
      </div>
    </div>
  );
}

export default ChatPage;
