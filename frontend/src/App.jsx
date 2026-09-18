import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { AppConfigProvider } from './contexts/AppConfigContext';
import { PollsProvider } from './contexts/PollsContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ConnectionBanner } from './components/ui/ConnectionBanner';
import { Landing } from './pages/Landing';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MyPolls } from './pages/MyPolls';
import { CreatePoll } from './pages/CreatePoll';
import { PollCreated } from './pages/PollCreated';
import { PollManagement } from './pages/PollManagement';
import { LiveResults } from './pages/LiveResults';
import { PublicPoll } from './pages/PublicPoll';
import { PollNotFound } from './pages/PollNotFound';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

export function App({ connectionState = 'connected', liveUpdates = true }) {
  return (
    <AuthProvider>
      <AppConfigProvider connectionState={connectionState} liveUpdates={liveUpdates}>
        <PollsProvider>
          <BrowserRouter>
            <Routes>
              {/* ----------------------------------------------------------- */}
              {/* Public routes */}
              {/* ----------------------------------------------------------- */}
              <Route path="/" element={<Landing />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/poll/:pollId" element={<PublicPoll />} />
              <Route path="/poll-not-found" element={<PollNotFound />} />

              {/* ----------------------------------------------------------- */}
              {/* Authenticated routes */}
              {/* ----------------------------------------------------------- */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/polls"
                element={
                  <ProtectedRoute>
                    <MyPolls />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreatePoll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/polls/:pollId/created"
                element={
                  <ProtectedRoute>
                    <PollCreated />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/polls/:pollId/results"
                element={
                  <ProtectedRoute>
                    <LiveResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/polls/:pollId"
                element={
                  <ProtectedRoute>
                    <PollManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ConnectionBanner />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className:
                  'rounded-xl border border-line bg-white text-ink shadow-lift text-sm font-semibold',
              }}
            />
          </BrowserRouter>
        </PollsProvider>
      </AppConfigProvider>
    </AuthProvider>
  );
}
