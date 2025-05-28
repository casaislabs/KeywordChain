import { useState } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../providers/contractConfig';

export const AddPhraseButton = ({ provider, onPhraseAdded }) => {
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);

  const addPhrase = async () => {
    if (!provider) {
      alert('Please connect your wallet first.');
      return;
    }

    if (!phrase.trim()) {
      alert('Please enter a valid phrase.');
      return;
    }

    try {
      setLoading(true);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Get the last message from the contract
      const lastMessage = await contract.getLastMessage();
      const lastKeyword = lastMessage.keyword;

      // Validate that the phrase starts with the last keyword
      if (!phrase.startsWith(lastKeyword)) {
        alert(`The phrase must start with the last keyword: "${lastKeyword}"`);
        return;
      }

      // Add the new phrase to the contract
      const tx = await contract.addMessage(phrase);
      await tx.wait();

      // Extract the new keyword from the added phrase
      const newKeyword = phrase.split(' ').pop();

      alert('Phrase added successfully!');
      setPhrase('');

      // Notify the parent component (App.jsx) about the added phrase
      if (onPhraseAdded) {
        onPhraseAdded(phrase, newKeyword);
      }
    } catch (error) {
      console.error('Error adding phrase:', error);

      // Handle specific errors from the contract
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
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 text-center animate-fadeIn">
      <input
        type="text"
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
        placeholder="Enter your phrase"
        className="px-4 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
      />
      <button
        onClick={addPhrase}
        className={`px-4 py-2 rounded-lg shadow-md font-bold transition-all ${
          loading
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 animate-pulse'
        }`}
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Phrase'}
      </button>
    </div>
  );
};