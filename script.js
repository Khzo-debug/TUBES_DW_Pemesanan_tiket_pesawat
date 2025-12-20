// ===============================
// DATA SIMULASI
// ===============================
const daftarTiket = [
    {
        maskapai: "Garuda Indonesia",
        jam: "07:00 - 10:00",
        harga: 1250000
    },
    {
        maskapai: "Lion Air",
        jam: "08:30 - 11:45",
        harga: 980000
    },
    {
        maskapai: "Citilink",
        jam: "09:15 - 12:30",
        harga: 1050000
    },
    {
        maskapai: "Batik Air",
        jam: "11:00 - 14:10",
        harga: 1150000
    },
    {
        maskapai: "AirAsia",
        jam: "13:40 - 16:50",
        harga: 920000
    }
];

// ===============================
// KONFIGURASI API
// ===============================
const UNSPLASH_ACCESS_KEYS = [
    "baWs8OkvsOIyuwxtm-sEFQP1N63G_RiuJdObWO8TOC4",
    "LVd3lACQsM1TYJ9lq50Qv_zbh-eTCkq-RsXnUzDk5j4"
];

const DESTINASI_WISATA = [
    {
        nama: "Bali",
        kode: "Bali (DPS)",
        deskripsi: "Pulau Dewata dengan pantai eksotis dan budaya yang kaya",
        query: "bali indonesia beach temple"
    },
    {
        nama: "Raja Ampat",
        kode: "Sorong (SOQ)",
        deskripsi: "Surga bawah laut dengan keanekaragaman hayati terbaik dunia",
        query: "raja ampat papua indonesia diving"
    },
    {
        nama: "Lombok",
        kode: "Lombok (LOP)",
        deskripsi: "Pulau eksotis dengan Gili Trawangan dan Gunung Rinjani",
        query: "lombok indonesia gili trawangan"
    },
    {
        nama: "Yogyakarta",
        kode: "Yogyakarta (YIA)",
        deskripsi: "Kota budaya dengan Candi Borobudur dan Prambanan",
        query: "yogyakarta borobudur temple indonesia"
    },
    {
        nama: "Labuan Bajo",
        kode: "Labuan Bajo (LBJ)",
        deskripsi: "Gerbang menuju Pulau Komodo dan satwa purba",
        query: "labuan bajo komodo island indonesia"
    },
    {
        nama: "Bromo",
        kode: "Malang (MLG)",
        deskripsi: "Gunung api aktif dengan panorama sunrise yang legendaris",
        query: "bromo mountain java indonesia sunrise"
    }
];

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1578319439587-0bcaa1b47b37?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1573991566397-45f244ca6cc0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1562763451-84544b0801a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1588666309990-d68f08e3d4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1621451537084-482c73073a0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
];

// ===============================
// FUNGSI BANTUAN
// ===============================
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

