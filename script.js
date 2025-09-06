const tracks = [
  { id:1, title: 'Saiba', artist: 'Aditya Rikhari', src: './songs/saiba.mp3', cover: "./cover/saiba.png" },
  { id:2, title: 'Paaro', artist: 'Aditya Rikhari', src: './songs/paaro.mp3', cover: "./cover/pal pal.jpeg" },
  { id:3, title: 'Pal Pal', artist: 'Budiarti', src: './songs/palpal.mp3', cover: "./cover/paaro.jpeg" },
  { id:4, title: "Finding Her", artist: "Kushagra", src: "./songs/findingher.mp3", cover: "./cover/finding her.jpg" }
];

/* ====== DOM refs ====== */
const playlistList = document.getElementById('playlistList');
const queueList = document.getElementById('queueList');
const audio = document.getElementById('audioPlayer');
const playerSheet = document.getElementById('playerSheet');
const playerSheetWrapper = document.getElementById('playerSheetWrapper');
const albumArtLarge = document.getElementById('albumArtLarge');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const closePlayerBtn = document.getElementById('closePlayerBtn');
const timeLabel = document.getElementById('timeLabel');
const progressPath = document.getElementById('progressPath');

/* ====== Search DOM refs ====== */
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchBtn = document.getElementById("searchBtn");
const closeSearch = document.getElementById("closeSearch");

let currentIndex = 0;
let playing = false;
let rafId = null;

/* ====== Playlist render ====== */
function renderPlaylists() {
  playlistList.innerHTML = '';
  tracks.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'flex items-center justify-between p-3 rounded-xl glass-pill cursor-pointer';
    el.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg overflow-hidden">
          <img src="${t.cover}" class="w-full h-full object-cover" />
        </div>
        <div>
          <div class="font-semibold">${t.title}</div>
          <div class="text-sm text-white/70">${t.artist} · 8 songs</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button class="play-btn w-10 h-10 rounded-full glass-pill">▶</button>
      </div>
    `;
    el.querySelector('.play-btn').addEventListener('click', e => {
      e.stopPropagation();
      openPlayer(i);
      playTrack(i);
    });
    el.addEventListener('click', () => openPlayer(i));
    playlistList.appendChild(el);
  });
}

/* ====== Queue render ====== */
function renderQueue() {
  queueList.innerHTML = '';
  tracks.forEach((t, i) => {
    const q = document.createElement('div');
    q.className = 'flex items-center justify-between p-2 rounded-md hover:bg-white/3';
    q.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded overflow-hidden">
          <img src="${t.cover}" class="w-full h-full object-cover" />
        </div>
        <div>
          <div class="text-sm font-medium">${t.title}</div>
          <div class="text-xs text-white/70">${t.artist}</div>
        </div>
      </div>
      <div class="text-sm text-white/70">${formatTime(Math.floor(Math.random()*240)+120)}</div>
    `;
    q.addEventListener('click', () => playTrack(i));
    queueList.appendChild(q);
  });
}

/* ====== Player controls ====== */
function updatePlayerMeta() {
  const t = tracks[currentIndex];
  albumArtLarge.src = t.cover;
  trackTitle.textContent = t.title;
  trackArtist.textContent = t.artist;
  if (t.src) { audio.src = t.src; audio.load(); }
  else { audio.removeAttribute('src'); }
}

function playTrack(idx) {
  currentIndex = idx;
  updatePlayerMeta();
  if (audio.src) { audio.play().catch(()=>{}); playing=true; playBtn.textContent='⏸'; }
  else { simulatePlay(); }
}

function simulatePlay() {
  playing = true;
  playBtn.textContent = '⏸';
  let duration = 180;
  audio.currentTime = 0;
  cancelAnimationFrame(rafId);
  const start = performance.now();
  function tick(now) {
    const elapsed = (now-start)/1000;
    const pct = Math.min(1, elapsed/duration);
    updateProgress(pct, Math.floor(pct*duration));
    if (pct < 1) rafId = requestAnimationFrame(tick);
    else { playing=false; playBtn.textContent='▶'; }
  }
  rafId = requestAnimationFrame(tick);
}

function pauseAudio() {
  if(audio.src) audio.pause();
  playing=false;
  playBtn.textContent='▶';
  cancelAnimationFrame(rafId);
}

/* ====== Open/Close Player ====== */
function openPlayer(idx=0) {
  currentIndex = idx;
  updatePlayerMeta();
  playerSheet.classList.add('active','player-enter');
  playerSheetWrapper.style.pointerEvents='auto';
  playerSheet.style.transform='translateY(0)';
  renderQueue();
}

function closePlayer() {
  playerSheet.style.transform='translateY(100%)';
  playerSheetWrapper.style.pointerEvents='none';
  pauseAudio();
}

if (closePlayerBtn) closePlayerBtn.addEventListener('click', closePlayer);
if (playerSheetWrapper) playerSheetWrapper.addEventListener('click', e => { if(e.target===playerSheetWrapper) closePlayer(); });

