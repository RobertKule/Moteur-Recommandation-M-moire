
# 📘 COURS COMPLET – FASTAPI (DÉBUTANT)

---

# 1️⃣ INTRODUCTION

Aujourd’hui, beaucoup d’applications ne sont plus seulement des sites web.

Elles sont :

* des **APIs**
* des **backends pour mobile**
* des **services pour IA**
* des **microservices**

Pour cela, on a besoin de frameworks :

* rapides
* simples
* scalables
* modernes

👉 **FastAPI a été créé pour répondre à ce besoin.**

---

# 2️⃣ DÉFINITION (MOTS SIMPLES)

## Qu’est-ce que FastAPI ?

> **FastAPI est un framework Python moderne pour créer des APIs web rapidement, proprement et efficacement.**

En termes simples :

* Il reçoit des requêtes HTTP
* Il traite les données
* Il renvoie des réponses (souvent en JSON)

📌 FastAPI **ne fait PAS de pages HTML** par défaut
📌 Il est fait pour **communiquer entre systèmes**

---

# 3️⃣ QU’EST-CE QU’UN FRAMEWORK PYTHON ?

Un framework Python est un **ensemble d’outils** qui :

* évite d’écrire du code répétitif
* impose une structure
* facilite la maintenance
* améliore la sécurité

---

# 4️⃣ LES FRAMEWORKS PYTHON (COMPARAISON)

## Principaux frameworks web Python

### Tableau comparatif clair

| Framework   | Type       | Async | ORM intégré | Auth intégrée | Cas d’usage    |
| ----------- | ---------- | ----- | ----------- | ------------- | -------------- |
| **Django**  | Full-stack | ❌     | ✅           | ✅             | Sites complets |
| **FastAPI** | API        | ✅     | ❌           | ❌             | APIs modernes  |
| **Flask**   | Micro      | ❌     | ❌           | ❌             | Petits projets |
| **Pyramid** | Flexible   | ❌     | ❌           | ❌             | Projets custom |
| **Sanic**   | API        | ✅     | ❌           | ❌             | Haute perf     |
| **Tornado** | Bas niveau | ✅     | ❌           | ❌             | WebSockets     |

---

## Lecture simple du tableau

* **Django** : fait tout, mais lourd pour API
* **FastAPI** : API propre, rapide, moderne
* **Flask** : simple mais limité
* **Sanic / Tornado** : rapides mais complexes

---

# 5️⃣ POURQUOI FASTAPI ? (LE POURQUOI)

FastAPI est populaire parce qu’il :

### ✅ Est très rapide

* Basé sur Starlette + ASGI

### ✅ Est facile à lire

* Python clair
* Typage explicite

### ✅ Évite les erreurs

* Validation automatique

### ✅ Génère la documentation

* Swagger automatique

---

# 6️⃣ SYNTAXE FASTAPI (EXPLICATION)

### Exemple simple

```python
@app.get("/users")
def get_users():
    return [{"name": "Alice"}]
```

### Explication ligne par ligne

| Ligne      | Explication     |
| ---------- | --------------- |
| `@app.get` | Route HTTP GET  |
| `/users`   | URL             |
| `def`      | Fonction Python |
| `return`   | Réponse JSON    |

👉 Simple, lisible, explicite

---

# 7️⃣ POURQUOI FASTAPI ≠ DJANGO

### Django

```python
urlpatterns = [
    path("users/", views.users)
]
```

### FastAPI

```python
@app.get("/users")
def users():
    ...
```

📌 FastAPI = **moins de fichiers**
📌 FastAPI = **moins de magie**

---

# 8️⃣ PREMIER CODE FASTAPI (COMPLET)

### Étape 1 : installation

```bash
pip install fastapi uvicorn
```

---

### Étape 2 : code minimal

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello FastAPI"}
```

---

### Étape 3 : lancer le serveur

```bash
uvicorn main:app --reload
```

---

### Étape 4 : tester

* [http://localhost:8000](http://localhost:8000)
* [http://localhost:8000/docs](http://localhost:8000/docs)

👉 Swagger généré automatiquement 🎉

---

# 9️⃣ CE QUE FASTAPI FAIT POUR TOI AUTOMATIQUEMENT

Sans écrire de code :

* Validation des types
* Documentation
* Gestion JSON
* Erreurs HTTP

---

# 🔟 DIFFÉRENCE MAJEURE AVEC DJANGO (RÉSUMÉ)

| Concept | Django    | FastAPI   |
| ------- | --------- | --------- |
| Type    | Monolithe | API       |
| Auth    | Session   | JWT       |
| State   | Stateful  | Stateless |
| Admin   | Inclus    | Non       |
| Async   | Limité    | Natif     |

---

# 1️⃣1️⃣ CE QUE TU DOIS COMPRENDRE AVANT DE CONTINUER

* FastAPI est **stateless**
* Le client envoie toujours les infos
* Le serveur ne garde rien en mémoire
* JWT remplace la session

---

# 1️⃣2️⃣ CE QU’ON VA VOIR ENSUITE (ÉTAPE PAR ÉTAPE)

👉 **Prochaine leçon :**

1. HTTP en détail
2. Routes & paramètres
3. Pydantic
4. Auth JWT
5. Middleware
6. Structure projet
7. Sécurité
8. Déploiement




## Niveau débutant → intermédiaire → avancé

---

# 1️⃣ HTTP EN DÉTAIL (BASE ABSOLUMENT ESSENTIELLE)

## 🔹 Qu’est-ce que HTTP ?

> **HTTP est un protocole de communication entre un client et un serveur.**

* Client → navigateur, mobile, frontend
* Serveur → FastAPI, Django, backend

📌 HTTP fonctionne par **requête / réponse**

---

## 🔹 Exemple réel

1. Tu ouvres `/dashboard`
2. Le navigateur envoie une requête
3. Le serveur répond avec des données

---

## 🔹 Les méthodes HTTP (très important)

| Méthode | Utilité          | Exemple          |
| ------- | ---------------- | ---------------- |
| GET     | Lire             | Voir un profil   |
| POST    | Créer            | Inscription      |
| PUT     | Modifier         | Modifier profil  |
| PATCH   | Modifier partiel | Modifier email   |
| DELETE  | Supprimer        | Supprimer compte |

---

## 🔹 Exemple FastAPI

```python
@app.get("/users")
def list_users():
    return []
