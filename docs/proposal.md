# Project Proposal

## Problem Statement  
**What & Why**

Preparing for and executing long 3D prints is inefficient and costly because prints often fail silently, wasting hours of machine time and expensive filament. Most operators do not know a print is failing until they manually check on it hours later, leading to catastrophic material waste and delayed production schedules.

Current approaches such as manual supervision, relying on basic filament sensors, or waiting for post-print inspections fail to address the root issue as it happens. This results in wasted resources, damaged equipment, and unpredictable production times.

Our project addresses this by continuously monitoring the print in real-time, detecting defects as they occur, and autonomously intervening to prevent further waste.

---

## Target Users  
**Who Benefits**

- Managers of makerspaces and university engineering labs  
- Operators of industrial 3D print farms  
- Hobbyists and enthusiasts running long or complex prints  
- Engineering teams looking to gather fleet-wide statistics and improve print reliability  

The platform is designed to support users scaling from a single at-home printer to a massive multi-machine industrial farm.

---

## Solution Overview  
**How the App Solves the Problem**



The application provides a centralized, autonomous monitoring system that uses multi-camera computer vision to continuously assess the health of a 3D print. By evaluating the physical layer being printed against the intended G-code, the system can immediately identify catastrophic defects like warping, spaghetti, or under-extrusion.

Key characteristics of the solution:
- Prints are monitored via a real-time livestream feed complete with a dynamic "Print Health" confidence percentage bar.
- The system automatically triggers an emergency stop via OctoPrint when the AI's confidence drops below a safe threshold.
- Instant email notifications are dispatched the moment a defect is detected.  
- Robust Organization management allows teams to share live camera feeds, track fleet-wide statistics, and subscribe to shared error notifications.  

The goal is to eliminate 3D printing failures in real-time, turning machine errors into instant alerts and actionable fleet data, ultimately saving time and material.

---

## Tech Stack Justification  
**Why These Tools**

- **Next.js** Provides a modern, performant frontend framework with built-in routing, server-side rendering, and scalability. It enables a clean, responsive user experience for the real-time print dashboard, livestream feeds, and organization management.

- **FastAPI** Offers a high-performance Python backend with async support, crucial for processing high-speed telemetry and handling live computer vision inference. It serves as the rapid bridge between the camera feeds, AI models, and the frontend.

- **Supabase (PostgreSQL)** A reliable relational database and authentication provider ideal for securely storing user accounts, organization structures, print history, fleet-wide statistics, and handling Row Level Security for team feeds.

- **Ollama (Llama 3 / Mistral) & YOLO** Enables local, high-speed AI inference for computer vision (YOLO) and diagnostic reasoning (LLMs) without relying on expensive cloud APIs. This ensures low-latency defect detection and keeps proprietary manufacturing data completely private.

- **OctoPrint API** Provides the essential control interface to communicate directly with the 3D printers, allowing the system to pull real-time telemetry and autonomously inject G-code commands like emergency stops.

---
