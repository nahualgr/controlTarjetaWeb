import { useControl } from "../context/ControlContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { OperacionSistema } from "../context/ControlContext";

export default function ResumenSistema() {
  const { operacionesSistema, setOperacionesSistema } = useControl();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lineas = text.split("\n").filter((line) => line.trim() !== "");
      const resultados: OperacionSistema[] = [];

      for (const linea of lineas) {
        let tipoOperacion = "Normal";
        if (linea.startsWith("An ")) tipoOperacion = "Anulado";
        if (linea.startsWith("Di ")) tipoOperacion = "Dividido";

        const datos = linea.match(
          /(\d+)\s+([A-Z]+)\s+(\d+)\s+(\S+)\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})\s+([\d.,]+)\s+([\d]*)\s+([\d]*)\s+([A-Z]+)\s+(\d+)\s+(\d+)\s+(\d+)/
        );
        
        if (!datos) continue;

        const importeRaw = datos[7];
        const autorizacion = datos[8];
        const cupon = datos[9];

        const obj: OperacionSistema = {
          tipoOperacion,
          terminal: datos[1],
          tarjeta: datos[2],
          cuotas: datos[3],
          presentacion: datos[4] === "******" ? "Sin número" : datos[4],
          fecha: datos[5].split("/").reverse().join("-"),
          hora: datos[6],
          importe: parseFloat(importeRaw.replace(",", ".")),
          autorizacion,
          cupon,
          importeAutorizacionCupon: `${importeRaw}-${autorizacion}-${cupon}`,
          tipoComprobante: datos[10],
          emisor: datos[11],
          nroComprobante: datos[12],
          comprobanteCompleto: `${datos[10]}-${datos[11]}-${datos[12]}`,
          vendedor: datos[13],
        };

        resultados.push(obj);
      }
      setOperacionesSistema(resultados);
    };
    reader.readAsText(file);
  };

  const exportarExcel = () => {
    if (operacionesSistema.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Resumen");

    worksheet.columns = [
      { header: "Tipo de Operación", key: "tipoOperacion", width: 20 },
      { header: "Terminal", key: "terminal", width: 15 },
      { header: "Tarjeta", key: "tarjeta", width: 20 },
      { header: "Cuotas", key: "cuotas", width: 10 },
      { header: "Presentación", key: "presentacion", width: 15 },
      { header: "Fecha", key: "fecha", width: 12 },
      { header: "Hora", key: "hora", width: 10 },
      { header: "Importe-Autorización-Cupón", key: "importeAutorizacionCupon", width: 35 },
      { header: "Comprobante", key: "comprobanteCompleto", width: 20 },
      { header: "Número de Vendedor", key: "vendedor", width: 15 },
    ];

    operacionesSistema.forEach((op) => worksheet.addRow(op));

    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), "resumen_sistema.xlsx");
    });
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
      <h2 className="text-xl font-bold">Carga de Resumen de Sistema</h2>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input 
          type="file" 
          accept=".txt" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button 
          onClick={exportarExcel}
          className="w-full sm:w-auto px-4 py-2 bg-green-500 text-black font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
        >
          📥 Exportar a Excel
        </button>
      </div>
      
      {operacionesSistema.length > 0 && (
        <p className="text-sm text-green-600 font-medium">
          ✓ {operacionesSistema.length} operaciones cargadas.
        </p>
      )}
    </div>
  );
}