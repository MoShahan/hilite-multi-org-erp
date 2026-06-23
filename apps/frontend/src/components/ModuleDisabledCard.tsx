import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ModuleDisabledCardProps = {
  title: string;
  description: string;
};

export const ModuleDisabledCard = ({
  title,
  description,
}: ModuleDisabledCardProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};
