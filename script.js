document.addEventListener('DOMContentLoaded', () => {
  // 1. FETCH VEHICLE DATA
  fetch('data/vehicles.json')
    .then(response => {
      if (!response.ok) throw new Error('Could not load vehicles.json');
      return response.json();
    })
    .then(vehicles => {
      renderVehicles(vehicles);
      setupFilterLogic(vehicles); // Initialize filters
    })
    .catch(err => console.error("Fetch Error:", err));
});

function renderVehicles(vehiclesToRender) {
  const container = document.getElementById('vehicle-cards-container');
  if (!container) return;
  
  container.innerHTML = ''; // Clear current view

  vehiclesToRender.forEach(vehicle => {
    const vehicleCard = document.createElement('div');
    vehicleCard.classList.add('vehicle-card');
    
    // Determine fuel type and sold status for filtering badges
    const isSold = vehicle.price_ksh && vehicle.price_ksh.toString().toUpperCase() === "SOLD";
    const fuelType = (vehicle.fuel || "Petrol").toLowerCase();

    // Gallery & Dots HTML
    let imageHtml = `<div class="vehicle-images" data-vehicle-id="${vehicle.id}">`;
    vehicle.images.forEach(img => {
      imageHtml += `<img src="${img}" alt="${vehicle.name}" class="zoomable">`;
    });
    imageHtml += '</div><div class="image-nav">';
    vehicle.images.forEach((_, i) => {
      imageHtml += `<button data-index="${i}" data-vehicle="${vehicle.id}" class="dot-btn"></button>`;
    });
    imageHtml += '</div>';

    // Price / Sold Logic
    let priceSection = isSold ? 
      `<div class="sold-container"><div class="sold-marquee">SOLD — UNIT UNAVAILABLE — SOLD</div></div>` : 
      `<p><strong>Price:</strong> <span>KES ${vehicle.price_ksh}</span></p>`;

    // WhatsApp logic
    const cleanPhone = vehicle.contact_phone.replace(/\D/g, '');
    const whatsappMsg = encodeURIComponent(`Hello TBAG, I'm interested in the ${vehicle.name}.`);

    vehicleCard.innerHTML = `
      <div class="vehicle-details">
        <h3>${vehicle.name}</h3>
        ${imageHtml}
        ${priceSection}
        <p><strong>Condition:</strong> <span>${vehicle.condition_type}</span></p>
        <div class="contact-info">
          <p><strong>Phone:</strong> ${vehicle.contact_phone}</p>
          <a href="https://wa.me/${cleanPhone}?text=${whatsappMsg}" target="_blank" class="button" style="background-color:#25D366; display:flex; align-items:center; justify-content:center; gap:8px;">
            Chat on WhatsApp
          </a>
        </div>
      </div>
    `;
    container.appendChild(vehicleCard);
  });

  setupCarouselAndZoom();
}

function setupFilterLogic(allVehicles) {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active class
      document.querySelector('.filter-btn.active').classList.remove('active');
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      // Filter the data array
      const filtered = allVehicles.filter(v => {
        const isSold = v.price_ksh && v.price_ksh.toString().toUpperCase() === "SOLD";
        const fuel = (v.fuel || "Petrol").toLowerCase();

        if (filterValue === 'all') return true;
        if (filterValue === 'available') return !isSold;
        if (filterValue === 'sold') return isSold;
        if (filterValue === 'hybrid') return fuel === 'hybrid';
        if (filterValue === 'petrol') return fuel === 'petrol';
        return true;
      });

      renderVehicles(filtered);
    });
  });
}

// ... Keep your setupCarouselAndZoom() function exactly as it was in your blueprint
