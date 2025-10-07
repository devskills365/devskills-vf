# api/client.py
from flask import Blueprint, request, jsonify,session
from extensions import db 
from models.restaurant import Restaurant
from models.plat import Plat
import logging
from decimal import Decimal
from models.client import Client
from models.commande import Commande
from models.detail_commande import DetailCommande
from sqlalchemy.exc import IntegrityError
logging.basicConfig(level=logging.ERROR)
client_bp = Blueprint('client_bp', __name__, url_prefix='/api/v1/client')

# Fonction utilitaire de sérialisation pour le public (utile pour l'étape 14)
def plat_to_dict_public(plat):
    return {
        "id": plat.id,
        "nom": plat.nom,
        "description": plat.description,
        "prix": str(plat.prix),
        "photo_url": plat.photo_url
    }

# GET: Route de test simple
@client_bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Bienvenue sur l'API Client."}), 200

# api/client.py (suite)

# GET: Lister les plats disponibles d'un restaurant spécifique
# Endpoint : GET /api/v1/client/restaurants/{restaurant_id}/menu
@client_bp.route('/restaurants/<int:restaurant_id>/menu', methods=['GET'])
def get_menu_public(restaurant_id):
    print('id restaurant',restaurant_id)
    # 1. Vérifier l'existence du restaurant
    if not Restaurant.query.get(restaurant_id):
        return jsonify({"message": "Restaurant non trouvé."}), 404
    
     # ✅ 2. Enregistrer restaurant_id dans la session
    session['restaurant_id'] = restaurant_id
    
    # 2. Filtrer par restaurant ET par disponibilité (disponible=True)
    plats = Plat.query.filter_by(restaurant_id=restaurant_id, disponible=True).all()
    
    if not plats:
        return jsonify({"message": "Le menu est temporairement indisponible ou vide."}), 404
    
    return jsonify({
        "restaurant_id": restaurant_id,
        "plats": [plat_to_dict_public(p) for p in plats]
    }), 200


# api/client.py (suite)

# POST: Passer commande

@client_bp.route('/commander', methods=['POST'])
@client_bp.route('/commander', methods=['POST'])
def create_commande():
    data = request.get_json()
    
    # 1. Validation des données de base
    required_keys = ['restaurant_id', 'client_nom', 'client_telephone', 'mode_recuperation', 'panier']
    if not all(k in data for k in required_keys):
        return jsonify({"message": "Données de commande manquantes. Vérifiez ID restaurant, client, mode de récupération, et panier."}), 400

    restaurant_id = data['restaurant_id']
    panier = data['panier']
    
    if not panier:
        return jsonify({"message": "Le panier est vide."}), 400

    try:
        # A. Créer un nouveau client (pas de recherche)
        client = Client(nom=data['client_nom'], telephone=data['client_telephone'])
        db.session.add(client)
        db.session.flush()  # Récupère l'ID généré pour la FK
        logging.info(f"Nouveau client créé: ID={client.id}, Nom={client.nom}, Téléphone={client.telephone}")
        
        # B. Vérifier l'existence du restaurant
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            raise ValueError(f"Le restaurant ID {restaurant_id} n'existe pas.")
        
        # C. Créer la commande principale
        nouvelle_commande = Commande(
            client_id=client.id,
            restaurant_id=restaurant_id,
            mode_recuperation=data['mode_recuperation'].upper(),
            statut='NOUVELLE'
        )
        db.session.add(nouvelle_commande)
        db.session.flush()
        logging.info(f"Nouvelle commande créée: ID={nouvelle_commande.id}, Code={nouvelle_commande.code_commande}")

        total_commande = Decimal('0')  # Utilisation de Decimal pour la précision financière

       
        for item in panier:
            plat_id = item.get('plat_id')
            quantite = item.get('quantite', 1)

            # Vérifier l'existence et la disponibilité du plat pour ce restaurant
            plat = Plat.query.filter_by(id=plat_id, restaurant_id=restaurant_id, disponible=True).first()
            
            if not plat:
                raise ValueError(f"Le plat ID {plat_id} est invalide ou indisponible pour le restaurant ID {restaurant_id}.")
            
            if quantite <= 0:
                raise ValueError(f"La quantité pour le plat ID {plat_id} doit être positive.")

            prix_au_moment_commande = plat.prix
            
            detail = DetailCommande(
                commande_id=nouvelle_commande.id,
                plat_id=plat.id,
                quantite=quantite,
                prix_unitaire=prix_au_moment_commande
            )
            db.session.add(detail)
            total_commande += prix_au_moment_commande * quantite
            logging.info(f"Détail ajouté: Plat ID={plat_id}, Quantité={quantite}, Prix unitaire={prix_au_moment_commande}")

        # E. Validation finale et Commit
        db.session.commit()
        logging.info(f"Commande {nouvelle_commande.code_commande} validée avec succès. Total: {total_commande}")
        
        return jsonify({
            "message": "Commande passée avec succès. Veuillez conserver votre code de suivi.", 
            "code_commande": nouvelle_commande.code_commande,
            "total_estime": str(total_commande),
            "statut": "NOUVELLE"
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        logging.error(f"Erreur de validation: {str(e)}")
        return jsonify({"message": f"Erreur de validation: {str(e)}"}), 400
    except IntegrityError as e:
        db.session.rollback()
        logging.error(f"Erreur d'intégrité: {str(e)}")
        return jsonify({"message": f"Erreur d'intégrité: Le numéro de téléphone ou un autre champ peut être en conflit. Vérifiez les données."}), 400
    except Exception as e:
        db.session.rollback()
        logging.error(f"Erreur inattendue: {str(e)}")
        return jsonify({"message": "Une erreur interne est survenue lors de la commande."}), 500
# Fonction utilitaire pour sérialiser une commande pour le suivi client
def commande_suivi_to_dict(commande):
    # Calculer le total de la commande pour le suivi (nécessite de parcourir les détails)
    total = sum(d.prix_unitaire * d.quantite for d in commande.details)

    return {
        "code_commande": commande.code_commande,
        "statut": commande.statut,
        "restaurant_nom": commande.restaurant.nom,
        "mode_recuperation": commande.mode_recuperation,
        "date_commande": commande.date_commande.isoformat(),
        "total_commande": str(total)
    }

# GET: Suivi de commande par code unique
# Endpoint : GET /api/v1/client/suivre-commande/{code_commande}
@client_bp.route('/suivre-commande/<string:code_commande>', methods=['GET'])
def suivre_commande(code_commande):
    
    # Charger la commande avec ses relations (restaurant et détails) pour tout afficher
    commande = Commande.query.filter_by(code_commande=code_commande).first()
    
    if not commande:
        return jsonify({"message": "Code de commande invalide ou commande introuvable."}), 404
    
    return jsonify(commande_suivi_to_dict(commande)), 200