const state = {
  configured: false,
  playing: false,
  connected: false,
  volumeDragging: false,
  config: null,
  status: null,
  playlists: [],
  tracks: [],
  selectedPlaylistId: "0",
  language: "en",
  statusTimer: null,
  volumeTimer: null,
};

const $ = (id) => document.getElementById(id);

const i18n = {
  en: {
    setupLead: "First local AIMP connection setup.",
    language: "Language",
    connectionType: "Connection type",
    aimpIp: "AIMP server IP",
    port: "Port",
    teamName: "Team name",
    logoPath: "Local logo / watermark path",
    logoPlaceholder: "audio_drzewniak1.png or /static/logo.png",
    accentColor: "Accent color",
    defaultPlaylistId: "Default playlist ID",
    saveAndStart: "Save and start",
    playlist: "Playlist",
    settings: "Settings",
    refreshPlaylist: "Refresh playlist",
    nowPlaying: "Now playing",
    waitingForAimp: "Waiting for AIMP",
    focus: "Focus",
    noData: "No data",
    nextInQueue: "Next in queue",
    loadedPlaylist: "Loaded playlist",
    prevNow: "PREV NOW",
    nextNow: "NEXT NOW",
    focusNavigation: "Focus navigation",
    playFocus: "PLAY FOCUS",
    volume: "Volume",
    quickSelect: "Quick select",
    loading: "Loading",
    queue: "Queue",
    currentPlaylistOrder: "Current playlist order",
    configuration: "Configuration",
    systemSettings: "System settings",
    close: "Close",
    cancel: "Cancel",
    saveSettings: "Save settings",
    savingConfig: "Saving configuration...",
    savingSettings: "Saving settings...",
    saved: "Saved.",
    done: "Done.",
    saveError: "Save error",
    aimpChecking: "AIMP: checking",
    aimpConnected: "AIMP: connected",
    aimpOffline: "AIMP: offline",
    aimpError: "AIMP: error",
    aimpUnavailable: "AIMP unavailable",
    commandFailed: "AIMP: command failed",
    skipFailed: "AIMP: skip failed",
    focusFailed: "AIMP: focus failed",
    focusPlayFailed: "AIMP: focus play failed",
    volumeFailed: "AIMP: volume failed",
    playlistChoiceFailed: "AIMP: playlist selection failed",
    trackFailed: "AIMP: track failed",
    loadingDots: "Loading...",
    noPlaylists: "No playlists",
    noTracks: "No tracks",
    tracks: "tracks",
    fetchingPlaylist: "Fetching playlist...",
    playlistFetchFailed: "Could not fetch playlist.",
    playlistNoTracks: "AIMP did not return tracks for this playlist.",
    noMoreTracks: "No more tracks in this playlist.",
    position: "Position",
    active: "active",
    startingQuickSelect: "Starting from quick select",
    backendConfigFailed: "Could not load backend configuration.",
  },
  pl: {
    setupLead: "Pierwsza konfiguracja lokalnego polaczenia z AIMP.",
    language: "Język",
    connectionType: "Rodzaj polaczenia",
    aimpIp: "IP serwera AIMP",
    port: "Port",
    teamName: "Nazwa zespolu",
    logoPath: "Lokalna sciezka logo / watermark",
    logoPlaceholder: "audio_drzewniak1.png albo /static/logo.png",
    accentColor: "Kolor akcentu",
    defaultPlaylistId: "ID domyslnej playlisty",
    saveAndStart: "Zapisz i uruchom",
    playlist: "Playlista",
    settings: "Ustawienia",
    refreshPlaylist: "Odswiez playliste",
    nowPlaying: "Teraz grane",
    waitingForAimp: "Oczekiwanie na AIMP",
    focus: "Fokus",
    noData: "Brak danych",
    nextInQueue: "Nastepny wedlug kolejki",
    loadedPlaylist: "Zaladowana playlista",
    prevNow: "PREV TERAZ",
    nextNow: "NEXT TERAZ",
    focusNavigation: "Nawigacja fokusa",
    playFocus: "GRAJ FOCUS",
    volume: "Glosnosc",
    quickSelect: "Szybki wybor",
    loading: "Ladowanie",
    queue: "Kolejka",
    currentPlaylistOrder: "Wedlug aktualnej playlisty",
    configuration: "Konfiguracja",
    systemSettings: "Ustawienia systemu",
    close: "Zamknij",
    cancel: "Anuluj",
    saveSettings: "Zapisz ustawienia",
    savingConfig: "Zapisywanie konfiguracji...",
    savingSettings: "Zapisywanie ustawien...",
    saved: "Zapisano.",
    done: "Gotowe.",
    saveError: "Blad zapisu",
    aimpChecking: "AIMP: sprawdzanie",
    aimpConnected: "AIMP: polaczono",
    aimpOffline: "AIMP: offline",
    aimpError: "AIMP: blad",
    aimpUnavailable: "AIMP niedostepny",
    commandFailed: "AIMP: komenda nieudana",
    skipFailed: "AIMP: przeskok nieudany",
    focusFailed: "AIMP: fokus nieudany",
    focusPlayFailed: "AIMP: focus play nieudany",
    volumeFailed: "AIMP: glosnosc nieudana",
    playlistChoiceFailed: "AIMP: wybor playlisty nieudany",
    trackFailed: "AIMP: utwor nieudany",
    loadingDots: "Ladowanie...",
    noPlaylists: "Brak playlist",
    noTracks: "Brak utworow",
    tracks: "utworow",
    fetchingPlaylist: "Pobieranie playlisty...",
    playlistFetchFailed: "Nie mozna pobrac playlisty.",
    playlistNoTracks: "AIMP nie zwrocil utworow dla tej playlisty.",
    noMoreTracks: "Brak kolejnych utworow w tej playliscie.",
    position: "Pozycja",
    active: "aktywny",
    startingQuickSelect: "Uruchamianie z szybkiego wyboru",
    backendConfigFailed: "Nie mozna uruchomic konfiguracji backendu.",
  },
};

