import { useState } from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectView } from './pages/ProjectView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <FluentProvider theme={webLightTheme}>
        <ProjectView
          activeProjectId={activeProjectId}
          setActiveProjectId={setActiveProjectId}
          userName="Consultant"
        />
      </FluentProvider>
    </QueryClientProvider>
  );
}
