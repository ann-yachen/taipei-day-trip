import json
import mysql.connector

dbconfig = {
    "host": "localhost",
    "user": "root",
    "password": "12345678",
    "database": "taipei_day_trip",
    "buffered": True
}

with open("taipei-attractions.json", mode = "r", encoding = "utf-8") as file:
    data = json.load(file)
attractions = data["result"]["results"]

def split_file(file):
    all_url = file.split("https://")
    images = ""
    for i in range(len(all_url)):
        if all_url[i].lower().endswith(".jpg") or all_url[i].lower().endswith(".png"):
            images = images + "https://" + all_url[i] + " "
    return images

# Get data of attractions from JSON and insert into table "attractions"
try:
    cnx = mysql.connector.connect(**dbconfig)
    cnxcursor = cnx.cursor()
    for attraction in attractions:    
        add_attraction = "INSERT INTO attractions(name, category, description, address, transport, mrt, lat, lng, images) VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        attraction_data = (attraction["name"],
                           attraction["CAT"],
                           attraction["description"],
                           attraction["address"].replace(" ", ""),
                           attraction["direction"],
                           attraction["MRT"],
                           float(attraction["latitude"]),
                           float(attraction["longitude"]),
                           split_file(attraction["file"]))
        cnxcursor.execute(add_attraction, attraction_data)
        cnx.commit()
except mysql.connector.Error as err:
    print("Something went wrong: {}".format(err))
finally:
    cnxcursor.close()
    cnx.close()