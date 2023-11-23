// Sound effect initialization
const startSound = new Audio("Sound/Start.mp3");
const hitSound = new Audio("Sound/Hit.mp3");
const moveSound = new Audio("Sound/Move.mp3");

class ChessTile {
  constructor(element, position) {
    this.element = element;
    this.position = position;
    this.tileColor = element.classList.contains("white-tile")
      ? "white-tile"
      : "black-tile";
  }

  setPiece(piece, isPieceMovable) {
    this.element.innerHTML = piece
      ? unicodeChessPiece(piece.color, piece.type)
      : "";
    this.element.className = `tile ${this.tileColor}`;
    this.element.classList.remove(
      "movable-piece",
      "valid-move",
      "invalid-move"
    );
    if (piece && chess.turn() === piece.color) {
      this.element.classList.add("movable-piece");
    }
  }
}

class ChessBoard {
  constructor(chess) {
    this.chess = chess;
    this.tiles = [];
    this.createBoard();
  }

  createBoard() {
    const boardElement = document.getElementById("chessboard");
    boardElement.innerHTML = "";
    for (let i = 0; i < 64; i++) {
      const tileElement = document.createElement("div");
      tileElement.classList.add(
        "tile",
        (Math.floor(i / 8) + i) % 2 === 0 ? "white-tile" : "black-tile"
      );
      const tile = new ChessTile(tileElement, toNotation(i));
      tileElement.addEventListener("click", () => this.movePiece(tile));
      this.tiles.push(tile);
      boardElement.appendChild(tileElement);
    }
    this.updateBoard();
  }

  updateBoard() {
    const boardState = this.chess.board();
    for (let i = 0; i < this.tiles.length; i++) {
      const piece = boardState[Math.floor(i / 8)][i % 8];
      this.tiles[i].setPiece(piece, chess.turn() === piece?.color);
    }
    this.clearHighlights();
  }

  movePiece(tile) {
    if (selectedPiece) {
      const move = {
        from: selectedPiece.position,
        to: tile.position,
        promotion: "q", // Handle pawn promotion to queen
      };

      const moveResult = this.chess.move(move);
      if (moveResult) {
        this.updateBoard();
        this.updateTurnIndicator();

        if (moveResult.captured) {
          hitSound.play(); // Play sound for capture
        } else {
          moveSound.play(); // Play sound for normal move
        }
      }

      selectedPiece = null;
      this.clearHighlights();
    } else if (
      this.chess.get(tile.position) &&
      this.chess.get(tile.position).color === this.chess.turn()
    ) {
      selectedPiece = tile;
      this.highlightMoves(selectedPiece.position);
    }
  }

  highlightMoves(fromSquare) {
    const validMoves = this.chess.moves({ square: fromSquare, verbose: true });
    this.tiles.forEach((tile) => {
      tile.element.classList.remove("valid-move", "invalid-move");
      if (validMoves.some((move) => move.to === tile.position)) {
        tile.element.classList.add("valid-move");
      } else {
        tile.element.classList.add("invalid-move");
      }
    });
  }

  clearHighlights() {
    this.tiles.forEach((tile) => {
      tile.element.classList.remove("valid-move", "invalid-move");
    });
  }

  updateTurnIndicator() {
    const gameStatus = document.getElementById("game-status");
    if (this.chess.in_checkmate()) {
      // Checkmate
      gameStatus.innerText = "Checkmate!";
      gameStatus.classList.add("highlight-checkmate");
    } else if (this.chess.in_check()) {
      // Check
      gameStatus.innerText = "Check!";
      gameStatus.classList.add("highlight-check");
    } else if (!this.chess.game_over()) {
      const turnColor = this.chess.turn() === "w" ? "White's" : "Black's";
      document.getElementById("turn-indicator").innerText = `${turnColor} Turn`;
      gameStatus.innerText = ""; // Clear status
      gameStatus.className = ""; // Clear status styles
    }
  }
}

let selectedPiece = null;

function toNotation(index) {
  const file = "abcdefgh"[index % 8];
  const rank = 8 - Math.floor(index / 8);
  return file + rank;
}

function unicodeChessPiece(color, type) {
  const unicodePieces = {
    w: {
      k: "\u2654",
      q: "\u2655",
      r: "\u2656",
      b: "\u2657",
      n: "\u2658",
      p: "\u2659",
    },
    b: {
      k: "\u265A",
      q: "\u265B",
      r: "\u265C",
      b: "\u265D",
      n: "\u265E",
      p: "\u265F",
    },
  };
  const pieceChar = unicodePieces[color][type];
  const pieceClass = color === "w" ? "white-piece" : "black-piece";
  return `<span class="${pieceClass}">${pieceChar}</span>`;
}

const chess = new Chess();
const chessBoard = new ChessBoard(chess);

const gameStatus = document.getElementById("game-status"); // Assuming you have this element in your HTML
gameStatus.style.display = "none";

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", () => {
  chess.reset();
  chessBoard.updateBoard();
  chessBoard.updateTurnIndicator();
  startButton.innerText = "Restart Game";
  startSound.play(); // Play start sound

  // Show turn indicator and good luck message
  document.getElementById("turn-indicator").style.display = "block";
  document.getElementById("good-luck-message").style.display = "block";
  setTimeout(() => {
    document.getElementById("good-luck-message").style.display = "none";
  }, 3000); // Hide good luck message after some time
});
