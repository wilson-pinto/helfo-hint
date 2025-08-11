# Helfo Hint

Helfo Hint is a web application designed to assist with medical coding. It provides suggestions for service codes and allows for manual entry and validation of codes

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

You need to have [Bun](https://bun.sh/) installed on your machine.

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
    bun install
    ```

### Running the Application

To start the development server, run the following command:

```sh
bun run dev
```

This will start the application in development mode, with hot-reloading enabled. Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view it in the browser.

## Building for Production

To create a production build, use:

```sh
bun run build
```

This command bundles the application for production and outputs the static files to the `dist` directory.

## Deployment

This project can be deployed using various platforms that support Vite-based applications. 
