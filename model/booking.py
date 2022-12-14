from config.config import CNX_POOL
import datetime

class BookingModel():
    def get(id):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT * FROM booking WHERE user_id=%s", (id, ))
            booking = cnxcursor.fetchone()
            if booking:
                attraction_id = booking["attraction_id"]
                sql = (
                    "SELECT id, name, address, group_concat(images) as images "
                    "FROM attractions "
                    "INNER JOIN attraction_images "
				    "ON attractions.id=attraction_images.attraction_id "
                    "WHERE id=%s "
				    "GROUP BY id, name, address"                 
                )
                par = (attraction_id, )
                cnxcursor.execute(sql, par)
                attraction = cnxcursor.fetchone()
                # Keep the first image
                attraction["images"] = attraction["images"].split(",")
                image = attraction["images"][0]
                del attraction["images"]
                attraction["image"] = image 
                booking["date"] = booking["date"].strftime("%Y-%m-%d") # Change date format
                return{"data": {"attraction": attraction, "date": booking["date"], "time": booking["time"], "price": booking["price"]}}
            else:
                return {"data": None}
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()

    def post(id, attraction_id, date, time, price):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT * FROM booking WHERE user_id=%s", (id, ))
            booking = cnxcursor.fetchone()
            if booking:
                sql = (
                    "UPDATE booking "
                    "SET "
                    "attraction_id=%s,"
                    "date=%s,"
                    "time=%s,"
                    "price=%s "
                    "WHERE user_id=%s"
                )
                par = (attraction_id, date, time, price, booking["user_id"])
            else:
                sql = (
                    "INSERT INTO booking(user_id, attraction_id, date, time, price) "
                    "VALUE(%s, %s, %s, %s, %s)"
                )
                par = (id, attraction_id, date, time, price)
            cnxcursor.execute(sql, par)
            cnx.commit()
            return {"ok": True}
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()

    def delete(id):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT * FROM booking WHERE user_id=%s", (id, ))
            booking = cnxcursor.fetchone()
            if booking:
                cnxcursor.execute("DELETE FROM booking WHERE user_id=%s", (id, ))
                cnx.commit()
                return {"ok": True}
            else:
                return {"error": True, "message": "預定不存在，無法刪除"}, 400
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()