"use client";

import { getNotifications, markNotificationsAsRead, markAllNotificationsAsRead } from "@/actions/notification.action";
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { BellIcon, CheckCheckIcon, HeartIcon, Loader2, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

type Notifications = Awaited<ReturnType<typeof getNotifications>>;
type Notification = Notifications[number];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "LIKE":
      return <HeartIcon className="size-5 text-red-500 fill-red-500" />;
    case "COMMENT":
      return <MessageCircleIcon className="size-5 text-blue-500" />;
    case "FOLLOW":
      return <UserPlusIcon className="size-5 text-green-500" />;
    default:
      return null;
  }
};

const getNotificationText = (type: string) => {
  switch (type) {
    case "LIKE":
      return "a aimé votre post";
    case "COMMENT":
      return "a commenté votre post";
    case "FOLLOW":
      return "a commencé à vous suivre";
    default:
      return "";
  }
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(data);

        // Marquer automatiquement comme lu quand on arrive sur la page
        const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
        if (unreadIds.length > 0) {
          await markNotificationsAsRead(unreadIds);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Erreur lors du chargement des notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success("Toutes les notifications ont été marquées comme lues ✅");
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  if (isLoading) return <NotificationsSkeleton />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border-red-100 dark:border-red-950/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-pink-500/10 dark:from-red-950/30 dark:via-orange-950/30 dark:to-pink-950/30 border-b border-red-100 dark:border-red-950/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="h-6 w-6 text-red-600" />
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Notifications
              </CardTitle>
              {unreadCount > 0 && (
                <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full">
                  {unreadCount} {unreadCount === 1 ? "nouvelle" : "nouvelles"}
                </span>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
                className="border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                {isMarkingAllRead ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Marquage...
                  </>
                ) : (
                  <>
                    <CheckCheckIcon className="h-4 w-4 mr-2" />
                    Tout marquer comme lu
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-20rem)] md:h-[calc(100vh-16rem)]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <BellIcon className="h-20 w-20 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Aucune notification
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Vous serez notifié lorsque quelqu'un aimera, commentera ou suivra votre contenu
                </p>
              </div>
            ) : (
              <div className="divide-y divide-red-100 dark:divide-red-950/50">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={
                      notification.type === "FOLLOW"
                        ? `/profile/${notification.creator.username}`
                        : `/post/${notification.postId}`
                    }
                    className={`block p-4 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors ${
                      !notification.read ? "bg-red-50/30 dark:bg-red-950/5 border-l-4 border-red-500" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 ring-2 ring-red-500/20 flex-shrink-0">
                        <AvatarImage src={notification.creator.image || "/avatar.png"} />
                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
                          {notification.creator.name?.[0] || notification.creator.username?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getNotificationIcon(notification.type)}
                              <p className="text-sm">
                                <span className="font-semibold">
                                  {notification.creator.name || notification.creator.username}
                                </span>
                                {" "}
                                <span className="text-muted-foreground">
                                  {getNotificationText(notification.type)}
                                </span>
                              </p>
                            </div>

                            {notification.post &&
                              (notification.type === "LIKE" || notification.type === "COMMENT") && (
                                <div className="mt-2 space-y-2">
                                  <div className="text-sm text-muted-foreground rounded-lg p-3 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/10 dark:to-orange-950/10 border border-red-100 dark:border-red-900">
                                    <p className="line-clamp-2">{notification.post.content}</p>
                                    {notification.post.image && (
                                      <img
                                        src={notification.post.image}
                                        alt="Post content"
                                        className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover border border-red-100 dark:border-red-900"
                                      />
                                    )}
                                  </div>

                                  {notification.type === "COMMENT" && notification.comment && (
                                    <div className="text-sm p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg border border-blue-100 dark:border-blue-900">
                                      <p className="line-clamp-3">{notification.comment.content}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotificationsPage;