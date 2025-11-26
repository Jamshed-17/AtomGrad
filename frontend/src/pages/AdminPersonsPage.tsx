import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
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
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { personsApi, type PersonCreate } from "../api/persons";

interface PersonFormData {
  name: string;
  about: string;
  text: string[];
  photo: string;
  sourses: string[];
  autor?: string;
}

const AdminPersonsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== "new" && id !== undefined;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [textItems, setTextItems] = useState<string[]>([""]);
  const [soursesItems, setSoursesItems] = useState<string[]>([""]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonFormData>({
    defaultValues: {
      name: "",
      about: "",
      text: [],
      photo: "",
      sourses: [],
      autor: "",
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchPerson = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await personsApi.getById(Number(id));
          reset({
            name: data.name,
            about: data.about,
            text: data.text,
            photo: data.photo,
            sourses: data.sourses,
            autor: data.autor || "",
          });
          setTextItems(data.text.length > 0 ? data.text : [""]);
          setSoursesItems(data.sourses.length > 0 ? data.sourses : [""]);
        } catch (err: unknown) {
          console.error("Error fetching person:", err);
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

          let errorMessage = "Ошибка при загрузке деятеля";

          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            errorMessage = "Нет доступа. Пожалуйста, войдите снова.";
            navigate("/login");
            return;
          } else if (error.response?.status === 404) {
            errorMessage = "Деятель не найден";
            navigate("/");
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
      fetchPerson();
    } else {
      // Сброс формы для режима создания
      reset({
        name: "",
        about: "",
        text: [],
        photo: "",
        sourses: [],
        autor: "",
      });
      setTextItems([""]);
      setSoursesItems([""]);
      setError(null);
    }
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (data: PersonFormData) => {
    setError(null);
    setLoading(true);

    try {
      const personData: PersonCreate = {
        name: data.name,
        about: data.about,
        text: textItems.filter((item) => item.trim() !== ""),
        photo: data.photo,
        sourses: soursesItems.filter((item) => item.trim() !== ""),
        autor: data.autor || null,
      };

      if (isEditMode && id) {
        await personsApi.update(Number(id), personData);
      } else {
        await personsApi.create(personData);
      }

      navigate("/");
    } catch (err: unknown) {
      console.error("Error saving person:", err);
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

      let errorMessage = "Ошибка при сохранении деятеля";

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

  const handleDelete = async () => {
    if (!id || !isEditMode) return;

    try {
      setLoading(true);
      setError(null);
      await personsApi.delete(Number(id));
      navigate("/");
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
      setDeleteDialogOpen(false);
    }
  };

  const addTextItem = () => {
    setTextItems([...textItems, ""]);
  };

  const removeTextItem = (index: number) => {
    const newItems = textItems.filter((_, i) => i !== index);
    setTextItems(newItems.length > 0 ? newItems : [""]);
  };

  const updateTextItem = (index: number, value: string) => {
    const newItems = [...textItems];
    newItems[index] = value;
    setTextItems(newItems);
  };

  const addSoursesItem = () => {
    setSoursesItems([...soursesItems, ""]);
  };

  const removeSoursesItem = (index: number) => {
    const newItems = soursesItems.filter((_, i) => i !== index);
    setSoursesItems(newItems.length > 0 ? newItems : [""]);
  };

  const updateSoursesItem = (index: number, value: string) => {
    const newItems = [...soursesItems];
    newItems[index] = value;
    setSoursesItems(newItems);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 3, fontWeight: 600 }}
      >
        {isEditMode ? "Редактирование деятеля" : "Добавление нового деятеля"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Имя обязательно" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Имя"
                  variant="outlined"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ mb: 2 }}
                  disabled={loading}
                />
              )}
            />

            <Controller
              name="about"
              control={control}
              rules={{ required: "Описание обязательно" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="О деятеле"
                  variant="outlined"
                  multiline
                  rows={4}
                  error={!!errors.about}
                  helperText={errors.about?.message}
                  sx={{ mb: 2 }}
                  disabled={loading}
                />
              )}
            />

            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
              Биография (массив строк)
            </Typography>
            {textItems.map((item, index) => (
              <Stack direction="row" spacing={1} key={index} sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  value={item}
                  onChange={(e) => updateTextItem(index, e.target.value)}
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="Параграф биографии"
                  disabled={loading}
                />
                <IconButton
                  onClick={() => removeTextItem(index)}
                  disabled={loading || textItems.length === 1}
                  color="error"
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addTextItem}
              variant="outlined"
              size="small"
              sx={{ mb: 3 }}
              disabled={loading}
            >
              Добавить параграф
            </Button>

            <Controller
              name="photo"
              control={control}
              rules={{ required: "Фото обязательно" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Фото (путь к файлу)"
                  variant="outlined"
                  error={!!errors.photo}
                  helperText={errors.photo?.message}
                  sx={{ mb: 2 }}
                  disabled={loading}
                />
              )}
            />

            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
              Источники (массив строк)
            </Typography>
            {soursesItems.map((item, index) => (
              <Stack direction="row" spacing={1} key={index} sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  value={item}
                  onChange={(e) => updateSoursesItem(index, e.target.value)}
                  variant="outlined"
                  placeholder="Источник"
                  disabled={loading}
                />
                <IconButton
                  onClick={() => removeSoursesItem(index)}
                  disabled={loading || soursesItems.length === 1}
                  color="error"
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addSoursesItem}
              variant="outlined"
              size="small"
              sx={{ mb: 3 }}
              disabled={loading}
            >
              Добавить источник
            </Button>

            <Controller
              name="autor"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Автор (необязательно)"
                  variant="outlined"
                  sx={{ mb: 3 }}
                  disabled={loading}
                />
              )}
            />

            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Box>
                {isEditMode && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={loading}
                  >
                    Удалить
                  </Button>
                )}
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/")}
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  Отмена
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading
                    ? "Сохранение..."
                    : isEditMode
                    ? "Сохранить"
                    : "Создать"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить этого деятеля? Это действие нельзя
            отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleDelete}
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

export default AdminPersonsPage;
