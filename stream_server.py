import os
import time
import cv2
import numpy as np
from flask import Flask, Response, jsonify, request
from ultralytics import YOLO

app = Flask(__name__)

# Base paths
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_PATH = os.path.join(ROOT_DIR, "traffic.mp4")
MODEL_PATH = os.path.join(ROOT_DIR, "yolov8n.pt" if os.path.exists(os.path.join(ROOT_DIR, "yolov8n.pt")) else "yolov8s.pt")

print(f"Loading YOLO model from {MODEL_PATH}...")
model = YOLO(MODEL_PATH)

# Lane Zones
LANE_ZONES = {
    "North Lane": np.array([[280, 0], [540, 0], [540, 230], [280, 230]], np.int32),
    "South Lane": np.array([[580, 520], [840, 520], [840, 720], [580, 720]], np.int32),
    "East Lane":  np.array([[780, 140], [1280, 140], [1280, 360], [780, 360]], np.int32),
    "West Lane":  np.array([[0, 360], [450, 360], [450, 580], [0, 580]], np.int32)
}

CENTER_ZONE = np.array([[450, 230], [780, 230], [780, 520], [450, 520]], np.int32)

SIGNAL_COORDS = {
    "North Lane": (250, 180),
    "South Lane": (860, 540),
    "East Lane":  (800, 110),
    "West Lane":  (460, 600)
}

# Global state
state = {
    "emergency_active": None,
    "gridlock_start_time": None,
    "police_dispatched": False,
    "current_counts": {name: 0 for name in LANE_ZONES.keys()},
    "center_count": 0,
    "stuck_duration": 0,
    "timings": {},
    "last_frame_time": time.time()
}

def calculate_signal_timings(lane_counts, emergency_lane=None):
    if emergency_lane:
        timings = {lane: {"time": 5, "state": "RED"} for lane in lane_counts}
        timings[emergency_lane] = {"time": 90, "state": "GREEN"}
        return timings

    total = sum(lane_counts.values())
    if total == 0:
        return {lane: {"time": 15, "state": "RED"} for lane in lane_counts}
    
    max_lane = max(lane_counts, key=lane_counts.get)
    timings = {}
    for lane, count in lane_counts.items():
        allocated = max(10, int((count / max(total, 1)) * 60))
        timings[lane] = {
            "time": allocated,
            "state": "GREEN" if (lane == max_lane and count > 0) else "RED"
        }
    return timings

def generate_frames():
    cap = cv2.VideoCapture(VIDEO_PATH)
    frame_skip = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame = cv2.resize(frame, (1280, 720))
        h, w, _ = frame.shape
        overlay = frame.copy()

        # Draw lane zones
        colors = [(255, 80, 0), (0, 200, 0), (255, 0, 150), (0, 200, 255)]
        for i, (name, pts) in enumerate(LANE_ZONES.items()):
            cv2.fillPoly(overlay, [pts], colors[i])
        cv2.fillPoly(overlay, [CENTER_ZONE], (0, 0, 180))

        # Heatmap canvas
        heatmap = np.zeros((h, w), dtype=np.float32)

        # Inference on frame
        results = model(frame, classes=[2, 3, 5, 7], conf=0.20, verbose=False)
        boxes = results[0].boxes.xyxy.cpu().numpy()

        counts = {name: 0 for name in LANE_ZONES.keys()}
        center_count = 0

        for box in boxes:
            x1, y1, x2, y2 = map(int, box)
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2

            cv2.circle(heatmap, (cx, cy), 45, (1), -1)
            cv2.circle(frame, (cx, cy), 4, (0, 255, 255), -1)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 1)

            for name, pts in LANE_ZONES.items():
                if cv2.pointPolygonTest(pts, (cx, cy), False) >= 0:
                    counts[name] += 1
                    break

            if cv2.pointPolygonTest(CENTER_ZONE, (cx, cy), False) >= 0:
                center_count += 1

        # Render Thermal Heatmap
        heatmap = cv2.GaussianBlur(heatmap, (51, 51), 0)
        if np.max(heatmap) > 0:
            heatmap_colored = cv2.applyColorMap(np.uint8(255 * (heatmap / np.max(heatmap))), cv2.COLORMAP_JET)
            overlay = cv2.addWeighted(overlay, 0.5, heatmap_colored, 0.5, 0)

        frame = cv2.addWeighted(overlay, 0.35, frame, 0.65, 0)

        # Gridlock logic
        if center_count >= 2:
            if state["gridlock_start_time"] is None:
                state["gridlock_start_time"] = time.time()
            stuck_dur = int(time.time() - state["gridlock_start_time"])
            if stuck_dur >= 30:
                state["police_dispatched"] = True
        else:
            state["gridlock_start_time"] = None
            stuck_dur = 0
            state["police_dispatched"] = False

        state["stuck_duration"] = stuck_dur
        state["center_count"] = center_count
        state["current_counts"] = counts

        timings = calculate_signal_timings(counts, emergency_lane=state["emergency_active"])
        state["timings"] = timings

        # Draw physical signal lights on road
        for name, (sx, sy) in SIGNAL_COORDS.items():
            st = timings[name]["state"]
            cv2.rectangle(frame, (sx, sy), (sx + 24, sy + 60), (30, 30, 30), -1)
            cv2.rectangle(frame, (sx, sy), (sx + 24, sy + 60), (200, 200, 200), 1)
            r_color = (0, 0, 255) if st == "RED" else (0, 0, 50)
            cv2.circle(frame, (sx + 12, sy + 16), 7, r_color, -1)
            g_color = (0, 255, 0) if st == "GREEN" else (0, 50, 0)
            cv2.circle(frame, (sx + 12, sy + 44), 7, g_color, -1)

        # Emergency corridor banner
        if state["emergency_active"]:
            cv2.rectangle(frame, (20, 20), (520, 75), (0, 180, 0), -1)
            cv2.putText(frame, f"AMBULANCE CORRIDOR: {state['emergency_active'].upper()}", (30, 48), cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 2)
            cv2.putText(frame, "ALL LANES RED - 90s EMERGENCY LOCK", (30, 68), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

        # Gridlock banner
        if state["police_dispatched"]:
            cv2.rectangle(frame, (20, 90), (520, 145), (0, 0, 220), -1)
            cv2.putText(frame, "POLICE INTERVENTION DISPATCHED!", (30, 118), cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 2)
            cv2.putText(frame, "Intersection gridlocked >30s", (30, 138), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.033) # ~30 FPS

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/telemetry')
def get_telemetry():
    return jsonify(state)

@app.route('/emergency', methods=['POST'])
def trigger_emergency():
    lane = request.json.get('lane', 'East Lane')
    state["emergency_active"] = lane
    return jsonify({"status": "active", "lane": lane})

@app.route('/reset', methods=['POST'])
def reset_system():
    state["emergency_active"] = None
    state["gridlock_start_time"] = None
    state["police_dispatched"] = False
    return jsonify({"status": "reset"})

if __name__ == '__main__':
    print("Starting Nagpur Suraksha Netra ML Streaming Server on http://localhost:5000...")
    app.run(host='0.0.0.0', port=5000, threaded=True)
