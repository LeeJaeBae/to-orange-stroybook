import React from 'react';

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  children: React.ReactNode;
};

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, prefetch, replace, scroll, children, ...rest }, ref) => (
    <a ref={ref} href={href} {...rest}>
      {children}
    </a>
  )
);
Link.displayName = 'Link';

export default Link;
