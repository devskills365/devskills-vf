# api/admin.py
from flask import Blueprint, request, jsonify
from extensions import db 
from models.restaurant import Restaurant
from models.plat import Plat
# api/admin.py (suite)
from sqlalchemy import func, case
from models.client import Client
from models.detail_commande import DetailCommande
from models.plat import Plat
from sqlalchemy.exc import IntegrityError
from datetime import datetime
# Ajoutez d'autres imports de modèles et services au besoin

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/v1/admin')


# Étape 9.1: Route de test simple (GET)
@admin_bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Bienvenue sur l'API Admin."}), 200



# Fonction utilitaire pour sérialiser un Plat
def plat_to_dict(plat):
    return {
        "id": plat.id,
        "nom": plat.nom,
        "description": plat.description,
        "prix": str(plat.prix),
        "disponible": plat.disponible,
        "photo_url": plat.photo_url,
        "restaurant_id": plat.restaurant_id
    }


@admin_bp.route('/plats', methods=['POST'])
def create_plat():
    data = request.get_json()
    
    # 1. Validation des données requises (incluant restaurant_id)
    if not all(k in data for k in ('nom', 'prix', 'restaurant_id')):
        return jsonify({"message": "Données de plat manquantes (nom, prix, restaurant_id sont requis)."}), 400
    
    restaurant_id = data['restaurant_id']
    

    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"message": f"Erreur d'autorisation : Le Restaurant ID {restaurant_id} n'existe pas."}), 401
    
    # 3. Création de l'objet Plat
    try:
        # Assurez-vous que le prix est un nombre valide
        prix_float = float(data['prix']) 
        
        new_plat = Plat(
            nom=data['nom'],
            prix=prix_float,
            restaurant_id=restaurant_id, # Utilisation de l'ID vérifié
            description=data.get('description'),
            photo_url=data.get('photo_url'),
            disponible=data.get('disponible', True)
        )
        
        db.session.add(new_plat)
        db.session.commit()
        
        return jsonify({"message": "Plat créé avec succès.", "plat": plat_to_dict(new_plat)}), 201
        
    except ValueError:
        db.session.rollback()
        return jsonify({"message": "Le prix doit être un nombre valide."}), 400
    except Exception as e:
        db.session.rollback()
        # Ici, l'IntegrityError est gérée par la vérification initiale, mais on la garde au cas où
        return jsonify({"message": f"Erreur serveur lors de la création du plat: {e}"}), 500
# GET: Lister tous les plats d'un restaurant
@admin_bp.route('/restaurants/<int:restaurant_id>/plats', methods=['GET'])
def get_plats(restaurant_id):
    plats = Plat.query.filter_by(restaurant_id=restaurant_id).all()
    
    if not plats:
        return jsonify({"message": "Aucun plat trouvé pour ce restaurant."}), 404
    
    return jsonify([plat_to_dict(p) for p in plats]), 200

# PUT: Modifier un plat existant
@admin_bp.route('/plats/<int:plat_id>', methods=['PUT'])
# @token_required
def update_plat(plat_id):
    plat = Plat.query.get_or_404(plat_id)
    data = request.get_json()
    
    # Mettre à jour les champs
    plat.nom = data.get('nom', plat.nom)
    plat.description = data.get('description', plat.description)
    plat.prix = data.get('prix', plat.prix)
    plat.photo_url = data.get('photo_url', plat.photo_url)
    plat.disponible = data.get('disponible', plat.disponible)

    db.session.commit()
    return jsonify({"message": "Plat mis à jour avec succès.", "plat": plat_to_dict(plat)}), 200

# DELETE: Supprimer un plat
@admin_bp.route('/plats/<int:plat_id>', methods=['DELETE'])
def delete_plat(plat_id):
    plat = Plat.query.get_or_404(plat_id)
    
    db.session.delete(plat)
    db.session.commit()
    return jsonify({"message": "Plat supprimé avec succès."}), 200


# PUT: Basculer la disponibilité d'un plat
@admin_bp.route('/plats/<int:plat_id>/disponibilite', methods=['PUT'])
def toggle_plat_disponibilite(plat_id):
    plat = Plat.query.get_or_404(plat_id)
    data = request.get_json()

    if 'disponible' not in data:
        return jsonify({"message": "Le champ 'disponible' est requis."}), 400
    
    # Basculer l'état
    plat.disponible = data['disponible']
    db.session.commit()
    
    statut = "disponible" if plat.disponible else "indisponible"
    return jsonify({"message": f"Plat {plat.nom} marqué comme {statut}.", "plat": plat_to_dict(plat)}), 200

