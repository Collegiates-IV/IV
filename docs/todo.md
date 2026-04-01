# PrintGuard Backend To-Do

The backend is currently well-structured for a local, direct-attached setup, but it’s missing a few critical pieces to become a robust, production-ready "mesh" camera system.

## Currently Working
- **Threaded Camera Management (`CameraManager`)**: Background worker system that continually grabs the latest frames using OpenCV on separate threads without blocking API endpoints.
- **Streaming & Snapshots**: Functioning MJPEG stream endpoints (`multipart/x-mixed-replace`) and snapshot endpoints that pull the latest JPEG frame from the threaded workers.
- **Device Mapping (`StationRegistry`)**: Link a specific camera index to a specific printer (along with its Serial Port and Baud rate) creating a "Station".
- **Serial Control**: `pyserial` integration is set up to send emergency stops (`M112`) and pauses (`M25`) to the printers over USB.

---

## Mesh Camera System Requirements (To-Do)

### 1. Support for IP / Network Cameras (Critical)
Right now, `cameraSourceId` in `routers/stations.py` and `routers/video.py` is strictly typed as an integer (`int = Field(..., ge=0, le=16)`), which expects local physical USB webcams.
- **Action**: Change `cameraSourceId` to a generic type (`Union[int, str]` or just `str`) to support RTSP or HTTP URLs (e.g., `rtsp://192.168.1.50:554/stream`) that are standard for mesh cameras (like ESP32-Cams or external IP Cameras).

### 2. Persistence / Database Integration (Critical)
`StationRegistry` currently stores all configurations in memory. If the FastAPI backend restarts, all connected stations and printer mappings disappear.
- **Action**: Connect the station registry to Supabase (or any persistent database layer) so that stations are saved and loaded automatically on startup.

### 3. Endpoint Security and Authentication (High Priority)
Currently, `main.py` has no authentication middleware configured for the API endpoints.
- **Action**: Implement JWT validation or pass the Supabase session token to the FastAPI backend to verify that users have permission to view camera streams or send G-code controls.

### 4. Streaming Performance Optimization (Medium Priority)
Using MJPEG over HTTP (`multipart/x-mixed-replace`) is fine for 1-2 cameras, but it consumes large amounts of network bandwidth and browser memory for a "mesh" of numerous cameras.
- **Action**: Overhaul video delivery mechanisms to utilize WebSockets or WebRTC to dramatically reduce lag and bandwidth costs for a multi-camera dashboard.

### 5. YOLO Pipeline Integration (Deferred)
The backend requires integration of the machine-vision YOLO model into the frame streaming pipeline to parse video feeds for anomalies or errors.
- **Status**: Currently ignored / deferred. Mock endpoints exist but no inference is running.
