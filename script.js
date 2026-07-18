const animatedElements = document.querySelectorAll('.reveal, .scroll-pop');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.15 });
animatedElements.forEach(el => observer.observe(el));
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const overlay = document.getElementById('mobileOverlay');
function toggleMenu(open) {
  hamburger?.classList.toggle('is-open', open);
  navLinks?.classList.toggle('is-open', open);
  overlay?.classList.toggle('is-active', open);
  document.body.classList.toggle('menu-open', open);
}
hamburger?.addEventListener('click', () => toggleMenu(!navLinks.classList.contains('is-open')));
overlay?.addEventListener('click', () => toggleMenu(false));
navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
const tiltTarget = document.querySelector('.tilt-on-scroll');
window.addEventListener('scroll', () => {
  if (!tiltTarget) return;
  const rotation = Math.max(-4, Math.min(4, window.scrollY / 80));
  tiltTarget.style.transform = `rotate(${rotation}deg)`;
}, { passive: true });


document.querySelectorAll('.slides').forEach(slidesEl => {
  const slides = [...slidesEl.querySelectorAll('.slide')];
  const shell = slidesEl.closest('.slides-shell');
  const dots = shell ? [...shell.querySelectorAll('.slide-dot')] : [];
  const setSlide = (index) => {
    if (!slides.length) return;
    const safe = (index + slides.length) % slides.length;
    slidesEl.dataset.current = safe;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === safe));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === safe));
  };
  shell?.querySelectorAll('.slide-nav').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = Number(slidesEl.dataset.current || 0);
      setSlide(btn.dataset.action === 'next' ? current + 1 : current - 1);
    });
  });
  dots.forEach(dot => {
    dot.addEventListener('click', () => setSlide(Number(dot.dataset.slide || 0)));
  });
});

document.querySelectorAll('.solution-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const box = btn.nextElementSibling;
    const visible = box?.classList.toggle('is-visible');
    btn.textContent = visible ? 'Ocultar solución' : 'Ver solución';
  });
});

// Mensaje para temarios o contenidos todavía sin documento adjunto
const unavailableMessage = 'Información no disponible aún.';
document.querySelectorAll('.unavailable-trigger').forEach(element => {
  element.addEventListener('click', (event) => {
    event.preventDefault();
    alert(unavailableMessage);
  });
});

// Presentaciones convertidas desde PDF: navegación anterior/siguiente
const presentation = document.querySelector('[data-presentation]');
if (presentation) {
  const slides = [...presentation.querySelectorAll('.presentation-slide')];
  const prev = presentation.querySelector('.presentation-prev');
  const next = presentation.querySelector('.presentation-next');
  const counter = presentation.querySelector('.presentation-counter');
  const fullscreen = presentation.querySelector('.presentation-fullscreen');
  let current = 0;

  const showPresentationSlide = (index) => {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    if (counter) counter.textContent = `${current + 1} / ${slides.length}`;
  };

  prev?.addEventListener('click', () => showPresentationSlide(current - 1));
  next?.addEventListener('click', () => showPresentationSlide(current + 1));
  fullscreen?.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await presentation.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      alert('No se ha podido activar la pantalla completa en este navegador.');
    }
  });
  document.addEventListener('fullscreenchange', () => {
    if (!fullscreen) return;
    const active = document.fullscreenElement === presentation;
    fullscreen.textContent = active ? '×' : '⛶';
    fullscreen.setAttribute('aria-label', active ? 'Salir de pantalla completa' : 'Ver presentación en pantalla completa');
    fullscreen.setAttribute('title', active ? 'Salir de pantalla completa' : 'Pantalla completa');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showPresentationSlide(current - 1);
    if (event.key === 'ArrowRight') showPresentationSlide(current + 1);
  });

  showPresentationSlide(0);
}

