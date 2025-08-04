import { useState, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AnalysisForm, type AnalysisFormData } from "@/components/AnalysisForm";
import { ProgressSection } from "@/components/ProgressSection";
import { LogsSection, type LogEntry } from "@/components/LogsSection";
import { ResultsTable, type OneToOneResult } from "@/components/ResultsTable";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | undefined>();
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'failed'>('idle');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [resultsData, setResultsData] = useState<OneToOneResult[]>([]);
  const [currentAnalysisType, setCurrentAnalysisType] = useState<string>('graph');

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
    setCurrentAnalysisType(formData.analysisType);
    
    addLog(`Sending request for <strong>${formData.analysisType}</strong>...`, 'info');
    
    // Simulate connection
    setTimeout(() => {
      setConnectionStatus('connected');
      addLog(`Job started with ID: <strong>${mockJobId}</strong>. WebSocket connection established.`, 'processing');
    }, 500);

    // Simulate progress updates
    const progressSteps = [10, 25, 40, 60, 75, 85, 95, 100];
    
    // Different data structures based on analysis type
    const oneToOneChunks: OneToOneResult[] = [
      {
        target_vehicle: "กม6671",
        other_vehicle: "3กล9186",
        actual_common_cameras: 3,
        actual_max_time_diff_sec: 4323,
        common_camera_names: ["4_มห_หนองเอี่ยน_เข้า", "4_มค_ประชาอุทิศ_เข้า", "4_มห_โนนยางพระไกรศรีสุข_เข้า"]
      },
      {
        target_vehicle: "กม6671",
        other_vehicle: "3ขด9516",
        actual_common_cameras: 3,
        actual_max_time_diff_sec: 5001,
        common_camera_names: ["4_มห_หนองเอี่ยน_เข้า", "4_มค_ประชาอุทิศ_ออก", "4_มห_โนนยางพระไกรศรีสุข_เข้า"]
      },
      {
        target_vehicle: "กม6671",
        other_vehicle: "3ฒย3481",
        actual_common_cameras: 3,
        actual_max_time_diff_sec: 4933,
        common_camera_names: ["4_มห_หนองเอี่ยน_เข้า", "4_มค_ประชาอุทิศ_เข้า", "4_มห_โนนยางพระไกรศรีสุข_เข้า"]
      },
      {
        target_vehicle: "กม6671",
        other_vehicle: "5กถ8983",
        actual_common_cameras: 3,
        actual_max_time_diff_sec: 1465,
        common_camera_names: ["4_มห_หนองเอี่ยน_เข้า", "4_มค_ประชาอุทิศ_เข้า", "4_มห_โนนยางพระไกรศรีสุข_เข้า"]
      },
      {
        target_vehicle: "กม6671",
        other_vehicle: "5ขฎ894",
        actual_common_cameras: 3,
        actual_max_time_diff_sec: 1388,
        common_camera_names: ["4_มห_หนองเอี่ยน_เข้า", "4_มค_ประชาอุทิศ_เข้า", "4_มห_โนนยางพระไกรศรีสุข_เข้า"]
      },
      {
        target_vehicle: "กม6671",
        other_vehicle: "653734",
        actual_common_cameras: 3,
        actual_max_time_diff_sec: 3599,
        common_camera_names: ["4_มห_หนองเอี่ยน_เข้า", "4_มค_ประชาอุทิศ_เข้า", "4_มห_โนนยางพระไกรศรีสุข_เข้า"]
      },
      {
        target_vehicle: "กม6671",
        other_vehicle: "704603",
        actual_common_cameras: 3,
        actual_max_time_diff_sec: 2674,
        common_camera_names: ["4_มห_หนองเอี่ยน_เข้า", "4_มค_ประชาอุทิศ_เข้า", "4_มห_โนนยางพระไกรศรีสุข_เข้า"]
      },
      {
        target_vehicle: "กม6671",
        other_vehicle: "704814",
        actual_common_cameras: 3,
        actual_max_time_diff_sec: 4979,
        common_camera_names: ["4_มห_หนองเอี่ยน_เข้า", "4_มค_ประชาอุทิศ_เข้า", "4_มห_โนนยางพระไกรศรีสุข_เข้า"]
      }
    ];

    const chunks = formData.analysisType === 'one_to_one' ? oneToOneChunks : [];
    const chunkSize = formData.analysisType === 'one_to_one' ? 2 : 1;

    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const currentProgress = progressSteps[i];
      setProgress(currentProgress);
      
      if (formData.analysisType === 'one_to_one' && i < 4) { // Simulate 4 chunk updates
        const startIdx = i * chunkSize;
        const endIdx = Math.min(startIdx + chunkSize, chunks.length);
        const currentChunks = chunks.slice(startIdx, endIdx);
        
        setResultsData(prev => [...prev, ...currentChunks]);
        addLog(`Received chunk. Total results so far: <strong>${(i + 1) * chunkSize}</strong>`, 'data_chunk');
      } else if (currentProgress === 100) {
        setStatus('complete');
        if (formData.analysisType === 'one_to_one') {
          addLog('1-to-1 analysis finished.', 'complete');
          addLog(`<strong>Final Aggregated Results (${chunks.length} items):</strong>`, 'complete');
        } else {
          addLog('Analysis complete!', 'complete');
        }
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

          {/* Results Table */}
          <ResultsTable 
            results={resultsData}
            analysisType={currentAnalysisType}
            isVisible={status === 'complete' && currentAnalysisType === 'one_to_one' && resultsData.length > 0}
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
