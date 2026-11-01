package io.github.navarretenoir.regla3;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Regla de 3 — la interfaz (assets/ui/index.html, la misma de escritorio) en un WebView, sin internet y sin permisos.
 * Desarrollada por Javiera Navarrete.
 */
public class MainActivity extends Activity {
    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                    // recuerda ajustes y cálculos guardados (localStorage)
        s.setAllowFileAccess(false);                      // sólo file:///android_asset (siempre permitido)
        s.setAllowContentAccess(false);
        if (Build.VERSION.SDK_INT >= 16 && Build.VERSION.SDK_INT < 30) { s.setAllowFileAccessFromFileURLs(false); s.setAllowUniversalAccessFromFileURLs(false); }
        setContentView(web);
        web.setWebViewClient(new WebViewClient() {
            // la app no navega: cualquier enlace externo se ignora
            @Override public boolean shouldOverrideUrlLoading(WebView v, String url) { return !url.startsWith("file:///android_asset/"); }
        });
        web.loadUrl("file:///android_asset/ui/index.html");
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed();
    }
}
