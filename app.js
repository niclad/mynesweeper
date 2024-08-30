/**
 * Minesweeper game
 * @file app.js
 * @version 1.0.0
 * @since 1.0.0
 * @description The Minesweeper game
 * @license MIT
 * @see
 * - [Minesweeper](https://en.wikipedia.org/wiki/Minesweeper_(video_game))
 * - [Flood Fill Algorithm](https://en.wikipedia.org/wiki/Flood_fill)
 *
 * @todo
 * - Add a timer
 * - Add a reset button
 * - Add a settings button
 * - Add a game over screen
 * - Add a win screen
 * - Add a flag/mine counter
 * - Possibly calculate the cell's values when they are clicked
 *   - (should kind of obfuscate the board a bit more)
 */

/** Settings for a hard game */
const HARD_SETTINGS = {
  rows: 16,
  cols: 30,
  mines: 99,
};

/** Settings for a medium game */
const MEDIUM_SETTINGS = {
  rows: 16,
  cols: 16,
  mines: 40,
};

/** Settings for an easy game */
const EASY_SETTINGS = {
  rows: 9,
  cols: 9,
  mines: 10,
};

/** Game difficulty options */
const DIFFICULTY_SETTINGS = {
  easy: EASY_SETTINGS,
  medium: MEDIUM_SETTINGS,
  hard: HARD_SETTINGS,
};

/** The key for the saved game difficulty */
const DIFF_KEY = "mynesweeper-difficulty";

/**
 * The selected game difficulty.
 * @type {'easy' | 'medium' | 'hard'}
 */
let selected = getDifficulty();

/** @type {Minesweeper} */
let game;

/**
 * Set the `selected` exclusively to the element.
 * @param {HTMLButtonElement} el
 */
function setSelected(btnEl) {
  // set the `selected` class to the element
  const classes = btnEl.getAttribute("class");
  btnEl.setAttribute("class", classes + " selected");
  selected = btnEl.getAttribute("id");
  saveDifficulty();

  // remove the `selected` class from the other buttons
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    if (button !== btnEl) {
      button.setAttribute("class", "btn");
    }
  });

  // set the game boards size
  setBoardSize();
  buildBoard();

  const { rows, cols, mines } = DIFFICULTY_SETTINGS[selected];
  game = new Minesweeper(rows, cols, mines);
}

/**
 * Calculate the game board dimensions based on the selected difficulty.
 * @returns {{ height: number; width: number; }}
 */
function numCells() {
  const cellWidth = 32; // px
  const cellHeight = 32; // px
  let { rows, cols } = calculateFullBoardSize();

  return {
    height: rows * cellHeight,
    width: cols * cellWidth,
  };
}

/** Set the game board's size */
function setBoardSize() {
  const { height, width } = numCells();
  const board = document.querySelector("#board");
  board.style.height = `${height}px`;
  board.style.width = `${width}px`;
}

/**
 * Build the game board.
 */
function buildBoard() {
  // get and correct the game board dimensions
  let { rows, cols } = calculateFullBoardSize();

  const board = document.querySelector("#board");
  board.innerHTML = "";
  for (let i = 0; i < rows; i++) {
    const row = document.createElement("div");
    row.setAttribute("class", "row");
    for (let j = 0; j < cols; j++) {
      let cell = document.createElement("div");
      cell = setCellClass(i, j, cell);

      row.appendChild(cell);
    }
    board.appendChild(row);
  }
}

/**
 * Set the class on the row element.
 * @param {number} row
 * @param {number} col
 * @param {HTMLDivElement} cell
 */
