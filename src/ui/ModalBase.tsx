"use client";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import React from "react";

export interface ModalBaseProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  onAceptar?: () => void;
  aceptarTexto?: string;
  cancelarTexto?: string;
  deshabilitarAceptar?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export function ModalBase({
  abierto,
  titulo,
  onCerrar,
  onAceptar,
  aceptarTexto = "Guardar",
  cancelarTexto = "Cancelar",
  deshabilitarAceptar = false,
  maxWidth = "sm",
  children,
}: ModalBaseProps) {
  return (
    <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth={maxWidth}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700 }}>
        {titulo}
        <IconButton onClick={onCerrar} size="small">
          <IconX size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>{children}</DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onCerrar}>
          {cancelarTexto}
        </Button>
        {onAceptar && (
          <Button variant="contained" color="success" onClick={onAceptar} disabled={deshabilitarAceptar}>
            {aceptarTexto}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
