fetch("collection.json")
  .then(r => r.json())
  .then(cars => {

    const sections = {
      mythique: document.getElementById("list-mythiques"),
      course: document.getElementById("list-course"),
      tuning: document.getElementById("list-tuning"),
      wanted: document.getElementById("list-wanted")
    };

    const searchInput = document.getElementById("search");

    if (!searchInput) {
      console.error("Élément #search manquant");
      return;
    }

    if (!Array.isArray(cars)) {
      console.error("collection.json invalide");
      return;
    }

    // Nettoyage
    cars = cars.filter(car => !car._commentaire);

    const normalize = (str) => (str || "").toLowerCase().trim();

    const initials = (brand) => {
      return normalize(brand)
        .split(" ")
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase())
        .join("");
    };

    const slugify = (brand) => {
      return normalize(brand)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    const logoPath = (brand) => `logos/${slugify(brand)}.png`;

    const NO_PHOTO =
      "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";

    /* =========================
       RENDER PAR SECTION
    ========================= */
    function render(list) {

      // reset sections
      Object.values(sections).forEach(sec => {
        if (sec) sec.innerHTML = "";
      });

      // group by categorie (type)
      const byType = {
        mythique: [],
        course: [],
        tuning: [],
        wanted: []
      };

      list.forEach(car => {
        const type = car.type || "mythique";
        if (byType[type]) {
          byType[type].push(car);
        }
      });

      // render chaque section
      Object.keys(byType).forEach(type => {
        const container = sections[type];
        if (!container) return;

        const carsList = byType[type];

        // group by brand
        const byBrand = new Map();
        carsList.forEach(car => {
          const brand = car.marque || "Sans marque";
          if (!byBrand.has(brand)) byBrand.set(brand, []);
          byBrand.get(brand).push(car);
        });

        const brands = Array.from(byBrand.keys()).sort((a, b) =>
          a.localeCompare(b, "fr")
        );

        brands.forEach(brand => {

          const row = document.createElement("div");
          row.className = "brand-row";

          /* LEFT = BRAND */
          const left = document.createElement("div");
          left.className = "brand-cell";

          const logoBox = document.createElement("div");
          logoBox.className = "brand-logo";

          const imgLogo = document.createElement("img");
          imgLogo.src = logoPath(brand);
          imgLogo.alt = brand;

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

          /* RIGHT = MODELS */
          const right = document.createElement("div");
          right.className = "models";

          const models = byBrand.get(brand)
            .slice()
            .sort((a, b) =>
              (a.modele || "").localeCompare(b.modele || "", "fr")
            );

          models.forEach(car => {

            const rowModel = document.createElement("div");
            rowModel.className = "model-row";

            /* IMAGE */
            const imgSrc = car.photo?.trim() || NO_PHOTO;

            const leftBlock = document.createElement("div");
            leftBlock.className = "model-left";

            const img = document.createElement("img");
            img.className = "model-photo";
            img.src = imgSrc;
            img.alt = `${car.marque} ${car.modele}`;

            img.onerror = () => {
              img.src = NO_PHOTO;
            };

            leftBlock.appendChild(img);

            /* INFO */
            const rightBlock = document.createElement("div");
            rightBlock.className = "model-right";

            const prix = car.prix || 0;

            const fabricant = car.fabricant
              ? `
              <div class="fabricant-line">
                <span class="fabricant">
                  ${car.fabricant}
                  ${car.reference_fabricant ? `<span class="ref-fabricant">${car.reference_fabricant}</span>` : ""}
                </span>
              </div>`
              : "";

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

              ${fabricant}
            `;

            rowModel.appendChild(leftBlock);
            rowModel.appendChild(rightBlock);
            right.appendChild(rowModel);
          });

          row.appendChild(left);
          row.appendChild(right);
          container.appendChild(row);
        });

      });
    }

    /* =========================
       Init
    ========================= */
    render(cars);

    /* =========================
       Search
    ========================= */
    searchInput.addEventListener("input", () => {

      const q = normalize(searchInput.value);

      if (!q) {
        render(cars);
        return;
      }

      const filtered = cars.filter(car => {
        const hay = [
          car.marque,
          car.modele,
          car.annees,
          car.categorie,
          car.couleur,
          car.notes,
          car.fabricant,
          car.reference_fabricant
        ].map(normalize).join(" ");

        return hay.includes(q);
      });

      render(filtered);
    });

  })
  .catch(err => {
    console.error("Erreur chargement JSON:", err);
  });

