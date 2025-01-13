const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;
var resX = 320;
var resY = 240;

const keys = {
	ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
	KeyW: false,
	KeyS: false,
	KeyA: false,
	KeyD: false,
	Space: false,
	Tab: false
};
const { ...keysPress } = keys;
document.addEventListener('keydown', event => {
	console.log(event.code);
    if (keys.hasOwnProperty(event.code)) {
        event.preventDefault();
		keysPress[event.code] = true;
        keys[event.code] = true;
    }
}, true);
document.addEventListener('keyup', event => {
    if (keys.hasOwnProperty(event.code)) {
        event.preventDefault();
        keys[event.code] = false;
    }
}, true);

//Classe de um ponto 2D
class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}
//Classe de um ponto 3D
class Point3D {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}
//Classe para pintar um pixel na tela, recebendo X, Y e a cor
function drawPixel(x, y, color) {
	context.fillStyle = color;
	x = Math.round(x);
	y = Math.round(y);
	context.fillRect(x, y, 1, 1);
}
//Desenha um segmento de reta entre dois pontos 2D usando context.lineTo
function drawLine(p1, p2, color) {
	context.beginPath();
	context.moveTo((p1.x), (p1.y));
	context.lineTo((p2.x), (p2.y));
	context.strokeStyle = color || 'black';
	context.stroke();
}
function drawCircle(x, y, radius, color) {
	context.beginPath();
	context.arc(x, y, radius, 0, 2 * Math.PI);
	context.fillStyle = color;
	context.fill();
}

function clipBehind(argWx, argWy, argWz, argOrigem, argDestino, argDebug = false) {
	let da=argWy[argOrigem];
	let db=argWy[argDestino];
	let d=da-db;
	if (d==0) { d=0.01; }
	if (d==-cameras[cameraAtual].fov) {
		d+=0.01;
	}
	let s = da/(d);
	argWx[argOrigem] = parseFloat((argWx[argOrigem] + (s * (argWx[argDestino] - argWx[argOrigem]))).toFixed(2));
	argWy[argOrigem] = parseFloat((argWy[argOrigem] + (s * (argWy[argDestino] - argWy[argOrigem]))).toFixed(2));
	if (argWy[argOrigem]==0) { argWy[argOrigem]=0.01; }
	argWz[argOrigem] = parseFloat((argWz[argOrigem] + (s * (argWz[argDestino] - argWz[argOrigem]))).toFixed(2));
	if (argDebug) {
		console.log(parseFloat(argWy[argOrigem].toFixed(2)));
	}
}


