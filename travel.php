$trip_types = get_terms([
    'taxonomy'   => 'travel-type',
    'hide_empty' => false,
]);

echo '
<style>
input[type=text], input[type=url], input[type=tel], input[type=email] {
  min-height: 38px;
}
.td-container {
  margin-bottom: 50px;
}
#map {
  width: 100%;
  height: 400px;
  margin-top: 40px;
  border-radius: 10px;
}

div#budget-breakdown p {
    margin-bottom: 13px;
}

/* Overlay */
#loaderOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Loader content */
.loaderContent {
  text-align: center;
  color: #fff;
  font-size: 1.2rem;
}
.loaderContent .spinner-border {
  width: 3rem;
  height: 3rem;
}

#suggested-posts .suggested-post-item { 
	cursor: help; 
	padding: 12px 15px;
	border: 1px solid #dee2e6;
	border-radius: 6px;
	margin-bottom: 8px;
	background: white;
	transition: all 0.2s ease;
}

#suggested-posts .suggested-post-item:hover {
	background: #f8f9fa;
	border-color: #007bff;
	box-shadow: 0 2px 4px rgba(0,123,255,0.1);
}

#suggested-posts .suggested-post-item .arrival-time {
	min-width: 75px;
	font-size: 0.85rem;
	color: #666;
	font-weight: 600;
	text-align: center;
	background: #f8f9fa;
	padding: 2px 6px;
	border-radius: 4px;
	border: 1px solid #e9ecef;
}

#suggested-posts .suggested-post-item .waiting-time-display {
	min-width: 60px;
	height: 28px;
	font-size: 0.75rem;
	color: #666;
	font-weight: 600;
	text-align: center;
	background: #f8f9fa;
	padding: 4px 8px;
	border-radius: 4px;
	border: 1px solid #e9ecef;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

#suggested-posts .suggested-post-item .waiting-time-display:hover {
	background: #e9ecef;
	border-color: #007bff;
	color: #007bff;
}

#suggested-posts .suggested-post-item .waiting-time-display:active {
	transform: scale(0.98);
}

/* Custom Popup Styles */
.custom-popup {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 10000;
}

.popup-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(3px);
}

.popup-content {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: white;
	border-radius: 12px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	min-width: 350px;
	max-width: 90vw;
	overflow: hidden;
	animation: popupSlideIn 0.3s ease-out;
}

@keyframes popupSlideIn {
	from {
		opacity: 0;
		transform: translate(-50%, -60%);
	}
	to {
		opacity: 1;
		transform: translate(-50%, -50%);
	}
}

.popup-header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	padding: 20px;
	position: relative;
}

.popup-header h3 {
	margin: 0;
	font-size: 1.3rem;
	font-weight: 600;
}

.popup-close {
	position: absolute;
	top: 15px;
	right: 20px;
	background: none;
	border: none;
	color: white;
	font-size: 24px;
	cursor: pointer;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}

.popup-close:hover {
	background: rgba(255, 255, 255, 0.2);
	transform: scale(1.1);
}

.popup-body {
	padding: 25px;
}

.time-controls {
	display: flex;
	gap: 30px;
	justify-content: center;
	margin-bottom: 20px;
}

.time-section {
	text-align: center;
}

.time-section label {
	display: block;
	margin-bottom: 10px;
	font-weight: 600;
	color: #555;
	font-size: 14px;
}

.input-group {
	display: flex;
	align-items: center;
	gap: 8px;
}

.time-btn {
	width: 35px;
	height: 35px;
	border: 2px solid #667eea;
	background: white;
	color: #667eea;
	border-radius: 8px;
	font-size: 16px;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s;
}

.time-btn:hover {
	background: #667eea;
	color: white;
	transform: scale(1.05);
}

.time-input {
	width: 60px;
	height: 35px;
	text-align: center;
	border: 2px solid #e0e0e0;
	border-radius: 8px;
	font-size: 16px;
	font-weight: 600;
	transition: border-color 0.2s;
}

.time-input:focus {
	outline: none;
	border-color: #667eea;
}

.time-summary {
	text-align: center;
	padding: 15px;
	background: #f8f9fa;
	border-radius: 8px;
	font-size: 16px;
	font-weight: 600;
	color: #333;
	border: 2px solid #e0e0e0;
}

.popup-footer {
	padding: 20px;
	background: #f8f9fa;
	border-top: 1px solid #e0e0e0;
	display: flex;
	gap: 10px;
	justify-content: flex-end;
}

.popup-btn {
	padding: 10px 20px;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-weight: 500;
	transition: all 0.2s;
	font-size: 14px;
}

.cancel-btn {
	background: #6c757d;
	color: white;
}

.cancel-btn:hover {
	background: #5a6268;
	transform: translateY(-1px);
}

.save-btn {
	background: #667eea;
	color: white;
}

