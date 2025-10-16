document.addEventListener('DOMContentLoaded', () => {
    const movieTitle = document.getElementById('movie-title');
    const moviePoster = document.getElementById('movie-poster');
    const episodesTable = document.getElementById('episodes-table');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');

    const API_URL = 'http://localhost:3000/api';
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    let movieData;

    const fetchMovieDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/movies`);
            const movies = await response.json();
            movieData = movies.find(m => m.id === movieId);
            if (movieData) {
                renderMovieDetails();
            } else {
                // Handle movie not found
                document.body.innerHTML = '<h1>Movie not found</h1>';
            }
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    };

    const renderMovieDetails = () => {
        movieTitle.textContent = movieData.name;
        if (movieData.poster) {
            moviePoster.src = movieData.poster.startsWith('http') ? movieData.poster : `http://localhost:3000${movieData.poster}`;
        } else {
            moviePoster.style.display = 'none';
        }
        renderEpisodesTable();
    };

    const renderEpisodesTable = (isEditing = false) => {
        episodesTable.innerHTML = '';
        let episodeIndex = 0;
        for (let i = 0; i < movieData.seasons; i++) {
            const season = i + 1;
            const table = document.createElement('table');
            table.innerHTML = `<caption>Season ${season}</caption>
                               <thead><tr><th>Episode</th><th>Link</th><th>Watched</th></tr></thead>`;
            const tbody = document.createElement('tbody');
            for (let j = 0; j < movieData.episodesPerSeason[i]; j++) {
                const episodeNum = j + 1;
                const episode = movieData.episodes[episodeIndex] || { link: '', watched: false };
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${episodeNum}</td>
                    <td>${isEditing ? `<input type="text" value="${episode.link}" data-episode-index="${episodeIndex}">` : episode.link}</td>
                    <td><input type="checkbox" ${episode.watched ? 'checked' : ''} data-episode-index="${episodeIndex}" ${isEditing ? 'disabled' : ''}></td>
                `;
                tbody.appendChild(row);
                episodeIndex++;
            }
            table.appendChild(tbody);
            episodesTable.appendChild(table);
        }

        // Handle checkbox changes
        episodesTable.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                const index = e.target.dataset.episodeIndex;
                movieData.episodes[index] = movieData.episodes[index] || {};
                movieData.episodes[index].watched = e.target.checked;
                await saveMovieData();
                renderEpisodesTable(); // Re-render to reflect style changes
            });
        });
    };

    const saveMovieData = async () => {
        try {
            await fetch(`${API_URL}/movies/${movieId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieData)
            });
        } catch (error) {
            console.error('Error saving movie data:', error);
        }
    };

    editBtn.addEventListener('click', () => {
        renderEpisodesTable(true);
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    });

    saveBtn.addEventListener('click', async () => {
        episodesTable.querySelectorAll('input[type="text"]').forEach(input => {
            const index = input.dataset.episodeIndex;
            movieData.episodes[index] = movieData.episodes[index] || {};
            movieData.episodes[index].link = input.value;
        });
        await saveMovieData();
        renderEpisodesTable(false);
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
    });


    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            editBtn.style.display = 'none';
            saveBtn.style.display = 'none';
        } else {
            editBtn.style.display = 'inline-block';
        }
    };

    fetchMovieDetails();
    checkAuth();
});