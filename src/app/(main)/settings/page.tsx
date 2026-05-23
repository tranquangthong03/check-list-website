import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Settings details will be implemented in Task 9.
      </CardContent>
    </Card>
  );
}
