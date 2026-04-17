import { useState, useEffect } from "react";
import { useControl } from "../context/ControlContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { OperacionSistema } from "../context/ControlContext";

export default function ResumenSistema() {
  const { operacionesSistema, setOperacionesSistema } = useControl();
  const [isWaiting, setIsWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalWaitTime, setTotalWaitTime] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lineas = text.split(/\r?\n/).filter((line) => line.trim() !== "");
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
          importeAutorizacionCupon: `${importeRaw}___${autorizacion}___${cupon}`,
          tipoComprobante: datos[10],
          emisor: datos[11],
          nroComprobante: datos[12],
          comprobanteCompleto: `${datos[10]}-${datos[11]}-${datos[12]}`,
          vendedor: datos[13],
        };

        resultados.push(obj);
      }

      setOperacionesSistema(resultados);

      if (resultados.length > 0) {
        const segundosTotales = resultados.length * 1;
        setTotalWaitTime(segundosTotales);
        setTimeLeft(segundosTotales);
        setIsWaiting(true);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWaiting && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isWaiting) {
      setIsWaiting(false);
    }
    return () => clearTimeout(timer);
  }, [isWaiting, timeLeft]);

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
      { header: "Importe_Autorización_Cupón", key: "importeAutorizacionCupon", width: 35 },
      { header: "Comprobante", key: "comprobanteCompleto", width: 20 },
      { header: "Número de Vendedor", key: "vendedor", width: 15 },
    ];

    operacionesSistema.forEach((op) => worksheet.addRow(op));

    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), "resumen_sistema.xlsx");
    });
  };

  const progress = totalWaitTime > 0 ? ((totalWaitTime - timeLeft) / totalWaitTime) * 100 : 0;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg mx-auto" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          {!isWaiting ? (
            <div className="text-center py-3">
              <h2 className="h4 font-weight-bold text-dark mb-4">Control de Tarjetas</h2>
              
              <div className="form-group mb-4">
                <input 
                  type="file" 
                  accept=".txt" 
                  onChange={handleFileChange}
                  className="form-control-file d-block w-100"
                />
              </div>

              <button 
                onClick={exportarExcel}
                disabled={operacionesSistema.length === 0}
                className={`btn btn-lg w-100 font-weight-bold ${
                  operacionesSistema.length === 0 
                  ? "btn-light text-muted" 
                  : "btn-success shadow-sm"
                }`}
              >
                📥 Exportar a Excel
              </button>

              {operacionesSistema.length > 0 && (
                <div className="alert alert-success mt-4 mb-0 py-2">
                  ✓ {operacionesSistema.length} operaciones cargadas correctamente.
                </div>
              )}
            </div>
          ) : (
            /* --- VISTA DE CARGA Y PROGRESO (BOOTSTRAP) --- */
            <div className="py-4 text-center">
              <div className="mb-4">
                <h2 className="h4 font-weight-bold text-primary">Procesando Resumen...</h2>
                <p className="text-muted small">Analizando {operacionesSistema.length} registros</p>
              </div>

              <div className="progress mb-3" style={{ height: '25px' }}>
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                  role="progressbar" 
                  style={{ width: `${progress}%` }} 
                  aria-valuenow={progress} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                >
                  {Math.round(progress)}%
                </div>
              </div>
              
              <p className="text-secondary font-italic small">
                Tiempo restante: {timeLeft}s
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}