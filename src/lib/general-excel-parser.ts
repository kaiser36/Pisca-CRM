import * as XLSX from 'xlsx';

export const parseGenericExcel = async (file: File): Promise<Record<string, any>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(new Error("Falha ao analisar o ficheiro Excel. Verifique o formato."));
      }
    };

    reader.onerror = (error) => {
      reject(new Error("Erro ao ler o ficheiro."));
    };

    reader.readAsArrayBuffer(file);
  });
};