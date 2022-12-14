from config.config import CNX_POOL, JWT_KEY

import jwt, datetime

class JWTAuthModel:
    def encode(email):
        encoded_token = jwt.encode({"email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(days = 7)}, JWT_KEY, algorithm = "HS256")
        return encoded_token
    
    def decode(token):
        if token:
            decoded_token = jwt.decode(token, JWT_KEY, algorithms = "HS256")
            email = decoded_token["email"]
            return email