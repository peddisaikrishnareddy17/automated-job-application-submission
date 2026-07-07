import ProfileForm from '@/components/ProfileForm';

export const metadata = {
  title: 'Profile',
};

export default function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>
      <ProfileForm />
    </div>
  );
}