.save-btn:hover {
	background: #5a6fd8;
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Modal styling for waiting time */
.waiting-time-modal .modal-dialog {
	max-width: 300px;
}

.waiting-time-modal .modal-body {
	padding: 20px;
}

.waiting-time-controls {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
}

.waiting-time-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.waiting-time-section label {
	font-size: 0.8rem;
	color: #666;
	margin: 0;
}

.waiting-time-input-group {
	display: flex;
	align-items: center;
	gap: 4px;
}

.waiting-time-input {
	width: 50px;
	height: 32px;
	font-size: 0.9rem;
	text-align: center;
	padding: 4px 6px;
	border: 1px solid #ddd;
	border-radius: 4px;
}

.waiting-time-input:focus {
	outline: none;
	border-color: #007bff;
	box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.waiting-time-btn {
	width: 28px;
	height: 28px;
	font-size: 0.8rem;
	padding: 0;
	border: 1px solid #ddd;
	border-radius: 4px;
	background: #f8f9fa;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

.waiting-time-btn:hover {
	background: #e9ecef;
	border-color: #007bff;
	color: #007bff;
}

.waiting-time-btn:active {
	transform: scale(0.95);
}

.waiting-time-summary {
	font-size: 0.9rem;
	color: #666;
	text-align: center;
	padding: 8px 12px;
	background: #f8f9fa;
	border-radius: 4px;
	border: 1px solid #e9ecef;
	margin-top: 10px;
}

.form-check-input[type=checkbox] {
	min-width: 15px;
}

.remove-stop i::after {
    content: "×";
    display: inline-block;
    font-weight: 700;
    line-height: 18px;
    font-size: 25px;
    color: #fff;
}
</style>
<!-- Google Maps Places API -->
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC9fL-PtseTc-6aGNWmtUo-Sg21cNrnKzI&libraries=places"></script>

<!-- Loader Overlay -->
<div id="loaderOverlay">
  <div class="loaderContent">
    <div class="spinner-border text-light" role="status"></div>
    <p class="mt-3">Generating...</p>
  </div>
</div>

<div class="my-5 td-container">
  <h3 class="text-center text-bold mt-1 mb-4" style="font-weight: 800; color: #305387;">Plan Your Trip</h3>

  <form id="trip-form" class="row g-3">

	<!-- Budget -->
    <div class="col-md-6">
      <label class="form-label"><i class="fas fa-wallet"></i> Budget</label>
      <div class="input-group w-100">
        <select class="form-select" id="currency" style="max-width: 100px;">
          <option value="LKR">LKR</option>
          <option value="USD">USD</option>
        </select>
        <input type="number" class="form-control" id="budgetAmount" placeholder="Budget" min="1">
      </div>
    </div>
	
	<!-- PAX -->
    <div class="col-md-6">
      <label class="form-label"><i class="fas fa-map-marker-alt"></i> Pax</label>
      <input type="number" id="pax" name="pax" class="form-control">
    </div>
	
    <!-- Start Location -->
    <div class="col-md-6">
      <label class="form-label"><i class="fas fa-map-marker-alt"></i> Start Location</label>
      <input type="text" id="startLocation" class="form-control" placeholder="Enter start location">
      <input type="hidden" id="startLat" name="startLat">
      <input type="hidden" id="startLng" name="startLng">
    </div>

    <!-- End Location -->
    <div class="col-md-6">
      <label class="form-label"><i class="fas fa-flag-checkered"></i> End Location</label>
      <input type="text" id="endLocation" class="form-control" placeholder="Enter end location">
      <input type="hidden" id="endLat" name="endLat">
      <input type="hidden" id="endLng" name="endLng">
    </div>
	
	<!-- Return Location -->
	<div class="col-md-6">
	  <label class="form-label"><i class="fas fa-undo-alt"></i> Return Location</label>
	  <input type="text" id="returnLocation" class="form-control" placeholder="Enter return location (STILL DEVELOPING)">
	  <input type="hidden" id="returnLat">
	  <input type="hidden" id="returnLng">
	</div>
	
	<!-- Custom Stops Section -->
	<div class="col-12">
	  <label class="form-label"><i class="fas fa-map-pin"></i> Additional Stops (to change directions)</label>
	  <div id="customStopsContainer" class="row g-2"></div>
	  <button type="button" id="addStopBtn" class="btn btn-outline-secondary mt-2">
		<i class="fas fa-plus"></i> Add Stop
	  </button>
	</div>

    <!-- Start Date + Time -->
    <div class="col-md-3">
      <label class="form-label"><i class="fas fa-calendar-day"></i> Start Date</label>
      <input type="date" id="startDate" class="form-control">
    </div>
    <div class="col-md-3">
      <label class="form-label"><i class="fas fa-clock"></i> Start Time</label>
      <input type="time" id="startTime" class="form-control">
    </div>

    <!-- End Date + Time -->
    <div class="col-md-3">
      <label class="form-label"><i class="fas fa-calendar-day"></i> End Date</label>
      <input type="date" id="endDate" class="form-control">
    </div>
    <div class="col-md-3">
      <label class="form-label"><i class="fas fa-clock"></i> End Time</label>
      <input type="time" id="endTime" class="form-control">
    </div>

    <!-- Nights (readonly) -->
    <div class="col-md-3">
      <label class="form-label"><i class="fas fa-moon"></i> Nights</label>
      <input type="number" id="nights" class="form-control" readonly>
    </div>

    <!-- Trip Type Multi-Select -->
	<div class="col-md-3">
	  <label class="form-label"><i class="fas fa-map-marked-alt"></i> Trip Type</label>
	  <div class="dropdown">
		<button class="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="tripTypeDropdown" data-bs-toggle="dropdown" aria-expanded="false">
		  Select Trip Types
		</button>
		<ul class="dropdown-menu p-3" aria-labelledby="tripTypeDropdown" style="max-height:250px; overflow-y:auto;">';
		  if (!empty($trip_types) && !is_wp_error($trip_types)) {
			foreach ($trip_types as $type) {
			  echo '<li class="form-check">
					  <input class="form-check-input trip-type-checkbox" type="checkbox" value="' . esc_attr($type->slug) . '" id="tripType_' . esc_attr($type->slug) . '">
					  <label class="form-check-label" for="tripType_' . esc_attr($type->slug) . '">' . esc_html($type->name) . '</label>
					</li>';
			}
		  }
		echo '</ul>
	  </div>
	</div>

    <!-- Transport Mode -->
    <div class="col-md-3">
      <label class="form-label"><i class="fas fa-car-side"></i> Transport Mode</label>
      <select class="form-select" id="transportMode">
        <option value="">Select</option>
        <option value="private">Private Vehicle</option>
        <option value="rent">Rent Vehicle</option>
        <option value="public">Public</option>
      </select>
    </div>

    <!-- Transport Details -->
    <div class="col-md-3" id="transportDetailsContainer" style="display:none;">
      <label class="form-label">&nbsp;</label>
      <input type="number" id="transportDetails" class="form-control" placeholder="">
    </div>

    <!-- Accommodation Fields -->
    <div class="col-12 accommodation" style="display: none;">
      <label class="form-label"><i class="fas fa-bed"></i> Accommodation</label>
      <div id="accommodationFields" class="row g-2"></div>
    </div>
	
	<!-- Meals Section -->
	<div class="col-12 meals" style="display:none;">
	  <label class="form-label"><i class="fas fa-utensils"></i> Meals</label>
	  <div id="mealsFields" class="row g-3"></div>
	</div>
	
    <!-- Submit -->
    <div class="col-12">
      <button type="submit" class="btn btn-primary w-100">
        <i class="fas fa-search"></i> Generate Plan
      </button>
    </div>

  </form>

  <!-- Map -->
  <div class="row mt-4">
    <!-- Map column -->
    <div class="col-md-7">
      <h5 class="mb-3" style="font-weight:700;color:#305387;">Trip Route</h5>
      <div id="map" style="width:100%; height:500px; border-radius:10px; margin-top:0;"></div>
    </div>

    <!-- Sidebar column -->
    <div class="col-md-5">
      <h5 class="mb-3" style="font-weight:700;color:#305387;">Suggested Stops</h5>
      <!--div class="d-flex align-items-center mb-2" style="font-size: 0.85rem; color: #666; font-weight: 600;">
        <div class="arrival-time ms-2 me-3" style="background: transparent; border: none; padding: 0;">Arrival</div>
        <div class="me-2" style="min-width: 20px;">Select</div>
        <div class="me-2" style="min-width: 80px; text-align: center;">Add. Wait</div>
        <div>Location</div>
      </div-->
      <div id="suggested-posts" class="list-group" style="overflow-y:auto;border:1px solid #ddd;border-radius:8px; height:calc(100% - 370px); margin-bottom: 20px;"></div>
	  <div class="col-12">
		<h5 style="font-weight:700;color:#305387;">Budget Breakdown</h5>
		<div id="budget-breakdown" style="border:1px solid #ddd; border-radius:8px; padding:28px;">
		  <p style="display: flex; justify-content: space-between;"><strong>Total Budget:</strong> <span id="bb-total">0</span></p>
		  <p style="display: flex; justify-content: space-between;"><strong>Transport:</strong> <span id="bb-transport">0</span></p>
		  <p style="display: flex; justify-content: space-between;"><strong>Entry Fees:</strong> <span id="bb-entry">0</span></p>
		  <p style="display: flex; justify-content: space-between;"><strong>Meals:</strong> <span id="bb-meals">0</span></p>
		  <p style="display: flex; justify-content: space-between; margin-bottom:0;"><strong>Remaining:</strong> <span id="bb-remaining">0</span></p>
	    </div>
      </div>
    </div>
  </div>
</div>

<!-- Custom Waiting Time Popup will be created dynamically and moved to td-outer-wrap -->

<script>
let startPlace, endPlace, returnPlace;
let map, directionsService, directionsRenderer;
let nearbyPosts = [];
let totalDist = 0;
let currentRoute = null; // Store current route for arrival time calculations
let currentWaitingTimeLocation = null; // Store current location being edited

function initSuggestedPopovers() {
  if (typeof window.bootstrap === "undefined") {
    setTimeout(initSuggestedPopovers, 150);
    return;
  }

  // Dispose old instances (avoids duplicates on re-render)
  document.querySelectorAll(\'#suggested-posts [data-bs-toggle="popover"]\').forEach(el => {
    const inst = bootstrap.Popover.getInstance(el);
    if (inst) inst.dispose();
  });

  // Init new ones
  document.querySelectorAll(\'#suggested-posts [data-bs-toggle="popover"]\').forEach(el => {
    new bootstrap.Popover(el, {
      container: \'body\',   // prevents clipping inside the scrollable sidebar
      html: true,
      trigger: \'hover focus\',
      placement: \'auto\'
      // sanitize: true (default) — safe since we only use <br>
    });
  });
}

const loaderOverlay = document.getElementById("loaderOverlay");

function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function getSelectedTripTypes() {
  return Array.from(document.querySelectorAll(".trip-type-checkbox:checked"))
              .map(cb => cb.value);
}

function openWaitingTimePopup(lat, lng) {
  console.log("Opening waiting time popup for:", lat, lng);
  currentWaitingTimeLocation = { lat: lat, lng: lng };
  
  // Hide any existing popovers first
  hideAllPopovers();
  
  // Get current waiting time values
  const displayEl = document.querySelector(`.waiting-time-display[data-lat="${lat}"][data-lng="${lng}"]`);
  let currentHours = 0;
  let currentMinutes = 0;
  
  if (displayEl && displayEl.dataset.hours && displayEl.dataset.minutes) {
    currentHours = parseInt(displayEl.dataset.hours) || 0;
    currentMinutes = parseInt(displayEl.dataset.minutes) || 0;
  }
  
  console.log("Current values:", currentHours, currentMinutes);
  
  // Create or get popup element
  let popupElement = document.getElementById("waitingTimePopup");
  
  if (!popupElement) {
    popupElement = createWaitingTimePopup();
  }
  
  // Move popup to td-outer-wrap if it exists
  const tdOuterWrap = document.getElementById("td-outer-wrap");
  if (tdOuterWrap && popupElement.parentNode !== tdOuterWrap) {
    console.log("Moving popup to td-outer-wrap");
    tdOuterWrap.appendChild(popupElement);
  }
  
  // Set popup values
  const hoursInput = document.getElementById("waitingHours");
  const minutesInput = document.getElementById("waitingMinutes");
  
  if (hoursInput && minutesInput) {
    hoursInput.value = currentHours;
    minutesInput.value = currentMinutes;
    updateWaitingTimeSummary();
    
    // Show popup
    console.log("Showing popup in td-outer-wrap");
    popupElement.style.display = "block";
    document.body.style.overflow = "hidden";
  } else {
    console.log("Popup inputs not found");
  }
}

function updateWaitingTimeSummary() {
  const hours = parseInt(document.getElementById("waitingHours").value) || 0;
  const minutes = parseInt(document.getElementById("waitingMinutes").value) || 0;
  
  let summaryText = "Total: 0 min";
  if (hours > 0 && minutes > 0) {
    summaryText = `Total: ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    summaryText = `Total: ${hours}h`;
  } else if (minutes > 0) {
    summaryText = `Total: ${minutes}m`;
  }
  
  document.getElementById("waitingTimeSummary").textContent = summaryText;
}

function saveWaitingTime() {
  if (!currentWaitingTimeLocation) return;
  
  const hours = parseInt(document.getElementById("waitingHours").value) || 0;
  const minutes = parseInt(document.getElementById("waitingMinutes").value) || 0;
  
  const lat = currentWaitingTimeLocation.lat;
  const lng = currentWaitingTimeLocation.lng;
  
  // Update display element
  const displayEl = document.querySelector(`.waiting-time-display[data-lat="${lat}"][data-lng="${lng}"]`);
  if (displayEl) {
    displayEl.dataset.hours = hours;
    displayEl.dataset.minutes = minutes;
    
    let displayText = "0 min";
    if (hours > 0 && minutes > 0) {
      displayText = `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      displayText = `${hours}h`;
    } else if (minutes > 0) {
      displayText = `${minutes}m`;
    }
    
    displayEl.textContent = displayText;
  }
  
  // Close popup
  closeWaitingTimePopup();
  
  // Refresh arrival times
  setTimeout(() => {
    refreshArrivalTimes();
  }, 100);
}

