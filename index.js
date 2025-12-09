// API Configuration
const API_KEY = 'YOUR_API_KEY_HERE'; // Ganti dengan API key Anda
const API_BASE_URL = 'http://api.aviationstack.com/v1/flights';

// DOM Elements
const flightSearchForm = document.getElementById('flightSearchForm');
const flightsContainer = document.getElementById('flightsContainer');
const noResults = document.getElementById('noResults');
const loading = document.getElementById('loading');
const sortBy = document.getElementById('sortBy');
const resetBtn = document.getElementById('resetBtn');
const testApiBtn = document.getElementById('testApiBtn');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const decreasePassengersBtn = document.getElementById('decreasePassengers');
const increasePassengersBtn = document.getElementById('increasePassengers');
const passengersInput = document.getElementById('passengers');

// State variables
let flightsData = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('departureDate').min = today;
    document.getElementById('returnDate').min = today;
    
    // Set default departure date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('departureDate').value = tomorrow.toISOString().split('T')[0];
    
    // Set default return date to 3 days from now
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 3);
    document.getElementById('returnDate').value = returnDate.toISOString().split('T')[0];
    
    // Initialize event listeners
    initEventListeners();
});

// Initialize all event listeners
function initEventListeners() {
    // Form submission
    flightSearchForm.addEventListener('submit', handleFormSubmit);
    
    // Sort flights
    sortBy.addEventListener('change', sortFlights);
    
    // Reset form
    resetBtn.addEventListener('click', resetForm);
    
    // Test API connection
    testApiBtn.addEventListener('click', testApiConnection);
    
    // Load sample data
    loadSampleBtn.addEventListener('click', loadSampleData);
    
    // Passenger counter
    decreasePassengersBtn.addEventListener('click', () => adjustPassengers(-1));
    increasePassengersBtn.addEventListener('click', () => adjustPassengers(1));
    
    // Auto-fill origin and destination on click (for demo purposes)
    document.getElementById('origin').addEventListener('click', function() {
        if (!this.value) this.value = 'Jakarta (CGK)';
    });
    
    document.getElementById('destination').addEventListener('click', function() {
        if (!this.value) this.value = 'Bali (DPS)';
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departureDate = document.getElementById('departureDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const passengers = document.getElementById('passengers').value;
    const flightClass = document.getElementById('class').value;
    
    // Show loading
    showLoading(true);
    
    try {
        // Extract airport codes (assuming format: "City (CODE)")
        const originMatch = origin.match(/\(([A-Z]{3})\)/);
        const destinationMatch = destination.match(/\(([A-Z]{3})\)/);
        
        if (!originMatch || !destinationMatch) {
            throw new Error('Format kota tidak valid. Gunakan format: "Kota (KODE)"');
        }
        
        const originCode = originMatch[1];
        const destinationCode = destinationMatch[1];
        
        // Fetch flights from API
        await fetchFlights(originCode, destinationCode, departureDate);
        
    } catch (error) {
        console.error('Error fetching flights:', error);
        showError('Terjadi kesalahan saat mencari penerbangan: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Fetch flights from AviationStack API
async function fetchFlights(origin, destination, date) {
    // In a real app, you would use the actual API
    // For demo purposes, we'll use sample data
    console.log(`Fetching flights from ${origin} to ${destination} on ${date}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if we have a valid API key
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        // Use sample data if no API key is configured
        loadSampleData();
        return;
    }
    
    // Real API call (commented out for demo)
    /*
    const params = new URLSearchParams({
        access_key: API_KEY,
        dep_iata: origin,
        arr_iata: destination,
        flight_date: date,
        limit: 10
    });
    
    try {
        const response = await fetch(`${API_BASE_URL}?${params}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.info || 'API error');
        }
        
        if (data.data && data.data.length > 0) {
            flightsData = processFlightData(data.data);
            renderFlights(flightsData);
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to sample data
        loadSampleData();
    }
    */
}

// Process API flight data
function processFlightData(apiData) {
    return apiData.map(flight => {
        const departure = new Date(flight.departure.scheduled);
        const arrival = new Date(flight.arrival.scheduled);
        const durationMs = arrival - departure;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        // Generate random price based on airline and class
        const basePrice = 500000 + Math.random() * 3000000;
        const classMultiplier = {
            economy: 1,
            premium_economy: 1.5,
            business: 2.5,
            first: 4
        }[document.getElementById('class').value] || 1;
        
        const price = Math.round(basePrice * classMultiplier / 10000) * 10000;
        
        return {
            airline: flight.airline.name || 'Unknown Airline',
            airlineCode: flight.airline.iata || 'N/A',
            flightNumber: flight.flight.iata || 'N/A',
            departure: {
                airport: flight.departure.airport || 'Unknown Airport',
                iata: flight.departure.iata || 'N/A',
                scheduled: departure,
                time: departure.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                terminal: flight.departure.terminal || 'T1'
            },
            arrival: {
                airport: flight.arrival.airport || 'Unknown Airport',
                iata: flight.arrival.iata || 'N/A',
                scheduled: arrival,
                time: arrival.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                terminal: flight.arrival.terminal || 'T1'
            },
            duration: {
                hours: durationHours,
                minutes: durationMinutes,
                formatted: `${durationHours}j ${durationMinutes}m`
            },
            price: price,
            currency: 'IDR',
            class: document.getElementById('class').value,
            seats: Math.floor(Math.random() * 10) + 5 // Random seats available
        };
    });
}

// Render flights to the DOM
function renderFlights(flights) {
    if (!flights || flights.length === 0) {
        showNoResults();
        return;
    }
    
    // Hide no results message
    noResults.style.display = 'none';
    
    // Clear previous results
    flightsContainer.innerHTML = '';
    
    // Create flight cards
    flights.forEach(flight => {
        const flightCard = document.createElement('div');
        flightCard.className = 'flight-card';
        
        flightCard.innerHTML = `
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
                        <div class="time">${flight.departure.time}</div>
                        <div class="airport-code">${flight.departure.iata}</div>
                        <div class="airport-name">${flight.departure.airport}</div>
                        <div class="terminal">Terminal ${flight.departure.terminal}</div>
                    </div>
                    <div class="duration">
                        <div>${flight.duration.formatted}</div>
                        <div class="duration-line"></div>
                        <div>Langsung</div>
                    </div>
                    <div class="arrival">
                        <div class="time">${flight.arrival.time}</div>
                        <div class="airport-code">${flight.arrival.iata}</div>
                        <div class="airport-name">${flight.arrival.airport}</div>
                        <div class="terminal">Terminal ${flight.arrival.terminal}</div>
                    </div>
                </div>
                <div class="flight-price">
                    <div class="price">Rp ${flight.price.toLocaleString('id-ID')}</div>
                    <div class="per-passenger">per penumpang</div>
                    <div class="seats-available">${flight.seats} kursi tersisa</div>
                    <button class="select-btn">Pilih</button>
                </div>
            </div>
        `;
        
        // Add event listener to select button
        const selectBtn = flightCard.querySelector('.select-btn');
        selectBtn.addEventListener('click', () => selectFlight(flight));
        
        flightsContainer.appendChild(flightCard);
    });
}

// Show loading state
function showLoading(isLoading) {
    loading.style.display = isLoading ? 'block' : 'none';
    flightsContainer.style.display = isLoading ? 'none' : 'block';
    
    if (isLoading) {
        noResults.style.display = 'none';
    }
}

// Show no results message
function showNoResults() {
    flightsContainer.innerHTML = '';
    noResults.style.display = 'block';
}

// Show error message
function showError(message) {
    flightsContainer.innerHTML = `
        <div class="no-results">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>Terjadi Kesalahan</h4>
            <p>${message}</p>
        </div>
    `;
}

// Sort flights based on selected criteria
function sortFlights() {
    if (flightsData.length === 0) return;
    
    const sortValue = sortBy.value;
    
    const sortedFlights = [...flightsData].sort((a, b) => {
        switch(sortValue) {
            case 'price':
                return a.price - b.price;
            case 'duration':
                const durationA = a.duration.hours * 60 + a.duration.minutes;
                const durationB = b.duration.hours * 60 + b.duration.minutes;
                return durationA - durationB;
            case 'departure':
                return a.departure.scheduled - b.departure.scheduled;
            default:
                return 0;
        }
    });
    
    renderFlights(sortedFlights);
}

// Reset form to default values
function resetForm() {
    flightSearchForm.reset();
    
    // Reset dates to default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('departureDate').value = tomorrow.toISOString().split('T')[0];
    
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 3);
    document.getElementById('returnDate').value = returnDate.toISOString().split('T')[0];
    
    // Reset flights display
    flightsData = [];
    flightsContainer.innerHTML = '';
    noResults.style.display = 'block';
}

// Adjust passenger count
function adjustPassengers(change) {
    let current = parseInt(passengersInput.value);
    let newValue = current + change;
    
    if (newValue >= 1 && newValue <= 10) {
        passengersInput.value = newValue;
    }
}

// Select a flight (for demo purposes)
function selectFlight(flight) {
    alert(`Anda memilih penerbangan ${flight.airline} ${flight.flightNumber}\n` +
          `Dari: ${flight.departure.airport} (${flight.departure.iata})\n` +
          `Ke: ${flight.arrival.airport} (${flight.arrival.iata})\n` +
          `Harga: Rp ${flight.price.toLocaleString('id-ID')}\n\n` +
          `Fitur pemesanan lengkap akan diimplementasikan dalam versi lengkap.`);
}

// Test API connection
async function testApiConnection() {
    alert('Untuk menggunakan API sebenarnya:\n\n' +
          '1. Daftar di aviationstack.com untuk mendapatkan API key\n' +
          '2. Ganti "YOUR_API_KEY_HERE" di file script.js dengan API key Anda\n' +
          '3. Hapus komentar pada kode fetchFlights() untuk menggunakan API asli\n\n' +
          'Saat ini aplikasi menggunakan data contoh untuk demonstrasi.');
}

// Load sample flight data
function loadSampleData() {
    showLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
        flightsData = generateSampleData();
        renderFlights(flightsData);
        showLoading(false);
    }, 1000);
}

// Generate sample flight data
function generateSampleData() {
    const airlines = [
        { name: 'Garuda Indonesia', code: 'GA' },
        { name: 'Lion Air', code: 'JT' },
        { name: 'AirAsia', code: 'QZ' },
        { name: 'Citilink', code: 'QG' },
        { name: 'Batik Air', code: 'ID' },
        { name: 'Singapore Airlines', code: 'SQ' }
    ];
    
    const origins = [
        { airport: 'Soekarno-Hatta', iata: 'CGK', city: 'Jakarta' },
        { airport: 'Juanda', iata: 'SUB', city: 'Surabaya' },
        { airport: 'Ngurah Rai', iata: 'DPS', city: 'Bali' }
    ];
    
    const destinations = [
        { airport: 'Ngurah Rai', iata: 'DPS', city: 'Bali' },
        { airport: 'Juanda', iata: 'SUB', city: 'Surabaya' },
        { airport: 'Soekarno-Hatta', iata: 'CGK', city: 'Jakarta' },
        { airport: 'Kuala Namu', iata: 'KNO', city: 'Medan' },
        { airport: 'Hasanuddin', iata: 'UPG', city: 'Makassar' }
    ];
    
    const flightClass = document.getElementById('class').value;
    const classMultiplier = {
        economy: 1,
        premium_economy: 1.5,
        business: 2.5,
        first: 4
    }[flightClass] || 1;
    
    const sampleFlights = [];
    
    for (let i = 0; i < 6; i++) {
        const airline = airlines[i % airlines.length];
        const origin = origins[Math.floor(Math.random() * origins.length)];
        const destination = destinations[Math.floor(Math.random() * destinations.length)];
        
        // Ensure origin and destination are different
        if (origin.iata === destination.iata) continue;
        
        // Generate random departure time (today between 6 AM and 10 PM)
        const departure = new Date();
        departure.setHours(6 + Math.floor(Math.random() * 16));
        departure.setMinutes(Math.floor(Math.random() * 60));
        
        // Generate arrival time (1.5 to 6 hours later)
        const durationHours = 1.5 + Math.random() * 4.5;
        const durationMinutes = Math.floor((durationHours % 1) * 60);
        const arrival = new Date(departure.getTime() + durationHours * 60 * 60 * 1000);
        
        // Generate price
        const basePrice = 500000 + Math.random() * 3000000;
        const price = Math.round(basePrice * classMultiplier / 10000) * 10000;
        
        sampleFlights.push({
            airline: airline.name,
            airlineCode: airline.code,
            flightNumber: `${airline.code}${Math.floor(100 + Math.random() * 900)}`,
            departure: {
                airport: origin.airport,
                iata: origin.iata,
                scheduled: departure,
                time: departure.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                terminal: `T${Math.floor(Math.random() * 3) + 1}`
            },
            arrival: {
                airport: destination.airport,
                iata: destination.iata,
                scheduled: arrival,
                time: arrival.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                terminal: `T${Math.floor(Math.random() * 3) + 1}`
            },
            duration: {
                hours: Math.floor(durationHours),
                minutes: durationMinutes,
                formatted: `${Math.floor(durationHours)}j ${durationMinutes}m`
            },
            price: price,
            currency: 'IDR',
            class: flightClass,
            seats: Math.floor(Math.random() * 10) + 5
        });
    }
    
    return sampleFlights;
}