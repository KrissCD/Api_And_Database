from dp import dp

class LibraryModel(dp.Model):
    __tablename__ = "libraries"

    id = dp.Column(dp.Integer, primary_key=True)
    name = dp.Column(dp.String(100), nullable=False)
    books = dp.relationship("BookModel", backref="library", cascade="all, delete")
