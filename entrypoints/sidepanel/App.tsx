import { useState, useEffect } from "react";
import { TagManager } from "./TagManager";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    // 获取系统主题
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mediaQuery.matches ? "dark" : "light");
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme === "dark" ? "rgb(40,40,40)" : "transparent",
      }}
    >
      <TagManager />
    </div>
  );
}

export default App;
