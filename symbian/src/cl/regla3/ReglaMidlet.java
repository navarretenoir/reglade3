package cl.regla3;

import javax.microedition.lcdui.Display;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.TextField;
import javax.microedition.midlet.MIDlet;
import cl.kotone.ui.*;

/**
 * Regla de 3 para Symbian (Java ME · MIDP 2.0 / CLDC 1.1): interfaz táctil propia, sin internet.
 * Desarrollada por Javiera Navarrete. GPL-3.0-or-later.
 */
public class ReglaMidlet extends MIDlet implements Pantalla.Salida {
    Pantalla pan; int tipo = 0; final String[] val = new String[3]; Core.Res res; String msg = "";

    protected void startApp() {
        if (pan != null) { pan.mostrar(); return; }
        Ui.tema(0xFFA52E, 0xE5650A, 0xD9560A, 0xFFC24A, 0xFBF3EA, 0x3A1E0A);
        pan = new Pantalla(Display.getDisplay(this), this);
        for (int i = 0; i < 3; i++) val[i] = "";
        String[] c = Pref.leer("regla3-v2"); if (c != null && c.length >= 4) { try { tipo = Integer.parseInt(c[0]); } catch (Exception x) { } for (int i = 0; i < 3; i++) val[i] = c[i + 1]; }
        if (tipo < 0 || tipo >= Tipos.NOMBRES.length) tipo = 0;
        pan.abrir(new Principal()); pan.mostrar();
    }
    protected void pauseApp() { }
    protected void destroyApp(boolean u) { guardar(); }
    public void salir() { guardar(); destroyApp(true); notifyDestroyed(); }
    void guardar() { Pref.guardar("regla3-v2", new String[] { "" + tipo, val[0], val[1], val[2] }); }
    void calcular() {
        String[] et = Tipos.etiquetas(tipo); int n = et[2].length() > 0 ? 3 : et[1].length() > 0 ? 2 : 1;
        res = null; msg = "";
        for (int i = 0; i < n; i++) if (val[i].length() == 0) { msg = "Completa los datos para ver la respuesta."; return; }
        String[] m = new String[1]; Core.Res r = Tipos.calcular(tipo, val, 2, m);
        if (r == null) msg = m[0]; else if (!r.ok) msg = r.error; else res = r;
        guardar();
    }

