# VIMLworks RESONANCE Conductor

from __future__ import annotations

import json
import os
import platform
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, field_validator


APP_FULL_NAME = "VIMLworks RESONANCE Conductor"
APP_UI_NAME = "RESONANCE Conductor"
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
CONFIG_PATH = BASE_DIR / "config.json"
DEFAULT_AIMP_PORT = 19122
REQUEST_TIMEOUT = 2.5
LOGO_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico"}


def clear_console() -> None:
    os.system("cls" if platform.system().lower().startswith("win") else "clear")


class AppConfig(BaseModel):
    connection_type: str = "AIMP (Direct HTTP API)"
    language: str = "en"
    aimp_ip: str = "127.0.0.1"
    aimp_port: int = DEFAULT_AIMP_PORT
    custom_management_name: str = "Grupa Techniczna Audio"
    custom_logo_url: str = ""
    theme_color: str = "#1fbf75"
    default_playlist_id: str = "0"

    @field_validator("connection_type")
    @classmethod
    def validate_connection_type(cls, value: str) -> str:
        if value != "AIMP (Direct HTTP API)":
            raise ValueError("Obecnie obslugiwane jest tylko polaczenie AIMP (Direct HTTP API).")
        return value

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"en", "pl"}:
            raise ValueError("Language must be 'en' or 'pl'.")
        return normalized

    @field_validator("aimp_port")
    @classmethod
    def validate_port(cls, value: int) -> int:
        if value < 1 or value > 65535:
            raise ValueError("Port musi byc w zakresie 1-65535.")
        return value

    @field_validator("theme_color")
    @classmethod
    def validate_theme_color(cls, value: str) -> str:
        if not value.startswith("#") or len(value) not in (4, 7):
            raise ValueError("Kolor motywu musi byc w formacie HEX, np. #1fbf75.")
        return value


class SetupPayload(AppConfig):
    pass


app = FastAPI(title=APP_FULL_NAME, version="1.0.0")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def read_config() -> AppConfig | None:
    if not CONFIG_PATH.exists():
        return None
    try:
        with CONFIG_PATH.open("r", encoding="utf-8") as handle:
            return AppConfig.model_validate(json.load(handle))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=500, detail=f"Nie mozna odczytac config.json: {exc}") from exc


def write_config(config: AppConfig) -> None:
    try:
        with CONFIG_PATH.open("w", encoding="utf-8") as handle:
            json.dump(config.model_dump(), handle, ensure_ascii=False, indent=2)
            handle.write("\n")
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Nie mozna zapisac config.json: {exc}") from exc


def require_config() -> AppConfig:
    config = read_config()
    if config is None:
        raise HTTPException(status_code=428, detail="Aplikacja wymaga pierwszej konfiguracji.")
    return config


def aimp_base_url(config: AppConfig) -> str:
    return f"http://{config.aimp_ip}:{config.aimp_port}"


def resolve_logo_path(config: AppConfig) -> Path | None:
    raw_value = config.custom_logo_url.strip()
    if not raw_value:
        return None
    if raw_value.startswith(("http://", "https://")):
        return None

    candidates: list[Path] = []
    normalized = raw_value.replace("\\", "/")

    if normalized.startswith("/static/"):
        candidates.append(BASE_DIR / normalized.lstrip("/"))
        candidates.append(BASE_DIR / normalized.removeprefix("/static/"))
    elif normalized.startswith("static/"):
        candidates.append(BASE_DIR / normalized)
        candidates.append(BASE_DIR / normalized.removeprefix("static/"))
    else:
        raw_path = Path(raw_value)
        if raw_path.is_absolute():
            candidates.append(raw_path)
        candidates.append(BASE_DIR / raw_value)
        candidates.append(STATIC_DIR / raw_value)

    for candidate in candidates:
        try:
            resolved = candidate.expanduser().resolve()
        except OSError:
            continue
        if resolved.is_file() and resolved.suffix.lower() in LOGO_EXTENSIONS:
            return resolved
    return None


async def raw_aimp_request(
    method: str,
    path: str,
    *,
    params: dict[str, Any] | None = None,
    json_body: dict[str, Any] | None = None,
) -> httpx.Response:
    config = require_config()
    url = f"{aimp_base_url(config)}{path}"
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        return await client.request(method, url, params=params, json=json_body)


