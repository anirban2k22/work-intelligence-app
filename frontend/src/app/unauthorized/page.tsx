import Link from "next/link";
import { ShieldX } from "lucide-react";

export const metadata = { title: "Unauthorized | ProofX" };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#f3f2f2] flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-sm text-gray-500 mb-8">
          You don&apos;t have permission to view this page. Please contact your administrator.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#1a1a1a] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-black transition-colors"
        >
          Go to My Dashboard
        </Link>
      </div>
    </div>
  );
}
