package cl.regla3;

import java.util.Vector;

/**
 * Regla de 3 — núcleo en Java compatible con Java ME (CLDC 1.1 / MIDP 2.0, Symbian y teléfonos antiguos) y con Android desde 1.6.
 * Sin genéricos ni String.format. Misma matemática que la interfaz web. Desarrollada por Javiera Navarrete. GPL-3.0-or-later.
 */
public final class Core {
    public static final class Res {
        public double x;
        public boolean ok;
        public String error = "";
        public Vector pasos = new Vector();
        public String extra = "";
    }

    private Core() {}

    /* ---------- lectura y formato a la chilena ---------- */
    private static boolean digitos(String s) {
        if (s.length() == 0) return false;
        for (int i = 0; i < s.length(); i++) { char c = s.charAt(i); if (c < '0' || c > '9') return false; }
        return true;
    }

    private static boolean milesBien(String t) { // 1-3 dígitos y luego grupos de 3, separados por punto
        int pri = 1, ini = 0;
        while (true) {
            int pt = t.indexOf('.', ini);
            String g = pt < 0 ? t.substring(ini) : t.substring(ini, pt);
            if (!digitos(g) || (pri == 1 && g.length() > 3) || (pri == 0 && g.length() != 3)) return false;
            pri = 0;
            if (pt < 0) return true;
            ini = pt + 1;
        }
    }

