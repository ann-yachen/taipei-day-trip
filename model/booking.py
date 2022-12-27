from config.config import CNX_POOL
import datetime

class BookingModel():
    def get_booking(user_id):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            sql = (
                "SELECT "
                    "booking.id, " 
                    "booking.date, "
                    "booking.time, "
                    "booking.price, "
                    "booking.attraction_id, "
                    "attractions.name, "
                    "attractions.address, "
                    "GROUP_CONCAT(attraction_images.images) AS images "
                "FROM booking "
                "INNER JOIN attractions "
                "ON booking.attraction_id=attractions.id "
                "INNER JOIN attraction_images "
                "ON attractions.id=attraction_images.attraction_id "
                "WHERE user_id=%s "
                "GROUP BY "
                    "booking.id, "
                    "booking.date, "
                    "booking.time, "
                    "booking.price, "
                    "booking.attraction_id, "
                    "attractions.name, "
                    "attractions.address"
            )
            par = (user_id, )
            cnxcursor.execute(sql, par)
            bookings = cnxcursor.fetchall()
            # If booking exists
            if bookings:
                for booking in bookings:
                    # Get the first image of attraction
                    images = booking["images"].split(",")
                    image = images[0]
                    booking["attraction"] = {
                        "id": booking["attraction_id"],
                        "name": booking["name"],
                        "address": booking["address"],
                        "image": image
                    }
                    booking["date"] = booking["date"].strftime("%Y-%m-%d") # Change to YYYY-MM-DD
                    # Remove key-value to meet spec
                    remove_key_list = {
                        "attraction_id",
                        "name",
                        "address",
                        "images"
                    }
                    for key in remove_key_list:
                        booking.pop(key, None)
                return {"data": bookings}
            else:
                return {"data": None}
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()

    def create_booking(user_id, attraction_id, date, time, price):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT * FROM booking WHERE user_id=%s AND date=%s AND time=%s", (user_id, date, time))
            booking = cnxcursor.fetchone()
            if booking:
                sql = (
                    "UPDATE booking "
                    "SET "
                        "attraction_id=%s,"
                        "time=%s,"
                        "price=%s "
                    "WHERE user_id=%s AND date=%s AND time=%s"
                )
                par = (attraction_id, time, price, booking["user_id"], booking["date"], booking["time"])
            else:
                sql = (
                    "INSERT INTO booking (user_id, attraction_id, date, time, price) "
                    "VALUES (%s, %s, %s, %s, %s)"
                )
                par = (user_id, attraction_id, date, time, price)
            cnxcursor.execute(sql, par)
            cnx.commit()
            return {"ok": True}
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()

    def delete_booking(user_id, booking_id):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT * FROM booking WHERE user_id=%s AND id=%s", (user_id, booking_id))
            booking = cnxcursor.fetchone()
            if booking:
                cnxcursor.execute("DELETE FROM booking WHERE user_id=%s AND id=%s", (user_id, booking_id))
                cnx.commit()
                return {"ok": True}
            else:
                return {"error": True, "message": "預定不存在，無法刪除"}, 400
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()