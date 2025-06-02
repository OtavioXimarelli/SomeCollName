import { Button } from "@/components/ui/button";
import { Home, Settings } from "lucide-react";
import Link from "next/link";

export default function CouplePageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  // Determine if current path is edit or view page
  // This is a simplified check. For more robust solution, use usePathname hook in a client component wrapper if needed.
  // However, for a server component layout, direct path check is tricky. Let's assume we want these links always.
  
  return (
    <div className="container mx-auto px-4 py-8">
       <nav className="mb-6 flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href={`/couple/${params.id}`}>
            <Home className="mr-2 h-4 w-4" /> View Our Space
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/couple/${params.id}/edit`}>
            <Settings className="mr-2 h-4 w-4" /> Customize
          </Link>
        </Button>
      </nav>
      {children}
    </div>
  );
}
