import { makeStyles, tokens, Text, ProgressBar, Spinner } from '@fluentui/react-components';
import type { Question, Project, QuestionProgress } from '../../types';
import { QuestionCard } from '../QuestionCard/QuestionCard';

const useStyles = makeStyles({
  root: {
    flex: 1,
    overflowY: 'auto',
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  progressLabel: {
    whiteSpace: 'nowrap',
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
  },
  progressBar: {
    flex: 1,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    gap: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground3,
    minHeight: '200px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalS,
    marginTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalXS,
    borderBottom: `2px solid ${tokens.colorBrandBackground}`,
    ':first-child': { marginTop: 0 },
  },
});

interface QuestionListProps {
  questions: Question[];
  project: Project | null;
  isLoading: boolean;
  onProgressChange: (questionId: string, progress: QuestionProgress) => void;
}

export function QuestionList({ questions, project, isLoading, onProgressChange }: QuestionListProps) {
  const styles = useStyles();

  if (isLoading) {
    return (
      <div className={styles.root}>
        <div className={styles.empty}><Spinner label="Loading questions…" /></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={styles.root}>
        <div className={styles.empty}>
          <Text size={500}>No questions match the current filters</Text>
          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
            Try adjusting the filters in the sidebar
          </Text>
        </div>
      </div>
    );
  }

  const answeredCount = questions.filter(q => project?.progress[q.id]?.status === 'answered').length;
  const coveredCount = questions.filter(q => {
    const s = project?.progress[q.id]?.status;
    return s === 'answered' || s === 'skipped';
  }).length;

  // Group by area
  const grouped = questions.reduce<Record<string, Question[]>>((acc, q) => {
    (acc[q.area] ??= []).push(q);
    return acc;
  }, {});

  return (
    <div className={styles.root}>
      {project && (
        <div className={styles.progressRow}>
          <Text className={styles.progressLabel}>
            {coveredCount} / {questions.length} covered
          </Text>
          <ProgressBar
            className={styles.progressBar}
            value={coveredCount / questions.length}
            color={coveredCount === questions.length ? 'success' : 'brand'}
            thickness="large"
          />
          <Text className={styles.progressLabel}>
            {answeredCount} answered
          </Text>
        </div>
      )}

      {Object.entries(grouped).map(([area, qs]) => (
        <div key={area}>
          <div className={styles.sectionHeader}>
            <Text weight="semibold" size={400}>{area}</Text>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              ({qs.length} question{qs.length !== 1 ? 's' : ''})
            </Text>
          </div>
          {qs.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              progress={project?.progress[q.id]}
              onProgressChange={p => onProgressChange(q.id, p)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
