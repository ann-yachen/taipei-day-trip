import json
import mysql.connector
from config.config import DB_CONFIG

with open("taipei-attractions.json", mode = "r", encoding = "utf-8") as file:
    data = json.load(file)
attractions = data["result"]["results"]

def split_file(file):
    all_url = file.split("https://")
    all_url.pop(0) # Remove the first empty element
    images = []
    for image in all_url:
        if image.lower().endswith(".jpg") or image.lower().endswith(".png"):
            images.append("https://" + image)
    return images

# Get data of attractions from JSON and insert into table "attractions"
attraction_id = 0 # Record attraction_id for attraction_images
try:
    cnx = mysql.connector.connect(**DB_CONFIG)
    cnxcursor = cnx.cursor()
    for attraction in attractions: 
        add_attraction = "INSERT INTO attractions(name, category, description, address, transport, mrt, lat, lng) VALUES(%s, %s, %s, %s, %s, %s, %s, %s)"
        attraction_data = (attraction["name"],
                           attraction["CAT"],
                           attraction["description"],
                           attraction["address"].replace(" ", ""),
                           attraction["direction"],
                           attraction["MRT"],
                           float(attraction["latitude"]),
                           float(attraction["longitude"])
                           )
        cnxcursor.execute(add_attraction, attraction_data)
        cnx.commit()

        # Safe attraction images into other table
        attraction_id = attraction_id + 1
        images = split_file(attraction["file"])
        for image in images:   
            add_attraction_images = "INSERT INTO attraction_images(attraction_id, images) VALUE(%s, %s)"
            attraction_images = (attraction_id, image)
            cnxcursor.execute(add_attraction_images, attraction_images)
            cnx.commit()

except mysql.connector.Error as err:
    print("Something went wrong: {}".format(err))
finally:
    cnxcursor.close()
    cnx.close()