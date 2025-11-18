import { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TelegramButton from "./TelegramButton";
import ThemeToggleButton from "./ThemeToggleButton";

const AtomIcon = ({ isHovered }: { isHovered: boolean }) => (
  <Box
    component="img"
    src="/atom.png"
    alt="Atom"
    sx={{
      width: 28,
      height: 28,
      marginRight: 2,
      transition: "transform 0.6s ease-in-out",
      transform: isHovered ? "rotate(360deg)" : "rotate(0deg)",
    }}
  />
);

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <AppBar position="sticky" sx={{ top: 0, zIndex: 1100 }}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography
          variant="h6"
          component={Link}
          to="/"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          sx={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <AtomIcon isHovered={isLogoHovered} />
          АтомГрад
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: {
              xs: 0.5,
              sm: 1,
              md: 1.5,
              lg: 2,
            },
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <TelegramButton />
          <Box
            sx={{
              "@media (min-width: 1080px) and (max-width: 1440px)": {
                marginRight: "-8px",
              },
            }}
          >
            <ThemeToggleButton />
          </Box>
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate("/admin/persons/new")}
                sx={{ textTransform: "none" }}
              >
                Добавить персону
              </Button>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ textTransform: "none" }}
              >
                Выйти
              </Button>
            </>
          ) : (
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              component={Link}
              to="/login"
              sx={{ textTransform: "none" }}
            >
              Войти
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
