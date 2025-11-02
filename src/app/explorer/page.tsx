import { getAllUsers } from "@/actions/user.action";
import UserSearchList from "@/components/search/UserSearchList";

/**
 * Page Explorer - Découvrir tous les utilisateurs
 */
export default async function ExplorerPage() {
  const users = await getAllUsers();

  return (
    <div className="min-h-screen bg-background">
      {/* Container principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ✅ Passer les utilisateurs au composant client */}
        <UserSearchList initialUsers={users} />
      </div>
    </div>
  );
}