#!/usr/bin/env python3
# scripts/notify_slack.py
import sys, json, os, urllib.request

def send_slack(status, pipeline, image_tag=''):
    webhook = os.environ.get('SLACK_WEBHOOK', '')
    if not webhook:
        print('No SLACK_WEBHOOK set, skipping notification')
        return

    build  = os.environ.get('BUILD_NUMBER', 'N/A')
    branch = os.environ.get('GIT_BRANCH', 'N/A')
    emoji  = '✅' if status == 'success' else '❌'
    color  = 'good' if status == 'success' else 'danger'

    payload = {
        'text': f'{emoji} *QuickBite — {pipeline.upper()} Pipeline {status.upper()}*',
        'attachments': [{
            'color': color,
            'fields': [
                {'title': 'Build',     'value': build,      'short': True},
                {'title': 'Branch',    'value': branch,     'short': True},
                {'title': 'Pipeline',  'value': pipeline,   'short': True},
                {'title': 'Image Tag', 'value': image_tag,  'short': True},
            ],
            'footer': 'Jenkins CI/CD',
            'ts': __import__('time').time()
        }]
    }

    data = json.dumps(payload).encode('utf-8')
    req  = urllib.request.Request(webhook, data=data, headers={'Content-Type': 'application/json'})
    try:
        urllib.request.urlopen(req, timeout=5)
        print(f'Slack notification sent: {status}')
    except Exception as e:
        print(f'Failed to send Slack notification: {e}')

if __name__ == '__main__':
    status    = sys.argv[1] if len(sys.argv) > 1 else 'unknown'
    pipeline  = sys.argv[2] if len(sys.argv) > 2 else 'unknown'
    image_tag = sys.argv[3] if len(sys.argv) > 3 else ''
    send_slack(status, pipeline, image_tag)
