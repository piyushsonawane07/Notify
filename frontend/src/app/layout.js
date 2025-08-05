import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '../components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Virtual Pinboard',
  description: 'A real-time collaborative pinboard application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
        {children}
        <Toaster/>
      </body>
    </html>
  );
}