function t(key) {
  return i18n[state.language]?.[key] || i18n.en[key] || key;
}

function applyLanguage(language) {
  state.language = i18n[language] ? language : "en";
  document.documentElement.lang = state.language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", t(node.dataset.i18nTitle));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });
  document.querySelectorAll(".language-select").forEach((select) => {
    select.value = state.language;
  });
  if (!state.status) {
    $("connectionText").textContent = t("aimpChecking");
  }
}

async function api(path, options = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) throw new Error(data.detail ? JSON.stringify(data.detail) : `HTTP ${res.status}`);
  return data;
}

function show(id) {
  $(id).classList.remove("hidden");
}

function hide(id) {
  $(id).classList.add("hidden");
}

function hexToRgb(hex) {
  const clean = String(hex || "#1fbf75").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((x) => x + x).join("") : clean;
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) return [31, 191, 117];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function readableOnAccent(hex) {
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#07100b" : "#ffffff";
}

function setAccent(color) {
  const accent = color || "#1fbf75";
  const [r, g, b] = hexToRgb(accent);
  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--accent-rgb", `${r},${g},${b}`);
  document.documentElement.style.setProperty("--accent-text", readableOnAccent(accent));
  document.querySelector('meta[name="theme-color"]').setAttribute("content", accent);
}

function applyConfig(config) {
  state.config = config;
  applyLanguage(config.language || "en");
  state.selectedPlaylistId = String(config.default_playlist_id || "0");
  setAccent(config.theme_color);
  $("managementName").textContent = config.custom_management_name || "";
  const logo = (config.custom_logo_url || "").trim();
  const logoUrl = logo ? `/api/app/logo?v=${Date.now()}` : "";
  $("watermark").style.backgroundImage = logoUrl ? `url("${logoUrl}")` : "none";
}

