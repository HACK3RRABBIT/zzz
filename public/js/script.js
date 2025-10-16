document.addEventListener('DOMContentLoaded', () => {
    const movieList = document.getElementById('movie-list');
    const addMovieBtn = document.getElementById('add-movie-btn');
    const modal = document.getElementById('add-movie-modal');
    const closeBtn = document.querySelector('.close-btn');
    const addMovieForm = document.getElementById('add-movie-form');
    const seasonsInput = document.getElementById('seasons');
    const seasonEpisodesDiv = document.getElementById('season-episodes');
    const themeSelect = document.getElementById('theme-select');

    const API_URL = 'http://localhost:3000/api';

    // Fetch and display movies
    const fetchMovies = async () => {
        try {
            const response = await fetch(`${API_URL}/movies`);
            const movies = await response.json();
            movieList.innerHTML = '';
            movies.forEach(movie => {
                const movieEl = document.createElement('div');
                movieEl.classList.add('movie-item');
                movieEl.innerHTML = `
                    <a href="/movie.html?id=${movie.id}">${movie.name}</a>
                    <div class="poster-preview"></div>
                `;

                const posterPreview = movieEl.querySelector('.poster-preview');
                if (movie.poster) {
                    const img = document.createElement('img');
                    img.src = movie.poster.startsWith('http') ? movie.poster : `http://localhost:3000${movie.poster}`;
                    posterPreview.appendChild(img);
                }

                movieList.appendChild(movieEl);
            });
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    // Show/hide modal
    addMovieBtn.addEventListener('click', () => modal.style.display = 'block');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle season input change
    seasonsInput.addEventListener('input', () => {
        const seasonCount = parseInt(seasonsInput.value, 10);
        seasonEpisodesDiv.innerHTML = '';
        if (seasonCount > 0) {
            for (let i = 1; i <= seasonCount; i++) {
                const label = document.createElement('label');
                label.textContent = `Season ${i} Episodes:`;
                const input = document.createElement('input');
                input.type = 'number';
                input.id = `season-${i}-episodes`;
                input.min = '1';
                input.required = true;
                seasonEpisodesDiv.appendChild(label);
                seasonEpisodesDiv.appendChild(input);
            }
        }
    });

    // Handle form submission
    addMovieForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const masterLink = document.getElementById('masterLink').value;
        const seasons = parseInt(document.getElementById('seasons').value, 10);
        const posterUrl = document.getElementById('posterUrl').value;
        const posterUpload = document.getElementById('posterUpload').files[0];

        let poster = posterUrl;
        if (posterUpload) {
            const formData = new FormData();
            formData.append('poster', posterUpload);
            try {
                const response = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                poster = result.filePath;
            } catch (error) {
                console.error('Error uploading file:', error);
                return;
            }
        }

        const episodesPerSeason = [];
        if (seasons > 0) {
            for (let i = 1; i <= seasons; i++) {
                const episodeCount = document.getElementById(`season-${i}-episodes`).value;
                episodesPerSeason.push(parseInt(episodeCount, 10));
            }
        }

        const newMovie = {
            name,
            masterLink,
            seasons,
            episodesPerSeason,
            poster,
            episodes: [] // Initialize episodes array
        };

        try {
            await fetch(`${API_URL}/movies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMovie)
            });
            fetchMovies();
            modal.style.display = 'none';
            addMovieForm.reset();
            seasonEpisodesDiv.innerHTML = '';
        } catch (error) {
            console.error('Error adding movie:', error);
        }
    });

    // Theme switcher
    themeSelect.addEventListener('change', (e) => {
        document.body.className = `${e.target.value}-theme`;
    });

    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            addMovieBtn.style.display = 'none';
        } else {
            addMovieBtn.style.display = 'block';
        }
    };

    // Initial load
    fetchMovies();
    checkAuth();
    document.body.className = 'light-theme';
});