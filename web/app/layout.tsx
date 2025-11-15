import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'AI OSS Tracker - GitHub Trending AI Projects',
  description: 'Track trending AI open source projects on GitHub. Monitor star growth, velocity, and discover the hottest AI repositories.',
  keywords: ['GitHub', 'AI', 'open source', 'trending', 'machine learning', 'deep learning'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <ThemeProvider>
          <Header />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Built with Next.js and PostgreSQL • Data from GitHub API •{' '}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Source
                </a>
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

