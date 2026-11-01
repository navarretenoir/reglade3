package io.github.navarretenoir.regla3.antiguo;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;

import cl.regla3.Core;
import cl.regla3.Tipos;

/**
 * Regla de 3 para Android antiguo (1.6 en adelante): interfaz con controles nativos, sin WebView, sin permisos y sin internet.
 * Comparte el núcleo Java (cl.regla3.Core) con la versión Java ME de Symbian. Desarrollada por Javiera Navarrete. GPL-3.0-or-later.
 */
public class Principal extends Activity {
    private Spinner tipo;
    private final TextView[] etiqueta = new TextView[3];
    private final EditText[] campo = new EditText[3];
    private TextView resultado, pasos;

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density + 0.5f); }

    private TextView texto(String t, int sp, boolean negrita) {
        TextView v = new TextView(this);
        v.setText(t);
        v.setTextSize(sp);
        if (negrita) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        v.setPadding(0, dp(6), 0, dp(2));
        return v;
    }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        ScrollView sv = new ScrollView(this);
        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setPadding(dp(14), dp(12), dp(14), dp(20));
        sv.addView(col);

        col.addView(texto("Regla de 3", 24, true));
        col.addView(texto("Calcula lo que no sabes a partir de lo que si sabes.", 14, false));
        col.addView(texto("Que quieres calcular?", 14, true));
        tipo = new Spinner(this);
        ArrayAdapter<String> ad = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_item, Tipos.NOMBRES);
        ad.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        tipo.setAdapter(ad);
        col.addView(tipo);
        for (int i = 0; i < 3; i++) {
            etiqueta[i] = texto("", 14, true);
            campo[i] = new EditText(this);
            campo[i].setSingleLine(true);
            col.addView(etiqueta[i]);
            col.addView(campo[i]);
        }
        Button calc = new Button(this);
        calc.setText("Calcular");
        col.addView(calc);
        resultado = texto("", 20, true);
        pasos = texto("", 15, false);
        col.addView(resultado);
        col.addView(pasos);
        col.addView(texto("Desarrollada por Javiera Navarrete. Funciona sin internet.", 12, false));
        setContentView(sv);

        tipo.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            public void onItemSelected(AdapterView<?> p, View v, int pos, long id) { etiquetas(pos); }
            public void onNothingSelected(AdapterView<?> p) {}
        });
        calc.setOnClickListener(new View.OnClickListener() { public void onClick(View v) { calcular(); } });
        etiquetas(0);
    }

    private void etiquetas(int t) {
        String[] e = Tipos.etiquetas(t);
        for (int i = 0; i < 3; i++) {
            int vis = e[i].length() > 0 ? View.VISIBLE : View.GONE;
            etiqueta[i].setText(e[i]);
            etiqueta[i].setVisibility(vis);
            campo[i].setVisibility(vis);
        }
        resultado.setText("");
        pasos.setText("");
    }

    private void calcular() {
        String[] txt = { campo[0].getText().toString(), campo[1].getText().toString(), campo[2].getText().toString() }, msg = new String[1];
        Core.Res r = Tipos.calcular(tipo.getSelectedItemPosition(), txt, 2, msg);
        if (r == null) { resultado.setText(msg[0]); pasos.setText(""); return; }
        if (!r.ok) { resultado.setText(r.error); pasos.setText(""); return; }
        resultado.setText("La respuesta es: " + Core.fmt(r.x, 2) + (r.extra.length() > 0 ? "\n" + r.extra : ""));
        StringBuilder sb = new StringBuilder("Como se calculo:\n");
        for (int i = 0; i < r.pasos.size(); i++) sb.append(i + 1).append(". ").append((String) r.pasos.elementAt(i)).append('\n');
        pasos.setText(sb.toString());
    }
}
