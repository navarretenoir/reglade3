/* Regla de 3 — versión web para navegadores y plataformas antiguas (Tizen, webOS, WebViews viejos): solo ES3/ES5, sin BigInt, sin grid/flex.
 * Misma matemática que el núcleo en C/Java. Desarrollada por Javiera Navarrete. GPL-3.0-or-later. */
var Regla = (function () {
  function dig(s) { return s.length > 0 && /^[0-9]+$/.test(s); }
  function milesBien(t) { var p = t.split("."), i; for (i = 0; i < p.length; i++) { if (!dig(p[i]) || (i === 0 && p[i].length > 3) || (i > 0 && p[i].length !== 3)) return false; } return true; }
  function leer(s) {
    s = String(s == null ? "" : s).replace(/\s+/g, ""); if (!s || s.length > 70) return null;
    var sl = s.indexOf("/"); if (sl >= 0) { var p = leer(s.substring(0, sl)), q = leer(s.substring(sl + 1)); return (p === null || q === null || q === 0) ? null : p / q; }
    var neg = false; if (s.charAt(0) === "-") { neg = true; s = s.substring(1); } else if (s.charAt(0) === "+") s = s.substring(1);
    if (!s || !/^[0-9.,]+$/.test(s)) return null;
    var nc = s.split(",").length - 1, np = s.split(".").length - 1, num, ent, dec;
    if (nc > 1) return null;
    if (nc === 1) { var c = s.indexOf(","); ent = s.substring(0, c); dec = s.substring(c + 1); if (np > 0 && !milesBien(ent)) return null; ent = ent.split(".").join(""); if (!ent && !dec) return null; if (dec && !dig(dec)) return null; num = (ent || "0") + (dec ? "." + dec : ""); }
    else if (np > 1) { if (!milesBien(s)) return null; num = s.split(".").join(""); }
    else if (np === 1) { var d = s.indexOf("."), a = s.substring(0, d), b = s.substring(d + 1); if (a.length >= 1 && a.length <= 3 && b.length === 3 && dig(a) && dig(b)) num = a + b; else { if (!a && !b) return null; num = (a || "0") + (b ? "." + b : ""); } }
    else num = s;
    var v = parseFloat(num); if (isNaN(v)) return null; return neg ? -v : v;
  }
  function fmt(x, dec) {
    var esc = 1, i; for (i = 0; i < dec; i++) esc *= 10; var neg = x < 0; if (neg) x = -x;
    var v = Math.floor(x * esc + 0.5 + (x * esc > 1 ? 1e-9 : 0)); var s = String(v); if (v >= 1e15) { s = String(Math.round(x)); dec = 0; esc = 1; }
    while (s.length <= dec) s = "0" + s;
    var ent = s.substring(0, s.length - dec), dc = dec ? s.substring(s.length - dec) : ""; dc = dc.replace(/0+$/, "");
    ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, "."); return (neg && v !== 0 ? "-" : "") + ent + (dc ? "," + dc : "");
  }
  function nom(v, d, n) { return fmt(v, d) + (n ? " " + n : ""); }
  function falla(m) { return { ok: false, error: m }; }
  var T = {
    NOMBRES: ["Mas y mas: si una cosa sube, la otra tambien", "Mas y menos: si una cosa sube, la otra baja", "Calcular un % de un numero", "Que porcentaje es una parte del total", "Subir un valor un cierto %", "Bajar un valor un cierto %", "Volver al precio original", "IVA 19 %: de precio sin IVA a con IVA", "IVA 19 %: de precio con IVA a sin IVA"],
    etiquetas: function (t) {
      return [["Lo que ya se: primera cosa (ej.: 3)", "Lo que ya se: segunda cosa (ej.: 2400)", "Calcular para esta cantidad de la primera cosa"], ["Lo que ya se: primera cosa (ej.: 4)", "Lo que ya se: segunda cosa (ej.: 12)", "Calcular para esta cantidad de la primera cosa"],
        ["El porcentaje (%)", "De este numero", ""], ["La parte", "Del total", ""], ["Valor de partida", "Cuanto sube (%)", ""], ["Valor de partida", "Cuanto baja (%)", ""], ["Valor final (lo que pagaste)", "Porcentaje de descuento", ""], ["Precio", "", ""], ["Precio", "", ""]][t];
    },
    calcular: function (t, txt, d) {
      var e = T.etiquetas(t), n = e[2] ? 3 : (e[1] ? 2 : 1), v = [], i; for (i = 0; i < n; i++) { v[i] = leer(txt[i]); if (v[i] === null) return falla("Escribe solo numeros (decimales con coma, ej.: 2,5)."); }
      var a = v[0], b = v[1], c = v[2], r = { ok: true, pasos: [], extra: "" }, u, k, m, p;
      if (t === 0) { if (a === 0) return falla("El primer valor no puede ser cero."); r.x = b * c / a; u = b / a; r.pasos.push("Sabemos que " + fmt(a, d) + " corresponden a " + fmt(b, d) + ".", "Buscamos cuanto corresponde a 1: " + fmt(b, d) + " / " + fmt(a, d) + " = " + fmt(u, d) + ".", "Lo multiplicamos por " + fmt(c, d) + ": " + fmt(u, d) + " x " + fmt(c, d) + " = " + fmt(r.x, d) + ".", "Respuesta: " + fmt(c, d) + " corresponden a " + fmt(r.x, d) + "."); }
      else if (t === 1) { if (c === 0) return falla("El tercer valor no puede ser cero."); p = a * b; r.x = p / c; r.pasos.push("Sabemos que con " + fmt(a, d) + " se necesitan " + fmt(b, d) + ".", "Si uno sube, el otro baja: el total es siempre igual (producto = " + fmt(p, d) + ").", "Con " + fmt(c, d) + " ese total se reparte: " + fmt(p, d) + " / " + fmt(c, d) + " = " + fmt(r.x, d) + ".", "Respuesta: con " + fmt(c, d) + " se necesitan " + fmt(r.x, d) + "."); }
      else if (t === 2) { r.x = b * a / 100; r.pasos.push("El 100 % es todo el numero: " + fmt(b, d) + ".", "El 1 % es la centesima parte: " + fmt(b / 100, d) + ".", "Respuesta: el " + fmt(a, d) + " % de " + fmt(b, d) + " es " + fmt(r.x, d) + "."); }
      else if (t === 3) { if (b === 0) return falla("El total no puede ser cero."); r.x = a * 100 / b; r.pasos.push("Comparamos la parte con el total y lo multiplicamos por 100.", "Respuesta: " + fmt(a, d) + " es el " + fmt(r.x, d) + " % de " + fmt(b, d) + "."); }
      else if (t === 4 || t === 5) { k = t === 4 ? 1 : -1; m = a * b / 100; r.x = a + k * m; r.pasos.push("El " + fmt(b, d) + " % de " + fmt(a, d) + " es " + fmt(m, d) + ".", (k > 0 ? "Como sube, se suma: " : "Como baja, se resta: ") + fmt(a, d) + (k > 0 ? " + " : " - ") + fmt(m, d) + " = " + fmt(r.x, d) + ".", "Respuesta: queda en " + fmt(r.x, d) + "."); r.extra = (k > 0 ? "Sube " : "Baja ") + fmt(m, d) + "."; }
      else if (t === 6) { k = 1 - b / 100; if (k === 0) return falla("Con un descuento del 100 % no se puede recuperar el valor original."); r.x = a / k; r.pasos.push("El valor final es el " + fmt(k * 100, d) + " % del original.", "Entonces " + fmt(a, d) + " es el " + fmt(k * 100, d) + " %: para hallar el 100 % dividimos.", "Respuesta: el valor original era " + fmt(r.x, d) + "."); }
      else { var br = t === 7; r.x = br ? a * 1.19 : a / 1.19; m = br ? r.x - a : a - r.x; r.pasos.push("En Chile el IVA es 19 %: el precio con IVA es el 119 % del neto.", (br ? "Con IVA: " + fmt(a, d) + " x 1,19 = " : "Sin IVA: " + fmt(a, d) + " / 1,19 = ") + fmt(r.x, d) + ".", "El IVA es " + fmt(m, d) + "."); r.extra = "De ese precio, " + fmt(m, d) + " es IVA."; }
      return r;
    }
  };
  return { leer: leer, fmt: fmt, T: T };
})();
