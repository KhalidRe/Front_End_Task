import React, { useState, useEffect, useRef } from "react";
import { w3cwebsocket as Socket } from "websocket";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const client = new Socket("ws://127.0.0.1:8000");

const Chat = ({ userName }) => {
  const [myMessage, setMyMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      setMessages((messages) => [
        ...messages,
        {
          message: data.message,
          userName: data.userName,
        },
      ]);
    };

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSend = () => {
    client.send(
      JSON.stringify({
        type: "message",
        message: myMessage,
        userName,
      })
    );
    setMyMessage("");
  };

  const addEmoji = (emoji) => {
    setMyMessage(myMessage + emoji.native);
  };

  const handleClickOutside = (event) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target)) {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  return (
    <>
      <div className="title">Socket Chat: {userName}</div>
      <div className="chat-container">
        <aside className="reminder">
          <h2 className="reminder__title">Steps to complete setup:</h2>
          <ul className="reset">
            <li>1️⃣ Enter message and send it</li>
            <li>
              2️⃣ Go to the second browser's tab or window and enter the chatroom
              with another random username if you haven't done it yet.
            </li>
            <li>3️⃣ As second user reply with another message</li>
          </ul>
          <h3>Implement emoji feature according to the task ✅</h3>
        </aside>
        <section className="chat">
          <div className="messages">
            {messages.map((message, key) => (
              <div
                key={key}
                className={`message ${
                  userName === message.userName
                    ? "message--outgoing"
                    : "message--incoming"
                }`}
              >
                <div className="avatar">
                  {message.userName[0].toUpperCase()}
                </div>
                <div>
                  <h4>{message.userName + ":"}</h4>
                  <p>{message.message}</p>
                </div>
              </div>
            ))}
          </div>
          <section className="send">
            <div className="input_holder">
              <input
                type="text"
                className="input send__input"
                value={myMessage}
                onChange={(e) => setMyMessage(e.target.value)}
                onKeyUp={(e) => e.key === "Enter" && onSend()}
                placeholder="Message"
              />
              {showPicker && (
                <div ref={pickerRef} className="emoji_picker">
                  <Picker data={data} onEmojiSelect={addEmoji} />
                </div>
              )}
              <button
                className="emoji__button"
                onClick={() => setShowPicker(!showPicker)}
              >
                😊
              </button>
            </div>
            <button className="button send__button" onClick={onSend}>
              Send
            </button>
          </section>
        </section>
      </div>
    </>
  );
};

export default Chat;
