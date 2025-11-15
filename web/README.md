# AI OSS Tracker - Frontend

A modern, responsive Next.js dashboard for tracking trending AI open source projects on GitHub.

## Features

- 📊 **Real-time Dashboard** - View trending AI projects with live metrics
- 🔍 **Advanced Filtering** - Filter by language, sort by stars/velocity
- 📈 **Interactive Charts** - Visualize star growth history with Recharts
- 🌓 **Dark Mode** - Beautiful dark theme with system preference detection
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- ⚡ **Server-Side Rendering** - Fast page loads with Next.js App Router
- 🎨 **Modern UI** - Built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running on port 3000

### Installation

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Available Scripts

```bash
# Development server (runs on port 3001)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

## Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with header/footer
│   ├── page.tsx           # Home page with projects list
│   ├── projects/          
│   │   └── [id]/          # Dynamic project detail pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Header.tsx        # Navigation header
│   ├── ProjectCard.tsx   # Project list item
│   ├── ProjectsList.tsx  # Projects grid
│   ├── Filters.tsx       # Language and sort filters
│   ├── Pagination.tsx    # Pagination controls
│   ├── StatsCards.tsx    # Dashboard statistics
│   ├── StarHistoryChart.tsx  # Star growth chart
│   └── ...               # Other components
├── lib/                  # Utilities and types
│   ├── api.ts           # API client
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Helper functions
└── package.json

```

## Features Guide

### Dashboard

The home page displays:
- System statistics (total projects, metrics, API quota)
- Filtering options (language, sort order)
- Grid of project cards with key metrics
- Pagination controls

### Project Details

Each project page shows:
- Full project information and description
- Detailed metrics (stars, forks, watchers, issues)
- Growth statistics (24h, 7d gains, velocity)
- Interactive star history chart
- Links to GitHub and homepage

### Dark Mode

The app automatically detects your system theme preference. You can manually toggle between light and dark mode using the theme switcher in the header. Your preference is saved in localStorage.

### Filtering

- **Language Filter**: Show projects in specific programming languages
- **Sort Options**: 
  - Most Stars (default)
  - Highest Velocity (fastest growing)
  - Recently Created

## API Integration

The frontend communicates with the backend API at `http://localhost:3000`.

API Proxy configuration in `next.config.js` handles requests to `/api/*` endpoints.

### API Client

The `lib/api.ts` file provides a type-safe API client:

```typescript
import { apiClient } from '@/lib/api';

// Get projects
const projects = await apiClient.getProjects({ page: 1, limit: 12 });

// Get project details
const project = await apiClient.getProject(1);

// Get star history
const history = await apiClient.getProjectHistory(1);

// Get system stats
const stats = await apiClient.getStats();
```

## Development

### Adding New Pages

Create new pages in the `app/` directory:

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <div>About</div>;
}
```

### Adding New Components

Create components in the `components/` directory:

```typescript
// components/MyComponent.tsx
export function MyComponent() {
  return <div>My Component</div>;
}
```

### Styling

The app uses Tailwind CSS. Custom styles can be added in:
- `app/globals.css` for global styles
- Component files using Tailwind classes
- `tailwind.config.ts` for theme customization

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `web`
4. Add environment variables
5. Deploy!

### Deploy Elsewhere

You can deploy the Next.js app to any platform that supports Node.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Self-hosted with Docker

## Troubleshooting

### Backend Connection Failed

Make sure the backend API is running on port 3000:
```bash
cd ..
npm run dev
```

### Port Already in Use

The dev server runs on port 3001 by default. Change it:
```bash
PORT=3002 npm run dev
```

### Build Errors

Clear Next.js cache:
```bash
rm -rf .next
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see parent directory LICENSE file

