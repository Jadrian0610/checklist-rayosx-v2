import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Checklist = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [observaciones, setObservaciones] = useState('');

  const [respuestas, setRespuestas] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (step === 1) {
      setFormData({ ...formData, [name]: val });
    } else {
      setRespuestas({ ...respuestas, [name]: val });
    }
  };

  const exportarPDF = () => {
    const input = document.getElementById('checklist-pdf');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Checklist_${formData.nombre || 'cliente'}.pdf`);
    });
  };

  const preguntas = {
    2: [
      { name: 'area_climatizada', label: '¿Área climatizada? (22 ±2 °C)' },
      { name: 'libre_polvo', label: '¿Libre de polvo, humedad y vibraciones?' },
      { name: 'paredes_piso', label: '¿Paredes y pisos lavables y sin grietas?' },
      { name: 'puerta_acceso', label: '¿Puerta de acceso ≥ 1.20 m de ancho?' },
      { name: 'iluminacion', label: '¿Iluminación ≥ 300 lux?' },
    ],
    3: [
      { name: 'tierra_fisica', label: '¿Cuenta con tierra física (≤ 1 Ω)?' },
      { name: 'polaridad_correcta', label: '¿Polaridad correcta?' },
      { name: 'voltaje_estable', label: '¿Voltaje estable dentro del rango del equipo?' },
      { name: 'contacto_exclusivo', label: '¿Contacto eléctrico exclusivo para el equipo?' },
      { name: 'no_multicontacto', label: '¿Evita el uso de multicontactos?' },
    ],
    4: [
      { name: 'estructura_nivelada', label: '¿Estructura nivelada y sin daños visibles?' },
      { name: 'ruedas_bloqueadas', label: '¿Ruedas bloqueadas correctamente?' },
      { name: 'sin_objetos', label: '¿Área sin objetos que obstruyan el acceso o el equipo?' },
      { name: 'espacio_operacion', label: '¿Espacio suficiente para operación y mantenimiento?' },
      { name: 'instalacion_estable', label: '¿Instalación estable sin riesgo de vuelco?' },
    ]
  };

  const totalPreguntas = Object.values(preguntas).flat().length;
  const respuestasValidas = Object.values(respuestas).filter(Boolean).length;
  const porcentaje = Math.round((respuestasValidas / totalPreguntas) * 100);

  const renderPaso = () => {
    if (step === 1) {
      return (
        <div style={styles.section}>
          <h2 style={styles.title}>Datos del Cliente</h2>
          <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} style={styles.input} />
          <input type="text" name="ubicacion" placeholder="Ubicación" onChange={handleChange} style={styles.input} />
          <input type="date" name="fecha" onChange={handleChange} style={styles.input} />
          <input type="text" name="modelo" placeholder="Modelo del equipo" onChange={handleChange} style={styles.input} />
        </div>
      );
    }
    if (step >= 2 && step <= 4) {
      return (
        <div style={styles.section}>
          <h2 style={styles.title}>{
            step === 2 ? 'Infraestructura' :
            step === 3 ? 'Seguridad Eléctrica' : 'Mecánica'
          }</h2>
          {preguntas[step].map((pregunta) => (
            <div key={pregunta.name} style={styles.checkboxContainer}>
              <label>
                <input
                  type="checkbox"
                  name={pregunta.name}
                  checked={!!respuestas[pregunta.name]}
                  onChange={handleChange}
                /> {pregunta.label}
              </label>
            </div>
          ))}
        </div>
      );
    }
    if (step === 5) {
      return (
        <div id="checklist-pdf" style={styles.section}>
          <h2 style={styles.title}>Resultado del Checklist</h2>
          <p style={{ color: porcentaje >= 80 ? 'green' : 'red' }}>
            {porcentaje >= 80 ? '✅ Viable para instalación' : '❌ No viable para instalación'} ({porcentaje}%)
          </p>
          <Bar
            data={{
              labels: ['Viabilidad'],
              datasets: [
                {
                  label: '% Cumplido',
                  data: [porcentaje],
                  backgroundColor: porcentaje >= 80 ? 'green' : 'red'
                }
              ]
            }}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }}
          />
          <textarea
            placeholder="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            style={styles.textarea}
          ></textarea>
        </div>
      );
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Lista de Verificación Rayos X (v2)</h1>
      {renderPaso()}
      <div style={styles.buttonContainer}>
        {step > 1 && step <= 5 && (
          <button onClick={() => setStep(step - 1)} style={styles.button}>Anterior</button>
        )}
        {step < 5 && (
          <button onClick={() => setStep(step + 1)} style={styles.button}>Siguiente</button>
        )}
        {step === 5 && (
          <button onClick={exportarPDF} style={styles.button}>Descargar PDF</button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '40px auto',
    padding: '30px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  section: {
    marginBottom: '20px'
  },
  title: {
    fontSize: '20px',
    marginBottom: '10px'
  },
  input: {
    display: 'block',
    width: '100%',
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  },
  checkboxContainer: {
    marginBottom: '10px'
  },
  textarea: {
    width: '100%',
    height: '100px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginTop: '20px'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default Checklist;




