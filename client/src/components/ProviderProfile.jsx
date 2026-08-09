import { useEffect, useState } from 'react';
import { getMyProviderProfile, saveProviderProfile } from '../services/api.js';

function createForm(role, provider) {
  return {
    businessName: provider?.businessName || '',
    providerType: role,
    phone: provider?.phone || '',
    description: provider?.description || '',
    county: provider?.county || '',
    town: provider?.town || '',
    serviceAreas: provider?.serviceAreas?.join(', ') || '',
  };
}

function readableRole(role) {
  return role.replaceAll('_', ' ');
}

function ProviderProfile({ session, onBack }) {
  const [form, setForm] = useState(() => createForm(session.user.role));
  const [exists, setExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { provider } = await getMyProviderProfile(session.token);
        if (provider) {
          setForm(createForm(session.user.role, provider));
          setExists(true);
          setIsApproved(provider.isApproved);
        }
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [session.token, session.user.role]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      const payload = {
        ...form,
        serviceAreas: form.serviceAreas.split(',').map((area) => area.trim()).filter(Boolean),
      };
      const { provider } = await saveProviderProfile(session.token, payload, exists);
      setExists(true);
      setIsApproved(provider.isApproved);
      setMessage(provider.isApproved ? 'Your profile is live in the directory.' : 'Profile saved. It is awaiting administrator approval.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="directory-page">
      <header className="directory-header">
        <button type="button" className="text-button" onClick={onBack}>Back to account</button>
        <span className="brand">Road Rescue Hub</span>
      </header>

      <section className="profile-panel">
        <p className="eyebrow">Provider profile</p>
        <h1>{readableRole(session.user.role)}</h1>
        <p>Complete these details so drivers can find your business once it is approved.</p>
        {isLoading ? <p>Loading profile...</p> : (
          <form className="profile-form" onSubmit={submit}>
            <label>Business name<input name="businessName" value={form.businessName} onChange={updateField} minLength="2" required /></label>
            <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={updateField} required /></label>
            <label>County<input name="county" value={form.county} onChange={updateField} required /></label>
            <label>Town or area<input name="town" value={form.town} onChange={updateField} required /></label>
            <label className="full-width">Services areas (separate with commas)<input name="serviceAreas" value={form.serviceAreas} onChange={updateField} placeholder="Westlands, Kilimani, CBD" /></label>
            <label className="full-width">About your business<textarea name="description" value={form.description} onChange={updateField} rows="5" maxLength="1000" /></label>
            {error && <p className="form-error full-width" role="alert">{error}</p>}
            {message && <p className="form-success full-width">{message}</p>}
            {exists && !isApproved && <p className="approval-note full-width">Your profile is currently pending approval.</p>}
            <div className="full-width"><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : exists ? 'Save changes' : 'Create provider profile'}</button></div>
          </form>
        )}
      </section>
    </main>
  );
}

export default ProviderProfile;
