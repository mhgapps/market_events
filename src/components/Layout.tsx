"use client";
import React, { useState } from 'react';
import Drawer from './Drawer';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <div>
      {/* Header */}
      <header
        style={{
          backgroundColor: '#000', // black header
          color: '#fff',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          onClick={toggleDrawer}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          ☰
        </button>
        <h1 style={{ margin: 0 }}>MarketEvents</h1>
      </header>

      {/* Drawer */}
      <Drawer isOpen={drawerOpen} toggleDrawer={toggleDrawer} />

      {/* Main Content */}
      <main
        style={{
          marginLeft: drawerOpen ? '250px' : '0',
          transition: 'margin-left 0.3s',
          padding: '20px',
          backgroundColor: '#fff', // white background for content
          minHeight: 'calc(100vh - 60px)', // account for header height
        }}
      >
        {children}
      </main>
    </div>
  );
}