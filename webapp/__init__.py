import pathlib

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

from webapp.infer_sketch import preprocess_imgstring, predict_sketch

app = FastAPI()

current_directory = pathlib.Path(__file__)

app.mount("/static", StaticFiles(directory=current_directory.parent.joinpath('static')), name='static')
templates = Jinja2Templates(directory=str(current_directory.parent.joinpath('templates')))


@app.get('/', response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


class Item(BaseModel):
    data: str


@app.post('/predict', response_class=JSONResponse)
def predict(imgstring: Item):
    image = preprocess_imgstring(imgstring)

    # plt.figure()
    # plt.imshow(np.squeeze(image), cmap='gray')
    # plt.show()

    response = predict_sketch(image, n=5)
    return JSONResponse({"predictions": response})
