// src/App.jsx
// Root component. Wraps the entire app in Context providers.
// Provider order matters — AuthProvider is outermost because Cart may
// need auth state in the future (e.g., server-side cart).

import React from 'react';
import { AuthProvider } from '@context/AuthContext';
import { CartProvider } from '@context/CartContext';
import { UIProvider } from '@context/UIContext';
import { LanguageProvider } from '@context/LanguageContext';
import AppRouter from '@/routes/AppRouter';
import { ToastContainer } from '@components/ui/Toast/Toast';
import ErrorBoundary from '@components/common/ErrorBoundary/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <UIProvider>
              <AppRouter />
              {/* Global toast portal — mounted once, reads from UIContext */}
              <ToastContainer />
            </UIProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
