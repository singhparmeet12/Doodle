import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.gallery.models import Doodle
from apps.journal.models import JournalPost
from apps.prompts.models import DoodlePrompt
from apps.guestbook.models import GuestbookEntry
from apps.newsletter.models import NewsletterSubscriber


class Command(BaseCommand):
    help = 'Seeds the Scribbleverse database with whimsical doodles, journal posts, 50+ prompts, and guestbook stickies.'

    def handle(self, *args, **options):
        self.stdout.write("Starting Scribbleverse seeding process...")

        # 1. Seed Doodle Prompts (55 prompts across 5 categories)
        self.stdout.write("Seeding 55 imaginative doodle prompts...")
        DoodlePrompt.objects.all().delete()

        prompts_data = [
            # Creatures & Pets
            ("Draw your dream pet if it were made entirely of fluffy cloud dough.", "creatures", "quick"),
            ("A cat who secretly works as a private investigator in an attic.", "creatures", "playful"),
            ("A friendly dragon who sneezes flower petals instead of fire.", "creatures", "playful"),
            ("A turtle with a tiny rooftop garden and sprinkler on its shell.", "creatures", "quick"),
            ("Draw a dog wearing human boots that are way too big for it.", "creatures", "quick"),
            ("An octopus attempting to assemble flat-pack furniture with all 8 arms.", "creatures", "wild"),
            ("A penguin who dreams of surfing giant tropical tidal waves.", "creatures", "playful"),
            ("A bumblebee carrying an umbrella through a strawberry syrup storm.", "creatures", "quick"),
            ("A chubby toad sitting on a throne made of dandelion fluff.", "creatures", "quick"),
            ("Draw an owl wearing thick reading glasses examining an upside-down map.", "creatures", "playful"),
            ("A sloth caught in a surprisingly high-speed chase on a tricycle.", "creatures", "wild"),

            # Cosmic Doodles
            ("A planet made of rainbow layered birthday cake with sparkler volcanoes.", "space", "wild"),
            ("An astronaut floating in space, gently watering a tiny potted fern.", "space", "playful"),
            ("A sleepy crescent moon pulling a blanket of stars over its eyes.", "space", "quick"),
            ("Draw a constellation that looks suspiciously like a spilled cup of tea.", "space", "quick"),
            ("An alien diner serving glowing interstellar milkshakes and comet donuts.", "space", "wild"),
            ("A satellite that has sprouted vines and blooming space daisies.", "space", "playful"),
            ("Draw the sun putting on giant sunglasses before starting its morning shift.", "space", "quick"),
            ("A shooting star that lost its way and stopped to ask an owl for directions.", "space", "playful"),
            ("A cosmic whale swimming serenely through Saturn's icy rings.", "space", "wild"),
            ("A spaceship powered entirely by rubber bands and unspooled yarn.", "space", "playful"),

            # Everyday Objects with Faces
            ("A slice of toast celebrating with confetti after surviving the toaster.", "everyday", "quick"),
            ("A grumpy alarm clock that hates morning sounds as much as you do.", "everyday", "quick"),
            ("A coffee mug terrified of the spoon approaching it for a stir.", "everyday", "quick"),
            ("A potted cactus trying its hardest to give a gentle hug.", "everyday", "playful"),
            ("A worn-out eraser dreaming about the pencil lines it erased today.", "everyday", "quick"),
            ("A cheerful teapot practicing its whistle opera solo on the stove.", "everyday", "quick"),
            ("A pair of mismatched socks happily reunited after two weeks in the laundry.", "everyday", "playful"),
            ("Draw a pencil whose graphite tip is sharp enough to cut through worry.", "everyday", "quick"),
            ("A backpack bursting with snacks, notebooks, and a sleepy ferret.", "everyday", "playful"),
            ("A flashlight casting shadows of funny monsters against the wall.", "everyday", "playful"),
            ("A stapler pretending it is a fearsome prehistoric crocodile.", "everyday", "quick"),

            # Tiny Adventures & Fantasy
            ("A mouse sailor navigating a stormy puddle inside an oak-leaf boat.", "fantasy", "playful"),
            ("A cozy wizard tower hidden inside an overgrown bell pepper.", "fantasy", "wild"),
            ("A tea party attended entirely by ghosts wearing knitted floral scarves.", "fantasy", "playful"),
            ("Draw a secret treehouse built with twigs, twine, and miniature fairy lights.", "fantasy", "wild"),
            ("A gnome having a serious heated chess match with an arrogant squirrel.", "fantasy", "playful"),
            ("A tiny knight riding a bumblebee into battle against a rogue dandelion.", "fantasy", "wild"),
            ("An apothecary shelf filled with potions that smell like rainy mornings.", "fantasy", "wild"),
            ("A bridge carved out of a single giant pretzel crossing a soup moat.", "fantasy", "playful"),
            ("A mushroom cottage with smoking chimney and postage-stamp welcome mat.", "fantasy", "quick"),
            ("A baby monster looking under the human bed to make sure no adults are there.", "fantasy", "playful"),
            ("A map of an uncharted island shaped like an exclamation point.", "fantasy", "quick"),

            # Wobbly Feelings & Abstract
            ("Draw what 'brain lag' at 3:00 PM looks like in crayon lines.", "abstract", "quick"),
            ("Draw a chaotic tangle of scribbles that slowly untangles into a flower.", "abstract", "playful"),
            ("Draw what silence feels like inside a cardboard box fort.", "abstract", "playful"),
            ("Illustrate the exact texture of drinking cold water when you're parched.", "abstract", "quick"),
            ("A scribble creature carrying an oversized eraser to undo bad thoughts.", "abstract", "quick"),
            ("Draw an explosion of musical notes popping out of a tiny tin can.", "abstract", "quick"),
            ("What does that warm feeling in your chest look like when someone says thank you?", "abstract", "playful"),
            ("A whirlwind of tiny doodles: smiley faces, stars, zig-zags, and dots.", "abstract", "quick"),
            ("Draw your current feeling using only three wiggly continuous lines.", "abstract", "quick"),
            ("A cloud that is slowly unravelling like a sweater with a loose thread.", "abstract", "playful"),
            ("A labyrinth where every dead end has a small treat waiting for you.", "abstract", "wild"),
        ]

        for text, cat, diff in prompts_data:
            DoodlePrompt.objects.create(
                text=text,
                category=cat,
                difficulty=diff,
                times_drawn=random.randint(4, 78)
            )

        # 2. Seed Gallery Doodles with Custom Hand-Crafted SVGs
        self.stdout.write("Seeding 12 gallery doodles with custom vector artworks...")
        Doodle.objects.all().delete()

        # Barnaby Blob SVG
        svg_barnaby_hero = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="wobble1"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="3" /></filter>
  </defs>
  <!-- Blob Body -->
  <path d="M70,140 C50,70 110,40 160,45 C220,50 260,80 250,150 C240,210 200,240 140,235 C80,230 90,190 70,140 Z" fill="#FFD93D" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#wobble1)"/>
  <!-- Rosy Cheeks -->
  <ellipse cx="105" cy="140" rx="14" ry="9" fill="#FF6B6B" opacity="0.6"/>
  <ellipse cx="205" cy="142" rx="14" ry="9" fill="#FF6B6B" opacity="0.6"/>
  <!-- Eyes -->
  <circle cx="120" cy="120" r="7" fill="#2B2B2B"/>
  <circle cx="123" cy="117" r="2.5" fill="#FFF9F0"/>
  <circle cx="190" cy="122" r="7" fill="#2B2B2B"/>
  <circle cx="193" cy="119" r="2.5" fill="#FFF9F0"/>
  <!-- Smile -->
  <path d="M140,145 Q155,160 170,145" fill="none" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <!-- Crayon in Hand -->
  <path d="M225,160 L275,120 L285,130 L235,170 Z" fill="#FF6B6B" stroke="#2B2B2B" stroke-width="3"/>
  <polygon points="275,120 295,110 285,130" fill="#FF6B6B" stroke="#2B2B2B" stroke-width="2"/>
  <!-- Sparkles -->
  <path d="M50,80 L55,70 L60,80 L70,85 L60,90 L55,100 L50,90 L40,85 Z" fill="#6BCBFF" stroke="#2B2B2B" stroke-width="2"/>
  <path d="M260,60 L264,52 L268,60 L276,64 L268,68 L264,76 L260,68 L252,64 Z" fill="#6BCB77" stroke="#2B2B2B" stroke-width="2"/>
