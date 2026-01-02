from pymongo import MongoClient
import os

# Use environment variable for security
MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb+srv://lakna:it22200242@betel.hpv64rs.mongodb.net/?appName=Betel"
)

client = MongoClient(MONGO_URI)

db = client["betel_app"]

predictions_collection = db["predictions"]
