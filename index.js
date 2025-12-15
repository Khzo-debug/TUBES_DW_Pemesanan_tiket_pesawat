document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    const departureDate = document.getElementById('departureDate');
    const returnDate = document.getElementById('returnDate');
    
    if (departureDate) {
        departureDate.min = today;
        departureDate.value = today;
    }
    
    if (returnDate) {
        returnDate.min = today;
    }
    
    const passengersInput = document.getElementById('passengers');
    const decreaseBtn = document.getElementById('decreasePassengers');
    const increaseBtn = document.getElementById('increasePassengers');
    
    if (decreaseBtn && increaseBtn && passengersInput) {
        decreaseBtn.addEventListener('click', function() {
            let current = parseInt(passengersInput.value);
            if (current > 1) {
                passengersInput.value = current - 1;
            }
        });
        
        increaseBtn.addEventListener('click', function() {
            let current = parseInt(passengersInput.value);
            if (current < 10) {
                passengersInput.value = current + 1;
            }
        });
    }
    
    const flightSearchForm = document.getElementById('flightSearchForm');
    if (flightSearchForm) {
        flightSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const origin = document.getElementById('origin').value;
            const destination = document.getElementById('destination').value;
            
            if (!origin || !destination) {
                alert('Harap isi kota asal dan tujuan');
                return;
            }
            
            if (origin === destination) {
                alert('Kota asal dan tujuan tidak boleh sama');
                return;
            }
            
            const loading = document.getElementById('loading');
            const flightsContainer = document.getElementById('flightsContainer');
            const noResults = document.getElementById('noResults');
            
            if (loading) loading.style.display = 'block';
            if (flightsContainer) flightsContainer.innerHTML = '';
            if (noResults) noResults.style.display = 'none';
            
            setTimeout(() => {
                generateSampleFlights();
                if (loading) loading.style.display = 'none';
            }, 1500);
        });
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (flightSearchForm) flightSearchForm.reset();
            if (departureDate) departureDate.value = today;
            if (returnDate) returnDate.value = '';
            if (passengersInput) passengersInput.value = '1';
            
            const flightsContainer = document.getElementById('flightsContainer');
            const noResults = document.getElementById('noResults');
            
            if (flightsContainer) flightsContainer.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
        });
    }
    
    function generateSampleFlights() {
        const flightsContainer = document.getElementById('flightsContainer');
        if (!flightsContainer) return;
        
        const airlines = [
            { name: 'Garuda Indonesia', code: 'GA' },
            { name: 'Lion Air', code: 'JT' },
            { name: 'AirAsia', code: 'QZ' },
            { name: 'Citilink', code: 'QG' }
        ];
        
        const flights = [];
        
        for (let i = 0; i < 4; i++) {
            const airline = airlines[i];
            const departureTime = new Date();
            departureTime.setHours(6 + i * 4);
            departureTime.setMinutes(0);
            
            const arrivalTime = new Date(departureTime.getTime() + (2 + i) * 60 * 60 * 1000);
            
            const flight = {
                id: i + 1,
                airline: airline.name,
                code: airline.code,
                flightNumber: `${airline.code}${100 + i}`,
                departureTime: departureTime.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                arrivalTime: arrivalTime.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }),
                duration: `${2 + i} jam`,
                price: 500000 + (i * 250000),
                seats: Math.floor(Math.random() * 10) + 5
            };
            
            flights.push(flight);
        }
        
        flightsContainer.innerHTML = flights.map(flight => `
            <div class="flight-card">
                <div class="flight-airline">
                    <div class="airline-logo">
                        <i class="fas fa-plane"></i>
                    </div>
                    <div class="airline-name">${flight.airline}</div>
                    <div class="flight-number">${flight.flightNumber}</div>
                </div>
                <div class="flight-details">
                    <div class="route">
                        <div class="departure">
                            <div class="time">${flight.departureTime}</div>
                            <div class="airport-code">CGK</div>
                            <div class="airport-name">Jakarta</div>
                        </div>
                        <div class="duration">
                            <div>${flight.duration}</div>
                            <div class="duration-line"></div>
                            <div>Langsung</div>
                        </div>
                        <div class="arrival">
                            <div class="time">${flight.arrivalTime}</div>
                            <div class="airport-code">DPS</div>
                            <div class="airport-name">Bali</div>
                        </div>
                    </div>
                    <div class="flight-price">
                        <div class="price">Rp ${flight.price.toLocaleString('id-ID')}</div>
                        <div class="per-passenger">per penumpang</div>
                        <div class="seats-available">${flight.seats} kursi tersisa</div>
                        <button class="select-btn" onclick="selectFlight(${flight.id})">Pilih</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            alert('Fitur sorting akan diimplementasikan');
        });
    }
});

function selectFlight(flightId) {
    alert(`Anda memilih penerbangan dengan ID: ${flightId}\n\nFitur pemesanan lengkap akan diimplementasikan.`);
}