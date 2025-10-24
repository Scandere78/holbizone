import { getAvailableUsersForChat } from "@/actions/message.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import NewConversationButton from "@/components/messages/NewConversationButton";

export default async function NewMessagePage() {
  const availableUsers = await getAvailableUsersForChat();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Nouvelle conversation
            </h1>
            <p className="text-muted-foreground">
              Commencez une conversation avec vos amis (follow mutuel)
            </p>
          </div>
        </div>
      </div>

      {availableUsers.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mb-4 text-6xl">�</div>
          <h3 className="text-xl font-semibold mb-2">
            Aucun ami disponible
          </h3>
          <p className="text-muted-foreground mb-4">
            Pour pouvoir envoyer des messages, vous devez avoir des amis (follow mutuel).
            Suivez des utilisateurs et assurez-vous qu&apos;ils vous suivent en retour !
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            <Link href="/explorer">Trouver des amis</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <span className="text-lg">💙</span>
              Ces personnes sont vos amis (vous vous suivez mutuellement)
            </p>
          </div>
          {availableUsers.map((user) => (
            <Card
              key={user.id}
              className="p-4 hover:shadow-lg transition-all border-red-100 dark:border-red-950/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-red-500/20">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold">
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    {user.username && (
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </div>

                <NewConversationButton userId={user.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
