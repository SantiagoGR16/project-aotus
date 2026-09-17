/* =====================================================================
   AOTUS — Datos del prototipo demostrativo
   ---------------------------------------------------------------------
   Todos los valores de este archivo son FICTICIOS y se usan únicamente
   para demostrar cómo funcionaría la herramienta con datos reales.

   Estructura pensada para ser reemplazada en el futuro por fuentes de
   datos públicas: DANE, SECOP, CHIP / Ministerio de Hacienda, entre otras.
   Para conectar una fuente real basta con reemplazar el contenido de
   estas variables por los datos obtenidos desde la API oficial.
   ===================================================================== */

window.AotusData = {
  /* Etiqueta que debe acompañar a todos los datos demo */
  notice: "DATOS DE PRÁCTICA — NO OFICIALES",

  /* Municipalidad protagonista del prototipo */
  municipality: {
    name: "El Rosal",
    department: "Cundinamarca",
    full: "El Rosal, Cundinamarca",
    /* Posición aproximada dentro del mapa SVG (coordenadas viewBox) */
    map: { x: 858, y: 962 }
  },

  /* Opciones del selector de municipio.
     Los demás municipios aparecen como "próximamente" porque el
     prototipo solo incluye datos de práctica para El Rosal. */
  cities: [
    { value: "el-rosal", label: "El Rosal, Cundinamarca", available: true },
    { value: "subachoque", label: "Subachoque, Cundinamarca", available: false },
    { value: "tenjo", label: "Tenjo, Cundinamarca", available: false },
    { value: "madrid", label: "Madrid, Cundinamarca", available: false }
  ],

  /* ==============================================================
     1. RESULTADO / KPI principales
     ============================================================== */
  dashboard: {
    cards: [
      {
        label: "Dependencia del SGP",
        value: "68,4%",
        tag: "Alta dependencia",
        note: "Dato ficticio.",
        tone: "alert"
      },
      {
        label: "Ejecución presupuestal",
        value: "82,7%",
        tag: "Buen nivel de ejecución",
        note: "Dato ficticio.",
        tone: "ok"
      },
      {
        label: "Contratos analizados",
        value: "1.284",
        tag: "Periodo demostrativo",
        note: "Dato ficticio.",
        tone: "neutral"
      },
      {
        label: "Alertas identificadas",
        value: "17",
        tag: "Requieren revisión",
        note: "Dato ficticio.",
        tone: "warn"
      }
    ],

    /* Gráfico 1 — Dependencia fiscal */
    dependencia: {
      title: "Evolución de la dependencia fiscal",
      text: "La dependencia muestra una tendencia descendente en el periodo analizado.",
      note: "Interpretación demostrativa basada en datos ficticios.",
      series: [
        { label: "2023", value: 72 },
        { label: "2024", value: 70 },
        { label: "2025", value: 68.4 }
      ]
    },

    /* Gráfico 2 — Modalidades de contratación */
    modalidades: {
      title: "Distribución de modalidades de contratación",
      note: "Datos de práctica sobre contratos ficticios.",
      alertTitle: "Alerta de revisión",
      alertText:
        "La contratación directa representa una proporción relevante del total analizado. Se recomienda revisar su comportamiento y evolución antes de sacar conclusiones.",
      data: [
        { label: "Contratación directa", value: 42 },
        { label: "Mínima cuantía", value: 18 },
        { label: "Selección abreviada", value: 24 },
        { label: "Licitación pública", value: 16 }
      ]
    },

    /* Sección "¿Qué significa esto?" */
    meaning: {
      title: "¿Qué significa esto?",
      blocks: [
        {
          title: "¿Qué encontramos?",
          text: "El municipio presenta una alta dependencia de recursos externos en este escenario demostrativo.",
          note: "Ejemplo demostrativo."
        },
        {
          title: "¿Por qué importa?",
          text: "Una mayor dependencia puede limitar el margen de maniobra fiscal del municipio.",
          note: "Ejemplo demostrativo."
        },
        {
          title: "¿Qué podría hacer el municipio?",
          text: "Revisar fuentes de ingresos propios, comparar su situación con municipios similares y priorizar acciones para mejorar su autonomía fiscal.",
          note: "Ejemplo demostrativo."
        }
      ]
    }
  },

  /* ==============================================================
     2. SEGURIDAD CIUDADANA (pestaña)
     ============================================================== */
  seguridad: {
    title: "Seguridad ciudadana",
    indicators: [
      { label: "Hurtos", value: "184", note: "Dato ficticio." },
      { label: "Violencia intrafamiliar", value: "97", note: "Dato ficticio." },
      { label: "Lesiones personales", value: "63", note: "Dato ficticio." },
      { label: "Homicidios", value: "4", note: "Dato ficticio." }
    ],
    recomendationTitle: "Recomendación",
    recomendationText:
      "La herramienta permite identificar tendencias territoriales y priorizar dónde profundizar el análisis.",
    /* Evolución mensual ficticia (12 meses). Tonos y valores de práctica. */
    monthly: {
      note: "Evolución mensual demostrativa — no corresponde a cifras oficiales.",
      months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      series: [
        { label: "Hurtos", values: [16, 14, 17, 15, 12, 14, 16, 18, 15, 17, 14, 16] },
        { label: "Violencia intrafamiliar", values: [8, 7, 9, 8, 7, 8, 9, 8, 7, 9, 8, 9] },
        { label: "Lesiones personales", values: [5, 6, 4, 6, 5, 5, 6, 4, 6, 5, 6, 5] },
        { label: "Homicidios", values: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0] }
      ]
    }
  },

  /* ==============================================================
     3. CONTRATACIÓN PÚBLICA (pestaña)
     ============================================================== */
  contratacion: {
    title: "Contratación pública",
    indicators: [
      { label: "Total de contratos", value: "1.284", note: "Dato ficticio." },
      { label: "Valor total", value: "$24.800 millones COP", note: "Dato ficticio." },
      { label: "Contratación directa", value: "42%", note: "Dato ficticio." },
      { label: "Alertas para revisión", value: "17", note: "Dato ficticio." }
    ],
    fakeTableNote: "Contratos ficticios creados exclusivamente para este prototipo.",
    contracts: [
      { contract: "Contrato 001", modality: "Directa", value: "$180 M", duration: "12 meses", signal: "Revisar", tone: "alert" },
      { contract: "Contrato 002", modality: "Mínima cuantía", value: "$42 M", duration: "3 meses", signal: "Normal", tone: "ok" },
      { contract: "Contrato 003", modality: "Directa", value: "$310 M", duration: "10 meses", signal: "Revisar", tone: "alert" }
    ]
  },

  /* ==============================================================
     4. COMPARACIÓN CON MUNICIPIOS SIMILARES (pestaña)
     ============================================================== */
  comparacion: {
    title: "¿Cómo está el municipio frente a otros similares?",
    text:
      "Compararse con municipios similares permite entender mejor si un indicador es realmente preocupante o simplemente responde a las características del territorio.",
    note: "Comparación demostrativa basada en datos ficticios.",
    rows: [
      { indicator: "Dependencia SGP", rosal: "68,4%", peers: "64,1%" },
      { indicator: "Ejecución presupuestal", rosal: "82,7%", peers: "79,5%" },
      { indicator: "Contratación directa", rosal: "42%", peers: "35%" }
    ]
  },

  /* ==============================================================
     5. INDICADOR / validador de despliegue (no visible)
     ============================================================== */
  meta: {
    demoDisclaimer:
      "Prototipo demostrativo. Los datos utilizados son ficticios y únicamente sirven para mostrar cómo funcionaría AOTUS.",
    sources:
      "Futuras fuentes de datos: DANE, SECOP, CHIP del Ministerio de Hacienda y registros territoriales."
  }
};