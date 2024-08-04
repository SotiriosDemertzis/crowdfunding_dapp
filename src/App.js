import React, { Component } from 'react';
import web3 from './web3';
import contract from './contract';
import Header from './Header';
import NewCampaign from './NewCampaign';
import LiveCampaigns from './LiveCampaigns';
import FulfilledCampaigns from './FulfilledCampaigns';
import ControlPanel from './ControlPanel';
import MetaMaskLogin from './MetaMaskLogin'; 

function App() {
  return (
    <MetaMaskLogin >
        <Header />
        <hr></hr>
        <NewCampaign />
        <hr></hr>
        <LiveCampaigns />
        <hr></hr>
        <FulfilledCampaigns />
        <hr></hr>
        <ControlPanel />
        <hr></hr>
    </MetaMaskLogin>
  );
}

export default App;