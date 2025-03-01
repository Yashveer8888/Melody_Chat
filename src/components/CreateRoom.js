import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/CreateRoom.css";

function CreateRoom() {
  const [inputUsername, setInputUsername] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    try {
      if (!inputUsername.trim()) {
        alert("Please enter a username");
        return;
      }
    
      const generatedRoomId = Math.random().toString(36).substring(2, 8);
      localStorage.setItem("roomId", generatedRoomId);
      localStorage.setItem("username", inputUsername);
      localStorage.setItem("creatername", inputUsername);
    
      const response = await fetch("http://localhost:5000/api/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: generatedRoomId, creatername: inputUsername }),
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    
      navigate("/chatroom");
    } catch (error) {
      alert("Failed to create room. Please try again later.");
    }
    
  };

  const handleJoinRoom = async () => {
    try{
      if (!inputUsername.trim()) {
        alert("Please enter a username");
        return;
      }

      const roomCode = prompt("Enter Room Code:");
      if (!roomCode) return;

      const response = await fetch(`http://localhost:5000/api/join-room/${roomCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membername: inputUsername }),
      });

      if (response.ok) {
        localStorage.setItem("roomId", roomCode);
        localStorage.setItem("username", inputUsername);
        navigate("/chatroom");
      } else {
        alert("Invalid room code or unable to join room.");
      }
    }catch{
      alert("Failed to create room. Please try again later.");
    }
  };

  return (
    <div className="create-room-container">
      <input
        type="text"
        placeholder="Enter Username"
        value={inputUsername}
        onChange={(e) => setInputUsername(e.target.value)}
      />
      <button onClick={handleCreateRoom}>Create Room</button>
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
}

export default CreateRoom;
