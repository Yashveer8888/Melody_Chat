import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoomProvider } from './context/RoomContext';
import Welcome from './components/Welcome';
import CreateRoom from './components/CreateRoom';
import ChatRoom from './components/ChatRoom';

function App() {
  return (
    <RoomProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/createroom" element={<CreateRoom />} />
          <Route path="/chatroom" element={<ChatRoom />} />
        </Routes>
      </Router>
    </RoomProvider>
  );
}

export default App;