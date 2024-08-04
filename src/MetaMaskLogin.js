import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

function MetaMaskConnector({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          // Check if already connected
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (err) {
          setError('Failed to fetch accounts');
        }
      } else {
        setError('MetaMask is not installed');
      }
      setLoading(false);
    };

    checkConnection();
  }, []);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        // Request account access
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
        setError(null);
      } catch (err) {
        setError('Could not connect to MetaMask');
      }
    } else {
      setError('MetaMask is not installed');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!account) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="text-center">
          <h2 className="mb-4">Login with MetaMask</h2>
          <button className="btn btn-primary mb-3" onClick={connectMetaMask}>
            Connect To MetaMask 
          </button>
          {error && <p className="text-danger">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {children}
    </div>
  );
}

export default MetaMaskConnector;
