// script.js - SEMUA JAVASCRIPT UNTUK SEMUA HALAMAN

// ==================== DATA GLOBAL ====================
const airlines = [
    { id: 1, name: 'Garuda Indonesia', code: 'GA', color: '#E41F26', logo: 'fas fa-plane' },
    { id: 2, name: 'Lion Air', code: 'JT', color: '#FF6B00', logo: 'fas fa-plane' },
    { id: 3, name: 'AirAsia', code: 'QZ', color: '#FF0000', logo: 'fas fa-plane' },
    { id: 4, name: 'Citilink', code: 'QG', color: '#FF8200', logo: 'fas fa-plane' },
    { id: 5, name: 'Batik Air', code: 'ID', color: '#6D2077', logo: 'fas fa-plane' },
    { id: 6, name: 'Singapore Airlines', code: 'SQ', color: '#004B87', logo: 'fas fa-plane' }
];

const routes = [
    { from: 'CGK', fromName: 'Jakarta', to: 'DPS', toName: 'Bali', duration: 120, price: 1500000 },
    { from: 'CGK', fromName: 'Jakarta', to: 'SUB', toName: 'Surabaya', duration: 90, price: 800000 },
    { from: 'CGK', fromName: 'Jakarta', to: 'UPG', toName: 'Makassar', duration: 150, price: 1800000 },
    { from: 'CGK', fromName: 'Jakarta', to: 'KNO', toName: 'Medan', duration: 180, price: 1200000 },
    { from: 'SUB', fromName: 'Surabaya', to: 'DPS', toName: 'Bali', duration: 60, price: 600000 },
    { from: 'SUB', fromName: 'Surabaya', to: 'CGK', toName: 'Jakarta', duration: 90, price: 800000 },
    { from: 'DPS', fromName: 'Bali', to: 'UPG', toName: 'Makassar', duration: 120, price: 1400000 },
    { from: 'DPS', fromName: 'Bali', to: 'KNO', toName: 'Medan', duration: 210, price: 1600000 }
];

const classes = [
    { id: 'economy', name: 'Ekonomi', multiplier: 1.0 },
    { id: 'premium_economy', name: 'Premium Ekonomi', multiplier: 1.5 },
    { id: 'business', name: 'Bisnis', multiplier: 2.5 },
    { id: 'first', name: 'First Class', multiplier: 4.0 }
];

// ==================== FUNGSI BANTUAN ====================
function getLocalStorageData() {
    return {
        searchHistory: JSON.parse(localStorage.getItem('searchHistory')) || [],
        favoriteFlights: JSON.parse(localStorage.getItem('favoriteFlights')) || [],
        bookingHistory: JSON.parse(localStorage.getItem('bookingHistory')) || [],
        userProfile: JSON.parse(localStorage.getItem('userProfile')) || {
            name: 'Guest User',
            email: 'guest@example.com',
            phone: '',
            address: '',
            joinDate: new Date().toISOString().split('T')[0],
            totalOrders: 0
        }
    };
}

function extractAirportCode(input) {
    const match = input.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : null;
}

function parseDuration(durationStr) {
    const match = durationStr.match(/(\d+)j\s*(\d+)?m?/);
    if (!match) return 0;
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    return hours * 60 + minutes;
}

function showMessage(message, type = 'info') {
    alert(message);
}

// ==================== FUNGSI HALAMAN INDEX ====================
function initDateInputs() {
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
}

function initPassengerCounter() {
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
}

function initFlightSearch() {
    const flightSearchForm = document.getElementById('flightSearchForm');
    if (flightSearchForm) {
        flightSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const origin = document.getElementById('origin').value;
            const destination = document.getElementById('destination').value;
            const date = document.getElementById('departureDate').value;
            const flightClass = document.getElementById('class').value;
            const passengers = document.getElementById('passengers').value;
            
            if (!origin || !destination) {
                showMessage('Harap isi kota asal dan tujuan', 'error');
                return;
            }
            
            if (origin === destination) {
                showMessage('Kota asal dan tujuan tidak boleh sama', 'error');
                return;
            }
            
            const originCode = extractAirportCode(origin);
            const destCode = extractAirportCode(destination);
            
            if (!originCode || !destCode) {
                showMessage('Format kota tidak valid. Gunakan format: "Kota (KODE)"', 'error');
                return;
            }
            
            const data = getLocalStorageData();
            const searchItem = {
                origin: originCode,
                destination: destCode,
                date: date,
                class: flightClass,
                passengers: passengers,
                timestamp: new Date().toISOString()
            };
            
            data.searchHistory.unshift(searchItem);
            if (data.searchHistory.length > 10) data.searchHistory.pop();
            localStorage.setItem('searchHistory', JSON.stringify(data.searchHistory));
            
            searchFlights(originCode, destCode, date, flightClass, passengers);
        });
    }
}

