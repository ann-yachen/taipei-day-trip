from config.config import CNX_POOL

from flask import Blueprint, request
from model.booking import BookingModel
from model.jwt import JWTAuthModel

booking_blueprint = Blueprint("booking", __name__)

@booking_blueprint.route("/", methods = ["GET", "POST", "DELETE"])
def booking():
    token = request.cookies.get("token")
    email = JWTAuthModel.decode(token)
    if email:
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT id, name, email FROM user WHERE email=%s", (email, ))
            user = cnxcursor.fetchone()
            if user:
                if request.method == "GET":
                    id = user["id"]
                    return BookingModel.get_booking_by_id(id)

                if request.method == "POST":
                    id = user["id"]
                    attraction_id = request.json["attractionId"]
                    date = request.json["date"]
                    time = request.json["time"]
                    price = request.json["price"]
                    return BookingModel.create_booking(id, attraction_id, date, time, price) 
                
                if request.method == "DELETE":
                    id = user["id"]
                    return BookingModel.delete_booking(id)
            else:
                return {"error": True, "message": "Email 不正確"}, 400           
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()
    else:
        return {"error": True, "message": "未登入系統，拒絕存取"}, 403
