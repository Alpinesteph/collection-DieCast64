fetch("collection.json")
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // évite les doublons si tu recharges

    data.forEach(car => {
      const div = document.createElement("div");
      div.className = "card";

      // photo : si vide -> placeholder
      const photo = (car.photo && car.photo.trim() !== "")
        ? car.photo
        : "https://via.placeholder.com/400x300?text=No+Photo";

      // prix : si null -> rien
      const prixTxt = (car.prix !== null && car.prix !== undefined && car.prix !== "")
        ? `${car.prix} €`
        : "";

      div.innerHTML = `
        <img class="car-photo" src="${photo}" alt="${(car.marque || "")} ${(car.modele || "")}">
        <div class="meta">
          <p><strong>${car.marque || ""} ${car.modele || ""}</strong></p>
          <p>${car.fabricant || ""}${car.annees ? " – " + car.annees : ""}</p>
          ${car.categorie ? `<p>Catégorie : ${car.categorie}</p>` : ""}
          ${car.couleur ? `<p>Couleur : ${car.couleur}</p>` : ""}
          ${prixTxt ? `<p>Prix : ${prixTxt}</p>` : ""}
          ${car.notes ? `<p class="notes">${car.notes}</p>` : ""}
        </div>
      `;

      gallery.appendChild(div);
    });
  })
  .catch(err => console.error("Erreur chargement collection.json:", err));
