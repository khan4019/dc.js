import json
import random
import math

sites = ['Yahoo', 'ESPN2', 'Buzzfeed', 'MSN', 'NYTimes', 'eBay', 'YouTube', '']

def make_node(time, pathId):
    days = 27 - time
    this_time = i / 2 * random.random() * days
    time = round(this_time + time, 1)
    label = sites[random.randint(0, len(sites) - 1)]
    return new_node(label, time, pathId)

def new_node(label, time, pathId):
    return {'label': label, 'time': time, 'pathId': pathId}

def make_item(pathId):
    item = {}
    item['pathCount'] = int(random.random() * random.random() * 10000000)
    item['conversionRate'] = round(random.random() * random.random() * 0.1,3)
    item['impressionPerNode'] = round(math.sqrt(random.random()) * 8, 2) 
    item['roi'] = round(random.random() * random.random() * 5, 2)
    item['effectiveness'] = round(random.random() * random.random() * 3, 2)
    item['pathId'] = pathId
    
    nodes = []
    i = random.randint(1, 8)
    nodes.append(new_node('purchase', 0, pathId))
    time = 0
    for x in range(1, i):
        node = make_node(time, pathId)
        nodes.append(node)
        time = node['time']
    
    item['nodes'] = nodes    
    return item


rows = []
for i in range(1,100):
    pathId = i
    rows.append(make_item(pathId))

f = open('output.json', 'w')
json.dump(rows, f)
f.close()