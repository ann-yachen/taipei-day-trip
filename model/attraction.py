from config.config import CNX_POOL

from flask import jsonify

class Attraction:
	def attractions(page, keyword, item_per_page, offset):
		# Check if keyword exists for different sql query setting
		if keyword == None:
			sql = "SELECT * FROM attractions LIMIT %s, %s"
			par = (offset, item_per_page + 1) # Get all rows of this page and the 1st row of next page
		else:
			sql = "SELECT * FROM attractions WHERE category=%s OR name LIKE %s LIMIT %s, %s"
			par = (keyword, "%" + keyword + "%", offset, item_per_page + 1) # Get all rows of this page and the 1st row of next page
		try:
			cnx = CNX_POOL.get_connection()
			cnxcursor = cnx.cursor(dictionary = True)
			cnxcursor.execute(sql, par)
			attractions = cnxcursor.fetchall()
			# Change the value of "images" into a list
			for attraction in attractions:
				images = attraction["images"].split(" ")
				images.pop() # Remove the last space
				attraction["images"] = images
			# Check if there is the last page by getting number of attractions
			if len(attractions) > 12:
				next_page = page + 1
				attractions.pop() # Remove the 1st row of next page
			else: 			
				next_page = None
			return jsonify({"nextPage": next_page, "data": attractions}), 200
		except:
			return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
		finally:
			cnxcursor.close()
			cnx.close()	

	def attraction(attractionId):
		try:
			cnx = CNX_POOL.get_connection()
			cnxcursor = cnx.cursor(dictionary = True)
			cnxcursor.execute("SELECT * FROM attractions WHERE id =%s", (attractionId, ))
			attraction_data = cnxcursor.fetchone()
			if attraction_data:
				images = attraction_data["images"].split(" ")
				images.pop() # Remove the last space
				attraction_data["images"] = images
				return jsonify({"data": attraction_data}), 200
			# If id is not found
			else:
				return jsonify({"error": True, "message": "景點編號不正確"}), 400
		except:
			return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
		finally:
			cnxcursor.close()
			cnx.close()

class Category:
	def categories():
		try:
			cnx = CNX_POOL.get_connection()
			cnxcursor = cnx.cursor()
			cnxcursor.execute("SELECT DISTINCT category FROM attractions")
			categories = [category[0] for category in cnxcursor.fetchall()] # Change a tuple from fetchall to a list
			return jsonify({"data": categories}), 200
		except:
			return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
		finally:
			cnxcursor.close()
			cnx.close()
