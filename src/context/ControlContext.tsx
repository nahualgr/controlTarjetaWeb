import React, { createContext, useContext, useState } from "react";

export type CuponFisico = {
  numeroVendedor: number;
  comprobanteCompleto: string;
  fecha: Date;
  presentacion: string;
  terminal: string;
  tarjeta: string;
  importe: string;
  cupon: string;
  cuotas: string;
  autorizacion: string;
  hora: string;
  vendedor: string;
};

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
  // Propiedad añadida para sincronizar con el procesamiento de ResumenSistema
  importeAutorizacionCupon: string; 
};

type ControlContextType = {
  cuponesFisicos: CuponFisico[];
  setCuponesFisicos: React.Dispatch<React.SetStateAction<CuponFisico[]>>;
  operacionesSistema: OperacionSistema[];
  setOperacionesSistema: React.Dispatch<
    React.SetStateAction<OperacionSistema[]>
  >;
};

const ControlContext = createContext<ControlContextType | undefined>(undefined);

export const ControlProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cuponesFisicos, setCuponesFisicos] = useState<CuponFisico[]>([]);
  const [operacionesSistema, setOperacionesSistema] = useState<
    OperacionSistema[]
  >([]);

  return (
    <ControlContext.Provider
      value={{
        cuponesFisicos,
        setCuponesFisicos,
        operacionesSistema,
        setOperacionesSistema,
      }}
    >
      {children}
    </ControlContext.Provider>
  );
};

export const useControl = () => {
  const context = useContext(ControlContext);
  if (!context) {
    throw new Error("useControl debe usarse dentro de un ControlProvider");
  }
  return context;
};