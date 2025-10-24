import { getUserConversations } from "@/actions/message.action";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import ConversationList from "@/components/messages/ConversationList";

async function MessagesPage() {
  const conversations = await getUserConversations();

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Liste des conversations */}
        <div className="md:col-span-1 border-r border-red-100 dark:border-red-950/50 pr-4 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Messages
            </h2>
            <Button
              size="sm"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              asChild
            >
              <Link href="/messages/new">
                <PlusIcon className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <ConversationList conversations={conversations} />
        </div>

        {/* Zone de sélection - Desktop only */}
        <div className="hidden md:flex md:col-span-2 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="mb-4 text-6xl">💬</div>
            <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
            <p className="text-sm">Choisissez une conversation ou créez-en une nouvelle</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;