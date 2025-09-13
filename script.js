
    // --- Core Music Player Logic ---
    // The songs array is now empty by default.
    const songs = [];

    let currentSongIndex = 0;
    let isPlaying = false;
    const audio = new Audio();

    // --- DOM Elements ---
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    const albumArt = document.getElementById('albumArt');
    const albumArtContainer = document.getElementById('albumArtContainer');
    const progressBar = document.getElementById('progressBar');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const addSongInput = document.getElementById('addSongInput');
    const playlistModal = document.getElementById('playlistModal');
    const togglePlaylistBtn = document.getElementById('togglePlaylistBtn');
    const closePlaylistBtn = document.getElementById('closePlaylistBtn');
    const playlistEl = document.getElementById('playlist');

    /**
     * Loads a song into the audio player and updates the UI.
     * @param {number} index The index of the song in the `songs` array.
     */
    function loadSong(index) {
      if (songs.length === 0) {
        // If there are no songs, reset UI
        songTitle.textContent = "No Songs Added";
        songArtist.textContent = "";
        albumArt.src = "https://placehold.co/250x250/2d3748/ffffff?text=Music";
        progressBar.style.width = '0%';
        currentTimeEl.textContent = '0:00';
        durationEl.textContent = '0:00';
        pauseSong(); // Stop playback
        return;
      }

      const song = songs[index];
      audio.src = song.src;
      songTitle.textContent = song.title;
      songArtist.textContent = song.artist;
      albumArt.src = song.albumArt || "https://placehold.co/250x250/2d3748/ffffff?text=Music";
      // Highlight the active song in the playlist
      updatePlaylistUI();
    }

    /**
     * Plays the current song and updates the UI state.
     */
    function playSong() {
      if (songs.length === 0) {
        // Cannot play if no songs are added
        console.log("No songs to play.");
        return;
      }
      isPlaying = true;
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      albumArtContainer.classList.add('playing');
      audio.play();
    }

    /**
     * Pauses the current song and updates the UI state.
     */
    function pauseSong() {
      isPlaying = false;
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      albumArtContainer.classList.remove('playing');
      audio.pause();
    }

    /**
     * Plays the previous song in the playlist.
     */
    function prevSong() {
      if (songs.length === 0) return;
      currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      loadSong(currentSongIndex);
      playSong();
    }

    /**
     * Plays the next song in the playlist.
     */
    function nextSong() {
      if (songs.length === 0) return;
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      loadSong(currentSongIndex);
      playSong();
    }

    /**
     * Updates the progress bar and current time display.
     */
    function updateProgress() {
      const { duration, currentTime } = audio;
      const progressPercent = (currentTime / duration) * 100;
      progressBar.style.width = `${progressPercent}%`;

      // Format and display the current time and duration
      const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      };
      currentTimeEl.textContent = formatTime(currentTime);
      if (duration) {
        durationEl.textContent = formatTime(duration);
      }
    }

    /**
     * Allows the user to seek to a new position in the song.
     * @param {Event} e The click event on the progress bar.
     */
    function setProgress(e) {
      if (songs.length === 0) return;
      const width = progressBarContainer.clientWidth;
      const clickX = e.offsetX;
      const duration = audio.duration;
      audio.currentTime = (clickX / width) * duration;
    }

    /**
     * Creates and appends a list item for a song to the playlist.
     * @param {object} song The song object.
     * @param {number} index The index of the song.
     */
    function createPlaylistItem(song, index) {
      const li = document.createElement('div');
      li.className = `playlist-item flex items-center p-3 rounded-lg cursor-pointer transition-all ${index === currentSongIndex ? 'active' : ''}`;
      li.dataset.index = index;
      li.innerHTML = `
                <img src="${song.albumArt || "https://placehold.co/50x50/2d3748/ffffff?text=Music"}" alt="Album Art" class="w-10 h-10 rounded-md mr-4">
                <div class="flex-grow truncate">
                    <h4 class="font-semibold text-sm truncate">${song.title}</h4>
                    <p class="text-xs text-gray-400 truncate">${song.artist}</p>
                </div>
            `;
      li.addEventListener('click', () => {
        currentSongIndex = index;
        loadSong(currentSongIndex);
        playSong();
      });
      playlistEl.appendChild(li);
    }

    /**
     * Updates the playlist UI to highlight the current song.
     */
    function updatePlaylistUI() {
      playlistEl.innerHTML = '';
      songs.forEach((song, index) => createPlaylistItem(song, index));
    }

    // --- Event Listeners ---
    playPauseBtn.addEventListener('click', () => {
      if (isPlaying) {
        pauseSong();
      } else {
        playSong();
      }
    });

    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextSong);
    audio.addEventListener('loadedmetadata', () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    progressBarContainer.addEventListener('click', setProgress);

    addSongInput.addEventListener('change', (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        const file = files[0];
        const newSong = {
          title: file.name.split('.').slice(0, -1).join('.'),
          artist: 'Local File',
          src: URL.createObjectURL(file),
          albumArt: "https://placehold.co/250x250/2d3748/ffffff?text=Local+File"
        };
        songs.push(newSong);
        updatePlaylistUI();
        // If this is the first song, load and play it automatically
        if (songs.length === 1) {
          currentSongIndex = 0;
          loadSong(currentSongIndex);
          playSong();
        }
      }
    });

    togglePlaylistBtn.addEventListener('click', () => {
      playlistModal.classList.toggle('open');
    });

    closePlaylistBtn.addEventListener('click', () => {
      playlistModal.classList.remove('open');
    });

    // --- Initial Setup ---
    window.onload = function () {
      loadSong(currentSongIndex);
      updatePlaylistUI();
    }

    function formatTime(time) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
