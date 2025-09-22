export const metadata = {
    title: 'Dashboard'
}

export default function DashboardLayout({ children }) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
}