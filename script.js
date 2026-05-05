models.forEach(car => {
  const modelRow = document.createElement("div");
  modelRow.className = "model-row";

  const photoSrc = (car.photo && car.photo.trim() !== "")
    ? car.photo
    : "https://via.placeholder.com/400x300?text=No+Photo";

  // ------- LEFT : photo seulement -------
  const leftBlock = document.createElement("div");
  leftBlock.className = "model-left";

  const imgCar = document.createElement("img");
  imgCar.className = "model-photo";
  imgCar.src = photoSrc;
  imgCar.alt = `${car.marque || ""} ${car.modele || ""}`;
  imgCar.onerror = () => {
    imgCar.src = "https://via.placeholder.com/400x300?text=No+Photo";
  };

  leftBlock.appendChild(imgCar);

  // ------- RIGHT : modèle + meta -------
  const rightBlock = document.createElement("div");
  rightBlock.className = "model-right";

  // Prix par défaut = 0 si null/undefined/""
  const prix = (car.prix === null || car.prix === undefined || car.prix === "")
    ? 0
    : car.prix;

  rightBlock.innerHTML = `
    <div class="model-title">${car.modele || ""}</div>

    <div class="meta-line">
      <span class="meta-label">Années :</span> ${car.annees || ""}
    </div>

    <div class="meta-line">
      <span class="meta-label">Catégorie :</span> ${car.categorie || ""}
    </div>

    <div class="meta-line">
      <span class="meta-label">Couleur :</span> ${car.couleur || ""}
    </div>

    <div class="meta-line">
      <span class="meta-label">Prix :</span> ${prix} €
    </div>

    ${car.notes ? `<div class="notes">${car.notes}</div>` : ""}

    ${car.fabricant ? `<div class="fabricant">${car.fabricant}</div>` : ""}
  `;

  modelRow.appendChild(leftBlock);
  modelRow.appendChild(rightBlock);
  right.appendChild(modelRow);
});
