// @/components/CreateDeviceForm

"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

interface CreateDeviceResponse {
  id: string;
  name: string;
}

const CreateDeviceForm = () => {
  const [deviceName, setDeviceName] = useState("");
  const [loading, setLoading] = useState(false);

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

  const createDevice = async (token: string, name: string) => {
    const response = await fetch(`${API_URL}/datasources/`, {
      method: "POST",
      headers: {
        "X-Auth-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        description: "Dispositivo para monitoreo de peso y movimiento",
      }),
    });

    if (!response.ok) {
      throw new Error("Error al crear el dispositivo");
    }

    return response.json();
  };

  const createVariables = async (token: string, deviceId: string) => {
    // Crear variable hora_movimiento
    await fetch(`${API_URL}/datasources/${deviceId}/variables/`, {
      method: "POST",
      headers: {
        "X-Auth-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "hora_movimiento",
        description: "Hora del último movimiento detectado",
      }),
    });

    // Crear variable peso
    await fetch(`${API_URL}/datasources/${deviceId}/variables/`, {
      method: "POST",
      headers: {
        "X-Auth-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "peso",
        description: "Peso actual del dispositivo",
        unit: "kg",
      }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = getTokenFromLocalStorage();
    if (!token) {
      toast.error("No se encontró el token de acceso");
      setLoading(false);
      return;
    }

    try {
      // 1. Crear el dispositivo
      const deviceResponse: CreateDeviceResponse = await createDevice(
        token,
        deviceName,
      );

      // 2. Crear las variables
      await createVariables(token, deviceResponse.id);

      toast.success(
        `Dispositivo "${deviceResponse.name}" creado exitosamente con las variables`,
      );
      setDeviceName(""); // Limpiar el formulario
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Error desconocido al crear el dispositivo",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Crear Nuevo Dispositivo</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="deviceName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nombre del Dispositivo
          </label>
          <input
            type="text"
            id="deviceName"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingrese el nombre del dispositivo"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !deviceName.trim()}
          className={`w-full px-4 py-2 text-white font-semibold rounded-md ${
            loading || !deviceName.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Creando..." : "Crear Dispositivo"}
        </button>
      </form>
    </div>
  );
};

export default CreateDeviceForm;
