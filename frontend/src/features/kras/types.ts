export type KRA = {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage (0-100)
  color: string;
  icon: string;
  category: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  active: boolean;
};

export const MOCK_KRAS: KRA[] = [
  {
    id: "1",
    name: "Platform Architecture",
    description: "Own end-to-end delivery of the new platform.",
    weight: 40,
    color: "blue",
    icon: "layers",
    category: "Engineering",
    frequency: "Weekly",
    active: true,
  },
  {
    id: "2",
    name: "Stakeholder Management",
    description: "Keep all key stakeholders aligned and informed.",
    weight: 30,
    color: "amber",
    icon: "users",
    category: "Communication",
    frequency: "Weekly",
    active: true,
  },
  {
    id: "3",
    name: "Team Health",
    description: "Ensure the team is motivated, unblocked, and growing.",
    weight: 20,
    color: "green",
    icon: "heart",
    category: "Management",
    frequency: "Monthly",
    active: true,
  },
  {
    id: "4",
    name: "Discovery Loop",
    description: "Continuous product discovery.",
    weight: 10,
    color: "gray",
    icon: "search",
    category: "Product",
    frequency: "Monthly",
    active: false,
  },
];
