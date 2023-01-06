from config.config import CNX_POOL

from flask import Blueprint, request
from model.booking import BookingModel
from model.jwt import JWTAuthModel

import datetime

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
                    # For price mapping by time
                    price_by_time = {
                        "morning": 2000,
                        "afternoon": 2500
                    }
                    # Check if date format is valid or not
                    if validate_date(date):
                        datetime_date = datetime.datetime.strptime(date, "%Y-%m-%d") # Change to datetime object
                        # Check if date is later than today and time matches format
                        if datetime_date.date() > datetime.datetime.today().date() and time in price_by_time:
                            price = price_by_time[time]
                            return BookingModel.create_booking(user_id, attraction_id, date, time, price)
                        else:
                            return {"error": True, "message": "預定時間格式不正確"}, 400
                    else:
                        return {"error": True, "message": "預定日期格式不正確"}, 400
                
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

# Valid date by datetime module
def validate_date(date):
    try:
        datetime.datetime.strptime(date, "%Y-%m-%d")
        return True
    except ValueError:
        return False