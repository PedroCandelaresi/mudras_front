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
 * Exporta un array de objetos a un archivo PDF con tabla
 */
export const exportToPdf = <T>(
    data: T[],
    columns: ExportColumn<T>[],
    filename: string,
    title: string,
    filterSummary?: string
) => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-AR')}`, 14, 22);

    let startY = 30;
    if (filterSummary) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        // Split text to fit page width
        const splitText = doc.splitTextToSize(`Filtros: ${filterSummary}`, 180);
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
