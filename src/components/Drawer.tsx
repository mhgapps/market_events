import React from 'react';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import BarChartIcon from '@mui/icons-material/BarChart';

type DrawerProps = {
  isOpen: boolean;
  toggleDrawer: () => void;
};

const Drawer: React.FC<DrawerProps> = ({ isOpen, toggleDrawer }) => {
  return (
    <div
      style={{
        width: isOpen ? '250px' : '0',
        backgroundColor: '#f8f9fa',
        overflowX: 'hidden',
        transition: '0.3s',
        position: 'fixed',
        height: '100%',
        top: 0,
        left: 0,
        paddingTop: '60px',
        zIndex: 1000,
      }}
    >
      <button
        onClick={toggleDrawer}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          fontSize: '30px',
          background: 'none',
          border: 'none',
          color: '#007bff',
          cursor: 'pointer',
        }}
      >
        &times;
      </button>
      <nav>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          <li>
            <Link href="/" legacyBehavior>
              <a
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '18px',
                }}
              >
                <HomeIcon style={{ marginRight: '8px' }} />
                Home
              </a>
            </Link>
          </li>
          <li>
            <Link href="/inquiry" legacyBehavior>
              <a
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '18px',
                }}
              >
                <EmailIcon style={{ marginRight: '8px' }} />
                Inquiry
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/inquiries" legacyBehavior>
              <a
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '18px',
                }}
              >
                <BarChartIcon style={{ marginRight: '8px' }} />
                Admin
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Drawer;