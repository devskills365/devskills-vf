# api/admin.py
from flask import Blueprint, request, jsonify
from extensions import db 
from models.restaurant import Restaurant
from models.plat import Plat
from sqlalchemy import func, case
from models.client import Client
from models.detail_commande import DetailCommande
from models.plat import Plat
from models.commande import Commande
from models.detail_commande import DetailCommande
from models.plat import Plat
from models.client import Client
from sqlalchemy import func, extract, case
import os # Ajouter l'import si vous stockez localement
from werkzeug.utils import secure_filename # Ajouter l'import
# Ajoutez d'autres imports de modèles et services au besoin

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/v1/admin')



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


# api/admin.py (Remplacer la route existante)

# Endpoint : POST /api/v1/admin/plats
@admin_bp.route('/plats', methods=['POST'])
def create_plat():
    # Dans Flask, pour les uploads de fichiers, les données de formulaire sont dans request.form
    # et les fichiers dans request.files
    data = request.form
    image_file = request.files.get('image') # Nom du champ de fichier

    # 1. Validation des données requises
    if not all(k in data for k in ('nom', 'prix', 'restaurant_id')):
        return jsonify({"message": "Données de plat manquantes (nom, prix, restaurant_id sont requis)."}), 400
    
    restaurant_id = data['restaurant_id']
    prix_str = data['prix']

    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"message": f"Erreur d'autorisation : Le Restaurant ID {restaurant_id} n'existe pas."}), 401
    # Gestion de l'upload d'image
    photo_url = data.get('photo_url') 
    if image_file:
        filename = secure_filename(image_file.filename)
        # Pour l'exemple, nous construisons une URL simulée
        photo_url = f"/uploads/plats/{filename}" 
    # 3. Création de l'objet Plat
    try:
        prix_float = float(prix_str)
        disponible_str = data.get('disponible', 'true').lower()
        disponible_bool = disponible_str in ('true', '1', 'oui')
        
        new_plat = Plat(
            nom=data['nom'],
            prix=prix_float,
            restaurant_id=restaurant_id,
            description=data.get('description'),
            photo_url=photo_url,
            disponible=disponible_bool
        )
        
        db.session.add(new_plat)
        db.session.commit()
        
        return jsonify({"message": "Plat créé avec succès.", "plat": plat_to_dict(new_plat)}), 201
    except ValueError:
        db.session.rollback()
        return jsonify({"message": "Le prix doit être un nombre valide."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erreur serveur lors de la création du plat: {e}"}), 500






@admin_bp.route('/restaurants/<int:restaurant_id>/plats', methods=['GET'])
def get_plats(restaurant_id):
    
    print('restaurant ID',restaurant_id)
    plats = Plat.query.filter_by(restaurant_id=restaurant_id).all()
    if not plats:
        return jsonify({"message": "Aucun plat trouvé pour ce restaurant."}), 404
    return jsonify([plat_to_dict(p) for p in plats]), 200



@admin_bp.route('/plats/<int:plat_id>', methods=['PUT'])
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


# Dans api/admin.py, après plat_to_dict et avant les routes

def detail_commande_to_dict(detail):
    """Sérialise un objet DetailCommande, accédant au nom du plat via la relation 'plat'."""
    # NOTE: Ceci suppose qu'une relation 'plat' est définie dans le modèle DetailCommande,
    # ou que le Plat est joint et disponible via l'objet detail.
    return {
        # Assurez-vous que l'accès à `detail.plat.nom` est possible.
        # Sinon, vous devrez joindre Plat explicitement dans la requête.
        "plat_nom": detail.plat.nom, 
        "quantite": detail.quantite,
        # Conversion en chaîne de caractères pour éviter les problèmes de sérialisation JSON
        "prix_unitaire": str(detail.prix_unitaire) 
    }

def commande_to_dict(commande):
    """Sérialise un objet Commande, incluant les détails et le client."""
    
    # Client est supposé être joint ou accessible via relation si nécessaire,
    # mais une requête get() est plus fiable si la relation n'est pas chargée.
    client = Client.query.get(commande.client_id)
    
    # Calculer le total à partir des détails de la commande
    # Numeric doit être converti en float ou Decimal pour les calculs Python
    total_estime = sum(d.quantite * float(d.prix_unitaire) for d in commande.details)
    
    return {
        "id": commande.id,
        "code_commande": commande.code_commande,
        "statut": commande.statut,
        "mode_recuperation": commande.mode_recuperation,
        # Utiliser `isoformat()` pour que la date soit lisible en JavaScript
        "date_commande": commande.date_commande.isoformat(), 
        "client_nom": client.nom if client else "Client Inconnu",
        "client_telephone": client.telephone if client else "N/A",
        "total_estime": f"{total_estime:.2f}", # Formater à deux décimales
        "articles": [detail_commande_to_dict(d) for d in commande.details]
    }



@admin_bp.route('/restaurants/<int:restaurant_id>/commandes', methods=['GET'])
def get_commandes_restaurant(restaurant_id):
    
    print('FLASK: Route COMMANDES ATTEINTE. ID:', restaurant_id)
    
    # Nouvelle requête optimisée pour l'eager loading avec .selectinload()
    # Ceci nécessite que les relations soient définies dans les modèles (Commande.details, DetailCommande.plat, Commande.client)
    commandes_en_cours = db.session.query(Commande).options(
        db.selectinload(Commande.details).selectinload(DetailCommande.plat),
        db.selectinload(Commande.client)
    ).filter(
        Commande.restaurant_id == restaurant_id,
        Commande.statut.in_(['NOUVELLE', 'EN_PREPARATION', 'PRETE']) 
    ).order_by(Commande.date_commande.asc()).all()

    if not commandes_en_cours:
        return jsonify({"message": "Aucune commande en cours trouvée pour ce restaurant."}), 404
    
    # Sérialisation : l'erreur devrait être résolue si la relation 'plat' existe maintenant
    return jsonify([commande_to_dict(c) for c in commandes_en_cours]), 200





@admin_bp.route('/restaurants/<int:restaurant_id>/stats/<int:annee>/<int:mois>', methods=['GET'])
def get_monthly_stats(restaurant_id, annee, mois):
    
    try:
        # Filtrer sur le mois, l'année et le restaurant ID pour toutes les requêtes
        filtre_base = [
            Commande.restaurant_id == restaurant_id,
            extract('year', Commande.date_commande) == annee,
            extract('month', Commande.date_commande) == mois
        ]

        # A. Chiffre d'affaires par jour (pour le graphe)
        # On regroupe par jour (date seule) pour les commandes LIVRÉES
        ventes_par_jour_query = db.session.query(
            func.date(Commande.date_commande).label('jour'),
            func.sum(DetailCommande.prix_unitaire * DetailCommande.quantite).label('montant_total')
        ).join(DetailCommande, Commande.id == DetailCommande.commande_id).filter(
            *filtre_base, # Utilise le filtre du mois/année/restaurant
            Commande.statut == 'LIVREE'
        ).group_by(func.date(Commande.date_commande)).order_by(func.date(Commande.date_commande)).all()

        ventes_par_jour = [
            {'jour': str(jour), 'montant': float(montant)} 
            for jour, montant in ventes_par_jour_query
        ]

        # B. Nombre de commandes (Total, Validées/Livré, Annulées)
        compteurs_query = db.session.query(
            func.count(Commande.id).label('total'),
            func.sum(case((Commande.statut == 'LIVREE', 1), else_=0)).label('validees'),
            func.sum(case((Commande.statut == 'ANNULEE', 1), else_=0)).label('annulees')
        ).filter(*filtre_base).one()
        
        compteurs = {
            'total_commandes': int(compteurs_query.total),
            'commandes_validees': int(compteurs_query.validees),
            'commandes_annulees': int(compteurs_query.annulees),
        }
        
        # C. Plats les plus consommés (Top 5 des commandes LIVRÉES)
        top_plats_query = db.session.query(
            Plat.nom,
            func.sum(DetailCommande.quantite).label('total_quantite')
        ).join(DetailCommande, Plat.id == DetailCommande.plat_id).join(Commande, DetailCommande.commande_id == Commande.id).filter(
            *filtre_base,
            Commande.statut == 'LIVREE'
        ).group_by(Plat.nom).order_by(func.sum(DetailCommande.quantite).desc()).limit(5).all()

        top_plats = [{'nom': nom, 'quantite': int(quantite)} for nom, quantite in top_plats_query]


        return jsonify({
            "message": f"Statistiques pour {mois}/{annee} générées avec succès.",
            "ventes_par_jour": ventes_par_jour,
            "compteurs": compteurs,
            "top_plats": top_plats,
        }), 200

    except Exception as e:
        print(f"Erreur lors de la récupération des stats mensuelles: {e}")
        return jsonify({"message": f"Erreur serveur interne lors du calcul des statistiques : {e}"}), 500