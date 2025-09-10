export type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Usamos el proxy interno de Next: /api/rest para unificar origen y cookies
const baseUrl = '/api/rest';

export async function apiFetch<T = unknown>(path: string, options: { method?: Metodo; body?: any; headers?: Record<string, string> } = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  
  console.log(`🌐 [API] ${method} ${url}`);
  if (body) console.log('🌐 [API] Body:', body);
  
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // mantiene cookies hacia /api/rest
  });
  
  console.log(`🌐 [API] Response: ${res.status} ${res.statusText}`);
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`🌐 [API] Error response:`, text);
    throw new Error(`Error ${res.status}: ${text}`);
  }
  // algunos endpoints pueden no devolver JSON
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const jsonData = await res.json();
    console.log('🌐 [API] JSON Response:', jsonData);
    return jsonData as T;
  }
  return undefined as unknown as T;
}
