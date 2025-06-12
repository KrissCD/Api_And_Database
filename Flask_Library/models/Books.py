from dp import dp

class BookModel(dp.Model):
    __tablename__ = "books"

    id = dp.Column(dp.Integer, primary_key=True)
    title = dp.Column(dp.String(100), nullable=False)
    author = dp.Column(dp.String(100), nullable=False)
    published_year = dp.Column(dp.Integer, nullable=False)
    library_id = dp.Column(dp.Integer, dp.ForeignKey("libraries.id"), nullable=False)
