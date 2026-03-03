'use client';

import StabilifiDashboard from '@/components/StabilifiDashboard';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
    const { user } = useAuth();

    // The middleware and AuthProvider handle loading and redirection.
    // We can assume user is available here.
    if (!user) {
        // This is a fallback, should not be reached in normal flow.
        return null;
    }

    return <StabilifiDashboard />;
}
