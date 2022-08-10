import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Home } from './pages/Home';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Mint from './pages/Mint';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Nft from './pages/Nft';
function App() {
  return (
    <div className='font-Rampart text-4xl'>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route path="/mint" component={Mint} />
          <Route path="/marketplace" component={Marketplace} />
          <Route exact path="/:user/tokens" component={Profile} />
          <Route path="/:user/tokens/:tokenId" component={Nft} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
