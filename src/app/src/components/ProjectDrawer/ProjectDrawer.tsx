import { useState } from 'react';
import {
  makeStyles,
  tokens,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Button,
  Input,
  Text,
  Spinner,
  Card,
  Badge,
  Divider,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
} from '@fluentui/react-components';
import {
  AddRegular,
  DismissRegular,
  DeleteRegular,
  CheckmarkRegular,
} from '@fluentui/react-icons';
import { useProjects, useCreateProject, useDeleteProject } from '../../hooks/useProjects';

const useStyles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  projectCard: {
    cursor: 'pointer',
    transition: 'background 0.1s',
    ':hover': { backgroundColor: tokens.colorNeutralBackground2Hover },
  },
  activeCard: {
    border: `2px solid ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorBrandBackground2,
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  newForm: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
  },
  input: {
    flex: 1,
  },
  emptyState: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    padding: tokens.spacingVerticalL,
  },
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ProjectDrawerProps {
  open: boolean;
  onClose: () => void;
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
}

export function ProjectDrawer({ open, onClose, activeProjectId, onSelectProject }: ProjectDrawerProps) {
  const styles = useStyles();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [newName, setNewName] = useState('');

  async function handleCreate() {
    if (!newName.trim()) return;
    const created = await createProject.mutateAsync(newName.trim());
    setNewName('');
    onSelectProject(created.id);
  }

  function handleSelect(id: string) {
    onSelectProject(id);
    onClose();
  }

  return (
    <OverlayDrawer open={open} onOpenChange={(_e, s) => { if (!s.open) onClose(); }} position="start" size="small">
      <DrawerHeader>
        <DrawerHeaderTitle
          action={<Button appearance="subtle" icon={<DismissRegular />} onClick={onClose} />}
        >
          Projects
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <div className={styles.newForm}>
          <Input
            className={styles.input}
            placeholder="New project name…"
            value={newName}
            onChange={(_e, d) => setNewName(d.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
          />
          <Button
            icon={<AddRegular />}
            appearance="primary"
            onClick={handleCreate}
            disabled={!newName.trim() || createProject.isPending}
          >
            Create
          </Button>
        </div>

        <Divider />
        <div style={{ height: tokens.spacingVerticalM }} />

        {isLoading && <Spinner label="Loading projects…" />}

        {!isLoading && (!projects || projects.length === 0) && (
          <div className={styles.emptyState}>
            <Text size={300}>No projects yet. Create one above to get started.</Text>
          </div>
        )}

        <div className={styles.list}>
          {projects?.map(p => (
            <Card
              key={p.id}
              className={`${styles.projectCard} ${p.id === activeProjectId ? styles.activeCard : ''}`}
              size="small"
              onClick={() => handleSelect(p.id)}
            >
              <div className={styles.cardRow}>
                <div className={styles.cardMeta}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS }}>
                    {p.id === activeProjectId && <CheckmarkRegular fontSize={14} style={{ color: tokens.colorBrandForeground1 }} />}
                    <Text weight="semibold" size={300}>{p.name}</Text>
                  </div>
                  <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                    Updated {formatDate(p.updatedAt)}
                  </Text>
                  {(p.filters.product || p.filters.area) && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                      {p.filters.product && <Badge size="extra-small" appearance="outline">{p.filters.product.replace('Dynamics 365 ', 'D365 ')}</Badge>}
                      {p.filters.area && <Badge size="extra-small" appearance="outline">{p.filters.area}</Badge>}
                      {p.filters.subArea && <Badge size="extra-small" appearance="outline">{p.filters.subArea}</Badge>}
                    </div>
                  )}
                </div>
                <Dialog>
                  <DialogTrigger disableButtonEnhancement>
                    <Button
                      icon={<DeleteRegular />}
                      appearance="subtle"
                      size="small"
                      onClick={e => e.stopPropagation()}
                      title="Delete project"
                    />
                  </DialogTrigger>
                  <DialogSurface onClick={e => e.stopPropagation()}>
                    <DialogBody>
                      <DialogTitle>Delete "{p.name}"?</DialogTitle>
                      <Text>This will permanently delete the project and all progress notes. This cannot be undone.</Text>
                      <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                          <Button appearance="secondary">Cancel</Button>
                        </DialogTrigger>
                        <Button
                          appearance="primary"
                          style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
                          onClick={() => deleteProject.mutate(p.id)}
                        >
                          Delete
                        </Button>
                      </DialogActions>
                    </DialogBody>
                  </DialogSurface>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      </DrawerBody>
    </OverlayDrawer>
  );
}
