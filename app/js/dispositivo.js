/* ARTEMIS · detección del dispositivo, su factor de forma y la orientación. Escribe atributos en <html> para que el CSS y
 * los módulos se adapten, y emite «artemis:dispositivo» al cambiar. © Black Cat SpA / Javiera Navarrete (privado). */
(function () {
  var R = document.documentElement, ultimo = "", forzar = (location.search.match(/[?&]ff=(movil|tableta|escritorio)/) || [])[1];
  function mq(q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } }
  function medir() {
    var w = window.innerWidth, h = window.innerHeight, v = window.visualViewport;
    if (v) { w = Math.round(v.width); h = Math.round(v.height); }
    var sw = (screen && screen.width) || w, sh = (screen && screen.height) || h, corto = Math.min(sw, sh);
    var tactil = mq("(pointer:coarse)") || (navigator.maxTouchPoints > 1 && !mq("(pointer:fine)"));
    var puntero = mq("(pointer:fine)") || mq("(hover:hover)");
    var ua = navigator.userAgent || "", android = /ARTEMIS-Android|Android/i.test(ua), windows = /Windows|ARTEMIS-Windows/i.test(ua);
    /* dispositivo (hardware): lado corto de la pantalla en px CSS + tipo de entrada */
    var disp;
    if (forzar) disp = forzar;
    else if (tactil && corto < 600) disp = "movil";
    else if (tactil && corto <= 1100 && !windows) disp = "tableta";
    else if (tactil && !puntero) disp = "tableta";
    else disp = "escritorio";
    /* ventana (espacio disponible): clase de tamaño tipo Material / iPadOS */
    var vent = w < 600 ? "compacta" : w < 1024 ? "media" : "amplia";
    var orient = w >= h ? "horizontal" : "vertical";
    var altura = h < 480 ? "baja" : h < 720 ? "media" : "alta";
    var pliegue = mq("(horizontal-viewport-segments: 2)") || mq("(vertical-viewport-segments: 2)") ? "si" : "no";
    var dens = (window.devicePixelRatio || 1) >= 2 ? "alta" : "normal";
    return { dispositivo: disp, ventana: vent, orientacion: orient, altura: altura, entrada: tactil ? "tactil" : "puntero", pliegue: pliegue,
             plataforma: android ? "android" : windows ? "windows" : "otra", densidad: dens, ancho: w, alto: h };
  }
  function aplicar() {
    var d = medir(), firma = [d.dispositivo, d.ventana, d.orientacion, d.altura, d.entrada, d.pliegue].join("|");
    R.setAttribute("data-dispositivo", d.dispositivo); R.setAttribute("data-ventana", d.ventana); R.setAttribute("data-orientacion", d.orientacion);
    R.setAttribute("data-altura", d.altura); R.setAttribute("data-entrada", d.entrada); R.setAttribute("data-pliegue", d.pliegue);
    R.setAttribute("data-plataforma", d.plataforma); R.style.setProperty("--vh", d.alto + "px");
    window.ARTEMIS = window.ARTEMIS || {}; window.ARTEMIS.dispositivo = d;
    if (firma !== ultimo) { ultimo = firma; try { document.dispatchEvent(new CustomEvent("artemis:dispositivo", { detail: d })); } catch (e) {} }
  }
  var pend = 0;
  function pronto() { if (pend) return; pend = requestAnimationFrame(function () { pend = 0; aplicar(); }); }
  window.addEventListener("resize", pronto); window.addEventListener("orientationchange", pronto);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", pronto);
  ["(pointer:coarse)", "(hover:hover)", "(orientation:portrait)"].forEach(function (q) { try { var m = window.matchMedia(q); (m.addEventListener ? m.addEventListener("change", pronto) : m.addListener(pronto)); } catch (e) {} });
  aplicar();
})();
