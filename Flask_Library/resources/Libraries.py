from flask.views import MethodView
from flask_smorest import Blueprint, abort
import uuid
from schemas import (
    LibraryInputSchema, LibraryOutputSchema,
    BookInputSchema, BookOutputSchema
)
from dp import libraries, books  

blp = Blueprint("libraries", __name__, description="Operations on libraries")

@blp.route("/libraries")
class LibraryList(MethodView):
    @blp.response(200, LibraryOutputSchema(many=True))
    def get(self):
        return libraries

    @blp.arguments(LibraryInputSchema)
    @blp.response(201, LibraryOutputSchema)
    def post(self, library_data):
        new_library = {
            "id": str(uuid.uuid4()),
            "name": library_data["name"]
        }
        libraries.append(new_library)
        return new_library

@blp.route("/libraries/<string:library_id>")
class Library(MethodView):
    @blp.response(200, LibraryOutputSchema)
    def get(self, library_id):
        library = next((lib for lib in libraries if lib["id"] == library_id), None)
        if not library:
            abort(404, message="Biblioteka nije pronađena.")
        return library

    def delete(self, library_id):
        global libraries
        library = next((lib for lib in libraries if lib["id"] == library_id), None)
        if not library:
            abort(404, message="Biblioteka nije pronađena.")
        libraries = [lib for lib in libraries if lib["id"] != library_id]
        return {"message": "Biblioteka obrisana."}

    @blp.arguments(LibraryInputSchema)
    @blp.response(200, LibraryOutputSchema)
    def put(self, library_data, library_id):
        library = next((lib for lib in libraries if lib["id"] == library_id), None)
        if not library:
            abort(404, message="Biblioteka nije pronađena.")
        library["name"] = library_data["name"]
        return library

@blp.route("/libraries/<string:library_id>/books")
class LibraryBooks(MethodView):
    @blp.response(200, BookOutputSchema(many=True))
    def get(self, library_id):
        if not any(lib["id"] == library_id for lib in libraries):
            abort(404, message="Biblioteka nije pronađena.")
        return [book for book in books if book["library_id"] == library_id]

    @blp.arguments(BookInputSchema)
    @blp.response(201, BookOutputSchema)
    def post(self, book_data, library_id):
        if not any(lib["id"] == library_id for lib in libraries):
            abort(404, message="Biblioteka nije pronađena.")

        new_book = {
            "id": str(uuid.uuid4()),
            "title": book_data["title"],
            "author": book_data["author"],
            "published_year": book_data["published_year"],
            "library_id": library_id
        }
        books.append(new_book)
        return new_book
