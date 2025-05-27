import { useState } from 'react'
import { ethers } from 'ethers'
import { contractAddress, contractABI } from '../providers/contractConfig'

export const GetLastPhraseButton = ({ provider }) => {
  const [lastPhrase, setLastPhrase] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchLastPhrase = async () => {
    if (!provider) {
      alert('Please connect your wallet first.')
      return
    }

    try {
      setLoading(true)

      // Get the signer from the provider
      const signer = await provider.getSigner()

      // Instantiate the contract with the signer
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      // Call the getLastMessage function on the contract
      const lastMessage = await contract.getLastMessage()
      setLastPhrase(lastMessage.text) // Display only the text of the last message
    } catch (error) {
      console.error('Error fetching last phrase:', error)

      // Handle specific error cases
      if (error.reason) {
        alert(`Failed to fetch the last phrase: ${error.reason}`)
      } else if (error.data?.message) {
        alert(`Failed to fetch the last phrase: ${error.data.message}`)
      } else {
        alert('Failed to fetch the last phrase. Check the console for details.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={fetchLastPhrase}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        disabled={loading}
      >
        {loading ? 'Fetching...' : 'Get Last Phrase'}
      </button>
      {lastPhrase && <p className="mt-4">Last Phrase: {lastPhrase}</p>}
    </div>
  )
}