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

    const normalize = s => (s || "").toLowerCase().trim();

    const NO_PHOTO =
      "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";

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
          const cat = normalize(car.categorie);

          if (cat.includes("le mans") || cat.includes("endurance")) key = "course_lemans";
          else if (cat.includes("rallye")) key = "course_rallye";
          else if (cat.includes("f1") || cat.includes("formule")) key = "course_f1";
          else if (cat.includes("jgtc") || cat.includes("super gt")) key = "course_jgtc";

          byType[key].push(car);

        } else {
          const type = car.type || "mythique";
          byType[type].push(car);
        }

      });

      Object.keys(byType).forEach(type => {

        const container = sections[type];
        const carsList = byType[type];
        const isCourse = type.startsWith("course_");

        /* =========================
           COURSE : même structure que mythiques
        ========================= */
        if (isCourse) {

          const wrapper = document.createElement("div");
          wrapper.className = "brand-row";

          const fakeBrand = document.createElement("div");
          fakeBrand.className = "brand-cell fake-brand";
          wrapper.appendChild(fakeBrand);

          const models = document.createElement("div");
          models.className = "models";

          carsList.forEach(car => {

            const row = document.createElement("div");
            row.className = "model-row";

            const left = document.createElement("div");
            left.className = "model-left";

            const img = document.createElement("img");
            img.className = "model-photo";
            img.src = (car.photo || "").trim() || NO_PHOTO;
            img.onerror = () => img.src = NO_PHOTO;

            left.appendChild(img);

            const right = document.createElement("div");
            right.className = "model-right";

            right.innerHTML = `
              <div class="model-title">${car.marque} ${car.modele}</div>
              <div><b>Années :</b> ${car.annees || ""}</div>
              <div><b>Catégorie :</b> ${car.categorie || ""}</div>
              <div><b>Couleur :</b> ${car.couleur || ""}</div>
              <div><b>Prix :</b> ${car.prix || 0} €</div>
              ${car.notes ? `<div class="notes">${car.notes}</div>` : ""}
              ${car.fabricant ? `
                <div class="fabricant-line">
                  <span class="fabricant">${car.fabricant}</span>
                  ${car.reference_fabricant ? `<span class="ref-fabricant">${car.reference_fabricant}</span>` : ""}
                </div>` : ""}
            `;

            row.appendChild(left);
            row.appendChild(right);
            models.appendChild(row);
          });

          wrapper.appendChild(models);
          container.appendChild(wrapper);

          return;
        }

        /* =========================
           SECTIONS NORMALES
        ========================= */
        const byBrand = new Map();
        carsList.forEach(car => {
          const brand = car.marque || "Sans marque";
          if (!byBrand.has(brand)) byBrand.set(brand, []);
          byBrand.get(brand).push(car);
        });

        Array.from(byBrand.keys()).forEach(brand => {

          const row = document.createElement("div");
          row.className = "brand-row";

          const left = document.createElement("div");
          left.className = "brand-cell";

          left.innerHTML = `
            <div class="brand-logo">
              <img src="logos/${brand.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png"
                   onerror="this.style.display='none'">
            </div>
            <div class="brand-name">${brand}</div>
          `;

          const models = document.createElement("div");
          models.className = "models";

          byBrand.get(brand).forEach(car => {

            const rowModel = document.createElement("div");
            rowModel.className = "model-row";

            const leftBlock = document.createElement("div");
            leftBlock.className = "model-left";

            const img = document.createElement("img");
            img.className = "model-photo";
            img.src = (car.photo || "").trim() || NO_PHOTO;
            img.onerror = () => img.src = NO_PHOTO;

            leftBlock.appendChild(img);

            const rightBlock = document.createElement("div");
            rightBlock.className = "model-right";

            rightBlock.innerHTML = `
              <div class="model-title">${car.modele}</div>
              <div><b>Années :</b> ${car.annees || ""}</div>
              <div><b>Catégorie :</b> ${car.categorie || ""}</div>
              <div><b>Couleur :</b> ${car.couleur || ""}</div>
              <div><b>Prix :</b> ${car.prix || 0} €</div>
              ${car.notes ? `<div class="notes">${car.notes}</div>` : ""}
              ${car.fabricant ? `
                <div class="fabricant-line">
                  <span class="fabricant">${car.fabricant}</span>
                  ${car.reference_fabricant ? `<span class="ref-fabricant">${car.reference_fabricant}</span>` : ""}
                </div>` : ""}
            `;

            rowModel.appendChild(leftBlock);
            rowModel.appendChild(rightBlock);
            models.appendChild(rowModel);
          });

          row.appendChild(left);
          row.appendChild(models);
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

    /* =========================
       DARK MODE
    ========================= */
    const toggle = document.getElementById("darkToggle");
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
    });

  });
