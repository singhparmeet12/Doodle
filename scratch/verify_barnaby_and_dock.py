import urllib.request

# 1. Check home page HTML for Barnaby's eyes and body
html_home = urllib.request.urlopen('http://localhost:8000/').read().decode('utf-8')
assert 'id="hero-pupil-left" cx="65" cy="68" r="4.2" fill="#2B2B2B"' in html_home, 'Pupil left does not have #2B2B2B fill'
assert 'id="hero-pupil-right" cx="95" cy="69" r="4.2" fill="#2B2B2B"' in html_home, 'Pupil right does not have #2B2B2B fill'
assert 'id="hero-barnaby-mouth" d="M73,82 Q80,91 87,82" fill="none" stroke="#2B2B2B"' in html_home, 'Mouth stroke does not have #2B2B2B'
assert 'class="mobile-bottom-dock"' in html_home, 'mobile-bottom-dock missing in home'
print('Home page Barnaby colors and mobile dock verified!')

# 2. Check components.css
css_comp = urllib.request.urlopen('http://localhost:8000/static/css/components.css?v=4.1').read().decode('utf-8')
assert '.mobile-bottom-dock' in css_comp, 'mobile-bottom-dock missing in components.css'
assert '.mobile-dock-btn' in css_comp, 'mobile-dock-btn missing in components.css'
print('components.css mobile dock verified!')

# 3. Check base.css
css_base = urllib.request.urlopen('http://localhost:8000/static/css/base.css?v=4.1').read().decode('utf-8')
assert 'overflow-x: clip;' in css_base, 'overflow-x: clip missing in base.css'
print('base.css mobile scroll verified!')

print('*** ALL CHECKS PASSED PERFECTLY! ***')
