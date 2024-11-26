// @/components/forms/registerForm

"use client";
import React, { useState } from "react";
import { Lock, Mail, IdCard, User } from "lucide-react";
import { useRouter } from "next/navigation";

// Define an interface for the form data
interface RegisterFormData {
  email: string;
  password: string;
  tokenID: string;
  isAdmin: boolean;
  rememberMe: boolean;
}

const RegisterForm = () => {
  const router = useRouter();

  // State to manage form data
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    tokenID: "",
    isAdmin: false,
    rememberMe: false,
  });

  // State to manage form validation errors
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  // State to manage form submission status
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean | null;
    message: string;
  }>({
    success: null,
    message: "",
  });

  // Handle input changes - update to handle select changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for the field being edited
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };
  // Validate form
  const validateForm = () => {
    const newErrors: Partial<RegisterFormData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 2) {
      newErrors.password = "La contraseña debe tener al menos 2 caracteres";
    }

    // Device ID validation
    if (!formData.tokenID) {
      newErrors.tokenID = "El Device ID es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Simulate registration process
    try {
      const { email, password, tokenID, isAdmin } = formData;
      const token_ubidots = tokenID;
      const is_admin = isAdmin;

      // Fetch a la API para registrar el usuario
      const response = await fetch("http://127.0.0.1:8000/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // aceptar cualquier origen
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          email,
          password,
          token_ubidots,
          is_admin,
        }),
      });

      console.log(response);

      // Simulated user storage (would be replaced by actual API call)
      const mockUserStorage = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]",
      );

      // Check if user already exists
      const userExists = mockUserStorage.some(
        (user: RegisterFormData) => user.email === formData.email,
      );

      if (userExists) {
        setSubmitStatus({
          success: false,
          message: "El correo electrónico ya está registrado",
        });
        return;
      }

      // Add new user to mock storage
      mockUserStorage.push(formData);
      localStorage.setItem("registeredUsers", JSON.stringify(mockUserStorage));

      // Remember me functionality
      if (formData.rememberMe) {
        localStorage.setItem("rememberedUser", formData.email);
      }

      // Success status
      setSubmitStatus({
        success: true,
        message: "Registro exitoso. Bienvenido!",
      });

      // Optional: Reset form after successful submission
      setFormData({
        email: "",
        password: "",
        tokenID: "",
        isAdmin: false,
        rememberMe: false,
      });

      // Navigate to Dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: "Error en el registro. Intente nuevamente.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registrarse
          </h2>
        </div>

        {/* Submit Status Message */}
        {submitStatus.success !== null && (
          <div
            className={`text-center p-3 rounded ${
              submitStatus.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.email
                      ? "border-red-500 text-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Correo electrónico"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            {/* Password Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.password
                      ? "border-red-500 text-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Contraseña"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            {/* Device ID Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IdCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="tokenID"
                  name="tokenID"
                  type="text"
                  value={formData.tokenID}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.tokenID
                      ? "border-red-500 text-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Ubidots Token"
                />
              </div>
              {errors.tokenID && (
                <p className="text-red-500 text-xs mt-1">{errors.tokenID}</p>
              )}
            </div>
            {/* User Type Select */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="isAdmin"
                  name="isAdmin"
                  value={formData.isAdmin ? "1" : "0"}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.isAdmin
                      ? "border-red-500 text-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="0">Usuario</option>
                  <option value="1">Administrador</option>
                </select>
              </div>
              {errors.isAdmin && (
                <p className="text-red-500 text-xs mt-1">{errors.isAdmin}</p>
              )}
            </div>{" "}
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-900"
              >
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