function setCellClass(row, col, cell) {
  const { rows, cols } = calculateFullBoardSize();
  const topRow = 0;
  const middleRow = 2;
  const bottomRow = rows - 1;
  const leftCol = 0;
  const rightCol = cols - 1;

  // handling borders...
  // top left corner
  if (row === topRow && col === leftCol) {
    cell.setAttribute("class", "cell tl-corner");
    return cell;
  }

  // top right corner
  if (row === topRow && col === rightCol) {
    cell.setAttribute("class", "cell tr-corner");
    return cell;
  }

  // T-border on left border
  if (row === middleRow && col === leftCol) {
    cell.setAttribute("class", "cell lt-border");
    return cell;
  }

  // T-border on right border
  if (row === middleRow && col === rightCol) {
    cell.setAttribute("class", "cell rt-border");
    return cell;
  }

  // bottom left corner
  if (row === bottomRow && col === leftCol) {
    cell.setAttribute("class", "cell bl-corner");
    return cell;
  }

  // bottom right corner
  if (row === bottomRow && col === rightCol) {
    cell.setAttribute("class", "cell br-corner");
    return cell;
  }

  // left/right border
  if (col === leftCol || col === rightCol) {
    cell.setAttribute("class", "cell v-border");
    return cell;
  }

  // top/middle/bottom border
  if (row === topRow || row === middleRow || row === bottomRow) {
    cell.setAttribute("class", "cell h-border");
    return cell;
  }

  // handling timer...
  const timeRow = topRow + 1;
  if (row === timeRow) {
    return buildTimeRow(col, cell);
  }

  // handle all others
  cell.setAttribute("class", "cell closed");
  const id = `${row - (middleRow + 1)}-${col - (leftCol + 1)}`;
  cell.setAttribute("id", id);
  return cell;
}

/**
 * Set the class on the row element.
 * @param {number} col - The column index
 * @returns {HTMLDivElement} The time row cell element
 */
function buildTimeRow(col, cell) {
  const { cols: boardWidth } = calculateFullBoardSize();
  const minesHundreds = 1;
  const minesTens = 2;
  const minesOnes = 3;
  const timeHundreds = boardWidth - 4;
  const timeTens = boardWidth - 3;
  const timeOnes = boardWidth - 2;
  const gameBtn = Math.floor(boardWidth / 2);

  const valTextSpan = document.createElement("span");
  valTextSpan.setAttribute("class", "val-text");
  cell.appendChild(valTextSpan);

  const mines = DIFFICULTY_SETTINGS[selected].mines;

  if (col === minesHundreds) {
    cell.setAttribute("class", "mines-hundreds time");
    const numHundreds = Math.floor(mines / 100);
    cell.childNodes[0].innerHTML = numHundreds;
  }

  if (col === minesTens) {
    cell.setAttribute("class", "mines-tens time");
    const numTens = Math.floor(mines / 10) % 10;
    cell.childNodes[0].innerHTML = numTens;
  }

  if (col === minesOnes) {
    cell.setAttribute("class", "mines-ones time");
    const numOnes = mines % 10;
    cell.childNodes[0].innerHTML = numOnes;
  }

  if (col === timeHundreds) {
    cell.setAttribute("class", "time-hundreds time");
    const numHundreds = 0;
    cell.childNodes[0].innerHTML = numHundreds;
  }

  if (col === timeTens) {
    cell.setAttribute("class", "time-tens time");
    const numTens = 0;
    cell.childNodes[0].innerHTML = numTens;
  }

  if (col === timeOnes) {
    cell.setAttribute("class", "time-ones time");
    const numOnes = 0;
    cell.childNodes[0].innerHTML = numOnes;
  }

  if (col === gameBtn) {
    cell.setAttribute("class", "game-btn closed");
    cell.innerHTML = "😃";
  }

  let currClass = cell.getAttribute("class");
  if (currClass === null) {
    currClass = "spacer";
  }

  cell.setAttribute("class", `cell  ${currClass}`);

  return cell;
}

/**
 * Get the total board size
 * @returns {{ rows: number; cols: number; }}
 */
function calculateFullBoardSize() {
  let { rows, cols } = DIFFICULTY_SETTINGS[selected];
  rows += 4; // top, middle, bottom, and score board rows
  cols += 2; // left and right border columns
  return { rows, cols };
}

/**
 * Get the saved game's difficulty.
 * Defaults to 'easy' if none is saved.
 */
function getDifficulty() {
  const saved = localStorage.getItem(DIFF_KEY);
  console.debug("saved", saved);
  return saved ?? "easy";
}

/**
 * Save the game's difficulty.
 * @param {'easy' | 'medium' | 'hard'} [difficulty]
 */
function saveDifficulty(difficulty) {
  if (difficulty) {
    localStorage.setItem(DIFF_KEY, difficulty);
    return;
  }
  localStorage.setItem(DIFF_KEY, selected);
}

