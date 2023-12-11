import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
// import DaftarGuru from './component/DaftarGuru';
// Basic samples
import BasicGroupChannelSample from './samples/BasicGroupChannelSample';
import CobaPrivateChat from "./samples/PrivateChat";
import CobaPrivateChatNew from "./samples/CobaPrivateChatNew";
import PrivateChat from "./samples/PrivateChat";

const App = () => {
  return (
    <div className="container">
      <Routes>
        <Route path='/' element={<Home />} />
          <Route path='/private-chat/:idUserParam' element={<PrivateChat />} />
      </Routes>
    </div>
  );
}

export default App;
