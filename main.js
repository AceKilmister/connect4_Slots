const rows = 6;
const columns = 7;
let grid = Array.from({ length: rows }, () => Array(columns).fill(null));
let gameOver = false;
let turnCounter = 1; // Starting turn counter, odd for red, even for yellow
let redScore = 0; // Running score for the red player
let yellowScore = 0; // Running score for the yellow player


const gridElement = document.getElementById('grid');
const restartButton = document.getElementById('restart-button');
let playerScore = 0; // Player score

// Initialize grid
function createGrid() {
    gridElement.innerHTML = '';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            gridElement.appendChild(cell);
        }
    }
}

function restartGame() {
    grid = Array.from({ length: rows }, () => Array(columns).fill(null));
    gameOver = false;
    turnCounter = 1; // Reset turn counter on restart
    createGrid();
}

restartButton.addEventListener('click', restartGame);

createGrid();

function loadSlotSymbols() {
    const redSlotGrid = document.getElementById('red-symbol-grid');
    const yellowSlotGrid = document.getElementById('yellow-symbol-grid');

    // Load red symbols
    for (let i = 1; i <= 15; i++) {
        const img = document.createElement('img');
        img.src = `images/redsymbol${i}.png`;
        redSlotGrid.appendChild(img);
    }

    // Load yellow symbols
    for (let i = 1; i <= 15; i++) {
        const img = document.createElement('img');
        img.src = `images/yellowsymbol${i}.png`;
        yellowSlotGrid.appendChild(img);
    }
}

loadSlotSymbols();

function handleCellClick(event) {
    if (gameOver) return;

    const col = event.target.dataset.col;
    const currentPlayer = turnCounter % 2 === 1 ? "red" : "yellow"; // Odd: red, Even: yellow

    for (let row = rows - 1; row >= 0; row--) {
        if (!grid[row][col]) {
            dropCoin(row, col, currentPlayer);
            break;
        }
    }
}

function dropCoin(row, col, player) {
    const cell = document.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
    const coin = document.createElement('div');
    coin.classList.add('coin');
    coin.style.backgroundColor = player; // red or yellow
    cell.appendChild(coin);

    grid[row][col] = player;

    // Trigger slot animation and check for winner
    coin.addEventListener('animationend', () => onAnimationEnd(player));

    if (player === "red") {
        triggerSlotAnimation('red');
    } else {
        triggerSlotAnimation('yellow');
    }

    // Check for winner
    if (checkForWinner(row, col, player)) {
        setTimeout(() => {
            gameOver = true;
            //alert(`${player === "red" ? "Red" : "Yellow"} wins!`);
            displayEndGameMessage(player);  // Call the displayEndGameMessage function
        }, 200);
    } else if (grid.flat().every(cell => cell !== null)) {
        setTimeout(() => {
            alert("It's a draw!");
            gameOver = true;
        }, 200);
    } else {
        turnCounter++; // Increment turn counter
    }
}





function onAnimationEnd(player) {
    // After animation ends, update score
    let pointsThisSpin = updateScoreForSpin(player);
    updateScoreDisplay(pointsThisSpin, player);

    // Log to the console to check score updates
    console.log(`Red Score: ${redScore}, Yellow Score: ${yellowScore}, Points This Spin: ${pointsThisSpin}`);

    if (!gameOver) {
        // Switch to the next player
        if (turnCounter % 2 === 0) {
            computerMove(); // Let computer play if it's yellow's turn
        }
    }
}

// Trigger the slot animation and update the score
function triggerSlotAnimation(player) {
    let pointsThisSpin = 0;
    const slot = player === 'red' ? document.getElementById('red-slot') : document.getElementById('yellow-slot');
    const symbols = slot.querySelectorAll('.symbol-grid img');

    symbols.forEach(symbol => {
        symbol.classList.add('spinning-symbol'); // Start spinning animation
    });

    setTimeout(() => {
        symbols.forEach(symbol => symbol.classList.remove('spinning-symbol')); // Stop spinning after animation
        randomizeSymbols(slot, player); // Randomize the symbol after spinning

        // Calculate spin results
        pointsThisSpin = checkWin(symbols, player);

        // If there is a win, highlight the winning symbols
        if (pointsThisSpin > 0) {
            highlightWinningSymbols(symbols);
        }

        // Update the score display
        updateScoreDisplay(pointsThisSpin, player);
    }, 3000); // After spin animation
}




