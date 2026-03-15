# Docker Setup for VibeSync

## Quick Start (Recommended)

1. **Ensure Docker Desktop is running.**
2. **Run the helper script:**
   ```powershell
   .\scripts\docker-start.ps1
   ```

## Manual Commands

**Build and run with Docker Compose:**
```bash
docker-compose up --build
```

**Access the app:**
- Open your browser and go to `http://localhost:8081`
- Scan the QR code displayed in the terminal logs (`docker-compose logs -f`) with the Expo Go app.

## Troubleshooting Connectivity

If Expo Go cannot connect to the Metro bundler:
1. Ensure your computer and phone are on the same Wi-Fi.
2. Check your firewall settings to allow traffic on port `8081`.
3. The `docker-compose.yml` is pre-configured with a host IP detector, but you can manually set `REACT_NATIVE_PACKAGER_HOSTNAME` to your IP if needed.

## Manual Docker Commands (Alternative)

**Build the image:**
```bash
docker build -t vibesync .
```

**Run the container:**
```bash
docker run -p 8081:8081 vibesync
```

## Development

The Docker container mounts your source code via volumes, so changes you make locally update the container immediately.

## Ports Used

- `8081`: Metro bundler (Required)
- `19000-19002`: Legacy Expo ports
