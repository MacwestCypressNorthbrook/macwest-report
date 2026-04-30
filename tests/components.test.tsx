import { render, screen } from "@testing-library/react";
import { DashboardPortal } from "@/components/dashboard/DashboardPortal";
import data from "@/data/macwest-dashboard-data.json";
import type { DashboardData } from "@/types/dashboard";

describe("DashboardPortal", () => {
  it("renders KPI header content", () => {
    render(<DashboardPortal data={data as DashboardData} />);
    expect(screen.getByText(/Management Report/i)).toBeInTheDocument();
    expect(screen.getByText("Gross Profit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Income Statement" })).toBeInTheDocument();
  });
});
