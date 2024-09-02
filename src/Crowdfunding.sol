// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    // Βασικές μεταβλητές του συμβολαίου
    address public owner; 
    uint public constant FEE = 0.02 ether; // Σταθερό τέλος για τη δημιουργία εκστρατείας
    uint public reservedFunds; // Αποθεματικά κεφάλαια του συμβολαίου
    bool public isContractDestroyed = false; // Κατάσταση καταστροφής του συμβολαίου

    // Δομή για την αποθήκευση πληροφοριών εκστρατείας
    struct Campaign {
        address entrepreneur;
        string title;
        uint pledgeCost;
        uint backersCount;
        uint pledgesLeft;
        uint totalRaised;
        bool fulfilled;
        address[] backers; // Λίστα υποστηρικτών για κάθε εκστρατεία
    }

    // Mappings για την αποθήκευση και διαχείριση δεδομένων
    mapping(uint => Campaign) public campaigns;
    mapping(address => bool) public bannedEntrepreneurs;
    mapping(uint => mapping(address => uint)) public pledges;
    mapping(string => bool) public titleExists; // Έλεγχος μοναδικότητας τίτλων
    
    // Μετρητές για διάφορες καταστάσεις εκστρατειών
    uint public campaignCount;
    uint public liveCampaignsCount;
    uint public fulfilledCampaignsCount;

    // Events για την καταγραφή σημαντικών ενεργειών
    event CampaignCreated(uint campaignId, address entrepreneur, string title);
    event PledgeMade(uint campaignId, address backer, uint amount);
    event CampaignCancelled(uint campaignId, address entrepreneur);
    event CampaignFulfilled(uint campaignId, address entrepreneur, uint amountTransferred);
    event OwnerChanged(address newOwner);
    event EntrepreneurBanned(address entrepreneur);
    event ContractDestroyed(address owner);
    event FundsWithdrawn(address owner, uint amount);

    // Modifiers για τον έλεγχο πρόσβασης και την εγκυρότητα ενεργειών
    modifier notOwner() {
        require(msg.sender != owner, "Owner cannot create campaigns");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier notBanned() {
        require(!bannedEntrepreneurs[msg.sender], "Banned Entrepreneur");
        _;
    }

    modifier campaignExists(uint _campaignId) {
        require(_campaignId < campaignCount, "Campaign does not exist");
        _;
    }

    modifier notDestroyed() {
        require(!isContractDestroyed, "Contract is destroyed");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Δημιουργία νέας εκστρατείας
    function createCampaign(string memory _title, uint _pledgeCost, uint _numOfPledges) public payable notOwner notBanned notDestroyed {
        require(msg.value == FEE, "Incorrect fee");
        require(_numOfPledges > 0, "Invalid shares");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(!titleExists[_title], "Title already exists");

        campaigns[campaignCount] = Campaign({
            entrepreneur: msg.sender,
            title: _title,
            pledgeCost: _pledgeCost,
            backersCount: 0,
            pledgesLeft: _numOfPledges,
            totalRaised: 0,
            fulfilled: false,
            backers: new address[](0)
        });

        titleExists[_title] = true;
        reservedFunds += FEE;
        emit CampaignCreated(campaignCount, msg.sender, _title);
        campaignCount++;
        liveCampaignsCount++;
    }

    // Ακύρωση εκστρατείας
    function cancelCampaign(uint _campaignId) public notDestroyed {
        require(_campaignId < campaignCount, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.entrepreneur != address(0), "Campaign already cancelled or does not exist");
        require(msg.sender == campaign.entrepreneur || msg.sender == owner, "Not authorized");
        require(!campaign.fulfilled, "Campaign already fulfilled");

        // Επιστροφή κεφαλαίων στους υποστηρικτές
        for (uint i = 0; i < campaign.backers.length; i++) {
            address backer = campaign.backers[i];
            uint amount = pledges[_campaignId][backer];
            if (amount > 0) {
                pledges[_campaignId][backer] = 0;
                payable(backer).transfer(amount);
            }
        }

        delete titleExists[campaign.title];

        if (!campaign.fulfilled) {
            liveCampaignsCount--;
        }

        emit CampaignCancelled(_campaignId, campaign.entrepreneur);

        campaign.entrepreneur = address(0);
        campaign.fulfilled = true;
    }

    // Δέσμευση σε εκστρατεία
    function pledge(uint _campaignId) public payable campaignExists(_campaignId) notDestroyed {
        Campaign storage campaign = campaigns[_campaignId];
        require(!campaign.fulfilled, "Campaign already fulfilled");
        require(msg.value == campaign.pledgeCost, "Incorrect pledge amount");
        require(campaign.pledgesLeft > 0, "No shares left");

        bool isBacker = false;
        for (uint i = 0; i < campaign.backers.length; i++) {
            if (campaign.backers[i] == msg.sender) {
                isBacker = true;
                break;
            }
        }
        if (!isBacker) {
            campaign.backers.push(msg.sender);
        }
        
        campaign.pledgesLeft--;
        campaign.backersCount++;
        campaign.totalRaised += msg.value;
        pledges[_campaignId][msg.sender] += msg.value;

        emit PledgeMade(_campaignId, msg.sender, msg.value);

        if (campaign.pledgesLeft == 0) {
            fulfillCampaign(_campaignId);
        }
    }

    // Εσωτερική συνάρτηση για την εκπλήρωση εκστρατείας
    function fulfillCampaign(uint _campaignId) internal campaignExists(_campaignId) notDestroyed {
        Campaign storage campaign = campaigns[_campaignId];
        require(!campaign.fulfilled, "Campaign already fulfilled");

        campaign.fulfilled = true;
        uint amountToTransfer = (campaign.totalRaised * 80) / 100; // 80% στον επιχειρηματία
        reservedFunds += campaign.totalRaised - amountToTransfer; // 20% στο συμβόλαιο

        payable(campaign.entrepreneur).transfer(amountToTransfer);
        emit CampaignFulfilled(_campaignId, campaign.entrepreneur, amountToTransfer);
        liveCampaignsCount--;
        fulfilledCampaignsCount++;
    }

    // Απόσυρση κεφαλαίων από τον ιδιοκτήτη
    function withdraw() public onlyOwner notDestroyed {
        uint amount = reservedFunds;
        reservedFunds = 0;
        payable(owner).transfer(amount);
        emit FundsWithdrawn(owner, amount);
    }

    // Αλλαγή ιδιοκτήτη του συμβολαίου
    function changeOwner(address _newOwner) public onlyOwner notDestroyed {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
        emit OwnerChanged(_newOwner);
    }

    // Απαγόρευση επιχειρηματία
    function banEntrepreneur(address _entrepreneur) public onlyOwner notDestroyed {
        bannedEntrepreneurs[_entrepreneur] = true;
        for (uint i = 0; i < campaignCount; i++) {
            if (campaigns[i].entrepreneur == _entrepreneur && !campaigns[i].fulfilled) {
                cancelCampaign(i);
            }
        }
        emit EntrepreneurBanned(_entrepreneur);
    }

    // Καταστροφή του συμβολαίου
    function destroyContract() public onlyOwner notDestroyed {
        for (uint i = 0; i < campaignCount; i++) {
            if (!campaigns[i].fulfilled && campaigns[i].entrepreneur != address(0)) {
                cancelCampaign(i);
            }
        }
        withdraw();
        isContractDestroyed = true;
        emit ContractDestroyed(owner);
        selfdestruct(payable(address(owner)));
    }

    // Βοηθητικές συναρτήσεις για την ανάκτηση πληροφοριών
    function getContractBalance() public notDestroyed view returns (uint) {
        return address(this).balance;
    }

    function getLiveCampaigns() public notDestroyed view returns (Campaign[] memory, uint[] memory) {
        Campaign[] memory liveCampaigns = new Campaign[](liveCampaignsCount);
        uint[] memory campaignIds = new uint[](liveCampaignsCount);
        uint index = 0;
        for (uint i = 0; i < campaignCount; i++) {
            if (!campaigns[i].fulfilled && campaigns[i].entrepreneur != address(0)) {
                liveCampaigns[index] = campaigns[i];
                campaignIds[index] = i;
                index++;
            }
        }
        return (liveCampaigns, campaignIds);
    }

    function getFulfilledCampaigns() public notDestroyed view returns (Campaign[] memory, uint[] memory) {
        Campaign[] memory fulfilledCampaigns = new Campaign[](fulfilledCampaignsCount);
        uint[] memory campaignIds = new uint[](fulfilledCampaignsCount);
        uint index = 0;
        for (uint i = 0; i < campaignCount; i++) {
            if (campaigns[i].fulfilled && campaigns[i].entrepreneur != address(0)) {
                fulfilledCampaigns[index] = campaigns[i];
                campaignIds[index] = i;
                index++;
            }
        }
        return (fulfilledCampaigns, campaignIds);
    }

    function getCurrentUserPledgeCountOnCampaign(uint _campaignId) public notDestroyed view campaignExists(_campaignId) returns (uint) {
        Campaign storage campaign = campaigns[_campaignId];
        uint pledgeCount = 0;
        if (pledges[_campaignId][msg.sender] > 0) {
            pledgeCount = pledges[_campaignId][msg.sender] / campaign.pledgeCost;
        }
        return pledgeCount;
    }
}