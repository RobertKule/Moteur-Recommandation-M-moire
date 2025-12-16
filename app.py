import streamlit as st
import pandas as pd
import plotly.express as px
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from sklearn.preprocessing import normalize
from sklearn.decomposition import PCA 
import re 
import hashlib 
import os 
import time

# --- Fichier de Stockage des Utilisateurs ---
USER_DATA_FILE = 'users.csv'

# --- Configuration de la Page ---
st.set_page_config(
    page_title="Moteur de Recommandation des sujets de memoire",
    layout="wide", # On garde wide pour la place, mais on centre avec les colonnes
    initial_sidebar_state="expanded"
)

# --- INJECTION CSS POUR LE STYLE (Cartes, Boutons, Couleurs) ---
def inject_custom_css():
    """Injecte du CSS pour styliser les boutons, les conteneurs (Cartes) et centrer certains éléments."""
    st.markdown(
        """
        <style>
        /* Styles généraux pour les boutons */
        .stButton>button {
            border-radius: 25px; 
            padding: 15px 25px;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1); 
        }
        
        /* Bouton Primaire (Teal) */
        .stButton button[kind="primary"] {
            background-color: #008080; 
            border: 3px solid #008080;
            color: white; 
        }

        /* Boutons Secondaires (Gris Anthracite) */
        .stButton button[kind="secondary"] {
             background-color: #5A6270; 
             border: 3px solid #5A6270;
             color: white; 
        }
        
        /* Effet de survol */
        .stButton>button:hover {
            opacity: 0.85; 
            transform: translateY(-1px); 
            box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.2);
        }
        
        /* CSS pour les Cartes/Conteneurs  */
        .stContainer {
            background-color: #ffffff; /* Fond blanc pour la carte */
            padding: 20px;
            border-radius: 15px; /* Coins arrondis */
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Ombre douce, rend l'aspect "boîte" */
            margin-bottom: 25px; /* Espace entre les cartes */
        }
        
        /* Couleur Spéciale pour les boutons Rouges Critiques */
        .stButton button[data-testid*="btn_logout_final"],
        .stButton button[data-testid*="clear_tab1_final"] {
            background-color: #DC3545; /* Rouge vif pour critique */
            border: 3px solid #DC3545;
            color: white;
        }
        .stButton button[data-testid*="btn_logout_final"]:hover,
        .stButton button[data-testid*="clear_tab1_final"]:hover {
            background-color: #C82333; 
        }

        /* Améliorer l'aspect des onglets (FIX VISUEL) */
        .stTabs [data-baseweb="tab-list"] {
            /* Ajout d'une marge au bas de la liste des onglets pour éviter l'effet "caché" */
            margin-bottom: 15px; 
        }
        .stTabs [data-baseweb="tab-list"] button {
            background-color: #f0f2f6;
            border-radius: 20px 20px 0 0;
            padding: 15px 20px;
            font-weight: bold;
        }

        /* Centrage du Titre principal */
        h1 {
            text-align: center;
        }
        /* Centrage du sous-titre de Bienvenue */
        h2 {
            text-align: center;
        }
        </style>
        """, 
        unsafe_allow_html=True
    )

# --- FONCTION POUR LE ROUGE (Inchangé) ---
def st_critical_button(label, key, on_click=None, use_container_width=False, help=None):
    """Crée un bouton rouge vif pour les actions critiques (Déconnexion, Vider)."""
    return st.button(
        label,
        key=key,
        on_click=on_click,
        use_container_width=use_container_width,
        help=help,
        type="secondary" 
    )
    
# --- CONSTANTES, INITIALISATION et FONCTIONS D'AUTHENTIFICATION (Inchangé) ---
FILIERE_TAGS = ['gi', 'ge', 'gc']
ALL_OPTIONS = ["Toutes les filières", "GI", "GE", "GC"]

if 'logged_in' not in st.session_state:
    st.session_state['logged_in'] = False
if 'username' not in st.session_state:
    st.session_state['username'] = None
