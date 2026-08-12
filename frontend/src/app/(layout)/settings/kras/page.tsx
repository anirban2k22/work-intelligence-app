import { KraManager } from "@/features/kras/KraManager";

export const metadata = {
  title: "Settings - KRAs | Proof",
  description: "Manage your Key Result Areas",
};

export default function KrasPage() {
  return <KraManager />;
}
