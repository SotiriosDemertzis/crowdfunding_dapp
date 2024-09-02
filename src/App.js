import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import web3 from './web3';
import campaign from './campaign';

class App extends Component {
  // Ορισμός των αρχικών μεταβλητών κατάστασης για το component
  state = {
    owner: '', // Ο ιδιοκτήτης του smart contract
    currentAccount: '', // Ο τρέχων συνδεδεμένος λογαριασμός στο MetaMask
    contractBalance: '', // Το υπόλοιπο του smart contract σε ETH
    reservedFunds: '', // Τα δεσμευμένα κεφάλαια για ολοκληρωμένες καμπάνιες
    liveCampaigns: [], // Πίνακας για την αποθήκευση των ενεργών καμπανιών
    fulfilledCampaigns: [], // Πίνακας για την αποθήκευση των ολοκληρωμένων καμπανιών
    error: null, // Μεταβλητή για την αποθήκευση μηνυμάτων σφάλματος, αν υπάρχουν
    success: null, // Μεταβλητή για την αποθήκευση μηνυμάτων επιτυχίας, αν υπάρχουν
    isMetaMaskConnected: false, // Boolean που ελέγχει αν το MetaMask είναι συνδεδεμένο
    isLoading: false, // Boolean που διαχειρίζεται την κατάσταση φόρτωσης
    isContractDestroyed: false, // Boolean που ελέγχει αν το συμβόλαιο έχει καταστραφεί
    newCampaignTitle: '', // Τίτλος για μια νέα καμπάνια
    newCampaignPledgeCost: '', // Κόστος υποστήριξης για μια νέα καμπάνια
    newCampaignNumberOfPledges: '', // Αριθμός υποστηρίξεων για μια νέα καμπάνια
    pendingTransactions: {}, // Εκκρεμείς συναλλαγές
    newOwnerAddress: '', // Διεύθυνση για τον νέο ιδιοκτήτη του συμβολαίου
    bannedEntrepreneurAddress: "", // Διεύθυνση του απαγορευμένου επιχειρηματία
    isCurrentAddressBanned: false, // Boolean που ελέγχει αν η τρέχουσα διεύθυνση είναι απαγορευμένη
  };

  // Έλεγχος αν έχουν ρυθμιστεί οι listeners για τα γεγονότα
  eventListenersSet = false;

  // Αυτή η μέθοδος εκτελείται όταν το component φορτωθεί
  async componentDidMount() {
    try {
      // Έλεγχος διαθεσιμότητας του MetaMask
      await this.checkMetaMaskAvailability();
      // Φόρτωση των δεδομένων του blockchain
      await this.loadBlockchainData();
      
      // Εξασφάλιση ότι το αντικείμενο campaign έχει αρχικοποιηθεί σωστά
      if (campaign && campaign.options && campaign.options.address) {
        if (!this.eventListenersSet) {
          // Ρύθμιση των listeners για τα γεγονότα
          this.setupEventListeners();
          this.eventListenersSet = true;
        }
      } else {
        console.error('Campaign contract not properly initialized');
      }
    } catch (error) {
      console.error('Error in componentDidMount:', error);
    }
  }

