// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";
// import "./RochambeauToken.sol";
import "hardhat/console.sol";

contract RockPaperScissors {
    address public blackHoleAddress = 0x0000000000000000000000000000000000000000;

    uint private _totalGamesStarted;
    enum GameOption { Rock, Paper, Scissors, Invalid } 
    GameOption public choice;

    event testEvent(string _message);
    event gameResult(address _player, string _message);
    event gameInitiated(address _player, string _message);

    struct PlayerGame {
        address player;
        address opponent;
        GameOption playerGuess;
        uint wagerAmount;
        bool started;
        bool finished;
        bool victorious;
    }

    uint public initialSupply = 1000000;

    mapping(address => PlayerGame[]) public games;  //@NOTE: Need to update references to games below to use length to determine most recent game
    PlayerGame[] public playerGames;

    constructor() {}
 
    function initiateGame(uint _bet, uint _playerSelection, address _opponent) public payable {
        // use blackhole address on front end
        uint numberOfGames = games[msg.sender].length;
        uint indexOfArray = numberOfGames > 0 ? games[msg.sender].length - 1 : 0;

        require(numberOfGames == 0 || games[msg.sender][indexOfArray].started == false && games[msg.sender][indexOfArray].finished == false, "user is already playing a game");
        require(_playerSelection <= 2, "Invalid game move selection");

        _totalGamesStarted++;

        PlayerGame memory playerGame = PlayerGame(msg.sender, _opponent, playerSelection(_playerSelection), _bet, true, false, false);
        games[msg.sender].push(playerGame);
        playerGames.push(playerGame);
    }

    function playerSelection(uint _playerSelection) private pure returns (GameOption selectedOption_) {

        if (_playerSelection == 0) {
            selectedOption_ = GameOption.Rock;
        } else if ( _playerSelection == 1) {
            selectedOption_ = GameOption.Paper;
        } else if (_playerSelection == 2) {
            selectedOption_ = GameOption.Scissors;
        }
    }

    function joinAvailableGame(uint _gameToJoinIndex, uint _playerSelection) public payable {
        playerGames[_gameToJoinIndex].opponent = msg.sender;

        initiateGame(msg.value, _playerSelection, playerGames[_gameToJoinIndex].player);
        address winner = decideWinner(playerGames[_gameToJoinIndex].player, msg.sender);

        if (winner == blackHoleAddress) {
            emit gameResult(blackHoleAddress, "Game ended in a tie!");
        } else {
            emit gameResult(winner, "Winner was decided!");
        }
    }

    // AT SOME POINT playerGames should just be games that aren't finished
    function getAvailableGames() public view returns(PlayerGame[] memory){
        return playerGames;
    }

    function decideWinner(address _player1, address _player2) private returns (address winner_) {
        uint numberOfGamesForPlayer1 = games[_player1].length - 1;
        uint numberOfGamesForPlayer2 = games[_player2].length - 1;

        GameOption player1Guess = games[_player1][numberOfGamesForPlayer1].playerGuess;
        GameOption player2Guess = games[_player2][numberOfGamesForPlayer2].playerGuess;
        games[_player1][numberOfGamesForPlayer1].finished = true;
        games[_player2][numberOfGamesForPlayer2].finished = true;

        // Need to mark current game as finished and wipe the struct from playerGames array so we know the player wants to play the next game
        // but we also need to save the struct to reserve the game result
        if (player1Guess == games[_player2][numberOfGamesForPlayer2].playerGuess) {
            winner_ = 0x0000000000000000000000000000000000000000;
        } else {
            if (player1Guess == GameOption.Rock ) {
                if (player2Guess == GameOption.Scissors) {
                    winner_ = _player1;
                } else {
                    winner_ = _player2;
                }
                
            } else if (player1Guess == GameOption.Scissors) {
                if (player2Guess == GameOption.Paper) {
                    winner_ = _player1;
                } else {
                    winner_ = _player2;
                }
            } else {
                if (player2Guess == GameOption.Rock) {
                    winner_ = _player1;
                } else {
                    winner_ = _player2;
                }
            }
        }
    }
}
