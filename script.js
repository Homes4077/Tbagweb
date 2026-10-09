// 1. VEHICLE DATA (Fallback Array)
const vehicleData = [
    {
        "id": 1,
        "name": "Toyota Prius Hybrid",
        "fuel": "Hybrid",
        "price_ksh": "1,850,000",
        "condition_type": "Foreign Used",
        "contact_phone": "+254757782887",
        "images": ["images/prius1.jpg", "images/prius2.jpg"]
    },
    {
        "id": 2,
        "name": "Honda Fit Hybrid",
        "fuel": "Hybrid",
        "price_ksh": "1,450,000",
        "condition_type": "Foreign Used",
        "contact_phone": "+254757782887",
        "images": ["images/fit1.jpg", "images/fit2.jpg"]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/vehicles.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => renderVehicles(data))
        .catch(() => renderVehicles(vehicleData));
});

function renderVehicles(vehicles) {
    const container = document.getElementById('vehicle-cards-container');
    if (!container) return;
    container.innerHTML = ''; 

    const total = vehicles.length;
    const sold = vehicles.filter(v => v.price_ksh.toString().toUpperCase() === 'SOLD').length;
    document.getElementById('total-count').textContent = total;
    document.getElementById('available-count').textContent = total - sold;
    document.getElementById('sold-count').textContent = sold;

    vehicles.forEach(vehicle => {
        const isSold = vehicle.price_ksh.toString().toUpperCase() === "SOLD";
        const fuel = (vehicle.fuel || "Petrol").toLowerCase();
        const cleanPhone = vehicle.contact_phone.replace(/\D/g, '');
        const whatsappMsg = encodeURIComponent(`Hello Cyrus, I am interested in the ${vehicle.name}.`);

        const card = document.createElement('div');
        card.className = 'vehicle-card';
        card.dataset.sold = isSold;
        card.dataset.fuel = fuel;

        card.innerHTML = `
            <div class="vehicle-details">
                <h3>${vehicle.name}</h3>
                <div class="vehicle-images">
                    <span class="fuel-badge fuel-${fuel}">${vehicle.fuel}</span>
                    ${vehicle.images.map(img => `<img src="${img}" class="zoomable" alt="${vehicle.name}">`).join('')}
                </div>
                ${isSold ? `<div class="sold-container"><div class="sold-marquee">SOLD</div></div>` : `<p><strong>Price:</strong> <span>KES ${vehicle.price_ksh}</span></p>`}
                <p><strong>Condition:</strong> <span>${vehicle.condition_type}</span></p>
                <div class="contact-info">
                    <p><strong>Phone:</strong> ${vehicle.contact_phone}</p>
                    <a href="https://wa.me/${cleanPhone}?text=${whatsappMsg}" target="_blank" class="button" style="background-color: #25D366; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px;">
                       Chat on WhatsApp
                    </a>
                </div>
            </div>`;
        container.appendChild(card);
    });

    setupFilters();
    setupZoom(); 
}

function setupZoom() {
    const overlay = document.getElementById('image-zoom-overlay');
    const zoomImg = overlay.querySelector('img');

    // Handle clicks to open zoom
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('zoomable')) {
            zoomImg.src = e.target.src;
            overlay.style.display = 'flex';
            
            // Allow zooming via touch
            zoomImg.style.transform = "scale(1)"; 
            
            // History state for back button
            window.history.pushState({ zoomed: true }, "");
        }
    });

    const closeZoom = () => {
        overlay.style.display = 'none';
        zoomImg.style.transform = "scale(1)";
    };

    // Close only if clicking the background area, not the image itself
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            if (window.history.state && window.history.state.zoomed) {
                window.history.back();
            } else {
                closeZoom();
            }
        }
    });

    // Mobile Zoom Support: Double tap to toggle zoom
    let lastTap = 0;
    zoomImg.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
            if (zoomImg.style.transform === "scale(2)") {
                zoomImg.style.transform = "scale(1)";
            } else {
                zoomImg.style.transform = "scale(2)";
            }
            e.preventDefault();
        }
        lastTap = currentTime;
    });

    window.addEventListener('popstate', (e) => {
        closeZoom();
    });
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            document.querySelectorAll('.vehicle-card').forEach(card => {
                const sold = card.dataset.sold === 'true';
                const fuel = card.dataset.fuel;
                const show = (filter === 'all') || (filter === 'available' && !sold) || (filter === 'sold' && sold) || (filter === fuel);
                card.style.display = show ? 'block' : 'none';
            });
        };
    });
}