  // Αυτή η μέθοδος εκτελείται όταν το component καταστραφεί
  componentWillUnmount() {
    // Λίστα με τα γεγονότα από τα οποία θα πρέπει να απεγγραφεί το component
    const events = [
      'CampaignCreated',
      'PledgeMade',
      'CampaignCancelled',
      'CampaignFulfilled',
      'OwnerChanged',
      'EntrepreneurBanned',
      'ContractDestroyed',
      'FundsWithdrawn'
    ];
  
    // Απεγγραφή από τα γεγονότα
    events.forEach(eventName => {
      const listenerName = `${eventName}Listener`;
      if (this[listenerName]) {
        this[listenerName].unsubscribe((error, success) => {
          if (success) console.log(`Unsubscribed from ${eventName}`);
          if (error) console.error(`Error unsubscribing from ${eventName}:`, error);
        });
      }
    });
  
    // Αφαίρεση των listeners για αλλαγές στον λογαριασμό ή στο δίκτυο του MetaMask
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', this.handleAccountChange);
      window.ethereum.removeListener('chainChanged', this.handleChainChange);
    }
  }

  // Έλεγχος διαθεσιμότητας του MetaMask
  checkMetaMaskAvailability = () => {
    if (window.ethereum) {
      // Προσθήκη listeners για αλλαγές στον λογαριασμό ή στο δίκτυο
      window.ethereum.on('accountsChanged', this.handleAccountChange);
      window.ethereum.on('chainChanged', this.handleChainChange);
    } else {
      // Ενημέρωση κατάστασης αν το MetaMask δεν είναι εγκατεστημένο
      this.setState({ error: "MetaMask is not installed. Please install it to use this app." });
    }
    this.setState({ isLoading: false });
  }

  // Διαχείριση αλλαγών στον λογαριασμό του MetaMask
  handleAccountChange = async (accounts) => {
    if (accounts.length > 0) {
      // Ενημέρωση της κατάστασης με τον νέο λογαριασμό
      this.setState({ currentAccount: accounts[0].toLowerCase(), isMetaMaskConnected: true ,error:null ,success:null});
      await this.loadBlockchainData();
    } else {
      // Ενημέρωση της κατάστασης αν δεν υπάρχουν συνδεδεμένοι λογαριασμοί
      this.setState({ isMetaMaskConnected: false, error: "Please connect to MetaMask." });
    }
  }

  // Διαχείριση αλλαγών στο δίκτυο του MetaMask
  handleChainChange = () => {
    window.location.reload();
  }

  // Έλεγχος σύνδεσης με το MetaMask
  checkMetaMaskConnection = async () => {
    this.setState({ isLoading: true, error: null, success: null });
    try {
      // Αίτημα για να συνδεθεί ο χρήστης στο MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        // Ενημέρωση της κατάστασης με τον συνδεδεμένο λογαριασμό
        this.setState({ 
          isMetaMaskConnected: true, 
          currentAccount: accounts[0].toLowerCase() 
        });
        await this.loadBlockchainData();
      } else {
        throw new Error("No accounts found. Please connect to MetaMask.");
      }
    } catch (error) {
      this.setState({ error: error.message, isMetaMaskConnected: false });
    }
    this.setState({ isLoading: false });
  }

  // Φόρτωση δεδομένων από το blockchain
  loadBlockchainData = async () => {
    this.setState({ isLoading: true, error: null });
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        const currentAccount = accounts[0].toLowerCase();
        const isContractDestroyed = await campaign.methods.isContractDestroyed().call();
        
        if (isContractDestroyed) {
          // Ενημέρωση κατάστασης αν το συμβόλαιο έχει καταστραφεί
          this.setState({ 
            isContractDestroyed: true,
            error: "The contract has been destroyed. No further actions can be taken."
          });
          return;
        }
  
        // Ανάκτηση δεδομένων από το smart contract
        const owner = await campaign.methods.owner().call();
        const contractBalance = await web3.eth.getBalance(campaign.options.address);
        const reservedFunds = await campaign.methods.reservedFunds().call();
        const liveCampaigns = await campaign.methods.getLiveCampaigns().call();
        const fulfilledCampaigns = await campaign.methods.getFulfilledCampaigns().call();
        const isCurrentAddressBanned = await campaign.methods.bannedEntrepreneurs(currentAccount).call();
  
        // Ανάκτηση του αριθμού των υποστηρίξεων για τις ενεργές καμπάνιες
        const livePledgeCounts = await Promise.all(
          liveCampaigns[1].map(campaignId => 
            campaign.methods.getCurrentUserPledgeCountOnCampaign(campaignId).call({from: currentAccount})
          )
        );
  
        // Ανάκτηση του αριθμού των υποστηρίξεων για τις ολοκληρωμένες καμπάνιες
        const fulfilledPledgeCounts = await Promise.all(
          fulfilledCampaigns[1].map(campaignId => 
            campaign.methods.getCurrentUserPledgeCountOnCampaign(campaignId).call({from: currentAccount})
          )
        );
  
        // Ενημέρωση της κατάστασης με τα δεδομένα από το blockchain
        this.setState({
          currentAccount,
          owner: owner.toLowerCase(),
          contractBalance: web3.utils.fromWei(contractBalance, 'ether'),
          reservedFunds: web3.utils.fromWei(reservedFunds, 'ether'),
          liveCampaigns,
          fulfilledCampaigns,
          livePledgeCounts,
          fulfilledPledgeCounts,
          isContractDestroyed: false,
          isCurrentAddressBanned,
          isMetaMaskConnected: true
        });
      } else {
        this.setState({ error: "No accounts found. Please connect to MetaMask." });
      }
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  // Ρύθμιση των listeners για τα γεγονότα
  setupEventListeners() {
    // Listener για αλλαγές στον λογαριασμό του MetaMask
    window.ethereum.on('accountsChanged', (accounts) => {
      const currentAccount = accounts[0];
      this.setState({ currentAccount }, () => {
        this.loadBlockchainData();
      });
    });
  
    // Listener για το γεγονός δημιουργίας καμπάνιας
    campaign.events.CampaignCreated().on('data', async (data) => {
      console.log('New campaign created:', data.returnValues);
      await this.loadBlockchainData();
    });
  
    // Listener για το γεγονός υποστήριξης καμπάνιας
    campaign.events.PledgeMade().on('data', async (data) => {
      console.log('New pledge made:', data.returnValues);
      await this.loadBlockchainData();
    });
  
    // Listener για το γεγονός ακύρωσης καμπάνιας
    campaign.events.CampaignCancelled().on('data', async (data) => {
      console.log('Campaign cancelled:', data.returnValues);
      await this.loadBlockchainData();
    });
  
    // Listener για το γεγονός ολοκλήρωσης καμπάνιας
    campaign.events.CampaignFulfilled().on('data', async (data) => {
      console.log('Campaign fulfilled:', data.returnValues);
      await this.loadBlockchainData();
    });
  
    // Listener για το γεγονός αλλαγής ιδιοκτήτη
    campaign.events.OwnerChanged().on('data', async (data) => {
      console.log('Owner changed:', data.returnValues);
      await this.loadBlockchainData();
    });
  
    // Listener για το γεγονός απαγόρευσης επιχειρηματία
    campaign.events.EntrepreneurBanned().on('data', async (data) => {
      console.log('Entrepreneur banned:', data.returnValues);
      await this.loadBlockchainData();
    });
  
    // Listener για το γεγονός καταστροφής του συμβολαίου
    campaign.events.ContractDestroyed().on('data', async (data) => {
      console.log('Contract destroyed:', data.returnValues);
      this.setState({ isContractDestroyed: true });
      await this.loadBlockchainData();
    });
  
    // Listener για το γεγονός ανάληψης κεφαλαίων
    campaign.events.FundsWithdrawn().on('data', async (data) => {
      console.log('Funds withdrawn:', data.returnValues);
      await this.loadBlockchainData();
    });
  }

  // Μέθοδος για την ενημέρωση των δεδομένων των καμπανιών
  updateCampaigns = async () => {
    this.setState({ isLoading: true });
    try {
      const liveCampaigns = await campaign.methods.getLiveCampaigns().call();
      const fulfilledCampaigns = await campaign.methods.getFulfilledCampaigns().call();
      const contractBalance = await web3.eth.getBalance(campaign.options.address);
      const reservedFunds = await campaign.methods.reservedFunds().call();
  
      this.setState({
        liveCampaigns,
        fulfilledCampaigns,
        contractBalance: web3.utils.fromWei(contractBalance, 'ether'),
        reservedFunds: web3.utils.fromWei(reservedFunds, 'ether'),
      });
    } catch (error) {
      console.error("Error updating campaigns:", error);
      this.setState({ error: error.message });
    } finally {
      this.setState({ isLoading: false });
    }
  }

  // Μέθοδος για την υποβολή νέας καμπάνιας
  handleNewCampaignSubmit = async (e) => {
    e.preventDefault();
    this.setState({ error: '', success: '', isLoading: true });

    try {
      const { newCampaignTitle, newCampaignPledgeCost, newCampaignNumberOfPledges } = this.state;
      
      // Έλεγχος αν ο τίτλος της καμπάνιας υπάρχει ήδη
      const titleExists = await campaign.methods.titleExists(newCampaignTitle).call();
      if (titleExists) {
        throw new Error('This title is already taken. Please choose a different one.');
      }

      const pledgeCostWei = web3.utils.toWei(newCampaignPledgeCost, 'ether');

      // Δημιουργία νέας καμπάνιας
      await campaign.methods.createCampaign(
        newCampaignTitle, 
        pledgeCostWei,
        parseInt(newCampaignNumberOfPledges, 10)
      ).send({
        from: this.state.currentAccount,
        value: web3.utils.toWei('0.02', 'ether')
      });

      this.setState({ 
        success: 'Campaign created successfully!', 
        newCampaignTitle: '', 
        newCampaignPledgeCost: '', 
        newCampaignNumberOfPledges: '' 
      });

    // Φόρτωση των δεδομένων του blockchain ξανά
      await this.loadBlockchainData();
    } catch (err) {
      this.setState({ error: err.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  // Μέθοδος για την υποστήριξη καμπάνιας
  handlePledge = async (campaignId, pledgeCost) => {
    this.setState(prevState => ({
      error: null,
      success: null,
      pendingTransactions: { ...prevState.pendingTransactions, [campaignId]: 'pledge' }
    }));
  
    try {
      await campaign.methods.pledge(campaignId).send({
        from: this.state.currentAccount,
        value: pledgeCost
      });
      
      this.setState({ success: "Pledge successful!" });
      
      // Ανανέωση των δεδομένων όλων των καμπανιών
      await this.loadBlockchainData();
  
    } catch (err) {
      console.error("Error pledging:", err);
      if (err.code === 4001) {
        console.log("User rejected the transaction");
      } else {
        this.setState({ error: `Failed to pledge: ${err.message}. Please try again.` });
      }
    } finally {
      this.setState(prevState => ({
        pendingTransactions: { ...prevState.pendingTransactions, [campaignId]: null }
      }));
    }
  };

  // Μέθοδος για την ακύρωση καμπάνιας
  handleCancelCampaign = async (campaignId) => {
    this.setState(prevState => ({
      error: null,
      success: null,
      pendingTransactions: { ...prevState.pendingTransactions, [campaignId]: 'cancel' }
    }));
    try {
      await campaign.methods.cancelCampaign(campaignId).send({
        from: this.state.currentAccount
      });
      this.setState({ success: "Campaign cancelled successfully!" });
      this.updateCampaigns();
    } catch (err) {
      this.setState({ error: `Failed to cancel campaign: ${err.message}. Please try again.` });
    } finally {
      this.setState(prevState => ({
        pendingTransactions: { ...prevState.pendingTransactions, [campaignId]: null }
      }));
    }
  };

  // Μέθοδος για την ανάληψη κεφαλαίων
  handleWithdraw = async () => {
    this.setState({ isLoading: true, error: '', success: '' });
    try {
      await campaign.methods.withdraw().send({ from: this.state.currentAccount });
      this.setState({ success: 'Funds withdrawn successfully' });
      await this.updateCampaigns();
    } catch (err) {
      this.setState({ error: err.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  // Μέθοδος για την αλλαγή ιδιοκτήτη του συμβολαίου
  handleChangeOwner = async () => {
    this.setState({ isLoading: true, error: '', success: '' });
    try {
      await campaign.methods.changeOwner(this.state.newOwnerAddress).send({ from: this.state.currentAccount });
      this.setState({ success: 'Owner changed successfully', newOwnerAddress: '' });
      const newOwner = await campaign.methods.owner().call();
      this.setState({ owner: newOwner.toLowerCase() });
      this.updateCampaigns();
    } catch (err) {
      this.setState({ error: err.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  // Μέθοδος για την απαγόρευση επιχειρηματία
  handleBanEntrepreneur = async () => {
    this.setState({ isLoading: true, error: '', success: '' });
    try {
      await campaign.methods.banEntrepreneur(this.state.bannedEntrepreneurAddress).send({ from: this.state.currentAccount });
      this.setState({ success: 'Entrepreneur banned successfully', bannedEntrepreneurAddress: '' });
      await this.updateCampaigns();
    } catch (err) {
      this.setState({ error: err.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  // Μέθοδος για την καταστροφή του συμβολαίου
  handleDestroyContract = async () => {
    this.setState({ isLoading: true, error: '', success: '' });
    try {
      await campaign.methods.destroyContract().send({ from: this.state.currentAccount });
      this.setState({ 
        success: 'Contract destroyed successfully',
        isContractDestroyed: true
      });
    } catch (err) {
      this.setState({ error: err.message });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  // Μέθοδος για την απόδοση του πίνακα καμπανιών
  renderCampaignTable = (campaigns, pledgeCounts, isLive) => {
    try {
      return (
        <table className="table">
          <thead>
            <tr>
              <th>Entrepreneur</th>
              <th>Title</th>
              <th>Price</th>
              <th>Backers</th>
              <th>Pledges Left</th>
              <th>Your Pledges</th>
              {isLive && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {campaigns[0].map((campaign, index) => {
              const campaignId = campaigns[1][index];
              return (
                <tr key={campaignId}>
                  <td>{campaign.entrepreneur ? campaign.entrepreneur.toLowerCase() : 'N/A'}</td>
                  <td>{campaign.title || 'N/A'}</td>
                  <td>{campaign.pledgeCost ? web3.utils.fromWei(campaign.pledgeCost.toString(), 'ether') + ' ETH' : 'N/A'}</td>
                  <td>{campaign.backersCount ? campaign.backersCount.toString() : 'N/A'}</td>
                  <td>{isLive ? (campaign.pledgesLeft ? campaign.pledgesLeft.toString() : '0') : '0'}</td>
                  <td>{pledgeCounts[index] !== undefined ? pledgeCounts[index].toString() : '0'}</td>
                  {isLive ? (
                    <td>
                      <button 
                        className="btn btn-success mr-2" 
                        onClick={() => this.handlePledge(campaignId, campaign.pledgeCost)}
                        disabled={this.state.pendingTransactions[campaignId] === 'pledge' || this.state.isContractDestroyed}
                      >
                        {this.state.pendingTransactions[campaignId] === 'pledge' ? 'Pledging...' : 'Pledge'}
                      </button>
                      {(this.state.currentAccount.toLowerCase() === campaign.entrepreneur.toLowerCase() || this.state.currentAccount.toLowerCase() === this.state.owner.toLowerCase()) && (
                        <button 
                          className="btn btn-danger ml-2" 
                          onClick={() => this.handleCancelCampaign(campaignId)}
                          disabled={this.state.pendingTransactions[campaignId] === 'cancel' || this.state.isContractDestroyed}
                        >
                          {this.state.pendingTransactions[campaignId] === 'cancel' ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  ) : <td></td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    } catch (error) {
      console.error("Error rendering campaign table:", error);
      return <p>Error loading campaigns. Please refresh the page.</p>;
    }
  }

  // Απόδοση του component
  render() {
    const { isLoading, isMetaMaskConnected, error, isContractDestroyed } = this.state;

    if (isLoading) {
      return <div className="container mt-5">Loading, please wait!</div>;
    }

    if (!isMetaMaskConnected) {
      return (
        <div className="container mt-5">
          <h1>Welcome to Crowdfunding DApp</h1>
          <p>{error || "Please connect to MetaMask to use this application."}</p>
          <button 
            className="btn btn-primary" 
            onClick={this.checkMetaMaskConnection} 
            disabled={this.state.isLoading}
          >
            {this.state.isLoading ? 'Connecting...' : 'Connect to MetaMask'}
          </button>
        </div>
      );
    }

    return (
      <div className="container mt-5">
        {isContractDestroyed && (
          <div className="alert alert-warning mb-3">
            The contract has been destroyed. No further actions can be taken.
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}
        {this.state.success && <div className="alert alert-success">{this.state.success}</div>}
        
        {/* Ενότητα επικεφαλίδας */}
        <div id="address-info" className="mb-4">
          <h1>Crowdfunding DApp</h1>
          <div className="form-group">
            <label><strong>Current Address:</strong></label>
            <input type="text" className="form-control" value={this.state.currentAccount || 'Not connected'} disabled />
          </div>
          <div className="form-group">
            <label><strong>Owner's Address:</strong></label>
            <input type="text" className="form-control" value={this.state.owner || 'Not available'} disabled />
          </div>
          <div className="form-group">
            <label><strong>Balance:</strong></label>
            <input type="text" className="form-control" value={`${parseFloat(this.state.contractBalance).toFixed(12)} ETH`} disabled />
          </div>
          <div className="form-group">
            <label><strong>Collected Fees:</strong></label>
            <input type="text" className="form-control" value={`${parseFloat(this.state.reservedFunds).toFixed(12)} ETH`} disabled />
          </div>
        </div>

        {/* Ενότητα νέας καμπάνιας */}
        <div id="new-campaign" className="mb-4">
          <h2>New Campaign</h2>
          <form onSubmit={this.handleNewCampaignSubmit}>
            <div className="form-group">
              <label><strong>Title</strong></label>
              <input
                type="text"
                className="form-control"
                value={this.state.newCampaignTitle}
                onChange={(e) => this.setState({ newCampaignTitle: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label><strong>Pledge Cost (ETH)</strong></label>
              <input
                type="number"
                className="form-control"
                value={this.state.newCampaignPledgeCost}
                onChange={(e) => this.setState({ newCampaignPledgeCost: e.target.value })}
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label><strong>Number of Pledges</strong></label>
              <input
                type="number"
                className="form-control"
                value={this.state.newCampaignNumberOfPledges}
                onChange={(e) => this.setState({ newCampaignNumberOfPledges: e.target.value })}
                min="1"
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary mt-2" 
              disabled={isContractDestroyed || 
                        this.state.currentAccount.toLowerCase() === this.state.owner.toLocaleLowerCase()
                        ||this.state.isLoading ||this.state.isCurrentAddressBanned
              }
            >
              {this.state.isLoading ? 'Creating...' : 'Create Campaign'}
            </button>
          </form>
        </div>

        {/* Ενότητα ενεργών καμπανιών */}
        <div className="mb-4">
          <h2>Live Campaigns</h2>
          {this.state.liveCampaigns && this.state.liveCampaigns[0] && this.state.liveCampaigns[0].length > 0 ? (
            this.renderCampaignTable(this.state.liveCampaigns, this.state.livePledgeCounts, true)
          ) : (
            <p>No live campaigns at the moment.</p>
          )}
        </div>

        {/* Ενότητα ολοκληρωμένων καμπανιών */}
        <div className="mb-4">
          <h2>Fulfilled Campaigns</h2>
          {this.state.fulfilledCampaigns && this.state.fulfilledCampaigns[0] && this.state.fulfilledCampaigns[0].length > 0 ? (
            this.renderCampaignTable(this.state.fulfilledCampaigns, this.state.fulfilledPledgeCounts, false)
          ) : (
            <p>No fulfilled campaigns yet.</p>
          )}
        </div>

        {/* Ενότητα πίνακα ελέγχου */}
        {this.state.currentAccount.toLowerCase() === this.state.owner.toLowerCase() && (
          <div className="mb-4">
            <h2>Control Panel</h2>
            <button 
              className="btn btn-primary mr-2" 
              onClick={this.handleWithdraw}
              disabled={isContractDestroyed || this.state.isLoading}
            >
              Withdraw
            </button>
            <div className="input-group mt-2">
              <input 
                type="text" 
                className="form-control" 
                placeholder="New owner address" 
                value={this.state.newOwnerAddress}
                onChange={(e) => this.setState({ newOwnerAddress: e.target.value })}
                disabled={isContractDestroyed || this.state.isLoading}
              />
              <div className="input-group-append">
                <button 
                  className="btn btn-outline-secondary" 
                  type="button" 
                  onClick={this.handleChangeOwner}
                  disabled={isContractDestroyed || this.state.isLoading}
                >
                  Change Owner
                </button>
              </div>
            </div>
            <div className="input-group mt-2">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Entrepreneur address to ban" 
                value={this.state.bannedEntrepreneurAddress}
                onChange={(e) => this.setState({ bannedEntrepreneurAddress: e.target.value })}
                disabled={isContractDestroyed || this.state.isLoading}
              />
              <div className="input-group-append">
                <button 
                  className="btn btn-outline-secondary" 
                  type="button" 
                  onClick={this.handleBanEntrepreneur}
                  disabled={isContractDestroyed || this.state.isLoading}
                >
                  Ban Entrepreneur
                </button>
              </div>
            </div>
            <button 
              className="btn btn-danger mt-2" 
              onClick={this.handleDestroyContract}
              disabled={isContractDestroyed || this.state.isLoading}
            >
              Destroy Contract
            </button>
          </div>
        )}
      </div>
    );
  }

}

export default App;
