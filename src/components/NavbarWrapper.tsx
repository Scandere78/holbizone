"use client";

import { useUser } from "@clerk/nextjs";
import DesktopNavbar from "./DesktopNavbar";
import { SerializedUser } from "@/types/user";
import { useEffect, useState } from "react";

interface NavbarWrapperProps {
  initialUser: SerializedUser | null;
  unreadMessages: number;
  unreadNotifications: number;
}

export default function NavbarWrapper({ 
  initialUser, 
  unreadMessages, 
  unreadNotifications 
}: NavbarWrapperProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const [serializedUser, setSerializedUser] = useState<SerializedUser | null>(initialUser);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      // Sérialiser l'utilisateur Clerk
      setSerializedUser({
        id: clerkUser.id,
        username: clerkUser.username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        fullName: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
        emailAddresses: clerkUser.emailAddresses.map(email => ({
          emailAddress: email.emailAddress
        }))
      });
    } else if (isLoaded && !clerkUser) {
      setSerializedUser(null);
    }
  }, [clerkUser, isLoaded]);

  return (
    <DesktopNavbar 
      user={serializedUser}
      unreadMessages={unreadMessages}
      unreadNotifications={unreadNotifications}
    />
  );
}