function configPayloadFromForm(form) {
  const data = new FormData(form);
  return {
    connection_type: String(data.get("connection_type")),
    language: String(data.get("language") || state.language || "en"),
    aimp_ip: String(data.get("aimp_ip") || "127.0.0.1").trim(),
    aimp_port: Number(data.get("aimp_port") || 19122),
    custom_management_name: String(data.get("custom_management_name") || "").trim(),
    custom_logo_url: String(data.get("custom_logo_url") || "").trim(),
    theme_color: String(data.get("theme_color") || "#1fbf75"),
    default_playlist_id: String(data.get("default_playlist_id") || "0").trim(),
  };
}

function fillConfigForm(form, config) {
  form.elements.connection_type.value = config.connection_type || "AIMP (Direct HTTP API)";
  form.elements.language.value = config.language || state.language || "en";
  form.elements.aimp_ip.value = config.aimp_ip || "127.0.0.1";
  form.elements.aimp_port.value = config.aimp_port || 19122;
  form.elements.custom_management_name.value = config.custom_management_name || "";
  form.elements.custom_logo_url.value = config.custom_logo_url || "";
  form.elements.theme_color.value = config.theme_color || "#1fbf75";
  form.elements.default_playlist_id.value = config.default_playlist_id || "0";
}

function openSettings() {
  fillConfigForm($("settingsForm"), state.config || {});
  $("settingsMessage").textContent = "";
  show("settingsModal");
}

function closeSettings() {
  hide("settingsModal");
}

function setConnection(ok, text) {
  state.connected = ok;
  $("statusDot").classList.toggle("online", ok);
  $("statusDot").classList.toggle("offline", !ok);
  $("connectionText").textContent = text;
}

function trackText(track, fallback = t("noData")) {
  if (!track) return fallback;
  return [track.title, track.artist].filter(Boolean).join(" - ") || fallback;
}

function setTrack(title, artist, stateLabel = "") {
  const titleEl = $("trackTitle");
  titleEl.textContent = title || t("noData");
  $("trackArtist").textContent = [artist, stateLabel].filter(Boolean).join(" • ");
  titleEl.classList.toggle("is-long", (title || "").length > 42);
}

function setSmallPanel(titleId, metaId, title, meta) {
  $(titleId).textContent = title || t("noData");
  $(metaId).textContent = meta || "-";
}

function setVolume(value) {
  const volume = Math.max(0, Math.min(100, Number(value) || 0));
  $("volumeValue").textContent = `${volume}%`;
  if (!state.volumeDragging) $("volumeSlider").value = String(volume);
}

