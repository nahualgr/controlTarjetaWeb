import React, { createContext, useContext, useState } from "react";

export type OperacionSistema = {
  tipoOperacion: string;
  terminal: string;
  tarjeta: string;
  cuotas: string;
  presentacion: string;
  vendedor: string;
  fecha: string;
  hora: string;
  importe: number;
  autorizacion: string;
  cupon: string;
  tipoComprobante: string;
  emisor: string;
  nroComprobante: string;
  comprobanteCompleto: string;
  importeAutorizacionCupon: string; 
};

type ControlContextType = {
  operacionesSistema: OperacionSistema[];
  setOperacionesSistema: React.Dispatch<React.SetStateAction<OperacionSistema[]>>;
};

const ControlContext = createContext<ControlContextType | undefined>(undefined);

export const ControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [operacionesSistema, setOperacionesSistema] = useState<OperacionSistema[]>([]);

  return (
    <ControlContext.Provider value={{ operacionesSistema, setOperacionesSistema }}>
      {children}
    </ControlContext.Provider>
  );
};

export const useControl = () => {
  const context = useContext(ControlContext);
  if (!context) throw new Error("useControl debe usarse dentro de un ControlProvider");
  return context;
};