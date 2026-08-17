const { invoke } = window.__TAURI__.core;

let greetInputEl;
let greetMsgEl;



window.addEventListener("DOMContentLoaded", () => {
  const navigationButtons =
            document.querySelectorAll(".nav");

        const views =
            document.querySelectorAll(".view");


        navigationButtons.forEach((button) => {

            button.addEventListener("click", () => {

                navigationButtons.forEach((item) => {
                    item.classList.remove("active");
                });

                views.forEach((view) => {
                    view.classList.remove("on");
                });


                button.classList.add("active");


                const viewId = button.dataset.v;

                document
                    .getElementById(viewId)
                    .classList.add("on");

            });

        });


        const playButton =
            document.getElementById("play");

        const progressBar =
            document.getElementById("bar");

        const percentage =
            document.getElementById("pct");

        const status =
            document.getElementById("status");


        playButton.addEventListener("click", () => {

            progressBar.style.width = "100%";

            percentage.textContent = "100%";

            status.textContent =
                "Todo actualizado";

            playButton.textContent =
                "▶ ABRIR MINECRAFT";

        });

});


