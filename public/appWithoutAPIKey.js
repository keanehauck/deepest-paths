
//TODO: fix some of the notation when referring to change game and change round in the html.
//Known issues: for some reason, when I inherited this code, the term 'row' is used in place of 'column', and vice versa.
//I just rolled with it, so these two terms consistently have the wrong meanings.
//Darn ChatGPT...

//Apologies to anyone reading this code (Including future versions of Keane Hauck). The current notation is CONFUSING.

//legitimate firebase stuff

// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, set, get, onValue, remove } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  //apiKey: "PLACEHOLDER",
  authDomain: "deepestpaths2.firebaseapp.com",
  databaseURL: "https://deepestpaths2-default-rtdb.firebaseio.com",
  projectId: "deepestpaths2",
  storageBucket: "deepestpaths2.appspot.com",
  messagingSenderId: "885967652243",
  appId: "1:885967652243:web:78ff4d2da6bbdbe05b5466",
  measurementId: "G-39J6VFWB5M"
};

// Initialize Firebase


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
let firebaseUserID; // Store the Firebase user ID


// Sign in the user anonymously
signInAnonymously(auth)
  .then(() => {
    console.log("User signed in anonymously");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Error during anonymous sign-in:", errorMessage);
  });

// Track authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in.
    firebaseUserID = user.uid;
    console.log("Firebase ID:", firebaseUserID);
    // You can now store data using this user ID
  } else {
    // User is signed out
  }
});


/*      SIMULATION FIREBASE FOR TESTING
// Simulate Firebase Database with localStorage
const localStorageDB = {
  ref(path) {
    return {
      set(value) {
        localStorage.setItem(path, JSON.stringify(value));
        return Promise.resolve();
      },
      get() {
        const data = localStorage.getItem(path);
        return Promise.resolve({
          val: () => data ? JSON.parse(data) : {}
        });
      }
    };
  }
};



// Simulate Firebase Auth with localStorage
const localStorageAuth = {
  // Simulate signing in anonymously
  signInAnonymously() {
    console.log("Simulated anonymous sign-in.");
    // Simulate a successful sign-in with a mock user credential
    return Promise.resolve({
      user: { uid: 'test-user-id' }
    });
  },

  // Simulate listening for authentication state changes
  onAuthStateChanged(callback) {
    // Simulate a logged-in user
    callback({ uid: 'test-user-id' });
  }
};

// Mock Firebase Initialization
function initializeApp() {
  console.log("Mock app initialized.");
  return {}; // Simulate returning an app instance
}

// Mock Get Database
function getDatabase() {
  console.log("Mock database accessed.");
  return localStorageDB;
}

// Mock Get Auth
function getAuth() {
  console.log("Mock auth accessed.");
  return localStorageAuth;
}

// Initialize the app
const app = initializeApp();
const db = getDatabase();
const auth = getAuth();

 */




//***************SETTING STUFF */

// Define protocols with values for each setting
const protocols = {
};

// Function to load protocols into the dropdown and update protocols object
export function loadProtocols() {
  const protocolsRef = ref(db, 'protocols');
  console.log("Attempting to load protocols.");

  onValue(protocolsRef, (snapshot) => {
      const protocolSelect = document.getElementById("protocol-select");

      // Save the current selection
      const currentSelection = protocolSelect.value;

      protocolSelect.innerHTML = ""; // Clear existing options

      if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
              const protocolData = childSnapshot.val();
              const protocolKey = childSnapshot.key;

              // Update the protocols object
              protocols[protocolKey] = {
                  'name': protocolData.name || 'Unnamed Protocol',
                  'numGames': protocolData.numGames || 1,
                  'changeGame': protocolData.changeGame || 0,
                  'changeRound': protocolData.changeRound || 5,
                  'suitSelection': protocolData.suitSelection || 'Random',
                  'includeTimer': protocolData.includeTimer || false,
                  'roundTime': protocolData.roundTime || 60
              };

              // Create and append option to the dropdown
              const option = document.createElement("option");
              option.value = protocolKey;
              option.textContent = protocols[protocolKey].name;
              protocolSelect.appendChild(option);
          });

          // Restore the previous selection
          protocolSelect.value = currentSelection;

          // If the currentSelection is not valid, set the first protocol as default
          if (!protocolSelect.value) {
              protocolSelect.value = Object.keys(protocols)[0];
          }
      } else {
          const option = document.createElement("option");
          option.textContent = "No protocols available";
          protocolSelect.appendChild(option);
      }
  }, (error) => {
      console.error("Error loading protocols:", error);
  });

  console.log("Updated protocols object:", protocols);
}

// Save the protocol to Firebase
export function saveProtocol() {
  // Show a confirmation alert
  const confirmSave = window.confirm("Are you sure you want to save this protocol?");

  // If the user cancels, stop the function
  if (!confirmSave) {
      console.log("Protocol save cancelled by user.");
      return;
  }

  const protocol = {
      name: document.getElementById('protocol-name').value,
      numGames: parseInt(document.getElementById('num-games').value, 10),
      changeGame: parseInt(document.getElementById('change-scoring-game').value, 10),
      changeRound: parseInt(document.getElementById('change-game').value, 10),
      suitSelection: document.getElementById('suit-selection').value,
      includeTimer: document.getElementById('include-timer').checked,
      roundTime: parseInt(document.getElementById('round-time').value, 10)
  };

  const protocolRef = ref(db, `protocols/${protocol.name}`);
  try {
      set(protocolRef, protocol); // Save to Firebase
      console.log("Protocol saved successfully");
      //applyProtocol();
      //loadProtocols();
  } catch (error) {
      console.error("Error saving protocol:", error);
  }
}


