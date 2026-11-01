/* Paridad núcleo C <-> motor JS de Regla de 3: imprime «etiqueta=valor» para una lista de casos. */
#include <stdio.h>
#include "../nucleo/regla.h"
static void m(const char *e, double x) { char b[64]; rg_fmt(x, 2, 0, b); printf("%s=%s\n", e, b); }
static void l(const char *s) { double v; char b[64]; if (rg_leer(s, &v)) { rg_fmt(v, 4, 0, b); printf("leer(%s)=%s\n", s, b); } else printf("leer(%s)=NULO\n", s); }
int main(void) {
    RgRes r; double a1[2], c1[2]; int i1[2];
    rg_directa(3, 2400, 5, 2, "", "", &r); m("directa 3 2400 5", r.x);
    rg_inversa(4, 12, 6, 2, "", "", &r); m("inversa 4 12 6", r.x);
    rg_directa(7, 100, 3, 2, "", "", &r); m("directa 7 100 3", r.x);
    rg_inversa(7, 100, 3, 2, "", "", &r); m("inversa 7 100 3", r.x);
    a1[0] = 5; c1[0] = 8; a1[1] = 6; c1[1] = 10; i1[0] = 0; i1[1] = 0; rg_compuesta(600, 2, a1, c1, i1, 2, &r); m("compuesta dir", r.x);
    a1[0] = 6; c1[0] = 4; a1[1] = 8; c1[1] = 6; i1[0] = 1; i1[1] = 1; rg_compuesta(12, 2, a1, c1, i1, 2, &r); m("compuesta inv", r.x);
    rg_pct_de(15, 80, 2, &r); m("pct de 15 80", r.x);
    rg_pct_que(30, 120, 2, &r); m("pct que 30 120", r.x);
    rg_variacion(20000, 25, -1, 2, &r); m("baja 20000 25", r.x);
    rg_variacion(50, 20, 1, 2, &r); m("sube 50 20", r.x);
    rg_original(40000, 20, -1, 2, &r); m("original 40000 20 baja", r.x);
    rg_iva(10000, 1, 2, &r); m("iva neto 10000", r.x);
    rg_iva(11900, 0, 2, &r); m("iva bruto 11900", r.x);
    rg_directa(0, 1, 1, 2, "", "", &r); printf("directa a=0 ok=%d\n", r.ok);
    l("1.234,56"); l("12,5"); l("1.234"); l("1234.5"); l("3/4"); l("-7"); l("abc"); l("1,2,3"); l("0,1"); l("10.000"); l("2,5/0,5");
    return 0;
}
