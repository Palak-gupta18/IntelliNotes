import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'IntelliNotes - AI Study Assistant',
  description: 'AI-powered study assistant with summaries, quizzes, and chat.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* We import the 'Inter' font from Google Fonts for a modern typography look */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Everything inside AuthProvider has access to the user state */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