// Function to apply the selected protocol
export function applyProtocol() {
  const selectedProtocol = document.getElementById("protocol-select").value;
  const protocol = protocols[selectedProtocol];
  console.log(protocols);
  // Apply the protocol values to the form fields
  document.getElementById("protocol-name").value = protocol['name'];
  document.getElementById("num-games").value = protocol['numGames'];
  document.getElementById("change-scoring-game").value = protocol['changeGame'];
  document.getElementById("change-game").value = protocol['changeRound'];
  document.getElementById("suit-selection").value = protocol['suitSelection'];
  document.getElementById("include-timer").checked = protocol['includeTimer'];
  document.getElementById("round-time").value = protocol['roundTime'];
}



// Function to delete the selected protocol
export function deleteProtocol() {
  // Get the currently selected protocol
  const selectedProtocol = document.getElementById("protocol-select").value;

  // Check if a protocol is selected
  if (!selectedProtocol) {
      alert("Please select a protocol to delete.");
      return;
  }

  // Show a confirmation alert
  const confirmDelete = window.confirm(`Are you sure you want to delete the protocol "${selectedProtocol}"? This action cannot be undone.`);
  
  // If the user cancels, stop the function
  if (!confirmDelete) {
      console.log("Protocol deletion cancelled by user.");
      return;
  }

  // Firebase reference to the selected protocol
  const protocolRef = ref(db, `protocols/${selectedProtocol}`);

  try {
      // Remove the protocol from Firebase
      remove(protocolRef)
          .then(() => {
              console.log(`Protocol "${selectedProtocol}" deleted successfully.`);
              
              // Reload the protocols in the dropdown
              applyProtocol();
              loadProtocols();
          })
          .catch((error) => {
              console.error("Error deleting protocol:", error);
          });
  } catch (error) {
      console.error("Error during protocol deletion process:", error);
  }
}




// Variables to store settings
let numGamesPlayed = 1; //default
let numGames = 1; // Default value
let includeTimer = false; // Default value
let gameOfScoreChange = 0;
let roundOfScoreChange = 5;
let changeSuit = "";
let maxTimePerRound = 60; // Default time in seconds
let timeLeft = maxTimePerRound; // Time remaining in the round
let timerInterval; // For storing the setInterval reference
let roundStartTime; // Track the start time of the round
let roundEnded = false;
let userID;

var gameData = [];


// Function to save settings from the form
function saveSettings() {
  const numGamesInput = document.getElementById("num-games");
  const includeTimerInput = document.getElementById("include-timer");
  const numChangeGame = document.getElementById("change-game");
  const selectedSuit = document.getElementById("suit-selection");


  numGames = parseInt(numGamesInput.value, 10); // Get the number of rounds from the input
  roundOfScoreChange = parseInt(numChangeGame.value, 10);
  changeSuit = selectedSuit.value;
  includeTimer = includeTimerInput.checked; // Get whether the timer is included
  maxTimePerRound = parseInt(document.getElementById('round-time').value) || 60;
  timeLeft = maxTimePerRound;
  userID = document.getElementById("participant-id").value;
  gameOfScoreChange = parseInt(document.getElementById("change-scoring-game").value, 10);

  // Log the settings to verify they are being saved correctly
  console.log("Settings saved:", { numGames, roundOfScoreChange, changeSuit, includeTimer, maxTimePerRound, userID });

  // Optionally, you can call a function to proceed to the welcome screen or another action
  
}





//********************LOADING WELCOME SCREEN*********************** */
function showSettingsScreen() {
  const settingsScreen = document.getElementById("settings-screen");
  const welcomeScreen = document.getElementById("welcome-screen");

  // Show settings screen and hide welcome screen
  settingsScreen.style.display = "block";
  welcomeScreen.style.display = "none";
  
  loadProtocols();

  // Listen for save settings button
  listenForSaveSettingsButton();
}

// Listen for save settings button on settings screen
function listenForSaveSettingsButton() {
  const saveSettingsButton = document.getElementById("save-settings-button");

  saveSettingsButton.addEventListener("click", function() {
    // Perform any necessary actions to save settings here
    saveSettings();
    showWelcomeScreen(); // Proceed to welcome screen after saving settings
  });
}

// Show welcome screen
function showWelcomeScreen() {
  console.log(document.getElementById(numGames));
  const settingsScreen = document.getElementById("settings-screen");
  const welcomeScreen = document.getElementById("welcome-screen");

  // Hide settings screen and show welcome screen
  settingsScreen.style.display = "none";
  welcomeScreen.style.display = "block";
  
  // Listen for continue button on welcome screen
  listenForContinueButton();
}

// Listen for continue button on welcome screen
function listenForContinueButton() {
  const continueButton = document.getElementById("continue-button");
  continueButton.addEventListener("click", showContestScreen);
}