function closeWaitingTimePopup() {
  const popupElement = document.getElementById("waitingTimePopup");
  if (popupElement) {
    popupElement.style.display = "none";
    document.body.style.overflow = "";
  }
  
  // Hide any popovers that might still be showing
  hideAllPopovers();
}

function hideAllPopovers() {
  // Hide Bootstrap popovers if available
  if (typeof bootstrap !== "undefined" && bootstrap.Popover) {
    const popoverTriggerList = [].slice.call(document.querySelectorAll(\'[data-bs-toggle="popover"]\'));
    popoverTriggerList.forEach(function (popoverTriggerEl) {
      const popover = bootstrap.Popover.getInstance(popoverTriggerEl);
      if (popover) {
        popover.hide();
      }
    });
  }
  
  // Fallback: manually hide popover elements
  const popoverElements = document.querySelectorAll(\'.popover\');
  popoverElements.forEach(function(popover) {
    popover.style.display = \'none\';
    popover.classList.remove(\'show\');
  });
  
  // Also hide any tooltip elements
  const tooltipElements = document.querySelectorAll(\'.tooltip\');
  tooltipElements.forEach(function(tooltip) {
    tooltip.style.display = \'none\';
    tooltip.classList.remove(\'show\');
  });
}

function createWaitingTimePopup() {
  console.log("Creating waiting time popup dynamically");
  
  // Create the popup element
  const popup = document.createElement("div");
  popup.id = "waitingTimePopup";
  popup.className = "custom-popup";
  popup.style.display = "none";
  
  // Create popup HTML structure
  popup.innerHTML = `
    <div class="popup-overlay" onclick="closeWaitingTimePopup()"></div>
    <div class="popup-content">
      <div class="popup-header">
        <h3>Set Waiting Time</h3>
        <button class="popup-close" onclick="closeWaitingTimePopup()">&times;</button>
      </div>
      <div class="popup-body">
        <div class="time-controls">
          <div class="time-section">
            <label>Hours</label>
            <div class="input-group">
              <button type="button" class="time-btn" id="decreaseHours">-</button>
              <input type="number" class="time-input" id="waitingHours" value="0" min="0" max="5">
              <button type="button" class="time-btn" id="increaseHours">+</button>
            </div>
          </div>
          <div class="time-section">
            <label>Minutes</label>
            <div class="input-group">
              <button type="button" class="time-btn" id="decreaseMinutes">-</button>
              <input type="number" class="time-input" id="waitingMinutes" value="0" min="0" max="59" step="5">
              <button type="button" class="time-btn" id="increaseMinutes">+</button>
            </div>
          </div>
        </div>
        <div class="time-summary" id="waitingTimeSummary">Total: 0 min</div>
      </div>
      <div class="popup-footer">
        <button class="popup-btn cancel-btn" onclick="closeWaitingTimePopup()">Cancel</button>
        <button class="popup-btn save-btn" id="saveWaitingTime">Save</button>
      </div>
    </div>
  `;
  
  // Add event listeners for the dynamically created popup
  setTimeout(() => {
    setupPopupEventListeners();
  }, 100);
  
  return popup;
}

function setupPopupEventListeners() {
  // Event listeners for popup buttons
  const decreaseHours = document.getElementById("decreaseHours");
  const increaseHours = document.getElementById("increaseHours");
  const decreaseMinutes = document.getElementById("decreaseMinutes");
  const increaseMinutes = document.getElementById("increaseMinutes");
  const saveBtn = document.getElementById("saveWaitingTime");
  
  if (decreaseHours) {
    decreaseHours.addEventListener("click", function() {
      const input = document.getElementById("waitingHours");
      const value = Math.max(0, parseInt(input.value) - 1);
      input.value = value;
      updateWaitingTimeSummary();
    });
  }
  
  if (increaseHours) {
    increaseHours.addEventListener("click", function() {
      const input = document.getElementById("waitingHours");
      const value = Math.min(5, parseInt(input.value) + 1);
      input.value = value;
      updateWaitingTimeSummary();
    });
  }
  
  if (decreaseMinutes) {
    decreaseMinutes.addEventListener("click", function() {
      const input = document.getElementById("waitingMinutes");
      const value = Math.max(0, parseInt(input.value) - 5);
      input.value = value;
      updateWaitingTimeSummary();
    });
  }
  
  if (increaseMinutes) {
    increaseMinutes.addEventListener("click", function() {
      const input = document.getElementById("waitingMinutes");
      const value = Math.min(59, parseInt(input.value) + 5);
      input.value = value;
      updateWaitingTimeSummary();
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener("click", saveWaitingTime);
  }
  
  // Input event listeners
  const hoursInput = document.getElementById("waitingHours");
  const minutesInput = document.getElementById("waitingMinutes");
  
  if (hoursInput) {
    hoursInput.addEventListener("input", updateWaitingTimeSummary);
  }
  
  if (minutesInput) {
    minutesInput.addEventListener("input", updateWaitingTimeSummary);
  }
}

function calculateSequentialArrivalTimes(startTime) {
  if (!currentRoute) {
    console.log("No current route available");
    return {};
  }
  
  // Get checked suggested stops
  const checkedStops = [];
  document.querySelectorAll("#suggested-posts input[type=checkbox]:checked").forEach(cb => {
    const lat = parseFloat(cb.dataset.lat);
    const lng = parseFloat(cb.dataset.lng);
    const post = nearbyPosts.find(p => parseFloat(p.lat) === lat && parseFloat(p.lng) === lng);
    if (post) {
      checkedStops.push({
        lat: lat,
        lng: lng,
        visitTime: parseFloat(post.visit_time || 0.5) * 3600, // Convert hours to seconds
        title: post.title
      });
    }
  });
  
  if (checkedStops.length === 0) {
    console.log("No checked stops found");
    return {};
  }
  
  // Parse start time
  let startDateTime;
  try {
    if (startTime && startTime.includes(\'T\')) {
      startDateTime = new Date(startTime);
    } else {
      const startDate = document.getElementById("startDate").value;
      const startTimeInput = document.getElementById("startTime").value;
      if (startDate && startTimeInput) {
        startDateTime = new Date(`${startDate}T${startTimeInput}`);
      } else if (startDate) {
        startDateTime = new Date(`${startDate}T09:00`);
      } else {
        const today = new Date();
        const todayStr = today.toISOString().split(\'T\')[0];
        startDateTime = new Date(`${todayStr}T09:00`);
      }
    }
    
    if (isNaN(startDateTime.getTime())) {
      console.log("Invalid start date/time");
      return {};
    }
  } catch (error) {
    console.error("Error parsing start time:", error);
    return {};
  }
  
  console.log("Start time:", startDateTime);
  console.log("Checked stops:", checkedStops.length);
  
  // Calculate arrival times sequentially - simplified approach
  const arrivalTimes = {};
  let currentTime = startDateTime.getTime();
  
  // Use a simpler approach: calculate based on total route time divided by number of stops
  const totalRouteTime = currentRoute.legs.reduce((total, leg) => total + leg.duration.value, 0);
  const averageTimePerStop = totalRouteTime / Math.max(checkedStops.length, 1);
  
  // Calculate arrival times with visit time accumulation
  checkedStops.forEach((stop, index) => {
    const stopKey = `${stop.lat},${stop.lng}`;
    
    if (index === 0) {
      // First stop: start time + estimated driving time to first stop
      currentTime += (averageTimePerStop * 0.5) * 1000; // Half the average time to first stop
    } else {
      // Subsequent stops: previous arrival + previous visit time + driving time to next stop
      const prevStop = checkedStops[index - 1];
      currentTime += prevStop.visitTime * 1000; // Add visit time of previous stop
      currentTime += (averageTimePerStop * 0.8) * 1000; // Estimated driving time to next stop
    }
    
    arrivalTimes[stopKey] = new Date(currentTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  });
  
  console.log("Calculated arrival times:", arrivalTimes);
  return arrivalTimes;
}

function getDrivingTimeToStop(stopLat, stopLng) {
  // Find the leg that goes to this stop
  for (let i = 0; i < currentRoute.legs.length; i++) {
    const leg = currentRoute.legs[i];
    const legEnd = leg.end_location;
    
    const distance = getDistanceKm(
      { lat: legEnd.lat(), lng: legEnd.lng() },
      { lat: stopLat, lng: stopLng }
    );
    
    if (distance < 1) { // Within 1km, consider it the same location
      return leg.duration.value; // Return duration in seconds
    }
  }
  
  // Fallback: estimate based on distance (assuming 50 km/h average)
  const startLat = currentRoute.legs[0].start_location.lat();
  const startLng = currentRoute.legs[0].start_location.lng();
  const distance = getDistanceKm(
    { lat: startLat, lng: startLng },
    { lat: stopLat, lng: stopLng }
  );
  
  return (distance / 50) * 3600; // Convert to seconds
}

function getDrivingTimeBetweenStops(fromLat, fromLng, toLat, toLng) {
  // Find the leg between these two stops
  for (let i = 0; i < currentRoute.legs.length; i++) {
    const leg = currentRoute.legs[i];
    const legStart = leg.start_location;
    const legEnd = leg.end_location;
    
    const fromDistance = getDistanceKm(
      { lat: legStart.lat(), lng: legStart.lng() },
      { lat: fromLat, lng: fromLng }
    );
    
    const toDistance = getDistanceKm(
      { lat: legEnd.lat(), lng: legEnd.lng() },
      { lat: toLat, lng: toLng }
    );
    
    if (fromDistance < 1 && toDistance < 1) {
      return leg.duration.value;
    }
  }
  
  // Fallback: estimate based on distance
  const distance = getDistanceKm(
    { lat: fromLat, lng: fromLng },
    { lat: toLat, lng: toLng }
  );
  
  return (distance / 50) * 3600; // Convert to seconds
}

function refreshArrivalTimes() {
  console.log("=== refreshArrivalTimes called ===");
  const startDate = document.getElementById("startDate").value;
  const startTime = document.getElementById("startTime").value;
  
  console.log("Start date:", startDate, "Start time:", startTime);
  
  if (!startDate) {
    console.log("No start date, returning");
    return;
  }
  
  // Get all checked stops
  const checkedStops = [];
  document.querySelectorAll("#suggested-posts input[type=checkbox]:checked").forEach(cb => {
    const lat = parseFloat(cb.dataset.lat);
    const lng = parseFloat(cb.dataset.lng);
    const post = nearbyPosts.find(p => parseFloat(p.lat) === lat && parseFloat(p.lng) === lng);
    if (post) {
      // Get waiting time from display element
      const displayEl = document.querySelector(`.waiting-time-display[data-lat="${lat}"][data-lng="${lng}"]`);
      let hours = 0;
      let minutes = 0;
      
      if (displayEl && displayEl.dataset.hours && displayEl.dataset.minutes) {
        hours = parseFloat(displayEl.dataset.hours) || 0;
        minutes = parseFloat(displayEl.dataset.minutes) || 0;
      }
      
      const totalWaitingTime = (hours * 60) + minutes; // Total in minutes
      
      checkedStops.push({
        lat: lat,
        lng: lng,
        visitTime: parseFloat(post.visit_time || 0.5) * 3600, // Convert to seconds
        waitingTime: totalWaitingTime * 60, // Convert minutes to seconds
        title: post.title
      });
    }
  });
  
  console.log("Checked stops found:", checkedStops.length);
  
  if (checkedStops.length === 0) {
    console.log("No checked stops, returning");
    return;
  }
  
  // Parse start time
  let startDateTime;
  try {
    if (startDate && startTime) {
      startDateTime = new Date(`${startDate}T${startTime}`);
    } else if (startDate) {
      startDateTime = new Date(`${startDate}T09:00`);
    } else {
      console.log("No start date/time, returning");
      return;
    }
    
    if (isNaN(startDateTime.getTime())) {
      console.log("Invalid start date/time, returning");
      return;
    }
    
    console.log("Start date/time parsed successfully:", startDateTime);
  } catch (error) {
    console.log("Error parsing start time:", error);
    return;
  }
  
  // Calculate total visit time
  const totalVisitTime = checkedStops.reduce((total, stop) => total + stop.visitTime, 0);
  
  // Get total driving time from route or estimate
  let totalDrivingTime = 0;
  if (currentRoute && currentRoute.legs) {
    totalDrivingTime = currentRoute.legs.reduce((total, leg) => total + leg.duration.value, 0);
    console.log("Using route driving time:", totalDrivingTime, "seconds");
  } else {
    // Fallback: estimate 1 hour driving per stop
    totalDrivingTime = checkedStops.length * 3600;
    console.log("Using fallback driving time:", totalDrivingTime, "seconds");
  }
  
  // Calculate arrival times
  let currentTime = startDateTime.getTime();
  const arrivalTimes = {};
  
  checkedStops.forEach((stop, index) => {
    const stopKey = `${stop.lat},${stop.lng}`;
    
    if (index === 0) {
      // First stop: start time + portion of driving time
      const drivingTimeToFirst = totalDrivingTime / checkedStops.length;
      currentTime += drivingTimeToFirst * 1000;
    } else {
      // Subsequent stops: add previous visit time + waiting time + driving time to next
      const prevStop = checkedStops[index - 1];
      currentTime += prevStop.visitTime * 1000; // Add visit time
      currentTime += prevStop.waitingTime * 1000; // Add waiting time
      currentTime += (totalDrivingTime / checkedStops.length) * 1000; // Add driving time
    }
    
    arrivalTimes[stopKey] = new Date(currentTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    
    console.log(`Stop ${index + 1} (${stop.title}): ${arrivalTimes[stopKey]}`);
  });
  
  console.log("All arrival times calculated:", arrivalTimes);
  
  // Update all suggested posts
  document.querySelectorAll("#suggested-posts .suggested-post-item").forEach((item, index) => {
    const checkbox = item.querySelector("input[type=checkbox]");
    if (checkbox) {
      const lat = checkbox.dataset.lat;
      const lng = checkbox.dataset.lng;
      const stopKey = `${lat},${lng}`;
      
      let arrivalTime = "N/A";
      if (checkbox.checked && arrivalTimes[stopKey]) {
        arrivalTime = arrivalTimes[stopKey];
        console.log(`Setting arrival time for ${stopKey}: ${arrivalTime}`);
      } else {
        console.log(`No arrival time for ${stopKey}, checkbox checked: ${checkbox.checked}`);
      }
      
      // Update the arrival time display
      const timeElement = item.querySelector(".arrival-time");
      if (timeElement) {
        timeElement.innerHTML = arrivalTime;
        console.log(`Updated DOM element with: ${arrivalTime}`);
      } else {
        console.log("No time element found in DOM");
      }
      
      // Update popover content
      const post = nearbyPosts.find(p => parseFloat(p.lat) === parseFloat(lat) && parseFloat(p.lng) === parseFloat(lng));
      if (post) {
        const displayEl = item.querySelector(".waiting-time-display");
        let waitingTimeText = "0 min";
        
        if (displayEl && displayEl.dataset.hours && displayEl.dataset.minutes) {
          const hours = parseInt(displayEl.dataset.hours) || 0;
          const minutes = parseInt(displayEl.dataset.minutes) || 0;
          
          if (hours > 0 && minutes > 0) {
            waitingTimeText = `${hours}h ${minutes}m`;
          } else if (hours > 0) {
            waitingTimeText = `${hours}h`;
          } else if (minutes > 0) {
            waitingTimeText = `${minutes}m`;
          }
        }
        
        item.setAttribute(
          "data-bs-content",
          `Entry Fee: ${post.entry_fees || 0}<br>Visit Time: ${(post.visit_time || 0.5)} hrs<br>Additional Waiting: ${waitingTimeText}<br>Arrival Time: ${arrivalTime}`
        );
      }
    }
  });
  
  // Reinitialize popovers with updated content
  initSuggestedPopovers();
}

function calculateSimpleArrivalTime(startDate, startTime, stopIndex) {
  try {
    let startDateTime;
    if (startDate && startTime) {
      startDateTime = new Date(`${startDate}T${startTime}`);
    } else if (startDate) {
      startDateTime = new Date(`${startDate}T09:00`);
    } else {
      return "N/A";
    }
    
    if (isNaN(startDateTime.getTime())) {
      console.log("Invalid date/time");
      return "N/A";
    }
    
    // Add 2.5 hours per stop (2h drive + 0.5h visit)
    const hoursToAdd = stopIndex * 2.5;
    const arrivalDateTime = new Date(startDateTime.getTime() + (hoursToAdd * 60 * 60 * 1000));
    
    const result = arrivalDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    
    console.log("Calculated arrival time:", result, "for stop index:", stopIndex);
    return result;
  } catch (error) {
    console.error("Error in simple calculation:", error);
    return "N/A";
  }
}

function calculateFallbackArrivalTime(startDate, startTime, stopIndex) {
  try {
    let startDateTime;
    if (startDate && startTime) {
      startDateTime = new Date(`${startDate}T${startTime}`);
    } else if (startDate) {
      startDateTime = new Date(`${startDate}T09:00`);
    } else {
      return "N/A";
    }
    
    if (isNaN(startDateTime.getTime())) {
      return "N/A";
    }
    
    // Simple fallback: add 2 hours per stop + 1 hour visit time
    const hoursToAdd = (stopIndex * 3) + 1; // 2h drive + 1h visit per stop
    const arrivalDateTime = new Date(startDateTime.getTime() + (hoursToAdd * 60 * 60 * 1000));
    
    return arrivalDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (error) {
    console.error("Error in fallback calculation:", error);
    return "N/A";
  }
}

function addCustomStopField(value = "") {
  const container = document.getElementById("customStopsContainer");

  const col = document.createElement("div");
  col.className = "col-md-6 d-flex align-items-center mb-2";
  col.innerHTML = `
    <input type="text" class="form-control custom-stop-input me-2" placeholder="Enter stop" value="${value}">
    <button type="button" class="btn btn-sm btn-danger remove-stop"><i class="fas fa-times"></i></button>
  `;

  container.appendChild(col);

  // Autocomplete for new stop
  const input = col.querySelector(".custom-stop-input");
  const autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: "lk" }
  });
  autocomplete.addListener("place_changed", function() {
    displayMapDirections();
  });

  // Remove button
  col.querySelector(".remove-stop").addEventListener("click", () => {
    col.remove();
    displayMapDirections();
  });
}

document.getElementById("addStopBtn").addEventListener("click", () => addCustomStopField());

function updateMealsFields() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const mealsCont = document.querySelector(".meals");
  const container = document.getElementById("mealsFields");

  container.innerHTML = "";
  mealsCont.style.display = "none";

  if (!startDate || !endDate) return;

  const start = new Date(`${startDate}T${startTime || "00:00"}`);
  const end = new Date(`${endDate}T${endTime || "23:59"}`);
  const days = Math.max(1, Math.ceil((end - start) / (1000*60*60*24)));

  for (let i = 1; i <= days; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + (i - 1));

    const dayCol = document.createElement("div");
    dayCol.className = "col-12 border rounded p-3 mb-2";
    dayCol.innerHTML = `<h6 style="font-weight:600;">Day ${i} - ${dayDate.toDateString()}</h6>`;

    // Meals row
    const mealsRow = document.createElement("div");
    mealsRow.className = "row g-2";

    // Breakfast
    if (!(i < 2 && start.getHours() > 10)) { // skip if trip starts after breakfast
      mealsRow.innerHTML += `
        <div class="col-md-4">
          <input type="number" class="form-control meal-input" 
                 data-day="${i}" data-meal="breakfast" placeholder="Breakfast Cost">
        </div>`;
    }

    // Lunch
    if (!(i < 2 && start.getHours() > 10) && !(i === days && end.getHours() < 11)) {
      mealsRow.innerHTML += `
        <div class="col-md-4">
          <input type="number" class="form-control meal-input" 
                 data-day="${i}" data-meal="lunch" placeholder="Lunch Cost">
        </div>`;
    }

    // Dinner
    if (!(i < 2 && start.getHours() > 14) && !(i === days && end.getHours() < 24)) {
      mealsRow.innerHTML += `
        <div class="col-md-4">
          <input type="number" class="form-control meal-input" 
                 data-day="${i}" data-meal="dinner" placeholder="Dinner Cost">
        </div>`;
    }

    dayCol.appendChild(mealsRow);
    container.appendChild(dayCol);
  }

  mealsCont.style.display = "block";

  // Rebind listeners
  document.querySelectorAll(".meal-input").forEach(input => {
    input.addEventListener("input", () => updateBudget());
  });
}

function updateBudget(totalDistKm = totalDist) {
  const currency = document.getElementById("currency").value;
  const budget = parseFloat(document.getElementById("budgetAmount").value) || 0;

  // 1. Entry Fees
  let entryFees = 0;
  document.querySelectorAll("#suggested-posts input[type=checkbox]:checked").forEach(cb => {
    const lat = parseFloat(cb.dataset.lat);
    const lng = parseFloat(cb.dataset.lng);
    const post = nearbyPosts.find(p => parseFloat(p.lat) === lat && parseFloat(p.lng) === lng);
    if (post) entryFees += parseFloat(post.entry_fees || 0);
  });

  // 2. Transport
  const mode = document.getElementById("transportMode").value;
  const details = parseFloat(document.getElementById("transportDetails").value) || 0;
  const pax = parseInt(document.getElementById("pax").value || 1, 10);
  let transportCost = 0;
  if (mode === "private" && details > 0 && totalDistKm > 0) {
    transportCost = (totalDistKm / details) * 350;
  } else if (mode === "rent" && details > 0 && totalDistKm > 0) {
    transportCost = details * totalDistKm;
  } else if (mode === "public") {
    transportCost = details;
  }

  // 3. Meals
  let mealsCost = 0;
  document.querySelectorAll(".meal-input").forEach(input => {
    mealsCost += parseFloat(input.value || 0);
  });

  // 4. Remaining
  const remaining = budget - (transportCost + (entryFees * pax) + (mealsCost * pax));

  // Update UI
  document.getElementById("bb-total").innerText = `${currency} ${budget.toFixed(2)}`;
  document.getElementById("bb-entry").innerText = `${currency} ${entryFees.toFixed(2)} x ${pax}`;
  document.getElementById("bb-transport").innerText = `${currency} ${transportCost.toFixed(2)}`;
  document.getElementById("bb-meals").innerText = `${currency} ${mealsCost.toFixed(2)} x ${pax}`;
  const remainingEl = document.getElementById("bb-remaining");
  if (remaining < 0) {
    remainingEl.innerHTML = `<span style="color:red; font-weight:bold;">${currency} ${remaining.toFixed(2)} — Over budget!</span>`;
  } else {
    remainingEl.innerHTML = `${currency} ${remaining.toFixed(2)}`;
  }
}

// Google Places Autocomplete
function initAutocomplete() {
  const startInput = document.getElementById("startLocation");
  const endInput = document.getElementById("endLocation");
  const returnInput = document.getElementById("returnLocation");

  const startAutocomplete = new google.maps.places.Autocomplete(startInput, {
    componentRestrictions: { country: "lk" }
  });
	  
  startAutocomplete.addListener("place_changed", function() {
    startPlace = startAutocomplete.getPlace();
    if (startPlace?.geometry) {	  
      document.getElementById("startLat").value = startPlace.geometry.location.lat();
      document.getElementById("startLng").value = startPlace.geometry.location.lng();
      displayMapDirections();
    }
  });
  
  const returnAutocomplete = new google.maps.places.Autocomplete(returnInput, {
    componentRestrictions: { country: "lk" }
  });
  returnAutocomplete.addListener("place_changed", function () {
    const place = returnAutocomplete.getPlace();
    if (!place.geometry) return;

    document.getElementById("returnLat").value = place.geometry.location.lat();
    document.getElementById("returnLng").value = place.geometry.location.lng();
  });

  const endAutocomplete = new google.maps.places.Autocomplete(endInput, {
    componentRestrictions: { country: "lk" }
  });
  endAutocomplete.addListener("place_changed", function() {
    endPlace = endAutocomplete.getPlace();
    if (endPlace?.geometry) {
      document.getElementById("endLat").value = endPlace.geometry.location.lat();
      document.getElementById("endLng").value = endPlace.geometry.location.lng();
      displayMapDirections();
    }
  });
}

// Initialize map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 7.8731, lng: 80.7718},
    zoom: 7
  });
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({map: map});
}

function getDistanceKm(p1, p2) {
    const R = 6371; // Earth radius km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(p1.lat * Math.PI/180) * Math.cos(p2.lat * Math.PI/180) * Math.sin(dLng/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
function resamplePath(path, stepKm = 0.5) {
    if(path.length === 0) return [];
    const resampled = [path[0]]; // always include start point
    let accumulated = 0;

    for(let i=1; i<path.length; i++) {
        let dist = getDistanceKm(path[i-1], path[i]);
        accumulated += dist;
        if(accumulated >= stepKm) {
            resampled.push(path[i]);
            accumulated = 0;
        }
    }

    return resampled;
}

let activeMarkers = [];

// Update findNearbyPosts
function findNearbyPosts(route) {	
    const path = [];
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            step.path.forEach(p => path.push({lat: p.lat(), lng: p.lng()}));
        });
    });

    const sampledPath = resamplePath(path, 0.5);
	const tripTypes = getSelectedTripTypes();

    // Disable submit until data comes
	loaderOverlay.style.display = "flex";
    const submitBtn = document.querySelector("#trip-form button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.innerHTML = \'<i class="fas fa-spinner fa-spin"></i> Updating...\';

    fetch("' . admin_url('admin-ajax.php') . '?action=find_nearby_posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
			path: sampledPath,
			tripTypes: tripTypes
		})
    })
    .then(res => res.json())
    .then(data => {
        nearbyPosts = data.posts;

        // Clear old markers
        activeMarkers.forEach(m => m.setMap(null));
        activeMarkers = [];

        const infowindow = new google.maps.InfoWindow();
		
		const svgMarker = {
			path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
			fillColor: "blue",
			fillOpacity: 0.6,
			strokeWeight: 0,
			rotation: 0,
			scale: 2,
			anchor: new google.maps.Point(0, 20),
		  };

        // Add new markers
        // Clear old sidebar
		document.getElementById("suggested-posts").innerHTML = "";

		// Add new markers + sidebar
		data.posts.forEach((post, index) => {
			if(!post.lat || !post.lng) return;

			const marker = new google.maps.Marker({
				position: { lat: parseFloat(post.lat), lng: parseFloat(post.lng) },
				map: map,
				title: decodeHtml(post.title),
				animation: google.maps.Animation.DROP,
				icon: svgMarker,
			});

			activeMarkers.push(marker);

			// Calculate arrival time (will be updated after all posts are created)
			const arrivalTime = "N/A";

			// Sidebar item with arrival time and checkbox (checked by default)
			const listItem = document.createElement("div");
			listItem.className = "suggested-post-item d-flex align-items-center";
			listItem.setAttribute("tabindex", "0"); // allows focus trigger
			listItem.setAttribute("role", "button");

			// Popover attrs
			listItem.setAttribute("data-bs-toggle", "popover");
			listItem.setAttribute("data-bs-trigger", "hover focus");
			listItem.setAttribute("data-bs-placement", "top");
			listItem.setAttribute("title", decodeHtml(post.title));
			listItem.setAttribute("data-bs-html", "true");
			listItem.setAttribute(
			  "data-bs-content",
			  `Entry Fee: ${post.entry_fees || 0}<br>Visit Time: ${(post.visit_time || 0.5)} hrs<br>Additional Waiting: 0 min<br>Arrival Time: ${arrivalTime}`
			);

			listItem.innerHTML = `
			  <div class="d-flex align-items-center w-100">
				<div class="arrival-time me-3">
				  ${arrivalTime}
				</div>
				<input type="checkbox" class="form-check-input me-2" 
					   data-index="${activeMarkers.length-1}" 
					   data-lat="${post.lat}" data-lng="${post.lng}" checked>
				<div class="waiting-time-display me-2" 
					 data-lat="${post.lat}" data-lng="${post.lng}"
					 data-hours="0" data-minutes="0"
					 onclick="event.stopPropagation(); console.log(\'Click detected\'); openWaitingTimePopup(\'${post.lat}\', \'${post.lng}\')">
				  0 min
				</div>
				<span class="flex-grow-1">${decodeHtml(post.title)}</span>
			  </div>
			`;

			document.getElementById("suggested-posts").appendChild(listItem);

			initSuggestedPopovers();
			updateRouteWithStops();
			
			// Handle checkbox toggle
			listItem.querySelector("input[type=checkbox]").addEventListener("change", function() {
				const idx = parseInt(this.getAttribute("data-index"));
				const checked = this.checked;
				activeMarkers[idx].setVisible(checked);
				
				updateRouteWithStops();
				// Refresh arrival times when checkbox is toggled
				setTimeout(() => {
					refreshArrivalTimes();
				}, 100);
			});
			


			// Infowindow on click
			marker.addListener("click", () => {
				infowindow.setContent(`<strong>${post.title}</strong>`);
				infowindow.open(map, marker);
			});
		});

        // Re-enable submit
        submitBtn.disabled = false;
        submitBtn.innerHTML = \'<i class="fas fa-search"></i> Generate Plan\';
		loaderOverlay.style.display = "none";
		
		// Refresh arrival times after all posts are created
		setTimeout(() => {
			console.log("Calling refreshArrivalTimes after posts created");
			refreshArrivalTimes();
		}, 100);
    })
    .catch(err => {
        console.error(err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = \'<i class="fas fa-search"></i> Generate Plan\';
		loaderOverlay.style.display = "none";
    });
}

// Update displayMapDirections to call findNearbyPosts
function displayMapDirections() {
  if (!startPlace?.geometry || !endPlace?.geometry) return;
  
  const accommodations = Array.from(document.querySelectorAll(".accommodation-input"))
    .map(input => input.value)
    .filter(v => v);
	
  const customStops = Array.from(document.querySelectorAll(".custom-stop-input"))
    .map(input => input.value)
    .filter(v => v);

  const waypoints = [
    ...accommodations.map(loc => ({ location: loc, stopover: true })),
    ...customStops.map(loc => ({ location: loc, stopover: true }))
  ];

  directionsService.route({
    origin: startPlace.formatted_address || startPlace.name,
    destination: endPlace.formatted_address || endPlace.name,
    waypoints: waypoints,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(response);
      currentRoute = response.routes[0]; // Store current route for arrival time calculations
	  findNearbyPosts(response.routes[0]);
	  
	  setTimeout(updateRouteWithStops, 500);

	  // Get total distance
	  response.routes[0].legs.forEach(leg => {
		totalDist += leg.distance.value; // meters
	  });
	  totalDist = (totalDist / 1000).toFixed(1); // km
	  updateBudget();

	  // Add distance overlay
	  const distanceDiv = document.createElement("div");
	  distanceDiv.style.background = "white";
	  distanceDiv.style.padding = "6px 12px";
	  distanceDiv.style.border = "1px solid #ccc";
	  distanceDiv.style.borderRadius = "8px";
	  distanceDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
	  distanceDiv.style.fontWeight = "600";
	  distanceDiv.innerText = `Total Distance: ${totalDist} km`;

	  // Clear previous control
	  const controls = map.controls[google.maps.ControlPosition.TOP_CENTER];
	  controls.clear();
	  controls.push(distanceDiv);
    }
  });
}

