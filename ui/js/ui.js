(function () {
  "use strict";
  var R = Regla3, $ = function (i) { return document.getElementById(i); };
  var AJ = { dec: 2, ceros: false, tema: "auto" };
  function nuevo() { return { modo: "directa", cel: { a1: "", b1: "", a2: "", b2: "" }, inc: "b2", nomA: "", nomB: "",
    comp: { b: "", un: "", filas: [{ nombre: "", a: "", c: "", tipo: "directa" }, { nombre: "", a: "", c: "", tipo: "directa" }] },
    pct: { sub: "de", p: "", n: "", a: "", b: "", f: "", signo: 1, dir: 1, v: "" } }; }
  var S = nuevo(), ULT = null, HIST = [];
  try { var g = JSON.parse(localStorage.getItem("regla3.aj") || "null"); if (g) AJ = Object.assign(AJ, g); HIST = JSON.parse(localStorage.getItem("regla3.hist") || "[]"); } catch (e) {}
  function guardarAj() { try { localStorage.setItem("regla3.aj", JSON.stringify(AJ)); } catch (e) {} }
  function guardarHist() { try { localStorage.setItem("regla3.hist", JSON.stringify(HIST.slice(0, 30))); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function aviso(t) { var e = $("toast"); e.textContent = t; e.classList.add("on"); clearTimeout(aviso.t); aviso.t = setTimeout(function () { e.classList.remove("on"); }, 1900); }
  function fmt(q) { return q.formato(AJ.dec, AJ.ceros); }
  var SOL = '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>', LUNA = '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>';
  function oscuroAhora() { return AJ.tema === "oscuro" || (AJ.tema === "auto" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); }
  function aplicarTema() { document.documentElement.setAttribute("data-tema", AJ.tema); $("ic-tema").innerHTML = oscuroAhora() ? SOL : LUNA; $("b-tema").setAttribute("aria-label", oscuroAhora() ? "Cambiar a modo claro" : "Cambiar a modo oscuro"); }

  /* ---------- ejemplos y ayuda ---------- */
  var EJ = {
    directa: { titulo: "Más y más", frase: "Si una cosa sube, la otra también.", ej: "3 kilos de manzanas cuestan $2.400. ¿Cuánto cuestan 5 kilos?", lleno: function (s) { s.modo = "directa"; s.nomA = "kilos"; s.nomB = "pesos"; s.cel = { a1: "3", b1: "2400", a2: "5", b2: "" }; s.inc = "b2"; } },
    inversa: { titulo: "Más y menos", frase: "Si una cosa sube, la otra baja.", ej: "4 personas pintan una casa en 12 días. ¿En cuántos días la pintan 6 personas?", lleno: function (s) { s.modo = "inversa"; s.nomA = "personas"; s.nomB = "días"; s.cel = { a1: "4", b1: "12", a2: "6", b2: "" }; s.inc = "b2"; } },
    compuesta: { titulo: "Varias cosas", frase: "El resultado depende de más de una cosa a la vez.", ej: "5 máquinas hacen 600 piezas en 6 horas. ¿Cuántas piezas hacen 8 máquinas en 10 horas?", lleno: function (s) { s.modo = "compuesta"; s.comp = { b: "600", un: "piezas", filas: [{ nombre: "máquinas", a: "5", c: "8", tipo: "directa" }, { nombre: "horas", a: "6", c: "10", tipo: "directa" }] }; } },
    pct: { titulo: "Porcentajes", frase: "Para descuentos, aumentos, propinas, IVA y más.", ej: "Una polera cuesta $20.000 y tiene 25 % de descuento. ¿Cuánto pagas?", lleno: function (s) { s.modo = "pct"; s.pct = { sub: "des", p: "25", n: "20000", a: "", b: "", f: "", signo: 1, dir: 1, v: "" }; } } };
  function ponerModo(m) { S.modo = m; document.querySelectorAll("#modos button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.m === m ? "true" : "false"); }); }

  /* ---------- formularios ---------- */
  function campo(id, valor, o) { o = o || {};
    return '<div class="fld' + (o.inc ? " inc" : "") + '"><input id="' + id + '" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="' + esc(o.et || id) + '" ' + (o.inc ? 'readonly tabindex="-1" placeholder="?"' : 'placeholder="' + (o.ph || "0") + '"') + ' value="' + esc(valor) + '">' + (o.u ? '<span class="u">' + esc(o.u) + "</span>" : "") + "</div>"; }
  function formProp() {
    var c = S.cel, inv = S.modo === "inversa", i = S.inc, flecha = inv ? "↔" : "→";
    function f(k, et, u) { return campo("c-" + k, c[k], { inc: i === k, et: et, u: u }); }
    return '<p class="lead">' + (inv ? "Cuando una cosa sube, la otra baja" : "Cuando una cosa sube, la otra también") + '</p><p class="sub-t">' + (inv ? "Por ejemplo: más personas trabajando, menos días de trabajo." : "Por ejemplo: más kilos de fruta, más plata que pagas.") + "</p>" +
      '<label class="lab">¿De qué cosas hablamos? <span style="font-weight:400">(opcional)</span></label><div class="nm"><input id="n-a" placeholder="La primera (ej.: ' + (inv ? "personas" : "kilos") + ')" value="' + esc(S.nomA) + '" aria-label="Nombre de la primera cosa"><span></span><input id="n-b" placeholder="La segunda (ej.: ' + (inv ? "días" : "pesos") + ')" value="' + esc(S.nomB) + '" aria-label="Nombre de la segunda cosa"></div>' +
      '<div class="rowlab">Lo que ya sé</div><div class="grid4">' + f("a1", "Primera cosa, dato conocido", S.nomA) + '<span class="arrow">' + flecha + "</span>" + f("b1", "Segunda cosa, dato conocido", S.nomB) + "</div>" +
      '<div class="rowlab">Lo que quiero calcular <span style="font-weight:400">(la casilla naranja es la respuesta)</span></div><div class="grid4">' + f("a2", "Primera cosa, fila de abajo", S.nomA) + '<span class="arrow">' + flecha + "</span>" + f("b2", "Segunda cosa, fila de abajo", S.nomB) + "</div>" +
      '<div class="acts" style="justify-content:flex-start;margin-top:16px"><button class="btn" id="b-cic">Quiero calcular otro dato</button><button class="btn g" id="b-ej">Probar un ejemplo</button><button class="btn g" id="b-lim">Borrar todo</button></div><div class="hint" id="hint">Hay algo que no es un número. Escribe solo números; para decimales usa coma, por ejemplo 2,5.</div><div class="msg" id="msg"></div>';
  }
  function formComp() {
    var h = '<p class="lead">Cuando hay varias cosas que cambian a la vez</p><p class="sub-t">Por ejemplo: más máquinas y más horas, más piezas fabricadas.</p>' +
      '<label class="lab">Dato que ya conozco</label><div class="grid4" style="grid-template-columns:1fr 1fr;margin-bottom:6px"><div class="fld"><input id="k-b" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="Dato que ya conozco" value="' + esc(S.comp.b) + '"></div><div class="fld"><input id="k-un" placeholder="¿Qué es? (ej.: piezas)" aria-label="Qué es ese dato" value="' + esc(S.comp.un) + '" style="font-size:16px;font-weight:500"></div></div>';
    S.comp.filas.forEach(function (f, i) {
      h += '<div class="rowlab">Cosa que cambia n.º ' + (i + 1) + '</div><div class="fld" style="margin-bottom:8px"><input id="k-n' + i + '" placeholder="¿Qué cambia? (ej.: máquinas)" aria-label="Qué cosa cambia" value="' + esc(f.nombre) + '" style="font-size:16px;font-weight:500;min-height:44px"></div><div class="crow"><div><label class="lab">Antes era</label><div class="fld"><input id="k-a' + i + '" inputmode="decimal" autocomplete="off" placeholder="0" value="' + esc(f.a) + '"></div></div><div><label class="lab">Ahora es</label><div class="fld"><input id="k-c' + i + '" inputmode="decimal" autocomplete="off" placeholder="0" value="' + esc(f.c) + '"></div></div>' +
        (S.comp.filas.length > 1 ? '<button class="x" data-del="' + i + '" aria-label="Quitar esta cosa">✕</button>' : "<span></span>") +
        '<div class="tg" role="group" aria-label="Cómo afecta al resultado"><button data-tipo="' + i + ':directa" aria-pressed="' + (f.tipo === "directa") + '">Más → más resultado</button><button data-tipo="' + i + ':inversa" aria-pressed="' + (f.tipo === "inversa") + '">Más → menos resultado</button></div></div>'; });
    return h + '<div class="acts" style="justify-content:flex-start;margin-top:8px">' + (S.comp.filas.length < 5 ? '<button class="btn" id="b-mas">+ Agregar otra cosa</button>' : "") + '<button class="btn g" id="b-ej">Probar un ejemplo</button><button class="btn g" id="b-lim">Borrar todo</button></div><div class="hint" id="hint">Hay algo que no es un número. Escribe solo números; para decimales usa coma, por ejemplo 2,5.</div><div class="msg" id="msg"></div>';
  }
  var SUBS = [["de", "Calcular un %"], ["que", "¿Qué porcentaje es?"], ["aum", "Subir un valor"], ["des", "Bajar un valor"], ["orig", "Volver al precio original"], ["iva", "IVA (19 %)"]];
  var SUBT = { de: "Ejemplo: ¿cuánto es el 15 % de 80?", que: "Ejemplo: ¿qué porcentaje es 30 de 120?", aum: "Ejemplo: un precio sube un 20 %.", des: "Ejemplo: una oferta con 25 % de descuento.", orig: "Ejemplo: pagaste $40.000 con 20 % de descuento, ¿cuánto costaba antes?", iva: "Pasa de precio sin IVA a precio con IVA, o al revés." };
  function formPct() {
    var p = S.pct, h = '<p class="lead">Porcentajes</p><p class="sub-t">¿Qué necesitas calcular?</p><div class="sub" id="subs">' + SUBS.map(function (s) { return '<button data-sub="' + s[0] + '" aria-pressed="' + (p.sub === s[0]) + '">' + s[1] + "</button>"; }).join("") + '</div><p class="sub-t" style="margin-top:-4px">' + SUBT[p.sub] + "</p>";
    function L(t, id, v, ph) { return '<label class="lab" for="' + id + '">' + t + '</label><div class="fld" style="margin-bottom:12px"><input id="' + id + '" inputmode="decimal" autocomplete="off" placeholder="' + (ph || "0") + '" value="' + esc(v) + '"></div>'; }
    if (p.sub === "de") h += L("El porcentaje (%)", "p-p", p.p, "15") + L("de este número", "p-n", p.n, "80");
    else if (p.sub === "que") h += L("La parte", "p-a", p.a, "30") + L("del total", "p-b", p.b, "120");
    else if (p.sub === "aum" || p.sub === "des") h += L("Valor de partida", "p-n", p.n, "50") + L((p.sub === "aum" ? "Cuánto sube (%)" : "Cuánto baja (%)"), "p-p", p.p, "20");
    else if (p.sub === "orig") h += '<div class="tg" style="margin-bottom:12px;width:max-content;max-width:100%;flex-wrap:wrap"><button data-sg="-1" aria-pressed="' + (p.signo === -1) + '">Tenía descuento</button><button data-sg="1" aria-pressed="' + (p.signo === 1) + '">Tenía aumento</button></div>' + L("Valor final (lo que pagaste o quedó)", "p-f", p.f, "40000") + L("El porcentaje (%)", "p-p", p.p, "20");
    else h += '<div class="tg" style="margin-bottom:12px;width:max-content;max-width:100%;flex-wrap:wrap"><button data-dir="1" aria-pressed="' + (p.dir === 1) + '">Sin IVA → con IVA</button><button data-dir="-1" aria-pressed="' + (p.dir === -1) + '">Con IVA → sin IVA</button></div>' + L(p.dir === 1 ? "Precio sin IVA (neto)" : "Precio con IVA", "p-v", p.v, "10.000");
    return h + '<div class="acts" style="justify-content:flex-start"><button class="btn g" id="b-ej">Probar un ejemplo</button><button class="btn g" id="b-lim">Borrar todo</button></div><div class="hint" id="hint">Hay algo que no es un número. Escribe solo números; para decimales usa coma, por ejemplo 2,5.</div><div class="msg" id="msg"></div>';
  }
  function pintarForm() { $("form").innerHTML = S.modo === "compuesta" ? formComp() : S.modo === "pct" ? formPct() : formProp(); calcular(); }

  /* ---------- cálculo ---------- */
  var malo;
  function val(id) { var e = $(id), q = e ? R.leer(e.value) : null, m = !!(e && e.value.trim() && !q); if (e) e.parentNode.classList.toggle("err", m); if (m) malo = true; return q; }
  function calcular() {
    var r = null, msg = "", titulo = ""; malo = false;
    try {
      if (S.modo === "directa" || S.modo === "inversa") {
        var ks = ["a1", "b1", "a2", "b2"], v = {}, falt = 0, i = S.inc, A = S.nomA, B = S.nomB;
        ks.forEach(function (key) { if (key === i) return; v[key] = val("c-" + key); if (!v[key]) falt++; });
        if (!falt) {
          var fn = S.modo === "directa" ? R.directa : R.inversa, o = { dec: AJ.dec, nombres: { a: A, b: B } };
          if (i === "b2") r = fn(v.a1, v.b1, v.a2, o); else if (i === "a2") r = fn(v.b1, v.a1, v.b2, { dec: AJ.dec, nombres: { a: B, b: A } }); else if (i === "b1") r = fn(v.a2, v.b2, v.a1, o); else r = fn(v.b2, v.a2, v.b1, { dec: AJ.dec, nombres: { a: B, b: A } });
          titulo = ks.map(function (key) { return key === i ? "?" : fmt(v[key]); }).join(" · "); r.unidad = (i[0] === "a" ? A : B);
        }
      } else if (S.modo === "compuesta") {
        var b = val("k-b"), filas = [], ok = !!b;
        S.comp.filas.forEach(function (f, i2) { var a = val("k-a" + i2), c = val("k-c" + i2); if (!a || !c) ok = false; else filas.push({ a: a, c: c, tipo: f.tipo, nombre: f.nombre }); });
        if (ok) { r = R.compuesta(b, filas, { dec: AJ.dec, nombres: { y: S.comp.un } }); r.unidad = S.comp.un; titulo = "Con " + filas.length + " cosas que cambian"; }
      } else {
        var p = S.pct, o2 = { dec: AJ.dec };
        if (p.sub === "de") { var x1 = val("p-p"), x2 = val("p-n"); if (x1 && x2) { r = R.porcentajeDe(x1, x2, o2); titulo = fmt(x1) + " % de " + fmt(x2); } }
        else if (p.sub === "que") { var y1 = val("p-a"), y2 = val("p-b"); if (y1 && y2) { r = R.queEs(y1, y2, o2); r.unidad = "%"; titulo = fmt(y1) + " de " + fmt(y2); } }
        else if (p.sub === "aum" || p.sub === "des") { var z1 = val("p-n"), z2 = val("p-p"); if (z1 && z2) { r = R.variacion(z1, z2, p.sub === "aum" ? 1 : -1, o2); titulo = fmt(z1) + (p.sub === "aum" ? " sube " : " baja ") + fmt(z2) + " %"; } }
        else if (p.sub === "orig") { var w1 = val("p-f"), w2 = val("p-p"); if (w1 && w2) { r = R.original(w1, w2, p.signo, o2); titulo = "Precio original de " + fmt(w1); } }
        else { var u = val("p-v"); if (u) { r = R.iva(u, p.dir === 1, o2); titulo = (p.dir === 1 ? "Sin IVA " : "Con IVA ") + fmt(u); } }
      }
    } catch (e) { msg = e instanceof RangeError ? "Con esos valores no se puede calcular (hay una división por cero). Revisa los números." : "Revisa los datos que escribiste."; r = null; }
    var m = $("msg"); if (m) m.textContent = msg; var h = $("hint"); if (h) h.classList.toggle("on", malo);
    ULT = r ? { r: r, titulo: titulo } : null; pintarRes();
    if (S.modo === "directa" || S.modo === "inversa") { var ie = $("c-" + S.inc); if (ie) ie.value = ULT ? fmt(ULT.r.valor) : ""; }
  }
  function pintarRes() {
    var e = $("resultado");
    if (!ULT) { e.innerHTML = '<div class="res"><small>La respuesta es</small><div class="v vac">—</div><div class="ex">Llena los datos y aquí aparecerá la respuesta al instante.</div><div class="acts"><button class="btn" id="b-ej2">Ver un ejemplo</button></div></div>'; return; }
    var r = ULT.r, txt = fmt(r.valor), u = r.unidad || "", ex = "";
    if (r.impuesto) ex = "De ese precio, " + fmt(r.impuesto) + " es IVA.";
    else if (r.cambio) ex = (r.cambio.signo() >= 0 ? "Sube " : "Baja ") + fmt(r.cambio.signo() < 0 ? r.cambio.neg() : r.cambio) + ".";
    else if (!r.valor.esEntero() && r.valor.d < 1000000000n) ex = "Valor exacto: " + r.valor.fraccion();
    e.innerHTML = '<div class="res"><small>La respuesta es</small><div class="v" id="v-res">' + esc(txt) + (u ? ' <span style="font-size:.45em;color:var(--mut);font-weight:600">' + esc(u) + "</span>" : "") + '</div><div class="ex">' + esc(ex) + '</div><div class="acts"><button class="btn p" id="b-cop">Copiar respuesta</button><button class="btn" id="b-gua">Guardar</button></div></div>' +
      '<details style="margin-top:6px"><summary class="lnk" style="cursor:pointer;list-style:none">¿Cómo se calculó? ▾</summary><div style="margin-top:10px"><div class="frm">' + esc(r.formula) + '</div><ol class="pasos">' + r.pasos.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ol></div></details>";
  }
  function pintarHist() {
    var e = $("historial");
    e.innerHTML = '<div style="display:flex;align-items:center"><h2 style="margin:0;flex:1">Mis cálculos guardados</h2>' + (HIST.length ? '<button class="lnk" id="b-bor">Borrar todos</button>' : "") + "</div>" +
      (HIST.length ? '<ul class="hist" style="margin-top:8px">' + HIST.slice(0, 12).map(function (h, i) { return '<li data-h="' + i + '"><div class="t"><span>' + esc(h.t) + "</span><small>" + esc(h.m) + '</small></div><b>' + esc(h.r) + "</b></li>"; }).join("") + "</ul>" : '<div class="vacio">Todavía no guardas ningún cálculo. Toca «Guardar» cuando quieras recordar uno.</div>');
  }
  function pintarAyuda() { $("ayuda-lista").innerHTML = ["directa", "inversa", "compuesta", "pct"].map(function (k) { var x = EJ[k]; return '<div class="ej"><div class="t"><b>' + x.titulo + "</b><small>" + x.frase + "<br><i>" + x.ej + '</i></small></div><button class="btn sm" data-ej="' + k + '">Probar</button></div>'; }).join(""); }

  /* ---------- eventos ---------- */
  document.addEventListener("input", function (e) {
    var id = e.target.id; if (!id) return;
    if (id.indexOf("c-") === 0) S.cel[id.slice(2)] = e.target.value;
    else if (id === "n-a" || id === "n-b") { if (id === "n-a") S.nomA = e.target.value; else S.nomB = e.target.value; document.querySelectorAll("#form .grid4 .fld").forEach(function (f, k) { var u = f.querySelector(".u"); if (u) u.textContent = (k === 0 || k === 2) ? S.nomA : S.nomB; }); }
    else if (id === "k-b") S.comp.b = e.target.value; else if (id === "k-un") S.comp.un = e.target.value;
    else if (/^k-n\d$/.test(id)) S.comp.filas[+id.slice(3)].nombre = e.target.value;
    else if (/^k-a\d$/.test(id)) S.comp.filas[+id.slice(3)].a = e.target.value;
    else if (/^k-c\d$/.test(id)) S.comp.filas[+id.slice(3)].c = e.target.value;
    else if (id.indexOf("p-") === 0) S.pct[{ "p-p": "p", "p-n": "n", "p-a": "a", "p-b": "b", "p-f": "f", "p-v": "v" }[id]] = e.target.value;
    else return;
    calcular();
  });
  function copiar(s) { (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(s) : Promise.reject()).then(function () { aviso("Copiado: " + s); }, function () { var ta = document.createElement("textarea"); ta.value = s; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (x) {} ta.remove(); aviso(ok ? "Copiado: " + s : "No se pudo copiar"); }); }
  function ejemplo(m) { var s = nuevo(); EJ[m].lleno(s); S = s; ponerModo(m); pintarForm(); thumb(); }
  document.addEventListener("click", function (e) {
    var li = e.target.closest("[data-h]"); if (li) { cargar(+li.dataset.h); return; }
    var t = e.target.closest("button"); if (!t) return;
    if (t.dataset.m) { S.modo = t.dataset.m; ponerModo(S.modo); pintarForm(); thumb(); return; }
    if (t.dataset.ej) { $("dlg-ayuda").close(); ejemplo(t.dataset.ej); return; }
    if (t.id === "b-ej" || t.id === "b-ej2") { ejemplo(S.modo); return; }
    if (t.id === "b-cic") { var o = ["b2", "a2", "b1", "a1"]; S.inc = o[(o.indexOf(S.inc) + 1) % 4]; S.cel[S.inc] = ""; pintarForm(); return; }
    if (t.id === "b-lim") { var m0 = S.modo, a0 = S.nomA, b0 = S.nomB; S = nuevo(); S.modo = m0; S.nomA = a0; S.nomB = b0; pintarForm(); return; }
    if (t.id === "b-mas") { S.comp.filas.push({ nombre: "", a: "", c: "", tipo: "directa" }); pintarForm(); return; }
    if (t.dataset.del !== undefined) { S.comp.filas.splice(+t.dataset.del, 1); pintarForm(); return; }
    if (t.dataset.tipo) { var p = t.dataset.tipo.split(":"); S.comp.filas[+p[0]].tipo = p[1]; pintarForm(); return; }
    if (t.dataset.sub) { S.pct.sub = t.dataset.sub; pintarForm(); return; }
    if (t.dataset.sg) { S.pct.signo = +t.dataset.sg; pintarForm(); return; }
    if (t.dataset.dir) { S.pct.dir = +t.dataset.dir; pintarForm(); return; }
    if (t.id === "b-cop" && ULT) { copiar(fmt(ULT.r.valor)); return; }
    if (t.id === "b-gua" && ULT) { HIST.unshift({ t: ULT.titulo, r: fmt(ULT.r.valor) + (ULT.r.unidad ? " " + ULT.r.unidad : ""), m: { directa: "Más y más", inversa: "Más y menos", compuesta: "Varias cosas", pct: "Porcentajes" }[S.modo], s: JSON.parse(JSON.stringify(S)) }); guardarHist(); pintarHist(); aviso("Guardado"); return; }
    if (t.id === "b-bor") { HIST = []; guardarHist(); pintarHist(); return; }
    if (t.id === "b-tema") { AJ.tema = oscuroAhora() ? "claro" : "oscuro"; guardarAj(); aplicarTema(); return; }
    if (t.id === "b-ayuda") { pintarAyuda(); $("dlg-ayuda").showModal(); return; }
    if (t.id === "ay-ok") { $("dlg-ayuda").close(); return; }
    if (t.id === "b-aj") { $("aj-dec").value = String(AJ.dec); $("aj-tema").value = AJ.tema; $("aj-ceros").value = AJ.ceros ? "1" : "0"; $("dlg-aj").showModal(); return; }
    if (t.id === "aj-ok") { $("dlg-aj").close(); return; }
  });
  function cargar(i) { var h = HIST[i]; if (!h) return; S = h.s; ponerModo(S.modo); pintarForm(); thumb(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  $("aj-dec").onchange = function () { AJ.dec = +this.value; guardarAj(); calcular(); };
  $("aj-tema").onchange = function () { AJ.tema = this.value; guardarAj(); aplicarTema(); };
  $("aj-ceros").onchange = function () { AJ.ceros = this.value === "1"; guardarAj(); calcular(); };
  if (window.matchMedia) try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", aplicarTema); } catch (x) {}
  function thumb() { var sg = $("modos"), th = sg.querySelector(".th"), a = sg.querySelector('button[aria-pressed="true"]'); if (!a || !a.offsetWidth) return; th.style.width = a.offsetWidth + "px"; th.style.transform = "translateX(" + a.offsetLeft + "px)"; }
  if (window.ResizeObserver) new ResizeObserver(thumb).observe($("modos"));
  window.addEventListener("load", thumb); window.addEventListener("resize", thumb); document.addEventListener("artemis:dispositivo", thumb);
  /* enlaces de prueba: ?ej=inversa  ·  ?dark  ·  ?m=pct&sub=iva&p_v=10000 */
  (function () { var q = new URLSearchParams(location.search); if (q.get("ej") && EJ[q.get("ej")]) { var s = nuevo(); EJ[q.get("ej")].lleno(s); S = s; ponerModo(S.modo); }
    if (q.get("m")) ponerModo(q.get("m")); ["a1", "b1", "a2", "b2"].forEach(function (k) { if (q.get(k)) S.cel[k] = q.get(k); }); if (q.get("sub")) S.pct.sub = q.get("sub"); ["p", "n", "a", "b", "f", "v"].forEach(function (k) { if (q.get("p_" + k)) S.pct[k] = q.get("p_" + k); });
    if (q.has("dark")) AJ.tema = "oscuro"; if (q.has("light")) AJ.tema = "claro"; if (q.has("ayuda")) setTimeout(function () { pintarAyuda(); $("dlg-ayuda").showModal(); }, 100); })();
  aplicarTema(); pintarForm(); pintarHist(); setTimeout(thumb, 30); if (document.fonts && document.fonts.ready) document.fonts.ready.then(thumb);
})();
