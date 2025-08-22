const NodeGeocoder = require('node-geocoder');
const { Country, State, City } = require('country-state-city');

const options = {
  provider: 'openstreetmap',
  httpAdapter: 'https',
  formatter: null
};

const geocoder = NodeGeocoder(options);

const geocodeAddress = async (addressData) => {
  try {
    const { address, address2, city_id, state_id, country_id, zip } = addressData;
    
    let fullAddress = '';
    let countryName = '';
    let stateName = '';
    let cityName = '';
    
    // Decode country, state, and city IDs to names
    if (country_id) {
      const country = Country.getCountryByCode(country_id);
      countryName = country ? country.name : country_id;
    }
    
    if (state_id && country_id) {
      const state = State.getStateByCodeAndCountry(state_id, country_id);
      stateName = state ? state.name : '';
    }
    
    if (city_id && state_id && country_id) {
      const cities = City.getCitiesOfState(country_id, state_id);
      const city = cities.find(c => c.name === city_id);
      cityName = city ? city.name : city_id;
    }
    
    // Build the full address
    if (address) {
      fullAddress += address;
    }
    
    if (address2) {
      fullAddress += ', ' + address2;
    }
    
    if (cityName || city_id) {
      fullAddress += ', ' + (cityName || city_id);
    }
    
    if (stateName) {
      fullAddress += ', ' + stateName;
    }
    
    if (countryName) {
      fullAddress += ', ' + countryName;
    }
    
    if (zip) {
      fullAddress += ' ' + zip;
    }
    
    fullAddress = fullAddress.trim();
    
    if (!fullAddress) {
      console.log('No address components provided for geocoding');
      return { lat: null, lng: null };
    }
    
    console.log('Geocoding address:', fullAddress);
    
    const results = await geocoder.geocode(fullAddress);
    
    if (results && results.length > 0) {
      const { latitude, longitude } = results[0];
      console.log('Geocoding successful:', { lat: latitude, lng: longitude });
      return { lat: latitude, lng: longitude };
    }
    
    // Fallback to state and country if full address fails
    if (stateName && countryName) {
      console.log('Full address geocoding failed, trying with state and country only');
      const fallbackAddress = `${stateName}, ${countryName}`;
      const fallbackResults = await geocoder.geocode(fallbackAddress);
      
      if (fallbackResults && fallbackResults.length > 0) {
        const { latitude, longitude } = fallbackResults[0];
        console.log('Fallback geocoding successful:', { lat: latitude, lng: longitude });
        return { lat: latitude, lng: longitude };
      }
    }
    
    // Final fallback to country only
    if (countryName) {
      console.log('State fallback failed, trying with country only');
      const countryResults = await geocoder.geocode(countryName);
      
      if (countryResults && countryResults.length > 0) {
        const { latitude, longitude } = countryResults[0];
        console.log('Country fallback successful:', { lat: latitude, lng: longitude });
        return { lat: latitude, lng: longitude };
      }
    }
    
    console.log('Geocoding failed: No results found');
    return { lat: null, lng: null };
    
  } catch (error) {
    console.error('Geocoding error:', error.message);
    
    // Error fallback attempts
    try {
      if (addressData.state_id && addressData.country_id) {
        const country = Country.getCountryByCode(addressData.country_id);
        const state = State.getStateByCodeAndCountry(addressData.state_id, addressData.country_id);
        
        if (state && country) {
          console.log('Attempting error fallback with state and country');
          const fallbackAddress = `${state.name}, ${country.name}`;
          const fallbackResults = await geocoder.geocode(fallbackAddress);
          
          if (fallbackResults && fallbackResults.length > 0) {
            const { latitude, longitude } = fallbackResults[0];
            console.log('Error fallback geocoding successful:', { lat: latitude, lng: longitude });
            return { lat: latitude, lng: longitude };
          }
        }
      }
      
      if (addressData.country_id) {
        const country = Country.getCountryByCode(addressData.country_id);
        if (country) {
          console.log('Attempting final error fallback with country only');
          const countryResults = await geocoder.geocode(country.name);
          
          if (countryResults && countryResults.length > 0) {
            const { latitude, longitude } = countryResults[0];
            console.log('Country error fallback successful:', { lat: latitude, lng: longitude });
            return { lat: latitude, lng: longitude };
          }
        }
      }
    } catch (fallbackError) {
      console.error('Fallback geocoding error:', fallbackError.message);
    }
    
    return { lat: null, lng: null };
  }
};

module.exports = {
  geocodeAddress
};