function formatDuration(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return "";
  const min = Math.floor(value / 60);
  const sec = Math.round(value % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function playlistName(playlist) {
  if (!playlist) return t("noData");
  const count = Number(playlist.track_count || 0);
  return `${playlist.name || `Playlista ${playlist.id}`}${count ? ` (${count})` : ""}`;
}

async function loadAppConfig() {
  const data = await api("/api/app/config");
  state.configured = data.configured;
  applyConfig(data.config);
  if (data.configured) {
    hide("setupView");
    show("appView");
    startRuntime();
  } else {
    hide("appView");
    show("setupView");
  }
}

async function saveSetup(event) {
  event.preventDefault();
  const payload = configPayloadFromForm(event.currentTarget);
  $("setupMessage").textContent = t("savingConfig");
  try {
    const data = await api("/api/setup", { method: "POST", body: JSON.stringify(payload) });
    applyConfig(data.config);
    $("setupMessage").textContent = t("done");
    hide("setupView");
    show("appView");
    startRuntime();
  } catch (error) {
    $("setupMessage").textContent = `${t("saveError")}: ${error.message}`;
  }
}

async function saveSettings(event) {
  event.preventDefault();
  const payload = configPayloadFromForm(event.currentTarget);
  $("settingsMessage").textContent = t("savingSettings");
  try {
    const data = await api("/api/app/config", { method: "PUT", body: JSON.stringify(payload) });
    applyConfig(data.config);
    $("settingsMessage").textContent = t("saved");
    closeSettings();
    await refreshAll();
  } catch (error) {
    $("settingsMessage").textContent = `${t("saveError")}: ${error.message}`;
  }
}

function updateStatusPanels(data) {
  const playingTrack = data.playing_track || (data.title ? { title: data.title, artist: data.artist } : null);
  const focusTrack = data.focus_track;
  const nextTrack = data.next_track;
  const loadedPlaylist = data.playing_playlist || data.focus_playlist;
  const focusedPlaylist = data.focus_playlist || data.playing_playlist;

  setTrack(playingTrack?.title || data.title, playingTrack?.artist || data.artist, data.status || "");
  setSmallPanel(
    "focusTitle",
    "focusMeta",
    trackText(focusTrack),
    focusTrack ? `ID ${focusTrack.id}${focusTrack.position ? ` • ${t("position").toLowerCase()} ${focusTrack.position}` : ""}` : "-"
  );
  setSmallPanel(
    "nextTitle",
    "nextMeta",
    trackText(nextTrack),
    nextTrack?.duration ? formatDuration(nextTrack.duration) : "AIMP next_track"
  );
  setSmallPanel(
    "loadedPlaylistName",
    "loadedPlaylistMeta",
    playlistName(loadedPlaylist),
    loadedPlaylist ? `ID ${loadedPlaylist.id} • ${loadedPlaylist.state || t("active")}` : "-"
  );

  const statusPlaylistId = focusedPlaylist?.id;
  if (statusPlaylistId && String(statusPlaylistId) !== String(state.selectedPlaylistId)) {
    state.selectedPlaylistId = String(statusPlaylistId);
    if ($("playlistSelect").value !== state.selectedPlaylistId) $("playlistSelect").value = state.selectedPlaylistId;
    loadPlaylistTracks(state.selectedPlaylistId, { silent: true });
  }
}

async function pollStatus() {
  try {
    const data = await api("/api/player/status");
    state.status = data;
    if (data.connected) {
      setConnection(true, t("aimpConnected"));
      setVolume(data.volume);
      state.playing = Boolean(data.playing);
      $("playPauseBtn").querySelector("span").textContent = state.playing ? "PAUSE" : "PLAY";
      $("muteBtn").classList.toggle("active", Boolean(data.muted));
      updateStatusPanels(data);
      renderHighlights();
      renderQueue();
    } else {
      setConnection(false, t("aimpOffline"));
      setTrack(data.title || t("aimpUnavailable"), "");
      state.playing = false;
      $("playPauseBtn").querySelector("span").textContent = "PLAY";
    }
  } catch {
    setConnection(false, t("aimpError"));
    setTrack(t("aimpUnavailable"), "");
    state.playing = false;
    $("playPauseBtn").querySelector("span").textContent = "PLAY";
  }
}

async function sendCommand(command) {
  try {
    await api(`/api/player/${command}`, { method: "POST" });
    await pollStatus();
  } catch {
    setConnection(false, t("commandFailed"));
  }
}

async function skipNow(direction) {
  try {
    await api(`/api/player/skip/${direction}`, { method: "POST" });
    await refreshAll();
  } catch {
    setConnection(false, t("skipFailed"));
  }
}

async function moveFocus(direction) {
  try {
    await api(`/api/focus/track/${direction}`, { method: "POST" });
    await pollStatus();
  } catch {
    setConnection(false, t("focusFailed"));
  }
}

async function playFocus() {
  try {
    await api("/api/focus/play", { method: "POST" });
    await refreshAll();
  } catch {
    setConnection(false, t("focusPlayFailed"));
  }
}

function scheduleVolume(value) {
  setVolume(value);
  clearTimeout(state.volumeTimer);
  state.volumeTimer = setTimeout(async () => {
    try {
      await api(`/api/player/volume?volume=${encodeURIComponent(value)}`, { method: "PUT" });
    } catch {
      setConnection(false, t("volumeFailed"));
    }
  }, 120);
}

async function loadPlaylists() {
  const select = $("playlistSelect");
  select.innerHTML = `<option value="">${escapeHtml(t("loadingDots"))}</option>`;
  try {
    const data = await api("/api/playlists");
    state.playlists = data.playlists || [];
    select.innerHTML = "";
    state.playlists.forEach((playlist) => {
      const option = document.createElement("option");
      option.value = playlist.id;
      option.textContent = playlistName(playlist);
      select.appendChild(option);
    });
    if (!state.playlists.length) {
      select.innerHTML = `<option value="">${escapeHtml(t("noPlaylists"))}</option>`;
      return;
    }
    const preferred =
      state.status?.focus_playlist?.id ||
      state.status?.playing_playlist?.id ||
      state.selectedPlaylistId ||
      state.playlists[0].id;
    state.selectedPlaylistId = String(preferred);
    select.value = state.selectedPlaylistId;
    await loadPlaylistTracks(state.selectedPlaylistId);
  } catch {
    select.innerHTML = '<option value="">Offline</option>';
  }
}

async function selectPlaylist(playlistId) {
  if (!playlistId) return;
  state.selectedPlaylistId = String(playlistId);
  try {
    await api(`/api/playlists/${encodeURIComponent(playlistId)}/select`, { method: "POST" });
  } catch {
    setConnection(false, t("playlistChoiceFailed"));
  }
  await loadPlaylistTracks(playlistId);
  await pollStatus();
}

async function loadPlaylistTracks(playlistId = state.selectedPlaylistId, options = {}) {
  if (!playlistId) return;
  const grid = $("playlistGrid");
  if (!options.silent) {
    $("playlistState").textContent = t("loading");
    grid.innerHTML = `<div class="empty-state">${escapeHtml(t("fetchingPlaylist"))}</div>`;
  }
  try {
    const data = await api(`/api/playlists/${encodeURIComponent(playlistId)}/tracks`);
    state.selectedPlaylistId = String(data.playlist_id || playlistId);
    state.tracks = data.tracks || [];
    renderPlaylistGrid();
    renderQueue();
    $("playlistState").textContent = state.tracks.length ? `${state.tracks.length} ${t("tracks")}` : t("noTracks");
  } catch {
    if (!options.silent) {
      $("playlistState").textContent = "Offline";
      grid.innerHTML = `<div class="empty-state">${escapeHtml(t("playlistFetchFailed"))}</div>`;
    }
  }
}

function renderPlaylistGrid() {
  const grid = $("playlistGrid");
  grid.innerHTML = "";
  if (!state.tracks.length) {
    grid.innerHTML = `<div class="empty-state">${escapeHtml(t("playlistNoTracks"))}</div>`;
    return;
  }
  state.tracks.forEach((track) => {
    const button = document.createElement("button");
    button.className = "track-tile";
    button.type = "button";
    button.dataset.trackId = track.id;
    button.innerHTML = `<strong>${escapeHtml(track.title)}</strong><span>${escapeHtml(track.artist || `${t("position")} ${track.position || ""}`)}</span>`;
    button.addEventListener("click", () => playTrack(track));
    grid.appendChild(button);
  });
  renderHighlights();
}

function renderHighlights() {
  const status = state.status || {};
  const playingId = status.playing_track?.id;
  const focusId = status.focus_track?.id;
  const nextId = status.next_track?.id;
  document.querySelectorAll(".track-tile").forEach((tile) => {
    tile.classList.toggle("is-playing", Boolean(playingId && tile.dataset.trackId === String(playingId)));
    tile.classList.toggle("is-focus", Boolean(focusId && tile.dataset.trackId === String(focusId)));
    tile.classList.toggle("is-next", Boolean(nextId && tile.dataset.trackId === String(nextId)));
  });
}

function renderQueue() {
  const list = $("queueList");
  const status = state.status || {};
  const playingId = status.playing_track?.id;
  let startIndex = state.tracks.findIndex((track) => String(track.id) === String(playingId));
  if (startIndex < 0) {
    const focusId = status.focus_track?.id;
    startIndex = state.tracks.findIndex((track) => String(track.id) === String(focusId));
  }
  const upcoming = startIndex >= 0 ? state.tracks.slice(startIndex + 1, startIndex + 7) : state.tracks.slice(0, 6);
  list.innerHTML = "";
  if (!upcoming.length) {
    list.innerHTML = `<div class="empty-state">${escapeHtml(t("noMoreTracks"))}</div>`;
    return;
  }
  upcoming.forEach((track, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "queue-row";
    row.innerHTML = `<span>${index + 1}</span><strong>${escapeHtml(trackText(track))}</strong><em>${escapeHtml(formatDuration(track.duration))}</em>`;
    row.addEventListener("click", () => playTrack(track));
    list.appendChild(row);
  });
}

async function playTrack(track) {
  const playlistId = track.playlist_id || state.selectedPlaylistId;
  setTrack(track.title, track.artist, t("startingQuickSelect"));
  try {
    await api(
      `/api/playlists/${encodeURIComponent(playlistId)}/tracks/${encodeURIComponent(track.id)}/play`,
      { method: "POST" }
    );
    await refreshAll();
  } catch {
    setConnection(false, t("trackFailed"));
  }
}

async function refreshAll() {
  await pollStatus();
  await loadPlaylists();
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function bindControls() {
  applyLanguage("en");
  $("setupForm").addEventListener("submit", saveSetup);
  document.querySelectorAll(".language-select").forEach((select) => {
    select.addEventListener("change", (event) => applyLanguage(event.target.value));
  });
  $("settingsBtn").addEventListener("click", openSettings);
  $("closeSettingsBtn").addEventListener("click", closeSettings);
  $("cancelSettingsBtn").addEventListener("click", closeSettings);
  $("settingsModal").addEventListener("click", (event) => {
    if (event.target === $("settingsModal")) closeSettings();
  });
  $("settingsForm").addEventListener("submit", saveSettings);
  $("prevNowBtn").addEventListener("click", () => skipNow("prev"));
  $("stopBtn").addEventListener("click", () => sendCommand("stop"));
  $("nextNowBtn").addEventListener("click", () => skipNow("next"));
  $("muteBtn").addEventListener("click", () => sendCommand("mute"));
  $("playPauseBtn").addEventListener("click", () => sendCommand(state.playing ? "pause" : "play"));
  $("focusPrevBtn").addEventListener("click", () => moveFocus("prev"));
  $("focusNextBtn").addEventListener("click", () => moveFocus("next"));
  $("focusPlayBtn").addEventListener("click", playFocus);
  $("refreshPlaylistBtn").addEventListener("click", refreshAll);
  $("playlistSelect").addEventListener("change", (event) => selectPlaylist(event.target.value));
  $("volumeSlider").addEventListener("input", (event) => scheduleVolume(event.target.value));
  $("volumeSlider").addEventListener("pointerdown", () => state.volumeDragging = true);
  $("volumeSlider").addEventListener("pointerup", () => state.volumeDragging = false);
  $("volumeSlider").addEventListener("change", (event) => {
    state.volumeDragging = false;
    scheduleVolume(event.target.value);
  });
}

function startRuntime() {
  if (state.statusTimer) clearInterval(state.statusTimer);
  refreshAll();
  state.statusTimer = setInterval(pollStatus, 1000);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/static/sw.js").catch(() => {}));
}

bindControls();
loadAppConfig().catch(() => {
  show("setupView");
  $("setupMessage").textContent = t("backendConfigFailed");
});
