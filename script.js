/*
	script.js
	- Generate floating hearts
	- Handle envelope open/close (click, keyboard)
	- Provide simple hooks to replace photo/text in HTML
*/

document.addEventListener('DOMContentLoaded', () => {
	const heartsContainer = document.getElementById('hearts');
	const envelope = document.getElementById('envelope');
	const letter = document.getElementById('letter');
	const cardRoot = document.querySelector('.envelope-wrap');

	// --- Hearts generation ---
	const HEART_COUNT = 28;
	for (let i = 0; i < HEART_COUNT; i++) {
		const el = document.createElement('span');
		el.className = 'heart';
		// random horizontal start position
		const left = Math.random() * 100; // vw
		// size between 15-30px
		const size = 15 + Math.random() * 15; // px
		// moderate speed (12-24s)
		const duration = 12 + Math.random() * 12; // s
		const delay = -(Math.random() * 12);
		// horizontal travel (vw) - can be negative to go left
		const tx = (Math.random() * 80 - 40).toFixed(2) + 'vw';
		// vertical travel use vh
		const ty = (-110 - Math.random() * 40) + 'vh';
		const rot = (Math.random() * 60 - 30).toFixed(2) + 'deg';
		const opacity = (0.45 + Math.random() * 0.45).toFixed(2);

		el.style.left = left + 'vw';
		el.style.fontSize = size + 'px';
		el.style.setProperty('--tx', tx);
		el.style.setProperty('--ty', ty);
		el.style.setProperty('--rot', rot);
		el.style.setProperty('--o', opacity);
		el.style.animation = `drift ${duration}s linear ${delay}s infinite`;
		heartsContainer.appendChild(el);
	}

	// --- Envelope open/close ---
	// state machine: 'closed' | 'opening' | 'open' | 'closing'
	let state = 'closed';

	function openEnvelope() {
		if (state !== 'closed') return;
		state = 'opening';
		envelope.classList.remove('closing');
		envelope.classList.add('opening');
		// finger-block briefly
		envelope.style.pointerEvents = 'none';
		// after flap animation, letter will be revealed in animationend handler
	}

	function closeEnvelope() {
		if (state !== 'open') return;
		state = 'closing';
		// start letter slide-out by removing envelope-open class
		document.body.classList.remove('envelope-open');
		letter.setAttribute('aria-hidden', 'true');
		// then animate envelope back
		envelope.classList.remove('opening');
		// small delay so letter slide-out begins slightly before envelope moves
		setTimeout(() => {
			envelope.classList.add('closing');
		}, 80);
	}

	// open when clicking or pressing Enter/Space on the envelope image
	envelope.addEventListener('click', (e) => {
		if (state === 'closed') openEnvelope();
		else if (state === 'open') closeEnvelope();
	});
	envelope.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (state === 'closed') openEnvelope();
			else if (state === 'open') closeEnvelope();
		}
	});

	// click outside letter closes when open
	document.addEventListener('click', (e) => {
		if (!cardRoot.contains(e.target) && state === 'open') {
			closeEnvelope();
		}
	});

	// ESC closes
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && state === 'open') closeEnvelope();
	});

	// handle animation end events to transition states
	envelope.addEventListener('animationend', (ev) => {
		// flap open finished
		if (ev.animationName === 'flapOpen') {
			// show letter (sibling selector controlled by CSS)
			state = 'open';
			// allow brief re-interaction
			setTimeout(() => envelope.style.pointerEvents = '', 220);
		}
		if (ev.animationName === 'flapClose') {
			// closed now
			envelope.classList.remove('closing');
			state = 'closed';
			envelope.style.pointerEvents = '';
		}
	});

	// NOTE: to change the photo/text, edit these elements in the HTML:
	// - #letterPhoto (src)
	// - #letterTitle, #letterBody, #letterSignature
});