// Show contest screen
function showContestScreen() {
  //added by me.
  if (includeTimer === true) {
    alert("In addition, you will be timed! Each round, your remaining time will be displayed in the lower-left corner of the screen. Once the time runs out, you will keep your current points and move on to the next round.");
  }
  


  const welcomeScreen = document.getElementById("welcome-screen");
  const contestScreen = document.getElementById("contest-screen");
  
  welcomeScreen.style.display = "none";
  contestScreen.style.display = "block";
  
  listenForStartButton(); // Call the new function to listen for the start button click
}

//this is ADDED BY ME. IDK IF IT WORKS
let gameStarted = false;


// Listen for submit email button on contest screen
//removed due to removal of contest screen. 

// Listen for start button on contest screen
function listenForStartButton() {
  const startButton = document.getElementById("start-button");
  startButton.addEventListener("click", startGame);
}

function startTimer() {
  timerInterval = setInterval(() => {
      timeLeft--;

      // Update the time left on the UI
      document.getElementById('time-left').textContent = timeLeft;

      // If the timer reaches zero, end the round
      if (timeLeft <= 0) {
          if (roundEnded === false) {
              endRound();

          }
          
      }
  }, 1000); // Update every second
}

// Function to end the round when time runs out
function endRound() {
  clearInterval(timerInterval); // Stop the timer
  alert("Time's up! Round over.");
  roundEnded = true;
  // Calculate total time taken
  const roundEndTime = new Date().getTime();
  const timeTaken = (roundEndTime - roundStartTime) / 1000; // Time in seconds
  console.log(`Total time taken for the round: ${timeTaken} seconds`);

  // Reset or start a new round as necessary
  endGame();
}

//*********************PREPARING GAMEBOARD*********************** */
  // Defining constants and giving the cards values
  const cards = [
    "A♥", "2♥", "3♥", "4♥", "5♥", "6♥", "7♥", "8♥", "9♥", "10♥", "J♥", "Q♥", "K♥",
    "A♠", "2♠", "3♠", "4♠", "5♠", "6♠", "7♠", "8♠", "9♠", "10♠", "J♠", "Q♠", "K♠",
    "A♦", "2♦", "3♦", "4♦", "5♦", "6♦", "7♦", "8♦", "9♦", "10♦", "J♦", "Q♦", "K♦",
    "A♣", "2♣", "3♣", "4♣", "5♣", "6♣", "7♣", "8♣", "9♣", "10♣", "J♣", "Q♣", "K♣"
  ];

  let suitScores = {
    "♥": 0,
    "♠": 0,
    "♦": 0,
    "♣": 0
    };

    // Shuffle the cards using the Fisher-Yates algorithm
    function shuffleDeck() {
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
      }

  //Converts Unicode symbol into words
  function assignCardSuit(cardElement, card) {
    if (card.includes("♥")) {
      cardElement.classList.add("heart");
    } else if (card.includes("♠")) {
      cardElement.classList.add("spade");
    } else if (card.includes("♦")) {
      cardElement.classList.add("diamond");
    } else if (card.includes("♣")) {
      cardElement.classList.add("club");
    }
  }

  //Develops scoring mechanism
    const standardScoringRules = {
      "A": 2,
      "K": 1,
      "Q": 1,
      "J": 1,
      "10": 1, /*this is the value for the 10's place*/
      "9": 0,
      "8": 0,
      "7": 0,
      "6": 0,
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0
    };

    const modifiedScoringRules = {
      "A": 2,
      "K": 2,
      "Q": 2,
      "J": 2,
      "10": 2, /* this is the value for the 10's place */
      "9": 1,
      "8": 1,
      "7": 1,
      "6": 1,
      "5": 1,
      "4": 1,
      "3": 1,
      "2": 1
    };
    
    // Assign each card a value and point value based on scoring system
    const cardElements = document.querySelectorAll('.card');
    function assignCardPoints(cardElement, card, scoringSystem, suitsScoring) {
      let points = 0;
      const cardRank = card.charAt(0) === "1" && card.charAt(1) === "0" ? "10" : card.charAt(0);
      const cardSuit = cardRank === "10" ? card.charAt(2) : card.charAt(1);
      if (suitsScoring === "allSuits" || suitsScoring === cardSuit) {
        points = scoringSystem[cardRank] || 0;
      }
      cardElement.dataset.points = points;
    }

    // Function to assign the appropriate scoring system
    function assignCardValue(cardElement, card, scoringSystem, suitsScoring) {
      cardElement.dataset.value = card;
      cardElement.classList.add("card-invalid");
      assignCardPoints(cardElement, card, scoringSystem, suitsScoring);
      assignCardSuit(cardElement, card);
    }

  //Deals out cards and assigns them values according the scoring system and suit options
  function dealCards(valueScoring, suitsScoring) {
    cards.forEach((card, index) => {
      const cardElement = cardElements[index];
      assignCardValue(cardElement, card, valueScoring, suitsScoring);
    });
  }

  //Function that updates the rule container to display current rule set to the user
  function updateRuleContainer(activeScoring) {
    const ruleContainer = document.querySelector('.rule-container');
    
    if (activeScoring === standardScoringRules) {
      ruleContainer.innerHTML = '<span class="purple-text">A: 2 points</span>&nbsp;<span class="green-text">K, Q, J, and 10s: 1 point</span>&nbsp;<span class="red-text">All other cards: 0 points</span>';
    } else if (activeScoring === modifiedScoringRules) {
      const suitNames = ["Spades", "Hearts", "Diamonds", "Clubs"];
      const activeSuitIndex = ["♠", "♥", "♦", "♣"].indexOf(activeSuits);
      const activeSuitName = suitNames[activeSuitIndex];
      ruleContainer.innerHTML = `<span class="purple-text">A, K, Q, J, and 10s of ${activeSuitName} ${activeSuits}: 2 points</span>&nbsp;<span class="green-text">9, 8, 7, 6, 5, 4, 3, 2 of ${activeSuitName} ${activeSuits}: 1 point</span>&nbsp;<span class="red-text">All other cards: 0 points</span>`;
    }
  }


