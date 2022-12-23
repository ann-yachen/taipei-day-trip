from config.config import CNX_POOL

from flask import jsonify

class Attraction:
	def get_attractions(page, keyword, item_per_page, offset):
		# Check if keyword exists for different sql query setting
		if keyword == None:
			sql = (
				"SELECT "
					"id, "
					"name, "
					"category, "
					"description, "
					"address, "
					"transport, "
					"mrt, "
					"lat, "
					"lng, "
					"GROUP_CONCAT(images) AS images "
				"FROM attractions "
				"INNER JOIN attraction_images "
				"ON attractions.id=attraction_images.attraction_id "
				"GROUP BY id, name, category, description, address, transport, mrt, lat, lng "
				"LIMIT %s, %s"
			)
			par = (offset, item_per_page + 1) # Get all rows of this page and the 1st row of next page
		else:
			sql = (
				"SELECT "
					"id, "
					"name, "
					"category, "
					"description, "
					"address, "
					"transport, "
					"mrt, "
					"lat, "
					"lng, "
					"GROUP_CONCAT(images) AS images "
				"FROM attractions "
				"INNER JOIN attraction_images "
				"ON attractions.id=attraction_images.attraction_id "
				"WHERE category=%s OR name LIKE %s "
				"GROUP BY id, name, category, description, address, transport, mrt, lat, lng "
				"LIMIT %s, %s"
			)
			par = (keyword, "%" + keyword + "%", offset, item_per_page + 1) # Get all rows of this page and the 1st row of next page
		try:
			cnx = CNX_POOL.get_connection()
			cnxcursor = cnx.cursor(dictionary = True)
			cnxcursor.execute(sql, par)
			attractions = cnxcursor.fetchall()
			# Change images to a list
			for attraction in attractions:
				attraction["images"] = attraction["images"].split(",")
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

	def get_attraction_by_id(attractionId):
		try:
			cnx = CNX_POOL.get_connection()
			cnxcursor = cnx.cursor(dictionary = True)
			sql = (
				"SELECT "
					"id, "
					"name, "
					"category, "
					"description, "
					"address, "
					"transport, "
					"mrt, "
					"lat, "
					"lng, "
					"GROUP_CONCAT(images) AS images "
				"FROM attractions "
				"INNER JOIN attraction_images "
				"ON attractions.id=attraction_images.attraction_id "
				"WHERE id=%s"
				"GROUP BY id, name, category, description, address, transport, mrt, lat, lng "
			)
			par = (attractionId, )
			cnxcursor.execute(sql, par)
			attraction_data = cnxcursor.fetchone()
			if attraction_data:
				attraction_data["images"] = attraction_data["images"].split(",")				
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
	def get_categories():
		try:
			cnx = CNX_POOL.get_connection()
			cnxcursor = cnx.cursor()
			sql = (
				"SELECT category "
				"FROM attractions "
				"GROUP BY category"
			)
			cnxcursor.execute(sql)
			categories = [category[0] for category in cnxcursor.fetchall()] # Change a tuple from fetchall to a list
			return jsonify({"data": categories}), 200
		except:
			return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
		finally:
			cnxcursor.close()
			cnx.close()