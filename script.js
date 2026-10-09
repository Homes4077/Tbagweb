// 1. VEHICLE DATA (Fallback Array)
const vehicleData = [
    {
        "id": "v001",
        "name": "Toyota Prius Hybrid",
        "fuel": "Hybrid",
        "status": "available",
        "price": 1850000,
        "condition": "Foreign Used",
        "contact_phone": "+254757782887",
        "images": ["images/prius1.jpg", "images/prius2.jpg"]
    },
    {
        "id": "v002",
        "name": "Honda Fit Hybrid",
        "fuel": "Hybrid",
        "status": "available",
        "price": 1450000,
        "condition": "Foreign Used",
        "contact_phone": "+254757782887",
        "images": ["images/fit1.jpg", "images/fit2.jpg"]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Fixed path: data/vehicle.json (no 's')
    fetch('data/vehicle.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => renderVehicles(data))
        .catch((err) => {
            console.warn("Fetch failed, using fallback vehicleData", err);
            renderVehicles(vehicleData);
        });
});

function renderVehicles(vehicles) {
    const container = document.getElementById('vehicle-cards-container');
    if (!container) return;
    container.innerHTML = ''; 

    const total = vehicles.length;

    // Checks status field directly or checks if legacy price_ksh was 'SOLD'
    const isVehicleSold = (v) => {
        if (v.status) return v.status.toLowerCase() === 'sold';
        if (v.price_ksh) return v.price_ksh.toString().toUpperCase().includes('SOLD');
        return !v.price; // Sold if no price exists
    };

    const soldCount = vehicles.filter(isVehicleSold).length;

    if (document.getElementById('total-count')) document.getElementById('total-count').textContent = total;
    if (document.getElementById('available-count')) document.getElementById('available-count').textContent = total - soldCount;
    if (document.getElementById('sold-count')) document.getElementById('sold-count').textContent = soldCount;

    vehicles.forEach(vehicle => {
        const isSold = isVehicleSold(vehicle);
        const fuel = (vehicle.fuel || "Petrol").toLowerCase();
        
        // Handles new price (Number) vs old price_ksh (String) format safely
        let priceDisplay = '';
        if (vehicle.price) {
            priceDisplay = `KES ${Number(vehicle.price).toLocaleString()}`;
        } else if (vehicle.price_ksh && !isSold) {
            priceDisplay = `KES ${vehicle.price_ksh}`;
        }

        // Handles new 'condition' key vs old 'condition_type' key
        const conditionText = vehicle.condition || vehicle.condition_type || 'Used';

        const phone = vehicle.contact_phone || '+254757782887';
        const cleanPhone = phone.replace(/\D/g, '');
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
                    ${(vehicle.images || []).map(img => `<img src="${img}" class="zoomable" alt="${vehicle.name}">`).join('')}
                </div>
                ${isSold 
                    ? `<div class="sold-container"><div class="sold-marquee">SOLD</div></div>` 
                    : `<p><strong>Price:</strong> <span>${priceDisplay}</span></p>`
                }
                <p><strong>Condition:</strong> <span>${conditionText}</span></p>
                <div class="contact-info">
                    <p><strong>Phone:</strong> ${phone}</p>
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
    if (!overlay) return;
    const zoomImg = overlay.querySelector('img');

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('zoomable')) {
            zoomImg.src = e.target.src;
            overlay.style.display = 'flex';
            zoomImg.style.transform = "scale(1)"; 
            window.history.pushState({ zoomed: true }, "");
        }
    });

    const closeZoom = () => {
        overlay.style.display = 'none';
        zoomImg.style.transform = "scale(1)";
    };

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            if (window.history.state && window.history.state.zoomed) {
                window.history.back();
            } else {
                closeZoom();
            }
        }
    });

    let lastTap = 0;
    if (zoomImg) {
        zoomImg.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                zoomImg.style.transform = zoomImg.style.transform === "scale(2)" ? "scale(1)" : "scale(2)";
                e.preventDefault();
            }
            lastTap = currentTime;
        });
    }

    window.addEventListener('popstate', () => closeZoom());
}

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            const activeBtn = document.querySelector('.filter-btn.active');
            if (activeBtn) activeBtn.classList.remove('active');
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
