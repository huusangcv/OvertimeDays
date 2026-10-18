import sys, os
target = sys.argv[1]
os.makedirs(os.path.dirname(os.path.abspath(target)), exist_ok=True)
content = sys.stdin.read()
with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved: ', target, '(', len(content), 'chars )')
