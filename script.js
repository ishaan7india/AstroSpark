"use strict";
const STORAGE = {
  settings: "astroSettingsV2", tasks: "astroTasks", notes: "astroNotes", timer: "astroTimerState", apod: "astroApodCacheV1"
};
const defaults = {
  name: "", greeting: true, clock: "24", showDate: true, engine: "google", rememberEngine: true, newTab: false,
  theme: "cosmic", intensity: 70, stars: true, nebula: true, planet: true, reduceMotion: false,
  audioEnabled: false, audioSelection: "atlasaudio-space-space-music-587610", audioVolume: 40, tasksVisible: true, notesVisible: true,
  focusMinutes: 25, breakMinutes: 5, nasaKey: ""
};
function readJSON(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; }
  catch { return fallback; }
}
let settings = { ...defaults, ...readJSON(STORAGE.settings, {}) };
const $ = (id) => document.getElementById(id);
const settingsPanel = $("settingsPanel");
settingsPanel.inert = true;
let lastFocused = null;
const spaceBackgrounds = [
  "assets/backgrounds/cosmic-cliffs-carina.png",
  "assets/backgrounds/dumbbell-nebula.jpg",
  "assets/backgrounds/soul-nebula.jpg",
  "assets/backgrounds/frankenstein-galaxy.jpg",
  "assets/backgrounds/galaxy-triptych.jpg"
];
const backdropLayers = [$("spaceBackdropA"), $("spaceBackdropB")];
let activeBackdrop = 0;
let activeBackdropIndex = 0;
let backdropTimer;
function setBackdrop(index, layerIndex, isFirst = false) {
  const source = spaceBackgrounds[index];
  const commit = () => {
    if (!isFirst && settings.reduceMotion) return;
    backdropLayers[layerIndex].style.backgroundImage = `url("${source}")`;
    backdropLayers[layerIndex].classList.add("active");
    backdropLayers[1 - layerIndex].classList.remove("active");
    activeBackdrop = layerIndex;
    activeBackdropIndex = index;
  };
  if (isFirst) { commit(); return; }
  const preload = new Image();
  preload.onload = commit;
  preload.onerror = () => console.warn(`Could not load space background: ${source}`);
  preload.src = source;
}
function configureBackdropRotation() {
  clearInterval(backdropTimer);
  const reduced = settings.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!settings.nebula || reduced) return;
  backdropTimer = setInterval(() => {
    const nextIndex = (activeBackdropIndex + 1) % spaceBackgrounds.length;
    setBackdrop(nextIndex, 1 - activeBackdrop);
  }, 12000);
}
setBackdrop(0, 0, true);
function saveSettings() { localStorage.setItem(STORAGE.settings, JSON.stringify(settings)); }
const ambientTracks = {
  "atlasaudio-space-space-music-587610": "assets/audio/atlasaudio-space-space-music-587610.mp3",
  "the_mountain-deep-space-587580": "assets/audio/the_mountain-deep-space-587580.mp3"
};
if (!ambientTracks[settings.audioSelection]) settings.audioSelection = defaults.audioSelection;
const ambientAudio = $("ambientAudio");
function selectAmbientTrack() {
  const source = ambientTracks[settings.audioSelection] || ambientTracks[defaults.audioSelection];
  if (ambientAudio.getAttribute("src") !== source) {
    ambientAudio.pause();
    ambientAudio.src = source;
    ambientAudio.load();
  }
}
function updateAudioButton(playing = !ambientAudio.paused) {
  $("audioToggle").textContent = playing ? "Ⅱ Pause ambient audio" : "▶ Play ambient audio";
  $("audioToggle").setAttribute("aria-pressed", String(playing));
}
ambientAudio.addEventListener("error", () => {
  $("audioStatus").textContent = "This audio file could not be loaded. Check that the bundled track is present.";
  updateAudioButton(false);
});
ambientAudio.addEventListener("ended", () => updateAudioButton(false));
ambientAudio.addEventListener("pause", () => updateAudioButton(false));
ambientAudio.addEventListener("play", () => { $("audioStatus").textContent = "Now playing."; updateAudioButton(true); });
$("audioToggle").addEventListener("click", async () => {
  selectAmbientTrack();
  if (!ambientAudio.paused) { ambientAudio.pause(); $("audioStatus").textContent = "Playback paused."; return; }
  try {
    await ambientAudio.play();
    settings.audioEnabled = true;
    saveSettings(); syncSettingsForm();
  } catch (error) {
    $("audioStatus").textContent = error.name === "NotAllowedError" ? "Playback was blocked. Press play again to allow audio." : "Could not play this track. Check the audio file and try again.";
  }
});
$("audioSelection").addEventListener("change", () => {
  selectAmbientTrack();
  $("audioStatus").textContent = "Track selected. Press play when you are ready.";
});
$("audioEnabled").addEventListener("change", () => {
  if (!settings.audioEnabled && !ambientAudio.paused) { ambientAudio.pause(); $("audioStatus").textContent = "Ambient audio disabled."; }
  else if (settings.audioEnabled && ambientAudio.paused) $("audioStatus").textContent = "Enabled. Press play to start the track.";
});
function applySettings() {
  document.documentElement.dataset.theme = settings.theme;
  document.documentElement.style.setProperty("--cosmic-intensity", String(settings.intensity / 100));
  document.documentElement.style.setProperty("--backdrop-opacity", String(0.48 + settings.intensity / 100 * 0.46));
  document.body.classList.toggle("no-stars", !settings.stars);
  document.body.classList.toggle("no-nebula", !settings.nebula);
  document.body.classList.toggle("no-planet", !settings.planet);
  document.body.classList.toggle("reduce-motion", settings.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  $("date").hidden = !settings.showDate;
  document.querySelector(".tasks-card").hidden = !settings.tasksVisible;
  document.querySelector(".notes-card").hidden = !settings.notesVisible;
  $("searchEngine").value = settings.engine;
  selectAmbientTrack();
  ambientAudio.volume = Math.min(1, Math.max(0, settings.audioVolume / 100));
  $("audioStatus").textContent = settings.audioEnabled && ambientAudio.paused ? "Enabled. Press play to start the track." : "Ready to play.";
  configureBackdropRotation();
  updateClock(); updateGreeting();
}
function updateGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  $("greeting").textContent = settings.greeting ? `${greeting}${settings.name ? `, ${settings.name}` : ""}` : "Welcome to your universe";
}
function updateClock() {
  const now = new Date();
  $("clock").textContent = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", ...(settings.clock === "12" ? { hour12: true } : { hour12: false }) });
  $("clock").dateTime = now.toISOString();
  $("date").textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  updateGreeting();
}
setInterval(updateClock, 1000); updateClock();
const settingBindings = {
  displayName: ["name", "value"], greetingEnabled: ["greeting", "checked"], settingClock: ["clock", "value"], showDate: ["showDate", "checked"],
  settingEngine: ["engine", "value"], rememberEngine: ["rememberEngine", "checked"], newTabSearch: ["newTab", "checked"],
  themeSetting: ["theme", "value"], intensitySetting: ["intensity", "value"], starsEnabled: ["stars", "checked"], nebulaEnabled: ["nebula", "checked"],
  planetEnabled: ["planet", "checked"], reduceMotion: ["reduceMotion", "checked"], audioEnabled: ["audioEnabled", "checked"],
  audioSelection: ["audioSelection", "value"], audioVolume: ["audioVolume", "value"], tasksVisible: ["tasksVisible", "checked"], notesVisible: ["notesVisible", "checked"],
  focusDuration: ["focusMinutes", "value"], breakDuration: ["breakMinutes", "value"], nasaKey: ["nasaKey", "value"]
};
function syncSettingsForm() {
  for (const [id, [key, property]] of Object.entries(settingBindings)) $(id)[property] = settings[key];
  $("intensityValue").value = `${settings.intensity}%`;
  $("volumeValue").value = `${settings.audioVolume}%`;
}
for (const [id, [key, property]] of Object.entries(settingBindings)) {
  $(id).addEventListener("input", () => changeSetting(id, key, property));
  $(id).addEventListener("change", () => changeSetting(id, key, property));
}
function changeSetting(id, key, property) {
  let value = $(id)[property];
  if (["intensity", "audioVolume", "focusMinutes", "breakMinutes"].includes(key)) value = Number(value);
  if (key === "focusMinutes") value = Math.min(180, Math.max(1, value || defaults.focusMinutes));
  if (key === "breakMinutes") value = Math.min(60, Math.max(1, value || defaults.breakMinutes));
  settings[key] = value;
  if (id === "settingEngine") $("searchEngine").value = value;
  if (id === "searchEngine") settings.engine = value;
  if (key === "focusMinutes" || key === "breakMinutes") setTimerMode(timer.mode, true);
  saveSettings(); syncSettingsForm(); applySettings();
}
$("searchEngine").addEventListener("change", (event) => {
  settings.engine = event.target.value;
  if (settings.rememberEngine) saveSettings();
  $("settingEngine").value = settings.engine;
});
$("searchForm").addEventListener("submit", (event) => {
  event.preventDefault(); const query = $("searchInput").value.trim(); if (!query) { $("searchInput").focus(); return; }
  const endpoints = { google: "https://www.google.com/search?q=", bing: "https://www.bing.com/search?q=", duckduckgo: "https://duckduckgo.com/?q=" };
  const url = endpoints[settings.engine] + encodeURIComponent(query);
  if (settings.newTab) window.open(url, "_blank", "noopener,noreferrer"); else window.location.assign(url);
});
function openSettings() {
  lastFocused = document.activeElement; $("settingsBackdrop").hidden = false;
  settingsPanel.inert = false; requestAnimationFrame(() => settingsPanel.classList.add("open")); settingsPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("settings-open"); $("closeSettings").focus();
}
function closeSettings() {
  settingsPanel.classList.remove("open"); settingsPanel.setAttribute("aria-hidden", "true");
  settingsPanel.inert = true; document.body.classList.remove("settings-open"); $("settingsBackdrop").hidden = true; lastFocused?.focus();
}
$("openSettings").addEventListener("click", openSettings);
$("closeSettings").addEventListener("click", closeSettings); $("doneSettings").addEventListener("click", closeSettings); $("settingsBackdrop").addEventListener("click", closeSettings);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && settingsPanel.classList.contains("open")) closeSettings();
  if (event.key === "Tab" && settingsPanel.classList.contains("open")) {
    const items = [...settingsPanel.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled)")];
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
  }
});
$("resetSettings").addEventListener("click", () => { settings = { ...defaults }; saveSettings(); syncSettingsForm(); applySettings(); setTimerMode("focus", true); });
let tasks = readJSON(STORAGE.tasks, []);
if (!Array.isArray(tasks)) tasks = [];
function saveTasks() { localStorage.setItem(STORAGE.tasks, JSON.stringify(tasks)); }
function renderTasks() {
  const list = $("taskList"); list.replaceChildren();
  tasks.forEach((task, index) => {
    const item = document.createElement("li"); const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = Boolean(task.completed); checkbox.setAttribute("aria-label", `Complete ${task.text}`);
    checkbox.addEventListener("change", () => { tasks[index].completed = checkbox.checked; saveTasks(); renderTasks(); });
    const text = document.createElement("span"); text.textContent = task.text; if (task.completed) text.className = "completed";
    const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×"; remove.className = "delete-task"; remove.setAttribute("aria-label", `Delete ${task.text}`);
    remove.addEventListener("click", () => { tasks.splice(index, 1); saveTasks(); renderTasks(); }); item.append(checkbox, text, remove); list.append(item);
  });
  $("taskCount").textContent = tasks.filter((task) => !task.completed).length;
  $("taskEmpty").hidden = tasks.length > 0;
}
$("taskForm").addEventListener("submit", (event) => { event.preventDefault(); const text = $("taskInput").value.trim(); if (!text) return; tasks.unshift({ text, completed: false }); saveTasks(); renderTasks(); $("taskInput").value = ""; $("taskInput").focus(); });
renderTasks();
$("quickNotes").value = localStorage.getItem(STORAGE.notes) || "";
let notesSaveTimer;
$("quickNotes").addEventListener("input", () => {
  $("notesStatus").textContent = "Saving…"; clearTimeout(notesSaveTimer);
  notesSaveTimer = setTimeout(() => { localStorage.setItem(STORAGE.notes, $("quickNotes").value); $("notesStatus").textContent = "Saved on this device"; }, 250);
});
let timer = readJSON(STORAGE.timer, null);
if (!timer || typeof timer.remaining !== "number") timer = { mode: "focus", remaining: settings.focusMinutes * 60, running: false, endsAt: null };
function persistTimer() { localStorage.setItem(STORAGE.timer, JSON.stringify(timer)); }
function timerRemaining() { return timer.running ? Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000)) : Math.max(0, timer.remaining); }
function updateTimer() {
  timer.remaining = timerRemaining(); const mins = Math.floor(timer.remaining / 60); const secs = timer.remaining % 60;
  $("timerDisplay").textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  $("timerRing").style.setProperty("--timer-progress", `${timer.remaining / (timer.mode === "focus" ? settings.focusMinutes : settings.breakMinutes) / 60 * 100}%`);
  $("timerStart").textContent = timer.running ? "Pause orbit" : timer.remaining === 0 ? "Start again" : timer.remaining < timerDuration(timer.mode) ? "Resume orbit" : "Begin focus";
  $("timerMode").textContent = timer.mode.toUpperCase();
  if (timer.running && timer.remaining === 0) {
    timer.running = false; timer.endsAt = null; timer.mode = timer.mode === "focus" ? "break" : "focus"; timer.remaining = timerDuration(timer.mode);
    $("timerStatus").textContent = timer.mode === "break" ? "Focus complete. Take a short breather." : "Break complete. Ready for another orbit?";
    persistTimer();
  }
}
function timerDuration(mode) { return (mode === "focus" ? settings.focusMinutes : settings.breakMinutes) * 60; }
function setTimerMode(mode, reset = false) { timer.mode = mode; if (reset) { timer.running = false; timer.endsAt = null; timer.remaining = timerDuration(mode); } updateTimer(); persistTimer(); }
$("timerStart").addEventListener("click", () => {
  if (timer.running) { timer.remaining = timerRemaining(); timer.running = false; timer.endsAt = null; $("timerStatus").textContent = "Paused. Pick up when you’re ready."; }
  else { if (!timer.remaining) timer.remaining = timerDuration(timer.mode); timer.running = true; timer.endsAt = Date.now() + timer.remaining * 1000; $("timerStatus").textContent = timer.mode === "focus" ? "Stay with this one thing." : "Rest your eyes for a moment."; }
  updateTimer(); persistTimer();
});
$("timerReset").addEventListener("click", () => { setTimerMode(timer.mode, true); $("timerStatus").textContent = "Timer reset. Ready when you are."; });
$("timerMode").addEventListener("click", () => setTimerMode(timer.mode === "focus" ? "break" : "focus", true));
updateTimer(); persistTimer(); setInterval(() => { updateTimer(); if (timer.running) persistTimer(); }, 250);
$("exploreToggle").addEventListener("click", (event) => { const facts = $("planetFacts"); facts.hidden = !facts.hidden; event.currentTarget.setAttribute("aria-expanded", String(!facts.hidden)); event.currentTarget.innerHTML = facts.hidden ? 'Meet the planets <span aria-hidden="true">＋</span>' : 'Close planet guide <span aria-hidden="true">−</span>'; });
function localDateString(date) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0"); return `${year}-${month}-${day}`; }
const apodToday = localDateString(new Date());
$("apodPicker").max = apodToday; $("apodPicker").min = "1995-06-16";
let activeApodDate = apodToday;
let apodRequestId = 0;
function safeDate(date) { return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= "1995-06-16" && date <= apodToday; }
function isValidApodItem(item, date) {
  const mediaLinks = `${item?.url || ""} ${item?.hdurl || ""}`;
  return item?.date === date && Boolean(item.title) && item.title.trim().toLowerCase() !== "nasa science" && ["image", "video"].includes(item.media_type) && !/nasa-logo/i.test(mediaLinks);
}
function cacheApod(date, data) { const cache = readJSON(STORAGE.apod, {}); cache[date] = { savedAt: Date.now(), data }; const entries = Object.entries(cache).sort((a, b) => b[1].savedAt - a[1].savedAt).slice(0, 35); localStorage.setItem(STORAGE.apod, JSON.stringify(Object.fromEntries(entries))); }
function getCachedApod(date) { const item = readJSON(STORAGE.apod, {})[date]?.data; return isValidApodItem(item, date) ? item : null; }
async function apodVideoSource(item) {
  if (item.media_type !== "video") return "";
  const direct = safeHttps(item.url || "");
  if (direct && /\.(?:mp4|webm|ogv|mov)(?:$|\?)/i.test(direct)) return direct;
  const youtubeEmbed = (value) => {
    try {
      const parsed = new URL(value);
      if (!["youtube.com", "www.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(parsed.hostname)) return "";
      const id = parsed.searchParams.get("v") || parsed.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : "";
    } catch { return ""; }
  };
  if (direct && youtubeEmbed(direct)) return youtubeEmbed(direct);
  let markup = item.basic_html || "";
  if (!markup && item.basic_html_url) {
    try {
      const page = new URL(item.basic_html_url);
      if (page.hostname !== "science.nasa.gov" || page.protocol !== "https:") return "";
      const response = await fetchWithTimeout(page); if (!response.ok) return ""; markup = await response.text();
    } catch { return ""; }
  }
  if (!markup) return "";
  const doc = new DOMParser().parseFromString(markup, "text/html");
  const file = doc.querySelector("video source[src]")?.getAttribute("src") || doc.querySelector("video[src]")?.getAttribute("src");
  if (file) return safeHttps(new URL(file, item.basic_html_url || item.permalink || "https://science.nasa.gov").href);
  const embedded = doc.querySelector("iframe[src]")?.getAttribute("src");
  if (!embedded) return "";
  const embedUrl = safeHttps(new URL(embedded, item.basic_html_url || item.permalink || "https://science.nasa.gov").href);
  try {
    const host = new URL(embedUrl).hostname;
    return youtubeEmbed(embedUrl) || (["youtube-nocookie.com", "www.youtube-nocookie.com", "player.vimeo.com"].includes(host) ? embedUrl : "");
  } catch { return ""; }
}
async function apodImageSource(item) {
  const hd = safeHttps(item.hdurl || "");
  if (hd && /\.(?:jpe?g|png|webp)(?:$|\?)/i.test(hd)) return hd;
  const direct = safeHttps(item.url || "");
  if (direct && /\.(?:jpe?g|png|webp)(?:$|\?)/i.test(direct)) return direct;
  let markup = item.basic_html || "";
  if (!markup && item.basic_html_url) {
    try { const page = new URL(item.basic_html_url); if (page.protocol === "https:" && page.hostname === "science.nasa.gov") { const response = await fetchWithTimeout(page); if (response.ok) markup = await response.text(); } } catch { /* article media fallback below */ }
  }
  if (!markup) return "";
  const doc = new DOMParser().parseFromString(markup, "text/html");
  const source = doc.querySelector('meta[property="og:image"]')?.content || doc.querySelector("img[src]")?.getAttribute("src") || "";
  if (!source) return "";
  return safeHttps(new URL(source, item.basic_html_url || item.permalink || "https://science.nasa.gov").href);
}
function clearApodMedia() { const video = $("apodVideo"); video.pause(); video.removeAttribute("src"); video.removeAttribute("poster"); video.replaceChildren(); video.load(); const frame = $("apodFrame"); frame.removeAttribute("src"); frame.hidden = true; $("apodImage").onerror = null; $("apodImage").removeAttribute("src"); $("apodImage").hidden = true; video.hidden = true; $("apodMedia").classList.remove("video-fallback"); }
function safeHttps(url) { try { const parsed = new URL(url); return parsed.protocol === "https:" ? parsed.href : ""; } catch { return ""; } }
async function fetchWithTimeout(url, timeoutMs = 18000) {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { signal: controller.signal }); }
  catch (error) { if (controller.signal.aborted) throw new Error("NASA is taking too long to respond. Try again in a moment."); throw error; }
  finally { clearTimeout(timeout); }
}
async function renderApod(item, date, requestId) {
  const permalink = safeHttps(item.permalink || item.url);
  const videoUrl = item.media_type === "video" ? safeHttps(await apodVideoSource(item)) : "";
  const imageUrl = item.media_type === "image" ? await apodImageSource(item) : "";
  if (requestId !== apodRequestId) return;
  $("apodContent").hidden = false; $("apodDate").textContent = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  $("apodTitle").textContent = item.title || "Astronomy Picture of the Day"; $("apodCredit").textContent = item.credit || item.copyright || "";
  $("apodExplanation").textContent = new DOMParser().parseFromString(item.explanation || "No explanation is available for this entry.", "text/html").body.textContent.replace(/\s+/g, " ").trim();
  $("apodExplanation").classList.remove("expanded"); $("expandExplanation").setAttribute("aria-expanded", "false"); $("expandExplanation").textContent = "Read full story ⌄";
  $("apodOriginal").href = permalink || "#"; $("apodOriginal").hidden = !permalink;
  clearApodMedia();
  if (item.media_type === "video") {
    if (videoUrl && /\.(?:mp4|webm|ogv|mov)(?:$|\?)/i.test(videoUrl)) { $("apodVideo").src = videoUrl; $("apodVideo").hidden = false; }
    else if (videoUrl) { $("apodFrame").src = videoUrl; $("apodFrame").hidden = false; }
    else { $("apodMedia").classList.add("video-fallback"); $("apodMediaLink").textContent = "Watch on NASA ↗"; }
  } else {
    if (imageUrl) { $("apodImage").src = imageUrl; $("apodImage").alt = item.alt || item.title || "Astronomy Picture of the Day"; $("apodImage").hidden = false; $("apodMediaLink").href = imageUrl; $("apodMediaLink").textContent = "↗"; $("apodImage").onerror = () => { if ($("apodImage").src === imageUrl) { $("apodImage").hidden = true; $("apodMedia").classList.add("video-fallback"); $("apodMediaLink").textContent = "Image unavailable · View on NASA ↗"; } }; }
    else { $("apodMedia").classList.add("video-fallback"); $("apodMediaLink").textContent = "View on NASA ↗"; }
  }
  if (item.media_type === "video") $("apodMediaLink").href = permalink || "#";
  $("apodPicker").value = date; $("apodPrev").disabled = date <= "1995-06-16"; $("apodNext").disabled = date >= apodToday;
}
async function loadApod(date = apodToday, retry = false) {
  if (!safeDate(date)) return;
  const requestId = ++apodRequestId;
  activeApodDate = date; $("apodPicker").value = date; $("apodStatus").hidden = false; $("apodContent").hidden = true;
  $("apodStatus").textContent = `Finding ${new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric" })}'s universe…`; $("apodStatus").classList.remove("error-state");
  const cached = !retry && getCachedApod(date); if (cached) { try { await renderApod(cached, date, requestId); if (requestId !== apodRequestId) return; $("apodStatus").hidden = true; return; } catch { /* refresh stale cache below */ } }
  const key = settings.nasaKey.trim() || "DEMO_KEY"; const endpoint = new URL("https://science.nasa.gov/wp-json/wp/v2/apod-basic/"); endpoint.searchParams.set("date", date); endpoint.searchParams.set("api_key", key);
  try {
    const response = await fetchWithTimeout(endpoint); if (!response.ok) throw new Error(response.status === 429 ? "NASA's request limit was reached. Try again in a little while." : `NASA returned an error (${response.status}).`);
    const result = await response.json(); if (requestId !== apodRequestId) return;
    let item = Array.isArray(result) ? result.find((entry) => entry?.date === date) : result?.date === date ? result : null;
    if (!item) {
      const legacyEndpoint = new URL("https://api.nasa.gov/planetary/apod"); legacyEndpoint.searchParams.set("date", date); legacyEndpoint.searchParams.set("api_key", key);
      const legacyResponse = await fetchWithTimeout(legacyEndpoint);
      if (!legacyResponse.ok) throw new Error(`NASA's current APOD list did not include ${date}, and the history fallback returned an error (${legacyResponse.status}).`);
      const legacyItem = await legacyResponse.json();
      if (isValidApodItem(legacyItem, date)) item = legacyItem;
    }
    if (!isValidApodItem(item, date)) throw new Error(`NASA did not return a valid APOD entry for ${date}. Try again later or choose another date.`);
    cacheApod(date, item); await renderApod(item, date, requestId); if (requestId !== apodRequestId) return; $("apodStatus").hidden = true;
  } catch (error) {
    if (requestId !== apodRequestId) return;
    $("apodStatus").classList.add("error-state"); $("apodStatus").replaceChildren();
    const message = document.createElement("p"); message.textContent = error instanceof TypeError ? "Could not reach NASA. Check your connection and try again." : error.message;
    const retryButton = document.createElement("button"); retryButton.type = "button"; retryButton.className = "text-button"; retryButton.textContent = "Try again ↻"; retryButton.addEventListener("click", () => loadApod(date, true));
    $("apodStatus").append(message, retryButton);
  }
}
$("expandExplanation").addEventListener("click", (event) => { const expanded = event.currentTarget.getAttribute("aria-expanded") === "true"; event.currentTarget.setAttribute("aria-expanded", String(!expanded)); $("apodExplanation").classList.toggle("expanded", !expanded); event.currentTarget.textContent = expanded ? "Read full story ⌄" : "Show less ⌃"; });
$("apodPicker").addEventListener("change", (event) => loadApod(event.target.value));
function shiftApod(days) { const date = new Date(`${activeApodDate}T12:00:00`); date.setDate(date.getDate() + days); loadApod(localDateString(date)); }
$("apodPrev").addEventListener("click", () => shiftApod(-1)); $("apodNext").addEventListener("click", () => shiftApod(1));
syncSettingsForm(); applySettings(); loadApod();
const apiDescriptions = {
  neo: "Near-Earth asteroid close approaches over the next few days.",
  donki: "Space-weather notifications logged by NASA's DONKI service.",
  eonet: "Currently open natural events curated by NASA's Earth Observatory.",
  epic: "A recent natural-color view of Earth from the DSCOVR spacecraft.",
  images: "Search NASA's image and video collection."
};
const apiButtonLabels = { neo: "Load asteroid data", donki: "Load space-weather alerts", eonet: "Load Earth events", epic: "Load Earth imagery", images: "Search NASA media" };
let activeApi = "neo";
let apiRequestId = 0;
const explorerTabs = [...document.querySelectorAll(".explorer-tab")];
function selectApi(name) {
  if (!apiDescriptions[name]) return;
  activeApi = name; apiRequestId++;
  explorerTabs.forEach((tab) => { const selected = tab.dataset.api === name; tab.classList.toggle("active", selected); tab.setAttribute("aria-selected", String(selected)); tab.tabIndex = selected ? 0 : -1; });
  $("apiDescription").textContent = apiDescriptions[name]; $("loadNasaApi").innerHTML = `${apiButtonLabels[name]} <span aria-hidden="true">↗</span>`;
  $("loadNasaApi").disabled = false; $("nasaApiResults").setAttribute("aria-busy", "false");
  $("mediaQuery").hidden = name !== "images"; $("eventFilter").hidden = name !== "eonet"; $("donkiFilter").hidden = name !== "donki";
  $("nasaApiStatus").hidden = true; $("nasaApiResults").replaceChildren(); $("nasaApiResults").setAttribute("aria-busy", "false");
}
explorerTabs.forEach((tab) => {
  tab.tabIndex = tab.dataset.api === activeApi ? 0 : -1;
  tab.addEventListener("click", () => selectApi(tab.dataset.api));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); const current = explorerTabs.indexOf(tab);
    const next = event.key === "Home" ? 0 : event.key === "End" ? explorerTabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + explorerTabs.length) % explorerTabs.length;
    explorerTabs[next].focus(); explorerTabs[next].click();
  });
});
function apiUrl(path, params = {}) {
  const url = new URL(`https://api.nasa.gov${path}`); url.searchParams.set("api_key", settings.nasaKey.trim() || "DEMO_KEY");
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") url.searchParams.set(key, value);
  return url;
}
function isoDate(date) { return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`; }
async function fetchJson(url) {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      let detail = ""; try { const body = await response.json(); detail = body.error?.message || body.msg || body.message || ""; } catch { /* non-JSON error response */ }
      throw new Error(detail || (response.status === 429 ? "NASA's demo-key limit has been reached. Try again later or add a personal key in Settings." : `NASA service returned ${response.status}.`));
    }
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw new Error("This NASA request took too long. Try again in a moment.");
    throw error;
  } finally { clearTimeout(timeout); }
}
function resultCard(title, lines = [], link = "", linkLabel = "Open source ↗", className = "") {
  const card = document.createElement("article"); card.className = `api-result ${className}`.trim();
  const heading = document.createElement("h3"); heading.textContent = title || "NASA data entry"; card.append(heading);
  for (const line of lines) { if (!line) continue; const p = document.createElement("p"); p.textContent = line; card.append(p); }
  const safeLink = safeHttps(link); if (safeLink) { const anchor = document.createElement("a"); anchor.href = safeLink; anchor.target = "_blank"; anchor.rel = "noopener noreferrer"; anchor.textContent = linkLabel; card.append(anchor); }
  return card;
}
function showApiEmpty(message) { const empty = document.createElement("p"); empty.className = "api-empty"; empty.textContent = message; $("nasaApiResults").append(empty); }
function renderAsteroids(data) {
  const objects = Object.values(data.near_earth_objects || {}).flat().sort((a, b) => new Date(a.close_approach_data?.[0]?.close_approach_date_full || a.close_approach_data?.[0]?.close_approach_date) - new Date(b.close_approach_data?.[0]?.close_approach_date_full || b.close_approach_data?.[0]?.close_approach_date)).slice(0, 6);
  if (!objects.length) return showApiEmpty("No asteroid close approaches were returned for this range.");
  $("nasaApiResults").append(resultCard(`${data.element_count ?? objects.length} objects in range`, [`Closest pass: ${objects[0].close_approach_data?.[0]?.close_approach_date || "Date unavailable"}`]));
  objects.forEach((asteroid) => {
    const approach = asteroid.close_approach_data?.[0] || {};
    const distance = Number(approach.miss_distance?.kilometers);
    const speed = Number(approach.relative_velocity?.kilometers_per_second);
    const hazard = asteroid.is_potentially_hazardous_asteroid;
    const card = resultCard(asteroid.name, [
      `${hazard ? "Potentially hazardous" : "No hazard flag"} · ${approach.close_approach_date || "Date unavailable"}`,
      `${Number.isFinite(distance) ? `${Math.round(distance).toLocaleString()} km from Earth` : "Distance unavailable"}${Number.isFinite(speed) ? ` · ${speed.toFixed(1)} km/s` : ""}`,
      `Estimated diameter ${asteroid.estimated_diameter?.meters?.estimated_diameter_min?.toFixed(0) || "—"}–${asteroid.estimated_diameter?.meters?.estimated_diameter_max?.toFixed(0) || "—"} m`
    ], asteroid.nasa_jpl_url, "Open JPL record ↗", hazard ? "hazard" : "safe"); $("nasaApiResults").append(card);
  });
}
function renderDonki(items) {
  if (!Array.isArray(items) || !items.length) return showApiEmpty("No space-weather notifications were returned for this period.");
  items.slice(0, 9).forEach((item) => {
    const message = String(item.messageBody || "").replace(/\s+/g, " ").trim();
    $("nasaApiResults").append(resultCard(`${item.messageType || "Space-weather event"} · ${item.messageIssueTime ? new Date(item.messageIssueTime).toLocaleDateString() : "Date unavailable"}`,
      [message.length > 210 ? `${message.slice(0, 207)}…` : message], item.messageURL, "Read NASA notification ↗"));
  });
}
function renderEonet(data) {
  const events = Array.isArray(data.events) ? data.events : [];
  if (!events.length) return showApiEmpty("No open events match this filter. Try another event type.");
  events.slice(0, 9).forEach((event) => {
    const categories = (event.categories || []).map((category) => category.title).filter(Boolean).join(", ");
    const location = event.geometry?.at(-1);
    const date = location?.date ? new Date(location.date).toLocaleDateString() : "Date unavailable";
    const magnitude = event.magnitudeValue != null ? `${event.magnitudeValue}${event.magnitudeUnit ? ` ${event.magnitudeUnit}` : ""}` : "";
    $("nasaApiResults").append(resultCard(event.title, [categories, `${date}${magnitude ? ` · ${magnitude}` : ""}`, event.description || "Active event tracked by EONET."], event.link, "Open event data ↗"));
  });
}
function renderEpic(items) {
  if (!Array.isArray(items) || !items.length) return showApiEmpty("Earth imagery is temporarily unavailable in the latest EPIC update.");
  items.slice(-6).reverse().forEach((item) => {
    const [day, time = ""] = String(item.date || "").split(" "); const [year, month, date] = day.split("-");
    const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${date}/jpg/${encodeURIComponent(item.image)}.jpg`;
    const card = document.createElement("article"); card.className = "api-result";
    const anchor = document.createElement("a"); anchor.className = "api-result-media"; anchor.href = imageUrl; anchor.target = "_blank"; anchor.rel = "noopener noreferrer"; anchor.setAttribute("aria-label", "Open full-size EPIC Earth image");
    const image = document.createElement("img"); image.className = "api-image"; image.src = imageUrl; image.alt = "Earth as seen by NASA's EPIC camera"; image.loading = "lazy"; anchor.append(image);
    const heading = document.createElement("h3"); heading.textContent = `${date}/${month}/${year} · ${time.slice(0, 5)} UTC`;
    const caption = document.createElement("p"); caption.textContent = item.caption || "NASA EPIC natural-color image."; card.append(anchor, heading, caption); $("nasaApiResults").append(card);
  });
}
function renderNasaMedia(data) {
  const items = data.collection?.items || [];
  if (!items.length) return showApiEmpty("NASA's media library returned no matches. Try a different search.");
  items.slice(0, 9).forEach((item) => {
    const detail = item.data?.[0] || {}; const preview = item.links?.find((link) => link.render === "image" || link.rel === "preview")?.href;
    const card = document.createElement("article"); card.className = "api-result";
    if (safeHttps(preview)) { const anchor = document.createElement("a"); anchor.className = "api-result-media"; anchor.href = safeHttps(preview); anchor.target = "_blank"; anchor.rel = "noopener noreferrer"; const image = document.createElement("img"); image.className = "api-image"; image.src = safeHttps(preview); image.alt = detail.title || "NASA media preview"; image.loading = "lazy"; anchor.append(image); card.append(anchor); }
    const title = document.createElement("h3"); title.textContent = detail.title || "NASA media";
    const info = document.createElement("p"); info.textContent = [detail.media_type, detail.date_created ? new Date(detail.date_created).getFullYear() : "", detail.center].filter(Boolean).join(" · ");
    const description = document.createElement("p"); description.textContent = String(detail.description || "").replace(/\s+/g, " ").trim().slice(0, 160);
    card.append(title, info, description); $("nasaApiResults").append(card);
  });
}
async function loadSelectedNasaApi() {
  const name = activeApi; const requestId = ++apiRequestId; const paramsDate = isoDate(new Date());
  $("nasaApiResults").replaceChildren(); $("nasaApiResults").setAttribute("aria-busy", "true");
  $("nasaApiStatus").hidden = false; $("nasaApiStatus").classList.remove("error-state"); $("nasaApiStatus").textContent = "Connecting to NASA…";
  $("loadNasaApi").disabled = true;
  try {
    let result;
    if (name === "neo") {
      const end = new Date(); end.setUTCDate(end.getUTCDate() + 2);
      result = await fetchJson(apiUrl("/neo/rest/v1/feed", { start_date: paramsDate, end_date: isoDate(end) })); if (requestId !== apiRequestId) return; renderAsteroids(result);
    } else if (name === "donki") {
      const start = new Date(); start.setUTCDate(start.getUTCDate() - 6);
      result = await fetchJson(apiUrl("/DONKI/notifications", { startDate: isoDate(start), endDate: paramsDate, type: $("donkiType").value })); if (requestId !== apiRequestId) return; renderDonki(result);
    } else if (name === "eonet") {
      const url = new URL("https://eonet.gsfc.nasa.gov/api/v3/events"); url.searchParams.set("status", "open"); url.searchParams.set("limit", "9"); url.searchParams.set("days", "30");
      if ($("eventCategory").value) url.searchParams.set("category", $("eventCategory").value);
      result = await fetchJson(url); if (requestId !== apiRequestId) return; renderEonet(result);
    } else if (name === "epic") {
      result = await fetchJson(apiUrl("/EPIC/api/natural")); if (requestId !== apiRequestId) return; renderEpic(result);
    } else if (name === "images") {
      const query = $("mediaSearch").value.trim(); if (!query) throw new Error("Enter a search term to explore NASA's image and video library.");
      const url = new URL("https://images-api.nasa.gov/search"); url.searchParams.set("q", query); url.searchParams.set("media_type", $("mediaType").value); url.searchParams.set("page_size", "9");
      result = await fetchJson(url); if (requestId !== apiRequestId) return; renderNasaMedia(result);
    }
    if (requestId !== apiRequestId) return;
    $("nasaApiStatus").hidden = true;
  } catch (error) {
    if (requestId !== apiRequestId) return;
    $("nasaApiStatus").classList.add("error-state"); $("nasaApiStatus").replaceChildren();
    const message = document.createElement("p"); message.textContent = error instanceof TypeError ? "Could not reach this NASA service. Check your connection and try again." : error.message;
    const retry = document.createElement("button"); retry.type = "button"; retry.className = "text-button"; retry.textContent = "Try again ↻"; retry.addEventListener("click", loadSelectedNasaApi);
    $("nasaApiStatus").append(message, retry);
  } finally {
    if (requestId === apiRequestId) { $("nasaApiResults").setAttribute("aria-busy", "false"); $("loadNasaApi").disabled = false; }
  }
}
$("loadNasaApi").addEventListener("click", loadSelectedNasaApi);
$("eventCategory").addEventListener("change", () => { if (activeApi === "eonet") loadSelectedNasaApi(); });
$("donkiType").addEventListener("change", () => { if (activeApi === "donki") loadSelectedNasaApi(); });
$("mediaSearch").addEventListener("keydown", (event) => { if (event.key === "Enter") loadSelectedNasaApi(); });
$("mediaType").addEventListener("change", () => { if (activeApi === "images" && $("mediaSearch").value.trim()) loadSelectedNasaApi(); });