document.getElementById("pax").addEventListener("change", () => updateBudget());
document.getElementById("transportMode").addEventListener("change", () => updateBudget());
document.getElementById("transportDetails").addEventListener("input", () => updateBudget());
document.querySelectorAll("#suggested-posts input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", () => updateBudget());
});
document.getElementById("budgetAmount").addEventListener("input", () => updateBudget());

function updateRouteWithStops() {
	
    // Get start & end either from startPlace/endPlace or fallback to form inputs
    const startLatInput = document.getElementById("startLat").value;
    const startLngInput = document.getElementById("startLng").value;
    const endLatInput = document.getElementById("endLat").value;
    const endLngInput = document.getElementById("endLng").value;
	const returnLatInput = document.getElementById("returnLat").value;
    const returnLngInput = document.getElementById("returnLng").value;

    let start, end, returnL;

    if (startPlace?.geometry) {
        start = startPlace.formatted_address || startPlace.name;
    } else if (startLatInput && startLngInput) {
        start = new google.maps.LatLng(parseFloat(startLatInput), parseFloat(startLngInput));
    } else {
        return; // no start defined
    }

    if (endPlace?.geometry) {
        end = endPlace.formatted_address || endPlace.name;
    } else if (endLatInput && endLngInput) {
        end = new google.maps.LatLng(parseFloat(endLatInput), parseFloat(endLngInput));
    } else {
        return; // no end defined
    }
	
	if (returnPlace?.geometry) {
        returnL = returnPlace.formatted_address || returnPlace.name;
    } else if (returnLatInput && returnLngInput) {
        returnL = new google.maps.LatLng(parseFloat(returnLatInput), parseFloat(returnLngInput));
    } else {
        return; // no return defined
    }

    // Collect waypoints from accommodations
    const accommodations = Array.from(document.querySelectorAll(".accommodation-input"))
        .map(acc => acc.value)
        .filter(v => v);

    let waypoints = accommodations.map(acc => ({
        location: acc,
        stopover: true
    }));

    // Add checked suggested stops
    document.querySelectorAll("#suggested-posts input[type=checkbox]:checked")
        .forEach(cb => {
            waypoints.push({
                location: new google.maps.LatLng(
                    parseFloat(cb.dataset.lat),
                    parseFloat(cb.dataset.lng)
                ),
                stopover: true
            });
        });
		
	// Add custom stops
	document.querySelectorAll(".custom-stop-input").forEach(input => {
	  if (input.value.trim()) {
		waypoints.push({
		  location: input.value,
		  stopover: true
		});
	  }
	});
	
	if (returnL) {
		waypoints.push({
		  location: document.getElementById("returnLocation").value,
		  stopover: true
		});
	}

    // Request directions
    directionsService.route(
        {
            origin: start,
            destination: returnL ?? end,
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
        },
        (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
                currentRoute = response.routes[0]; // Store current route for arrival time calculations

                // Show total distance and duration
                totalDur = 0; totalDist = 0;
                response.routes[0].legs.forEach(leg => {
                    totalDist += leg.distance.value;
                    totalDur += leg.duration.value;
                });
                totalDist = (totalDist / 1000).toFixed(1);
                const hrs = Math.floor(totalDur / 3600);
                const mins = Math.round((totalDur % 3600) / 60);

                const distanceDiv = document.createElement("div");
                distanceDiv.style.background = "white";
                distanceDiv.style.padding = "6px 12px";
                distanceDiv.style.border = "1px solid #ccc";
                distanceDiv.style.borderRadius = "8px";
                distanceDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
                distanceDiv.style.fontWeight = "600";
                distanceDiv.innerText = `Total Distance: ${totalDist} km | Duration: ${hrs}h ${mins}m`;

                const controls = map.controls[google.maps.ControlPosition.TOP_CENTER];
                controls.clear();
                controls.push(distanceDiv);
				
				updateBudget();
				refreshArrivalTimes(); // Update arrival times when route changes
            }
        }
    );
}

