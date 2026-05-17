import { useCallback, useRef } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { FilterPanel } from '../components/FilterPanel/FilterPanel';
import { QuestionList } from '../components/QuestionList/QuestionList';
import { TopBar } from '../components/TopBar/TopBar';
import { ProjectDrawer } from '../components/ProjectDrawer/ProjectDrawer';
import { useQuestions } from '../hooks/useQuestions';
import { useProject, useUpdateProject } from '../hooks/useProjects';
import { filterQuestions } from '../utils/filterQuestions';
import type { ProjectFilters, QuestionProgress } from '../types';
import { useState } from 'react';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
});

interface ProjectViewProps {
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  userName: string;
}

export function ProjectView({ activeProjectId, setActiveProjectId, userName }: ProjectViewProps) {
  const styles = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: questions = [], isLoading: questionsLoading } = useQuestions();
  const { data: project } = useProject(activeProjectId);
  const updateProject = useUpdateProject();

  const filters: ProjectFilters = project?.filters ?? { product: null, area: null, subArea: null };
  const filtered = filterQuestions(questions, filters);

  const pendingProgressRef = useRef<Record<string, QuestionProgress>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushProgress = useCallback(() => {
    if (!activeProjectId || Object.keys(pendingProgressRef.current).length === 0) return;
    const merged = { ...(project?.progress ?? {}), ...pendingProgressRef.current };
    pendingProgressRef.current = {};
    updateProject.mutate({ id: activeProjectId, patch: { progress: merged } });
  }, [activeProjectId, project?.progress, updateProject]);

  function handleProgressChange(questionId: string, progress: QuestionProgress) {
    pendingProgressRef.current[questionId] = progress;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flushProgress, 1000);
  }

  function handleFiltersChange(newFilters: ProjectFilters) {
    if (!activeProjectId) return;
    updateProject.mutate({ id: activeProjectId, patch: { filters: newFilters } });
  }

  function handleRename(name: string) {
    if (!activeProjectId) return;
    updateProject.mutate({ id: activeProjectId, patch: { name } });
  }

  return (
    <div className={styles.root}>
      <TopBar
        project={project ?? null}
        filteredQuestions={filtered}
        userName={userName}
        onOpenProjects={() => setDrawerOpen(true)}
        onRenameProject={handleRename}
      />
      <div className={styles.body}>
        <FilterPanel
          questions={questions}
          filters={filters}
          onChange={handleFiltersChange}
        />
        <QuestionList
          questions={filtered}
          project={project ?? null}
          isLoading={questionsLoading}
          onProgressChange={handleProgressChange}
        />
      </div>
      <ProjectDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeProjectId={activeProjectId}
        onSelectProject={id => { setActiveProjectId(id); setDrawerOpen(false); }}
      />
    </div>
  );
}
