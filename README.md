# Shared Expense & Settlement Hub

A professional, React-based Shared Grocery (Bazar) Cost Tracker and Settlement Ledger designed for roommates and families. Features real-time split calculations, custom interactive daily analytics charts, PDF settlement report downloads, and Excel sheet exports.

## Tech Stack
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS v3
* **Icons:** Lucide React
* **PDF Generation:** jsPDF + jsPDF-AutoTable

## Split Ratio Configuration
* Reza = 58.33%
* Reaz = 41.67%

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
