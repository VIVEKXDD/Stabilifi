'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, BarChart2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function Navbar() {
  const auth = useAuth();
  const { user, loading } = auth;

  const handleSignOut = async () => {
    await auth.logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <BarChart2 className="h-6 w-6 text-primary" />
          <span>Stabilifi</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {/* Add more nav links here if needed */}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {!loading &&
              (user ? (
                <>
                  <span className="text-sm text-muted-foreground">Welcome, {user.displayName || user.email}</span>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button onClick={handleSignOut}>Sign Out</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              ))}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                  <BarChart2 className="h-6 w-6 text-primary" />
                  <span>Stabilifi</span>
                </Link>
                {/* Add more nav links for mobile here if needed */}
                <div className="grid gap-2">
                  {!loading &&
                    (user ? (
                      <>
                         <span className="text-sm text-muted-foreground px-4 py-2">Welcome, {user.displayName || user.email}</span>
                        <Button variant="ghost" asChild>
                          <Link href="/dashboard">Dashboard</Link>
                        </Button>
                        <Button onClick={handleSignOut}>Sign Out</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" asChild>
                          <Link href="/login">Log In</Link>
                        </Button>
                        <Button asChild>
                          <Link href="/signup">Sign Up</Link>
                        </Button>
                      </>
                    ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
