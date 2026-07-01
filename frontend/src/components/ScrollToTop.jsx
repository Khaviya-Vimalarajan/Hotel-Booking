import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // If routing to a hotel details page, bypass scroll-to-top so HotelDetail.jsx can scroll directly to rooms section
    if (pathname.startsWith('/hotels/')) {
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
