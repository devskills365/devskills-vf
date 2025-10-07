# models/client.py
from extensions import db 

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    # Le numéro de téléphone comme identifiant unique
    telephone = db.Column(db.String(200),  nullable=False)
    
    # Relation : Un client peut avoir plusieurs commandes
    commandes = db.relationship('Commande', backref='client', lazy=True)

    def __repr__(self):
        return f'<Client {self.nom} (Tel: {self.telephone})>'