// @/components/Dashboard

"use client";
import React from "react";
import { useEffect, useState } from "react";

// Tipos para los datos de Ubidots
interface DeviceData {
  peso: number;
  horaMovimiento: string;
  lastActivity: string;
}

const Dashboard = ({ isAdmin }: { isAdmin: boolean }) => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Constantes para la API de Ubidots
  const UBIDOTS_TOKEN = "BBUS-97b75456bda68f791e6061323c113f01d4d";
  const DEVICE_LABEL = "mqtt-publish-esp32";
  const VARIABLE_PESO = "peso";
  const VARIABLE_HORA = "hora_movimiento";

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);

        // Obtener datos de peso
        const pesoResponse = await fetch(
          `https://industrial.api.ubidots.com/api/v1.6/devices/${DEVICE_LABEL}/${VARIABLE_PESO}/values/?page_size=1`,
          {
            headers: {
              "X-Auth-Token": UBIDOTS_TOKEN,
              "Content-Type": "application/json",
            },
          },
        );
        // console.log(pesoResponse);

        // Obtener datos de hora de movimiento
        const horaResponse = await fetch(
          `https://industrial.api.ubidots.com/api/v1.6/devices/${DEVICE_LABEL}/${VARIABLE_HORA}/values/?page_size=1`,
          {
            headers: {
              "X-Auth-Token": UBIDOTS_TOKEN,
              "Content-Type": "application/json",
            },
          },
        );
        // console.log(horaResponse);

        if (!pesoResponse.ok || !horaResponse.ok) {
          throw new Error("Error al obtener datos de Ubidots");
        }

        const pesoData = await pesoResponse.json();
        const horaData = await horaResponse.json();

        setDeviceData({
          peso: pesoData.results[0].value,
          horaMovimiento: horaData.results[0].value,
          lastActivity: new Date(
            pesoData.results[0].timestamp * 1000,
          ).toLocaleString(),
        });
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

    // Actualizar datos cada 2 minutos
    const interval = setInterval(() => {
      if (isAdmin) {
        fetchDeviceData();
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <div className="min-h-screen">
      <div className="text-center justify-items-center content-center mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-9xl font-semibold text-blue-500">
          {isAdmin ? "Bienvenido Administrador" : "Dashboard pasado de vrg"}
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
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-xl font-medium text-gray-800">
                      Hora de Movimiento
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {deviceData.horaMovimiento}
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
