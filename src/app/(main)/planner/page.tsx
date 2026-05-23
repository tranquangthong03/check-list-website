import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlannerPage() {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Daily Planner</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Planner CRUD will be implemented in Task 6.
      </CardContent>
    </Card>
  );
}
