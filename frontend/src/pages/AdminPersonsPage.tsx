import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { personsApi, type PersonCreate } from "../api/persons";

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

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

  // Photo upload state
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      uploadedPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [uploadedPhotos]);

  // Process files and create previews
  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      setError("Пожалуйста, выберите изображения (jpg, png, gif, webp)");
      return;
    }

    const newPhotos: UploadedPhoto[] = imageFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    setError(null);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const { files } = e.dataTransfer;
      if (files && files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles]
  );

  // File input change handler
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (files && files.length > 0) {
        processFiles(files);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [processFiles]
  );

  // Remove photo handler
  const removePhoto = useCallback((photoId: string) => {
    setUploadedPhotos((prev) => {
      const photo = prev.find((p) => p.id === photoId);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  }, []);

  // Trigger file input click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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
          const errorMessage = extractErrorMessage(
            err,
            "Ошибка при загрузке деятеля"
          );

          if (errorMessage === "AUTH_ERROR") {
            navigate("/login");
            return;
          }

          if (errorMessage === "NOT_FOUND") {
            navigate("/");
            return;
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

  // Helper function to extract error message from API response
  const extractErrorMessage = (
    err: unknown,
    defaultMessage: string
  ): string => {
    const error = err as {
      response?: {
        data?: {
          detail?: string | Array<{ msg?: string; loc?: string[] }>;
          message?: string;
        };
        status?: number;
      };
      message?: string;
    };

    if (error.response?.status === 401 || error.response?.status === 403) {
      return "AUTH_ERROR";
    }

    if (error.response?.status === 404) {
      return "NOT_FOUND";
    }

    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === "string") {
        return detail;
      }
      if (Array.isArray(detail)) {
        return detail
          .map((err) => {
            const field = err.loc?.slice(1).join(".") || "поле";
            return `${field}: ${err.msg || "ошибка валидации"}`;
          })
          .join("; ");
      }
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.message) {
      return error.message;
    }

    return defaultMessage;
  };

  const onSubmit = async (data: PersonFormData) => {
    setError(null);
    setLoading(true);

    try {
      // Временно используем имя первого файла как photo (пока бэкенд не поддерживает загрузку)
      const photoValue =
        uploadedPhotos.length > 0 ? uploadedPhotos[0].file.name : data.photo;

      const personData: PersonCreate = {
        name: data.name,
        about: data.about,
        text: textItems.filter((item) => item.trim() !== ""),
        photo: photoValue,
        sourses: soursesItems.filter((item) => item.trim() !== ""),
        ...(data.autor ? { autor: data.autor } : {}),
      };

      // Debug
      console.log("Sending to API:", JSON.stringify(personData, null, 2));

      if (isEditMode && id) {
        await personsApi.update(Number(id), personData);
      } else {
        await personsApi.create(personData);
      }

      navigate("/");
    } catch (err: unknown) {
      console.error("Error saving person:", err);
      const errorMessage = extractErrorMessage(
        err,
        "Ошибка при сохранении деятеля"
      );

      if (errorMessage === "AUTH_ERROR") {
        navigate("/login");
        return;
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
      const errorMessage = extractErrorMessage(
        err,
        "Ошибка при удалении деятеля"
      );

      if (errorMessage === "AUTH_ERROR") {
        navigate("/login");
        return;
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

            {/* Photo Upload Section */}
            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
              Фотографии
            </Typography>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              multiple
              style={{ display: "none" }}
            />

            {/* Drag and Drop Zone */}
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
              sx={{
                border: "2px dashed",
                borderColor: isDragOver
                  ? "primary.main"
                  : errors.photo
                  ? "error.main"
                  : "grey.400",
                borderRadius: 2,
                p: 3,
                mb: 2,
                textAlign: "center",
                cursor: loading ? "not-allowed" : "pointer",
                backgroundColor: isDragOver
                  ? "action.hover"
                  : "background.paper",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: loading ? "grey.400" : "primary.main",
                  backgroundColor: loading
                    ? "background.paper"
                    : "action.hover",
                },
                opacity: loading ? 0.6 : 1,
              }}
            >
              <CloudUploadIcon
                sx={{
                  fontSize: 48,
                  color: isDragOver ? "primary.main" : "grey.500",
                  mb: 1,
                }}
              />
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {isDragOver
                  ? "Отпустите файлы здесь"
                  : "Перетащите изображения сюда"}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                или
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadClick();
                }}
              >
                Выбрать файлы
              </Button>
              <Typography
                variant="caption"
                display="block"
                color="textSecondary"
                sx={{ mt: 1 }}
              >
                Поддерживаемые форматы: JPG, PNG, GIF, WebP
              </Typography>
            </Box>

            {errors.photo && (
              <Typography
                color="error"
                variant="caption"
                sx={{ mb: 2, display: "block" }}
              >
                {errors.photo.message}
              </Typography>
            )}

            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  Загружено фотографий: {uploadedPhotos.length}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  {uploadedPhotos.map((photo) => (
                    <Box
                      key={photo.id}
                      sx={{
                        position: "relative",
                        width: 120,
                        height: 120,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "grey.300",
                      }}
                    >
                      <Box
                        component="img"
                        src={photo.preview}
                        alt={photo.file.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removePhoto(photo.id)}
                        disabled={loading}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                          },
                          padding: 0.5,
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          color: "white",
                          padding: "2px 4px",
                          fontSize: "10px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {photo.file.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Hidden Controller for form validation (keeps photo in form state) */}
            <Controller
              name="photo"
              control={control}
              rules={{
                validate: () =>
                  uploadedPhotos.length > 0 || "Добавьте хотя бы одно фото",
              }}
              render={() => <input type="hidden" />}
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
