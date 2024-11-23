// @/components/AdminDashboard

"use client";
import React, { useEffect, useState } from "react";
import CreateDeviceForm from "@/components/forms/CreateDeviceForm";

interface Device {
  name: string;
  last_activity: string;
  created_at: string;
  created_at_timestamp: number; // Agregamos este campo para facilitar la ordenación
}

interface DevicesData {
  devices: Device[];
}

const AdminDashboard = () => {
  const [devicesData, setDevicesData] = useState<DevicesData>({ devices: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // Estado para mostrar/ocultar el formulario
  const API_URL = "https://industrial.api.ubidots.com/api/v1.6";

  const getTokenFromLocalStorage = (): string | null => {
    const storedData = localStorage.getItem("registeredUsers");
    if (storedData) {
      try {
        const users = JSON.parse(storedData);
        return users[0].tokenID;
      } catch (e) {
        console.error("Error al obtener los datos del localStorage", e);
        return null;
      }
    }
    return null;
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

      // 3. Mapear los resultados al formato deseado y agregar timestamp
      const formattedDevices = devicesData.results.map((device: any) => {
        const createdDate = new Date(device.created_at);
        const lastActivityDate = device.last_activity
          ? new Date(device.last_activity)
          : new Date(0); // Si last_activity es null, usamos una fecha antigua

        return {
          name: device.name,
          last_activity:
            lastActivityDate.getTime() === 0
              ? "Sin actividad"
              : lastActivityDate.toLocaleString(),
          created_at: createdDate.toLocaleString(),
          created_at_timestamp: createdDate.getTime(),
        };
      });

      // 4. Ordenar los dispositivos por fecha de creación (más antiguo primero)
      const sortedDevices = formattedDevices.sort(
        (a, b) => a.created_at_timestamp - b.created_at_timestamp,
      );

      // 5. Actualizar el estado con los datos formateados y ordenados
      setDevicesData({ devices: sortedDevices });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getTokenFromLocalStorage();
    if (!token) {
      setError("No se encontró el token de acceso.");
      setLoading(false);
      return;
    }
    fetchDevicesData(token);

    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      fetchDevicesData(token);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-300">
        <div className="text-center p-8 bg-red-50 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error de Acceso
          </h2>
          <p className="text-gray-700">
            No se encontró el token de acceso. Por favor, inicie sesión
            nuevamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dispositivos Ubidots</h1>

      {/* Botón para mostrar/ocultar el formulario */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          {showForm ? "Cerrar Formulario" : "Crear Nuevo Dispositivo"}
        </button>
      </div>

      {/* Mostrar el formulario si está activo */}
      {showForm && (
        <div className="mb-6">
          <CreateDeviceForm />
        </div>
      )}

      {/* Mostrar los dispositivos */}
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
};

export default AdminDashboard;
