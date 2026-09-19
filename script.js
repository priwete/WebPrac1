/* ==========================================================================
   Портфолио-резюме — интерактивные сценарии
   1. Валидация формы обратной связи
   2. Плавная прокрутка по якорям + активный пункт меню
   3. Анимация появления секций и элементов (IntersectionObserver)
   4. Кнопка «Наверх»
   5. Динамический год в копирайте
   6. Лайтбокс со слайдером для проектов
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     1. Форма обратной связи: валидация и «отправка»
     ======================================================================== */

  const form = document.getElementById('contact-form');

  if (form) {
    const fields = {
      name: {
        input: document.getElementById('name'),
        error: document.getElementById('name-error'),
        validate: (value) => {
          if (!value.trim()) return 'Укажите имя.';
          if (value.trim().length < 2) return 'Имя должно содержать минимум 2 символа.';
          return '';
        }
      },
      email: {
        input: document.getElementById('email'),
        error: document.getElementById('email-error'),
        validate: (value) => {
          if (!value.trim()) return 'Укажите email.';
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!pattern.test(value.trim())) return 'Введите корректный email, например name@example.com.';
          return '';
        }
      },
      message: {
        input: document.getElementById('message'),
        error: document.getElementById('message-error'),
        validate: (value) => {
          if (!value.trim()) return 'Напишите сообщение.';
          if (value.trim().length < 10) return 'Сообщение должно содержать минимум 10 символов.';
          return '';
        }
      }
    };

    const statusEl = document.getElementById('form-status');

    function setFieldError(field, message) {
      field.error.textContent = message;
      field.input.classList.toggle('is-invalid', Boolean(message));
      field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validateField(field) {
      const message = field.validate(field.input.value);
      setFieldError(field, message);
      return message === '';
    }

    Object.values(fields).forEach((field) => {
      field.input.addEventListener('blur', () => validateField(field));
      field.input.addEventListener('input', () => {
        if (field.input.classList.contains('is-invalid')) {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let isValid = true;
      Object.values(fields).forEach((field) => {
        if (!validateField(field)) isValid = false;
      });

      statusEl.classList.remove('is-success', 'is-error');

      if (!isValid) {
        statusEl.textContent = 'Проверьте выделенные поля и попробуйте снова.';
        statusEl.classList.add('is-error');
        const firstInvalid = Object.values(fields).find((f) =>
          f.input.classList.contains('is-invalid')
        );
        if (firstInvalid) firstInvalid.input.focus();
        return;
      }

      statusEl.textContent = 'Сообщение готово к отправке. Спасибо за обращение!';
      statusEl.classList.add('is-success');

      form.reset();
      Object.values(fields).forEach((field) => setFieldError(field, ''));
    });
  }

  /* ========================================================================
     2. Плавная прокрутка по якорям + активный пункт меню
     ======================================================================== */

  const navLinks = Array.from(document.querySelectorAll('.nav__link'));

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });

  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href');
      return id ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = '#' + entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ========================================================================
     3. Анимация появления секций и элементов
     ----------------------------------------------------------------------
     - Секции (.reveal) — плавно вылетают снизу.
     - Карточки проектов (.card) — поочерёдно: слева, снизу, справа.
     - Теги (.tag) — лесенкой снизу с задержкой по индексу.
     - Строки контактов (.contacts__item) — слева.
     Все анимации — через добавление класса .is-visible.
     ======================================================================== */

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Универсальный помощник: наблюдает за элементами и добавляет
   * класс .is-visible, когда элемент попадает в зону видимости.
   */
  function observeReveal(elements, options) {
    if (!elements.length) return;

    // Если пользователь просит меньше движения — показываем сразу
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target); // анимируем один раз
          }
        });
      },
      Object.assign(
        { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
        options || {}
      )
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* --- 3.1. Секции: снизу вверх -------------------------------------- */

  observeReveal(Array.from(document.querySelectorAll('.reveal')));

  /* --- 3.2. Карточки проектов: слева, снизу, справа по кругу -------- */

  const cards = Array.from(document.querySelectorAll('.projects .card'));
  const cardDirections = ['from-left', 'from-bottom', 'from-right'];

  cards.forEach((card, index) => {
    card.classList.add('anim');
    card.classList.add(cardDirections[index % cardDirections.length]);

    // Небольшая задержка по индексу — карточки вылетают лесенкой
    const delay = (index % 3) * 0.12;
    card.style.transitionDelay = delay + 's';
  });

  observeReveal(cards, { threshold: 0.2 });

  /* --- 3.3. Теги: лесенкой снизу ------------------------------------ */

  const tagGroups = Array.from(document.querySelectorAll('.tag-list'));

  tagGroups.forEach((group) => {
    const tags = Array.from(group.querySelectorAll('.tag'));
    tags.forEach((tag, index) => {
      tag.classList.add('anim', 'from-bottom');
      // Ограничиваем задержку, чтобы длинный список не тянулся вечно
      const delay = Math.min(index, 10) * 0.06;
      tag.style.transitionDelay = delay + 's';
    });

    observeReveal(tags, { threshold: 0.05 });
  });

  /* --- 3.4. Карточки навыков, образования, опыта ------------------- */

  const sideBlocks = Array.from(
    document.querySelectorAll(
      '.skills__card, .education, .experience'
    )
  );

  sideBlocks.forEach((block, index) => {
    block.classList.add('anim');
    block.classList.add(index % 2 === 0 ? 'from-left' : 'from-right');
  });

  observeReveal(sideBlocks, { threshold: 0.2 });

  /* --- 3.5. Строки контактов и поля формы -------------------------- */

  const contactItems = Array.from(
    document.querySelectorAll('.contacts__item')
  );
  contactItems.forEach((item, index) => {
    item.classList.add('anim', 'from-left');
    item.style.transitionDelay = Math.min(index, 6) * 0.08 + 's';
  });
  observeReveal(contactItems, { threshold: 0.1 });

  const formEl = document.querySelector('.form');
  if (formEl) {
    formEl.classList.add('anim', 'from-right');
    observeReveal([formEl], { threshold: 0.15 });
  }

  /* ========================================================================
     4. Кнопка «Наверх»
     ======================================================================== */

  const toTop = document.getElementById('to-top');

  if (toTop) {
    const toggleToTop = () => {
      const shouldShow = window.scrollY > 400;
      toTop.classList.toggle('is-visible', shouldShow);
    };

    window.addEventListener('scroll', toggleToTop, { passive: true });
    toggleToTop();

    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ========================================================================
     5. Динамический год в копирайте
     ======================================================================== */

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ========================================================================
     6. Лайтбокс со слайдером для проектов
     ======================================================================== */

  const triggers = Array.from(document.querySelectorAll('[data-lightbox]'));
  const lightbox = document.getElementById('lightbox');

  if (triggers.length && lightbox) {
    const imageEl = document.getElementById('lightbox-image');
    const titleEl = document.getElementById('lightbox-title');
    const counterEl = document.getElementById('lightbox-counter');
    const prevBtn = lightbox.querySelector('[data-lightbox-prev]');
    const nextBtn = lightbox.querySelector('[data-lightbox-next]');
    const closeBtns = lightbox.querySelectorAll('[data-lightbox-close]');

    let currentIndex = 0;
    let lastFocused = null;

    function getBackgroundImage(el) {
      const style = window.getComputedStyle(el);
      return style.backgroundImage || '';
    }

    function renderSlide() {
      const trigger = triggers[currentIndex];
      if (!trigger) return;

      const bg = getBackgroundImage(trigger);
      imageEl.style.backgroundImage = bg;
      titleEl.textContent = trigger.dataset.title || '';
      counterEl.textContent = (currentIndex + 1) + ' / ' + triggers.length;
      imageEl.setAttribute(
        'aria-label',
        trigger.dataset.title || 'Изображение проекта'
      );
    }

    function openLightbox(index) {
      currentIndex = index;
      lastFocused = document.activeElement;

      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';

      renderSlide();

      const closeBtn = lightbox.querySelector('.lightbox__close');
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      imageEl.style.backgroundImage = '';

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % triggers.length;
      renderSlide();
    }
    function showPrev() {
      currentIndex = (currentIndex - 1 + triggers.length) % triggers.length;
      renderSlide();
    }

    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => openLightbox(index));
    });

    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);

    closeBtns.forEach((btn) => {
      btn.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', (event) => {
      if (lightbox.hidden) return;

      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowRight') {
        showNext();
      } else if (event.key === 'ArrowLeft') {
        showPrev();
      }
    });
  }
})();
