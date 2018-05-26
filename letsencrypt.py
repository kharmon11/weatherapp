from flask import Flask
from flask import Response

app = Flask(__name__)
app.config['DEBUG'] = True

credentials = {
    'lobq2J4LfHW9QOvLMjSZvyTfMQDS5YLvtu9Cwz_FdQs': 'lobq2J4LfHW9QOvLMjSZvyTfMQDS5YLvtu9Cwz_FdQs.9YZjj1DdVYZYTDE8QuB3FJERyynkmZz5tSVwicFt2TI'
}

# credentials = {
#     'HIYhFjSe-lsIiE-NXICLyGUJ1t0i49l_qmxNgI9Escw': 'HIYhFjSe-lsIiE-NXICLyGUJ1t0i49l_qmxNgI9Escw.ihJoBpXQunhCLoi9xariZdOQME-wxdEkUFK1EXckUlY'
# }


@app.route('/.well-known/acme-challenge/<challenge>')
def letsencrypt(challenge):
    return Response(credentials[challenge], mimetype='text/plain')
