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
      // cell.innerHTML = `${i},${j}`;

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
    cell.setAttribute("class", "cell time");
    return cell;
  }

  // handle all others
  cell.setAttribute("class", "cell closed");
  const id = `${row - (middleRow + 1)}-${col - (leftCol + 1)}`;
  cell.setAttribute("id", id);
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
  const { rows, cols, mines } = DIFFICULTY_SETTINGS[selected];
  game = new Minesweeper(rows, cols, mines);
});

function setUIDifficulty() {
  const btnEl = document.getElementById(selected);
  setSelected(btnEl);
}

class Minesweeper {
  constructor(rows, cols, mines) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.board = this.createBoard();
    this.placeMines();
    this.setCellVals();
  }

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

  placeMines() {
    let minesPlaced = [];
    let tempX = 0;
    let tempY = 0;
    while (minesPlaced.length < this.mines) {
      // let row = Math.floor(Math.random() * this.rows);
      // let col = Math.floor(Math.random() * this.cols);
      let row = tempX++;
      let col = tempY++;
      if (tempX === this.rows) {
        tempX = 0;
        tempY = 1;
      }

      if (!minesPlaced.includes(`${row}-${col}`)) {
        minesPlaced.push(`${row}-${col}`);
        this.board[row][col].setMine();
      }
    }
  }

  updateHTML() {
    const closedCells = document.querySelectorAll(".closed");
    for (let cell of closedCells) {
      const id = cell.getAttribute("id");
      const [row, col] = id.split("-").map(Number);
      const cellObj = this.board[row][col];
      if (cellObj.isOpen) {
        cell.setAttribute("class", `cell open${cellObj.adjMineCount}`);
        if (cellObj.isMine) {
          cell.innerHTML = "💣";
        } else if (cellObj.adjMineCount > 0) {
          cell.innerHTML = cellObj.adjMineCount;
        }
      }
    }
  }

  checkAdjacentCells(row, col) {
    let count = 0;
    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = col - 1; j <= col + 1; j++) {
        if (i === row && j === col) continue;

        if (this.board[i] && this.board[i][j] && this.board[i][j].isMine) {
          count++;
        }
      }
    }

    this.board[row][col].setAdjMineCount(count);
  }

  setCellVals() {
    for (let row of this.board) {
      for (let cell of row) {
        if (cell.isMine) continue;

        this.checkAdjacentCells(cell.row, cell.col);
      }
    }
  }

  middleClickOpen(row, col) {
    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = col - 1; j <= col + 1; j++) {
        if (this.board[i][j].isFlagged) continue;
        this.board[i][j].setOpen();
      }
    }
  }

  revealAllMines() {
    for (let row of this.board) {
      for (let cell of row) {
        if (cell.isMine) {
          cell.setOpen();
        }
      }
    }
  }

  disbaleAllCells() {
    for (let row of this.board) {
      for (let cell of row) {
        cell.unsetHanlers();
      }
    }
  }

  /**
   * Open the adjacent cells until a cell with adjacent mines is found.
   * @param {number} row
   * @param {number} col
   */
  openAdjacentCells(row, col) {
    for (let i = row - 1; i <= row + 1; i++) {
      if (i < 0 || i >= this.rows) continue;
      for (let j = col - 1; j <= col + 1; j++) {
        if (j < 0 || j >= this.cols) continue;
        if (i === row && j === col) continue;

        if (i === row || j === col) {
          if (!this.board[i][j].isMine && !this.board[i][j].isOpen) {
            this.board[i][j].setOpen(false);
            if (this.board[i][j].adjMineCount === 0) {
              this.openAdjacentCells(i, j);
            }
          }
        }
      }
    }
  }
}

class Cell {
  row;
  col;
  isMine;
  adjMineCount;
  isOpen;
  isFlagged;
  cellRef;

  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isOpen = false;
    this.isFlagged = false;
    this.cellRef = document.getElementById(`${row}-${col}`);
    this.setHandlers();
  }

  setMine() {
    this.isMine = true;
  }

  setFlag() {
    if (this.isOpen) return;

    this.isFlagged = !this.isFlagged;

    if (this.isFlagged) {
      this.cellRef.innerHTML = "🚩";
    } else {
      this.cellRef.innerHTML = "";
    }
  }

  setOpen(isClicked = false) {
    this.isOpen = true;

    if (this.isMine) {
      this.cellRef.setAttribute(
        "class",
        `cell open${isClicked ? " bomb-clicked" : ""}`
      );
      this.cellRef.innerHTML = "💣";

      // game over
      if (isClicked) {
        game.revealAllMines();
      }

      return;
    }

    this.cellRef.setAttribute("class", `cell open open${this.adjMineCount}`);
    if (this.adjMineCount > 0) {
      this.cellRef.innerHTML = this.adjMineCount;
    }

    if (isClicked && this.adjMineCount === 0) {
      console.debug('here');
      game.openAdjacentCells(this.row, this.col);
    }
  }

  setAdjMineCount(count) {
    this.adjMineCount = count;
  }

  setHandlers() {
    this.cellRef.addEventListener("mouseup", (e) => {
      if (e.button === 2) {
        this.setFlag();
      }

      if (this.isFlagged) {
        return;
      }

      if (e.button === 0) {
        this.setOpen(true);
      }

      if (e.button === 1) {
        game.middleClickOpen(this.row, this.col);
      }

      game.updateHTML();
    });

    this.cellRef.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  unsetHanlers() {
    this.cellRef.removeEventListener("mouseup", () => {});
    this.cellRef.removeEventListener("contextmenu", () => {});
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