//*********************STARTING GAME*********************** */
// Reset GameBoard
let totalScore = 0;
function resetGameBoard() {
  // Remove the end game message box if it exists
    const messageBox = document.querySelector('.message-box');
    if (messageBox) {
      messageBox.remove();
    }

  // Reset both the stats and suit scores to 0
  totalScore = 0;
  suitScores = {
    "♥": 0,
    "♠": 0,
    "♦": 0,
    "♣": 0
  };
  exploratoryMoves = 0;
  exploitativeMoves = 0;

  // Reseting card states
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.classList.remove('card-locked', 'card-valid', 'card-flipped'); // Removing all prior classes from the card
    card.classList.add('card-invalid'); // Reseting the card stats to invalid
    card.textContent = ''; // Clearing all card text content
    if (card.classList.contains('card-selected')) { // Showing text content for all cards assigned card-selected classicfication
      card.textContent = card.dataset.value; 
    }
  });

  // Validating the cards in row 1
  const row1Cards = document.querySelectorAll('.row[data-row="1"] .card');
  row1Cards.forEach(card => {
    card.classList.remove('card-invalid');
    card.classList.add('card-valid');
  });

  updateRuleContainer(activeScoring)
  updateScoreboard();
}

//Assigns coordinates to cards
function assignCardCoordinates() {
  const rows = document.querySelectorAll('.row');
  rows.forEach((rowElement, rowIndex) => {
    const cards = rowElement.querySelectorAll('.card');
    cards.forEach((cardElement, colIndex) => {
      cardElement.dataset.row = rowIndex + 1; // Assign row number (1-based)
      cardElement.dataset.col = colIndex + 1; // Assign column number (1-based)
    });
  });
}




// Writing user data to the database on the first game

function initializeUserData(tempID) {
  //removed writing user email
  if(!tempID) {
    console.log("No value for user.");
    return;
  }

  const currentDate = new Date();
  const date = currentDate.toDateString();
  const time = currentDate.toTimeString();
  console.log("Initializing data for user: " + tempID)

  set(ref(db, 'participants/' + tempID + '/datetime'), {date, time})
    .then(() => {
        console.log("Data saved successfully!");

        set(ref(db, `participants/${userID}/settings`), { numGames, gameOfScoreChange, roundOfScoreChange, changeSuit, includeTimer, maxTimePerRound })
        //set(ref(db, `participants/${userID}/settings`), { roundOfScoreChange })
        //set(ref(db, `participants/${userID}/settings`), { changeSuit })
        //set(ref(db, `participants/${userID}/settings`), { includeTimer })
        //set(ref(db, `participants/${userID}/settings`), { maxTimePerRound })

    })
    .catch((error) => {
        console.error("Error saving data:", error);
    });

}

// Starting game
let currentGame = 0;
let activeSuits;
let activeScoring;

function startGame() {
  if (currentGame === 0) {

        initializeUserData(userID);
        shuffleDeck();
        const overlay = document.getElementById("overlay");
        overlay.style.display = "none";
        activeSuits = "allSuits";
        activeScoring = standardScoringRules;

        currentGame++;
        dealCards(activeScoring, activeSuits);
        assignCardCoordinates();
        gameStarted = true;
        resetGameBoard();
        lastMoveTime = new Date().getTime(); // Resting move time on start of game


        roundEnded = false;
        timeLeft = maxTimePerRound;

            // Display the time left
        if (includeTimer === true) {
            document.getElementById('time-left').textContent = timeLeft;
        }
        

        // Start the timer countdown
        if (includeTimer === true) {
           startTimer();
        }
        

        // Record the round start time
        roundStartTime = new Date().getTime();

      
  } else {
    currentGame++;
    dealCards(activeScoring, activeSuits);
    gameStarted = true;
    resetGameBoard();
    lastMoveTime = new Date().getTime(); // Resting move time on start of game\

    roundEnded = false;
    timeLeft = maxTimePerRound;
    // Display the time left
    if (includeTimer === true) {
        document.getElementById('time-left').textContent = timeLeft;
    }
    

    // Start the timer countdown
    if (includeTimer === true) {
      startTimer();
   }

    // Record the round start time
    roundStartTime = new Date().getTime();

  }
}

