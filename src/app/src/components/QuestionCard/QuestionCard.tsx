import { useCallback, useRef, useState } from 'react';
import {
  makeStyles,
  tokens,
  Card,
  Text,
  Badge,
  Link,
  Textarea,
  Tooltip,
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

const STATUS_CYCLE: QuestionStatus[] = ['not-started', 'asked', 'answered', 'skipped'];

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
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalXS,
    flexWrap: 'wrap',
  },
  badge: {
    cursor: 'pointer',
    userSelect: 'none',
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
  const cfg = STATUS_CONFIG[status];

  const cycleStatus = useCallback(() => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length];
    onProgressChange({ status: next, notes: localNotes });
  }, [status, localNotes, onProgressChange]);

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
          <div className={styles.meta}>
            <Tooltip content={`Click to cycle status: ${STATUS_CYCLE.join(' → ')}`} relationship="description">
              <Badge
                className={styles.badge}
                appearance="filled"
                color={cfg.color}
                size="small"
                onClick={cycleStatus}
                icon={<cfg.Icon />}
              >
                {cfg.label}
              </Badge>
            </Tooltip>
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
