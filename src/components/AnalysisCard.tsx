import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Brain, Map } from "lucide-react";

interface AnalysisCardProps {
  type: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const iconMap = {
  graph: Brain,
  one_to_one: Activity,
  area: Map,
};

export function AnalysisCard({ type, title, description, selected, onSelect }: AnalysisCardProps) {
  const Icon = iconMap[type as keyof typeof iconMap] || Activity;
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
        selected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {selected && (
            <Badge variant="default" className="bg-primary">
              Selected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}