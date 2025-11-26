import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
  const [personMenuAnchor, setPersonMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  // md breakpoint = 900px (планшет и меньше)
  const isTabletOrMobile = useMediaQuery(theme.breakpoints.down("md"));
  // xs breakpoint = 0px (телефон)
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handlePersonMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPersonMenuAnchor(event.currentTarget);
  };

  const handlePersonMenuClose = () => {
    setPersonMenuAnchor(null);
  };

  const handleAddPerson = () => {
    handlePersonMenuClose();
    navigate("/admin/persons/new");
  };

  const handleDeletePerson = () => {
    handlePersonMenuClose();
    navigate("/admin/persons/delete");
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
          {!isMobile && "АтомГрад"}
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
              {isTabletOrMobile ? (
                <>
                  <Tooltip title="Управление деятелями">
                    <IconButton
                      color="inherit"
                      onClick={handlePersonMenuOpen}
                    >
                      <PersonAddIcon />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={personMenuAnchor}
                    open={Boolean(personMenuAnchor)}
                    onClose={handlePersonMenuClose}
                  >
                    <MenuItem onClick={handleAddPerson}>
                      <PersonAddIcon sx={{ mr: 1 }} />
                      Добавить деятеля
                    </MenuItem>
                    <MenuItem onClick={handleDeletePerson}>
                      <DeleteIcon sx={{ mr: 1 }} />
                      Удалить деятеля
                    </MenuItem>
                  </Menu>
                  <Tooltip title="Управление админами">
                    <IconButton
                      color="inherit"
                      onClick={() => navigate("/admin/admins")}
                    >
                      <AdminPanelSettingsIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Выйти">
                    <IconButton color="inherit" onClick={handleLogout}>
                      <LogoutIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    startIcon={<PersonAddIcon />}
                    endIcon={<ArrowDropDownIcon />}
                    onClick={handlePersonMenuOpen}
                    sx={{ textTransform: "none" }}
                  >
                    Управление деятелями
                  </Button>
                  <Menu
                    anchorEl={personMenuAnchor}
                    open={Boolean(personMenuAnchor)}
                    onClose={handlePersonMenuClose}
                  >
                    <MenuItem onClick={handleAddPerson}>
                      <PersonAddIcon sx={{ mr: 1 }} />
                      Добавить деятеля
                    </MenuItem>
                    <MenuItem onClick={handleDeletePerson}>
                      <DeleteIcon sx={{ mr: 1 }} />
                      Удалить деятеля
                    </MenuItem>
                  </Menu>
                  <Button
                    color="inherit"
                    startIcon={<AdminPanelSettingsIcon />}
                    onClick={() => navigate("/admin/admins")}
                    sx={{ textTransform: "none" }}
                  >
                    Управление админами
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
              )}
            </>
          ) : isTabletOrMobile ? (
            <Tooltip title="Войти">
              <IconButton color="inherit" component={Link} to="/login">
                <LoginIcon />
              </IconButton>
            </Tooltip>
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
