export function useRouter() {
  return {
    push: (url: string) => console.log('[mock] router.push:', url),
    replace: (url: string) => console.log('[mock] router.replace:', url),
    back: () => console.log('[mock] router.back'),
    forward: () => console.log('[mock] router.forward'),
    refresh: () => console.log('[mock] router.refresh'),
    prefetch: (url: string) => console.log('[mock] router.prefetch:', url),
  };
}

export function usePathname() {
  return '/';
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function useParams() {
  return {};
}
