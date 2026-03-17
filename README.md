# PrintGuard: AI-Powered Defect Detection App

## Mission Statement
> Transforming additive manufacturing through autonomous, scalable, and concurrent monitoring that turns machine failures into instant alerts and actionable data.

## Details
**PrintGuard** is an AI-powered process monitoring platform designed to help manufacturers, teams, and hobbyists eliminate 3D printing failures in real-time. Rather than relying on manual supervision or post-print inspection, PrintGuard uses a multi-camera computer vision system to continuously assess the health of a print. 

The system tracks the physical layer against the intended G-code path, identifying defects in the machine’s execution (such as warping, spaghetti, or under-extrusion) as they happen. Through the PrintGuard web platform, authenticated users can monitor their machines via a real-time livestream feed, complete with a dynamic "Print Health" confidence percentage bar. When the AI's confidence drops below a safe threshold, the system triggers an emergency stop and immediately dispatches an email notification. 

Built with scalability in mind, PrintGuard features robust Organization management. Users can join teams to view each other's live printing feeds, analyze fleet-wide statistics, and subscribe to shared error notifications, making it the perfect tool for makerspaces, university labs, and industrial print farms.

## Unique Features
* **Real-Time Print Dashboard:** Monitor your prints with a live camera feed and a dynamic AI confidence percentage bar indicating current print health.
* **Instant Email Notifications:** Secure user authentication linked to an automated alert system that emails you the moment a defect is detected.
* **Organization & Team Hub:** Create or join organizations to share live camera feeds, track fleet-wide print statistics, and manage collaborative printing workflows.
* **Multi-Camera Vision Mesh:** Scalable support for multiple angles to eliminate nozzle occlusion and monitor large-scale industrial printers.
* **Defect Detection:** Real-time identification of "Spaghetti," "Warping," and "Delamination" using high-speed YOLO (You Only Look Once) object detection models.
* **Autonomous Intervention:** Automatic "Emergency Stop" triggers via OctoPrint when catastrophic failures occur.

## Tech Stack
* **Backend:** FastAPI (Python w/ pyserial & OpenCV)
* **Frontend:** Next.js / Node.js
* **Database & Auth:** Supabase (PostgreSQL, Authentication, Row Level Security)
* **Computer Vision Model:** YOLO (Ultralytics / PyTorch)

---

## Getting Started

> **Note:** Please ensure you have [Next.js](https://nextjs.org/) and [Homebrew](https://brew.sh/) installed before setup.

### Backend Setup

1.  **Set up environment variables**
    Look at `.env.example` in the backend directory and create a new file named `.env`. Add the correct variables (Supabase credentials, Email SMTP settings, etc.).

2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

3.  **Create & Activate a Virtual Environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

4.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Return to Root Directory:**
    ```bash
    cd ..
    ```

6.  **Run the Backend Server:**
    ```bash
    uvicorn backend.main:app --reload
    ```

### Frontend Setup

1.  **Environment variable set up:**
    Create a new file named `.env.local` in the `frontend/printguard` directory and add correct variables from `.env.example`. Change the backend URL to your local backend URL if needed.

2.  **Navigate to the Frontend Directory:**
    ```bash
    cd frontend/printguard
    ```

3.  **Install Packages & Launch Development Server:**
    ```bash
    npm install
    npm run dev
    ```
