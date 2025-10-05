document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Needed for session cookie
        body: JSON.stringify({ email, password })  // This is critical
    });

    const result = await res.json();

    if (res.ok) {
        alert('Login successful!');
        window.location.href = '/index.html';  // Redirect to a success page
    } else {
        alert(result.error || 'Login failed');
    }
});
