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
  FolderOpenRegular,
  ArrowDownloadRegular,
  SignOutRegular,
  EditRegular,
  CheckmarkRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import type { Project, Question } from '../../types';
import { exportToExcel } from '../../utils/exportToExcel';

const useStyles = makeStyles({
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `0 ${tokens.spacingHorizontalL}`,
    height: '56px',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    flexShrink: 0,
    boxShadow: tokens.shadow4,
  },
  appTitle: {
    fontWeight: tokens.fontWeightBold,
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForegroundOnBrand,
    marginRight: tokens.spacingHorizontalS,
    whiteSpace: 'nowrap',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    flexShrink: 0,
  },
  projectName: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  projectNameText: {
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: tokens.fontWeightSemibold,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  nameInput: {
    color: tokens.colorNeutralForeground1,
    flex: 1,
    maxWidth: '320px',
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
  filteredQuestions: Question[];
  userName: string;
  onOpenProjects: () => void;
  onRenameProject: (name: string) => void;
}

export function TopBar({ project, filteredQuestions, userName, onOpenProjects, onRenameProject }: TopBarProps) {
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

  function cancelEdit() {
    setEditing(false);
  }

  function handleExport() {
    if (!project) return;
    exportToExcel(filteredQuestions, project);
  }

  return (
    <div className={styles.bar}>
      <Text className={styles.appTitle}>Question Coach</Text>
      <div className={styles.divider} />

      <Tooltip content="Open projects" relationship="label">
        <Button
          className={styles.iconBtn}
          appearance="transparent"
          icon={<FolderOpenRegular />}
          onClick={onOpenProjects}
        >
          Projects
        </Button>
      </Tooltip>

      <div className={styles.divider} />

      <div className={styles.projectName}>
        {!project && (
          <Text className={styles.projectNameText} style={{ opacity: 0.6 }}>
            No project selected
          </Text>
        )}
        {project && !editing && (
          <>
            <Text className={styles.projectNameText}>{project.name}</Text>
            <Tooltip content="Rename project" relationship="label">
              <Button
                className={styles.iconBtn}
                appearance="transparent"
                icon={<EditRegular fontSize={14} />}
                size="small"
                onClick={startEdit}
              />
            </Tooltip>
          </>
        )}
        {project && editing && (
          <>
            <Input
              className={styles.nameInput}
              value={editValue}
              onChange={(_e, d) => setEditValue(d.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
              autoFocus
              size="small"
            />
            <Button appearance="transparent" icon={<CheckmarkRegular />} className={styles.iconBtn} onClick={commitEdit} size="small" />
            <Button appearance="transparent" icon={<DismissRegular />} className={styles.iconBtn} onClick={cancelEdit} size="small" />
          </>
        )}
      </div>

      {project && filteredQuestions.length > 0 && (
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
      <Text className={styles.userText}>{userName}</Text>
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
