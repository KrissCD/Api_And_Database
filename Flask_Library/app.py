from flask import Flask, request, jsonify
from flask_smorest import abort
import uuid
from dp import libraries, books


app = Flask(__name__)

#Get libraries 
@app.route('/libraries', methods=['GET'])
def get_libraries():
    return jsonify(libraries), 200

#Get books
@app.route('/books', methods=['GET'])
def get_books():
    return jsonify(books), 200

#Get books by ID
@app.route('/books/<string:book_id>', methods=['GET'])
def get_book_by_id(book_id):
    book = next((book for book in books if book["id"] == book_id), None)
    if not book:
        abort(404, message="Knjiga nije pronađena.")
    return jsonify(book), 200

# Create a new library
@app.route('/libraries', methods=['POST'])
def create_library():
    data = request.get_json()
    name = data.get('name')

    if not name:
        abort(400, message="Ime biblioteke je obavezno.")

    new_library = {
        "id": str(uuid.uuid4()),
        "name": name
    }
    libraries.append(new_library)
    return jsonify(new_library), 201


# Get all books in a library
@app.route('/libraries/<string:library_id>/books', methods=['GET'])
def get_books_for_library(library_id):
    # Find the library
    if not any(lib["id"] == library_id for lib in libraries):
        abort(404, message="Biblioteka nije pronađena.")

    library_books = [book for book in books if book["library_id"] == library_id]
    return jsonify(library_books), 200


# Add a book to a library
@app.route('/libraries/<string:library_id>/books', methods=['POST'])
def add_book_to_library(library_id):
    data = request.get_json()
    title = data.get("title")
    author = data.get("author")

    if not title or not author:
        abort(400, message="Naslov i autor knjige su obavezni.")

    # Check if library exists
    if not any(lib["id"] == library_id for lib in libraries):
        abort(404, message="Biblioteka nije pronađena.")

    new_book = {
        "id": str(uuid.uuid4()),
        "title": title,
        "author": author,
        "library_id": library_id
    }
    books.append(new_book)
    return jsonify(new_book), 201

# Search for a book by title across all libraries
@app.route('/books/by-title/<string:title>', methods=['GET'])
def search_book_by_title(title):
    results = []
    for book in books:
        if book["title"].lower() == title.lower():
            library_name = next((lib["name"] for lib in libraries if lib["id"] == book["library_id"]), "Nepoznata biblioteka")
            results.append({
                "library": library_name,
                "title": book["title"],
                "author": book["author"]
            })

    if not results:
        abort(404, message="Knjiga nije pronađena.")

    return jsonify(results), 200

