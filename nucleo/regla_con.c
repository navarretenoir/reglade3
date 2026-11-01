/* Regla de 3 — versión de consola (modo texto) para MS-DOS, FreeDOS, OS/2 Warp y cualquier sistema con compilador de C.
 * Menu numerado, textos sin tildes (compatibles con cualquier pagina de codigos). Desarrollada por Javiera Navarrete. GPL-3.0-or-later. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "regla.h"

static int DEC = 2;

static void linea(char *b, int n) { if (!fgets(b, n, stdin)) { b[0] = 0; return; } b[strcspn(b, "\r\n")] = 0; }
static double pedir(const char *txt) {
    char b[80]; double v;
    for (;;) { printf("%s: ", txt); linea(b, sizeof b); if (rg_leer(b, &v)) return v; printf("  Escribe solo numeros (decimales con coma, por ejemplo 2,5).\n"); }
}
static void texto(const char *txt, char *dst, int n) { printf("%s (puede quedar vacio): ", txt); linea(dst, n); }
static void mostrar(const RgRes *r) {
    int i; char b[64];
    if (!r->ok) { printf("\n  No se pudo calcular: %s\n", r->error); return; }
    rg_fmt(r->x, DEC, 0, b);
    printf("\n  LA RESPUESTA ES: %s\n", b);
    if (r->extra[0]) printf("  %s\n", r->extra);
    printf("\n  Como se calculo:\n");
    for (i = 0; i < r->npasos; i++) printf("   %d. %s\n", i + 1, r->pasos[i]);
}
static void prop(int inversa) {
    char na[40], nb[40]; double a, b, c; RgRes r;
    printf("\n%s\n", inversa ? "MAS Y MENOS: cuando una cosa sube, la otra baja (ej.: mas personas, menos dias)."
                             : "MAS Y MAS: cuando una cosa sube, la otra tambien (ej.: mas kilos, mas plata).");
    texto("De que es la primera cosa (ej.: kilos)", na, sizeof na); texto("De que es la segunda cosa (ej.: pesos)", nb, sizeof nb);
    a = pedir("Lo que ya se - primera cosa"); b = pedir("Lo que ya se - segunda cosa"); c = pedir("Quiero calcular para esta cantidad de la primera cosa");
    if (inversa) rg_inversa(a, b, c, DEC, na, nb, &r); else rg_directa(a, b, c, DEC, na, nb, &r);
    mostrar(&r);
}
static void compuesta(void) {
    double b, a[RG_MAX_FILAS], c[RG_MAX_FILAS]; int inv[RG_MAX_FILAS], n, i; char t[16]; RgRes r;
    printf("\nVARIAS COSAS: el resultado depende de mas de una cosa a la vez (ej.: maquinas y horas).\n");
    b = pedir("Dato que ya conoces (ej.: 600 piezas)");
    do { n = (int)pedir("Cuantas cosas cambian (1 a 5)"); } while (n < 1 || n > RG_MAX_FILAS);
    for (i = 0; i < n; i++) {
        printf(" Cosa n. %d\n", i + 1); a[i] = pedir("  Antes era"); c[i] = pedir("  Ahora es");
        printf("  Si esto sube, el resultado sube (s) o baja (b)? "); linea(t, sizeof t); inv[i] = (t[0] == 'b' || t[0] == 'B');
    }
    rg_compuesta(b, n, a, c, inv, DEC, &r); mostrar(&r);
}
static void porcentajes(void) {
    char t[16]; RgRes r; double a, b;
    printf("\nPORCENTAJES\n 1 Calcular un % de un numero\n 2 Que porcentaje es una parte del total\n 3 Subir un valor\n 4 Bajar un valor\n 5 Volver al precio original\n 6 IVA (19 %%)\n> ");
    linea(t, sizeof t);
    switch (t[0]) {
    case '1': a = pedir("El porcentaje"); b = pedir("De este numero"); rg_pct_de(a, b, DEC, &r); break;
    case '2': a = pedir("La parte"); b = pedir("Del total"); rg_pct_que(a, b, DEC, &r); break;
    case '3': a = pedir("Valor de partida"); b = pedir("Cuanto sube (%)"); rg_variacion(a, b, 1, DEC, &r); break;
    case '4': a = pedir("Valor de partida"); b = pedir("Cuanto baja (%)"); rg_variacion(a, b, -1, DEC, &r); break;
    case '5': a = pedir("Valor final (lo que pagaste)"); b = pedir("Porcentaje de descuento"); rg_original(a, b, -1, DEC, &r); break;
    case '6': { char s[16]; printf(" Precio sin IVA (s) o con IVA (c)? "); linea(s, sizeof s); a = pedir("Precio"); rg_iva(a, !(s[0] == 'c' || s[0] == 'C'), DEC, &r); break; }
    default: return;
    }
    mostrar(&r);
}
int main(void) {
    char t[16];
    printf("REGLA DE 3 - calcula lo que no sabes a partir de lo que si sabes\nDesarrollada por Javiera Navarrete. Funciona sin internet.\n");
    for (;;) {
        printf("\n 1 Mas y mas (directa)   2 Mas y menos (inversa)   3 Varias cosas (compuesta)\n 4 Porcentajes e IVA     5 Decimales (ahora %d)       0 Salir\n> ", DEC);
        linea(t, sizeof t);
        switch (t[0]) {
        case '1': prop(0); break;
        case '2': prop(1); break;
        case '3': compuesta(); break;
        case '4': porcentajes(); break;
        case '5': { int d = (int)pedir("Cuantos decimales mostrar (0 a 6)"); if (d >= 0 && d <= 6) DEC = d; break; }
        case '0': return 0;
        }
    }
}
