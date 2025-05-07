import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Checklist = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ nombre: "", ubicacion: "", fecha: "", modelo: "" });
  const [responses, setResponses] = useState({});
  const [observaciones, setObservaciones] = useState("");
  const contentRef = useRef();

  const preguntas = {
    2: [
      { id: "paredes", texto: "¿Las paredes están recubiertas con pintura epóxica lavable?" },
      { id: "piso", texto: "¿El piso es nivelado, antideslizante y fácil de limpiar?" },
      { id: "puerta", texto: "¿Las puertas permiten el acceso del equipo sin obstrucciones?" },
      { id: "ventilacion", texto: "¿La sala cuenta con sistema de ventilación adecuado?" },
      { id: "iluminacion", texto: "¿La iluminación es suficiente y sin reflejos directos?" },
    ],
    3: [
      { id: "tierra", texto: "¿Existe una toma a tierra física con resistencia menor a 5 ohms?" },
      { id: "polos", texto: "¿Los contactos tienen polos fase, neutro y tierra claramente identificados?" },
      { id: "voltaje", texto: "¿El voltaje disponible corresponde a las especificaciones del equipo?" },
      { id: "interruptor", texto: "¿Hay un interruptor general exclusivo para el equipo en la sala?" },
    ],
    4: [
      { id: "soporte", texto: "¿El soporte o estructura soporta el peso del equipo?" },
      { id: "espacio_operacion", texto: "¿Existe espacio suficiente para operar sin obstrucciones?" },
      { id: "movilidad", texto: "¿La movilidad del equipo está garantizada dentro de la sala?" },
      { id: "alineacion", texto: "¿Se cuenta con referencias de alineación para la instalación precisa?" },
    ],
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheck = (id) => {
    setResponses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const score = Math.round(
    (Object.values(responses).filter(Boolean).length /
      Object.values(preguntas).flat().length) * 100
  );

  const data = {
    labels: ["Resultado del Checklist"],
    datasets: [
      {
        label: "% Cumplido",
        data: [score],
        backgroundColor: score >= 80 ? "#4caf50" : "#f44336",
      },
    ],
  };

  const downloadPDF = () => {
    html2canvas(contentRef.current).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("checklist-rayosx.pdf");
    });
  };

  const enviarAGoogleSheets = async () => {
    const payload = {
      ...formData,
      porcentaje: score,
      resultado: score >= 80 ? "Viable" : "No viable",
      observaciones: observaciones,
    };

    await fetch("https://script.google.com/macros/s/AKfycbwxxxxxxxxxxxxxx/exec", {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("¡Checklist enviado correctamente!");
  };

  const cardStyle = {
    background: "#fff",
    padding: "25px",
    marginBottom: "25px",
    borderRadius: "15px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "10px"
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
    transition: "background-color 0.3s"
  };

  return (
    <div ref={contentRef} style={{ maxWidth: "800px", margin: "40px auto", fontFamily: "'Segoe UI', sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>🩻 Checklist Preinstalación Sala de Rayos X</h1>

      {step === 1 && (
        <div style={cardStyle}>
          <h2>📋 Datos del cliente</h2>
          <input style={inputStyle} type="text" name="nombre" placeholder="Nombre del cliente" value={formData.nombre} onChange={handleChange} />
          <input style={inputStyle} type="text" name="ubicacion" placeholder="Ubicación" value={formData.ubicacion} onChange={handleChange} />
          <input style={inputStyle} type="date" name="fecha" value={formData.fecha} onChange={handleChange} />
          <input style={inputStyle} type="text" name="modelo" placeholder="Modelo del equipo" value={formData.modelo} onChange={handleChange} />
          <button style={buttonStyle} onClick={() => setStep(2)}>Siguiente</button>
        </div>
      )}

      {step >= 2 && step <= 4 && (
        <div style={cardStyle}>
          <h2>{step === 2 ? "🏗 Infraestructura" : step === 3 ? "⚡ Seguridad eléctrica" : "🛠 Mecánica"}</h2>
          {preguntas[step].map((p) => (
            <label key={p.id} style={{ display: "block", marginBottom: "12px", fontSize: "15px" }}>
              <input type="checkbox" checked={!!responses[p.id]} onChange={() => handleCheck(p.id)} style={{ marginRight: "10px" }} />
              {p.texto}
            </label>
          ))}
          <button style={buttonStyle} onClick={() => setStep(step + 1)}>Siguiente</button>
        </div>
      )}

      {step === 5 && (
        <div style={cardStyle}>
          <h2>📊 Resumen Final</h2>
          <Bar data={data} />
          <p style={{ marginTop: "10px" }}><strong>Resultado:</strong> {score}% - {score >= 80 ? "✅ Viable para instalación" : "❌ No viable aún"}</p>
          <textarea style={{ ...inputStyle, height: "100px" }} placeholder="Observaciones..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          <div style={{ marginTop: "15px" }}>
            <button style={buttonStyle} onClick={downloadPDF}>📥 Descargar PDF</button>
            <button style={{ ...buttonStyle, backgroundColor: "#28a745" }} onClick={enviarAGoogleSheets}>📤 Enviar a Google Sheets</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checklist;