</svg>'''

        # Pip the Bird SVG
        svg_pip = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- Body -->
  <ellipse cx="140" cy="140" rx="65" ry="50" fill="#6BCBFF" stroke="#2B2B2B" stroke-width="4"/>
  <!-- Wing -->
  <path d="M120,135 C90,145 80,180 125,165 C145,160 155,145 120,135 Z" fill="#FF6B6B" stroke="#2B2B2B" stroke-width="3"/>
  <!-- Pencil Beak -->
  <polygon points="195,130 265,140 195,150" fill="#FFD93D" stroke="#2B2B2B" stroke-width="3"/>
  <polygon points="250,138 265,140 250,142" fill="#2B2B2B"/>
  <!-- Eye -->
  <circle cx="170" cy="125" r="9" fill="#FFF9F0" stroke="#2B2B2B" stroke-width="3"/>
  <circle cx="173" cy="125" r="4.5" fill="#2B2B2B"/>
  <!-- Crest Feather -->
  <path d="M125,95 Q135,65 155,75 Q140,85 138,95" fill="#FFD93D" stroke="#2B2B2B" stroke-width="3"/>
  <!-- Tiny Feet -->
  <path d="M125,190 L120,215 M115,215 L130,215" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <path d="M155,190 L155,215 M148,215 L163,215" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <!-- Scribble Trail -->
  <path d="M265,140 Q290,160 270,185 T295,210" fill="none" stroke="#6BCB77" stroke-width="3" stroke-dasharray="6,4"/>
</svg>'''

        # Sir Reginald Cloud SVG
        svg_cloud = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- Puffy Cloud Body -->
  <path d="M70,170 C40,165 40,115 80,110 C85,65 145,60 170,90 C200,65 255,80 250,125 C285,135 275,185 240,185 C220,195 100,195 70,170 Z" fill="#FFF9F0" stroke="#2B2B2B" stroke-width="4" stroke-linejoin="round"/>
  <!-- Top Hat -->
  <rect x="135" y="45" width="45" height="40" rx="3" fill="#2B2B2B"/>
  <line x1="120" y1="85" x2="195" y2="85" stroke="#2B2B2B" stroke-width="5" stroke-linecap="round"/>
  <rect x="135" y="70" width="45" height="8" fill="#FF6B6B"/>
  <!-- Monocle -->
  <circle cx="185" cy="130" r="14" fill="none" stroke="#FFD93D" stroke-width="4"/>
  <line x1="195" y1="140" x2="210" y2="165" stroke="#FFD93D" stroke-width="2"/>
  <circle cx="185" cy="130" r="4" fill="#2B2B2B"/>
  <circle cx="135" cy="130" r="4" fill="#2B2B2B"/>
  <!-- Fancy Mustache -->
  <path d="M145,150 Q160,140 160,155 Q160,140 175,150" fill="none" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <!-- Raindrop Polka Dots -->
  <circle cx="95" cy="225" r="6" fill="#6BCBFF"/>
  <circle cx="150" cy="240" r="7" fill="#6BCBFF"/>
  <circle cx="215" cy="220" r="5" fill="#6BCBFF"/>
