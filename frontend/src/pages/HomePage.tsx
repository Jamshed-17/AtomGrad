import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { personsApi, type PersonRead } from "../api/persons";
import { useThemeMode } from "../hooks/useThemeMode";

// Русский алфавит
const RUSSIAN_ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");

const HomePage = () => {
  const [persons, setPersons] = useState<PersonRead[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<PersonRead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const { mode } = useThemeMode();

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await personsApi.getAll();
        setPersons(data);
        setFilteredPersons(data);
      } catch (err: unknown) {
        console.error("Ошибка загрузки деятелей:", err);
        const error = err as {
          response?: { data?: { detail?: string }; status?: number };
          message?: string;
          code?: string;
        };

        let errorMessage = "Ошибка при загрузке деятелей";

        if (
          error.code === "ERR_NETWORK" ||
          error.message?.includes("Network Error")
        ) {
          errorMessage =
            "Ошибка сети: не удалось подключиться к серверу. Проверьте, что API доступен.";
        } else if (error.code === "ERR_CANCELED") {
          errorMessage = "Запрос был отменен";
        } else if (error.response?.status === 404) {
          errorMessage = "Эндпоинт не найден. Проверьте URL API.";
        } else if (error.response?.status === 500) {
          errorMessage = "Ошибка сервера. Попробуйте позже.";
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPersons();
  }, []);

  // Группировка деятелей по первой букве имени
  const personsByLetter = useMemo(() => {
    const grouped: Record<string, PersonRead[]> = {};
  
    persons.forEach((person) => {
      if (!person.name || person.name.trim() === "") return;
      const firstLetter = person.name.trim().toUpperCase().charAt(0);
      const letter = RUSSIAN_ALPHABET.includes(firstLetter) ? firstLetter : "Другое";
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(person);
    });
  
    return grouped;
  }, [persons]);

  // Получаем доступные буквы (те, для которых есть деятели)
  const availableLetters = useMemo(() => {
    return RUSSIAN_ALPHABET.filter((letter) => personsByLetter[letter]?.length > 0);
  }, [personsByLetter]);

  // Фильтрация деятелей по поисковому запросу и выбранной букве
  useEffect(() => {
    let filtered = persons;

    // Применяем фильтр по букве, если выбрана
    if (selectedLetter && !searchQuery.trim()) {
      filtered = personsByLetter[selectedLetter] || [];
    } else if (selectedLetter && searchQuery.trim()) {
      // Если выбрана буква И есть поисковый запрос, фильтруем по обоим условиям
      const letterFiltered = personsByLetter[selectedLetter] || [];
      const query = searchQuery.trim().toLowerCase();
      filtered = letterFiltered.filter((person) =>
        person.name.toLowerCase().includes(query)
      );
    } else if (searchQuery.trim()) {
      // Только поисковый запрос
      const query = searchQuery.trim().toLowerCase();
      filtered = persons.filter((person) =>
        person.name.toLowerCase().includes(query)
      );
    }

    setFilteredPersons(filtered);
  }, [searchQuery, selectedLetter, persons, personsByLetter]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // При вводе поискового запроса сбрасываем выбранную букву
    if (value.trim()) {
      setSelectedLetter(null);
    }
  };

  const handleLetterClick = (letter: string | null) => {
    setSelectedLetter(letter);
    setSearchQuery(""); // Сбрасываем поисковый запрос при выборе буквы
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCardClick = (personId: number) => {
    navigate(`/persons/${personId}`);
  };

const getPhotoUrl = (_photo: string, id: number) => {
  // Всегда возвращаем новую схему URL по ID
  return `https://atomgrad.site/api/persons/image/${id}`;
};

  if (loading) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <TextField
        fullWidth
        placeholder="Поиск по имени..."
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4, maxWidth: 600 }}
        disabled={loading}
      />

      {/* Алфавитная пагинация */}
      {availableLetters.length > 0 && (
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
          <Button
            variant={selectedLetter === null ? "contained" : "outlined"}
            onClick={() => handleLetterClick(null)}
            size="small"
            sx={{ minWidth: 40 }}
          >
            Все
          </Button>
          {availableLetters.map((letter) => (
            <Button
              key={letter}
              variant={selectedLetter === letter ? "contained" : "outlined"}
              onClick={() => handleLetterClick(letter)}
              size="small"
              sx={{ minWidth: 40 }}
            >
              {letter}
            </Button>
          ))}
        </Box>
      )}

      {filteredPersons.length === 0 && !loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Деятели не найдены
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPersons.map((person) => (
            <Grid key={person.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleCardClick(person.id)}
              >
                {person.photo && (
                  <CardMedia
                    component="img"
                    height="350"
                    image={getPhotoUrl(person.photo, person.id)}
                    alt={person.name}
                    sx={{
                      objectFit: "contain",
                      backgroundColor: mode === "dark" ? "#3a3a3a" : "grey.100",
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {person.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {person.about}
                  </Typography>
                  {person.autor && (
                    <Typography variant="caption" color="text.secondary">
                      Автор: {person.autor}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default HomePage;
