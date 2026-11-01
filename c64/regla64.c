/* Regla de 3 para Commodore 64 (cc65). Aritmética entera con 2 decimales (valores hasta 42.949.672,95) y producto intermedio de 64 bits
 * emulado: sin errores de redondeo. Textos sin tildes. Desarrollada por Javiera Navarrete. GPL-3.0-or-later. */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

typedef unsigned long u32;
typedef struct { u32 hi, lo; } u64;

/* a * b -> 64 bits (suma y desplazamiento) */
static void mul32(u32 a, u32 b, u64 *p) {
    u64 r; u32 ah = 0, al = a; int i; r.hi = 0; r.lo = 0;
    for (i = 0; i < 32; i++) {
        if (b & 1UL) { u32 nl = r.lo + al; r.hi += ah + (nl < r.lo ? 1UL : 0UL); r.lo = nl; }
        ah = (ah << 1) | (al >> 31); al <<= 1; b >>= 1;
    }
    p->hi = r.hi; p->lo = r.lo;
}
/* n / d (d > 0), redondeado al más cercano; n de 64 bits; devuelve 0xFFFFFFFF si el resultado no cabe en 32 bits.
 * Solo desplazamientos de 1 bit (el compilador de 6502 trata mal los desplazamientos de largo variable). */
static u32 div64(const u64 *n, u32 d) {
    u32 qh = 0, ql = 0, rem = 0, mh = 0x80000000UL, ml = 0x80000000UL, carry, bit; int i;
    for (i = 0; i < 64; i++) {
        if (i < 32) { bit = (n->hi & mh) ? 1UL : 0UL; mh >>= 1; } else { bit = (n->lo & ml) ? 1UL : 0UL; ml >>= 1; }
        carry = (rem & 0x80000000UL) ? 1UL : 0UL; rem = (rem << 1) | bit;
        qh = (qh << 1) | (ql >> 31) ; ql <<= 1;
        if (carry || rem >= d) { rem -= d; ql |= 1UL; }
    }
    if (qh) return 0xFFFFFFFFUL;
    if (rem >= d - rem) { if (ql == 0xFFFFFFFFUL) return ql; ql++; }
    return ql;
}
/* a * b / c con redondeo; todos escalados x100 */
static u32 muldiv(u32 a, u32 b, u32 c) { u64 t; mul32(a, b, &t); return div64(&t, c); }

/* lectura de un número positivo con coma o punto decimal -> x100 */
static int leer(const char *s, u32 *out) {
    u32 ent = 0, dec = 0; int nd = 0, coma = 0, hay = 0;
    while (*s == ' ') s++;
    for (; *s && *s != '\n' && *s != '\r'; s++) {
        if (*s >= '0' && *s <= '9') { hay = 1; if (!coma) { if (ent > 42949671UL) return 0; ent = ent * 10 + (u32)(*s - '0'); } else if (nd < 2) { dec = dec * 10 + (u32)(*s - '0'); nd++; } }
        else if ((*s == ',' || *s == '.') && !coma) coma = 1;
        else if (*s == ' ') continue;
        else return 0;
    }
    if (!hay) return 0;
    while (nd < 2) { dec *= 10; nd++; }
    if (ent > 42949672UL || (ent == 42949672UL && dec > 95)) return 0;
    *out = ent * 100UL + dec; return 1;
}
static void mostrar(u32 v) { printf("%lu,%02lu", v / 100UL, v % 100UL); }
static u32 pedir(const char *t) {
    char b[24]; u32 v;
    for (;;) { printf("%s: ", t); if (!fgets(b, sizeof b, stdin)) exit(0); if (leer(b, &v)) return v; printf("  Solo numeros, ej. 2,5\n"); }
}

static void directa(void) { u32 a = pedir("Primera cosa (dato)"), b = pedir("Segunda cosa (dato)"), c = pedir("Calcular para esta cantidad"); u32 x;
    if (a == 0) { printf("  El primer valor no puede ser cero.\n"); return; }
    x = muldiv(b, c, a); printf("\n  Si "); mostrar(a); printf(" son "); mostrar(b); printf(",\n  entonces "); mostrar(c); printf(" son "); mostrar(x); printf("\n"); }
static void inversa(void) { u32 a = pedir("Primera cosa (dato)"), b = pedir("Segunda cosa (dato)"), c = pedir("Calcular para esta cantidad"); u32 x;
    if (c == 0) { printf("  El tercer valor no puede ser cero.\n"); return; }
    x = muldiv(a, b, c); printf("\n  Con "); mostrar(a); printf(" se necesitan "); mostrar(b); printf(",\n  con "); mostrar(c); printf(" se necesitan "); mostrar(x); printf("\n"); }
static void pct(void) { u32 p = pedir("Porcentaje"), n = pedir("De este numero"); printf("\n  El "); mostrar(p); printf(" %% de "); mostrar(n); printf(" es "); mostrar(muldiv(n, p, 10000UL)); printf("\n"); }
static void que(void) { u32 a = pedir("La parte"), b = pedir("Del total"); if (b == 0) { printf("  El total no puede ser cero.\n"); return; }
    printf("\n  "); mostrar(a); printf(" es el "); mostrar(muldiv(a, 10000UL, b)); printf(" %% de "); mostrar(b); printf("\n"); }
static void sube(int s) { u32 n = pedir("Valor de partida"), p = pedir(s > 0 ? "Cuanto sube (%)" : "Cuanto baja (%)"), m = muldiv(n, p, 10000UL);
    printf("\n  El "); mostrar(p); printf(" %% es "); mostrar(m); printf("\n  Queda en "); mostrar(s > 0 ? n + m : (n > m ? n - m : 0)); printf("\n"); }
static void iva(void) { u32 v = pedir("Precio sin IVA"); printf("\n  Con IVA 19 %%: "); mostrar(muldiv(v, 119UL, 100UL)); printf("\n"); }

#ifndef PRUEBA
int main(void) {
    char t[8];
    printf("\nREGLA DE 3\ncalcula lo que no sabes a partir de\nlo que si sabes.\nDesarrollada por Javiera Navarrete\n");
    for (;;) {
        printf("\n1 Mas y mas  2 Mas y menos  3 Calcular %%\n4 Que %% es  5 Subir  6 Bajar  7 IVA  0 Salir\n> ");
        if (!fgets(t, sizeof t, stdin)) return 0;
        switch (t[0]) { case '1': directa(); break; case '2': inversa(); break; case '3': pct(); break; case '4': que(); break; case '5': sube(1); break; case '6': sube(-1); break; case '7': iva(); break; case '0': return 0; }
    }
}
#else
int main(void) { u32 v; mostrar(muldiv(240000UL, 500UL, 300UL)); printf("|"); mostrar(muldiv(400UL, 1200UL, 600UL)); printf("|"); mostrar(muldiv(10000UL, 10000UL, 7UL)); printf("|"); mostrar(muldiv(1500UL, 2000UL, 10000UL)); printf("|");
    if (leer("1234,56", &v)) mostrar(v); printf("|"); if (leer("12.5", &v)) mostrar(v); printf("|%d\n", leer("abc", &v)); return 0; }
#endif
