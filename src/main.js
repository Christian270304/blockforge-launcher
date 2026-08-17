const { invoke } = window.__TAURI__.core;
const { getCurrentWindow } = window.__TAURI__.window;

const appWindow = getCurrentWindow();

const titlebar = document.getElementById("titlebar");


// ==========================================
// ARRASTRAR VENTANA
// ==========================================

titlebar.addEventListener("mousedown", async (event) => {

    // Solo botón izquierdo del ratón
    if (event.button !== 0) return;

    // No arrastrar al pulsar los botones
    if (event.target.closest("#window-controls")) return;

    await appWindow.startDragging();
});


// ==========================================
// DOBLE CLICK → MAXIMIZAR / RESTAURAR
// ==========================================

titlebar.addEventListener("dblclick", async (event) => {

    if (event.target.closest("#window-controls")) return;

    await appWindow.toggleMaximize();
});


// ==========================================
// MINIMIZAR
// ==========================================

document
    .getElementById("minimize-btn")
    .addEventListener("click", async () => {

        await appWindow.minimize();

    });


// ==========================================
// MAXIMIZAR / RESTAURAR
// ==========================================

document
    .getElementById("maximize-btn")
    .addEventListener("click", async () => {

        await appWindow.toggleMaximize();

    });


// ==========================================
// CERRAR
// ==========================================

document
    .getElementById("close-btn")
    .addEventListener("click", async () => {

        await appWindow.close();

    });



    document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".view").forEach(x=>x.classList.remove("on"));b.classList.add("active");document.getElementById(b.dataset.v).classList.add("on")});play.onclick=()=>{bar.style.width="100%";pct.textContent="100%";status.textContent="Todo actualizado";play.textContent="▶　ABRIR MINECRAFT"}