def response_payload(response: httpx.Response) -> Any:
    content_type = response.headers.get("content-type", "")
    if "application/json" in content_type:
        return response.json()
    text = response.text.strip()
    if not text:
        return {"ok": True}
    try:
        return response.json()
    except ValueError:
        return {"text": text}


async def proxy_aimp_request(
    method: str,
    path: str,
    *,
    params: dict[str, Any] | None = None,
    json_body: dict[str, Any] | None = None,
) -> Any:
    try:
        response = await raw_aimp_request(method, path, params=params, json_body=json_body)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Brak polaczenia z AIMP: {exc}") from exc

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail={"aimp_status": response.status_code, "body": response.text})
    return response_payload(response)


def pick(data: dict[str, Any], *keys: str, default: Any = None) -> Any:
    for key in keys:
        if key in data and data[key] not in (None, ""):
            return data[key]
    return default


def bool_from_state(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value == 1
    normalized = str(value or "").strip().lower()
    return normalized in {"play", "playing", "played", "1", "true", "yes", "odtwarzanie"}


def normalize_track(item: Any, index: int = 0) -> dict[str, Any] | None:
    if not isinstance(item, dict):
        return None
    track_id = pick(item, "id", "track_id", "file_id", "playlist_item_id", default=index)
    title = pick(item, "title", "name", "track", "file_name", default=f"Utwor {index + 1}")
    artist = pick(item, "artist", "author", "album_artist", default="")
    playlist_id = pick(item, "playlist_id", default=None)
    position = pick(item, "position_in_playlist", "position", "index", default=index + 1)
    state = pick(item, "state", "status", default=None)
    return {
        "id": str(track_id),
        "playlist_id": None if playlist_id is None else str(playlist_id),
        "position": position,
        "title": str(title),
        "artist": str(artist),
        "duration": pick(item, "duration", "length", default=0),
        "state": state,
        "raw": item,
    }


def normalize_playlist(item: Any) -> dict[str, Any] | None:
    if not isinstance(item, dict):
        return None
    playlist_id = pick(item, "id", "playlist_id", default="")
    name = pick(item, "name", "title", default=f"Playlista {playlist_id}")
    return {
        "id": str(playlist_id),
        "aimp_id": pick(item, "aimp_id", default=""),
        "name": str(name),
        "state": pick(item, "state", "status", default=""),
        "track_count": pick(item, "track_count", "tracks_count", "count", default=0),
        "duration": pick(item, "duration", default=0),
        "raw": item,
    }


def normalize_status(raw: Any) -> dict[str, Any]:
    source = raw.get("data", raw) if isinstance(raw, dict) else {}
    if not isinstance(source, dict):
        source = {}

    playing_track = normalize_track(pick(source, "playing_track", default={})) or {}
    focus_track = normalize_track(pick(source, "focus_track", default={})) or {}
    next_track = normalize_track(pick(source, "next_track", default={})) or {}
    playing_playlist = normalize_playlist(pick(source, "playing_playlist", default={}))
    focus_playlist = normalize_playlist(pick(source, "focus_playlist", default={}))

    title = pick(
        playing_track,
        "title",
        default=pick(source, "title", "track", "track_title", "name", "file_name", default="Brak aktywnego utworu"),
    )
    artist = pick(playing_track, "artist", default=pick(source, "artist", "author", "album_artist", default=""))
    state = pick(source, "state", "status", "playback_state", "player_state", default="")
    volume = pick(source, "volume", "vol", "sound_volume", default=0)

    try:
        volume = int(float(volume))
    except (TypeError, ValueError):
        volume = 0

    return {
        "connected": True,
        "title": str(title),
        "artist": str(artist),
        "status": str(state or ""),
        "playing": bool_from_state(state),
        "volume": max(0, min(100, volume)),
        "position": pick(source, "position", "pos", "elapsed", "current_position", default=0),
        "duration": pick(source, "duration", "length", "total", default=0),
        "muted": bool_from_state(pick(source, "muted", "mute", default=False)),
        "playing_track": playing_track or None,
        "focus_track": focus_track or None,
        "next_track": next_track or None,
        "playing_playlist": playing_playlist,
        "focus_playlist": focus_playlist,
        "playlist_count": pick(source, "playlist_count", default=0),
        "auto_jump": bool_from_state(pick(source, "auto_jump", default=False)),
        "repeat": bool_from_state(pick(source, "repeat", default=False)),
        "shuffle": bool_from_state(pick(source, "shuffle", default=False)),
        "raw": raw,
    }


def normalize_tracks(raw: Any) -> list[dict[str, Any]]:
    source = raw.get("data", raw) if isinstance(raw, dict) else raw
    if isinstance(source, dict):
        source = pick(source, "tracks", "items", "list", default=[])
    if not isinstance(source, list):
        return []

    tracks: list[dict[str, Any]] = []
    for index, item in enumerate(source):
        track = normalize_track(item, index)
        if track is not None:
            tracks.append(track)
    return tracks


def normalize_playlists(raw: Any) -> list[dict[str, Any]]:
    source = raw.get("data", raw) if isinstance(raw, dict) else raw
    if isinstance(source, dict):
        source = pick(source, "playlists", "items", "list", default=[])
    if not isinstance(source, list):
        return []
    playlists: list[dict[str, Any]] = []
    for item in source:
        playlist = normalize_playlist(item)
        if playlist is not None:
            playlists.append(playlist)
    return playlists


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/favicon.ico")
async def favicon() -> FileResponse:
    return FileResponse(STATIC_DIR / "icons" / "favicon.ico")


@app.get("/api/app/logo")
async def app_logo() -> Response:
    config = read_config()
    if config is None:
        return Response(status_code=204)
    logo_path = resolve_logo_path(config)
    if logo_path is None:
        return Response(status_code=204)
    return FileResponse(logo_path)


@app.get("/api/app/config")
async def app_config() -> dict[str, Any]:
    config = read_config()
    logo_path = resolve_logo_path(config) if config else None
    return {
        "configured": config is not None,
        "app_full_name": APP_FULL_NAME,
        "app_ui_name": APP_UI_NAME,
        "config": config.model_dump() if config else AppConfig().model_dump(),
        "logo_available": logo_path is not None,
        "logo_url": "/api/app/logo" if logo_path is not None else "",
        "platform": platform.system(),
    }


@app.put("/api/app/config")
async def update_app_config(payload: SetupPayload) -> dict[str, Any]:
    write_config(payload)
    return {"ok": True, "configured": True, "config": payload.model_dump()}


@app.post("/api/setup")
async def setup(payload: SetupPayload) -> dict[str, Any]:
    write_config(payload)
    return {"ok": True, "configured": True, "config": payload.model_dump()}


@app.get("/api/player/status")
async def player_status() -> dict[str, Any]:
    try:
        raw = await proxy_aimp_request("GET", "/api/player/status")
        return normalize_status(raw)
    except HTTPException as exc:
        if exc.status_code == 428:
            raise
        return {
            "connected": False,
            "title": "AIMP niedostepny",
            "artist": "",
            "status": "offline",
            "playing": False,
            "volume": 0,
            "position": 0,
            "duration": 0,
            "muted": False,
            "playing_track": None,
            "focus_track": None,
            "next_track": None,
            "playing_playlist": None,
            "focus_playlist": None,
            "error": exc.detail,
        }


@app.post("/api/player/skip/{direction}")
async def player_skip(direction: str) -> dict[str, Any]:
    if direction not in {"next", "prev"}:
        raise HTTPException(status_code=404, detail="Nieznany kierunek przeskoku.")
    focus = await proxy_aimp_request("POST", f"/api/focus/track/{direction}")
    played = await proxy_aimp_request("POST", "/api/focus/play")
    return {"ok": True, "direction": direction, "focus": focus, "aimp": played}


@app.post("/api/player/{command}")
async def player_command(command: str) -> dict[str, Any]:
    allowed = {"play", "pause", "stop", "next", "prev", "mute"}
    if command not in allowed:
        raise HTTPException(status_code=404, detail="Nieznana komenda odtwarzacza.")
    raw = await proxy_aimp_request("POST", f"/api/player/{command}")
    return {"ok": True, "command": command, "aimp": raw}


@app.put("/api/player/volume")
async def player_volume(volume: int = Query(..., ge=0, le=100)) -> dict[str, Any]:
    raw = await proxy_aimp_request("PUT", "/api/player/volume", params={"volume": volume})
    return {"ok": True, "volume": volume, "aimp": raw}


@app.get("/api/focus")
async def focus_status() -> dict[str, Any]:
    raw = await proxy_aimp_request("GET", "/api/focus")
    source = raw.get("data", raw) if isinstance(raw, dict) else raw
    if not isinstance(source, dict):
        source = {}
    return {
        "ok": True,
        "focus_playlist": normalize_playlist(pick(source, "playlist", "focus_playlist", default=source)),
        "focus_track": normalize_track(pick(source, "track", "focus_track", default=source)),
        "raw": raw,
    }


@app.post("/api/focus/track/{direction}")
async def focus_track(direction: str) -> dict[str, Any]:
    if direction not in {"next", "prev"}:
        raise HTTPException(status_code=404, detail="Nieznany kierunek fokusa.")
    raw = await proxy_aimp_request("POST", f"/api/focus/track/{direction}")
    return {"ok": True, "direction": direction, "aimp": raw}


@app.post("/api/focus/playlist/{direction}")
async def focus_playlist(direction: str) -> dict[str, Any]:
    if direction not in {"next", "prev"}:
        raise HTTPException(status_code=404, detail="Nieznany kierunek playlisty.")
    raw = await proxy_aimp_request("POST", f"/api/focus/playlist/{direction}")
    return {"ok": True, "direction": direction, "aimp": raw}


@app.post("/api/focus/play")
async def focus_play() -> dict[str, Any]:
    raw = await proxy_aimp_request("POST", "/api/focus/play")
    return {"ok": True, "aimp": raw}


@app.get("/api/playlists")
async def playlists() -> dict[str, Any]:
    raw = await proxy_aimp_request("GET", "/api/playlists")
    return {"ok": True, "playlists": normalize_playlists(raw), "raw": raw}


@app.get("/api/playlists/{playlist_id}")
async def playlist_details(playlist_id: str) -> dict[str, Any]:
    raw = await proxy_aimp_request("GET", f"/api/playlists/{playlist_id}")
    return {"ok": True, "playlist": normalize_playlist(raw), "raw": raw}


@app.post("/api/playlists/{playlist_id}/{action}")
async def playlist_action(playlist_id: str, action: str) -> dict[str, Any]:
    if action not in {"play", "resume", "select"}:
        raise HTTPException(status_code=404, detail="Nieznana akcja playlisty.")
    raw = await proxy_aimp_request("POST", f"/api/playlists/{playlist_id}/{action}")
    return {"ok": True, "playlist_id": playlist_id, "action": action, "aimp": raw}


@app.get("/api/playlists/{playlist_id}/tracks")
async def playlist_tracks(playlist_id: str) -> dict[str, Any]:
    config = require_config()
    resolved_playlist_id = config.default_playlist_id if playlist_id == "current" else playlist_id
    try:
        raw = await proxy_aimp_request("GET", f"/api/playlists/{resolved_playlist_id}/tracks")
        return {"ok": True, "playlist_id": resolved_playlist_id, "tracks": normalize_tracks(raw), "raw": raw}
    except HTTPException as exc:
        if exc.status_code == 428:
            raise
        return {"ok": False, "playlist_id": resolved_playlist_id, "tracks": [], "error": exc.detail}


@app.post("/api/playlists/{playlist_id}/tracks/{track_id}/{action}")
async def playlist_track_action(playlist_id: str, track_id: str, action: str) -> dict[str, Any]:
    if action not in {"play", "select"}:
        raise HTTPException(status_code=404, detail="Nieznana akcja utworu.")
    raw = await proxy_aimp_request("POST", f"/api/playlists/{playlist_id}/tracks/{track_id}/{action}")
    return {"ok": True, "playlist_id": playlist_id, "track_id": track_id, "action": action, "aimp": raw}


@app.post("/api/tracks/{track_id}/play")
async def play_track(track_id: str, playlist_id: str = Query("current")) -> dict[str, Any]:
    config = require_config()
    resolved_playlist_id = config.default_playlist_id if playlist_id == "current" else playlist_id
    raw = await proxy_aimp_request("POST", f"/api/playlists/{resolved_playlist_id}/tracks/{track_id}/play")
    return {"ok": True, "playlist_id": resolved_playlist_id, "track_id": track_id, "action": "play", "aimp": raw}


if __name__ == "__main__":
    clear_console()
    import uvicorn

    print(f"{APP_FULL_NAME} starting on http://0.0.0.0:5000")
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=False)
