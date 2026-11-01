package cl.regla3;

import javax.microedition.lcdui.Alert;
import javax.microedition.lcdui.AlertType;
import javax.microedition.lcdui.Choice;
import javax.microedition.lcdui.ChoiceGroup;
import javax.microedition.lcdui.Command;
import javax.microedition.lcdui.CommandListener;
import javax.microedition.lcdui.Display;
import javax.microedition.lcdui.Displayable;
import javax.microedition.lcdui.Form;
import javax.microedition.lcdui.Item;
import javax.microedition.lcdui.ItemStateListener;
import javax.microedition.lcdui.StringItem;
import javax.microedition.lcdui.TextField;
import javax.microedition.midlet.MIDlet;

/**
 * Regla de 3 para Symbian y teléfonos Java ME (MIDP 2.0 / CLDC 1.1). Interfaz de formulario simple, sin internet.
 * Desarrollada por Javiera Navarrete. GPL-3.0-or-later.
 */
public class ReglaMidlet extends MIDlet implements CommandListener, ItemStateListener {
    private Display pantalla;
    private Form f;
    private ChoiceGroup tipo;
    private TextField[] campo = new TextField[3];
    private StringItem resultado, pasos;
    private final Command calcular = new Command("Calcular", Command.OK, 1);
    private final Command acerca = new Command("Acerca de", Command.SCREEN, 2);
    private final Command salir = new Command("Salir", Command.EXIT, 3);

    protected void startApp() {
        if (f != null) { pantalla.setCurrent(f); return; }
        pantalla = Display.getDisplay(this);
        f = new Form("Regla de 3");
        tipo = new ChoiceGroup("Que quieres calcular?", Choice.POPUP);
        for (int i = 0; i < Tipos.NOMBRES.length; i++) tipo.append(Tipos.NOMBRES[i], null);
        f.append(tipo);
        for (int i = 0; i < 3; i++) { campo[i] = new TextField("", "", 20, TextField.ANY); f.append(campo[i]); }
        resultado = new StringItem("", "");
        pasos = new StringItem("", "");
        f.append(resultado);
        f.append(pasos);
        f.append(new StringItem("", "Desarrollada por Javiera Navarrete. Funciona sin internet."));
        f.addCommand(calcular);
        f.addCommand(acerca);
        f.addCommand(salir);
        f.setCommandListener(this);
        f.setItemStateListener(this);
        etiquetas();
        pantalla.setCurrent(f);
    }

    private void etiquetas() {
        String[] e = Tipos.etiquetas(tipo.getSelectedIndex());
        for (int i = 0; i < 3; i++) campo[i].setLabel(e[i].length() > 0 ? e[i] : " ");
        resultado.setText("");
        pasos.setText("");
    }

    public void itemStateChanged(Item item) { if (item == tipo) etiquetas(); }

    public void commandAction(Command c, Displayable d) {
        if (c == salir) { notifyDestroyed(); return; }
        if (c == acerca) {
            Alert a = new Alert("Regla de 3", "Calcula lo que no sabes a partir de lo que si sabes.\nDesarrollada por Javiera Navarrete.\nGPL-3.0-or-later.", null, AlertType.INFO);
            a.setTimeout(Alert.FOREVER);
            pantalla.setCurrent(a, f);
            return;
        }
        int t = tipo.getSelectedIndex();
        String[] txt = { campo[0].getString(), campo[1].getString(), campo[2].getString() }, msg = new String[1];
        Core.Res r = Tipos.calcular(t, txt, 2, msg);
        if (r == null) { resultado.setText(msg[0]); pasos.setText(""); return; }
        if (!r.ok) { resultado.setText(r.error); pasos.setText(""); return; }
        resultado.setText("LA RESPUESTA ES: " + Core.fmt(r.x, 2) + (r.extra.length() > 0 ? "\n" + r.extra : ""));
        StringBuffer sb = new StringBuffer("Como se calculo:\n");
        for (int i = 0; i < r.pasos.size(); i++) sb.append(i + 1).append(". ").append((String) r.pasos.elementAt(i)).append('\n');
        pasos.setText(sb.toString());
    }

    protected void pauseApp() {}

    protected void destroyApp(boolean u) {}
}
