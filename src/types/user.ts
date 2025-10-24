export type SerializedUser = {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
  emailAddresses: {
    emailAddress: string;
  }[];
} | null;