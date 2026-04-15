document.addEventListener('DOMContentLoaded', () => {
  // 1. BACKUP DATA (In case fetch is blocked by browser security)
  const backupVehicles = [
    {
      "id": "v001",
      "name": "Toyota Prius Hybrid",
      "price_ksh": "1,850,000",
      "condition_type": "Foreign Used",
      "contact_phone": "+254 757 782887",
      "images": ["images/prius1.jpg", "images/prius2.jpg"]
    }
  ];

  // 2. FETCH VEHICLE DATA
  fetch('data/vehicles.json')
    .then(response => {
      if (!response.ok) throw new Error('Could not load vehicles.json');
      return response.json();
    })
    .then(vehicles => renderVehicles(vehicles))
    .catch(err => {
      console.warn("Using backup blueprint data.");
      renderVehicles(backupVehicles);
    });
});

function renderVehicles(vehicles) {
  const container = document.getElementById('vehicle-cards-container');
  if (!container) return;
  container.innerHTML = ''; // Clear loading text

  vehicles.forEach(vehicle => {
    const vehicleCard = document.createElement('div');
    vehicleCard.classList.add('vehicle-card');

    // Gallery HTML (Blueprint Logic)
    let imageHtml = `<div class="vehicle-images" data-vehicle-id="${vehicle.id}">`;
    vehicle.images.forEach(img => {
      imageHtml += `<img src="${img}" class="zoomable" alt="${vehicle.name}">`;
    });
    imageHtml += '</div><div class="image-nav">';
    
    // Dot Buttons (Blueprint Logic)
    vehicle.images.forEach((_, i) => {
      imageHtml += `<button data-index="${i}" data-vehicle="${vehicle.id}" class="dot-btn"></button>`;
    });
    imageHtml += '</div>';

    // WhatsApp Link Generation
    const cleanPhone = vehicle.contact_phone.replace(/\D/g, '');
    const whatsappMsg = encodeURIComponent(`Hello TBAG, I am interested in the ${vehicle.name} seen on your website.`);

    // SOLD FEATURE LOGIC
    let priceSection = '';
    if (vehicle.price_ksh && vehicle.price_ksh.toString().toUpperCase().includes("SOLD")) {
      priceSection = `
        <div class="sold-container">
          <div class="sold-marquee">SOLD — UNIT UNAVAILABLE — VISIT DEALER FOR SIMILAR UNITS</div>
        </div>`;
    } else {
      priceSection = `<p><strong>Price:</strong> <span>KES ${vehicle.price_ksh}</span></p>`;
    }

    vehicleCard.innerHTML = `
      <div class="vehicle-details">
        <h3>${vehicle.name}</h3>
        ${imageHtml}
        ${priceSection}
        <p><strong>Condition:</strong> <span>${vehicle.condition_type}</span></p>
        <div class="contact-info">
          <p><strong>Phone:</strong> ${vehicle.contact_phone}</p>
          <a href="https://wa.me/${cleanPhone}?text=${whatsappMsg}" target="_blank" class="button" style="background-color: #25D366; display: flex; align-items: center; justify-content: center; gap: 8px;">
            Chat on WhatsApp
          </a>
        </div>
      </div>
    `;
    container.appendChild(vehicleCard);
  });

  setupCarouselAndZoom();
}

function setupCarouselAndZoom() {
  const overlay = document.getElementById('image-zoom-overlay');
  const zoomImg = overlay ? overlay.querySelector('img') : null;
  if (!overlay || !zoomImg) return; 

  /* --- PINCH-TO-ZOOM & BACK BUTTON LOGIC --- */
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.vehicle-images img');
    if (!img) return;

    zoomImg.src = img.src;
    zoomImg.style.transform = "scale(1)"; // Reset zoom level
    overlay.style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 

    // Handle Back Button
    window.history.pushState({ zoomed: true }, "");
  });

  const closeZoomView = () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    zoomImg.style.transform = "scale(1)";
  };

  // Close when clicking background
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      if (window.history.state && window.history.state.zoomed) {
        window.history.back();
      } else {
        closeZoomView();
      }
    }
  });

  // Hardware Back Button listener
  window.addEventListener('popstate', closeZoomView);

  // Double Tap to Zoom Toggle (For Mobile)
  let lastTap = 0;
  zoomImg.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    if (now - lastTap < 300) {
      zoomImg.style.transform = (zoomImg.style.transform === "scale(2)") ? "scale(1)" : "scale(2)";
      e.preventDefault();
    }
    lastTap = now;
  });

  /* --- DOT NAVIGATION (Blueprint Logic) --- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.image-nav button');
    if (!btn) return;

    const vehicleId = btn.dataset.vehicle;
    const index = btn.dataset.index;
    const container = document.querySelector(`.vehicle-images[data-vehicle-id="${vehicleId}"]`);
    
    if (container) {
      container.scrollTo({
        left: container.offsetWidth * index,
        behavior: 'smooth'
      });
    }
  });
}
