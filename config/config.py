from dotenv import load_dotenv
import os
load_dotenv()

# Database setting
import mysql.connector, mysql.connector.pooling
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
	"user": os.getenv("DB_USER"),
	"password": os.getenv("DB_PASSWORD"),
	"database": os.getenv("DB_DATABASE"),
	"buffered": True
}
CNX_POOL = mysql.connector.pooling.MySQLConnectionPool(
	pool_name = "taipei_day_trip_pool",
	pool_size = 3,
	**DB_CONFIG)

# PyJWT key
JWT_KEY = os.getenv("JWT_KEY")