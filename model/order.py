from config.config import CNX_POOL, PAYMENT_PARNER_KEY, PAYMENT_MERCHANT_ID

import datetime # For order number
import requests

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
                "INSERT INTO orders ("
                    "number, "
                    "user_id, "
                    "prime, "
                    "price, "
                    "status"
                ") "
                "VALUES (%s, %s, %s, %s, %s)"
            )
            par = (number, user_id, prime, order["price"], 0)
            cnxcursor.execute(sql, par)

            # Save trip details into order_trip for each trip
            trips = order["trip"]
            for trip in trips:
                sql = (
                    "INSERT INTO order_trip ("
                        "order_number, "
                        "attraction_id, "
                        "attraction_name, "
                        "attraction_address, "
                        "attraction_image, "
                        "date, "
                        "time, "
                        "price"
                    ") "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
                )
                par = (
                    number, 
                    trip["attraction"]["id"], 
                    trip["attraction"]["name"],
                    trip["attraction"]["address"],
                    trip["attraction"]["image"],
                    trip["date"],
                    trip["time"],
                    trip["price"]
                )
                cnxcursor.execute(sql, par)

            # Save contact details into order_contact
            sql = (
                "INSERT INTO order_contact ("
                    "order_number, "
                    "contact_name, "
                    "contact_email, "
                    "contact_phone"
                ") "
                "VALUES (%s, %s, %s, %s)"
            )
            par = (number, contact["name"], contact["email"], contact["phone"])
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
            response = requests.post(url, headers = headers, json = payload)
            payment_reponse = response.json()
            payment_status = payment_reponse["status"]
            payment_message = payment_reponse["msg"]

            # Create payment for order            
            sql = (
                "INSERT INTO payment (order_number, status, message, time) "
                "VALUES (%s, %s, %s, %s)"
            )
            par = (number, payment_status, payment_message, datetime.datetime.now())
            cnxcursor.execute(sql, par)
            cnx.commit()

            # If payment is success, change order status to 1 for record 
            if payment_status == 0 and payment_message == "Success":
                cnxcursor.execute("UPDATE orders SET status=1 WHERE number=%s", (number, ))
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

    # Get old orders by user id
    def get_orders_by_user(user_id):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            cnxcursor.execute("SELECT number, price, status FROM orders WHERE user_id=%s", (user_id, ))
            old_orders = cnxcursor.fetchall()
            if not old_orders: # If old_orders is an empty list
                return {"data": None}
            else:
                return {"data": old_orders}
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()

    # Get order details by order number
    def get_order_by_number(user_id, orderNumber):
        try:
            cnx = CNX_POOL.get_connection()
            cnxcursor = cnx.cursor(dictionary = True)
            sql = (
                "SELECT "
                    "number, "
                    "price, "
                    "status, "
                    "contact_name, "
                    "contact_email, "
                    "contact_phone "
                "FROM orders "
                "INNER JOIN order_contact "
                "ON orders.number=order_contact.order_number "
                "WHERE number=%s AND user_id=%s"
            )
            par = (orderNumber, user_id)
            cnxcursor.execute(sql, par)
            order = cnxcursor.fetchone()
            if order:
                # Get trips detail of order
                sql = (
                    "SELECT "
                        "attraction_id, "
                        "attraction_name, "
                        "attraction_address, "
                        "attraction_image, "
                        "date, "
                        "time, "
                        "price "
                    "FROM order_trip "
                    "WHERE order_number=%s"
                )
                par = (orderNumber, )
                cnxcursor.execute(sql, par)
                trips = cnxcursor.fetchall()

                # Organize trip data to meet spec
                for trip in trips:
                    trip["attraction"] = {
                        "id": trip["attraction_id"],
                        "name": trip["attraction_name"],
                        "address": trip["attraction_address"], 
                        "image": trip["attraction_image"]                        
                    }
                    # Remove key-value to meet spec
                    remove_key_list = {
                        "attraction_id",
                        "attraction_name",
                        "attraction_address",
                        "attraction_image"
                    }
                    for key in remove_key_list:
                        trip.pop(key, None)
                    trip["date"] = trip["date"].strftime("%Y-%m-%d")

                # Organize contact data to meet spec
                contact = {
                    "name": order["contact_name"],
                    "email": order["contact_email"],
                    "phone": order["contact_phone"]
                }
                
                # Add organized data into order then remove key-value to meet spec
                order["trip"] = trips
                order["contact"] = contact
                remove_key_list = {
                    "contact_name",
                    "contact_email",
                    "contact_phone"
                }
                for key in remove_key_list:
                    order.pop(key, None)

                return {"data": order}
            else:
                return {"error": True, "message": "訂單不存在"}, 400
        except:
            return {"error": True, "message": "伺服器內部錯誤"}, 500
        finally:
            cnxcursor.close()
            cnx.close()
