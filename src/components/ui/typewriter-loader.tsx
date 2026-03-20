import React from 'react';

interface TypewriterLoaderProps {
  className?: string;
}

export function TypewriterLoader({ className = '' }: TypewriterLoaderProps) {
  return (
    <div className={`typewriter-loader ${className}`}>
      <div className="typewriter-slide">
        <i />
      </div>
      <div className="typewriter-paper" />
      <div className="typewriter-keyboard" />
    </div>
  );
}

export default TypewriterLoader;
