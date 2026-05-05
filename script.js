fetch("collection.json")
  .then(r => r.json())
  .then(cars => {
    const gallery = document.getElementById("gallery");
    const searchInput = document.getElementById("search");

    
  if (!Array.isArray(cars)) {
    gallery.innerHTML = "<p>Erreur: collection.json doit être une liste JSON [ ... ]</p>";
    return;
}

// ✅ ici seulement (quand cars est bien une liste)
cars = cars.filter(car => !car._commentaire);


    const normalize = (str) => (str || "").toString().toLowerCase().trim();

    const initials = (brand) => {
      return normalize(brand)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join("");
    };

    const slugify = (brand) => {
      return normalize(brand)
        .replace(/é|è|ê/g, "e")
        .replace(/à|â/g, "a")
        .replace(/î|ï/g, "i")
        .replace(/ô/g, "o")
        .replace(/ù|û|ü/g, "u")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    const logoPath = (brand) => `logos/${slugify(brand)}.png`;

    function render(filteredCars) {
      gallery.innerHTML = "";

      // Group by marque
      const byBrand = new Map();
      filteredCars.forEach(car => {
        const brand = car.marque || "Sans marque";
        if (!byBrand.has(brand)) byBrand.set(brand, []);
        byBrand.get(brand).push(car);
      });

      const brands = Array.from(byBrand.keys()).sort((a, b) => a.localeCompare(b, "fr"));

      if (brands.length === 0) {
        gallery.innerHTML = "<p>Aucun résultat.</p>";
        return;
      }

      brands.forEach(brand => {
        const row = document.createElement("div");
        row.className = "brand-row";

        // ---------- Colonne gauche (marque) ----------
        const left = document.createElement("div");
        left.className = "brand-cell";

        const logoBox = document.createElement("div");
        logoBox.className = "brand-logo";

        const imgLogo = document.createElement("img");
        imgLogo.src = logoPath(brand);
        imgLogo.alt = `Logo ${brand}`;

        const badge = document.createElement("div");
        badge.className = "brand-badge";
        badge.textContent = initials(brand);

        imgLogo.onerror = () => {
          imgLogo.style.display = "none";
          badge.style.display = "flex";
        };

        logoBox.appendChild(imgLogo);
        logoBox.appendChild(badge);

        const brandName = document.createElement("div");
        brandName.className = "brand-name";
        brandName.textContent = brand;

        left.appendChild(logoBox);
        left.appendChild(brandName);

        // ---------- Colonne droite (liste des modèles) ----------
        const right = document.createElement("div");
        right.className = "models";

        // ICI on définit models (donc models existe uniquement ici)
        const models = byBrand.get(brand)
          .slice()
          .sort((a, b) => (a.modele || "").localeCompare((b.modele || ""), "fr"));

        models.forEach(car => {
          const modelRow = document.createElement("div");
          modelRow.className = "model-row";

          // Photo à gauche
          const photoSrc = (car.photo && car.photo.trim() !== "")
            ? car.photo
            : "https://via.placeholder.com/400x300?text=No+Photo";

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

          // Infos à droite
          const rightBlock = document.createElement("div");
          rightBlock.className = "model-right";

          // Prix par défaut 0 €
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

        row.appendChild(left);
        row.appendChild(right);
        gallery.appendChild(row);
      });
    }

    // Render initial
    render(cars);

    // Recherche
    searchInput.addEventListener("input", () => {
      const q = normalize(searchInput.value);

      if (!q) {
        render(cars);
        return;
      }

      const filtered = cars.filter(car => {
        const hay = [
          car.marque, car.modele, car.annees,
          car.categorie, car.couleur, car.notes, car.fabricant
        ].map(normalize).join(" ");
        return hay.includes(q);
      });

      render(filtered);
    });
  })
  .catch(err => {
    console.error("Erreur chargement collection.json:", err);
    document.getElementById("gallery").innerHTML =
      "<p>Erreur: impossible de charger collection.json (voir console).</p>";
  });
