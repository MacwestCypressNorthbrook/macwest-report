import data from "@/data/macwest-dashboard-data.json";
import { DashboardPortal } from "@/components/dashboard/DashboardPortal";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardData } from "@/types/dashboard";
import { validateDashboardData } from "@/lib/dashboard/validate";

const typedData = data as DashboardData;
validateDashboardData(typedData);

export default function Page() {
  return (
    <DashboardLayout>
      <DashboardPortal data={typedData} />
    </DashboardLayout>
  );
}