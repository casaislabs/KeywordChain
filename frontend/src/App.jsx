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
    <div className="max-w-4xl mx-auto p-8 text-center">
      <div className="flex justify-center">
        <a href="/" target="_self" rel="noopener noreferrer">
          <img src={logo} className="h-24 hover:drop-shadow-lg" alt="KeywordChain logo" />
        </a>
      </div>
      <h1 className="text-4xl font-bold mt-8">KeywordChain</h1>
      <p className="text-gray-600 mt-4">Connect your wallet to get started.</p>
      <div className="mt-8">
        <ConnectWalletButton />
      </div>
      <div className="mt-8">
        <GetLastPhraseButton provider={provider} />
      </div>
      <div className="mt-8">
        <AddPhraseButton provider={provider} />
      </div>
    </div>
  )
}

export default App