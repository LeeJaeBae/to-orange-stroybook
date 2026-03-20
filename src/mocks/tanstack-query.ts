// Mock TanStack Query for Storybook
export const useQuery = (options: any) => ({
  data: options.initialData ?? undefined,
  isLoading: false,
  isError: false,
  error: null,
  refetch: () => Promise.resolve({ data: undefined }),
});

export const useMutation = (options: any) => ({
  mutate: (...args: any[]) => console.log('Mutation called', args),
  mutateAsync: (...args: any[]) => Promise.resolve(undefined),
  isLoading: false,
  isPending: false,
  isError: false,
  error: null,
  reset: () => {},
});

export const useQueryClient = () => ({
  invalidateQueries: () => Promise.resolve(),
  setQueryData: () => {},
  getQueryData: () => undefined,
});

export const QueryClient = class {
  constructor() {}
};

export const QueryClientProvider = ({ children }: any) => children;
