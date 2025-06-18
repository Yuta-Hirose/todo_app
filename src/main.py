from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import Optional
import csv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    id: Optional[int] = None
    week: str
    category: str
    task_content: str
    is_checked: int = 0
    due_date: Optional[str] = None
    priority: Optional[int] = None

def get_db():
    conn = sqlite3.connect("todos.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.on_event("startup")
def startup():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            parent_id INTEGER,
            start_date TEXT,
            end_date TEXT,
            actual_end_date TEXT,  -- 追加
            FOREIGN KEY(parent_id) REFERENCES tasks(id)
        )
        """
    )
    # 既存テーブルにカラムがなければ追加
    try:
        conn.execute("ALTER TABLE tasks ADD COLUMN actual_end_date TEXT")
    except Exception:
        pass  # すでにカラムがあれば無視
    conn.commit()
    conn.close()

@app.get("/tasks")
def read_tasks():
    conn = get_db()
    tasks = conn.execute("SELECT * FROM tasks").fetchall()
    conn.close()
    return [dict(task) for task in tasks]

@app.post("/tasks")
def create_task(task: Task):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO tasks (week, category, task_content, is_checked, due_date, priority)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (task.week, task.category, task.task_content, task.is_checked, task.due_date, task.priority),
    )
    conn.commit()
    task_id = cur.lastrowid
    conn.close()
    return {"id": task_id, **task.dict()}

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return {"result": "ok"}

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: Task):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE tasks
        SET week = ?, category = ?, task_content = ?, is_checked = ?, due_date = ?, priority = ?
        WHERE id = ?
        """,
        (task.week, task.category, task.task_content, task.is_checked, task.due_date, task.priority, task_id),
    )
    conn.commit()
    conn.close()
    return {"result": "ok"}

# --- 以下はTodo用のAPI（不要なら削除可） ---

class Todo(BaseModel):
    id: int = None
    title: str

@app.get("/todos")
def read_todos():
    conn = get_db()
    todos = conn.execute("SELECT * FROM todos").fetchall()
    conn.close()
    return [dict(todo) for todo in todos]

@app.post("/todos")
def create_todo(todo: Todo):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO todos (title) VALUES (?)", (todo.title,))
    conn.commit()
    todo_id = cur.lastrowid
    conn.close()
    return {"id": todo_id, "title": todo.title}

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
    conn.commit()
    conn.close()
    return {"result": "ok"}

@app.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo: Todo):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE todos SET title = ? WHERE id = ?",
        (todo.title, todo_id),
    )
    conn.commit()
    conn.close()
    return {"result": "ok"}

# --- 以下はフロントエンドからのリクエスト例 ---

@app.post("/tasks/example")
def create_task_example():
    # フロントエンドからのリクエスト例
    request_body = {
        "title": "新しいタスク",
        "parent_id": None,
        "start_date": "2023-10-01",
        "end_date": "2023-10-31",
        "actual_end_date": "2023-10-30",  # 実績終了日
    }
    task = Task(**request_body)
    return create_task(task)

@app.post("/import-tasks")
def import_tasks_from_csv(file_path: str = "Kaggle_学習チェックリスト_20週_優先度_カテゴリ付き.csv"):
    conn = get_db()
    cur = conn.cursor()

    # テーブル作成（必要なら）
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week TEXT,
            category TEXT,
            task_content TEXT,
            is_checked INTEGER DEFAULT 0,
            due_date TEXT,
            priority INTEGER
        )
        """
    )

    # CSVデータを読み込んで挿入
    with open(file_path, encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            cur.execute(
                """
                INSERT INTO tasks (week, category, task_content, is_checked, due_date, priority)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    row["週"],
                    row["カテゴリ（中タスク）"],
                    row["タスク内容"],
                    0,  # チェック状態は未完了（0）で初期化
                    row["期限（予定日）"] if row["期限（予定日）"] else None,
                    int(row["優先度（1=高, 3=低）"]) if row["優先度（1=高, 3=低）"] else None,
                ),
            )

    conn.commit()
    conn.close()
    return {"result": "CSVデータをインポートしました"}