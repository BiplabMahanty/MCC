import env from '../config/env';

let accessToken = null;
let refreshHandler = null;
let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function setAccessToken(token) {
  accessToken = token;
}

export function setRefreshHandler(handler) {
  refreshHandler = handler;
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiError('The server returned an invalid response.', {
      status: response.status,
      code: 'INVALID_RESPONSE',
    });
  }

  return response.json();
}

export async function apiRequest(
  path,
  {
    method = 'GET',
    body,
    auth = false,
    retryOnUnauthorized = true,
    signal,
  } = {},
) {
  const headers = { Accept: 'application/json' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response;

  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError(
      `Turn on your mobile data or connect to a Wi-Fi network.`,
    );
  }

  const payload = await parseResponse(response);

  if (
    response.status === 401 &&
    auth &&
    retryOnUnauthorized &&
    refreshHandler
  ) {
    if (!refreshPromise) {
      refreshPromise = Promise.resolve(refreshHandler()).finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      return apiRequest(path, {
        method,
        body,
        auth,
        retryOnUnauthorized: false,
        signal,
      });
    }
  }

  if (!response.ok) {
    throw new ApiError(payload?.message || 'Request failed.', {
      status: response.status,
      code: payload?.code || 'REQUEST_FAILED',
      details: payload?.details,
    });
  }

  return payload;
}
