export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account profile and display settings.
        </p>
      </div>
      <div className="border border-dashed rounded-lg h-64 flex items-center justify-center text-muted-foreground bg-muted/20">
        Profile Settings (Coming Soon)
      </div>
    </div>
  );
}
