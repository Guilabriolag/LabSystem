<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LabSystem Boot</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: #000;
      font-family: 'Courier New', monospace;
      color: #fff;
      overflow: hidden;
    }
    canvas {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 0;
    }
    .intro {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
    .logo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin-bottom: 20px;
      box-shadow: 0 0 20px #00f6ff, 0 0 40px #00f6ff, 0 0 60px #00f6ff;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.9; }
      100% { transform: scale(1); opacity: 1; }
    }
    .title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 40px;
      white-space: nowrap;
      overflow: hidden;
      border-right: 2px solid #fff;
      animation: typing 2.5s steps(40, end) forwards;
    }
    @keyframes typing {
      from { width: 0 }
      to { width: 100% }
    }
    .buttons {
      position: absolute;
      bottom: 60px;
      display: flex;
      gap: 20px;
      z-index: 2;
    }
    .btn {
      background: #00f6ff;
      color: #000;
      padding: 10px 20px;
      font-weight: bold;
      border-radius: 5px;
      text-decoration: none;
      opacity: 0;
      transform: translateX(0);
      transition: transform 0.5s ease, opacity 0.5s ease;
    }
    .btn.access {
      animation: slideInRight 0.8s ease 2.9s forwards;
    }
    .btn.labriolag {
      animation: slideInLeft 0.8s ease 2.9s forwards;
    }
    @keyframes slideInRight {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideInLeft {
      from { transform: translateX(-100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    /* Oculta o player do YouTube */
    .audio {
      position: absolute;
      width: 0;
      height: 0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <canvas id="particles"></canvas>

  <div class="intro">
    <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7T-L3I1t95j33Pu9cdst8hHJShqSHsjSu09-kpkNNWxkb1R2hhTSqdr3DGtTmv74y6gxla4YUaGzThga3M1UaJcPuterWAMycodowVFBpHRMmRPmOmI3zpexmBBaiHg6Mvb24ggw1dcJ3Hh8CZFRho4PjBcGxhRzR9rkcx-x1hpLpHBlEmIEyRwE3n-By/s756/20250918_001110.png" alt="Logo LabSystem" class="logo" />
    <div class="title">Inicializando LabSystem Store...</div>
    <div class="buttons">
      <a href="https://guilabriolag.github.io/LabSpace/LabSystem/testeREADME" class="btn access">🧭 Acessar</a>
      <a href="https://guilabriolag.github.io/HUB/" class="btn labriolag">🧠 Labriolag</a>
    </div>
  </div>

  <!-- Som de fundo via YouTube -->
  <div class="audio">
    <iframe width="0" height="0" src="https://www.youtube.com/embed/CzfYPv4MtOM?autoplay=1&loop=1&playlist=CzfYPv4MtOM" frameborder="0" allow="autoplay"></iframe>
  </div>

  <script>
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particlesArray;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = Math.random() < 0.95 ? '#00f6ff' : '#ffe600'; // 95% azul, 5% amarelo raio
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      particlesArray = [];
      for (let i = 0; i < 120; i++) {
        particlesArray.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    init();
    animate();
  </script>
</body>
</html>
