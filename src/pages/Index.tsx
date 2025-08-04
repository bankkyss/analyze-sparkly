import { useState, useCallback, useRef, useEffect } from "react";
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
  const wsRef = useRef<WebSocket | null>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'], data?: unknown) => {
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

  const startAnalysis = useCallback(async (formData: AnalysisFormData) => {
    setStatus('processing');
    setProgress(0);
    setConnectionStatus('connecting');
    setCurrentAnalysisType(formData.analysisType);
    addLog(`Sending request for <strong>${formData.analysisType}</strong>...`, 'info');

    try {
      const response = await fetch('http://api.ailprnsb.com/api/realtimeprocress/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }

      const data = await response.json();
      const newJobId = data.jobId || data.job_id || data.id;
      setJobId(newJobId);
      addLog(`Job started with ID: <strong>${newJobId}</strong>`, 'processing');

      wsRef.current?.close();
      const ws = new WebSocket(`ws://api.ailprnsb.com/api/realtimeprocress/ws/${newJobId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        addLog('WebSocket connection established.', 'processing');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.progress !== undefined) {
            setProgress(msg.progress);
            addLog(`Processing progress: ${msg.progress}%`, 'processing');
          }

          if (Array.isArray(msg.results) && msg.results.length > 0) {
            setResultsData(prev => {
              const updated = [...prev, ...msg.results];
              addLog(`Received chunk. Total results so far: <strong>${updated.length}</strong>`, 'data_chunk');
              return updated;
            });
          }

          if (msg.status === 'complete') {
            setStatus('complete');
            addLog('Analysis complete!', 'complete');
            setConnectionStatus('disconnected');
            ws.close();
            toast({
              title: 'การวิเคราะห์เสร็จสิ้น',
              description: `พบผลลัพธ์ทั้งหมด ${msg.total ?? ''} รายการ`
            });
          } else if (msg.status === 'failed') {
            setStatus('failed');
            addLog(`Error: ${msg.error || 'Unknown error'}`, 'failed');
            setConnectionStatus('disconnected');
            ws.close();
            toast({
              title: 'เกิดข้อผิดพลาด',
              description: msg.error || 'ไม่สามารถเริ่มการวิเคราะห์ได้ กรุณาลองใหม่อีกครั้ง',
              variant: 'destructive'
            });
          }
        } catch (e) {
          addLog('Received non-JSON message', 'info');
        }
      };

      ws.onerror = () => {
        setStatus('failed');
        setConnectionStatus('disconnected');
        addLog('WebSocket error', 'failed');
        toast({
          title: 'เกิดข้อผิดพลาดของ WebSocket',
          description: 'ไม่สามารถเชื่อมต่อกับ WebSocket ได้',
          variant: 'destructive'
        });
        ws.close();
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
      };
    } catch (error) {
      setStatus('failed');
      setConnectionStatus('disconnected');
      addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'failed');
      throw error;
    }
  }, [addLog]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const handleFormSubmit = useCallback(async (formData: AnalysisFormData) => {
    setIsProcessing(true);
    clearLogs();

    try {
      await startAnalysis(formData);
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
  }, [startAnalysis, addLog, clearLogs]);

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
