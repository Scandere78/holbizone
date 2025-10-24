import { Badge } from "@/components/ui/badge";
import { getUnreadNotificationCount } from "@/actions/notification.action";

// ✅ Pas de "use client" - c'est un Server Component
async function NotificationBadge() {
  const count = await getUnreadNotificationCount();

  if (count === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-1 text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 border-0 animate-pulse shadow-lg"
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}

export default NotificationBadge;