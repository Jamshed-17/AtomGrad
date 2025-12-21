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

const RUSSIAN_ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");

const HomePage = () => {
  const [persons, setPersons] = useState<PersonRead[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<PersonRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
        setError("Ошибка при загрузке деятелей");
      } finally {
        setLoading(false);
      }
    };

    fetchPersons();
  }, []);

  const personsByLetter = useMemo(() => {
    const grouped: Record<string, PersonRead[]> = {};

    persons.forEach((person) => {
      if (!person.name) return;

      const firstLetter = person.name.trim().toUpperCase().charAt(0);
      const letter = RUSSIAN_ALPHABET.includes(firstLetter)
        ? firstLetter
        : "Другое";

      grouped[letter] ??= [];
      grouped[letter].push(person);
    });

    return grouped;
  }, [persons]);

  const availableLetters = useMemo(
    () => RUSSIAN_ALPHABET.filter((l) => personsByLetter[l]?.length),
    [personsByLetter]
  );

  useEffect(() => {
    let filtered = persons;

    if (selectedLetter && !searchQuery) {
      filtered = personsByLetter[selectedLetter] ?? [];
    } else if (selectedLetter && searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = (personsByLetter[selectedLetter] ?? []).filter((p) =>
        p.name.toLowerCase().includes(q)
      );
    } else if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = persons.filter((p) =>
        p.name.toLowerCase().includes(q)
      );
    }

    setFilteredPersons(filtered);
  }, [searchQuery, selectedLetter, persons, personsByLetter]);

  const handleCardClick = (id: number) => {
    navigate(`/persons/${id}`);
  };

  const getImageUrl = (id: number) => `/api/persons/image/${id}`;

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
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setSelectedLetter(null);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4, maxWidth: 600 }}
      />

      {availableLetters.length > 0 && (
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
          <Button
            variant={selectedLetter === null ? "contained" : "outlined"}
            size="small"
            onClick={() => setSelectedLetter(null)}
          >
            Все
          </Button>
          {availableLetters.map((letter) => (
            <Button
              key={letter}
              variant={selectedLetter === letter ? "contained" : "outlined"}
              size="small"
              onClick={() => {
                setSelectedLetter(letter);
                setSearchQuery("");
              }}
            >
              {letter}
            </Button>
          ))}
        </Box>
      )}

      {filteredPersons.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">
            Деятели не найдены
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPersons.map((person) => (
            <Grid key={person.id} xs={12} sm={6} md={4}>
              <Card
                onClick={() => handleCardClick(person.id)}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="350"
                  image={getImageUrl(person.id)}
                  alt={person.name}
                  sx={{
                    objectFit: "contain",
                    backgroundColor:
                      mode === "dark" ? "#3a3a3a" : "grey.100",
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {person.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
