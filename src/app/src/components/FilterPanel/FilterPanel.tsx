import {
  makeStyles,
  tokens,
  Text,
  Dropdown,
  Option,
  Button,
  Badge,
} from '@fluentui/react-components';
import { FilterRegular, DismissRegular } from '@fluentui/react-icons';
import type { Question, ProjectFilters } from '../../types';
import { getFilterOptions } from '../../utils/filterQuestions';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    minWidth: '220px',
    maxWidth: '260px',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingBottom: tokens.spacingVerticalS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  label: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  dropdown: {
    width: '100%',
  },
  clearButton: {
    marginTop: tokens.spacingVerticalS,
  },
  activeCount: {
    marginLeft: 'auto',
  },
});

interface FilterPanelProps {
  questions: Question[];
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
}

export function FilterPanel({ questions, filters, onChange }: FilterPanelProps) {
  const styles = useStyles();
  const { products, areas, subAreas } = getFilterOptions(questions, filters);

  const activeCount = [filters.product, filters.area, filters.subArea].filter(Boolean).length;

  function handleClear() {
    onChange({ product: null, area: null, subArea: null });
  }

  function handleProduct(value: string | null) {
    onChange({ product: value, area: null, subArea: null });
  }

  function handleArea(value: string | null) {
    onChange({ ...filters, area: value, subArea: null });
  }

  function handleSubArea(value: string | null) {
    onChange({ ...filters, subArea: value });
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <FilterRegular fontSize={18} />
        <Text weight="semibold" size={400}>Filters</Text>
        {activeCount > 0 && (
          <Badge appearance="filled" color="brand" size="small" className={styles.activeCount}>
            {activeCount}
          </Badge>
        )}
      </div>

      <div className={styles.section}>
        <Text className={styles.label}>Product</Text>
        <Dropdown
          className={styles.dropdown}
          placeholder="All products"
          value={filters.product ?? ''}
          selectedOptions={filters.product ? [filters.product] : []}
          onOptionSelect={(_e, d) => handleProduct(d.optionValue === filters.product ? null : (d.optionValue ?? null))}
        >
          {products.map(p => <Option key={p} value={p}>{p}</Option>)}
        </Dropdown>
      </div>

      <div className={styles.section}>
        <Text className={styles.label}>Area</Text>
        <Dropdown
          className={styles.dropdown}
          placeholder="All areas"
          value={filters.area ?? ''}
          selectedOptions={filters.area ? [filters.area] : []}
          disabled={areas.length === 0}
          onOptionSelect={(_e, d) => handleArea(d.optionValue === filters.area ? null : (d.optionValue ?? null))}
        >
          {areas.map(a => <Option key={a} value={a}>{a}</Option>)}
        </Dropdown>
      </div>

      <div className={styles.section}>
        <Text className={styles.label}>Sub-Area</Text>
        <Dropdown
          className={styles.dropdown}
          placeholder="All sub-areas"
          value={filters.subArea ?? ''}
          selectedOptions={filters.subArea ? [filters.subArea] : []}
          disabled={subAreas.length === 0}
          onOptionSelect={(_e, d) => handleSubArea(d.optionValue === filters.subArea ? null : (d.optionValue ?? null))}
        >
          {subAreas.map(s => <Option key={s} value={s}>{s}</Option>)}
        </Dropdown>
      </div>

      {activeCount > 0 && (
        <Button
          className={styles.clearButton}
          appearance="subtle"
          icon={<DismissRegular />}
          onClick={handleClear}
          size="small"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
