import requests
import json
from datetime import datetime, timedelta
import sys

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test if the API is accessible"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_authentication():
    """Test authentication endpoint to get a token"""
    try:
        # Test with different user credentials
        test_credentials = [
            {"email": "priya@mumbai.gov.in", "password": "password123", "role": "Field Agent"},
            {"email": "rajesh@mumbai.gov.in", "password": "password123", "role": "Admin"},
            {"email": "superadmin@example.com", "password": "password123", "role": "Super Admin"}
        ]
        
        for cred in test_credentials:
            login_data = {
                "email": cred["email"],
                "password": cred["password"]
            }
            
            response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
            if response.status_code == 200:
                token = response.json().get("access_token")
                print(f"✅ Authentication successful with {cred['role']}: {cred['email']}")
                return token
            else:
                print(f"❌ Authentication failed for {cred['role']}: {response.status_code}")
        
        print("❌ All authentication attempts failed")
        return None
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return None

# ===== SENT LETTERS API TESTS =====
def test_sent_letters_apis(token):
    """Test all Sent Letters APIs"""
    print("\n📨 Testing Sent Letters APIs:")
    print("-" * 30)
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    results = []
    
    # Test GET /sent-letters
    try:
        response = requests.get(f"{BASE_URL}/sent-letters", headers=headers)
        print(f"✅ GET /sent-letters: {response.status_code}")
        if response.status_code == 200:
            letters = response.json()
            print(f"   Found {len(letters)} sent letters")
        results.append(("Get sent letters", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /sent-letters failed: {e}")
        results.append(("Get sent letters", False))
    
    # Test GET /sent-letters/statistics/overview
    try:
        response = requests.get(f"{BASE_URL}/sent-letters/statistics/overview", headers=headers)
        print(f"✅ GET /sent-letters/statistics/overview: {response.status_code}")
        results.append(("Get sent letters statistics", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /sent-letters/statistics/overview failed: {e}")
        results.append(("Get sent letters statistics", False))
    
    return results

# ===== RECEIVED LETTERS API TESTS =====
def test_received_letters_apis(token):
    """Test all Received Letters APIs"""
    print("\n📬 Testing Received Letters APIs:")
    print("-" * 35)
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    results = []
    
    # Test GET /received-letters
    try:
        response = requests.get(f"{BASE_URL}/received-letters", headers=headers)
        print(f"✅ GET /received-letters: {response.status_code}")
        if response.status_code == 200:
            letters = response.json()
            print(f"   Found {len(letters)} received letters")
        results.append(("Get received letters", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /received-letters failed: {e}")
        results.append(("Get received letters", False))
    
    # Test GET /received-letters/statistics/overview
    try:
        response = requests.get(f"{BASE_URL}/received-letters/statistics/overview", headers=headers)
        print(f"✅ GET /received-letters/statistics/overview: {response.status_code}")
        results.append(("Get received letters statistics", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /received-letters/statistics/overview failed: {e}")
        results.append(("Get received letters statistics", False))
    
    return results

# ===== SENT GRIEVANCE LETTERS API TESTS =====
def test_sent_grievance_letters_apis(token):
    """Test all Sent Grievance Letters APIs"""
    print("\n📋 Testing Sent Grievance Letters APIs:")
    print("-" * 40)
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    results = []
    
    # Test GET /sent-grievance-letters
    try:
        response = requests.get(f"{BASE_URL}/sent-grievance-letters", headers=headers)
        print(f"✅ GET /sent-grievance-letters: {response.status_code}")
        if response.status_code == 200:
            letters = response.json()
            print(f"   Found {len(letters)} grievance letters")
        results.append(("Get grievance letters", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /sent-grievance-letters failed: {e}")
        results.append(("Get grievance letters", False))
    
    return results

# ===== CITIZEN ISSUES API TESTS =====
def test_citizen_issues_apis(token):
    """Test all Citizen Issues APIs"""
    print("\n🏘️ Testing Citizen Issues APIs:")
    print("-" * 30)
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    results = []
    
    # Test GET /citizen-issues
    try:
        response = requests.get(f"{BASE_URL}/citizen-issues", headers=headers)
        print(f"✅ GET /citizen-issues: {response.status_code}")
        if response.status_code == 200:
            issues = response.json()
            print(f"   Found {len(issues)} citizen issues")
        results.append(("Get citizen issues", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /citizen-issues failed: {e}")
        results.append(("Get citizen issues", False))
    
    # Test GET /citizen-issues/geojson/all
    try:
        response = requests.get(f"{BASE_URL}/citizen-issues/geojson/all", headers=headers)
        print(f"✅ GET /citizen-issues/geojson/all: {response.status_code}")
        results.append(("Get citizen issues GeoJSON", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /citizen-issues/geojson/all failed: {e}")
        results.append(("Get citizen issues GeoJSON", False))
    
    return results

# ===== VISITS API TESTS =====
def test_visits_apis(token):
    """Test all Visits APIs"""
    print("\n🏠 Testing Visits APIs:")
    print("-" * 25)
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    results = []
    
    # Test GET /visits
    try:
        response = requests.get(f"{BASE_URL}/visits", headers=headers)
        print(f"✅ GET /visits: {response.status_code}")
        if response.status_code == 200:
            visits = response.json()
            print(f"   Found {len(visits)} visits")
        results.append(("Get visits", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /visits failed: {e}")
        results.append(("Get visits", False))
    
    # Test GET /visits/stats
    try:
        response = requests.get(f"{BASE_URL}/visits/stats", headers=headers)
        print(f"✅ GET /visits/stats: {response.status_code}")
        results.append(("Get visit stats", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /visits/stats failed: {e}")
        results.append(("Get visit stats", False))
    
    # Test GET /visits/eligible-issues
    try:
        response = requests.get(f"{BASE_URL}/visits/eligible-issues", headers=headers)
        print(f"✅ GET /visits/eligible-issues: {response.status_code}")
        results.append(("Get eligible issues", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /visits/eligible-issues failed: {e}")
        results.append(("Get eligible issues", False))
    
    # Test GET /visits/locations
    try:
        response = requests.get(f"{BASE_URL}/visits/locations", headers=headers)
        print(f"✅ GET /visits/locations: {response.status_code}")
        results.append(("Get visit locations", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /visits/locations failed: {e}")
        results.append(("Get visit locations", False))
    
    # Test GET /visits/assistants
    try:
        response = requests.get(f"{BASE_URL}/visits/assistants", headers=headers)
        print(f"✅ GET /visits/assistants: {response.status_code}")
        results.append(("Get visit assistants", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /visits/assistants failed: {e}")
        results.append(("Get visit assistants", False))
    
    return results

# ===== TENANTS API TESTS =====
def test_tenants_apis(token):
    """Test all Tenants APIs"""
    print("\n🏢 Testing Tenants APIs:")
    print("-" * 25)
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    results = []
    
    # Test GET /tenants
    try:
        response = requests.get(f"{BASE_URL}/tenants", headers=headers)
        print(f"✅ GET /tenants: {response.status_code}")
        if response.status_code == 200:
            tenants = response.json()
            print(f"   Found {len(tenants)} tenants")
        results.append(("Get tenants", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /tenants failed: {e}")
        results.append(("Get tenants", False))
    
    return results

# ===== DASHBOARD API TESTS =====
def test_dashboard_apis(token):
    """Test all Dashboard APIs"""
    print("\n📊 Testing Dashboard APIs:")
    print("-" * 25)
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    results = []
    
    # Test GET /dashboard/stats
    try:
        response = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
        print(f"✅ GET /dashboard/stats: {response.status_code}")
        results.append(("Get dashboard stats", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /dashboard/stats failed: {e}")
        results.append(("Get dashboard stats", False))
    
    # Test GET /dashboard/stats/public
    try:
        response = requests.get(f"{BASE_URL}/dashboard/stats/public", headers=headers)
        print(f"✅ GET /dashboard/stats/public: {response.status_code}")
        results.append(("Get public dashboard stats", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /dashboard/stats/public failed: {e}")
        results.append(("Get public dashboard stats", False))
    
    return results

# ===== MEETING PROGRAMS API TESTS =====
def test_meeting_programs_apis(token):
    """Test all Meeting Programs APIs"""
    print("\n📅 Testing Meeting Programs APIs:")
    print("-" * 35)
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    results = []
    
    # Test GET /meeting-programs
    try:
        response = requests.get(f"{BASE_URL}/meeting-programs", headers=headers)
        print(f"✅ GET /meeting-programs: {response.status_code}")
        if response.status_code == 200:
            meetings = response.json()
            print(f"   Found {len(meetings)} meetings")
        results.append(("Get meeting programs", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /meeting-programs failed: {e}")
        results.append(("Get meeting programs", False))
    
    # Test GET /meeting-programs/upcoming/today
    try:
        response = requests.get(f"{BASE_URL}/meeting-programs/upcoming/today", headers=headers)
        print(f"✅ GET /meeting-programs/upcoming/today: {response.status_code}")
        results.append(("Get today's meetings", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /meeting-programs/upcoming/today failed: {e}")
        results.append(("Get today's meetings", False))
    
    # Test GET /meeting-programs/dashboard/kpis
    try:
        response = requests.get(f"{BASE_URL}/meeting-programs/dashboard/kpis", headers=headers)
        print(f"✅ GET /meeting-programs/dashboard/kpis: {response.status_code}")
        results.append(("Get meeting KPIs", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /meeting-programs/dashboard/kpis failed: {e}")
        results.append(("Get meeting KPIs", False))
    
    # Test GET /meeting-programs/dashboard/stats
    try:
        response = requests.get(f"{BASE_URL}/meeting-programs/dashboard/stats", headers=headers)
        print(f"✅ GET /meeting-programs/dashboard/stats: {response.status_code}")
        results.append(("Get meeting stats", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /meeting-programs/dashboard/stats failed: {e}")
        results.append(("Get meeting stats", False))
    
    return results

# ===== USERS API TESTS =====
def test_users_apis(token):
    """Test Users APIs (used in frontend)"""
    print("\n👥 Testing Users APIs:")
    print("-" * 20)
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    results = []
    
    # Test GET /users
    try:
        response = requests.get(f"{BASE_URL}/users", headers=headers)
        print(f"✅ GET /users: {response.status_code}")
        if response.status_code == 200:
            users = response.json()
            print(f"   Found {len(users)} users")
        results.append(("Get users", response.status_code == 200))
    except Exception as e:
        print(f"❌ GET /users failed: {e}")
        results.append(("Get users", False))
    
    return results

def main():
    """Run all frontend API tests"""
    print("🔍 Testing All Frontend Integrated APIs...")
    print("=" * 50)
    
    # Test health check
    if not test_health_check():
        print("❌ API is not accessible. Please start the backend server.")
        sys.exit(1)
    
    # Test authentication
    token = test_authentication()
    if not token:
        print("⚠️  Authentication failed. Some tests may fail due to authorization.")
    
    print("\n📋 Running All Frontend API Tests:")
    print("=" * 40)
    
    # Test all API modules
    all_results = []
    
    # Test each module
    modules = [
        ("Sent Letters", test_sent_letters_apis),
        ("Received Letters", test_received_letters_apis),
        ("Sent Grievance Letters", test_sent_grievance_letters_apis),
        ("Citizen Issues", test_citizen_issues_apis),
        ("Visits", test_visits_apis),
        ("Tenants", test_tenants_apis),
        ("Dashboard", test_dashboard_apis),
        ("Meeting Programs", test_meeting_programs_apis),
        ("Users", test_users_apis),
    ]
    
    for module_name, test_func in modules:
        try:
            results = test_func(token)
            all_results.extend(results)
        except Exception as e:
            print(f"❌ {module_name} tests failed with exception: {e}")
    
    # Summary
    print("\n📊 Test Results Summary:")
    print("=" * 30)
    
    passed = 0
    total = len(all_results)
    
    for test_name, result in all_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All Frontend APIs are working correctly!")
    else:
        print("⚠️  Some Frontend APIs have issues. Check the logs above.")
    
    # Module breakdown
    print("\n📋 Module Breakdown:")
    print("-" * 20)
    
    module_results = {}
    for test_name, result in all_results:
        module = test_name.split()[0] if test_name.split() else "Other"
        if module not in module_results:
            module_results[module] = {"passed": 0, "total": 0}
        module_results[module]["total"] += 1
        if result:
            module_results[module]["passed"] += 1
    
    for module, stats in module_results.items():
        percentage = (stats["passed"] / stats["total"]) * 100
        status = "✅" if stats["passed"] == stats["total"] else "⚠️"
        print(f"{status} {module}: {stats['passed']}/{stats['total']} ({percentage:.1f}%)")

if __name__ == "__main__":
    main()
