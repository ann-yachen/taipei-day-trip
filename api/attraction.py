from flask import *
from model.attraction import Attraction, Category

attraction_blueprint = Blueprint("attraction", __name__)

# Get attractions from database
@attraction_blueprint.route("/attractions", methods = ["GET"])
def get_attractions():
	page = request.args.get("page", 0, int)
	keyword = request.args.get("keyword", None)
	# Pagination
	item_per_page = 12
	offset = page * item_per_page
	return Attraction.attractions(page, keyword, item_per_page, offset)	

# Get attraction data by id from database
@attraction_blueprint.route("/attraction/<attractionId>", methods = ["GET"])
def get_attraction_by_id(attractionId):
	return Attraction.attraction(attractionId)

# Get categories from database
@attraction_blueprint.route("/categories", methods = ["GET"])
def get_categories():
	return Category.categories()
