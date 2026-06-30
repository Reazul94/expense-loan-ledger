# WalletLedger Hub (Expense & Loan Ledger)

A professional, React-based offline-first personal finance tracker seamlessly integrated with a comprehensive Islamic library. Designed for privacy and accessibility, it features expense and loan tracking, a fully offline Quran Explorer, Hadith Explorer (Sihah Sittah), interactive daily reflections, and a dual analog/digital clock widget. The application runs entirely in your browser with secure local storage and PWA support.

## Tech Stack
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS v3
* **Icons:** Lucide React
* **Architecture:** Offline-First Progressive Web App (PWA) with LocalStorage

## Key Features
* **Expense & Loan Management:** Track your daily expenses and manage loans completely offline.
* **Quran & Hadith Explorer:** Full 114 Surahs and the 6 Sahih Hadith books (Sihah Sittah) with Arabic, Bengali, and English translations.
* **Data Security & Portability:** 100% serverless. Export and Import your data securely via JSON backups.
* **Multi-Language UI:** Seamlessly switch between English and Bengali interfaces.
* **PWA Ready:** Installable on iOS, Android, and Desktop for a native app experience.

## How to Install and Run Locally
Anyone can download and run this project on their own computer or network. Follow these simple steps:

### Prerequisites
Make sure you have Node.js installed (v16 or higher is recommended).

### 1. Install Dependencies
Navigate to the project root directory and install all required packages:

```bash
npm install
```

### 2. Run the Development Server
Start the local development server:

```bash
npm run dev
```

### Accessing the App on Your Local Network (Wi-Fi)
The Vite configuration has been pre-configured to bind to all hosts (`server.host: true`).

When you run `npm run dev`, Vite will display multiple URLs:

```text
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

* **Local:** Open `http://localhost:5173/` on the PC running the server.
* **Other Devices (Mobile, Tablet, Laptops):** Connect the devices to the same Wi-Fi network as the host PC, and enter the Network URL (e.g. `http://192.168.1.100:5173/`) in their web browsers to use the app in real time!

## License & Copyright
Copyright © 2026 Reazul. All Rights Reserved. Licensed under the MIT License.
