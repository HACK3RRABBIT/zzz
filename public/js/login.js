document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem('authToken', token);
                window.location.href = '/';
            } else {
                errorMessage.textContent = 'Invalid username or password';
            }
        } catch (error) {
            console.error('Login failed:', error);
            errorMessage.textContent = 'An error occurred. Please try again.';
        }
    });
});