Live site at https://sotiriosdemertzis.github.io/crowdfunding_dapp/

# Crowdfunding DApp

## Project Overview

This project is a decentralized application (DApp) for crowdfunding campaigns built on the Ethereum blockchain. It allows entrepreneurs to create and manage fundraising campaigns, and backers to pledge support to these campaigns.

## Key Features

1. **Campaign Creation**: Entrepreneurs can create new crowdfunding campaigns by specifying a title, pledge cost, and number of pledges.
2. **Pledge System**: Users can pledge support to live campaigns by sending Ether.
3. **Campaign Management**: Entrepreneurs and the contract owner can cancel campaigns.
4. **Automatic Fulfillment**: Campaigns are automatically marked as fulfilled when all pledges are received.
5. **User Roles**: Distinct roles for entrepreneurs, backers, and the contract owner.
6. **Admin Controls**: The contract owner has special privileges like banning entrepreneurs and destroying the contract.

## Technologies Used

- **Solidity**: For writing the smart contract
- **React**: For building the frontend user interface
- **Web3.js**: For interacting with the Ethereum blockchain
- **MetaMask**: For handling user authentication and transactions

## Smart Contract Features

- **Campaign Structure**: Stores details like entrepreneur address, title, pledge cost, backers count, etc.
- **Event Emission**: Emits events for important actions (e.g., campaign creation, pledges, fulfillment).
- **Access Control**: Implements role-based access control for different functions.
- **Fund Management**: Handles the collection and distribution of funds.

## Frontend Features

- **MetaMask Integration**: Connects to users' Ethereum wallets via MetaMask.
- **Real-time Updates**: Uses event listeners to update the UI in real-time.
- **Campaign Display**: Shows live and fulfilled campaigns in separate tables.
- **User-specific Actions**: Displays different options based on user roles (e.g., cancel campaign for entrepreneurs).

## Key Learnings

1. **Blockchain Interaction**: Learned how to interact with Ethereum blockchain using Web3.js.
2. **Smart Contract Development**: Gained experience in writing and deploying Solidity smart contracts.
3. **React State Management**: Implemented complex state management in React for blockchain data.
4. **Event Handling**: Used blockchain events to trigger UI updates.
5. **MetaMask Integration**: Learned how to integrate MetaMask for user authentication and transactions.
6. **Error Handling**: Implemented robust error handling for blockchain interactions.
7. **Asynchronous Operations**: Managed asynchronous operations in both smart contract calls and UI updates.
8. **Gas Optimization**: Considered gas costs when designing smart contract functions.

## Challenges Faced and Solutions

1. **MetaMask Connectivity**: Implemented checks and prompts to ensure users are connected to MetaMask.
2. **Transaction Management**: Created a system to handle pending transactions and update UI accordingly.
3. **Data Consistency**: Used event listeners to keep the frontend in sync with the blockchain state.
4. **User Experience**: Designed intuitive interfaces for complex blockchain interactions.
