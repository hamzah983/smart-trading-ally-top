
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import HomePage from './pages/Index';
import DashboardPage from './pages/dashboard/Index';
import AccountsPage from './pages/accounts/Index';
import BotsPage from './pages/bots/Index';
import TradesPage from './pages/trades/Index';
import AuthPage from './pages/auth/Index';
import NotFoundPage from './pages/NotFound';
import ProfilePage from './pages/profile/Index';

const App = () => {
  return (
    <div className="min-h-screen bg-hamzah-50 dark:bg-hamzah-900 text-hamzah-950 dark:text-hamzah-50 rtl">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/bots" element={<BotsPage />} />
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
};

export default App;
