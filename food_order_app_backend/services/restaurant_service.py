# services/restaurant_service.py (CORRECTION)

from datetime import datetime, date
from uuid import uuid4

# La fonction doit maintenant accepter DEUX arguments : date_creation et date_naissance.
def generer_matricule(date_creation, date_naissance_gerant):
    """
    Génère un matricule unique basé sur la date de création du restaurant 
    et la date de naissance du gérant.
    """
    # Note : Le formatage .strftime doit se faire sur un objet date ou datetime.
    
    # Assurez-vous que les objets sont bien des dates (comme défini dans models/restaurant.py)
    if not isinstance(date_creation, (datetime, date)) or \
       not isinstance(date_naissance_gerant, (datetime, date)):
        # Gestion d'erreur minimale si les dates sont incorrectes
        return f"ERR-{str(uuid4())[:8]}"

    # Les dates sont des objets 'date', pas besoin de gérer l'heure
    
    # Format: JOUR-MOIS-ANNEE_CREATION - JOURMOISANNEE_NAISSANCE
    partie_creation = date_creation.strftime("%d-%m-%Y")
    partie_naissance = date_naissance_gerant.strftime("%d%m%Y")
    
    # Remarque : Puisque l'ID du restaurant n'est pas disponible à ce stade (dans __init__),
    # nous utilisons uniquement les dates comme vous le faites dans l'appel.
    return f"{partie_creation}-{partie_naissance}"