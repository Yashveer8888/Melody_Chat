import React, { createContext, useContext, useState } from "react";

const RoomContext = createContext();

export const useRoomContext = () => useContext(RoomContext);

export const RoomProvider = ({ children }) => {
  const [roomId, setRoomId] = useState("");

  return (
    <RoomContext.Provider value={{ roomId, setRoomId }}>
      {children}
    </RoomContext.Provider>
  );
};
