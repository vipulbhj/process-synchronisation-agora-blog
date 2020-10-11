import React, { Component, createRef, PureComponent } from "react";
import { trackPromise } from "react-promise-tracker";
import RTMClient from "../../Utils/client";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";
import "./style.css";

function detectURL(message) {
  var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  return message.replace(urlRegex, function (urlMatch) {
    return '<a href="' + urlMatch + '">' + urlMatch + "</a>";
  });
}

class InputMessage extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.messageInput = createRef();
  }

  handleSendMessage(event) {
    event.preventDefault();
    if (this.messageInput.current.value.length > 0) {
      this.props.sendMessage(this.messageInput.current.value);
      this.messageInput.current.value = "";
    }
  }

  render() {
    return (
      <form>
        <input
          type="text"
          ref={this.messageInput}
          placeholder="Text message"
          tabIndex="0"
        />
        <button onClick={this.handleSendMessage}>Send</button>
      </form>
    );
  }
}

class MessageList extends Component {
  constructor(props) {
    super(props);
    this.messagesEnd = createRef();
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div className="message-list">
        <>
          {this.props.messages.map((messageItem) => (
            <MessageItem key={messageItem.id} message={messageItem} />
          ))}
          <div
            className="message-item"
            ref={(el) => {
              this.messagesEnd = el;
            }}
          ></div>
        </>
      </div>
    );
  }
}

function MessageItem({ message }) {
  function getInitials(name) {
    const words = name.split(" ");
    if (words.length === 1) return words[0][0];
    return words[0][0] + words[1][0];
  }

  return (
    <div
      className={`message-item ${message.type === "self" ? "own-message" : ""}`}
    >
      <div className="message-content-row">
        <div className="message-author-pic-holder">
          {getInitials(message.name)}
        </div>
        <div className="message-content-holder">
          <div className="message-author">{message.name}</div>
          <div
            className="message-text-holder"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(message.text),
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

class ChatBox extends Component {
  render() {
    return (
      <div className="chat-holder">
        <MessageList messages={this.props.messages} />
        <div className="chat-input-block">
          <InputMessage sendMessage={this.props.sendMessage} />
        </div>
      </div>
    );
  }
}

class ChatRoom extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      messages: [],
    };

    this.rtmClient = new RTMClient();
    this.sendMessage = this.sendMessage.bind(this);
  }

  // channelAttributeHandler(value) {
  //   if (value === CLASS_STATUSES["stopping"]) {
  //     if (this.props.isHost === true) {
  //       let transcript = localStorage.getItem(this.dbTranscriptKey);
  //       this.transactionBackupApiCall(transcript)
  //         .then((data) => {
  //           this.rtmClient
  //             .setChannelAttributes(this.props.channelName, {
  //               classStatus: CLASS_STATUSES["stopping_ack"],
  //             })
  //             .then(() => {
  //               console.log(
  //                 "Channel attribute successfully updated to stopping_ack"
  //               );
  //             })
  //             .catch((e) => {
  //               console.error(e);
  //               Bugsnag.notify(e);
  //               toast.error(e.message);
  //             });
  //         })
  //         .catch((e) => {
  //           console.error(e);
  //           Bugsnag.notify(e);
  //           toast.error(e.message);
  //         });
  //     }
  //   } else if (value !== CLASS_STATUSES["stopping_ack"]) {
  //     if (this.props.isHost === false) {
  //       // Only learners after this point
  //       if (value === CLASS_STATUSES["started"]) {
  //         this.props.notifyLearnerOnClassStart();
  //       }

  //       if (value === CLASS_STATUSES["stopped"]) {
  //         this.props.notifyLearnerOnClassEnd();
  //         this.rtmClient.leaveChannel();
  //       }

  //       if (value === CLASS_STATUSES["paused"]) {
  //         this.props.notifyLearnerOnClassPause();
  //       }
  //     }

  //     this.setState({
  //       classStatus: value,
  //     });
  //   }
  // }

  componentDidMount() {
    trackPromise(
      this.rtmClient
        .login({
          uid: this.props.uid,
          token: this.props.token,
        })
        .then(() => {
          const channel = this.rtmClient.createChannel(this.props.channelName);
          this.rtmClient
            .joinChannel()
            .then(() => {
              this.rtmClient.client
                .setLocalUserAttributes({
                  name: this.props.name,
                })
                .then((data) => {
                  console.log(data);
                })
                .catch((err) => {
                  toast.error(err.message);
                });

              channel.on("ChannelMessage", async ({ text }, senderId) => {
                console.log("[Message recieved inside channel]");
                try {
                  let attribute = await this.rtmClient.client.getUserAttributes(
                    senderId
                  );
                  console.log(text, senderId, attribute, "blablabla");
                  this.addMessageToMessagesList(text, attribute.name, "other");
                } catch (e) {
                  toast.error(e.message);
                }
              });

              channel.on("MemberJoined", (uid) => {
                console.log(uid);
              });

              channel.on("MemberLeft", (uid) => {
                console.log(uid);
              });
            })
            .catch((e) => {
              toast.error(e.message);
            });
        })
        .catch((e) => {
          toast.error(e.message);
        })
    );
  }

  sendMessage(message) {
    let messageFormat = detectURL(message);
    this.rtmClient
      .sendMessage(messageFormat)
      .then(() => {
        this.addMessageToMessagesList(messageFormat, this.props.name, "self");
      })
      .catch((e) => {
        toast.error(e.message);
      });
  }

  addMessageToMessagesList = (text, name, type) => {
    let newMessageItem = {
      id: this.state.messages.length + 1,
      text,
      name: name
        .trim()
        .replace(/[^A-Za-z0-9 ]/g, "")
        .replace(/ +(?= )/g, ""),
      type,
      at: Math.floor(Date.now() / 1000),
    };

    let updatedMessagesList = [...this.state.messages, newMessageItem];
    this.setState({ messages: updatedMessagesList });
  };

  render() {
    let messages = this.state.messages;
    let sendMessage = this.sendMessage;

    console.log(messages);
    return (
      <div className="chat-controller">
        <ChatBox
          sendMessage={sendMessage}
          name={this.props.name}
          messages={messages}
        />
      </div>
    );
  }
}

export default ChatRoom;
