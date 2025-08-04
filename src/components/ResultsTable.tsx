import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Eye, Clock, Camera, Car } from "lucide-react";

export interface OneToOneResult {
  target_vehicle: string;
  other_vehicle: string;
  actual_common_cameras: number;
  actual_max_time_diff_sec: number;
  common_camera_names: string[];
}

interface ResultsTableProps {
  results: OneToOneResult[];
  analysisType: string;
  isVisible: boolean;
}

export function ResultsTable({ results, analysisType, isVisible }: ResultsTableProps) {
  if (!isVisible || results.length === 0) return null;

  const formatTimeDifference = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const exportToCSV = () => {
    const headers = ['Target Vehicle', 'Other Vehicle', 'Common Cameras', 'Max Time Diff (sec)', 'Camera Names'];
    const csvContent = [
      headers.join(','),
      ...results.map(row => [
        row.target_vehicle,
        row.other_vehicle,
        row.actual_common_cameras,
        row.actual_max_time_diff_sec,
        `"${row.common_camera_names.join('; ')}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${analysisType}_results_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>ผลการวิเคราะห์ 1-to-1 Relationship</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {results.length} relationships found
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    รถเป้าหมาย
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    รถอื่นที่สัมพันธ์
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <Camera className="h-4 w-4" />
                    กล้องร่วม
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <Clock className="h-4 w-4" />
                    ช่วงเวลาสูงสุด
                  </div>
                </TableHead>
                <TableHead>ชื่อกล้องที่พบ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {result.target_vehicle}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {result.other_vehicle}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default">
                      {result.actual_common_cameras}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge 
                            variant={result.actual_max_time_diff_sec < 1800 ? "success" : 
                                   result.actual_max_time_diff_sec < 3600 ? "warning" : "destructive"}
                          >
                            {formatTimeDifference(result.actual_max_time_diff_sec)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{result.actual_max_time_diff_sec} วินาที</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {result.common_camera_names.map((camera, idx) => (
                        <Badge key={idx} variant="outline" className="mr-1 mb-1 text-xs">
                          {camera}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Color coding:</span>
            <div className="flex items-center gap-2">
              <Badge variant="success">{'< 30m'}</Badge>
              <span className="text-xs">เวลาใกล้เคียง</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">{'30m - 1h'}</Badge>
              <span className="text-xs">เวลาปานกลาง</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{'> 1h'}</Badge>
              <span className="text-xs">เวลาห่างไกล</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}