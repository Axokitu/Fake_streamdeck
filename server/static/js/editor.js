document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("editor-grid");
    const addButton = document.getElementById("add-button");
    const colsInput = document.getElementById("cols-input");
    const rowsInput = document.getElementById("rows-input");

    const buttonLabelInput = document.getElementById("button-label");
    const buttonActionInput = document.getElementById("button-action");
    const buttonColspanInput = document.getElementById("button-colspan");
    const buttonRowspanInput = document.getElementById("button-rowspan");
    const deleteButton = document.getElementById("delete-button");

    // Stocker les éléments ajoutés
    const elements = [];

    // Compteur global pour les IDs uniques
    let buttonIdCounter = 1;

    // Fonction pour charger les données depuis interface_v1.json
    const loadData = async () => {
        try {
            const response = await fetch('/config/interface_v1.json');
            const data = await response.json();

            // Charger les dimensions de la grille
            colsInput.value = data.grid.cols;
            rowsInput.value = data.grid.rows;
            updateGridSize();

            // Charger les boutons
            data.elements.forEach(element => {
                const button = document.createElement("div");
                button.classList.add("editor-element");
                button.textContent = element.label;
                button.style.gridColumn = `${element.col} / span ${element.colspan}`;
                button.style.gridRow = `${element.row} / span ${element.rowspan}`;
                button.draggable = true;

                // Ajouter les événements au bouton
                attachButtonEvents(button, element);

                grid.appendChild(button);
                elements.push(element);
            });
        } catch (error) {
            console.error("Erreur lors du chargement des données :", error);
        }
    };

    // Fonction pour attacher les événements à un bouton
    const attachButtonEvents = (button, element) => {
        let isDragging = false;
        let clickTimeout;

        button.addEventListener("mousedown", (e) => {
            isDragging = true;
            const rect = grid.getBoundingClientRect();

            const onMouseMove = (moveEvent) => {
                if (!isDragging) return;

                const cols = parseInt(colsInput.value, 10);
                const rows = parseInt(rowsInput.value, 10);
                const x = moveEvent.clientX - rect.left;
                const y = moveEvent.clientY - rect.top;

                const col = Math.ceil((x / rect.width) * cols);
                const row = Math.ceil((y / rect.height) * rows);

                if (col >= 1 && row >= 1 && col <= cols && row <= rows) {
                    element.col = col;
                    element.row = row;

                    // Mettre à jour l'affichage du bouton
                    button.style.gridColumn = `${element.col} / span ${element.colspan}`;
                    button.style.gridRow = `${element.row} / span ${element.rowspan}`;
                }
            };

            const onMouseUp = () => {
                if (isDragging) {
                    isDragging = false;

                    // Exporter les données après le déplacement
                    exportDataToJson();

                    // Supprimer les événements
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                }
            };

            // Ajouter les événements de déplacement et de relâchement
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);

            // Empêcher l'événement `click` si un drag and drop est en cours
            clearTimeout(clickTimeout);
        });

        button.addEventListener("click", () => {
            // Si un drag and drop est en cours, ne pas exécuter l'événement `click`
            if (isDragging) return;

            // Afficher les propriétés du bouton
            buttonLabelInput.value = element.label;
            buttonActionInput.value = element.action;
            buttonColspanInput.value = element.colspan;
            buttonRowspanInput.value = element.rowspan;

            // Stocker l'élément actuellement sélectionné
            buttonLabelInput.dataset.currentButton = element.id;
        });

        // Empêcher le comportement par défaut du drag and drop HTML5
        button.addEventListener("dragstart", (e) => e.preventDefault());
    };
    
    // Fonction pour mettre à jour la taille de la grille
    const updateGridSize = () => {
        const cols = parseInt(colsInput.value, 10);
        const rows = parseInt(rowsInput.value, 10);

        // Mettre à jour les dimensions de la grille
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        // Vérifier si les boutons sont toujours dans les limites de la grille
        elements.forEach(element => {
            if (element.col > cols) {
                element.col = cols; // Ajuster la colonne si elle dépasse
            }
            if (element.row > rows) {
                element.row = rows; // Ajuster la ligne si elle dépasse
            }

            // Mettre à jour l'affichage du bouton
            const button = Array.from(grid.children).find(el => el.textContent === element.label);
            if (button) {
                button.style.gridColumn = `${element.col} / span ${element.colspan}`;
                button.style.gridRow = `${element.row} / span ${element.rowspan}`;
            }
        });
    };

    colsInput.addEventListener("input", updateGridSize);
    rowsInput.addEventListener("input", updateGridSize);

    // Charger les données au démarrage
    await loadData();

    // Fonction pour exporter les données dans interface_v1.json
    const exportDataToJson = async () => {
        const exportData = {
            grid: {
                cols: parseInt(colsInput.value, 10),
                rows: parseInt(rowsInput.value, 10)
            },
            elements: elements.map(element => ({
                type: "button",
                id: element.id,
                label: element.label,
                action: element.action,
                col: element.col,
                row: element.row,
                colspan: element.colspan,
                rowspan: element.rowspan
            }))
        };

        try {
            const response = await fetch('/config/interface_v1.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(exportData)
            });

            if (response.ok) {
                console.log("Données exportées avec succès !");
            } else {
                console.error("Erreur lors de l'exportation :", response.statusText);
            }
        } catch (error) {
            console.error("Erreur lors de l'exportation :", error);
        }
    };

    // Mettre à jour automatiquement les propriétés des boutons
    buttonLabelInput.addEventListener("input", async () => {
        const elementId = buttonLabelInput.dataset.currentButton;
        const element = elements.find(el => el.id === elementId);
        if (element) {
            const oldLabel = element.label; // Sauvegarder l'ancien label
            element.label = buttonLabelInput.value;

            // Mettre à jour l'affichage du bouton
            const button = Array.from(grid.children).find(el => el.textContent === oldLabel);
            if (button) {
                button.textContent = element.label;
            }

            // Mettre à jour le dataset pour refléter le nouveau label
            buttonLabelInput.dataset.currentButton = element.id;

            // Exporter les données
            await exportDataToJson();
        }
    });

    buttonActionInput.addEventListener("input", async () => {
        const elementId = buttonLabelInput.dataset.currentButton;
        const element = elements.find(el => el.id === elementId);
        if (element) {
            element.action = buttonActionInput.value;

            // Exporter les données
            await exportDataToJson();
        }
    });

    buttonColspanInput.addEventListener("input", async () => {
        const elementId = buttonLabelInput.dataset.currentButton;
        const element = elements.find(el => el.id === elementId);
        if (element) {
            element.colspan = parseInt(buttonColspanInput.value, 10);

            // Mettre à jour l'affichage du bouton
            const button = Array.from(grid.children).find(el => el.textContent === element.label);
            if (button) {
                button.style.gridColumn = `${element.col} / span ${element.colspan}`;
            }

            // Exporter les données
            await exportDataToJson();
        }
    });

    buttonRowspanInput.addEventListener("input", () => {
        const elementId = buttonLabelInput.dataset.currentButton;
        const element = elements.find(el => el.id === elementId);
        if (element) {
            element.rowspan = parseInt(buttonRowspanInput.value, 10);

            // Mettre à jour l'affichage du bouton
            const button = Array.from(grid.children).find(el => el.textContent === element.label);
            if (button) {
                button.style.gridRow = `${element.row} / span ${element.rowspan}`;
            }
        }
    });

    // Ajouter un bouton à la grille
    addButton.addEventListener("click", () => {
        const id = generateUniqueId(); // Générer un ID unique
        const element = {
            id,
            type: "button",
            label: `Bouton ${id}`,
            action: "key_a",
            col: 1,
            row: 1,
            colspan: 10,
            rowspan: 10
        };

        const button = document.createElement("div");
        button.classList.add("editor-element");
        button.textContent = element.label;
        button.style.gridColumn = "1 / span 1";
        button.style.gridRow = "1 / span 1";

        attachButtonEvents(button, element);

        grid.appendChild(button);
        elements.push(element);

        // Exporter les données après ajout
        exportDataToJson();
    });

    deleteButton.addEventListener("click", () => {
        const elementId = buttonLabelInput.dataset.currentButton;
        const elementIndex = elements.findIndex(el => el.id === elementId);

        if (elementIndex !== -1) {
            // Supprimer l'élément de la liste
            const element = elements[elementIndex];
            elements.splice(elementIndex, 1);

            // Supprimer le bouton de la grille
            const button = Array.from(grid.children).find(el => el.textContent === element.label);
            if (button) {
                grid.removeChild(button);
            }

            // Réinitialiser les champs de propriétés
            buttonLabelInput.value = "";
            buttonActionInput.value = "";
            buttonColspanInput.value = "";
            buttonRowspanInput.value = "";

            // Exporter les données après suppression
            exportDataToJson();
        } else {
            console.error("Aucun bouton sélectionné pour suppression !");
        }
    });

    grid.addEventListener("drop", async (e) => {
        e.preventDefault();
        const rect = grid.getBoundingClientRect();
        const cols = parseInt(colsInput.value, 10);
        const rows = parseInt(rowsInput.value, 10);
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.ceil((x / rect.width) * cols);
        const row = Math.ceil((y / rect.height) * rows);

        const buttonId = e.dataTransfer.getData("text/plain");
        const element = elements.find(el => el.id === buttonId);

        if (element && col >= 1 && row >= 1 && col <= cols && row <= rows) {
            element.col = col;
            element.row = row;

            // Mettre à jour l'affichage du bouton
            const button = Array.from(grid.children).find(el => el.textContent === element.label);
            if (button) {
                button.style.gridColumn = `${element.col} / span ${element.colspan}`;
                button.style.gridRow = `${element.row} / span ${element.rowspan}`;
            }

            // Exporter les données
            await exportDataToJson();
        } else {
            console.error("Le bouton est en dehors des limites de la grille !");
        }
    });

    // Fonction pour générer un ID unique
    const generateUniqueId = () => {
        let id = 1; // Commencer à 1
        while (elements.some(el => el.id === id.toString())) {
            id++; // Incrémenter jusqu'à trouver un ID libre
        }
        return id.toString(); // Retourner l'ID libre sous forme de chaîne
    };

    // Initialiser la grille avec la taille par défaut
    updateGridSize();
});