import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChecklistPage() {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Checklist</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Checklist CRUD will be implemented in Task 7.
      </CardContent>
    </Card>
  );
}
