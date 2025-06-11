import uuid

libraries = [
    {
        "id": str(uuid.uuid4()),
        "name": "City Library"
        },
    {
        "id": str(uuid.uuid4()),
        "name": "University Library"
        }
]

books = [
    {
        "id": str(uuid.uuid4()),
        "title": "1984",
        "author": "George Orwell",
        "library_id": 1
    },
    {
        "id": str(uuid.uuid4()),
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "library_id": 1
    },
    {
        "id": str(uuid.uuid4()),
        "title": "A Brief History of Time",
        "author": "Stephen Hawking",
        "library_id": 2
    },
    {
        "id": str(uuid.uuid4()),
        "title": "The Selfish Gene",
        "author": "Richard Dawkins",
        "library_id": 2
    }
]