// @/components/Dashboard

"use client";
import React from "react";
import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";

interface DeviceVariable {
  last_value: {
    value: number;
    timestamp: number;
  };
  datasource: {
    name: string;
  };
}

interface DeviceData {
  deviceId: string;
  deviceName: string;
  peso: number;
  horaMovimiento: string;
  pesoLastActivity: string;
  horaMovimientoLastActivity: string;
  lastActivity: string;
}

interface RegisteredUser {
  email: string;
  password: string;
  tokenID: string;
  isAdmin: boolean;
  rememberMe: boolean;
}

const Dashboard = () => {
  const [devicesData, setDevicesData] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserFromLocalStorage = (): RegisteredUser | null => {
    const storedData = localStorage.getItem("registeredUsers");
    if (storedData) {
      try {
        const users = JSON.parse(storedData);
        return users[0];
      } catch (e) {
        console.error("Error al obtener los datos del localStorage", e);
        return null;
      }
    }
    return null;
  };

  const userData = getUserFromLocalStorage();
  const isAdmin = userData?.isAdmin ?? false;
  const UBIDOTS_TOKEN = userData?.tokenID ?? "";
  const API_URL = "https://industrial.api.ubidots.com/api/v1.6";

  useEffect(() => {
    const fetchAllDevicesData = async () => {
      try {
        setLoading(true);

        // 1. Obtener todos los dispositivos
        const devicesResponse = await fetch(`${API_URL}/datasources`, {
          headers: {
            "X-Auth-Token": UBIDOTS_TOKEN,
            "Content-Type": "application/json",
          },
        });

        if (!devicesResponse.ok) {
          throw new Error("Error al obtener los dispositivos");
        }

        const devicesData = await devicesResponse.json();

        // 2. Para cada dispositivo, obtener sus variables
        const devicesPromises = devicesData.results.map(async (device: any) => {
          const variablesResponse = await fetch(
            `${API_URL}/datasources/${device.id}/variables`,
            {
              headers: {
                "X-Auth-Token": UBIDOTS_TOKEN,
                "Content-Type": "application/json",
              },
            },
          );

          if (!variablesResponse.ok) {
            throw new Error(`Error al obtener variables para ${device.name}`);
          }

          const variablesData = await variablesResponse.json();
          const variables = variablesData.results;

          // Asumiendo que la primera variable es horaMovimiento y la segunda es peso
          const dateUpdateMov = new Date(
            variables[0]?.last_value?.timestamp || 0,
          );
          const dateUpdatePeso = new Date(
            variables[1]?.last_value?.timestamp || 0,
          );

          return {
            deviceId: device.id,
            deviceName: device.name,
            peso:
              variables[1]?.last_value?.value < 0
                ? 0
                : variables[1]?.last_value?.value || 0,
            horaMovimiento: variables[0]?.last_value?.value || "No disponible",
            pesoLastActivity: dateUpdatePeso.toLocaleString(),
            horaMovimientoLastActivity: dateUpdateMov.toLocaleString(),
            lastActivity: new Date().toLocaleString(),
          };
        });

        const allDevicesData = await Promise.all(devicesPromises);
        setDevicesData(allDevicesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    // Fetch inicial
    if (!isAdmin) {
      fetchAllDevicesData();

      // Actualizar datos cada 30 segundos
      const interval = setInterval(fetchAllDevicesData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, UBIDOTS_TOKEN]);

  return (
    <div className="min-h-screen">
      <div className="text-center justify-items-center content-center mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl lg:text-9xl font-semibold text-blue-500">
          {!isAdmin ? "Dashboard" : "Dashboard Administrador"}
        </h1>
        {!isAdmin ? (
          <div className="mt-10">
            <h2 className="text-3xl font-medium text-blue-500">
              Datos de los Dispositivos:
            </h2>
            <div className="mt-5 grid gap-8">
              {loading ? (
                <p className="text-gray-600">Cargando datos...</p>
              ) : error ? (
                <p className="text-red-500">Error: {error}</p>
              ) : devicesData.length > 0 ? (
                devicesData.map((device) => (
                  <div
                    key={device.deviceId}
                    className="p-4 bg-gray-100 rounded-lg shadow-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
                        <h3 className="text-xl font-medium text-gray-800">
                          Nombre del Dispositivo
                        </h3>
                        <p className="text-lg text-gray-600">
                          {device.deviceName}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-xl font-medium text-gray-800">
                          Peso
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                          {device.peso} kg
                        </p>
                        <h3 className="text-xl font-medium text-gray-800">
                          Ultima Actualización de Peso
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                          {device.pesoLastActivity}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-xl font-medium text-gray-800">
                          Hora de Movimiento
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                          {device.horaMovimiento}
                        </p>
                        <h3 className="text-xl font-medium text-gray-800">
                          Ultima Actualización de Movimiento
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                          {device.horaMovimientoLastActivity}
                        </p>
                      </div>
                      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
                        <h3 className="text-xl font-medium text-gray-800">
                          Última Actualización
                        </h3>
                        <p className="text-lg text-gray-600">
                          {device.lastActivity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No hay datos disponibles</p>
              )}
            </div>
          </div>
        ) : (
          <AdminDashboard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