function initResetButton() {
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            const flightSearchForm = document.getElementById('flightSearchForm');
            const departureDate = document.getElementById('departureDate');
            const passengersInput = document.getElementById('passengers');
            
            if (flightSearchForm) flightSearchForm.reset();
            if (departureDate) departureDate.value = new Date().toISOString().split('T')[0];
            if (passengersInput) passengersInput.value = '1';
            
            const flightsContainer = document.getElementById('flightsContainer');
            const noResults = document.getElementById('noResults');
            
            if (flightsContainer) flightsContainer.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
        });
    }
}

function initSortOptions() {
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            const flightsContainer = document.getElementById('flightsContainer');
            const flightCards = flightsContainer.querySelectorAll('.flight-card');
            
            if (flightCards.length === 0) return;
            
            const flightsArray = Array.from(flightCards);
            const sortValue = sortBy.value;
            
            flightsArray.sort((a, b) => {
                const aPrice = parseInt(a.querySelector('.price').textContent.replace(/[^\d]/g, ''));
                const bPrice = parseInt(b.querySelector('.price').textContent.replace(/[^\d]/g, ''));
                const aTime = a.querySelector('.departure .time').textContent;
                const bTime = b.querySelector('.departure .time').textContent;
                
                switch(sortValue) {
                    case 'price':
                        return aPrice - bPrice;
                    case 'departure':
                        return aTime.localeCompare(bTime);
                    case 'duration':
                        const aDuration = a.querySelector('.duration div:first-child').textContent;
                        const bDuration = b.querySelector('.duration div:first-child').textContent;
                        return parseDuration(aDuration) - parseDuration(bDuration);
                    default:
                        return 0;
                }
            });
            
            flightsContainer.innerHTML = '';
            flightsArray.forEach(card => flightsContainer.appendChild(card));
        });
    }
}

function initAutoFill() {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    
    if (originInput) {
        originInput.addEventListener('click', function() {
            if (!this.value) {
                this.value = 'Jakarta (CGK)';
            }
        });
    }
    
    if (destinationInput) {
        destinationInput.addEventListener('click', function() {
            if (!this.value) {
                this.value = 'Bali (DPS)';
            }
        });
    }
}

function searchFlights(originCode, destCode, date, flightClass, passengers) {
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('noResults');
    
    showLoading(true);
    
    setTimeout(() => {
        const matchingRoute = routes.find(route => 
            route.from === originCode && route.to === destCode
        );
        
        if (!matchingRoute) {
            showNoResults();
            showLoading(false);
            return;
        }
        
        const flights = generateFlights(matchingRoute, date, flightClass, passengers);
        
        if (flights.length === 0) {
            showNoResults();
        } else {
            displayFlights(flights);
        }
        
        showLoading(false);
    }, 1000);
}

