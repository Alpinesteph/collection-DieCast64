fetch("collection.json")
  .then(r => r.json())
  .then(cars => {
    const gallery = document.getElementById("gallery");
    const searchInput = document.getElementById("search");

    // Sécurité: si jamais cars n'est pas un tableau
    if (!Array.isArray(cars)) {
      console.error("collection.json doit être un tableau JSON: [ {...}, {...} ]");
      gallery.innerHTML = "<p>Erreur: collection.json n’est pas une liste valide.</p>";
      return;
    }

    function normalize(str) {
      return (str || "").toString().toLowerCase().trim();
    }

    function initials(brand) {
      // Ex: "Alfa Romeo" -> "AR", "Tomica Premium" -> "TP"
      return normalize(brand)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join("");
    }

    function logoPath(brand) {
      // Convention de nom: logos/alfa-romeo.png (ou .svg/.jpg)
      // On convertit en "slug"
      const slug = normalize(brand)
        .replace(/é|è|ê/g, "e")
        .replace(/à|â/g, "a")
        .replace(/î|ï/g, "i")
        .replace(/ô/g, "o")
        .replace(/ù|û|ü/g, "u")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      return `logos/${slug}.png`; // tu peux changer en .svg si tu préfères
    }

    function render(filteredCars) {
      gallery.innerHTML = "";

      // Grouper par marque
      const byBrand = new Map();
      filteredCars.forEach(car => {
        const brand = car.marque || "Sans marque";
        if (!byBrand.has(brand)) byBrand.set(brand, []);
        byBrand.get(brand).push(car);
      });

      // Trier les marques A->Z
      const brands = Array.from(byBrand.keys()).sort((a, b) => a.localeCompare(b, "fr"));

      if (brands.length === 0) {
        gallery.innerHTML = "<p>Aucun résultat.</p>";
        return;
      }

      brands.forEach(brand => {
        const row = document.createElement("div");
        row.className = "brand-row";

        // Colonne gauche
        const left = document.createElement("div");
        left.className = "brand-cell";

        const logoBox = document.createElement("div");
        logoBox.className = "brand-logo";

        const img = document.createElement("img");
        img.src = logoPath(brand);
        img.alt = `Logo ${brand}`;

        const badge = document.createElement("div");
        badge.className = "brand-badge";
        badge.textContent = initials(brand);

        // Si le logo n’existe pas (404), on masque l'image et on affiche les initiales
        img.onerror = () => {
          img.style.display = "none";
          badge.style.display = "flex";
        };

        logoBox.appendChild(img);
        logoBox.appendChild(badge);

        const brandName = document.createElement("div");
        brandName.className = "brand-name";
        brandName.textContent = brand;

        left.appendChild(logoBox);
        left.appendChild(brandName);

        // Colonne droite
        const right = document.createElement("div");
        right.className = "models";

        // Trier les modèles A->Z
        const models = byBrand.get(brand).slice().sort((a, b) =>
          (a.modele || "").localeCompare((b.modele || ""), "fr")
        );

        models.forEach(car => {
          const card = document.createElement("div");
          card.className = "model-card";

          const photo = (car.photo && car.photo.trim() !== "")
            ? car.photo
            : "https://via.placeholder.com/400x300?text=No+Photo";

          const imgCar = document.createElement("img");
          imgCar.className = "model-photo";
          imgCar.src = photo;
          imgCar.alt = `${car.marque || ""} ${car.modele || ""}`;

          // Si l'image externe ne s'affiche pas -> placeholder
          imgCar.onerror = () => {
            imgCar.src = "https://via.placeholder.com/400x300?text=No+Photo";
          };

          const info = document.createElement("div");
          info.className = "model-info";

          // Ligne titre: Modèle (gras) + Années à côté
          const title = document.createElement("p");
          title.className = "model-title";
          title.innerHTML = `
            <strong>${car.modele || ""}</strong>
            <span class="model-years">${car.annees ? car.annees : ""}</span>
          `;

          const cat = car.categorie ? `<div class="meta-line">Catégorie : ${car.categorie}</div>` : "";
          const col = car.couleur ? `<div class="meta-line">Couleur : ${car.couleur}</div>` : "";
          const notes = car.notes ? `<div class="notes">${car.notes}</div>` : "";
          const fab = car.fabricant ? `<div class="fabricant">${car.fabricant}</div>` : "";

          info.innerHTML = title.outerHTML + cat + col + notes + fab;

          card.appendChild(imgCar);
          card.appendChild(info);
          right.appendChild(card);
        });

        row.appendChild(left);
        row.appendChild(right);
        gallery.appendChild(row);
      });
    }

    // Première render
    render(cars);

    // Recherche (filtre sur marque, modèle, notes, fabricant, catégorie, couleur, années)
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
