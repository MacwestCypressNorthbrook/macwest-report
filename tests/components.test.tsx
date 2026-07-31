import { render, screen } from "@testing-library/react";
import { DashboardPortal } from "@/components/dashboard/DashboardPortal";
import data from "@/data/macwest-dashboard-data.json";
import type { DashboardData } from "@/types/dashboard";

describe("DashboardPortal", () => {
  it("renders header and tab navigation", () => {
    render(<DashboardPortal data={data as DashboardData} />);
    expect(screen.getByText(/Management Report/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Overview" })).toBeInTheDocument();
  });
});
