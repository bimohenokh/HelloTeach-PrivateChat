import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
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
