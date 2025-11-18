import { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Link as MuiLink,
  Divider,
} from "@mui/material";
import TelegramIcon from "@mui/icons-material/Telegram";

const TelegramButton = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpenDialog}
        sx={{ padding: "8px" }}
        aria-label="Контакты авторов"
      >
        <TelegramIcon />
      </IconButton>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Связь с авторами</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <MuiLink
              href="https://t.me/nikitamorkovkin"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "block",
                mb: 1,
                fontSize: "1rem",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              📱 Никита Морковкин
            </MuiLink>
            <MuiLink
              href="https://t.me/Jamshed17"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "block",
                mb: 2,
                fontSize: "1rem",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              📱 Джамшед Акрамов
            </MuiLink>
          </DialogContentText>
          <Divider sx={{ my: 2 }} />
          <DialogContentText
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", fontStyle: "italic" }}
          >
            Информация об авторах
            <br />
            Проект разработан командой АтомГрад
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TelegramButton;
