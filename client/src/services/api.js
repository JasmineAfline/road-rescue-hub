const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

export function authenticate(mode, credentials) {
  return request(`/auth/${mode}`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function searchProviders(filters = {}) {
  const parameters = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) parameters.set(key, value);
  });

  const query = parameters.toString();
  return request(`/providers${query ? `?${query}` : ''}`);
}
