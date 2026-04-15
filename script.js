document.addEventListener('DOMContentLoaded', () => {
  fetch('data/vehicles.json')
    .then(response => {
      if (!response.ok) throw new Error('Could not load vehicles.json');
      return response.json();
    })
    .then(vehicles => {
      const container = document.getElementById('vehicle-cards-container');
      if (!container) return;

      // Efficiently build all HTML at once
      container.innerHTML = vehicles.map(vehicle => {
        const isSold = vehicle.price_ksh?.toString().toUpperCase() === "SOLD";
        
        // Generate Dot Navigation
        const dotsHtml = vehicle.images.map((_, i) => 
          `<button data-index="${i}" data-vehicle="${vehicle.id}" class="dot-btn"></button>`
        ).join('');

        // Generate Image Gallery
        const imagesHtml = vehicle.images.map(img => 
          `<img src="${img}" alt="${vehicle.name}" loading="lazy">`
        ).join('');

        // Handle Price vs Sold Marquee
        const priceDisplay = isSold 
          ? `<div class="sold-container"><div class="sold-marquee">SOLD — UNIT NO LONGER AVAILABLE — <span class="badge">SOLD</span> — VISIT DEALER FOR SIMILAR UNITS</div></div>`
          : `<p><strong>Price:</strong> <span>KES ${vehicle.price_ksh}</span></p>`;

        return `
          <div class="vehicle-card">
            <div class="vehicle-images" data-vehicle-id="${vehicle.id}">
              ${imagesHtml}
            </div>
            <div class="image-nav">${dotsHtml}</div>
            <div class="vehicle-details">
              <h3>${vehicle.name}</h3>
              ${priceDisplay}
              <p><strong>Condition:</strong> <span>${vehicle.condition_type}</span></p>
              <div class="contact-info">
                <p><strong>Phone:</strong> <a href="tel:${vehicle.contact_phone.replace(/\s+/g, '')}">${vehicle.contact_phone}</a></p>
              </div>
              <a href="https://wa.me/${vehicle.contact_phone.replace(/[^0-9]/g, '')}" class="button" style="width:100%; text-align:center; box-sizing:border-box;">Inquire on WhatsApp</a>
            </div>
          </div>`;
      }).join('');

      setupCarouselAndZoom();
    })
    .catch(err => console.error("Fetch Error:", err));
});

function setupCarouselAndZoom() {
  const overlay = document.getElementById('image-zoom-overlay');
  const zoomImg = overlay?.querySelector('img');

  // Single Global Event Listener (Event Delegation) for efficiency
  document.addEventListener('click', (e) => {
    // Zoom Logic
    const img = e.target.closest('.vehicle-images img');
    if (img && overlay) {
      zoomImg.src = img.src;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      window.history.pushState({ zoomed: true }, "");
    }

    // Dot Navigation Logic
    const btn = e.target.closest('.dot-btn');
    if (btn) {
      const container = document.querySelector(`.vehicle-images[data-vehicle-id="${btn.dataset.vehicle}"]`);
      if (container) {
        container.scrollTo({
          left: container.offsetWidth * btn.dataset.index,
          behavior: 'smooth'
        });
      }
    }
  });

  const closeZoom = () => {
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  overlay?.addEventListener('click', () => window.history.state?.zoomed ? window.history.back() : closeZoom());
  window.addEventListener('popstate', closeZoom);
}
