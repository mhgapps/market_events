"use client";
import React from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';

function AuthPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to MarketEvents</h1>
      <p>You are successfully logged in.</p>
    </div>
  );
}

export default withAuthenticator(AuthPage);