// Check if a symbol is part of the winning combination
function isWinningSymbol(symbol) {
    const winningSymbols = ['images/redsymbol1.png', 'images/yellowsymbol1.png']; // Example winning symbols
    return winningSymbols.includes(symbol.src);
}

// Highlight the winning symbols by applying the animation class
function highlightWinningSymbols(symbols) {
    symbols.forEach(symbol => {
        if (isWinningSymbol(symbol)) {
            symbol.classList.add('highlight-winning-symbol'); // Apply the highlight animation
        }
    });
}


// Check if a symbol is part of the winning combination
function isWinningSymbol(symbol) {
    const winningSymbols = ['images/redsymbol1.png', 'images/yellowsymbol1.png']; // Example winning symbols
    return winningSymbols.includes(symbol.src);
}


function randomizeSymbols(slotGrid, color) {
    const symbols = slotGrid.querySelectorAll('img');
    const flickerDuration = 2000; // Total time for flickering in milliseconds
    const flickerInterval = 100; // Time interval for each flicker in milliseconds
    const finalSymbolDelay = flickerDuration + 500; // Extra delay for final symbols to stop after flickering

    // Start flickering and spinning simultaneously
    symbols.forEach(symbol => {
        symbol.classList.add('spinning-symbol'); // Add spinning animation
    });

    const flickerIntervalId = setInterval(() => {
        symbols.forEach(symbol => {
            const randomIndex = Math.floor(Math.random() * 15) + 1;
            symbol.src = `images/${color}symbol${randomIndex}.png`;
        });
    }, flickerInterval);

    // Stop flickering and spinning after the specified duration
    setTimeout(() => {
        clearInterval(flickerIntervalId);

        // Stop spinning and set final symbols
        symbols.forEach(symbol => {
            symbol.classList.remove('spinning-symbol'); // Remove spinning animation
            const randomIndex = Math.floor(Math.random() * 15) + 1;
            symbol.src = `images/${color}symbol${randomIndex}.png`;
        });
    }, finalSymbolDelay);
}




// Check if the player wins with the current spin
function checkWin(symbols, player) {
    const symbolCount = {}; 
    symbols.forEach(symbol => {
        const src = symbol.src; // Identify the symbol
        symbolCount[src] = (symbolCount[src] || 0) + 1;
    });

    let points = 0;
    let foundThree = 0;

    for (let symbolSrc in symbolCount) {
        if (symbolCount[symbolSrc] >= 3) {
            foundThree += 1;
            points += 3; // Award 3 points for any symbol that appears 3 times
        }
    }

    // If two different symbols appear 3 times each, it's a total of 6 points
    if (foundThree === 2) {
        points = 6;
    }

    return points;
}

function updateScoreDisplay(pointsThisSpin, player) {
    const pointsBox = player === "red" 
        ? document.getElementById('red-points-box') 
        : document.getElementById('yellow-points-box');

    const runningScoreBox = player === "red" 
        ? document.getElementById('red-running-points-box') 
        : document.getElementById('yellow-running-points-box');

    // Update the current spin's points
    pointsBox.textContent = `${player === "red" ? "Red" : "Yellow"} Points: ${pointsThisSpin}`;

    // Update the running score for the correct player
    if (player === "red") {
        redScore += pointsThisSpin; // Update red player's running score
        runningScoreBox.textContent = `Red Running Score: ${redScore}`;
    } else {
        yellowScore += pointsThisSpin; // Update yellow player's running score
        runningScoreBox.textContent = `Yellow Running Score: ${yellowScore}`;
    }

    // Log to the console to check score updates
    console.log(`Red Score: ${redScore}, Yellow Score: ${yellowScore}, Points This Spin: ${pointsThisSpin}`);
}




