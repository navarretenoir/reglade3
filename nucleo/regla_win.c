/* Regla de 3 — versión gráfica clásica: un solo código para Windows 3.x (16 bits) y Windows NT 3.5/3.51/4.0, 9x/Me, 2000, XP,
 * Vista, 7 y 8 (32 bits). Compilador: Open Watcom. Sin dependencias; usa sólo controles estándar (EDIT, STATIC, COMBOBOX, BUTTON).
 * Desarrollada por Javiera Navarrete. Licencia GPL-3.0-or-later. */
#include <windows.h>
#include <stdio.h>
#include <string.h>
#include "regla.h"

#ifdef __WINDOWS__          /* Win16 */
#define CMD_ID(w, l) ((int)(w))
#define CMD_NOT(w, l) ((int)HIWORD(l))
#else
#define CMD_ID(w, l) ((int)LOWORD(w))
#define CMD_NOT(w, l) ((int)HIWORD(w))
#endif

enum { ID_TIPO = 101, ID_E1, ID_E2, ID_E3, ID_L1, ID_L2, ID_L3, ID_CALC, ID_RES, ID_PASOS };
static HWND hw;
static HINSTANCE g_inst;
static const char *TIPOS[] = { "Mas y mas: si una cosa sube, la otra tambien", "Mas y menos: si una cosa sube, la otra baja", "Calcular un % de un numero",
    "Que porcentaje es una parte del total", "Subir un valor un cierto %", "Bajar un valor un cierto %", "Volver al precio original", "IVA 19 %: de precio sin IVA a con IVA", "IVA 19 %: de precio con IVA a sin IVA" };
#define NTIPOS 9

static HWND crear(const char *clase, const char *txt, DWORD est, int x, int y, int w, int h, int id) {
    return CreateWindow(clase, txt, WS_CHILD | WS_VISIBLE | est, x, y, w, h, hw, (HMENU)id, g_inst, NULL);
}
static void etiquetas(int t) {
    const char *a = "", *b = "", *c = ""; int n = 3;
    switch (t) {
    case 0: case 1: a = "Lo que ya se: primera cosa (ej.: 3 kilos)"; b = "Lo que ya se: segunda cosa (ej.: 2400 pesos)"; c = "Quiero calcular para esta cantidad de la primera cosa"; break;
    case 2: a = "El porcentaje (%)"; b = "De este numero"; n = 2; break;
    case 3: a = "La parte"; b = "Del total"; n = 2; break;
    case 4: a = "Valor de partida"; b = "Cuanto sube (%)"; n = 2; break;
    case 5: a = "Valor de partida"; b = "Cuanto baja (%)"; n = 2; break;
    case 6: a = "Valor final (lo que pagaste)"; b = "Porcentaje de descuento"; n = 2; break;
    default: a = "Precio"; n = 1; break;
    }
    SetDlgItemText(hw, ID_L1, a); SetDlgItemText(hw, ID_L2, b); SetDlgItemText(hw, ID_L3, c);
    ShowWindow(GetDlgItem(hw, ID_E2), n >= 2 ? SW_SHOW : SW_HIDE); ShowWindow(GetDlgItem(hw, ID_L2), n >= 2 ? SW_SHOW : SW_HIDE);
    ShowWindow(GetDlgItem(hw, ID_E3), n >= 3 ? SW_SHOW : SW_HIDE); ShowWindow(GetDlgItem(hw, ID_L3), n >= 3 ? SW_SHOW : SW_HIDE);
}
static int leer(int id, double *v) { char b[80]; GetDlgItemText(hw, id, b, sizeof b); return rg_leer(b, v); }

static void calcular(void) {
    int t = (int)SendDlgItemMessage(hw, ID_TIPO, CB_GETCURSEL, 0, 0), i; double a = 0, b = 0, c = 0; RgRes r; static char txt[2400], tmp[64];
    if (t < 0) t = 0;
    SetDlgItemText(hw, ID_PASOS, ""); SetDlgItemText(hw, ID_RES, "");
    if (!leer(ID_E1, &a)) { SetDlgItemText(hw, ID_RES, "Escribe solo numeros (decimales con coma, ej.: 2,5)."); return; }
    if (t != 7 && t != 8 && !leer(ID_E2, &b)) { SetDlgItemText(hw, ID_RES, "Escribe solo numeros (decimales con coma, ej.: 2,5)."); return; }
    if (t <= 1 && !leer(ID_E3, &c)) { SetDlgItemText(hw, ID_RES, "Escribe solo numeros (decimales con coma, ej.: 2,5)."); return; }
    switch (t) {
    case 0: rg_directa(a, b, c, 2, "", "", &r); break;
    case 1: rg_inversa(a, b, c, 2, "", "", &r); break;
    case 2: rg_pct_de(a, b, 2, &r); break;
    case 3: rg_pct_que(a, b, 2, &r); break;
    case 4: rg_variacion(a, b, 1, 2, &r); break;
    case 5: rg_variacion(a, b, -1, 2, &r); break;
    case 6: rg_original(a, b, -1, 2, &r); break;
    case 7: rg_iva(a, 1, 2, &r); break;
    default: rg_iva(a, 0, 2, &r); break;
    }
    if (!r.ok) { SetDlgItemText(hw, ID_RES, r.error); return; }
    rg_fmt(r.x, 2, 0, tmp); sprintf(txt, "La respuesta es: %s", tmp); SetDlgItemText(hw, ID_RES, txt);
    txt[0] = 0; if (r.extra[0]) { strcat(txt, r.extra); strcat(txt, "\r\n\r\n"); }
    strcat(txt, "Como se calculo:\r\n");
    for (i = 0; i < r.npasos; i++) { sprintf(tmp, "%d. ", i + 1); strcat(txt, tmp); strcat(txt, r.pasos[i]); strcat(txt, "\r\n"); }
    SetDlgItemText(hw, ID_PASOS, txt);
}

