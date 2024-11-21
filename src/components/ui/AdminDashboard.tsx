// @/components/AdminDashboard

"use client";
import React, { useEffect, useState } from "react";

interface DevicesData {
  devices: {
    name: string;
    last_activity: string;
    created_at: string;
  }[];
}

const AdminDashboard = () => {
  const [ubidotsToken, setUbidotsToken] = useState<string>("");
  const [devicesData, setDevicesData] = useState<DevicesData>({ devices: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenSubmitted, setTokenSubmitted] = useState(false);

  const API_URL = "https://industrial.api.ubidots.com/api/v1.6";

  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!ubidotsToken.trim()) {
      setError("Por favor, ingrese un token válido");
      return;
    }

    setTokenSubmitted(true);
    fetchDevicesData(ubidotsToken);
  };

  const fetchDevicesData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Obtener todos los dispositivos
      const devicesResponse = await fetch(`${API_URL}/datasources`, {
        headers: {
          "X-Auth-Token": token,
          "Content-Type": "application/json",
        },
      });

      if (!devicesResponse.ok) {
        throw new Error(
          "Error al obtener los dispositivos. Verifique el token.",
        );
      }

      // 2. Transformar la respuesta a JSON
      const devicesData = await devicesResponse.json();

      // 3. Mapear los resultados al formato deseado
      const formattedDevices = devicesData.results.map((device: any) => ({
        name: device.name,
        last_activity: new Date(device.last_activity).toLocaleString(),
        created_at: new Date(device.created_at).toLocaleString(),
      }));

      // 4. Actualizar el estado con los datos formateados
      setDevicesData({ devices: formattedDevices });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setTokenSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  // Token input form
  const TokenInputForm = () => (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Ingrese su Token de Ubidots
      </h2>
      <form onSubmit={handleTokenSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="ubidotsToken"
            className="block text-sm font-medium text-gray-700"
          >
            Token de Ubidots
          </label>
          <input
            type="text"
            id="ubidotsToken"
            value={ubidotsToken}
            onChange={(e) => setUbidotsToken(e.target.value)}
            placeholder="Ingrese su token de Ubidots"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Consultar Dispositivos
        </button>
      </form>
    </div>
  );

  // Devices list rendering
  const DevicesList = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dispositivos Ubidots</h1>

      {loading && <p>Cargando dispositivos...</p>}

      {!loading && (
        <div>
          {devicesData.devices.length === 0 ? (
            <p>No hay dispositivos disponibles.</p>
          ) : (
            <div className="grid gap-4">
              {devicesData.devices.map((device, index) => (
                <div
                  key={index}
                  className="bg-gray-600 shadow rounded-lg p-4 border"
                >
                  <h3 className="font-medium text-lg">{device.name}</h3>
                  <p>Última actividad: {device.last_activity}</p>
                  <p>Fecha de creación: {device.created_at}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-300">
      {!tokenSubmitted ? <TokenInputForm /> : <DevicesList />}
    </div>
  );
};

export default AdminDashboard;
