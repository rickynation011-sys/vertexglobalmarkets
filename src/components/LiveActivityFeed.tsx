import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowDownToLine, DollarSign, BarChart3 } from "lucide-react";

type Activity = {
  id: number;
  icon: React.ReactNode;
  text: string;
  time: string;
  color: string;
};

const firstNames = [
  "James", "Maria", "Ahmed", "Yuki", "Carlos", "Sophie", "Raj", "Elena",
  "Chen", "Fatima", "Liam", "Aisha", "Marcus", "Nina", "Omar", "Isabella",
  "Dmitri", "Priya", "Hans", "Mei", "Diego", "Amara", "Viktor", "Sakura",
  "Andre", "Zara", "Tobias", "Leila", "Patrick", "Hana",
];

const lastInitials = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const countries = [
  { name: "USA", flag: "🇺🇸" }, { name: "UK", flag: "🇬🇧" }, { name: "Germany", flag: "🇩🇪" },
  { name: "Japan", flag: "🇯🇵" }, { name: "Canada", flag: "🇨🇦" }, { name: "Australia", flag: "🇦🇺" },
  { name: "UAE", flag: "🇦🇪" }, { name: "Singapore", flag: "🇸🇬" }, { name: "France", flag: "🇫🇷" },
  { name: "Brazil", flag: "🇧🇷" }, { name: "Netherlands", flag: "🇳🇱" }, { name: "South Korea", flag: "🇰🇷" },
  { name: "Switzerland", flag: "🇨🇭" }, { name: "Sweden", flag: "🇸🇪" }, { name: "Ireland", flag: "🇮🇪" },
];

const assets = ["BTC/USD", "ETH/USD", "EUR/USD", "AAPL", "GOLD", "GBP/JPY", "SOL/USD", "TSLA", "SPX500", "NAS100"];

const actions = [
  (name: string, country: { name: string; flag: string }) => {
    const amount = (Math.random() * 45000 + 500).toFixed(0);
    return {
      icon: <ArrowDownToLine className="h-4 w-4" />,
      text: `${name} from ${country.flag} ${country.name} deposited $${Number(amount).toLocaleString()}`,
      color: "text-primary",
    };
  },
  (name: string, country: { name: string; flag: string }) => {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const profit = (Math.random() * 8000 + 120).toFixed(0);
    return {
      icon: <TrendingUp className="h-4 w-4" />,
      text: `${name} from ${country.flag} ${country.name} profited +$${Number(profit).toLocaleString()} on ${asset}`,
      color: "text-success",
    };
  },
  (name: string, country: { name: string; flag: string }) => {
    const amount = (Math.random() * 20000 + 1000).toFixed(0);
    return {
      icon: <DollarSign className="h-4 w-4" />,
      text: `${name} from ${country.flag} ${country.name} withdrew $${Number(amount).toLocaleString()}`,
      color: "text-warning",
    };
  },
  (name: string, country: { name: string; flag: string }) => {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    return {
      icon: <BarChart3 className="h-4 w-4" />,
      text: `${name} from ${country.flag} ${country.name} opened a trade on ${asset}`,
      color: "text-primary",
    };
  },
];

const timeAgo = () => {
  const secs = Math.floor(Math.random() * 55) + 5;
  return `${secs}s ago`;
};

let counter = 0;
const usedRecently: string[] = [];

const generateActivity = (): Activity => {
  // Rotate names to avoid repeats
  let name: string;
  do {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastInitials[Math.floor(Math.random() * lastInitials.length)];
    name = `${first} ${last}.`;
  } while (usedRecently.includes(name));
  
  usedRecently.push(name);
  if (usedRecently.length > 10) usedRecently.shift();

  const country = countries[Math.floor(Math.random() * countries.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const result = action(name, country);

  return {
    id: counter++,
    icon: result.icon,
    text: result.text,
    time: timeAgo(),
    color: result.color,
  };
};

const LiveActivityFeed = () => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [visible, setVisible] = useState(false);

  const showNext = useCallback(() => {
    const next = generateActivity();
    setActivity(next);
    setVisible(true);

    // Hide after 4 seconds
    setTimeout(() => setVisible(false), 4000);
  }, []);

  useEffect(() => {
    // Initial delay 2-5s
    const initialDelay = Math.random() * 3000 + 2000;
    const firstTimeout = setTimeout(showNext, initialDelay);

    return () => clearTimeout(firstTimeout);
  }, [showNext]);

  useEffect(() => {
    if (!visible && activity) {
      // Schedule next with random delay 3-10s
      const delay = Math.random() * 7000 + 3000;
      const timeout = setTimeout(showNext, delay);
      return () => clearTimeout(timeout);
    }
  }, [visible, activity, showNext]);

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-[340px]">
      <AnimatePresence>
        {visible && activity && (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-card/95 backdrop-blur-md border border-border rounded-xl px-4 py-3 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{activity.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveActivityFeed;
