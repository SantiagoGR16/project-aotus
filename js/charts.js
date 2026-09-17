/* =====================================================================
   AOTUS — Gráficos SVG interactivos (sin dependencias externas)
   ---------------------------------------------------------------------
   Implementación propia en SVG para que el prototipo funcione sin
   bibliotecas ni APIs externas. Los datos se pasan desde data.js.
   ===================================================================== */

(function () {
  "use strict";

  var C = {
    blue: "#1d4ed8",
    blueDark: "#1e3a8a",
    blueSoft: "#dce7ff",
    ink: "#374151",
    muted: "#6b7280",
    faint: "#9aa3b2",
    grid: "#e8ecf2",
    slate: "#64748b",
    gray: "#94a3b8",
    amber: "#b45309",
    dot: "#ffffff"
  };

  var registry = {};
  var loaded = false;

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function fmt(v, unit) {
    var s = Math.round(v * 10) / 10;
    return (String(s).replace(".", ",")) + (unit || "");
  }

  function smoothPath(pts) {
    if (!pts.length) return "";
    if (pts.length === 1) return "M" + pts[0][0] + "," + pts[0][1];
    if (pts.length === 2) return "M" + pts[0][0] + "," + pts[0][1] + "L" + pts[1][0] + "," + pts[1][1];
    var d = "M" + pts[0][0].toFixed(2) + "," + pts[0][1].toFixed(2), i, p0, p1, p2, p3, c1x, c1y, c2x, c2y;
    for (i = 0; i < pts.length - 1; i++) {
      p0 = pts[i - 1] || pts[i];
      p1 = pts[i];
      p2 = pts[i + 1];
      p3 = pts[i + 2] || p2;
      c1x = p1[0] + (p2[0] - p0[0]) / 6;
      c1y = p1[1] + (p2[1] - p0[1]) / 6;
      c2x = p2[0] - (p3[0] - p1[0]) / 6;
      c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += "C" + c1x.toFixed(2) + "," + c1y.toFixed(2) + " " + c2x.toFixed(2) + "," + c2y.toFixed(2) + " " + p2[0].toFixed(2) + "," + p2[1].toFixed(2);
    }
    return d;
  }

  function tooltip(container) {
    var el = document.createElement("div");
    el.className = "chart-tooltip";
    el.style.display = "none";
    container.appendChild(el);
    return el;
  }

  function showTip(tip, xPct, yPct, html) {
    tip.innerHTML = html;
    tip.style.display = "block";
    var mid = xPct > 78 ? 94 : (xPct < 22 ? 6 : xPct);
    tip.style.left = mid + "%";
    tip.style.top = (yPct - 12) + "%";
    tip.style.transform = "translate(-50%,-100%)";
  }

  function hideTip(tip) {
    tip.style.display = "none";
  }

  /* ---------------------------------------------------------------
     Gráfico de línea simple
     --------------------------------------------------------------- */
  function lineChart(el, W, cfg) {
    var unit = cfg.unit || "";
    var H = Math.round(W * 0.56);
    var pad = { t: 30, r: 18, b: 34, l: 42 };
    var iw = W - pad.l - pad.r;
    var ih = H - pad.t - pad.b;
    var vals = cfg.series.map(function (s) { return s.value; });
    var min = Math.min.apply(null, vals);
    var max = Math.max.apply(null, vals);
    var domMin = min - (max - min) * 0.75;
    var domMax = max + (max - min) * 0.45;
    if (domMin === domMax) { domMin -= 1; domMax += 1; }

    function x(i) { return pad.l + (vals.length === 1 ? iw / 2 : iw * (i / (vals.length - 1))); }
    function y(v) { return pad.t + ih - ((v - domMin) / (domMax - domMin)) * ih; }

    var pts = cfg.series.map(function (s, i) { return [x(i), y(s.value)]; });
    var line = smoothPath(pts);
    var area = line +
      "L" + pts[pts.length - 1][0].toFixed(2) + "," + (pad.t + ih).toFixed(2) +
      "L" + pts[0][0].toFixed(2) + "," + (pad.t + ih).toFixed(2) + "Z";

    var grid = "";
    var ticks = 4, k;
    for (k = 0; k <= ticks; k++) {
      var tv = domMin + (domMax - domMin) * (k / ticks);
      var gx = pad.t + ih - ((tv - domMin) / (domMax - domMin)) * ih;
      grid += '<line class="chart-grid" x1="' + pad.l + '" y1="' + gx + '" x2="' + (W - pad.r) + '" y2="' + gx + '"/>';
      grid += '<text class="chart-axis-y" x="' + (pad.l - 8) + '" y="' + (gx + 3) + '">' + fmt(tv, unit) + '</text>';
    }

    var dots = "";
    var labels = "";
    cfg.series.forEach(function (s, i) {
      dots += '<circle class="chart-dot" cx="' + x(i) + '" cy="' + y(s.value) + '" r="4.5"/>';
      labels += '<text class="chart-value" x="' + x(i) + '" y="' + (y(s.value) - 12) + '">' + fmt(s.value, "%") + '</text>';
    });

    var catLabels = "";
    cfg.series.forEach(function (s, i) {
      catLabels += '<text class="chart-cat" x="' + x(i) + '" y="' + (pad.t + ih + 20) + '">' + s.label + '</text>';
    });

    el.innerHTML =
      '<svg class="chart-svg" role="img" aria-label="' + (cfg.title || "Gráfico") + '" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '">' +
      '<defs><linearGradient id="grad-' + el.id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#1d4ed8" stop-opacity="0.16"/>' +
      '<stop offset="100%" stop-color="#1d4ed8" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      grid +
      '<path d="' + area + '" fill="url(#grad-' + el.id + ')"/>' +
      '<path d="' + line + '" class="chart-line" />' +
      dots + labels + catLabels +
      '<rect class="chart-hit" x="' + pad.l + '" y="' + pad.t + '" width="' + iw + '" height="' + ih + '"/>' +
      '<line class="chart-guide" x1="0" y1="0" x2="0" y2="0" style="display:none"/>' +
      '</svg>';

    var svg = el.querySelector("svg");
    var guide = el.querySelector(".chart-guide");
    var dotsEl = el.querySelectorAll(".chart-dot");
    var tip = tooltip(el);

    el.addEventListener("mousemove", function (e) {
      var rect = svg.getBoundingClientRect();
      var px = ((e.clientX - rect.left) / rect.width) * W;
      var py = ((e.clientY - rect.top) / rect.height) * H;
      if (px < pad.l || px > W - pad.r || py < pad.t || py > pad.t + ih) { hideTip(tip); guide.style.display = "none"; return; }
      var idx = Math.round((px - pad.l) / iw * (vals.length - 1));
      idx = Math.max(0, Math.min(vals.length - 1, idx));
      guide.setAttribute("x1", x(idx)); guide.setAttribute("x2", x(idx));
      guide.setAttribute("y1", pad.t); guide.setAttribute("y2", pad.t + ih);
      guide.style.display = "";
      dotsEl.forEach(function (d, i) { d.setAttribute("r", i === idx ? "6" : "4.5"); });
      var s = cfg.series[idx];
      showTip(tip, (x(idx) / W) * 100, (y(s.value) / H) * 100,
        '<b>' + s.label + '</b><span>' + fmt(s.value, "%") + '</span>');
    });
    el.addEventListener("mouseleave", function () {
      hideTip(tip); guide.style.display = "none";
      dotsEl.forEach(function (d) { d.setAttribute("r", "4.5"); });
    });
  }

  /* ---------------------------------------------------------------
     Gráfico de barras verticales
     --------------------------------------------------------------- */
  function barChart(el, W, cfg) {
    var unit = cfg.unit || "%";
    var H = Math.round(W * 0.56);
    var pad = { t: 34, r: 18, b: 44, l: 42 };
    var iw = W - pad.l - pad.r;
    var ih = H - pad.t - pad.b;
    var vals = cfg.data.map(function (d) { return d.value; });
    var maxV = Math.max.apply(null, vals);
    var domMax = maxV * 1.12;

    var bw = (iw / vals.length) * 0.52;

    function y(v) { return pad.t + ih - (v / domMax) * ih; }

    var grid = "";
    var ticks = 4, k;
    for (k = 0; k <= ticks; k++) {
      var tv = domMax * (k / ticks);
      var gx = pad.t + ih - (tv / domMax) * ih;
      grid += '<line class="chart-grid" x1="' + pad.l + '" y1="' + gx + '" x2="' + (W - pad.r) + '" y2="' + gx + '"/>';
      grid += '<text class="chart-axis-y" x="' + (pad.l - 8) + '" y="' + (gx + 3) + '">' + Math.round(tv) + unit + '</text>';
    }

    var bars = "";
    cfg.data.forEach(function (d, i) {
      var cx = pad.l + iw * (i / vals.length) + iw / vals.length / 2;
      var x0 = cx - bw / 2;
      var y1 = y(d.value);
      var y0 = pad.t + ih;
      var r = Math.min(bw / 2, 6);
      var hl = cfg.highlight && cfg.highlight.indexOf(i) > -1;
      bars += '<g class="chart-bar-g' + (hl ? " hl" : "") + '" data-i="' + i + '">' +
        roundedBar(x0, y1, y0, bw, r) +
        '<text class="chart-bar-value" x="' + cx + '" y="' + (y1 - 9) + '">' + d.pct + '</text>' +
        '</g>';
    });

    var catLabels = "";
    cfg.data.forEach(function (d, i) {
      var cx = pad.l + iw * (i / vals.length) + iw / vals.length / 2;
      catLabels += '<text class="chart-cat" x="' + cx + '" y="' + (pad.t + ih + 20) + '">' + d.labelShort + '</text>';
    });

    el.innerHTML =
      '<svg class="chart-svg" role="img" aria-label="' + (cfg.title || "Gráfico") + '" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '">' +
      grid + bars + catLabels +
      '</svg>';

    var svg = el.querySelector("svg");
    var tip = tooltip(el);
    var groups = el.querySelectorAll(".chart-bar-g");
    groups.forEach(function (g, i) {
      var d = cfg.data[i];
      g.addEventListener("mouseenter", function () {
        g.classList.add("hover");
        var rect = g.querySelector("path").getBBox();
        var cx = rect.x + rect.width / 2;
        var cy = rect.y;
        showTip(tip, (cx / W) * 100, (cy / H) * 100 - 6, '<b>' + d.label + '</b><span>' + d.pct + '</span>');
      });
      g.addEventListener("mouseleave", function () {
        g.classList.remove("hover");
        hideTip(tip);
      });
    });
    void svg;
  }

  function roundedBar(x, y1, y0, w, r) {
    var tr = Math.min(w / 2, r);
    return "M" + x + "," + y0 +
      "L" + x + "," + (y1 + tr) +
      "Q" + x + "," + y1 + " " + (x + tr) + "," + y1 +
      "L" + (x + w - tr) + "," + y1 +
      "Q" + (x + w) + "," + y1 + " " + (x + w) + "," + (y1 + tr) +
      "L" + (x + w) + "," + y0 + "Z";
  }

  /* ---------------------------------------------------------------
     Gráfico multilínea (varias series)
     --------------------------------------------------------------- */
  function multiLineChart(el, W, cfg) {
    var H = Math.round(W * 0.58);
    var pad = { t: 30, r: 18, b: 34, l: 42 };
    var iw = W - pad.l - pad.r;
    var ih = H - pad.t - pad.b;
    var all = [];
    cfg.series.forEach(function (s) { all = all.concat(s.values); });
    var max = Math.max.apply(null, all);
    var min = Math.min.apply(null, all);
    var domMin = Math.min(0, min);
    var domMax = max * 1.15;
    if (domMax <= domMin) { domMax = domMin + 10; }

    function x(i) { return pad.l + iw * (i / (cfg.months.length - 1)); }
    function y(v) { return pad.t + ih - ((v - domMin) / (domMax - domMin)) * ih; }

    var grid = "";
    var ticks = 4, k;
    for (k = 0; k <= ticks; k++) {
      var tv = domMin + (domMax - domMin) * (k / ticks);
      var gx = pad.t + ih - ((tv - domMin) / (domMax - domMin)) * ih;
      grid += '<line class="chart-grid" x1="' + pad.l + '" y1="' + gx + '" x2="' + (W - pad.r) + '" y2="' + gx + '"/>';
      grid += '<text class="chart-axis-y" x="' + (pad.l - 8) + '" y="' + (gx + 3) + '">' + Math.round(tv) + '</text>';
    }

    var monthLabels = "";
    cfg.months.forEach(function (m, i) {
      monthLabels += '<text class="chart-cat" x="' + x(i) + '" y="' + (pad.t + ih + 20) + '">' + m + '</text>';
    });

    var lines = "";
    cfg.series.forEach(function (s, si) {
      var pts = s.values.map(function (v, i) { return [x(i), y(v)]; });
      lines += '<g class="chart-multi" data-s="' + si + '">' +
        '<path d="' + smoothPath(pts) + '" class="chart-line-m" style="stroke:' + s.color + '"/>' +
        s.values.map(function (v, i) {
          return '<circle class="chart-dot" cx="' + x(i) + '" cy="' + y(v) + '" r="3.4" style="fill:' + s.color + '"/>';
        }).join("") +
        '</g>';
    });

    var legend = "";
    cfg.series.forEach(function (s, si) {
      legend += '<span class="chart-legend-item"><i style="background:' + s.color + '"></i>' + s.label + '</span>';
    });

    el.innerHTML =
      '<div class="chart-legend">' + legend + '</div>' +
      '<svg class="chart-svg" role="img" aria-label="' + (cfg.title || "Gráfico") + '" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '">' +
      grid + lines + monthLabels +
      '<rect class="chart-hit" x="' + pad.l + '" y="' + pad.t + '" width="' + iw + '" height="' + ih + '"/>' +
      '<line class="chart-guide" x1="0" y1="0" x2="0" y2="0" style="display:none"/>' +
      '</svg>';

    var svg = el.querySelector("svg");
    var guide = el.querySelector(".chart-guide");
    var tip = tooltip(el);

    el.addEventListener("mousemove", function (e) {
      var rect = svg.getBoundingClientRect();
      var px = ((e.clientX - rect.left) / rect.width) * W;
      var py = ((e.clientY - rect.top) / rect.height) * H;
      if (px < pad.l || px > W - pad.r || py < pad.t || py > pad.t + ih) { hideTip(tip); guide.style.display = "none"; return; }
      var idx = Math.round((px - pad.l) / iw * (cfg.months.length - 1));
      idx = Math.max(0, Math.min(cfg.months.length - 1, idx));
      guide.setAttribute("x1", x(idx)); guide.setAttribute("x2", x(idx));
      guide.setAttribute("y1", pad.t); guide.setAttribute("y2", pad.t + ih);
      guide.style.display = "";
      var html = "<b>" + cfg.months[idx] + " 2025</b>";
      cfg.series.forEach(function (s, si) {
        html += '<span style="color:' + s.color + '">' + s.label + ': ' + s.values[idx] + '</span>';
      });
      showTip(tip, (x(idx) / W) * 100, ((pad.t + 6) / H) * 100, html);
    });
    el.addEventListener("mouseleave", function () {
      hideTip(tip); guide.style.display = "none";
    });
  }

  /* ---------------------------------------------------------------
     Registro y render
     --------------------------------------------------------------- */
  function render(id) {
    var item = registry[id];
    if (!item) return;
    var el = document.getElementById(id);
    if (!el) return;
    var W = el.clientWidth;
    if (W < 20) return;
    el.innerHTML = "";
    if (item.type === "line") lineChart(el, W, item.cfg);
    else if (item.type === "bar") barChart(el, W, item.cfg);
    else if (item.type === "multi") multiLineChart(el, W, item.cfg);
  }

  window.AotusCharts = {
    create: function (type, id, cfg) {
      registry[id] = { type: type, cfg: cfg };
      render(id);
    },
    render: render
  };

  if (!loaded) {
    loaded = true;
    window.addEventListener("resize", debounce(function () {
      Object.keys(registry).forEach(render);
    }, 160));
  }
})();