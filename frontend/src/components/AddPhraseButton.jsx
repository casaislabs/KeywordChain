import { useState } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../config/contractConfig';

// This component allows users to add a new phrase to the smart contract
export const AddPhraseButton = ({ provider, onPhraseAdded }) => {
  const [phrase, setPhrase] = useState(''); // State to store the input phrase
  const [loading, setLoading] = useState(false); // State to track loading status

  // Function to add a new phrase to the smart contract
  const addPhrase = async () => {
    if (!provider) {
      // Alert the user if the wallet is not connected
      alert('Provider is not initialized. Please ensure your wallet is connected.');
      return;
    }

    if (!phrase.trim()) {
      // Alert the user if the input phrase is invalid
      alert('Please enter a valid phrase.');
      return;
    }

    try {
      setLoading(true); // Set loading state to true while processing

      // Get the signer from the provider
      const signer = await provider.getSigner();

      // Initialize the contract instance using the signer
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Fetch the last message from the contract
      const lastMessage = await contract.getLastMessage();
      const lastKeyword = lastMessage.keyword;

      // Validate that the new phrase starts with the last keyword
      if (!phrase.startsWith(lastKeyword)) {
        alert(`The phrase must start with the last keyword: "${lastKeyword}"`);
        return;
      }

      // Add the new phrase to the contract
      const tx = await contract.addMessage(phrase);
      await tx.wait(); // Wait for the transaction to be mined

      // Extract the new keyword from the added phrase
      const newKeyword = phrase.split(' ').pop();

      alert('Phrase added successfully!');
      setPhrase(''); // Clear the input field

      // Notify the parent component about the added phrase
      if (onPhraseAdded) {
        onPhraseAdded(phrase, newKeyword);
      }
    } catch (error) {
      console.error('Error adding phrase:', error);

      // Handle specific errors from the smart contract
      if (error.data?.message?.includes('InvalidKeyword')) {
        alert('The phrase does not start with the required keyword.');
      } else if (error.data?.message?.includes('TextTooLong')) {
        alert('The phrase exceeds the maximum allowed length.');
      } else if (error.data?.message?.includes('EmptyText')) {
        alert('The phrase cannot be empty.');
      } else {
        alert('Failed to add the phrase. Check the console for details.');
      }
    } finally {
      setLoading(false); // Reset the loading state after the operation
    }
  };

  // Render the input field and button for adding a phrase
  return (
    <div className="mt-8 text-center animate-fadeIn">
      <input
        type="text"
        value={phrase} // Bind the input field to the phrase state
        onChange={(e) => setPhrase(e.target.value)} // Update the phrase state on input change
        placeholder="Enter your phrase" // Placeholder text for the input field
        className="px-4 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
      />
      <button
        onClick={addPhrase} // Trigger the addPhrase function on button click
        className={`px-4 py-2 rounded-lg shadow-md font-bold transition-all ${
          loading
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed' // Disabled button styles
            : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 animate-pulse' // Active button styles
        }`}
        disabled={loading} // Disable the button while loading
      >
        {loading ? 'Adding...' : 'Add Phrase'} {/* Show loading text or default text */}
      </button>
    </div>
  );
};