import cv2
import numpy as np
from ultralytics import YOLO
import time

# 1. Load Model
print("Initializing Nagpur Smart Traffic AI Engine...")
model = YOLO('yolov8s.pt')

# 2. Perfected Lane Zones (Mapped to Incoming Traffic Lanes)
LANE_ZONES = {
    "North Lane": np.array([[280, 0], [540, 0], [540, 230], [280, 230]], np.int32),
    "South Lane": np.array([[580, 520], [840, 520], [840, 720], [580, 720]], np.int32),
    "East Lane":  np.array([[780, 140], [1280, 140], [1280, 360], [780, 360]], np.int32),
    "West Lane":  np.array([[0, 360], [450, 360], [450, 580], [0, 580]], np.int32)
}

# Center Junction Box for Gridlock Detection
CENTER_ZONE = np.array([[450, 230], [780, 230], [780, 520], [450, 520]], np.int32)

# Stop-line positions on the video for physical traffic light rendering
SIGNAL_COORDS = {
    "North Lane": (250, 180),
    "South Lane": (860, 540),
    "East Lane":  (800, 110),
    "West Lane":  (460, 600)
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

# Video Setup
video_path = r"d:\Hackathon_projects\VIKSIT_NAGPUR\traffic.mp4"
cap = cv2.VideoCapture(video_path)

emergency_active = None
gridlock_start_time = None
police_dispatched = False

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        continue

    frame = cv2.resize(frame, (1280, 720))
    h, w, _ = frame.shape
    
    # Create side-by-side canvas: 400px Left Sidebar + 1280px Video = 1680x720
    canvas = np.zeros((720, 1680, 3), dtype=np.uint8)
    
    # Base Overlays for Video
    overlay = frame.copy()
    colors = [(255, 80, 0), (0, 200, 0), (255, 0, 150), (0, 200, 255)]
    for i, (name, pts) in enumerate(LANE_ZONES.items()):
        cv2.fillPoly(overlay, [pts], colors[i])
    cv2.fillPoly(overlay, [CENTER_ZONE], (0, 0, 180)) # Junction zone

    # Heatmap Canvas
    heatmap = np.zeros((h, w), dtype=np.float32)

    # YOLO Inference
    results = model(frame, classes=[2, 3, 5, 7], conf=0.15, verbose=False)
    boxes = results[0].boxes.xyxy.cpu().numpy()

    current_counts = {name: 0 for name in LANE_ZONES.keys()}
    center_vehicle_count = 0

    for box in boxes:
        x1, y1, x2, y2 = map(int, box)
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2

        # Draw vehicle heat spots & tracking dots
        cv2.circle(heatmap, (cx, cy), 45, (1), -1)
        cv2.circle(frame, (cx, cy), 4, (0, 255, 255), -1)

        for name, pts in LANE_ZONES.items():
            if cv2.pointPolygonTest(pts, (cx, cy), False) >= 0:
                current_counts[name] += 1
                break

        if cv2.pointPolygonTest(CENTER_ZONE, (cx, cy), False) >= 0:
            center_vehicle_count += 1

    # Render Heatmap onto frame
    heatmap = cv2.GaussianBlur(heatmap, (51, 51), 0)
    if np.max(heatmap) > 0:
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * (heatmap / np.max(heatmap))), cv2.COLORMAP_JET)
        overlay = cv2.addWeighted(overlay, 0.5, heatmap_colored, 0.5, 0)
    
    frame = cv2.addWeighted(overlay, 0.35, frame, 0.65, 0)

    # 30-Second Gridlock Counter Logic
    if center_vehicle_count >= 2:
        if gridlock_start_time is None:
            gridlock_start_time = time.time()
        stuck_duration = int(time.time() - gridlock_start_time)
        if stuck_duration >= 30: # 30s threshold
            police_dispatched = True
    else:
        gridlock_start_time = None
        stuck_duration = 0
        police_dispatched = False

    timings = calculate_signal_timings(current_counts, emergency_lane=emergency_active)

    # Draw Physical On-Road Signal Light Housings
    for name, (sx, sy) in SIGNAL_COORDS.items():
        state = timings[name]["state"]
        # Housing box
        cv2.rectangle(frame, (sx, sy), (sx + 24, sy + 60), (30, 30, 30), -1)
        cv2.rectangle(frame, (sx, sy), (sx + 24, sy + 60), (200, 200, 200), 1)
        # Red lamp
        r_color = (0, 0, 255) if state == "RED" else (0, 0, 50)
        cv2.circle(frame, (sx + 12, sy + 16), 7, r_color, -1)
        # Green lamp
        g_color = (0, 255, 0) if state == "GREEN" else (0, 50, 0)
        cv2.circle(frame, (sx + 12, sy + 44), 7, g_color, -1)

    # Place Video into Canvas (Right side: X=400 to 1680)
    canvas[0:720, 400:1680] = frame

    # --- SIDEBAR TELEMETRY (Left side: X=0 to 400) ---
    cv2.rectangle(canvas, (0, 0), (400, 720), (20, 24, 33), -1)
    cv2.putText(canvas, "NAGPUR SMART CITY AI", (20, 45), cv2.FONT_HERSHEY_DUPLEX, 0.75, (255, 255, 255), 2)
    cv2.putText(canvas, "Live Surveillance & Traffic Control", (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (160, 160, 160), 1)
    cv2.line(canvas, (20, 85), (380, 85), (60, 65, 80), 1)

    y_offset = 125
    for name in LANE_ZONES.keys():
        count = current_counts[name]
        data = timings[name]
        state = data["state"]
        time_left = data["time"]

        # Signal card background
        card_bg = (30, 50, 35) if state == "GREEN" else (35, 35, 45)
        cv2.rectangle(canvas, (20, y_offset - 25), (380, y_offset + 35), card_bg, -1)
        cv2.rectangle(canvas, (20, y_offset - 25), (380, y_offset + 35), (70, 75, 90), 1)

        # Indicator bulb
        bulb_color = (0, 255, 0) if state == "GREEN" else (0, 0, 255)
        cv2.circle(canvas, (42, y_offset + 5), 10, bulb_color, -1)

        # Lane text and timing
        cv2.putText(canvas, name, (65, y_offset + 2), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
        cv2.putText(canvas, f"Vehicles: {count}", (65, y_offset + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1)
        
        status_str = f"PASS ({time_left}s)" if state == "GREEN" else f"STOP ({time_left}s)"
        cv2.putText(canvas, status_str, (260, y_offset + 12), cv2.FONT_HERSHEY_DUPLEX, 0.55, bulb_color, 1)

        y_offset += 75

    # Center Junction Gridlock Telemetry
    cv2.line(canvas, (20, y_offset - 10), (380, y_offset - 10), (60, 65, 80), 1)
    cv2.putText(canvas, "JUNCTION GRIDLOCK MONITOR", (20, y_offset + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    cv2.putText(canvas, f"Stuck in Square: {center_vehicle_count} vehicles", (20, y_offset + 40), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 200, 200), 1)
    cv2.putText(canvas, f"Duration: {stuck_duration}s / 30s threshold", (20, y_offset + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 200, 200), 1)

    if police_dispatched:
        cv2.rectangle(canvas, (20, y_offset + 75), (380, y_offset + 135), (0, 0, 200), -1)
        cv2.putText(canvas, "POLICE INTERVENTION DISPATCHED!", (30, y_offset + 100), cv2.FONT_HERSHEY_DUPLEX, 0.45, (255, 255, 255), 1)
        cv2.putText(canvas, "Alerting Nagpur Traffic Control...", (30, y_offset + 120), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (220, 220, 220), 1)

    # Ambulance Corridor Alert
    if emergency_active:
        cv2.rectangle(canvas, (20, 580), (380, 640), (0, 160, 0), -1)
        cv2.putText(canvas, f"SIREN: {emergency_active.upper()}", (30, 605), cv2.FONT_HERSHEY_DUPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(canvas, "GREEN CORRIDOR ACTIVE - ALL HALT", (30, 625), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

    # Footer Shortcut Keys
    cv2.putText(canvas, "HOTKEYS: [E] Ambulance | [R] Reset | [Q] Quit", (20, 695), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (120, 120, 120), 1)

    cv2.imshow("Nagpur Smart City Surveillance AI", canvas)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        break
    elif key == ord('e'):
        emergency_active = "East Lane"
    elif key == ord('r'):
        emergency_active = None
        gridlock_start_time = None
        police_dispatched = False

cap.release()
cv2.destroyAllWindows()