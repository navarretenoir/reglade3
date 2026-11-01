(function () {
  "use strict";
  var R = Regla3, $ = function (i) { return document.getElementById(i); };
  var AJ = { dec: 2, ceros: false, tema: "auto" }, S = { modo: "directa", cel: { a1: "", b1: "", a2: "", b2: "" }, inc: "b2", nomA: "", nomB: "",
    comp: { b: "", filas: [{ nombre: "", a: "", c: "", tipo: "directa" }, { nombre: "", a: "", c: "", tipo: "directa" }] },
    pct: { sub: "de", p: "", n: "", a: "", b: "", f: "", signo: 1, dir: 1, v: "" } }, ULT = null, HIST = [];
  try { var g = JSON.parse(localStorage.getItem("regla3.aj") || "null"); if (g) AJ = Object.assign(AJ, g); HIST = JSON.parse(localStorage.getItem("regla3.hist") || "[]"); } catch (e) {}
  function guardarAj() { try { localStorage.setItem("regla3.aj", JSON.stringify(AJ)); } catch (e) {} }
  function guardarHist() { try { localStorage.setItem("regla3.hist", JSON.stringify(HIST.slice(0, 30))); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function aviso(t) { var e = $("toast"); e.textContent = t; e.classList.add("on"); clearTimeout(aviso.t); aviso.t = setTimeout(function () { e.classList.remove("on"); }, 1800); }
  function fmt(q) { return q.formato(AJ.dec, AJ.ceros); }
  function aplicarTema() { document.documentElement.setAttribute("data-tema", AJ.tema); }

  /* ---------- formularios ---------- */
  function campo(id, valor, opc) { opc = opc || {};
    return '<div class="fld' + (opc.inc ? " inc" : "") + '"><input id="' + id + '" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="' + esc(opc.et || id) + '" ' + (opc.inc ? 'readonly tabindex="-1" placeholder="x"' : 'placeholder="' + (opc.ph || "0") + '"') + ' value="' + esc(valor) + '">' + (opc.u ? '<span class="u">' + esc(opc.u) + "</span>" : "") + "</div>"; }
  function formProp() {
    var c = S.cel, inv = S.modo === "inversa", i = S.inc;
    function f(k, et, u) { return campo("c-" + k, c[k], { inc: i === k, et: et, u: u }); }
    return '<h2>' + (inv ? "Inversa: al aumentar una, la otra disminuye" : "Directa: al aumentar una, la otra aumenta") + '</h2>' +
      '<div class="nm"><input id="n-a" placeholder="Magnitud A (ej.: obreros)" value="' + esc(S.nomA) + '" aria-label="Nombre de la magnitud A"><span></span><input id="n-b" placeholder="Magnitud B (ej.: días)" value="' + esc(S.nomB) + '" aria-label="Nombre de la magnitud B"></div>' +
      '<div class="rowlab">Si</div><div class="grid4">' + f("a1", "A, primera fila", S.nomA) + '<span class="arrow">' + (inv ? "↔" : "→") + "</span>" + f("b1", "B, primera fila", S.nomB) + "</div>" +
      '<div class="rowlab">entonces</div><div class="grid4">' + f("a2", "A, segunda fila", S.nomA) + '<span class="arrow">' + (inv ? "↔" : "→") + "</span>" + f("b2", "B, segunda fila", S.nomB) + "</div>" +
      '<div class="acts" style="justify-content:flex-start;margin-top:16px"><button class="btn" id="b-cic">Cambiar la incógnita</button><button class="btn g" id="b-lim">Limpiar</button></div><div class="msg" id="msg"></div>';
  }
  function formComp() {
    var h = '<h2>Compuesta: x depende de varias magnitudes</h2><label class="lab" for="k-b">Dato de partida (la magnitud que quieres hallar)</label><div class="fld">' + campo("k-b", S.comp.b, { et: "Dato de partida" }).replace('<div class="fld">', "").replace(/<\/div>$/, "") + "</div>";
    S.comp.filas.forEach(function (f, i) {
      h += '<div class="rowlab">Magnitud ' + (i + 1) + '</div><div class="crow"><div><label class="lab">Dato original</label><div class="fld"><input id="k-a' + i + '" inputmode="decimal" autocomplete="off" placeholder="0" value="' + esc(f.a) + '"></div></div><div><label class="lab">Dato nuevo</label><div class="fld"><input id="k-c' + i + '" inputmode="decimal" autocomplete="off" placeholder="0" value="' + esc(f.c) + '"></div></div>' +
        (S.comp.filas.length > 1 ? '<button class="x" data-del="' + i + '" aria-label="Quitar magnitud">✕</button>' : "<span></span>") +
        '<div class="tg" role="group"><button data-tipo="' + i + ':directa" aria-pressed="' + (f.tipo === "directa") + '">Directa</button><button data-tipo="' + i + ':inversa" aria-pressed="' + (f.tipo === "inversa") + '">Inversa</button></div></div>'; });
    return h + '<div class="acts" style="justify-content:flex-start;margin-top:8px">' + (S.comp.filas.length < 5 ? '<button class="btn" id="b-mas">+ Magnitud</button>' : "") + '<button class="btn g" id="b-lim">Limpiar</button></div><div class="msg" id="msg"></div>';
  }
  var SUBS = [["de", "% de un número"], ["que", "¿Qué %?"], ["aum", "Aumentar"], ["des", "Descontar"], ["orig", "Valor original"], ["iva", "IVA 19 %"]];
  function formPct() {
    var p = S.pct, h = '<h2>Porcentajes</h2><div class="sub" id="subs">' + SUBS.map(function (s) { return '<button data-sub="' + s[0] + '" aria-pressed="' + (p.sub === s[0]) + '">' + s[1] + "</button>"; }).join("") + "</div>";
    function L(t, id, v, ph) { return '<label class="lab" for="' + id + '">' + t + '</label><div class="fld" style="margin-bottom:12px"><input id="' + id + '" inputmode="decimal" autocomplete="off" placeholder="' + (ph || "0") + '" value="' + esc(v) + '"></div>'; }
    if (p.sub === "de") h += L("Porcentaje (%)", "p-p", p.p, "15") + L("de este número", "p-n", p.n, "80");
    else if (p.sub === "que") h += L("Cantidad (A)", "p-a", p.a, "30") + L("sobre el total (B)", "p-b", p.b, "120");
    else if (p.sub === "aum" || p.sub === "des") h += L("Valor", "p-n", p.n, "50") + L((p.sub === "aum" ? "Aumento" : "Descuento") + " (%)", "p-p", p.p, "20");
    else if (p.sub === "orig") h += '<div class="tg" style="margin-bottom:12px;width:max-content"><button data-sg="1" aria-pressed="' + (p.signo === 1) + '">Tras un aumento</button><button data-sg="-1" aria-pressed="' + (p.signo === -1) + '">Tras un descuento</button></div>' + L("Valor final", "p-f", p.f, "40") + L("Porcentaje (%)", "p-p", p.p, "20");
    else h += '<div class="tg" style="margin-bottom:12px;width:max-content"><button data-dir="1" aria-pressed="' + (p.dir === 1) + '">Neto → con IVA</button><button data-dir="-1" aria-pressed="' + (p.dir === -1) + '">Con IVA → neto</button></div>' + L(p.dir === 1 ? "Precio neto" : "Precio con IVA", "p-v", p.v, "10.000");
    return h + '<div class="acts" style="justify-content:flex-start"><button class="btn g" id="b-lim">Limpiar</button></div><div class="msg" id="msg"></div>';
  }
  function pintarForm() { $("form").innerHTML = S.modo === "compuesta" ? formComp() : S.modo === "pct" ? formPct() : formProp(); calcular(); }

  /* ---------- cálculo ---------- */
  function val(id) { var e = $(id), q = e ? R.leer(e.value) : null; if (e) e.parentNode.classList.toggle("err", !!e.value.trim() && !q); return q; }
  function nom() { return { y: S.nomB }; }
  function calcular() {
    var r = null, msg = "", titulo = "";
    try {
      if (S.modo === "directa" || S.modo === "inversa") {
        var ks = ["a1", "b1", "a2", "b2"], v = {}, k, falt = 0;
        ks.forEach(function (key) { if (key === S.inc) return; v[key] = val("c-" + key); if (!v[key]) falt++; });
        if (!falt) {
          var fn = S.modo === "directa" ? R.directa : R.inversa, o = { dec: AJ.dec, nombres: nom() }, i = S.inc;
          if (i === "b2") r = fn(v.a1, v.b1, v.a2, o); else if (i === "a2") r = fn(v.b1, v.a1, v.b2, o); else if (i === "b1") r = fn(v.a2, v.b2, v.a1, o); else r = fn(v.b2, v.a2, v.b1, o);
          titulo = ks.map(function (key) { return key === i ? "x" : fmt(v[key]); }).join(" · ");
          r.unidad = (i[0] === "a" ? S.nomA : S.nomB);
        }
      } else if (S.modo === "compuesta") {
        var b = val("k-b"), filas = [], ok = !!b;
        S.comp.filas.forEach(function (f, i) { var a = val("k-a" + i), c = val("k-c" + i); if (!a || !c) ok = false; else filas.push({ a: a, c: c, tipo: f.tipo, nombre: f.nombre }); });
        if (ok) { r = R.compuesta(b, filas, { dec: AJ.dec }); titulo = "Compuesta · " + filas.length + " magnitudes"; }
      } else {
        var p = S.pct, o2 = { dec: AJ.dec };
        if (p.sub === "de") { var x1 = val("p-p"), x2 = val("p-n"); if (x1 && x2) { r = R.porcentajeDe(x1, x2, o2); titulo = fmt(x1) + " % de " + fmt(x2); } }
        else if (p.sub === "que") { var y1 = val("p-a"), y2 = val("p-b"); if (y1 && y2) { r = R.queEs(y1, y2, o2); r.unidad = "%"; titulo = fmt(y1) + " de " + fmt(y2); } }
        else if (p.sub === "aum" || p.sub === "des") { var z1 = val("p-n"), z2 = val("p-p"); if (z1 && z2) { r = R.variacion(z1, z2, p.sub === "aum" ? 1 : -1, o2); titulo = fmt(z1) + (p.sub === "aum" ? " + " : " − ") + fmt(z2) + " %"; } }
        else if (p.sub === "orig") { var w1 = val("p-f"), w2 = val("p-p"); if (w1 && w2) { r = R.original(w1, w2, p.signo, o2); titulo = "Original de " + fmt(w1) + " (" + (p.signo > 0 ? "+" : "−") + fmt(w2) + " %)"; } }
        else { var u = val("p-v"); if (u) { r = R.iva(u, p.dir === 1, o2); titulo = (p.dir === 1 ? "Neto " : "Bruto ") + fmt(u) + " · IVA"; } }
      }
    } catch (e) { msg = e instanceof RangeError ? "No se puede dividir por cero: revisa los valores." : "Revisa los datos ingresados."; r = null; }
    var m = $("msg"); if (m) m.textContent = msg;
    ULT = r ? { r: r, titulo: titulo } : null; pintarRes();
    if (S.modo === "directa" || S.modo === "inversa") { var ie = $("c-" + S.inc); if (ie) ie.value = ULT ? fmt(ULT.r.valor) : ""; }
  }
  function pintarRes() {
    var e = $("resultado");
    if (!ULT) { e.innerHTML = '<div class="res"><small>Resultado</small><div class="v vac">—</div><div class="ex">Completa los datos y verás el resultado al instante.</div></div>'; return; }
    var r = ULT.r, txt = fmt(r.valor), u = r.unidad || "", ex = "";
    if (r.impuesto) ex = "IVA: " + fmt(r.impuesto);
    else if (r.cambio) ex = (r.cambio.signo() >= 0 ? "Aumento: +" : "Descuento: −") + fmt(r.cambio.signo() < 0 ? r.cambio.neg() : r.cambio);
    else if (!r.valor.esEntero() && r.valor.d < 1000000000n) ex = "Exacto: " + r.valor.fraccion();
    e.innerHTML = '<div class="res"><small>' + (S.modo === "pct" ? "Resultado" : "x =") + '</small><div class="v" id="v-res">' + esc(txt) + (u ? ' <span style="font-size:.45em;color:var(--mut);font-weight:600">' + esc(u) + "</span>" : "") + '</div><div class="ex">' + esc(ex) + '</div><div class="acts"><button class="btn p" id="b-cop">Copiar</button><button class="btn" id="b-gua">Guardar</button></div></div>' +
      '<details style="margin-top:6px"><summary class="lnk" style="cursor:pointer;list-style:none">Ver paso a paso ▾</summary><div style="margin-top:10px"><div class="frm">' + esc(r.formula) + '</div><ol class="pasos">' + r.pasos.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ol></div></details>";
  }
  function pintarHist() {
    var e = $("historial");
    e.innerHTML = '<div style="display:flex;align-items:center"><h2 style="margin:0;flex:1">Historial</h2>' + (HIST.length ? '<button class="lnk" id="b-bor">Borrar</button>' : "") + "</div>" +
      (HIST.length ? '<ul class="hist" style="margin-top:8px">' + HIST.slice(0, 12).map(function (h, i) { return '<li data-h="' + i + '"><div class="t"><span>' + esc(h.t) + "</span><small>" + esc(h.m) + '</small></div><b>' + esc(h.r) + "</b></li>"; }).join("") + "</ul>" : '<div class="vacio">Aún no guardas cálculos.</div>');
  }

  /* ---------- eventos ---------- */
  document.addEventListener("input", function (e) {
    var id = e.target.id; if (!id) return;
    if (id.indexOf("c-") === 0) S.cel[id.slice(2)] = e.target.value;
    else if (id === "n-a") { S.nomA = e.target.value; document.querySelectorAll("#form .grid4 .fld").forEach(function (f, i) { var u = f.querySelector(".u"); if (u && (i === 0 || i === 2)) u.textContent = S.nomA; }); }
    else if (id === "n-b") { S.nomB = e.target.value; document.querySelectorAll("#form .grid4 .fld").forEach(function (f, i) { var u = f.querySelector(".u"); if (u && (i === 1 || i === 3)) u.textContent = S.nomB; }); }
    else if (id === "k-b") S.comp.b = e.target.value;
    else if (/^k-a\d$/.test(id)) S.comp.filas[+id.slice(3)].a = e.target.value;
    else if (/^k-c\d$/.test(id)) S.comp.filas[+id.slice(3)].c = e.target.value;
    else if (id.indexOf("p-") === 0) S.pct[{ "p-p": "p", "p-n": "n", "p-a": "a", "p-b": "b", "p-f": "f", "p-v": "v" }[id]] = e.target.value;
    else return;
    calcular();
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button"); if (!t) { var li = e.target.closest("[data-h]"); if (li) cargar(+li.dataset.h); return; }
    if (t.dataset.m) { S.modo = t.dataset.m; document.querySelectorAll("#modos button").forEach(function (b) { b.setAttribute("aria-pressed", b === t ? "true" : "false"); }); pintarForm(); thumb(); return; }
    if (t.id === "b-cic") { var o = ["b2", "a2", "b1", "a1"]; S.inc = o[(o.indexOf(S.inc) + 1) % 4]; S.cel[S.inc] = ""; pintarForm(); return; }
    if (t.id === "b-lim") { if (S.modo === "compuesta") S.comp = { b: "", filas: [{ nombre: "", a: "", c: "", tipo: "directa" }, { nombre: "", a: "", c: "", tipo: "directa" }] }; else if (S.modo === "pct") S.pct = { sub: S.pct.sub, p: "", n: "", a: "", b: "", f: "", signo: S.pct.signo, dir: S.pct.dir, v: "" }; else S.cel = { a1: "", b1: "", a2: "", b2: "" }; pintarForm(); return; }
    if (t.id === "b-mas") { S.comp.filas.push({ nombre: "", a: "", c: "", tipo: "directa" }); pintarForm(); return; }
    if (t.dataset.del !== undefined) { S.comp.filas.splice(+t.dataset.del, 1); pintarForm(); return; }
    if (t.dataset.tipo) { var p = t.dataset.tipo.split(":"); S.comp.filas[+p[0]].tipo = p[1]; pintarForm(); return; }
    if (t.dataset.sub) { S.pct.sub = t.dataset.sub; pintarForm(); return; }
    if (t.dataset.sg) { S.pct.signo = +t.dataset.sg; pintarForm(); return; }
    if (t.dataset.dir) { S.pct.dir = +t.dataset.dir; pintarForm(); return; }
    if (t.id === "b-cop" && ULT) { var s = fmt(ULT.r.valor); (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(s) : Promise.reject()).then(function () { aviso("Copiado: " + s); }, function () { var ta = document.createElement("textarea"); ta.value = s; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); aviso("Copiado: " + s); } catch (x) { aviso("No se pudo copiar"); } ta.remove(); }); return; }
    if (t.id === "b-gua" && ULT) { HIST.unshift({ t: ULT.titulo, r: fmt(ULT.r.valor) + (ULT.r.unidad ? " " + ULT.r.unidad : ""), m: { directa: "Directa", inversa: "Inversa", compuesta: "Compuesta", pct: "Porcentaje" }[S.modo], s: JSON.parse(JSON.stringify({ modo: S.modo, cel: S.cel, inc: S.inc, nomA: S.nomA, nomB: S.nomB, comp: S.comp, pct: S.pct })) }); guardarHist(); pintarHist(); aviso("Guardado en el historial"); return; }
    if (t.id === "b-bor") { HIST = []; guardarHist(); pintarHist(); return; }
    if (t.id === "b-aj") { $("aj-dec").value = String(AJ.dec); $("aj-tema").value = AJ.tema; $("aj-ceros").value = AJ.ceros ? "1" : "0"; $("dlg-aj").showModal(); return; }
    if (t.id === "aj-ok") { $("dlg-aj").close(); return; }
  });
  function cargar(i) { var h = HIST[i]; if (!h) return; S.modo = h.s.modo; S.cel = h.s.cel; S.inc = h.s.inc; S.nomA = h.s.nomA; S.nomB = h.s.nomB; S.comp = h.s.comp; S.pct = h.s.pct;
    document.querySelectorAll("#modos button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.m === S.modo ? "true" : "false"); }); pintarForm(); thumb(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  $("aj-dec").onchange = function () { AJ.dec = +this.value; guardarAj(); calcular(); };
  $("aj-tema").onchange = function () { AJ.tema = this.value; guardarAj(); aplicarTema(); };
  $("aj-ceros").onchange = function () { AJ.ceros = this.value === "1"; guardarAj(); calcular(); };
  function thumb() { var sg = $("modos"), th = sg.querySelector(".th"), a = sg.querySelector('button[aria-pressed="true"]'); if (!a || !a.offsetWidth) return; th.style.width = a.offsetWidth + "px"; th.style.transform = "translateX(" + a.offsetLeft + "px)"; }
  if (window.ResizeObserver) new ResizeObserver(thumb).observe($("modos"));
  window.addEventListener("load", thumb); window.addEventListener("resize", thumb); document.addEventListener("artemis:dispositivo", thumb);
  /* enlace profundo para pruebas: ?m=inversa&a1=4&b1=12&a2=6 */
  (function () { var q = new URLSearchParams(location.search); if (q.get("m")) { S.modo = q.get("m"); document.querySelectorAll("#modos button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.m === S.modo ? "true" : "false"); }); }
    ["a1", "b1", "a2", "b2"].forEach(function (k) { if (q.get(k)) S.cel[k] = q.get(k); }); if (q.get("sub")) S.pct.sub = q.get("sub"); ["p", "n", "a", "b", "f", "v"].forEach(function (k) { if (q.get("p_" + k)) S.pct[k] = q.get("p_" + k); }); })();
  aplicarTema(); pintarForm(); pintarHist(); setTimeout(thumb, 30); if (document.fonts && document.fonts.ready) document.fonts.ready.then(thumb);
})();
