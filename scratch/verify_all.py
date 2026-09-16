import urllib.request

urls = [
    'http://localhost:8000/',
    'http://localhost:8000/gallery/',
    'http://localhost:8000/journal/',
    'http://localhost:8000/draw/',
    'http://localhost:8000/about/',
    'http://localhost:8000/guestbook/',
]

for url in urls:
    res = urllib.request.urlopen(url)
    assert res.status == 200, f'Failed {url}: {res.status}'
    html = res.read().decode('utf-8')
    assert 'nav-wrapper' in html, f'No nav-wrapper in {url}'
    assert 'nav-actions' in html, f'No nav-actions in {url}'
    assert 'mobile-menu-toggle' in html, f'No mobile-menu-toggle in {url}'
    assert "theme || 'light'" in html, f'Theme default light missing in {url}'
    print(f'Checked {url} -> 200 OK, Nav OK, Theme Light OK')

# Check components.css
comp_css = urllib.request.urlopen('http://localhost:8000/static/css/components.css?v=4.0').read().decode('utf-8')
assert 'popMenuDown' in comp_css, 'popMenuDown missing in components.css'
assert 'border-radius: 9999px;' in comp_css, 'pill styling missing in components.css'
print('components.css verified successfully!')

# Check pages.css
pages_css = urllib.request.urlopen('http://localhost:8000/static/css/pages.css?v=4.0').read().decode('utf-8')
assert '[data-theme="dark"] .polaroid-art-stage' in pages_css, 'polaroid-art-stage dark rule missing'
assert '@media (max-width: 600px)' in pages_css, 'max-width: 600px rule missing'
print('pages.css verified successfully!')

print('\n*** ALL PAGES AND ASSETS VALIDATED SUCCESSFULLY! ***')
