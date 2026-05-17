import { useState } from 'react';
import { makeStyles, tokens, Text, Button, Badge, Radio, RadioGroup } from '@fluentui/react-components';
import {
  FilterRegular,
  ChevronUpRegular,
  ChevronDownRegular,
  CheckmarkFilled,
  DismissRegular,
} from '@fluentui/react-icons';
import type { Question, ProjectFilters, QuestionProgress, QuestionStatus } from '../../types';
import { getFilterOptions } from '../../utils/filterQuestions';

const STATUS_OPTIONS: { value: QuestionStatus; label: string }[] = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'asked', label: 'Asked' },
  { value: 'answered', label: 'Answered' },
  { value: 'skipped', label: 'Skipped' },
];

const useStyles = makeStyles({
  root: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    cursor: 'pointer',
    userSelect: 'none',
    ':hover': { backgroundColor: tokens.colorNeutralBackground1Hover },
  },
  headerTitle: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  headerSpacer: { flex: 1 },
  body: {
    padding: `0 ${tokens.spacingHorizontalL} ${tokens.spacingVerticalM}`,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  groupLabel: {
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tilesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
  },
  tile: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: `3px ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase200,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background 0.1s, border-color 0.1s, color 0.1s',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
      border: `1px solid ${tokens.colorNeutralStroke1Hover}`,
    },
  },
  tileSelected: {
    backgroundColor: tokens.colorBrandBackground,
    border: `1px solid ${tokens.colorBrandBackground}`,
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': {
      backgroundColor: tokens.colorBrandBackgroundHover,
      border: `1px solid ${tokens.colorBrandBackgroundHover}`,
    },
  },
  clearBtn: {
    alignSelf: 'flex-start',
    marginTop: tokens.spacingVerticalXS,
  },
  collapsedSummary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    flex: 1,
  },
});

interface TileGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

function TileGroup({ label, options, selected, onToggle }: TileGroupProps) {
  const styles = useStyles();
  if (options.length === 0) return null;
  return (
    <div className={styles.group}>
      <Text className={styles.groupLabel}>{label}</Text>
      <div className={styles.tilesRow}>
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <div
              key={opt}
              className={`${styles.tile} ${isSelected ? styles.tileSelected : ''}`}
              onClick={() => onToggle(opt)}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(opt); } }}
            >
              {isSelected && <CheckmarkFilled fontSize={11} />}
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface FilterPanelProps {
  questions: Question[];
  filters: ProjectFilters;
  progress: Record<string, QuestionProgress>;
  onChange: (filters: ProjectFilters) => void;
}

export function FilterPanel({ questions, filters, progress: _progress, onChange }: FilterPanelProps) {
  const styles = useStyles();
  const [expanded, setExpanded] = useState(true);
  const { products, areas, subAreas } = getFilterOptions(questions, filters);

  const activeCount =
    filters.products.length + filters.areas.length + filters.subAreas.length + filters.statuses.length;

  function toggleValue(key: keyof ProjectFilters, value: string) {
    if (key === 'statuses') {
      const statusValue = STATUS_OPTIONS.find(o => o.label === value)?.value;
      if (!statusValue) return;
      const current = filters.statuses;
      const next = current.includes(statusValue)
        ? current.filter(s => s !== statusValue)
        : [...current, statusValue];
      onChange({ ...filters, statuses: next });
      return;
    }
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  }

  function handleClear() {
    onChange({ products: [], areas: [], subAreas: [], statuses: [] });
  }

  const allActiveTileLabels = [
    ...filters.products,
    ...filters.areas,
    ...filters.subAreas,
    ...filters.statuses.map(s => STATUS_OPTIONS.find(o => o.value === s)?.label ?? s),
  ];

  return (
    <div className={styles.root}>
      <div className={styles.header} onClick={() => setExpanded(e => !e)}>
        <FilterRegular fontSize={16} />
        <Text className={styles.headerTitle}>Filters</Text>

        {!expanded && activeCount > 0 && (
          <div className={styles.collapsedSummary}>
            {allActiveTileLabels.map(label => (
              <Badge key={label} appearance="filled" color="brand" size="small">{label}</Badge>
            ))}
          </div>
        )}

        {!expanded && activeCount === 0 && <div className={styles.headerSpacer} />}
        {expanded && <div className={styles.headerSpacer} />}

        {activeCount > 0 && (
          <Badge appearance="filled" color="brand" size="small">{activeCount} active</Badge>
        )}
        {expanded
          ? <ChevronUpRegular fontSize={16} style={{ color: tokens.colorNeutralForeground3 }} />
          : <ChevronDownRegular fontSize={16} style={{ color: tokens.colorNeutralForeground3 }} />
        }
      </div>

      {expanded && (
        <div className={styles.body}>
          {products.length > 0 && (
            <TileGroup
              label="Product"
              options={products}
              selected={filters.products}
              onToggle={v => toggleValue('products', v)}
            />
          )}
          <TileGroup
            label="Area"
            options={areas}
            selected={filters.areas}
            onToggle={v => toggleValue('areas', v)}
          />
          <TileGroup
            label="Sub-Area"
            options={subAreas}
            selected={filters.subAreas}
            onToggle={v => toggleValue('subAreas', v)}
          />
          <div className={styles.group}>
            <Text className={styles.groupLabel}>Status</Text>
            <RadioGroup
              value={filters.statuses.length === 1 ? filters.statuses[0] : 'all'}
              onChange={(_e, d) => {
                if (d.value === 'all') {
                  onChange({ ...filters, statuses: [] });
                } else {
                  onChange({ ...filters, statuses: [d.value as QuestionStatus] });
                }
              }}
            >
              <Radio value="all" label="All statuses" />
              {STATUS_OPTIONS.map(s => (
                <Radio key={s.value} value={s.value} label={s.label} />
              ))}
            </RadioGroup>
          </div>
          {activeCount > 0 && (
            <Button
              className={styles.clearBtn}
              appearance="subtle"
              size="small"
              icon={<DismissRegular />}
              onClick={handleClear}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
