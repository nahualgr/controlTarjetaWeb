import ResumenSistema from "./ResumenSistema";

export default function AppPrincipal() {
  return (
    <div className="container py-4">
      <h1 className="mb-4 text-2xl font-bold">Control de Tarjetas</h1>
      {/* Se eliminaron las vistas de Comparador y Carga Manual */}
      <ResumenSistema />
    </div>
  );
}