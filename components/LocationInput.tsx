import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../colors';
import { formatLocationDisplay, getPlaceDetails, Location, searchPlaces } from '../services/locationService';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  onLocationSelect: (location: Location) => void;
  onTextChange: (text: string) => void;
  required?: boolean;
  icon?: string;
  zIndex?: number; // to control stacking between multiple inputs
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onLocationSelect,
  onTextChange,
  required = false,
  icon = '📍',
  zIndex,
}) => {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const searchPlacesDebounced = async (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        setIsLoading(true);
        // Use Google Places API for all location searches
        const results = await searchPlaces(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching places:', error);
        Alert.alert('Error', 'Failed to search locations. Please try again.');
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms delay
  };

  // Handle text input change
  const handleTextChange = (text: string) => {
    onTextChange(text);
    
    // Clear selected location if user is typing
    if (selectedLocation && text !== selectedLocation.formattedAddress) {
      setSelectedLocation(null);
    }
    
    searchPlacesDebounced(text);
  };

  // Handle location selection
  const handleLocationSelect = async (location: Location) => {
    try {
      // If we only have a lightweight result (no coords), fetch full details
      let finalLocation = location;
      const needsDetails = (!location.latitude && !location.longitude) || location.latitude === 0 || location.longitude === 0;
      if (needsDetails && location.placeId) {
        const details = await getPlaceDetails(location.placeId);
        if (details) {
          finalLocation = details;
        }
      }

      setSelectedLocation(finalLocation);
      onLocationSelect(finalLocation);
      onTextChange(finalLocation.formattedAddress || finalLocation.name);
      setShowSuggestions(false);
      setSuggestions([]);
      Keyboard.dismiss();
    } catch (e) {
      // Fallback to original selection
      setSelectedLocation(location);
      onLocationSelect(location);
      onTextChange(location.formattedAddress || location.name);
      setShowSuggestions(false);
      setSuggestions([]);
      Keyboard.dismiss();
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    // Do not auto-hide on blur to ensure selections register properly
  };

  // Clear input
  const handleClear = () => {
    setSelectedLocation(null);
    onTextChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };


  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, zIndex != null ? { zIndex } : null]}>
      <Text style={styles.label}>
        {icon} {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        
        {value && !isLoading && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            contentContainerStyle={{ paddingBottom: 5 }}
            scrollEnabled={true}
            bounces={true}
            alwaysBounceVertical={false}
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.placeId}
                style={styles.suggestionItem}
                onPress={() => handleLocationSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionMainText}>{item.name}</Text>
                <Text style={styles.suggestionSubText}>
                  {formatLocationDisplay(item)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedLocation && (
        <View style={styles.selectedLocationContainer}>
          <Text style={styles.selectedLocationText}>
            ✓ {formatLocationDisplay(selectedLocation)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 10,
    overflow: 'visible',
    minHeight: 80, // Ensure minimum height for the component
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.danger,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.text,
  },
  loadingContainer: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  clearButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 200,
    zIndex: 9999,
    elevation: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden', // Changed from 'visible' to 'hidden' to fix scrolling
  },
  suggestionsList: {
    maxHeight: 200,
    flexGrow: 0,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%',
    backgroundColor: colors.white,
  },
  suggestionMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  suggestionSubText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedLocationContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  selectedLocationText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default LocationInput;
