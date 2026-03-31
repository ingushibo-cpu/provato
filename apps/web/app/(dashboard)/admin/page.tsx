import { Card, CardContent, CardHeader, CardTitle } from "@provato/ui";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Platform management and analytics.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">7</p>
            <p className="text-sm text-muted-foreground">
              Skill assessments awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">99.9%</p>
            <p className="text-sm text-muted-foreground">
              Uptime over the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
