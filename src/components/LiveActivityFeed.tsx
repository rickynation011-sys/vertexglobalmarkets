import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownToLine, DollarSign, UserPlus, Activity } from "lucide-react";

type ActivityItem = {
  id: number;
  icon: React.ReactNode;
  text: string;
  timestamp: number;
  color: string;
};

type ActionType = "register" | "deposit" | "withdrawal" | "activity";

const COUNTRIES = [
  "🇺🇸 USA", "🇬🇧 UK", "🇩🇪 Germany", "🇫🇷 France", "🇯🇵 Japan", "🇦🇺 Australia",
  "🇨🇦 Canada", "🇮🇳 India", "🇧🇷 Brazil", "🇸🇬 Singapore", "🇦🇪 UAE", "🇳🇱 Netherlands",
  "🇪🇸 Spain", "🇮🇹 Italy", "🇰🇷 South Korea", "🇸🇪 Sweden", "🇨🇭 Switzerland", "🇲🇽 Mexico",
];

const pickAction = (): ActionType => {
  const r = Math.random();
  if (r < 0.3) return "register";
  if (r < 0.55) return "deposit";
  if (r < 0.75) return "withdrawal";
  return "activity";
};

const buildActivity = (type: ActionType, id: number): ActivityItem => {
  const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];

  switch (type) {
    case "register":
      return { id, icon: <UserPlus className="h-4 w-4" />, text: `New user joined from ${country}`, timestamp: Date.now(), color: "text-primary" };
    case "deposit":
      return { id, icon: <ArrowDownToLine className="h-4 w-4" />, text: `New deposit received from ${country}`, timestamp: Date.now(), color: "text-primary" };
    case "withdrawal":
      return { id, icon: <DollarSign className="h-4 w-4" />, text: `Withdrawal processed for user in ${country}`, timestamp: Date.now(), color: "text-warning" };
    case "activity":
      return { id, icon: <Activity className="h-4 w-4" />, text: `Trading activity from ${country}`, timestamp: Date.now(), color: "text-muted-foreground" };
  }
};

const timeAgoLabel = (ts: number) => {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 3) return "just now";
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
};

let idCounter = 0;

const LiveActivityFeed = () => {
  const [activity, setActivity] = useState<ActivityItem | null>(null);
  const [visible, setVisible] = useState(false);
  const [displayTime, setDisplayTime] = useState("just now");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const showNext = useCallback(() => {
    const type = pickAction();
    const act = buildActivity(type, idCounter++);
    setActivity(act);
    setVisible(true);
    setDisplayTime("just now");

    const showDuration = 3500 + Math.random() * 2000;
    setTimeout(() => setVisible(false), showDuration);
  }, []);

  useEffect(() => {
    if (!visible || !activity) return;
    const iv = setInterval(() => setDisplayTime(timeAgoLabel(activity.timestamp)), 1000);
    return () => clearInterval(iv);
  }, [visible, activity]);

  useEffect(() => {
    if (!visible && activity !== null) {
      const delay = 8000 + Math.random() * 12000;
      timerRef.current = setTimeout(showNext, delay);
      return () => clearTimeout(timerRef.current);
    }
  }, [visible, activity, showNext]);

  useEffect(() => {
    const delay = 5000 + Math.random() * 5000;
    timerRef.current = setTimeout(showNext, delay);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-[360px] pointer-events-none">
      <AnimatePresence>
        {visible && activity && (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-card/95 backdrop-blur-md border border-border rounded-xl px-4 py-3 shadow-lg pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex-shrink-0 ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{activity.text}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{displayTime}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveActivityFeed;
