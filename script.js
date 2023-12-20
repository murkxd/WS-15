document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("paintCanvas");
    const ctx = canvas.getContext("2d");

    let painting = false;
    let brushSize = 2;
    let isAirbrush = false;
    let isSquare = false;
    let squareArray = [];
    let startX, startY, currentSquare;
    let drawingHistory = [];
 
    function updateBrushSizeIndicator() {
        document.getElementById("brushSizeIndicator").textContent = brushSize;
    }

    function startPosition(e) {
        painting = true;
        if (isSquare) {
            startSquare(e);
        } else {
            draw(e);
        }
    }

    function endPosition() {
        painting = false;
        if (isSquare) {
            endSquare();
        } else {
            ctx.beginPath();
        }
    }

    function draw(e) {
        if (!painting) return;

        if (isAirbrush) {
            ctx.fillStyle = document.getElementById("colorPicker").value;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(
                e.clientX - canvas.offsetLeft,
                e.clientY - canvas.offsetTop,
                brushSize,
                brushSize
            );
            ctx.globalAlpha = 1;
        } else {
            if (drawingHistory.length === 0 || drawingHistory[drawingHistory.length - 1].type !== "freehand") {
                ctx.beginPath();
                ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
            }
    
            ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
            ctx.stroke();
    
            drawingHistory.push({
                type: "freehand",
                data: {
                    x: e.clientX - canvas.offsetLeft,
                    y: e.clientY - canvas.offsetTop,
                },
            });
        }
    }

    function startSquare(e) {
        startX = e.clientX - canvas.offsetLeft;
        startY = e.clientY - canvas.offsetTop;
        currentSquare = {
            startX: startX,
            startY: startY,
            endX: startX,
            endY: startY,
            color: document.getElementById("colorPicker").value,
        };
    }

    function drawSquare(e) {
        if (!painting || !isSquare) return;

        currentSquare.endX = e.clientX - canvas.offsetLeft;
        currentSquare.endY = e.clientY - canvas.offsetTop;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const item of drawingHistory) {
            if (item.type === "freehand") {
                ctx.lineWidth = brushSize;
                ctx.lineCap = "round";
                ctx.strokeStyle = document.getElementById("colorPicker").value;
                ctx.lineTo(item.data.x, item.data.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(item.data.x, item.data.y);
            } else if (item.type === "square") {
                ctx.lineWidth = brushSize;
                ctx.strokeStyle = item.data.color;
                ctx.strokeRect(
                    item.data.startX,
                    item.data.startY,
                    item.data.endX - item.data.startX,
                    item.data.endY - item.data.startY
                );
            }
        }

        ctx.lineWidth = brushSize;
        ctx.strokeStyle = currentSquare.color;
        ctx.strokeRect(
            currentSquare.startX,
            currentSquare.startY,
            currentSquare.endX - currentSquare.startX,
            currentSquare.endY - currentSquare.startY
        );
    }

    function endSquare() {
        if (!isSquare || !currentSquare) return;

        drawingHistory.push({
            type: "square",
            data: {
                startX: currentSquare.startX,
                startY: currentSquare.startY,
                endX: currentSquare.endX,
                endY: currentSquare.endY,
                color: currentSquare.color,
            },
        });

        squareArray.push(currentSquare);
        currentSquare = null;
    }

    function toggleSquare() {
        isSquare = !isSquare;
        if (isSquare) {
            isAirbrush = false;
            document.getElementById('airbrushToggle').textContent = "Enable Airbrush";
            document.getElementById('squareToggle').textContent = "Disable Square";
        } else {
            document.getElementById('squareToggle').textContent = "Enable Square";
        }
    }

    document.getElementById("squareToggle").addEventListener("mousedown", toggleSquare);

    document.getElementById("airbrushToggle").addEventListener("click", function () {
        isAirbrush = !isAirbrush;
        if (isAirbrush) {
            isSquare = false;
            document.getElementById('squareToggle').textContent = "Enable Square";
        }
        document.getElementById("airbrushToggle").textContent = isAirbrush
            ? "Disable Airbrush"
            : "Enable Airbrush";
    });

    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mousemove", function (e) {
        if (isSquare && painting) {
            drawSquare(e);
        } else {
            draw(e);
        }
    });
    canvas.addEventListener("mouseup", endPosition);

    document.getElementById("increaseBrush").addEventListener("click", function () {
        brushSize += 2;
        updateBrushSizeIndicator();
    });

    document.getElementById("decreaseBrush").addEventListener("click", function () {
        if (brushSize > 2) {
            brushSize -= 2;
            updateBrushSizeIndicator();
        }
    });

    document.getElementById("clearButton").addEventListener("click", function () {
        squareArray = [];
        drawingHistory = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    document.getElementById("saveButton").addEventListener("click", function () {
        const dataURL = canvas.toDataURL();
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = "painting.png";
        a.click();
    });

    updateBrushSizeIndicator();
});