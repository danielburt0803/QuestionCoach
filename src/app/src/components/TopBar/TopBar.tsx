import { useState } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Input,
  Tooltip,
} from '@fluentui/react-components';
import {
  ArrowDownloadRegular,
  SignOutRegular,
  EditRegular,
  CheckmarkRegular,
  DismissRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import type { Project, Department, Question } from '../../types';
import { exportToExcel } from '../../utils/exportToExcel';

const useStyles = makeStyles({
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `0 ${tokens.spacingHorizontalL}`,
    height: '52px',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    flexShrink: 0,
    boxShadow: tokens.shadow4,
  },
  appTitle: {
    fontWeight: tokens.fontWeightBold,
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForegroundOnBrand,
    whiteSpace: 'nowrap',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    flexShrink: 0,
  },
  breadcrumb: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    minWidth: 0,
    overflow: 'hidden',
  },
  breadcrumbText: {
    color: 'rgba(255,255,255,0.85)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: tokens.fontSizeBase300,
  },
  breadcrumbActive: {
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: tokens.fontWeightSemibold,
  },
  breadcrumbSep: {
    color: 'rgba(255,255,255,0.4)',
    flexShrink: 0,
  },
  nameInput: {
    color: tokens.colorNeutralForeground1,
    maxWidth: '240px',
  },
  iconBtn: {
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
  },
  userText: {
    fontSize: tokens.fontSizeBase200,
    color: 'rgba(255,255,255,0.75)',
    whiteSpace: 'nowrap',
  },
});

interface TopBarProps {
  project: Project | null;
  department: Department | null;
  filteredQuestions: Question[];
  onRenameProject: (name: string) => void;
}

export function TopBar({ project, department, filteredQuestions, onRenameProject }: TopBarProps) {
  const styles = useStyles();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  function startEdit() {
    setEditValue(project?.name ?? '');
    setEditing(true);
  }

  function commitEdit() {
    if (editValue.trim() && project) onRenameProject(editValue.trim());
    setEditing(false);
  }

  function handleExport() {
    if (!project || !department) return;
    exportToExcel(filteredQuestions, project.name, department);
  }

  return (
    <div className={styles.bar}>
      <Text className={styles.appTitle}>Question Coach</Text>
      <div className={styles.divider} />

      <div className={styles.breadcrumb}>
        {!project && (
          <Text className={styles.breadcrumbText} style={{ opacity: 0.6 }}>
            Select a project from the left panel
          </Text>
        )}
        {project && !editing && (
          <>
            <Text className={`${styles.breadcrumbText} ${!department ? styles.breadcrumbActive : ''}`}>
              {project.name}
            </Text>
            <Tooltip content="Rename project" relationship="label">
              <Button
                className={styles.iconBtn}
                appearance="transparent"
                icon={<EditRegular fontSize={12} />}
                size="small"
                onClick={startEdit}
              />
            </Tooltip>
            {department && (
              <>
                <ChevronRightRegular fontSize={12} className={styles.breadcrumbSep} />
                <Text className={`${styles.breadcrumbText} ${styles.breadcrumbActive}`}>
                  {department.name}
                </Text>
              </>
            )}
          </>
        )}
        {project && editing && (
          <>
            <Input
              className={styles.nameInput}
              value={editValue}
              onChange={(_e, d) => setEditValue(d.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
              size="small"
            />
            <Button appearance="transparent" icon={<CheckmarkRegular />} className={styles.iconBtn} onClick={commitEdit} size="small" />
            <Button appearance="transparent" icon={<DismissRegular />} className={styles.iconBtn} onClick={() => setEditing(false)} size="small" />
          </>
        )}
      </div>

      {project && department && filteredQuestions.length > 0 && (
        <Tooltip content="Export to Excel" relationship="label">
          <Button
            className={styles.iconBtn}
            appearance="transparent"
            icon={<ArrowDownloadRegular />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Tooltip>
      )}

      <div className={styles.divider} />
      <Tooltip content="Sign out" relationship="label">
        <Button
          className={styles.iconBtn}
          appearance="transparent"
          icon={<SignOutRegular />}
          as="a"
          href="/logout"
          size="small"
        />
      </Tooltip>
    </div>
  );
}
