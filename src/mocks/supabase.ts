// Mock Supabase for Storybook
export const createSupabaseClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null }) }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
  storage: {
    from: () => ({
      getPublicUrl: (path: string) => ({ data: { publicUrl: `https://placeholder.com/${path}` } }),
      upload: () => Promise.resolve({ data: null, error: null }),
    }),
  },
});

export const createSupabaseBrowserClient = createSupabaseClient;
export const createSupabaseServerClient = createSupabaseClient;
