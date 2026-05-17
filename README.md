# Science Bee Quiz App

A starter browser quiz app built from the uploaded `Science Bee All Questions.pdf`.

## Run it

Because the app loads `questions.json`, run it through a local server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Files

- `index.html` - app layout
- `styles.css` - styling
- `app.js` - quiz logic and answer checking
- `questions.json` - parsed question bank
- `parse_questions.py` - parser used to extract questions from the PDF text
- `questions.txt` - extracted PDF text

## Notes

The answer checker is intentionally flexible. It accepts exact matches and close containment matches against the answer aliases parsed from common Science Bee answer syntax, such as `accept ...` and `or ...`.
