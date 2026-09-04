import React, { useState, useEffect } from 'react';
import { Blurhash } from 'react-blurhash';

export default function ImageWithBlurhash({ src, hash, alt, className, style, imgStyle, onMouseOver, onMouseOut, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
    };
    img.src = src;
  }, [src]);

  // A default colorful hash to show an "RGB substance" if the DB doesn't have one yet.
  const defaultHash = "LEHV6nWB2yk8pyo0adR*.7kCMdnj";

  return (
    <div 
      style={{ position: 'relative', width: '100%', height: '100%', ...style }} 
      className={className}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div 
        style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          opacity: isLoaded ? 0 : 1, transition: 'opacity 0.5s ease-out',
          zIndex: 1
        }}
      >
        <Blurhash
          hash={hash || defaultHash}
          width="100%"
          height="100%"
          resolutionX={32}
          resolutionY={32}
          punch={1}
        />
      </div>
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: imgStyle?.objectFit || style?.objectFit || 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'all 0.5s ease-in-out',
          position: 'relative',
          zIndex: 2,
          ...imgStyle
        }}
        {...props}
      />
    </div>
  );
}
