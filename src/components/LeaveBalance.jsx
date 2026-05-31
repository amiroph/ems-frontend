import { useEffect, useState } from "react";
import API from "../utils/api";

export default function LeaveBalance({ employeeId, compact = false }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, [employeeId]);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const url = employeeId
        ? `/employees/${employeeId}/leave-balance`
        : "/portal/leave-balance";
      const res = await API.get(url);
      setBalance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="rounded-2xl p-5 animate-pulse"
      style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
      <div className="h-4 rounded" style={{ backgroundColor: "#F5F7FA", width: "60%" }} />
    </div>
  );

  if (!balance) return null;

  const usedPercent = balance.totalEntitled > 0
    ? Math.min(100, (balance.usedDays / balance.totalEntitled) * 100)
    : 0;

  const availablePercent = balance.totalEntitled > 0
    ? Math.min(100, (balance.availableDays / balance.totalEntitled) * 100)
    : 0;

  const getColor = (available, total) => {
    if (total === 0) return "#A0AEC0";
    const ratio = available / total;
    if (ratio > 0.5) return "#276749";
    if (ratio > 0.25) return "#B7791F";
    return "#C53030";
  };

  const barColor = getColor(balance.availableDays, balance.totalEntitled);

  if (compact) {
    return (
      <div
        className="rounded-2xl p-4 flex items-center justify-between gap-4"
        style={{ backgroundColor: "#EBF4FF", border: "1px solid #BEE3F8" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏖️</span>
          <div>
            <p className="text-xs font-semibold" style={{ color: "#2C5282" }}>Annual Leave Balance {balance.currentYear}</p>
            <p className="text-xs mt-0.5" style={{ color: "#718096" }}>
              {balance.yearsOfService} year{balance.yearsOfService !== 1 ? "s" : ""} of service
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold" style={{ color: barColor }}>
            {balance.availableDays}
          </p>
          <p className="text-xs" style={{ color: "#718096" }}>
            of {balance.totalEntitled} days left
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold" style={{ color: "#2D3748" }}>
            🏖️ Annual Leave Balance — {balance.currentYear}
          </h3>
          <p className="text-xs mt-1" style={{ color: "#718096" }}>
            Based on {balance.yearsOfService} year{balance.yearsOfService !== 1 ? "s" : ""} of service
            {balance.hireDate && ` · Hired ${new Date(balance.hireDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ backgroundColor: barColor + "15", color: barColor }}
        >
          {balance.availableDays} days left
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: "#F5F7FA" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${usedPercent}%`,
              backgroundColor: balance.usedDays > 0 ? "#E67E22" : "#e2e8f0",
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <p className="text-xs" style={{ color: "#718096" }}>
            Used: {balance.usedDays} days
          </p>
          <p className="text-xs" style={{ color: "#718096" }}>
            Total: {balance.totalEntitled} days
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: "#EBF4FF" }}
        >
          <p className="text-2xl font-bold" style={{ color: "#1E3A5F" }}>
            {balance.totalEntitled}
          </p>
          <p className="text-xs mt-1" style={{ color: "#4A5568" }}>Total Entitled</p>
          <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>16 days/year</p>
        </div>
        <div
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: "#FFFAF0" }}
        >
          <p className="text-2xl font-bold" style={{ color: "#B7791F" }}>
            {balance.usedDays}
          </p>
          <p className="text-xs mt-1" style={{ color: "#4A5568" }}>Days Used</p>
          <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>This year</p>
        </div>
        <div
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: barColor === "#C53030" ? "#FFF5F5" : barColor === "#B7791F" ? "#FFF8E1" : "#F0FFF4" }}
        >
          <p className="text-2xl font-bold" style={{ color: barColor }}>
            {balance.availableDays}
          </p>
          <p className="text-xs mt-1" style={{ color: "#4A5568" }}>Available</p>
          <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>Remaining</p>
        </div>
      </div>

      {/* Warning if low */}
      {balance.availableDays === 0 && (
        <div
          className="mt-4 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}
        >
          ⚠️ You have no annual leave days remaining for {balance.currentYear}.
        </div>
      )}
      {balance.availableDays > 0 && balance.availableDays <= 3 && (
        <div
          className="mt-4 px-4 py-3 rounded-xl text-sm"
          style={{ backgroundColor: "#FFF8E1", color: "#B7791F", border: "1px solid #FAD089" }}
        >
          ⚠️ You only have {balance.availableDays} annual leave day{balance.availableDays !== 1 ? "s" : ""} remaining.
        </div>
      )}
    </div>
  );
}