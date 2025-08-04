import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Clock, Activity } from "lucide-react";

interface ProgressSectionProps {
  progress: number;
  status: 'idle' | 'processing' | 'complete' | 'failed';
  jobId?: string;
  isVisible: boolean;
}

const statusConfig = {
  idle: { color: 'bg-muted text-muted-foreground', label: 'พร้อม', icon: Clock },
  processing: { color: 'bg-info text-info-foreground', label: 'กำลังประมวลผล', icon: Activity },
  complete: { color: 'bg-success text-success-foreground', label: 'เสร็จสิ้น', icon: BarChart3 },
  failed: { color: 'bg-destructive text-destructive-foreground', label: 'ล้มเหลว', icon: Activity }
};

export function ProgressSection({ progress, status, jobId, isVisible }: ProgressSectionProps) {
  if (!isVisible) return null;

  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Job Progress</CardTitle>
          </div>
          <Badge className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        {jobId && (
          <p className="text-sm text-muted-foreground font-mono">
            Job ID: {jobId}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress 
            value={progress} 
            variant={status === 'complete' ? 'success' : status === 'failed' ? 'warning' : 'default'}
            showPercentage 
            size="lg"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>ความคืบหนา</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}