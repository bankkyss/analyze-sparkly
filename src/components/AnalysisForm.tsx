import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnalysisCard } from "./AnalysisCard";
import { Separator } from "@/components/ui/separator";
import { Play, Settings } from "lucide-react";

interface AnalysisFormProps {
  onSubmit: (data: AnalysisFormData) => void;
  isProcessing: boolean;
}

export interface AnalysisFormData {
  analysisType: string;
  startTime: string;
  endTime: string;
  cameraIds: string[];
  numCameras: number;
  timeRange?: number;
  targetLicensePlate?: string;
}

const analysisTypes = [
  {
    type: "graph",
    title: "Group Analysis",
    description: "หาขบวนรถและวิเคราะห์กลุ่มพฤติกรรม (ระบบจะวิเคราะห์รถที่เดินทางด้วยกันเป็นกลุ่ม)"
  },
  {
    type: "one_to_one", 
    title: "1-to-1 Relationship",
    description: "หาความสัมพันธ์แบบ 1:1 ระหว่างรถเป้าหมายกับรถอื่นๆ (ต้องระบุทะเบียนรถเป้าหมาย)"
  },
  {
    type: "area",
    title: "Area Analysis", 
    description: "วิเคราะห์พื้นที่และรูปแบบการเดินทางในบริเวณที่กำหนด"
  }
];

export function AnalysisForm({ onSubmit, isProcessing }: AnalysisFormProps) {
  const [formData, setFormData] = useState<AnalysisFormData>({
    analysisType: "graph",
    startTime: "",
    endTime: "",
    cameraIds: [],
    numCameras: 3,
    timeRange: 90,
    targetLicensePlate: ""
  });

  useEffect(() => {
    // Set default date range (last 24 hours)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    
    const toLocalISOString = (date: Date) => {
      const tzoffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
      return localISOTime;
    };

    setFormData(prev => ({
      ...prev,
      startTime: toLocalISOString(startDate),
      endTime: toLocalISOString(endDate)
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startTime || !formData.endTime) {
      alert("กรุณากรอกเวลาเริ่มต้นและสิ้นสุด");
      return;
    }

    if (formData.analysisType === "one_to_one" && !formData.targetLicensePlate) {
      alert("กรุณาระบุ 'ทะเบียนรถเป้าหมาย' สำหรับ 1-to-1 Analysis");
      return;
    }

    onSubmit(formData);
  };

  const handleCameraIdsChange = (value: string) => {
    const ids = value ? value.split(',').map(id => id.trim()).filter(id => id) : [];
    setFormData(prev => ({ ...prev, cameraIds: ids }));
  };

  const showTimeRange = formData.analysisType === "graph" || formData.analysisType === "one_to_one";
  const showTargetPlate = formData.analysisType === "one_to_one";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>Analysis Configuration</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Analysis Type Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">เลือกประเภทการวิเคราะห์</Label>
            <div className="grid gap-4 md:grid-cols-3">
              {analysisTypes.map((type) => (
                <AnalysisCard
                  key={type.type}
                  type={type.type}
                  title={type.title}
                  description={type.description}
                  selected={formData.analysisType === type.type}
                  onSelect={() => setFormData(prev => ({ ...prev, analysisType: type.type }))}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Time Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">เวลาเริ่มต้น (Start Time)</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">เวลาสิ้นสุด (End Time)</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="font-mono"
              />
            </div>
          </div>

          {/* Camera and Analysis Parameters */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cameraIds">ID กล้อง (คั่นด้วยจุลภาค)</Label>
              <Input
                id="cameraIds"
                placeholder="เช่น cam-01,cam-02,cam-03"
                value={formData.cameraIds.join(',')}
                onChange={(e) => handleCameraIdsChange(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numCameras">จำนวนกล้องขั้นต่ำที่ต้องเจอ</Label>
              <Input
                id="numCameras"
                type="number"
                min="1"
                placeholder="เช่น 3"
                value={formData.numCameras}
                onChange={(e) => setFormData(prev => ({ ...prev, numCameras: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Conditional Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            {showTimeRange && (
              <div className="space-y-2">
                <Label htmlFor="timeRange">กรอบเวลาที่ให้เจอ (นาที)</Label>
                <Input
                  id="timeRange"
                  type="number"
                  min="1"
                  placeholder="เช่น 90"
                  value={formData.timeRange || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeRange: parseInt(e.target.value) || undefined }))}
                />
              </div>
            )}
            {showTargetPlate && (
              <div className="space-y-2">
                <Label htmlFor="targetLicensePlate">ทะเบียนรถเป้าหมาย</Label>
                <Input
                  id="targetLicensePlate"
                  placeholder="เช่น กข1234"
                  value={formData.targetLicensePlate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetLicensePlate: e.target.value }))}
                  className="font-mono"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            size="lg"
            disabled={isProcessing}
          >
            <Play className="h-4 w-4 mr-2" />
            {isProcessing ? "กำลังประมวลผล..." : "เริ่มการวิเคราะห์"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}