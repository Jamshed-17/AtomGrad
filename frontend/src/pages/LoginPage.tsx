import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginCredentials } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const [name, setName] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credentials: LoginCredentials = { name, login, password };
      await authLogin(credentials);
      // Небольшая задержка для обновления состояния аутентификации
      setTimeout(() => {
        navigate("/admin/persons/new", { replace: true });
      }, 100);
    } catch (err: unknown) {
      console.error("Login error:", err);
      const error = err as {
        response?: {
          data?: {
            detail?: string | string[];
            message?: string;
          };
          status?: number;
        };
        message?: string;
      };

      let errorMessage = "Неверный логин или пароль";

      // Обработка ошибки 422 (валидация)
      if (error.response?.status === 422) {
        const detail = error.response.data?.detail;
        if (Array.isArray(detail)) {
          // Pydantic возвращает массив ошибок валидации
          errorMessage = (
            detail as Array<{ loc?: (string | number)[]; msg?: string }>
          )
            .map(
              (err) =>
                `${err.loc?.join(".") || "Поле"}: ${
                  err.msg || "Ошибка валидации"
                }`
            )
            .join(", ");
        } else if (typeof detail === "string") {
          errorMessage = detail;
        } else {
          errorMessage =
            "Ошибка валидации данных. Проверьте правильность ввода.";
        }
      } else if (error.response?.data?.detail) {
        errorMessage = Array.isArray(error.response.data.detail)
          ? error.response.data.detail.join(", ")
          : error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && error.message !== "Network Error") {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4, position: "relative" }}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "error.main",
              color: "white",
              borderRadius: "50%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: "error.dark",
              },
              "& svg": {
                color: "white",
              },
            }}
            aria-label="Вернуться на главную"
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ mb: 3, fontWeight: 600 }}
          >
            Вход в систему
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          
           <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Имя"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
              disabled={loading}
            /> 
            
            <TextField
              fullWidth
              label="Логин"
              variant="outlined"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
