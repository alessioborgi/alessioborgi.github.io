#!/usr/bin/env python3
import sys
import json
import requests

def main():
    if len(sys.argv) < 3:
        print("usage: fetch_github_stats.py <username> <token>", file=sys.stderr)
        sys.exit(1)

    username = sys.argv[1]
    token = sys.argv[2]

    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}"
    }

    # 1) user info
    user = requests.get(f"https://api.github.com/users/{username}", headers=headers).json()

    # 2) all repos (paginate)
    repos = []
    page = 1
    while True:
      r = requests.get(
          f"https://api.github.com/users/{username}/repos",
          headers=headers,
          params={"per_page": 100, "page": page, "type": "owner", "sort": "updated"}
      )
      data = r.json()
      if not data:
          break
      repos.extend(data)
      page += 1

    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)
    public_repos = user.get("public_repos", len(repos))
    followers = user.get("followers", 0)

    out = {
        "username": username,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "public_repos": public_repos,
        "followers": followers,
    }

    print(json.dumps(out, indent=2))

if __name__ == "__main__":
    main()
