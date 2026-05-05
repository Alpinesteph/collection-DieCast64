fetch("collection.json")
  .then(r => r.json())
  .then(cars => {
    const gallery = document.getElementById("gallery");
    const searchInput = document.getElementById("search");

    if (!Array.isArray(cars)) {
      gallery.innerHTML = "<p>Erreur: collection.json doit être une liste [ ... ]</p>";
      return;
    }

    function normalize(str) {
      return (str || "").toString().toLowerCase().trim();
    }

    function initials(brand) {
      return normalize(brand)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join("");
    }

    function slugify(brand) {
      return normalize(brand)
        .replace(/é|è|ê/g, "e")
        .replace(/à|â/g, "a")
        .replace(/î|ï/g, "i")
        .replace(/ô/g, "o")
        .replace(/ù|û|ü/g, "u")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    function logoPath(brand) {
      return `logos/${slugify(brand)}.png`;
    }

    function render(filteredCars) {
      gallery.innerHTML = "";

      // group by marque
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

        // --- Left: brand cell ---
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

        // --- Right: models list ---
        const right = document.createElement("div");
        right.className = "models";

        const models = byBrand.get(brand).slice().sort((a, b) =>
          (a.modele || "").localeCompare((b.modele || ""), "fr")
        );

        models.forEach(car => {
          const modelRow = document.createElement("div");
          modelRow.className = "model-row";

          const photoSrc = (car.photo && car.photo.trim() !== "")
            ? car.photo
            : "https://via.placeholder.com/400x300?text=No+Photo";

          // LEFT block
          const leftBlock = document.createElement("div");
          leftBlock.className = "model-left";

          const header = document.createElement("div");
          header.className = "model-header";
          header.innerHTML = `
            <span class="model-name">${car.modele || ""}</span>
            ${car.annees ? `<span class="model-years">${car.annees}</span>` : ""}
          `;

          const imgCar = document.createElement("img");
          imgCar.className = "model-photo";
          imgCar.src = photoSrc;
          imgCar.alt = `${car.marque || ""} ${car.modele || ""}`;
          imgCar.onerror = () => {
            imgCar.src = "https://via.placeholder.com/400x300?text=No+Photo";
          };

          leftBlock.appendChild(header);
          leftBlock.appendChild(imgCar);

          // RIGHT block
          const rightBlock = document.createElement("div");
          rightBlock.className = "model-right";

          const prixTxt = (car.prix !== null && car.prix !== undefined && car.prix !== "")
            ? `${car.prix} €`
            : "";

          rightBlock.innerHTML = `
            ${car.categorie ? `<div class="meta-line"><strong>Catégorie :</strong> ${car.categorie}</div>` : ""}
            ${car.couleur ? `<div class="meta-line"><strong>Couleur :</strong> ${car.couleur}</div>` : ""}
            ${prixTxt ? `<div class="meta-line"><strong>Prix :</strong> ${prixTxt}</div>` : ""}
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

    // first render
    render(cars);

    // search filter
    searchInput.addEventListener("input", () => {
      const q = normalize(searchInput.value);

      if (!q) {
        render(cars);
        return;
      }

      const filtered = cars.filter(car => {
        const hay = [
          car.marque, car.modele, car.annees, car.categorie,
          car.couleur, car.notes, car.fabricant
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