if 'search_query' not in st.session_state:
    st.session_state['search_query'] = ""

st.session_state['data'] = pd.DataFrame()
st.session_state['TECHNICAL_TAGS'] = []

def clear_search():
    st.session_state.search_query = ""
    st.session_state.input_tags_weight = "" 
    st.session_state.weights = {}

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def check_users_file():
    if not os.path.exists(USER_DATA_FILE) or os.path.getsize(USER_DATA_FILE) == 0:
        pd.DataFrame(columns=['username', 'hashed_password']).to_csv(USER_DATA_FILE, index=False)

@st.cache_data(ttl=300) 
def load_users():
    check_users_file()
    return pd.read_csv(USER_DATA_FILE)

def register_user(username, password):
    users_df = load_users()
    if username in users_df['username'].values:
        st.error("Ce nom d'utilisateur existe déjà.")
        return False
    
    hashed_pwd = hash_password(password)
    new_user = pd.DataFrame([{'username': username, 'hashed_password': hashed_pwd}])
    
    new_user.to_csv(USER_DATA_FILE, mode='a', header=False, index=False)
    load_users.clear() 
    st.success("Inscription réussie ! Vous pouvez maintenant vous connecter.")
    return True

def authenticate_user(username, password):
    users_df = load_users()
    if username not in users_df['username'].values:
        return False
    
    user_row = users_df[users_df['username'] == username].iloc[0]
    hashed_pwd_stored = user_row['hashed_password']
    hashed_pwd_input = hash_password(password)
    
    return hashed_pwd_input == hashed_pwd_stored

def logout():
    st.session_state['logged_in'] = False
    st.session_state['username'] = None
    st.rerun()


# --- 1. CHARGEMENT et PRÉPARATION des Données (Inchangé) ---
@st.cache_data
def load_data(file_path):
    try:
        df = pd.read_csv(
            file_path, 
            encoding='utf-8', 
            sep=';', 
            usecols=[0, 1, 2, 3] 
        )
        df.columns = ['id_sujet', 'thesis_title', 'student_faculty', 'tags']
        df['id_sujet'] = df['id_sujet'].astype(str)
        df['student_faculty'] = df['student_faculty'].astype(str).str.lower().str.strip()
        df['student_faculty'] = df['student_faculty'].apply(lambda x: re.sub(r'[^a-z\s]', '', x).strip())
        
        def map_faculty_to_abbr(name):
            if 'informatique' in name or name == 'gi': return 'GI'
            elif 'electrique' in name or name == 'ge': return 'GE'
            elif 'civil' in name or name == 'gc': return 'GC'
            return None 

        df['student_faculty'] = df['student_faculty'].apply(map_faculty_to_abbr)
        df.dropna(subset=['student_faculty'], inplace=True) 
        
        df['tags'] = (
            df['tags']
            .astype(str)
            .str.replace('_x000D_', ' ', regex=False)
            .str.replace('"', '', regex=False)
            .str.strip()
            .str.lower()
        )
        df['thesis_title'] = df['thesis_title'].str.replace('_x000D_', ' ', regex=False)
        df['combined_features'] = df['thesis_title'].str.lower() + " " + df['tags']
        
        all_tags = df['tags'].str.split(';').explode().str.strip()
        technical_tags = sorted(list(set([tag for tag in all_tags if tag not in FILIERE_TAGS and tag])))
        
        return df, technical_tags

    except Exception as e:
        st.error(f"Erreur lors du chargement des données de thèse : {e}")
        return pd.DataFrame(), []

# --- CHARGEMENT INITIAL DES DONNÉES DE THÈSE ---
FILE_NAME = 'data_96_subjects_finalb.csv'
st.session_state['data'], st.session_state['TECHNICAL_TAGS'] = load_data(FILE_NAME)

data = st.session_state['data']
if data.empty:
    st.error("Le fichier de données de thèse est vide ou n'a pas pu être chargé. L'application s'arrête.")
    st.stop()


