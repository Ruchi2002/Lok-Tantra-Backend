"""
Geographic utilities for generating GeoJSON and handling location data.
"""

import json
import requests
from typing import Dict, Any, Optional, Tuple


def generate_geojson_from_coords(lat: float, lon: float, properties: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate a GeoJSON Point feature from latitude and longitude coordinates.
    
    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate
        properties: Optional properties to include in the feature
        
    Returns:
        GeoJSON Point feature as a dictionary
    """
    if properties is None:
        properties = {}
    
    geojson = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]  # GeoJSON uses [longitude, latitude] order
        },
        "properties": properties
    }
    
    return geojson


def generate_geojson_collection(features: list) -> Dict[str, Any]:
    """
    Generate a GeoJSON FeatureCollection from a list of features.
    
    Args:
        features: List of GeoJSON features
        
    Returns:
        GeoJSON FeatureCollection as a dictionary
    """
    return {
        "type": "FeatureCollection",
        "features": features
    }


def generate_citizen_issue_geojson(
    lat: float,
    lon: float,
    title: str,
    description: str = "",
    issue_id: Optional[str] = None,  # Fixed: Changed from int to str (UUID)
    priority: str = "Medium",
    status: str = "Open",
    location: str = "",
    assistant: str = "Unassigned",
    visit_date: Optional[str] = None
) -> dict:
    """
    Generate a GeoJSON feature specifically for citizen issues.
    Compatible with MapRouteView React component requirements.
    
    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate
        title: Issue title
        description: Issue description
        issue_id: Issue ID
        priority: Issue priority (Low, Medium, High, Urgent)
        status: Issue status (Open, In Progress, Pending, Resolved)
        location: Human-readable location
        assistant: Assigned assistant name (REQUIRED for MapRouteView)
        visit_date: Visit date in ISO format (optional, for route sorting)
        
    Returns:
        GeoJSON feature for the citizen issue with all required properties
    """
    properties = {
        "title": title,
        "issue": title,  # MapRouteView expects "issue" field specifically
        "description": description or "",
        "priority": priority or "Medium",  # Default to Medium if None
        "status": status or "Open",        # Default to Open if None
        "location": location or "",
        "assistant": assistant or "Unassigned",  # Critical for MapRouteView filtering and routing
    }
    
    # Add optional fields if provided
    if issue_id is not None:
        properties["issue_id"] = issue_id
        properties["id"] = issue_id  # Some components might expect "id"
    
    if visit_date:
        properties["visitDate"] = visit_date  # MapRouteView uses this for chronological route sorting
    
    return generate_geojson_from_coords(lat, lon, properties)


def validate_coordinates(lat: float, lon: float) -> bool:
    """
    Validate that coordinates are within reasonable bounds.
    
    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate
        
    Returns:
        True if coordinates are valid, False otherwise
    """
    if lat is None or lon is None:
        return False
    return -90 <= lat <= 90 and -180 <= lon <= 180


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the distance between two points using the Haversine formula.
    
    Args:
        lat1, lon1: Coordinates of first point
        lat2, lon2: Coordinates of second point
        
    Returns:
        Distance in kilometers
    """
    import math
    
    # Convert to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of Earth in kilometers
    r = 6371
    
    return c * r


def geojson_to_string(geojson: Dict[str, Any]) -> str:
    """
    Convert GeoJSON dictionary to JSON string.
    
    Args:
        geojson: GeoJSON dictionary
        
    Returns:
        JSON string representation (compact format to save space)
    """
    return json.dumps(geojson, separators=(',', ':'))


def string_to_geojson(geojson_string: str) -> Dict[str, Any]:
    """
    Convert JSON string to GeoJSON dictionary.
    
    Args:
        geojson_string: JSON string representation
        
    Returns:
        GeoJSON dictionary
    """
    return json.loads(geojson_string)


def get_coordinates(location: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Get coordinates (latitude, longitude) from a location string using OpenStreetMap Nominatim.
    
    Args:
        location: Human-readable location string (e.g., "Karol Bagh, Delhi")
        
    Returns:
        Tuple of (latitude, longitude) or (None, None) if geocoding fails
    """
    if not location:
        return None, None
    
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": location,
        "format": "json",
        "limit": 1
    }
    headers = {
        "User-Agent": "SmartPoliticianApp/1.0"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=2)  # Reduced timeout
        response.raise_for_status()
        data = response.json()
        
        if data and len(data) > 0:
            lat = float(data[0]["lat"])
            lon = float(data[0]["lon"])
            return lat, lon
        else:
            print(f"⚠️ No coordinates found for location: {location}")
            return None, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Geocoding request failed for '{location}': {e}")
        return None, None
    except (KeyError, ValueError, IndexError) as e:
        print(f"❌ Error parsing geocoding response for '{location}': {e}")
        return None, None
    except Exception as e:
        print(f"❌ Unexpected error during geocoding for '{location}': {e}")
        return None, None


def generate_route_geojson(coordinates: list, properties: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate a GeoJSON LineString feature for routes (e.g., assistant routes).
    
    Args:
        coordinates: List of [longitude, latitude] coordinate pairs
        properties: Optional properties to include in the feature
        
    Returns:
        GeoJSON LineString feature as a dictionary
    """
    if properties is None:
        properties = {}
    
    return {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": coordinates
        },
        "properties": properties
    }


def generate_polygon_geojson(coordinates: list, properties: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Generate a GeoJSON Polygon feature for areas.
    
    Args:
        coordinates: List of coordinate rings (first ring is exterior, others are holes)
        properties: Optional properties to include in the feature
        
    Returns:
        GeoJSON Polygon feature as a dictionary
    """
    if properties is None:
        properties = {}
    
    return {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": coordinates
        },
        "properties": properties
    }


def calculate_bounds(coordinates: list) -> Dict[str, float]:
    """
    Calculate the bounding box for a list of coordinates.
    
    Args:
        coordinates: List of [longitude, latitude] pairs
        
    Returns:
        Dictionary with 'minLat', 'maxLat', 'minLon', 'maxLon' keys
    """
    if not coordinates:
        return {"minLat": 0, "maxLat": 0, "minLon": 0, "maxLon": 0}
    
    lats = [coord[1] for coord in coordinates]
    lons = [coord[0] for coord in coordinates]
    
    return {
        "minLat": min(lats),
        "maxLat": max(lats),
        "minLon": min(lons),
        "maxLon": max(lons)
    }


def is_point_in_polygon(point: Tuple[float, float], polygon: list) -> bool:
    """
    Check if a point is inside a polygon using the ray casting algorithm.
    
    Args:
        point: (longitude, latitude) tuple
        polygon: List of [longitude, latitude] coordinate pairs forming the polygon
        
    Returns:
        True if point is inside polygon, False otherwise
    """
    lon, lat = point
    n = len(polygon)
    inside = False
    
    p1_lon, p1_lat = polygon[0]
    for i in range(1, n + 1):
        p2_lon, p2_lat = polygon[i % n]
        if lat > min(p1_lat, p2_lat):
            if lat <= max(p1_lat, p2_lat):
                if lon <= max(p1_lon, p2_lon):
                    if p1_lat != p2_lat:
                        xinters = (lat - p1_lat) * (p2_lon - p1_lon) / (p2_lat - p1_lat) + p1_lon
                    if p1_lon == p2_lon or lon <= xinters:
                        inside = not inside
        p1_lon, p1_lat = p2_lon, p2_lat
    
    return inside


def format_coordinates_for_display(lat: float, lon: float, precision: int = 6) -> Dict[str, str]:
    """
    Format coordinates for human-readable display.
    
    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate
        precision: Number of decimal places
        
    Returns:
        Dictionary with formatted coordinates and directional indicators
    """
    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    
    return {
        "latitude": f"{abs(lat):.{precision}f}°{lat_dir}",
        "longitude": f"{abs(lon):.{precision}f}°{lon_dir}",
        "decimal": f"{lat:.{precision}f}, {lon:.{precision}f}",
        "dms": convert_decimal_to_dms(lat, lon)
    }


def convert_decimal_to_dms(lat: float, lon: float) -> str:
    """
    Convert decimal degrees to degrees, minutes, seconds format.
    
    Args:
        lat: Latitude in decimal degrees
        lon: Longitude in decimal degrees
        
    Returns:
        Formatted DMS string
    """
    def decimal_to_dms(decimal_deg: float, is_lat: bool = True) -> str:
        direction = ("N" if decimal_deg >= 0 else "S") if is_lat else ("E" if decimal_deg >= 0 else "W")
        decimal_deg = abs(decimal_deg)
        
        degrees = int(decimal_deg)
        minutes = int((decimal_deg - degrees) * 60)
        seconds = ((decimal_deg - degrees) * 60 - minutes) * 60
        
        return f"{degrees}°{minutes}'{seconds:.2f}\"{direction}"
    
    lat_dms = decimal_to_dms(lat, True)
    lon_dms = decimal_to_dms(lon, False)
    
    return f"{lat_dms}, {lon_dms}"