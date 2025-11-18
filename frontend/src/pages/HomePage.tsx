import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Pagination,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { personsApi, type PersonRead } from "../api/persons";
import { useThemeMode } from "../hooks/useThemeMode";

const ITEMS_PER_PAGE = 9;

const HomePage = () => {
  const [persons, setPersons] = useState<PersonRead[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<PersonRead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
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
        console.error("Ошибка загрузки персон:", err);
        const error = err as {
          response?: { data?: { detail?: string }; status?: number };
          message?: string;
          code?: string;
        };

        let errorMessage = "Ошибка при загрузке персон";

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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPersons(persons);
      setPage(1);
      return;
    }

    const query = searchQuery.trim().toLowerCase();
    const filtered = persons.filter((person) =>
      person.name.toLowerCase().includes(query)
    );
    setFilteredPersons(filtered);
    setPage(1);
  }, [searchQuery, persons]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCardClick = (personId: number) => {
    navigate(`/persons/${personId}`);
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPersons = filteredPersons.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredPersons.length / ITEMS_PER_PAGE);

  const getPhotoUrl = (photo: string) => {
    if (!photo) return "";

    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }

    let cleanPhoto = photo.trim();
    if (cleanPhoto.startsWith("/img/")) {
      cleanPhoto = cleanPhoto.substring(5);
    } else if (cleanPhoto.startsWith("/")) {
      cleanPhoto = cleanPhoto.substring(1);
    }

    return `http://atomgrad.site:8000/img/${cleanPhoto}`;
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

      {filteredPersons.length === 0 && !loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Персоны не найдены
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedPersons.map((person) => (
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
                      image={getPhotoUrl(person.photo)}
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

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default HomePage;