// Update nights + accommodations
function updateAccommodationFields() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const nightsInput = document.getElementById("nights");
  const accommodationCont = document.querySelector(".accommodation");
  const container = document.getElementById("accommodationFields");

  container.innerHTML = "";
  nightsInput.value = "";
  accommodationCont.style.display = "none";

  if (!startDate || !endDate) return;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.max(0, Math.floor((end - start)/(1000*60*60*24)));

  if (nights < 1) return;

  nightsInput.value = nights;

  for (let i = 1; i <= nights; i++) {
    const col = document.createElement("div");
    col.className = "col-md-6";
    col.innerHTML = `
      <input type="text" id="accommodationNight${i}" 
             class="form-control accommodation-input" 
             placeholder="Night ${i} Accommodation">
      <input type="hidden" id="accommodationNight${i}-lat" name="accommodationNight${i}-lat">
      <input type="hidden" id="accommodationNight${i}-long" name="accommodationNight${i}-long">
    `;
    container.appendChild(col);

    const input = col.querySelector("input[type=text]");
    const autocomplete = new google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: "lk" }
    });
    autocomplete.addListener("place_changed", function() {
      const place = autocomplete.getPlace();
      if (place?.geometry) {
        document.getElementById(`accommodationNight${i}-lat`).value = place.geometry.location.lat();
        document.getElementById(`accommodationNight${i}-long`).value = place.geometry.location.lng();
        displayMapDirections();
      }
    });
  }

  accommodationCont.style.display = "block";
}

