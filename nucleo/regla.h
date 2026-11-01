/* Regla de 3 — núcleo portable en C89 (DOS, Windows 3.x / 9x / NT / 2000–11, OS/2 y cualquier sistema con compilador de C).
 * Misma matemática que la interfaz web (ui/js/regla3.js): regla de tres directa, inversa, compuesta y porcentajes, con la
 * explicación paso a paso en palabras simples. Usa «double»: suficiente para cálculos de todos los días.
 * Desarrollada por Javiera Navarrete. Licencia GPL-3.0-or-later. */
#ifndef REGLA_H
#define REGLA_H

#define RG_MAX_PASOS 8
#define RG_LARGO 200
#define RG_MAX_FILAS 5

typedef struct {
    double x;                       /* la respuesta */
    int ok;                         /* 1 = se pudo calcular */
    char error[100];                /* mensaje si ok == 0 */
    int npasos;
    char pasos[RG_MAX_PASOS][RG_LARGO];
    char extra[RG_LARGO];           /* IVA, aumento o descuento, si corresponde */
} RgRes;

/* Lee un número a la chilena: «1.234,56», «12,5», «1234.5», «3/4», «-7». Devuelve 1 si es válido. */
int  rg_leer(const char *s, double *out);
/* Escribe x con «dec» decimales (redondeo mitad lejos de cero), miles con punto y decimales con coma. */
void rg_fmt(double x, int dec, int ceros, char *out);

/* a corresponde a b; ¿a cuánto corresponde c?   (nombres: etiquetas opcionales, pueden ser "") */
void rg_directa(double a, double b, double c, int dec, const char *na, const char *nb, RgRes *r);
void rg_inversa(double a, double b, double c, int dec, const char *na, const char *nb, RgRes *r);
/* compuesta: dato b y n magnitudes; a[i] = antes, c[i] = ahora, inv[i] = 1 si es inversa */
void rg_compuesta(double b, int n, const double *a, const double *c, const int *inv, int dec, RgRes *r);
void rg_pct_de(double p, double n, int dec, RgRes *r);
void rg_pct_que(double a, double b, int dec, RgRes *r);
void rg_variacion(double n, double p, int signo, int dec, RgRes *r);     /* signo +1 sube, -1 baja */
void rg_original(double f, double p, int signo, int dec, RgRes *r);
void rg_iva(double v, int hacia_bruto, int dec, RgRes *r);                /* IVA Chile 19 % */

#endif
