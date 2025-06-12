from flask.views import MethodView
from flask_smorest import Blueprint, abort
from sqlalchemy.exc import SQLAlchemyError
from dp import dp
from schemas import BookInputSchema, BookOutputSchema
from models import BookModel, LibraryModel

blp = Blueprint("books", __name__, description="Operations on books")

@blp.route("/books")
class BookList(MethodView):
    @blp.response(200, BookOutputSchema(many=True))
    def get(self):
        return BookModel.query.all()

    @blp.arguments(BookInputSchema)
    @blp.response(201, BookOutputSchema)
    def post(self, book_data):
        # Provjera postoji li biblioteka
        if not LibraryModel.query.get(book_data["library_id"]):
            abort(404, message="Biblioteka nije pronađena.")

        book = BookModel(**book_data)
        try:
            dp.session.add(book)
            dp.session.commit()
        except SQLAlchemyError:
            abort(500, message="Dogodila se greška prilikom dodavanja knjige.")
        return book

@blp.route("/books/<int:book_id>")
class Book(MethodView):
    @blp.response(200, BookOutputSchema)
    def get(self, book_id):
        return BookModel.query.get_or_404(book_id)

    @blp.arguments(BookInputSchema)
    @blp.response(200, BookOutputSchema)
    def put(self, book_data, book_id):
        book = BookModel.query.get_or_404(book_id)
        if not LibraryModel.query.get(book_data["library_id"]):
            abort(404, message="Biblioteka nije pronađena.")

        book.title = book_data["title"]
        book.author = book_data["author"]
        book.published_year = book_data["published_year"]
        book.library_id = book_data["library_id"]

        try:
            dp.session.commit()
        except SQLAlchemyError:
            abort(500, message="Dogodila se greška prilikom ažuriranja knjige.")
        return book

    def delete(self, book_id):
        book = BookModel.query.get_or_404(book_id)
        try:
            dp.session.delete(book)
            dp.session.commit()
        except SQLAlchemyError:
            abort(500, message="Greška prilikom brisanja knjige.")
        return {"message": "Knjiga obrisana."}
