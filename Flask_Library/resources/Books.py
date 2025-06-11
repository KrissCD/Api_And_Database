from flask.views import MethodView
from flask_smorest import Blueprint, abort
import uuid
from schemas import BookInputSchema, BookOutputSchema
from dp import books, libraries

blp = Blueprint("books", __name__, description="Operations on books")

@blp.route("/books")
class BookList(MethodView):
    @blp.response(200, BookOutputSchema(many=True))
    def get(self):
        return books

    @blp.arguments(BookInputSchema)
    @blp.response(201, BookOutputSchema)
    def post(self, book_data):
        if not any(lib["id"] == book_data["library_id"] for lib in libraries):
            abort(404, message="Biblioteka nije pronađena.")

        new_book = {
            "id": str(uuid.uuid4()),
            "title": book_data["title"],
            "author": book_data["author"],
            "published_year": book_data["published_year"],
            "library_id": book_data["library_id"]
        }
        books.append(new_book)
        return new_book

@blp.route("/books/<string:book_id>")
class Book(MethodView):
    @blp.response(200, BookOutputSchema)
    def get(self, book_id):
        book = next((b for b in books if b["id"] == book_id), None)
        if not book:
            abort(404, message="Knjiga nije pronađena.")
        return book

    def delete(self, book_id):
        global books
        book = next((b for b in books if b["id"] == book_id), None)
        if not book:
            abort(404, message="Knjiga nije pronađena.")
        books = [b for b in books if b["id"] != book_id]
        return {"message": "Knjiga obrisana."}

    @blp.arguments(BookInputSchema)
    @blp.response(200, BookOutputSchema)
    def put(self, book_data, book_id):
        book = next((b for b in books if b["id"] == book_id), None)
        if not book:
            abort(404, message="Knjiga nije pronađena.")

        book.update({
            "title": book_data["title"],
            "author": book_data["author"],
            "published_year": book_data["published_year"],
            "library_id": book_data["library_id"]
        })
        return book
