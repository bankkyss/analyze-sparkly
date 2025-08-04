import { Badge } from "@/components/ui/badge";
import { Zap, BarChart3, Clock } from "lucide-react";

interface DashboardHeaderProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

const statusConfig = {
  connected: { color: 'bg-success text-success-foreground', label: 'Connected' },
  disconnected: { color: 'bg-muted text-muted-foreground', label: 'Disconnected' },
  connecting: { color: 'bg-warning text-warning-foreground', label: 'Connecting...' }
};

export function DashboardHeader({ connectionStatus }: DashboardHeaderProps) {
  const config = statusConfig[connectionStatus];
  
  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Spark Analysis Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Modern On-Demand Vehicle Analysis Platform
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>Real-time Analytics</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('th-TH')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={config.color} variant="outline">
              <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
              {config.label}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}