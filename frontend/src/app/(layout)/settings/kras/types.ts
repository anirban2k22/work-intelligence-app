export type KraCategory = "Core" | "Growth" | "Operations" | "Leadership" | "Uncategorized";
export type KraFrequency = "Daily" | "Weekly" | "Monthly" | "Ad-hoc";

export interface KRA {
  id: string;
  name: string;
  description: string;
  weight: number; // 0 to 100
  color: string;
  icon: string;
  category: KraCategory;
  frequency: KraFrequency;
  isActive: boolean;
}
