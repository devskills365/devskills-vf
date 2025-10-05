# models/detail_commande.py (Version corrigée)

from extensions import db 
from sqlalchemy import Numeric

class DetailCommande(db.Model):
    __tablename__ = 'details_commandes'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Clés Étrangères
    commande_id = db.Column(db.Integer, db.ForeignKey('commandes.id'), nullable=False)
    plat_id = db.Column(db.Integer, db.ForeignKey('plats.id'), nullable=False)
    
    quantite = db.Column(db.Integer, default=1)
    prix_unitaire = db.Column(Numeric(precision=10, scale=2), nullable=False) 

    # ➡️ AJOUTEZ CETTE LIGNE : DÉFINITION DE LA RELATION VERS LE MODÈLE PLAT
    # Ceci crée l'attribut 'plat' sur chaque objet DetailCommande
    plat = db.relationship('Plat', backref='detail_commandes')
    # Assurez-vous d'avoir 'Plat' importé dans le fichier où la Base est déclarée si nécessaire,
    # mais 'Plat' comme chaîne de caractères devrait fonctionner si Plat est importé ailleurs.

    __table_args__ = (db.UniqueConstraint('commande_id', 'plat_id', name='_commande_plat_uc'),)

    def __repr__(self):
        return f'<DetailCommande Commande ID: {self.commande_id} - Plat ID: {self.plat_id}>'