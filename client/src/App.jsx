import { useState } from 'react';
import { authenticate } from './services/api.js';
import ProviderDirectory from './components/ProviderDirectory.jsx';
import ProviderProfile from './components/ProviderProfile.jsx';

const roles = [
  ['vehicle_owner', 'Vehicle owner'],
  ['mechanic', 'Mechanic'],
  ['spare_parts_seller', 'Spare-parts seller'],
  ['oil_dealer', 'Oil dealer'],
];
const providerRoles = new Set(['mechanic', 'spare_parts_seller', 'oil_dealer']);

function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem('roadRescueSession'));
  } catch {
    return null;
  }
}

function App() {
  const [mode, setMode] = useState('login');
  const [session, setSession] = useState(getStoredSession);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'vehicle_owner' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState('auth');
  const isRegistering = mode === 'register';

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = isRegistering ? form : { email: form.email, password: form.password };
      const nextSession = await authenticate(isRegistering ? 'register' : 'login', payload);
      localStorage.setItem('roadRescueSession', JSON.stringify(nextSession));
      setSession(nextSession);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function signOut() {
    localStorage.removeItem('roadRescueSession');
    setSession(null);
  }

  if (view === 'directory') {
    return <ProviderDirectory onBack={() => setView('auth')} />;
  }

  if (view === 'provider-profile' && session?.user) {
    return <ProviderProfile session={session} onBack={() => setView('auth')} />;
  }

  if (session?.user) {
    return (
      <main className="welcome-page">
        <section className="welcome-card account-card">
          <p className="eyebrow">Signed in</p>
          <h1>Welcome, {session.user.fullName}</h1>
          <p>Your account is registered as <strong>{session.user.role.replaceAll('_', ' ')}</strong>.</p>
          <button type="button" className="primary-button" onClick={() => setView('directory')}>Find providers</button>
          {providerRoles.has(session.user.role) && <button type="button" className="secondary-button profile-button" onClick={() => setView('provider-profile')}>Manage provider profile</button>}
          <button type="button" className="secondary-button" onClick={signOut}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="welcome-page">
      <section className="welcome-card" aria-labelledby="page-title">
        <p className="eyebrow">Roadside assistance, made simple</p>
        <h1 id="page-title">Road Rescue Hub</h1>
        <p>Find trusted help for vehicle emergencies, repairs, spare parts, and oil when you need it.</p>
        <button type="button" className="secondary-button directory-link" onClick={() => setView('directory')}>Browse providers</button>

        <div className="mode-switch" aria-label="Authentication mode">
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>Sign in</button>
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>Create account</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {isRegistering && <label>Full name<input name="fullName" value={form.fullName} onChange={updateField} minLength="2" required /></label>}
          <label>Email address<input name="email" type="email" value={form.email} onChange={updateField} required /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={updateField} minLength="8" required /></label>
          {isRegistering && <label>Account type<select name="role" value={form.role} onChange={updateField}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
