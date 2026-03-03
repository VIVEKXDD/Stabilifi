import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-secondary">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-10 md:h-24 md:flex-row md:py-6 md:px-6">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Stabilifi. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm hover:underline underline-offset-4">
            About
          </Link>
          <Link href="#" className="text-sm hover:underline underline-offset-4">
            Contact
          </Link>
          <Link href="#" className="text-sm hover:underline underline-offset-4">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
