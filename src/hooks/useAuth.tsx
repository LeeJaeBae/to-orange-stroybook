// Mock useAuth hook for Storybook
export function useAuth() {
  return {
    user: null,
    session: null,
    isLoading: false,
    signIn: async () => {},
    signOut: async () => {},
    signUp: async () => {},
  };
}
