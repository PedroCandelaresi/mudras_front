'use client';
import React, { useState, useRef } from 'react';
import {
    Box,
    Dialog,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    CircularProgress,
    IconButton,
    Alert
} from '@mui/material';
import { Icon } from '@iconify/react';

interface ModalSubirImagenProps {
    open: boolean;
    onClose: () => void;
    onUploadSuccess: (url: string) => void;
}

const ModalSubirImagen: React.FC<ModalSubirImagenProps> = ({ open, onClose, onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Use relative path to go through Nginx proxy
            const apiUrl = '/api';
            const response = await fetch(`${apiUrl}/upload/articulos`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al subir la imagen');
            }

            const data = await response.json();
            if (data && data.url) {
                onUploadSuccess(data.url);
                handleClose();
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (err) {
            console.error(err);
            setError('Ocurrió un error al subir el archivo.');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: 0,
                    border: '1px solid #e0e0e0',
                    bgcolor: '#ffffff',
                },
            }}
        >
            <Box sx={{
                bgcolor: '#f5f5f5',
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Typography variant="h6" fontWeight={700}>
                    Subir Imagen
                </Typography>
                <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
                    <Icon icon="mdi:close" width={24} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 4, bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <Box
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            width: '100%',
                            height: 250,
                            border: '1px dashed #bdbdbd',
                            borderRadius: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            bgcolor: '#fafafa',
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#5d4037', bgcolor: '#f5f5f5' }
                        }}
                    >
                        {preview ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    bgcolor: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    p: 1,
                                    textAlign: 'center',
                                    fontSize: '0.75rem'
                                }}>
                                    Clic para cambiar
                                </Box>
                            </>
                        ) : (
                            <>
                                <Icon icon="mdi:cloud-upload-outline" width={48} height={48} color="#9e9e9e" />
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    Hacé clic para seleccionar una imagen
                                </Typography>
                            </>
                        )}
                    </Box>

                    {file && (
                        <Typography variant="caption" color="text.secondary">
                            Archivo seleccionado: <strong>{file.name}</strong>
                        </Typography>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', borderRadius: 0 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0', gap: 2 }}>
                <Button onClick={handleClose} disabled={uploading} color="inherit" sx={{ fontWeight: 600 }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    disableElevation
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <Icon icon="mdi:upload" />}
                    sx={{
                        bgcolor: '#5d4037',
                        color: 'white',
                        fontWeight: 700,
                        borderRadius: 0,
                        px: 3,
                        '&:hover': { bgcolor: '#4e342e' }
                    }}
                >
                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalSubirImagen;
