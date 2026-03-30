export function useAuth() {
  return {
    user: null,
    loading: false,
    signOut: async () => console.log('[mock] signOut'),
  };
}

export function useProfile() {
  return {
    profile: null,
    loading: false,
  };
}
