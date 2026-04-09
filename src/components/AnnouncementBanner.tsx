import { useState } from "react";
import { X } from "lucide-react";

const AnnouncementBanner = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative w-full bg-primary text-primary-foreground text-center py-2 px-4 text-xs sm:text-sm font-medium animate-fade-in z-50 overflow-hidden">
      <div className="animate-[slide-in-right_0.5s_ease-out]">
        🚀 System upgrades completed. Faster withdrawals now enabled!
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
