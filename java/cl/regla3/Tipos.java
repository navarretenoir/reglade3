package cl.regla3;

/** Los nueve cálculos que ofrecen las versiones Java (Java ME y Android antiguo) y sus textos. */
public final class Tipos {
    public static final String[] NOMBRES = {
        "Mas y mas: si una cosa sube, la otra tambien", "Mas y menos: si una cosa sube, la otra baja", "Calcular un % de un numero",
        "Que porcentaje es una parte del total", "Subir un valor un cierto %", "Bajar un valor un cierto %", "Volver al precio original",
        "IVA 19 %: de precio sin IVA a con IVA", "IVA 19 %: de precio con IVA a sin IVA" };

    private Tipos() {}

    /** Etiquetas de los campos (hasta 3) para el tipo t; los vacíos no se muestran. */
    public static String[] etiquetas(int t) {
        switch (t) {
            case 0: case 1: return new String[] { "Lo que ya se: primera cosa (ej.: 3)", "Lo que ya se: segunda cosa (ej.: 2400)", "Calcular para esta cantidad de la primera cosa" };
            case 2: return new String[] { "El porcentaje (%)", "De este numero", "" };
            case 3: return new String[] { "La parte", "Del total", "" };
            case 4: return new String[] { "Valor de partida", "Cuanto sube (%)", "" };
            case 5: return new String[] { "Valor de partida", "Cuanto baja (%)", "" };
            case 6: return new String[] { "Valor final (lo que pagaste)", "Porcentaje de descuento", "" };
            default: return new String[] { "Precio", "", "" };
        }
    }

    /** Calcula el tipo t con los textos escritos; devuelve null y deja el mensaje en msg[0] si hay un número inválido. */
    public static Core.Res calcular(int t, String[] txt, int dec, String[] msg) {
        double[] v = new double[3];
        int n = etiquetas(t)[2].length() > 0 ? 3 : (etiquetas(t)[1].length() > 0 ? 2 : 1);
        for (int i = 0; i < n; i++) {
            double[] o = new double[1];
            if (!Core.leer(txt[i], o)) { msg[0] = "Escribe solo numeros (decimales con coma, ej.: 2,5)."; return null; }
            v[i] = o[0];
        }
        switch (t) {
            case 0: return Core.directa(v[0], v[1], v[2], dec, "", "");
            case 1: return Core.inversa(v[0], v[1], v[2], dec, "", "");
            case 2: return Core.pctDe(v[0], v[1], dec);
            case 3: return Core.pctQue(v[0], v[1], dec);
            case 4: return Core.variacion(v[0], v[1], 1, dec);
            case 5: return Core.variacion(v[0], v[1], -1, dec);
            case 6: return Core.original(v[0], v[1], -1, dec);
            case 7: return Core.iva(v[0], true, dec);
            default: return Core.iva(v[0], false, dec);
        }
    }
}
