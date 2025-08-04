import { useState, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AnalysisForm, type AnalysisFormData } from "@/components/AnalysisForm";
import { ProgressSection } from "@/components/ProgressSection";
import { LogsSection, type LogEntry } from "@/components/LogsSection";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | undefined>();
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'failed'>('idle');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [resultsData, setResultsData] = useState<any[]>([]);

  const addLog = useCallback((message: string, type: LogEntry['type'], data?: any) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      message,
      type,
      data
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setResultsData([]);
  }, []);

  // Simulate WebSocket functionality for demo
  const simulateAnalysis = useCallback(async (formData: AnalysisFormData) => {
    const mockJobId = `job_${Date.now()}`;
    setJobId(mockJobId);
    setStatus('processing');
    setProgress(0);
    setConnectionStatus('connecting');
    
    addLog(`Sending request for <strong>${formData.analysisType}</strong>...`, 'info');
    
    // Simulate connection
    setTimeout(() => {
      setConnectionStatus('connected');
      addLog(`Job started with ID: <strong>${mockJobId}</strong>. WebSocket connection established.`, 'processing');
    }, 500);

    // Simulate progress updates
    const progressSteps = [10, 25, 40, 60, 75, 85, 95, 100];
    const chunks = [
      { vehicles: ['กข1234', 'คง5678'], confidence: 0.95 },
      { vehicles: ['จฉ9012', 'ซฌ3456'], confidence: 0.88 },
      { vehicles: ['ดต7890', 'นบ2345'], confidence: 0.92 }
    ];

    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const currentProgress = progressSteps[i];
      setProgress(currentProgress);
      
      if (i < chunks.length) {
        setResultsData(prev => [...prev, chunks[i]]);
        addLog(`Received chunk. Total results so far: <strong>${i + 1}</strong>`, 'data_chunk', chunks[i]);
      } else if (currentProgress === 100) {
        setStatus('complete');
        addLog('Analysis complete!', 'complete');
        addLog(`<strong>Final Aggregated Results (${chunks.length} items):</strong><br><pre>${JSON.stringify(chunks, null, 2)}</pre>`, 'complete');
        setConnectionStatus('disconnected');
        toast({
          title: "การวิเคราะห์เสร็จสิ้น",
          description: `พบผลลัพธ์ทั้งหมด ${chunks.length} รายการ`,
        });
      } else {
        addLog(`Processing progress: ${currentProgress}%`, 'processing');
      }
    }
  }, [addLog]);

  const handleFormSubmit = useCallback(async (formData: AnalysisFormData) => {
    setIsProcessing(true);
    clearLogs();
    
    try {
      await simulateAnalysis(formData);
    } catch (error) {
      setStatus('failed');
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'failed');
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเริ่มการวิเคราะห์ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [simulateAnalysis, addLog, clearLogs]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader connectionStatus={connectionStatus} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Analysis Form */}
          <AnalysisForm 
            onSubmit={handleFormSubmit}
            isProcessing={isProcessing}
          />

          {/* Progress Section */}
          <ProgressSection 
            progress={progress}
            status={status}
            jobId={jobId}
            isVisible={status !== 'idle'}
          />

          {/* Logs Section */}
          <LogsSection 
            logs={logs}
            onClear={clearLogs}
            isVisible={logs.length > 0}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
