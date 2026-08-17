const { invoke } = window.__TAURI__.core;
const { getCurrentWindow } = window.__TAURI__.window;


// =========================================================
// TAURI
// =========================================================

const appWindow = getCurrentWindow();


// =========================================================
// ELEMENTOS
// =========================================================

const titlebar = document.getElementById("titlebar");

const ramSlider = document.getElementById("ram-slider");
const ramValue = document.getElementById("ram-value");
const totalRam = document.getElementById("total-ram");

const closeOnLaunch = document.getElementById("close-on-launch");
const autoUpdate = document.getElementById("auto-update");

const settingsButton = document.getElementById("settings-btn");


// =========================================================
// VENTANA
// =========================================================

// Arrastrar ventana
titlebar.addEventListener("mousedown", async (event) => {

    if (event.button !== 0) return;

    if (event.target.closest("#window-controls")) return;

    try {
        await appWindow.startDragging();
    } catch (error) {
        console.error("Error arrastrando ventana:", error);
    }

});


// Doble click → maximizar / restaurar
titlebar.addEventListener("dblclick", async (event) => {

    if (event.target.closest("#window-controls")) return;

    try {
        await appWindow.toggleMaximize();
    } catch (error) {
        console.error("Error maximizando ventana:", error);
    }

});


// Minimizar
document
    .getElementById("minimize-btn")
    .addEventListener("click", async () => {

        try {
            await appWindow.minimize();
        } catch (error) {
            console.error("Error minimizando ventana:", error);
        }

    });


// Maximizar / restaurar
document
    .getElementById("maximize-btn")
    .addEventListener("click", async () => {

        try {
            await appWindow.toggleMaximize();
        } catch (error) {
            console.error("Error maximizando ventana:", error);
        }

    });


// Cerrar
document
    .getElementById("close-btn")
    .addEventListener("click", async () => {

        try {
            await appWindow.close();
        } catch (error) {
            console.error("Error cerrando ventana:", error);
        }

    });


// =========================================================
// NAVEGACIÓN
// =========================================================

document.querySelectorAll(".nav").forEach((button) => {

    button.addEventListener("click", () => {

        // Quitamos selección actual
        document.querySelectorAll(".nav").forEach((item) => {
            item.classList.remove("active");
        });

        // Ocultamos todas las vistas
        document.querySelectorAll(".view").forEach((view) => {
            view.classList.remove("on");
        });

        // Activamos botón
        button.classList.add("active");

        // Mostramos vista
        const viewId = button.dataset.v;

        document
            .getElementById(viewId)
            .classList.add("on");

    });

});


// =========================================================
// AJUSTES
// =========================================================

settingsButton.addEventListener("click", () => {

    // Quitamos selección del sidebar
    document.querySelectorAll(".nav").forEach((item) => {
        item.classList.remove("active");
    });

    // Ocultamos todas las vistas
    document.querySelectorAll(".view").forEach((view) => {
        view.classList.remove("on");
    });

    // Mostramos ajustes
    document
        .getElementById("settings")
        .classList.add("on");

});


// =========================================================
// RAM DEL SISTEMA
// =========================================================

async function configureRamSlider() {

    try {

        const totalBytes = await invoke("get_total_memory");

        const totalGB = Math.floor(
            totalBytes / 1024 / 1024 / 1024
        );

        console.log(`RAM instalada: ${totalGB} GB`);

        /*
         * Límite recomendado.
         *
         * No permitimos que Minecraft utilice toda
         * la memoria del ordenador.
         */

        let maxRam;

        if (totalGB <= 8) {

            maxRam = 4;

        } else if (totalGB <= 16) {

            maxRam = 10;

        } else if (totalGB <= 32) {

            maxRam = 16;

        } else {

            maxRam = 24;

        }


        // Nunca superar la RAM física disponible
        maxRam = Math.min(
            maxRam,
            Math.max(4, totalGB - 4)
        );


        ramSlider.min = 4;
        ramSlider.max = maxRam;
        ramSlider.step = 1;


        // Mostrar RAM instalada
        if (totalRam) {

            totalRam.textContent =
                `RAM instalada: ${totalGB} GB`;

        }

        return {
            totalGB,
            maxRam
        };

    } catch (error) {

        console.error(
            "Error obteniendo la RAM del sistema:",
            error
        );

        // Valores de seguridad
        ramSlider.min = 4;
        ramSlider.max = 8;

        return {
            totalGB: null,
            maxRam: 8
        };

    }

}


// =========================================================
// CARGAR CONFIGURACIÓN
// =========================================================

async function loadConfig(maxRam) {

    try {

        const config = await invoke("load_config");

        console.log(
            "Configuración cargada:",
            config
        );


        // -------------------------
        // RAM
        // -------------------------

        let savedRam = Number(config.ram);

        /*
         * Si config.json tiene más RAM que la permitida
         * actualmente, limitamos el valor.
         */

        savedRam = Math.max(
            Number(ramSlider.min),
            Math.min(savedRam, maxRam)
        );

        ramSlider.value = savedRam;

        ramValue.textContent =
            `${savedRam} GB`;


        // -------------------------
        // Launcher
        // -------------------------

        closeOnLaunch.checked =
            config.closeOnLaunch;

        autoUpdate.checked =
            config.autoUpdate;


    } catch (error) {

        console.error(
            "Error cargando configuración:",
            error
        );

        /*
         * Si algo falla utilizamos valores
         * predeterminados.
         */

        const defaultRam = Math.min(8, maxRam);

        ramSlider.value = defaultRam;

        ramValue.textContent =
            `${defaultRam} GB`;

        closeOnLaunch.checked = false;
        autoUpdate.checked = true;

    }

}


// =========================================================
// GUARDAR CONFIGURACIÓN
// =========================================================

async function saveConfig() {

    const config = {

        ram: Number(ramSlider.value),

        closeOnLaunch:
            closeOnLaunch.checked,

        autoUpdate:
            autoUpdate.checked

    };


    try {

        await invoke("save_config", {
            config
        });

        console.log(
            "Configuración guardada:",
            config
        );


    } catch (error) {

        console.error(
            "Error guardando configuración:",
            error
        );

    }

}


// =========================================================
// EVENTOS DE CONFIGURACIÓN
// =========================================================

// Actualizar texto mientras movemos slider
ramSlider.addEventListener("input", () => {

    ramValue.textContent =
        `${ramSlider.value} GB`;

});


// Guardar RAM cuando terminamos de moverlo
ramSlider.addEventListener(
    "change",
    saveConfig
);


// Guardar switches
closeOnLaunch.addEventListener(
    "change",
    saveConfig
);

autoUpdate.addEventListener(
    "change",
    saveConfig
);


// =========================================================
// INICIALIZACIÓN
// =========================================================

async function init() {

    /*
     * IMPORTANTE:
     *
     * Primero obtenemos los límites de RAM.
     * Después cargamos config.json.
     */

    const ramInfo =
        await configureRamSlider();

    await loadConfig(
        ramInfo.maxRam
    );

    console.log("BlockForge inicializado");

}


init();