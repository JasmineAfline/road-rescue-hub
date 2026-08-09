import { useEffect, useState } from 'react';
import { searchProviders } from '../services/api.js';

const initialFilters = { type: '', county: '', town: '', q: '' };

function titleForType(type) {
  return type.replaceAll('_', ' ');
}

function ProviderDirectory({ onBack }) {
  const [filters, setFilters] = useState(initialFilters);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProviders(nextFilters = filters) {
    setIsLoading(true);
    setError('');

    try {
      const data = await searchProviders(nextFilters);
      setProviders(data.providers);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProviders(initialFilters);
  }, []);

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submitSearch(event) {
    event.preventDefault();
    loadProviders();
  }

  function clearFilters() {
    setFilters(initialFilters);
    loadProviders(initialFilters);
  }

  return (
    <main className="directory-page">
      <header className="directory-header">
        <button type="button" className="text-button" onClick={onBack}>Back</button>
        <span className="brand">Road Rescue Hub</span>
      </header>

      <section className="directory-intro">
        <p className="eyebrow">Find assistance</p>
        <h1>Trusted roadside providers</h1>
        <p>Search approved mechanics, spare-parts sellers, and oil dealers near you.</p>
      </section>

      <form className="directory-search" onSubmit={submitSearch}>
        <label>Provider type
          <select name="type" value={filters.type} onChange={updateFilter}>
            <option value="">All provider types</option>
            <option value="mechanic">Mechanics</option>
            <option value="spare_parts_seller">Spare-parts sellers</option>
            <option value="oil_dealer">Oil dealers</option>
          </select>
        </label>
        <label>County<input name="county" value={filters.county} onChange={updateFilter} placeholder="e.g. Nairobi" /></label>
        <label>Town<input name="town" value={filters.town} onChange={updateFilter} placeholder="e.g. Westlands" /></label>
        <label>Keyword<input name="q" value={filters.q} onChange={updateFilter} placeholder="Business or service" /></label>
        <div className="search-actions">
          <button className="primary-button" type="submit">Search providers</button>
          <button className="secondary-button" type="button" onClick={clearFilters}>Clear</button>
        </div>
      </form>

      {isLoading && <p className="directory-message">Loading providers...</p>}
      {error && <p className="directory-message form-error" role="alert">{error}</p>}
      {!isLoading && !error && providers.length === 0 && <p className="directory-message">No approved providers match this search yet.</p>}

      <section className="provider-grid" aria-live="polite">
        {providers.map((provider) => (
          <article className="provider-card" key={provider._id}>
            <p className="provider-type">{titleForType(provider.providerType)}</p>
            <h2>{provider.businessName}</h2>
            <p>{provider.description || 'This provider has not added a description yet.'}</p>
            <dl>
              <div><dt>Location</dt><dd>{provider.town}, {provider.county}</dd></div>
              <div><dt>Phone</dt><dd><a href={`tel:${provider.phone}`}>{provider.phone}</a></dd></div>
              {provider.serviceAreas?.length > 0 && <div><dt>Service areas</dt><dd>{provider.serviceAreas.join(', ')}</dd></div>}
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}

export default ProviderDirectory;
