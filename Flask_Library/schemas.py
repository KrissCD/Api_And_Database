from marshmallow import Schema, fields

class BookInLibrarySchema(Schema):
    class Meta:
        ordered = True
    id = fields.Int(required=True)
    title = fields.String(required=True)
    author = fields.String(required=True)
    published_year = fields.Int(required=True)

class LibraryOutputSchema(Schema):
    class Meta:
        ordered = False
    id = fields.Int(required=True)
    name = fields.String(required=True)
    books = fields.List(fields.Nested(BookInLibrarySchema), dump_only=True)


class LibraryInputSchema(Schema):
    class Meta:
        ordered = False
    id = fields.Int(required=True)
    name = fields.String(required=True)
    books = fields.List(fields.Nested(BookInLibrarySchema), dump_only=True)



class BookInputSchema(Schema):
    class Meta:
        ordered = True
    title = fields.String(required=True)
    author = fields.String(required=True)
    published_year = fields.Int(required=True)
    library_id = fields.Int(required=True)

class BookOutputSchema(Schema):
    class Meta:
        ordered = True
    id = fields.Int(required=True)
    title = fields.String(required=True)
    author = fields.String(required=True)
    published_year = fields.Int(required=True)
    library_id = fields.Int(required=True)
