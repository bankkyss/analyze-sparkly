import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Terminal, Download, Trash2, Activity, CheckCircle, XCircle, Info } from "lucide-react";

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'processing' | 'data_chunk' | 'complete' | 'failed' | 'info';
  data?: any;
}

interface LogsSectionProps {
  logs: LogEntry[];
  onClear: () => void;
  isVisible: boolean;
}

const logTypeConfig = {
  processing: { color: 'bg-info text-info-foreground', icon: Activity, label: 'Processing' },
  data_chunk: { color: 'bg-muted text-muted-foreground', icon: Info, label: 'Data' },
  complete: { color: 'bg-success text-success-foreground', icon: CheckCircle, label: 'Success' },
  failed: { color: 'bg-destructive text-destructive-foreground', icon: XCircle, label: 'Error' },
  info: { color: 'bg-muted text-muted-foreground', icon: Info, label: 'Info' }
};

export function LogsSection({ logs, onClear, isVisible }: LogsSectionProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (shouldAutoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs, shouldAutoScroll]);

  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShouldAutoScroll(isNearBottom);
  };

  const exportLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toLocaleString('th-TH')}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle>สถานะและผลลัพธ์ของ Job</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {logs.length} entries
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={logs.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              disabled={logs.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea 
          className="h-96 w-full rounded-md border bg-muted/30 p-4"
          ref={scrollAreaRef}
          onScrollCapture={handleScroll}
        >
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Terminal className="h-8 w-8 mb-2" />
                <p>ยังไม่มี logs</p>
                <p className="text-xs">logs จะแสดงเมื่อเริ่มการวิเคราะห์</p>
              </div>
            ) : (
              logs.map((log, index) => {
                const config = logTypeConfig[log.type];
                const Icon = config.icon;
                
                return (
                  <div key={log.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Badge className={`${config.color} shrink-0`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span className="font-mono">
                            {log.timestamp.toLocaleTimeString('th-TH')}
                          </span>
                        </div>
                        <div 
                          className="text-sm leading-relaxed break-words"
                          dangerouslySetInnerHTML={{ __html: log.message }}
                        />
                        {log.data && (
                          <pre className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                    {index < logs.length - 1 && <Separator />}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        {!shouldAutoScroll && (
          <div className="mt-2 text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShouldAutoScroll(true)}
            >
              Scroll to bottom
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}