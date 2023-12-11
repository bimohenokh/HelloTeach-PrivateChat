import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <div>
        <h1>Basic Code Samples</h1>
        <ul>
            <li><Link to="/private-chat/1">Private Chat</Link></li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
