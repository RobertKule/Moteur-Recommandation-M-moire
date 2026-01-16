# backend/test_api.py
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoints():
    """Teste les endpoints de l'API"""
    endpoints = [
        ("/health", "GET"),
        ("/sujets", "GET"),
        ("/auth/login-json", "POST")
    ]
    
    for endpoint, method in endpoints:
        url = f"{BASE_URL}{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url)
            elif method == "POST" and "login" in endpoint:
                response = requests.post(url, json={
                    "email": "etudiant@thesis.com",
                    "password": "etudiant123"
                })
            
            print(f"{method} {url} -> {response.status_code}")
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"   Success: {len(data) if isinstance(data, list) else 'Object'}")
                except:
                    print(f"   Success: {response.text[:100]}...")
            else:
                print(f"   Error: {response.text[:200]}")
                
        except Exception as e:
            print(f"{method} {url} -> ERROR: {e}")

def test_full_auth_flow():
    """Teste le flux d'authentification complet"""
    print("\n🔐 Test du flux d'authentification:")
    
    # 1. Login
    print("\n1. Connexion...")
    login_data = {
        "email": "etudiant@thesis.com",
        "password": "etudiant123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login-json", json=login_data)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get("access_token")
        print(f"   Token obtenu: {'Oui' if token else 'Non'}")
        
        # 2. Récupérer les données utilisateur
        print("\n2. Récupération du profil...")
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            user_data = response.json()
            print(f"   Utilisateur: {user_data.get('full_name')} ({user_data.get('email')})")
        
        # 3. Récupérer les sujets
        print("\n3. Récupération des sujets...")
        response = requests.get(f"{BASE_URL}/sujets", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            sujets = response.json()
            print(f"   {len(sujets)} sujets récupérés")
            
            if sujets:
                print(f"   Premier sujet: {sujets[0].get('titre')[:50]}...")
                
        # 4. Tester les recommandations
        print("\n4. Test des recommandations...")
        recommendation_data = {
            "interests": ["IA", "Machine Learning", "Python"],
            "niveau": "M2",
            "limit": 3
        }
        response = requests.post(f"{BASE_URL}/sujets/recommend", 
                                headers=headers, 
                                json=recommendation_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            recommendations = response.json()
            print(f"   {len(recommendations)} recommandations reçues")
    
    else:
        print(f"   Erreur de connexion: {response.text}")

def test_all_endpoints():
    """Teste tous les endpoints principaux"""
    print("🧪 TEST COMPLET DE L'API MEMOBOT")
    print("=" * 50)
    
    # Test des endpoints publics
    print("\n📡 Endpoints publics:")
    test_endpoints()
    
    # Test du flux d'authentification
    test_full_auth_flow()
    
    print("\n" + "=" * 50)
    print("✅ Tests terminés!")

if __name__ == "__main__":
    # Vérifier que le serveur est en cours d'exécution
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Serveur backend actif")
            test_all_endpoints()
        else:
            print("❌ Serveur backend non disponible")
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur backend")
        print("   Assurez-vous que le serveur est en cours d'exécution:")
        print("   cd backend && python main.py")