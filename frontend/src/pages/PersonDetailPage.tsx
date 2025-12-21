import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { personsApi, type PersonRead } from "../api/persons";
import { useAuth } from "../contexts/AuthContext";
import { useThemeMode } from "../hooks/useThemeMode";

const PersonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { mode } = useThemeMode();

  const [person, setPerson] = useState<PersonRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPerson = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await personsApi.getById(Number(id));
        setPerson(data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        setError(error.response?.data?.detail || "Ошибка при загрузке деятеля");
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !person) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error || "Деятель не найден"}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ mt: 2 }}
        >
          Вернуться на главную
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/")}>
          Вернуться к списку
        </Button>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/admin/persons/${person.id}`)}
          >
            Редактировать
          </Button>
        )}
      </Box>

      <Card>
        <CardMedia
          component="img"
          image={`/api/persons/image/${person.id}`}
          alt={person.name}
          sx={{
            objectFit: "contain",
            width: "100%",
            maxHeight: "600px",
            backgroundColor: mode === "dark" ? "#3a3a3a" : "#f5f5f5",
          }}
        />

        <Box sx={{ p: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            {person.name}
          </Typography>

          {person.autor && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Автор: {person.autor}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            О деятеле
          </Typography>
          <Typography variant="body1" paragraph>
            {person.about}
          </Typography>

          {person.text?.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Биография
              </Typography>
              {person.text.map((paragraph, index) => (
                <Typography key={index} variant="body1" paragraph>
                  {paragraph}
                </Typography>
              ))}
            </>
          )}

          {person.sourses?.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Источники
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {person.sourses.map((source, index) => (
                  <Chip
                    key={index}
                    label={source}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default PersonDetailPage;
