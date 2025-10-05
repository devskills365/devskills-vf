# app.py (Version Corrigée)
from flask import Flask

from extensions import db 
from flask_cors import CORS
from flask.cli import with_appcontext
import click
from config import Config

from api.admin import admin_bp 
from api.client import client_bp 


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

   
    app.register_blueprint(admin_bp) 
    app.register_blueprint(client_bp)


    @app.cli.command("initdb")
    @with_appcontext
    def initdb_command():
        """Create all database tables."""
        db.create_all()
        click.echo("Base de données initialisée (tables créées)!")

    return app 


if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',  # Écoute sur toutes les interfaces disponibles (y compris le Wi-Fi)
        port=5000,       # Conserver le port par défaut ou celui que vous utilisez
        debug=True
    )