```

👉 GET = lire
👉 POST = créer
👉 PUT/PATCH = modifier
👉 DELETE = supprimer

---

# 2️⃣ ROUTES & PARAMÈTRES

---

## 🔹 Route simple

```python
@app.get("/ping")
def ping():
    return {"status": "ok"}
```

---

## 🔹 Paramètre dans l’URL

```python
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id}
```

📌 `user_id` est **extrait de l’URL**

---

## 🔹 Query parameters

URL :

```
/users?limit=10&page=2
```

Code :

```python
@app.get("/users")
def list_users(limit: int = 10, page: int = 1):
    return {"limit": limit, "page": page}
```

---

## 🔹 Différence importante

| Type   | Où ? | Exemple       |
| ------ | ---- | ------------- |
| Path   | URL  | `/users/5`    |
| Query  | ?    | `?page=1`     |
| Body   | JSON | POST          |
| Header | HTTP | Authorization |

---

# 3️⃣ PYDANTIC (CŒUR DE FASTAPI)

## 🔹 Qu’est-ce que Pydantic ?

> **Pydantic sert à valider et structurer les données automatiquement.**

👉 Plus d’erreurs cachées
👉 Données propres
👉 Sécurité renforcée

---

## 🔹 Exemple simple

```python
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str
```

---

## 🔹 Utilisation avec POST

```python
@app.post("/users")
def create_user(user: UserCreate):
    return user
```

📌 FastAPI :

* vérifie les champs
* refuse les champs manquants
* retourne une erreur claire

---

## 🔹 Erreur automatique

Si `password` manquant 👉 **422 Error**

👉 ZÉRO code écrit par toi

---

# 4️⃣ AUTHENTIFICATION JWT (TRÈS IMPORTANT)

---

## 🔹 Stateless (mot compliqué expliqué)

> **Stateless = le serveur ne garde rien en mémoire entre deux requêtes**

📌 Chaque requête est indépendante
📌 Le client doit prouver qui il est à chaque fois

---

## 🔹 JWT (JSON Web Token)

Un JWT est :

* un texte encodé
* signé
* envoyé dans les headers

```http
Authorization: Bearer eyJhbGciOi...
```

---

## 🔹 Flux JWT

1. Login (email + password)
2. Serveur crée un token
3. Client stocke le token
4. Client envoie le token à chaque requête

---

## 🔹 Exemple FastAPI (simplifié)

```python
from fastapi import Depends

def get_current_user(token: str = Depends(oauth2_scheme)):
    return decode_token(token)
```

---

# 5️⃣ MIDDLEWARE (EXPLICATION SIMPLE)

## 🔹 Qu’est-ce qu’un middleware ?

> **Un middleware est un filtre qui s’exécute avant ou après une requête.**

---

## 🔹 À quoi ça sert ?

* Auth
* Logs
* Sécurité
* CORS
* Rate limiting

---

## 🔹 Exemple simple

```python
@app.middleware("http")
async def log_requests(request, call_next):
    response = await call_next(request)
    print(request.url)
    return response
```

---

# 6️⃣ STRUCTURE D’UN PROJET FASTAPI (PRO)

## 🔹 Mauvais (tout dans main.py)

❌ difficile à maintenir

---

## 🔹 Bonne structure

```
app/
 ├── main.py
 ├── api/
 │   ├── auth.py
 │   ├── users.py
 ├── core/
 │   ├── security.py
 │   ├── config.py
 ├── models/
 ├── schemas/
 ├── services/
```

👉 Très proche de Django mais **plus léger**

---

# 7️⃣ SÉCURITÉ (OBLIGATOIRE)

## 🔹 Bonnes pratiques

* JWT avec expiration
* Hash des mots de passe (bcrypt)
* CORS configuré
* HTTPS en prod
* Validation Pydantic

---

## 🔹 Hash password

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])
```

---

# 8️⃣ DÉPLOIEMENT (VISION GLOBALE)

---

## 🔹 En développement

```bash
uvicorn app.main:app --reload
```

---

## 🔹 En production

* Gunicorn + Uvicorn
* Docker
* Nginx
* Railway / Render / VPS

---

## 🔹 Exemple Docker

```dockerfile
FROM python:3.11
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

---

# 🎓 NIVEAU ATTEINT APRÈS CE COURS

À ce stade, tu comprends :

* HTTP
* API REST
* FastAPI
* JWT
* Middleware
* Structure propre
* Sécurité backend

👉 **Niveau junior backend API solide**
