/* Regla de 3 — ventana nativa para Linux (GTK 4 + WebKitGTK 6) de la interfaz ui/index.html.
 * Todo ocurre en el dispositivo: sin internet, sin cuentas. Desarrollada por Javiera Navarrete. Licencia GPL-3.0-or-later. */
#include <gtk/gtk.h>
#include <webkit/webkit.h>

#ifndef UI_DIR
#define UI_DIR "/usr/share/regla-de-3/ui"
#endif

/* Página mínima de error: evita una ventana en blanco si falta la interfaz o el motor web se cae. */
static void mostrar_error (WebKitWebView *v, const char *titulo, const char *detalle) {
    gchar *t = g_markup_escape_text (titulo, -1), *d = g_markup_escape_text (detalle, -1);
    gchar *html = g_strdup_printf ("<!doctype html><meta charset=utf-8><body style=\"font:16px system-ui;margin:12vh auto;max-width:34em;padding:0 1em\"><h1>%s</h1><p>%s</p></body>", t, d);
    webkit_web_view_load_html (v, html, "about:blank");
    g_free (html); g_free (d); g_free (t);
}

static void cargar_interfaz (WebKitWebView *v, const char *dir, const char *app) {
    gchar *rel = g_build_filename (dir, "index.html", NULL);
    gchar *ruta = g_canonicalize_filename (rel, NULL);       /* la variable de entorno puede ser relativa: la URI exige ruta absoluta */
    g_free (rel);
    gchar *uri = g_file_test (ruta, G_FILE_TEST_IS_REGULAR) ? g_filename_to_uri (ruta, NULL, NULL) : NULL;
    if (uri) {
        webkit_web_view_load_uri (v, uri);
        g_free (uri);
    } else {
        gchar *t = g_strdup_printf ("%s no pudo iniciar", app);
        gchar *m = g_strdup_printf ("No se encontró la interfaz en «%s». Reinstala la aplicación.", dir);
        mostrar_error (v, t, m);
        g_free (m); g_free (t);
    }
    g_free (ruta);
}

/* Si el proceso web muere (memoria, driver), se recarga en vez de dejar la ventana congelada. */
static void on_proceso_caido (WebKitWebView *v, WebKitWebProcessTerminationReason r, gpointer u) {
    (void) r; (void) u;
    webkit_web_view_reload (v);
}

static gboolean on_decidir (WebKitWebView *v, WebKitPolicyDecision *d, WebKitPolicyDecisionType t, gpointer u) {
    (void) v; (void) u;
    if (t != WEBKIT_POLICY_DECISION_TYPE_NAVIGATION_ACTION && t != WEBKIT_POLICY_DECISION_TYPE_NEW_WINDOW_ACTION) return FALSE;
    WebKitNavigationAction *a = webkit_navigation_policy_decision_get_navigation_action (WEBKIT_NAVIGATION_POLICY_DECISION (d));
    const char *uri = webkit_uri_request_get_uri (webkit_navigation_action_get_request (a));
    if (uri && !g_str_has_prefix (uri, "file://") && !g_str_has_prefix (uri, "about:")) {            /* la app no navega a internet: cualquier enlace externo se ignora */
        webkit_policy_decision_ignore (d);
        return TRUE;
    }
    return FALSE;
}

static void activar (GtkApplication *app, gpointer u) {
    (void) u;
    GtkWidget *win = gtk_application_window_new (app);
    gtk_window_set_title (GTK_WINDOW (win), "Regla de 3");
    gtk_window_set_default_size (GTK_WINDOW (win), 1040, 760);
    gtk_window_set_icon_name (GTK_WINDOW (win), "io.github.navarretenoir.ReglaDe3");

    WebKitWebView *v = WEBKIT_WEB_VIEW (g_object_new (WEBKIT_TYPE_WEB_VIEW, NULL));
    WebKitSettings *s = webkit_web_view_get_settings (v);
    webkit_settings_set_allow_file_access_from_file_urls (s, TRUE);
    webkit_settings_set_enable_developer_extras (s, g_getenv ("REGLA_DEV") != NULL);
    webkit_settings_set_hardware_acceleration_policy (s, WEBKIT_HARDWARE_ACCELERATION_POLICY_NEVER);
    g_signal_connect (v, "decide-policy", G_CALLBACK (on_decidir), NULL);

    const char *dir = g_getenv ("REGLA_UI") ? g_getenv ("REGLA_UI") : UI_DIR;
    g_signal_connect (v, "web-process-terminated", G_CALLBACK (on_proceso_caido), NULL);
    cargar_interfaz (v, dir, "Regla de 3");
    gtk_window_set_child (GTK_WINDOW (win), GTK_WIDGET (v));
    gtk_window_present (GTK_WINDOW (win));
}

int main (int argc, char **argv) {
    GtkApplication *app = gtk_application_new ("io.github.navarretenoir.ReglaDe3", G_APPLICATION_DEFAULT_FLAGS);
    g_signal_connect (app, "activate", G_CALLBACK (activar), NULL);
    int r = g_application_run (G_APPLICATION (app), argc, argv);
    g_object_unref (app);
    return r;
}