function startNextGame() {
        console.log("Starting next game.");

        // Resetting variables
        currentGame = 0;
        totalScore = 0;
        TotalScoreAcrossGames = 0;
        averageTotalScores = 0;


        clearTrackers();


        const cards = document.querySelectorAll('.card');

        cards.forEach(card => {
        card.classList.remove('card-locked', 'card-valid', 'card-flipped', 'card-selected'); // Removing all prior classes from the card
        });
        
        cards.forEach(card => {
          card.classList.remove('club', 'diamond', 'spade', 'heart'); // Removing all prior classes from the card
          });

        shuffleDeck();
        const overlay = document.getElementById("overlay");
        overlay.style.display = "none";
        activeSuits = "allSuits";
        activeScoring = standardScoringRules;

        currentGame++;
        dealCards(activeScoring, activeSuits);
        assignCardCoordinates();
        gameStarted = true;
        resetGameBoard();
        moves = [];
        lastMoveTime = new Date().getTime();
        

        roundEnded = false;
        timeLeft = maxTimePerRound;
        // Display the time left
        if(includeTimer === true) {
           document.getElementById('time-left').textContent = timeLeft;
        }
            

            // Start the timer countdown
        if (includeTimer === true) {
          startTimer();
       }

            // Record the round start time
            roundStartTime = new Date().getTime();

        numGamesPlayed++;
}


//*********************GAME LOGIC AND RULES*********************** */
// STEP 1: Flip card
    let flippedCards = [];

    // Recording move time
    let moves = [];
    let lastMoveTime = new Date().getTime();
 
      // Function for recording move time
      function recordMoveData(isExploratory, cardElement) {
        const now = new Date();
        const moveTime = now.getTime() - lastMoveTime;
        lastMoveTime = now.getTime();
      

        const cardValue = cardElement.dataset.value; // e.g., "A♥"
        const cardSuit = cardValue.slice(-1); // Extract suit symbol (e.g., "♥")
        const cardRank = cardValue.slice(0, cardValue.length - 1); // Extract rank (e.g., "A")
        
        const row = cardElement.dataset.row; // Get row coordinate
        const col = cardElement.dataset.col; // Get column coordinate

        const coordOutput =  'row: ' + col + ' col: ' + row ;
        //console.log(coordOutput);
      
        // Record move time, type, move number, and data-points in an array
        moves.push({
          moveNumber: moves.length + 1,
          time: moveTime,
          type: isExploratory ? 'exploratory' : 'exploitative',
          points: cardElement.dataset.points,
          rank: cardRank,
          suit: cardSuit,
          row: col,
          col: row
        });
      }

    // Function for measuring exploratory vs. exploitative behavior
      let exploratoryMoves = 0;
      let exploitativeMoves = 0;
      let unexploredCards = (document.querySelectorAll('.card')).length;
      let percentUnexplored = 100;

      function countMoves(cardElement) {
        const cardValue = cardElement.dataset.value;
        const exploitedCards = document.querySelectorAll('.card-selected[data-value="' + cardValue + '"]');
        const allCards = document.querySelectorAll('.card');
      
        // If move is exploratory
        if (exploitedCards.length === 0) {
          exploratoryMoves++;
          unexploredCards--;
          percentUnexplored = (unexploredCards / allCards.length) * 100;
          recordMoveData(true, cardElement);
      
        // If move is exploitative
        } else {
          const flippedCardValues = flippedCards.map(card => card.dataset.value);
          if (flippedCardValues.includes(cardValue)) {
            exploitativeMoves++;
            recordMoveData(false, cardElement);
          }
        }
      
        flippedCards.push(cardElement);
      }
      
      // Function for flipping the card
      function flipCard(cardElement) {
        if (timeLeft > 0) {
          cardElement.classList.remove('card-valid');
          cardElement.classList.add('card-flipped');
          cardElement.textContent = cardElement.dataset.value;
        
          countMoves(cardElement);
      } else {
          alert("Round is over, you cannot flip cards!");
      }
  
      }

  // STEP 2: Update the scores
    function updateScores(cardElement) {
      const suit = cardElement.dataset.value.slice(-1);   // Get the suit and points data from the card element
      const points = parseInt(cardElement.dataset.points);

      totalScore += points;   // Update the total score and suit scores objects
      suitScores[suit] += points;

      // Check if points were scored and play sound if so
      if (isSoundOn) {
        if (points === 1) {
          const audio = new Audio('ClinkingCoin.wav');
          audio.play();
        } else if (points > 1) {
          const audio = new Audio('ClinkingCoins.wav');
          audio.play();
        }
      }
    }

  // STEP 3: Update the scoreboard
    function updateScoreboard() {
    // Update total score
    totalScore = Object.values(suitScores).reduce((acc, val) => acc + val, 0);
    document.getElementById("score-box").innerHTML = `Game Score: ${TotalScoreAcrossGames}<br>Round Score: ${totalScore}`;

    
    // Update suit scores
    let sortedScores = Object.entries(suitScores).sort((a, b) => b[1] - a[1]); // Sort suitScores object by values in descending order

    const heartScoreElement = document.getElementById("♥-score"); // Get the suit score elements
    const spadeScoreElement = document.getElementById("♠-score");
    const diamondScoreElement = document.getElementById("♦-score");
    const clubScoreElement = document.getElementById("♣-score");

    heartScoreElement.textContent = `Hearts ♥: ${suitScores["♥"]}`;  // Update the scores of the suit score elements
    spadeScoreElement.textContent = `Spades ♠: ${suitScores["♠"]}`;
    diamondScoreElement.textContent = `Diamonds ♦: ${suitScores["♦"]}`;
    clubScoreElement.textContent = `Clubs ♣: ${suitScores["♣"]}`;

    let scoreboard = document.querySelector(".scoreboard");   // Reorder the suit score elements based on the sorted scores
    sortedScores.forEach((suitScore) => {
      let suit = suitScore[0];
      if (suit === "♥") {
        scoreboard.appendChild(heartScoreElement);
      } else if (suit === "♠") {
        scoreboard.appendChild(spadeScoreElement);
      } else if (suit === "♦") {
        scoreboard.appendChild(diamondScoreElement);
      } else if (suit === "♣") {
        scoreboard.appendChild(clubScoreElement);
      }
    });
  }

  
  // STEP 4: Lock all other cards in the row
    function lockOtherCardsInRow(cardElement) {
      const row = cardElement.closest('.row'); // Get the row that contains the clicked card
      const otherCardsInRow = row.querySelectorAll('.row[data-row="' + row.dataset.row + '"] .card:not(.card-flipped)'); // Get all other cards in the row
    
      otherCardsInRow.forEach(card => {
        card.classList.remove('card-valid');
        card.classList.add('card-locked');
      });
    }

  // STEP 5: Validates cards in the next row
    function unlockCardsInNextRow(cardElement) {
      const row = cardElement.parentElement.dataset.row;
      const nextRow = parseInt(row) + 1;
      let cardIndex = Array.from(cardElement.parentElement.children).indexOf(cardElement);
    
      let cardIndicesToUnlock = [];
    
      if (row === "1") {    
        // For row 1, unlock the next 3 cards
        cardIndicesToUnlock.push(cardIndex * 2 + 1);
        cardIndicesToUnlock.push(cardIndex * 2 + 2);
        cardIndicesToUnlock.push(cardIndex * 2 + 3);
      } else {       
        // For other rows, unlock the two or three cards cards closest to the selected card
        if (cardIndex > 0) {
          cardIndicesToUnlock.push(cardIndex);
          cardIndicesToUnlock.push(cardIndex + 1);
        }
    
        if (cardIndex < cardElement.parentElement.children.length - 1) {
          cardIndicesToUnlock.push(cardIndex + 1);
          cardIndicesToUnlock.push(cardIndex + 2);
        }
      }
    
      cardIndicesToUnlock.forEach(index => {
        const nextRowCard = document.querySelector(`.row[data-row="${nextRow}"] .card:nth-child(${index})`);
        nextRowCard.classList.remove('card-invalid');
        nextRowCard.classList.add('card-valid');
      });
    }
  
