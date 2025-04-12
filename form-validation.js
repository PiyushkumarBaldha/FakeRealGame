document.addEventListener("DOMContentLoaded", function() {
    const submitBtn = document.getElementById("submit-btn");
    const professionInput = document.getElementById("profession");
    const ageInput = document.getElementById("age");

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
            // Redirect to quiz page if form is valid
            window.location.href = "quiz.html";
        }
    });
});