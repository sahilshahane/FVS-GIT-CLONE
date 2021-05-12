import { useState, useEffect } from 'react';

const useScrollAnim = (
  textElement: React.RefObject<HTMLSpanElement>,
  container: React.RefObject<HTMLSpanElement>
) => {
  const [isScroll, setIsScroll] = useState(false);

  useEffect(() => {
    let timeout = setTimeout(() => null, 0);

    const handleChange = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        const textWidth = textElement.current?.offsetWidth;
        const containerWidth = container.current?.offsetWidth;

        setIsScroll(
          !!(containerWidth && textWidth && textWidth > containerWidth)
        );
      }, 500);
    };

    // HANDLING CHANGE
    handleChange();

    window.addEventListener('resize', handleChange);

    return () => window.removeEventListener('resize', handleChange);
  }, []);

  return [isScroll] as const;
};

export default useScrollAnim;
