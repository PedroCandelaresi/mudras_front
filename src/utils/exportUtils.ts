import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn<T> {
    header: string;
    key: keyof T | ((item: T) => string | number | null | undefined);
    width?: number; // Ancho para Excel (aprox caracteres)
    pdfWidth?: number; // Ancho relativo para PDF (opcional)
    format?: (value: any) => string;
}

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx)
 */
/**
 * Exporta un array de objetos a un archivo Excel (.xlsx)
 */
export const exportToExcel = <T>(
    data: T[],
    columns: ExportColumn<T>[],
    filename: string,
    filterSummary?: string
) => {
    // 1. Preparar los datos
    const exportData = data.map((item) => {
        const row: Record<string, any> = {};
        columns.forEach((col) => {
            let value: any;
            if (typeof col.key === 'function') {
                value = col.key(item);
            } else {
                value = item[col.key];
            }

            if (col.format && value != null) {
                value = col.format(value);
            }

            row[col.header] = value;
        });
        return row;
    });

    // 2. Crear libro de trabajo
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);

    // Add Metadata rows
    utils.sheet_add_aoa(ws, [[`Fecha de exportación: ${new Date().toLocaleDateString('es-AR')}`]], { origin: 'A1' });
    let startRow = 2;

    if (filterSummary) {
        utils.sheet_add_aoa(ws, [[`Filtros aplicados: ${filterSummary}`]], { origin: `A${startRow}` });
        startRow++;
    }

    // Add Headers and Data
    utils.sheet_add_json(ws, exportData, { origin: `A${startRow + 1}`, skipHeader: false });

    // 3. Ajustar anchos de columna
    if (columns.some(c => c.width)) {
        ws['!cols'] = columns.map(c => ({ wch: c.width || 15 }));
    }

    utils.book_append_sheet(wb, ws, 'Datos');

    // 4. Generar archivo y descargar
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(dataBlob, `${filename}.xlsx`);
};

/**
 * Helper to load image as base64
 */
const loadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                reject(new Error('Could not get canvas context'));
            }
        };
        img.onerror = (e) => reject(e);
    });
};

/**
 * Exporta un array de objetos a un archivo PDF con tabla
 */
export const exportToPdf = async <T>(
    data: T[],
    columns: ExportColumn<T>[],
    filename: string,
    title: string,
    filterSummary?: string
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Load Logo
    try {
        const logoData = await loadImage('/logo.svg');
        // Logo width/height ratio. Assuming square-ish or adjusting.
        // Let's set a fixed width of 24mm (approx 90px)
        const logoWidth = 24;
        const logoHeight = 24;
        const margin = 14;

        doc.addImage(logoData, 'PNG', pageWidth - margin - logoWidth, 10, logoWidth, logoHeight);
    } catch (e) {
        console.warn('Could not load logo for PDF', e);
    }

    // Título
    doc.setFontSize(16);
    doc.text(title, 14, 20); // Moved down slightly to align center-ish with logo
    doc.setFontSize(10);
    doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-AR')}`, 14, 28);

    let startY = 35; // Increased startY
    if (filterSummary) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        // Split text to fit page width minus logo area
        const splitText = doc.splitTextToSize(`Filtros: ${filterSummary}`, pageWidth - 50);
        doc.text(splitText, 14, startY);
        startY += (splitText.length * 5) + 5;
    }

    // Headers
    const headers = columns.map(c => c.header);

    // Rows
    const rows = data.map(item => {
        return columns.map(col => {
            let value: any;
            if (typeof col.key === 'function') {
                value = col.key(item);
            } else {
                value = item[col.key];
            }

            if (col.format && value != null) {
                value = col.format(value);
            }
            return value == null ? '' : String(value);
        });
    });

    // Generar tabla
    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: startY,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 66, 66] }, // Gris oscuro para encabezados
    });

    doc.save(`${filename}.pdf`);
};
