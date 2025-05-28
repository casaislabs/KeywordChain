import { useState } from 'react'
import { ethers } from 'ethers'
import { contractAddress, contractABI } from '../providers/contractConfig'

export const GetLastPhraseButton = ({ provider, onFetchLastPhrase }) => {
  const [loading, setLoading] = useState(false)

  const fetchLastPhrase = async () => {
    if (!provider) {
      alert('Please connect your wallet first.')
      return
    }

    try {
      setLoading(true)

      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      const lastMessage = await contract.getLastMessage()
      onFetchLastPhrase(lastMessage.keyword) // Actualiza el estado global en App.jsx
    } catch (error) {
      console.error('Error fetching last phrase:', error)
      alert('Failed to fetch the last phrase. Check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 text-center animate-fadeIn">
      <button
        onClick={fetchLastPhrase}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all"
        disabled={loading}
      >
        {loading ? 'Fetching...' : 'Get Last Phrase'}
      </button>
    </div>
  )
}