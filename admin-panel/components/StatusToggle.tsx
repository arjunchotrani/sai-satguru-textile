import React, { useState } from "react";

interface StatusToggleProps {
  isActive: boolean;
  onToggle: (newStatus: boolean) => Promise<void>;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ isActive, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onToggle(!isActive);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-3 py-1 rounded-full text-sm font-medium transition
        ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
      `}
    >
      {loading ? "..." : isActive ? "Active" : "Inactive"}
    </button>
  );
};

export default StatusToggle;
