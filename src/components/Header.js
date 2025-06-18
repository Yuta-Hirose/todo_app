import React from "react";

const Header = () => {
  return (
    <header style={styles.header}>
      タスク管理アプリ
    </header>
  );
};

const styles = {
  header: {
    background: "#222",
    color: "#fff",
    padding: "20px 0",
    textAlign: "center",
    letterSpacing: "2px",
    fontSize: "2rem",
    fontWeight: "bold",
    borderBottom: "4px solid #444",
  },
};

export default Header;