# Quiz Scoreboard

A real-time scoreboard system for quiz competitions with 10 participants across 3 rounds.

## Introduction

Quiz Scoreboard is a single-page web application designed to track and visualize scores during quiz competitions. It features an interactive bar chart that displays scores for all participants across multiple rounds, making it easy for hosts and audiences to follow the competition progress.

### Features

- **Interactive Bar Chart** - Visual representation of scores for all participants per round
- **Multi-Round Support** - Navigate between 3 rounds with dedicated navigation buttons
- **Quick Score Input** - Increment/decrement scores with +1, +10, -1, -10 buttons or manual input
- **Editable Participant Names** - Click on any name to customize it
- **Score Summary Table** - View all scores per round with calculated totals
- **Auto-Save** - Data persists in localStorage across browser sessions
- **Reset Functionality** - Clear all data and start fresh

### Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite | Build Tool & Dev Server |
| TailwindCSS | Styling |
| Chart.js | Data Visualization |
| react-chartjs-2 | React wrapper for Chart.js |

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js

Verify your installation:

```bash
node --version
npm --version
```

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd scoreboard-ayat
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**

   Navigate to `http://localhost:5173`

## Usage

1. **Edit Participant Names** - Click on any participant name to customize it
2. **Input Scores** - Use the +/- buttons or type directly into the score input
3. **Navigate Rounds** - Click "Next Round" or "Previous Round" to switch between rounds
4. **View Summary** - Scroll down to see the complete score summary table
5. **Reset Data** - Click "Reset All" to clear all scores and start over

## Project Structure

```
scoreboard-ayat/
├── src/
│   ├── App.jsx          # Main scoreboard component
│   ├── main.jsx         # Application entry point
│   └── index.css        # TailwindCSS imports & global styles
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies & scripts
└── README.md            # This file
```

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository in Netlify dashboard
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit them

   ```bash
   git commit -m "Add: your feature description"
   ```

4. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and formatting
- Test your changes before submitting
- Write clear commit messages
- Update documentation if needed

## Troubleshooting

### File Watcher Limit Error (Linux)

If you encounter `ENOSPC: System limit for number of file watchers reached`:

```bash
# Increase the limit permanently
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Or run with polling mode
CHOKIDAR_USEPOLLING=true npm run dev
```

### Port Already in Use

If port 5173 is already in use:

```bash
npm run dev -- --port 3000
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
