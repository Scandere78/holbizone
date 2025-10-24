import { getUnreadMessagesCount } from "@/actions/message.action";
import { Badge } from "@/components/ui/badge";

export default async function MessageBadge() {
  const count = await getUnreadMessagesCount();

  if (count === 0) return null;

  return (
    <Badge
      variant="destructive"
      className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 border-0 shadow-lg"
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
