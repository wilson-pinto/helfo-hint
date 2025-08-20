# Helfo Hint

Helfo Hint is a web application designed to assist with medical diagnosis code and service code. It provides suggestions for service codes and diagnosis codes and allows for manual entry and validation of codes.

## Demo

Try the live demo here: [https://helfo-hint.netlify.app/](https://helfo-hint.netlify.app/) (Note: backend is pointing to localhost as it is not hosted yet)

## Technologies Used

This project is built with the following technologies:

- **Vite**: A next-generation frontend tooling that provides a faster and leaner development experience.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **shadcn/ui**: A collection of re-usable components built using Radix UI and Tailwind CSS.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js** (version 18 or higher recommended)
- **npm** (comes with Node.js)

### Installation

1.  **Clone the repo**
    ```sh
    git clone <YOUR_GIT_URL>
    ```
2.  **Navigate to the project directory**
    ```sh
    cd helfo-hint
    ```
3.  **Install dependencies**
    ```sh
    npm install
    ```

### Running the Application

To start the development server, run the following command:

```sh
npm run dev
```

This will start the application in development mode, with hot-reloading enabled. Open [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal) to view it in the browser.

## Building for Production

To create a production build, use:

```sh
npm run build
```

This command bundles the application for production and outputs the static files to the `dist` directory.

## Deployment

This project can be deployed using various platforms that support Vite-based applications.

## Technical Documentation

### Architecture
- **Frontend:** Built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui components. The UI is modern, responsive, and uses a Redux store for state management.
- **Backend:** The backend is expected to run locally (not hosted in the demo). It exposes REST and WebSocket endpoints for AI-powered code suggestions, validation, and workflow management.

### Main Flows
1. **SOAP Note Entry:**
   - Users enter a SOAP note (Subjective, Objective, Assessment, Plan) via a textarea.
   - The note is stored in Redux 

2. **AI Workflow:**
   - On submission, the frontend sends the SOAP note to the backend via REST API and opens a WebSocket for real-time workflow updates.
   - The backend processes the note through several stages (PII detection, anonymization, code prediction, reranking, validation, referral checks, etc.).
   - The frontend displays a timeline of workflow stages and reasoning trail, updating in real time as the backend progresses.

3. **Code Suggestions & Validation:**
   - The backend returns suggested diagnosis and service codes.
   - Users can accept, reject, or manually enter codes.
   - Validation requests are sent to the backend, which checks compliance and compatibility.

4. **Final Output:**
   - Once the workflow is complete, the frontend displays a summary, clinical details, and allows downloading of PDF or referral draft.

### State Management
- **Redux Toolkit** is used for global state (SOAP note, code suggestions, accepted codes, loading/errors, UI state).
- Actions and async thunks handle API calls, state updates, and error handling.

### UI Components
- **shadcn/ui** provides accessible, themeable UI primitives (Card, Button, Textarea, Tabs, etc.).
- The timeline and workflow are visually separated for clarity.

### Configuration
- **Vite** is configured for fast development and hot-reloading.
- **Port 8080** is used for local development (see `vite.config.ts`).
- **Path alias (@)** is set for cleaner imports from `src`.

### Extending/Customizing
- To add new workflow stages, update the `stageConfig` and backend logic.
- To change UI theme, edit Tailwind and shadcn/ui config.
- Backend endpoints can be swapped for hosted APIs when available.

### Deployment
- The frontend can be deployed to Netlify, Vercel, or any static host.
- The backend must be hosted separately and the frontend configured to point to its URL.

---