// Cursos no disponibles: cinta de aviso en tarjetas y en el menú superior
const unavailableCourses = document.querySelectorAll('[data-unavailable-course]');
unavailableCourses.forEach(item => {
  item.addEventListener('click', (event) => {
    event.preventDefault();

    if (item.classList.contains('unavailable-course-card')) {
      const tape = item.querySelector('.police-tape');
      if (!tape) return;
      tape.classList.remove('fall-and-return');
      void tape.offsetWidth;
      tape.classList.add('fall-and-return');
      return;
    }

    if (item.classList.contains('nav-unavailable')) {
      item.querySelector('.nav-link-tape')?.remove();
      const tape = document.createElement('span');
      tape.className = 'nav-link-tape';
      tape.textContent = 'No disponible';
      tape.setAttribute('aria-hidden', 'true');
      item.appendChild(tape);
      tape.addEventListener('animationend', () => tape.remove(), { once: true });
      toggleMenu(false);
    }
  });
});

// Ejercicios autocorregibles
const quiz = document.querySelector('[data-quiz] .auto-quiz');
if (quiz) {
  const normalizeAnswer = (value) => value.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/[.\s,]/g, '').toLowerCase();
  const parseFactorizationAnswer = (value) => {
    const superscripts = { '⁰':'0', '¹':'1', '²':'2', '³':'3', '⁴':'4', '⁵':'5', '⁶':'6', '⁷':'7', '⁸':'8', '⁹':'9' };
    let text = value.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    text = text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, match => '^' + [...match].map(ch => superscripts[ch] || '').join(''));
    if (text.includes('=')) text = text.split('=').pop();
    text = text.replace(/\s+/g, '').replace(/,/g, '.');
    if (!text) return '';
    const tokens = text.split(/[·*x×]/).filter(Boolean);
    if (!tokens.length) return '';
    const expanded = [];
    for (const token of tokens) {
      const match = token.match(/^(\d+)(?:\^(\d+))?$/);
      if (!match) return '';
      const base = Number(match[1]);
      const exponent = match[2] ? Number(match[2]) : 1;
      if (!Number.isInteger(base) || !Number.isInteger(exponent) || base <= 1 || exponent < 1) return '';
      for (let i = 0; i < exponent; i += 1) expanded.push(base);
    }
    return expanded.sort((a, b) => a - b).join('x');
  };
  const inputs = [...quiz.querySelectorAll('input[data-answer]')];
  const result = quiz.querySelector('.quiz-result');

  quiz.addEventListener('submit', (event) => {
    event.preventDefault();
    let correct = 0;

    inputs.forEach(input => {
      const feedback = input.closest('.quiz-card')?.querySelector('.quiz-feedback');
      const answerType = input.dataset.answerType || '';
      const expectedAnswers = (input.dataset.answer || '').split('|').map(answer => answerType === 'factorization' ? parseFactorizationAnswer(answer) : normalizeAnswer(answer));
      const given = answerType === 'factorization' ? parseFactorizationAnswer(input.value || '') : normalizeAnswer(input.value || '');
      const isCorrect = given !== '' && expectedAnswers.includes(given);

      input.classList.toggle('is-correct', isCorrect);
      input.classList.toggle('is-wrong', !isCorrect);
      if (feedback) {
        feedback.classList.toggle('correct', isCorrect);
        feedback.classList.toggle('wrong', !isCorrect);
        const shownAnswer = input.dataset.displayAnswer || input.dataset.answer;
        feedback.textContent = isCorrect ? '✓ Correcto' : `✗ Revisa el cálculo. Solución: ${shownAnswer}`;
      }
      if (isCorrect) correct += 1;
    });

    if (result) {
      result.textContent = `Resultado: ${correct} de ${inputs.length} ejercicios correctos.`;
      result.classList.add('is-visible');
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  quiz.querySelector('[data-reset-quiz]')?.addEventListener('click', () => {
    inputs.forEach(input => {
      input.value = '';
      input.classList.remove('is-correct', 'is-wrong');
      const feedback = input.closest('.quiz-card')?.querySelector('.quiz-feedback');
      if (feedback) {
        feedback.textContent = '';
        feedback.classList.remove('correct', 'wrong');
      }
    });
    result?.classList.remove('is-visible');
    if (result) result.textContent = '';
  });
}

// Herramientas matemáticas: factorizar, mcm y mcd
const numberTool = document.querySelector('[data-number-tool]');
if (numberTool) {
  const form = numberTool.querySelector('.tool-calculator-form');
  const resultBox = numberTool.querySelector('.tool-calculator-result');
  const toolType = numberTool.dataset.numberTool;
  const countInput = form?.querySelector('input[name="cantidadNumeros"]');
  const inputsContainer = form?.querySelector('[data-number-inputs]');

  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };

  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

  const factorize = (number) => {
    const factors = [];
    let divisor = 2;
    let remaining = number;

    while (divisor * divisor <= remaining) {
      while (remaining % divisor === 0) {
        factors.push(divisor);
        remaining = remaining / divisor;
      }
      divisor += divisor === 2 ? 1 : 2;
    }

    if (remaining > 1) factors.push(remaining);
    return factors;
  };

  const formatFactors = (factors) => {
    const grouped = factors.reduce((acc, factor) => {
      acc[factor] = (acc[factor] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([factor, exponent]) => exponent === 1 ? factor : `${factor}<sup>${exponent}</sup>`)
      .join(' · ');
  };

  const showToolResult = (message, type, isHtml = false) => {
    if (!resultBox) return;
    if (isHtml) {
      resultBox.innerHTML = message;
    } else {
      resultBox.textContent = message;
    }
    resultBox.classList.remove('success', 'error');
    resultBox.classList.add('is-visible', type);
  };

  const renderNumberInputs = () => {
    if (!countInput || !inputsContainer || toolType === 'factorizar') return;

    let count = Number(countInput.value);
    if (!Number.isInteger(count) || count < 2) count = 2;
    if (count > 10) count = 10;
    countInput.value = count;

    inputsContainer.innerHTML = '';
    for (let i = 1; i <= count; i += 1) {
      const field = document.createElement('div');
      field.className = 'tool-calculator-field';
      field.innerHTML = `
        <label for="numero${i}">Número ${i}</label>
        <input id="numero${i}" min="1" name="numero${i}" placeholder="Escribe el número ${i}" step="1" type="number"/>
      `;
      inputsContainer.appendChild(field);
    }

    if (resultBox) {
      resultBox.classList.remove('is-visible', 'success', 'error');
      resultBox.textContent = '';
    }
  };

  countInput?.addEventListener('input', renderNumberInputs);
  renderNumberInputs();

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input1 = form.querySelector('input[name="numero1"]');
    const value1 = input1?.value.trim() || '';

    if (toolType === 'factorizar') {
      if (!value1) {
        showToolResult('Error: debes introducir un número.', 'error');
        return;
      }

      const num = Number(value1);
      if (!Number.isInteger(num) || num <= 0) {
        showToolResult('Error: introduce un número natural válido.', 'error');
        return;
      }

      if (num === 1) {
        showToolResult('El número 1 no tiene descomposición en factores primos.', 'success');
        return;
      }

      const factors = factorize(num);
      showToolResult(`${num} = ${formatFactors(factors)}`, 'success', true);
      return;
    }

    const numberInputs = Array.from(form.querySelectorAll('[data-number-inputs] input[type="number"]'));
    const values = numberInputs.map(input => input.value.trim());

    if (values.some(value => value === '')) {
      showToolResult('Error: debes introducir todos los números.', 'error');
      return;
    }

    const numbers = values.map(value => Number(value));

    if (numbers.some(num => !Number.isInteger(num) || num <= 0)) {
      showToolResult('Error: introduce números naturales válidos.', 'error');
      return;
    }

    const result = numbers.reduce((acc, num) => toolType === 'mcd' ? gcd(acc, num) : lcm(acc, num));
    const label = toolType === 'mcd' ? 'El máximo común divisor' : 'El mínimo común múltiplo';
    showToolResult(`${label} de ${numbers.join(', ')} es ${result}.`, 'success');
  });
}
