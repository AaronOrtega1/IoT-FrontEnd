"use client";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isDashboardPage = pathname === "/dashboard";
  const isRegisterPage = pathname === "/register";

  return (
    <nav className="shadow-md">
      <div className="mx-auto px-8">
        <div className="flex justify-between h-16">
          {/* Logo y nombre del sitio */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-blue-500">
              IoT Equipo 5
            </a>
          </div>

          {/* Links de navegación para desktop */}
          {!isLoginPage && !isDashboardPage && !isRegisterPage && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/register"
                // className="px-4 py-2 text-black hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Registrarse
              </Link>
              <Link
                href="/login"
                // className="px-4 py-2 text-black hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          )}

          {/* Botón de menú móvil - solo si no estamos en login ni en dashboard */}
          {!isLoginPage && isDashboardPage && (
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Menú móvil - solo si no estamos en login ni en dashboard*/}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/login"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
