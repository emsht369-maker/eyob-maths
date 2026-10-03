# Math Master

25 maths topics, beginner to machine learning, using the 80/20 rule. Open `index.html` and study 1 hour a day.

## Folder tree

```
math-master/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── data.js
    └── app.js
```

## Make the tree in a terminal (then paste the code into each file)

```bash
mkdir -p math-master/css math-master/js
touch math-master/index.html math-master/README.md math-master/css/style.css math-master/js/data.js math-master/js/app.js
code math-master
```

## Test on your computer

```bash
cd math-master
python3 -m http.server 8000
```

Open http://localhost:8000

## Put it on GitHub Pages

1. Create an empty repo on github.com named `math-master`.
2. Run (change YOUR_USERNAME):

```bash
cd math-master
git init
git add .
git commit -m "Math Master site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/math-master.git
git push -u origin main
```

3. GitHub: Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
4. Your site: `https://YOUR_USERNAME.github.io/math-master/`

## Add more questions

Open `js/data.js`. Each topic ends with a list of `[question, answer]`. Add a new pair, save, then:

```bash
git add . && git commit -m "More questions" && git push
```