// Transport placeholder
document.getElementById("transportMode").addEventListener("change", function() {
  const value = this.value;
  const detailsContainer = document.getElementById("transportDetailsContainer");
  const detailsInput = document.getElementById("transportDetails");

  if(value === "private") {
    detailsContainer.style.display = "block";
    detailsInput.placeholder = "Fuel Consumption (e.g., 10 km/L)";
  } else if(value === "rent") {
    detailsContainer.style.display = "block";
    detailsInput.placeholder = "Price per km (e.g., 50 LKR/km)";
  } else if(value === "public") {
    detailsContainer.style.display = "block";
    detailsInput.placeholder = "Amount (e.g., 1500 LKR)";
  } else {
    detailsContainer.style.display = "none";
    detailsInput.placeholder = "";
  }
});

// Event listeners
document.getElementById("startDate").addEventListener("change", () => { updateAccommodationFields(); updateMealsFields(); refreshArrivalTimes(); });
document.getElementById("endDate").addEventListener("change", () => { updateAccommodationFields(); updateMealsFields(); });
document.getElementById("startTime").addEventListener("change", () => { updateMealsFields(); refreshArrivalTimes(); });
document.getElementById("endTime").addEventListener("change", updateMealsFields);
document.querySelectorAll(".trip-type-checkbox").forEach(cb => {
    cb.addEventListener("change", displayMapDirections);
});

