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

  /* ---------- proporcionalidad ---------- */
  /* Directa: si «a» corresponde a «b», entonces «c» corresponde a x = b·c/a. */
  function directa(a, b, c, o) {
    o = o || {}; chequear([a, b, c]); if (a.esCero()) throw new RangeError("a no puede ser 0");
    var x = b.mul(c).div(a), dc = o.dec === undefined ? 6 : o.dec, n = o.nombres || {};
    return { tipo: "directa", valor: x, formula: "x = (b · c) ÷ a", pasos: [
      "Las dos magnitudes son directamente proporcionales: si una aumenta, la otra aumenta en la misma razón.",
      "Planteamos la proporción: " + F(a, dc) + " es a " + F(b, dc) + " como " + F(c, dc) + " es a x.",
      "En forma de fracciones: " + F(a, dc) + "/" + F(b, dc) + " = " + F(c, dc) + "/x.",
      "Multiplicamos en cruz: " + F(a, dc) + " · x = " + F(b, dc) + " · " + F(c, dc) + ".",
      "Despejamos x: x = (" + F(b, dc) + " · " + F(c, dc) + ") ÷ " + F(a, dc) + " = " + F(b.mul(c), dc) + " ÷ " + F(a, dc) + ".",
      "Resultado: x = " + F(x, dc) + (n.y ? " " + n.y : "") + "." + (x.esEntero() ? "" : "  (exacto: " + x.fraccion() + ")")] };
  }
  /* Inversa: si «a» corresponde a «b», entonces «c» corresponde a x = a·b/c. */
  function inversa(a, b, c, o) {
    o = o || {}; chequear([a, b, c]); if (c.esCero()) throw new RangeError("c no puede ser 0");
    var x = a.mul(b).div(c), dc = o.dec === undefined ? 6 : o.dec, n = o.nombres || {};
    return { tipo: "inversa", valor: x, formula: "x = (a · b) ÷ c", pasos: [
      "Las dos magnitudes son inversamente proporcionales: si una aumenta, la otra disminuye en la misma razón; su producto se mantiene constante.",
      "El producto original es " + F(a, dc) + " · " + F(b, dc) + " = " + F(a.mul(b), dc) + ".",
      "Ese mismo producto debe cumplirse con el nuevo valor: " + F(c, dc) + " · x = " + F(a.mul(b), dc) + ".",
      "Despejamos x: x = " + F(a.mul(b), dc) + " ÷ " + F(c, dc) + ".",
      "Resultado: x = " + F(x, dc) + (n.y ? " " + n.y : "") + "." + (x.esEntero() ? "" : "  (exacto: " + x.fraccion() + ")")] };
  }
  /* Compuesta: x = b · Π razón_i; cada fila trae a (dato original), c (dato nuevo) y su tipo («directa» o «inversa»). */
  function compuesta(b, filas, o) {
    o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([b]);
    if (!filas || !filas.length) throw new TypeError("faltan magnitudes");
    var x = b, pasos = ["Es una regla de tres compuesta: x depende de varias magnitudes a la vez. Comparamos cada una con la incógnita por separado."], i, f, r;
    for (i = 0; i < filas.length; i++) { f = filas[i]; chequear([f.a, f.c]); if (f.a.esCero() || f.c.esCero()) throw new RangeError("los valores de las magnitudes no pueden ser 0"); }
    pasos.push("Dato de partida: " + F(b, dc) + ".");
    for (i = 0; i < filas.length; i++) {
      f = filas[i]; r = f.tipo === "inversa" ? f.a.div(f.c) : f.c.div(f.a);
      pasos.push("Magnitud " + (i + 1) + (f.nombre ? " (" + f.nombre + ")" : "") + ": relación " + (f.tipo === "inversa" ? "inversa" : "directa") + ". Razón = " +
        (f.tipo === "inversa" ? F(f.a, dc) + "/" + F(f.c, dc) : F(f.c, dc) + "/" + F(f.a, dc)) + " = " + F(r, dc) + ".");
      x = x.mul(r);
    }
    pasos.push("Multiplicamos el dato de partida por todas las razones: x = " + F(b, dc) + " · " + filas.map(function (f) { return f.tipo === "inversa" ? "(" + F(f.a, dc) + "/" + F(f.c, dc) + ")" : "(" + F(f.c, dc) + "/" + F(f.a, dc) + ")"; }).join(" · ") + ".");
    pasos.push("Resultado: x = " + F(x, dc) + (o.nombres && o.nombres.y ? " " + o.nombres.y : "") + "." + (x.esEntero() ? "" : "  (exacto: " + x.fraccion() + ")"));
    return { tipo: "compuesta", valor: x, formula: "x = b · Π (razón de cada magnitud)", pasos: pasos };
  }

  /* ---------- porcentajes ---------- */
  var CIEN = new Q(100), UNO = new Q(1);
  function porcentajeDe(p, n, o) { o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([p, n]); var x = n.mul(p).div(CIEN);
    return { tipo: "pct-de", valor: x, formula: "x = N · p ÷ 100", pasos: ["Planteamos: 100 % es " + F(n, dc) + " y " + F(p, dc) + " % es x.", "Proporción directa: x = " + F(n, dc) + " · " + F(p, dc) + " ÷ 100.", "Resultado: el " + F(p, dc) + " % de " + F(n, dc) + " es " + F(x, dc) + "."] }; }
  function queEs(a, b, o) { o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([a, b]); if (b.esCero()) throw new RangeError("el total no puede ser 0"); var x = a.mul(CIEN).div(b);
    return { tipo: "pct-que", valor: x, formula: "p = A · 100 ÷ B", pasos: ["Planteamos: " + F(b, dc) + " es el 100 % y " + F(a, dc) + " es x %.", "Proporción directa: x = " + F(a, dc) + " · 100 ÷ " + F(b, dc) + ".", "Resultado: " + F(a, dc) + " es el " + F(x, dc) + " % de " + F(b, dc) + "."] }; }
  /* signo = +1 (aumento) o −1 (descuento) */
  function variacion(n, p, signo, o) { o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([n, p]); var factor = UNO.add(p.div(CIEN).mul(new Q(signo)));
    var x = n.mul(factor), cambio = x.sub(n);
    return { tipo: signo > 0 ? "aumento" : "descuento", valor: x, cambio: cambio, formula: "F = N · (1 " + (signo > 0 ? "+" : "−") + " p ÷ 100)", pasos: [
      "Un " + (signo > 0 ? "aumento" : "descuento") + " del " + F(p, dc) + " % equivale a multiplicar por " + F(factor, dc) + ".",
      "Valor " + (signo > 0 ? "del aumento" : "del descuento") + ": " + F(n, dc) + " · " + F(p, dc) + " ÷ 100 = " + F(cambio.signo() < 0 ? cambio.neg() : cambio, dc) + ".",
      "Resultado: " + F(n, dc) + (signo > 0 ? " + " : " − ") + F(cambio.signo() < 0 ? cambio.neg() : cambio, dc) + " = " + F(x, dc) + "."] }; }
  /* conocido el valor final F tras un aumento/descuento de p %, halla el original */
  function original(f, p, signo, o) { o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([f, p]); var factor = UNO.add(p.div(CIEN).mul(new Q(signo)));
    if (factor.esCero()) throw new RangeError("con un descuento del 100 % no se puede recuperar el valor original"); var x = f.div(factor);
    return { tipo: "original", valor: x, formula: "N = F ÷ (1 " + (signo > 0 ? "+" : "−") + " p ÷ 100)", pasos: [
      "El valor final es el " + F(factor.mul(CIEN), dc) + " % del original (100 % " + (signo > 0 ? "+ " : "− ") + F(p, dc) + " %).",
      "Planteamos: " + F(factor.mul(CIEN), dc) + " % es " + F(f, dc) + " y 100 % es x.", "Resultado: x = " + F(f, dc) + " · 100 ÷ " + F(factor.mul(CIEN), dc) + " = " + F(x, dc) + "."] }; }
  /* IVA chileno: 19 %. «neto → bruto» o «bruto → neto». */
  var IVA = new Q(19);
  function iva(v, haciaBruto, o) { o = o || {}; var dc = o.dec === undefined ? 6 : o.dec; chequear([v]);
    var r = haciaBruto ? variacion(v, IVA, +1, o) : original(v, IVA, +1, o), x = r.valor, imp = haciaBruto ? x.sub(v) : v.sub(x);
    return { tipo: "iva", valor: x, impuesto: imp, formula: haciaBruto ? "Bruto = Neto · 1,19" : "Neto = Bruto ÷ 1,19", pasos: [
      "El IVA en Chile es 19 %: el precio bruto es el 119 % del neto.",
      haciaBruto ? "Bruto = " + F(v, dc) + " · 1,19 = " + F(x, dc) + "." : "Neto = " + F(v, dc) + " ÷ 1,19 = " + F(x, dc) + ".",
      "El IVA es " + F(imp, dc) + "."] }; }

  return { Q: Q, leer: Q.leer, directa: directa, inversa: inversa, compuesta: compuesta, porcentajeDe: porcentajeDe, queEs: queEs, variacion: variacion, original: original, iva: iva };
});
