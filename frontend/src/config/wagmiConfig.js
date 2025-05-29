import { createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { http } from 'wagmi';

// Leer las variables de entorno
const infuraProjectId = import.meta.env.VITE_INFURA_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [new injected()], // Asegúrate de que el conector esté correctamente instanciado
  transports: {
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${infuraProjectId}`),
  },
});