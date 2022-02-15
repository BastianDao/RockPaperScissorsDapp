const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("RockPaperScissors", function () {
  let gasContract;
  let owner, addr1, addr2, addr3;

  beforeEach(async function() {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
  
    const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");

    rockPaperScissorsContract = await RockPaperScissors.deploy();
    await rockPaperScissorsContract.deployed();
  });

  describe('initiateGame', () => {
    it("succeeds when given correct variables", async function() {
      let createGame = await rockPaperScissorsContract.initiateGame(1,1,owner.address);
      await createGame.wait();

      let initiateGames = await rockPaperScissorsContract.getAvailableGames();
      expect(initiateGames.length).to.equal(1)
    });

    it('fails when an invalid game move is made', async function() {
      await expect(rockPaperScissorsContract.initiateGame(1, 4, owner.address)).to.be.revertedWith("Invalid game move selection")
    });

    it('fails when a polayer has an active game', async function() {
      let createGame = await rockPaperScissorsContract.initiateGame(1,1,owner.address);
      await createGame.wait();

      await expect(rockPaperScissorsContract.initiateGame(1,2,owner.address)).to.be.revertedWith("user is already playing a game");      
    });
  });

  describe("joinAvailableGame", () => {
    it('emits an event declaring a tie', async function() {
      let createGame = await rockPaperScissorsContract.initiateGame(1,1,owner.address);
      await createGame.wait();

      let joinGame = await rockPaperScissorsContract.connect(addr1).joinAvailableGame(0, 1);
      await joinGame.wait();

      expect(joinGame)
      .to.emit(rockPaperScissorsContract, "gameResult")
      .withArgs("0x0000000000000000000000000000000000000000", "Game ended in a tie!");
    });

    it('emits an event declaring a winner', async function() {
      let createGame = await rockPaperScissorsContract.initiateGame(1,1,owner.address);
      await createGame.wait();

      let joinGame = await rockPaperScissorsContract.connect(addr1).joinAvailableGame(0, 0);
      await joinGame.wait();

      expect(joinGame)
      .to.emit(rockPaperScissorsContract, "gameResult")
      .withArgs(owner.address, "Winner was decided!");
    });
  });
});