//*********************ENDING GAME*********************** */
// Output total score to the scoretracker
let averageTotalScores = 0;
let TotalScoreAcrossGames = 0;

// Helper function calculating color gradient for final score
function getColor(score) {
  let r, g, b;

  if (score <= 4) {
    // Dark red
    r = 200;
    g = 0;
    b = 0;
  } else if (score > 4 && score <= 5) {
    // Yellow
    r = 255;
    g = 255;
    b = 0;
  } else if (score > 5 && score <= 9) {
    // Dark green
    r = 0;
    g = 200;
    b = 0;
  } else {
    // Dark purple
    r = 128;
    g = 0;
    b = 128;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

// Update ScoreTracker with final game score
function updateScoreTracker(gameNumber, totalScore) {
  // Calculate running average of total score
  TotalScoreAcrossGames += totalScore;
  averageTotalScores = (TotalScoreAcrossGames / gameNumber);

  // Output total and average total scores on score tracker
  const gameScoreDiv = document.getElementById(`gamescore-${gameNumber}`);
  let output = `Round ${gameNumber}: <span class="total-score">${totalScore}</span> (<span class="average-score">${averageTotalScores.toFixed(1)}</span>)`;
  gameScoreDiv.innerHTML = output;

  // Set the color based on the scores
  const totalScoreColor = getColor(totalScore);
  const averageScoreColor = getColor(averageTotalScores);
  gameScoreDiv.querySelector('.total-score').style.color = totalScoreColor;
  gameScoreDiv.querySelector('.average-score').style.color = averageScoreColor;
}

// Output suit scores to the suittracker
function updateSuitTracker(gameNumber, suitScores) {
  const suitTrackerDiv = document.getElementById(`suitscore-${gameNumber}`);
  let output = '';
  for (const suit in suitScores) {
    let colorClass = '';
    if (suit === '♥') {
      colorClass = 'heart';
    } else if (suit === '♦') {
      colorClass = 'diamond';
    } else if (suit === '♠') {
      colorClass = 'spade';
    } else if (suit === '♣') {
      colorClass = 'club';
    }
    output += `<span class="${colorClass}">${suit} ${suitScores[suit]}</span>, `;
  }
  suitTrackerDiv.innerHTML = output.slice(0, -2); // Remove trailing comma and space
}

//Helper function that clears trackers
function clearTrackers() {
  // Select all elements containing total scores and average scores
  const totalScoreSpans = document.querySelectorAll(".total-score");
  const averageScoreSpans = document.querySelectorAll(".average-score");

  // Loop through all total score spans and clear their content
  totalScoreSpans.forEach((totalScoreSpan) => {
    totalScoreSpan.textContent = ''; // Clear the total score content
  });

  // Loop through all average score spans and clear their content
  averageScoreSpans.forEach((averageScoreSpan) => {
    averageScoreSpan.textContent = ''; // Clear the average score content
  });

  const suitScoreDivs = document.querySelectorAll("[id^='suitscore-']");

  suitScoreDivs.forEach((suitScoreDiv, index) => {
    const gameNumber = index + 1; // Assuming suitscore-1 corresponds to game 1, etc.
    suitScoreDiv.innerHTML = `Suits Round ${gameNumber}`; // Reset the suit score format
  });

  //card classes should be reset in startnextgame.
}



// Show end round message
function showEndRoundMessage(score, isRuleChange) {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');
  if (isRuleChange) {
    messageBox.innerHTML = `
      <h2>Round Over!</h2>
      <p>Your score for the round was: ${score}</p>
      <div class="button-container">
      <button onclick="showRuleChangeMessage()">BIG NEWS!</button>
      </div>
    `;
  } else {
    messageBox.innerHTML = `
      <h2>Round Over!</h2>
      <p>Your score for the round was: ${score}</p>
      <div class="button-container">
        <button onclick="startGame()">We go again!</button>
      </div>
    `;
  }
  document.body.appendChild(messageBox);
}


//Show Next Round message
function showNextGameMessage() {

  if(userID) {
    set(ref(db, `participants/${userID}/stats/Game_${numGamesPlayed}/FinalScore`), { TotalScoreAcrossGames })
  }
  

  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');

  messageBox.innerHTML = `
      <h2>Game Over!</h2>
      <p>Your total score for the game was: ${TotalScoreAcrossGames}</p>
      <div class="button-container">
        <button onclick="startNextGame()">Begin game ${numGamesPlayed + 1}!</button>
      </div>
    `;

    document.body.appendChild(messageBox);
}





// Show the rule change message
function showRuleChangeMessage() {
  // Remove the existing message box (if any)
  const existingMessageBox = document.querySelector('.message-box');
  if (existingMessageBox) {
    existingMessageBox.remove();
  }

  //Update the Rule Container
  updateRuleContainer(activeScoring)
  
  // Create and append the new message box
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');
  messageBox.innerHTML = `
    <h2><span style="color: rgb(255, 255, 255); font-weight: bold;">Big news explorers!</span></h2>
    <p>The market has changed!</p>
    <p><span style="color: rgb(34, 172, 214); font-weight: bold;">Gemseekers INC</span> will now only pay for <span style="color: rgb(182, 179, 17); font-weight: bold;">${activeSuits} cards</span>.</p>
    <p>However, <span style="color: rgb(182, 179, 17); font-weight: bold;">K, Q, J, and 10s of ${activeSuits}s</span> are now worth <span style="color: rgb(156, 102, 241); font-weight: bold;">2 points!</span></p>
    <p>Also, <span style="color: rgb(182, 179, 17); font-weight: bold;">9, 8, 7, 6, 5, 4, 3 ,2 of ${activeSuits}s</span> are now worth <span style="color: rgb(66, 190, 41); font-weight: bold;">1 point!</span></p>
    <p><span style="color: rgb(228, 51, 51); font-weight: bold;">ALL other suits</span> are now worth <span style="color: rgb(228, 51, 51); font-weight: bold;">0 points!</span></p>
    <div class="button-container">
      <button onclick="startGame()">Understood! Let's go!</button>
    </div>
  `;
  document.body.appendChild(messageBox);
}

// Show end game message
function showEndGameMessage() {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');
  messageBox.innerHTML = `
    <h2>Game Over!</h2>
    <p>Thank you for playing!</p>
    <p>Final score: ${TotalScoreAcrossGames}</p>
  `;
  document.body.appendChild(messageBox);

  // Set the text content of each card to its data value
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.textContent = ''; // Clearing all card text content
    if (card.classList.contains('card')) { // Showing text content for all cards assigned card-selected classicfication
      card.textContent = card.dataset.value; 
    }
  });


  if(userID) {
    set(ref(db, `participants/${userID}/stats/Game_${numGamesPlayed}/FinalScore`), { TotalScoreAcrossGames })
  }
  
  //db.ref(`users/${userID}/stats/FinalScore`).set(TotalScoreAcrossGames); // If its the last game, write the final score for the game to the database
  
}