static void crear_todo(void) {
    int i;
    crear("STATIC", "Que quieres calcular?", 0, 12, 10, 400, 16, -1);
    crear("COMBOBOX", "", CBS_DROPDOWNLIST | WS_VSCROLL | WS_TABSTOP, 12, 28, 480, 200, ID_TIPO);
    for (i = 0; i < NTIPOS; i++) SendDlgItemMessage(hw, ID_TIPO, CB_ADDSTRING, 0, (LPARAM)(LPSTR)TIPOS[i]);
    SendDlgItemMessage(hw, ID_TIPO, CB_SETCURSEL, 0, 0);
    crear("STATIC", "", 0, 12, 62, 480, 16, ID_L1);  crear("EDIT", "", WS_BORDER | ES_AUTOHSCROLL | WS_TABSTOP, 12, 80, 200, 22, ID_E1);
    crear("STATIC", "", 0, 12, 108, 480, 16, ID_L2); crear("EDIT", "", WS_BORDER | ES_AUTOHSCROLL | WS_TABSTOP, 12, 126, 200, 22, ID_E2);
    crear("STATIC", "", 0, 12, 154, 480, 16, ID_L3); crear("EDIT", "", WS_BORDER | ES_AUTOHSCROLL | WS_TABSTOP, 12, 172, 200, 22, ID_E3);
    crear("BUTTON", "Calcular", BS_DEFPUSHBUTTON | WS_TABSTOP, 230, 126, 120, 30, ID_CALC);
    crear("STATIC", "", SS_LEFT, 12, 208, 480, 20, ID_RES);
    crear("EDIT", "", WS_BORDER | WS_VSCROLL | ES_MULTILINE | ES_READONLY | ES_AUTOVSCROLL, 12, 232, 480, 150, ID_PASOS);
    crear("STATIC", "Regla de 3 - desarrollada por Javiera Navarrete. Funciona sin internet.", 0, 12, 392, 480, 16, -1);
    etiquetas(0);
}

LRESULT CALLBACK WndProc(HWND h, UINT m, WPARAM w, LPARAM l) {
    switch (m) {
    case WM_CREATE: hw = h; crear_todo(); return 0;
    case WM_COMMAND:
        switch (CMD_ID(w, l)) {
        case ID_CALC: calcular(); break;
        case ID_TIPO: if (CMD_NOT(w, l) == CBN_SELCHANGE) { etiquetas((int)SendDlgItemMessage(hw, ID_TIPO, CB_GETCURSEL, 0, 0)); SetDlgItemText(hw, ID_RES, ""); SetDlgItemText(hw, ID_PASOS, ""); } break;
        }
        return 0;
    case WM_DESTROY: PostQuitMessage(0); return 0;
    }
    return DefWindowProc(h, m, w, l);
}

int PASCAL WinMain(HINSTANCE hi, HINSTANCE hp, LPSTR cmd, int show) {
    WNDCLASS wc; MSG msg;
    (void)cmd; g_inst = hi;
    if (!hp) {
        memset(&wc, 0, sizeof wc);
        wc.lpfnWndProc = WndProc; wc.hInstance = hi; wc.hCursor = LoadCursor(NULL, IDC_ARROW);
        wc.hbrBackground = (HBRUSH)(COLOR_BTNFACE + 1); wc.lpszClassName = "ReglaDe3Win"; wc.hIcon = LoadIcon(NULL, IDI_APPLICATION);
        if (!RegisterClass(&wc)) return 0;
    }
    hw = CreateWindow("ReglaDe3Win", "Regla de 3", WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
                      CW_USEDEFAULT, CW_USEDEFAULT, 520, 440, NULL, NULL, hi, NULL);
    ShowWindow(hw, show); UpdateWindow(hw);
    while (GetMessage(&msg, NULL, 0, 0)) { if (!IsDialogMessage(hw, &msg)) { TranslateMessage(&msg); DispatchMessage(&msg); } }
    return (int)msg.wParam;
}