document.addEventListener("DOMContentLoaded", () => {
  setUIDifficulty();
});

function setUIDifficulty() {
  const btnEl = document.getElementById(selected);
  setSelected(btnEl);
}

class Minesweeper {
  /** @type {number} */
  rows;

  /** @type {number} */
  cols;

  /** @type {number} */
  mines;

  /** @type {Cell[][]} */
  board;

  /** @type {number} */
  numFlags = 0;

  /** @type {TimeRow} Time row control */
  timeRow;

  /** @type {boolean} */
  isRunning = false;

  constructor(rows, cols, mines) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.board = this.createBoard();
    this.placeMines();
    this.setCellVals();
    this.timeRow = new TimeRow();
  }

  /**
   * Initialize the cells for the playable gameboard
   */
  createBoard() {
    let board = [];
    for (let i = 0; i < this.rows; i++) {
      let row = [];
      for (let j = 0; j < this.cols; j++) {
        row.push(new Cell(i, j));
      }
      board.push(row);
    }
    return board;
  }

  /**
   * Place the mines under random cells
   */
  placeMines() {
    let minesPlaced = [];
    while (minesPlaced.length < this.mines) {
      let row = Math.floor(Math.random() * this.rows);
      let col = Math.floor(Math.random() * this.cols);

      if (!minesPlaced.includes(`${row}-${col}`)) {
        minesPlaced.push(`${row}-${col}`);
        this.board[row][col].setMine();
      }
    }
  }

  /**
   * Check adjacent cells for mines
   * @param {number} row - The row of the cell
   * @param {number} col - The column of the cell
   * @returns {number} The number of mines adjacent to this cell
   */
  checkAdjacentMines(row, col) {
    let count = 0;
    for (let i = row - 1; i <= row + 1; i++) {
      if (!this.isInRowLimit(i)) continue;
      for (let j = col - 1; j <= col + 1; j++) {
        if (!this.isInColLimit(j)) if (i === row && j === col) continue;

        if (this.board[i] && this.board[i][j] && this.board[i][j].isMine) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Set the adjacent mine count for all the cells
   */
  setCellVals() {
    for (let row of this.board) {
      for (let cell of row) {
        if (cell.isMine) continue;

        cell.adjMineCount = this.checkAdjacentMines(cell.row, cell.col);
      }
    }
  }

  /**
   * Open the cells adjacent to the given cell
   * @param {number} row
   * @param {number} col
   */
  openAdjacentCells(row, col) {
    // verify the surrounding cells can be opened
    if (!this.canOpenAdjacentCells(row, col)) return;

    for (let i = row - 1; i <= row + 1; i++) {
      if (!this.isInRowLimit(i)) continue;
      for (let j = col - 1; j <= col + 1; j++) {
        if (!this.isInColLimit(j)) continue;
        if (this.board[i][j].isFlagged) continue;
        this.board[i][j].setOpen(true);
      }
    }
  }

  /**
   * Check if this cell meets the requirements to open its neighbors
   */
  canOpenAdjacentCells(row, col) {
    return (
      this.board[row][col].isOpen &&
      !this.board[row][col].isFlagged &&
      this.countAdjFlags(row, col) === this.board[row][col].adjMineCount
    );
  }

  /**
   * Count the number of adjacent flags
   * @param {number} row - The row index
   * @param {number} col - The column index
   * @returns {number} - The number of adjacent flags
   */
  countAdjFlags(row, col) {
    let count = 0;
    for (let i = row - 1; i <= row + 1; i++) {
      if (!this.isInRowLimit(i)) continue;
      for (let j = col - 1; j <= col + 1; j++) {
        if (!this.isInColLimit(j)) continue;
        if (this.board[i][j].isFlagged) count++;
      }
    }
    return count;
  }

  /**
   * Check if the row is in the board limits
   * @param {number} row - The row index
   * @returns {boolean} - If the row is in the board limits
   */
  isInRowLimit(row) {
    return row >= 0 && row < this.rows;
  }

  /**
   * Check if the column is in the board limits
   * @param {number} col - The column index
   * @returns {boolean} - If the column is in the board limits
   */
  isInColLimit(col) {
    return col >= 0 && col < this.cols;
  }

  /**
   * Reveal all mine cells
   */
  revealAllMines() {
    for (let row of this.board) {
      for (let cell of row) {
        if (cell.isMine && !cell.isOpen) {
          cell.setOpen();
        }
      }
    }
    this.onGameOver();
  }

  disableAllCells() {
    for (let row of this.board) {
      for (let cell of row) {
        cell.removeHandlers();
      }
    }
  }

  /**
   * Open the adjacent cells until a cell with adjacent mines is found.
   * (Flood Fill algorithm)
   * @param {number} row
   * @param {number} col
   */
  floodFillCells(row, col) {
    const cellQueue = [];
    cellQueue.push(this.board[row][col]);
    while (cellQueue.length > 0) {
      const cell = cellQueue.shift();
      const { row, col } = cell;
      if (cell.adjMineCount > 0) {
        cell.setOpen();
        continue;
      }

      for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
          if (i === row && j === col) continue;
          if (this.board[i] && this.board[i][j] && !this.board[i][j].isOpen) {
            cellQueue.push(this.board[i][j]);
            this.board[i][j].setOpen();
          }
        }
      }
    }
  }

  /**
   * Get the cell with the given id
   * @param {string} id
   * @returns {Cell} - The cell at the given id
   */
  getCell(id) {
    const [row, col] = id.split("-").map(Number);
    return this.board[row][col];
  }

  /**
   * Adjust the flag count
   * @param {boolean} inc - If the flag count should be incremented
   */
  incFlags(inc) {
    if (inc) {
      this.numFlags++;
    } else {
      this.numFlags--;
    }

    this.timeRow.setMines(this.mines - this.numFlags);
  }

  /**
   * Check if the game is won
   * @returns {boolean} - If the game is won
   */
  checkWin() {
    let closedCells = document.querySelectorAll(".closed");
    const numClosed = closedCells.length;

    return numClosed === this.mines && this.numFlags === this.mines;
  }

  /**
   * Set the end-of-game state, regardless of win or loss.
   */
  onGameOver() {
    this.isRunning = false;

    console.debug("Game over!");
    for (let row of this.board) {
      for (let cell of row) {
        const currClass = cell.ref.getAttribute("class");
        cell.ref.setAttribute("class", `${currClass} no-click`);
      }
    }

    if (this.checkWin()) {
      console.debug("You win!");
      this.timeRow.setFace("😎");
    } else {
      console.debug("You lose!");
      this.timeRow.setFace("💀");
    }
  }

  /**
   * Press the neighbors of the given cell
   * @param {number} row
   * @param {number} col
   */
  pressNeighbors(row, col) {
    for (let i = row - 1; i <= row + 1; i++) {
      if (!this.isInRowLimit(i)) continue;
      for (let j = col - 1; j <= col + 1; j++) {
        if (!this.isInColLimit(j)) continue;
        const cell = this.board[i][j];
        if (!cell.isOpen && !cell.isFlagged) {
          cell.open();
        }
      }
    }
  }

  closeNeighbors(row, col) {
    for (let i = row - 1; i <= row + 1; i++) {
      if (!this.isInRowLimit(i)) continue;
      for (let j = col - 1; j <= col + 1; j++) {
        if (!this.isInColLimit(j)) continue;
        const cell = this.board[i][j];
        if (!cell.isOpen && !cell.isFlagged) {
          cell.close();
        }
      }
    }
  }
}

