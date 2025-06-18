import React from "react";
import { FrappeGantt } from "frappe-gantt-react";

const GanttChart = ({ groupedGanttTasks, toggleGanttGroup, collapsedGanttGroups }) => {
  return (
    <>
      {Object.keys(groupedGanttTasks).map((week) => (
        <div key={week}>
          <div
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              marginBottom: "10px",
              background: "#f0f0f0",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            onClick={() => toggleGanttGroup(week)}
          >
            {collapsedGanttGroups[week] ? "▶" : "▼"} {week}
          </div>
          {!collapsedGanttGroups[week] && groupedGanttTasks[week].length > 0 && (
            <div style={{ background: "#fff", padding: 10, border: "1px solid #bbb", borderRadius: "6px" }}>
              <FrappeGantt tasks={groupedGanttTasks[week]} viewMode="Day" />
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default GanttChart;