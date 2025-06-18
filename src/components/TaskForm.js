import React from "react";

const TaskForm = ({ newTask, setNewTask, handleAddTask, groupedTasks }) => {
  return (
    <form onSubmit={handleAddTask} style={{ marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
      <select
        value={newTask.week}
        onChange={(e) => setNewTask({ ...newTask, week: e.target.value })}
        required
      >
        <option value="">週を選択</option>
        {Object.keys(groupedTasks).map((week) => (
          <option key={week} value={week}>
            {week}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={newTask.category}
        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
        placeholder="カテゴリ"
        required
      />
      <input
        type="text"
        value={newTask.task_content}
        onChange={(e) => setNewTask({ ...newTask, task_content: e.target.value })}
        placeholder="タスク内容"
        required
      />
      <input
        type="date"
        value={newTask.due_date}
        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
      />
      <select
        value={newTask.priority}
        onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
      >
        <option value={1}>高</option>
        <option value={2}>中</option>
        <option value={3}>低</option>
      </select>
      <button type="submit">追加</button>
    </form>
  );
};

export default TaskForm;