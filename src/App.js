import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import TaskList from "./components/TaskList";
import GanttChart from "./components/GanttChart";
import TaskForm from "./components/TaskForm";
import "./styles/App.css";

const API_URL = "https://your-backend-app.azurewebsites.net";

// 週ごと達成率グラフ用コンポーネント
const WeeklyCompletionGraph = ({ groupedTasks }) => {
  const weeks = Object.keys(groupedTasks);

  // 各週の達成率を計算
  const weekStatus = weeks.map((week) => {
    const tasks = groupedTasks[week];
    if (!tasks || tasks.length === 0) return { week, isComplete: false };
    const checked = tasks.filter((t) => t.is_checked === 1).length;
    return { week, isComplete: checked === tasks.length };
  });

  return (
    <div style={{ margin: "40px auto 20px", maxWidth: 600 }}>
      <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: 10, textAlign: "center" }}>
        週ごとの達成状況
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {weekStatus.map(({ week, isComplete }) => (
          <div key={week} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 36,
                height: 80,
                background: isComplete ? "#4caf50" : "#e53935",
                borderRadius: 8,
                marginBottom: 6,
                transition: "background 0.3s",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
              title={isComplete ? "達成！" : "未達"}
            >
              {isComplete ? "✔" : "×"}
            </div>
            <div style={{ fontSize: "0.95rem" }}>{week}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    week: "",
    category: "",
    task_content: "",
    due_date: "",
    priority: 1,
  });
  const [groupedTasks, setGroupedTasks] = useState({});
  const [groupedGanttTasks, setGroupedGanttTasks] = useState({});
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [collapsedGanttGroups, setCollapsedGanttGroups] = useState({});
  const [currentWeek, setCurrentWeek] = useState("");
  const [taskTableOpen, setTaskTableOpen] = useState(true);
  const [ganttOpen, setGanttOpen] = useState(true);

  // タスク一覧取得
  const fetchTasks = async () => {
    const res = await fetch(`${API_URL}/tasks`);
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // タスクを週ごとにグループ化
  useEffect(() => {
    const grouped = tasks.reduce((acc, task) => {
      if (!acc[task.week]) acc[task.week] = [];
      acc[task.week].push(task);
      return acc;
    }, {});
    setGroupedTasks(grouped);

    // ガントチャート用（週ごと、未完了上位5件、日付有効のみ）
    const ganttGrouped = {};
    Object.keys(grouped).forEach((week) => {
      const ganttTasks = grouped[week]
        .filter((task) => task.is_checked === 0 && task.due_date)
        .slice(0, 5)
        .map((task) => ({
          id: String(task.id),
          name: task.task_content,
          start: new Date().toISOString().split("T")[0],
          end: task.due_date,
          progress: 0,
          dependencies: "",
        }));
      ganttGrouped[week] = ganttTasks;
    });
    setGroupedGanttTasks(ganttGrouped);
  }, [tasks]);

  // 折りたたみ初期化（初回のみ初期化するように変更）
  useEffect(() => {
    setCollapsedGroups((prev) => {
      // すでに状態がある週は維持し、新しい週だけtrueで追加
      const next = { ...prev };
      Object.keys(groupedTasks).forEach((week) => {
        if (!(week in next)) next[week] = true;
      });
      return next;
    });

    setCollapsedGanttGroups((prev) => {
      const next = { ...prev };
      Object.keys(groupedGanttTasks).forEach((week) => {
        if (!(week in next)) next[week] = true;
      });
      return next;
    });
  }, [groupedTasks, groupedGanttTasks]);

  // タスク追加
  const handleAddTask = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    setNewTask({
      week: "",
      category: "",
      task_content: "",
      due_date: "",
      priority: 1,
    });
    fetchTasks();
  };

  // チェック切り替え
  const handleEditClick = async (task) => {
    await fetch(`${API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, is_checked: task.is_checked === 1 ? 0 : 1 }),
    });
    fetchTasks();
    // 折りたたみ状態は変更しない
  };

  // 削除
  const handleDeleteTask = async (taskId) => {
    await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
    fetchTasks();
  };

  // 折りたたみ
  const toggleGroup = (week) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [week]: !prev[week],
    }));
  };
  const toggleGanttGroup = (week) => {
    setCollapsedGanttGroups((prev) => ({
      ...prev,
      [week]: !prev[week],
    }));
  };

  // 今週の達成率
  const calcCompletionRate = () => {
    if (!currentWeek || !groupedTasks[currentWeek]) return 0;
    const weekTasks = groupedTasks[currentWeek];
    if (weekTasks.length === 0) return 0;
    const checked = weekTasks.filter((t) => t.is_checked === 1).length;
    return Math.round((checked / weekTasks.length) * 100);
  };

  // 全体の達成率を計算
  const calcTotalCompletionRate = () => {
    const allTasks = Object.values(groupedTasks).flat();
    if (allTasks.length === 0) return 0;
    const checked = allTasks.filter((t) => t.is_checked === 1).length;
    return Math.round((checked / allTasks.length) * 100);
  };

  return (
    <div>
      <Header />
      <main className="container">
        {/* 全体の達成率を一番上に大きく表示 */}
        <div style={{
          fontSize: "2.2rem",
          fontWeight: "bold",
          color: "#1976d2",
          textAlign: "center",
          margin: "32px 0 24px 0",
          letterSpacing: "2px"
        }}>
          全体のタスク達成率: {calcTotalCompletionRate()}%
        </div>

        {/* 今週の達成率 */}
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <label style={{ marginRight: 10, fontWeight: "bold" }}>現在の週を選択:</label>
          <select
            value={currentWeek}
            onChange={(e) => setCurrentWeek(e.target.value)}
            style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            <option value="">週を選択</option>
            {Object.keys(groupedTasks).map((week) => (
              <option key={week} value={week}>{week}</option>
            ))}
          </select>
          {currentWeek && (
            <div style={{ marginTop: 10, fontSize: "1.5rem", fontWeight: "bold", color: "#444" }}>
              今週のタスク達成率: {calcCompletionRate()}%
            </div>
          )}
        </div>

        {/* タスク一覧（大グループ） */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1.4rem",
              background: "#e0e0e0",
              padding: "12px 18px",
              borderRadius: "8px",
              marginBottom: "10px",
              userSelect: "none",
            }}
            onClick={() => setTaskTableOpen((open) => !open)}
          >
            {taskTableOpen ? "▼" : "▶"} タスク一覧
          </div>
          {taskTableOpen && (
            <>
              <TaskForm
                newTask={newTask}
                setNewTask={setNewTask}
                handleAddTask={handleAddTask}
                groupedTasks={groupedTasks}
              />
              <TaskList
                groupedTasks={groupedTasks}
                toggleGroup={toggleGroup}
                collapsedGroups={collapsedGroups}
                handleEditClick={handleEditClick}
                handleDeleteTask={handleDeleteTask}
              />
            </>
          )}
        </div>

        {/* ガントチャート（大グループ） */}
        <div>
          <div
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1.4rem",
              background: "#e0e0e0",
              padding: "12px 18px",
              borderRadius: "8px",
              marginBottom: "10px",
              userSelect: "none",
            }}
            onClick={() => setGanttOpen((open) => !open)}
          >
            {ganttOpen ? "▼" : "▶"} ガントチャート
          </div>
          {ganttOpen && (
            <GanttChart
              groupedGanttTasks={groupedGanttTasks}
              toggleGanttGroup={toggleGanttGroup}
              collapsedGanttGroups={collapsedGanttGroups}
            />
          )}
        </div>
      </main>
      {/* 週ごと達成率グラフをフッターの直前に追加 */}
      <WeeklyCompletionGraph groupedTasks={groupedTasks} />
      <Footer />
    </div>
  );
}

export default App;