function generateFlights(route, date, flightClass, passengers) {
    const flights = [];
    const selectedClass = classes.find(c => c.id === flightClass);
    const passengerCount = parseInt(passengers) || 1;
    const data = getLocalStorageData();
    const favoriteFlights = data.favoriteFlights;
    
    const numFlights = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numFlights; i++) {
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        
        const hour = 6 + Math.floor(Math.random() * 17);
        const minute = Math.floor(Math.random() * 60) < 30 ? 0 : 30;
        
        const departureTime = new Date(date);
        departureTime.setHours(hour, minute, 0);
        
        const arrivalTime = new Date(departureTime.getTime() + route.duration * 60 * 1000);
        
        const basePrice = route.price * selectedClass.multiplier;
        const finalPrice = Math.round((basePrice * passengerCount) / 10000) * 10000;
        
        const seatsAvailable = 5 + Math.floor(Math.random() * 20);
        
        const departureTimeStr = departureTime.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const isFavorite = favoriteFlights.some(f => 
            f.airline === airline.name && 
            f.departure.code === route.from && 
            f.arrival.code === route.to &&
            f.departure.timeString === departureTimeStr
        );
        
        flights.push({
            id: Date.now() + i,
            airline: airline.name,
            airlineCode: airline.code,
            airlineColor: airline.color,
            airlineLogo: airline.logo,
            flightNumber: `${airline.code}${Math.floor(100 + Math.random() * 900)}`,
            departure: {
                airport: route.fromName,
                code: route.from,
                time: departureTime,
                timeString: departureTimeStr
            },
            arrival: {
                airport: route.toName,
                code: route.to,
                time: arrivalTime,
                timeString: arrivalTime.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            },
            duration: {
                hours: Math.floor(route.duration / 60),
                minutes: route.duration % 60,
                total: route.duration
            },
            price: finalPrice,
            class: selectedClass.name,
            seatsAvailable: seatsAvailable,
            date: date,
            passengers: passengerCount,
            isFavorite: isFavorite
        });
    }
    
    return flights;
}

function displayFlights(flights) {
    const flightsContainer = document.getElementById('flightsContainer');
    const noResults = document.getElementById('noResults');
    
    if (!flightsContainer) return;
    
    flightsContainer.innerHTML = '';
    noResults.style.display = 'none';
    
    flights.forEach(flight => {
        const flightCard = createFlightCard(flight);
        flightsContainer.appendChild(flightCard);
    });
}

function createFlightCard(flight) {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.setAttribute('data-flight-id', flight.id);
    
    const durationText = `${flight.duration.hours}j ${flight.duration.minutes}m`;
    const heartIcon = flight.isFavorite ? 'fas fa-heart' : 'far fa-heart';
    const heartColor = flight.isFavorite ? 'red' : 'var(--gray-dark)';
    
    card.innerHTML = `
        <div class="flight-airline">
            <div class="airline-logo" style="background-color: ${flight.airlineColor}">
                <i class="${flight.airlineLogo}"></i>
            </div>
            <div class="airline-name">${flight.airline}</div>
            <div class="flight-number">${flight.flightNumber}</div>
            <div class="favorite-icon" onclick="toggleFavorite(${flight.id})" 
                 style="cursor: pointer; color: ${heartColor}; margin-top: 5px;">
                <i class="${heartIcon}"></i>
            </div>
        </div>
        <div class="flight-details">
            <div class="route">
                <div class="departure">
                    <div class="time">${flight.departure.timeString}</div>
                    <div class="airport-code">${flight.departure.code}</div>
                    <div class="airport-name">${flight.departure.airport}</div>
                </div>
                <div class="duration">
                    <div>${durationText}</div>
                    <div class="duration-line"></div>
                    <div>Langsung</div>
                </div>
                <div class="arrival">
                    <div class="time">${flight.arrival.timeString}</div>
                    <div class="airport-code">${flight.arrival.code}</div>
                    <div class="airport-name">${flight.arrival.airport}</div>
                </div>
            </div>
            <div class="flight-price">
                <div class="price">Rp ${flight.price.toLocaleString('id-ID')}</div>
                <div class="per-passenger">Total untuk ${flight.passengers} penumpang</div>
                <div class="seats-available">${flight.seatsAvailable} kursi tersisa</div>
                <div class="class-info">Kelas: ${flight.class}</div>
                <button class="select-btn" onclick="selectFlight(${flight.id})">Pilih</button>
            </div>
        </div>
    `;
    
    return card;
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const flightsContainer = document.getElementById('flightsContainer');
    
    if (loading) loading.style.display = show ? 'block' : 'none';
    if (flightsContainer) flightsContainer.style.display = show ? 'none' : 'block';
}

function showNoResults() {
    const flightsContainer = document.getElementById('flightsContainer');
    const noResults = document.getElementById('noResults');
    
    if (flightsContainer) flightsContainer.innerHTML = '';
    if (noResults) noResults.style.display = 'block';
}

