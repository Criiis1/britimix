// Spotify API Authentication
const client_id = '0aa5702ec8b74370973a296462924424';  // Añade tu client_id de Spotify
const redirect_uri = 'https://criiis1.github.io/britimix/'; // Tu URL de redirección

const loginBtn = document.getElementById('loginBtn');
loginBtn.addEventListener('click', () => {
    const scope = 'user-read-private user-read-email';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${client_id}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    window.location.href = authUrl;
});

/*
// Mostrar mensaje de bienvenida
Swal.fire({
    title: 'Bienvenido a BritoMix',
    text: 'Escucha tu música favorita en cualquier lugar',
    icon: 'info',
    confirmButtonText: '¡Vamos!'
});
*/

// Obtener token de autenticación
const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce(function (initial, item) {
        if (item) {
            var parts = item.split('=');
            initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
    }, {});
window.location.hash = '';

// Usar el token para buscar playlists o canciones
if (hash.access_token) {
    fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            'Authorization': 'Bearer ' + hash.access_token
        }
    })
    .then(response => response.json())
    .then(data => {
        const playlistDiv = document.getElementById('playlist');
        data.items.forEach(playlist => {
            playlistDiv.innerHTML += `<div class="playlist">
                <h3>${playlist.name}</h3>
            </div>`;
        });
    });
}

// Obtener datos del perfil del usuario
if (hash.access_token) {
    fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': 'Bearer ' + hash.access_token
        }
    })
    .then(response => response.json())
    .then(data => {
        const userProfile = document.createElement('div');
        userProfile.innerHTML = `
            <h3>Bienvenido, ${data.display_name}</h3>
            <p>Email: ${data.email}</p>
            <img src="${data.images[0]?.url}" alt="Profile Image" width="100">
        `;
        document.body.appendChild(userProfile);
    });
}

const player = document.getElementById('audio-player');

function playTrack(trackUri) {
    const audio = new Audio(trackUri);
    audio.play();
    Swal.fire('Reproduciendo canción', '', 'success');
}

// Controles
document.getElementById('playBtn').addEventListener('click', () => {
    playTrack('URL_DE_LA_CANCION');
});

const searchForm = document.getElementById('search-form');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = document.getElementById('search-input').value;
    
    fetch(`https://api.spotify.com/v1/search?q=${query}&type=track,artist,album`, {
        headers: {
            'Authorization': 'Bearer ' + hash.access_token
        }
    })
    .then(response => response.json())
    .then(data => {
        const results = data.tracks.items.map(track => `<div>${track.name} by ${track.artists[0].name}</div>`);
        document.getElementById('search-results').innerHTML = results.join('');
    });
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker registrado con éxito:', registration);
    }).catch((error) => {
        console.log('Registro de Service Worker fallido:', error);
    });
}

const CACHE_NAME = 'britoMix-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

Notification.requestPermission().then(function(permission) {
    if (permission === 'granted') {
        new Notification('¡Nuevas Canciones Disponibles!', {
            body: 'Explora las últimas canciones añadidas a tu playlist favorita.',
            icon: '/path-to-icon.png'
        });
    }
});

function showSuccessAlert(message) {
    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: message
    });
}

function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
    });
}

/*
const audio = new Audio();
const volumeControl = document.getElementById('volume-control');

volumeControl.addEventListener('input', (event) => {
    audio.volume = event.target.value / 100;
});
*/

const playlists = {};  // Object to store playlists

// Crear una nueva lista de reproducción
function createPlaylist(name) {
    if (!playlists[name]) {
        playlists[name] = [];
        Swal.fire('Lista de reproducción creada', `La lista ${name} ha sido creada.`, 'success');
    } else {
        Swal.fire('Error', 'La lista de reproducción ya existe.', 'error');
    }
}

// Añadir canción a lista de reproducción
function addToPlaylist(track, playlistName) {
    if (playlists[playlistName]) {
        playlists[playlistName].push(track);
        Swal.fire('Canción añadida', `La canción ha sido añadida a ${playlistName}`, 'success');
    } else {
        Swal.fire('Error', 'La lista de reproducción no existe.', 'error');
    }
}

// Mostrar listas de reproducción
function showPlaylists() {
    let content = '';
    Object.keys(playlists).forEach(playlist => {
        content += `<div><strong>${playlist}</strong>: ${playlists[playlist].length} canciones</div>`;
    });
    document.getElementById('playlists-section').innerHTML = content;
}

// Crear nueva playlist desde el formulario
document.getElementById('createPlaylistForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const playlistName = document.getElementById('playlistName').value;
    createPlaylist(playlistName);
    showPlaylists();
});

const audio = new Audio('track.mp3');
const progressBar = document.getElementById('track-progress');
const currentTimeElement = document.getElementById('current-time');
const totalTimeElement = document.getElementById('total-time');

audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    const duration = audio.duration;

    progressBar.value = (currentTime / duration) * 100;
    currentTimeElement.textContent = formatTime(currentTime);
    totalTimeElement.textContent = formatTime(duration);
});

