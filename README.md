# 🚦 Nagpur Suraksha Netra (नागपूर सुरक्षा नेत्र)
### AI-Powered Traffic Risk Heatmap, Edge Computer Vision Perception & Police Deployment Decision Support System (ITMS)
**Viksit Nagpur Hackathon | Integrated Intelligent Traffic Management System**

---

<div align="center">

![Suraksha Netra Banner](https://img.shields.io/badge/Viksit_Nagpur-Smart_City_ITMS-10b981?style=for-the-badge)
![Next.js 16](https://img.shields.io/badge/Next.js_16-React_19-black?style=for-the-badge&logo=next.js)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Computer_Vision-ff334b?style=for-the-badge&logo=ultralytics)
![OpenCV](https://img.shields.io/badge/OpenCV-Thermal_Heatmap-5c3cfc?style=for-the-badge&logo=opencv)
![Python 3.11+](https://img.shields.io/badge/Python-Flask_Streaming-3776ab?style=for-the-badge&logo=python)
![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%82%E0%A4%A6%E0%A4%BF%20%7C%20%E0%A4%AE%E0%A4%B0%E0%A4%BE%E0%A4%A0%E0%A5%80-orange?style=for-the-badge)

</div>

---

## 🌟 Executive Summary

**Nagpur Suraksha Netra** is an enterprise-grade Intelligent Traffic Management & Decision Support System designed for the chaotic, high-density, multi-modal traffic landscape of Nagpur. 

The platform bridges real-time **Edge Computer Vision Perception (YOLOv8)**, **IMD & Open-Meteo Dynamic Weather Doppler Radar**, **Citizen Hazard Reporting**, and **Police Field Officer Deployment DSS** into an integrated command platform.

```
                      ┌──────────────────────────────────────────────┐
                      │        NAGPUR SURAKSHA NETRA PLATFORM        │
                      └──────────────────────┬───────────────────────┘
                                             │
             ┌───────────────────────────────┴──────────────────────────────┐
             ▼                                                              ▼
┌──────────────────────────────┐                              ┌──────────────────────────────┐
│  AI Vision Engine (Python)   │                              │   Civilian & Police Portal   │
│  - YOLOv8 Edge Perception    │                              │   - Next.js 16 + React 19    │
│  - 4-Lane Polygon Zones      │   ─── Live MJPEG Stream ───► │   - GPS Proximity Engine     │
│  - Thermal JET Heatmap       │       (localhost:5000)       │   - 500km Doppler Rain Radar │
│  - Adaptive Signal Logic     │                              │   - Trilingual (EN/HI/MR)    │
│  - 30s Gridlock Dispatch     │                              │   - Police Incident Console  │
│  - Ambulance Green Corridor  │                              │   - Citizen Hazard Modal     │
└──────────────────────────────┘                              └──────────────────────────────┘
```

---

## ⚡ Core Innovations & Features

### 1. 🎥 Edge Computer Vision & Adaptive Traffic Control (ATCS)
- **Live Stream Integration**: Real-time YOLOv8 vehicle detection (`2W`, `3W`, `Cars`, `Buses`, `Trucks`) processing 4-way intersection feeds (`traffic.mp4`).
- **Directional Polygon Lane Zones**: Maps North, South, East, and West incoming lanes to calculate per-lane vehicle density.
- **Dynamic Signal Timing Allocation**: Automatically calculates optimal green time (10s to 60s) allocated proportionally to the heaviest lane while holding red on others.
- **Thermal Density Heatmap**: Generates a real-time `cv2.COLORMAP_JET` Gaussian blur thermal overlay directly over vehicles to visually prove clustering.
- **Center Junction Gridlock Counter**: Automatically monitors the center intersection box; if $\ge 2$ vehicles remain stalled for $>30\text{ seconds}$, it triggers an automated **Police Intervention Dispatch Alert**.
- **Acoustic Ambulance Priority Corridor**: Simulated audio siren override (`[E]` Hotkey) that instantly freezes all normal traffic, locks all lanes to Red, and grants a **90-second Green Corridor** for emergency transit.

### 2. 🌧️ 500km Regional Precipitation Doppler Radar (MSN Weather Style)
- **Granular Localized Rain Pockets**: Displays discrete micro-rain patches across specific Nagpur neighborhoods (*Itwari East*, *Sakkardara South-East*, *Koradi North*) without obscuring the city's road network.
- **500km Central India Doppler Radar**: Covers Vidarbha, MP, Chhattisgarh, and Odisha borders with storm fronts (*Bhandara*, *Gondia ⚡*, *Chhindwara*, *Raipur / Janjgir-Champa ⚡*, *Chandrapur ⚡*, *Jabalpur ⚡*).
- **Interactive Forecast Scrubber**: Allows scrubbing forward from `Now`, `+30m`, `+60m`, `+90m`, to `+120m` with dynamic cloud drift vectors.
- **Live Open-Meteo Weather Sync**: Real-time live temperature, rain rate ($mm/hr$), humidity, and wind speed dynamically updated from the Open-Meteo API.

### 3. 🌐 Trilingual Accessibility (English / हिंदी / मराठी)
- **First-Visit Language Modal**: Automatically asks first-time visitors to choose their preferred language (**English**, **हिंदी**, **मराठी**).
- **Instant Header Toggle**: Seamless `[ 🌐 EN | HI | MR ]` switcher available on every screen.
- **Bilingual Identity**: High-contrast **`SURAKSHA`** in Signal Green (`#10b981`) and **`नेत्र`** in Devanagari Hindi Vibrant Red (`#ef4444`).

### 4. 📍 Citizen Hazard Dispatch & Emergency Response
- **Citizen Report Modal**: Citizens can report heavy traffic jams, monsoon waterlogging, collisions, and broken-down vehicles with geo-tagged junction selection.
- **Real-Time Police DSS Injection**: Citizen reports instantly reflect on the active incidents queue of the police command console.
- **Emergency Helplines**: 1-click access to Police Emergency (`112`), Traffic Control Room (`1095`), and WhatsApp Traffic Mitra.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Portal** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion |
| **Mapping Engine** | Leaflet.js, React-Leaflet, CartoDB Voyager High-Performance Tiles |
| **Computer Vision** | Python 3.11+, Ultralytics YOLOv8 (`yolov8s.pt`), OpenCV (`cv2`), NumPy |
| **Backend Streaming** | Flask MJPEG Streamer & REST Telemetry API (`stream_server.py`) |
| **Weather Telemetry**| Open-Meteo WMO Live Weather API & IMD Doppler Modeling |
| **Deployment** | Firebase Hosting (`suraksha-netra-743e8`), GitHub Actions |

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js `v18.17+` or `v20+`
- Python `3.10+`
- `git`

---

### Step 1: Clone Repository
```bash
git clone https://github.com/pranayukey200/viksit_nagpur_ITMS.git
cd viksit_nagpur_ITMS
```

---

### Step 2: Start Python Computer Vision Stream Server
```bash
# Install Python CV dependencies
pip install opencv-python ultralytics flask numpy

# Run the live AI Vision Stream Server (runs on port 5000)
python stream_server.py
```
> The stream will be live at `http://localhost:5000/video_feed` and telemetry at `http://localhost:5000/telemetry`.

---

### Step 3: Start Next.js Frontend Web Portal
```bash
cd frontennd

# Install Node dependencies
npm install

# Start development server
npm run dev
# OR build and run production server
npm run build
npm start
```
> Open [http://localhost:3000](http://localhost:3000) in your browser.
> Navigate to [http://localhost:3000/perception](http://localhost:3000/perception) to view the live Sitabuldi Square computer vision stream.

---

## ⌨️ Keyboard Shortcuts & Interactive Demos

| Key | Action |
|---|---|
| <kbd>E</kbd> | **Trigger Ambulance Green Corridor** (Locks East Lane Green 90s, all others RED) |
| <kbd>G</kbd> | **Simulate Center Junction Gridlock** (Triggers 30s countdown & Police Dispatch) |
| <kbd>R</kbd> | **Reset Signal & Clear Corridors** (Returns to normal YOLO ATCS cycle) |

---

## ☁️ Firebase Deployment

This project is configured for Firebase Hosting on project **`suraksha-netra-743e8`**:

```bash
# Login to Firebase
npx firebase-tools login

# Deploy Next.js Web App
npx firebase-tools deploy --project suraksha-netra-743e8
```

---

## 👥 Contributors & Acknowledgements

Developed for the **Viksit Nagpur Hackathon** under the Smart City Traffic Safety Initiative.

- **Lead Engineer & AI Developer**: Pranay Ukey ([@pranayukey200](https://github.com/pranayukey200))
- **Organization**: Nagpur Smart & Sustainable City Development Corporation Limited (NSSCDCL) & Nagpur City Traffic Police.

---

<div align="center">
  <sub>Built with ❤️ for a safer, smarter, and congestion-free Nagpur.</sub>
</div>