//Classe de um segmento de reta entre dois pontos 2D
class Line {
	constructor(p1, p2, setor = null) {
		this.p1 = p1;
		this.p2 = p2;
		this.setor = setor;
		this.portal = false;
		this.debugger = false;
		this.debuggerFx = false;
	}
	//Desenha o segmento de reta na tela
	render2d() {
		drawLine(this.p1, this.p2);
	}
	render3d() {
		let x1 = (this.p1.x - cameras[cameraAtual].position.x);
		let y1 = (this.p1.y - cameras[cameraAtual].position.y);
		let x2 = (this.p2.x - cameras[cameraAtual].position.x);
		let y2 = (this.p2.y - cameras[cameraAtual].position.y);
		let wx=[];
		let wy=[];
		let wz=[];
		let cos = Math.cos((-cameras[cameraAtual].direction + 90) * (Math.PI / 180));
		let sin = Math.sin((-cameras[cameraAtual].direction + 90) * (Math.PI / 180));
		wx[0] = ((x1 * cos) - (y1 * sin));
		wx[1] = ((x2 * cos) - (y2 * sin));
		wx[2] = wx[0];
		wx[3] = wx[1];
		wy[0] = ((y1 * cos) + (x1 * sin));
		wy[1] = ((y2 * cos) + (x2 * sin));
		wy[2] = wy[0];
		wy[3] = wy[1];
		wz[0] = (-this.setor.z1 + cameras[cameraAtual].position.z);
		wz[1] = (-this.setor.z1 + cameras[cameraAtual].position.z);
		wz[2] = (-this.setor.z2 + cameras[cameraAtual].position.z);
		wz[3] = (-this.setor.z2 + cameras[cameraAtual].position.z);

		if ((wy[0]<=0) && (wy[1]<=0)) {
			this.debug("Não desenha!");
			return;
		}
		if (wy[0]<0.1) {
			this.debug("Wy0 tá fora");
			//this.debug(wx);
			clipBehind(wx, wy, wz, 0, 1, this.debugger);
			clipBehind(wx, wy, wz, 2, 3, this.debugger);
			//this.debug(wx);
			//clipBehind(wx[2], wy[2], wz[2], wx[3], wy[3], wz[3]);
		}
		if (wy[1]<0.1) {
			this.debug("Wy1 tá fora");
			clipBehind(wx, wy, wz, 1, 0, this.debugger);
			clipBehind(wx, wy, wz, 3, 2, this.debugger);
			//clipBehind(&wx[1], &wy[1], &wz[1], wx[0], wy[0], wz[0]);
			//clipBehind(&wx[3], &wy[3], &wz[3], wx[2], wy[2], wz[2]);
		}

		wx[0]=(wx[0]*((-cameras[cameraAtual].fov*2)/wy[0])+(resX/2)); wy[0]=(wz[0]*((cameras[cameraAtual].fov*2)/wy[0])+(resY/2));
		wx[1]=(wx[1]*((-cameras[cameraAtual].fov*2)/wy[1])+(resX/2)); wy[1]=(wz[1]*((cameras[cameraAtual].fov*2)/wy[1])+(resY/2));
		wx[2]=(wx[2]*((-cameras[cameraAtual].fov*2)/wy[2])+(resX/2)); wy[2]=(wz[2]*((cameras[cameraAtual].fov*2)/wy[2])+(resY/2));
		wx[3]=(wx[3]*((-cameras[cameraAtual].fov*2)/wy[3])+(resX/2)); wy[3]=(wz[3]*((cameras[cameraAtual].fov*2)/wy[3])+(resY/2));

		let w1 = new Point(wx[0],wy[0]);
		let w2 = new Point(wx[1],wy[1]);
		let w3 = new Point(wx[2],wy[2]);
		let w4 = new Point(wx[3],wy[3]);
		if (this.debugger) {
			if (this.debuggerFx) {
				drawPixel(wx[0],wy[0],"blue");
				drawPixel(wx[1],wy[1],"blue");
				drawPixel(wx[2],wy[2],"blue");
				drawPixel(wx[3],wy[3],"blue");

				drawLine(w1,w2,"green");
				drawLine(w3,w4,"yellow");
				drawLine(w1,w3,"purple");
				drawLine(w2,w4,"purple");
			}
			this.debuggerFx=!this.debuggerFx;
		} else {
			drawLine(w1,w2,"green");
			drawLine(w3,w4,"yellow");
			drawLine(w1,w3,"purple");
			drawLine(w2,w4,"purple");

			drawPixel(wx[0],wy[0],"blue");
			drawPixel(wx[1],wy[1],"blue");
			drawPixel(wx[2],wy[2],"blue");
			drawPixel(wx[3],wy[3],"blue");
		}
	}
	//Cria um setor a partir deste segmento de reta
	createSector() {
		let novoSetor = new Sector();
		novoSetor.setPoints([this.p1, this.p2]);
		novoSetor.lines[novoSetor.lines.length - 1].portal = true;
		this.setor.addNeighbor(novoSetor);
		this.portal = true;
		return novoSetor;
	}
	//Verifica se esta linha está cruzando com outra linha a ser repassada por argumento
	intersect(line,draw = false) {
		let x1 = this.p1.x;
		let y1 = this.p1.y;
		let x2 = this.p2.x;
		let y2 = this.p2.y;
		let x3 = line.p1.x;
		let y3 = line.p1.y;
		let x4 = line.p2.x;
		let y4 = line.p2.y;
		let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (draw) {
			drawLine(new Point(x3, y3), new Point(x4, y4), 'red');
		}
		if (den == 0) {
			return null;
		}
		let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
		let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			let novoPonto = new Point(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
			if (draw) {
				drawCircle(novoPonto.x, novoPonto.y, 3, 'green');
			}
			return novoPonto;
		}
		return null;
	}
	debug(argDebug) {
		if (argDebug === true) {
			this.debugger = true;
			console.log("Debug ativado");
			console.log(this);
		} else if (argDebug===false) {
			this.debugger = false;
			console.log("Debug desativado");
		} else {
			if (this.debugger) {
				console.log(argDebug);
			}
		}
	}
}

