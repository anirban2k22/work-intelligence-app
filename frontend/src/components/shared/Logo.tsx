import Link from "next/link";

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
        <span className="text-xs font-black leading-none">PX</span>
      </div>
      <span className="font-bold text-sm tracking-tight text-foreground">
        Proof<em className="not-italic font-black italic text-foreground" style={{ fontStyle: "italic", letterSpacing: "-0.02em" }}>X</em>
      </span>
    </Link>
  );
}
