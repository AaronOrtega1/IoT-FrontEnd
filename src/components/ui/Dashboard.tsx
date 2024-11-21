// @/components/Dashboard

"use client";
import React from "react";
import { useEffect, useState } from "react";

interface DeviceData {
  peso: number;
  horaMovimiento: string;
  pesoLastActivity: string;
  horaMovimientoLastActivity: string;
  lastActivity: string;
}

const Dashboard = ({ isAdmin }: { isAdmin: boolean }) => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const UBIDOTS_TOKEN = "BBUS-Er2ldEiDcxgvBocY7CGN2O1mlKSYRF";
  const DEVICE_ID = "672188133634ea12e1adc641"; // ID obtenido de la respuesta de la API
  const API_URL = "https://industrial.api.ubidots.com/api/v1.6";

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);

        // 1. Obtener todas las variables del dispositivo
        const variablesResponse = await fetch(
          `${API_URL}/datasources/${DEVICE_ID}/variables`,
          {
            headers: {
              "X-Auth-Token": UBIDOTS_TOKEN,
              "Content-Type": "application/json",
            },
          },
        );

        if (!variablesResponse.ok) {
          throw new Error("Error al obtener las variables");
        }

        // 2. Transformar la respuesta a JSON
        const variablesData = await variablesResponse.json();

        // 3. Transformar los datos de timestamp a un formato legible
        let dateUpdateMov = new Date(
          variablesData.results[0].last_value.timestamp,
        );
        let dateUpdatePeso = new Date(
          variablesData.results[1].last_value.timestamp,
        );

        // 4. Actualizar el estado con los datos obtenidos
        setDeviceData({
          peso: variablesData.results[1].last_value.value,
          horaMovimiento: variablesData.results[0].last_value.value,
          pesoLastActivity: dateUpdatePeso.toLocaleString(),
          horaMovimientoLastActivity: dateUpdateMov.toLocaleString(),
          lastActivity: new Date().toLocaleString(),
        });

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    // Fetch inicial
    if (isAdmin) {
      fetchDeviceData();
    }

    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      if (isAdmin) {
        fetchDeviceData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <div className="min-h-screen">
      <div className="text-center justify-items-center content-center mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl lg:text-9xl font-semibold text-blue-500">
          {isAdmin ? "Bienvenido Administrador" : "Dashboard"}
        </h1>
        {isAdmin ? (
          <div className="mt-10">
            <h2 className="text-3xl font-medium text-blue-500">
              Datos del Dispositivo:
            </h2>
            <div className="mt-5 p-4 bg-gray-100 rounded-lg shadow-lg">
              {loading ? (
                <p className="text-gray-600">Cargando datos...</p>
              ) : error ? (
                <p className="text-red-500">Error: {error}</p>
              ) : deviceData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-xl font-medium text-gray-800">Peso</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {deviceData.peso} kg
                    </p>
                    <h3 className="text-xl font-medium text-gray-800">
                      Ultima Actualización de Peso
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {deviceData.pesoLastActivity}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-xl font-medium text-gray-800">
                      Hora de Movimiento
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {deviceData.horaMovimiento}
                    </p>
                    <h3 className="text-xl font-medium text-gray-800">
                      Ultima Actualización de Movimiento
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {deviceData.horaMovimientoLastActivity}
                    </p>
                  </div>
                  <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
                    <h3 className="text-xl font-medium text-gray-800">
                      Última Actualización
                    </h3>
                    <p className="text-lg text-gray-600">
                      {deviceData.lastActivity}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No hay datos disponibles</p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-10 text-xl text-red-500">
            No tienes permisos para ver esta sección.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
