/* Regla de 3 para Windows — configuración del anfitrión WebView2 (webhost.c). Desarrollada por Javiera Navarrete. */
#define APP_NOMBRE          L"Regla de 3"
#define APP_CLASE           L"ReglaDe3JavieraNavarrete"
#define APP_AGENTE          "Regla-de-3-Windows/1.0 (Javiera Navarrete)"
#define APP_HOST_VIRTUAL    L"regla.local"
#define APP_CARPETA_UI      L"ui"
#define APP_INICIO          L"https://regla.local/index.html"
#define APP_CARPETA_DATOS   L"ReglaDe3"
#define APP_PUENTE          0
#define APP_GUARDAR         0
#define APP_VENTANAS_DENTRO 0
#define APP_MENU_CONTEXTUAL FALSE
#define APP_ANCHO           1000
#define APP_ALTO            780
#define APP_COLOR_FONDO     RGB(0xF5, 0xF5, 0xF7)
#define APP_ACERCA          L"Regla de 3 1.0 para Windows\n\nCalcula lo que no sabes a partir de lo que sí sabes, paso a paso.\n" \
                            L"Desarrollada por Javiera Navarrete. Licencia GPL-3.0-or-later.\n\nFunciona sin internet."
static const WCHAR *APP_FUERA[] = {L"http://", L"https://github.com/", L"https://gitlab.com/", NULL};
static const WCHAR *APP_PERMITIDOS[] = {NULL};
