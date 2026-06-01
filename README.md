# Connectly 
> A modern, full-stack social networking web application. Featuring real-time direct communication, intelligent matching algorithm, and analytics to help track your interactions over time - all in one seamless experience. Built as a COMP602 Semester Project at AUT.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-brightgreen?style=for-the-badge&logo=vercel)](https://connectly-pink-six.vercel.app/)
[![Java](https://img.shields.io/badge/Java-17%2B-orange?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

---
## Screenshots

| | | |
| :---: | :---: | :---: |
| ![Screenshot 1](https://github.com/fatehbhular/Connectly/blob/main/IMG_8724.PNG?raw=true) | ![Screenshot 2](https://github.com/fatehbhular/Connectly/blob/main/IMG_8722.PNG?raw=true) | ![Screenshot 3](https://github.com/fatehbhular/Connectly/blob/main/IMG_8723.PNG?raw=true) |

---

## Tech Stack

Connectly is architected using a decoupled client-server model, utilizing modern cloud infrastructure for continuous deployment.

### Core Architecture
* **Frontend:** `React` (v18+) powered by `Vite` for ultra-fast bundling and HMR.
* **Backend:** `Spring Boot` (Java 17) implementing a RESTful API architecture.
* **Database:** `Supabase` hosting a managed cloud `PostgreSQL` instance.

### Cloud Infrastructure & DevOps
* **Frontend Hosting:** `Vercel` (Automated CI/CD pipelines via GitHub integration).
* **Backend Hosting:** `Railway` (Containerized production deployment environment).
* **Version Control:** `GitHub` (Structured feature-branch workflow).

---

## Features

* **Secure Authentication** – User profiles and onboarding configurations.
* **Real-Time Context** – Instantaneous direct messaging corridors between users.
* **Chat Hub** – Centralized conversation history with a dedicated DM inbox list.
* **Voice + Video Calling** - Peer-to-peer voice and video calls between users.
* **Secure Database Hashing** - Passwords and sensitive data protected with industry standard hashing.
* **Profile Analytics** – Insights and activity tracking on user profiles.
* **Matching Algorithm** – Smart user matching based on shared interests and connections.
* **Robust REST API** – Modular, scalable Spring Boot endpoints handling messaging payloads.

---

## 📂 Project Structure

```text
connectly/
├── frontend/          # React + Vite Client Application
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Buttons, Chat Bubbles, Sidebars)
│   │   ├── pages/        # View Containers (Login, Dashboard, Chat)
│   │   └── assets/       # Static media assets and styling configurations
│   └── package.json
│
└── backend/           # Spring Boot REST API
    ├── src/main/java/
    │   └── com/connectly/
    │       ├── controller/ # REST API Request Endpoints
    │       ├── service/    # Business Logic Layer
    │       ├── repository/ # Spring Data JPA Database Queries
    │       └── model/      # Data Entities & POJOs
    └── build.gradle
```

---

## Team Members

* **Fateh Bhular** - Product Owner / Fullstack Developer / UI Designer ([GitHub](https://github.com/fatehbhular))
* **Shawn Lee** - Scrum Master / Fullstack Developer ([GitHub](https://github.com/ShawnLeeyz))
* **Leo Cao** - Fullstack Developer / UI Designer ([GitHub](https://github.com/LeoCaoProjects))
* **Srikar Kurani** - Fullstack Developer ([GitHub](https://github.com/SrikarKurani))

---

## License

This software is developed strictly for educational use case evaluations as an undergraduate group assignment for **COMP602** at the **Auckland University of Technology (AUT)**.
