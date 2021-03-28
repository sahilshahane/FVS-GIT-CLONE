/* eslint-disable @typescript-eslint/naming-convention */
import { useState, useEffect } from 'react';

type useWindowDimensions_ = (
  initialWidth?: string | null,
  initialHeight?: string | null
) => { width: number | string | null; height: number | string | null };

const useWindowDimensions: useWindowDimensions_ = (
  initialWidth = null,
  initialHeight = null
) => {
  const hasWindow = typeof window !== 'undefined';

  function getWindowDimensions() {
    const width = hasWindow ? window.innerWidth : initialWidth;
    const height = hasWindow ? window.innerHeight : initialHeight;
    return {
      width,
      height,
    };
  }

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    if (hasWindow) {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [hasWindow]);

  return windowDimensions;
};

export default useWindowDimensions;