var setores = [];
//Classe de um setor, que abriga um conjunto de segmentos de reta, além de informar sua altura z
class Sector {
	constructor() {
		this.lines = [];
		this.z1 = 0;
		this.z2 = 24;
		this.debug = null;
		this.minX = Infinity;
		this.minY = Infinity;
		this.vizinhos = [];
		setores.push(this);
	}
	//Função que recebe uma lista de pontos, e cria segmentos de retas entre cada um deles
	setPoints(points) {
		//Verifica se os pontos formam um polígono côncavo
		let isConcave = false;
		for (let i = 0; i < points.length; i++) {
			let p1 = points[i];
			let p2 = points[(i + 1) % points.length];
			let p3 = points[(i + 2) % points.length];
			let crossProduct = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
			if (crossProduct < 0) {
				isConcave = true;
				break;
			}
		}
		//Se não, cancela a criação do setor
		if (isConcave) {
			console.log('Polígono é côncavo');
//			return;
		}

		for (let i = 0; i < points.length - 1; i++) {
			this.lines.push(new Line(points[i], points[i + 1], this));
		}
		//Une o último ponto ao primeiro
		this.lines.push(new Line(points[points.length - 1], points[0], this));
		this.updateMin();
	}
	//Função que faz segmentos de retas entre os pontos recebidos, e adiciona tais segmentos à lista existente de segmentos deste setor
	addPoints(points) {
		let ultimoSegmento = this.lines.pop();
		let segmentoInicial = this.lines.shift();
		this.lines.push(new Line(segmentoInicial.p1, points[0], this));
		for (let i = 0; i < points.length - 1; i++) {
			this.lines.push(new Line(points[i], points[i + 1], this));
		}
		this.lines.push(new Line(points[points.length - 1], segmentoInicial.p2, this));
		ultimoSegmento.setor = this;
		this.lines.push(ultimoSegmento);
		this.updateMin();
	}
	//Renderiza as linhas deste setor
	render2d() {
		this.lines.forEach(line => line.render2d());
		switch (this.debug) {
			case 'inside':
				context.fillStyle = 'rgba(255, 0, 0, 0.5)';
				context.beginPath();
				this.lines.forEach(line => {
					context.lineTo(line.p1.x, line.p1.y);
				});
				context.fill();
				break;
		}
	}
	render3d() {
		this.lines.forEach(line => line.render3d());
	}
	//Atualiza a menor posição x e y deste setor
	updateMin() {
		this.minX = Infinity;
		this.minY = Infinity;
		this.lines.forEach(line => {
			this.minX = Math.min(this.minX, line.p1.x, line.p2.x);
			this.minY = Math.min(this.minY, line.p1.y, line.p2.y);
		});
		this.minX -= 10.1;
		this.minY -= 10;
	}
	//Adiciona um setor vizinho e atualiza o próprio setor vizinho
	addNeighbor(argVizinho) {
		this.vizinhos.push(argVizinho);
		argVizinho.vizinhos.push(this);
	}
}

