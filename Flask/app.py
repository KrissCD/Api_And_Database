from flask import Flask, request, jsonify

app = Flask(__name__)

# Use a list to store multiple libraries
libraries = [
    {
        "name": "Central Library",
        "books": [
            {
                "title": "To Kill a Mockingbird",
                "author": "Harper Lee"
            },
            {
                "title": "1984",
                "author": "George Orwell"
            }
        ]
    }
]

# Get all libraries
@app.route('/library', methods=['GET'])
def get_libraries():
    return jsonify(libraries)

# Create a new library
@app.route('/library', methods=['POST'])
def create_library():
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({'error': 'Ime biblioteke je obavezan!'}), 400
    new_library = {"name": name, "books": []}
    libraries.append(new_library)
    return jsonify(new_library), 201

# Get all books in a library
@app.route('/library/<string:name>/book', methods=['GET'])
def get_books_in_library(name):
    for library in libraries:
        if library["name"].lower() == name.lower():
            return jsonify({"books": library["books"]})
    return jsonify({"message": "Biblioteka nije pronađena"}), 404

# Add a book to a library
@app.route('/library/<string:name>/book', methods=['POST'])
def add_book_to_library(name):
    data = request.get_json()
    title = data.get('title')
    author = data.get('author')

    if not title or not author:
        return jsonify({"message": "Naslov i autor knjige su obavezni"}), 400

    for library in libraries:
        if library["name"].lower() == name.lower():
            new_book = {"title": title, "author": author}
            library["books"].append(new_book)
            return jsonify(new_book), 201

    return jsonify({"message": "Biblioteka nije pronađena"}), 404

# Search for a book by title across all libraries
@app.route('/book/<string:title>', methods=['GET'])
def search_book(title):
    results = []
    for library in libraries:
        for book in library["books"]:
            if book["title"].lower() == title.lower():
                results.append({
                    "library": library["name"],
                    "title": book["title"],
                    "author": book["author"]
                })

    if results:
        return jsonify({"results": results})
    return jsonify({"message": "Knjiga nije pronađena"}), 404
