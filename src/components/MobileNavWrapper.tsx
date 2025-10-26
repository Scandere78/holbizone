"use client";

import { useUser } from "@clerk/nextjs";
import MobileNavbar from "./MobileNavbar";
import MobileSignInBar from "./MobileSignInBar";
import { SerializedUser } from "@/types/user";
import { useEffect, useState } from "react";

interface MobileNavWrapperProps {
  initialUser: SerializedUser | null;
}

export default function MobileNavWrapper({ initialUser }: MobileNavWrapperProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const [serializedUser, setSerializedUser] = useState<SerializedUser | null>(initialUser);

  useEffect(() => {
    console.log("MobileNavWrapper - isLoaded:", isLoaded, "clerkUser:", clerkUser);
    if (isLoaded && clerkUser) {
      // Sérialiser l'utilisateur Clerk
      const newUser = {
        id: clerkUser.id,
        username: clerkUser.username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        fullName: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
        emailAddresses: clerkUser.emailAddresses.map(email => ({
          emailAddress: email.emailAddress
        }))
      };
      console.log("MobileNavWrapper - Setting user:", newUser);
      setSerializedUser(newUser);
    } else if (isLoaded && !clerkUser) {
      console.log("MobileNavWrapper - No user, setting to null");
      setSerializedUser(null);
    }
  }, [clerkUser, isLoaded]);

  // Attendre que Clerk soit chargé
  if (!isLoaded) {
    console.log("MobileNavWrapper - Not loaded yet");
    return null;
  }

  console.log("MobileNavWrapper - Rendering with user:", serializedUser);
  
  // Afficher la navigation appropriée
  return serializedUser ? (
    <MobileNavbar user={serializedUser} />
  ) : (
    <MobileSignInBar />
  );
}