function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        <strong>${type.toUpperCase()}:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// ===============================
// API UNSPLASH UNTUK DESTINASI WISATA
// ===============================
async function loadDestinasiWisata() {
    const gallery = document.getElementById("destinasiGallery");
    
    if (!gallery) return;
    
    gallery.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3">Memuat destinasi wisata...</p>
        </div>
    `;
    
    try {
        await loadDestinasiFromUnsplash(0);
    } catch (error) {
        console.error("API Error:", error);
        loadDestinasiFallback();
    }
}

async function loadDestinasiFromUnsplash(keyIndex = 0) {
    const gallery = document.getElementById("destinasiGallery");
    if (keyIndex >= UNSPLASH_ACCESS_KEYS.length) throw new Error("All API keys failed");
    
    const ACCESS_KEY = UNSPLASH_ACCESS_KEYS[keyIndex];
    let html = '<div class="row g-4">';
    
    for (let i = 0; i < DESTINASI_WISATA.length; i++) {
        const destinasi = DESTINASI_WISATA[i];
        let imageUrl = FALLBACK_IMAGES[i];
        let description = destinasi.deskripsi;
        
        try {
            const res = await fetch(
                `https://api.unsplash.com/photos/random?query=${encodeURIComponent(destinasi.query)}&client_id=${ACCESS_KEY}`
            );
            
            if (res.ok) {
                const data = await res.json();
                if (data?.urls?.regular) {
                    imageUrl = data.urls.regular;
                    description = data.description || destinasi.deskripsi;
                }
            }
        } catch (error) {
            console.warn(`Gagal mengambil gambar untuk ${destinasi.nama}`);
        }
        
        html += `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="card destinasi-card h-100">
                    <img src="${imageUrl}" 
                         alt="${destinasi.nama}" 
                         class="card-img-top"
                         style="height: 220px; object-fit: cover;"
                         loading="lazy"
                         onerror="this.src='${FALLBACK_IMAGES[i]}'">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${destinasi.nama}</h5>
                        <p class="card-text text-muted">${description}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <button class="btn btn-primary btn-sm" onclick="cariTiketKe('${destinasi.kode}')">
                                <i class="fas fa-plane me-1"></i> Cari Tiket
                            </button>
                            <small class="text-muted fw-semibold">${destinasi.kode}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    gallery.innerHTML = html;
    console.log("Destinasi wisata berhasil dimuat!");
}

function loadDestinasiFallback() {
    const gallery = document.getElementById("destinasiGallery");
    let html = '<div class="row g-4">';
    
    DESTINASI_WISATA.forEach((destinasi, i) => {
        html += `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="card destinasi-card h-100">
                    <img src="${FALLBACK_IMAGES[i]}" 
                         alt="${destinasi.nama}" 
                         class="card-img-top"
                         style="height: 220px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${destinasi.nama}</h5>
                        <p class="card-text text-muted">${destinasi.deskripsi}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <button class="btn btn-primary btn-sm" onclick="cariTiketKe('${destinasi.kode}')">
                                <i class="fas fa-plane me-1"></i> Cari Tiket
                            </button>
                            <small class="text-muted fw-semibold">${destinasi.kode}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    gallery.innerHTML = html;
    console.log("Destinasi wisata dimuat dari fallback");
}

// ===============================
// FUNGSI UNTUK INDEX.HTML
// ===============================
function initIndexPage() {
    console.log('Memulai halaman index...');
    
    // Set tanggal
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const tanggalBerangkat = document.getElementById('tanggalBerangkat');
    const tanggalPulang = document.getElementById('tanggalPulang');
    
    if (tanggalBerangkat) {
        tanggalBerangkat.min = formatDate(today);
        tanggalBerangkat.value = formatDate(today);
    }
    
    if (tanggalPulang) {
        tanggalPulang.min = formatDate(tomorrow);
        tanggalPulang.value = formatDate(tomorrow);
    }
    
    // Event listener tanggal
    if (tanggalBerangkat && tanggalPulang) {
        tanggalBerangkat.addEventListener('change', function() {
            const berangkatDate = new Date(this.value);
            const minPulang = new Date(berangkatDate);
            minPulang.setDate(minPulang.getDate() + 1);
            tanggalPulang.min = formatDate(minPulang);
        });
    }
    
    // Switch kota
    const switchBtn = document.getElementById("switchKota");
    const kotaAsal = document.getElementById("kotaAsal");
    const kotaTujuan = document.getElementById("kotaTujuan");
    
    if (switchBtn && kotaAsal && kotaTujuan) {
        switchBtn.addEventListener("click", function () {
            const temp = kotaAsal.value;
            kotaAsal.value = kotaTujuan.value;
            kotaTujuan.value = temp;
            this.classList.add("rotate");
            setTimeout(() => this.classList.remove("rotate"), 300);
        });
    }
    
    // Auto-fill kota
    if (kotaAsal && !kotaAsal.value) kotaAsal.value = "Jakarta (CGK)";
    if (kotaTujuan && !kotaTujuan.value) kotaTujuan.value = "Bali (DPS)";
    
    // Form submit
    const flightForm = document.getElementById("flightForm");
    if (flightForm) {
        flightForm.addEventListener("submit", function (e) {
            e.preventDefault();
            searchFlights();
        });
    }
    
    // Load destinasi wisata
    loadDestinasiWisata();
}

