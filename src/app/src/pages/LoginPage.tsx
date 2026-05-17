import { makeStyles, tokens, Text, Button } from '@fluentui/react-components';
import { PersonRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    gap: tokens.spacingVerticalXL,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalXXL,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow16,
    maxWidth: '400px',
    width: '100%',
  },
  logo: {
    width: '64px',
    height: '64px',
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorBrandBackground,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: tokens.fontWeightBold,
  },
  subtitle: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
  },
});

export function LoginPage() {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <PersonRegular fontSize={36} style={{ color: 'white' }} />
        </div>
        <Text size={600} weight="bold" className={styles.title}>Question Coach</Text>
        <Text size={300} className={styles.subtitle}>
          A requirements-gathering companion for Dynamics 365 Contact Center and Customer Service workshops.
        </Text>
        <Button
          appearance="primary"
          size="large"
          as="a"
          href="/.auth/login/aad"
          style={{ width: '100%' }}
        >
          Sign in with Microsoft
        </Button>
      </div>
    </div>
  );
}
