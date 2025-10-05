# models/plat.py
from extensions import db 
class Plat(db.Model):
    __tablename__ = 'plats'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    nom = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    prix = db.Column(db.Numeric(precision=10, scale=2), nullable=False)
    disponible = db.Column(db.Boolean, default=True) # Pour la gestion de la disponibilité
    photo_url = db.Column(db.String(255))

    def __repr__(self):
        return f'<Plat {self.nom} (ID: {self.id})>'

