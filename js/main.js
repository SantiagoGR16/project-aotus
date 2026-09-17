/* =====================================================================
   AOTUS — Lógica del prototipo
   ---------------------------------------------------------------------
   Pinta el dashboard, las pestañas, el mapa y el formulario usando los
   datos de data.js. Todo el contenido dinámico sale de variables para
   que luego se pueda conectar a fuentes oficiales sin tocar el HTML.
   ===================================================================== */

(function () {
  "use strict";

  var D = window.AotusData;
  var NS = "http://www.w3.org/2000/svg";
  var chartInits = {
    "chart-dependencia": { type: "line", cfg: null },
    "chart-modalidades": { type: "bar", cfg: null },
    "chart-seguridad-mensual": { type: "multi", cfg: null }
  };
  var chartDone = {};
  var seriesColors = ["#1d4ed8", "#64748b", "#94a3b8", "#b45309"];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ------------------------------------------------------------------
     Etiquetas "DATOS DE PRÁCTICA — NO OFICIALES" desde data.js
     ------------------------------------------------------------------ */
  function fillNotices() {
    var els = document.querySelectorAll(".js-notice");
    for (var i = 0; i < els.length; i++) els[i].textContent = D.notice;
  }

  /* ------------------------------------------------------------------
     Navegación móvil
     ------------------------------------------------------------------ */
  function initNav() {
    var burger = document.getElementById("nav-toggle");
    var menu = document.getElementById("nav-menu");
    if (!burger || !menu) return;
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ------------------------------------------------------------------
     Pestañas del dashboard
     ------------------------------------------------------------------ */
  function initTabs() {
    var tabs = document.querySelectorAll("[data-tab]");
    function select(tabId, scroll) {
      var btn = document.querySelector('.tab[data-tab="' + tabId + '"]');
      var panel = document.querySelector('.panel[data-panel="' + tabId + '"]');
      if (!btn || !panel) return;
      document.querySelectorAll(".tab").forEach(function (t) {
        var active = t === btn;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      document.querySelectorAll(".panel").forEach(function (p) {
        p.classList.toggle("active", p === panel);
      });
      renderChartsFor(tabId);
      if (scroll) {
        var sec = document.getElementById("diagnostico");
        if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () { select(btn.getAttribute("data-tab"), true); });
    });
    // Enlaces del menú superior hacia pestañas
    document.querySelectorAll(".js-tab-link").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        select(a.getAttribute("data-tab"), true);
      });
    });
    window.__aotusSelectTab = select;
  }

  /* ------------------------------------------------------------------
     KPI cards (resumen fiscal)
     ------------------------------------------------------------------ */
  function renderDashboard() {
    var grid = document.getElementById("kpi-grid");
    if (!grid) return;
    grid.innerHTML = D.dashboard.cards.map(function (c) {
      return '<article class="kpi-card tone-' + esc(c.tone) + '">' +
        '<div class="kpi-head"><span class="kpi-label">' + esc(c.label) + '</span></div>' +
        '<div class="kpi-value">' + esc(c.value) + '</div>' +
        '<div class="kpi-tag">' + esc(c.tag) + '</div>' +
        '<div class="kpi-note">' + esc(c.note) + '</div>' +
        '</article>';
    }).join("");

    // Gráfico 1 — contexto
    var ctx1 = document.getElementById("dependencia-text");
    if (ctx1) ctx1.textContent = D.dashboard.dependencia.text;
    var nt1 = document.getElementById("dependencia-note");
    if (nt1) nt1.textContent = D.dashboard.dependencia.note;
    var tt1 = document.getElementById("dependencia-title");
    if (tt1) tt1.textContent = D.dashboard.dependencia.title;

    // Gráfico 2 — contexto y alerta
    var tt2 = document.getElementById("modalidades-title");
    if (tt2) tt2.textContent = D.dashboard.modalidades.title;
    var nt2 = document.getElementById("modalidades-note");
    if (nt2) nt2.textContent = D.dashboard.modalidades.note;
    var at = document.getElementById("alert-title");
    if (at) at.textContent = D.dashboard.modalidades.alertTitle;
    var atx = document.getElementById("alert-text");
    if (atx) atx.textContent = D.dashboard.modalidades.alertText;

    // ¿Qué significa esto?
    if (D.dashboard.meaning) {
      var meanTitle = document.getElementById("meaning-title");
      if (meanTitle) meanTitle.textContent = D.dashboard.meaning.title;
      var wrap = document.getElementById("meaning-blocks");
      if (wrap) {
        wrap.innerHTML = D.dashboard.meaning.blocks.map(function (b) {
          return '<article class="meaning-block">' +
            '<span class="meaning-num"></span>' +
            '<h3>' + esc(b.title) + '</h3>' +
            '<p>' + esc(b.text) + '</p>' +
            '<small>' + esc(b.note) + '</small>' +
            '</article>';
        }).join("");
        var nums = wrap.querySelectorAll(".meaning-num");
        nums.forEach(function (n, i) { n.textContent = String(i + 1).padStart(2, "0"); });
      }
    }

    // Fuentes futuras
    var src = document.getElementById("sources-note");
    if (src) src.textContent = D.meta.sources;

    chartInits["chart-dependencia"].cfg = {
      title: D.dashboard.dependencia.title,
      unit: "%",
      series: D.dashboard.dependencia.series
    };
    chartInits["chart-modalidades"].cfg = {
      title: D.dashboard.modalidades.title,
      unit: "%",
      highlight: [0],
      data: D.dashboard.modalidades.data.map(function (d) {
        return {
          label: d.label,
          pct: d.value + "%",
          labelShort: (d.label.split(" ")[0] === "Contratación")
            ? d.label.replace("Contratación ", "")
            : d.label.replace("Licitación pública", "Licitación"),
          value: d.value
        };
      })
    };
  }

  /* ------------------------------------------------------------------
     Selector de municipio
     ------------------------------------------------------------------ */
  function renderMunicipios() {
    var sel = document.getElementById("municipio");
    if (!sel) return;
    sel.innerHTML = D.cities.map(function (c) {
      return '<option value="' + esc(c.value) + '"' + (c.available ? "" : " disabled") + '>' +
        esc(c.available ? c.label : c.label + " · próximamente") + '</option>';
    }).join("");
    sel.value = "el-rosal";
  }

  /* ------------------------------------------------------------------
     Seguridad ciudadana
     ------------------------------------------------------------------ */
  function renderSeguridad() {
    if (!D.seguridad) return;
    var t = document.getElementById("seguridad-title");
    if (t) t.textContent = D.seguridad.title;
    var rtl = document.getElementById("seguridad-rec-title");
    if (rtl) rtl.textContent = D.seguridad.recomendationTitle;
    var rtx = document.getElementById("seguridad-rec-text");
    if (rtx) rtx.textContent = D.seguridad.recomendationText;

    var grid = document.getElementById("seguridad-kpis");
    if (grid) {
      grid.innerHTML = D.seguridad.indicators.map(function (k) {
        return '<article class="kpi-card tone-neutral">' +
          '<div class="kpi-label">' + esc(k.label) + '</div>' +
          '<div class="kpi-value">' + esc(k.value) + '</div>' +
          '<div class="kpi-note">' + esc(k.note) + '</div>' +
          '</article>';
      }).join("");
    }

    var nm = document.getElementById("seguridad-chart-note");
    if (nm) nm.textContent = D.seguridad.monthly.note;

    chartInits["chart-seguridad-mensual"].cfg = {
      title: "Evolución mensual demostrativa",
      months: D.seguridad.monthly.months,
      series: D.seguridad.monthly.series.map(function (s, i) {
        return { label: s.label, values: s.values, color: seriesColors[i % seriesColors.length] };
      })
    };
  }

  /* ------------------------------------------------------------------
     Contratación pública
     ------------------------------------------------------------------ */
  function renderContratacion() {
    if (!D.contratacion) return;
    var t = document.getElementById("contratacion-title");
    if (t) t.textContent = D.contratacion.title;

    var grid = document.getElementById("contratacion-kpis");
    if (grid) {
      grid.innerHTML = D.contratacion.indicators.map(function (k) {
        return '<article class="kpi-card tone-neutral">' +
          '<div class="kpi-label">' + esc(k.label) + '</div>' +
          '<div class="kpi-value">' + esc(k.value) + '</div>' +
          '<div class="kpi-note">' + esc(k.note) + '</div>' +
          '</article>';
      }).join("");
    }

    var note = document.getElementById("contratacion-fake-note");
    if (note) note.textContent = D.contratacion.fakeTableNote;

    var body = document.getElementById("contratacion-table-body");
    if (body) {
      body.innerHTML = D.contratacion.contracts.map(function (c) {
        return '<tr>' +
          '<td>' + esc(c.contract) + '</td>' +
          '<td>' + esc(c.modality) + '</td>' +
          '<td class="num">' + esc(c.value) + '</td>' +
          '<td class="num">' + esc(c.duration) + '</td>' +
          '<td><span class="signal signal-' + esc(c.tone) + '">' + esc(c.signal) + '</span></td>' +
          '</tr>';
      }).join("");
    }
  }

  /* ------------------------------------------------------------------
     Comparación con municipios similares
     ------------------------------------------------------------------ */
  function renderComparacion() {
    if (!D.comparacion) return;
    var t = document.getElementById("comparacion-title");
    if (t) t.textContent = D.comparacion.title;
    var tx = document.getElementById("comparacion-text");
    if (tx) tx.textContent = D.comparacion.text;
    var nt = document.getElementById("comparacion-note");
    if (nt) nt.textContent = D.comparacion.note;

    var labels = document.getElementById("comparacion-rows");
    if (labels) {
      var rows = D.comparacion.rows.map(function (r) {
        return '<tr>' +
          '<td>' + esc(r.indicator) + '</td>' +
          '<td class="num strong">' + esc(r.rosal) + '</td>' +
          '<td class="num">' + esc(r.peers) + '</td>' +
          '</tr>';
      }).join("");
      var h = document.getElementById("comparacion-header");
      h.innerHTML = "<tr><th>Indicador</th><th>" + esc(D.municipality.name) +
        "</th><th>Promedio municipios similares</th></tr>";
      labels.innerHTML = rows;
    }
  }

  /* ------------------------------------------------------------------
     Gráficos (render perezoso por pestaña)
     ------------------------------------------------------------------ */
  function renderChartsFor(tabId) {
    var ids = { resumen: ["chart-dependencia", "chart-modalidades"], seguridad: ["chart-seguridad-mensual"] }[tabId] || [];
    ids.forEach(function (id) {
      if (!chartDone[id] && chartInits[id].cfg) {
        AotusCharts.create(chartInits[id].type, id, chartInits[id].cfg);
        chartDone[id] = true;
      }
    });
  }

  /* ------------------------------------------------------------------
     Mapa: carga el SVG público de Colombia y resalta El Rosal
     ------------------------------------------------------------------ */
  function loadMap() {
    var wrap = document.getElementById("map-svg");
    if (!wrap || !window.AotusMap) return;
    wrap.innerHTML = window.AotusMap.svg;
    var root = wrap.querySelector("svg");
    if (!root) return;
    root.setAttribute("class", "map-root");

    var M = D.municipality.map;
    // Resaltado suave de la zona / región
    var region = document.createElementNS(NS, "circle");
    region.setAttribute("cx", M.x); region.setAttribute("cy", M.y); region.setAttribute("r", 95);
    region.setAttribute("class", "map-region");
    root.appendChild(region);

    var g = document.createElementNS(NS, "g");
    g.setAttribute("class", "map-marker");
    g.setAttribute("transform", "translate(" + M.x + "," + M.y + ")");

    var r1 = document.createElementNS(NS, "circle"); r1.setAttribute("r", 20); r1.setAttribute("class", "map-pulse");
    var r2 = document.createElementNS(NS, "circle"); r2.setAttribute("r", 9); r2.setAttribute("class", "map-pulse2");
    var dot = document.createElementNS(NS, "circle"); dot.setAttribute("r", 5); dot.setAttribute("class", "map-dot");
    g.appendChild(r1); g.appendChild(r2); g.appendChild(dot);
    root.appendChild(g);

    var txt = document.createElementNS(NS, "text");
    txt.textContent = D.municipality.full;
    txt.setAttribute("x", M.x); txt.setAttribute("y", M.y - 34);
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("class", "map-label");
    root.appendChild(txt);
  }

  /* ------------------------------------------------------------------
     Formulario de diagnóstico gratuito
     ------------------------------------------------------------------ */
  function initForm() {
    var form = document.getElementById("diagnostico-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var box = document.getElementById("form-success");
      form.classList.add("hidden");
      if (box) box.classList.remove("hidden");
    });

    var again = document.getElementById("form-again");
    if (again) {
      again.addEventListener("click", function () {
        form.reset();
        form.classList.remove("hidden");
        var box = document.getElementById("form-success");
        if (box) box.classList.add("hidden");
      });
    }
  }

  /* ------------------------------------------------------------------
     Animaciones de aparición
     ------------------------------------------------------------------ */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    fillNotices();
    renderMunicipios();
    renderDashboard();
    renderSeguridad();
    renderContratacion();
    renderComparacion();
    initTabs();
    initNav();
    loadMap();
    initForm();
    initReveal();
    renderChartsFor("resumen");
  });
})();