class Cell {
  /** @type {number} Row location */
  row;

  /** @type {number} Column location (or the location in row) */
  col;

  /** @type {boolean} Mine state */
  isMine;

  /** @type {number} Mines directly adjacent to this cell */
  adjMineCount;

  /** @type {boolean} Open state */
  isOpen;

  /** @type {boolean} Flag state */
  isFlagged;

  /** @type {HTMLElement} Reference to the cell in the DOM  */
  ref;

  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isOpen = false;
    this.isFlagged = false;
    this.ref = document.getElementById(`${row}-${col}`);
    this.setHandlers();
  }

  /**
   * Set this cell as a mine.
   */
  setMine() {
    this.isMine = true;
  }

  /**
   * Set a flag on this cell.
   */
  setFlag() {
    if (this.isOpen) return;

    this.isFlagged = !this.isFlagged;

    if (this.isFlagged) {
      const valTextSpan = document.createElement("span");
      valTextSpan.setAttribute("class", "val-text");
      valTextSpan.innerHTML = "🚩";
      this.ref.appendChild(valTextSpan);
    } else {
      this.ref.removeChild(this.ref.childNodes[0]);
    }

    game.incFlags(this.isFlagged);
  }

  /**
   * Open this cell
   * @param {boolean} isClicked - if this cell was clicked
   */
  setOpen(isClicked = false) {
    if (this.isFlagged) return;

    if (!this.isOpen) {
      this.setInnerText();
    }

    this.isOpen = true;

    if (this.isMine) {
      this.handleMine(isClicked);
      return;
    }

    this.ref.setAttribute("class", `cell open open${this.adjMineCount}`);

    if (isClicked && this.adjMineCount === 0) {
      game.floodFillCells(this.row, this.col);
    }

    if (game.checkWin() && isClicked) {
      game.onGameOver();
    }
  }

  /**
   * Set the cell to "open", keeping it's value hidden.
   */
  open() {
    this.ref.setAttribute("class", "cell open");
  }

  /**
   * Set the cell to "closed"
   */
  close() {
    this.ref.setAttribute("class", "cell closed");
  }

  /**
   * Handle the cell being a mine
   * @param {boolean} isClicked - if this mine was clicked
   */
  handleMine(isClicked) {
    this.ref.setAttribute(
      "class",
      `cell open${isClicked ? " bomb-clicked" : ""}`
    );

    // game over
    if (isClicked) {
      game.revealAllMines();
    }
  }

  /**
   * Set the inner text of the cell.
   */
  setInnerText() {
    const valTextSpan = document.createElement("span");
    valTextSpan.setAttribute("class", "val-text");

    if (this.isMine) {
      valTextSpan.innerHTML = "💣";
    } else if (this.adjMineCount > 0) {
      valTextSpan.innerHTML = this.adjMineCount;
    }

    this.ref.appendChild(valTextSpan);
  }

  setAdjMineCount(count) {
    this.adjMineCount = count;
  }

  setHandlers() {
    this.ref.addEventListener("mouseup", this.mouseUpHandler.bind(this));
    this.ref.addEventListener("mousedown", this.mouseDownHandler.bind(this));
    this.ref.addEventListener("mouseenter", this.mouseEnterHandler.bind(this));
    this.ref.addEventListener("mouseleave", this.mouseLeaveHandler.bind(this));
    this.ref.addEventListener("contextmenu", this.contextMenuHandler);
  }

  removeHandlers() {
    this.ref.removeEventListener("mouseup", this.mouseUpHandler);
  }

  /**
   * Handle mouse up event.
   * @param {MouseEvent} e
   */
  mouseUpHandler(e) {
    e.preventDefault();

    // set the face back to normal
    game.timeRow.setFace("😀");

    // if the game is not running, start it
    if (e.button === 0 || e.button === 1 || e.button === 2) {
      if (!game.isRunning) {
        game.isRunning = true;
        game.timeRow.startTimer();
      }
    }

    if (e.button === 2) {
      this.setFlag();
    }

    if (e.button === 1) {
      game.closeNeighbors(this.row, this.col);
      game.openAdjacentCells(this.row, this.col);
    }

    if (this.isFlagged) {
      return;
    }

    if (e.button === 0) {
      this.setOpen(true);
    }
  }

  mouseDownHandler(e) {
    game.timeRow.setFace("😮");

    if (e.button === 0 && !this.isOpen) {
      this.open();
    }

    if (e.button === 1) {
      if (!this.isOpen) {
        this.open();
      }
      game.pressNeighbors(this.row, this.col);
    }
  }

  mouseEnterHandler(e) {
    e.preventDefault();
    /**
     * e.buttons values
     * 0 - no buttons
     * 1 - left button
     * 2 - right button
     * 4 - middle button
     */

    if (
      (e.buttons === 1 || e.buttons === 4) &&
      !this.isFlagged
    ) {
      if (!this.isOpen) {
        this.open();
      }
      if (e.buttons === 4) {
        game.pressNeighbors(this.row, this.col);
      }
    }
  }

  mouseLeaveHandler(e) {
    e.preventDefault();

    if (!this.isFlagged) {
      if (!this.isOpen) {
        this.close();
      }

      if (e.buttons === 4) {
        game.closeNeighbors(this.row, this.col);
      }
    }
  }

  /**
   * Handle when the right mouse button is clicked.
   * @param {MouseEvent} e - The mouse event
   */
  contextMenuHandler(e) {
    e.preventDefault();
  }
}