var entidades = [];
var gravidade = 0.1;
//Classe de uma entidade, que possui uma posição 3D e uma direção em graus
class Entity {
	constructor(x, y, z, direction) {
		this.position = new Point3D(x, y, z);
		this.velocity = new Point3D(0, 0, 0);
		this.altura = 16;
		this.direction = direction;
		this.friction = 0.9;
		this.sector = null;
		this.noChao = false;
		entidades.push(this);
	}
	//Função que desenha a entidade na tela
	render2d() {
		drawCircle(this.position.x, this.position.y, 3, 'red');
	}
	//Função de atualização da posição da entidade com base na velocidade e na fricção
	update() {
		this.position.x = parseFloat((this.position.x + this.velocity.x).toFixed(2));
		this.position.y = parseFloat((this.position.y + this.velocity.y).toFixed(2));
		this.position.z = parseFloat((this.position.z + this.velocity.z).toFixed(2));
		this.velocity.x = this.velocity.x * this.friction;
		this.velocity.y = this.velocity.y * this.friction;
		if (this.sector!=null) {
			this.velocity.z -= gravidade;
			this.noChao = false;
			if (this.position.z < this.sector.z1) {
				this.position.z = this.sector.z1;
				this.velocity.z = 0;
				this.noChao = true;
			}
			if (this.position.z + this.altura > this.sector.z2) {
				this.position.z = this.sector.z2 - this.altura;
				this.velocity.z = 0;
			}
			let intersections = 0;
			for (let j = 0; j < this.sector.lines.length; j++) {
				let line = this.sector.lines[j];
				let intersection = line.intersect(new Line(new Point(this.position.x, this.position.y), new Point(this.sector.minX, this.sector.minY)));
				if (intersection!=null) {
					intersections++;
				}
			}
			if (intersections % 2 == 0) {
				//console.log("Perdeu o setor");
				this.sector.debug = null;
				this.sector = this.getSector();
			}
		} else {
			this.velocity.z = 0;
			//console.log("Setor nulo");
			this.sector = this.getSector();
		}
	}
	//Função para detectar o setor que corresponde à posição 3D desta entidade
	getSector(argGeral = false) {
		let listaVerificar = setores;
		if ((!argGeral) && (this.sector!=null)) {
			listaVerificar = this.sector.vizinhos;
		}
		for (let i = 0; i < listaVerificar.length; i++) {
			let sector = listaVerificar[i];
			//Verifica a quantidade de interseções de linhas entre a posição da entidade e o minX e minY do setor
			let intersections = 0;
			for (let j = 0; j < sector.lines.length; j++) {
				let line = sector.lines[j];
				let intersection = line.intersect(new Line(new Point(this.position.x, this.position.y), new Point(sector.minX, sector.minY)));
				if (intersection) {
					intersections++;
				}
			}
			//Se a quantidade de interseções for ímpar, a entidade está dentro do setor
			if (intersections % 2 == 1) {
				sector.debug = 'inside';
				return sector;
			}
		}
		if (!argGeral) {
			//console.log("Buscou geral!");
			return this.getSector(true);
		} else {
			return null;
		}
	}
}
var jogador = null;
//Jogador, que é uma extensão da classe Entidade
class Player extends Entity {
	constructor(x, y, z, direction) {
		super(x, y, z, direction);
		jogador = this;
		let novaCamera = new Camera();
		novaCamera.definirModo("FP",[this,this]);
	}
	update() {
		super.update();
		if (keys.ArrowUp || keys.KeyW) {
			this.velocity.x += (Math.cos(this.direction * Math.PI / 180) / 5);
			this.velocity.y += (Math.sin(this.direction * Math.PI / 180) / 5);
		}
		if (keys.ArrowDown || keys.KeyS) {
			this.velocity.x += -(Math.cos(this.direction * Math.PI / 180) / 5);
			this.velocity.y += -(Math.sin(this.direction * Math.PI / 180) / 5);
		}
		if (keys.KeyA) {
			this.velocity.x += (Math.cos((this.direction - 90) * Math.PI / 180) / 5);
			this.velocity.y += (Math.sin((this.direction - 90) * Math.PI / 180) / 5);
		}
		if (keys.KeyD) {
			this.velocity.x += (Math.cos((this.direction + 90) * Math.PI / 180) / 5);
			this.velocity.y += (Math.sin((this.direction + 90) * Math.PI / 180) / 5);
		}
		if (keys.ArrowLeft) {
			this.direction -= 5;
		}
		if (keys.ArrowRight) {
			this.direction += 5;
		}
		if ((keys.Space) && (this.noChao)) {
			this.velocity.z = 1.5;
		}
		if (keysPress.Tab) {
			exibirMapa = !exibirMapa;
		}
		// Atualize a posição do jogador aqui com base na velocidade
		// this.position.x += this.velocity.x;
		// this.position.y += this.velocity.y;
	}
	//Função que desenha o jogador na tela
	render2d() {
		drawCircle(this.position.x, this.position.y, 5, 'blue');
		//Desenha uma linha que aponta a direção que o jogador está virado
		drawLine(new Point(this.position.x, this.position.y), new Point(this.position.x + Math.cos(this.direction * Math.PI / 180) * 10, this.position.y + Math.sin(this.direction * Math.PI / 180) * 10), 'blue');
	}
}

