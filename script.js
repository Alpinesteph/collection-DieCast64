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

    if (!Array.isArray(cars)) return;

    cars = cars.filter(c => !c._commentaire);

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
          if (byType[type]) byType[type].push(car);
        }

      });

      Object.keys(byType).forEach(type => {

        const container = sections[type];
        if (!container) return;

        const carsList = byType[type];
        const isCourse = type.startsWith("course_");

        if (isCourse) {

          // même structure que mythiques : brand-row → models → model-row
          const brandRow = document.createElement("div");
          brandRow.className = "brand-row";

          const fakeBrand = document.createElement("div");
          fakeBrand.className = "brand-cell fake-brand";
          brandRow.appendChild(fakeBrand);

          const models = document.createElement("div");
          models.className = "models";

          carsList.forEach(car => {

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
              <div class="model-title">${car.marque} ${car.modele}</div>
              <div class="meta-line"><span class="meta-label">Années :</span> ${car.annees || ""}</div>
              <div class="meta-line"><span class="meta-label">Catégorie :</span> ${car.categorie || ""}</div>
              <div class="meta-line"><span class="meta-label">Couleur :</span> ${car.couleur || ""}</div>
              <div class="meta-line"><span class="meta-label">Prix :</span> ${car.prix || 0} €</div>
              ${car.notes ? `<div class="notes">${car.notes}</div>` : ""}
            `;

            rowModel.appendChild(leftBlock);
            rowModel.appendChild(rightBlock);
            models.appendChild(rowModel);
          });

          brandRow.appendChild(models);
          container.appendChild(brandRow);

          return;
        }

        // sections normales (mythiques/tuning/wanted)
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

          const brandName = document.createElement("div");
          brandName.className = "brand-name";
          brandName.textContent = brand;

          left.appendChild(brandName);

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
              <div class="meta-line"><span class="meta-label">Années :</span> ${car.annees || ""}</div>
              <div class="meta-line"><span class="meta-label">Catégorie :</span> ${car.categorie || ""}</div>
              <div class="meta-line"><span class="meta-label">Couleur :</span> ${car.couleur || ""}</div>
              <div class="meta-line"><span class="meta-label">Prix :</span> ${car.prix || 0} €</div>
              ${car.notes ? `<div class="notes">${car.notes}</div>` : ""}
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
          car.notes
        ].map(normalize).join(" ");

        return hay.includes(q);
      });

      render(filtered);
    });

  });
