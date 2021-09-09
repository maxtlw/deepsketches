import base64
import io
import json
import os
import pathlib
import re

import numpy as np
import tensorflow as tf
from PIL import Image

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"       # It doesn't make sense predicting single instances on GPU

current_path = pathlib.Path('').parent
inference_pars_path = current_path.joinpath('inference_pars.json')
model_path = current_path.joinpath('deepsketches_model')

with open(inference_pars_path) as infile:
    inference_pars = json.load(infile)
classes_dict = inference_pars['classes_dict']
img_size = inference_pars['img_size']

model = tf.keras.models.load_model(model_path)


def preprocess_imgstring(imgstring):
    # Needed since for some reason otherwise we get 'incorrect padding', see
    # https://stackoverflow.com/questions/2941995/python-ignore-incorrect-padding-error-when-base64-decoding
    image_data = re.sub(r'^data:image/.+;base64,', r'', imgstring.data)
    decoded_string = base64.urlsafe_b64decode(image_data)

    image = Image.open(io.BytesIO(decoded_string), 'r').resize((img_size, img_size))
    image = np.array(image)[:, :, 3]
    image = image / 255.
    image = np.expand_dims(image, [0, -1])

    return image


def predict_sketch(image, n: int = 5):
    prediction_logits = model(image)
    prediction_probas = tf.nn.softmax(prediction_logits)
    prediction_probas = prediction_probas.numpy()[0, :].tolist()

    idx_ordered_by_probas = sorted(range(len(prediction_probas)), key=lambda x: prediction_probas[x], reverse=True)
    best_indexes = idx_ordered_by_probas[:n]

    best_probas = [prediction_probas[i] for i in best_indexes]
    best_classes = [classes_dict[str(i)] for i in best_indexes]

    return {k: f'{v:.2f}' for k, v in zip(best_classes, best_probas)}
