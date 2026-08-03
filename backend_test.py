#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for LeadEdge360 MVP
Tests all API endpoints with validation for UUID, score ranges, labels, etc.

CI usage:
  RC_API_BASE_URL=http://localhost:3000/api python backend_test.py
"""
import os
import sys
import requests
import json
import re
from datetime import datetime
from pathlib import Path

# Resolve API base URL: env > .env in repo root > /app/.env (container)
BASE_URL = os.environ.get('RC_API_BASE_URL') or os.environ.get('NEXT_PUBLIC_BASE_URL')
if BASE_URL and not BASE_URL.endswith('/api'):
    BASE_URL = BASE_URL.rstrip('/') + '/api'

if not BASE_URL:
    for env_path in [Path('.env'), Path('/app/.env')]:
        if env_path.exists():
            for line in env_path.read_text(encoding='utf-8').splitlines():
                if line.startswith('NEXT_PUBLIC_BASE_URL='):
                    BASE_URL = line.split('=', 1)[1].strip().rstrip('/') + '/api'
                    break
        if BASE_URL:
            break

if not BASE_URL:
    print('Set RC_API_BASE_URL or NEXT_PUBLIC_BASE_URL for API regression tests')
    sys.exit(1)

print(f"Testing API at: {BASE_URL}\n")

# UUID v4 pattern
UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', re.I)

def is_valid_uuid(s):
    """Check if string is a valid UUID v4"""
    return bool(UUID_PATTERN.match(str(s)))

def test_health_check():
    """Test 1: GET /api/ - health check"""
    print("=" * 80)
    print("TEST 1: GET /api/ - Health Check")
    print("=" * 80)
    try:
        r = requests.get(BASE_URL, timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert data.get('ok') == True, "Missing 'ok: true'"
        assert 'name' in data, "Missing 'name' field"
        assert 'time' in data, "Missing 'time' field"
        print("✅ PASS: Health check working\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_get_agents():
    """Test 2: GET /api/agents"""
    print("=" * 80)
    print("TEST 2: GET /api/agents")
    print("=" * 80)
    try:
        r = requests.get(f"{BASE_URL}/agents", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert 'agents' in data, "Missing 'agents' field"
        agents = data['agents']
        assert len(agents) >= 5, f"Expected at least 5 agents, got {len(agents)}"
        
        for agent in agents:
            assert 'id' in agent, "Agent missing 'id'"
            assert 'name' in agent, "Agent missing 'name'"
            assert 'territory' in agent, "Agent missing 'territory'"
        
        print(f"✅ PASS: Got {len(agents)} agents with correct structure\n")
        return True, agents
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False, []

def test_get_leads_initial():
    """Test 3: GET /api/leads - initial call (auto-seeds 8 demo leads)"""
    print("=" * 80)
    print("TEST 3: GET /api/leads - Initial Call (Auto-Seed)")
    print("=" * 80)
    try:
        r = requests.get(f"{BASE_URL}/leads", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert 'leads' in data, "Missing 'leads' field"
        leads = data['leads']
        print(f"Got {len(leads)} leads")
        
        assert len(leads) >= 8, f"Expected at least 8 leads after auto-seed, got {len(leads)}"
        
        # Validate first lead structure
        if leads:
            lead = leads[0]
            print(f"\nSample lead structure:")
            print(json.dumps(lead, indent=2))
            
            # Required fields
            assert 'id' in lead, "Lead missing 'id'"
            assert is_valid_uuid(lead['id']), f"Lead ID is not a valid UUID v4: {lead['id']}"
            assert 'name' in lead, "Lead missing 'name'"
            assert 'phone' in lead, "Lead missing 'phone'"
            assert 'source' in lead, "Lead missing 'source'"
            assert 'territory' in lead, "Lead missing 'territory'"
            assert 'score' in lead, "Lead missing 'score'"
            assert 'label' in lead, "Lead missing 'label'"
            assert 'engine' in lead, "Lead missing 'engine'"
            assert 'status' in lead, "Lead missing 'status'"
            assert 'assignedTo' in lead, "Lead missing 'assignedTo'"
            assert 'createdAt' in lead, "Lead missing 'createdAt'"
            
            # Validate score
            score = lead['score']
            assert isinstance(score, (int, float)), f"Score must be a number, got {type(score)}"
            assert 0 <= score <= 100, f"Score must be 0-100, got {score}"
            
            # Validate label
            assert lead['label'] in ['Hot', 'Warm', 'Cold'], f"Invalid label: {lead['label']}"
            
            # Validate engine
            assert lead['engine'] in ['llm', 'rules', 'rules-fallback'], f"Invalid engine: {lead['engine']}"
            
        print(f"✅ PASS: Got {len(leads)} leads with correct structure\n")
        return True, leads
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False, []

def test_get_leads_filter_territory(leads):
    """Test 4: GET /api/leads?territory=Bengaluru"""
    print("=" * 80)
    print("TEST 4: GET /api/leads?territory=Bengaluru")
    print("=" * 80)
    try:
        r = requests.get(f"{BASE_URL}/leads?territory=Bengaluru", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        filtered = data['leads']
        print(f"Got {len(filtered)} Bengaluru leads")
        
        for lead in filtered:
            assert lead['territory'] == 'Bengaluru', f"Expected Bengaluru, got {lead['territory']}"
        
        print(f"✅ PASS: Territory filter working\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_get_leads_filter_status(leads):
    """Test 5: GET /api/leads?status=Won"""
    print("=" * 80)
    print("TEST 5: GET /api/leads?status=Won")
    print("=" * 80)
    try:
        r = requests.get(f"{BASE_URL}/leads?status=Won", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        filtered = data['leads']
        print(f"Got {len(filtered)} Won leads")
        
        for lead in filtered:
            assert lead['status'] == 'Won', f"Expected Won, got {lead['status']}"
        
        print(f"✅ PASS: Status filter working\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_get_leads_filter_agent(leads):
    """Test 6: GET /api/leads?role=agent&agent=<name>"""
    print("=" * 80)
    print("TEST 6: GET /api/leads?role=agent&agent=<name>")
    print("=" * 80)
    try:
        # Get an agent name from existing leads
        if not leads:
            print("⚠️  SKIP: No leads to get agent name from\n")
            return True
        
        agent_name = leads[0]['assignedTo']
        print(f"Testing with agent: {agent_name}")
        
        r = requests.get(f"{BASE_URL}/leads?role=agent&agent={agent_name}", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        filtered = data['leads']
        print(f"Got {len(filtered)} leads for agent {agent_name}")
        
        for lead in filtered:
            assert lead['assignedTo'] == agent_name, f"Expected {agent_name}, got {lead['assignedTo']}"
        
        print(f"✅ PASS: Agent filter working\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_post_lead_happy_path():
    """Test 7: POST /api/leads - happy path with strong intent"""
    print("=" * 80)
    print("TEST 7: POST /api/leads - Happy Path (Strong Intent)")
    print("=" * 80)
    try:
        payload = {
            "name": "Rajesh Kumar",
            "phone": "+919876543210",
            "email": "rajesh@techcorp.in",
            "company": "TechCorp Solutions",
            "message": "URGENT - ready to buy LeadEdge360 demo asap, budget approved. Need immediate demo.",
            "budget": 300000,
            "whatsapp": True,
            "source": "whatsapp",
            "territory": "Bengaluru"
        }
        
        print(f"Payload: {json.dumps(payload, indent=2)}")
        r = requests.post(f"{BASE_URL}/leads", json=payload, timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 201, f"Expected 201, got {r.status_code}"
        assert 'lead' in data, "Missing 'lead' field"
        
        lead = data['lead']
        assert is_valid_uuid(lead['id']), f"Lead ID is not a valid UUID v4: {lead['id']}"
        assert lead['name'] == payload['name'], "Name mismatch"
        assert lead['phone'] == payload['phone'], "Phone mismatch"
        
        # Validate score (should be high for strong intent)
        score = lead['score']
        assert isinstance(score, (int, float)), f"Score must be a number, got {type(score)}"
        assert 0 <= score <= 100, f"Score must be 0-100, got {score}"
        print(f"Score: {score} (expected >= 60 for strong intent)")
        
        # Validate label (should not be Cold for strong intent)
        assert lead['label'] in ['Hot', 'Warm', 'Cold'], f"Invalid label: {lead['label']}"
        print(f"Label: {lead['label']}")
        
        # Validate engine
        assert lead['engine'] in ['llm', 'rules', 'rules-fallback'], f"Invalid engine: {lead['engine']}"
        
        # Validate assignment
        assert 'assignedTo' in lead, "Missing assignedTo"
        assert lead['assignedTo'], "assignedTo is empty"
        
        print(f"✅ PASS: Lead created successfully with ID {lead['id']}\n")
        return True, lead['id']
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False, None

def test_post_lead_validation_missing_name():
    """Test 8a: POST /api/leads - validation: missing name"""
    print("=" * 80)
    print("TEST 8a: POST /api/leads - Validation: Missing Name")
    print("=" * 80)
    try:
        payload = {
            "phone": "+919876543210",
            "email": "test@test.com"
        }
        
        r = requests.post(f"{BASE_URL}/leads", json=payload, timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 400, f"Expected 400, got {r.status_code}"
        assert 'error' in data, "Missing error message"
        
        print(f"✅ PASS: Validation working for missing name\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_post_lead_validation_missing_phone():
    """Test 8b: POST /api/leads - validation: missing phone"""
    print("=" * 80)
    print("TEST 8b: POST /api/leads - Validation: Missing Phone")
    print("=" * 80)
    try:
        payload = {
            "name": "Test User",
            "email": "test@test.com"
        }
        
        r = requests.post(f"{BASE_URL}/leads", json=payload, timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 400, f"Expected 400, got {r.status_code}"
        assert 'error' in data, "Missing error message"
        
        print(f"✅ PASS: Validation working for missing phone\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_patch_lead_valid_status(lead_id):
    """Test 9: PATCH /api/leads/:id - update status to Qualified"""
    print("=" * 80)
    print("TEST 9: PATCH /api/leads/:id - Update Status to Qualified")
    print("=" * 80)
    try:
        if not lead_id:
            print("⚠️  SKIP: No lead ID available\n")
            return True
        
        payload = {"status": "Qualified"}
        r = requests.patch(f"{BASE_URL}/leads/{lead_id}", json=payload, timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert 'lead' in data, "Missing 'lead' field"
        assert data['lead']['status'] == 'Qualified', f"Status not updated, got {data['lead']['status']}"
        
        print(f"✅ PASS: Status updated to Qualified\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_patch_lead_invalid_status(lead_id):
    """Test 10: PATCH /api/leads/:id - invalid status should not update"""
    print("=" * 80)
    print("TEST 10: PATCH /api/leads/:id - Invalid Status (Should Not Update)")
    print("=" * 80)
    try:
        if not lead_id:
            print("⚠️  SKIP: No lead ID available\n")
            return True
        
        # First get current status
        r = requests.get(f"{BASE_URL}/leads", timeout=10)
        leads = r.json()['leads']
        current_lead = next((l for l in leads if l['id'] == lead_id), None)
        if not current_lead:
            print("⚠️  SKIP: Lead not found\n")
            return True
        
        original_status = current_lead['status']
        print(f"Original status: {original_status}")
        
        # Try to update with invalid status
        payload = {"status": "BogusStatus"}
        r = requests.patch(f"{BASE_URL}/leads/{lead_id}", json=payload, timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        
        # Fetch again to verify status unchanged
        r = requests.get(f"{BASE_URL}/leads", timeout=10)
        leads = r.json()['leads']
        updated_lead = next((l for l in leads if l['id'] == lead_id), None)
        
        assert updated_lead['status'] == original_status, f"Status should not change, but got {updated_lead['status']}"
        
        print(f"✅ PASS: Invalid status rejected, status remains {original_status}\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_post_rescore(lead_id):
    """Test 11: POST /api/leads/:id/rescore"""
    print("=" * 80)
    print("TEST 11: POST /api/leads/:id/rescore")
    print("=" * 80)
    try:
        if not lead_id:
            print("⚠️  SKIP: No lead ID available\n")
            return True
        
        r = requests.post(f"{BASE_URL}/leads/{lead_id}/rescore", timeout=15)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert 'lead' in data, "Missing 'lead' field"
        
        lead = data['lead']
        assert 'score' in lead, "Missing score"
        assert 'label' in lead, "Missing label"
        assert 'reasons' in lead, "Missing reasons"
        assert 'engine' in lead, "Missing engine"
        
        # Validate score
        score = lead['score']
        assert isinstance(score, (int, float)), f"Score must be a number, got {type(score)}"
        assert 0 <= score <= 100, f"Score must be 0-100, got {score}"
        
        # Validate label
        assert lead['label'] in ['Hot', 'Warm', 'Cold'], f"Invalid label: {lead['label']}"
        
        # Validate engine
        assert lead['engine'] in ['llm', 'rules', 'rules-fallback'], f"Invalid engine: {lead['engine']}"
        
        print(f"✅ PASS: Rescore working, new score: {score}, label: {lead['label']}\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_get_kpis():
    """Test 12: GET /api/kpis"""
    print("=" * 80)
    print("TEST 12: GET /api/kpis")
    print("=" * 80)
    try:
        r = requests.get(f"{BASE_URL}/kpis", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response keys: {list(data.keys())}")
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        
        # Required fields
        assert 'total' in data, "Missing 'total'"
        assert 'qualified' in data, "Missing 'qualified'"
        assert 'won' in data, "Missing 'won'"
        assert 'hot' in data, "Missing 'hot'"
        assert 'avgScore' in data, "Missing 'avgScore'"
        assert 'conversion' in data, "Missing 'conversion'"
        assert 'byTerritory' in data, "Missing 'byTerritory'"
        assert 'byStatus' in data, "Missing 'byStatus'"
        assert 'bySource' in data, "Missing 'bySource'"
        assert 'byAgent' in data, "Missing 'byAgent'"
        assert 'trend' in data, "Missing 'trend'"
        
        # Validate numeric fields
        assert isinstance(data['total'], int), "total must be integer"
        assert isinstance(data['qualified'], int), "qualified must be integer"
        assert isinstance(data['won'], int), "won must be integer"
        assert isinstance(data['hot'], int), "hot must be integer"
        assert isinstance(data['avgScore'], (int, float)), "avgScore must be number"
        assert isinstance(data['conversion'], (int, float)), "conversion must be number"
        assert 0 <= data['conversion'] <= 100, f"conversion must be 0-100, got {data['conversion']}"
        
        # Validate arrays
        assert isinstance(data['byTerritory'], list), "byTerritory must be array"
        assert isinstance(data['byStatus'], list), "byStatus must be array"
        assert isinstance(data['bySource'], list), "bySource must be array"
        assert isinstance(data['byAgent'], list), "byAgent must be array"
        assert isinstance(data['trend'], list), "trend must be array"
        
        # CRITICAL: Validate 14-day trend
        trend = data['trend']
        assert len(trend) == 14, f"Trend must have exactly 14 entries, got {len(trend)}"
        
        print(f"\nKPI Summary:")
        print(f"  Total: {data['total']}")
        print(f"  Qualified: {data['qualified']}")
        print(f"  Won: {data['won']}")
        print(f"  Hot: {data['hot']}")
        print(f"  Avg Score: {data['avgScore']}")
        print(f"  Conversion: {data['conversion']}%")
        print(f"  Trend entries: {len(trend)}")
        
        # Validate trend structure
        for entry in trend:
            assert 'date' in entry, "Trend entry missing 'date'"
            assert 'leads' in entry, "Trend entry missing 'leads'"
            assert 'won' in entry, "Trend entry missing 'won'"
        
        print(f"✅ PASS: KPIs working with correct structure and 14-day trend\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_delete_lead(lead_id):
    """Test 13: DELETE /api/leads/:id"""
    print("=" * 80)
    print("TEST 13: DELETE /api/leads/:id")
    print("=" * 80)
    try:
        if not lead_id:
            print("⚠️  SKIP: No lead ID available\n")
            return True
        
        r = requests.delete(f"{BASE_URL}/leads/{lead_id}", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert data.get('ok') == True, "Expected ok: true"
        
        # Verify lead is deleted
        r = requests.get(f"{BASE_URL}/leads", timeout=10)
        leads = r.json()['leads']
        deleted_lead = next((l for l in leads if l['id'] == lead_id), None)
        assert deleted_lead is None, f"Lead {lead_id} should be deleted but still exists"
        
        print(f"✅ PASS: Lead deleted successfully\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_post_contact_happy_path():
    """Test 14: POST /api/contact - happy path"""
    print("=" * 80)
    print("TEST 14: POST /api/contact - Happy Path")
    print("=" * 80)
    try:
        payload = {
            "name": "Priya Sharma",
            "email": "priya@example.com",
            "message": "I would like to know more about LeadEdge360 pricing."
        }
        
        r = requests.post(f"{BASE_URL}/contact", json=payload, timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 201, f"Expected 201, got {r.status_code}"
        assert data.get('ok') == True, "Expected ok: true"
        
        print(f"✅ PASS: Contact form submission working\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_post_contact_validation_missing_email():
    """Test 15a: POST /api/contact - validation: missing email"""
    print("=" * 80)
    print("TEST 15a: POST /api/contact - Validation: Missing Email")
    print("=" * 80)
    try:
        payload = {
            "name": "Test User",
            "message": "Hello"
        }
        
        r = requests.post(f"{BASE_URL}/contact", json=payload, timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 400, f"Expected 400, got {r.status_code}"
        assert 'error' in data, "Missing error message"
        
        print(f"✅ PASS: Validation working for missing email\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

def test_post_contact_validation_missing_message():
    """Test 15b: POST /api/contact - validation: missing message"""
    print("=" * 80)
    print("TEST 15b: POST /api/contact - Validation: Missing Message")
    print("=" * 80)
    try:
        payload = {
            "name": "Test User",
            "email": "test@test.com"
        }
        
        r = requests.post(f"{BASE_URL}/contact", json=payload, timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 400, f"Expected 400, got {r.status_code}"
        assert 'error' in data, "Missing error message"
        
        print(f"✅ PASS: Validation working for missing message\n")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}\n")
        return False

# Run all tests
def main():
    print("\n" + "=" * 80)
    print("LEADEDGE360 MVP - COMPREHENSIVE BACKEND API TEST SUITE")
    print("=" * 80 + "\n")
    
    results = {}
    
    # Test 1: Health check
    results['health_check'] = test_health_check()
    
    # Test 2: Get agents
    success, agents = test_get_agents()
    results['get_agents'] = success
    
    # Test 3: Get leads (auto-seed)
    success, leads = test_get_leads_initial()
    results['get_leads_initial'] = success
    
    # Test 4-6: Filter tests
    results['filter_territory'] = test_get_leads_filter_territory(leads)
    results['filter_status'] = test_get_leads_filter_status(leads)
    results['filter_agent'] = test_get_leads_filter_agent(leads)
    
    # Test 7: Create lead (happy path)
    success, lead_id = test_post_lead_happy_path()
    results['post_lead_happy'] = success
    
    # Test 8: Validation tests
    results['validation_missing_name'] = test_post_lead_validation_missing_name()
    results['validation_missing_phone'] = test_post_lead_validation_missing_phone()
    
    # Test 9-10: Update lead
    results['patch_valid_status'] = test_patch_lead_valid_status(lead_id)
    results['patch_invalid_status'] = test_patch_lead_invalid_status(lead_id)
    
    # Test 11: Rescore
    results['rescore'] = test_post_rescore(lead_id)
    
    # Test 12: KPIs
    results['get_kpis'] = test_get_kpis()
    
    # Test 13: Delete lead
    results['delete_lead'] = test_delete_lead(lead_id)
    
    # Test 14-15: Contact form
    results['contact_happy'] = test_post_contact_happy_path()
    results['contact_missing_email'] = test_post_contact_validation_missing_email()
    results['contact_missing_message'] = test_post_contact_validation_missing_message()
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"\nPassed: {passed}/{total}")
    print("\nDetailed Results:")
    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}: {test}")
    
    print("\n" + "=" * 80)
    if passed == total:
        print("🎉 ALL TESTS PASSED!")
    else:
        print(f"⚠️  {total - passed} TEST(S) FAILED")
    print("=" * 80 + "\n")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
