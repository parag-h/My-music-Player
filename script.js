const API_BASE = "https://saavn.sumit.co/api";
const audio = document.getElementById('audioPlayer');

// Start by showing trending songs
window.onload = () => { searchSongs("Latest Hits"); };

document.getElementById('searchBtn').onclick = () => {
    const q = document.getElementById('searchInput').value;
    if(q) {
        document.getElementById('viewTitle').innerText = "Search Results";
        searchSongs(q);
    }
};

async function searchSongs(query) {
    const res = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}`);
    const json = await res.json();
    const songs = json.data.results;
    
    const grid = document.getElementById('resultsGrid');
    grid.innerHTML = "";
    
    songs.forEach(song => {
        const div = document.createElement('div');
        div.className = 'song-card';
        div.innerHTML = `<img src="${song.image[2].url}"><p>${song.name}</p>`;
        div.onclick = () => startMusic(song);
        grid.appendChild(div);
    });
}

function startMusic(song) {
    const link320 = song.downloadUrl.find(l => l.quality === "320kbps").url;
    audio.src = link320;
    audio.play();

    // Update UI
    document.getElementById('currentArt').src = song.image[1].url;
    document.getElementById('currentTitle').innerText = song.name;
    document.getElementById('currentArtist').innerText = song.artists.primary[0].name;

    document.getElementById('overlayArt').src = song.image[2].url;
    document.getElementById('overlayTitle').innerText = song.name;
    document.getElementById('overlayArtist').innerText = song.artists.primary[0].name;

    // Download Button
    document.getElementById('downloadBtn').onclick = () => {
        const a = document.createElement('a');
        a.href = link320;
        a.download = `${song.name}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
}

// Progress Bar Logic
audio.ontimeupdate = () => {
    const prog = document.getElementById('progressBar');
    if(!isNaN(audio.duration)) {
        prog.value = (audio.currentTime / audio.duration) * 100;
        document.getElementById('curTime').innerText = format(audio.currentTime);
        document.getElementById('durTime').innerText = format(audio.duration);
    }
};

function seek() {
    audio.currentTime = (document.getElementById('progressBar').value / 100) * audio.duration;
}

function format(s) {
    let m = Math.floor(s/60);
    let sec = Math.floor(s%60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

function toggleOverlay() {
    document.getElementById('playerOverlay').classList.toggle('active');
}