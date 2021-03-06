import json
import random
import math

sites = ['Yahoo', 'ESPN', 'Buzzfeed', 'MSN', 'NYTimes', 'eBay', 'YouTube', 'AOL']

def make_node(time, pathId, x, i ):
    days = 28 - time
    temp_time = time + 2 + random.random()*days/(8-x)
    round_time = round(temp_time, 1)
    label = sites[random.randint(0, len(sites) - 1)]
    vol = round(random.random()/ (1+x),2)
    return new_node(label, round_time, pathId, vol)

def new_node(label, time, pathId, vol):
    return {'label': label, 'time': time, 'pathId': pathId, 'volume': vol}

def make_item(pathId):
    item = {}
    item['Path Count'] = int(random.random() * random.random() * 10000000)
    item['Conversion Rate'] = round(random.random() * random.random() * 0.1,3)
    item['Impression Per Node'] = round(math.sqrt(random.random()) * 8, 2) 
    item['ROI'] = round(random.random() * random.random() * 5, 2)
    item['Effectiveness'] = round(random.random() * random.random() * 3, 2)
    item['pathId'] = pathId
    
    nodes = []
    i = int(math.ceil(random.random()*random.random()*8))
    nodes.append(new_node('purchase', 0, pathId, 0))
    time = 0
    total_volume = 0
    for x in range(0, i):
        node = make_node(time, pathId, x, i)
        nodes.append(node)
        total_volume += node['volume']
        time = node['time']
    
    updatedVolume = nodes[1]['volume'] + 1 - total_volume
    nodes[1]['volume'] = round(updatedVolume, 2)
    item['nodes'] = nodes    
    return item


rows = []
for i in range(1,1001):
    pathId = i
    rows.append(make_item(pathId))

f = open('output.json', 'w')
json.dump(rows, f)
f.close()