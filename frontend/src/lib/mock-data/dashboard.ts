export const dashboardMockData = {
  metrics: {
    todayTime: "6h 15m",
    weekTime: "32h 45m",
    pendingReviews: 3,
    activeProjects: 4,
    activeStakeholders: 12,
    totalKras: 6,
  },
  workDistribution: [
    { name: "Stakeholder Management", value: 40, color: "var(--color-blue-500)" },
    { name: "QA Testing", value: 25, color: "var(--color-purple-500)" },
    { name: "Documentation", value: 20, color: "var(--color-amber-500)" },
    { name: "Client Meetings", value: 15, color: "var(--color-green-500)" },
  ],
  timeline: [
    { id: "1", time: "09:00 - 10:30", title: "Stakeholder Meeting", description: "Aligned with VP of Engineering on Q3 OKRs", color: "blue" },
    { id: "2", time: "10:30 - 12:00", title: "QA Testing", description: "Tested new authentication flows", color: "purple" },
    { id: "3", time: "12:00 - 13:00", title: "Documentation", description: "Drafted API guidelines", color: "amber" },
    { id: "4", time: "14:00 - 15:30", title: "Client Meetings", description: "Onboarding session with new Enterprise client", color: "green" },
  ],
  activity: [
    { id: "1", type: "review", text: "Reviewed TiE mentor onboarding", timestamp: "2 hours ago" },
    { id: "2", type: "kra", text: "Updated KRA: Platform Architecture", timestamp: "4 hours ago" },
    { id: "3", type: "ticket", text: "Validated Engineering Ticket #402", timestamp: "Yesterday" },
    { id: "4", type: "doc", text: "Completed API Documentation", timestamp: "Yesterday" },
  ],
  projects: [
    { id: "p1", name: "Project Phoenix", status: "Active", progress: 78, color: "blue" },
    { id: "p2", name: "Atlas Migration", status: "At Risk", progress: 45, color: "amber" },
    { id: "p3", name: "Design System 2.0", status: "Active", progress: 92, color: "green" },
    { id: "p4", name: "Q3 Planning", status: "On Hold", progress: 15, color: "gray" },
  ],
  stakeholders: [
    { id: "s1", name: "David Chen", avatar: "DC", hours: "12.5h", sessions: 8, role: "VP Engineering" },
    { id: "s2", name: "Sarah Smith", avatar: "SS", hours: "8.0h", sessions: 5, role: "Product Manager" },
    { id: "s3", name: "Mike Johnson", avatar: "MJ", hours: "6.5h", sessions: 3, role: "Design Lead" },
  ],
  insights: [
    { id: "i1", text: "You spent 42% of your time on stakeholder management this week.", type: "info" },
    { id: "i2", text: "Documentation time decreased by 18% compared to last week.", type: "decrease" },
    { id: "i3", text: "QA activities increased this week, indicating a stabilization phase.", type: "increase" },
  ],
};
