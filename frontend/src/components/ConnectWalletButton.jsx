import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';

export const ConnectWalletButton = ({ account, provider, onProviderUpdate, onAccountUpdate }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const memoizedOnProviderUpdate = useCallback(
    (provider) => {
      console.log('Updating provider:', provider ? 'New provider set' : 'Provider cleared');
      onProviderUpdate(provider);
    },
    [onProviderUpdate]
  );

  const memoizedOnAccountUpdate = useCallback(
    (account) => {
      console.log('Updating account:', account || 'Account cleared');
      onAccountUpdate(account);
    },
    [onAccountUpdate]
  );

  const handleConnect = async () => {
    try {
      if (!window.ethereum) {
        alert('Ethereum provider not found. Please install MetaMask.');
        return;
      }

      setIsConnecting(true);

      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await newProvider.send('eth_requestAccounts', []);
      const network = await newProvider.getNetwork();

      console.log('Connecting to network:', network.chainId.toString());

      if (network.chainId !== 11155111n) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
          });
          // Re-verificar la red después del cambio
          const updatedNetwork = await newProvider.getNetwork();
          if (updatedNetwork.chainId !== 11155111n) {
            alert('Failed to switch to Sepolia. Please select Sepolia in MetaMask.');
            setIsConnecting(false);
            return;
          }
        } catch (switchError) {
          console.error('Error switching to Sepolia:', switchError);
          alert('Please switch to the Sepolia network in MetaMask.');
          setIsConnecting(false);
          return;
        }
      }

      if (accounts.length > 0) {
        memoizedOnProviderUpdate(newProvider);
        memoizedOnAccountUpdate(accounts[0]);
      } else {
        alert('No accounts found. Please ensure MetaMask is unlocked.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Check the console for details.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log('Disconnecting wallet');
      memoizedOnProviderUpdate(null);
      memoizedOnAccountUpdate(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      alert('Failed to disconnect wallet. Check the console for details.');
    }
  };

  // Handle MetaMask events
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      try {
        console.log('Accounts changed:', accounts);
        if (accounts.length > 0) {
          const newProvider = new ethers.BrowserProvider(window.ethereum);
          const network = await newProvider.getNetwork();
          if (network.chainId === 11155111n) {
            memoizedOnProviderUpdate(newProvider);
            memoizedOnAccountUpdate(accounts[0]);
          } else {
            alert('Please switch to the Sepolia network in MetaMask.');
            memoizedOnProviderUpdate(null);
            memoizedOnAccountUpdate(null);
          }
        } else {
          memoizedOnProviderUpdate(null);
          memoizedOnAccountUpdate(null);
        }
      } catch (error) {
        console.error('Error handling accounts changed:', error);
        alert('Error updating account. Please try again.');
      }
    };


let isSwitchingNetwork = false; // Track if a network switch is in progress

const handleChainChanged = async (chainId) => {
  if (isSwitchingNetwork) {
    console.log('Ignoring redundant chainChanged event during network switch.');
    return;
  }

  isSwitchingNetwork = true; // Set the flag immediately to prevent redundant calls

  try {
    console.log(`Chain changed to: ${chainId}`);
    const newProvider = new ethers.BrowserProvider(window.ethereum);
    const network = await newProvider.getNetwork();

    console.log(`Network detected: ${network.chainId}`);
    if (network.chainId === 11155111n) {
      const accounts = await newProvider.send('eth_accounts', []);
      if (accounts.length > 0) {
        console.log('Provider and account updated successfully.');
        memoizedOnProviderUpdate(newProvider);
        memoizedOnAccountUpdate(accounts[0]);
      } else {
        console.warn('No accounts found after chain change.');
        memoizedOnProviderUpdate(null);
        memoizedOnAccountUpdate(null);
      }
    } else {
      console.log('Switching to Sepolia network...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
      });

      // Re-verify the network after switching
      const updatedNetwork = await newProvider.getNetwork();
      console.log(`Updated network detected: ${updatedNetwork.chainId}`);
      if (updatedNetwork.chainId === 11155111n) {
        const accounts = await newProvider.send('eth_accounts', []);
        if (accounts.length > 0) {
          console.log('Provider and account updated successfully after switching.');
          memoizedOnProviderUpdate(newProvider);
          memoizedOnAccountUpdate(accounts[0]);
        } else {
          console.warn('No accounts found after switching to Sepolia.');
          memoizedOnProviderUpdate(null);
          memoizedOnAccountUpdate(null);
        }
      } else {
        alert('Failed to switch to Sepolia. Please select Sepolia in MetaMask.');
        memoizedOnProviderUpdate(null);
        memoizedOnAccountUpdate(null);
      }
    }
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      console.log('Suppressed NETWORK_ERROR during chain change:', error.message);
    } else {
      console.error('Error handling chain changed:', error);
      alert('Error updating network. Please try again.');
    }
    memoizedOnProviderUpdate(null);
    memoizedOnAccountUpdate(null);
  } finally {
    isSwitchingNetwork = false; // Reset the flag after handling
  }
};

    const handleConnectEvent = (info) => {
      console.log('MetaMask connected:', info);
      handleConnect(); // Re-check account and network on connect
    };

    const handleDisconnectEvent = (error) => {
      console.log('MetaMask disconnected:', error);
      memoizedOnProviderUpdate(null);
      memoizedOnAccountUpdate(null);
      alert('MetaMask disconnected. Please reconnect to continue.');
    };

    // Subscribe to MetaMask events
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('connect', handleConnectEvent);
    window.ethereum.on('disconnect', handleDisconnectEvent);

    // Cleanup listeners on unmount
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('connect', handleConnectEvent);
      window.ethereum.removeListener('disconnect', handleDisconnectEvent);
    };
  }, [memoizedOnProviderUpdate, memoizedOnAccountUpdate, handleConnect]);

  return (
    <button
      onClick={account ? handleDisconnect : handleConnect}
      className={`py-2 px-4 rounded-lg shadow-md transition-all text-white ${
        account ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
      }`}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <span className="flex items-center">
          <svg
            className="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Connecting...
        </span>
      ) : account ? (
        `Disconnect: ${account.slice(0, 6)}...${account.slice(-4)}`
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
};