class TimeRow {
  /** @type {HTMLDivElement} - Mines hundreds count */
  mhRef;

  /** @type {HTMLDivElement} - Mines tens count */
  mtRef;

  /** @type {HTMLDivElement} - Mines ones count */
  moRef;

  /** @type {HTMLDivElement} - Time hundreds count */
  thRef;

  /** @type {HTMLDivElement} - Time tens count */
  ttRef;

  /** @type {HTMLDivElement} - Time ones count */
  toRef;

  /** @type {HTMLDivElement} - Game control button count */
  gbRef;

  /** @type {number} - Game start time */
  startTime;

  /** @type {number} - Timer interval ID */
  timerInterval;

  constructor() {
    this.mhRef = document.querySelector(".mines-hundreds");
    this.mtRef = document.querySelector(".mines-tens");
    this.moRef = document.querySelector(".mines-ones");
    this.thRef = document.querySelector(".time-hundreds");
    this.ttRef = document.querySelector(".time-tens");
    this.toRef = document.querySelector(".time-ones");
    this.gbRef = document.querySelector(".game-btn");

    this.gbRef.addEventListener("click", (_) => {
      this.restartGame();
    });
  }

  /**
   * Set the number of mines left.
   * @param {number} num - The number of mines left. AKA the inverse of the number of flags.
   */
  setMines(num) {
    this.mhRef.childNodes[0].innerHTML = Math.floor(num / 100);
    this.mtRef.childNodes[0].innerHTML = Math.floor(num / 10) % 10;
    this.moRef.childNodes[0].innerHTML = num % 10;
  }