// Write stats to database
function writeStatsToDatabase(gameNumber) {
  if(!userID) {
    console.log("No value for user.");
    return;
  }
  //db.ref(`users/${userID}/stats/TotalScore_Game_${gameNumber}`).set(totalScore); // Write the totalscore for the game to the database
  //db.ref(`users/${userID}/stats/AvgTotalScore_Game_${gameNumber}`).set(averageTotalScores); // Write the average totalscore for the game to the database
  //db.ref(`users/${userID}/stats/Exploration_Game_${gameNumber}`).set(exploratoryMoves); // Write the exploration behavior for the game to the database
  //db.ref(`users/${userID}/stats/Exploitation_Game_${gameNumber}`).set(exploitativeMoves); // Write the exploitative behavior for the game to the database
  //db.ref(`users/${userID}/stats/PercentUnexplored_Game_${gameNumber}`).set(percentUnexplored); // Write the percent unexplored for the game to the database

  //db.ref(`users/${userID}/moves`).set(moves); // Add the move times for the game to the existing array in the databas

  set(ref(db, `participants/${userID}/stats/Game_${numGamesPlayed}/TotalScore_Round_${gameNumber}`), { totalScore })
  set(ref(db, `participants/${userID}/stats/Game_${numGamesPlayed}/AvgTotalScore_Round_${gameNumber}`), { averageTotalScores })
  set(ref(db, `participants/${userID}/stats/Game_${numGamesPlayed}/Exploration_Round_${gameNumber}`), { exploratoryMoves })
  set(ref(db, `participants/${userID}/stats/Game_${numGamesPlayed}/Exploitation_Round_${gameNumber}`), { exploitativeMoves })
  set(ref(db, `participants/${userID}/stats/Game_${numGamesPlayed}/PercentUnexplored_Round_${gameNumber}`), { percentUnexplored })

  set(ref(db, `participants/${userID}/moves/Game_${numGamesPlayed}`), { moves })
  //gameData.push([numGamesPlayed, gameNumber, totalScore, averageTotalScores, exploratoryMoves, exploitativeMoves, percentUnexplored]);

}

