// Inicialização de Animações — Scroll

const initScrollAnimations = () => {
  const elements = document.querySelectorAll('[data-animate]');

  if (!elements.length) return;

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach((el) => observer.observe(el));
};

// Inicialização — Aviso de PopUp
const iniciarPopUp = () => {

  const overlay = document.getElementById('popUpOverlay')
  const botaoOverlay = document.getElementById('fecharPopUp')
  
    if (!overlay || !botaoOverlay) return;
      botaoOverlay.addEventListener('click', () => {
        overlay.classList.add('escondido');
      });
};

// Inicialização — DOMContentLoaded

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  iniciarPopUp();
});
