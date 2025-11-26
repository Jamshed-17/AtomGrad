import { Box, Button, Container, Typography } from "@mui/material";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Box
            sx={{
              textAlign: "center",
              p: 4,
              borderRadius: 2,
              bgcolor: "error.light",
              color: "error.contrastText",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Что-то пошло не так
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {this.state.error?.message || "Произошла непредвиденная ошибка"}
            </Typography>
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{ mr: 2 }}
            >
              Вернуться на главную
            </Button>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
