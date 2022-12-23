from config.config import CNX_POOL, PAYMENT_PARNER_KEY, PAYMENT_MERCHANT_ID
import datetime

import requests
import json

class OrderModel:
    def create_order(user_id, prime, order, contact):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)

            # Create order number with current time and user_id
            current_time = datetime.datetime.now()
            number = current_time.strftime("%Y%m%d%H%M%S%f") + str(user_id)

            # Create order, payment status set as 0
            sql = (
                "INSERT INTO orders (number, user_id, prime, price, status) "
                "VALUES (%s, %s, %s, %s, %s)"
            )
            par = (number, user_id, prime, order["price"], 0)
            cnxcursor.execute(sql, par)

            # Get order_id for trip and contact
            cnxcursor.execute("SELECT id FROM orders WHERE user_id=%s AND number=%s", (user_id, number))
            db_order = cnxcursor.fetchone()
            order_id = db_order["id"]
            # Save trip details into order_trip
            sql = (
                "INSERT INTO order_trip (order_id, attraction, date, time) "
                "VALUES (%s, %s, %s, %s)"
            )
            par = (order_id, json.dumps(order["trip"]["attraction"]), order["trip"]["date"], order["trip"]["time"])
            cnxcursor.execute(sql, par)

            # Save contact details into order_contact
            sql = (
                "INSERT INTO order_contact (order_id, name, email, phone) "
                "VALUES (%s, %s, %s, %s)"
            )
            par = (order_id, contact["name"], contact["email"], contact["phone"])
            cnxcursor.execute(sql, par)
            cnx.commit()

            # Connect to TapPay Pay by Prime API for payment
            url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
            headers = {
                "Content-Type": "application/json",
                "x-api-key": PAYMENT_PARNER_KEY
            }
            payload = {
                "prime": prime,
                "partner_key": PAYMENT_PARNER_KEY,
                "merchant_id": PAYMENT_MERCHANT_ID,
                "amount": order["price"],
                "currency": "TWD",
                "details": "trip",
                "cardholder": {
                    "phone_number": contact["phone"],
                    "name": contact["name"],
                    "email": contact["email"]
                },
                "remember": False
            }
            response = requests.post(url, headers=headers, json=payload)
            payment_reponse = response.json()
            payment_status = payment_reponse["status"]
            payment_message = payment_reponse["msg"]

            # Create payment for order            
            sql = (
                "INSERT INTO payment (order_id, order_number, status, message, time) "
                "VALUES (%s, %s, %s, %s, %s)"
            )
            par = (order_id, number, payment_status, payment_message, datetime.datetime.now())
            cnxcursor.execute(sql, par)
            cnx.commit()

            # If payment is success, change order status to 1 for record 
            if payment_status == 0 and payment_message == "Success":
                cnxcursor.execute("UPDATE orders SET status=1 WHERE id=%s", (order_id, ))
                cnxcursor.execute("DELETE FROM booking WHERE user_id=%s", (user_id, ))
                cnx.commit()
                message = "付款成功"
            else:
                message = "付款失敗"
            return {"data": {"number": number, "payment": {"status": payment_status, "message": message}}}
        except:
            return {"error": True, "message": "訂單建立失敗，輸入不正確或其他原因"}, 400
        finally:
            cnxcursor.close()
            cnx.close()

    def get_order_by_number(user_id, orderNumber):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT id, number, price, status FROM orders WHERE number=%s AND user_id=%s", (orderNumber, user_id))
            order = cnxcursor.fetchone()
            order_id = order["id"]
            cnxcursor.execute("SELECT attraction, date, time FROM order_trip WHERE order_id=%s", (order_id, ))
            order_trip = cnxcursor.fetchone()
            cnxcursor.execute("SELECT name, email, phone FROM order_contact WHERE order_id=%s", (order_id, ))
            order_contact = cnxcursor.fetchone()
            order["trip"] = order_trip
            order["contact"] = order_contact
            del order["id"]
            return {"data": order}
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()
