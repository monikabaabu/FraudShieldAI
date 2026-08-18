import { History } from "lucide-react";
import { PageContainer } from "../components/layout/PageContainer";
import { HistoryTable } from "../components/history/HistoryTable";
import { UploadHistoryList } from "../components/history/UploadHistoryList";
import { useAnalysisHistory } from "../context/AnalysisHistoryContext";

export function DetectionHistory() {
  const { manualRecords, uploadRecords } = useAnalysisHistory();

  return (
    <PageContainer>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
          <History size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-100">Detection History</h1>
          <p className="mt-0.5 text-sm text-ink-400">Every successful Manual and Upload analysis performed in this browser</p>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <div>
          <h2 className="font-display mb-4 text-base font-semibold tracking-tight text-ink-100">Manual Transactions</h2>
          <HistoryTable items={manualRecords} />
        </div>

        <div>
          <h2 className="font-display mb-4 text-base font-semibold tracking-tight text-ink-100">Dataset Uploads</h2>
          <UploadHistoryList records={uploadRecords} />
        </div>
      </div>
    </PageContainer>
  );
}