progressBar.addEventListener('input', () => {
    const newTime = (progressBar.value / 100) * audio.duration;
    audio.currentTime = newTime;
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

const history = [];

function playTrack(trackUri, trackName) {
    const audio = new Audio(trackUri);
    audio.play();
    Swal.fire('Reproduciendo canción', trackName, 'success');
    
    // Añadir canción al historial
    history.push(trackName);
    showHistory();
}

function showHistory() {
    const historySection = document.getElementById('history-section');
    historySection.innerHTML = history.map(song => `<div>${song}</div>`).join('');
}

function searchSpotify(query) {
    fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
        headers: {
            'Authorization': 'Bearer ' + hash.access_token
        }
    })
    .then(response => response.json())
    .then(data => {
        const results = data.tracks.items.map(track => `
            <div>
                <strong>${track.name}</strong> by ${track.artists[0].name}
                <button onclick="playTrack('${track.preview_url}', '${track.name}')">Reproducir</button>
            </div>`
        ).join('');
        document.getElementById('search-results').innerHTML = results;
    });
}

const collaborativePlaylists = {};  // Para almacenar playlists colaborativas

function createCollaborativePlaylist(name) {
    if (!collaborativePlaylists[name]) {
        collaborativePlaylists[name] = { tracks: [], collaborators: [] };
        Swal.fire('Playlist colaborativa creada', `La lista ${name} ha sido creada`, 'success');
    } else {
        Swal.fire('Error', 'La playlist ya existe', 'error');
    }
}

function addTrackToCollaborativePlaylist(playlistName, track) {
    if (collaborativePlaylists[playlistName]) {
        collaborativePlaylists[playlistName].tracks.push(track);
        Swal.fire('Canción añadida', `Canción añadida a ${playlistName}`, 'success');
    } else {
        Swal.fire('Error', 'La playlist colaborativa no existe', 'error');
    }
}

// Permitir que los usuarios agreguen canciones
function addCollaborator(playlistName, collaborator) {
    if (collaborativePlaylists[playlistName]) {
        collaborativePlaylists[playlistName].collaborators.push(collaborator);
        Swal.fire('Colaborador añadido', `${collaborator} puede añadir canciones a ${playlistName}`, 'success');
    }
}

function showRelatedTracks(trackId) {
    fetch(`https://api.spotify.com/v1/tracks/${trackId}/related-artists`, {
        headers: {
            'Authorization': 'Bearer ' + hash.access_token
        }
    })
    .then(response => response.json())
    .then(data => {
        const relatedTracks = data.tracks.map(track => `<div>${track.name} by ${track.artists[0].name}</div>`);
        document.getElementById('related-tracks-section').innerHTML = relatedTracks.join('');
    });
}

const themeSettings = {
    dark: { background: '#121212', color: '#ffffff' },
    light: { background: '#ffffff', color: '#000000' },
};

function switchTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty('--background-color', themeSettings[theme].background);
    root.style.setProperty('--text-color', themeSettings[theme].color);
}

// Evento para cambiar tema
document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.style.getPropertyValue('--background-color') === '#121212' ? 'light' : 'dark';
    switchTheme(currentTheme);
});

document.getElementById('logout-btn').addEventListener('click', () => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Tu sesión se cerrará y no podrás recuperar esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar sesión'
    }).then((result) => {
        if (result.isConfirmed) {
            // Lógica para cerrar sesión
            Swal.fire(
                '¡Cerrado!',
                'Tu sesión ha sido cerrada correctamente.',
                'success'
            )
        }
    });
});

// Ejemplo básico para búsqueda de canciones con la API de Spotify
document.getElementById('search-btn').addEventListener('click', async () => {
    const query = document.getElementById('song-search').value;

    if (query) {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
            headers: {
                'Authorization': 'Bearer YOUR_SPOTIFY_ACCESS_TOKEN'
            }
        });
        const data = await response.json();
        console.log(data.tracks.items);  // Aquí se mostrarían los resultados en consola o interfaz
    }
});

function showRecommendations() {
    Swal.fire({
        title: 'Recomendaciones para ti',
        html: `
            <p>Te recomendamos escuchar:</p>
            <ul>
                <li>Artista 1</li>
                <li>Artista 2</li>
                <li>Artista 3</li>
            </ul>
        `,
        icon: 'info',
        confirmButtonText: 'Genial'
    });
}

// Simulación de recomendaciones después de escuchar algunas canciones
setTimeout(showRecommendations, 5000);  // Se activa tras un tiempo de uso

let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // Hacia abajo: ocultar navbar
        navbar.style.top = '-80px';  // Mueve la navbar hacia arriba para ocultarla
    } else {
        // Hacia arriba: mostrar navbar
        navbar.style.top = '0';
    }
    
    lastScrollTop = scrollTop;  // Actualiza la posición del último scroll
});

