from flask import *
import mysql.connector, mysql.connector.pooling
app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config['JSON_SORT_KEYS'] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

dbconfig = {
	"host": "localhost",
	"user": "root",
	"password": "12345678",
	"database": "taipei_day_trip",
	"buffered": True
}
cnxpool = mysql.connector.pooling.MySQLConnectionPool(
	pool_name = "taipei_day_trip_pool",
	pool_size = 3,
	**dbconfig)

# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")

@app.route("/booking")
def booking():
	return render_template("booking.html")

@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

# RESTful API
@app.route("/api/attractions", methods = ["GET"])
def get_attractions():
	page = request.args.get("page", 0, int)
	keyword = request.args.get("keyword", None)
	id_start = page * 12
	if keyword == None:
		try:
			cnx = cnxpool.get_connection()
			cnxcursor = cnx.cursor(dictionary = True)
			# Get the number of attractions in table
			cnxcursor.execute("SELECT COUNT(*) FROM attractions")
			count = cnxcursor.fetchall()
			number_attractions = count[0]["COUNT(*)"]
			# Get the data of attractions in range
			cnxcursor.execute("SELECT * FROM attractions LIMIT %s, %s", (id_start, 12))
			attractions = cnxcursor.fetchall()
			# Change the value of "images" into a list
			for attraction in attractions:
				images = attraction["images"].split(" ")
				images.pop() # Remove the last space
				attraction["images"] = images
			next_page = page + 1
			# Check if there is the last page
			if number_attractions / 12 < page + 1:
				next_page = None
			return jsonify({"nextPage": next_page, "data": attractions})
		except:
			return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
		finally:
			cnxcursor.close()
			cnx.close()
	else:
		try:
			cnx = cnxpool.get_connection()
			cnxcursor = cnx.cursor(dictionary = True)
			# Get the number of attractions in table
			cnxcursor.execute("SELECT COUNT(*) FROM attractions WHERE category=%s OR name LIKE %s", (keyword, "%" + keyword + "%"))
			count = cnxcursor.fetchall()
			number_attractions = count[0]["COUNT(*)"]
			# Get the attractions with keyword
			cnxcursor.execute("SELECT * FROM attractions WHERE category=%s OR name LIKE %s LIMIT %s, %s", (keyword, "%" + keyword + "%", id_start, 12))
			attractions = cnxcursor.fetchall()
			# Change the value of "images" into a list
			for attraction in attractions:
				images = attraction["images"].split(" ")
				images.pop() # Remove the last space
				attraction["images"] = images
			next_page = page + 1
			# Check if there is the last page
			if number_attractions / 12 <= page + 1:
				next_page = None
			return jsonify({"nextPage": next_page, "data": attractions})
		except:
			return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
		finally:
			cnxcursor.close()
			cnx.close()

@app.route("/api/attraction/<attractionId>", methods = ["GET"])
def get_attraction_by_id(attractionId):
	try:
		cnx = cnxpool.get_connection()
		cnxcursor = cnx.cursor(dictionary = True)
		cnxcursor.execute("SELECT * FROM attractions WHERE id =%s", (attractionId, ))
		attraction_data = cnxcursor.fetchone()
		if attraction_data:
			images = attraction_data["images"].split(" ")
			images.pop() # Remove the last space
			attraction_data["images"] = images
			return jsonify({"data": attraction_data})
		# If id is not found
		else:
			return jsonify({"error": True, "message": "景點編號不正確"}), 400
	except:
		return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
	finally:
		cnxcursor.close()
		cnx.close()

@app.route("/api/categories", methods = ["GET"])
def get_categories():
	try:
		cnx = cnxpool.get_connection()
		cnxcursor = cnx.cursor()
		cnxcursor.execute("SELECT DISTINCT category FROM attractions")
		categories = [category[0] for category in cnxcursor.fetchall()] # Change a tuple from fetchall to a list
		return jsonify({"data": categories})
	except:
		return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
	finally:
		cnxcursor.close()
		cnx.close()

if __name__ == "__main__":
	app.run(port = 3000)