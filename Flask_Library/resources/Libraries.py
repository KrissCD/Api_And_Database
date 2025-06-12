from flask.views import MethodView
from flask_smorest import Blueprint, abort
from sqlalchemy.exc import SQLAlchemyError
from dp import dp  # sada dp je SQLAlchemy instanca
from schemas import LibraryInputSchema, LibraryOutputSchema
from models import LibraryModel

blp = Blueprint("libraries", __name__, description="Operations on libraries")

@blp.route("/libraries")
class LibraryList(MethodView):
    @blp.response(200, LibraryOutputSchema(many=True))
    def get(self):
        return LibraryModel.query.all()

    @blp.arguments(LibraryInputSchema)
    @blp.response(201, LibraryOutputSchema)
    def post(self, library_data):
        library = LibraryModel(**library_data)
        try:
            dp.session.add(library)
            dp.session.commit()
        except SQLAlchemyError:
            abort(500, message="Greška prilikom dodavanja biblioteke.")
        return library

@blp.route("/libraries/<int:library_id>")
class Library(MethodView):
    @blp.response(200, LibraryOutputSchema)
    def get(self, library_id):
        return LibraryModel.query.get_or_404(library_id)

    def delete(self, library_id):
        library = LibraryModel.query.get_or_404(library_id)
        try:
            dp.session.delete(library)
            dp.session.commit()
        except SQLAlchemyError:
            abort(500, message="Greška prilikom brisanja biblioteke.")
        return {"message": "Biblioteka obrisana."}
