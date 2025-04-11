document.addEventListener('DOMContentLoaded', function() {
  // Display quiz results
  try {
      const quizData = JSON.parse(localStorage.getItem('quizPerformance')) || {};
      
      const resultsDiv = document.getElementById('quiz-results');
      
      if (quizData.score !== undefined) {
          resultsDiv.innerHTML = `
              <h3>Your Quiz Results</h3>
              <p>Score: ${quizData.score}/100</p>
              <div class="stars">${getStarRating(quizData.score)}</div>
              <p>Time Taken: ${Math.floor(quizData.timeTaken/60)}m ${quizData.timeTaken%60}s</p>
              <div class="end-container">
                  <button class="end-btn" id="playagain-btn">Play Again</button>
              </div>
          `;
          
          // Add event listener to play again button
          document.getElementById('playagain-btn').addEventListener('click', playAgain);
      } else {
          resultsDiv.innerHTML = `
              <h3>No Quiz Results Found</h3>
              <p>Complete the quiz to see your results here.</p>
              <div class="end-container">
                  <button class="end-btn" onclick="window.location.href='quiz.html'">Take Quiz</button>
              </div>
          `;
      }
  } catch (e) {
      console.error("Error loading quiz results:", e);
      document.getElementById('quiz-results').innerHTML = `
          <h3>Error Loading Results</h3>
          <p>There was an error loading your quiz results.</p>
      `;
  }
  
  // Set a random learning image
  const randomImage = Math.floor(Math.random() * 5) + 1;
  document.getElementById('featured-image').src = `Img/learning${randomImage}.jpg`;

  // Add event listeners to option cards
  document.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', function() {
          const topic = this.getAttribute('data-topic');
          showInfo(topic);
          
          // Mark card as completed
          this.classList.add('completed');
      });
  });

  // Add event listener to back button
  document.getElementById('back-btn').addEventListener('click', goBack);
});

function getStarRating(score) {
  return score >= 80 ? "⭐️⭐️⭐️" : score >= 50 ? "⭐️⭐️☆" : "⭐️☆☆";
}

function showInfo(topic) {
  // Hide all info sections first
  document.querySelectorAll('.info-section').forEach(section => {
      section.style.display = 'none';
  });
  
  // Show the selected info section
  const infoSection = document.getElementById(`${topic}-info`);
  if (infoSection) {
      infoSection.style.display = 'block';
      infoSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function goBack() {
  window.location.href = 'afterQuiz.html';
}

function playAgain() {
  let attempt = parseInt(localStorage.getItem("attempt") || "1", 10);
  attempt++;
  localStorage.setItem("attempt", attempt);
  window.location.href = "quiz.html";
}