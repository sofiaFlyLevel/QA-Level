import * as XLSX from 'xlsx';
import { existsSync } from 'fs';

export async function saveBookingCodeToExcel(bookingCode) {
    try {
        const fileName = 'booking_codes.xlsx';
        let wb;
        let ws;

        if (existsSync(fileName)) {
            // Leer el archivo existente
            wb = XLSX.readFile(fileName);
            ws = wb.Sheets[wb.SheetNames[0]];
            
            // Obtener el rango actual de datos
            const range = XLSX.utils.decode_range(ws['!ref']);
            
            // Añadir la nueva fila en la siguiente posición disponible
            const newRow = range.e.r + 1; // La siguiente fila después de la última
            
            // Añadir el nuevo booking code
            ws[XLSX.utils.encode_cell({r: newRow, c: 0})] = {v: bookingCode};
            // Añadir la fecha
            ws[XLSX.utils.encode_cell({r: newRow, c: 1})] = {v: new Date().toLocaleString()};
            
            // Actualizar el rango de la hoja
            ws['!ref'] = XLSX.utils.encode_range({
                s: {r: 0, c: 0},
                e: {r: newRow, c: 1}
            });
        } else {
            // Crear un nuevo libro y hoja si el archivo no existe
            wb = XLSX.utils.book_new();
            const wsData = [
                ['Booking Code', 'Date'],
                [bookingCode, new Date().toLocaleString()]
            ];
            ws = XLSX.utils.aoa_to_sheet(wsData);
        }

        // Asegurarse de que la hoja esté en el libro
        if (!wb.SheetNames.includes('Booking Codes')) {
            XLSX.utils.book_append_sheet(wb, ws, 'Booking Codes');
        } else {
            wb.Sheets['Booking Codes'] = ws;
        }

        // Guardar el archivo
        XLSX.writeFile(wb, fileName);

        console.log(`Successfully saved booking code ${bookingCode} to Excel`);
    } catch (error) {
        console.error('Error saving to Excel:', error);
        throw error;
    }
}