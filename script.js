const API_BASE = "https://saavn.sumit.co/api";
const PROXY = "https://api.allorigins.win/get?url=";
const audio = document.getElementById('audioPlayer');

// Start with trending music
window.onload = () => { searchSongs("Top Bollywood"); };

// Search Trigger
document.getElementById('searchBtn').onclick = () => {
    const q = document.getElementById('searchInput').value;
    if(q) {
        document.getElementById('viewTitle').innerText = `Results for "${q}"`;
        searchSongs(q);
    }
};

async function searchSongs(query) {
    // Force HTTPS to avoid 'Mixed Content' blocks on Vercel
    const API_URL = `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            mode: 'cors', // Explicitly ask for CORS
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        renderResults(data.data.results);
    } catch (error) {
        console.error("Fetch failed:", error);
        // Show a user-friendly message instead of a blank screen
        document.getElementById('resultsGrid').innerHTML = 
            "<p style='color:red;'>Server busy. Please try again in 10 seconds.</p>";
    }
}

function renderResults(songs) {
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = "";
    
    songs.forEach(song => {
        const div = document.createElement('div');
        div.className = 'song-card';
        // Ensure image is HTTPS
        const thumb = song.image[2].url.replace("http://", "https://");
        div.innerHTML = `<img src="${thumb}"><p>${song.name}</p>`;
        div.onclick = () => playThis(song);
        grid.appendChild(div);
    });
}

function playThis(song) {
    // Pick the best quality
    const dl = song.downloadUrl.find(l => l.quality === "320kbps") || song.downloadUrl[song.downloadUrl.length - 1];
    const streamLink = dl.url.replace("http://", "https://");
    
    audio.src = streamLink;
    audio.play();

    // Update Player UI
    const art = song.image[2].url.replace("http://", "https://");
    document.getElementById('currentArt').src = art;
    document.getElementById('currentTitle').innerText = song.name;
    document.getElementById('currentArtist').innerText = song.artists.primary[0].name;

    document.getElementById('overlayArt').src = art;
    document.getElementById('overlayTitle').innerText = song.name;
    document.getElementById('overlayArtist').innerText = song.artists.primary[0].name;

    // Set Download Action
    document.getElementById('downloadBtn').onclick = () => {
        window.open(streamLink, '_blank');
    };
}

// Player Progress logic
audio.ontimeupdate = () => {
    const bar = document.getElementById('progressBar');
    if(!isNaN(audio.duration)) {
        bar.value = (audio.currentTime / audio.duration) * 100;
        document.getElementById('curTime').innerText = fmt(audio.currentTime);
        document.getElementById('durTime').innerText = fmt(audio.duration);
    }
};

function seek() {
    audio.currentTime = (document.getElementById('progressBar').value / 100) * audio.duration;
}

function fmt(s) {
    let m = Math.floor(s/60);
    let sec = Math.floor(s%60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

function toggleOverlay() {
    document.getElementById('playerOverlay').classList.toggle('active');
}