// Prefill form
window.addEventListener("load", function() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has("start")) document.getElementById("startLocation").value = decodeURIComponent(urlParams.get("start"));
  if (urlParams.has("end")) document.getElementById("endLocation").value = decodeURIComponent(urlParams.get("end"));
  if (urlParams.has("start") && !urlParams.has("return")) document.getElementById("returnLocation").value = decodeURIComponent(urlParams.get("start"));
  if (urlParams.has("return")) document.getElementById("returnLocation").value = decodeURIComponent(urlParams.get("return"));
  if (urlParams.has("currency")) document.getElementById("currency").value = urlParams.get("currency");
  if (urlParams.has("budget")) document.getElementById("budgetAmount").value = urlParams.get("budget");
  document.getElementById("pax").value = urlParams.get("pax") ?? 1;
  if (urlParams.has("startDate")) document.getElementById("startDate").value = urlParams.get("startDate");
  if (urlParams.has("endDate")) document.getElementById("endDate").value = urlParams.get("endDate");

  if (urlParams.has("start-lat") && urlParams.has("start-long")) {
    startPlace = {
      geometry: { location: { lat: () => parseFloat(urlParams.get("start-lat")), lng: () => parseFloat(urlParams.get("start-long")) } },
      formatted_address: decodeURIComponent(urlParams.get("start"))
    };
    document.getElementById("startLat").value = startPlace.geometry.location.lat();
    document.getElementById("startLng").value = startPlace.geometry.location.lng();
	
	if (!urlParams.has("return-lat") && !urlParams.has("return-long")) {
		document.getElementById("returnLat").value = startPlace.geometry.location.lat();
    	document.getElementById("returnLng").value = startPlace.geometry.location.lng();
	}
  }
  if (urlParams.has("end-lat") && urlParams.has("end-long")) {
    endPlace = {
      geometry: { location: { lat: () => parseFloat(urlParams.get("end-lat")), lng: () => parseFloat(urlParams.get("end-long")) } },
      formatted_address: decodeURIComponent(urlParams.get("end"))
    };
    document.getElementById("endLat").value = endPlace.geometry.location.lat();
    document.getElementById("endLng").value = endPlace.geometry.location.lng();
  }
  
  if (urlParams.has("return-lat") && urlParams.has("return-long")) {
    returnPlace = {
      geometry: { location: { lat: () => parseFloat(urlParams.get("return-lat")), lng: () => parseFloat(urlParams.get("return-long")) } },
      formatted_address: decodeURIComponent(urlParams.get("end"))
    };
    document.getElementById("returnLat").value = returnPlace.geometry.location.lat();
    document.getElementById("returnLng").value = returnPlace.geometry.location.lng();
  }
  
  if (urlParams.has("accommodations")) {
    updateAccommodationFields();
    const accommodations = JSON.parse(urlParams.get("accommodations"));
    accommodations.forEach((acc, idx) => {
      const i = idx + 1;
      const input = document.getElementById(`accommodationNight${i}`);
      if (input) input.value = acc;
    });
  }

  initMap();
  initAutocomplete();
  displayMapDirections();
});

