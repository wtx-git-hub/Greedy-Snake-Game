document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // 原有的 gridSize 和 tileCount 定义可能需要调整或移除，因为 resizeCanvas 会计算它们
    // let gridSize = 20; 
    // let tileCount = canvas.width / gridSize; 
    let gridSize; // 将由 resizeCanvas 计算
    let tileCount; // 将由 resizeCanvas 计算

    let snake = [];
    let velocityX = 0;
    let velocityY = 0;
    let gameSpeed = 7; // 游戏速度
    
    // 食物位置
    let foodX;
    let foodY;
    
    // 游戏状态
    let gameStarted = false;
    let gameOver = false;
    let score = 0;
    
    // 获取DOM元素
    const scoreElement = document.getElementById('score');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    
    // 获取触摸控制按钮
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    // 初始化游戏
    // +++ 新增 resizeCanvas 函数定义 +++
    function resizeCanvas() {
        const gameContainer = document.querySelector('.game-container'); // 或者 canvas.parentElement
        let containerWidth = gameContainer.clientWidth;
        
        // 减去一些padding或margin，如果game-container有的话，确保canvas不会超出
        // 例如，如果 .game-container padding是20px左右，那么：
        // containerWidth -= 40; // 左右各20px

        // 确保画布宽度不超过一个最大值，例如原始的400px，或者一个更适合手机的值
        containerWidth = Math.min(containerWidth, 400); // 示例：最大宽度400px

        // 假设我们希望每行有20个格子 (这个值可以根据游戏难度或屏幕大小调整)
        const desiredTileCount = 20;
        gridSize = Math.floor(containerWidth / desiredTileCount);
        tileCount = desiredTileCount; // 现在 tileCount 是固定的，gridSize 会变化
        
        canvas.width = tileCount * gridSize;
        canvas.height = tileCount * gridSize; // 保持正方形画布
        
        // 当画布尺寸改变后，如果游戏正在进行，需要重绘
        // 注意：蛇和食物的位置是基于格子索引的，所以它们不需要重新计算，只需要重绘
        if (gameStarted && !gameOver) {
            clearCanvas(); // clearCanvas 内部会使用新的 canvas.width/height
            drawFood();
            drawSnake();
        }
    }

    function initGame() {
        resizeCanvas(); // +++ 在游戏初始化时调用 +++
        snake = [
            {x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2)} // 初始位置居中
        ];
        velocityX = 0;
        velocityY = 0;
        score = 0;
        scoreElement.textContent = score;
        gameOver = false;
        placeFood(); // placeFood 内部会使用新的 tileCount
        // 初始绘制
        if (!gameStarted) { // 避免在 restartBtn 点击时重复绘制两次
            clearCanvas();
            drawSnake();
            drawFood();
        }
    }

    function placeFood() {
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                placeFood();
                return;
            }
        }
    }
    
    // 游戏主循环
    function gameLoop() {
        if (gameOver) {
            drawGameOver();
            return;
        }

        // 移除!gameStarted判断，因为触摸也可以开始游戏
        // if (!gameStarted) {
        //     return;
        // }

        setTimeout(function() {
            requestAnimationFrame(gameLoop);
        }, 1000 / gameSpeed);
        
        clearCanvas();
        moveSnake();
        checkCollision();
        drawFood();
        drawSnake();
    }
    
    // 清空画布
    function clearCanvas() {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 移动蛇
    function moveSnake() {
        // 创建新的蛇头
        const head = {x: snake[0].x + velocityX, y: snake[0].y + velocityY};
        snake.unshift(head); // 添加到蛇身前面
        
        // 检查是否吃到食物
        if (head.x === foodX && head.y === foodY) {
            score++;
            scoreElement.textContent = score;
            placeFood();
        } else {
            snake.pop(); // 如果没吃到食物，移除蛇尾
        }
    }
    
    // 检查碰撞
    function checkCollision() {
        const head = snake[0];
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver = true;
            return;
        }
        
        // 检查自身碰撞
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver = true;
                return;
            }
        }
    }
    
    // 绘制食物
    function drawFood() {
        ctx.fillStyle = 'red';
        ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize, gridSize);
    }
    
    // 绘制蛇
    function drawSnake() {
        ctx.fillStyle = 'lime';
        for (let i = 0; i < snake.length; i++) {
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
            
            // 绘制蛇身边框
            ctx.strokeStyle = 'darkgreen';
            ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        }
    }
    
    // 绘制游戏结束信息
    function drawGameOver() {
        clearCanvas();
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // 键盘控制
    document.addEventListener('keydown', function(event) {
        handleInput(event.key);
    });

    // 触摸控制
    upBtn.addEventListener('click', () => handleInput('ArrowUp'));
    downBtn.addEventListener('click', () => handleInput('ArrowDown'));
    leftBtn.addEventListener('click', () => handleInput('ArrowLeft'));
    rightBtn.addEventListener('click', () => handleInput('ArrowRight'));

    function handleInput(inputType) {
        if (!gameStarted && !gameOver && 
            (inputType === 'ArrowUp' || inputType === 'ArrowDown' || 
             inputType === 'ArrowLeft' || inputType === 'ArrowRight')) {
            gameStarted = true;
            if (!gameOver) gameLoop(); // 确保游戏结束后不再启动循环
        }

        if (!gameStarted) return; // 如果游戏未开始（例如，仅点击了开始按钮但未按方向），则不处理方向

        // 防止蛇反向移动
        if (inputType === 'ArrowUp' && velocityY !== 1) {
            velocityX = 0;
            velocityY = -1;
        } else if (inputType === 'ArrowDown' && velocityY !== -1) {
            velocityX = 0;
            velocityY = 1;
        } else if (inputType === 'ArrowLeft' && velocityX !== 1) {
            velocityX = -1;
            velocityY = 0;
        } else if (inputType === 'ArrowRight' && velocityX !== -1) {
            velocityX = 1;
            velocityY = 0;
        }
    }

    // 开始按钮
    startBtn.addEventListener('click', function() {
        if (!gameStarted && !gameOver) {
            // gameStarted = true; // 不再由开始按钮直接启动循环，而是等待第一次方向输入
            // gameLoop();
            // 提示用户按方向键或触摸按钮开始
            if (!gameOver) {
                initGame(); // 确保游戏状态被重置
                clearCanvas();
                drawSnake();
                drawFood();
                // 可以添加一个提示信息，比如 "按方向键或屏幕按钮开始"
            }
        }
    });

    // 重新开始按钮
    restartBtn.addEventListener('click', function() {
        initGame();
        gameStarted = false; // 重置gameStarted状态，等待下一次输入开始
        // gameLoop(); // 不再直接开始，等待输入
        clearCanvas(); // 清除画布并重绘初始状态
        drawSnake();
        drawFood();
    });
    
    // 初始化游戏
    initGame();
    clearCanvas();
    drawSnake();
    drawFood();
});