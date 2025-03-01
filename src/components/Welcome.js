import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/Welcome.css";

function Welcome() {
  const navigate = useNavigate();

  const onClick = () => {
    navigate('/createroom');
  };

  return (
    <div className="welcome">
      <button className='startbtn' onClick={onClick}>START</button>
      <div className="info">
        <p className="description">
          Here, you can create a room and chat with a friend.
        </p>
      </div>    
    </div>
  );
}

export default Welcome;
