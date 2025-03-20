// src/app/layout.tsx
"use client";
import '../styles/globals.css';
import Layout from '../components/Layout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>MarketEvents MVP</title>
      </head>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}