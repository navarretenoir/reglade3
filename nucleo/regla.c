/* Regla de 3 — núcleo en C89. Desarrollada por Javiera Navarrete. Licencia GPL-3.0-or-later. */
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "regla.h"

/* ---------- lectura y formato ---------- */
static int solo_digitos(const char *s, int n) { int i; for (i = 0; i < n; i++) if (s[i] < '0' || s[i] > '9') return 0; return n > 0; }

int rg_leer(const char *s, double *out) {
    char b[200], t[200]; int i, j = 0, n, neg = 0, ncoma = 0, npunto = 0; const char *sl;
    if (!s) return 0;
    while (*s == ' ' || *s == '\t') s++;
    n = (int)strlen(s);
    while (n > 0 && (s[n - 1] == ' ' || s[n - 1] == '\t' || s[n - 1] == '\r' || s[n - 1] == '\n')) n--;
    if (n <= 0 || n >= 78) return 0;
    for (i = 0; i < n; i++) { if (s[i] != ' ') b[j++] = s[i]; } b[j] = 0;
    sl = strchr(b, '/');
    if (sl) { double p, q; char x[80], y[80]; int k = (int)(sl - b); memcpy(x, b, (size_t)k); x[k] = 0; strcpy(y, sl + 1);
        if (!rg_leer(x, &p) || !rg_leer(y, &q) || q == 0.0) return 0; *out = p / q; return 1; }
    i = 0; if (b[0] == '-') { neg = 1; i = 1; } else if (b[0] == '+') i = 1;
    strcpy(t, b + i); n = (int)strlen(t); if (n == 0) return 0;
    for (i = 0; i < n; i++) { if (t[i] == ',') ncoma++; else if (t[i] == '.') npunto++; else if (t[i] < '0' || t[i] > '9') return 0; }
    if (ncoma > 1) return 0;
    if (ncoma == 1) { /* coma decimal: los puntos son miles */
        char *c = strchr(t, ','); char ent[100]; int k = 0, m, ok = 1; *c = 0;
        if (npunto > 0) { /* miles bien formados: 1-3 dígitos y luego grupos de 3 */
            char *g = t; int pri = 1; while (g) { char *pt = strchr(g, '.'); int largo = pt ? (int)(pt - g) : (int)strlen(g);
                if (largo == 0 || !solo_digitos(g, largo) || (pri && largo > 3) || (!pri && largo != 3)) { ok = 0; break; } pri = 0; g = pt ? pt + 1 : 0; }
            if (!ok) return 0; }
        for (m = 0; t[m]; m++) if (t[m] != '.') ent[k++] = t[m]; ent[k] = 0;
        sprintf(b, "%s.%s", ent[0] ? ent : "0", c + 1); if (c[1] == 0 && ent[0] == 0) return 0;
    } else if (npunto > 1) { /* varios puntos: sólo miles */
        char *g = t; int pri = 1, k = 0, m; char ent[100];
        while (g) { char *pt = strchr(g, '.'); int largo = pt ? (int)(pt - g) : (int)strlen(g);
            if (largo == 0 || (pri && largo > 3) || (!pri && largo != 3)) return 0; pri = 0; g = pt ? pt + 1 : 0; }
        for (m = 0; t[m]; m++) if (t[m] != '.') ent[k++] = t[m]; ent[k] = 0; strcpy(b, ent);
    } else if (npunto == 1) { /* un punto: miles si son exactamente 3 dígitos tras 1-3 dígitos, si no decimal */
        char *pt = strchr(t, '.'); int a = (int)(pt - t), d = (int)strlen(pt + 1);
        if (a >= 1 && a <= 3 && d == 3 && solo_digitos(t, a)) { char ent[100]; sprintf(ent, "%.*s%s", a, t, pt + 1); strcpy(b, ent); }
        else { if (a == 0 && d == 0) return 0; strcpy(b, t); }
    } else strcpy(b, t);
    *out = atof(b); if (neg) *out = -*out;
    return 1;
}

