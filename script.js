document.addEventListener('DOMContentLoaded', () => {
  // 1. FETCH VEHICLE DATA
  fetch('data/vehicles.json')
    .then(response => {
      if (!response.ok) throw new Error('Could not load vehicles.json');
      return response.json();
    })
    .then(vehicles => {
      const container = document.getElementById('vehicle-cards-container');
      if (!container) return;

      vehicles.forEach(vehicle => {
        const vehicleCard = document.createElement('div');
        vehicleCard.classList.add('vehicle-card');

        // Gallery HTML
        let imageHtml = `<div class="vehicle-images" data-vehicle-id="${vehicle.id}">`;
        vehicle.images.forEach(img => {
          imageHtml += `<img src="${img}" alt="${vehicle.name}">`;
        });
        imageHtml += '</div><div class="image-nav">';
        
        // Dot Buttons
        vehicle.images.forEach((_, i) => {
          imageHtml += `<button data-index="${i}" data-vehicle="${vehicle.id}" class="dot-btn"></button>`;
        });
        imageHtml += '</div>';

        // --- START SOLD FEATURE LOGIC ---
        let priceHtml = '';
        if (vehicle.price_ksh && vehicle.price_ksh.toString().toUpperCase() === "SOLD") {
          priceHtml = `
            <div class="sold-container">
              <div class="sold-marquee">
                SOLD — UNIT NO LONGER AVAILABLE — <span class="badge">SOLD</span> — SOLD — UNIT NO LONGER AVAILABLE
              </div>
            </div>`;
        } else {
          priceHtml = `<p><strong>Price:</strong> <span>KES ${vehicle.price_ksh}</span></p>`;
        }
        // --- END SOLD FEATURE LOGIC ---

        vehicleCard.innerHTML = `
          <h3>${vehicle.name}</h3>
          ${imageHtml}
          <div class="vehicle-details">
            ${priceHtml}
            <p><strong>Condition:</strong> <span>${vehicle.condition_type}</span></p>
            <div class="contact-info">
              <p><strong>Phone:</strong> ${vehicle.contact_phone}</p>
            </div>
          </div>
        `;
        container.appendChild(vehicleCard);
      });

      // 2. INITIALIZE ZOOM & NAVIGATION (Remaining untouched)
      setupCarouselAndZoom();
    })
    .catch(err => {
      const errorLog = document.getElementById('error-log');
      if (errorLog) errorLog.textContent = "Error: " + err.message;
    });
});

function setupCarouselAndZoom() {
  const overlay = document.getElementById('image-zoom-overlay');
  if (!overlay) return; 

  const zoomImg = overlay.querySelector('img');

  /* --- ZOOM LOGIC WITH BACK BUTTON FIX --- */
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.vehicle-images img');
    if (!img) return;

    e.stopPropagation();
    zoomImg.src = img.src;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Add virtual state to history
    window.history.pushState({ zoomed: true }, "");
  });

  const closeZoomView = () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  overlay.addEventListener('click', () => {
    if (window.history.state && window.history.state.zoomed) {
      window.history.back();
    } else {
      closeZoomView();
    }
  });

  window.addEventListener('popstate', () => {
    closeZoomView();
  });

  /* --- DOT NAVIGATION --- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.image-nav button');
    if (!btn) return;

    const vehicleId = btn.dataset.vehicle;
    const index = btn.dataset.index;
    const container = document.querySelector(`.vehicle-images[data-vehicle-id="${vehicleId}"]`);
    
    if (container) {
      const width = container.offsetWidth;
      container.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
  });
}
