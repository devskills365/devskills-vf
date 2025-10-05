


# models/restaurant.py (Structure du modèle)
from extensions import db 
from services.restaurant_service import generer_matricule
from sqlalchemy.orm import validates
from datetime import date # Importez date si vous n'avez besoin que de la date, ou datetime si vous voulez l'heure aussi

class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    adresse = db.Column(db.String(255))
    email_gerant = db.Column(db.String(120), unique=True, nullable=False)
    date_creation = db.Column(db.Date, default=date.today) # Sauvegarder uniquement la date
    date_naissance_gerant = db.Column(db.Date, nullable=False)
    matricule = db.Column(db.String(30), unique=True, nullable=True) # Sera rempli automatiquement

    # Relation : Un restaurant a plusieurs plats (backref pour l'accès inverse)
    plats = db.relationship('Plat', backref='restaurant', lazy=True)
    commandes = db.relationship('Commande', backref='restaurant', lazy=True)
    
    # Logic: Génération automatique du matricule AVANT l'insertion dans la BDD
    def __init__(self, nom, adresse, email_gerant, date_naissance_gerant):
        self.nom = nom
        self.adresse = adresse
        self.email_gerant = email_gerant
        self.date_naissance_gerant = date_naissance_gerant
        # Générer le matricule dès l'initialisation
        self.matricule = generer_matricule(self.date_creation, self.date_naissance_gerant)

    def __repr__(self):
        return f'<Restaurant {self.nom}>'