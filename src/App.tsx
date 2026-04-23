import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ProjectList } from './components/ProjectList/ProjectList';
import { ProjectDetail } from './components/ProjectDetail/ProjectDetail';
import { useProjects } from './hooks/useProjects';

type View = { type: 'list' } | { type: 'detail'; projectId: string };

function AppContent() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [view, setView] = useState<View>({ type: 'list' });
  const { updateProject, deleteProject } = useProjects(user?.uid ?? null);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d1117', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: '#6b7280', fontFamily: 'monospace', letterSpacing: '0.08em' }}>...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSignIn={signInWithGoogle} />;
  }

  if (view.type === 'detail') {
    return (
      <ProjectDetail
        uid={user.uid}
        projectId={view.projectId}
        onBack={() => setView({ type: 'list' })}
        onDelete={deleteProject}
        onUpdate={updateProject}
      />
    );
  }

  return (
    <ProjectList
      uid={user.uid}
      userEmail={user.email ?? ''}
      onOpenProject={(id) => setView({ type: 'detail', projectId: id })}
      onLogout={logout}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
