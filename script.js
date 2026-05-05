fetch("collection.json")
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById("gallery");

    data.forEach(car => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        ${car.photo}
        <strong>${car.marque} ${car.modele}</strong><br>
        ${car.fabricant} – ${car.annee}
      `;

      gallery.appendChild(card);
    });
  });
