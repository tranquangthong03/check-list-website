import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LinksPage() {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Quick links management will be implemented in Task 8.
      </CardContent>
    </Card>
  );
}