</svg>'''

        # Inky the Octopus SVG
        svg_inky = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- Head -->
  <path d="M90,130 C90,65 230,65 230,130 C230,150 200,165 160,165 C120,165 90,150 90,130 Z" fill="#A06BFF" stroke="#2B2B2B" stroke-width="4"/>
  <!-- Eyes -->
  <ellipse cx="130" cy="120" rx="9" ry="12" fill="#FFF9F0" stroke="#2B2B2B" stroke-width="3"/>
  <circle cx="133" cy="120" r="5" fill="#2B2B2B"/>
  <ellipse cx="190" cy="120" rx="9" ry="12" fill="#FFF9F0" stroke="#2B2B2B" stroke-width="3"/>
  <circle cx="193" cy="120" r="5" fill="#2B2B2B"/>
  <!-- Tentacles Juggling Crayons -->
  <path d="M100,155 Q80,210 110,230" fill="none" stroke="#A06BFF" stroke-width="12" stroke-linecap="round"/>
  <path d="M100,155 Q80,210 110,230" fill="none" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <path d="M130,160 Q120,225 150,235" fill="none" stroke="#A06BFF" stroke-width="12" stroke-linecap="round"/>
  <path d="M130,160 Q120,225 150,235" fill="none" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <path d="M185,160 Q200,225 170,235" fill="none" stroke="#A06BFF" stroke-width="12" stroke-linecap="round"/>
  <path d="M185,160 Q200,225 170,235" fill="none" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <path d="M220,155 Q240,210 210,230" fill="none" stroke="#A06BFF" stroke-width="12" stroke-linecap="round"/>
  <path d="M220,155 Q240,210 210,230" fill="none" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <!-- Floating Crayons -->
  <rect x="60" y="70" width="12" height="35" rx="3" transform="rotate(-25 60 70)" fill="#FF6B6B" stroke="#2B2B2B" stroke-width="2"/>
  <rect x="235" y="60" width="12" height="35" rx="3" transform="rotate(30 235 60)" fill="#FFD93D" stroke="#2B2B2B" stroke-width="2"/>
  <rect x="150" y="30" width="12" height="35" rx="3" transform="rotate(10 150 30)" fill="#6BCB77" stroke="#2B2B2B" stroke-width="2"/>
</svg>'''

        # Cosmic Scribble Planet SVG
        svg_cosmic = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- Planet Body -->
  <circle cx="160" cy="140" r="60" fill="#FF6B6B" stroke="#2B2B2B" stroke-width="4"/>
  <!-- Planet Rings -->
  <ellipse cx="160" cy="140" rx="110" ry="26" fill="none" stroke="#FFD93D" stroke-width="8" transform="rotate(-18 160 140)"/>
  <ellipse cx="160" cy="140" rx="110" ry="26" fill="none" stroke="#2B2B2B" stroke-width="3" transform="rotate(-18 160 140)"/>
  <!-- Face -->
  <circle cx="140" cy="130" r="5" fill="#FFF9F0"/>
  <circle cx="180" cy="130" r="5" fill="#FFF9F0"/>
  <path d="M152,145 Q160,154 168,145" fill="none" stroke="#FFF9F0" stroke-width="3" stroke-linecap="round"/>
  <!-- Stars -->
  <polygon points="70,60 74,72 86,72 76,80 80,92 70,84 60,92 64,80 54,72 66,72" fill="#FFD93D" stroke="#2B2B2B" stroke-width="2"/>
  <polygon points="250,180 253,190 263,190 255,196 258,206 250,200 242,206 245,196 237,190 247,190" fill="#6BCBFF" stroke="#2B2B2B" stroke-width="2"/>
