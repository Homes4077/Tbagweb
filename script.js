// 1. DATA FALLBACK (Ensures cars show up instantly)
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
    // Attempt to fetch from file, fallback to array if blocked
    fetch('data/vehicles.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => renderVehicles(data))
        .catch(() => renderVehicles(vehicleData));
});

function renderVehicles(vehicles) {
    const container = document.getElementById('vehicle-cards-container');
    if (!container) return;
    container.innerHTML = ''; 

    // Update Stats Bar
    const total = vehicles.length;
    const sold = vehicles.filter(v => v.price_ksh.toString().toUpperCase() === 'SOLD').length;
    document.getElementById('total-count').textContent = total;
    document.getElementById('available-count').textContent = total - sold;
    document.getElementById('sold-count').textContent = sold;

    vehicles.forEach(vehicle => {
        const isSold = vehicle.price_ksh.toString().toUpperCase() === "SOLD";
        const fuel = (vehicle.fuel || "Petrol").toLowerCase();
        const cleanPhone = vehicle.contact_phone.replace(/\D/g, '');
        const whatsappMsg = encodeURIComponent(`Hello TBAG, I'm interested in the ${vehicle.name}.`);

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
                       <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="18" height="18"> Chat on WhatsApp
                    </a>
                </div>
            </div>`;
        container.appendChild(card);
    });

    setupFilters();
    setupZoom(); // <--- This activates the zoom
}

function setupZoom() {
    const overlay = document.getElementById('image-zoom-overlay');
    const zoomImg = overlay.querySelector('img');

    // Attach click event to all images with class 'zoomable'
    document.querySelectorAll('.zoomable').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            zoomImg.src = img.src;
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Stop scrolling when zoomed
        });
    });

    // Close zoom when clicking the background
    overlay.addEventListener('click', () => {
        overlay.style.display = 'none';
        document.body.style.overflow = ''; 
    });
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            document.querySelectorAll('.vehicle-card').forEach(card => {
                const sold = card.dataset.sold === 'true';
                const fuel = card.dataset.fuel;
                const show = (filter === 'all') || (filter === 'available' && !sold) || (filter === 'sold' && sold) || (filter === fuel);
                card.style.display = show ? 'block' : 'none';
            });
        });
    });
}
