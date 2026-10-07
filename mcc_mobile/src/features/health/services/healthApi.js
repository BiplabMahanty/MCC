import env from '../../../config/env';

export async function getHealth({ signal } = {}) {
  let response;

  try {
    response = await fetch(`${env.apiUrl}/health`, {
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch {
    throw new Error(
      `Turn on your mobile data or connect to a Wi-Fi network.`,
    );
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error('The backend returned an invalid health response.');
  }

  if (response.status >= 500 && !payload?.services) {
    throw new Error(payload?.message || 'The backend health check failed.');
  }

  return payload;
}
