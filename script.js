fetch("collection.json")
  .then(response => response.json())
  .then(data => {
    const gallery = document.getElementById("gallery");

    data.forEach(car => {
      const div = document.createElement("div");
      div.innerHTML = `
        <p><strong>${car.marque} ${car.modele}</strong></p>
        <p>${car.fabricant} – ${car.annee}</p>
        <img src="${car.photo}" width="200">
      `;
      gallery.appendChild(div);
    });
  });
