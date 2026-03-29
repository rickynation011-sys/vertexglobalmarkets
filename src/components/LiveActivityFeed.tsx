import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowDownToLine, DollarSign, UserPlus } from "lucide-react";

type Activity = {
  id: number;
  icon: React.ReactNode;
  text: string;
  timestamp: number;
  color: string;
};

type SimUser = { name: string; country: string; flag: string };

const USERS: SimUser[] = [
  { name: "James W.", country: "USA", flag: "🇺🇸" },
  { name: "Maria L.", country: "Brazil", flag: "🇧🇷" },
  { name: "Ahmed K.", country: "UAE", flag: "🇦🇪" },
  { name: "Yuki T.", country: "Japan", flag: "🇯🇵" },
  { name: "Carlos M.", country: "Mexico", flag: "🇲🇽" },
  { name: "Sophie B.", country: "France", flag: "🇫🇷" },
  { name: "Raj P.", country: "India", flag: "🇮🇳" },
  { name: "Elena V.", country: "Spain", flag: "🇪🇸" },
  { name: "Chen W.", country: "China", flag: "🇨🇳" },
  { name: "Fatima A.", country: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Liam O.", country: "Ireland", flag: "🇮🇪" },
  { name: "Aisha N.", country: "Nigeria", flag: "🇳🇬" },
  { name: "Marcus H.", country: "Germany", flag: "🇩🇪" },
  { name: "Nina S.", country: "Sweden", flag: "🇸🇪" },
  { name: "Omar F.", country: "Egypt", flag: "🇪🇬" },
  { name: "Isabella R.", country: "Italy", flag: "🇮🇹" },
  { name: "Dmitri K.", country: "Russia", flag: "🇷🇺" },
  { name: "Priya D.", country: "India", flag: "🇮🇳" },
  { name: "Hans M.", country: "Austria", flag: "🇦🇹" },
  { name: "Mei L.", country: "Taiwan", flag: "🇹🇼" },
  { name: "Diego C.", country: "Argentina", flag: "🇦🇷" },
  { name: "Amara J.", country: "Kenya", flag: "🇰🇪" },
  { name: "Viktor P.", country: "Ukraine", flag: "🇺🇦" },
  { name: "Sakura I.", country: "Japan", flag: "🇯🇵" },
  { name: "Andre S.", country: "South Africa", flag: "🇿🇦" },
  { name: "Zara K.", country: "Pakistan", flag: "🇵🇰" },
  { name: "Tobias F.", country: "Denmark", flag: "🇩🇰" },
  { name: "Leila M.", country: "Morocco", flag: "🇲🇦" },
  { name: "Patrick D.", country: "Australia", flag: "🇦🇺" },
  { name: "Hana Y.", country: "South Korea", flag: "🇰🇷" },
  { name: "Robert J.", country: "USA", flag: "🇺🇸" },
  { name: "Chloe P.", country: "UK", flag: "🇬🇧" },
  { name: "Arjun R.", country: "India", flag: "🇮🇳" },
  { name: "Eva M.", country: "Czech Republic", flag: "🇨🇿" },
  { name: "Samuel T.", country: "Ghana", flag: "🇬🇭" },
  { name: "Olivia C.", country: "Canada", flag: "🇨🇦" },
  { name: "Felix W.", country: "Switzerland", flag: "🇨🇭" },
  { name: "Ling Z.", country: "Singapore", flag: "🇸🇬" },
  { name: "Noah B.", country: "Netherlands", flag: "🇳🇱" },
  { name: "Aaliya H.", country: "Malaysia", flag: "🇲🇾" },
  { name: "Mateo G.", country: "Colombia", flag: "🇨🇴" },
  { name: "Ingrid L.", country: "Norway", flag: "🇳🇴" },
  { name: "Kwame A.", country: "Ghana", flag: "🇬🇭" },
  { name: "Lucia F.", country: "Portugal", flag: "🇵🇹" },
  { name: "Tao C.", country: "China", flag: "🇨🇳" },
  { name: "Emilia K.", country: "Poland", flag: "🇵🇱" },
  { name: "David N.", country: "Israel", flag: "🇮🇱" },
  { name: "Suki M.", country: "Thailand", flag: "🇹🇭" },
  { name: "William R.", country: "UK", flag: "🇬🇧" },
  { name: "Carmen S.", country: "Spain", flag: "🇪🇸" },
  { name: "Kenji O.", country: "Japan", flag: "🇯🇵" },
  { name: "Bianca T.", country: "Romania", flag: "🇷🇴" },
  { name: "Andrei V.", country: "Moldova", flag: "🇲🇩" },
  { name: "Nadia B.", country: "Algeria", flag: "🇩🇿" },
  { name: "Erik J.", country: "Finland", flag: "🇫🇮" },
  { name: "Grace W.", country: "New Zealand", flag: "🇳🇿" },
  { name: "Hassan E.", country: "Jordan", flag: "🇯🇴" },
  { name: "Mia L.", country: "Belgium", flag: "🇧🇪" },
  { name: "Oscar P.", country: "Chile", flag: "🇨🇱" },
  { name: "Ananya S.", country: "India", flag: "🇮🇳" },
  { name: "Thomas G.", country: "Germany", flag: "🇩🇪" },
  { name: "Yara A.", country: "Lebanon", flag: "🇱🇧" },
  { name: "Ryan K.", country: "Australia", flag: "🇦🇺" },
  { name: "Freya H.", country: "Iceland", flag: "🇮🇸" },
  { name: "Jorge R.", country: "Peru", flag: "🇵🇪" },
  { name: "Sana Q.", country: "Qatar", flag: "🇶🇦" },
  { name: "Luca D.", country: "Italy", flag: "🇮🇹" },
  { name: "Vera N.", country: "Serbia", flag: "🇷🇸" },
  { name: "Kevin C.", country: "USA", flag: "🇺🇸" },
  { name: "Isla M.", country: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "Hugo V.", country: "France", flag: "🇫🇷" },
  { name: "Rania S.", country: "Kuwait", flag: "🇰🇼" },
  { name: "Alex T.", country: "Greece", flag: "🇬🇷" },
  { name: "Mina J.", country: "Iran", flag: "🇮🇷" },
  { name: "Stefan B.", country: "Croatia", flag: "🇭🇷" },
  { name: "Linh T.", country: "Vietnam", flag: "🇻🇳" },
  { name: "Daniel F.", country: "Canada", flag: "🇨🇦" },
  { name: "Ava W.", country: "USA", flag: "🇺🇸" },
  { name: "Mustafa Y.", country: "Turkey", flag: "🇹🇷" },
  { name: "Clara E.", country: "Sweden", flag: "🇸🇪" },
  { name: "Javier L.", country: "Venezuela", flag: "🇻🇪" },
  { name: "Noor H.", country: "Bahrain", flag: "🇧🇭" },
  { name: "Leo R.", country: "Brazil", flag: "🇧🇷" },
  { name: "Kira N.", country: "Latvia", flag: "🇱🇻" },
  { name: "Ben A.", country: "UK", flag: "🇬🇧" },
  { name: "Amina O.", country: "Tanzania", flag: "🇹🇿" },
  { name: "Chris P.", country: "South Africa", flag: "🇿🇦" },
  { name: "Daria I.", country: "Ukraine", flag: "🇺🇦" },
  { name: "Ethan G.", country: "Singapore", flag: "🇸🇬" },
  { name: "Farah Z.", country: "Oman", flag: "🇴🇲" },
  { name: "Gustav S.", country: "Germany", flag: "🇩🇪" },
  { name: "Hailey J.", country: "Australia", flag: "🇦🇺" },
  { name: "Ivan K.", country: "Bulgaria", flag: "🇧🇬" },
  { name: "Jana M.", country: "Slovakia", flag: "🇸🇰" },
  { name: "Karim B.", country: "Tunisia", flag: "🇹🇳" },
  { name: "Luna C.", country: "Mexico", flag: "🇲🇽" },
  { name: "Max H.", country: "Netherlands", flag: "🇳🇱" },
  { name: "Naomi T.", country: "Ethiopia", flag: "🇪🇹" },
  { name: "Pedro A.", country: "Ecuador", flag: "🇪🇨" },
  { name: "Quinn D.", country: "Ireland", flag: "🇮🇪" },
  { name: "Rosa V.", country: "Philippines", flag: "🇵🇭" },
  { name: "Sven L.", country: "Norway", flag: "🇳🇴" },
];

const ASSETS = ["BTC/USD", "ETH/USD", "EUR/USD", "AAPL", "GOLD", "GBP/JPY", "SOL/USD", "TSLA", "SPX500", "NAS100", "XRP/USD", "ADA/USD", "AMZN", "NVDA", "OIL"];

type ActionType = "register" | "deposit" | "trade_win" | "trade_loss" | "withdrawal";

// Time-of-day aware weights — registrations spike at certain "hours"
const getActionWeights = (lastType: ActionType | null, lastTwoTypes: ActionType[]): { type: ActionType; weight: number }[] => {
  const base: { type: ActionType; weight: number }[] = [
    { type: "register", weight: 8 },
    { type: "deposit", weight: 28 },
    { type: "trade_win", weight: 35 },
    { type: "trade_loss", weight: 12 },
    { type: "withdrawal", weight: 17 },
  ];

  // Penalize types that appeared in last 2 activities to avoid clustering
  return base.map(a => {
    let w = a.weight;
    if (a.type === lastType) w *= 0.15; // strong penalty for immediate repeat
    if (lastTwoTypes.includes(a.type)) w *= 0.5; // lighter penalty for recent
    return { ...a, weight: w };
  });
};

const pickWeightedAction = (lastType: ActionType | null, lastTwoTypes: ActionType[]): ActionType => {
  const pool = getActionWeights(lastType, lastTwoTypes);
  const total = pool.reduce((s, a) => s + a.weight, 0);
  let r = Math.random() * total;
  for (const a of pool) {
    r -= a.weight;
    if (r <= 0) return a.type;
  }
  return pool[pool.length - 1].type;
};

const formatAmount = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

// Log-normal-ish distribution for more realistic amounts
const logNormalAmount = (median: number, spread: number = 0.8): number => {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(Math.round(Math.exp(Math.log(median) + spread * z)), 10);
};

const buildActivity = (user: SimUser, type: ActionType, id: number): Activity => {
  const prefix = `${user.name} ${user.flag}`;

  switch (type) {
    case "register":
      return { id, icon: <UserPlus className="h-4 w-4" />, text: `${prefix} just joined the platform`, timestamp: Date.now(), color: "text-primary" };

    case "deposit": {
      const amt = logNormalAmount(2500, 1.2);
      return { id, icon: <ArrowDownToLine className="h-4 w-4" />, text: `${prefix} deposited ${formatAmount(amt)}`, timestamp: Date.now(), color: "text-primary" };
    }
    case "trade_win": {
      const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
      // Most wins are modest, occasional big ones (log-normal)
      const profit = logNormalAmount(450, 1.0);
      return { id, icon: <TrendingUp className="h-4 w-4" />, text: `${prefix} made +${formatAmount(profit)} on ${asset}`, timestamp: Date.now(), color: "text-success" };
    }
    case "trade_loss": {
      const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
      const loss = logNormalAmount(180, 0.7);
      return { id, icon: <TrendingDown className="h-4 w-4" />, text: `${prefix} lost -${formatAmount(loss)} on ${asset}`, timestamp: Date.now(), color: "text-destructive" };
    }
    case "withdrawal": {
      const amt = logNormalAmount(3500, 1.0);
      return { id, icon: <DollarSign className="h-4 w-4" />, text: `${prefix} withdrew ${formatAmount(amt)}`, timestamp: Date.now(), color: "text-warning" };
    }
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
  const [activity, setActivity] = useState<Activity | null>(null);
  const [visible, setVisible] = useState(false);
  const [displayTime, setDisplayTime] = useState("just now");
  const recentUsers = useRef<Set<number>>(new Set());
  const lastType = useRef<ActionType | null>(null);
  const lastTwoTypes = useRef<ActionType[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const activityCount = useRef(0);

  const pickUser = useCallback((): SimUser => {
    const pool = USERS.length;
    let idx: number;
    let attempts = 0;
    do {
      idx = Math.floor(Math.random() * pool);
      attempts++;
    } while (recentUsers.current.has(idx) && attempts < 30);

    recentUsers.current.add(idx);
    // Keep a larger window to avoid repeated users
    if (recentUsers.current.size > 35) {
      const first = recentUsers.current.values().next().value;
      if (first !== undefined) recentUsers.current.delete(first);
    }
    return USERS[idx];
  }, []);

  const showNext = useCallback(() => {
    const user = pickUser();
    const type = pickWeightedAction(lastType.current, lastTwoTypes.current);
    lastTwoTypes.current = [type, ...(lastTwoTypes.current.slice(0, 2))];
    lastType.current = type;
    activityCount.current++;
    const act = buildActivity(user, type, idCounter++);
    setActivity(act);
    setVisible(true);
    setDisplayTime("just now");

    // Vary display duration: 3.5–5.5s
    const showDuration = 3500 + Math.random() * 2000;
    setTimeout(() => setVisible(false), showDuration);
  }, [pickUser]);

  // Update relative timestamp while visible
  useEffect(() => {
    if (!visible || !activity) return;
    const iv = setInterval(() => setDisplayTime(timeAgoLabel(activity.timestamp)), 1000);
    return () => clearInterval(iv);
  }, [visible, activity]);

  // Schedule next activity after current hides with variable delay
  useEffect(() => {
    if (!visible && activity !== null) {
      // More natural timing: base 3-12s, occasionally longer pauses
      const isLongPause = Math.random() < 0.1; // 10% chance of longer gap
      const delay = isLongPause
        ? 12000 + Math.random() * 8000  // 12-20s long pause
        : 3000 + Math.random() * 9000;  // 3-12s normal
      timerRef.current = setTimeout(showNext, delay);
      return () => clearTimeout(timerRef.current);
    }
  }, [visible, activity, showNext]);

  // Initial kick-off with random delay
  useEffect(() => {
    const delay = 2000 + Math.random() * 4000;
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
