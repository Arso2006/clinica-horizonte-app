import { FormEvent, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type Patient = {
  id: string;
  personal_identifier: string;
  first_names: string;
  last_names: string;
};

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setStatus("No pudimos validar el acceso. Revisa tus datos e inténtalo de nuevo.");
        return;
      }

      const data = await response.json();
      setToken(data.access_token);
      setPassword("");
    } catch {
      setStatus("No fue posible conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch(`${API_URL}/api/v1/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setStatus("No se pudo consultar la lista de pacientes.");
        return;
      }

      const data = await response.json();
      setPatients(data.items ?? []);
    } catch {
      setStatus("No fue posible conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    setPatients([]);
    setStatus("");
  };

  if (token) {
    return (
      <main className="workspace">
        <header className="workspace-header">
          <a className="wordmark wordmark-dark" href="/" aria-label="Clínica Horizonte, inicio">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span>Clínica <strong>Horizonte</strong></span>
          </a>
          <div className="workspace-user">
            <span className="session-indicator"><span /> Sesión activa</span>
            <button className="text-button" onClick={logout}>Cerrar sesión</button>
          </div>
        </header>

        <section className="patients-view">
          <div className="page-kicker"><span className="kicker-line" /> ÁREA CLÍNICA</div>
          <div className="page-heading">
            <div>
              <h1>Pacientes</h1>
              <p>Directorio de pacientes registrados</p>
            </div>
            <button className="primary-button refresh-button" onClick={fetchPatients} disabled={isLoading}>
              <span aria-hidden="true">↻</span>{isLoading ? "Cargando..." : "Actualizar lista"}
            </button>
          </div>

          {status && <p className="feedback" role="status">{status}</p>}

          <div className="patient-table-wrap">
            <table className="patient-table">
              <thead>
                <tr><th>Paciente</th><th>Identificador</th><th /></tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td className="empty-state" colSpan={3}>Selecciona “Actualizar lista” para consultar los registros.</td></tr>
                ) : patients.map((patient) => (
                  <tr key={patient.id}>
                    <td><span className="patient-avatar">{patient.first_names.charAt(0)}{patient.last_names.charAt(0)}</span>{patient.first_names} {patient.last_names}</td>
                    <td className="patient-id">{patient.personal_identifier}</td>
                    <td className="row-arrow" aria-hidden="true">↗</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="login-shell">
      <section className="brand-panel" aria-label="Clínica Horizonte">
        <div className="brand-panel-texture" aria-hidden="true" />
        <a className="wordmark wordmark-light" href="/" aria-label="Clínica Horizonte, inicio">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>Clínica <strong>Horizonte</strong></span>
        </a>

        <div className="brand-message">
          <p className="eyebrow"><span /> PORTAL CLÍNICO</p>
          <h1>Un espacio<br />para cuidar<br /><em>mejor.</em></h1>
          <div className="brand-rule" />
          <p className="brand-caption">CLÍNICA HORIZONTE <span>·</span> ATENCIÓN Y SALUD</p>
        </div>

        <div className="brand-footer">
          <span>Acceso para personal autorizado</span>
          <span className="footer-mark" aria-hidden="true">CH / 01</span>
        </div>
        <div className="brand-art" aria-hidden="true">
          <div className="art-ring art-ring-one" />
          <div className="art-ring art-ring-two" />
          <div className="art-block" />
          <div className="art-cross"><span /><span /></div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-top"><span>PLATAFORMA DE SALUD</span><span className="login-index">01 — 01</span></div>
        <div className="login-content">
          <div className="login-heading-mark" aria-hidden="true"><span /></div>
          <p className="login-overline">BIENVENIDO/A</p>
          <h2>Iniciar sesión</h2>
          <p className="login-description">Ingresa con tu cuenta institucional para continuar.</p>

          <form className="login-form" onSubmit={login}>
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden="true">✳</span>
              <input id="email" type="email" autoComplete="username" placeholder="nombre@clinica.cl" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div className="password-label-row">
              <label htmlFor="password">Contraseña</label>
            </div>
            <div className="input-wrap">
              <span className="input-icon lock-icon" aria-hidden="true">⌑</span>
              <input id="password" type="password" autoComplete="current-password" placeholder="Ingresa tu contraseña" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>

            {status && <p className="feedback login-feedback" role="alert">{status}</p>}
            <button className="primary-button login-submit" type="submit" disabled={isLoading}>
              <span>{isLoading ? "Verificando acceso..." : "Ingresar al portal"}</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </button>
          </form>
          <p className="privacy-note"><span aria-hidden="true">✳</span> Tus datos de acceso se mantienen protegidos.</p>
        </div>
        <div className="login-panel-footer"><span>© Clínica Horizonte</span><span>ENTORNO CLÍNICO</span></div>
      </section>
    </main>
  );
}