    private static String sinPuntos(String t) {
        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < t.length(); i++) if (t.charAt(i) != '.') sb.append(t.charAt(i));
        return sb.toString();
    }

    /** Lee «1.234,56», «12,5», «1234.5», «3/4», «-7». Devuelve false si no es un número válido. */
    public static boolean leer(String s, double[] out) {
        if (s == null) return false;
        s = s.trim();
        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < s.length(); i++) if (s.charAt(i) != ' ') sb.append(s.charAt(i));
        String b = sb.toString();
        if (b.length() == 0 || b.length() > 70) return false;
        int sl = b.indexOf('/');
        if (sl >= 0) {
            double[] p = new double[1], q = new double[1];
            if (!leer(b.substring(0, sl), p) || !leer(b.substring(sl + 1), q) || q[0] == 0.0) return false;
            out[0] = p[0] / q[0];
            return true;
        }
        boolean neg = false;
        if (b.charAt(0) == '-') { neg = true; b = b.substring(1); } else if (b.charAt(0) == '+') b = b.substring(1);
        if (b.length() == 0) return false;
        int ncoma = 0, npunto = 0;
        for (int i = 0; i < b.length(); i++) {
            char c = b.charAt(i);
            if (c == ',') ncoma++; else if (c == '.') npunto++; else if (c < '0' || c > '9') return false;
        }
        if (ncoma > 1) return false;
        String num;
        if (ncoma == 1) {
            int cm = b.indexOf(',');
            String ent = b.substring(0, cm), dec = b.substring(cm + 1);
            if (npunto > 0 && !milesBien(ent)) return false;
            ent = sinPuntos(ent);
            if (ent.length() == 0 && dec.length() == 0) return false;
            if (dec.length() > 0 && !digitos(dec)) return false;
            num = (ent.length() == 0 ? "0" : ent) + (dec.length() == 0 ? "" : "." + dec);
        } else if (npunto > 1) {
            if (!milesBien(b)) return false;
            num = sinPuntos(b);
        } else if (npunto == 1) {
            int pt = b.indexOf('.');
            String a = b.substring(0, pt), d = b.substring(pt + 1);
            if (a.length() >= 1 && a.length() <= 3 && d.length() == 3 && digitos(a) && digitos(d)) num = a + d;
            else { if (a.length() == 0 && d.length() == 0) return false; num = (a.length() == 0 ? "0" : a) + (d.length() == 0 ? "" : "." + d); }
        } else num = b;
        try { out[0] = Double.parseDouble(num); } catch (NumberFormatException e) { return false; }
        if (neg) out[0] = -out[0];
        return true;
    }

    /** Escribe x con «dec» decimales (mitad lejos de cero), miles con punto y decimales con coma. */
    public static String fmt(double x, int dec) {
        if (dec < 0) dec = 0;
        if (dec > 8) dec = 8;
        double esc = 1.0;
        for (int i = 0; i < dec; i++) esc *= 10.0;
        boolean neg = x < 0;
        if (neg) x = -x;
        double v = Math.floor(x * esc + 0.5 + (x * esc > 1.0 ? 1e-9 : 0.0));
        if (v >= 9.0e15) return (neg ? "-" : "") + (long) x;
        String dig = Long.toString((long) v);
        while (dig.length() <= dec) dig = "0" + dig;
        String ent = dig.substring(0, dig.length() - dec), dc = dig.substring(dig.length() - dec);
        int nz = dc.length();
        while (nz > 0 && dc.charAt(nz - 1) == '0') nz--;
        dc = dc.substring(0, nz);
        StringBuffer sb = new StringBuffer();
        if (neg && v != 0.0) sb.append('-');
        for (int i = 0; i < ent.length(); i++) { sb.append(ent.charAt(i)); if ((ent.length() - 1 - i) % 3 == 0 && i != ent.length() - 1) sb.append('.'); }
        if (dc.length() > 0) sb.append(',').append(dc);
        return sb.toString();
    }

    private static String nom(double v, int dec, String n) { String t = fmt(v, dec); return (n != null && n.length() > 0) ? t + " " + n : t; }
    private static Res falla(String m) { Res r = new Res(); r.ok = false; r.error = m; return r; }

    /* ---------- proporcionalidad ---------- */
    public static Res directa(double a, double b, double c, int dec, String na, String nb) {
        if (a == 0.0) return falla("El primer valor no puede ser cero.");
        Res r = new Res(); r.ok = true; r.x = b * c / a; double u = b / a;
        r.pasos.addElement("Sabemos que " + nom(a, dec, na) + " corresponden a " + nom(b, dec, nb) + ".");
        r.pasos.addElement("Buscamos cuanto corresponde a 1: " + fmt(b, dec) + " / " + fmt(a, dec) + " = " + fmt(u, dec) + ".");
        r.pasos.addElement("Lo multiplicamos por " + fmt(c, dec) + ": " + fmt(u, dec) + " x " + fmt(c, dec) + " = " + fmt(r.x, dec) + ".");
        r.pasos.addElement("Respuesta: " + nom(c, dec, na) + " corresponden a " + nom(r.x, dec, nb) + ".");
        return r;
    }

    public static Res inversa(double a, double b, double c, int dec, String na, String nb) {
        if (c == 0.0) return falla("El tercer valor no puede ser cero.");
        Res r = new Res(); r.ok = true; double prod = a * b; r.x = prod / c;
        r.pasos.addElement("Sabemos que con " + nom(a, dec, na) + " se necesitan " + nom(b, dec, nb) + ".");
        r.pasos.addElement("Si uno sube, el otro baja: el total es siempre igual (producto = " + fmt(prod, dec) + ").");
        r.pasos.addElement("Con " + nom(c, dec, na) + " ese total se reparte: " + fmt(prod, dec) + " / " + fmt(c, dec) + " = " + fmt(r.x, dec) + ".");
        r.pasos.addElement("Respuesta: con " + nom(c, dec, na) + " se necesitan " + nom(r.x, dec, nb) + ".");
        return r;
    }

    /* ---------- porcentajes ---------- */
    public static Res pctDe(double p, double n, int dec) {
        Res r = new Res(); r.ok = true; r.x = n * p / 100.0;
        r.pasos.addElement("El 100 % es todo el numero: " + fmt(n, dec) + ".");
        r.pasos.addElement("El 1 % es la centesima parte: " + fmt(n / 100.0, dec) + ".");
        r.pasos.addElement("Respuesta: el " + fmt(p, dec) + " % de " + fmt(n, dec) + " es " + fmt(r.x, dec) + ".");
        return r;
    }

    public static Res pctQue(double a, double b, int dec) {
        if (b == 0.0) return falla("El total no puede ser cero.");
        Res r = new Res(); r.ok = true; r.x = a * 100.0 / b;
        r.pasos.addElement("Comparamos la parte con el total y lo multiplicamos por 100.");
        r.pasos.addElement("Respuesta: " + fmt(a, dec) + " es el " + fmt(r.x, dec) + " % de " + fmt(b, dec) + ".");
        return r;
    }

    public static Res variacion(double n, double p, int signo, int dec) {
        Res r = new Res(); r.ok = true; double m = n * p / 100.0; r.x = n + signo * m;
        r.pasos.addElement("El " + fmt(p, dec) + " % de " + fmt(n, dec) + " es " + fmt(m, dec) + ".");
        r.pasos.addElement(signo > 0 ? "Como sube, se suma: " + fmt(n, dec) + " + " + fmt(m, dec) + " = " + fmt(r.x, dec) + "."
                                     : "Como baja, se resta: " + fmt(n, dec) + " - " + fmt(m, dec) + " = " + fmt(r.x, dec) + ".");
        r.pasos.addElement("Respuesta: queda en " + fmt(r.x, dec) + ".");
        r.extra = (signo > 0 ? "Sube " : "Baja ") + fmt(m, dec) + ".";
        return r;
    }

    public static Res original(double f, double p, int signo, int dec) {
        double k = 1.0 + signo * p / 100.0;
        if (k == 0.0) return falla("Con un descuento del 100 % no se puede recuperar el valor original.");
        Res r = new Res(); r.ok = true; r.x = f / k;
        r.pasos.addElement("El valor final es el " + fmt(k * 100.0, dec) + " % del original.");
        r.pasos.addElement("Entonces " + fmt(f, dec) + " es el " + fmt(k * 100.0, dec) + " %: para hallar el 100 % dividimos.");
        r.pasos.addElement("Respuesta: el valor original era " + fmt(r.x, dec) + ".");
        return r;
    }

    public static Res iva(double v, boolean haciaBruto, int dec) {
        Res r = new Res(); r.ok = true; r.x = haciaBruto ? v * 1.19 : v / 1.19;
        double imp = haciaBruto ? r.x - v : v - r.x;
        r.pasos.addElement("En Chile el IVA es 19 %: el precio con IVA es el 119 % del neto.");
        r.pasos.addElement(haciaBruto ? "Con IVA: " + fmt(v, dec) + " x 1,19 = " + fmt(r.x, dec) + "." : "Sin IVA: " + fmt(v, dec) + " / 1,19 = " + fmt(r.x, dec) + ".");
        r.pasos.addElement("El IVA es " + fmt(imp, dec) + ".");
        r.extra = "De ese precio, " + fmt(imp, dec) + " es IVA.";
        return r;
    }
}
