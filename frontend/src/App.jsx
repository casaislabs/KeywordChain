import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import logo from './assets/logo.svg'
import { ConnectWalletButton } from './components/ConnectWalletButton'
import { GetLastPhraseButton } from './components/GetLastPhraseButton'
import { AddPhraseButton } from './components/AddPhraseButton'

function App() {
  const { address, isConnected } = useAccount() // Connected wallet address
  const [provider, setProvider] = useState(null)

  useEffect(() => {
    if (window.ethereum && isConnected) {
      setProvider(new ethers.BrowserProvider(window.ethereum)) // Use BrowserProvider
    } else {
      setProvider(null)
    }
  }, [isConnected])

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        {/* Logo on the top-left */}
        <a href="/" target="_self" rel="noopener noreferrer">
          <img src={logo} className="h-16 hover:drop-shadow-lg" alt="KeywordChain logo" />
        </a>
        {/* Connect Wallet button on the top-right */}
        <ConnectWalletButton />
      </div>
      <h1 className="text-4xl font-bold mt-8 text-center text-blue-600">KeywordChain</h1>
      <p className="text-gray-700 mt-4 text-center">
        Connect your wallet to get started.
      </p>
      <div className="mt-8 text-center">
        {isConnected ? (
          <>
            {/* Show buttons if wallet is connected */}
            <div className="mt-8">
              <GetLastPhraseButton provider={provider} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all" />
            </div>
            <div className="mt-8">
              <AddPhraseButton provider={provider} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-all" />
            </div>
          </>
        ) : (
          // Show message if wallet is not connected
          <p className="text-red-500 font-semibold">
            Please connect your wallet to interact with the app.
          </p>
        )}
      </div>
    </div>
  )
}

export default App