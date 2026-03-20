// Mock for next/image used in Storybook
import React from 'react';

const Image = ({ src, alt, width, height, className, fill, ...props }: any) => (
  <img
    src={typeof src === 'object' ? src.src : src}
    alt={alt || ''}
    width={fill ? undefined : width}
    height={fill ? undefined : height}
    className={className}
    style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
    {...props}
  />
);

export default Image;
