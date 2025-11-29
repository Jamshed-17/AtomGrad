import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { personsApi, type PersonRead } from "../api/persons";

const AdminDeletePersonPage = () => {
  const navigate = useNavigate();
  const [persons, setPersons] = useState<PersonRead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonRead | null>(null);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await personsApi.getAll();
        setPersons(data);
      } catch (err: unknown) {
        console.error("Error fetching persons:", err);
        const error = err as {
          response?: {
            data?: {
              detail?: string;
              message?: string;
            };
            status?: number;
          };
          message?: string;
        };

        let errorMessage = "Ошибка при загрузке списка деятелей";

        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          errorMessage = "Нет доступа. Пожалуйста, войдите снова.";
          navigate("/login");
          return;
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPersons();
  }, [navigate]);

  const handleDeleteClick = (person: PersonRead) => {
    setSelectedPerson(person);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPerson) return;

    try {
      setLoading(true);
      setError(null);
      await personsApi.delete(selectedPerson.id);
      
      // Удаляем персону из списка
      setPersons(persons.filter((p) => p.id !== selectedPerson.id));
      setDeleteDialogOpen(false);
      setSelectedPerson(null);
    } catch (err: unknown) {
      console.error("Error deleting person:", err);
      const error = err as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
          status?: number;
        };
        message?: string;
      };

      let errorMessage = "Ошибка при удалении деятеля";

      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "Нет доступа. Пожалуйста, войдите снова.";
        navigate("/login");
        return;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPerson(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 3, fontWeight: 600 }}
      >
        Удаление деятеля
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          {loading && persons.length === 0 ? (
            <Typography>Загрузка...</Typography>
          ) : persons.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              Список деятелей пуст
            </Typography>
          ) : (
            <List>
              {persons.map((person) => (
                <ListItem
                  key={person.id}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                  secondaryAction={
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(person)}
                      disabled={loading}
                      size="small"
                    >
                      Удалить
                    </Button>
                  }
                >
                  <ListItemText
                    primary={person.name}
                    secondary={person.about}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Назад
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить деятеля "{selectedPerson?.name}"? 
            Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Отмена
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Удаление..." : "Удалить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDeletePersonPage;