# --- VECTEURS (TF-IDF) et Normalisation (Inchangé) ---
tfidf = TfidfVectorizer(stop_words=None)
tfidf_matrix = tfidf.fit_transform(data['combined_features'])
normalized_tfidf_matrix = normalize(tfidf_matrix, norm='l2', axis=1)
cosine_sim = linear_kernel(normalized_tfidf_matrix, normalized_tfidf_matrix)

# --- FONCTIONS DE RECOMMANDATION ET VISUALISATION (Inchangé) ---
def recommend(input_source, current_df, top_n=15, weights=None):
    if not input_source.strip():
        return pd.DataFrame(), ""
    input_text_clean = input_source.lower()
    if weights:
        weighted_input_text = []
        for word, weight in weights.items():
            weighted_input_text.extend([word] * weight) 
        input_matrix = tfidf.transform([" ".join(weighted_input_text)])
        input_text_for_display = f"{input_source} (Pondéré)"
    else:
        input_matrix = tfidf.transform([input_text_clean])
        input_text_for_display = input_source
    normalized_input_matrix = normalize(input_matrix, norm='l2', axis=1)
    sim_scores = list(enumerate(linear_kernel(normalized_input_matrix, normalized_tfidf_matrix).flatten()))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    results_indices = [i[0] for i in sim_scores]
    results_scores = [i[1] for i in sim_scores]
    all_results_df = data.iloc[results_indices].copy()
    all_results_df['Score de Similarité'] = results_scores
    filtered_results = all_results_df[all_results_df.id_sujet.isin(current_df.id_sujet)].copy()
    final_recommendation = filtered_results[filtered_results['Score de Similarité'] > 0].head(top_n)
    input_terms = set([t.strip() for t in input_text_clean.split(',') if t.strip()] + input_text_clean.split())
    def highlight_tags(row):
        subject_tags = str(row['tags']).split(';')
        highlighted_tags = []
        for tag in subject_tags:
            tag_clean = tag.strip()
            if tag_clean in input_terms:
                 highlighted_tags.append(f'**{tag_clean}**')
            else:
                highlighted_tags.append(tag_clean)
        return ', '.join(highlighted_tags) 
    final_recommendation['Tags Correspondants'] = final_recommendation.apply(highlight_tags, axis=1).astype(str)
    return final_recommendation, input_text_for_display

def create_tag_visualization(df):
    all_tags = df['tags'].str.split(';').explode().str.strip()
    tag_counts = all_tags.value_counts().reset_index()
    tag_counts.columns = ['Tag', 'Fréquence']
    tag_counts = tag_counts[~tag_counts['Tag'].isin(FILIERE_TAGS)]
    top_tags = tag_counts.head(10)
    fig = px.bar(
        top_tags, x='Fréquence', y='Tag', orientation='h',
        title=f"Top 10 Thèmes de Sujets",
        color='Fréquence', color_continuous_scale=px.colors.sequential.Tealgrn
    )
    fig.update_layout(yaxis={'categoryorder':'total ascending'})
    return fig

def run_pca_visualization(df):
    if len(df) < 2:
        st.warning("PCA requiert au moins 2 sujets pour la visualisation.")
        return px.scatter(title="PCA non disponible (moins de 2 sujets)")
    current_indices = df.index
    current_tfidf_matrix = normalized_tfidf_matrix[current_indices, :] 
    pca = PCA(n_components=2)
    try:
        components = pca.fit_transform(current_tfidf_matrix.toarray())
    except ValueError as e:
        if "n_components must be" in str(e):
             st.warning("PCA impossible : Le nombre de sujets est inférieur au nombre de features non-nulles. Essayez d'élargir le filtre.")
             return px.scatter(title="PCA indisponible (données insuffisantes)")
        raise e
    pca_df = pd.DataFrame(data = components, columns = ['PC 1', 'PC 2'])
    pca_df['Titre du Sujet'] = df['thesis_title'].values
    pca_df['Filière'] = df['student_faculty'].values
    variance_ratio = pca.explained_variance_ratio_
    fig = px.scatter(
        pca_df,
        x='PC 1',
        y='PC 2',
        color='Filière',
        hover_data={'Titre du Sujet': True, 'PC 1': False, 'PC 2': False},
        title=f"Visualisation des Sujets par PCA (Réduction de Dimensionnalité)"
    )
    st.info(f"PCA : Les deux composantes principales expliquent {variance_ratio.sum()*100:.2f}% de la variance totale des données TF-IDF.")
    return fig

