# models/commande.py
from extensions import db 
from datetime import datetime
import uuid 

class Commande(db.Model):
    __tablename__ = 'commandes'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Code unique pour le suivi client (public)
    # Utilisation d'un UUID pour une forte unicité
    code_commande = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Clés Étrangères
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=True) 
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    
    date_commande = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Statut de la commande (géré par l'administrateur)
    statut = db.Column(db.String(50), default='NOUVELLE') # Ex: NOUVELLE, EN_PREPARATION, PRETE, LIVREE
    mode_recuperation = db.Column(db.String(50), nullable=False) # Ex: SUR PLACE, LIVRAISON
    
    # Relation : Une commande a plusieurs lignes de détails (plats)
    details = db.relationship('DetailCommande', backref='commande', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Commande {self.code_commande} - Statut: {self.statut}>'