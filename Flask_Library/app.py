import os
from flask import Flask
from flask_smorest import Api
from dp import dp  

from resources.Books import blp as BookBlueprint
from resources.Libraries import blp as LibraryBlueprint

import models  

def create_app(db_url=None):
    app = Flask(__name__)

    app.config["PROPAGATE_EXCEPTIONS"] = True
    app.config["API_TITLE"] = "CTK-shop REST API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.3"
    app.config["OPENAPI_URL_PREFIX"] = "/"
    app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
    app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

    app.config["SQLALCHEMY_DATABASE_URI"] = db_url or os.getenv("DATABASE_URL", "sqlite:///data.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = True

    dp.init_app(app)
    api = Api(app)

    with app.app_context():
        dp.create_all()  

    api.register_blueprint(BookBlueprint)
    api.register_blueprint(LibraryBlueprint)

    return app
