from marshmallow import Schema, fields, validate

class LibraryInputSchema(Schema):
    name = fields.String(required=True)

class LibraryOutputSchema(Schema):
    id = fields.String(required=True)
    name = fields.String(required=True)

class BookInputSchema(Schema):
    title = fields.String(required=True)
    author = fields.String(required=True)
    published_year = fields.Integer(required=True)

class BookOutputSchema(Schema):
    id = fields.String(required=True)
    title = fields.String(required=True)
    author = fields.String(required=True)
    published_year = fields.Integer(required=True)
    library_id = fields.String(required=True)

