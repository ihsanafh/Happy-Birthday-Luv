var settings = {
    particles: {
        length: 500, // Number of particles
        duration: 2, // Particle duration in seconds
        velocity: 100, // Particle velocity in pixels per second
        effect: -0.75, // Particle effect (0 = no effect, -1 = reverse, 1 = normal)
        size: 30, // Particle size in pixels
    },
};

(function(){var b=0;var c=["ms","moz","webkit","o"];for(var a=0;a<c.length&&!window.requestAnimationFrame;++a){window.requestAnimationFrame=window[c[a]+"RequestAnimationFrame"];window.cancelAnimationFrame=window[c[a]+"CancelAnimationFrame"]||window[c[a]+"CancelRequestAnimationFrame"]}if(!window.requestAnimationFrame){window.requestAnimationFrame=function(h,e){var d=new Date().getTime();var f=Math.max(0,16-(d-b));var g=window.setTimeout(function(){h(d+f)},f);b=d+f;return g}}if(!window.cancelAnimationFrame){window.cancelAnimationFrame=function(d){clearTimeout(d)}}}()); // Polyfill for requestAnimationFrame

var Point = (function() { // Point class
    function Point(x, y) { // Constructor
        this.x = (typeof x !== 'undefined') ? x : 0;
        this.y = (typeof y !== 'undefined') ? y : 0;
    }   
    Point.prototype.clone = function() { // Clone point
        return new Point(this.x, this.y);
    };
    Point.prototype.length = function(length) { // Get or set length
        if (typeof length == 'undefined')
        return Math.sqrt(this.x * this.x + this.y * this.y);
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
    };
    Point.prototype.normalize = function() { // Normalize point
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
    };

    return Point;
})();

var Particle = (function() { // Particle class
    function Particle() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
    }
    Particle.prototype.initialize = function(x, y, dx, dy) { // Initialize particle
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
    };
    Particle.prototype.update = function(deltaTime) { // Update particle
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
    };
    Particle.prototype.draw = function(context, image) { // Draw particle
        function ease(t) { // Ease function
        return (--t) * t * t + 1;
        }
        var size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
    };

    return Particle;
})();

var ParticlePool = (function() { // Particle pool class
    var particles, firstActive = 0, firstFree = 0, duration = settings.particles.duration;

    function ParticlePool(length) { // Constructor
        particles = new Array(length);
        for (var i = 0; i < particles.length; i++)
        particles[i] = new Particle();
    }
    ParticlePool.prototype.add = function(x, y, dx, dy) { // Add particle
        particles[firstFree].initialize(x, y, dx, dy);
        firstFree++;

        if (firstFree == particles.length) { // Reset pool
            firstFree = 0;
        }
        if (firstActive == firstFree) { // Reset pool
            firstActive++;
        }
        if (firstActive == particles.length) { // Reset pool
            firstActive = 0;
        }
    };
    ParticlePool.prototype.update = function(deltaTime) { // Update particles
        var i;
        
        if (firstActive < firstFree) { // Update particles
            for (i = firstActive; i < firstFree; i++) { // Update particles
                particles[i].update(deltaTime);
            }
        }
        if (firstFree < firstActive) { // Update particles
            for (i = firstActive; i < particles.length; i++) { // Update particles
                particles[i].update(deltaTime);
            }
            for (i = 0; i < firstFree; i++) { // Update particles
                particles[i].update(deltaTime);
            }
        }
        while (particles[firstActive].age >= duration && firstActive != firstFree) { // Remove old particles
            firstActive++;
            if (firstActive == particles.length) { // Reset pool
                firstActive = 0;
            }
        }
    };
    ParticlePool.prototype.draw = function(context, image) { // Draw particles
        if (firstActive < firstFree) { // Draw particles
            for (i = firstActive; i < firstFree; i++) { // Draw particles
                particles[i].draw(context, image);
            }
        }
        if (firstFree < firstActive) { // Draw particles
            for (i = firstActive; i < particles.length; i++) { // Draw particles
                particles[i].draw(context, image);
            }
            for (i = 0; i < firstFree; i++) { // Draw particles
                particles[i].draw(context, image);
            }
        }
    };

    return ParticlePool;
})();

