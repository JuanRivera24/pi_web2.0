export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-lg text-gray-600 mb-6">La página que buscas no existe.</p>
      <a
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Volver al inicio
      </a>
    </div>
  );
}
