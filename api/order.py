from config.config import CNX_POOL

from flask import Blueprint, request
from model.order import OrderModel
from model.jwt import JWTAuthModel

import re # For input validation
# Regex for input validation of contact
name_validate_pattern = re.compile(r"(.|\s)*\S(.|\s)*")
email_validate_pattern = re.compile(r"([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+")
phone_validate_pattern = re.compile(r"09[0-9]{8}")

order_blueprint = Blueprint("order", __name__)

@order_blueprint.route("/orders", methods = ["POST", "GET"])
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
                if request.method == "POST":
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
                    if re.fullmatch(name_validate_pattern, contact["name"]) and re.fullmatch(email_validate_pattern, contact["email"]) and re.fullmatch(phone_validate_pattern, contact["phone"]):
                        response = OrderModel.create_order(user_id, prime, order, contact)
                        return response
                    else:
                        return {"error": True, "message": "聯絡資訊格式不正確"}, 400
                
                if request.method == "GET":
                    response = OrderModel.get_orders_by_user(user_id)
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
