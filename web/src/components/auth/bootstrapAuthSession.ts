import { mapProfileToAuthUser } from '@/lib/auth/mapProfileToAuthUser';
import { UserProfile } from '@/types/profile';

interface BootstrapAuthSessionArgs {
  profile: UserProfile | null;
  setUser: (user: ReturnType<typeof mapProfileToAuthUser> | null) => void;
  setVerifying: (status: boolean) => void;
}

export function bootstrapAuthSession({
  profile,
  setUser,
  setVerifying,
}: BootstrapAuthSessionArgs) {
  if (profile) {
    setUser(mapProfileToAuthUser(profile));
  } else {
    setUser(null);
  }

  setVerifying(false);
}