// ==================== FUNGSI HALAMAN FAVORITE ====================
function initFavoritePage() {
    const sortFavorites = document.getElementById('sortFavorites');
    if (sortFavorites) {
        sortFavorites.addEventListener('change', function() {
            displayFavorites();
        });
    }
    
    displayFavorites();
}

function displayFavorites() {
    const favoritesContainer = document.getElementById('favoritesContainer');
    const noFavorites = document.getElementById('noFavorites');
    
    if (!favoritesContainer) return;
    
    const data = getLocalStorageData();
    const favoriteFlights = data.favoriteFlights;
    
    if (favoriteFlights.length === 0) {
        noFavorites.style.display = 'block';
        favoritesContainer.innerHTML = '';
        return;
    }
    
    noFavorites.style.display = 'none';
    favoritesContainer.innerHTML = '';
    
    favoriteFlights.forEach(flight => {
        const flightCard = createFavoriteCard(flight);
        favoritesContainer.appendChild(flightCard);
    });
}

function createFavoriteCard(flight) {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.setAttribute('data-favorite-id', flight.id);
    
    const addedDate = new Date(flight.addedDate).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    card.innerHTML = `
        <div class="flight-airline">
            <div class="airline-logo" style="background-color: ${flight.airlineColor || 'var(--primary-color)'}">
                <i class="fas fa-plane"></i>
            </div>
            <div class="airline-name">${flight.airline}</div>
            <div class="flight-number">${flight.flightNumber}</div>
            <div class="added-date" style="font-size: var(--fs-xs); color: var(--gray-dark); margin-top: 5px;">
                <i class="fas fa-calendar-plus"></i> Ditambahkan: ${addedDate}
            </div>
        </div>
        <div class="flight-details">
            <div class="route">
                <div class="departure">
                    <div class="time">${flight.departure.timeString}</div>
                    <div class="airport-code">${flight.departure.code}</div>
                    <div class="airport-name">${flight.departure.airport}</div>
                </div>
                <div class="duration">
                    <div>${flight.duration.text || '2j 0m'}</div>
                    <div class="duration-line"></div>
                    <div>Langsung</div>
                </div>
                <div class="arrival">
                    <div class="time">${flight.arrival.timeString}</div>
                    <div class="airport-code">${flight.arrival.code}</div>
                    <div class="airport-name">${flight.arrival.airport}</div>
                </div>
            </div>
            <div class="flight-price">
                <div class="price">Rp ${flight.price.toLocaleString('id-ID')}</div>
                <div class="per-passenger">per penumpang</div>
                <div style="margin: 10px 0;">
                    <span style="font-size: var(--fs-xs); color: var(--gray-dark);">
                        <i class="fas fa-info-circle"></i> Tersimpan di favorit
                    </span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="select-btn" onclick="bookFromFavorite(${flight.id})">
                        <i class="fas fa-ticket-alt"></i> Pesan Sekarang
                    </button>
                    <button class="btn btn-secondary" onclick="removeFavorite(${flight.id})" style="padding: 8px 15px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// ==================== FUNGSI HALAMAN HISTORY ====================
function initHistoryPage() {
    const filterHistory = document.getElementById('filterHistory');
    if (filterHistory) {
        filterHistory.addEventListener('change', function() {
            displayHistory();
        });
    }
    
    displayHistory();
}

function displayHistory() {
    const historyContainer = document.getElementById('historyContainer');
    const noHistory = document.getElementById('noHistory');
    const filterValue = document.getElementById('filterHistory')?.value || 'all';
    
    if (!historyContainer) return;
    
    const data = getLocalStorageData();
    let filteredHistory = [...data.bookingHistory];
    
    if (filterValue !== 'all') {
        filteredHistory = data.bookingHistory.filter(booking => booking.status === filterValue);
    }
    
    if (filteredHistory.length === 0) {
        noHistory.style.display = 'block';
        historyContainer.innerHTML = '';
        return;
    }
    
    noHistory.style.display = 'none';
    historyContainer.innerHTML = '';
    
    filteredHistory.forEach(booking => {
        const historyCard = createHistoryCard(booking);
        historyContainer.appendChild(historyCard);
    });
}

function createHistoryCard(booking) {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.setAttribute('data-booking-id', booking.id);
    
    const bookingDate = new Date(booking.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let statusText, statusClass;
    switch(booking.status) {
        case 'upcoming':
            statusText = 'Akan Datang';
            statusClass = 'status-upcoming';
            break;
        case 'completed':
            statusText = 'Selesai';
            statusClass = 'status-completed';
            break;
        case 'cancelled':
            statusText = 'Dibatalkan';
            statusClass = 'status-cancelled';
            break;
        default:
            statusText = 'Pending';
            statusClass = 'status-pending';
    }

    card.innerHTML = `
        <div class="flight-airline">
            <div class="airline-logo" style="background-color: var(--primary-light)">
                <i class="fas fa-plane"></i>
            </div>
            <div class="airline-name">${booking.airline}</div>
            <div class="flight-number">${booking.flightNumber}</div>
            <div class="booking-code" style="font-size: var(--fs-xs); color: var(--gray-dark); margin-top: 5px;">
                <i class="fas fa-ticket-alt"></i> ${booking.bookingCode}
            </div>
        </div>
        <div class="flight-details">
            <div class="route">
                <div style="text-align: left;">
                    <div style="font-size: var(--fs-lg); font-weight: 600; margin-bottom: 5px;">
                        ${booking.route}
                    </div>
                    <div style="color: var(--gray-dark); margin-bottom: 10px;">
                        <i class="fas fa-calendar-alt"></i> ${bookingDate}
                    </div>
                    <div style="color: var(--gray-dark); margin-bottom: 10px;">
                        <span class="${statusClass}" style="padding: 5px 10px; border-radius: var(--radius-sm); font-size: var(--fs-xs);">
                            ${statusText}
                        </span>
                        ${booking.fromFavorite ? '<span style="margin-left: 10px; color: var(--accent-color); font-size: var(--fs-xs);"><i class="fas fa-heart"></i> Dari Favorit</span>' : ''}
                    </div>
                    <div style="color: var(--gray-dark);">
                        <i class="fas fa-clock"></i> Dipesan: ${new Date(booking.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
            <div class="flight-price">
                <div class="price">Rp ${typeof booking.price === 'number' ? booking.price.toLocaleString('id-ID') : booking.price}</div>
                <div class="per-passenger" style="margin-bottom: 10px;">
                    ${booking.passengers ? `${booking.passengers} penumpang` : '1 penumpang'}
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    ${booking.status === 'upcoming' ? `
                        <button class="select-btn" onclick="viewBookingDetail(${booking.id})">
                            <i class="fas fa-eye"></i> Detail
                        </button>
                        <button class="btn btn-secondary" onclick="cancelBooking(${booking.id})" style="padding: 8px 15px;">
                            <i class="fas fa-times"></i> Batalkan
                        </button>
                    ` : `
                        <button class="select-btn" onclick="viewBookingDetail(${booking.id})">
                            <i class="fas fa-eye"></i> Detail
                        </button>
                        ${booking.status === 'completed' ? `
                            <button class="btn btn-secondary" onclick="downloadTicket(${booking.id})" style="padding: 8px 15px;">
                                <i class="fas fa-download"></i> Unduh
                            </button>
                        ` : ''}
                    `}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// ==================== FUNGSI HALAMAN ACCOUNT ====================
function initAccountPage() {
    updateUserProfile();
    
    const editProfileBtn = document.getElementById('editProfile');
    const settingsBtn = document.getElementById('settings');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            editProfile();
        });
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openSettings();
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
}

function updateUserProfile() {
    const data = getLocalStorageData();
    const userProfile = data.userProfile;
    
    const userNameElements = document.querySelectorAll('#userName, #detailName');
    const userEmailElements = document.querySelectorAll('#userEmail, #detailEmail');
    const detailPhone = document.getElementById('detailPhone');
    const detailAddress = document.getElementById('detailAddress');
    const detailOrders = document.getElementById('detailOrders');
    const detailStatus = document.getElementById('detailStatus');
    
    userNameElements.forEach(el => {
        if (el) el.textContent = userProfile.name;
    });
    
    userEmailElements.forEach(el => {
        if (el) el.textContent = userProfile.email;
    });
    
    if (detailPhone) detailPhone.textContent = userProfile.phone || '-';
    if (detailAddress) detailAddress.textContent = userProfile.address || '-';
    if (detailOrders) detailOrders.textContent = userProfile.totalOrders || 0;
    if (detailStatus) detailStatus.textContent = 'Aktif';
    
    const joinDate = new Date(userProfile.joinDate).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long'
    });
    const joinDateElement = document.querySelector('.account-info p:nth-child(3)');
    if (joinDateElement) {
        joinDateElement.innerHTML = `<i class="fas fa-calendar-alt"></i> Bergabung: ${joinDate}`;
    }
}

