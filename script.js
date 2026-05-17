fetch("collection.json")
  .then(r => r.json())
  .then(cars => {

    const sections = {
      mythique: document.getElementById("list-mythiques"),
      course_lemans: document.getElementById("list-course-lemans"),
      course_rallye: document.getElementById("list-course-rallye"),
      course_f1: document.getElementById("list-course-f1"),
      course_jgtc: document.getElementById("list-course-jgtc"),
      course_autres: document.getElementById("list-course-autres"),
      tuning: document.getElementById("list-tuning"),
      wanted: document.getElementById("list-wanted")
    };

    const searchInput = document.getElementById("search");

    if (!Array.isArray(cars)) {
      console.error("collection.json invalide");
      return;
    }

    cars = cars.filter(car => !car._commentaire);

    const normalize = (str) => (str || "").toLowerCase().trim();

    const slugify = (brand) =>
      normalize(brand)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const logoPath = (brand) => `logos/${slugify(brand)}.png`;

    const NO_PHOTO =
      "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";

    /* =========================
       RENDER
    ========================= */
    function render(list) {

      Object.values(sections).forEach(sec => sec.innerHTML = "");

      const byType = {
        mythique: [],
        tuning: [],
        wanted: [],

        course_lemans: [],
        course_rallye: [],
        course_f1: [],
        course_jgtc: [],
        course_autres: []
      };

      list.forEach(car => {

        if (car.type === "course") {

          let key = "course_autres";
          const cat = (car.categorie || "").toLowerCase();

          if (cat.includes("le mans") || cat.includes("endurance")) key = "course_lemans";
          else if (cat.includes("rallye")) key = "course_rallye";
          else if (cat.includes("f1") || cat.includes("formule")) key = "course_f1";
          else if (cat.includes("jgtc") || cat.includes("super gt")) key = "course_jgtc";

          byType[key].push(car);

        } else {
          const type = car.type || "mythique";
          if (byType[type]) byType[type].push(car);
        }

      });

      /* =========================
         RENDER SECTIONS
      ========================= */
      Object.keys(byType).forEach(type => {
        const container = sections[type];
        if (!container) return;

        const carsList = byType[type];

        const isCourse = type.startsWith("course_");

        /* =========================
           MODE SIMPLE POUR COURSE
        ========================= */
        if (isCourse) {

          carsList.forEach(car => {

            const rowModel = document.createElement("div");
            rowModel.className = "model-row";

            // colonne marque vide pour alignement
            const fakeBrand = document.createElement("div");
            fakeBrand.className = "fake-brand";
            rowModel.appendChild(fakeBrand);

            const leftBlock = document.createElement("div");
            leftBlock.className = "model-left";

            const img = document.createElement("img");
            img.className = "model-photo";
            img.src = car.photo?.trim() || NO_PHOTO;
            img.alt = `${car.marque} ${car.modele}`;
            img.onerror = () => img.src = NO_PHOTO;

            leftBlock.appendChild(img);

            const rightBlock = document.createElement("div");
            rightBlock.className = "model-right";

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
              <div class="model-title">${car.marque} ${car.modele}</div>
              <div class="meta-line"><span class="meta-label">Années :</span> ${car.annees || ""}</div>
              <div class="meta-line"><span class="meta-label">Catégorie :</span> ${car.categorie || ""}</div>
              <div class="meta-line"><span class="meta-label">Couleur :</span> ${car.couleur || ""}</div>
              <div class="meta-line"><span class="meta-label">Prix :</span> ${car.prix || 0} €</div>
              ${car.notes ? `<div class="notes">${car.notes}</div>` : ""}
              ${fabricant}
            `;

            rowModel.appendChild(leftBlock);
            rowModel.appendChild(rightBlock);
            container.appendChild(rowModel);
          });

          return;
        }

        /* =========================
           MODE NORMAL (MARQUES)
        ========================= */
        const byBrand = new Map();
        carsList.forEach(car => {
          const brand = car.marque || "Sans marque";
          if (!byBrand.has(brand)) byBrand.set(brand, []);
          byBrand.get(brand).push(car);
        });

        const brands = Array.from(byBrand.keys());

        brands.forEach(brand => {

          const row = document.createElement("div");
          row.className = "brand-row";

          const left = document.createElement("div");
          left.className = "brand-cell";

          const logoBox = document.createElement("div");
          logoBox.className = "brand-logo";

          const imgLogo = document.createElement("img");
          imgLogo.src = logoPath(brand);
          imgLogo.alt = brand;

          const badge = document.createElement("div");
          badge.className = "brand-badge";
          badge.textContent = brand.slice(0, 2).toUpperCase();

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

          const right = document.createElement("div");
          right.className = "models";

          const models = byBrand.get(brand).slice();

          models.forEach(car => {

            const rowModel = document.createElement("div");
            rowModel.className = "model-row";

            const leftBlock = document.createElement("div");
            leftBlock.className = "model-left";

            const img = document.createElement("img");
            img.className = "model-photo";
            img.src = car.photo?.trim() || NO_PHOTO;
            img.alt = `${car.marque} ${car.modele}`;
            img.onerror = () => img.src = NO_PHOTO;

            leftBlock.appendChild(img);

            const rightBlock = document.createElement("div");
            rightBlock.className = "model-right";

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
              <div class="meta-line"><span class="meta-label">Années :</span> ${car.annees || ""}</div>
              <div class="meta-line"><span class="meta-label">Catégorie :</span> ${car.categorie || ""}</div>
              <div class="meta-line"><span class="meta-label">Couleur :</span> ${car.couleur || ""}</div>
              <div class="meta-line"><span class="meta-label">Prix :</span> ${car.prix || 0} €</div>
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

    render(cars);

    searchInput.addEventListener("input", () => {
      const q = normalize(searchInput.value);
      if (!q) return render(cars);

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
  .catch(err => console.error("Erreur chargement JSON:", err));
fetch("collection.json")
  .then(r => r.json())
  .then(cars => {

    const sections = {
      mythique: document.getElementById("list-mythiques"),
      course_lemans: document.getElementById("list-course-lemans"),
      course_rallye: document.getElementById("list-course-rallye"),
      course_f1: document.getElementById("list-course-f1"),
      course_jgtc: document.getElementById("list-course-jgtc"),
      course_autres: document.getElementById("list-course-autres"),
      tuning: document.getElementById("list-tuning"),
      wanted: document.getElementById("list-wanted")
    };

    const searchInput = document.getElementById("search");

    if (!Array.isArray(cars)) {
      console.error("collection.json invalide");
      return;
    }

    cars = cars.filter(car => !car._commentaire);

    const normalize = (str) => (str || "").toLowerCase().trim();

    const slugify = (brand) =>
      normalize(brand)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const logoPath = (brand) => `logos/${slugify(brand)}.png`;

    const NO_PHOTO =
      "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";

    /* =========================
       RENDER
    ========================= */
    function render(list) {

      Object.values(sections).forEach(sec => sec.innerHTML = "");

      const byType = {
        mythique: [],
        tuning: [],
        wanted: [],

        course_lemans: [],
        course_rallye: [],
        course_f1: [],
        course_jgtc: [],
        course_autres: []
      };

      list.forEach(car => {

        if (car.type === "course") {

          let key = "course_autres";
          const cat = (car.categorie || "").toLowerCase();

          if (cat.includes("le mans") || cat.includes("endurance")) key = "course_lemans";
          else if (cat.includes("rallye")) key = "course_rallye";
          else if (cat.includes("f1") || cat.includes("formule")) key = "course_f1";
          else if (cat.includes("jgtc") || cat.includes("super gt")) key = "course_jgtc";

          byType[key].push(car);

        } else {
          const type = car.type || "mythique";
          if (byType[type]) byType[type].push(car);
        }

      });

      /* =========================
         RENDER SECTIONS
      ========================= */
      Object.keys(byType).forEach(type => {
        const container = sections[type];
        if (!container) return;

        const carsList = byType[type];

        const isCourse = type.startsWith("course_");

        /* =========================
           MODE SIMPLE POUR COURSE
        ========================= */
        if (isCourse) {

          carsList.forEach(car => {

            const rowModel = document.createElement("div");
            rowModel.className = "model-row";

            // colonne marque vide pour alignement
            const fakeBrand = document.createElement("div");
            fakeBrand.className = "fake-brand";
            rowModel.appendChild(fakeBrand);

            const leftBlock = document.createElement("div");
            leftBlock.className = "model-left";

            const img = document.createElement("img");
            img.className = "model-photo";
            img.src = car.photo?.trim() || NO_PHOTO;
            img.alt = `${car.marque} ${car.modele}`;
            img.onerror = () => img.src = NO_PHOTO;

            leftBlock.appendChild(img);

            const rightBlock = document.createElement("div");
            rightBlock.className = "model-right";

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
              <div class="model-title">${car.marque} ${car.modele}</div>
              <div class="meta-line"><span class="meta-label">Années :</span> ${car.annees || ""}</div>
              <div class="meta-line"><span class="meta-label">Catégorie :</span> ${car.categorie || ""}</div>
              <div class="meta-line"><span class="meta-label">Couleur :</span> ${car.couleur || ""}</div>
              <div class="meta-line"><span class="meta-label">Prix :</span> ${car.prix || 0} €</div>
              ${car.notes ? `<div class="notes">${car.notes}</div>` : ""}
              ${fabricant}
            `;

            rowModel.appendChild(leftBlock);
            rowModel.appendChild(rightBlock);
            container.appendChild(rowModel);
          });

          return;
        }

        /* =========================
           MODE NORMAL (MARQUES)
        ========================= */
        const byBrand = new Map();
        carsList.forEach(car => {
          const brand = car.marque || "Sans marque";
          if (!byBrand.has(brand)) byBrand.set(brand, []);
          byBrand.get(brand).push(car);
        });

        const brands = Array.from(byBrand.keys());

        brands.forEach(brand => {

          const row = document.createElement("div");
          row.className = "brand-row";

          const left = document.createElement("div");
          left.className = "brand-cell";

          const logoBox = document.createElement("div");
          logoBox.className = "brand-logo";

          const imgLogo = document.createElement("img");
          imgLogo.src = logoPath(brand);
          imgLogo.alt = brand;

          const badge = document.createElement("div");
          badge.className = "brand-badge";
          badge.textContent = brand.slice(0, 2).toUpperCase();

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

          const right = document.createElement("div");
          right.className = "models";

          const models = byBrand.get(brand).slice();

          models.forEach(car => {

            const rowModel = document.createElement("div");
            rowModel.className = "model-row";

            const leftBlock = document.createElement("div");
            leftBlock.className = "model-left";

            const img = document.createElement("img");
            img.className = "model-photo";
            img.src = car.photo?.trim() || NO_PHOTO;
            img.alt = `${car.marque} ${car.modele}`;
            img.onerror = () => img.src = NO_PHOTO;

            leftBlock.appendChild(img);

            const rightBlock = document.createElement("div");
            rightBlock.className = "model-right";

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
              <div class="meta-line"><span class="meta-label">Années :</span> ${car.annees || ""}</div>
              <div class="meta-line"><span class="meta-label">Catégorie :</span> ${car.categorie || ""}</div>
              <div class="meta-line"><span class="meta-label">Couleur :</span> ${car.couleur || ""}</div>
              <div class="meta-line"><span class="meta-label">Prix :</span> ${car.prix || 0} €</div>
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

    render(cars);

    searchInput.addEventListener("input", () => {
      const q = normalize(searchInput.value);
      if (!q) return render(cars);

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
  .catch(err => console.error("Erreur chargement JSON:", err));
fetch("collection.json")
  .then(r => r.json())
  .then(cars => {

    const sections = {
      mythique: document.getElementById("list-mythiques"),
      course_lemans: document.getElementById("list-course-lemans"),
      course_rallye: document.getElementById("list-course-rallye"),
      course_f1: document.getElementById("list-course-f1"),
      course_jgtc: document.getElementById("list-course-jgtc"),
      course_autres: document.getElementById("list-course-autres"),
      tuning: document.getElementById("list-tuning"),
      wanted: document.getElementById("list-wanted")
    };

    const searchInput = document.getElementById("search");

    if (!Array.isArray(cars)) {
      console.error("collection.json invalide");
      return;
    }

    cars = cars.filter(car => !car._commentaire);

    const normalize = (str) => (str || "").toLowerCase().trim();

    const slugify = (brand) =>
      normalize(brand)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const logoPath = (brand) => `logos/${slugify(brand)}.png`;

    const NO_PHOTO =
      "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";

    /* =========================
       RENDER
    ========================= */
    function render(list) {

      Object.values(sections).forEach(sec => sec.innerHTML = "");

      const byType = {
        mythique: [],
        tuning: [],
        wanted: [],

        course_lemans: [],
        course_rallye: [],
        course_f1: [],
        course_jgtc: [],
        course_autres: []
      };

      list.forEach(car => {

        if (car.type === "course") {

          let key = "course_autres";
          const cat = (car.categorie || "").toLowerCase();

          if (cat.includes("le mans") || cat.includes("endurance")) key = "course_lemans";
          else if (cat.includes("rallye")) key = "course_rallye";
          else if (cat.includes("f1") || cat.includes("formule")) key = "course_f1";
          else if (cat.includes("jgtc") || cat.includes("super gt")) key = "course_jgtc";

          byType[key].push(car);

        } else {
          const type = car.type || "mythique";
          if (byType[type]) byType[type].push(car);
        }

      });

      /* =========================
         RENDER SECTIONS
      ========================= */
      Object.keys(byType).forEach(type => {
        const container = sections[type];
        if (!container) return;

        const carsList = byType[type];

        const isCourse = type.startsWith("course_");

        /* =========================
           MODE SIMPLE POUR COURSE
        ========================= */
        if (isCourse) {

          carsList.forEach(car => {

            const rowModel = document.createElement("div");
            rowModel.className = "model-row";

            const leftBlock = document.createElement("div");
            leftBlock.className = "model-left";

            const img = document.createElement("img");
            img.className = "model-photo";
            img.src = car.photo?.trim() || NO_PHOTO;
            img.alt = `${car.marque} ${car.modele}`;
            img.onerror = () => img.src = NO_PHOTO;

            leftBlock.appendChild(img);

            const rightBlock = document.createElement("div");
            rightBlock.className = "model-right";

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
              <div class="model-title">${car.marque} ${car.modele}</div>
              <div class="meta-line"><span class="meta-label">Années :</span> ${car.annees || ""}</div>
              <div class="meta-line"><span class="meta-label">Catégorie :</span> ${car.categorie || ""}</div>
              <div class="meta-line"><span class="meta-label">Couleur :</span> ${car.couleur || ""}</div>
              <div class="meta-line"><span class="meta-label">Prix :</span> ${car.prix || 0} €</div>
              ${car.notes ? `<div class="notes">${car.notes}</div>` : ""}
              ${fabricant}
            `;

            rowModel.appendChild(leftBlock);
            rowModel.appendChild(rightBlock);
            container.appendChild(rowModel);
          });

          return;
        }

        /* =========================
           MODE NORMAL (MARQUES)
        ========================= */
        const byBrand = new Map();
        carsList.forEach(car => {
          const brand = car.marque || "Sans marque";
          if (!byBrand.has(brand)) byBrand.set(brand, []);
          byBrand.get(brand).push(car);
        });

        const brands = Array.from(byBrand.keys());

        brands.forEach(brand => {

          const row = document.createElement("div");
          row.className = "brand-row";

          const left = document.createElement("div");
          left.className = "brand-cell";

          const logoBox = document.createElement("div");
          logoBox.className = "brand-logo";

          const imgLogo = document.createElement("img");
          imgLogo.src = logoPath(brand);
          imgLogo.alt = brand;

          const badge = document.createElement("div");
          badge.className = "brand-badge";
          badge.textContent = brand.slice(0, 2).toUpperCase();

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

          const right = document.createElement("div");
          right.className = "models";

          const models = byBrand.get(brand).slice();

          models.forEach(car => {

            const rowModel = document.createElement("div");
            rowModel.className = "model-row";

            const leftBlock = document.createElement("div");
            leftBlock.className = "model-left";

            const img = document.createElement("img");
            img.className = "model-photo";
            img.src = car.photo?.trim() || NO_PHOTO;
            img.alt = `${car.marque} ${car.modele}`;
            img.onerror = () => img.src = NO_PHOTO;

            leftBlock.appendChild(img);

            const rightBlock = document.createElement("div");
            rightBlock.className = "model-right";

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
              <div class="meta-line"><span class="meta-label">Années :</span> ${car.annees || ""}</div>
              <div class="meta-line"><span class="meta-label">Catégorie :</span> ${car.categorie || ""}</div>
              <div class="meta-line"><span class="meta-label">Couleur :</span> ${car.couleur || ""}</div>
              <div class="meta-line"><span class="meta-label">Prix :</span> ${car.prix || 0} €</div>
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

    render(cars);

    searchInput.addEventListener("input", () => {
      const q = normalize(searchInput.value);
      if (!q) return render(cars);

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
  .catch(err => console.error("Erreur chargement JSON:", err));