</svg>'''

        # Coffee Golem SVG
        svg_coffee = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- Mug Body -->
  <path d="M100,100 L210,100 L200,210 Q155,225 110,210 Z" fill="#6BCB77" stroke="#2B2B2B" stroke-width="4" stroke-linejoin="round"/>
  <!-- Handle -->
  <path d="M205,120 C245,120 245,180 200,180" fill="none" stroke="#6BCB77" stroke-width="14" stroke-linecap="round"/>
  <path d="M205,120 C245,120 245,180 200,180" fill="none" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <!-- Face -->
  <circle cx="135" cy="145" r="5" fill="#2B2B2B"/>
  <circle cx="175" cy="145" r="5" fill="#2B2B2B"/>
  <ellipse cx="125" cy="160" rx="8" ry="5" fill="#FF6B6B" opacity="0.6"/>
  <ellipse cx="185" cy="160" rx="8" ry="5" fill="#FF6B6B" opacity="0.6"/>
  <path d="M150,165 Q155,158 160,165" fill="none" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>
  <!-- Swirling Steam -->
  <path d="M130,85 Q120,55 140,40 T150,15" fill="none" stroke="#FF6B6B" stroke-width="3" stroke-linecap="round" stroke-dasharray="4,4"/>
  <path d="M170,85 Q185,60 170,45 T180,20" fill="none" stroke="#FFD93D" stroke-width="3" stroke-linecap="round" stroke-dasharray="4,4"/>
</svg>'''

        # Snail on Skateboard SVG
        svg_snail = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- Snail Shell Spiral -->
  <circle cx="140" cy="120" r="45" fill="#FFD93D" stroke="#2B2B2B" stroke-width="4"/>
  <path d="M140,120 m-30,0 a30,30 0 1,0 60,0 a20,20 0 1,0 -40,0 a10,10 0 1,0 20,0" fill="none" stroke="#FF6B6B" stroke-width="4"/>
  <!-- Snail Body -->
  <path d="M70,175 C95,150 180,150 240,165 Q250,168 245,175 L80,180 Z" fill="#6BCB77" stroke="#2B2B2B" stroke-width="4"/>
  <!-- Eyestalks -->
  <line x1="225" y1="165" x2="235" y2="125" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <circle cx="235" cy="122" r="7" fill="#FFF9F0" stroke="#2B2B2B" stroke-width="3"/>
  <circle cx="236" cy="122" r="3" fill="#2B2B2B"/>
  <line x1="215" y1="165" x2="215" y2="130" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <circle cx="215" cy="127" r="7" fill="#FFF9F0" stroke="#2B2B2B" stroke-width="3"/>
  <circle cx="216" cy="127" r="3" fill="#2B2B2B"/>
  <!-- Skateboard -->
  <rect x="60" y="185" width="200" height="12" rx="6" fill="#FF6B6B" stroke="#2B2B2B" stroke-width="3"/>
  <circle cx="95" cy="210" r="14" fill="#6BCBFF" stroke="#2B2B2B" stroke-width="3"/>
  <circle cx="225" cy="210" r="14" fill="#6BCBFF" stroke="#2B2B2B" stroke-width="3"/>
  <!-- Speed Lines -->
  <line x1="30" y1="170" x2="50" y2="170" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>
  <line x1="20" y1="190" x2="45" y2="190" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>
