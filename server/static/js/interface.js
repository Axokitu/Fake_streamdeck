document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("grid");

    // Fixer la hauteur de la grille à la hauteur de la fenêtre (pour éviter les problèmes CSS)
    function setGridHeight() {
        grid.style.height = window.innerHeight + "px";
    }

    setGridHeight();
    window.addEventListener("resize", setGridHeight);

    // Charger le fichier JSON de config
    fetch('/config/interface_v1.json')
        .then(response => response.json())
        .then(data => {
            const { grid: gridConfig, elements } = data;

            // Définir la grille selon la config dynamique
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = `repeat(${gridConfig.cols}, 1fr)`;
            grid.style.gridTemplateRows = `repeat(${gridConfig.rows}, 1fr)`;

            // Ajouter les éléments à la grille
            elements.forEach(element => {
                if (element.type === "button") {
                    const button = document.createElement("button");
                    button.textContent = element.label;

                    // Positionner le bouton dans la grille
                    button.style.gridColumn = `${element.col} / span ${element.colspan}`;
                    button.style.gridRow = `${element.row} / span ${element.rowspan}`;

                    // Événement clic : envoi POST à l’API
                    button.addEventListener("click", () => {
                        fetch('/api/command', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: element.action })
                        });
                    });

                    grid.appendChild(button);
                }
            });
        })
        .catch(err => console.error("Erreur lors du chargement de l'interface :", err));
});
