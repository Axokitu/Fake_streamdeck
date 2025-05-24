document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("grid");

    // Fixer la hauteur de la grille à la hauteur de la fenêtre (pour éviter les problèmes CSS)
    function setGridHeight() {
        grid.style.height = window.innerHeight + "px";
    }

    setGridHeight();
    window.addEventListener("resize", setGridHeight);

    let currentPage = 1;

    // Charger le fichier JSON de config
    fetch('/config/interface_v1.json')
        .then(response => response.json())
        .then(data => {
            const { grid: gridConfig, elements, nb_page } = data;
            currentPage = nb_page || 1;

            // Définir la grille selon la config dynamique
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = `repeat(${gridConfig.cols}, 1fr)`;
            grid.style.gridTemplateRows = `repeat(${gridConfig.rows}, 1fr)`;

            // Ajouter les éléments de la page actuelle à la grille
            elements
                .filter(element => element.page === currentPage)
                .forEach(element => {
                    if (element.type === "button") {
                        const button = document.createElement("button");
                        button.textContent = element.label;

                        // Positionner le bouton dans la grille
                        button.style.gridColumn = `${element.col} / span ${element.colspan}`;
                        button.style.gridRow = `${element.row} / span ${element.rowspan}`;

                        // Événement clic : envoi POST à l’API et rechargement de la page
                        button.addEventListener("click", () => {
                            fetch('/api/command', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: element.action })
                            }).then(() => {
                                // Recharger toute la page après un délai de 500 ms
                                setTimeout(() => {
                                    location.reload();
                                }, 10);
                            });
                        });

                        grid.appendChild(button);
                    }
                });

            // Appliquer le fond d'écran si défini dans la config
            const page = currentPage.toString();
            const backgrounds = gridConfig.backgrounds || {};
            if (backgrounds[page]) {
                grid.style.backgroundImage = `url('/config/${backgrounds[page]}')`;
                grid.classList.add("background-image");
            } else {
                grid.style.backgroundImage = "";
                grid.classList.remove("background-image");
            }
        })
        .catch(err => console.error("Erreur lors du chargement de l'interface :", err));
});