</svg>'''

        # Barnaby on the Moon SVG
        svg_night_barnaby = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- Crescent Moon Base -->
  <path d="M180,40 C100,50 60,130 90,210 C50,150 90,70 180,40 Z" fill="#FFD93D" stroke="#2B2B2B" stroke-width="4"/>
  <!-- Barnaby Sitting on Moon Curve -->
  <path d="M125,120 C110,80 145,70 170,75 C205,80 215,110 200,145 C190,165 155,170 135,160 Z" fill="#FFF9F0" stroke="#2B2B2B" stroke-width="4"/>
  <!-- Sleepy Cap -->
  <polygon points="150,73 190,30 175,76" fill="#A06BFF" stroke="#2B2B2B" stroke-width="3"/>
  <circle cx="190" cy="30" r="6" fill="#FFD93D"/>
  <!-- Sleeping Eyes -->
  <path d="M150,115 Q160,123 170,115" fill="none" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>
  <path d="M178,115 Q188,123 198,115" fill="none" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>
  <!-- Zzz letters -->
  <text x="215" y="80" font-family="'Patrick Hand', cursive" font-size="20" fill="#6BCBFF">Z</text>
  <text x="235" y="65" font-family="'Patrick Hand', cursive" font-size="28" fill="#6BCBFF">Z</text>
</svg>'''

        # Origami Dino SVG
        svg_dino = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- Geometric Origami Segments -->
  <polygon points="120,80 180,60 170,110" fill="#6BCB77" stroke="#2B2B2B" stroke-width="3"/>
  <polygon points="170,110 230,85 240,130" fill="#FFD93D" stroke="#2B2B2B" stroke-width="3"/>
  <polygon points="120,80 170,110 130,170" fill="#6BCBFF" stroke="#2B2B2B" stroke-width="3"/>
  <polygon points="130,170 170,110 210,180" fill="#FF6B6B" stroke="#2B2B2B" stroke-width="3"/>
  <polygon points="210,180 240,130 270,160" fill="#A06BFF" stroke="#2B2B2B" stroke-width="3"/>
  <!-- Tiny Tail -->
  <polygon points="80,140 120,80 130,170" fill="#FFD93D" stroke="#2B2B2B" stroke-width="3"/>
  <!-- Stompy Legs -->
  <polygon points="130,170 140,230 160,230 150,170" fill="#2B2B2B"/>
  <polygon points="180,175 190,230 210,230 200,175" fill="#2B2B2B"/>
  <!-- Cute Googly Eye on Origami -->
  <circle cx="215" cy="100" r="6" fill="#FFF9F0" stroke="#2B2B2B" stroke-width="2"/>
  <circle cx="217" cy="100" r="3" fill="#2B2B2B"/>
