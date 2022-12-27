from config.config import CNX_POOL

from flask import Blueprint, request
from model.order import OrderModel

from model.jwt import JWTAuthModel

order_blueprint = Blueprint("order", __name__)

@order_blueprint.route("/orders", methods = ["POST"])
def orders():
    token = request.cookies.get("token")
    email = JWTAuthModel.decode(token)
    if email:
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT id, name, email FROM user WHERE email=%s", (email, ))
            user = cnxcursor.fetchone()
            if user:
                user_id = user["id"]
                prime = request.json["prime"]
                sql = (
                    "SELECT " 
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
                total_price = 0
                for booking in bookings:
                    # Calculate total price
                    total_price += booking["price"]
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
                        "price",
                        "attraction_id",
                        "name",
                        "address",
                        "images"
                    }
                    for key in remove_key_list:
                        booking.pop(key, None)
                order = {
                    "price": total_price,
                    "trip": bookings
                }
                contact = request.json["contact"]
                response = OrderModel.create_order(user_id, prime, order, contact)
                return response
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()
    else:
        return {"error": True, "message": "未登入系統，拒絕存取"}, 403

@order_blueprint.route("/order/<orderNumber>", methods = ["GET"])
def order(orderNumber):
    token = request.cookies.get("token")
    email = JWTAuthModel.decode(token)
    if email:
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT id, name, email FROM user WHERE email=%s", (email, ))
            user = cnxcursor.fetchone()
            if user:
                user_id = user["id"]
                response = OrderModel.get_order_by_number(user_id, orderNumber)
                return response
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()
    else:
        return {"error": True, "message": "未登入系統，拒絕存取"}, 403
