import React from "react";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      &copy; {new Date().getFullYear()} モノトーンTodo管理アプリ
    </footer>
  );
};

const styles = {
  footer: {
    background: "#222",
    color: "#bbb",
    padding: "10px 0",
    textAlign: "center",
    marginTop: "auto",
    borderTop: "2px solid #444",
    fontSize: "0.95rem",
  },
};

export default Footer;