import { useState } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Input,
  Spinner,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Field,
  RadioGroup,
  Radio,
  Select,
  Divider,
} from '@fluentui/react-components';
import {
  AddRegular,
  ChevronRightRegular,
  ChevronDownRegular,
  MoreHorizontalRegular,
  DeleteRegular,
  EditRegular,
  PeopleRegular,
  FolderRegular,
  CheckmarkRegular,
} from '@fluentui/react-icons';
import { v4 as uuidv4 } from 'uuid';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../../hooks/useProjects';
import type { Department, ProjectFilters } from '../../types';
import { EMPTY_FILTERS } from '../../types';

const useStyles = makeStyles({
  root: {
    width: '268px',
    minWidth: '268px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    overflowY: 'auto',
    overflowX: 'hidden',
    flexShrink: 0,
  },
  newProjectForm: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  newInput: { flex: 1 },
  sectionLabel: {
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: tokens.spacingVerticalS,
  },
  projectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM} ${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    cursor: 'pointer',
    userSelect: 'none',
    ':hover': { backgroundColor: tokens.colorNeutralBackground2Hover },
  },
  projectName: {
    flex: 1,
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  projectNameInput: { flex: 1, fontSize: tokens.fontSizeBase300 },
  deptRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
    paddingLeft: `calc(${tokens.spacingHorizontalXXL} + ${tokens.spacingHorizontalM})`,
    paddingRight: tokens.spacingHorizontalM,
    cursor: 'pointer',
    userSelect: 'none',
    ':hover': { backgroundColor: tokens.colorNeutralBackground2Hover },
  },
  activeDept: {
    backgroundColor: tokens.colorBrandBackground2,
    ':hover': { backgroundColor: tokens.colorBrandBackground2Hover },
  },
  deptName: {
    flex: 1,
    fontSize: tokens.fontSizeBase200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  activeDeptName: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  addDeptBtn: {
    paddingLeft: `calc(${tokens.spacingHorizontalXXL} + ${tokens.spacingHorizontalM})`,
    paddingRight: tokens.spacingHorizontalM,
    paddingBottom: tokens.spacingVerticalXS,
  },
  emptyState: {
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalM}`,
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
  menuBtn: {
    flexShrink: 0,
    opacity: 0,
    ':focus': { opacity: 1 },
  },
  menuBtnVisible: {
    opacity: 1,
  },
  deptIcon: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
  activeDeptIcon: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
});

interface AddDeptDialogProps {
  projectId: string;
  existingDepts: Department[];
  onConfirm: (name: string, copyFrom: ProjectFilters | undefined) => void;
  onClose: () => void;
}

function AddDeptDialog({ projectId: _projectId, existingDepts, onConfirm, onClose }: AddDeptDialogProps) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'blank' | 'copy'>('blank');
  const [copyFromId, setCopyFromId] = useState(existingDepts[0]?.id ?? '');

  function handleCreate() {
    if (!name.trim()) return;
    const copyFrom = mode === 'copy'
      ? existingDepts.find(d => d.id === copyFromId)?.filters
      : undefined;
    onConfirm(name.trim(), copyFrom);
  }

  return (
    <Dialog open onOpenChange={(_e, s) => { if (!s.open) onClose(); }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Add Department</DialogTitle>
          <DialogContent>
            <Field label="Department name" required style={{ marginBottom: tokens.spacingVerticalM }}>
              <Input
                value={name}
                onChange={(_e, d) => setName(d.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') onClose(); }}
                autoFocus
                placeholder="e.g. Sales, Operations…"
              />
            </Field>
            {existingDepts.length > 0 && (
              <Field label="Starting filters">
                <RadioGroup value={mode} onChange={(_e, d) => setMode(d.value as 'blank' | 'copy')}>
                  <Radio value="blank" label="Start with blank filters" />
                  <Radio value="copy" label="Copy filters from an existing department" />
                </RadioGroup>
                {mode === 'copy' && (
                  <Select
                    value={copyFromId}
                    onChange={(_e, d) => setCopyFromId(d.value)}
                    style={{ marginTop: tokens.spacingVerticalXS }}
                  >
                    {existingDepts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </Select>
                )}
              </Field>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" onClick={handleCreate} disabled={!name.trim()}>
              Create Department
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

interface LeftNavProps {
  activeProjectId: string | null;
  activeDepartmentId: string | null;
  onSelectDepartment: (projectId: string | null, deptId: string | null) => void;
}

export function LeftNav({ activeProjectId, activeDepartmentId, onSelectDepartment }: LeftNavProps) {
  const styles = useStyles();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [newProjectName, setNewProjectName] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [renamingProject, setRenamingProject] = useState<string | null>(null);
  const [renameProjectValue, setRenameProjectValue] = useState('');
  const [renamingDept, setRenamingDept] = useState<{ projectId: string; deptId: string } | null>(null);
  const [renameDeptValue, setRenameDeptValue] = useState('');
  const [addDeptForProject, setAddDeptForProject] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [deletingDept, setDeletingDept] = useState<{ projectId: string; deptId: string } | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  async function handleCreateProject() {
    if (!newProjectName.trim()) return;
    const created = await createProject.mutateAsync(newProjectName.trim());
    setNewProjectName('');
    setExpandedProjects(prev => new Set(prev).add(created.id));
    if (created.departments.length > 0) {
      onSelectDepartment(created.id, created.departments[0].id);
    }
  }

  function toggleExpand(projectId: string) {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  function startRenameProject(projectId: string, currentName: string) {
    setRenamingProject(projectId);
    setRenameProjectValue(currentName);
  }

  function commitRenameProject(projectId: string) {
    if (renameProjectValue.trim()) {
      updateProject.mutate({ id: projectId, patch: { name: renameProjectValue.trim() } });
    }
    setRenamingProject(null);
  }

  function startRenameDept(projectId: string, deptId: string, currentName: string) {
    setRenamingDept({ projectId, deptId });
    setRenameDeptValue(currentName);
  }

  function commitRenameDept() {
    if (!renamingDept || !renameProjectValue) {
      // Use renameDeptValue
    }
    if (!renamingDept || !renameDeptValue.trim()) { setRenamingDept(null); return; }
    const project = projects?.find(p => p.id === renamingDept.projectId);
    if (!project) { setRenamingDept(null); return; }
    const updatedDepts = project.departments.map(d =>
      d.id === renamingDept.deptId ? { ...d, name: renameDeptValue.trim() } : d
    );
    updateProject.mutate({ id: renamingDept.projectId, patch: { departments: updatedDepts } });
    setRenamingDept(null);
  }

  function handleDeleteProject(projectId: string) {
    deleteProject.mutate(projectId);
    if (activeProjectId === projectId) onSelectDepartment(null, null);
    setDeletingProject(null);
  }

  function handleDeleteDept(projectId: string, deptId: string) {
    const project = projects?.find(p => p.id === projectId);
    if (!project) return;
    const updatedDepts = project.departments.filter(d => d.id !== deptId);
    updateProject.mutate({ id: projectId, patch: { departments: updatedDepts } });
    if (activeDepartmentId === deptId) {
      const next = updatedDepts[0];
      onSelectDepartment(next ? projectId : null, next?.id ?? null);
    }
    setDeletingDept(null);
  }

  function handleAddDept(projectId: string, name: string, copyFrom: ProjectFilters | undefined) {
    const project = projects?.find(p => p.id === projectId);
    if (!project) return;
    const newDept: Department = {
      id: uuidv4(),
      name,
      filters: copyFrom ? { ...copyFrom } : EMPTY_FILTERS,
      progress: {},
      createdAt: new Date().toISOString(),
    };
    const updatedDepts = [...project.departments, newDept];
    updateProject.mutate(
      { id: projectId, patch: { departments: updatedDepts } },
      { onSuccess: () => onSelectDepartment(projectId, newDept.id) },
    );
    setAddDeptForProject(null);
  }

  const projectToAddDept = projects?.find(p => p.id === addDeptForProject);
  const projectToDelete = projects?.find(p => p.id === deletingProject);
  const deptToDelete = deletingDept
    ? projects?.find(p => p.id === deletingDept.projectId)?.departments.find(d => d.id === deletingDept.deptId)
    : undefined;

  return (
    <div className={styles.root}>
      <div className={styles.newProjectForm}>
        <Input
          className={styles.newInput}
          placeholder="New project name…"
          size="small"
          value={newProjectName}
          onChange={(_e, d) => setNewProjectName(d.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreateProject(); }}
        />
        <Button
          icon={<AddRegular />}
          appearance="primary"
          size="small"
          onClick={handleCreateProject}
          disabled={!newProjectName.trim() || createProject.isPending}
        />
      </div>

      {isLoading && (
        <div style={{ padding: tokens.spacingVerticalL, display: 'flex', justifyContent: 'center' }}>
          <Spinner size="small" label="Loading…" />
        </div>
      )}

      {!isLoading && (!projects || projects.length === 0) && (
        <div className={styles.emptyState}>
          <Text size={200}>No projects yet. Enter a name above to create one.</Text>
        </div>
      )}

      {projects && projects.length > 0 && (
        <>
          <Text className={styles.sectionLabel}>Projects</Text>
          {projects.map(project => {
            const isExpanded = expandedProjects.has(project.id) || project.id === activeProjectId;
            const isRenaming = renamingProject === project.id;

            return (
              <div key={project.id}>
                <div
                  className={styles.projectRow}
                  onClick={() => { if (!isRenaming) toggleExpand(project.id); }}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  {isExpanded
                    ? <ChevronDownRegular fontSize={14} style={{ flexShrink: 0, color: tokens.colorNeutralForeground3 }} />
                    : <ChevronRightRegular fontSize={14} style={{ flexShrink: 0, color: tokens.colorNeutralForeground3 }} />
                  }
                  <FolderRegular fontSize={16} style={{ flexShrink: 0, color: tokens.colorNeutralForeground2 }} />

                  {isRenaming ? (
                    <Input
                      className={styles.projectNameInput}
                      size="small"
                      value={renameProjectValue}
                      onChange={(_e, d) => setRenameProjectValue(d.value)}
                      onBlur={() => commitRenameProject(project.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRenameProject(project.id);
                        if (e.key === 'Escape') setRenamingProject(null);
                        e.stopPropagation();
                      }}
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <Text className={styles.projectName}>{project.name}</Text>
                  )}

                  <Menu>
                    <MenuTrigger disableButtonEnhancement>
                      <Button
                        className={`${styles.menuBtn} ${hoveredProject === project.id ? styles.menuBtnVisible : ''}`}
                        icon={<MoreHorizontalRegular />}
                        appearance="subtle"
                        size="small"
                        onClick={e => e.stopPropagation()}
                      />
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuItem
                          icon={<EditRegular />}
                          onClick={e => { e.stopPropagation(); startRenameProject(project.id, project.name); }}
                        >
                          Rename
                        </MenuItem>
                        <MenuItem
                          icon={<AddRegular />}
                          onClick={e => { e.stopPropagation(); setAddDeptForProject(project.id); setExpandedProjects(prev => new Set(prev).add(project.id)); }}
                        >
                          Add Department
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          icon={<DeleteRegular />}
                          onClick={e => { e.stopPropagation(); setDeletingProject(project.id); }}
                        >
                          Delete Project
                        </MenuItem>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                </div>

                {isExpanded && (
                  <>
                    {project.departments.map(dept => {
                      const isActive = dept.id === activeDepartmentId && project.id === activeProjectId;
                      const isRenamingDept = renamingDept?.projectId === project.id && renamingDept?.deptId === dept.id;
                      const deptHoverKey = `${project.id}:${dept.id}`;

                      return (
                        <div
                          key={dept.id}
                          className={`${styles.deptRow} ${isActive ? styles.activeDept : ''}`}
                          onClick={() => { if (!isRenamingDept) onSelectDepartment(project.id, dept.id); }}
                          onMouseEnter={() => setHoveredDept(deptHoverKey)}
                          onMouseLeave={() => setHoveredDept(null)}
                        >
                          {isActive
                            ? <CheckmarkRegular fontSize={12} className={styles.activeDeptIcon} />
                            : <PeopleRegular fontSize={12} className={styles.deptIcon} />
                          }

                          {isRenamingDept ? (
                            <Input
                              size="small"
                              style={{ flex: 1 }}
                              value={renameDeptValue}
                              onChange={(_e, d) => setRenameDeptValue(d.value)}
                              onBlur={commitRenameDept}
                              onKeyDown={e => {
                                if (e.key === 'Enter') commitRenameDept();
                                if (e.key === 'Escape') setRenamingDept(null);
                                e.stopPropagation();
                              }}
                              autoFocus
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <Text className={`${styles.deptName} ${isActive ? styles.activeDeptName : ''}`}>
                              {dept.name}
                            </Text>
                          )}

                          <Menu>
                            <MenuTrigger disableButtonEnhancement>
                              <Button
                                className={`${styles.menuBtn} ${hoveredDept === deptHoverKey ? styles.menuBtnVisible : ''}`}
                                icon={<MoreHorizontalRegular />}
                                appearance="subtle"
                                size="small"
                                onClick={e => e.stopPropagation()}
                              />
                            </MenuTrigger>
                            <MenuPopover>
                              <MenuList>
                                <MenuItem
                                  icon={<EditRegular />}
                                  onClick={e => { e.stopPropagation(); startRenameDept(project.id, dept.id, dept.name); }}
                                >
                                  Rename
                                </MenuItem>
                                <Divider />
                                <MenuItem
                                  icon={<DeleteRegular />}
                                  disabled={project.departments.length <= 1}
                                  onClick={e => { e.stopPropagation(); setDeletingDept({ projectId: project.id, deptId: dept.id }); }}
                                >
                                  Delete Department
                                </MenuItem>
                              </MenuList>
                            </MenuPopover>
                          </Menu>
                        </div>
                      );
                    })}

                    <div className={styles.addDeptBtn}>
                      <Button
                        icon={<AddRegular />}
                        appearance="subtle"
                        size="small"
                        onClick={() => setAddDeptForProject(project.id)}
                      >
                        Add Department
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </>
      )}

      {addDeptForProject && projectToAddDept && (
        <AddDeptDialog
          projectId={addDeptForProject}
          existingDepts={projectToAddDept.departments}
          onConfirm={(name, copyFrom) => handleAddDept(addDeptForProject, name, copyFrom)}
          onClose={() => setAddDeptForProject(null)}
        />
      )}

      {deletingProject && projectToDelete && (
        <Dialog open onOpenChange={(_e, s) => { if (!s.open) setDeletingProject(null); }}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Delete "{projectToDelete.name}"?</DialogTitle>
              <DialogContent>
                This will permanently delete the project and all its departments and progress notes.
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setDeletingProject(null)}>Cancel</Button>
                <Button
                  appearance="primary"
                  style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
                  onClick={() => handleDeleteProject(deletingProject)}
                >
                  Delete
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}

      {deletingDept && deptToDelete && (
        <Dialog open onOpenChange={(_e, s) => { if (!s.open) setDeletingDept(null); }}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Delete "{deptToDelete.name}"?</DialogTitle>
              <DialogContent>
                This will permanently delete the department and all its progress notes.
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setDeletingDept(null)}>Cancel</Button>
                <Button
                  appearance="primary"
                  style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
                  onClick={() => handleDeleteDept(deletingDept.projectId, deletingDept.deptId)}
                >
                  Delete
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
    </div>
  );
}
