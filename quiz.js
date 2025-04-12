// Quiz Configuration
const colors = [
    ["#f79c99", "#f7d7d2"],
    ["#a2f7a2", "#d7f7d2"],
    ["#a2a2f7", "#d2d7f7"],
    ["#f7f7a2", "#f7f7c7"],
    ["#a2f7c7", "#d2f7d7"],
    ["#a2c7f7", "#d2d7f7"],
    ["#f7c7a2", "#f7d2c7"],
    ["#c7f7a2", "#d2f7a2"],
    ["#a2a2c7", "#d7d7f7"],
    ["#c7a2f7", "#d2c7f7"],
];

// Quiz Variables
let score = 0;
let currentQuestionIndex = 0;
const totalQuestions = 10;
let imageFolder = "Img"; // Default image folder
let sessionId = generateSessionId();
let playNumber = getPlayNumber();
let userAnswers = new Array(totalQuestions).fill(null);
let userConfidence = new Array(totalQuestions).fill(null);
let timerInterval;
const quizStartTime = Date.now();
let currentConfidence = null; // Track current confidence selection

// This will store our randomized image paths and their correct answers
let imageSet = [];
let correctAnswers = {};

// Initialize the quiz when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Set image folder based on user data
    const userAge = localStorage.getItem("userAge");
    const userProfession = localStorage.getItem("userProfession");

    if (userAge !== null && userProfession !== null) {
        const age = parseInt(userAge);
        if (userProfession !== "engineer") {
            if (age >= 0 && age <= 18) {
                imageFolder = "Img18";
            } else if (age >= 19 && age <= 60) {
                imageFolder = "Img60";
            } else if (age >= 61 && age <= 100) {
                imageFolder = "Img70";
            }
        }
    }
    
    // Initialize the image set (5 from R folder, 5 from F folder)
    initializeImageSet();
    
    // Create navigation
    createNavigation();
    
    // Initialize timer
    initializeTimer();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update first question
    updateQuestion();
    
    // Initialize player data in localStorage if not exists
    initPlayerData();
});

// Initialize player data in localStorage
function initPlayerData() {
    if (!localStorage.getItem('playerData')) {
        const playerData = {
            playerId: generatePlayerId(),
            scores: [],
            sessions: [],
            attempts: 0,
            formData: {
                age: localStorage.getItem("userAge") || null,
                profession: localStorage.getItem("userProfession") || null
            }
        };
        localStorage.setItem('playerData', JSON.stringify(playerData));
    }
}

function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

// Initialize the randomized image set with complete shuffling
function initializeImageSet() {
    // Total number of images available in each folder
    const totalImages = 50;
    
    // Create separate arrays for R and F folder images
    const allRImages = Array.from({length: totalImages}, (_, i) => ({
        path: `${imageFolder}/R/${i+1}.jpg`,
        answer: "Real"
    }));
    
    const allFImages = Array.from({length: totalImages}, (_, i) => ({
        path: `${imageFolder}/F/${i+1}.jpg`,
        answer: "Fake"
    }));
    
    // Shuffle both sets separately
    shuffleArray(allRImages);
    shuffleArray(allFImages);
    
    // Take first 5 from each shuffled set
    const selectedR = allRImages.slice(0, 5);
    const selectedF = allFImages.slice(0, 5);
    
    // Combine all selected images
    imageSet = [...selectedR, ...selectedF];
    
    // Shuffle the combined set again for final randomness
    shuffleArray(imageSet);
    
    // Create correct answers mapping
    imageSet.forEach((img, index) => {
        correctAnswers[index] = img.answer;
    });
    
    console.log("Selected images:", imageSet); // For debugging
}

// Fisher-Yates shuffle algorithm for complete randomization
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Navigation Functions
function createNavigation() {
    const navContainer = document.getElementById("question-nav");

    for (let i = 0; i < totalQuestions; i++) {
        let btn = document.createElement("button");
        btn.textContent = i + 1;
        btn.classList.add("nav-btn");
        btn.addEventListener("click", () => goToQuestion(i));
        navContainer.appendChild(btn);
    }
}

function goToQuestion(index) {
    currentQuestionIndex = index;
    currentConfidence = userConfidence[index]; // Load confidence for this question
    updateQuestion();
}