function searchFlights() {
    const asal = document.getElementById("kotaAsal").value;
    const tujuan = document.getElementById("kotaTujuan").value;
    const result = document.getElementById("result");
    
    if (asal === tujuan) {
        result.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Kota asal dan tujuan tidak boleh sama
            </div>
        `;
        return;
    }
    
    // Simpan ke riwayat
    const data = getLocalStorageData();
    const searchItem = {
        origin: asal,
        destination: tujuan,
        date: document.getElementById('tanggalBerangkat').value,
        class: document.getElementById('kelas').value,
        passengers: document.getElementById('penumpang').value,
        timestamp: new Date().toISOString()
    };
    
    data.searchHistory.unshift(searchItem);
    if (data.searchHistory.length > 10) data.searchHistory.pop();
    localStorage.setItem('searchHistory', JSON.stringify(data.searchHistory));
    
    // Loading
    result.innerHTML = `
        <div class="text-center my-5 py-4">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 fs-5">Mencari tiket terbaik...</p>
        </div>
    `;
    
    setTimeout(() => {
        displayFlightResults(asal, tujuan);
    }, 1000);
}

function displayFlightResults(asal, tujuan) {
    const result = document.getElementById("result");
    let html = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4><i class="fas fa-plane-departure text-primary"></i> Hasil Pencarian</h4>
            <span class="badge bg-primary">${daftarTiket.length} penerbangan</span>
        </div>
    `;
    
    daftarTiket.forEach((tiket, index) => {
        const flightId = Date.now() + index;
        const airportCodeAsal = asal.match(/\(([A-Z]{3})\)/)?.[1] || "CGK";
        const airportCodeTujuan = tujuan.match(/\(([A-Z]{3})\)/)?.[1] || "DPS";
        
        html += `
            <div class="card ticket-card shadow-sm mb-3" data-flight-id="${flightId}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <div class="d-flex align-items-center mb-3">
                                <div class="airline-logo me-3">${tiket.maskapai.charAt(0)}</div>
                                <div>
                                    <strong class="airline-name fs-5">${tiket.maskapai}</strong>
                                    <small class="text-muted d-block">
                                        <i class="far fa-clock me-1"></i>${tiket.jam}
                                    </small>
                                </div>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="text-center">
                                    <div class="fw-bold fs-4">${airportCodeAsal}</div>
                                    <small class="text-muted">${asal.split('(')[0].trim()}</small>
                                </div>
                                <div class="mx-4">
                                    <i class="fas fa-long-arrow-alt-right text-primary fa-lg"></i>
                                </div>
                                <div class="text-center">
                                    <div class="fw-bold fs-4">${airportCodeTujuan}</div>
                                    <small class="text-muted">${tujuan.split('(')[0].trim()}</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="fw-bold text-primary fs-3 mb-2">
                                Rp ${tiket.harga.toLocaleString("id-ID")}
                            </div>
                            <small class="text-muted d-block mb-2">per orang</small>
                            <div class="d-flex justify-content-end gap-2">
                                <button class="btn btn-outline-primary btn-sm" onclick="toggleFavorite(${flightId}, '${tiket.maskapai}', '${airportCodeAsal}', '${airportCodeTujuan}')">
                                    <i class="far fa-heart"></i> Favorit
                                </button>
                                <button class="btn btn-warning btn-sm px-3" onclick="selectFlight('${asal}', '${tujuan}', '${tiket.maskapai}', '${tiket.jam}', ${tiket.harga})">
                                    <i class="fas fa-ticket-alt me-1"></i>Pilih
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    result.innerHTML = html;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===============================
// NAVBAR UNTUK SEMUA HALAMAN
// ===============================
function initNavigation() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (!href) return;
        
        if (currentPage === '' || currentPage === 'index.html') {
            if (href === 'index.html' && link.textContent.includes('Cari Tiket')) {
                link.classList.add('active');
            }
        } else if (currentPage.includes('favorite') && href === 'favorite.html') {
            link.classList.add('active');
        } else if (currentPage.includes('history') && href === 'history.html') {
            link.classList.add('active');
        } else if (currentPage.includes('account') && href === 'account.html') {
            link.classList.add('active');
        }
    });
}

// ===============================
// FUNGSI FAVORIT
// ===============================
function initFavoritePage() {
    console.log('Memulai halaman favorit...');
    initNavigation();
    
    const sortFavorites = document.getElementById("sortFavorites");
    if (sortFavorites) {
        sortFavorites.addEventListener("change", displayFavorites);
    }
    
    displayFavorites();
}

function displayFavorites() {
    const favoritesContainer = document.getElementById("favoritesContainer");
    const noFavorites = document.getElementById("noFavorites");
    
    if (!favoritesContainer) return;
    
    const data = getLocalStorageData();
    const favoriteFlights = data.favoriteFlights;
    
    if (favoriteFlights.length === 0) {
        if (noFavorites) noFavorites.style.display = "block";
        favoritesContainer.innerHTML = "";
        return;
    }
    
    if (noFavorites) noFavorites.style.display = "none";
    favoritesContainer.innerHTML = "";
    
    favoriteFlights.forEach(flight => {
        favoritesContainer.appendChild(createFavoriteCard(flight));
    });
}

function createFavoriteCard(flight) {
    const card = document.createElement("div");
    card.className = "card ticket-card mb-3";
    card.setAttribute("data-favorite-id", flight.id);
    
    const addedDate = new Date(flight.addedDate).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
    
    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="d-flex align-items-center mb-2">
                        <div class="airline-logo me-2">${flight.airline.charAt(0)}</div>
                        <strong class="fs-5">${flight.airline}</strong>
                    </div>
                    <div class="d-flex align-items-center mb-1">
                        <div>
                            <span class="fw-bold fs-4">${flight.departure.code}</span>
                            <small class="text-muted d-block">${flight.departure.timeString}</small>
                        </div>
                        <div class="mx-3">
                            <i class="fas fa-long-arrow-alt-right text-primary"></i>
                        </div>
                        <div>
                            <span class="fw-bold fs-4">${flight.arrival.code}</span>
                            <small class="text-muted d-block">${flight.arrival.timeString}</small>
                        </div>
                    </div>
                    <small class="text-muted">
                        <i class="fas fa-calendar-plus me-1"></i>Ditambahkan: ${addedDate}
                    </small>
                </div>
                <div class="text-end">
                    <div class="fw-bold text-primary fs-4 mb-2">
                        Rp ${flight.price.toLocaleString("id-ID")}
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-warning btn-sm" onclick="bookFromFavorite(${flight.id})">
                            <i class="fas fa-ticket-alt me-1"></i> Pesan
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="removeFavorite(${flight.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function toggleFavorite(flightId, airline, fromCode, toCode) {
    const data = getLocalStorageData();
    let favoriteFlights = data.favoriteFlights;
    
    const existingIndex = favoriteFlights.findIndex(f => f.id === flightId);
    
    if (existingIndex > -1) {
        favoriteFlights.splice(existingIndex, 1);
        showMessage("Dihapus dari favorit", "info");
    } else {
        const favorite = {
            id: flightId,
            airline: airline,
            flightNumber: airline.substring(0, 2).toUpperCase() + Math.floor(100 + Math.random() * 900),
            departure: { code: fromCode, timeString: "07:00" },
            arrival: { code: toCode, timeString: "10:00" },
            price: Math.floor(Math.random() * 1000000) + 500000,
            addedDate: new Date().toISOString()
        };
        
        favoriteFlights.unshift(favorite);
        showMessage("Ditambahkan ke favorit", "success");
    }
    
    localStorage.setItem("favoriteFlights", JSON.stringify(favoriteFlights));
}

function bookFromFavorite(favoriteId) {
    const data = getLocalStorageData();
    const favorite = data.favoriteFlights.find(f => f.id === favoriteId);
    if (!favorite) {
        showMessage("Penerbangan favorit tidak ditemukan", "error");
        return;
    }
    
    const message = `Pesan penerbangan favorit:\n\n` +
                   `Maskapai: ${favorite.airline}\n` +
                   `Penerbangan: ${favorite.flightNumber}\n` +
                   `Rute: ${favorite.departure.code} → ${favorite.arrival.code}\n` +
                   `Harga: Rp ${favorite.price.toLocaleString("id-ID")}\n\n` +
                   `Lanjutkan ke pemesanan?`;
    
    if (confirm(message)) {
        const booking = {
            id: Date.now(),
            airline: favorite.airline,
            flightNumber: favorite.flightNumber,
            route: `${favorite.departure.code} → ${favorite.arrival.code}`,
            date: new Date().toISOString().split("T")[0],
            price: favorite.price,
            status: "upcoming",
            bookingCode: `BOOK${Math.floor(100000 + Math.random() * 900000)}`,
            fromFavorite: true
        };
        
        data.bookingHistory.unshift(booking);
        localStorage.setItem("bookingHistory", JSON.stringify(data.bookingHistory));
        
        data.userProfile.totalOrders = (data.userProfile.totalOrders || 0) + 1;
        localStorage.setItem("userProfile", JSON.stringify(data.userProfile));
        
        showMessage("Pemesanan berhasil! Tiket akan dikirim ke email Anda.", "success");
    }
}

function removeFavorite(favoriteId) {
    if (confirm("Hapus penerbangan ini dari favorit?")) {
        const data = getLocalStorageData();
        let favoriteFlights = data.favoriteFlights.filter(f => f.id !== favoriteId);
        localStorage.setItem("favoriteFlights", JSON.stringify(favoriteFlights));
        
        const favoriteCard = document.querySelector(`[data-favorite-id="${favoriteId}"]`);
        if (favoriteCard) favoriteCard.remove();
        
        displayFavorites();
        showMessage("Penerbangan telah dihapus dari favorit", "success");
    }
}

// ===============================
// FUNGSI HISTORY
// ===============================
function initHistoryPage() {
    console.log('Memulai halaman riwayat...');
    initNavigation();
    
    const filterHistory = document.getElementById("filterHistory");
    if (filterHistory) {
        filterHistory.addEventListener("change", displayHistory);
    }
    
    displayHistory();
}

function displayHistory() {
    const historyContainer = document.getElementById("historyContainer");
    const noHistory = document.getElementById("noHistory");
    const filterValue = document.getElementById("filterHistory")?.value || "all";
    
    if (!historyContainer) return;
    
    const data = getLocalStorageData();
    let filteredHistory = [...data.bookingHistory];
    
    if (filterValue !== "all") {
        filteredHistory = data.bookingHistory.filter(booking => booking.status === filterValue);
    }
    
    if (filteredHistory.length === 0) {
        if (noHistory) noHistory.style.display = "block";
        historyContainer.innerHTML = "";
        return;
    }
    
    if (noHistory) noHistory.style.display = "none";
    historyContainer.innerHTML = "";
    
    filteredHistory.forEach(booking => {
        historyContainer.appendChild(createHistoryCard(booking));
    });
}

function createHistoryCard(booking) {
    const card = document.createElement("div");
    card.className = "card ticket-card mb-3";
    card.setAttribute("data-booking-id", booking.id);
    
    const bookingDate = new Date(booking.date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    
    let statusText, statusClass;
    switch(booking.status) {
        case "upcoming":
            statusText = "Akan Datang";
            statusClass = "status-upcoming";
            break;
        case "completed":
            statusText = "Selesai";
            statusClass = "status-completed";
            break;
        case "cancelled":
            statusText = "Dibatalkan";
            statusClass = "status-cancelled";
            break;
        default:
            statusText = "Pending";
            statusClass = "";
    }
    
    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong class="fs-5">${booking.route}</strong><br>
                    <small class="text-muted">
                        ${booking.airline} • ${booking.flightNumber}
                    </small><br>
                    <small class="text-muted">
                        <i class="fas fa-calendar-alt"></i> ${bookingDate}
                    </small><br>
                    <span class="${statusClass}">${statusText}</span>
                    ${booking.fromFavorite ? '<span class="badge bg-danger ms-2">Dari Favorit</span>' : ""}
                </div>
                <div class="text-end">
                    <div class="fw-bold text-primary fs-5 mb-1">
                        Rp ${typeof booking.price === "number" ? booking.price.toLocaleString("id-ID") : booking.price}
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-info btn-sm" onclick="viewBookingDetail(${booking.id})">
                            <i class="fas fa-eye"></i> Detail
                        </button>
                        ${booking.status === "upcoming" ? `
                            <button class="btn btn-danger btn-sm" onclick="cancelBooking(${booking.id})">
                                <i class="fas fa-times"></i> Batalkan
                            </button>
                        ` : ""}
                        ${booking.status === "completed" ? `
                            <button class="btn btn-success btn-sm" onclick="downloadTicket(${booking.id})">
                                <i class="fas fa-download"></i> Unduh
                            </button>
                        ` : ""}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// ===============================
// FUNGSI ACCOUNT
// ===============================
function initAccountPage() {
    console.log('Memulai halaman akun...');
    initNavigation();
    
    updateUserProfile();
    
    const editProfileBtn = document.getElementById("editProfile");
    const logoutBtn = document.getElementById("logoutBtn");
    
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", function(e) {
            e.preventDefault();
            editProfile();
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
}

function updateUserProfile() {
    const data = getLocalStorageData();
    const userProfile = data.userProfile;
    
    const userNameElements = document.querySelectorAll("#userName, #detailName");
    const userEmailElements = document.querySelectorAll("#userEmail, #detailEmail");
    const detailPhone = document.getElementById("detailPhone");
    const detailAddress = document.getElementById("detailAddress");
    const detailOrders = document.getElementById("detailOrders");
    const detailStatus = document.getElementById("detailStatus");
    
    userNameElements.forEach(el => {
        if (el) el.textContent = userProfile.name;
    });
    
    userEmailElements.forEach(el => {
        if (el) el.textContent = userProfile.email;
    });
    
    if (detailPhone) detailPhone.textContent = userProfile.phone || "-";
    if (detailAddress) detailAddress.textContent = userProfile.address || "-";
    if (detailOrders) detailOrders.textContent = userProfile.totalOrders || 0;
    if (detailStatus) detailStatus.textContent = "Aktif";
    
    const joinDateElement = document.querySelector(".account-info p:nth-child(3)");
    if (joinDateElement) {
        const joinDate = new Date(userProfile.joinDate);
        const formattedDate = joinDate.toLocaleDateString("id-ID", { 
            year: "numeric", 
            month: "long" 
        });
        joinDateElement.innerHTML = `<i class="fas fa-calendar-alt"></i> Bergabung: ${formattedDate}`;
    }
}

function editProfile() {
    const data = getLocalStorageData();
    const userProfile = data.userProfile;
    
    const newName = prompt("Masukkan nama baru:", userProfile.name);
    if (newName && newName.trim() !== "") {
        userProfile.name = newName.trim();
        
        const newPhone = prompt("Masukkan nomor telepon baru:", userProfile.phone);
        if (newPhone !== null) {
            userProfile.phone = newPhone.trim() || "-";
        }
        
        const newAddress = prompt("Masukkan alamat baru:", userProfile.address);
        if (newAddress !== null) {
            userProfile.address = newAddress.trim() || "-";
        }
        
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
        updateUserProfile();
        showMessage("Profil berhasil diperbarui!", "success");
    }
}

function logout() {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
        showMessage("Anda telah berhasil keluar. Sampai jumpa lagi!", "success");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    }
}

// ===============================
// FUNGSI GLOBAL
// ===============================
function selectFlight(asal, tujuan, maskapai, jam, harga) {
    const message = `Pilih penerbangan:\n\n` +
                   `Rute: ${asal} → ${tujuan}\n` +
                   `Maskapai: ${maskapai}\n` +
                   `Waktu: ${jam}\n` +
                   `Harga: Rp ${harga.toLocaleString("id-ID")}\n\n` +
                   `Lanjutkan pembayaran?`;
    
    if (confirm(message)) {
        const data = getLocalStorageData();
        
        const booking = {
            id: Date.now(),
            airline: maskapai,
            flightNumber: maskapai.substring(0, 2).toUpperCase() + Math.floor(100 + Math.random() * 900),
            route: `${asal} → ${tujuan}`,
            date: new Date().toISOString().split("T")[0],
            price: harga,
            status: "completed",
            bookingCode: `BOOK${Math.floor(100000 + Math.random() * 900000)}`
        };
        
        data.bookingHistory.unshift(booking);
        localStorage.setItem("bookingHistory", JSON.stringify(data.bookingHistory));
        
        data.userProfile.totalOrders = (data.userProfile.totalOrders || 0) + 1;
        localStorage.setItem("userProfile", JSON.stringify(data.userProfile));
        
        showMessage("Pemesanan berhasil! Tiket akan dikirim ke email Anda.", "success");
    }
}

function viewBookingDetail(bookingId) {
    const data = getLocalStorageData();
    const booking = data.bookingHistory.find(b => b.id === bookingId);
    if (!booking) {
        showMessage("Pemesanan tidak ditemukan", "error");
        return;
    }
    
    const detailMessage = `
    DETAIL PEMESANAN
    =================
    Kode Booking: ${booking.bookingCode}
    Maskapai: ${booking.airline}
    Penerbangan: ${booking.flightNumber}
    Rute: ${booking.route}
    Tanggal: ${new Date(booking.date).toLocaleDateString("id-ID")}
    Status: ${booking.status}
    Harga: Rp ${typeof booking.price === "number" ? booking.price.toLocaleString("id-ID") : booking.price}
    ${booking.fromFavorite ? "Sumber: Dari Favorit" : ""}
    `;
    
    alert(detailMessage);
}

function cancelBooking(bookingId) {
    if (confirm("Batalkan pemesanan ini?")) {
        const data = getLocalStorageData();
        const bookingIndex = data.bookingHistory.findIndex(b => b.id === bookingId);
        
        if (bookingIndex > -1) {
            data.bookingHistory[bookingIndex].status = "cancelled";
            localStorage.setItem("bookingHistory", JSON.stringify(data.bookingHistory));
            displayHistory();
            showMessage("Pemesanan telah dibatalkan", "success");
        } else {
            showMessage("Pemesanan tidak ditemukan", "error");
        }
    }
}

function downloadTicket(bookingId) {
    const data = getLocalStorageData();
    const booking = data.bookingHistory.find(b => b.id === bookingId);
    if (!booking) {
        showMessage("Pemesanan tidak ditemukan", "error");
        return;
    }
    
    const ticketContent = `
    ==================================
            E-TICKET TRAVEL.COM
    ==================================
    
    Kode Tiket: ${booking.bookingCode}
    Tanggal: ${new Date().toLocaleDateString("id-ID")}
    
    DETAIL PENERBANGAN
    ------------------
    Maskapai: ${booking.airline}
    Penerbangan: ${booking.flightNumber}
    Rute: ${booking.route}
    Tanggal: ${new Date(booking.date).toLocaleDateString("id-ID")}
    
    DETAIL PENUMPANG
    -----------------
    Nama: ${data.userProfile?.name || "Guest User"}
    
    INFORMASI HARGA
    ----------------
    Total: Rp ${typeof booking.price === "number" ? booking.price.toLocaleString("id-ID") : booking.price}
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
    
    const blob = new Blob([ticketContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tiket-${booking.bookingCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage("Tiket berhasil diunduh!", "success");
}

// ===============================
// FUNGSI PENCARIAN OTOMATIS DARI DESTINASI
// ===============================
function cariTiketKe(destinasi) {
    console.log("Mencari tiket ke:", destinasi);
    
    const kotaTujuan = document.getElementById("kotaTujuan");
    const kotaAsal = document.getElementById("kotaAsal");
    const flightForm = document.getElementById("flightForm");
    
    if (kotaTujuan) {
        kotaTujuan.value = destinasi;
        
        if (kotaAsal && !kotaAsal.value) {
            kotaAsal.value = "Jakarta (CGK)";
        }
        
        // Trigger form submit
        setTimeout(() => {
            if (flightForm) {
                flightForm.dispatchEvent(new Event('submit'));
                
                // Scroll ke hasil
                setTimeout(() => {
                    const resultSection = document.getElementById("result");
                    if (resultSection) {
                        resultSection.scrollIntoView({ behavior: "smooth" });
                    }
                }, 600);
            }
        }, 500);
    }
}

// ===============================
// INISIALISASI HALAMAN
// ===============================
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded");
    
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    console.log(`Halaman: ${currentPage}`);
    
    initNavigation();
    
    if (currentPage === "index.html" || currentPage === "" || currentPage.includes("index")) {
        initIndexPage();
    }
    else if (currentPage === "favorite.html" || currentPage.includes("favorite")) {
        initFavoritePage();
    }
    else if (currentPage === "history.html" || currentPage.includes("history")) {
        initHistoryPage();
    }
    else if (currentPage === "account.html" || currentPage.includes("account")) {
        initAccountPage();
    } else {
        initIndexPage();
    }
});