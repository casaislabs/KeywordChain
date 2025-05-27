import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

const chains = [sepolia]

export const wagmiConfig = getDefaultConfig({
  appName: import.meta.env.VITE_APP_NAME || 'KeywordChain',
  projectId: import.meta.env.VITE_PROJECT_ID,
  chains,
  autoConnect: true,
  ssr: false,
})

export { chains }