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
                order = request.json["order"]
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