def create_faculty_distribution_chart(df):
    """Crée un graphique à secteurs montrant la répartition des sujets par filière."""
    faculty_counts = df['student_faculty'].value_counts().reset_index()
    faculty_counts.columns = ['Filière', 'Nombre de Sujets']
    faculty_counts = faculty_counts[faculty_counts['Filière'].isin(ALL_OPTIONS)]
    fig = px.pie(
        faculty_counts, 
        values='Nombre de Sujets', 
        names='Filière', 
        title='Répartition des Sujets de Thèse par Filière',
        color_discrete_sequence=px.colors.sequential.Tealgrn
    )
    fig.update_traces(textposition='inside', textinfo='percent+label')
    return fig


# --- 5. Fonction d'Affichage des Résultats (Correction de Portée V7.7) ---
def display_results(results_df, input_text_display, selected_filiere):
    """
    Affiche les résultats de la recommandation dans un tableau formaté.
    Cette fonction est placée ici pour être accessible depuis main_app.
    """
    if not results_df.empty:
        st.success(f"###  {len(results_df)} Recommandations Pertinentes pour {selected_filiere}")
        st.markdown(f"**Requête Analysée :** `{input_text_display}`")
        
        display_cols = ['Score de Similarité', 'thesis_title', 'Tags Correspondants', 'student_faculty']
        
        results_df['Score de Similarité'] = (results_df['Score de Similarité'] * 100).round(2).astype(str) + ' %'
        
        st.dataframe(
            results_df[display_cols].rename(
                columns={'thesis_title': 'Titre du Sujet', 'student_faculty': 'Filière'}
            ),
            use_container_width=True,
            column_config={"Tags Correspondants": st.column_config.Column("Tags Correspondants", width="medium")},
            hide_index=True
        )

    else:
        st.warning("Aucun sujet pertinent n'a été trouvé avec cette combinaison. Essayez d'élargir la recherche ou de choisir 'Toutes les filières'.")