  /**
   * Get the current time in seconds.
   * @returns {number} The current time in seconds, rounded down.
   */
  nowSeconds() {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Start the game's timer
   */
  startTimer() {
    this.startTime = this.nowSeconds();
    this.timerInterval = setInterval(() => {
      const deltaTime = this.nowSeconds() - this.startTime;

      // don't let the timer go over 999 seconds
      if (deltaTime > 999) {
        clearInterval(this.timerInterval);
        return;
      }

      this.setTime(deltaTime);
    }, 1000);
  }

  /**
   * The number of seconds that have passed.
   * @param {number} secs
   */
  setTime(secs) {
    this.thRef.childNodes[0].innerHTML = Math.floor(secs / 100);
    this.ttRef.childNodes[0].innerHTML = Math.floor(secs / 10) % 10;
    this.toRef.childNodes[0].innerHTML = secs % 10;
  }

  setMH(num) {
    this.mhRef.childNodes[0].innerHTML = num;
  }

  setMT(num) {
    this.mtRef.childNodes[0].innerHTML = num;
  }

  setMO(num) {
    this.moRef.childNodes[0].innerHTML = num;
  }

  setTH(num) {
    this.thRef.childNodes[0].innerHTML = num;
  }

  setTT(num) {
    this.ttRef.childNodes[0].innerHTML = num;
  }

  setTO(num) {
    this.toRef.childNodes[0].innerHTML = num;
  }

  /**
   *
   * @param {'😀' | '😎' | '💀' | '😮'} face
   */
  setFace(face) {
    this.gbRef.innerHTML = face;
  }

  /**
   * Restart the game
   */
  restartGame() {
    clearInterval(this.timerInterval);
    setUIDifficulty();
    this.setFace("😃");
  }
}

document.addEventListener("mousedown", (e) => {
  if (e.button === 1) {
    e.preventDefault();
    return false;
  }
});

document.addEventListener("mouseup", (e) => {
  if (e.button === 1) {
    e.preventDefault();
    return false;
  }
});
