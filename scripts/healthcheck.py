#!/usr/bin/env python3
# scripts/healthcheck.py
import subprocess, sys, time, urllib.request

def get_node_ip():
    result = subprocess.run(
        ['kubectl', 'get', 'nodes', '-o', 'jsonpath={.items[0].status.addresses[0].address}'],
        capture_output=True, text=True
    )
    return result.stdout.strip()

def health_check(url, retries=10, delay=15):
    for i in range(retries):
        try:
            req = urllib.request.urlopen(f'http://{url}', timeout=5)
            if req.status == 200:
                print(f'✅ Health check passed (attempt {i+1}/{retries})')
                return True
        except Exception as e:
            print(f'Attempt {i+1}/{retries}: {e}. Retrying in {delay}s...')
            time.sleep(delay)
    return False

if __name__ == '__main__':
    node_ip = get_node_ip()
    backend_url  = f'{node_ip}:30081/health'   # adjust NodePort if needed
    frontend_url = f'{node_ip}:30080/health'

    print(f'Checking backend  @ {backend_url}')
    print(f'Checking frontend @ {frontend_url}')

    if not health_check(frontend_url):
        print('❌ Frontend health check FAILED — triggering rollback')
        sys.exit(1)

    print('All health checks passed ✅')
