import { getUserById } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import UserRole from './UserRole';

async function Page() {
    const { userId } = auth();
    if (!userId) redirect("/sign-in");

    const user = await getUserById(userId);

    return <UserRole user={user} />;
}

export default Page;