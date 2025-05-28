# KeywordChain Smart Contract

## Overview

The `KeywordChain` project is a blockchain-based application that allows users to create a chain of messages, where each message must contain a specific keyword from the previous message. This ensures continuity and enforces a logical flow in the chain. The project is implemented as a Solidity smart contract and deployed on the Sepolia test network.

The contract has been successfully verified on both Etherscan and Sourcify.

- **Smart Contract**: Deployed on the Sepolia test network.
- **Frontend**: Deployed on Vercel at [KeywordChain](https://keyword-chain.vercel.app/).

---

## Features

- **Message Chain**: Users can add messages to the chain, ensuring that each message contains the keyword from the previous message.
- **Keyword Validation**: Keywords are validated to ensure they are alphanumeric and meet length constraints.
- **Pagination**: Retrieve messages in a paginated manner for efficient data handling.
- **Search**: Search for messages containing a specific keyword.
- **Reentrancy Protection**: Prevents reentrant calls to ensure contract security.
- **Custom Errors**: Optimized gas usage with custom error handling.

---

## Frontend Features

- **Wallet Connection**: Seamlessly connect your Ethereum wallet using RainbowKit and Wagmi.
- **Message Display**: View the blockchain-based message chain with pagination and keyword highlights.
- **Add Messages**: Add new messages to the chain directly from the frontend.
- **Keyword Validation**: Ensures that the added message starts with the correct keyword.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Interactive Animations**: Smooth animations for better user experience, including particle effects and hover transitions.

---

## Contract Details

- **Contract Name**: `MessageChain`
- **Deployed Address**: [0x4588Df975dF7df49612BF6F1588f705E93063af1](https://sepolia.etherscan.io/address/0xAD17ee34a3A2b59727C08E992a84a1F160BF21C0#code)
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Solidity Version**: `^0.8.0`

---

## Smart Contract

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/casaislabs/KeywordChain.git
   cd KeywordChain/smart-contract
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `smart-contract` directory with the following content:
   ```env
   SEPOLIA_URL=<Your_Alchemy_or_Infura_URL>
   PRIVATE_KEY=<Your_Wallet_Private_Key>
   ETHERSCAN_API_KEY=<Your_Etherscan_API_Key>
   ```

---

### Deployment

To deploy the contract to the Sepolia test network:

1. Compile the contract:
   ```bash
   npm run compile
   ```

2. Deploy the contract using Hardhat Ignition:
   ```bash
   npm run deploy
   ```

3. Verify the contract on Etherscan:
   ```bash
   npx hardhat verify --network sepolia <Deployed_Contract_Address>
   ```

---

## Frontend

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `frontend` directory with the following content:
   ```env
   VITE_APP_NAME=KeywordChain
   VITE_PROJECT_ID=<Your_Project_ID>
   ```

---

### Deployment

To deploy the contract to the Sepolia test network:

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the frontend to Vercel:
   ```bash
   vercel deploy
   ```

3. Access the deployed frontend at your link.

   ---

## Testing

Run the test suite to ensure the contract behaves as expected:

```bash
npm run test
```

### Example Test Output

```plaintext
MessageChain
    √ should initialize with the first keyword
    √ should allow adding a valid message
    √ should revert when adding a message with invalid keyword characters
    √ should revert when adding a message with an empty text
    √ should revert when adding a message exceeding max length
    √ should validate keywords correctly
    √ should search for messages containing a specific keyword
    √ should retrieve messages in a paginated manner
    √ should revert when retrieving out-of-range messages
    √ should retrieve the last message
    √ should emit event when message is added
```

---

## Usage

### Functions

1. **Add a Message**
   ```solidity
   function addMessage(string calldata text) external;
   ```
   Adds a new message to the chain. The message must meet the following requirements:
   - **Must start with the last keyword of the previous message.**
   - The keyword extracted from the new message must:
   - Be alphanumeric.
   - Not exceed the maximum length of 32 characters.
   - The total length of the message must not exceed 256 characters.

   If any of these conditions are not met, the transaction will revert with one of the following errors:
   - `InvalidKeyword`: The message does not start with the last keyword or the extracted keyword is invalid.
   - `TextTooLong`: The message exceeds the maximum allowed length.
   - `EmptyText`: The message is empty.

2. **Get Total Messages**
   ```solidity
   function getMessagesCount() external view returns (uint);
   ```
   Returns the total number of messages in the chain.

3. **Retrieve Messages (Paginated)**
   ```solidity
   function getMessages(uint start, uint count) external view returns (Message[] memory);
   ```
   Retrieves messages in a paginated manner.

4. **Search Messages by Keyword**
   ```solidity
   function searchMessagesByKeyword(string calldata keyword) external view returns (Message[] memory);
   ```
   Searches for messages containing a specific keyword.

5. **Retrieve the Last Message**
   ```solidity
   function getLastMessage() external view returns (Message memory);
   ```
   Retrieves the last message in the chain.

6. **Validate a Keyword**
   ```solidity
   function isValidKeyword(string memory keyword) public pure returns (bool);
   ```
   Validates whether a keyword contains only alphanumeric characters.

7. **Extract the Last Word**
   ```solidity
   function extractLastWord(string memory text) internal pure returns (string memory);
   ```
   Extracts the last word from a given text. This function is used internally to determine the keyword for a new message.

---

## Security Features

- **Reentrancy Protection**: The `nonReentrant` modifier ensures that no reentrant calls can occur.
- **Input Validation**: Custom errors and modifiers validate inputs to prevent invalid data from being processed.
- **Gas Optimization**: Custom errors and efficient loops reduce gas costs.

---

## Development Tools

- **Hardhat**: Development environment for compiling, testing, and deploying smart contracts.
- **Ethers.js**: Library for interacting with the Ethereum blockchain.
- **Hardhat Ignition**: Deployment framework for managing complex deployments.

---

## Technologies Used

### Smart Contract
- **Solidity**: Programming language for writing the `MessageChain` smart contract.
- **Hardhat**: Development environment for testing and deploying smart contracts.
- **Ethers.js**: Library for interacting with the Ethereum blockchain.

### Frontend
- **React**: JavaScript library for building the user interface.
- **RainbowKit**: Toolkit for wallet connection and management.
- **Wagmi**: React hooks for Ethereum integration.
- **Ethers.js**: Library for interacting with the Ethereum blockchain from the frontend.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **Vite**: Fast build tool for modern web applications.
- **React Query**: Data fetching and caching for API calls.
- **Particles.js**: Library for creating interactive particle effects.

---

## Resources

- [Etherscan Contract Verification](https://sepolia.etherscan.io/address/0xAD17ee34a3A2b59727C08E992a84a1F160BF21C0#code)
- [Sourcify Contract Verification](https://repo.sourcify.dev/contracts/full_match/11155111/0xAD17ee34a3A2b59727C08E992a84a1F160BF21C0/)
- [Hardhat Documentation](https://hardhat.org/docs)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.