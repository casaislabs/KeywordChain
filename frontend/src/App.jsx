import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import logo from './assets/logo.svg';
import { ConnectWalletButton } from './components/ConnectWalletButton';
import { GetLastPhraseButton } from './components/GetLastPhraseButton';
import { AddPhraseButton } from './components/AddPhraseButton';
import { contractAddress, contractABI } from './providers/contractConfig';
import { MessageChain } from './components/MessageChain';

function App() {
  const { isConnected } = useAccount();
  const [provider, setProvider] = useState(null);
  const [particlesInit, setParticlesInit] = useState(false);
  const [lastPhrase, setLastPhrase] = useState(null); // Última frase obtenida
  const [addedPhrase, setAddedPhrase] = useState(null); // Última frase añadida
  const [refreshMessages, setRefreshMessages] = useState(false); // Estado para forzar la actualización de mensajes

  // Inicializar partículas
  useEffect(() => {
    const init = async () => {
      try {
        await loadSlim(window.tsParticles);
        setParticlesInit(true);
      } catch (error) {
        console.error('Error al inicializar tsparticles:', error);
      }
    };
    init();
  }, []);

  // Configurar el proveedor de Ethereum
  useEffect(() => {
    if (window.ethereum && isConnected) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    } else {
      setProvider(null);
    }
  }, [isConnected]);

  // Función para obtener la última frase
  const fetchLastPhrase = async () => {
    if (!provider) return;

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const lastMessage = await contract.getLastMessage();
      setLastPhrase(lastMessage.keyword);
    } catch (error) {
      console.error('Error fetching last phrase:', error);
    }
  };

  // Opciones para las partículas de fondo
  const particlesOptions = {
    background: {
      color: {
        value: '#0d1117', // Fondo oscuro para las partículas
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: '#38bdf8', // Azul vibrante para las partículas
      },
      links: {
        color: '#38bdf8',
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'none',
        outModes: {
          default: 'bounce',
        },
      },
      number: {
        value: 80, // Número moderado de partículas
        density: {
          enable: true,
          area: 800,
        },
      },
      opacity: {
        value: 0.6,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 2, max: 6 }, // Tamaño ajustado para mejor visibilidad
      },
    },
    detectRetina: true,
  };

  if (!isConnected) {
    // Mostrar una página dedicada si la wallet no está conectada
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {particlesInit && (
          <Particles
            id="tsparticles"
            options={particlesOptions}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: -1,
            }}
          />
        )}
        <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl shadow-2xl text-center animate-fadeIn border border-gray-700 relative z-10">
          <header className="flex justify-center mb-8">
            <img
              src={logo}
              className="h-16 hover:drop-shadow-[0_0_15px_rgba(14,165,233,0.8)] animate-pulse"
              alt="KeywordChain logo"
            />
          </header>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 mb-6 animate-slideUp">
            Welcome to KeywordChain
          </h1>
          <p className="text-gray-300 text-lg mb-10 animate-fadeIn">
            Please connect your wallet to interact with the blockchain-based message chain.
          </p>
          <ConnectWalletButton />
        </div>
      </div>
    );
  }

return (
  <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 py-16 overflow-auto">
    {/* Partículas de fondo */}
    {particlesInit && (
      <Particles
        id="tsparticles"
        options={particlesOptions}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      />
    )}

    {/* Contenido principal */}
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl shadow-2xl text-center animate-fadeIn border border-gray-700 relative z-10 transform transition-transform hover:scale-105 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <header className="flex justify-between items-center mb-8">
        <a href="/" target="_self" rel="noopener noreferrer">
          <img
            src={logo}
            className="h-16 hover:drop-shadow-[0_0_15px_rgba(14,165,233,0.8)] animate-pulse"
            alt="KeywordChain logo"
          />
        </a>
        <ConnectWalletButton />
      </header>
      <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400 mb-6 animate-slideUp">
        KeywordChain
      </h1>
      <p className="text-gray-300 text-lg mb-10 animate-fadeIn">
        Conecta tu wallet para interactuar con la cadena de mensajes basada en blockchain.
      </p>
      <div className="space-y-8">
        <GetLastPhraseButton provider={provider} onFetchLastPhrase={setLastPhrase} />
        {lastPhrase && (
          <div className="mt-4 p-4 bg-gray-800 text-blue-400 font-bold text-lg rounded-lg shadow-md animate-slideUp">
            Last Keyword: <span className="text-teal-400">{lastPhrase}</span>
          </div>
        )}
        <AddPhraseButton
          provider={provider}
          onPhraseAdded={(phrase, newKeyword) => {
            setAddedPhrase(phrase);
            setLastPhrase(newKeyword);
            setRefreshMessages((prev) => !prev); // Forzar actualización de mensajes
          }}
        />
        {addedPhrase && (
          <div className="mt-4 p-4 bg-gray-800 text-green-400 font-bold text-lg rounded-lg shadow-md animate-slideUp">
            Added Phrase: <span className="text-teal-400">{addedPhrase}</span>
          </div>
        )}
        {/* Mostrar la cadena de mensajes */}
        <MessageChain provider={provider} refresh={refreshMessages} />
      </div>
      <footer className="mt-12 text-gray-500 text-sm">
        © 2025 KeywordChain. Todos los derechos reservados.
      </footer>
    </div>
  </div>
);
}

export default App;