</svg>'''

        # Walking House SVG
        svg_house = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- House Roof -->
  <polygon points="90,120 160,50 230,120" fill="#FF6B6B" stroke="#2B2B2B" stroke-width="4"/>
  <!-- Chimney with Heart Puff -->
  <rect x="180" y="55" width="22" height="35" fill="#FFD93D" stroke="#2B2B2B" stroke-width="3"/>
  <path d="M195,45 Q205,35 215,45 Q225,35 235,45 Q215,70 195,45 Z" fill="#FF6B6B" opacity="0.8"/>
  <!-- Walls -->
  <rect x="105" y="120" width="110" height="85" fill="#FFF9F0" stroke="#2B2B2B" stroke-width="4"/>
  <!-- Door -->
  <rect x="140" y="150" width="35" height="55" rx="10" fill="#6BCBFF" stroke="#2B2B2B" stroke-width="3"/>
  <circle cx="148" cy="180" r="3" fill="#2B2B2B"/>
  <!-- Window -->
  <circle cx="160" cy="95" r="14" fill="#FFD93D" stroke="#2B2B2B" stroke-width="3"/>
  <line x1="146" y1="95" x2="174" y2="95" stroke="#2B2B2B" stroke-width="2"/>
  <line x1="160" y1="81" x2="160" y2="109" stroke="#2B2B2B" stroke-width="2"/>
  <!-- Chicken Legs -->
  <path d="M125,205 L115,245 M105,250 L125,245 M115,245 L130,250" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <path d="M190,205 L200,245 M190,250 L200,245 M200,245 L215,250" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
</svg>'''

        # Moth with Flashlight SVG
        svg_moth = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- Fuzzy Body -->
  <ellipse cx="160" cy="145" rx="16" ry="40" fill="#2B2B2B"/>
  <!-- Wings -->
  <path d="M150,130 C80,80 60,160 145,155 Z" fill="#FFD93D" stroke="#2B2B2B" stroke-width="4"/>
  <path d="M170,130 C240,80 260,160 175,155 Z" fill="#FFD93D" stroke="#2B2B2B" stroke-width="4"/>
  <!-- Wing spots -->
  <circle cx="110" cy="130" r="10" fill="#FF6B6B"/>
  <circle cx="210" cy="130" r="10" fill="#FF6B6B"/>
  <!-- Antennae -->
  <path d="M155,108 Q140,80 120,85" fill="none" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>
  <path d="M165,108 Q180,80 200,85" fill="none" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>
  <!-- Flashlight beam -->
  <polygon points="160,160 90,240 230,240" fill="#FFF9F0" opacity="0.4"/>
  <rect x="152" y="160" width="16" height="26" rx="3" fill="#6BCBFF" stroke="#2B2B2B" stroke-width="2"/>
</svg>'''

        # Toast Celebration SVG
        svg_toast = '''<svg viewBox="0 0 320 280" class="doodle-vector" xmlns="http://www.w3.org/2000/svg">
  <!-- Toast Slice -->
  <path d="M100,100 C100,70 135,70 160,75 C185,70 220,70 220,100 L215,200 C215,215 105,215 105,200 Z" fill="#FFD93D" stroke="#2B2B2B" stroke-width="4" stroke-linejoin="round"/>
  <!-- Butter Square -->
  <rect x="140" y="115" width="38" height="30" rx="4" fill="#FFF9F0" stroke="#2B2B2B" stroke-width="3"/>
  <!-- Happy Face -->
  <circle cx="130" cy="155" r="5" fill="#2B2B2B"/>
  <circle cx="190" cy="155" r="5" fill="#2B2B2B"/>
  <path d="M150,170 Q160,185 170,170" fill="none" stroke="#2B2B2B" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="120" cy="165" rx="8" ry="5" fill="#FF6B6B" opacity="0.6"/>
  <ellipse cx="200" cy="165" rx="8" ry="5" fill="#FF6B6B" opacity="0.6"/>
  <!-- Confetti Ribbons -->
  <path d="M70,80 Q85,60 75,40" fill="none" stroke="#6BCBFF" stroke-width="4" stroke-linecap="round"/>
  <path d="M240,80 Q255,60 245,40" fill="none" stroke="#6BCB77" stroke-width="4" stroke-linecap="round"/>
  <circle cx="80" cy="130" r="5" fill="#FF6B6B"/>
  <circle cx="240" cy="140" r="6" fill="#A06BFF"/>
