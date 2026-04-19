import { User } from '@/types/auth';
import { UserProfile } from '@/types/profile';

export function mapProfileToAuthUser(profile: UserProfile): User {
  return {
    id: profile._id,
    name: profile.name,
    email: profile.email,
    role: profile.role as 'user' | 'admin',
  };
}
