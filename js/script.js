// js/script.js

const gameState = {
    words: [],
    currentWord: "",
    currentHint: "",
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrong: 6,
    gameOver: false
};

// DOM references
let hangmanImgEl;
let hintTextEl;
let wordDisplayEl;
let wrongCountEl;
let maxWrongEl;
let resultMessageEl;
let usedLettersEl;
let letterInputEl;
let guessBtnEl;
let playAgainBtnEl;
let alphabetButtonsContainer;

// ---------- INITIALIZE ----------
document.addEventListener("DOMContentLoaded", () => {
    hangmanImgEl = document.getElementById("hangman-image");
    hintTextEl = document.getElementById("hint-text");
    wordDisplayEl = document.getElementById("word-display");
    wrongCountEl = document.getElementById("wrong-count");
    maxWrongEl = document.getElementById("max-wrong");
    resultMessageEl = document.getElementById("result-message");
    usedLettersEl = document.getElementById("used-letters");
    letterInputEl = document.getElementById("letter-input");
    guessBtnEl = document.getElementById("guess-btn");
    playAgainBtnEl = document.getElementById("play-again-btn");
    alphabetButtonsContainer = document.querySelector(".alphabet-buttons");

    maxWrongEl.textContent = gameState.maxWrong.toString();

    // Events
    guessBtnEl.addEventListener("click", onGuessClick);
    letterInputEl.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            onGuessClick();
        }
    });
    playAgainBtnEl.addEventListener("click", startNewGame);

    createAlphabetButtons();
    loadWords();
});

async function loadWords() {
    try {
        const response = await fetch("data/words.json");
        gameState.words = await response.json();
        startNewGame();
    } catch (error) {
        console.error("Error loading words.json:", error);
        hintTextEl.textContent = "Unable to load words. Check console.";
    }
}

function startNewGame() {
    resetGameState();

    if (!gameState.words || gameState.words.length === 0) {
        hintTextEl.textContent = "No words loaded.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * gameState.words.length);
    const chosen = gameState.words[randomIndex];

    gameState.currentWord = chosen.word.toLowerCase();
    gameState.currentHint = chosen.hint;

    hintTextEl.textContent = gameState.currentHint;
    updateWordDisplay();
    updateHangmanImage();
    updateUsedLetters();
    updateResultMessage("");

    enableAllAlphabetButtons();
    letterInputEl.value = "";
    letterInputEl.disabled = false;
    guessBtnEl.disabled = false;
    playAgainBtnEl.disabled = true;
}


function resetGameState() {
    gameState.guessedLetters = [];
    gameState.wrongGuesses = 0;
    gameState.gameOver = false;

    wrongCountEl.textContent = "0";
}


function onGuessClick() {
    const value = letterInputEl.value.trim().toLowerCase();
    if (value.length === 0) return;

    const letter = value[0];

    handleGuess(letter);
    letterInputEl.value = "";
}


function handleGuess(letter) {
    if (gameState.gameOver) return;

    // Ignore non-letters
    if (!/^[a-z]$/.test(letter)) {
        alert("Please enter a letter (a-z).");
        return;
    }

    // Already guessed?
    if (gameState.guessedLetters.includes(letter)) {
        alert("You already guessed that letter.");
        return;
    }

    gameState.guessedLetters.push(letter);

    // Check if letter is in the word
    if (gameState.currentWord.includes(letter)) {
        // Correct guess
        updateWordDisplay();
        checkWin();
    } else {
        // Incorrect guess
        gameState.wrongGuesses++;
        wrongCountEl.textContent = gameState.wrongGuesses.toString();
        updateHangmanImage();
        checkLose();
    }

    updateUsedLetters();
    disableAlphabetButton(letter);
}


function updateWordDisplay() {
    const display = gameState.currentWord
        .split("")
        .map((ch) => (gameState.guessedLetters.includes(ch) ? ch : "_"))
        .join(" ");

    wordDisplayEl.textContent = display;
}

// ---------- UPDATE HANGMAN IMAGE ----------
function updateHangmanImage() {
    const stage = Math.min(gameState.wrongGuesses, gameState.maxWrong);
    hangmanImgEl.src = `images/hangman${stage}.png`;
}

// ---------- UPDATE USED LETTERS ----------
function updateUsedLetters() {
    usedLettersEl.textContent = gameState.guessedLetters.join(", ");
}

// ---------- CHECK WIN ----------
function checkWin() {
    // If all letters are revealed, player wins
    const allRevealed = gameState.currentWord
        .split("")
        .every((ch) => gameState.guessedLetters.includes(ch));

    if (allRevealed) {
        gameState.gameOver = true;
        updateResultMessage("You win! 🎉", true);
        endGame();
    }
}

// ---------- CHECK LOSE ----------
function checkLose() {
    if (gameState.wrongGuesses >= gameState.maxWrong) {
        gameState.gameOver = true;
        updateResultMessage(`You lost! The word was: ${gameState.currentWord}`, false);
        endGame();
    }
}

// ---------- END GAME ----------
function endGame() {
    guessBtnEl.disabled = true;
    letterInputEl.disabled = true;
    playAgainBtnEl.disabled = false;
    disableAllAlphabetButtons();
}

// ---------- UPDATE RESULT MESSAGE ----------
function updateResultMessage(message, isWin) {
    resultMessageEl.textContent = message;
    resultMessageEl.classList.remove("result-win", "result-lose", "fade-in");

    if (message) {
        if (isWin === true) {
            resultMessageEl.classList.add("result-win");
        } else if (isWin === false) {
            resultMessageEl.classList.add("result-lose");
        }
        // JS animation: add fade-in class
        void resultMessageEl.offsetWidth; // force reflow
        resultMessageEl.classList.add("fade-in");
    }
}

// ---------- ALPHABET BUTTONS ----------
function createAlphabetButtons() {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    letters.forEach((letter) => {
        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.classList.add("alpha-btn");
        btn.addEventListener("click", () => {
            handleGuess(letter);
        });
        alphabetButtonsContainer.appendChild(btn);
    });
}

function disableAlphabetButton(letter) {
    const buttons = alphabetButtonsContainer.querySelectorAll("button");
    buttons.forEach((btn) => {
        if (btn.textContent === letter) {
            btn.disabled = true;
        }
    });
}

function disableAllAlphabetButtons() {
    const buttons = alphabetButtonsContainer.querySelectorAll("button");
    buttons.forEach((btn) => {
        btn.disabled = true;
    });
}

function enableAllAlphabetButtons() {
    const buttons = alphabetButtonsContainer.querySelectorAll("button");
    buttons.forEach((btn) => {
        btn.disabled = false;
    });
}
