var mousePos = {'x': 0, 'y': 0};
canvasObject = document.getElementById('canvas');
const ctx = canvasObject.getContext('2d', { alpha: true });
canvasObject.addEventListener('mouseenter', (e) => setPosition(e));
canvasObject.addEventListener('mousedown', (e) => setPosition(e));
canvasObject.addEventListener('mousemove', (e) => draw(e));

eraseButtonObject = document.getElementById('erase');
eraseButtonObject.addEventListener('click', erase);

resetProbas();

var hold = true;
function poll() {
    setTimeout(() => {
        poll();
    }, 1000);
    if (hold) return;
    hold = true;
    predictImage();
}
poll();

function createProbaValue(value) {
    probaValue = document.createElement('label');
    probaValue.classList.add('proba-text');
    probaValue.classList.add('proba-value');
    probaValue.style.color = `hsl(15, 100%, ${70 - 50*value}%)`;
    probaValue.classList.add('mx-2');
    probaValue.innerHTML = `${value}`;

    return probaValue;
}

function createProbaLabel(label, value) {
    probaLabel = document.createElement('label');
    probaLabel.classList.add('proba-text');
    probaLabel.classList.add('proba-value');
    probaLabel.style.color = `hsl(15, 0%, ${70 - 50*value}%)`;
    probaLabel.classList.add('mx-2');
    probaLabel.innerHTML = `${label}`;

    return probaLabel;
}

function fillProbas(probasJson) {
    const probasListObject = document.getElementById('probas_list');
    probasListObject.innerHTML = '';
    for (const [key, value] of Object.entries(probasJson)) {
        const probaLine = document.createElement('div');
        probaLine.classList.add('proba-container');

        probaValue = createProbaValue(value);
        probaLabel = createProbaLabel(key, value);

        probaLine.appendChild(probaValue);
        probaLine.appendChild(probaLabel);
        probasListObject.appendChild(probaLine);
    }
}

function resetProbas() {
    const probasListObject = document.getElementById('probas_list');
    probasListObject.classList.add('proba-text');
    probasListObject.innerHTML = 'Sketch something! 😛';
}

function eraseCanvas() {
    ctx.clearRect(0, 0, canvasObject.width, canvasObject.height);
    hold = true;
}

function erase() {
    eraseCanvas();
    resetProbas();
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function setPosition(e) {
    mousePos = getMousePos(canvasObject, e);
}

function predictImage() {
    const image = canvasObject.toDataURL();
    const params = {
        headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({'data': image}),
        method: 'POST'
    };
    fetch('predict', params).then(
        (response) => {
            response.json().then(
                (response_data) => {
                    fillProbas(response_data['predictions']);
                }
            )
        }
    )
}

function draw(e) {
    if (e.buttons != 1) return;

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111111';

    ctx.moveTo(mousePos.x, mousePos.y); // from
    setPosition(e);
    ctx.lineTo(mousePos.x, mousePos.y); // to

    ctx.stroke(); // draw it!

    hold = false;
}