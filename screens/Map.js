//This will serve as the screen where the user can find a mid point only and launch maps
//No authentication will be required and will not be accessible if they are logged in already
import React, { useRef, useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View } from 'react-native';

const Map = ({ userAddress, friendAddress, midpoint }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [friendLocation, setFriendLocation] = useState(null);
  const mapRef = useRef(null);

  const geocodeAddress = async (address) => {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address.formatted_address)}&key=AIzaSyDASA8fmLTGHD2P2wTN5Bh9S5NKOET-Gtc`);
    const data = await response.json();
    return data.results[0].geometry.location; 
  };

  useEffect(() => {
    const setUserMarker = async () => {
      if (userAddress) {
        const location = await geocodeAddress(userAddress);
        setUserLocation(location);
        mapRef.current?.animateToRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    };

    const setFriendMarker = async () => {
      if (friendAddress) {
        const location = await geocodeAddress(friendAddress);
        setFriendLocation(location);
        mapRef.current?.animateToRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    };

    setUserMarker();
    setFriendMarker();
  }, [userAddress, friendAddress]);

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1, width: '100%', height: 300 }}
      initialRegion={{
        latitude: 39.8283,
        longitude: -98.5795,
        latitudeDelta: 45,
        longitudeDelta: 45,
      }}
    >
      {userLocation && (
        <Marker
          coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
          title="User Location"
        />
      )}
      {friendLocation && (
        <Marker
          coordinate={{ latitude: friendLocation.lat, longitude: friendLocation.lng }}
          title="Friend's Location"
        />
      )}
      {midpoint && (
        <Marker
          coordinate={{ latitude: midpoint.lat, longitude: midpoint.lng }}
          title="Midpoint"
          pinColor="blue"
        />
      )}
    </MapView>
  );
};

export default Map;
