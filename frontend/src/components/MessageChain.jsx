import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../config/contractConfig';

export const MessageChain = ({ provider, refresh }) => {
  const [messages, setMessages] = useState([]);
  const [visibleMessages, setVisibleMessages] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false); // Track network switching

  const fetchMessages = useCallback(async () => {
    if (!provider || isSwitchingNetwork) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        setError('Wrong network. Please switch to Sepolia in MetaMask.');
        setMessages([]);
        return;
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const totalMessages = await contract.getMessagesCount();
      const allMessages = await contract.getMessages(0, totalMessages);

      const formattedMessages = allMessages.map((message) => ({
        author: message.author,
        text: message.text,
        keyword: message.keyword,
      }));

      setMessages(formattedMessages.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to fetch messages. Check the console for details.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [provider, isSwitchingNetwork]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, refresh]);

useEffect(() => {
  if (!provider || !window.ethereum) return;

  const handleChainChanged = async () => {
    setIsSwitchingNetwork(true); // Start network switching state
    try {
      const network = await provider.getNetwork();
      console.log('Chain changed to:', network.chainId.toString());
      if (network.chainId === 11155111n) {
        fetchMessages(); // Retry fetching messages if the network is valid
      } else {
        setError('Wrong network. Please switch to Sepolia in MetaMask.');
        setMessages([]);
      }
    } catch (err) {
      if (err.code === 'NETWORK_ERROR') {
        console.log('Suppressed NETWORK_ERROR during chain change:', err.message);
      } else {
        console.error('Error handling chain change:', err);
        setError('Network error. Please try again.');
        setMessages([]);
      }
    } finally {
      setIsSwitchingNetwork(false); // End network switching state
    }
  };

  window.ethereum.on('chainChanged', handleChainChanged);
  return () => {
    window.ethereum.removeListener('chainChanged', handleChainChanged);
  };
}, [provider, fetchMessages]);
  const handleShowMore = () => {
    setVisibleMessages((prev) => prev + 3);
  };

  if (isSwitchingNetwork) {
    return (
      <div className="mt-8 text-center">
        <p className="text-gray-400 animate-pulse">Switching network...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 mb-6 animate-slideUp">
        Message Chain
      </h2>
      {error && (
        <p className="text-red-400 p-4 bg-gray-800 rounded-lg shadow-md animate-fadeIn">{error}</p>
      )}
      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading messages...</p>
      ) : (
        <div
          className="flex flex-col items-center space-y-4"
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#3b82f6 #1e293b',
          }}
        >
          <div className="w-full space-y-4 px-4">
            {messages.slice(0, visibleMessages).map((message, index) => (
              <div
                key={index}
                className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-200 p-6 shadow-lg w-full text-center border border-gray-700 rounded-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fadeIn"
              >
                <p className="font-bold text-xl text-blue-400">{message.text}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Keyword: <span className="text-teal-400">{message.keyword}</span>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Author: <span className="text-purple-400">{message.author}</span>
                </p>
              </div>
            ))}
          </div>
          {visibleMessages < messages.length && (
            <button
              onClick={handleShowMore}
              className="mt-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Show More
            </button>
          )}
        </div>
      )}
    </div>
  );
};