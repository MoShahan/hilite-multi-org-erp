import { Card, CardContent } from "@/components/ui/card";

export const PageSkeleton = () => {
  return (
    <Card className="animate-pulse shadow-sm">
      <CardContent className="space-y-4 pt-6">
        <div className="h-6 w-1/3 rounded-md bg-muted" />
        <div className="h-4 w-2/3 rounded-md bg-muted" />
        <div className="h-24 rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
};
