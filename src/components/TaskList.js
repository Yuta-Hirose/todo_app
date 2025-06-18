import React from "react";

const TaskList = ({ groupedTasks, toggleGroup, collapsedGroups, handleEditClick, handleDeleteTask }) => {
  return (
    <>
      {Object.keys(groupedTasks).map((week) => (
        <div key={week}>
          {/* 大項目（週）のヘッダー */}
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
            onClick={() => toggleGroup(week)}
          >
            {collapsedGroups[week] ? "▶" : "▼"} {week}
          </div>

          {/* タスク一覧（折りたたみ可能） */}
          {!collapsedGroups[week] && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>カテゴリ</th>
                  <th style={styles.th}>タスク内容</th>
                  <th style={styles.th}>期限</th>
                  <th style={styles.th}>優先度</th>
                  <th style={styles.th}>チェック</th>
                  <th style={styles.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {groupedTasks[week].map((task) => (
                  <tr key={task.id}>
                    <td style={styles.td}>{task.category}</td>
                    <td style={styles.td}>{task.task_content}</td>
                    <td style={styles.td}>{task.due_date || "なし"}</td>
                    <td style={styles.td}>{task.priority}</td>
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        checked={task.is_checked === 1}
                        onChange={() => handleEditClick(task)}
                      />
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => handleEditClick(task)} style={{ marginRight: "8px" }}>
                        編集
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} style={styles.deleteButton}>
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </>
  );
};

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fafafa",
    marginBottom: "30px",
  },
  th: {
    background: "#e0e0e0",
    color: "#222",
    border: "1px solid #bbb",
    padding: "8px",
    fontWeight: "bold",
    textAlign: "left",
  },
  td: {
    border: "1px solid #bbb",
    padding: "8px",
    color: "#333",
    background: "#fff",
  },
  deleteButton: {
    background: "#fff",
    color: "#d00",
    border: "1px solid #d00",
    borderRadius: "4px",
    padding: "2px 8px",
    cursor: "pointer",
  },
};

export default TaskList;