import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export const ConnectWalletButton = ({ onProviderUpdate, onAccountUpdate }) => {
  const [account, setAccount] = useState(null);

  const memoizedOnProviderUpdate = useCallback(
    (provider) => {
      onProviderUpdate(provider);
    },
    [onProviderUpdate],
  );

    useEffect(() => {
    if (account) {
      onAccountUpdate(account);
    }
  }, [account, onAccountUpdate]);
const handleAccountsChanged = (accounts) => {
  if (accounts.length > 0 && accounts[0] !== account) {
    console.log('Account changed:', accounts[0]);
    setAccount(accounts[0]);
    const provider = new ethers.BrowserProvider(window.ethereum);
    memoizedOnProviderUpdate(provider);
  } else if (accounts.length === 0) {
    console.log('No accounts found.');
    setAccount(null);
    memoizedOnProviderUpdate(null);
  }
};

  const handleChainChanged = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_accounts', []);
    if (accounts.length > 0 && accounts[0] !== account) {
      console.log('Chain changed, account:', accounts[0]);
      setAccount(accounts[0]);
      memoizedOnProviderUpdate(provider);
    } else if (accounts.length === 0) {
      console.log('No accounts found after chain change.');
      setAccount(null);
      memoizedOnProviderUpdate(null);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && account) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send('eth_accounts', []);
          if (accounts.length > 0 && accounts[0] !== account) {
            setAccount(accounts[0]);
            memoizedOnProviderUpdate(provider);
          }
          const network = await provider.getNetwork();
          if (network.chainId !== 11155111n) {
            console.warn('Incorrect network detected. Attempting to switch to Sepolia.');
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }],
              });
            } catch (switchError) {
              console.error('Failed to switch network:', switchError);
              alert('Please switch to the Sepolia network in MetaMask.');
            }
          }
        } catch (error) {
          console.error('Error checking existing connection:', error);
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
window.ethereum.on('accountsChanged', (accounts) => {
  console.log('accountsChanged event:', accounts);
  handleAccountsChanged(accounts);
});

window.ethereum.on('chainChanged', (chainId) => {
  console.log('chainChanged event:', chainId);
  handleChainChanged();
});

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, memoizedOnProviderUpdate]);

  // Nuevo efecto para monitorear cambios en el estado `account`
  useEffect(() => {
    if (account) {
      console.log('Account updated:', account);
    }
  }, [account]);

  

  const handleConnect = async () => {
    try {
      if (!window.ethereum) {
        console.error('Ethereum provider not found. Please install MetaMask.');
        throw new Error('Ethereum provider not found. Please install MetaMask.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError) {
          console.error('Failed to switch network:', switchError);
          alert('Please switch to the Sepolia network in MetaMask.');
          throw new Error('Incorrect network');
        }
      }

      if (accounts.length > 0) {
        setAccount(accounts[0]); // Actualiza el estado de la cuenta primero
        memoizedOnProviderUpdate(provider); // Luego actualiza el estado del proveedor
        console.log('Wallet connected successfully:', accounts[0]);
      } else {
        console.error('No accounts found.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Check the console for details.');
    }
  };

  // Nuevo efecto para forzar el renderizado del botón
  useEffect(() => {
    if (account) {
      console.log('Account updated:', account);
    }
  }, [account]);

  const handleDisconnect = () => {
    try {
      if (account) {
        setAccount(null); // Actualiza el estado a null
        memoizedOnProviderUpdate(null);

        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }

        console.log('Wallet disconnected successfully.');
        alert('Wallet disconnected successfully.');
      } else {
        console.warn('Account is already null.');
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      alert('Failed to disconnect wallet. Check the console for details.');
    }
  };

  return account ? (
    <button
      onClick={handleDisconnect}
      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition-all"
    >
      Disconnect: {account.slice(0, 6)}...{account.slice(-4)}
    </button>
  ) : (
    <button
      onClick={handleConnect}
      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition-all"
    >
      Connect Wallet
    </button>
  );
};