import { useState } from 'react'
import { ethers } from 'ethers'
import { contractAddress, contractABI } from '../providers/contractConfig'

export const AddPhraseButton = ({ provider }) => {
  const [phrase, setPhrase] = useState('')
  const [loading, setLoading] = useState(false)

  const addPhrase = async () => {
    if (!provider) {
      alert('Please connect your wallet first.')
      return
    }

    if (!phrase.trim()) {
      alert('Please enter a valid phrase.')
      return
    }

    try {
      setLoading(true)

      // Get the signer from the provider
      const signer = await provider.getSigner()

      // Instantiate the contract with the signer
      const contract = new ethers.Contract(contractAddress, contractABI, signer)

      // Call the addMessage function on the contract
      const tx = await contract.addMessage(phrase)
      await tx.wait() // Wait for the transaction to be confirmed

      alert('Phrase added successfully!')
      setPhrase('') // Clear the input field
    } catch (error) {
      console.error('Error adding phrase:', error)
      alert('Failed to add the phrase. Check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <input
        type="text"
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
        placeholder="Enter your phrase"
        className="px-4 py-2 border rounded w-full mb-4"
      />
      <button
        onClick={addPhrase}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Phrase'}
      </button>
    </div>
  )
}