void rg_fmt(double x, int dec, int ceros, char *out) {
    char dig[64], ent[64], dc[16]; double esc = 1.0, v; int i, neg = 0, nd, ne, k = 0, nz;
    if (dec < 0) dec = 0; if (dec > 8) dec = 8;
    for (i = 0; i < dec; i++) esc *= 10.0;
    if (x < 0) { neg = 1; x = -x; }
    v = floor(x * esc + 0.5 + 1e-9 * (x * esc > 1.0 ? 1.0 : 0.0));
    if (v >= 1e15) { sprintf(out, neg ? "-%.0f" : "%.0f", x); return; }
    sprintf(dig, "%.0f", v); nd = (int)strlen(dig);
    while (nd <= dec) { memmove(dig + 1, dig, (size_t)nd + 1); dig[0] = '0'; nd++; }
    ne = nd - dec; memcpy(ent, dig, (size_t)ne); ent[ne] = 0; strcpy(dc, dig + ne);
    if (!ceros) { nz = (int)strlen(dc); while (nz > 0 && dc[nz - 1] == '0') dc[--nz] = 0; }
    if (neg && v != 0.0) out[k++] = '-';
    for (i = 0; i < ne; i++) { out[k++] = ent[i]; if ((ne - 1 - i) % 3 == 0 && i != ne - 1) out[k++] = '.'; }
    if (dc[0]) { out[k++] = ','; strcpy(out + k, dc); } else out[k] = 0;
}

/* ---------- utilidades de resultado ---------- */
static void ini(RgRes *r) { memset(r, 0, sizeof *r); }
static void falla(RgRes *r, const char *m) { r->ok = 0; strncpy(r->error, m, sizeof r->error - 1); }
static void paso(RgRes *r, const char *fmt, const char *a, const char *b, const char *c, const char *d, const char *e) {
    if (r->npasos < RG_MAX_PASOS) { sprintf(r->pasos[r->npasos], fmt, a, b, c, d, e); r->npasos++; }
}
static void con_nom(char *dst, double v, int dec, const char *nom) {
    char t[48]; rg_fmt(v, dec, 0, t); if (nom && nom[0]) sprintf(dst, "%s %s", t, nom); else strcpy(dst, t);
}

/* ---------- proporcionalidad ---------- */
void rg_directa(double a, double b, double c, int dec, const char *na, const char *nb, RgRes *r) {
    char A[80], B[80], C[80], X[80], U[48], P[48]; double u;
    ini(r); if (a == 0.0) { falla(r, "El primer valor no puede ser cero."); return; }
    r->x = b * c / a; u = b / a; r->ok = 1;
    con_nom(A, a, dec, na); con_nom(B, b, dec, nb); con_nom(C, c, dec, na); con_nom(X, r->x, dec, nb);
    paso(r, "Sabemos que %s corresponden a %s.", A, B, "", "", "");
    rg_fmt(u, dec, 0, U); rg_fmt(b, dec, 0, P);
    paso(r, "Buscamos cuanto corresponde a 1: %s / %s = %s.", P, (rg_fmt(a, dec, 0, A), A), U, "", "");
    rg_fmt(c, dec, 0, C);
    paso(r, "Lo multiplicamos por %s: %s x %s = %s.", C, U, C, (rg_fmt(r->x, dec, 0, P), P), "");
    con_nom(C, c, dec, na);
    paso(r, "Respuesta: %s corresponden a %s.", C, X, "", "", "");
}
void rg_inversa(double a, double b, double c, int dec, const char *na, const char *nb, RgRes *r) {
    char A[80], B[80], C[80], X[80], P[48], Q[48]; double prod;
    ini(r); if (c == 0.0) { falla(r, "El tercer valor no puede ser cero."); return; }
    prod = a * b; r->x = prod / c; r->ok = 1;
    con_nom(A, a, dec, na); con_nom(B, b, dec, nb); con_nom(C, c, dec, na); con_nom(X, r->x, dec, nb);
    paso(r, "Sabemos que con %s se necesitan %s.", A, B, "", "", "");
    rg_fmt(prod, dec, 0, P);
    paso(r, "Si uno sube, el otro baja: el total es siempre igual. %s", P, "", "", "", "");
    sprintf(r->pasos[r->npasos - 1], "Si uno sube, el otro baja: el total es siempre igual (producto = %s).", P);
    rg_fmt(c, dec, 0, Q);
    paso(r, "Con %s ese total se reparte: %s / %s = %s.", C, P, Q, (rg_fmt(r->x, dec, 0, A), A), "");
    paso(r, "Respuesta: con %s se necesitan %s.", C, X, "", "", "");
}
void rg_compuesta(double b, int n, const double *a, const double *c, const int *inv, int dec, RgRes *r) {
    int i; double x = b, f; char T[80], U[80], V[80];
    ini(r); if (n < 1 || n > RG_MAX_FILAS) { falla(r, "Cantidad de datos no valida."); return; }
    for (i = 0; i < n; i++) if (a[i] == 0.0 || c[i] == 0.0) { falla(r, "Los valores no pueden ser cero."); return; }
    rg_fmt(b, dec, 0, T); paso(r, "Partimos del dato que ya conoces: %s.", T, "", "", "", "");
    for (i = 0; i < n; i++) {
        f = inv[i] ? a[i] / c[i] : c[i] / a[i]; x *= f;
        rg_fmt(a[i], dec, 0, T); rg_fmt(c[i], dec, 0, U); rg_fmt(f, dec, 0, V);
        if (r->npasos < RG_MAX_PASOS) sprintf(r->pasos[r->npasos++], "Cosa %d: pasa de %s a %s. %s: multiplicamos por %s.", i + 1, T, U,
            inv[i] ? "Si sube, el resultado baja" : "Si sube, el resultado sube", V);
    }
    rg_fmt(x, dec, 0, T); paso(r, "Respuesta: %s.", T, "", "", "", "");
    r->x = x; r->ok = 1;
}