# --- GESTION DE L'INTERFACE PRINCIPALE (Layout en Cartes V7.8 Centré) ---
def main_app():
    """Fonction principale de l'application (accessible après connexion)."""
    
    inject_custom_css()
    
    # TITRES CENTRÉS (utilisant le CSS injecté)
    st.title(f" Moteur de Recommandation de Sujets de Memoire")
    st.header(f"Bienvenue, Cher Utilisateur")
    st.markdown("---") 

    # --- BARRE LATÉRALE (Composition en 3 Cartes) ---
    with st.sidebar:
        
        #  Carte 1: Espace Utilisateur
        with st.container(border=True): 
            st.header(" Espace Utilisateur")
            st.markdown(f"**Compte :** `{st.session_state.username}`")
            st_critical_button(" Déconnexion", key="btn_logout_final", on_click=logout, use_container_width=True, help="Se déconnecter de la plateforme")
        
        #  Carte 2: Filtres
        with st.container(border=True):
            st.header("Filtres de Thèse")
            selected_filiere = st.selectbox("Sélectionnez la Filière :", ALL_OPTIONS, index=0, key='filiere_select')

            if selected_filiere == "Toutes les filières":
                filtered_data = data
            else:
                filtered_data = data[data['student_faculty'] == selected_filiere]
            
        #  Carte 3: Top Thèmes
        with st.container(border=True):
            st.header(" Top Thèmes")
            if len(filtered_data) > 0:
                try:
                     st.plotly_chart(create_tag_visualization(filtered_data), use_container_width=True)
                except Exception:
                     st.warning("Top 10 non disponible (pas assez de tags uniques).")
            else:
                 st.warning("Pas de données pour afficher le Top 10.")

    
    # --- CENTRAGE DU CONTENU PRINCIPAL ---
    # Col_empty_left et Col_empty_right servent à centrer le contenu principal
    col_empty_left, col_main_content, col_empty_right = st.columns([0.1, 1, 0.1])
    
    with col_main_content:

        # --- SECTION PRINCIPALE : ONGLETS (TABS) ---
        st.markdown("## Outils de Recommandation")
        # st.tabs est maintenant dans le bloc centré
        tab1, tab2 = st.tabs([
            " Recherche Avancée (Pondération)", 
            " Diagnostic & Visualisation"
        ])
        results_placeholder = st.empty()


        # --- TAB 1 : RECHERCHE AVANCÉE (PONDÉRATION) ---
        with tab1:
            
            #  Carte Principale 1: Saisie et Poids
            with st.container(border=True): 
                st.markdown("### 1.  Entrez vos Tags ou Mots-clés")
                
                input_tags_to_weight = st.text_input(
                    "Tags à pondérer (séparés par virgules) :",
                    placeholder="Ex: IA, Cloud, Sécurité, Gestion",
                    key='input_tags_weight'
                )
                
                with st.expander(" Voir les Tags Techniques du Modèle"):
                    st.write(', '.join(st.session_state['TECHNICAL_TAGS']))
                    
                st.markdown("---") 

                user_weights = {}
                
                if input_tags_to_weight:
                    tag_list = [t.strip().lower() for t in input_tags_to_weight.split(',') if t.strip()]
                    
                    st.markdown("### 2. ⚖️ Définir les Poids (Importance) des Tags")
                    st.markdown("*(1 = Faible importance, 5 = Très haute importance)*")
                    
                    cols_per_row = 5
                    num_tags = len(tag_list)
                    num_rows = (num_tags + cols_per_row - 1) // cols_per_row
                    
                    for row in range(num_rows):
                        cols = st.columns(cols_per_row)
                        for i in range(cols_per_row):
                            tag_index = row * cols_per_row + i
                            if tag_index < num_tags:
                                tag = tag_list[tag_index]
                                weight_key = f'weight_{tag}'
                                current_weight = st.session_state.get(weight_key, 2)
                                
                                user_weights[tag] = cols[i].slider(
                                    f"**{tag.capitalize()}**",
                                    min_value=1,
                                    max_value=5,
                                    value=current_weight,
                                    key=weight_key,
                                    help=f"Ce tag est pondéré {current_weight} fois." 
                                )

                st.markdown("---")
                
                # Bloc des Boutons (Alignés)
                col_run, col_clear = st.columns([0.8, 0.2])

                with col_run:
                    if st.button("Lancer la Recherche Pondérée", type="primary", key="btn_weighted_search", use_container_width=True):
                        if input_tags_to_weight:
                            with st.spinner('Analyse et Pondération des sujets en cours...'):
                                time.sleep(1)
                                results_df, input_text_display = recommend(input_tags_to_weight, filtered_data, weights=user_weights)
                            
                            # Les résultats seront affichés dans une nouvelle carte ci-dessous
                            with results_placeholder.container():
                                with st.container(border=True): 
                                    display_results(results_df, input_text_display, selected_filiere)
                        else:
                            st.warning("Veuillez entrer des tags(mot clé) à pondérer.")
                            
                with col_clear:
                    st_critical_button(" Supprimer la Recherche", key="clear_tab1_final", on_click=clear_search, help="Vide le champ de saisie et les poids", use_container_width=True)


        # --- TAB 2 : DIAGNOSTIC ET VISUALISATION ---
        with tab2:
            
            #  Carte 2.1: PCA (Pleine largeur)
            with st.container(border=True):
                st.markdown("### 1.Carte de Similarité des Sujets (PCA)")
        
                st.plotly_chart(run_pca_visualization(filtered_data), use_container_width=True)
                

            st.markdown("---")
            
            #  Carte 2.2 et 2.3: Analyse des Données et Modèle (Alignés côte à côte)
            st.markdown("### 2.Analyse des Données et Modèle")
            col_viz, col_method = st.columns(2)

            with col_viz:
                with st.container(border=True): # Carte pour la Distribution des Filières
                    st.subheader("Distribution des Sujets par Filière")
                    st.markdown("*(Visualisation de la répartition globale des sujets dans la base de données.)*")
                    st.plotly_chart(create_faculty_distribution_chart(data), use_container_width=True)
                    

            with col_method:
                with st.container(border=True): # Carte pour l'Explication du Modèle
                    st.subheader("Explication Technique du Moteur")
                    with st.expander("Cliquez pour voir la méthode de Recommandation"):
                        st.markdown(
                            """
                            Le moteur utilise le système de **Filtrage Basé sur le Contenu** via trois techniques clés :
                            
                            * **1. TF-IDF (Term Frequency-Inverse Document Frequency) :** Chaque sujet est transformé en un vecteur mathématique. 
                            * **2. Normalisation L2 :** Cruciale pour ne considérer que la direction des vecteurs (contenu).
                            * **3. Similarité Cosinus :** Mesure l'angle entre les vecteurs (requête et sujets).
                            """
                        )
                    st.markdown(r"La similarité entre deux sujets $A$ et $B$ est calculée par : $$ \text{Sim}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} $$")
                    


        st.markdown("---")
    


