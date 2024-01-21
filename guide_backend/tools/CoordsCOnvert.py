from OSGridConverter import grid2latlong, latlong2grid
import pandas as pd
from convertbng.util import convert_bng, convert_lonlat
from utils import dotdict


FILE = "D:/temp/bus-sequences.csv"
lat = 51.516819
lng = -0.127776
#print(latlong2grid(lat, lng))
#print(convert_bng([lng], [lat]))
#print(convert_lonlat([529998], [181428]))


df = pd.read_csv(FILE)
print(len(df))
df.dropna(inplace=True)
print("after NaN removal: ", len(df))
ll = convert_lonlat(df['Location_Easting'].astype(int), df['Location_Northing'].astype(int))
df['lng'] = ll[0]
df['lat'] = ll[1]

"""
for i, r in df.iterrows():
    ll = convert_lonlat([int(r['Location_Easting'])], [int(r['Location_Northing'])])
    r['lat'] = ll[0][0]
    r['lng'] = ll[1][0]
"""

df = df[df['Virtual_Bus_Stop']==0]
print("after virtual stops removal: ", len(df))

from pymongo import MongoClient
client = MongoClient("mongodb://am:Fik2fik2@95.216.187.16/guides")
buses = client.guides.buses

f = open('../../AudioGuide_ion4/src/app/london_buses.ts', 'wt')
#f.writelines('export const LONDON_BUSES = [\n')
for name, g in df.groupby('Route'):
    #f.writelines('{bus : "' + name + '",\nstops : [\n')
    bus = dotdict({'route' : name, 'stops': []})
    for i, r in g.iterrows():
        """
        f.writelines('{route : "' + r['Route'] + '",\n')
        f.writelines("run : " + str(int(r['Run'])) + ',\n')
        f.writelines("sequence : " + str(int(r['Sequence'])) + ',\n')
        f.writelines('stop_name : "' + r['Stop_Name'] + '",\n')
        f.writelines("Heading : " + str(r['Heading']) + ',\n')
        f.writelines("lat : " + str(r['lat']) + ',\n')
        f.writelines("lng : " + str(r['lng']) + '},\n')
        """
        bus.stops.append({
            'run': int(r['Run']),
            'sequence': int(r['Sequence']),
            'stop_name': r['Stop_Name'],
            'heading': int(r['Heading']),
            'lat': r['lat'],
            'lng': r['lng']
        })
    buses.update({'route': bus.route}, bus, upsert=True)
client.close()
#f.writelines(']')
#f.close()