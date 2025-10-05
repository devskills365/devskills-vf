# seed.py (CORRIGÉ FINAL)

from app import create_app, db
from models.restaurant import Restaurant 
from models.plat import Plat
from models.client import Client
from models.commande import Commande
from models.detail_commande import DetailCommande
# PLUS BESOIN D'IMPORTER generer_matricule ici
from datetime import datetime
import os
import click

app = create_app()

def seed_data():
    """Insère des données de test dans la base de données."""
    with app.app_context():
        click.echo("--- Démarrage de l'injection des données de test ---")
        
        try:
            date_naissance = datetime(1985, 1, 1).date()
            
            r1 = Restaurant(
                nom="Le Déjeuner Agile", 
                adresse="123 Rue de la Test", 
                email_gerant="admin@dejeuner.com", 
                date_naissance_gerant=date_naissance
            )
            db.session.add(r1)
            db.session.flush() # CRUCIAL : L'objet r1 est créé, son ID est généré.
            # --- 2. Création des plats ---
            plat1 = Plat(restaurant_id=r1.id, nom="Burger Standard", prix=12.50, description="Le classique.", disponible=True)
            plat2 = Plat(restaurant_id=r1.id, nom="Wrap Végétarien", prix=9.90, description="Option saine.", disponible=True)
            plat3 = Plat(restaurant_id=r1.id, nom="Soupe du Jour", prix=5.00, description="Change tous les jours.", disponible=False)
            
            db.session.add_all([plat1, plat2, plat3])
            db.session.flush()

            # --- 3 & 4. Création client et commande ---
            client = Client(nom="Test Client", telephone="0611223344")
            db.session.add(client)
            db.session.flush()
            
            cmd1 = Commande(client_id=client.id, restaurant_id=r1.id, statut='NOUVELLE', mode_recuperation='LIVRAISON')
            db.session.add(cmd1)
            db.session.flush()
            
            detail1 = DetailCommande(commande_id=cmd1.id, plat_id=plat1.id, quantite=2, prix_unitaire=plat1.prix)
            detail2 = DetailCommande(commande_id=cmd1.id, plat_id=plat2.id, quantite=1, prix_unitaire=plat2.prix)
            
            db.session.add_all([detail1, detail2])
            
            db.session.commit()
            
            click.echo("\n----------------------------------------------------")
            click.echo(f"✅ Données de test insérées avec succès pour : {r1.nom}")
            click.echo(f"🔑 Restaurant ID : {r1.id}")
            click.echo(f"🔑 Matricule Admin: {r1.matricule}") # Doit être disponible après l'appel à __init__
            click.echo(f"🛒 Code Commande : {cmd1.code_commande}")
            click.echo("----------------------------------------------------\n")

        except Exception as e:
            db.session.rollback()
            click.echo(f"❌ Erreur lors de l'insertion des données : {e}")
            raise e

if __name__ == '__main__':
    os.environ['FLASK_ENV'] = 'development'
    seed_data()