function editProfile() {
    const data = getLocalStorageData();
    const userProfile = data.userProfile;
    
    const newName = prompt('Masukkan nama baru:', userProfile.name);
    if (newName && newName.trim() !== '') {
        userProfile.name = newName.trim();
        
        const newPhone = prompt('Masukkan nomor telepon baru:', userProfile.phone);
        if (newPhone !== null) {
            userProfile.phone = newPhone.trim() || '-';
        }
        
        const newAddress = prompt('Masukkan alamat baru:', userProfile.address);
        if (newAddress !== null) {
            userProfile.address = newAddress.trim() || '-';
        }
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        updateUserProfile();
        alert('Profil berhasil diperbarui!');
    }
}

function openSettings() {
    const settingsMessage = 'Pengaturan Akun:\n\n';
    settingsMessage += 'Notifikasi Email: Aktif\n';
    settingsMessage += 'Notifikasi SMS: Nonaktif\n';
    settingsMessage += 'Bahasa: Bahasa Indonesia\n';
    settingsMessage += 'Mata Uang: IDR\n\n';
    settingsMessage += 'Fitur pengaturan lengkap akan tersedia dalam update berikutnya.';
    
    alert(settingsMessage);
}

function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        alert('Anda telah berhasil keluar. Sampai jumpa lagi!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ==================== FUNGSI GLOBAL UNTUK SEMUA HALAMAN ====================
function selectFlight(flightId) {
    const flightCards = document.querySelectorAll('.flight-card');
    const selectedCard = Array.from(flightCards).find(card => 
        parseInt(card.getAttribute('data-flight-id')) === flightId
    );
    
    if (!selectedCard) return;
    
    const airline = selectedCard.querySelector('.airline-name').textContent;
    const flightNumber = selectedCard.querySelector('.flight-number').textContent;
    const from = selectedCard.querySelector('.departure .airport-code').textContent;
    const to = selectedCard.querySelector('.arrival .airport-code').textContent;
    const price = selectedCard.querySelector('.price').textContent;
    const time = selectedCard.querySelector('.departure .time').textContent;
    
    const message = `Anda memilih:\n\n` +
                   `Maskapai: ${airline}\n` +
                   `Penerbangan: ${flightNumber}\n` +
                   `Rute: ${from} → ${to}\n` +
                   `Waktu: ${time}\n` +
                   `Harga: ${price}\n\n` +
                   `Lanjutkan ke pembayaran?`;
    
    if (confirm(message)) {
        const data = getLocalStorageData();
        
        const booking = {
            id: Date.now(),
            airline: airline,
            flightNumber: flightNumber,
            route: `${from} - ${to}`,
            date: new Date().toISOString().split('T')[0],
            price: parseInt(price.replace(/[^\d]/g, '')),
            status: 'completed',
            bookingCode: `BOOK${Math.floor(100000 + Math.random() * 900000)}`
        };
        
        data.bookingHistory.unshift(booking);
        localStorage.setItem('bookingHistory', JSON.stringify(data.bookingHistory));
        
        data.userProfile.totalOrders = (data.userProfile.totalOrders || 0) + 1;
        localStorage.setItem('userProfile', JSON.stringify(data.userProfile));
        
        showMessage('Pemesanan berhasil! Tiket akan dikirim ke email Anda.', 'success');
    }
}

function toggleFavorite(flightId) {
    const flightCards = document.querySelectorAll('.flight-card');
    const selectedCard = Array.from(flightCards).find(card => 
        parseInt(card.getAttribute('data-flight-id')) === flightId
    );
    
    if (!selectedCard) return;
    
    const data = getLocalStorageData();
    let favoriteFlights = data.favoriteFlights;
    
    const airline = selectedCard.querySelector('.airline-name').textContent;
    const flightNumber = selectedCard.querySelector('.flight-number').textContent;
    const from = selectedCard.querySelector('.departure .airport-code').textContent;
    const to = selectedCard.querySelector('.arrival .airport-code').textContent;
    const time = selectedCard.querySelector('.departure .time').textContent;
    const price = selectedCard.querySelector('.price').textContent;
    
    const existingIndex = favoriteFlights.findIndex(f => 
        f.airline === airline && 
        f.flightNumber === flightNumber && 
        f.departure.code === from && 
        f.arrival.code === to
    );
    
    const favoriteIcon = selectedCard.querySelector('.favorite-icon i');
    
    if (existingIndex > -1) {
        favoriteFlights.splice(existingIndex, 1);
        favoriteIcon.className = 'far fa-heart';
        favoriteIcon.style.color = 'var(--gray-dark)';
        showMessage('Dihapus dari favorit', 'info');
    } else {
        const favorite = {
            id: flightId,
            airline: airline,
            airlineCode: selectedCard.querySelector('.flight-number').textContent.substring(0, 2),
            airlineColor: selectedCard.querySelector('.airline-logo').style.backgroundColor,
            flightNumber: flightNumber,
            departure: {
                airport: selectedCard.querySelector('.departure .airport-name').textContent,
                code: from,
                timeString: time
            },
            arrival: {
                airport: selectedCard.querySelector('.arrival .airport-name').textContent,
                code: to,
                timeString: selectedCard.querySelector('.arrival .time').textContent
            },
            duration: {
                text: selectedCard.querySelector('.duration div:first-child').textContent
            },
            price: parseInt(price.replace(/[^\d]/g, '')),
            addedDate: new Date().toISOString().split('T')[0]
        };
        
        favoriteFlights.unshift(favorite);
        favoriteIcon.className = 'fas fa-heart';
        favoriteIcon.style.color = 'red';
        showMessage('Ditambahkan ke favorit', 'success');
    }
    
    localStorage.setItem('favoriteFlights', JSON.stringify(favoriteFlights));
}

function bookFromFavorite(favoriteId) {
    const data = getLocalStorageData();
    const favorite = data.favoriteFlights.find(f => f.id === favoriteId);
    if (!favorite) return;
    
    const message = `Pesan penerbangan favorit:\n\n` +
                   `Maskapai: ${favorite.airline}\n` +
                   `Penerbangan: ${favorite.flightNumber}\n` +
                   `Rute: ${favorite.departure.code} → ${favorite.arrival.code}\n` +
                   `Harga: Rp ${favorite.price.toLocaleString('id-ID')}\n\n` +
                   `Lanjutkan ke pemesanan?`;
    
    if (confirm(message)) {
        const booking = {
            id: Date.now(),
            airline: favorite.airline,
            flightNumber: favorite.flightNumber,
            route: `${favorite.departure.code} - ${favorite.arrival.code}`,
            date: new Date().toISOString().split('T')[0],
            price: favorite.price,
            status: 'upcoming',
            bookingCode: `BOOK${Math.floor(100000 + Math.random() * 900000)}`,
            fromFavorite: true
        };
        
        data.bookingHistory.unshift(booking);
        localStorage.setItem('bookingHistory', JSON.stringify(data.bookingHistory));
        
        data.userProfile.totalOrders = (data.userProfile.totalOrders || 0) + 1;
        localStorage.setItem('userProfile', JSON.stringify(data.userProfile));
        
        alert('Pemesanan berhasil! Tiket akan dikirim ke email Anda.');
    }
}

function removeFavorite(favoriteId) {
    if (confirm('Hapus penerbangan ini dari favorit?')) {
        const data = getLocalStorageData();
        let favoriteFlights = data.favoriteFlights;
        
        favoriteFlights = favoriteFlights.filter(f => f.id !== favoriteId);
        localStorage.setItem('favoriteFlights', JSON.stringify(favoriteFlights));
        
        const favoriteCard = document.querySelector(`[data-favorite-id="${favoriteId}"]`);
        if (favoriteCard) {
            favoriteCard.remove();
        }
        
        if (favoriteFlights.length === 0) {
            const noFavorites = document.getElementById('noFavorites');
            if (noFavorites) noFavorites.style.display = 'block';
        }
        
        alert('Penerbangan telah dihapus dari favorit');
    }
}

function viewBookingDetail(bookingId) {
    const data = getLocalStorageData();
    const booking = data.bookingHistory.find(b => b.id === bookingId);
    if (!booking) return;
    
    const detailMessage = `
    DETAIL PEMESANAN
    =================
    Kode Booking: ${booking.bookingCode}
    Maskapai: ${booking.airline}
    Penerbangan: ${booking.flightNumber}
    Rute: ${booking.route}
    Tanggal: ${new Date(booking.date).toLocaleDateString('id-ID')}
    Status: ${booking.status}
    Harga: Rp ${typeof booking.price === 'number' ? booking.price.toLocaleString('id-ID') : booking.price}
    ${booking.fromFavorite ? 'Sumber: Dari Favorit' : ''}
    `;
    
    alert(detailMessage);
}

function cancelBooking(bookingId) {
    if (confirm('Batalkan pemesanan ini?')) {
        const data = getLocalStorageData();
        const bookingIndex = data.bookingHistory.findIndex(b => b.id === bookingId);
        
        if (bookingIndex > -1) {
            data.bookingHistory[bookingIndex].status = 'cancelled';
            localStorage.setItem('bookingHistory', JSON.stringify(data.bookingHistory));
            displayHistory();
            alert('Pemesanan telah dibatalkan');
        }
    }
}

function downloadTicket(bookingId) {
    const data = getLocalStorageData();
    const booking = data.bookingHistory.find(b => b.id === bookingId);
    if (!booking) return;
    
    const ticketContent = `
    ==================================
            E-TICKET TRAVEL.COM
    ==================================
    
    Kode Tiket: ${booking.bookingCode}
    Tanggal: ${new Date().toLocaleDateString('id-ID')}
    
    DETAIL PENERBANGAN
    ------------------
    Maskapai: ${booking.airline}
    Penerbangan: ${booking.flightNumber}
    Rute: ${booking.route}
    Tanggal: ${new Date(booking.date).toLocaleDateString('id-ID')}
    
    DETAIL PENUMPANG
    -----------------
    Nama: ${data.userProfile?.name || 'Guest User'}
    
    INFORMASI HARGA
    ----------------
    Total: Rp ${typeof booking.price === 'number' ? booking.price.toLocaleString('id-ID') : booking.price}
    Status: ${booking.status}
    
    INSTRUKSI
    ---------
    1. Datang ke bandara 2 jam sebelum keberangkatan
    2. Bawa e-ticket dan identitas diri
    3. Lakukan check-in di counter maskapai
    
    ==================================
    Terima kasih telah menggunakan
           Travel.com
    ==================================
    `;
    
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tiket-${booking.bookingCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Tiket berhasil diunduh!');
}

// ==================== INISIALISASI SEMUA HALAMAN ====================
document.addEventListener('DOMContentLoaded', function() {
    // Cek halaman yang sedang dibuka
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Inisialisasi umum untuk semua halaman
    initDateInputs();
    
    // Inisialisasi berdasarkan halaman
    if (currentPage === 'index.html' || currentPage === '') {
        initPassengerCounter();
        initFlightSearch();
        initResetButton();
        initSortOptions();
        initAutoFill();
        
        // Tampilkan sample flights jika tidak ada hasil
        const flightsContainer = document.getElementById('flightsContainer');
        if (flightsContainer && flightsContainer.children.length === 1) {
            const sampleRoute = routes[0];
            const sampleFlights = generateFlights(sampleRoute, new Date().toISOString().split('T')[0], 'economy', 1);
            displayFlights(sampleFlights);
        }
    }
    else if (currentPage === 'favorite.html') {
        initFavoritePage();
    }
    else if (currentPage === 'history.html') {
        initHistoryPage();
    }
    else if (currentPage === 'account.html') {
        initAccountPage();
    }
});