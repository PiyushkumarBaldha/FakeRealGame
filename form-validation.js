document.addEventListener("DOMContentLoaded", function() {
    const submitBtn = document.getElementById("submit-btn");
    const professionInput = document.getElementById("profession");
    const ageInput = document.getElementById("age");
    const playerIdInput = document.getElementById("player-id");

    // Load the last player ID from localStorage or start at 1
    let playerId = parseInt(localStorage.getItem("lastPlayerId")) || 1;
    playerIdInput.value = playerId;

    submitBtn.addEventListener("click", function(event) {
        event.preventDefault();

        let isValid = true;
        const ageValue = parseInt(ageInput.value);

        // Reset error styles
        professionInput.style.boxShadow = '';
        ageInput.style.boxShadow = '';
        professionInput.style.borderColor = '';
        ageInput.style.borderColor = '';

        if (professionInput.value === "") {
            professionInput.style.borderColor = "red";
            professionInput.style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.5)";
            isValid = false;
        }

        if (ageInput.value === "" || isNaN(ageValue) || ageValue < 10 || ageValue > 100) {
            ageInput.style.borderColor = "red";
            ageInput.style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.5)";
            isValid = false;
        }

        if (isValid) {
            // Increment the player ID for next user
            localStorage.setItem("lastPlayerId", playerId + 1);

            // Prepare form data in URL-encoded format like your reference code
            let formData = `timestamp=${encodeURIComponent(new Date().toISOString())}`;
            formData += `&playerId=${playerId}`;
            formData += `&profession=${encodeURIComponent(professionInput.value)}`;
            formData += `&age=${ageValue}`;
            formData += `&status=${encodeURIComponent(document.getElementById("status").value)}`;

            // Send data to Google Sheets
            const scriptURL = 'https://script.google.com/macros/s/AKfycbwAF29cXO-tifG2K27M7PmvhASR-6A_RKFlw0dheIWFSjtQT60gKMC379YBlrpxJXsyBQ/exec';
            
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
                window.location.href = "quiz.html";
            })
            .catch(error => {
                console.error('Error:', error);
                // Still redirect even if there's an error with Google Sheets
                window.location.href = "quiz.html";
            });
        }
    });
});