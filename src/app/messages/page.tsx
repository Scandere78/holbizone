import { getUserConversations } from '@/actions/message.action';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import ConversationList from '@/components/messages/ConversationList';
import { logger } from '@/lib/logger';
import { getDbUserId } from '@/actions/user.action';
import { notFound } from 'next/navigation';

/**
 * Page Messages - Affiche la liste des conversations
 */
async function MessagesPage() {
  try {
    // Vérifier que l'utilisateur est authentifié
    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({
        context: 'MessagesPage',
        action: 'Unauthorized access attempt',
      });
      notFound();
    }

    // Récupérer les conversations de l'utilisateur
    const conversations = await getUserConversations();

    logger.info({
      context: 'MessagesPage',
      action: 'Conversations loaded',
      details: { count: conversations.length, userId },
    });

    return (
      <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {/* Liste des conversations */}
          <div className="md:col-span-1 border-r border-red-100 dark:border-red-950/50 pr-4 overflow-hidden flex flex-col">
            {/* En-tête avec titre et bouton nouveau */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Messages
              </h2>
              <Button
                size="sm"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link href="/messages/new" className="flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Nouveau</span>
                </Link>
              </Button>
            </div>

            {/* Liste des conversations avec recherche et badges */}
            <ConversationList conversations={conversations} currentUserId={userId} />
          </div>

          {/* Zone de sélection - Desktop only */}
          <div className="hidden md:flex md:col-span-2 items-center justify-center text-muted-foreground">
            <div className="text-center space-y-4">
              <div className="text-6xl">💬</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Sélectionnez une conversation
              </h3>
              <p className="text-sm text-muted-foreground">
                Choisissez une conversation ou créez-en une nouvelle
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    logger.error({
      context: 'MessagesPage',
      action: 'Failed to load messages page',
      error,
    });

    notFound();
  }
}

export default MessagesPage;