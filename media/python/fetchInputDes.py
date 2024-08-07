import sys
import subprocess

# scrapping input description

installSuccessfull = True

try:
  __import__('cfscrape')
except ImportError:
    try:
      subprocess.run([sys.executable, '-m', 'pip', 'install', 'cfscrape'], check=True)
      __import__('cfscrape')
    except subprocess.CalledProcessError as e:
        installSuccessfull = False
        print("Error installing cfscrape")


if installSuccessfull:
  import cfscrape
try:
    scraper = cfscrape.create_scraper()
    codeLink = sys.argv[1]
    fullHtml = scraper.get(codeLink).content
    mainContent = fullHtml.split(b'<div class="section-title">Input</div>')[1].split(b'<div class="section-title">Output</div>')[0]
    print(mainContent)
except Exception as e:
    print(f"An error occurred: {e}")