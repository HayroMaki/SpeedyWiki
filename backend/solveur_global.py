import json
import sys
import os
import asyncio
import aiohttp
import motor.motor_asyncio
from collections import deque, defaultdict
from itertools import permutations

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client["speedywiki"]
links_collection = db["links"]
pages_collection = db["pages"]

# Cache to store query results
link_cache = defaultdict(list)
backlink_cache = defaultdict(list)
requests_amount = 0


async def get_links_aggregate(session, page):
    global requests_amount
    if page in link_cache:
        return link_cache[page]

    requests_amount += 1
    pipeline = [
        {"$match": {"source": page}},
        {"$project": {"_id": 0, "target": 1}}
    ]
    cursor = links_collection.aggregate(pipeline)
    links = [doc["target"] async for doc in cursor]
    link_cache[page] = links
    return links


async def get_backlinks_aggregate(session, page):
    global requests_amount
    if page in backlink_cache:
        return backlink_cache[page]

    requests_amount += 1
    pipeline = [
        {"$match": {"target": page}},  # On cherche les documents où la page est en tant que target
        {"$project": {"_id": 0, "source": 1}}  # On ne garde que le champ "source"
    ]
    cursor = links_collection.aggregate(pipeline)
    backlinks = [doc["source"] async for doc in cursor]
    backlink_cache[page] = backlinks
    return backlinks


async def bidirectional_bfs(session, start_page, end_page):
    start_queue = deque([(start_page, [start_page])])
    end_queue = deque([(end_page, [end_page])])
    start_visited = {start_page: [start_page]}
    end_visited = {end_page: [end_page]}

    while start_queue and end_queue:
        # Toujours explorer le niveau entier de start_queue avant de passer à end_queue
        if start_queue:
            current_page, path = start_queue.popleft()
            links = await get_links_aggregate(session, current_page)
            for link in links:
                if link in end_visited:  # Intersection trouvée
                    return path + end_visited[link][::-1]
                if link not in start_visited:
                    new_path = path + [link]
                    start_visited[link] = new_path
                    start_queue.append((link, new_path))

        # Toujours explorer le niveau entier de end_queue après start_queue
        if end_queue:
            current_page, path = end_queue.popleft()
            backlinks = await get_backlinks_aggregate(session, current_page)
            for link in backlinks:
                if link in start_visited:  # Intersection trouvée
                    return start_visited[link] + path[::-1]
                if link not in end_visited:
                    new_path = path + [link]
                    end_visited[link] = new_path
                    end_queue.append((link, new_path))

    return None  # Aucun chemin trouvé


async def get_random_wikipedia_page(session):
    while True:
        # Obtenir une page aléatoire depuis l’API
        url = "https://en.wikipedia.org/w/api.php"
        params = {
            'action': 'query',
            'list': 'random',
            'rnlimit': 1,
            'format': 'json',
            'rnnamespace': 0
        }
        async with session.get(url, params=params) as response:
            data = await response.json()
            title = data['query']['random'][0]['title']

        # Vérifier l'existence dans MongoDB
        result = await pages_collection.find_one({"page": title})
        if result:
            return title
        else:
            return await get_random_wikipedia_page(session)


async def process_path(session, start_page, goal, start_time, paths):
    path = await bidirectional_bfs(session, start_page, goal)
    end_time = asyncio.get_event_loop().time()
    time_taken = end_time - start_time
    if path:
        paths[path[0], path[-1]] = path


def get_shortest_path(paths, start_page, pages):
    # Générer toutes les permutations possibles des pages (sauf la page de départ)
    shortest_path = None
    shortest_length = float('inf')

    # Créer une liste de pages qui inclut la page de départ
    pages = [start_page] + pages

    # Tester toutes les permutations des pages restantes
    for perm in permutations(pages[1:]):
        # Construire le chemin complet avec la permutation
        current_path = [start_page] + list(perm)
        total_path = []
        valid = True

        # Concatenate the paths between the pages in the current permutation
        for i in range(len(current_path) - 1):
            path = paths.get((current_path[i], current_path[i + 1]))
            if path:
                total_path.extend(path[:-1])  # Ajouter tous les éléments sauf le dernier
            else:
                valid = False
                break
        total_path.append(current_path[-1])  # Ajouter le dernier élément

        # Si tous les chemins sont valides et que ce chemin est plus court que les précédents
        if valid and len(total_path) < shortest_length:
            shortest_path = total_path
            shortest_length = len(total_path)

    return shortest_path


async def main():
    paths = {}
    output_json = '--json' in sys.argv
    async with aiohttp.ClientSession() as session:
        start_page = await get_random_wikipedia_page(session)
        goals = [await get_random_wikipedia_page(session) for _ in range(5)]
        # start_page = "Walter Wright Hats"
        # goals = ["Ian Thomas (umpire)", "Wet 'n Wild (brand)", "Frank H. Schwarz", "Yuwengdao Lighthouse", "Utsch"]

        start_time = asyncio.get_event_loop().time()
        tasks = [asyncio.create_task(process_path(session, start_page, goal, start_time, paths)) for goal in goals]
        for goal in goals:
            for goal2 in goals:
                if goal != goal2:
                    tasks.append(asyncio.create_task(process_path(session, goal, goal2, start_time, paths)))
        await asyncio.gather(*tasks)

        # Identifier les pages inaccessibles depuis la page de départ
        unreachable_goals = [goal for goal in goals if (start_page, goal) not in paths]
        new_goals = []
        abandoned_pages = []

        for unreachable in unreachable_goals:
            abandoned_pages.append(unreachable)
            # Trouver une nouvelle page accessible
            new_page = await get_random_wikipedia_page(session)
            while new_page in goals or new_page == start_page:
                new_page = await get_random_wikipedia_page(session)
            new_goals.append(new_page)
            goals.remove(unreachable)
            goals.append(new_page)

            # Supprimer les anciens chemins impliquant l'ancienne page
            paths = {k: v for k, v in paths.items() if unreachable not in k}

            # Recalculer les chemins nécessaires avec la nouvelle page
            await asyncio.gather(
                process_path(session, start_page, new_page, start_time, paths),
                *[process_path(session, new_page, goal, start_time, paths) for goal in goals if goal != new_page],
                *[process_path(session, goal, new_page, start_time, paths) for goal in goals if goal != new_page],
            )

        if output_json:
            total_goals = [start_page] + goals
            print(json.dumps({
                "goals":total_goals
            }))
            return

        total_time = asyncio.get_event_loop().time() - start_time
        start_time = asyncio.get_event_loop().time()
        final_path = get_shortest_path(paths, start_page, goals)
        total_time = asyncio.get_event_loop().time() - start_time


if __name__ == "__main__":
    # running the main coroutine
    asyncio.run(main())
