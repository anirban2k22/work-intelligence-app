export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how and when you receive alerts.
        </p>
      </div>
      <div className="border border-dashed rounded-lg h-64 flex items-center justify-center text-muted-foreground bg-muted/20">
        Notification Settings (Coming Soon)
      </div>
    </div>
  );
}
