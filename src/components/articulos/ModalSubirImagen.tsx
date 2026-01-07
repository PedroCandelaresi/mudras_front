import React, { useState, useRef } from 'react';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    CircularProgress,
    IconButton
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useMutation } from '@apollo/client/react'; // Not used for REST upload but good to have context
import CrystalButton from '@/components/ui/CrystalButton';
import { verde } from '@/ui/colores';

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
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Subir Imagen de Artículo
                <IconButton onClick={handleClose} size="small">
                    <Icon icon="mdi:close" />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
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
                            height: 200,
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            bgcolor: '#fafafa',
                            overflow: 'hidden',
                            position: 'relative',
                            '&:hover': { borderColor: verde.primary, bgcolor: '#f0f7f2' }
                        }}
                    >
                        {preview ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </>
                        ) : (
                            <>
                                <Icon icon="mdi:cloud-upload-outline" width={48} height={48} color="#999" />
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    Haz clic para seleccionar una imagen
                                </Typography>
                            </>
                        )}
                    </Box>

                    {file && (
                        <Typography variant="caption" color="text.secondary">
                            Archivo seleccionado: {file.name}
                        </Typography>
                    )}

                    {error && (
                        <Typography variant="body2" color="error">
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={uploading}>
                    Cancelar
                </Button>
                <CrystalButton
                    baseColor={verde.primary}
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <Icon icon="mdi:upload" />}
                >
                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
                </CrystalButton>
            </DialogActions>
        </Dialog>
    );
};

export default ModalSubirImagen;
