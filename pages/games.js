import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import { ethers } from 'ethers'
import { hasEthereum } from '../utils/ethereum'
import RockPaperScissors from '../src/artifacts/contracts/RockPaperScissors.sol/RockPaperScissors.json'

export default function Home() {
  const [games, setGames] = useState('');
  let provider;
  let signer;
  let signerAddress;

  useEffect(() => {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    getGames()
  }, [])

  async function getGames() {
    signerAddress = await signer.getAddress();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ROCHAMBEU_ADDRESS, RockPaperScissors.abi, signer)

    try {
      const allGames = await contract.getAvailableGames()
      console.log(allGames, 'allGames')
      setGames(allGames)
    } catch(error) {
      console.log(error, 'error')
    }
  }

  return(
    <div className="max-w-lg mt-36 mx-auto text-center px-4">
      <Head>
        <title>Available Games</title>
        <meta name="description" content="Interact with a simple smart contract from the client-side." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="space-y-8">
        <h1 className="text-4xl font-semibold mb-8">
          Available Games
        </h1>
        <div className="flex w-full space-y-8">
          { games && games.map(game => (
              <div >
                <p>{game}</p>
              </div>
          ))}
        </div>
      </main>
    </div>
  )
}