// Displays the correct message to transition to next game
function transitionMessages(totalScore) {
  if (numGamesPlayed > gameOfScoreChange && currentGame === roundOfScoreChange) {
    if (changeSuit === "Spades" ) {
    activeScoring = modifiedScoringRules;
    activeSuits = ["♠", "♥", "♦", "♣"][0];
    showEndRoundMessage(totalScore, true);
    }
    else if (changeSuit === "Hearts" ) {
      activeScoring = modifiedScoringRules;
      activeSuits = ["♠", "♥", "♦", "♣"][1];
      showEndRoundMessage(totalScore, true);
    }
    else if (changeSuit === "Diamonds" ) {
      activeScoring = modifiedScoringRules;
      activeSuits = ["♠", "♥", "♦", "♣"][2]; 
      showEndRoundMessage(totalScore, true);
    }
    else if (changeSuit === "Clubs" ) {
      activeScoring = modifiedScoringRules;
      activeSuits = ["♠", "♥", "♦", "♣"][3]; 
      showEndRoundMessage(totalScore, true);
    } else {
      activeScoring = modifiedScoringRules;
    activeSuits = ["♠", "♥", "♦", "♣"][Math.floor(Math.random() * 4)]; //Randomly sets on of the suits to be the active suit.
    showEndRoundMessage(totalScore, true);
    }
  } else if (currentGame === 10 && numGamesPlayed != numGames) {
    
    showNextGameMessage();
  } else if (currentGame === 10 && numGamesPlayed === numGames) {
    showEndGameMessage();
  }
    else {
      showEndRoundMessage(totalScore, false);

    }
  }


// Execute ending game functions when called
function endGame() {
  clearInterval(timerInterval); // Stop the timer

  // Assign the card-selected class to all cards that were flipped
  const flippedCards = document.querySelectorAll('.card-flipped');
  flippedCards.forEach(card => {
    card.classList.add('card-selected');
  });

  //Updating scoreboards and databases
  updateScoreTracker(currentGame, totalScore);   // Append scores to the scoretracker
  updateSuitTracker(currentGame, suitScores);   // Append scores to the suittracker

  // Write stats to database
  writeStatsToDatabase(currentGame);

  //Display end of game messages;
  transitionMessages(totalScore);
}

//*********************EVENT LISTENERS*********************** */
// Loading game
window.addEventListener('load', function() {
  showSettingsScreen()
});

// Add sound on/off toggles
const soundToggle = document.querySelector('.sound-toggle');
let isSoundOn = true;

soundToggle.addEventListener('click', () => {
  if (isSoundOn) {
    soundToggle.classList.remove('on');
    soundToggle.classList.add('off');
    soundToggle.textContent = 'Sound off 🔊';
    // Your code to mute the sound goes here
  } else {
    soundToggle.classList.remove('off');
    soundToggle.classList.add('on');
    soundToggle.textContent = 'Sound on 🔊';
    // Your code to unmute the sound goes here
  }
  
  isSoundOn = !isSoundOn;
});

// Add click event listener to each card element
cardElements.forEach((cardElement) => {
  cardElement.addEventListener("click", () => { ///////////////////////////////////////change this to 'click' for mouse click
    const isCardValid = cardElement.classList.contains("card-valid");
    if (isCardValid && timeLeft != 0) {
      
      // Flip the card, update scores and scoreboard
      flipCard(cardElement);
      updateScores(cardElement);
      updateScoreboard();
      lockOtherCardsInRow(cardElement);
    
      // Check if game is over (card is in row 8)
      const row = cardElement.parentElement.dataset.row;
      if (row === "8") {
        endGame();
      } else {
        unlockCardsInNextRow(cardElement);
      }
    
    } else {
      const message = "Card is not valid! Look for the golden keys! 🔑";
      const errorBox = document.querySelector(".error-box");
      errorBox.innerHTML = message;
      errorBox.classList.add("fade-in"); // Add the fade-in class to trigger the animation
      setTimeout(() => {
        errorBox.classList.remove("fade-in"); // Remove the fade-in class to trigger the fade-out animation
        errorBox.classList.add("fade-out"); // Add the fade-out class to trigger the animation
        setTimeout(() => {
          errorBox.classList.remove("fade-out"); // Remove the fade-out class to hide the error box completely
        }, 1000);
      }, 2000);
    }
  });
});


window.startGame = startGame;
window.showRuleChangeMessage = showRuleChangeMessage;
window.startNextGame = startNextGame;