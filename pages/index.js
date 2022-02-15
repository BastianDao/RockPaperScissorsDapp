import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { ethers } from 'ethers'
import { hasEthereum } from '../utils/ethereum'
import RockPaperScissors from '../src/artifacts/contracts/RockPaperScissors.sol/RockPaperScissors.json'

export default function Home() {
  const [greeting, setGreetingState] = useState('')
  const newGreetingInputRef = useRef();
  const [newGreeting, setNewGreetingState] = useState('')
  const [newGreetingMessage, setNewGreetingMessageState] = useState('')

  const [initiateGame, setInitiateGame] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddressState] = useState('')
  const [availableGames, setAvailableGames] = useState('')
  const [betAmount, setBetAmount] = useState('');
  const [gameMove, setGameMove] = useState('');

  // If wallet is already connected...
  useEffect( () => {
    if(! hasEthereum()) {
      setConnectedWalletAddressState(`MetaMask unavailable`)
      return
    }
    async function setConnectedWalletAddress() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      try {
        const signerAddress = await signer.getAddress()
        console.log(signerAddress, 'signerAddress')
        setConnectedWalletAddressState(`Connected wallet: ${signerAddress}`)
      } catch {
        setConnectedWalletAddressState('No wallet connected')
        return;
      }
    }
    setConnectedWalletAddress();
  },[])
  
  // Request access to MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' } )
  }

  // Call smart contract, fetch current value
  async function fetchGreeting() {
    if ( ! hasEthereum() ) {
      setConnectedWalletAddressState(`MetaMask unavailable`)
      return
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ROCHAMBEU_ADDRESS, RockPaperScissors.abi, provider)
    try {
      const data = await contract.greet()
      setGreetingState(data)
    } catch(error) {
      console.log(error)
    }
  }

  // Fetch currently available games
  async function fetchAvailableGames() {
    console.log(window.ethereum, 'window.eth')
    await requestAccount()
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress()
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ROCHAMBEU_ADDRESS, RockPaperScissors.abi, provider)

    try {
      console.log(contract, 'contract')
      const availableGames = await contract.getAvailableGames();
      console.log(availableGames, 'availbleGames')
      setAvailableGames(availableGames)
    } catch(error) {
      console.log(error);
    }
  }

  async function connectWallet() {
    if (!hasEthereum()) {
      setConnectedWalletAddressState(`MetaMask unavailable`)
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    console.log(signer, 'signer')
    const signerAddress = await signer.getAddress()
    setConnectedWalletAddressState(`Connected wallet: ${signerAddress}`)
  }

  async function createGame() {
    if (!hasEthereum()) {
      setConnectedWalletAddressState(`MetaMask unavailable`)
      return
    }
    console.log(betAmount, '/', gameMove)
    if (!betAmount || !gameMove) {
      console.log("make a selection and/or bet")
      return
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress()
    console.log(signer, 'signer')
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ROCHAMBEU_ADDRESS, RockPaperScissors.abi, signer)
    const blackHoleAddress = '0x0000000000000000000000000000000000000000'
    console.log(betAmount, gameMove, "before the TRY")
    try { 
      await contract.initiateGame(betAmount, gameMove, blackHoleAddress)
    } catch(error) {
      console.log(error, "ERROR CREATING GAME")
    }
  }

  function handleChange(event) {
    console.log(event.target.value, 'value')
    setBetAmount(event.target.value)
  }

  function handleSelectChange(event) {
    console.log(event.target.value, 'value')
    setGameMove(event.target.value)
  }

  // // Call smart contract, set new value
  // async function setGreeting() {
  //   if ( ! hasEthereum() ) {
  //     setConnectedWalletAddressState(`MetaMask unavailable`)
  //     return
  //   }
  //   if(! newGreeting ) {
  //     setNewGreetingMessageState('Add a new greeting first.')
  //     return
  //   }
  //   await requestAccount()
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const signer = provider.getSigner()
  //   const signerAddress = await signer.getAddress()
  //   setConnectedWalletAddressState(`Connected wallet: ${signerAddress}`)
  //   const contract = new ethers.Contract(process.env.NEXT_PUBLIC_GREETER_ADDRESS, Greeter.abi, signer)
  //   const transaction = await contract.setGreeting(newGreeting)
  //   await transaction.wait()
  //   setNewGreetingMessageState(`Greeting updated to ${newGreeting} from ${greeting}.`)
  //   newGreetingInputRef.current.value = ''
  //   setNewGreetingState('')
  // }

  return (
    <div className="max-w-lg mt-36 mx-auto text-center px-4">
      <Head>
        <title>Rock, Paper, Scissors</title>
        <meta name="description" content="Interact with a simple smart contract from the client-side." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="space-y-8">
        { !process.env.NEXT_PUBLIC_ROCHAMBEU_ADDRESS ? (
            <p className="text-md">
              Please add a value to the <pre>NEXT_PUBLIC_ROCHAMBEU_ADDRESS</pre> environment variable.
            </p>
        ) : (
          <>
            <h1 className="text-4xl font-semibold mb-8">
              Rock, Paper, Scissors!
            </h1>

            {<div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md"
                onClick={() => connectWallet()}
              >
                Connect Wallet
              </button>
            </div>}

            <div className="space-y-8">
                <div className="flex flex-col space-y-4">
                  <Link href="/games">
                    <a>Available Games</a>
                  </Link>
                </div>
                <div className="space-y-8">
                  <div className="flex flex-col space-y-4">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-md"
                      onClick={() => setInitiateGame(!initiateGame)}
                    >
                      Initiate New Game
                    </button>
                  </div>
                </div>
                <div>
                    {initiateGame && 
                    <div className="flex w-full space-y-8">
                      <div className="w-full max-w-2xl px-5 py-10 m-auto mt-10 bg-white rounded-lg shadow dark:bg-gray-800">
                        <div className="mb-6 text-3xl font-light text-center text-gray-800 dark:text-white">
                            Start a game!
                        </div>
                        <div className="grid max-w-xl grid-cols-2 gap-4 m-auto">
                          <div className="col-span-2 lg:col-span-1">
                            <div className=" relative ">
                              <input onChange={handleChange} type="text" id="contact-form-bet" className="rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="Bet"/>
                            </div>
                        </div>
                      <div className="col-span-2 lg:col-span-1">
                          <div className=" relative ">
                            <select onChange={handleSelectChange} className="block text-gray-700 w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" name="game-moves">
                                <option value="">
                                    Select an option
                                </option>
                                <option value='0'>
                                    Rock
                                </option>
                                <option value="1">
                                    Paper
                                </option>
                                <option value="2">
                                    Scissors
                                </option>

                            </select>
                          </div>
                          </div>
          
                          <div className="col-span-2 text-right">
                              <button onClick={() => createGame()} className="py-2 px-4  bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
                                  Send
                              </button>
                          </div>
                        </div>
                      </div>
                    </div>}
                </div>

                <div className="h-4">
                  { connectedWalletAddress && <p className="text-md">{connectedWalletAddress}</p> }
                </div>
            </div>
          </>
        ) }
      </main>

      <footer className="mt-20">
        <a
          href="https://github.com/tomhirst/solidity-nextjs-starter/blob/main/README.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700"
        >
          Read the docs
        </a>
      </footer>
    </div>
  )
}
