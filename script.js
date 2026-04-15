let allVehicles = [];

document.addEventListener('DOMContentLoaded', () => {
  fetch('data/vehicles.json')
    .then(response => {
      if (!response.ok) throw new Error('Could not load vehicles.json');
      return response.json();
    })
    .then(vehicles => {
      allVehicles = vehicles;
      updateStats(vehicles);
      renderVehicles(vehicles);
      setupFilters();
    })
    .catch(err => console.error("Fetch Error:", err));
});

function updateStats(vehicles) {
    const total = vehicles.length;
    const sold = vehicles.filter(v => v.price_ksh?.toString().toUpperCase() === "SOLD").length;
    document.getElementById('total-count').textContent = total;
    document.getElementById('available-count').textContent = total - sold;
    document.getElementById('sold-count').textContent = sold;
}

function renderVehicles(vehicles) {
  const container = document.getElementById('vehicle-cards-container');
  container.innerHTML = ''; 

  vehicles.forEach(vehicle => {
    const card = document.createElement('div');
    card.classList.add('vehicle-card');
    const isSold = vehicle.price_ksh?.toString().toUpperCase() === "SOLD";
    const cleanPhone = vehicle.contact_phone.replace(/\D/g, '');

    // Blueprint Dot Navigation HTML
    let imageHtml = `<div class="vehicle-images" data-vehicle-id="${vehicle.id}">`;
    vehicle.images.forEach(img => { imageHtml += `<img src="${img}" class="zoomable">`; });
    imageHtml += '</div><div class="image-nav">';
    vehicle.images.forEach((_, i) => {
      imageHtml += `<button data-index="${i}" data-vehicle="${vehicle.id}" class="dot-btn"></button>`;
    });
    imageHtml += '</div>';

    let priceSection = isSold ? 
        `<div class="sold-container"><div class="sold-marquee">SOLD — UNIT UNAVAILABLE</div></div>` : 
        `<p><strong>Price:</strong> <span>KES ${vehicle.price_ksh}</span></p>`;

    card.innerHTML = `
      <div class="vehicle-details">
        <h3>${vehicle.name}</h3>
        ${imageHtml}
        ${priceSection}
        <p><strong>Condition:</strong> <span>${vehicle.condition_type}</span></p>
        <div class="contact-info">
          <p><strong>Phone:</strong> ${vehicle.contact_phone}</p>
          <a href="https://wa.me/${cleanPhone}?text=I'm interested in ${vehicle.name}" target="_blank" class="button" style="background-color:#25D366;">Chat on WhatsApp</a>
        </div>
      </div>`;
    container.appendChild(card);
  });
  setupCarouselAndZoom();
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            const f = btn.dataset.filter;
            const filtered = allVehicles.filter(v => {
                const isSold = v.price_ksh?.toString().toUpperCase() === "SOLD";
                const fuel = (v.fuel || "").toLowerCase();
                if (f === 'all') return true;
                if (f === 'available') return !isSold;
                if (f === 'sold') return isSold;
                return fuel === f;
            });
            renderVehicles(filtered);
        });
    });
}

function setupCarouselAndZoom() {
  const overlay = document.getElementById('image-zoom-overlay');
  const zoomImg = overlay.querySelector('img');

  // Zoom / Back Button Logic
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.zoomable');
    if (img) {
        zoomImg.src = img.src;
        zoomImg.style.transform = "scale(1)";
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        window.history.pushState({ zoomed: true }, "");
    }
  });

  const closeView = () => { overlay.style.display = 'none'; document.body.style.overflow = ''; };

  overlay.addEventListener('click', () => {
      if (window.history.state?.zoomed) window.history.back(); else closeView();
  });

  window.addEventListener('popstate', closeView);

  // Dot Navigation (Blueprint Logic)
  document.querySelectorAll('.dot-btn').forEach(btn => {
    btn.onclick = () => {
        const container = document.querySelector(`.vehicle-images[data-vehicle-id="${btn.dataset.vehicle}"]`);
        container.scrollTo({ left: container.offsetWidth * btn.dataset.index, behavior: 'smooth' });
    };
  });
}