// Handle computer's turn
function computerMove() {
    const availableColumns = [];
    for (let col = 0; col < columns; col++) {
        if (grid[0][col] === null) {
            availableColumns.push(col);
        }
    }

    let bestMove = null;

    // Try to find the best move (check if computer can win)
    for (let col of availableColumns) {
        for (let row = rows - 1; row >= 0; row--) {
            if (!grid[row][col]) {
                grid[row][col] = "yellow"; // Simulate move
                if (checkForWinner(row, col, "yellow")) {
                    bestMove = col; // Best move to win
                }
                grid[row][col] = null; // Reset the cell after checking
                break;
            }
        }
    }

    // If no winning move, make a random move
    if (!bestMove) {
        bestMove = availableColumns[Math.floor(Math.random() * availableColumns.length)];
    }

    // Drop the coin for the computer's best move
    for (let row = rows - 1; row >= 0; row--) {
        if (!grid[row][bestMove]) {
            dropCoin(row, bestMove, "yellow");
            break;
        }
    }
}

// Check if the current player has won the game
function checkForWinner(row, col, player) {
    return checkHorizontal(row, col, player) || checkVertical(row, col, player) || checkDiagonalLR(row, col, player) || checkDiagonalRL(row, col, player);
}

// Check horizontal win
function checkHorizontal(row, col, player) {
    for (let i = 0; i <= columns - 4; i++) {
        if (grid[row].slice(i, i + 4).every(cell => cell === player)) {
            return true;
        }
    }
    return false;
}

// Check vertical win
function checkVertical(row, col, player) {
    if (row <= rows - 4) {
        for (let i = row; i < row + 4; i++) {
            if (grid[i][col] !== player) return false;
        }
        return true;
    }
    return false;
}

// Check diagonal left to right win
function checkDiagonalLR(row, col, player) {
    const directions = [
        [-1, 1], [1, -1]
    ];
    for (let [dx, dy] of directions) {
        let count = 1;
        let x = row + dx, y = col + dy;
        while (x >= 0 && x < rows && y >= 0 && y < columns && grid[x][y] === player) {
            count++;
            x += dx;
            y += dy;
        }
        x = row - dx;
        y = col - dy;
        while (x >= 0 && x < rows && y >= 0 && y < columns && grid[x][y] === player) {
            count++;
            x -= dx;
            y -= dy;
        }
        if (count >= 4) return true;
    }
    return false;
}

// Check diagonal right to left win
function checkDiagonalRL(row, col, player) {
    return checkDiagonalLR(row, col, player);
}


symbol.addEventListener('animationend', () => {
    // Check for winning symbols after the animation ends
    if (allSymbolsStopped()) {
        evaluateWinningSymbols();
    }
});


function evaluateWinningSymbols() {
    const symbols = document.querySelectorAll('.slot img');
    let points = 0;

    const symbolCount = {};
    symbols.forEach(symbol => {
        const src = symbol.src; // Get the symbol's image source
        symbolCount[src] = (symbolCount[src] || 0) + 1;
    });

    for (let symbolSrc in symbolCount) {
        if (symbolCount[symbolSrc] >= 3) {
            points += 3; // Award points for matching symbols
            highlightWinningSymbols(symbolSrc); // Highlight winning symbols
        }
    }

    updateScore(points); // Update the player's score
}


function highlightWinningSymbols(symbolSrc) {
    const winningSymbols = document.querySelectorAll(`.slot img[src="${symbolSrc}"]`);
    winningSymbols.forEach(symbol => {
        symbol.classList.add('highlight-winning-symbol');
    });
}

function updateScore(points) {
    playerScore += points;
    document.getElementById('running-score').textContent = `Total Score: ${playerScore}`;
}


function displayEndGameMessage(player) {
    // Calculate total coins played by counting non-null cells in the grid
    let totalCoinsPlayed = grid.flat().filter(cell => cell !== null).length;

    // Calculate free spins (42 - total coins played)
    let freeSpins = 42 - totalCoinsPlayed;

    // Get winner and opponent details
    let winnerPoints = player === "red" ? redScore : yellowScore;
    let opponentPoints = player === "red" ? yellowScore : redScore;
    let winnerName = player === "red" ? "Red" : "Yellow";
    let loserName = player === "red" ? "Yellow" : "Red";

    const message = `
        <h3>${winnerName} wins!</h3>
        <p>You scored ${winnerPoints} points.</p>
        <p>You have looted your opponent's ${opponentPoints} points.</p>
        <p>You have won ${freeSpins} free spins.</p>
    `;

    // Update the end-game message container with the message
    const endGameMessageElement = document.getElementById('end-game-message');
    endGameMessageElement.innerHTML = message;
}

