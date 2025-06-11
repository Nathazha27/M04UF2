let canvas_w = 800;
let canvas_h = 450;

let config = {
    width:canvas_w,
    height:canvas_h,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 150 }
        }
    },
    scene: {
        preload: precarga,
        create: crea,
        update: actualiza
    }
};

let game = new Phaser.Game(config)

let score = 0;
let tiempo = 60;
let text_score;
let text_tiempo;

let huevera_b, huevera_r, huevera_a;
let huevo_b, huevo_r, huevo_a;

let huevera_scale = 0.5;
let fondo_hierba;
let huevera_place;
let huevo_pulsado = 0.7;
let huevo;

let huevos = [];

let audio_ok, audio_error, audio_fondo;

let text_gameOver;
let text_puntuacionFinal;
let gameOver = false;

function precarga(){
    this.load.image('huevera', 'huevera.png');
	this.load.image('huevo', 'huevo.png');
	this.load.image('fondo', 'fondo.png');
	this.load.image('cinta', 'cinta.png');

    this.load.audio('ok_huevo', 'ok_sound.mp3');
    this.load.audio('error_huevo', 'error_sound.wav');
    this.load.audio('fondo_musica', 'background_sound.wav');
}

function crea(){
    tecla = this.input.keyboard.createCursorKeys();
    
    fondo_hierba = this.add.image(400, 225, 'fondo');
    huevera_place = this.add.image(150, 225, 'cinta');

    huevera_b = this.add.image(150,100, 'huevera').setScale(huevera_scale);
	huevera_r = this.add.image(150,225, 'huevera').setScale(huevera_scale).setTint(Phaser.Display.Color.GetColor(255,131,131));
	huevera_a = this.add.image(150, 350, 'huevera').setScale(huevera_scale).setTint(Phaser.Display.Color.GetColor(131,222,255));

    text_score = this.add.text(80, 10, 'Puntos: 0', { fontSize: '20px', fill: '#fff' });
    text_tiempo = this.add.text(80, 35, 'Tiempo: 60', { fontSize: '20px', fill: '#fff' });

    audio_ok = this.sound.add('ok_huevo');
    audio_error = this.sound.add('error_huevo');
    audio_fondo = this.sound.add('fondo_musica', { loop: true, volume: 0.3 });
    audio_fondo.play();

    this.time.addEvent({ //Para restar tiempo cada segundo
        delay: 1000,
        callback: function() {
            if (gameOver) return;

            tiempo--;
            text_tiempo.setText('Tiempo: ' + tiempo);
            if (tiempo <= 0) {
                endGame.call(this);
            }
        },
        callbackScope: this,
        loop: true
    });

	this.time.addEvent({
		delay: 1500,
		callback: crearHuevo,
		callbackScope: this,
		loop: true
	});

    this.input.on('drag', function (pointer, object, x, y) {
		object.x = x;
		object.y = y;
	});

	this.input.on('dragend', function (pointer, object, x, y) {
        if (gameOver) return;

		object.setScale(huevera_scale);
        object.body.enable = true;

        let HueveraCorrecta = false;

		if (object.tipo == 0 && Phaser.Geom.Intersects.RectangleToRectangle(huevera_r.getBounds(), object.getBounds())){
			console.log("huevera ROJA");
            audio_ok.play();
            score += 30;
            HueveraCorrecta = true;
		}
		else if (object.tipo == 1 && Phaser.Geom.Intersects.RectangleToRectangle(huevera_a.getBounds(), object.getBounds())){
			console.log("huevera AZUL");
            audio_ok.play();
            score += 20;
            HueveraCorrecta = true;
		}
		else if (object.tipo == 2 && Phaser.Geom.Intersects.RectangleToRectangle(huevera_b.getBounds(), object.getBounds())){
			console.log("huevera BLANCA");
            audio_ok.play();
            score += 10;
            HueveraCorrecta = true;
		}
        
        if (!HueveraCorrecta) {
            console.log("huevera incorrecta");
            tiempo -= 5;
            audio_error.play();
        }

        text_score.setText('Puntos: ' + score);
        text_tiempo.setText('Tiempo: ' + tiempo);

        object.destroy();
	});
}

function crearHuevo(){
    let x = Phaser.Math.Between(400,canvas_w);
	huevo = this.add.image(x,0,'huevo');
	huevo.setScale(huevera_scale);

	let tipo = Phaser.Math.Between(0,2);
    huevo.tipo = tipo;

	switch (huevo.tipo) {
        case 0: huevo.setTint(0xFF8383); break;
        case 1: huevo.setTint(0x83DEFF); break;
    }

	this.physics.world.enable(huevo);
    huevos.push(huevo);
		
	huevo.setInteractive({draggable:true});

	huevo.on('pointerdown', function () {
		console.log("pulsado");

		this.setScale(huevo_pulsado);
        this.body.enable = false;
	});

	

	console.log("huevo creado");
}

function endGame() {
    gameOver = true;

    text_gameOver = this.add.text(canvas_w / 2, canvas_h / 2 - 40, 'GAME OVER', { fontSize: '32px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    text_puntuacionFinal = this.add.text(canvas_w / 2, canvas_h / 2 + 10, 'Puntuación final: ' + score, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    text_gameOver.setDepth(10);
    text_puntuacionFinal.setDepth(10);
    huevos.forEach(h => {
        if (h && h.active && h.disableInteractive) {
        h.disableInteractive();
        }
        if (h && h.body) {
        h.body.enable = false;
        h.body.moves = false;
        }
    });

    console.log("Fin del juego. Texto creado:", text_gameOver, text_puntuacionFinal);

    this.time.delayedCall(500, () => {
        this.scene.pause();
    });
}

function actualiza()
{
/*	if (tecla.left.isDown){
	rect.x -= rect_dir;
	}

	if (tecla.right.isDown){
	rect.x += rect_dir;
	}

	if (tecla.up.isDown) {
	rect.y -= rect_dir;
	}

	if (tecla.down.isDown){
	rect.y += rect_dir;
	}

	if (rect.x >= canvas_w) {
	rect.x = canvas_w;
	}

	if (rect.x <= 0){
	rect.x = 0;
	}

	if (rect.y >= canvas_h){
	rect.y = canvas_h;
	}

	if (rect.y <= 0){
	rect.y = 0;
	}
*/
}
