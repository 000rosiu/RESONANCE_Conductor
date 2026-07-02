# VIMLworks RESONANCE Conductor

Local FastAPI middleware + PWA for controlling media players like AIMP through its HTTP server.

> **Note:** RESONANCE Conductor currently supports **AIMP only**. Support for additional connection types is planned for future releases.

## Requirements

RESONANCE Conductor requires the AIMP HTTP Remote Control plugin to be installed:
[AIMP-HTTP-Remote-Control-Server](https://github.com/slv-tech/AIMP-HTTP-Remote-Control-Server)

## Getting Started

Windows:
```bat
start.bat
```

Linux:
```bash
./start.sh
```

Default panel address: `http://localhost:5000`. From a tablet, computer, or phone, go to the IP address of the computer running the middleware, e.g. `http://192.168.1.20:5000`.

## First-time Setup

If `config.json` does not exist, the app displays a setup wizard. Default AIMP settings:
- IP: `127.0.0.1`
- Port: `19122`
- Type: `AIMP (Direct HTTP API)`

After saving, the wizard creates `config.json`. The file can be edited manually afterward, e.g.:
```json
{
  "connection_type": "AIMP (Direct HTTP API)",
  "aimp_ip": "127.0.0.1",
  "aimp_port": 19122,
  "custom_management_name": "Your name",
  "custom_logo_url": "/static/logo.png",
  "theme_color": "#1fbf75",
  "default_playlist_id": "0"
}
```
