# models/detail_commande.py
from extensions import db 
from sqlalchemy import Numeric

class DetailCommande(db.Model):
    __tablename__ = 'details_commandes'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Clés Étrangères
    commande_id = db.Column(db.Integer, db.ForeignKey('commandes.id'), nullable=False)
    plat_id = db.Column(db.Integer, db.ForeignKey('plats.id'), nullable=False)
    
    quantite = db.Column(db.Integer, default=1)
    # Prix du plat au moment de la commande (important pour l'historique)
    prix_unitaire = db.Column(Numeric(precision=10, scale=2), nullable=False) 

    # Contrainte pour éviter qu'un même plat soit listé deux fois dans les détails de la même commande
    __table_args__ = (db.UniqueConstraint('commande_id', 'plat_id', name='_commande_plat_uc'),)

    def __repr__(self):
        return f'<DetailCommande Commande ID: {self.commande_id} - Plat ID: {self.plat_id}>'