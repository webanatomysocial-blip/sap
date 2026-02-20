import { useEffect, useRef } from 'react';

// Global counter to handle nested/stacked modals
let lockCount = 0;

const useScrollLock = (isOpen) => {
  // Use a ref to track if this specific hook instance has incremented the counter
  const isLocked = useRef(false);

  useEffect(() => {
    if (isOpen) {
      lockCount++;
      isLocked.current = true;
      if (lockCount === 1) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
        
        // Stop Lenis safely
        if (window.lenis && typeof window.lenis.stop === 'function') {
            window.lenis.stop();
        }
      }
    }

    return () => {
      if (isLocked.current) {
        lockCount--;
        isLocked.current = false;
        if (lockCount === 0) {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
          document.body.classList.remove('modal-open');
          
          // Start Lenis safely
          if (window.lenis && typeof window.lenis.start === 'function') {
              window.lenis.start();
          }
        }
      }
    };
  }, [isOpen]);
};

export default useScrollLock;
