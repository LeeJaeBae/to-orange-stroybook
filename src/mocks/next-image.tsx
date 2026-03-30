import React from 'react';

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  unoptimized?: boolean;
};

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ fill, priority, quality, sizes, placeholder, blurDataURL, unoptimized, ...rest }, ref) => {
    const style: React.CSSProperties = fill
      ? { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }
      : {};
    return <img ref={ref} style={{ ...style, ...rest.style }} {...rest} />;
  }
);
Image.displayName = 'Image';

export default Image;