# POST: Connexion par matricule (Validation simple)
@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    matricule = data.get('matricule')

    if not matricule:
        return jsonify({"message": "Le matricule est requis."}), 400

    # Rechercher le restaurant par matricule
    restaurant = Restaurant.query.filter_by(matricule=matricule).first()

    if not restaurant:
        # Erreur 401: Non autorisé
        return jsonify({"message": "Matricule invalide. Accès refusé."}), 401
    
    # Validation réussie : retourner l'ID du restaurant
    return jsonify({
        "message": "Accès Administrateur validé.",
        "restaurant_id": restaurant.id,
        "restaurant_nom": restaurant.nom
    }), 200



# api/admin.py (suite)
from models.commande import Commande

# Liste des statuts valides pour validation
STATUTS_VALIDE = ['NOUVELLE', 'EN_PREPARATION', 'PRETE', 'LIVREE']

# PUT: Mettre à jour le statut d'une commande
# Endpoint : PUT /api/v1/admin/commandes/{commande_id}/statut
@admin_bp.route('/commandes/<int:commande_id>/statut', methods=['PUT'])
def update_commande_statut(commande_id):
    data = request.get_json()
    restaurant_id = data.get('restaurant_id')
    nouveau_statut = data.get('statut')
    
    # 1. Validation de la requête
    if not all([restaurant_id, nouveau_statut]):
        return jsonify({"message": "ID restaurant et nouveau statut sont requis."}), 400
        
    if nouveau_statut.upper() not in STATUTS_VALIDE:
        return jsonify({"message": f"Statut invalide. Statuts acceptés : {', '.join(STATUTS_VALIDE)}"}), 400

    # 2. Récupérer la commande ET vérifier qu'elle appartient bien à ce restaurant
    commande = Commande.query.filter_by(id=commande_id, restaurant_id=restaurant_id).first()

    if not commande:
        # Retourner 404 si la commande n'existe pas OU si elle n'appartient pas à ce restaurant
        return jsonify({"message": "Commande introuvable ou accès non autorisé."}), 404 
        
    # 3. Mettre à jour et sauvegarder
    commande.statut = nouveau_statut.upper()
    db.session.commit()
    
    return jsonify({
        "message": f"Statut de la commande {commande_id} mis à jour : {commande.statut}",
        "code_commande": commande.code_commande
    }), 200



# GET: Générer les statistiques de base pour un restaurant
# Endpoint : GET /api/v1/admin/restaurants/{restaurant_id}/stats
@admin_bp.route('/restaurants/<int:restaurant_id>/stats', methods=['GET'])
def get_stats(restaurant_id):
    
    # 1. Vérification de l'existence du restaurant
    if not Restaurant.query.get(restaurant_id):
        return jsonify({"message": "Restaurant non trouvé."}), 404

    # A. Ventes totales (total des prix unitaires * quantité des commandes TERMINÉES/LIVRÉES)
    total_ventes_query = db.session.query(
        func.sum(DetailCommande.prix_unitaire * DetailCommande.quantite)
    ).join(Commande).filter(
        Commande.restaurant_id == restaurant_id,
        Commande.statut == 'LIVREE' # On ne compte que les ventes finalisées
    ).scalar() or 0.0

    # B. Plats les plus commandés (Top 5)
    top_plats_query = db.session.query(
        Plat.nom, 
        func.sum(DetailCommande.quantite).label('total_quantite')
    ).join(Plat).join(Commande).filter(
        Commande.restaurant_id == restaurant_id
    ).group_by(Plat.nom).order_by(func.sum(DetailCommande.quantite).desc()).limit(5).all()
    
    top_plats = [{'nom': nom, 'quantite': int(quantite)} for nom, quantite in top_plats_query]

    # C. Clients réguliers (Clients ayant passé plus de 3 commandes LIVRÉES)
    clients_reguliers_query = db.session.query(
        Client.nom, 
        func.count(Commande.id).label('nombre_commandes')
    ).join(Commande).filter(
        Commande.client_id == Client.id,
        Commande.restaurant_id == restaurant_id,
        Commande.statut == 'LIVREE'
    ).group_by(Client.nom).having(func.count(Commande.id) >= 3).all()
    
    clients_reguliers = [{'nom': nom, 'commandes': count} for nom, count in clients_reguliers_query]
    
    return jsonify({
        "message": "Statistiques générées avec succès.",
        "total_ventes": str(total_ventes_query),
        "top_plats": top_plats,
        "clients_reguliers_count": len(clients_reguliers),
        "clients_reguliers_details": clients_reguliers
    }), 200