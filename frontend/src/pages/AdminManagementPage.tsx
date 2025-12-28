import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useForm, Controller } from "react-hook-form";
import { adminsApi, type AdminCreate, type AdminRead } from "../api/admins";

interface AdminFormData {
  name: string;
  login: string;
  password: string;
  is_superadmin: boolean;
}

const AdminManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminRead[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [adminToDelete, setAdminToDelete] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminFormData>({
    defaultValues: {
      name: "",
      login: "",
      password: "",
      is_superadmin: false,
    },
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminsApi.getAll();
      setAdmins(data);
    } catch (err: unknown) {
      console.error("Error fetching admins:", err);
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

      let errorMessage = "Ошибка при загрузке списка админов";

      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "Нет доступа. Только супер-админы могут управлять админами.";
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

  const onSubmit = async (data: AdminFormData) => {
    setError(null);
    setLoading(true);

    try {
      const adminData: AdminCreate = {
        name: data.name,
        login: data.login,
        password: data.password,
        is_superadmin: data.is_superadmin,
      };

      await adminsApi.create(adminData);
      setCreateDialogOpen(false);
      reset();
      await fetchAdmins();
    } catch (err: unknown) {
      console.error("Error creating admin:", err);
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

      let errorMessage = "Ошибка при создании админа";

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

  const handleDeleteClick = (adminId: number) => {
    setAdminToDelete(adminId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!adminToDelete) return;

    try {
      setLoading(true);
      setError(null);
      await adminsApi.delete(adminToDelete);
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
      await fetchAdmins();
    } catch (err: unknown) {
      console.error("Error deleting admin:", err);
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

      let errorMessage = "Ошибка при удалении админа";

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Управление администраторами
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={loading}
        >
          Добавить админа
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Имя</TableCell>
                  <TableCell>Логин</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Нет администраторов
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.id}</TableCell>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.login}</TableCell>
                      <TableCell>
                        <Chip
                          label={admin.is_superadmin ? "Супер-админ" : "Админ"}
                          color={admin.is_superadmin ? "error" : "primary"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleDeleteClick(admin.id)}
                          color="error"
                          disabled={loading}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Диалог создания админа */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать нового администратора</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2}>
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
                    disabled={loading}
                  />
                )}
              />
              <Controller
                name="login"
                control={control}
                rules={{ required: "Логин обязателен" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Логин"
                    variant="outlined"
                    error={!!errors.login}
                    helperText={errors.login?.message}
                    disabled={loading}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                rules={{ required: "Пароль обязателен", minLength: { value: 6, message: "Минимум 6 символов" } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Пароль"
                    type="password"
                    variant="outlined"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={loading}
                  />
                )}
              />
              <Controller
                name="is_superadmin"
                control={control}
                render={({ field }) => (
                  <Box>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={loading}
                      id="is_superadmin"
                    />
                    <label htmlFor="is_superadmin" style={{ marginLeft: 8 }}>
                      Супер-админ
                    </label>
                  </Box>
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Создание..." : "Создать"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Диалог удаления админа */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить этого администратора? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Отмена
          </Button>
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

export default AdminManagementPage;

