# app.py (Version Corrigée)
from flask import Flask, send_from_directory
import os
from extensions import db 
from flask_cors import CORS
from flask.cli import with_appcontext
import click
from config import Config

from api.admin import admin_bp 
from api.client import client_bp 

# Import des modèles (conservé pour la clarté)
from models.restaurant import Restaurant 
from models.plat import Plat
from models.client import Client
from models.commande import Commande
from models.detail_commande import DetailCommande


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialisation de l'objet db AVEC l'application
    db.init_app(app) 
    CORS(app)

    # Enregistrement des Blueprints
    app.register_blueprint(admin_bp) 
    app.register_blueprint(client_bp)
    
    # --- ✅ Définition des routes et commandes DANS create_app ✅ ---
    
    # 1. Commande CLI pour la base de données
    @app.cli.command("initdb")
    @with_appcontext
    def initdb_command():
        """Create all database tables."""
        db.create_all()
        click.echo("Base de données initialisée (tables créées)!")

    # 2. Route pour servir les fichiers téléchargés
    
    # Dossier où les images seront stockées. Déplacé à l'intérieur de create_app.
    # On utilise app.root_path pour une meilleure compatibilité.
    UPLOAD_PATH = os.path.join(app.root_path, 'uploads', 'plats')
    
    # La route doit être définie avec l'objet 'app' créé dans cette fonction.
    @app.route('/static/uploads/plats/<filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(UPLOAD_PATH, filename)

    # -----------------------------------------------------------------

    return app # L'application est retournée EN DERNIER

if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )