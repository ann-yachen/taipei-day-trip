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
                    user_id = user["id"]
                    return BookingModel.get_booking(user_id)

                if request.method == "POST":
                    user_id = user["id"]
                    attraction_id = request.json["attractionId"]
                    date = request.json["date"]
                    time = request.json["time"]
                    price = 2000 # Price for morning
                    if time == "afternoon":
                        price = 2500
                    return BookingModel.create_booking(user_id, attraction_id, date, time, price) 
                
                if request.method == "DELETE":
                    user_id = user["id"]
                    booking_id = request.json["bookingId"]
                    return BookingModel.delete_booking(user_id, booking_id)
            else:
                return {"error": True, "message": "Email 不正確"}, 400           
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()
    else:
        return {"error": True, "message": "未登入系統，拒絕存取"}, 403
