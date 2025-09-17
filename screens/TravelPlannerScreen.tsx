import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import colors from '../colors';
import LocationInput from '../components/LocationInput';
import { calculateDistance, Location } from '../services/locationService';
import { cleanTripTypeName, fetchSuggestedStops, fetchTripTypes, getTripTypeIcon, TripType } from '../services/tripTypesService';

const { width } = Dimensions.get('window');

// Custom Toast Component
interface CustomToastProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

const CustomToast = ({ visible, message, onDismiss }: CustomToastProps) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    }
  }, [visible, opacity, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity,
          transform: [
            {
              translateY: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const TRANSPORT_MODES = [
  { id: 'private', name: 'Private Vehicle', icon: '🚗', description: 'Your own car' },
  { id: 'rent', name: 'Rent Vehicle', icon: '🚙', description: 'Rental car or bike' },
  { id: 'public', name: 'Public Transport', icon: '🚌', description: 'Bus, train, taxi' },
];


// Loading Overlay Component
interface LoadingOverlayProps {
  visible: boolean;
}

const LoadingOverlay = ({ visible }: LoadingOverlayProps) => {
  if (!visible) return null;
  
  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Updating...</Text>
      </View>
    </View>
  );
};

const TravelPlannerScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tripTypes, setTripTypes] = useState<TripType[]>([]);
  const [loadingTripTypes, setLoadingTripTypes] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'stops' | 'budget'>('map');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [tripData, setTripData] = useState({
    // Step 1: Basic Details
    startLocation: '',
    endLocation: '',
    returnLocation: '',
    startLocationData: null as Location | null,
    endLocationData: null as Location | null,
    returnLocationData: null as Location | null,
    additionalStops: [] as Array<{location: string, locationData: Location | null}>,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    budget: '',
    currency: 'LKR',
    pax: '1',
    
    // Step 2: Trip Type & Transport
    selectedTripTypes: [] as string[],
    transportMode: '',
    transportDetails: '',
    
    // Step 3: Accommodation
    accommodations: [] as string[],
    accommodationLocations: [] as (Location | null)[],
    
    // Step 4: Meals
    meals: [] as Array<{day: number, date: string, breakfast?: string, lunch?: string, dinner?: string}>,
    
    // Step 5: Map & Stops
    suggestedStops: [] as any[],
    selectedStops: [] as string[], // Track selected stops by their unique identifier
    customStops: [] as string[],
  });

  // Local UI state for pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const totalSteps = 5;

  // Suggested stop type (based on travel.php data.posts)
  type SuggestedStop = {
    title: string;
    lat: number;
    lng: number;
    entry_fees?: number;
    visit_time?: number; // hours
    arrival_time?: string; // estimated arrival time
    waiting_time?: number; // additional waiting time in minutes
  };

  // Ingest AJAX response from travel.php shape and update state
  const applySuggestedStopsFromAjax = (ajaxData: any) => {
    try {
      const posts = Array.isArray(ajaxData?.posts) ? ajaxData.posts : [];
      const stops: SuggestedStop[] = posts
        .filter((p: any) => p && p.lat && p.lng)
        .map((p: any) => ({
          title: String(p.title ?? 'Untitled'),
          lat: parseFloat(p.lat),
          lng: parseFloat(p.lng),
          entry_fees: p.entry_fees != null ? Number(p.entry_fees) : undefined,
          visit_time: p.visit_time != null ? Number(p.visit_time) : undefined,
        }));
      
      // Update the suggested stops
      updateTripData('suggestedStops', stops as any);
      
      // Select all suggested stops by default
      const allStopIds = stops.map((stop, idx) => `${stop.lat}_${stop.lng}_${idx}`);
      updateTripData('selectedStops', allStopIds);
      
      setActiveTab('stops');
    } catch (e) {
      console.warn('Failed to apply suggested stops:', e);
    }
  };

  // Expose helper for debugging in dev menu/console if needed
  // @ts-ignore
  (globalThis as any).applySuggestedStopsFromAjax = applySuggestedStopsFromAjax;

  // Fetch trip types from API
  useEffect(() => {
    loadTripTypes();
  }, []);

  const loadTripTypes = async () => {
    try {
      setLoadingTripTypes(true);
      const data = await fetchTripTypes();
      setTripTypes(data);
      
      // Select all trip types by default
      const allTripTypeSlugs = data.map(type => type.slug);
      updateTripData('selectedTripTypes', allTripTypeSlugs);
    } catch (error) {
      console.error('Error fetching trip types:', error);
      Alert.alert(
        'Error', 
        'Failed to load trip types. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingTripTypes(false);
    }
  };

  const updateTripData = (field: string, value: any) => {
    // Show loading indicator only when updating trip types, not for location searches
    if (field === 'selectedTripTypes') {
      setIsUpdating(true);
      
      // Set a timeout to hide the loading indicator after a short delay
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
    }
    
    setTripData(prev => ({ ...prev, [field]: value }));
  };

  // Auto switch to Suggested Stops tab when data arrives
  useEffect(() => {
    if (tripData.suggestedStops && (tripData.suggestedStops as any[]).length > 0) {
      setActiveTab('stops');
    }
  }, [tripData.suggestedStops]);
  
  // Refresh map and stops tabs when any location field changes
  useEffect(() => {
    // Only refresh if we're on the map & stops step
    if (currentStep === 5) {
      // If we have both start and end locations, refresh the suggested stops
      if (tripData.startLocationData && tripData.endLocationData) {
        // Inline the functionality to avoid dependency issues
        const refreshSuggestedStops = async () => {
          try {
            // Create path directly including additional stops
            const start = tripData.startLocationData;
            const end = tripData.endLocationData;
            
            // Ensure start and end are not null before using them
            if (!start || !end) {
              console.warn('Start or end location is null');
              return;
            }
            
            // Get valid additional stops (with location data)
            const validAdditionalStops = tripData.additionalStops
              .filter(stop => stop.locationData !== null)
              .map(stop => stop.locationData!);
            
            // Generate route points including additional stops
            const points: Array<{ lat: number; lng: number }> = [];
            
            if (validAdditionalStops.length === 0) {
              // Direct path from start to end if no additional stops
              const steps = 20;
              for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                points.push({
                  lat: start.latitude + (end.latitude - start.latitude) * t,
                  lng: start.longitude + (end.longitude - start.longitude) * t,
                });
              }
            } else {
              // Create a path that includes all stops in sequence
              const allPoints = [start, ...validAdditionalStops, end];
              
              // Generate path segments between each consecutive pair of points
              for (let i = 0; i < allPoints.length - 1; i++) {
                const segmentStart = allPoints[i];
                const segmentEnd = allPoints[i + 1];
                const steps = 10; // Fewer steps per segment
                
                for (let j = 0; j <= steps; j++) {
                  // Skip duplicate points at segment connections (except for first segment)
                  if (j === 0 && i > 0) continue;
                  
                  const t = j / steps;
                  points.push({
                    lat: segmentStart.latitude + (segmentEnd.latitude - segmentStart.latitude) * t,
                    lng: segmentStart.longitude + (segmentEnd.longitude - segmentStart.longitude) * t,
                  });
                }
              }
            }
            
            const stops = await fetchSuggestedStops(points, tripData.selectedTripTypes);
            updateTripData('suggestedStops', stops as any);
            
            // Select all suggested stops by default
            const allStopIds = stops.map((stop, idx) => `${stop.lat}_${stop.lng}_${idx}`);
            updateTripData('selectedStops', allStopIds);
            
            setActiveTab('stops');
          } catch (e) {
            console.warn('Suggested stops AJAX failed:', e);
            // Reset stops on error
            updateTripData('suggestedStops', []);
            updateTripData('selectedStops', []);
          }
        };
        
        refreshSuggestedStops();
      } else {
        // Reset suggested stops when locations are incomplete
        updateTripData('suggestedStops', []);
        updateTripData('selectedStops', []);
      }
    }
  }, [
    tripData.startLocationData, 
    tripData.endLocationData, 
    tripData.returnLocationData,
    JSON.stringify(tripData.additionalStops),
    currentStep,
    tripData.selectedTripTypes,
    fetchSuggestedStops,
    setActiveTab
  ]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleTripType = (typeSlug: string) => {
    const currentTypes = tripData.selectedTripTypes;
    const updatedTypes = currentTypes.includes(typeSlug)
      ? currentTypes.filter(id => id !== typeSlug)
      : [...currentTypes, typeSlug];
    updateTripData('selectedTripTypes', updatedTypes);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index + 1 <= currentStep ? styles.stepDotActive : styles.stepDotInactive
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepTitleContainer}>
        <Text style={styles.stepTitle}>Basic Trip Details</Text>
      </View>
      
      <LocationInput
        label="Start Location"
        placeholder="Enter start location"
        value={tripData.startLocation}
        onTextChange={(value) => updateTripData('startLocation', value)}
        onLocationSelect={(location) => {
          updateTripData('startLocationData', location);
          updateTripData('startLocation', location.formattedAddress);
        }}
        required={true}
        icon="📍"
        zIndex={30}
      />

      <LocationInput
        label="End Location"
        placeholder="Enter end location"
        value={tripData.endLocation}
        onTextChange={(value) => updateTripData('endLocation', value)}
        onLocationSelect={(location) => {
          updateTripData('endLocationData', location);
          updateTripData('endLocation', location.formattedAddress);
        }}
        required={true}
        icon="🏁"
        zIndex={20}
      />
      
      {/* Additional Stops Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Additional Stops</Text>
        <Text style={styles.sectionSubLabel}>Add stops to change directions</Text>
        
        {tripData.additionalStops?.map((stop, index) => (
          <View key={index} style={styles.additionalStopContainer}>
            <View style={styles.additionalStopInputContainer}>
              <LocationInput
                label={`Stop ${index + 1}`}
                placeholder="Enter stop location"
                value={stop.location || ''}
                onTextChange={(value) => {
                  const newStops = [...(tripData.additionalStops || [])];
                  newStops[index] = { ...newStops[index], location: value };
                  updateTripData('additionalStops', newStops);
                }}
                onLocationSelect={(location) => {
                  const newStops = [...(tripData.additionalStops || [])];
                  newStops[index] = { 
                    location: location.formattedAddress,
                    locationData: location 
                  };
                  updateTripData('additionalStops', newStops);
                }}
                icon="📍"
                zIndex={15 - index}
              />
            </View>
            <TouchableOpacity 
              style={styles.removeStopButton}
              onPress={() => {
                const newStops = [...(tripData.additionalStops || [])];
                newStops.splice(index, 1);
                updateTripData('additionalStops', newStops);
              }}
            >
              <Text style={styles.removeStopButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.addStopButton}
          onPress={() => {
            const newStops = [...(tripData.additionalStops || []), { location: '', locationData: null }];
            updateTripData('additionalStops', newStops);
          }}
        >
          <Text style={styles.addStopButtonText}>+ Add Stop</Text>
        </TouchableOpacity>
      </View>

      <LocationInput
        label="Return Location"
        placeholder="Enter return location (Optional)"
        value={tripData.returnLocation}
        onTextChange={(value) => updateTripData('returnLocation', value)}
        onLocationSelect={(location) => {
          updateTripData('returnLocationData', location);
          updateTripData('returnLocation', location.formattedAddress);
        }}
        required={false}
        icon="🔄"
        zIndex={10}
      />

      <View style={styles.dateTimeRow}>
        <View style={styles.dateTimeGroup}>
          <Text style={styles.inputLabel}>📅 Start Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={{ color: tripData.startDate ? colors.text : colors.textSecondary }}>
              {tripData.startDate || 'Select date'}
            </Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={tripData.startDate ? new Date(tripData.startDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartDatePicker(false);
                if (date) {
                  const iso = date.toISOString().split('T')[0];
                  updateTripData('startDate', iso);
                }
              }}
            />
          )}
        </View>
        <View style={styles.dateTimeGroup}>
          <Text style={styles.inputLabel}>🕐 Start Time</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text style={{ color: tripData.startTime ? colors.text : colors.textSecondary }}>
              {tripData.startTime || 'Select time'}
            </Text>
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={(event, date) => {
                setShowStartTimePicker(false);
                if (date) {
                  const hh = String(date.getHours()).padStart(2, '0');
                  const mm = String(date.getMinutes()).padStart(2, '0');
                  updateTripData('startTime', `${hh}:${mm}`);
                }
              }}
            />
          )}
        </View>
      </View>

      <View style={styles.dateTimeRow}>
        <View style={styles.dateTimeGroup}>
          <Text style={styles.inputLabel}>📅 End Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={{ color: tripData.endDate ? colors.text : colors.textSecondary }}>
              {tripData.endDate || 'Select date'}
            </Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={tripData.endDate ? new Date(tripData.endDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEndDatePicker(false);
                if (date) {
                  const iso = date.toISOString().split('T')[0];
                  updateTripData('endDate', iso);
                }
              }}
            />
          )}
        </View>
        <View style={styles.dateTimeGroup}>
          <Text style={styles.inputLabel}>🕐 End Time</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={{ color: tripData.endTime ? colors.text : colors.textSecondary }}>
              {tripData.endTime || 'Select time'}
            </Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={(event, date) => {
                setShowEndTimePicker(false);
                if (date) {
                  const hh = String(date.getHours()).padStart(2, '0');
                  const mm = String(date.getMinutes()).padStart(2, '0');
                  updateTripData('endTime', `${hh}:${mm}`);
                }
              }}
            />
          )}
        </View>
      </View>

      <View style={styles.budgetRow}>
        <View style={styles.currencyGroup}>
          <Text style={styles.inputLabel}>💰 Currency</Text>
          <View style={styles.currencySelector}>
            <TouchableOpacity
              style={[styles.currencyButton, tripData.currency === 'LKR' && styles.currencyButtonActive]}
              onPress={() => updateTripData('currency', 'LKR')}
            >
              <Text style={[styles.currencyText, tripData.currency === 'LKR' && styles.currencyTextActive]}>LKR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.currencyButton, tripData.currency === 'USD' && styles.currencyButtonActive]}
              onPress={() => updateTripData('currency', 'USD')}
            >
              <Text style={[styles.currencyText, tripData.currency === 'USD' && styles.currencyTextActive]}>USD</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.budgetGroup}>
          <Text style={styles.inputLabel}>💵 Budget</Text>
          <TextInput
            style={styles.budgetInput}
            placeholder="Enter budget"
            placeholderTextColor={colors.textSecondary}
            value={tripData.budget}
            onChangeText={(value) => updateTripData('budget', value)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>👥 Number of People</Text>
        <TextInput
          style={styles.input}
          placeholder="Number of people"
          placeholderTextColor={colors.textSecondary}
          value={tripData.pax}
          onChangeText={(value) => updateTripData('pax', value)}
          keyboardType="numeric"
        />
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepTitleContainer}>
        <Text style={styles.stepTitle}>Trip Type & Transport</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Trip Types</Text>
        {loadingTripTypes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading trip types...</Text>
          </View>
        ) : (
          <View style={styles.tripTypesGrid}>
            {tripTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.tripTypeCard,
                  tripData.selectedTripTypes.includes(type.slug) && styles.tripTypeCardSelected
                ]}
                onPress={() => toggleTripType(type.slug)}
              >
                <Text style={styles.tripTypeIcon}>{getTripTypeIcon(type.name)}</Text>
                <Text style={[
                  styles.tripTypeName,
                  tripData.selectedTripTypes.includes(type.slug) && styles.tripTypeNameSelected
                ]}>
                  {cleanTripTypeName(type.name)}
                </Text>
                <Text style={[
                  styles.tripTypeDesc,
                  tripData.selectedTripTypes.includes(type.slug) && styles.tripTypeDescSelected
                ]}>
                  {type.count} {type.count === 1 ? 'location' : 'locations'} available
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transport Mode</Text>
        <View style={styles.transportGrid}>
          {TRANSPORT_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.transportCard,
                tripData.transportMode === mode.id && styles.transportCardSelected
              ]}
              onPress={() => updateTripData('transportMode', mode.id)}
            >
              <Text style={styles.transportIcon}>{mode.icon}</Text>
              <Text style={[
                styles.transportName,
                tripData.transportMode === mode.id && styles.transportNameSelected
              ]}>
                {mode.name}
              </Text>
              <Text style={[
                styles.transportDesc,
                tripData.transportMode === mode.id && styles.transportDescSelected
              ]}>
                {mode.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {tripData.transportMode && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {tripData.transportMode === 'private' && '⛽ Fuel Consumption (km/L)'}
            {tripData.transportMode === 'rent' && '💰 Price per km'}
            {tripData.transportMode === 'public' && '💰 Total Amount'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              tripData.transportMode === 'private' ? 'e.g., 10' :
              tripData.transportMode === 'rent' ? 'e.g., 50' :
              'e.g., 1500'
            }
            placeholderTextColor={colors.textSecondary}
            value={tripData.transportDetails}
            onChangeText={(value) => updateTripData('transportDetails', value)}
            keyboardType="numeric"
          />
        </View>
      )}
    </ScrollView>
  );

  // Auto-generate accommodations based on nights
  useEffect(() => {
    if (tripData.startDate && tripData.endDate) {
      const start = new Date(tripData.startDate);
      const end = new Date(tripData.endDate);
      const nights = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      if (nights !== tripData.accommodations.length) {
        // Update text values
        updateTripData(
          'accommodations',
          Array.from({ length: nights }, (_, i) => tripData.accommodations[i] || '')
        );
        
        // Update location data
        updateTripData(
          'accommodationLocations',
          Array.from({ length: nights }, (_, i) => tripData.accommodationLocations?.[i] || null)
        );
      }
    } else if (tripData.accommodations.length !== 0) {
      updateTripData('accommodations', []);
      updateTripData('accommodationLocations', []);
    }
    // eslint-disable-next-line
  }, [tripData.startDate, tripData.endDate]);

  const renderStep3 = () => (
    <ScrollView 
      style={styles.stepContent} 
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.stepTitleContainer}>
        <Text style={styles.stepTitle}>Accommodation</Text>
        <Text style={styles.stepSubtitle}>Plan your overnight stays</Text>
      </View>
      
      <View style={styles.accommodationSection}>
        <Text style={styles.sectionTitle}>Accommodation Details</Text>
        <Text style={styles.infoText}>
          Based on your trip dates, you'll need accommodation for {tripData.accommodations.length || 0} nights.
        </Text>
        
        {tripData.accommodations.map((accommodation, index) => (
          <View key={index} style={[styles.accommodationItem, { zIndex: 1000 - index }]}>
            <Text style={styles.accommodationLabel}>Night {index + 1}</Text>
            <LocationInput
                label="" // Empty label since we already have one above
                placeholder={`Accommodation for night ${index + 1}`}
                value={accommodation}
                onLocationSelect={(location) => {
                  // Update text value
                  const newAccommodations = [...tripData.accommodations];
                  newAccommodations[index] = location.formattedAddress || location.name;
                  updateTripData('accommodations', newAccommodations);
                  
                  // Update location data
                  const newAccommodationLocations = [...(tripData.accommodationLocations || [])];
                  while (newAccommodationLocations.length < tripData.accommodations.length) {
                    newAccommodationLocations.push(null);
                  }
                  newAccommodationLocations[index] = location;
                  updateTripData('accommodationLocations', newAccommodationLocations);
                }}
                onTextChange={(value) => {
                  const newAccommodations = [...tripData.accommodations];
                  newAccommodations[index] = value;
                  updateTripData('accommodations', newAccommodations);
                  
                  // If text is cleared or changed, clear the location data
                  if (!value || value !== (tripData.accommodationLocations?.[index]?.formattedAddress || tripData.accommodationLocations?.[index]?.name)) {
                    const newAccommodationLocations = [...(tripData.accommodationLocations || [])];
                    while (newAccommodationLocations.length < tripData.accommodations.length) {
                      newAccommodationLocations.push(null);
                    }
                    newAccommodationLocations[index] = null;
                    updateTripData('accommodationLocations', newAccommodationLocations);
                  }
                }}
                zIndex={1000 - index} // Ensure proper stacking of dropdown suggestions
            />
          </View>
        ))}
        {/* Removed "+ Add Accommodation" button */}
      </View>
    </ScrollView>
  );

  // Update meals array based on start/end dates and times
  const updateMealsFields = () => {
    if (!tripData.startDate || !tripData.endDate) return;
    
    const start = new Date(`${tripData.startDate}T${tripData.startTime || "00:00"}`);
    const end = new Date(`${tripData.endDate}T${tripData.endTime || "23:59"}`);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Create or update meals array
    const updatedMeals: Array<{day: number, date: string, breakfast?: string, lunch?: string, dinner?: string}> = [];
    
    for (let i = 1; i <= days; i++) {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + (i - 1));
      
      // Find existing meal data for this day or create new
      const existingMeal = tripData.meals.find(meal => meal.day === i);
      
      updatedMeals.push({
        day: i,
        date: dayDate.toISOString().split('T')[0],
        breakfast: existingMeal?.breakfast || '',
        lunch: existingMeal?.lunch || '',
        dinner: existingMeal?.dinner || ''
      });
    }
    
    // Update tripData with new meals array
    if (JSON.stringify(updatedMeals) !== JSON.stringify(tripData.meals)) {
      updateTripData('meals', updatedMeals);
    }
  };
  
  // Call updateMealsFields when dates or times change
  React.useEffect(() => {
    if (currentStep === 4) {
      updateMealsFields();
    }
  }, [tripData.startDate, tripData.endDate, tripData.startTime, tripData.endTime, currentStep]);
  
  const renderStep4 = () => {
    
    // Render meal cards for a specific day
    const renderMealCards = (meal: {day: number, date: string, breakfast?: string, lunch?: string, dinner?: string}) => {
      const startHours = new Date(`${tripData.startDate}T${tripData.startTime || "00:00"}`).getHours();
      const endHours = new Date(`${tripData.endDate}T${tripData.endTime || "23:59"}`).getHours();
      const isFirstDay = meal.day === 1;
      const isLastDay = meal.day === tripData.meals.length;
      
      return (
        <View style={styles.mealsGrid} key={`day-${meal.day}`}>
          {/* Breakfast - Skip if first day and start time is after 10 AM */}
          {!(isFirstDay && startHours > 10) && (
            <View style={styles.mealCard}>
              <Text style={styles.mealIcon}>🌅</Text>
              <Text style={styles.mealName}>Breakfast</Text>
              <TextInput
                style={styles.mealInput}
                placeholder="Cost per person"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={meal.breakfast}
                onChangeText={(value) => {
                  const updatedMeals = [...tripData.meals];
                  updatedMeals[meal.day - 1].breakfast = value;
                  updateTripData('meals', updatedMeals);
                }}
              />
            </View>
          )}
          
          {/* Lunch - Skip if first day and start time is after 14 PM or last day and end time is before 11 AM */}
          {!(isFirstDay && startHours > 14) && !(isLastDay && endHours < 11) && (
            <View style={styles.mealCard}>
              <Text style={styles.mealIcon}>☀️</Text>
              <Text style={styles.mealName}>Lunch</Text>
              <TextInput
                style={styles.mealInput}
                placeholder="Cost per person"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={meal.lunch}
                onChangeText={(value) => {
                  const updatedMeals = [...tripData.meals];
                  updatedMeals[meal.day - 1].lunch = value;
                  updateTripData('meals', updatedMeals);
                }}
              />
            </View>
          )}
          
          {/* Dinner - Skip if first day and start time is after 18 PM or last day and end time is before 17 PM */}
          {!(isFirstDay && startHours > 18) && !(isLastDay && endHours < 17) && (
            <View style={styles.mealCard}>
              <Text style={styles.mealIcon}>🌙</Text>
              <Text style={styles.mealName}>Dinner</Text>
              <TextInput
                style={styles.mealInput}
                placeholder="Cost per person"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={meal.dinner}
                onChangeText={(value) => {
                  const updatedMeals = [...tripData.meals];
                  updatedMeals[meal.day - 1].dinner = value;
                  updateTripData('meals', updatedMeals);
                }}
              />
            </View>
          )}
        </View>
      );
    };
    
    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>Meals Planning</Text>
          <Text style={styles.stepSubtitle}>Plan your daily meals and budget</Text>
        </View>
        
        {!tripData.startDate || !tripData.endDate ? (
          <View style={styles.mealsSection}>
            <Text style={styles.infoText}>
              Please set your trip start and end dates first to plan meals.
            </Text>
          </View>
        ) : (
          tripData.meals.map((meal, index) => (
            <View style={styles.mealsSection} key={`meal-day-${meal.day}`}>
              <Text style={styles.sectionTitle}>Day {meal.day} - {new Date(meal.date).toDateString()}</Text>
              {renderMealCards(meal)}
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const renderStep5 = () => {
    // Calculate map region based on selected locations
    const getMapRegion = () => {
      if (tripData.startLocationData && tripData.endLocationData) {
        const start = tripData.startLocationData;
        const end = tripData.endLocationData;
        
        const latDelta = Math.abs(end.latitude - start.latitude) * 1.2;
        const lngDelta = Math.abs(end.longitude - start.longitude) * 1.2;
        
        return {
          latitude: (start.latitude + end.latitude) / 2,
          longitude: (start.longitude + end.longitude) / 2,
          latitudeDelta: Math.max(latDelta, 0.1),
          longitudeDelta: Math.max(lngDelta, 0.1),
        };
      }
      
      // Default to Sri Lanka center
      return {
        latitude: 7.8731,
        longitude: 80.7718,
        latitudeDelta: 2.0,
        longitudeDelta: 2.0,
      };
    };

    const getTotalDistance = () => {
      if (tripData.startLocationData && tripData.endLocationData) {
        return calculateDistance(tripData.startLocationData, tripData.endLocationData);
      }
      return 0;
    };
  
    // Budget calculation functions
    const calculateTransportCost = () => {
      const totalDistKm = getTotalDistance();
      const transportMode = tripData.transportMode;
      const transportDetails = parseFloat(tripData.transportDetails) || 0;
      let transportCost = 0;
      
      if (transportMode === 'private' && transportDetails > 0 && totalDistKm > 0) {
        // Private vehicle: (distance / fuel consumption) * fuel price
        transportCost = (totalDistKm / transportDetails) * 350;
      } else if (transportMode === 'rent' && transportDetails > 0 && totalDistKm > 0) {
        // Rental: price per km * distance
        transportCost = transportDetails * totalDistKm;
      } else if (transportMode === 'public') {
        // Public transport: fixed amount
        transportCost = transportDetails;
      }
      
      return transportCost;
    };
  
    const calculateEntryFees = () => {
      let entryFees = 0;
      (tripData.suggestedStops as SuggestedStop[]).forEach(stop => {
        if (stop.entry_fees) {
          entryFees += stop.entry_fees;
        }
      });
      return entryFees;
    };
  
    const calculateMealsCost = () => {
    // Calculate based on user input for meals
    if (!tripData.startDate || !tripData.endDate) return 0;
    
    // Get meal costs from user input
    let totalMealCost = 0;
    
    // If user has entered meal costs, calculate total from all days and meals
    if (tripData.meals.length > 0) {
      // Loop through each day's meals
      tripData.meals.forEach(dayMeal => {
        // Get start and end times to determine which meals to include
        const startHours = new Date(`${tripData.startDate}T${tripData.startTime || "00:00"}`).getHours();
        const endHours = new Date(`${tripData.endDate}T${tripData.endTime || "23:59"}`).getHours();
        const isFirstDay = dayMeal.day === 1;
        const isLastDay = dayMeal.day === tripData.meals.length;
        
        // Add breakfast cost if applicable
        if (!(isFirstDay && startHours > 10)) {
          totalMealCost += parseFloat(dayMeal.breakfast || '0');
        }
        
        // Add lunch cost if applicable
        if (!(isFirstDay && startHours > 14) && !(isLastDay && endHours < 11)) {
          totalMealCost += parseFloat(dayMeal.lunch || '0');
        }
        
        // Add dinner cost if applicable
        if (!(isFirstDay && startHours > 18) && !(isLastDay && endHours < 17)) {
          totalMealCost += parseFloat(dayMeal.dinner || '0');
        }
      });
    }
    
    return totalMealCost;
  };
  
    const calculateRemainingBudget = () => {
      const budget = parseFloat(tripData.budget) || 0;
      const pax = parseInt(tripData.pax) || 1;
      const transportCost = calculateTransportCost();
      const entryFees = calculateEntryFees() * pax;
      const mealsCost = calculateMealsCost() * pax;
      
      return budget - (transportCost + entryFees + mealsCost);
    };

    // Build a simple interpolated path for AJAX when no polyline sampling is available
    const buildSimplePath = () => {
      const start = tripData.startLocationData;
      const end = tripData.endLocationData;
      if (!start || !end) return [] as Array<{ lat: number; lng: number }>;
      const points: Array<{ lat: number; lng: number }> = [];
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        points.push({
          lat: start.latitude + (end.latitude - start.latitude) * t,
          lng: start.longitude + (end.longitude - start.longitude) * t,
        });
      }
      return points;
    };

    const callSuggestedStopsAjax = async () => {
      try {
        if (!tripData.startLocationData || !tripData.endLocationData) return;
        // Show loading indicator
        setIsUpdating(true);
        const path = buildSimplePath();
        const stops = await fetchSuggestedStops(path, tripData.selectedTripTypes);
        updateTripData('suggestedStops', stops as any);
        
        // Select all suggested stops by default
        const allStopIds = stops.map((stop, idx) => `${stop.lat}_${stop.lng}_${idx}`);
        updateTripData('selectedStops', allStopIds);
        
        setActiveTab('stops');
      } catch (e) {
        console.warn('Suggested stops AJAX failed:', e);
        // Reset stops on error
        updateTripData('suggestedStops', []);
        updateTripData('selectedStops', []);
      } finally {
        // Hide loading indicator
        setIsUpdating(false);
      }
    };

    return (
      <ScrollView 
        style={styles.stepContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.stepTitleContainer}>
          <Text style={styles.stepTitle}>Map & Suggested Stops</Text>
          <Text style={styles.stepSubtitle}>Review your route and select attractions</Text>
        </View>
        
        <View style={styles.tabsContainer}>
          <View style={styles.tabHeader}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'map' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('map')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'map' && styles.tabTextActive,
                ]}
              >
                🗺️ Map
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'stops' && styles.tabActive,
              ]}
              onPress={() => {
                // If no data yet, call AJAX first
                if ((tripData.suggestedStops as any[]).length === 0) {
                  callSuggestedStopsAjax();
                } else {
                  setActiveTab('stops');
                }
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'stops' && styles.tabTextActive,
                ]}
              >
                📍 Stops
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'budget' && styles.tabActive,
              ]}
              onPress={() => setActiveTab('budget')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'budget' && styles.tabTextActive,
                ]}
              >
                💰 Budget
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabContent}>
            {activeTab === 'map' ? (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  region={getMapRegion()}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                >
                  {tripData.startLocationData && (
                    <Marker
                      coordinate={{
                        latitude: tripData.startLocationData.latitude,
                        longitude: tripData.startLocationData.longitude,
                      }}
                      title="Start Location"
                      description={tripData.startLocationData.name}
                      pinColor="green"
                    />
                  )}
                  
                  {tripData.endLocationData && (
                    <Marker
                      coordinate={{
                        latitude: tripData.endLocationData.latitude,
                        longitude: tripData.endLocationData.longitude,
                      }}
                      title="End Location"
                      description={tripData.endLocationData.name}
                      pinColor="red"
                    />
                  )}
                  
                  {tripData.returnLocationData && (
                    <Marker
                      coordinate={{
                        latitude: tripData.returnLocationData.latitude,
                        longitude: tripData.returnLocationData.longitude,
                      }}
                      title="Return Location"
                      description={tripData.returnLocationData.name}
                      pinColor="blue"
                    />
                  )}
                  
                  {/* Display additional stops markers */}
                  {tripData.additionalStops.map((stop, index) => 
                    stop.locationData && (
                      <Marker
                        key={`additional-stop-${index}`}
                        coordinate={{
                          latitude: stop.locationData.latitude,
                          longitude: stop.locationData.longitude,
                        }}
                        title={`Stop ${index + 1}`}
                        description={stop.locationData.name}
                        pinColor="orange"
                      />
                    )
                  )}
                  
                  {/* Display selected suggested stops */}
                  {(tripData.suggestedStops as SuggestedStop[])
                    .filter((stop, idx) => 
                      tripData.selectedStops.includes(`${stop.lat}_${stop.lng}_${idx}`)
                    )
                    .map((stop, idx) => (
                      <Marker
                        key={`suggested-stop-${idx}`}
                        coordinate={{
                          latitude: stop.lat,
                          longitude: stop.lng,
                        }}
                        title={stop.title}
                        description={`${stop.entry_fees ? `Entry Fee: ${stop.entry_fees} LKR` : ''}`}
                        pinColor="purple"
                      />
                    ))
                  }
                  
                  {tripData.startLocationData && tripData.endLocationData && (
                    <MapViewDirections
                      origin={{
                        latitude: tripData.startLocationData.latitude,
                        longitude: tripData.startLocationData.longitude,
                      }}
                      destination={{
                        latitude: tripData.endLocationData.latitude,
                        longitude: tripData.endLocationData.longitude,
                      }}
                      waypoints={[
                        // Include additional stops
                        ...tripData.additionalStops
                          .filter(stop => stop.locationData)
                          .map(stop => ({
                            latitude: stop.locationData!.latitude,
                            longitude: stop.locationData!.longitude,
                          })),
                        // Include selected suggested stops
                        ...(tripData.suggestedStops as SuggestedStop[])
                          .filter((stop, idx) => 
                            tripData.selectedStops.includes(`${stop.lat}_${stop.lng}_${idx}`)
                          )
                          .map(stop => ({
                            latitude: stop.lat,
                            longitude: stop.lng,
                          }))
                      ]}
                      apikey={"AIzaSyCUDHA3khY63dx8k-1jhJITCWfQSRXKBU0"}
                      strokeWidth={4}
                      strokeColor={colors.primary}
                      optimizeWaypoints={true}
                      mode="DRIVING"
                    />
                  )}
                </MapView>
                
                <View style={styles.mapOverlay}>
                  <Text style={styles.mapOverlayText}>
                    Distance: {getTotalDistance().toFixed(1)} km
                  </Text>
                </View>
              </View>
            ) : activeTab === 'budget' ? (
              <View style={styles.budgetContainer}>
                <Text style={styles.sectionTitle}>Budget Breakdown</Text>
                <Text style={styles.infoText}>
                  Here's a breakdown of your estimated trip expenses:
                </Text>
                
                <View style={styles.budgetBreakdown}>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Transport</Text>
                    <Text style={styles.budgetValue}>{calculateTransportCost().toFixed(2)} {tripData.currency}</Text>
                  </View>
                  
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Entry Fees</Text>
                    <Text style={styles.budgetValue}>{calculateEntryFees().toFixed(2)} {tripData.currency}</Text>
                  </View>
                  
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Meals</Text>
                    <Text style={styles.budgetValue}>{calculateMealsCost().toFixed(2)} {tripData.currency}</Text>
                  </View>
                  
                  <View style={[styles.budgetRow, styles.budgetTotal]}>
                    <Text style={styles.budgetLabel}>Remaining Budget</Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.budgetValue, { color: calculateRemainingBudget() < 0 ? colors.error : colors.success }]}>
                        {tripData.currency} {calculateRemainingBudget().toFixed(2)}
                      </Text>
                      {calculateRemainingBudget() < 0 && (
                        <Text style={{ color: colors.error, fontWeight: 'bold' }}>
                          Over budget!
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ) : activeTab === 'stops' ? (
              <View>
                <View style={styles.suggestedStops}>
                  <Text style={styles.sectionTitle}>Suggested Attractions</Text>
                  <Text style={styles.infoText}>
                    Based on your trip type and route, here are recommended stops:
                  </Text>
                  <ScrollView 
                    style={styles.stopsList}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {(tripData.suggestedStops as any[]).length === 0 ? (
                      <Text style={styles.infoText}>No suggestions yet.</Text>
                    ) : (
                      (tripData.suggestedStops as SuggestedStop[]).map((stop, idx) => {
                        const stopId = `${stop.lat}_${stop.lng}_${idx}`;
                        const isSelected = tripData.selectedStops.includes(stopId);
                        
                        return (
                          <View key={stopId} style={styles.stopItem}>
                            <Text style={styles.stopIcon}>📍</Text>
                            <View style={styles.stopDetails}>
                              <Text style={styles.stopName}>{stop.title ? stop.title.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)).replace(/&rsquo;|&#8217;/g, "'").replace(/&hellip;|&#8230;/g, "...") : ""}</Text>
                              <View style={styles.stopInfoRow}>
                                {stop.arrival_time && (
                                  <View style={styles.arrivalTimeContainer}>
                                    <Text style={styles.arrivalTimeLabel}>Arrival:</Text>
                                    <Text style={styles.arrivalTimeValue}>{stop.arrival_time}</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.stopDesc}>
                                {stop.entry_fees != null ? `Entry Fee: ${stop.entry_fees} LKR • ` : ''}
                                {stop.visit_time != null ? `Visit Time: ${stop.visit_time} h` : ''}
                              </Text>
                              <View style={styles.stopInfoRow}>
                                <View style={styles.waitingTimeContainer}>
                                  <Text style={styles.waitingTimeLabel}>Wait more:</Text>
                                  <View style={styles.waitingTimeControls}>
                                    <TouchableOpacity 
                                      style={styles.waitingTimeButton}
                                      onPress={() => {
                                        const currentWaitingTime = stop.waiting_time || 0;
                                        if (currentWaitingTime > 0) {
                                          const updatedStops = [...(tripData.suggestedStops as SuggestedStop[])];
                                          updatedStops[idx] = {
                                            ...stop,
                                            waiting_time: currentWaitingTime - 15
                                          };
                                          updateTripData('suggestedStops', updatedStops);
                                        }
                                      }}
                                    >
                                      <Text style={styles.waitingTimeButtonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.waitingTimeValue}>{stop.waiting_time || 0} min</Text>
                                    <TouchableOpacity 
                                      style={styles.waitingTimeButton}
                                      onPress={() => {
                                        const currentWaitingTime = stop.waiting_time || 0;
                                        if (currentWaitingTime < 120) {
                                          const updatedStops = [...(tripData.suggestedStops as SuggestedStop[])];
                                          updatedStops[idx] = {
                                            ...stop,
                                            waiting_time: currentWaitingTime + 15
                                          };
                                          updateTripData('suggestedStops', updatedStops);
                                        }
                                      }}
                                    >
                                      <Text style={styles.waitingTimeButtonText}>+</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            </View>
                            <TouchableOpacity 
                              style={[styles.stopCheckbox, isSelected && styles.stopCheckboxSelected]} 
                              onPress={() => {
                                const updatedSelectedStops = isSelected
                                  ? tripData.selectedStops.filter(id => id !== stopId)
                                  : [...tripData.selectedStops, stopId];
                                updateTripData('selectedStops', updatedSelectedStops);
                              }}
                            >
                              <Text style={styles.stopCheckboxText}>{isSelected ? '✓' : ''}</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!tripData.startLocationData || !tripData.endLocationData) {
          Alert.alert('Required Fields', 'Please select both start and end locations.');
          return false;
        }
        if (!tripData.startDate || !tripData.endDate) {
          Alert.alert('Required Fields', 'Please select both start and end dates.');
          return false;
        }
        return true;
      case 2:
        if (tripData.selectedTripTypes.length === 0) {
          Alert.alert('Required Fields', 'Please select at least one trip type.');
          return false;
        }
        if (!tripData.transportMode) {
          Alert.alert('Required Fields', 'Please select a transport mode.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    if (currentStep === totalSteps) {
      setToastMessage('Trip plan updated');
      setToastVisible(true);
      return;
    }
    nextStep();
  };

  const handlePrevious = () => {
    prevStep();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomToast 
        visible={toastVisible} 
        message={toastMessage} 
        onDismiss={() => setToastVisible(false)} 
      />
      <LoadingOverlay visible={isUpdating} />
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✈️ Travel Planner</Text>
        <Text style={styles.headerSubtitle}>Step {currentStep} of {totalSteps}</Text>
        {renderStepIndicator()}
      </View>

      {renderCurrentStep()}

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.navButton, styles.navButtonPrimary]} 
          onPress={handleNext}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            {currentStep === totalSteps ? 'Generate Plan' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  stopInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 10,
  },
  arrivalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  arrivalTimeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginRight: 4,
  },
  arrivalTimeValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  waitingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  waitingTimeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  waitingTimeButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingTimeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 22,
    textAlign: 'center',
  },
  waitingTimeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginRight: 4,
  },
  waitingTimeValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionSubLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  additionalStopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  additionalStopInputContainer: {
    flex: 1,
  },
  removeStopButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff5252',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingBottom: 3
  },
  removeStopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addStopButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  addStopButtonText: {
    color: '#305387',
    fontWeight: 'bold',
  },
  budgetContainer: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  budgetBreakdown: {
    marginTop: 15,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
  },
  budgetRow: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  budgetTotal: {
    borderBottomWidth: 0,
    marginTop: 5,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 15,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: colors.white,
  },
  stepDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40, // Add padding at the bottom for better scrolling
  },
  stepTitleContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.text,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateTimeGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.text,
  },
  currencyGroup: {
    flex: 1,
    marginRight: 10,
  },
  currencySelector: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: colors.primary,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  currencyTextActive: {
    color: colors.white,
  },
  budgetGroup: {
    flex: 2,
    marginLeft: 10,
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.text,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  tripTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tripTypeCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tripTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  tripTypeIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  tripTypeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  tripTypeNameSelected: {
    color: colors.primary,
  },
  tripTypeDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  tripTypeDescSelected: {
    color: colors.primary,
  },
  transportGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transportCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transportCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  transportIcon: {
    fontSize: 25,
    marginBottom: 8,
  },
  transportName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  transportNameSelected: {
    color: colors.primary,
  },
  transportDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 12,
  },
  transportDescSelected: {
    color: colors.primary,
  },
  accommodationSection: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
    lineHeight: 20,
  },
  accommodationItem: {
    marginBottom: 40, // Increased spacing between items
    position: 'relative',
    zIndex: 10, // Ensure proper stacking for location inputs
    paddingBottom: 10, // Add padding at the bottom
  },
  accommodationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  mealsSection: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    width: '30%',
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 25,
    marginBottom: 8,
  },
  mealName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  mealInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    backgroundColor: colors.white,
    color: colors.text,
    textAlign: 'center',
  },
  tabsContainer: {
    backgroundColor: colors.white,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabContent: {
    padding: 15,
    paddingBottom: 15,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: 50,
    marginBottom: 10,
  },
  mapPlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  mapPlaceholderDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  suggestedStops: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stopsList: {
    marginTop: 15,
    maxHeight: 400,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 10,
  },
  stopIcon: {
    fontSize: 25,
    marginRight: 15,
  },
  stopDetails: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  stopDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  stopCheckbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stopCheckboxSelected: {
    backgroundColor: colors.primary,
  },
  stopCheckboxText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.border,
  },
  navButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  navButtonTextPrimary: {
    color: colors.white,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    height: 300,
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapOverlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default TravelPlannerScreen;
