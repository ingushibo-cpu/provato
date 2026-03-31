import { Card, CardContent, CardHeader, CardTitle } from "@provato/ui";
import { Users, FolderOpen, DollarSign, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your Provato activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Projects", value: "3", hint: "+1 from last month", icon: FolderOpen },
          { label: "Verified Talents", value: "128", hint: "+12 this week", icon: Users },
          { label: "Total Revenue", value: "$45,230", hint: "+20% from last month", icon: DollarSign },
          { label: "Match Rate", value: "94%", hint: "Based on verified scores", icon: TrendingUp },
        ].map(({ label, value, hint, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
