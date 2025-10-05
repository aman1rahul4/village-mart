document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("register-form");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        // ✅ Fixed fetch call (no api variable needed)
        fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("✅ Registration successful!");
                    window.location.href = "login.html";
                } else {
                    alert("❌ " + (data.error || "Registration failed"));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Server error. Please try again later.");
            });
    });
});
