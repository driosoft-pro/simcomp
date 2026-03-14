const fs = require('fs');

// 1. Types
let types = fs.readFileSync('src/types/index.ts', 'utf8');
types = types.replace(
  "export type UserRole = 'admin' | 'agente' | 'supervisor'",
  "export type UserRole = 'admin' | 'agente' | 'supervisor' | 'ciudadano'"
);
fs.writeFileSync('src/types/index.ts', types);

// 2. UsuariosList.tsx
let list = fs.readFileSync('src/pages/usuarios/UsuariosList.tsx', 'utf8');
list = list.replace(
  "const ROLES: UserRole[] = ['admin', 'supervisor', 'agente']",
  "const ROLES: UserRole[] = ['admin', 'supervisor', 'agente', 'ciudadano']"
);
list = list.replace(
  "agente:\n    'bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700/40',",
  "agente:\n    'bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700/40',\n  ciudadano:\n    'bg-purple-100 text-purple-700 ring-1 ring-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-700/40',"
);

// modal for create
list = list.replace(
  /\{\/\* Formulario nuevo usuario \*\/\}\s*\{showForm && \(\s*<form[\s\S]*?<\/form>\s*\)\}/,
  `{/* Formulario nuevo usuario (Modal) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">Crear nuevo usuario</p>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">{formError}</p>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  required
                  value={form.username}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="rol">
                  Rol
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 hover:shadow disabled:opacity-60 dark:bg-rose-500 dark:hover:bg-rose-600"
              >
                {createMutation.isPending ? 'Guardando…' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      )}`
);

// fix list buttons to match rounded-xl style
list = list.replace(
  /className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1\.5/g,
  'className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2'
);

fs.writeFileSync('src/pages/usuarios/UsuariosList.tsx', list);


// 3. UsuarioDetail.tsx
let detail = fs.readFileSync('src/pages/usuarios/UsuarioDetail.tsx', 'utf8');

detail = detail.replace(
  "import { useState } from 'react'",
  "import { useState, useEffect } from 'react'"
);

detail = detail.replace(
  "const ROLES: UserRole[] = ['admin', 'supervisor', 'agente']",
  "const ROLES: UserRole[] = ['admin', 'supervisor', 'agente', 'ciudadano']"
);

detail = detail.replace(
  "agente:\n    'bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700/40',",
  "agente:\n    'bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700/40',\n  ciudadano:\n    'bg-purple-100 text-purple-700 ring-1 ring-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-700/40',"
);

// add useEffect
detail = detail.replace(
  "const [estadoSuccess, setEstadoSuccess] = useState(false)",
  `const [estadoSuccess, setEstadoSuccess] = useState(false)

  useEffect(() => {
    if (usuario) {
      setEditForm({
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol,
      })
    }
  }, [usuario])`
);

// style updates for edit forms inputs and buttons
detail = detail.replace(
  /rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200/g,
  "rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-rose-500 dark:focus:bg-slate-800 dark:focus:ring-rose-500/20"
);

detail = detail.replace(
  /rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200/g,
  "rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-amber-500 dark:focus:bg-slate-800 dark:focus:ring-amber-500/20"
);

detail = detail.replace(
  /inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600/g,
  "inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 hover:shadow disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600"
);

detail = detail.replace(
  /inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50/g,
  "inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 hover:shadow disabled:opacity-50"
);

// Form styling
detail = detail.replace(
  /className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"/g,
  'className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-5"'
);

// Add space-y-5
detail = detail.replace(
  /<div className="flex flex-col gap-1\.5">/g,
  '<div className="flex flex-col gap-2">'
);

fs.writeFileSync('src/pages/usuarios/UsuarioDetail.tsx', detail);

