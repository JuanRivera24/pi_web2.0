"use client";
import { useState } from 'react';

// Interfaz para el resultado de cada endpoint
interface EndpointStatus {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

const API_URL = "http://localhost:8080";
const endpoints = ["clientes", "historial/citas", "barberos", "sedes", "servicios", "citas-activas", "galeria"];

export default function ApiStatusDiagnostic() {
  const [results, setResults] = useState<EndpointStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    // Inicializa el estado para mostrar que estamos trabajando
    setResults(endpoints.map(name => ({ name, status: 'pending', message: 'Probando...' })));

    const promises = endpoints.map(endpoint => 
      fetch(`${API_URL}/${endpoint}`, { signal: AbortSignal.timeout(5000) }) // Timeout de 5 segundos
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
          }
          return response.json();
        })
        .then(data => ({
          name: endpoint,
          status: 'success' as const,
          message: `✅ Conexión exitosa con /${endpoint} (${Array.isArray(data) ? data.length : 1} registros).`
        }))
        .catch(error => ({
          name: endpoint,
          status: 'error' as const,
          message: `❌ ERROR al conectar con /${endpoint}. Revisa la API. (${error.message})`
        }))
    );
    
    // Promise.allSettled espera a que todas las promesas terminen, incluso si fallan
    const settledResults = await Promise.allSettled(promises);

    const finalResults = settledResults.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Esto captura errores de red que no son manejados por el .catch interno
        // Por ejemplo, si la API está completamente caída.
        const endpointIndex = settledResults.indexOf(result);
        const endpointName = endpoints[endpointIndex];
        return {
          name: endpointName,
          status: 'error' as const,
          message: `❌ ERROR de red al conectar con /${endpointName}. ¿Está la API corriendo?`
        };
      }
    });

    setResults(finalResults);
    setIsLoading(false);
  };

  return (
    <div className="mt-4 text-center">
      <button 
        onClick={runDiagnostics} 
        disabled={isLoading}
        className="text-blue-300 hover:text-white transition-colors text-sm disabled:opacity-50"
      >
        {isLoading ? "Diagnosticando..." : "Realizar Diagnóstico de API"}
      </button>

      {results.length > 0 && (
        <div className="mt-4 text-left text-xs space-y-1 max-w-md mx-auto">
          {results.map(result => (
            <div 
              key={result.name} 
              className={`p-2 rounded ${
                result.status === 'success' ? 'bg-green-900 text-green-300' : 
                result.status === 'error' ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {result.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}