    final class Principal extends Vista {
        final Zonas z = new Zonas();
        Principal() { titulo = "Regla de 3"; barra = new int[] { Ui.I_CHECK, Ui.I_CERRAR, Ui.I_INFO }; barraTxt = new String[] { "Calcular", "Limpiar", "Info" }; calcular(); }
        public void accion(int i) { if (i == 0) { calcular(); if (res == null) pan.aviso(msg); } else if (i == 1) { for (int k = 0; k < 3; k++) val[k] = ""; calcular(); guardar(); } else pan.abrir(new Acerca()); }
        public void pintar(Graphics g, int w, int y0, int y1) {
            z.limpiar(); int m = Ui.k(14), aw = w - 2 * m, y = m;
            Ui.centrado(g, "¿Qué quieres calcular?", w / 2, y, Ui.fS, Ui.TEXTO2); y += Ui.fS.getHeight() + Ui.k(4);
            String[] nom = Ui.envolver(Tipos.NOMBRES[tipo], Ui.fB, aw - Ui.k(48)); int th = Ui.altoLineas(nom, Ui.fB, 3) + Ui.k(22);
            Ui.tarjeta(g, m, y, aw, th); Ui.lineas(g, nom, m + Ui.k(14), y + Ui.k(11), Ui.fB, Ui.ACENTO, 3); Ui.icono(g, Ui.I_FLECHA, m + aw - Ui.k(20), y + th / 2, Ui.k(18), Ui.ACENTO); z.agregar(m, y, aw, th, 100); y += th + m;
            String[] et = Tipos.etiquetas(tipo); int fh = Ui.altoCampo();
            for (int i = 0; i < 3; i++) if (et[i].length() > 0) {
                String[] l = Ui.envolver(et[i], Ui.fS, aw); String t = l[0]; if (l.length > 1) t = Ui.recorta(et[i], Ui.fS, aw);
                Ui.campo(g, m, y, aw, fh, t, val[i]); z.agregar(m, y, aw, fh, i); y += fh + Ui.k(8);
            }
            y += Ui.k(4);
            Ui.boton(g, m, y, aw, Ui.k(48), "Calcular", 0); z.agregar(m, y, aw, Ui.k(48), 101); y += Ui.k(48) + m;
            if (res != null) {
                String big = Core.fmt(res.x, 2); String[] ex = res.extra.length() > 0 ? Ui.envolver(res.extra, Ui.fS, aw - Ui.k(20)) : new String[0];
                int h = Ui.k(18) + Ui.fS.getHeight() + Ui.fL.getHeight() * 2 + Ui.altoLineas(ex, Ui.fS, 4) + Ui.k(14);
                Ui.tarjeta(g, m, y, aw, h);
                Ui.centrado(g, "LA RESPUESTA ES", w / 2, y + Ui.k(10), Ui.fS, Ui.TEXTO2);
                g.setFont(Ui.fL); int bx = w / 2, by = y + Ui.k(14) + Ui.fS.getHeight();
                Ui.centrado(g, big, bx, by, Ui.fL, 0x1F7A43); Ui.centrado(g, big, bx + 1, by, Ui.fL, 0x1F7A43);
                Ui.lineas(g, ex, m + Ui.k(10), by + Ui.fL.getHeight() + Ui.k(6), Ui.fS, Ui.TEXTO2, 4);
                y += h + Ui.k(10);
                Ui.centrado(g, "Cómo se calculó", w / 2, y, Ui.fB, Ui.ACENTO); y += Ui.fB.getHeight() + Ui.k(6);
                for (int i = 0; i < res.pasos.size(); i++) {
                    String[] pl = Ui.envolver((String) res.pasos.elementAt(i), Ui.fN, aw - Ui.k(36)); int ph = Ui.altoLineas(pl, Ui.fN, 6) + Ui.k(12);
                    Ui.tarjeta(g, m, y, aw, ph); g.setColor(Ui.ACENTO); g.fillArc(m + Ui.k(8), y + Ui.k(8), Ui.k(20), Ui.k(20), 0, 360);
                    Ui.centrado(g, "" + (i + 1), m + Ui.k(18), y + Ui.k(8) + (Ui.k(20) - Ui.fS.getHeight()) / 2, Ui.fS, 0xFFFFFF);
                    Ui.lineas(g, pl, m + Ui.k(36), y + Ui.k(6), Ui.fN, Ui.TEXTO, 6); y += ph + Ui.k(6);
                }
            } else if (msg.length() > 0) y += Ui.lineas(g, Ui.envolver(msg, Ui.fN, aw), m, y, Ui.fN, Ui.TEXTO2, 4);
            alto = y + m;
        }
        public void toque(int x, int yy) {
            int id = z.en(x, yy);
            if (id == 100) pan.abrir(new Selector()); else if (id == 101) accion(0);
            else if (id >= 0 && id < 3) pan.pedirTexto(this, id, Ui.recorta(Tipos.etiquetas(tipo)[id], Ui.fN, Ui.W - Ui.k(30)), val[id], 20, TextField.DECIMAL);
        }
        public void entrada(int id, String t) { val[id] = t.trim(); calcular(); }
    }
    final class Selector extends Vista {
        final Zonas z = new Zonas(); String[][] l = new String[Tipos.NOMBRES.length][]; int lw = -1;
        Selector() { titulo = "¿Qué quieres calcular?"; }
        public void invalidar() { lw = -1; }
        public void pintar(Graphics g, int w, int y0, int y1) {
            z.limpiar(); int m = Ui.k(12), aw = w - 2 * m, y = m;
            if (lw != w) { for (int i = 0; i < l.length; i++) l[i] = Ui.envolver(Tipos.NOMBRES[i], Ui.fN, aw - Ui.k(52)); lw = w; }
            for (int i = 0; i < l.length; i++) {
                int h = Ui.altoLineas(l[i], Ui.fN, 3) + Ui.k(20);
                if (y + h >= y0 && y <= y1) {
                    Ui.tarjeta(g, m, y, aw, h); Ui.lineas(g, l[i], m + Ui.k(14), y + Ui.k(10), Ui.fN, i == tipo ? Ui.ACENTO : Ui.TEXTO, 3);
                    if (i == tipo) Ui.icono(g, Ui.I_CHECK, m + aw - Ui.k(22), y + h / 2, Ui.k(18), Ui.ACENTO);
                    z.agregar(m, y, aw, h, i);
                }
                y += h + Ui.k(8);
            }
            alto = y + m;
        }
        public void toque(int x, int y) { int id = z.en(x, y); if (id >= 0) { if (id != tipo) { tipo = id; val[0] = val[1] = val[2] = ""; } calcular(); guardar(); pan.cerrar(); } }
    }
    final class Acerca extends Vista {
        Acerca() { titulo = "Acerca de"; }
        public void pintar(Graphics g, int w, int y0, int y1) {
            int m = Ui.k(18), aw = w - 2 * m, y = Ui.k(24);
            Ui.centrado(g, "Regla de 3", w / 2, y, Ui.fL, Ui.ACENTO); y += Ui.fL.getHeight() + Ui.k(6);
            Ui.centrado(g, "Versión 2.0 para Symbian", w / 2, y, Ui.fS, Ui.TEXTO2); y += Ui.fS.getHeight() + Ui.k(16);
            y += Ui.lineas(g, Ui.envolver("Calcula lo que no sabes a partir de lo que sí sabes: reglas de tres directa e inversa, porcentajes, subidas y bajadas, precio original e IVA 19 %. Muestra cómo se calculó, paso a paso.\n\nFunciona sin internet.\n\nDesarrollada por Javiera Navarrete.\nLicencia GPL-3.0-or-later.", Ui.fN, aw), m, y, Ui.fN, Ui.TEXTO, 40) + m; alto = y;
        }
    }
}