// Timer Functions
function initializeTimer() {
    const timerElement = document.getElementById("timer");

    let totalTime = 600;
    function updateTimer() {
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (totalTime <= 60) {
            timerElement.style.color = "red";
        }

        if (totalTime <= 0) {
            clearInterval(timerInterval);
            endQuiz();
        }
        totalTime--;
    }
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

// Question Handling
function updateQuestion() {
    setGradientBackground();
    document.getElementById("question-title").textContent = "Question " + (currentQuestionIndex + 1);
    document.getElementById("quiz-image").src = imageSet[currentQuestionIndex].path;
    
    // Update confidence button states
    updateConfidenceButtons();
}

function checkAnswer(isReal) {
    const answer = isReal ? "Real" : "Fake";
    userAnswers[currentQuestionIndex] = answer;
    
    // Update score
    score = 0;
    userAnswers.forEach((ans, index) => {
        if (ans === correctAnswers[index]) {
            score += 10;
        }
    });
    
    updateScore();
    markAnswered(currentQuestionIndex);
    updateProgress();
    
    // Auto-proceed if confidence already selected
    if (currentConfidence !== null) {
        goToNextQuestion();
    }
}

function setConfidence(confidence) {
    currentConfidence = confidence;
    userConfidence[currentQuestionIndex] = confidence;
    
    // Update button states
    updateConfidenceButtons();
    
    // Auto-proceed if answer already selected
    if (userAnswers[currentQuestionIndex] !== null) {
        goToNextQuestion();
    }
}

function updateConfidenceButtons() {
    const buttons = document.querySelectorAll(".confidence-btn");
    buttons.forEach(btn => btn.classList.remove("selected"));
    
    if (currentConfidence === "Confident") {
        document.getElementById("confident-btn").classList.add("selected");
    } else if (currentConfidence === "Not Sure") {
        document.getElementById("not-sure-btn").classList.add("selected");
    } else if (currentConfidence === "Not Confident") {
        document.getElementById("not-confident-btn").classList.add("selected");
    }
}

function goToNextQuestion() {
    let nextIndex = findNextUnanswered(currentQuestionIndex);
    if (nextIndex !== -1) {
        currentQuestionIndex = nextIndex;
        currentConfidence = userConfidence[nextIndex]; // Load confidence for next question
        updateQuestion();
    } else {
        showReviewScreen();
    }
}

function findNextUnanswered(current) {
    for (let i = current + 1; i < totalQuestions; i++) {
        if (userAnswers[i] === null) return i;
    }
    for (let i = 0; i < current; i++) {
        if (userAnswers[i] === null) return i;
    }
    return -1;
}

function markAnswered(index) {
    const navButtons = document.querySelectorAll(".nav-btn");
    const button = navButtons[index];
    
    button.classList.remove("answered", "correct", "incorrect");
    
    if (userAnswers[index] !== null) {
        if (userAnswers[index] === correctAnswers[index]) {
            button.classList.add("correct");
        } else {
            button.classList.add("incorrect");
        }
    }
}

function updateProgress() {
    let answeredCount = userAnswers.filter(answer => answer !== null).length;
    const progress = (answeredCount / totalQuestions) * 100;
    document.getElementById("progress-bar-filled").style.width = progress + "%";
    document.getElementById("progress-bar-filled").textContent = Math.round(progress) + "%";
}

function updateScore() {
    document.getElementById("score").textContent = score;
}

// Review Functions
function showReviewScreen() {
    const quizContainer = document.querySelector(".quiz-container");
    quizContainer.innerHTML = `
        <div class="review-container">
            <h2>Review Your Answers</h2>
            <p>Check your answers before submitting. You can change any answer.</p>
            
            ${imageSet.map((img, index) => `
                <div class="review-item">
                    <h4>Question ${index + 1}</h4>
                    <img class="review-image" src="${img.path}" alt="Question ${index + 1}">
                    <div class="review-answer">
                        Your answer: ${userAnswers[index] || "Not answered yet"}
                        ${userAnswers[index] ? `(${userConfidence[index] || "No confidence level"})` : ''}
                    </div>
                    <div class="review-buttons">
                        <button class="review-change-btn" onclick="changeAnswer(${index}, 'Real')">Change to Real</button>
                        <button class="review-change-btn" onclick="changeAnswer(${index}, 'Fake')">Change to Fake</button>
                    </div>
                </div>
            `).join('')}
            
            <div style="margin-top: 20px;">
                <button class="confidence-btn" style="background-color: #2196F3;" onclick="submitFinalAnswers()">Submit Final Answers</button>
            </div>
        </div>
    `;
}

function changeAnswer(index, answer) {
    userAnswers[index] = answer;
    
    // Update the answer display
    const answerDisplay = document.querySelectorAll(".review-answer")[index];
    answerDisplay.textContent = `Your answer: ${answer}`;
    
    // Update navigation button
    const navButtons = document.querySelectorAll(".nav-btn");
    if (navButtons.length > 0) {
        navButtons[index].classList.remove("correct", "incorrect");
        if (answer === correctAnswers[index]) {
            navButtons[index].classList.add("correct");
        } else {
            navButtons[index].classList.add("incorrect");
        }
    }
    
    // Recalculate score
    score = 0;
    userAnswers.forEach((ans, i) => {
        if (ans === correctAnswers[i]) {
            score += 10;
        }
    });
}

function submitFinalAnswers() {
    // Calculate final score
    score = 0;
    imageSet.forEach((img, index) => {
        if (userAnswers[index] === correctAnswers[index]) {
            score += 10;
        }
    });
    
    // End the quiz
    endQuiz();
}

// End Quiz Functions
function endQuiz() {
    clearInterval(timerInterval);
    const quizEndTime = Date.now();
    const timeTaken = Math.floor((quizEndTime - quizStartTime) / 1000);
    
    // Prepare the answers for reporting
    const answersReport = {};
    imageSet.forEach((img, index) => {
        answersReport[index] = {
            imagePath: img.path,
            answer: userAnswers[index],
            confidence: userConfidence[index],
            correct: userAnswers[index] === correctAnswers[index]
        };
    });

    const quizData = {
        timestamp: new Date().toISOString(),
        age: localStorage.getItem("userAge") || "unknown",
        profession: localStorage.getItem("userProfession") || "unknown",
        score: score,
        answers: answersReport,
        timeTaken: timeTaken,
        sessionId: sessionId,
        playNumber: playNumber,
        imageSet: imageSet
    };

    // Store quiz data in localStorage
    storeQuizData(quizData);
    
    // Send data to Google Sheets
    sendDataToGoogleSheets(quizData);

    document.querySelector(".quiz-container").innerHTML = `
        <div class="result-container">
            <h2>Quiz Complete!</h2>
            <p>Score: <strong>${score}/100</strong></p>
            <p>Time Taken: <strong>${Math.floor(timeTaken/60)}m ${timeTaken%60}s</strong></p>
            <div class="stars">${getStarRating()}</div>
            <div class="end-container">
                <button class="end-btn" id="finish-btn" onclick="finishGame()">Finish</button>
                <button class="end-btn" id="playagain-btn" onclick="playAgain()">Play Again</button>
            </div>
        </div>
    `;
}

// Store quiz data in localStorage
function storeQuizData(quizData) {
    // Get existing player data
    const playerData = JSON.parse(localStorage.getItem('playerData'));
    
    // Update player data with new quiz results
    playerData.scores.push(quizData.score);
    playerData.sessions.push({
        sessionId: quizData.sessionId,
        timestamp: quizData.timestamp,
        score: quizData.score,
        timeTaken: quizData.timeTaken
    });
    playerData.attempts = (playerData.attempts || 0) + 1;
    
    // Save updated player data
    localStorage.setItem('playerData', JSON.stringify(playerData));
    
    // Also store the complete quiz data separately
    localStorage.setItem('quizPerformance', JSON.stringify(quizData));
}

// Send data to Google Sheets - Updated implementation
function sendDataToGoogleSheets(quizData) {
    // Prepare the data in URL-encoded format
    let formData = `timestamp=${encodeURIComponent(quizData.timestamp)}`;
    formData += `&playerId=${encodeURIComponent(JSON.parse(localStorage.getItem('playerData')).playerId)}`;
    formData += `&age=${encodeURIComponent(quizData.age)}`;
    formData += `&profession=${encodeURIComponent(quizData.profession)}`;
    formData += `&score=${quizData.score}`;
    formData += `&timeTaken=${quizData.timeTaken}`;
    formData += `&sessionId=${encodeURIComponent(quizData.sessionId)}`;
    formData += `&playNumber=${quizData.playNumber}`;
    
    // Add answers data
    for (let i = 0; i < totalQuestions; i++) {
        if (quizData.answers[i]) {
            formData += `&q${i+1}_answer=${encodeURIComponent(quizData.answers[i].answer)}`;
            formData += `&q${i+1}_confidence=${encodeURIComponent(quizData.answers[i].confidence || '')}`;
            formData += `&q${i+1}_correct=${quizData.answers[i].correct ? '1' : '0'}`;
        }
    }

    // Use your form's script URL
    const scriptURL = 'https://script.google.com/macros/s/AKfycbysmeEcCVi6McEbrt8S25uXh3yXtDPhX9YMB1_TIiFukh4wp74Lmu0doGn0QWG37Z7rZA/exec';
    
    fetch(scriptURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getStarRating() {
    return score >= 80 ? "⭐️⭐️⭐️" : score >= 50 ? "⭐️⭐️☆" : "⭐️☆☆";
}

// Utility Functions
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function getPlayNumber() {
    let playNumber = localStorage.getItem('playNumber');
    if (!playNumber) {
        playNumber = 1;
    } else {
        playNumber = parseInt(playNumber) + 1;
    }
    localStorage.setItem('playNumber', playNumber);
    return playNumber;
}

function setGradientBackground() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    const gradient = `linear-gradient(to bottom, ${colors[randomIndex][0]}, ${colors[randomIndex][1]})`;
    document.body.style.background = gradient;
}

function setupEventListeners() {
    document.getElementById("real-btn").addEventListener("click", () => checkAnswer(true));
    document.getElementById("fake-btn").addEventListener("click", () => checkAnswer(false));
    
    document.getElementById("confident-btn").addEventListener("click", () => setConfidence("Confident"));
    document.getElementById("not-sure-btn").addEventListener("click", () => setConfidence("Not Sure"));
    document.getElementById("not-confident-btn").addEventListener("click", () => setConfidence("Not Confident"));
    
    document.getElementById("review-btn").addEventListener("click", showReviewScreen);
}

function finishGame() {
    window.location.href = "photo-learning.html";
}

function playAgain() {
    let attempt = parseInt(localStorage.getItem("attempt") || "1", 10);
    attempt++;
    localStorage.setItem("attempt", attempt);
    window.location.reload();
}