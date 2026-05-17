import { useCallback, useRef, useState } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { LeftNav } from '../components/LeftNav/LeftNav';
import { FilterPanel } from '../components/FilterPanel/FilterPanel';
import { QuestionList } from '../components/QuestionList/QuestionList';
import { TopBar } from '../components/TopBar/TopBar';
import { useQuestions } from '../hooks/useQuestions';
import { useProject, useUpdateProject } from '../hooks/useProjects';
import { filterQuestions } from '../utils/filterQuestions';
import type { ProjectFilters, QuestionProgress, Department } from '../types';
import { EMPTY_FILTERS } from '../types';

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
  main: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
});

export function ProjectView() {
  const styles = useStyles();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);

  const { data: questions = [], isLoading: questionsLoading } = useQuestions();
  const { data: project } = useProject(activeProjectId);
  const updateProject = useUpdateProject();

  const department: Department | undefined = project?.departments.find(d => d.id === activeDepartmentId);
  const filters: ProjectFilters = department?.filters ?? EMPTY_FILTERS;
  const progress = department?.progress ?? {};
  const filtered = filterQuestions(questions, filters, progress);

  const pendingProgressRef = useRef<Record<string, QuestionProgress>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushProgress = useCallback(() => {
    if (!activeProjectId || !activeDepartmentId || !project) return;
    if (Object.keys(pendingProgressRef.current).length === 0) return;
    const pending = pendingProgressRef.current;
    pendingProgressRef.current = {};
    const updatedDepts = project.departments.map(d => {
      if (d.id !== activeDepartmentId) return d;
      return { ...d, progress: { ...d.progress, ...pending } };
    });
    updateProject.mutate({ id: activeProjectId, patch: { departments: updatedDepts } });
  }, [activeProjectId, activeDepartmentId, project, updateProject]);

  function handleProgressChange(questionId: string, prog: QuestionProgress) {
    pendingProgressRef.current[questionId] = prog;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flushProgress, 1000);
  }

  function handleFiltersChange(newFilters: ProjectFilters) {
    if (!activeProjectId || !activeDepartmentId || !project) return;
    const updatedDepts = project.departments.map(d =>
      d.id === activeDepartmentId ? { ...d, filters: newFilters } : d
    );
    updateProject.mutate({ id: activeProjectId, patch: { departments: updatedDepts } });
  }

  function handleSelectDepartment(projectId: string | null, deptId: string | null) {
    setActiveProjectId(projectId);
    setActiveDepartmentId(deptId);
  }

  return (
    <div className={styles.root}>
      <TopBar
        project={project ?? null}
        department={department ?? null}
        filteredQuestions={filtered}
        onRenameProject={name => activeProjectId && updateProject.mutate({ id: activeProjectId, patch: { name } })}
      />
      <div className={styles.body}>
        <LeftNav
          activeProjectId={activeProjectId}
          activeDepartmentId={activeDepartmentId}
          onSelectDepartment={handleSelectDepartment}
        />
        <div className={styles.main}>
          <FilterPanel
            questions={questions}
            filters={filters}
            progress={progress}
            onChange={handleFiltersChange}
          />
          <QuestionList
            questions={filtered}
            progress={progress}
            isLoading={questionsLoading}
            onProgressChange={handleProgressChange}
          />
        </div>
      </div>
    </div>
  );
}
