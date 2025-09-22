import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Dashboard'
}

export default async function DashboardLayout({ children }) {
    const session = await getServerSession();

    if (!session) {
        redirect('/login');
    }

    return <div className="min-h-screen flex flex-col">{children}</div>;
}