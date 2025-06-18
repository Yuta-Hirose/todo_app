import sqlite3

def get_db():
    conn = sqlite3.connect("todos.db")  # データベースファイル名
    conn.row_factory = sqlite3.Row
    return conn

def migrate_tasks_table():
    conn = get_db()
    cur = conn.cursor()

    # 新しいテーブルを作成
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks_new (
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

    # 古いテーブルからデータを移行
    cur.execute(
        """
        INSERT INTO tasks_new (id, week, category, task_content, is_checked, due_date, priority)
        SELECT id, week, category, task_content, is_checked, due_date, priority FROM tasks
        """
    )

    # 古いテーブルを削除して新しいテーブルをリネーム
    cur.execute("DROP TABLE tasks")
    cur.execute("ALTER TABLE tasks_new RENAME TO tasks")

    conn.commit()
    conn.close()
    print("テーブルの移行が完了しました。")

if __name__ == "__main__":
    migrate_tasks_table()