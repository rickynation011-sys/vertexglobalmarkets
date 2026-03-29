import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      setIsVisible(false);
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setIsVisible(true);
        prevPathname.current = pathname;
      }, 200);
      return () => clearTimeout(timeout);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div
      className="transition-opacity duration-200 ease-out"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