# --- INTERFACE D'AUTHENTIFICATION (Centrée) ---
def auth_page():
    """Interface d'inscription et de connexion."""
    
    inject_custom_css()
    
    # Titres avec style centré du CSS
    st.markdown("<h1 style='text-align: center; color: #4F8BF9;'> Bienvenue sur la Plateforme de Recommandation</h1>", unsafe_allow_html=True)
    st.markdown("<h3 style='text-align: center;'>Veuillez vous authentifier pour accéder au moteur.</h3>", unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Colonnes pour centrer le formulaire d'authentification
    col_empty, col_main, col_empty2 = st.columns([1, 2, 1])
    
    with col_main:
        col_login, col_signup = st.tabs([" Connexion", " Inscription"])
        
        with col_login:
            with st.form("login_form"):
                st.subheader("Accéder au Moteur")
                login_username = st.text_input("Nom d'utilisateur", key="login_user", placeholder="Entrez votre nom d'utilisateur")
                login_password = st.text_input("Mot de passe", type="password", key="login_pwd", placeholder="Entrez votre mot de passe")
                submitted = st.form_submit_button("Se Connecter", type="primary", use_container_width=True)
                
                if submitted:
                    with st.spinner("Vérification des identifiants..."):
                        time.sleep(1) 
                        if authenticate_user(login_username, login_password):
                            st.session_state['logged_in'] = True
                            st.session_state['username'] = login_username
                            st.rerun()
                        else:
                            st.error("Nom d'utilisateur ou mot de passe incorrect.")

        with col_signup:
            with st.form("signup_form"):
                st.subheader("Créer un Nouveau Compte")
                signup_username = st.text_input("Nom d'utilisateur", key="signup_user", placeholder="Choisissez un nom d'utilisateur")
                signup_password = st.text_input("Mot de passe", type="password", key="signup_pwd", placeholder="Choisissez un mot de passe")
                confirm_password = st.text_input("Confirmer le Mot de passe", type="password", key="confirm_pwd", placeholder="Confirmez le mot de passe")
                submitted = st.form_submit_button("S'inscrire", type="secondary", use_container_width=True)
                
                if submitted:
                    if signup_password != confirm_password:
                        st.error("Les mots de passe ne correspondent pas.")
                    elif not signup_username or not signup_password:
                        st.error("Veuillez remplir tous les champs.")
                    else:
                        register_user(signup_username, signup_password)


# --- EXÉCUTION PRINCIPALE ---
if st.session_state['logged_in']:
    main_app()
else:
    auth_page()