import ResumenSistema from "./ResumenSistema";

export default function AppPrincipal() {
  return (
    <div className="container py-4">
      <h1 className="text-xl font-bold text-center">Control de Tarjetas</h1>
      {/* Se eliminaron las vistas de Comparador y Carga Manual */}
      <ResumenSistema />
    </div>
  );
}