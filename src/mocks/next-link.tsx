// Mock for next/link used in Storybook
import React from 'react';

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean }
>(({ href, children, prefetch, ...props }, ref) => (
  <a ref={ref} href={href} {...props} onClick={(e) => { e.preventDefault(); console.log('Navigate to:', href); }}>
    {children}
  </a>
));

Link.displayName = 'Link';
export default Link;
