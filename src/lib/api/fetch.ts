// Mock API fetch for Storybook
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  console.log('Mock API fetch:', url, options);
  return new Response(JSON.stringify({ data: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
