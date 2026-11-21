import { loadDashboardData } from "@/lib/dashboard/load";
import { BoardReport } from "@/components/board/BoardReport";

export default function Page() {
  return <BoardReport data={loadDashboardData()} />;
}
