import { useCallback, useRef, useState } from 'react';
import {
  makeStyles,
  tokens,
  Card,
  Text,
  Badge,
  Link,
  Textarea,
} from '@fluentui/react-components';
import {
  QuestionCircleRegular,
  LinkRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  RecordRegular,
  CircleRegular,
} from '@fluentui/react-icons';
import type { Question, QuestionProgress, QuestionStatus } from '../../types';

const STATUS_OPTIONS: QuestionStatus[] = ['not-started', 'asked', 'answered', 'skipped'];

const STATUS_CONFIG: Record<QuestionStatus, { label: string; color: 'informative' | 'success' | 'subtle' | 'warning'; Icon: React.FC }> = {
  'not-started': { label: 'Not Started', color: 'subtle', Icon: CircleRegular },
  asked: { label: 'Asked', color: 'informative', Icon: RecordRegular },
  answered: { label: 'Answered', color: 'success', Icon: CheckmarkCircleRegular },
  skipped: { label: 'Skipped', color: 'warning', Icon: DismissCircleRegular },
};

const useStyles = makeStyles({
  card: {
    marginBottom: tokens.spacingVerticalS,
    transition: 'box-shadow 0.15s ease',
    ':hover': { boxShadow: tokens.shadow8 },
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalS,
    width: '100%',
  },
  questionText: {
    flex: 1,
    fontSize: tokens.fontSizeBase300,
    lineHeight: tokens.lineHeightBase300,
  },
  statusRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalXS,
    flexWrap: 'wrap',
  },
  statusBadge: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  statusBadgeInactive: {
    opacity: 0.45,
    cursor: 'pointer',
    userSelect: 'none',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalXS,
    flexWrap: 'wrap',
  },
  refLink: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    fontSize: tokens.fontSizeBase200,
  },
  notes: {
    marginTop: tokens.spacingVerticalS,
    width: '100%',
    resize: 'vertical',
  },
  subAreaTag: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
});

interface QuestionCardProps {
  question: Question;
  progress: QuestionProgress | undefined;
  onProgressChange: (progress: QuestionProgress) => void;
}

export function QuestionCard({ question, progress, onProgressChange }: QuestionCardProps) {
  const styles = useStyles();
  const status: QuestionStatus = progress?.status ?? 'not-started';
  const notes = progress?.notes ?? '';
  const [localNotes, setLocalNotes] = useState(notes);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNotesChange = useCallback((value: string) => {
    setLocalNotes(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onProgressChange({ status, notes: value });
    }, 800);
  }, [status, onProgressChange]);

  const isReference = question.reference.startsWith('http');

  return (
    <Card className={styles.card} size="small">
      <div className={styles.header}>
        <QuestionCircleRegular fontSize={20} style={{ marginTop: 2, flexShrink: 0, color: tokens.colorBrandForeground1 }} />
        <div style={{ flex: 1 }}>
          <Text className={styles.questionText}>{question.question}</Text>

          <div className={styles.statusRow}>
            {STATUS_OPTIONS.map(s => {
              const cfg = STATUS_CONFIG[s];
              const isActive = status === s;
              return (
                <Badge
                  key={s}
                  className={isActive ? styles.statusBadge : styles.statusBadgeInactive}
                  appearance={isActive ? 'filled' : 'outline'}
                  color={cfg.color}
                  size="small"
                  icon={<cfg.Icon />}
                  onClick={() => { if (!isActive) onProgressChange({ status: s, notes: localNotes }); }}
                >
                  {cfg.label}
                </Badge>
              );
            })}
          </div>

          <div className={styles.meta}>
            {question.subArea && (
              <Text className={styles.subAreaTag}>{question.area} › {question.subArea}</Text>
            )}
            {question.reference && (
              isReference ? (
                <Link className={styles.refLink} href={question.reference} target="_blank" rel="noreferrer">
                  <LinkRegular fontSize={12} />
                  Reference
                </Link>
              ) : (
                <Text className={styles.refLink} size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                  <LinkRegular fontSize={12} /> {question.reference}
                </Text>
              )
            )}
          </div>

          <Textarea
            className={styles.notes}
            placeholder="Notes from the workshop…"
            value={localNotes}
            onChange={(_e, d) => handleNotesChange(d.value)}
            size="small"
            rows={localNotes ? undefined : 1}
            resize="vertical"
          />
        </div>
      </div>
    </Card>
  );
}
