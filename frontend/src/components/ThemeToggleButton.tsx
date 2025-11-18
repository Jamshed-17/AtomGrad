import { IconButton } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "../hooks/useThemeMode";

const ThemeToggleButton = () => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <IconButton
      color="inherit"
      onClick={toggleTheme}
      sx={{
        padding: "8px",
        borderRadius: "50%",
      }}
      aria-label={mode === "light" ? "Переключить на темную тему" : "Переключить на светлую тему"}
    >
      {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
};

export default ThemeToggleButton;

