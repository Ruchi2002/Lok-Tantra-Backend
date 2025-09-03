# Test script to verify citizen issue creation with actual data
import requests
import json

def test_citizen_issue_creation():
    """Test the citizen issue creation endpoint with actual data"""
    
    # Test data based on what the frontend is sending
    test_issue = {
        "title": "testing the Form",
        "description": "Testing The Form",
        "status": "Open",
        "priority": "Medium",
        "location": "Assam",
        "assigned_to": "d37b364e-b2e3-404d-9125-36f78d67ede7",
        "category_id": "c39209af-6fb4-414b-a5c7-3bf2a3a4a8f0",
        "latitude": 28.6163916,
        "longitude": 77.3815027
    }
    
    print("Test data being sent:")
    print(json.dumps(test_issue, indent=2))
    
    # Test with invalid token (should fail)
    print("\nTesting with invalid token...")
    try:
        response = requests.post(
            "http://localhost:8000/citizen-issues/",
            json=test_issue,
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer invalid_token"
            }
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_citizen_issue_creation()