(function(canvas) { // Main function
    var context = canvas.getContext('2d'), particles = new ParticlePool(settings.particles.length), particleRate = settings.particles.length / settings.particles.duration, time;

    function pointOnHeart(t) { // Get point on heart
        return new Point(
            240 * Math.pow(Math.sin(t), 3), // Adjust x-coordinate scaling
            195 * Math.cos(t) - 75 * Math.cos(2 * t) - 30 * Math.cos(3 * t) - 15 * Math.cos(4 * t) + 37.5 // Adjust y-coordinate scaling
        );
    }

    var image = (function() { // Create particle image
        var canvas  = document.createElement('canvas'), context = canvas.getContext('2d');
        canvas.width  = settings.particles.size;
        canvas.height = settings.particles.size;

        function to(t) { // Convert t to radians 
            var point = pointOnHeart(t);
            point.x = settings.particles.size / 2 + point.x * settings.particles.size / 350;
            point.y = settings.particles.size / 2 - point.y * settings.particles.size / 350;
        
            return point;
        }

        context.beginPath();
        var t = -Math.PI;
        var point = to(t);
        context.moveTo(point.x, point.y);

        while (t < Math.PI) { // Draw heart
            t += 0.01;
            point = to(t);
            context.lineTo(point.x, point.y);
        }

        context.closePath();
        context.fillStyle = '#ea80b0';
        context.fill();
        var image = new Image();
        image.src = canvas.toDataURL();

        return image;
    })();

    function render() { // Render function
        requestAnimationFrame(render);
        var newTime = new Date().getTime() / 1000, deltaTime = newTime - (time || newTime);
        time = newTime;
        context.clearRect(0, 0, canvas.width, canvas.height);
        var amount = particleRate * deltaTime;

        for (var i = 0; i < amount; i++) { // Add particles
            var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
            var dir = pos.clone().length(settings.particles.velocity);
            particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
        }
        
        particles.update(deltaTime);
        particles.draw(context, image);
    }

    function onResize() { // Resize function
        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    window.onresize = onResize;
    
    setTimeout(function() { // Start
        onResize();
        render();
    }, 10);
})
(document.getElementById('pinkboard')); // Get canvas element

function startCountdown(startDate) {
    const countdownContainer = document.getElementById('countdown-container');

    function updateCountdown() {
        const now = new Date();
        // Sesuaikan waktu ke WIB (UTC+7)
        const nowWIB = new Date(now.getTime() + (7 * 60 * 60 * 1000));

        const years = nowWIB.getFullYear() - startDate.getFullYear();
        const months = nowWIB.getMonth() - startDate.getMonth() + (years * 12);
        const days = Math.floor((nowWIB - startDate) / (1000 * 60 * 60 * 24)) % 30;
        const hours = nowWIB.getHours();
        const minutes = nowWIB.getMinutes();
        const seconds = nowWIB.getSeconds();

        // Format tampilan
        countdownContainer.innerHTML = `
            <div><h2 style="margin-bottom: 2px">Happy Birthday Luvv❤️</h2></div>
            <div>${Math.floor(months / 12)} Years, ${months % 12} Months, ${days} Days</div>
            <div>${String(hours).padStart(2, '0')} H : ${String(minutes).padStart(2, '0')} Min : ${String(seconds).padStart(2, '0')} Sec</div>
        `;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Tetapkan tanggal mulai
const startDate = new Date('2003-12-08T00:00:00'); // Tanggal mulai 8 Desember 2003
startCountdown(startDate);


const heartsContainer = document.querySelector('.hearts-container');

        // Daftar gambar wajah berbentuk hati
        const heartImages = [
            'images/cantik1.jpg',
            'images/cantik.jpeg',
            'images/cantik2.jpg',
            'images/cantik3.jpg',
            'images/cantikk.jpeg',
            // Tambahkan lebih banyak gambar sesuai kebutuhan
        ];

        function createHeart() {
            const heart = document.createElement('img');
            heart.classList.add('heart-image');
            
            // Pilih gambar secara acak dari daftar
            const imgIndex = Math.floor(Math.random() * heartImages.length);
            heart.src = heartImages[imgIndex];
            
            // Posisi horizontal acak
            heart.style.left = Math.random() * 100 + 'vw';
            
            // Ukuran hati acak antara 30px hingga 60px
            const size = Math.random() * 30 + 30;
            heart.style.width = `${size}px`;
            heart.style.height = `${size}px`;
            
            // Rotasi acak
            const rotation = Math.random() * 360;
            heart.style.transform = `rotate(${rotation}deg)`;
            
            // Durasi animasi acak antara 5s hingga 8s
            const duration = Math.random() * 3 + 5;
            heart.style.animationDuration = `${duration}s`;
            
            // Delay animasi acak untuk distribusi yang lebih merata
            const delay = Math.random() * 3;
            heart.style.animationDelay = `${delay}s`;
            
            // Tambahkan hati ke container
            heartsContainer.appendChild(heart);
            
            // Hapus hati setelah animasi selesai untuk menghemat memori
            heart.addEventListener('animationend', () => {
                heart.remove();
            });
        }

        // Buat hati setiap 300 milidetik
        setInterval(createHeart, 700);