// Submit form
document.getElementById("trip-form").addEventListener("submit", function(e){
  e.preventDefault();

  const startLat = document.getElementById("startLat").value;
  const startLng = document.getElementById("startLng").value;
  const endLat = document.getElementById("endLat").value;
  const endLng = document.getElementById("endLng").value;

  const startDate = document.getElementById("startDate").value;
  const startTime = document.getElementById("startTime").value;
  const endDate = document.getElementById("endDate").value;
  const endTime = document.getElementById("endTime").value;

  const transportMode = document.getElementById("transportMode").value;
  const transportDetails = document.getElementById("transportDetails").value;
  const nights = document.getElementById("nights").value;

  const currency = document.getElementById("currency").value;
  const budget = document.getElementById("budgetAmount").value;
  const pax = document.getElementById("pax").value;

  const accommodations = Array.from(document.querySelectorAll(".accommodation-input")).map(el=>el.value);

  const params = new URLSearchParams({
    start: document.getElementById("startLocation").value,
    "start-lat": startLat,
    "start-long": startLng,
    end: document.getElementById("endLocation").value,
    "end-lat": endLat,
    "end-long": endLng,
	return: document.getElementById("returnLocation").value,
	"return-lat": document.getElementById("returnLat").value,
	"return-long": document.getElementById("returnLng").value,
    startDate, startTime, endDate, endTime,
    transportMode, transportDetails, 
	tripType: getSelectedTripTypes().join(","), 
	nights, currency, budget, pax,
    accommodations: JSON.stringify(accommodations)
  });

  window.location.href = "/plan-your-trip?" + params.toString();
});

window.addEventListener("load", function() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has("tripType")) {
    const typesFromUrl = urlParams.get("tripType").split(",");
    document.querySelectorAll(".trip-type-checkbox").forEach(cb => {
      cb.checked = typesFromUrl.includes(cb.value);
    });
  }
});

// Popup event listeners
document.getElementById("decreaseHours").addEventListener("click", function() {
  const input = document.getElementById("waitingHours");
  const value = Math.max(0, parseInt(input.value) - 1);
  input.value = value;
  updateWaitingTimeSummary();
});

document.getElementById("increaseHours").addEventListener("click", function() {
  const input = document.getElementById("waitingHours");
  const value = Math.min(5, parseInt(input.value) + 1);
  input.value = value;
  updateWaitingTimeSummary();
});

document.getElementById("decreaseMinutes").addEventListener("click", function() {
  const input = document.getElementById("waitingMinutes");
  const value = Math.max(0, parseInt(input.value) - 5);
  input.value = value;
  updateWaitingTimeSummary();
});

document.getElementById("increaseMinutes").addEventListener("click", function() {
  const input = document.getElementById("waitingMinutes");
  const value = Math.min(59, parseInt(input.value) + 5);
  input.value = value;
  updateWaitingTimeSummary();
});

document.getElementById("waitingHours").addEventListener("input", updateWaitingTimeSummary);
document.getElementById("waitingMinutes").addEventListener("input", updateWaitingTimeSummary);
document.getElementById("saveWaitingTime").addEventListener("click", saveWaitingTime);
</script>
';