</svg>'''

        gallery_entries = [
            {
                "title": "Barnaby's First Day in the Margins",
                "caption": "Born during an overly serious biology lecture on page 42 of a spiral notebook.",
                "character_tag": "barnaby",
                "svg_content": svg_barnaby_hero,
                "is_featured": True,
                "tilt_deg": -3,
            },
            {
                "title": "Pip Testing a 2B Graphite Tip",
                "caption": "Pip refuses to fly until his beak has been sharpened to a crisp 30-degree angle.",
                "character_tag": "pip",
                "svg_content": svg_pip,
                "is_featured": True,
                "tilt_deg": 2,
            },
            {
                "title": "Sir Reginald's Afternoon Downpour",
                "caption": "Strictly rains polka dots on Tuesdays between 3:00 PM and teatime.",
                "character_tag": "cloudia",
                "svg_content": svg_cloud,
                "is_featured": True,
                "tilt_deg": -4,
            },
            {
                "title": "Inky's 8-Crayon Color Theory",
                "caption": "Inky argues that purple and mustard yellow solve 92% of all artistic dilemmas.",
                "character_tag": "inky",
                "svg_content": svg_inky,
                "is_featured": True,
                "tilt_deg": 3,
            },
            {
                "title": "Planet Sprinkle Ring Orbit",
                "caption": "Discovered near the edge of the sketchbook galaxy. Gravity tastes faintly of vanilla.",
                "character_tag": "cosmic",
                "svg_content": svg_cosmic,
                "is_featured": True,
                "tilt_deg": -2,
            },
            {
                "title": "The Over-Caffeinated Mug Golem",
                "caption": "Legend says if you take away his espresso, he dissolves into a sad puddle of decaf.",
                "character_tag": "daily",
                "svg_content": svg_coffee,
                "is_featured": True,
                "tilt_deg": 4,
            },
            {
                "title": "Turbo Snail with Board Control",
                "caption": "0 to 60 inches per fortnight. He never pushes mongo.",
                "character_tag": "daily",
                "svg_content": svg_snail,
                "is_featured": False,
                "tilt_deg": -3,
            },
            {
                "title": "Barnaby's Midnight Chalkboard Sketch",
                "caption": "When the studio lights click off, Barnaby stays up drawing shooting stars.",
                "character_tag": "barnaby",
                "svg_content": svg_night_barnaby,
                "is_featured": True,
                "tilt_deg": 2,
            },
            {
                "title": "Sir Reginald's Origami Dinosaur Friend",
                "caption": "Folds gently under pressure, but roars with unbridled paper passion.",
                "character_tag": "daily",
                "svg_content": svg_dino,
                "is_featured": False,
                "tilt_deg": -2,
            },
            {
                "title": "The Cottage That Went for a Morning Stroll",
                "caption": "Tired of living on the same hillside, so it sprouted legs and headed toward the sea.",
                "character_tag": "daily",
                "svg_content": svg_house,
                "is_featured": False,
                "tilt_deg": 3,
            },
            {
                "title": "Midnight Moth Seeking Ideas",
                "caption": "Looking for the warmest, brightest lightbulbs of creative inspiration.",
                "character_tag": "daily",
                "svg_content": svg_moth,
                "is_featured": False,
                "tilt_deg": -4,
            },
            {
                "title": "Toast Celebrating Survival",
                "caption": "Surviving level 4 toaster heat without burning is cause for serious jam confetti.",
                "character_tag": "daily",
                "svg_content": svg_toast,
                "is_featured": False,
                "tilt_deg": 1,
            },
        ]

        for item in gallery_entries:
            Doodle.objects.create(**item)

        # 3. Seed Journal Posts
        self.stdout.write("Seeding 4 whimsical diary posts...")
        JournalPost.objects.all().delete()

        journal_entries = [
            {
                "title": "How Barnaby Escaped Page 42 of My Chemistry Notes",
                "excerpt": "It was a Tuesday afternoon, and chemical equilibrium was proving far too orderly. So a blob with two uneven dot eyes made a run for the margin.",
                "body": """<p>Most sensible people use their notebook margins for page numbers, or perhaps a polite asterisk denoting an exam tip. I, on the other hand, had spent forty-five minutes watching a teacher write equations on a green chalkboard until my hand rebelled.</p>
                <p>My mechanical pencil hesitated at the bottom right corner of page 42. One wobbly circular arc formed. Then another. A tiny bump on the right side became a hand; a tiny cylinder became a wax crayon. Before the lecture concluded, Barnaby was staring back at me with unblinking curiosity.</p>
                <blockquote>"Wobbly lines are not mistakes — they are just drawings that decided to take the scenic route."</blockquote>
                <p>That day sparked what we now call <strong>Scribbleverse</strong>. A quiet realization that perfection in illustration is stiff, whereas a slightly crooked smile on a blob creature has genuine heartbeat.</p>
                <p>If you're reading this while procrastinating on something important, pick up a marker right now. Don't plan it. Just let the ink hit the paper and see who shows up to say hello.</p>""",
                "mood": "Crayon Rebellious 🖍️",
                "read_time": "3 min diary read",
                "svg_cover": svg_barnaby_hero,
            },
            {
                "title": "The Great Wax Crayon Meltdown of July",
                "excerpt": "What happens when you leave a box of 64 wax crayons in a sunlit windowsill? An accidental masterpiece of blended marbling.",
                "body": """<p>Every artist has experienced a studio catastrophe that unexpectedly became a breakthrough. Last summer, I left a vintage tin of crayons right on the wooden windowsill facing west at 2:00 PM.</p>
                <p>By 5:00 PM, Cerulean Blue had shaken hands with Burnt Sienna, and Sunshine Yellow had decided to form an unincorporated commonwealth with Carnation Pink. At first, I gasped in absolute horror. My favorite vintage tin!</p>
                <p>Then I took a piece of heavy rag paper and pressed it directly into the molten waxy swirl. The result was breathtaking: organic marble waves, crayon wax textures that no digital brush preset could ever replicate with authenticity.</p>
                <p>That accidental swirl became the blueprint for our entire palette system here at Scribbleverse: vibrant, tactile, unapologetically saturated, and smelling faintly of paraffin wax and summer.</p>""",
                "mood": "Melted & Inspired ☀️",
                "read_time": "4 min diary read",
                "svg_cover": svg_inky,
            },
            {
                "title": "Why Straight Lines Make Me Nervous",
                "excerpt": "A short defense of the crooked, the uneven, and the slightly lopsided sketch in a world obsessed with pixel grids.",
                "body": """<p>We live inside a grid of crisp, cold rectangles. Our monitors are rectangles. Our apps are grids of 8-pixel intervals. Our spreadsheets calculate our lives into neat columns.</p>
                <p>When you draw a straight line with a ruler, the machine takes credit. But when you draw a line with your bare hand and it wobbles because your heart was beating, or because you chuckled midway through, that line carries your actual biological signature.</p>
                <p>In Scribbleverse, you will never find a clean 90-degree rectangle or an unblemished machine stroke. Every card has a wobbly radius, every button looks like someone cut it out of construction paper with safety scissors, and every character was born from an unedited doodle.</p>
                <p>Embrace the wobble. It’s proof that you’re alive.</p>""",
                "mood": "Philosophical Scribbler ☕",
                "read_time": "2 min diary read",
                "svg_cover": svg_cloud,
            },
            {
                "title": "Field Notes: Pip's Search for the Perfect 4B Pencil",
                "excerpt": "Pip the Pencil Bird has very strong opinions regarding graphite hardness. Here is what we learned after testing 14 Japanese sketch pencils.",
                "body": """<p>Pip refuses to work with anything harder than a 2B. "An H pencil," Pip remarked (via a series of high-pitched chirps and frantic head nods), "is like trying to skate on concrete with dry needles."</p>
                <p>So yesterday we staged an official test across three different sketchbooks:</p>
                <ul>
                  <li><strong>HB:</strong> Reliable, utilitarian, but lacks theatrical drama.</li>
                  <li><strong>2B:</strong> The everyday champion. Buttery smooth, dark enough to scan without contrast gymnastics.</li>
                  <li><strong>4B:</strong> Rich, velvety, smudges like a secret in a spy movie. Pip's personal favorite.</li>
                  <li><strong>6B:</strong> Pure charcoal madness. One careless sneeze and your entire arm is covered in graphite powder.</li>
                </ul>
                <p>Verdict: Keep a soft pencil near your desk at all times. A dark, soft line forgives your hesitation and rewards your boldness.</p>""",
                "mood": "Graphite Covered ✏️",
                "read_time": "3 min diary read",
                "svg_cover": svg_pip,
            },
        ]

        for entry in journal_entries:
            JournalPost.objects.create(**entry)

        # 4. Seed Guestbook Sticky Notes
        self.stdout.write("Seeding 6 approved starter guestbook stickies...")
        GuestbookEntry.objects.all().delete()

        stickies_data = [
            ("Milo the Skater", "Barnaby is officially my spiritual animal. Currently doodling him on my grip tape!", "blob", "yellow", 3, True),
            ("Clara Papercraft", "This website genuinely brought tears of joy to my eyes. Feels like stepping into an indie picture book.", "rainbow", "coral", -4, True),
            ("Dr. Wobbly Lines", "Prescription for creative block: draw an octopus juggling crayons for 5 minutes straight.", "crayon", "blue", 2, True),
            ("Sora & Tea", "Finding this place at 2 AM was like finding a secret pillow fort on the internet. Love from Tokyo! 🌸", "star", "green", -2, True),
            ("Captain HB", "Pip the Pencil bird needs his own comic series immediately. I would subscribe to 100 issues.", "coffee", "purple", 4, True),
            ("Lily (Age 9 & Dad)", "We tried the Draw With Me pad and drew a 3-legged giraffe wearing sunglasses. Best site ever!", "rainbow", "yellow", -3, True),
        ]

        for name, msg, mood, col, tilt, app in stickies_data:
            entry = GuestbookEntry.objects.create(
                name=name,
                message=msg,
                mood=mood,
                paper_color=col,
                tilt_deg=tilt,
                is_approved=app,
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded Scribbleverse with doodles, prompts, journal posts, and guestbook stickies!"))