/* ====== Playback buttons ====== */
if (playBtn) playBtn.addEventListener('click', () => {
  if(playing) pauseAudio();
  else playTrack(currentIndex);
});
if (prevBtn) prevBtn.addEventListener('click', () => { currentIndex=(currentIndex-1+tracks.length)%tracks.length; playTrack(currentIndex); });
if (nextBtn) nextBtn.addEventListener('click', () => { currentIndex=(currentIndex+1)%tracks.length; playTrack(currentIndex); });

/* ====== Audio events ====== */
audio.addEventListener('timeupdate', ()=>{ if(audio.duration){ updateProgress(audio.currentTime/audio.duration, Math.floor(audio.currentTime)); } });
audio.addEventListener('play', ()=>{ playing=true; playBtn.textContent='⏸'; });
audio.addEventListener('pause', ()=>{ playing=false; playBtn.textContent='▶'; });
audio.addEventListener('ended', ()=>{ nextBtn.click(); });

/* ====== Progress update ====== */
function updateProgress(pct, seconds) {
  const r=44, cx=50, cy=50;
  const angle=pct*2*Math.PI;
  const x=cx+r*Math.cos(angle-Math.PI/2);
  const y=cy+r*Math.sin(angle-Math.PI/2);
  const large=angle>Math.PI?1:0;
  const d=`M ${cx} ${cy-r} A ${r} ${r} 0 ${large} 1 ${x} ${y}`;
  progressPath.setAttribute('d', d);
  timeLabel.textContent=formatTime(seconds);
}
function formatTime(sec) { return `${Math.floor(sec/60).toString().padStart(2,'0')}:${Math.floor(sec%60).toString().padStart(2,'0')}`; }

/* ====== Bottom Nav + Section Toggle ====== */
const homeSection = document.getElementById("homeSection");
const searchSection = document.getElementById("searchSection");

function showSection(section) {
  if (!homeSection || !searchSection || !section) return;
  homeSection.classList.add("hidden");
  searchSection.classList.add("hidden");
  section.classList.remove("hidden");
}

const navBtns = document.querySelectorAll(".nav-btn");
navBtns.forEach((btn,i) => {
  btn.addEventListener("click", () => {
    navBtns.forEach(b => { b.classList.remove("text-violet-400","scale-110","font-semibold"); b.classList.add("text-white/70"); });
    btn.classList.remove("text-white/70");
    btn.classList.add("text-violet-400","scale-110","font-semibold");
    if(i===0 && homeSection) showSection(homeSection);
    if(i===1 && searchSection) showSection(searchSection);
  });
});

/* ====== Search feature ====== */
/* Note: searchBar, searchInput, searchResults, searchBtn and closeSearch
   are now unique in the HTML (duplicates removed). JS below uses those IDs. */

if (searchBtn && searchBar && searchInput && searchResults && closeSearch) {
  searchBtn.addEventListener('click', ()=>{
    searchBar.classList.remove('hidden');
    searchInput.value='';
    searchResults.innerHTML='';
    searchInput.focus();
  });

  closeSearch.addEventListener('click', ()=>{
    searchBar.classList.add('hidden');
    searchInput.value='';
    searchResults.innerHTML='';
  });

  searchInput.addEventListener('input', ()=>{
    const query=searchInput.value.toLowerCase().trim();
    searchResults.innerHTML='';
    if(!query) return;
    const filtered=tracks.filter(t=>t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query));
    if(filtered.length===0) { searchResults.innerHTML='<div class="text-white/60 p-2">No results found</div>'; return; }
    filtered.forEach(t=>{
      const el=document.createElement('div');
      el.className='flex items-center justify-between p-3 rounded-xl glass-pill cursor-pointer hover:bg-white/10 transition';
      el.innerHTML=`
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg overflow-hidden">
            <img src="${t.cover}" class="w-full h-full object-cover"/>
          </div>
          <div>
            <div class="font-semibold text-white">${t.title}</div>
            <div class="text-sm text-white/70">${t.artist}</div>
          </div>
        </div>
        <button class="play-btn w-10 h-10 rounded-full glass-pill text-white">▶</button>
      `;
      el.querySelector('.play-btn').addEventListener('click', e=>{
        e.stopPropagation();
        const idx = tracks.indexOf(t);
        openPlayer(idx);
        playTrack(idx);
      });
      el.addEventListener('click', ()=>{
        const idx = tracks.indexOf(t);
        openPlayer(idx);
        playTrack(idx);

        document.getElementById("searchBar").classList.add("hidden");
  searchResults.innerHTML = "";
  searchInput.value = "";
      });
      searchResults.appendChild(el);
    });
  });
}

/* ====== Init ====== */
renderPlaylists();
playerSheet.style.transform='translateY(100%)';
playerSheetWrapper.style.pointerEvents='none';
document.querySelector('.play-discover')?.addEventListener('click', ()=>{ openPlayer(0); playTrack(0); });
document.addEventListener('keydown', e=>{
  if(e.key===' '){ e.preventDefault(); playBtn.click(); }
  if(e.key==='ArrowRight') nextBtn.click();
  if(e.key==='ArrowLeft') prevBtn.click();
  if(e.key==='Escape') closePlayer();
});