var cameras = [];
var cameraAtual = 1;
class Camera {
	constructor() {
		this.position = new Point3D();
		this.lookAt = new Point3D();
		this.direction = 0;
		this.fov = 75;
		this.type = "free";
		this.follow = null;
		this.look = null;
		cameras.push(this);
	}
	render2d() {
		drawCircle(this.position.x, this.position.y, 2, 'yellow');
		drawLine(new Point(this.position.x, this.position.y), new Point(this.position.x + Math.cos((this.direction+(this.fov/2)) * Math.PI / 180) * 100, this.position.y + Math.sin((this.direction+(this.fov/2)) * Math.PI / 180) * 100), 'yellow');
		drawLine(new Point(this.position.x, this.position.y), new Point(this.position.x + Math.cos((this.direction-(this.fov/2)) * Math.PI / 180) * 100, this.position.y + Math.sin((this.direction-(this.fov/2)) * Math.PI / 180) * 100), 'yellow');
	}
	update() {
		switch (this.type) {
			case "FP":
				this.position = new Point3D(this.follow.position.x, this.follow.position.y, this.follow.position.z);
				this.position.z += this.follow.altura;
				//console.log(this.position.z);
				this.direction = this.look.direction;
				break;
		}
	}
	definirModo(argModo, argArgumentos) {
		this.type=argModo;
		switch (this.type) {
			case "FP":
				this.follow = argArgumentos[0];
				this.look = argArgumentos[0];
				break;
		}
	}
}
new Camera();

function criarSetorCubo() {
	var sectorCriacao = new Sector();
	sectorCriacao.setPoints([
		new Point(25,25),
		new Point(100,25),
		new Point(100,100),
		new Point(25,100)
	])
	//sectorCriacao.lines[2].debug(true);
}

function criarSetorTeste1() {
	var sectorCriacao = new Sector();
	sectorCriacao.setPoints([
		new Point(10, 20),
		new Point(90, 40),
		new Point(100, 70),
		new Point(50, 100)
	]);
	sectorCriacao.z2 = 24;
	sectorCriacao = sectorCriacao.lines[1].createSector();
	sectorCriacao.addPoints([
		new Point(130, 30),
		new Point(140, 100)
	]);
	sectorCriacao = sectorCriacao.lines[2].createSector();
	sectorCriacao.z2 = 32;
	sectorCriacao.addPoints([
		new Point(140,200),
		new Point(80,200),
		new Point(80,180)
	]);
	sectorCriacao = sectorCriacao.lines[2].createSector();
	sectorCriacao.z1 = 4;
	sectorCriacao.z2 = 32;
	sectorCriacao.addPoints([
		new Point(10,200),
		new Point (10,180)
	]);
}

jogador = new Player(50, 50, 0, 0);
criarSetorTeste1();

//Função que limpa a tela e renderiza os setores
var exibirMapa = false;
function gameLoop() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	entidades.forEach(entidade => entidade.update());
	cameras.forEach(camera => camera.update());
	renderizar3d();
	if (exibirMapa) {
		renderizar2d();
	}
	Object.keys(keysPress).forEach(key => keysPress[key] = false);
}
function renderizar2d() {
	setores.forEach(sector => sector.render2d());	
	entidades.forEach(entity => entity.render2d());
	cameras.forEach(camera => camera.render2d());
}
function renderizar3d() {
	setores.forEach(sector => sector.render3d());
}

//Define para renderizar a tela a 60 FPS:
setInterval(gameLoop, 1000 / 60);