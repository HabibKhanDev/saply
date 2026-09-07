import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Surgical Supply - Medical Wholesale",
  description: "Order medical & surgical supplies. Fast WhatsApp checkout.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const s = await getSettings().catch(() => null);
  const businessName = s?.businessName ?? "Surgical Supply";
  const phone = s?.phone ?? "03179891214";
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased min-h-screen flex flex-col">
        <CartProvider>
          <header className="sticky top-0 z-40 bg-white border-b border-slate-200 print:hidden">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-2 min-w-0">
                {s?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.logoUrl}
                    alt="logo"
                    className="h-9 w-9 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="h-9 w-9 rounded bg-emerald-600 text-white grid place-items-center font-bold shrink-0">
                    +
                  </div>
                )}
                <span className="font-semibold text-slate-900 truncate">
                  {businessName}
                </span>
              </Link>
              <nav className="flex items-center gap-1 text-sm shrink-0">
                <Link
                  href="/catalogue"
                  className="rounded-md px-3 py-2 hover:bg-slate-100"
                >
                  Shop
                </Link>
                <a
                  href={`tel:${phone}`}
                  className="rounded-md px-3 py-2 hover:bg-slate-100 text-slate-600 hidden sm:inline"
                >
                  📞 {phone}
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 print:hidden">
            © {new Date().getFullYear()} {businessName}
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
