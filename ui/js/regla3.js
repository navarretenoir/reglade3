/* Regla de Tres — motor matemático exacto (racionales con BigInt: sin errores de coma flotante).
 * Directa, inversa, compuesta y porcentajes (incluye IVA 19 %), con explicación paso a paso en español de Chile. */
(function (raiz, fabrica) { if (typeof module === "object" && module.exports) module.exports = fabrica(); else raiz.Regla3 = fabrica(); })(this, function () {
  "use strict";
  function abs(a) { return a < 0n ? -a : a; }
  function mcd(a, b) { a = abs(a); b = abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1n; }
  function Q(n, d) {
    if (!(this instanceof Q)) return new Q(n, d);
    n = BigInt(n); d = d === undefined ? 1n : BigInt(d);
    if (d === 0n) throw new RangeError("división por cero");
    if (d < 0n) { n = -n; d = -d; }
    var g = mcd(n, d); this.n = n / g; this.d = d / g;
  }
  Q.prototype.add = function (o) { return new Q(this.n * o.d + o.n * this.d, this.d * o.d); };
  Q.prototype.sub = function (o) { return new Q(this.n * o.d - o.n * this.d, this.d * o.d); };
  Q.prototype.mul = function (o) { return new Q(this.n * o.n, this.d * o.d); };
  Q.prototype.div = function (o) { if (o.n === 0n) throw new RangeError("división por cero"); return new Q(this.n * o.d, this.d * o.n); };
  Q.prototype.neg = function () { return new Q(-this.n, this.d); };
  Q.prototype.esCero = function () { return this.n === 0n; };
  Q.prototype.signo = function () { return this.n < 0n ? -1 : this.n > 0n ? 1 : 0; };
  Q.prototype.cmp = function (o) { var x = this.n * o.d, y = o.n * this.d; return x < y ? -1 : x > y ? 1 : 0; };
  Q.prototype.esEntero = function () { return this.d === 1n; };
  Q.prototype.aNumero = function () { return Number(this.n) / Number(this.d); };
  /* redondea a «dec» decimales (mitad lejos de cero) y devuelve [signo, enteros, decimales] en cadena */
  Q.prototype.partes = function (dec) {
    var neg = this.n < 0n, n = abs(this.n), esc = 10n ** BigInt(dec), v = (n * esc * 2n + this.d) / (this.d * 2n);
    var s = v.toString(); while (s.length <= dec) s = "0" + s;
    return [neg && v !== 0n, s.slice(0, s.length - dec), dec ? s.slice(s.length - dec) : ""];
  };
  Q.prototype.formato = function (dec, ceros) {
    var p = this.partes(dec), ent = p[1].replace(/\B(?=(\d{3})+(?!\d))/g, "."), dc = p[2];
    if (!ceros) dc = dc.replace(/0+$/, "");
    return (p[0] ? "−" : "") + ent + (dc ? "," + dc : "");
  };
  Q.prototype.fraccion = function () { return this.d === 1n ? this.n.toString() : this.n.toString() + "/" + this.d.toString(); };

  /* Lee un número escrito a la chilena: «1.234,56», «12,5», «1234.5», «3/4», «−7». Devuelve Q o null. */
  Q.leer = function (s) {
    if (s == null) return null;
    s = String(s).trim().replace(/\s+/g, "").replace(/−/g, "-").replace(/^\+/, "");
    if (!s) return null;
    var fr = s.match(/^(-?[\d.,]+)\/([\d.,]+)$/);
    if (fr) { var a = Q.leer(fr[1]), b = Q.leer(fr[2]); return a && b && !b.esCero() ? a.div(b) : null; }
    var neg = false; if (s[0] === "-") { neg = true; s = s.slice(1); }
    if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null;
    var ent, dec = "";
    if (s.indexOf(",") >= 0) { var ps = s.split(","); if (ps.length > 2) return null; ent = ps[0].replace(/\./g, ""); dec = ps[1]; if (ps[0] && !/^\d{1,3}(\.\d{3})*$|^\d+$/.test(ps[0])) return null; }
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) ent = s.replace(/\./g, "");
    else if ((s.match(/\./g) || []).length === 1) { var q = s.split("."); ent = q[0]; dec = q[1]; }
    else if (s.indexOf(".") < 0) ent = s; else return null;
    if (!/^\d*$/.test(ent) || !/^\d*$/.test(dec) || (ent === "" && dec === "")) return null;
    var r = new Q(BigInt((ent || "0") + dec), 10n ** BigInt(dec.length));
    return neg ? r.neg() : r;
  };

  function F(q, dec) { return q.formato(dec === undefined ? 6 : dec); }
  function frac(a, b) { return "(" + a + ")/(" + b + ")"; }
  function chequear(vals) { for (var i = 0; i < vals.length; i++) if (!vals[i]) throw new TypeError("faltan valores"); }

  /* ---------- explicaciones en lenguaje cotidiano ---------- */
  function ud(v, nombre, dc) { return F(v, dc) + (nombre ? " " + nombre : ""); }
  function pl(nombre) { return nombre || ""; }

  /* ---------- proporcionalidad ---------- */
  /* Directa: si «a» corresponde a «b», entonces «c» corresponde a x = b·c/a. */
  function directa(a, b, c, o) {
    o = o || {}; chequear([a, b, c]); if (a.esCero()) throw new RangeError("a no puede ser 0");
    var x = b.mul(c).div(a), dc = o.dec === undefined ? 6 : o.dec, n = o.nombres || {}, unit = b.div(a);
    return { tipo: "directa", valor: x, formula: "(" + F(b, dc) + " × " + F(c, dc) + ") ÷ " + F(a, dc) + " = " + F(x, dc), pasos: [
      "Sabemos que " + ud(a, n.a, dc) + " corresponden a " + ud(b, n.b, dc) + ".",
      "Si hay más de uno, hay más del otro, en la misma proporción. Por eso buscamos cuánto corresponde a 1: " + F(b, dc) + " ÷ " + F(a, dc) + " = " + F(unit, dc) + ".",
      "Eso significa que 1" + (n.a ? " " + n.a : "") + " corresponde a " + ud(unit, n.b, dc) + ".",
      "Ahora lo multiplicamos por la cantidad que te interesa: " + F(unit, dc) + " × " + F(c, dc) + " = " + F(x, dc) + ".",
      "Respuesta: " + ud(c, n.a, dc) + " corresponden a " + ud(x, n.b, dc) + "." + (x.esEntero() ? "" : "  (Valor exacto: " + x.fraccion() + ")")] };
  }
  /* Inversa: si «a» corresponde a «b», entonces «c» corresponde a x = a·b/c. */
  function inversa(a, b, c, o) {
    o = o || {}; chequear([a, b, c]); if (c.esCero()) throw new RangeError("c no puede ser 0");
    var x = a.mul(b).div(c), dc = o.dec === undefined ? 6 : o.dec, n = o.nombres || {}, prod = a.mul(b);
    return { tipo: "inversa", valor: x, formula: "(" + F(a, dc) + " × " + F(b, dc) + ") ÷ " + F(c, dc) + " = " + F(x, dc), pasos: [
      "Sabemos que con " + ud(a, n.a, dc) + " se necesitan " + ud(b, n.b, dc) + ".",
      "Aquí, cuando uno aumenta, el otro disminuye: el \"trabajo total\" siempre es el mismo. Lo calculamos multiplicando: " + F(a, dc) + " × " + F(b, dc) + " = " + F(prod, dc) + ".",
      "Con " + ud(c, n.a, dc) + " ese mismo total se reparte distinto: " + F(prod, dc) + " ÷ " + F(c, dc) + " = " + F(x, dc) + ".",
      "Respuesta: con " + ud(c, n.a, dc) + " se necesitan " + ud(x, n.b, dc) + "." + (x.esEntero() ? "" : "  (Valor exacto: " + x.fraccion() + ")")] };
  }
  /* Compuesta: x = b · Π razón_i; cada fila trae a (dato original), c (dato nuevo) y su tipo («directa» o «inversa»). */
  function compuesta(b, filas, o) {
    o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([b]);
    if (!filas || !filas.length) throw new TypeError("faltan magnitudes");
    var x = b, i, f, r, un = o.nombres && o.nombres.y ? o.nombres.y : "";
    for (i = 0; i < filas.length; i++) { f = filas[i]; chequear([f.a, f.c]); if (f.a.esCero() || f.c.esCero()) throw new RangeError("los valores de las magnitudes no pueden ser 0"); }
    var pasos = ["Partimos del dato que ya conoces: " + ud(b, un, dc) + ". Ahora vemos, una por una, cómo cambia con cada cosa que varía."];
    for (i = 0; i < filas.length; i++) {
      f = filas[i]; r = f.tipo === "inversa" ? f.a.div(f.c) : f.c.div(f.a); var nm = f.nombre || ("la cantidad " + (i + 1));
      pasos.push(nm.charAt(0).toUpperCase() + nm.slice(1) + " pasa de " + F(f.a, dc) + " a " + F(f.c, dc) + ". " +
        (f.tipo === "inversa" ? "Como al subir esto el resultado baja, multiplicamos por " + F(f.a, dc) + "/" + F(f.c, dc) : "Como al subir esto el resultado también sube, multiplicamos por " + F(f.c, dc) + "/" + F(f.a, dc)) + " = " + F(r, dc) + ".");
      x = x.mul(r);
    }
    pasos.push("Multiplicamos tu dato por todos esos factores: " + F(b, dc) + filas.map(function (f) { return " × " + F(f.tipo === "inversa" ? f.a.div(f.c) : f.c.div(f.a), dc); }).join("") + " = " + F(x, dc) + ".");
    pasos.push("Respuesta: " + ud(x, un, dc) + "." + (x.esEntero() ? "" : "  (Valor exacto: " + x.fraccion() + ")"));
    return { tipo: "compuesta", valor: x, formula: F(b, dc) + filas.map(function (f) { return " × " + F(f.tipo === "inversa" ? f.a.div(f.c) : f.c.div(f.a), dc); }).join("") + " = " + F(x, dc), pasos: pasos };
  }

  /* ---------- porcentajes ---------- */
  var CIEN = new Q(100), UNO = new Q(1);
  function porcentajeDe(p, n, o) { o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([p, n]); var x = n.mul(p).div(CIEN), uno = n.div(CIEN);
    return { tipo: "pct-de", valor: x, formula: F(n, dc) + " × " + F(p, dc) + " ÷ 100 = " + F(x, dc), pasos: ["El 100 % es todo el número: " + F(n, dc) + ".", "El 1 % es la centésima parte: " + F(n, dc) + " ÷ 100 = " + F(uno, dc) + ".", "El " + F(p, dc) + " % son " + F(p, dc) + " veces ese 1 %: " + F(uno, dc) + " × " + F(p, dc) + " = " + F(x, dc) + ".", "Respuesta: el " + F(p, dc) + " % de " + F(n, dc) + " es " + F(x, dc) + "."] }; }
  function queEs(a, b, o) { o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([a, b]); if (b.esCero()) throw new RangeError("el total no puede ser 0"); var x = a.mul(CIEN).div(b);
    return { tipo: "pct-que", valor: x, formula: F(a, dc) + " ÷ " + F(b, dc) + " × 100 = " + F(x, dc) + " %", pasos: ["Comparamos la parte con el total: " + F(a, dc) + " ÷ " + F(b, dc) + " = " + F(a.div(b), dc) + ".", "Para expresarlo como porcentaje, lo multiplicamos por 100: " + F(a.div(b), dc) + " × 100 = " + F(x, dc) + ".", "Respuesta: " + F(a, dc) + " es el " + F(x, dc) + " % de " + F(b, dc) + "."] }; }
  /* signo = +1 (aumento) o −1 (descuento) */
  function variacion(n, p, signo, o) { o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([n, p]); var factor = UNO.add(p.div(CIEN).mul(new Q(signo)));
    var x = n.mul(factor), cambio = x.sub(n), mag = cambio.signo() < 0 ? cambio.neg() : cambio;
    return { tipo: signo > 0 ? "aumento" : "descuento", valor: x, cambio: cambio, formula: F(n, dc) + (signo > 0 ? " + " : " − ") + F(mag, dc) + " = " + F(x, dc), pasos: [
      "Primero calculamos cuánto es el " + F(p, dc) + " % de " + F(n, dc) + ": " + F(n, dc) + " × " + F(p, dc) + " ÷ 100 = " + F(mag, dc) + ".",
      signo > 0 ? "Como es un aumento, esa cantidad se suma al valor original: " + F(n, dc) + " + " + F(mag, dc) + " = " + F(x, dc) + "." : "Como es un descuento, esa cantidad se resta al valor original: " + F(n, dc) + " − " + F(mag, dc) + " = " + F(x, dc) + ".",
      "Respuesta: " + (signo > 0 ? "con el aumento" : "con el descuento") + " queda en " + F(x, dc) + "."] }; }
  /* conocido el valor final F tras un aumento/descuento de p %, halla el original */
  function original(f, p, signo, o) { o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([f, p]); var factor = UNO.add(p.div(CIEN).mul(new Q(signo)));
    if (factor.esCero()) throw new RangeError("con un descuento del 100 % no se puede recuperar el valor original"); var x = f.div(factor), pc = factor.mul(CIEN);
    return { tipo: "original", valor: x, formula: F(f, dc) + " ÷ " + F(factor, dc) + " = " + F(x, dc), pasos: [
      "El valor original era el 100 %. Con " + (signo > 0 ? "un aumento" : "un descuento") + " del " + F(p, dc) + " %, el valor final es el " + F(pc, dc) + " % del original.",
      "Entonces " + F(f, dc) + " corresponde al " + F(pc, dc) + " %. Para hallar el 100 % dividimos por " + F(factor, dc) + ": " + F(f, dc) + " ÷ " + F(factor, dc) + " = " + F(x, dc) + ".",
      "Respuesta: el valor original era " + F(x, dc) + "."] }; }
  /* IVA chileno: 19 %. «neto → bruto» o «bruto → neto». */
  var IVA = new Q(19);
  function iva(v, haciaBruto, o) { o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([v]);
    var r = haciaBruto ? variacion(v, IVA, +1, o) : original(v, IVA, +1, o), x = r.valor, imp = haciaBruto ? x.sub(v) : v.sub(x);
    return { tipo: "iva", valor: x, impuesto: imp, formula: haciaBruto ? F(v, dc) + " × 1,19 = " + F(x, dc) : F(v, dc) + " ÷ 1,19 = " + F(x, dc), pasos: [
      "En Chile el IVA es el 19 %. El precio con IVA es el 119 % del precio sin IVA (neto).",
      haciaBruto ? "Precio con IVA: " + F(v, dc) + " × 1,19 = " + F(x, dc) + "." : "Precio sin IVA: " + F(v, dc) + " ÷ 1,19 = " + F(x, dc) + ".",
      "El IVA es la diferencia: " + F(imp, dc) + "."] }; }

  return { Q: Q, leer: Q.leer, directa: directa, inversa: inversa, compuesta: compuesta, porcentajeDe: porcentajeDe, queEs: queEs, variacion: variacion, original: original, iva: iva };
});
