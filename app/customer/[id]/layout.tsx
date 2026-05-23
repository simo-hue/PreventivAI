import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-64 border-r border-slate-200 bg-white md:min-h-screen shrink-0 flex flex-col">
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <Link href={`/customer/${id}`} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Italians quote it better Logo" className="h-14 w-auto object-contain" />
          </Link>
        </div>
        <div className="flex-1"></div>
        <div className="p-4 border-t border-slate-200 hidden md:block">
           <form action="/auth/signout" method="post">
              <Button type="submit" variant="ghost" className="w-full justify-start text-slate-500 hover:text-slate-900">
                <LogOut className="mr-2 h-4 w-4" />
                Esci
              </Button>
           </form>
        </div>
      </aside>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
