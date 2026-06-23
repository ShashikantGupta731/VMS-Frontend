import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Export an array of objects to an Excel file
   * @param data The JSON data to export
   * @param excelFileName The base filename for the output
   * @param headers Optional array of header labels
   */
  public exportAsExcelFile(data: any[], excelFileName: string, headers?: string[]): void {
    let worksheet: XLSX.WorkSheet;

    if (headers && headers.length > 0) {
      // If headers are provided, we map them as the first row
      const headerRow = headers;
      // We assume data is already formatted into arrays if headers are provided, 
      // or we extract the values based on object keys in the order they appear.
      // But usually aoa_to_sheet is better if we have headers + arrays of values.
      const dataRows = data.map(item => Object.values(item));
      worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
      
      // Apply basic bold style to header row
      const headerStyle = { font: { bold: true, sz: 12 } };
      for (let col = 0; col < headerRow.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ c: col, r: 0 });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
        worksheet[cellAddress].s = headerStyle;
      }
    } else {
      worksheet = XLSX.utils.json_to_sheet(data);
    }

    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    // Append current timestamp to filename
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    FileSaver.saveAs(data, `${fileName}_${dateStr}${EXCEL_EXTENSION}`);
  }
}