/* ---------- porcentajes ---------- */
void rg_pct_de(double p, double n, int dec, RgRes *r) {
    char P[48], N[48], U[48], X[48]; ini(r); r->x = n * p / 100.0; r->ok = 1;
    rg_fmt(p, dec, 0, P); rg_fmt(n, dec, 0, N); rg_fmt(n / 100.0, dec, 0, U); rg_fmt(r->x, dec, 0, X);
    paso(r, "El 100 %% es todo el numero: %s.", N, "", "", "", "");
    paso(r, "El 1 %% es la centesima parte: %s.", U, "", "", "", "");
    paso(r, "Respuesta: el %s %% de %s es %s.", P, N, X, "", "");
}
void rg_pct_que(double a, double b, int dec, RgRes *r) {
    char A[48], B[48], X[48]; ini(r); if (b == 0.0) { falla(r, "El total no puede ser cero."); return; }
    r->x = a * 100.0 / b; r->ok = 1; rg_fmt(a, dec, 0, A); rg_fmt(b, dec, 0, B); rg_fmt(r->x, dec, 0, X);
    paso(r, "Comparamos la parte con el total y lo multiplicamos por 100.", "", "", "", "", "");
    paso(r, "Respuesta: %s es el %s %% de %s.", A, X, B, "", "");
}
void rg_variacion(double n, double p, int signo, int dec, RgRes *r) {
    char N[48], P[48], M[48], X[48]; double m = n * p / 100.0; ini(r); r->x = n + signo * m; r->ok = 1;
    rg_fmt(n, dec, 0, N); rg_fmt(p, dec, 0, P); rg_fmt(m, dec, 0, M); rg_fmt(r->x, dec, 0, X);
    paso(r, "El %s %% de %s es %s.", P, N, M, "", "");
    paso(r, signo > 0 ? "Como sube, se suma: %s + %s = %s." : "Como baja, se resta: %s - %s = %s.", N, M, X, "", "");
    paso(r, "Respuesta: queda en %s.", X, "", "", "", "");
    sprintf(r->extra, "%s %s.", signo > 0 ? "Sube" : "Baja", M);
}
void rg_original(double f, double p, int signo, int dec, RgRes *r) {
    char F[48], P[48], K[48], X[48]; double k = 1.0 + signo * p / 100.0; ini(r);
    if (k == 0.0) { falla(r, "Con un descuento del 100 % no se puede recuperar el valor original."); return; }
    r->x = f / k; r->ok = 1; rg_fmt(f, dec, 0, F); rg_fmt(p, dec, 0, P); rg_fmt(k * 100.0, dec, 0, K); rg_fmt(r->x, dec, 0, X);
    paso(r, "El valor final es el %s %% del original.", K, "", "", "", "");
    paso(r, "Entonces %s es el %s %%: para hallar el 100 %% dividimos.", F, K, "", "", "");
    paso(r, "Respuesta: el valor original era %s.", X, "", "", "", ""); (void)P;
}
void rg_iva(double v, int hacia_bruto, int dec, RgRes *r) {
    char V[48], X[48], I[48]; ini(r); r->x = hacia_bruto ? v * 1.19 : v / 1.19; r->ok = 1;
    rg_fmt(v, dec, 0, V); rg_fmt(r->x, dec, 0, X); rg_fmt(hacia_bruto ? r->x - v : v - r->x, dec, 0, I);
    paso(r, "En Chile el IVA es 19 %%: el precio con IVA es el 119 %% del neto.", "", "", "", "", "");
    paso(r, hacia_bruto ? "Con IVA: %s x 1,19 = %s." : "Sin IVA: %s / 1,19 = %s.", V, X, "", "", "");
    paso(r, "El IVA es %s.", I, "", "", "", "");
    sprintf(r->extra, "De ese precio, %s es IVA.", I);
}
