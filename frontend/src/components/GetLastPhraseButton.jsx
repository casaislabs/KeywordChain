import { useState } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../config/contractConfig';

// This component fetches the last phrase stored in the smart contract
export const GetLastPhraseButton = ({ provider, onFetchLastPhrase }) => {
  const [loading, setLoading] = useState(false); // State to track loading status

  // Function to fetch the last phrase from the smart contract
  const fetchLastPhrase = async () => {
    if (!provider) {
      // Alert the user if the wallet is not connected
      alert('Please connect your wallet first.');
      return;
    }

    try {
      setLoading(true); // Set loading state to true while fetching data

      // Get the signer from the provider
      const signer = await provider.getSigner();

      // Initialize the contract instance using the signer
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Call the smart contract method to get the last message
      const lastMessage = await contract.getLastMessage();

      // Update the global state with the fetched keyword
      onFetchLastPhrase(lastMessage.keyword);
    } catch (error) {
      // Log and alert the user if an error occurs
      console.error('Error fetching last phrase:', error);
      alert('Failed to fetch the last phrase. Check the console for details.');
    } finally {
      // Reset the loading state after the operation
      setLoading(false);
    }
  };

  // Render the button with dynamic text based on the loading state
  return (
    <div className="mt-8 text-center animate-fadeIn">
      <button
        onClick={fetchLastPhrase} // Trigger the fetch function on button click
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all"
        disabled={loading} // Disable the button while loading
      >
        {loading ? 'Fetching...' : 'Get Last Phrase'} {/* Show loading text or default text */}
      </button>
    </div>
  );
};