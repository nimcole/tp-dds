import React, { useState, useEffect } from 'react';
import { solicitudesService } from '../services/solicitudes.service.js';
import { equiposService } from '../services/equipos.service.js';

const SolicitudForm = ({ alCrearExito }) => {
  const [formData, setFormData] = useState({
    equipoId: '',
    fechaRetiro: '',
    fechaDevolucion: '',
    motivo: ''
  });

  const [equipos, setEquipos] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEquipos, setLoadingEquipos] = useState(true);

  // Cargar equipos disponibles al montar el componente
  useEffect(() => {
    const cargarEquipos = async () => {
      try {
        const datos = await equiposService.getDisponibles();
        setEquipos(datos);
      } catch (err) {
        console.error('Error cargando equipos:', err);
        setEquipos([]);
      } finally {
        setLoadingEquipos(false);
      }
    };
    cargarEquipos();
  }, []);

  // Validación de fechas en tiempo real
  const validarFechas = (retiro, devolucion) => {
    const nuevosErrors = {};
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (retiro) {
      const fechaRetiro = new Date(retiro);
      if (fechaRetiro < hoy) {
        nuevosErrors.fechaRetiro = 'La fecha de retiro no puede ser anterior a hoy';
      }
    }

    if (retiro && devolucion) {
      const fechaRetiro = new Date(retiro);
      const fechaDevolucion = new Date(devolucion);

      if (fechaDevolucion <= fechaRetiro) {
        nuevosErrors.fechaDevolucion = 'La fecha de devolución debe ser posterior a la fecha de retiro';
      }
    }

    setErrors(nuevosErrors);
    return Object.keys(nuevosErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validar fechas cuando se cambien
    if (name === 'fechaRetiro' || name === 'fechaDevolucion') {
      const nuevoFormData = {
        ...formData,
        [name]: value
      };
      validarFechas(nuevoFormData.fechaRetiro, nuevoFormData.fechaDevolucion);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validación final
    if (!validarFechas(formData.fechaRetiro, formData.fechaDevolucion)) {
      return;
    }

    if (!formData.equipoId || !formData.motivo) {
      setError('Por favor completá todos los campos');
      return;
    }

    setLoading(true);

    try {
      const datosAEnviar = {
        equipoId: parseInt(formData.equipoId),
        fechaRetiro: formData.fechaRetiro,
        fechaDevolucion: formData.fechaDevolucion,
        motivo: formData.motivo
      };

      await solicitudesService.create(datosAEnviar);

      // Limpiar formulario
      setFormData({
        equipoId: '',
        fechaRetiro: '',
        fechaDevolucion: '',
        motivo: ''
      });
      setErrors({});

      // Notificar al padre
      if (alCrearExito) alCrearExito();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Error al crear la solicitud. Verificá los datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  const obtenerFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  return (
    <div
      style={{
        backgroundColor: '#222',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px',
        color: '#fff'
      }}
    >
      <h3 style={{ marginTop: 0 }}>Nueva Solicitud de Equipo</h3>

      {error && (
        <div
          style={{
            color: '#ff4d4d',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: 'rgba(255, 77, 77, 0.1)',
            borderRadius: '4px'
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Selección de Equipo */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Equipo *
          </label>
          {loadingEquipos ? (
            <p style={{ color: '#aaa' }}>Cargando equipos...</p>
          ) : equipos.length === 0 ? (
            <p style={{ color: '#ff4d4d' }}>No hay equipos disponibles</p>
          ) : (
            <select
              name="equipoId"
              value={formData.equipoId}
              onChange={handleChange}
              required
              style={{
                padding: '10px',
                width: '100%',
                borderRadius: '4px',
                border: '1px solid #444',
                backgroundColor: '#333',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Seleccionar equipo --</option>
              {equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre} (ID: {equipo.id})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Fecha Retiro */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Fecha de Retiro *
          </label>
          <input
            type="date"
            name="fechaRetiro"
            value={formData.fechaRetiro}
            onChange={handleChange}
            min={obtenerFechaMinima()}
            required
            style={{
              padding: '10px',
              width: '100%',
              borderRadius: '4px',
              border: errors.fechaRetiro ? '2px solid #ff4d4d' : '1px solid #444',
              backgroundColor: '#333',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
          {errors.fechaRetiro && (
            <p style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '5px' }}>
              ❌ {errors.fechaRetiro}
            </p>
          )}
        </div>

        {/* Fecha Devolución */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Fecha de Devolución *
          </label>
          <input
            type="date"
            name="fechaDevolucion"
            value={formData.fechaDevolucion}
            onChange={handleChange}
            min={
              formData.fechaRetiro
                ? new Date(new Date(formData.fechaRetiro).getTime() + 86400000)
                    .toISOString()
                    .split('T')[0]
                : obtenerFechaMinima()
            }
            required
            style={{
              padding: '10px',
              width: '100%',
              borderRadius: '4px',
              border: errors.fechaDevolucion ? '2px solid #ff4d4d' : '1px solid #444',
              backgroundColor: '#333',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
          {errors.fechaDevolucion && (
            <p style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '5px' }}>
              ❌ {errors.fechaDevolucion}
            </p>
          )}
        </div>

        {/* Motivo */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Motivo *
          </label>
          <textarea
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            required
            placeholder="Explicá brevemente el motivo del préstamo..."
            style={{
              padding: '10px',
              width: '100%',
              minHeight: '80px',
              borderRadius: '4px',
              border: '1px solid #444',
              backgroundColor: '#333',
              color: '#fff',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={loading || Object.keys(errors).length > 0}
          style={{
            padding: '12px 24px',
            backgroundColor: Object.keys(errors).length > 0 ? '#666' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: Object.keys(errors).length > 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: Object.keys(errors).length > 0 ? 0.6 : 1
          }}
        >
          {loading ? 'Enviando...' : 'Pedir Equipo'}
        </button>
      </form>
    </div>
  );
};

export default SolicitudForm;