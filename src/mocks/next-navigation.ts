// Mock for next/navigation used in Storybook
export const useRouter = () => ({
  push: (url: string) => console.log('Navigate to:', url),
  replace: (url: string) => console.log('Replace with:', url),
  back: () => console.log('Go back'),
  forward: () => console.log('Go forward'),
  refresh: () => console.log('Refresh'),
  prefetch: (url: string) => console.log('Prefetch:', url),
});

export const usePathname = () => '/';
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
