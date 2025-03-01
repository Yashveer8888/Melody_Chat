import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../style/ChatRoom.css";
import Music from "./Music";

const socket = io("http://localhost:5000");

function ChatRoom() {
  const roomId = localStorage.getItem("roomId");
  const username = localStorage.getItem("username");
  const creatername = localStorage.getItem("creatername");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();
  const chatRef = useRef(null); // Ref for chat container

  useEffect(() => {
    const storedRoomId = localStorage.getItem("roomId");
    if (!storedRoomId) {
      navigate("/createroom");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/room-messages/${roomId}`);
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    socket.emit("joinRoom", { roomId, user: username });

    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => {
        if (!prevMessages.some((msg) => msg.text === message.text && msg.user === message.user)) {
          return [...prevMessages, message];
        }
        return prevMessages;
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [roomId, username]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = { roomId, user: username, text: newMessage };

    try {
      const response = await fetch("http://localhost:5000/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        socket.emit("sendMessage", messageData);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const closeRoom = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/close-room/${roomId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        localStorage.removeItem("roomId");
        navigate("/");
      }
    } catch (error) {
      console.error("Error closing room:", error);
    }
  };

  const leaveRoom = async () => {
    localStorage.removeItem("roomId");
    navigate("/");
  };
  

  return (
    <div className="chat-room">
      <div className="chat-box">
        <h1 className="roomid">Room Code: {roomId}</h1>

        <div className="chat" ref={chatRef}>
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.user}: </strong> <span>{msg.text}</span>
            </div>
          ))}
        </div>

        <div className="input-area">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()} // Send message on Enter key
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      </div>

      <div className="room-controls">
        {username === creatername ? (
          <button className="close-room" onClick={closeRoom}>
            Close Room
          </button>
        ) : (
          <button className="leave-room" onClick={leaveRoom}>
            Leave Room
          </button>
        )}
      </div>

      <div className="music-section">
        <Music socket={socket} roomId={roomId} />
      </div>
    </div>
  );
}

export default ChatRoom;
